import Message from "../models/message.model.js";

/**
 * Get all messages in a room
 * - Sorted from oldest to newest
 * - Populates sender info (username, profilePicture)
 */
export const getMessage = async (req, res) => {
  try {
    const { roomId } = req.params;

    const messages = await Message.find({ roomId })
      .sort({ createdAt: 1 }) // oldest to newest
      .populate("senderId", "_id userName profilePicture"); // include _id


    return res.status(200).json({
      message: "Messages fetched successfully",
      messages,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};

/**
 * Send a message
 * - Saves message in DB
 * - Returns the saved message
 * - For real-time delivery, Socket.IO should be used alongside
 */
export const sendMessage = async (req, res) => {
  try {
    const { senderId, roomId, message } = req.body;


    const newMessage = await Message.create({ senderId, roomId, message });

    console.log(newMessage)
    return res.status(201).json({
      message: "Message sent successfully",
      newMessage,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to send message",
      error: error.message,
    });
  }
};

/**
 * Mark all messages in a room as read
 * - Useful when user opens a chat
 */
export const markAsRead = async (req, res) => {
  try {
    const { roomId } = req.body;

    const result = await Message.updateMany(
      { roomId, isRead: false }, // all unread messages in the room
      { $set: { isRead: true } }
    );

    return res.status(200).json({
      message: "Messages marked as read successfully",
      result,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
