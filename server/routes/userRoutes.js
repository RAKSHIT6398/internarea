const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");
const { getProfile } = require("../controllers/authController");
const {
  getPublicProfile,
  sendFriendRequest,
  acceptFriendRequest,
  cancelOrUnfriend,
} = require("../controllers/publicProfileController");

router.get("/profile", authMiddleware, getProfile);


router.get("/:id", optionalAuth, getPublicProfile);


router.post("/:id/friend-request", authMiddleware, sendFriendRequest);
router.post("/:id/friend-accept", authMiddleware, acceptFriendRequest);
router.post("/:id/friend-cancel", authMiddleware, cancelOrUnfriend);

module.exports = router;