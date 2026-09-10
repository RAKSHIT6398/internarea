const mongoose = require("mongoose");
const User = require("../models/User");
const Friend = require("../models/Friend");

let Post = null;
try {
  Post = require("../models/Post");
} catch {
  Post = null;
}

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const getViewerId = (req) =>
  String(req.user?.id || req.user?._id || req.userId || "");

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  profileImage: user.profileImage || "",
  role: user.role || "user",
  createdAt: user.createdAt,
});


const formatPost = (post) => ({
  _id: post._id,
  caption: post.caption || "",
  mediaUrl: post.mediaUrl || "",
  mediaType: post.mediaType || "image",
  likesCount: Array.isArray(post.likes) ? post.likes.length : 0,
  createdAt: post.createdAt,
});

const fetchPosts = async (userId) => {
  if (!Post) return [];

  const posts = await Post.find({ userId })
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();

  return posts.map(formatPost);
};

const findRelationDoc = (a, b) =>
  Friend.findOne({
    $or: [
      { userId: a, friendId: b },
      { userId: b, friendId: a },
    ],
  });

const mapRelation = (doc, viewerId) => {
  if (!doc) {
    return { relation: "none", requestId: null };
  }

  if (doc.status === "accepted") {
    return { relation: "friends", requestId: doc._id };
  }

  if (doc.status === "pending") {
    const iSent = String(doc.userId) === String(viewerId);
    return {
      relation: iSent ? "outgoing" : "incoming",
      requestId: doc._id,
    };
  }

  return { relation: "none", requestId: null };
};

const fetchFriendsOf = async (userId) => {
  const rels = await Friend.find({
    status: "accepted",
    $or: [{ userId }, { friendId: userId }],
  })
    .populate("userId", "name profileImage")
    .populate("friendId", "name profileImage")
    .lean();

  return rels
    .map((rel) => {
      const sender = rel.userId?._id ? rel.userId : null;
      const receiver = rel.friendId?._id ? rel.friendId : null;
      if (!sender || !receiver) return null;

      return String(sender._id) === String(userId) ? receiver : sender;
    })
    .filter(Boolean)
    .map((u) => ({
      _id: u._id,
      name: u.name,
      profileImage: u.profileImage || "",
    }));
};

const syncUserArraysFromFriend = async (viewerId, targetId, relation) => {
  if (relation === "friends") {
    await Promise.all([
      User.findByIdAndUpdate(viewerId, {
        $addToSet: { friends: targetId },
        $pull: { friendRequests: targetId },
      }),
      User.findByIdAndUpdate(targetId, {
        $addToSet: { friends: viewerId },
        $pull: { friendRequests: viewerId },
      }),
    ]);
  }
};

/* =========================================================
   GET /api/user/:id
========================================================= */
exports.getPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const viewerId = getViewerId(req);

    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const target = await User.findById(id)
      .select("name profileImage role createdAt")
      .lean();

    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }

    if (viewerId && String(viewerId) === String(id)) {
      return res.json({
        success: true,
        user: publicUser(target),
        relation: "self",
        requestId: null,
        friends: [],
        friendsCount: 0,
        posts: [],
        postsCount: 0,
      });
    }

    const [relDoc, friends, posts] = await Promise.all([
      viewerId ? findRelationDoc(viewerId, id) : null,
      fetchFriendsOf(id),
      fetchPosts(id),
    ]);

    const { relation, requestId } = mapRelation(relDoc, viewerId);

    if (viewerId && relation === "friends") {
      syncUserArraysFromFriend(viewerId, id, relation).catch(() => {});
    }

    return res.json({
      success: true,
      user: publicUser(target),
      relation,
      requestId,
      friends,
      friendsCount: friends.length,
      posts,
      postsCount: posts.length,
    });
  } catch (error) {
    console.error("Public profile error:", error);
    return res.status(500).json({ message: "Could not load profile" });
  }
};


exports.sendFriendRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const viewerId = getViewerId(req);

    if (!viewerId) return res.status(401).json({ message: "Login required" });
    if (!isValidId(id) || String(id) === String(viewerId)) {
      return res.status(400).json({ message: "Invalid user" });
    }

    const existing = await findRelationDoc(viewerId, id);

    if (existing?.status === "accepted") {
      await syncUserArraysFromFriend(viewerId, id, "friends");
      return res.json({
        success: true,
        relation: "friends",
        requestId: existing._id,
        message: "Already friends",
      });
    }

    if (existing?.status === "pending") {
      const iSent = String(existing.userId) === String(viewerId);

      if (!iSent) {
        existing.status = "accepted";
        await existing.save();

        await Promise.all([
          User.findByIdAndUpdate(viewerId, {
            $addToSet: { friends: id },
            $pull: { friendRequests: id },
          }),
          User.findByIdAndUpdate(id, {
            $addToSet: { friends: viewerId },
            $pull: { friendRequests: viewerId },
          }),
        ]);

        return res.json({
          success: true,
          relation: "friends",
          requestId: existing._id,
          message: "Friend request accepted",
        });
      }

      return res.json({
        success: true,
        relation: "outgoing",
        requestId: existing._id,
        message: "Request already sent",
      });
    }

    const request = await Friend.create({
      userId: viewerId,
      friendId: id,
      status: "pending",
    });

    await User.findByIdAndUpdate(id, {
      $addToSet: { friendRequests: viewerId },
    });

    return res.json({
      success: true,
      relation: "outgoing",
      requestId: request._id,
      message: "Friend request sent",
    });
  } catch (error) {
    console.error("Send request error:", error);
    return res.status(500).json({ message: "Could not send request" });
  }
};
exports.acceptFriendRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const viewerId = getViewerId(req);
    const requestId = req.body?.requestId;

    const request = requestId
      ? await Friend.findById(requestId)
      : await Friend.findOne({ userId: id, friendId: viewerId, status: "pending" });

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    /* ✅ IDOR FIX — sirf RECIPIENT accept kar sakta hai
       (pehle koi bhi kisi ki bhi request accept kar sakta tha) */
    if (String(request.friendId) !== String(viewerId)) {
      return res.status(403).json({ message: "You cannot accept this request" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already handled" });
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

    return res.json({
      success: true,
      relation: "friends",
      requestId: request._id,
      message: "You are now friends",
    });
  } catch (error) {
    console.error("Accept error:", error);
    return res.status(500).json({ message: "Could not accept request" });
  }
};

exports.cancelOrUnfriend = async (req, res) => {
  try {
    const { id } = req.params;
    const viewerId = getViewerId(req);
    const action = req.body?.action || "cancel";
    const requestId = req.body?.requestId;

    if (action === "unfriend") {
      await Friend.deleteMany({
        $or: [
          { userId: viewerId, friendId: id },
          { userId: id, friendId: viewerId },
        ],
      });

      await Promise.all([
        User.findByIdAndUpdate(viewerId, {
          $pull: { friends: id, friendRequests: id },
        }),
        User.findByIdAndUpdate(id, {
          $pull: { friends: viewerId, friendRequests: viewerId },
        }),
      ]);

      return res.json({ success: true, relation: "none", message: "Friend removed" });
    }

    const request = requestId
      ? await Friend.findById(requestId)
      : await findRelationDoc(viewerId, id);

   
    if (
      request &&
      String(request.userId) !== String(viewerId) &&
      String(request.friendId) !== String(viewerId)
    ) {
      return res.status(403).json({ message: "Not your request" });
    }

    if (request && request.status === "pending") {
      await User.findByIdAndUpdate(request.friendId, {
        $pull: { friendRequests: request.userId },
      });
      await Friend.findByIdAndDelete(request._id);
    }

    return res.json({
      success: true,
      relation: "none",
      message: "Friend request cancelled",
    });
  } catch (error) {
    console.error("Cancel/unfriend error:", error);
    return res.status(500).json({ message: "Could not update friendship" });
  }
};