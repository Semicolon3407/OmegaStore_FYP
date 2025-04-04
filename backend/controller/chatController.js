const Message = require("../models/chatModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMangodbid");

const sendMessage = asyncHandler(async (req, res) => {
  const { recipientId, content } = req.body;
  const senderId = req.user._id;
  const io = req.app.get("io");

  validateMongoDbId(senderId);
  validateMongoDbId(recipientId);

  if (!content) {
    return res.status(400).json({ message: "Message content is required" });
  }

  try {
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    const message = await Message.create({
      sender: senderId,
      recipient: recipientId,
      content,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "firstname lastname email role")
      .populate("recipient", "firstname lastname email role");

    io.to(recipientId.toString()).emit("newMessage", populatedMessage);
    io.to(senderId.toString()).emit("newMessage", populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
});

const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  validateMongoDbId(userId);

  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { recipient: userId }],
        },
      },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$sender", userId] }, "$recipient", "$sender"],
          },
          lastMessage: { $last: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$recipient", userId] }, { $eq: ["$read", false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          "user._id": 1,
          "user.firstname": 1,
          "user.lastname": 1,
          "user.email": 1,
          "user.role": 1,
          lastMessage: 1,
          unreadCount: 1,
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
    ]);

    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
});

const getMessages = asyncHandler(async (req, res) => {
  const { otherUserId } = req.params;
  const userId = req.user._id;

  validateMongoDbId(userId);
  validateMongoDbId(otherUserId);

  try {
    await Message.updateMany(
      {
        sender: otherUserId,
        recipient: userId,
        read: false,
      },
      { $set: { read: true } }
    );

    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: otherUserId },
        { sender: otherUserId, recipient: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "firstname lastname email role")
      .populate("recipient", "firstname lastname email role");

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

const getChatUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find(
      { _id: { $ne: req.user._id } },
      "firstname lastname email role"
    ).sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error("Error fetching chat users:", error);
    res.status(500).json({ message: "Failed to fetch chat users" });
  }
});

const getSupportUser = asyncHandler(async (req, res) => {
  try {
    const admin = await User.findOne({ role: "admin" }).select("_id firstname lastname email role");
    
    if (!admin) {
      return res.status(404).json({ message: "No support available" });
    }
    
    res.json(admin);
  } catch (error) {
    console.error("Error finding support:", error);
    res.status(500).json({ message: "Failed to find support" });
  }
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  validateMongoDbId(userId);

  try {
    const count = await Message.countDocuments({
      recipient: userId,
      read: false,
    });

    res.json({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ message: "Failed to fetch unread count" });
  }
});

module.exports = {
  sendMessage,
  getConversations,
  getMessages,
  getChatUsers,
  getSupportUser,
  getUnreadCount,
};