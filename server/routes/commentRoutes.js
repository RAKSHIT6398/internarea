
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");

const {
  addComment,
  getComments,
  editComment,
  deleteComment,
} = require("../controllers/commentController");

/* ✍️ WRITE — locked */
router.post("/add", authMiddleware, addComment);
router.put("/edit/:commentId", authMiddleware, editComment);
router.delete("/delete/:commentId", authMiddleware, deleteComment);

/* 📖 READ — guest comments padh sake */
router.get("/:postId", optionalAuth, getComments);

module.exports = router;