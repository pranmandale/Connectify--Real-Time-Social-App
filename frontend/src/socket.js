import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5005"; // backend URL
let socket;

export const initSocket = (userId) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      query: { userId },
    });
  }
  return socket;
};

export const getSocket = () => socket;
