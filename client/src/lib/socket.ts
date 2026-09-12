import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = () => {
  const token = localStorage.getItem("accessToken");

  if (!token) return null;

  if (socket?.connected) {
    return socket;
  }

  socket = io("http://localhost:5000", {
    auth: {
      token,
    },
  });

  socket.on("connect", () => {
    console.log("🔌 Socket connected:", socket?.id);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected");
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};