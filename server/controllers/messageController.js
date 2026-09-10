const mongoose = require("mongoose");
const Message = require("../models/Message");
const ChatSettings = require("../models/ChatSettings");
const User = require("../models/User");
const Friend = require("../models/Friend");        


const POP_USER = "name profileImage createdAt";    
const POP_POST = "caption mediaUrl mediaType userId";


const getSettings = (user, peer) =>
  ChatSettings.findOneAndUpdate(
    { user, peer },
    { $setOnInsert: { user, peer } },
    { upsert: true, new: true }
  );


const populateMsg = (query) =>
  query
    .populate("sender", POP_USER)
    .populate("receiver", POP_USER)
    .populate({
      path: "post",
      select: POP_POST,
      populate: { path: "userId", select: "name profileImage" },
    })
    .populate({
      path: "replyTo",
      select: "text post sender deletedForEveryone",
      populate: { path: "sender", select: "name" },
    });

/* ══════════ 1. CONVERSATIONS (SIDEBAR LIST) ══════════ */
exports.getConversations = async (req, res) => {
  try {
    const me = req.user.id;

    const settings = await ChatSettings.find({ user: me });
    const sMap = {};
    settings.forEach((s) => (sMap[String(s.peer)] = s));

    const msgs = await populateMsg(
      Message.find({
        $or: [{ sender: me }, { receiver: me }],
        deletedFor: { $ne: me },
      }).sort({ createdAt: -1 })
    );

    const convo = {};
    for (const m of msgs) {
      if (!m.sender || !m.receiver) continue;
      const isMine = String(m.sender._id) === String(me);
      const peer = isMine ? m.receiver : m.sender;
      const pid = String(peer._id);
      const s = sMap[pid];

      if (s?.clearedAt && m.createdAt <= s.clearedAt) continue;
      if (s?.deletedAt && m.createdAt <= s.deletedAt) continue;

      if (!convo[pid]) {
        convo[pid] = {
          _id: pid,
          friend: peer,
          lastMessage: m,
          unreadCount: 0,
          muted: !!s?.muted,
          blocked: !!s?.blocked,
        };
      }
      if (!isMine && !m.read) convo[pid].unreadCount++;
    }

    res.json({ success: true, conversations: Object.values(convo) });
  } catch (e) {
    console.error("❌ GET CONVERSATIONS ERROR:", e.message);
    res.status(500).json({ success: false, message: e.message });
  }
};

/* ══════════ 2. GET MESSAGES (THREAD CONVERSATION) ══════════ */
exports.getMessages = async (req, res) => {
  try {
    const me = req.user.id;
    const peer = req.params.userId || req.params.friendId;

    if (!mongoose.Types.ObjectId.isValid(peer)) {
      return res.status(400).json({ success: false, message: "Invalid User ID" });
    }

    const s = await ChatSettings.findOne({ user: me, peer });

    const query = {
      $or: [
        { sender: me, receiver: peer },
        { sender: peer, receiver: me },
      ],
      deletedFor: { $ne: me },
    };

    const after = s?.clearedAt || s?.deletedAt;
    if (after) query.createdAt = { $gt: after };

    const messages = await populateMsg(Message.find(query).sort({ createdAt: 1 }));

    // ❌ delivered/read yahan SET NAHI karenge — socket events handle karenge
    res.json({ success: true, messages });
  } catch (e) {
    console.error("❌ GET MESSAGES ERROR:", e.message);
    res.status(500).json({ success: false, message: e.message });
  }
};

/* ══════════ 3. SEND MESSAGE ══════════ */
exports.sendMessage = async (req, res) => {
  try {
    const me = req.user.id;
    const { receiverId, text, post, replyTo } = req.body;

    if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ success: false, message: "Valid receiverId required" });
    }
    if (!text?.trim() && !post) {
      return res.status(400).json({ success: false, message: "Message content required" });
    }

    // Check block status
    const blockedByThem = await ChatSettings.findOne({ user: receiverId, peer: me, blocked: true });
    if (blockedByThem) return res.status(403).json({ success: false, message: "You are blocked by this user" });

    const blockedByMe = await ChatSettings.findOne({ user: me, peer: receiverId, blocked: true });
    if (blockedByMe) return res.status(403).json({ success: false, message: "Unblock this user to send messages" });


    const areFriends = await Friend.findOne({
      status: "accepted",
      $or: [
        { userId: me, friendId: receiverId },
        { userId: receiverId, friendId: me },
      ],
    }).lean();

    if (!areFriends) {
      return res.status(403).json({
        success: false,
        message: "You can only message your friends",
      });
    }

    let msg = await Message.create({
      sender: me,
      receiver: receiverId,
      text: text?.trim() || "",
      post: post || null,
      replyTo: replyTo || null,
    });

    msg = await populateMsg(Message.findById(msg._id));

    
    await ChatSettings.updateOne({ user: receiverId, peer: me }, { deletedAt: null });

    res.status(201).json({ success: true, message: msg });
  } catch (e) {
    console.error("❌ SEND MESSAGE ERROR:", e.message);
    res.status(500).json({ success: false, message: e.message });
  }
};

/* ══════════ 4. EDIT MESSAGE ══════════ */
exports.editMessage = async (req, res) => {
  try {
    const me = req.user.id;
    const { text } = req.body;
    const msg = await Message.findById(req.params.id);

    if (!msg) return res.status(404).json({ success: false, message: "Message not found" });
    if (String(msg.sender) !== String(me)) return res.status(403).json({ success: false, message: "Unauthorized action" });
    if (msg.deletedForEveryone) return res.status(400).json({ success: false, message: "Cannot edit deleted message" });
    if (!text?.trim()) return res.status(400).json({ success: false, message: "Text cannot be empty" });

    msg.text = text.trim();
    msg.edited = true;
    msg.editedAt = new Date();
    await msg.save();

    const populated = await populateMsg(Message.findById(msg._id));
    res.json({ success: true, message: populated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/* ══════════ 5. DELETE FOR ME ══════════ */
exports.deleteForMe = async (req, res) => {
  try {
    const me = req.user.id;
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: "Message not found" });

    if (String(msg.sender) !== String(me) && String(msg.receiver) !== String(me)) {
      return res.status(403).json({ success: false, message: "Unauthorized action" });
    }

    if (!msg.deletedFor.some((u) => String(u) === String(me))) {
      msg.deletedFor.push(me);
      await msg.save();
    }

    if (msg.deletedFor.length >= 2) await Message.findByIdAndDelete(msg._id);

    res.json({ success: true, messageId: req.params.id });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/* ══════════ 6. DELETE FOR EVERYONE ══════════ */
exports.deleteForEveryone = async (req, res) => {
  try {
    const me = req.user.id;
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: "Message not found" });
    if (String(msg.sender) !== String(me)) {
      return res.status(403).json({ success: false, message: "Only the sender can delete for everyone" });
    }

    msg.deletedForEveryone = true;
    msg.text = "";
    msg.post = null;
    await msg.save();

    res.json({ success: true, messageId: msg._id, receiver: msg.receiver });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/* ══════════ 7. STAR MESSAGES ══════════ */
exports.toggleStar = async (req, res) => {
  try {
    const me = req.user.id;
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: "Message not found" });

    // ✅ NEW — Edit 3: sirf sender/receiver hi star kar sakte hain
    if (String(msg.sender) !== String(me) && String(msg.receiver) !== String(me)) {
      return res.status(403).json({ success: false, message: "Not your conversation" });
    }

    const index = msg.starredBy.findIndex((u) => String(u) === String(me));
    if (index === -1) msg.starredBy.push(me);
    else msg.starredBy.splice(index, 1);

    await msg.save();
    res.json({ success: true, messageId: msg._id, starred: index === -1 });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getStarred = async (req, res) => {
  try {
    const me = req.user.id;
    const messages = await populateMsg(
      Message.find({ starredBy: me, deletedFor: { $ne: me }, deletedForEveryone: false }).sort({ createdAt: -1 })
    );
    res.json({ success: true, messages });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/* ══════════ 8. MUTE / UNMUTE CHAT ══════════ */
exports.toggleMute = async (req, res) => {
  try {
    const s = await getSettings(req.user.id, req.params.userId);
    s.muted = !s.muted;
    await s.save();
    res.json({ success: true, muted: s.muted });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/* ══════════ 9. BLOCK / UNBLOCK CHAT ══════════ */
exports.toggleBlock = async (req, res) => {
  try {
    const s = await getSettings(req.user.id, req.params.userId);
    s.blocked = !s.blocked;
    await s.save();
    res.json({ success: true, blocked: s.blocked });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/* ══════════ 10. CLEAR CHAT HISTORY ══════════ */
exports.clearChat = async (req, res) => {
  try {
    const s = await getSettings(req.user.id, req.params.userId);
    s.clearedAt = new Date();
    await s.save();
    res.json({ success: true, message: "Chat cleared successfully" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/* ══════════ 11. DELETE CONVERSATION ══════════ */
exports.deleteChat = async (req, res) => {
  try {
    const s = await getSettings(req.user.id, req.params.userId);
    s.deletedAt = new Date();
    s.clearedAt = new Date();
    await s.save();
    res.json({ success: true, message: "Conversation deleted successfully" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/* ══════════ 12. CHAT INFO & METRICS ══════════ */
exports.getChatInfo = async (req, res) => {
  try {
    const me = req.user.id;
    const peerId = req.params.userId;

    const [peer, s] = await Promise.all([
      User.findById(peerId).select(POP_USER),
      ChatSettings.findOne({ user: me, peer: peerId }),
    ]);

    if (!peer) return res.status(404).json({ success: false, message: "User not found" });

    const base = {
      $or: [
        { sender: me, receiver: peerId },
        { sender: peerId, receiver: me },
      ],
      deletedFor: { $ne: me },
      deletedForEveryone: false,
    };
    if (s?.clearedAt) base.createdAt = { $gt: s.clearedAt };

    const [total, first, media, starred] = await Promise.all([
      Message.countDocuments(base),
      Message.findOne(base).sort({ createdAt: 1 }).select("createdAt"),
      Message.find({ ...base, post: { $ne: null } })
        .sort({ createdAt: -1 })
        .limit(9)
        .populate("post", POP_POST),
      Message.countDocuments({ ...base, starredBy: me }),
    ]);

    res.json({
      success: true,
      info: {
        user: peer,
        totalMessages: total,
        startedAt: first?.createdAt || null,
        starredCount: starred,
        muted: !!s?.muted,
        blocked: !!s?.blocked,
        sharedMedia: media
          .map((m) => ({
            _id: m.post?._id,
            mediaUrl: m.post?.mediaUrl,
            mediaType: m.post?.mediaType,
          }))
          .filter((x) => x.mediaUrl),
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};