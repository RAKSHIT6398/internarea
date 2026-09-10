

const Friend = require("../models/Friend");
const Post = require("../models/Post");

module.exports = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;

    /* ───── 1. Friends count ───── */
    const friendCount = await Friend.countDocuments({
      $or: [
        { userId, status: "accepted" },
        { friendId: userId, status: "accepted" },
      ],
    });

    if (friendCount === 0) {
      return res.status(403).json({
        success: false,
        code: "NO_FRIENDS",
        message:
          "You have 0 friends 😢 Make at least 1 friend to start posting!",
        friendCount: 0,
        limit: 0,
        postsToday: 0,
        remaining: 0,
      });
    }

  
    const limit = friendCount >= 10 ? Infinity : friendCount;

   
    const now = new Date();
    const IST_OFFSET = 330 * 60 * 1000; // +5:30
    const istNow = new Date(now.getTime() + IST_OFFSET);

    const istMidnight = new Date(
      Date.UTC(
        istNow.getUTCFullYear(),
        istNow.getUTCMonth(),
        istNow.getUTCDate(),
        0, 0, 0, 0
      )
    );

    const startOfDay = new Date(istMidnight.getTime() - IST_OFFSET);
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const postsToday = await Post.countDocuments({
      userId,
      createdAt: { $gte: startOfDay, $lt: endOfDay },
    });

    console.log(
      `[POST LIMIT] friends=${friendCount} | today=${postsToday} | limit=${
        limit === Infinity ? "∞" : limit
      }`
    );

    /* ───── 4. Block if exceeded ───── */
    if (limit !== Infinity && postsToday >= limit) {
      const friendsNeeded = 10 - friendCount;

      return res.status(403).json({
        success: false,
        code: "DAILY_LIMIT_REACHED",
        message: `Daily limit reached! ${friendCount} friend${
          friendCount > 1 ? "s" : ""
        } = ${limit} post${limit > 1 ? "s" : ""} per day. Add ${friendsNeeded} more friend${
          friendsNeeded > 1 ? "s" : ""
        } to unlock UNLIMITED daily posting! 🚀`,
        friendCount,
        limit,
        postsToday,
        remaining: 0,
        friendsNeeded,
        resetsAt: endOfDay,
      });
    }


    req.postMeta = {
      friendCount,
      limit,
      postsToday,
      remaining: limit === Infinity ? "Unlimited" : limit - postsToday,
      resetsAt: endOfDay,
    };

    next();
  } catch (error) {
    console.error("postLimit error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};