import Message from "../models/message.model.js";
import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"

/**
 * Get all messages in a room
 * - Sorted from oldest to newest
 * - Populates sender info (username, profilePicture)
 */
export const getMessage = asyncHandler( async(req, res) => {
    const { roomId } = req.params;

    const messages = await Message.find({ roomId })
      .sort({ createdAt: 1 }) // oldest to newest
      .populate("senderId", "_id userName profilePicture"); // include _id


    return res.status(200).json({
      message: "Messages fetched successfully",
      messages,
    });
});

/**
 * Send a message
 * - Saves message in DB
 * - Returns the saved message
 * - For real-time delivery, Socket.IO should be used alongside
 */
export const sendMessage = asyncHandler( async(req, res) => {

    const { senderId, roomId, message } = req.body;


    const newMessage = await Message.create({ senderId, roomId, message });

    console.log(newMessage)
    return res.status(201).json({
      message: "Message sent successfully",
      newMessage,
    });
 
});

/**
 * Mark all messages in a room as read
 * - Useful when user opens a chat
 */
export const markAsRead = asyncHandler( async(req, res) => {

    const { roomId } = req.body;

    const result = await Message.updateMany(
      { roomId, isRead: false }, // all unread messages in the room
      { $set: { isRead: true } }
    );

    return res.status(200).json({
      message: "Messages marked as read successfully",
      result,
    });
});
