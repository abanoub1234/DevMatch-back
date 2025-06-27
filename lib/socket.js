// ✅ lib/socket.js
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

// Optional: Prevent duplicate messages
io.use((socket, next) => {
  socket.messageIds = new Set();
  next();
});



// Store connected users
const userSocketMap = {}; // { userId: socketId }

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) {
    console.log(`✅ User ${userId} connected via socket ${socket.id}`);
    userSocketMap[userId] = socket.id;

    // Emit online users to all clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  } else {
    console.warn("⚠️ No userId found in socket handshake query.");
  }

  // Join a room (e.g. for notifications)
  socket.on("join", (roomId) => {
    socket.join(roomId);
    console.log(`🚪 User joined room: ${roomId}`);
  });

  // Message broadcasting
  socket.on("sendMessage", (message) => {
    if (socket.messageIds.has(message._id)) return;
    socket.messageIds.add(message._id);

    // Send to receiver
    if (message.senderId !== message.receiverId) {
      const receiverSocketId = userSocketMap[message.receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", message);
      }
    }

    // Send back to sender too
    const senderSocketId = userSocketMap[message.senderId];
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", message);
    }
  });

  // Clean up on disconnect
  socket.on("disconnect", () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
    if (userId) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

export { io, app, server };
