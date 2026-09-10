const express = require("express");

const router = express.Router();

const authMiddleware =
require("../middleware/auth");

const {
  sendRequest,
  acceptRequest,
  friendCount,
  getAllUsers,
  getPendingRequests,
  getFriends,rejectRequest,  
  removeFriend,
} = require(
  "../controllers/friendController"
);

router.post(
  "/send",
  authMiddleware,
  sendRequest
);

router.put(
  "/accept",
  authMiddleware,
  acceptRequest
);

router.get(
  "/count",
  authMiddleware,
  friendCount
);

// All Users
router.get(
  "/users",
  authMiddleware,
  getAllUsers
);

// Pending Requests
router.get(
  "/requests",
  authMiddleware,
  getPendingRequests
);

// Accepted Friends
router.get(
  "/my-friends",
  authMiddleware,
  getFriends
);
router.delete(
  "/reject",
  authMiddleware,
  rejectRequest
);
router.delete(
  "/remove",
  authMiddleware,
  removeFriend
);
module.exports = router;