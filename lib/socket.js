// === lib/socket.js ===
import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket"],
});
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

const userSocketMap = {}; // { userId: socketId }

io.use((socket, next) => {
  socket.messageIds = new Set();
  next();
});

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("🔌 New socket connected:", socket.id, "User:", userId);

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  socket.on("join", (roomId) => {
    socket.join(roomId);
    console.log(`🚪 Socket ${socket.id} joined room: ${roomId}`);
    console.log("Rooms:", Array.from(io.sockets.adapter.rooms.keys()));
  });

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("sendMessage", (message) => {
    if (socket.messageIds.has(message._id)) return;
    socket.messageIds.add(message._id);

    if (message.senderId !== message.receiverId) {
      const receiverSocketId = userSocketMap[message.receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", message);
      }
    }

    const senderSocketId = userSocketMap[message.senderId];
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", message);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
    if (userId) delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
