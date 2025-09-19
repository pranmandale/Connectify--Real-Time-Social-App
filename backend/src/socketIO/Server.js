import express from "express";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import cors from "cors";
import Message from "../models/message.model.js";

const app = express();
const server = http.createServer(app); // Wrap Express in HTTP server

// ------------------ MIDDLEWARES ------------------
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173", // Frontend URL
  credentials: true,
}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// ------------------ SOCKET.IO SETUP ------------------
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Map to track online users: userId -> socketId
const users = {};

/**
 * Helper to get socketId of a user
 */
export const getReceiverSocketId = (receiverId) => users[receiverId];

// ------------------ SOCKET.IO EVENTS ------------------
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // Get userId from query params (frontend should send it on connect)
  const userId = socket.handshake.query.userId;
  if (userId) {
    users[userId] = socket.id;
  }

  // Notify all users of online users
  io.emit("getOnlineUsers", Object.keys(users));

  // ------------------ JOIN ROOM ------------------
  socket.on("joinRoom", (roomId) => {
    if (!roomId) return;
    socket.join(roomId);
    console.log(`User ${userId} joined room ${roomId}`);

    // Optional: notify others in the room that a user joined
    socket.to(roomId).emit("userJoined", { userId });
  });

  // ------------------ CHAT MESSAGE ------------------
  socket.on("chatMessage", async ({ roomId, senderId, message }) => {
    if (!roomId || !senderId || !message) return; // validate input

    try {
      // Save message to DB
      const newMessage = await Message.create({ senderId, roomId, message });

      // Emit the full message to everyone in the room
      io.to(roomId).emit("chatMessage", newMessage);
    } catch (err) {
      console.error("❌ Failed to save message:", err);
    }
  });

  // ------------------ DISCONNECT ------------------
  socket.on("disconnect", () => {
    console.log("⚠️ User disconnected:", socket.id);

    if (userId) delete users[userId];

    // Notify all users of updated online list
    io.emit("getOnlineUsers", Object.keys(users));
  });
});

// ------------------ EXPORTS ------------------
export { app, server, io };
