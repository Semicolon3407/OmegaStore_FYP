const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getConversations,
  getMessages,
  getChatUsers,
  getSupportUser,
  getUnreadCount,
} = require("../controller/chatController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

router.post("/send", authMiddleware, sendMessage);
router.get("/conversations", authMiddleware, getConversations);
router.get("/messages/:otherUserId", authMiddleware, getMessages);
router.get("/unread-count", authMiddleware, getUnreadCount);
router.get("/admin/users", authMiddleware, isAdmin, getChatUsers);
router.get("/get-support", authMiddleware, getSupportUser);

module.exports = router;