const Friend = require("../models/Friend");
const User = require("../models/User");
const mongoose = require("mongoose");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);


exports.sendRequest = async (req, res) => {
  try {
    const { friendId } = req.body;

   
    if (!isValidId(friendId) || String(friendId) === String(req.user.id)) {
      return res.status(400).json({ success: false, message: "Invalid user" });
    }

 
    const target = await User.findById(friendId).select("_id");
    if (!target) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    
    const existing = await Friend.findOne({
      $or: [
        { userId: req.user.id, friendId },
        { userId: friendId, friendId: req.user.id },
      ],
    });

    if (existing) {
      const msg = existing.status === "accepted"
        ? "Already friends"
        : "Request already pending";
      return res.status(400).json({ success: false, message: msg });
    }

    const request = await Friend.create({
      userId: req.user.id,
      friendId,
      status: "pending",
    });

    await User.findByIdAndUpdate(friendId, {
      $addToSet: { friendRequests: req.user.id },
    });

    res.status(201).json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ══════════ ACCEPT REQUEST (IDOR FIXED) ══════════ */
exports.acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.body;

    const request = await Friend.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

   
    if (String(request.friendId) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "You cannot accept this request" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ success: false, message: "Request already handled" });
    }

    request.status = "accepted";
    await request.save();

    await Promise.all([
      User.findByIdAndUpdate(request.userId, {
        $addToSet: { friends: request.friendId },
      }),
      User.findByIdAndUpdate(request.friendId, {
        $addToSet: { friends: request.userId },
        $pull: { friendRequests: request.userId },
      }),
    ]);

    res.status(200).json({ success: true, message: "Friend request accepted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ══════════ FRIEND COUNT ══════════ */
exports.friendCount = async (req, res) => {
  try {
    const count = await Friend.countDocuments({
      status: "accepted",
      $or: [{ userId: req.user.id }, { friendId: req.user.id }],
    });
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ══════════ ALL USERS — 🔒 EMAIL LEAK FIXED ══════════ */
exports.getAllUsers = async (req, res) => {
  try {
   
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select("name profileImage")
      .limit(100)           
      .lean();

   
    const relations = await Friend.find({
      $or: [{ userId: req.user.id }, { friendId: req.user.id }],
    }).lean();

    const relMap = {};
    relations.forEach((r) => {
      const otherId =
        String(r.userId) === String(req.user.id) ? String(r.friendId) : String(r.userId);
      relMap[otherId] = r;
    });

    const usersWithStatus = users.map((user) => {
      const relation = relMap[String(user._id)];
      let relationship = "none";
      let requestId = null;

      if (relation) {
        requestId = relation._id;
        if (relation.status === "accepted") {
          relationship = "accepted";
        } else if (relation.status === "pending") {
          relationship =
            String(relation.userId) === String(req.user.id) ? "pending" : "received";
        }
      }

      return { ...user, relationship, requestId };
    });

    res.status(200).json({ success: true, users: usersWithStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ══════════ PENDING REQUESTS ══════════ */
exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await Friend.find({
      friendId: req.user.id,
      status: "pending",
    }).populate("userId", "name profileImage");   // ✅ email hata diya

    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ══════════ MY FRIENDS (email allowed — friends only) ══════════ */
exports.getFriends = async (req, res) => {
  try {
    const currentUserId = String(req.user.id);

    const friendRelations = await Friend.find({
      status: "accepted",
      $or: [{ userId: req.user.id }, { friendId: req.user.id }],
    })
      .populate("userId", "name email profileImage")
      .populate("friendId", "name email profileImage");

    const friends = friendRelations
      .map((rel) => {
        if (!rel.userId || !rel.friendId) return null;
        const senderId = String(rel.userId._id);
        return {
          _id: rel._id,
          friendId: senderId === currentUserId ? rel.friendId : rel.userId,
          status: rel.status,
        };
      })
      .filter(Boolean);

    res.status(200).json({ success: true, friends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ══════════ REJECT REQUEST (IDOR FIXED) ══════════ */
exports.rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.body;

    const request = await Friend.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

  
    const isSender = String(request.userId) === String(req.user.id);
    const isReceiver = String(request.friendId) === String(req.user.id);
    if (!isSender && !isReceiver) {
      return res.status(403).json({ success: false, message: "Not your request" });
    }

    await User.findByIdAndUpdate(request.friendId, {
      $pull: { friendRequests: request.userId },
    });
    await Friend.findByIdAndDelete(requestId);

    res.status(200).json({ success: true, message: "Request rejected" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ══════════ REMOVE FRIEND ══════════ */
exports.removeFriend = async (req, res) => {
  try {
    const { friendId } = req.body;

    await Friend.deleteMany({
      $or: [
        { userId: req.user.id, friendId },
        { userId: friendId, friendId: req.user.id },
      ],
    });

    await Promise.all([
      User.findByIdAndUpdate(req.user.id, { $pull: { friends: friendId } }),
      User.findByIdAndUpdate(friendId, { $pull: { friends: req.user.id } }),
    ]);

    res.status(200).json({ success: true, message: "Friend removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};