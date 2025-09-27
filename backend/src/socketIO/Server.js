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
app.set("trust proxy", 1);
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://connectify-real-time-social-app-1.onrender.com"
  ], 
  credentials: true,
}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));



// ------------------ SOCKET.IO SETUP ------------------
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://connectify-real-time-social-app-1.onrender.com"
    ],
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
// io.on("connection", (socket) => {
//   console.log("✅ User connected:", socket.id);

//   // Get userId from query params (frontend should send it on connect)
//   const userId = socket.handshake.query.userId;
//   if (userId) {
//     users[userId] = socket.id;
//   }

//   // Notify all users of online users
//   io.emit("getOnlineUsers", Object.keys(users));

//   // ------------------ JOIN ROOM ------------------
//   socket.on("joinRoom", (roomId) => {
//     if (!roomId) return;
//     socket.join(roomId);
//     console.log(`User ${userId} joined room ${roomId}`);

//     // Optional: notify others in the room that a user joined
//     socket.to(roomId).emit("userJoined", { userId });
//   });

//   // ------------------ CHAT MESSAGE ------------------
//   // socket.on("chatMessage", async ({ roomId, senderId, message }) => {
//   //   if (!roomId || !senderId || !message) return; // validate input

//   //   try {
//   //     // Save message to DB
//   //     const newMessage = await Message.create({ senderId, roomId, message });

//   //     // Emit the full message to everyone in the room
//   //     io.to(roomId).emit("chatMessage", newMessage);
//   //   } catch (err) {
//   //     console.error("❌ Failed to save message:", err);
//   //   }
//   // });

//   // ------------------ CHAT MESSAGE + REAL-TIME NOTIFICATION ------------------
// socket.on("chatMessage", async ({ roomId, senderId, message, receiverId }) => {
//   if (!roomId || !senderId || !message) return; // validate input

//   try {
//     // Save message to DB
//     const newMessage = await Message.create({ senderId, roomId, message });

//     // Emit the full message to everyone in the room (real-time chat)
//     io.to(roomId).emit("chatMessage", newMessage);

//     // Send a real-time notification only if receiverId is provided
//     if (receiverId) {
//       const receiverSocketId = getReceiverSocketId(receiverId);

//       if (receiverSocketId) {
//         io.to(receiverSocketId).emit("getNotification", {
//           type: "message",
//           sender: { _id: senderId },
//           roomId,
//           content: message,
//           createdAt: new Date(),
//         });
//       }
//     }
//   } catch (err) {
//     console.error("❌ Failed to send message:", err);
//   }
// });




//   // ------------------ DISCONNECT ------------------
//   socket.on("disconnect", () => {
//     console.log("⚠️ User disconnected:", socket.id);

//     if (userId) delete users[userId];

//     // Notify all users of updated online list
//     io.emit("getOnlineUsers", Object.keys(users));
//   });

//   // ------------------ NOTIFICATION EVENT ------------------
//   socket.on("sendNotification", ({ receiverId, type, data }) => {
//     const receiverSocketId = getReceiverSocketId(receiverId);

//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit("getNotification", {
//         type,   // e.g. "follow", "comment", "message"
//         data,   // extra info like who followed, postId, etc.
//         createdAt: new Date(),
//       });
//     }
//   });


// });



// socket.js
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) users[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(users));

  // ---------------- JOIN ROOM ----------------
  socket.on("joinRoom", (roomId) => {
    if (!roomId) return;
    socket.join(roomId);
    console.log(`User ${userId} joined room ${roomId}`);
  });

  // ---------------- CHAT MESSAGE ----------------
  socket.on("chatMessage", async ({ roomId, senderId, message, receiverId }) => {
  if (!roomId || !senderId || !message) return;

  

  try {
    const newMessage = await Message.create({ senderId, roomId, message });

    // populate senderId so frontend gets { _id, userName, ... }
    const populatedMessage = await newMessage.populate("senderId", "_id userName");
   

    // Emit message to everyone in the room
    io.to(roomId).emit("chatMessage", populatedMessage);

    // Send notification specifically to receiver
    if (receiverId) {
      const receiverSocketId = users[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("getNotification", {
          type: "message",
          sender: { _id: senderId },
          roomId,
          content: message,
          createdAt: new Date(),
        });
      }
    }
  } catch (err) {
    console.error("❌ Failed to send message:", err);
  }
});


  // ---------------- DISCONNECT ----------------
  socket.on("disconnect", () => {
    if (userId) delete users[userId];
    io.emit("getOnlineUsers", Object.keys(users));
  });

  // ---------------- GENERAL NOTIFICATIONS ----------------
  socket.on("sendNotification", ({ receiverId, type, data }) => {
    const receiverSocketId = users[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("getNotification", { type, data, createdAt: new Date() });
    }
  });
});

// ------------------ EXPORTS ------------------
export { app, server, io };
