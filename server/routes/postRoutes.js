
const express = require("express");
const router = express.Router();

const Post = require("../models/Post");
const authMiddleware = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");
const postLimitMiddleware = require("../middleware/postLimitMiddleware");

const {
  getFeed,
  likePost,
  sharePost,
  createPost,
  getPostQuota,
  deletePost,
} = require("../controllers/postController");

/* ═══════ ✍️ ACTIONS — locked ═══════ */
router.post("/create", authMiddleware, postLimitMiddleware, createPost);
router.get("/quota", authMiddleware, getPostQuota);
router.put("/like/:postId", authMiddleware, likePost);
router.put("/share/:postId", authMiddleware, sharePost);
router.delete("/:id", authMiddleware, deletePost);

/* ═══════ 📖 READ — guest allowed ═══════ */
router.get("/feed", optionalAuth, getFeed);

router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "userId",
      "name profileImage"          // ✅ email removed (public route)
    );

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    return res.status(200).json({ success: true, post });
  } catch (error) {
    console.error("GET SINGLE POST ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;