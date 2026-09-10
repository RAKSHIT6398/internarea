const SharedPost = require("../models/SharedPost");
const Post = require("../models/Post");
const Message = require("../models/Message"); 

exports.sharePost = async (req, res) => {
  try {
    const { postId, receiverId } = req.body;

    await SharedPost.create({
      postId,
      senderId: req.user.id,
      receiverId,
    });

    await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      post: postId,
    });

    await Post.findByIdAndUpdate(postId, {
      $inc: { shares: 1 },
    });

    res.status(200).json({
      success: true,
      message: "Post Shared Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.getSharedPosts = async (req, res) => {
  try {
    const sharedPosts = await SharedPost.find({
      receiverId: req.user.id,
    })
      .populate({
        path: "postId",
        select: "caption mediaUrl mediaType likes shares createdAt userId",
        populate: {
          path: "userId",
          model: "User",
          select: "name email profileImage",
        },
      })
      .populate({
        path: "senderId",
        model: "User",
        select: "name email profileImage",
      })
      .sort({ createdAt: -1 });

    const groupedMap = {};

    sharedPosts.forEach((share) => {
      if (!share.postId) return;

      const sender = share.senderId;
      const senderId = sender._id.toString();

      if (!groupedMap[senderId]) {
        groupedMap[senderId] = {
          friendId: senderId,
          friendName: sender.name,
          friendImage: sender.profileImage,
          shares: [],
        };
      }

      const postData = share.postId.toObject();
      groupedMap[senderId].shares.push({
        ...postData,
        sharedBy: sender,
        sharedAt: share.createdAt,
        shareId: share._id,
      });
    });

    const friendsWithPosts = Object.values(groupedMap);

    return res.status(200).json({
      success: true,
      friends: friendsWithPosts,
    });
  } catch (error) {
    console.error("GET SHARED POSTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};