const express = require("express");
const router = express.Router();

// Middleware
const auth = require("../middleware/auth"); // Verify your exact path/filename

// Controller reference
const messageController = require("../controllers/messageController");

/* ══════════ 1. STATIC & COLLECTION ROUTES ══════════ */
// GET /api/messages/conversations - Fetch sidebar chat list
router.get("/conversations", auth, messageController.getConversations);

// GET /api/messages/starred - Fetch user's starred messages
router.get("/starred", auth, messageController.getStarred);

// POST /api/messages - Send a new message
router.post("/", auth, messageController.sendMessage);

/* ══════════ 2. INDIVIDUAL MESSAGE OPERATIONS ══════════ */
// PUT /api/messages/edit/:id - Edit a specific message text
router.put("/edit/:id", auth, messageController.editMessage);

// DELETE /api/messages/me/:id - Soft-delete message for current user
router.delete("/me/:id", auth, messageController.deleteForMe);

// DELETE /api/messages/everyone/:id - Delete message for everyone
router.delete("/everyone/:id", auth, messageController.deleteForEveryone);

// PUT /api/messages/star/:id - Toggle star status on a message
router.put("/star/:id", auth, messageController.toggleStar);

/* ══════════ 3. CHAT & SETTINGS OPERATIONS ══════════ */
// PUT /api/messages/mute/:userId - Toggle mute/unmute status for a peer
router.put("/mute/:userId", auth, messageController.toggleMute);

// PUT /api/messages/block/:userId - Toggle block/unblock user
router.put("/block/:userId", auth, messageController.toggleBlock);

// DELETE /api/messages/clear/:userId - Clear history in thread
router.delete("/clear/:userId", auth, messageController.clearChat);

// DELETE /api/messages/chat/:userId - Hide/delete whole conversation
router.delete("/chat/:userId", auth, messageController.deleteChat);

// GET /api/messages/info/:userId - Fetch media, stats, and settings info
router.get("/info/:userId", auth, messageController.getChatInfo);

/* ══════════ 4. DYNAMIC THREAD ROUTES (MUST BE LAST) ══════════ */
// GET /api/messages/:userId - Get conversation messages with a specific user
router.get("/:userId", auth, messageController.getMessages);

module.exports = router;