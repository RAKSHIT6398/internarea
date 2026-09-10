const express =
require("express");

const router =
express.Router();

const authMiddleware =
require("../middleware/auth");

const {
  sharePost,
  getSharedPosts,
} = require(
  "../controllers/shareController"
);

router.post(
  "/send",
  authMiddleware,
  sharePost
);

router.get(
  "/received",
  authMiddleware,
  getSharedPosts
);

module.exports = router;