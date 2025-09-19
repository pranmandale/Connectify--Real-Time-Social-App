import mongoose from "mongoose";

/**
 * Message Schema
 * - senderId: user who sent the message
 * - roomId: unique identifier for the chat (private or group)
 * - message: text content
 * - isRead: whether the message has been read
 * - timestamps: automatically adds createdAt and updatedAt
 */
const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    roomId: { type: String, required: true }, // unique room for 1-to-1 or group chat
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
