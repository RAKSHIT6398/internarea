const Post = require("../models/Post");
const User = require("../models/User");
const Friend = require("../models/Friend");


exports.getPostQuota = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

  
    const friendCount = await Friend.countDocuments({
      $or: [
        {
          userId,
          status: "accepted",
        },
        {
          friendId: userId,
          status: "accepted",
        },
      ],
    });

  
    const unlimited = friendCount >= 10;

    const limit = unlimited ? Infinity : friendCount;

   
    const IST_OFFSET = 330 * 60 * 1000;

    const now = new Date();

    const istNow = new Date(now.getTime() + IST_OFFSET);

    const istMidnight = new Date(
      Date.UTC(
        istNow.getUTCFullYear(),
        istNow.getUTCMonth(),
        istNow.getUTCDate()
      )
    );

    const startOfDay = new Date(
      istMidnight.getTime() - IST_OFFSET
    );

    const endOfDay = new Date(
      startOfDay.getTime() + 24 * 60 * 60 * 1000
    );

    const postsToday = await Post.countDocuments({
      userId,
      createdAt: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    });

  
    const remaining = unlimited
      ? "Unlimited"
      : Math.max(0, limit - postsToday);

    return res.status(200).json({
      success: true,

      friendCount,

      limit: unlimited ? "Unlimited" : limit,

      unlimited,

      postsToday,

      remaining,

      resetsAt: endOfDay,
    });
  } catch (error) {
    console.error("GET POST QUOTA ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createPost = async (req, res) => {
  try {
    const {
      caption,
      mediaUrl,
      mediaType,
    } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!mediaUrl) {
      return res.status(400).json({
        success: false,
        message: "Media URL is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const post = await Post.create({
      userId,
      caption: caption || "",
      mediaUrl,
      mediaType: mediaType || "image",
    });

    
    const populatedPost = await Post.findById(
      post._id
    ).populate(
      "userId",
      "name profileImage"
    );

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: populatedPost,

      meta: req.postMeta
        ? {
            friendCount:
              req.postMeta.friendCount,

            limit:
              req.postMeta.limit === Infinity
                ? "Unlimited"
                : req.postMeta.limit,

            postsToday:
              req.postMeta.postsToday + 1,

            remaining:
              req.postMeta.limit === Infinity
                ? "Unlimited"
                : Math.max(
                    0,
                    req.postMeta.limit -
                      req.postMeta.postsToday -
                      1
                  ),
          }
        : null,
    });
  } catch (error) {
    console.error(
      "CREATE POST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const alreadyLiked = post.likes.some(
      (id) =>
        id.toString() === userId.toString()
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) =>
          id.toString() !== userId.toString()
      );

      await post.save();

      return res.status(200).json({
        success: true,
        message: "Post unliked",
        liked: false,
        likesCount: post.likes.length,
      });
    }

    post.likes.push(userId);

    await post.save();

    return res.status(200).json({
      success: true,
      message: "Post liked",
      liked: true,
      likesCount: post.likes.length,
    });
  } catch (error) {
    console.error(
      "LIKE POST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.getFeed = async (req, res) => {
  try {
   
    const posts = await Post.find({
      userId: {
        $ne: null,
      },
    })
      .populate({
        path: "userId",
        model: "User",
        select: "name profileImage",
      })
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error(
      "GET FEED ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.sharePost = async (req, res) => {
  try {
    const { postId } = req.params;

    
    const post =
      await Post.findByIdAndUpdate(
        postId,
        {
          $inc: {
            shares: 1,
          },
        },
        {
          new: true,
        }
      ).populate(
        "userId",
        "name profileImage"
      );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Share count updated",
      post,
    });
  } catch (error) {
    console.error(
      "SHARE POST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params; 
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

 
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

   
    const postUserId = post.userId?.toString() || post.userId;
    
    if (postUserId !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own posts",
      });
    }

  
    await Post.findByIdAndDelete(id);

    console.log(`🗑️ Post deleted by ${userId}: ${id}`);

    return res.status(200).json({
      success: true,
      message: "Post deleted permanently",
      deletedPostId: id,
    });

  } catch (error) {
    console.error("DELETE POST ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete post",
    });
  }
};
