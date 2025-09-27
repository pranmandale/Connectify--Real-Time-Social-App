import { io } from "socket.io-client";

// const SOCKET_URL = "http://localhost:5005"; // your backend URL
const SOCKET_URL = "https://connectify-real-time-social-app.onrender.com"
let socket = null;

/**
 * Initialize socket connection with userId
 * Returns the socket instance
 */
export const initSocket = (userId) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      query: { userId },
      transports: ["websocket"], // force websocket, optional but more stable
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("⚠️ Socket disconnected");
    });
  }
  return socket;
};

/**
 * Returns existing socket instance
 */
export const getSocket = () => socket;
