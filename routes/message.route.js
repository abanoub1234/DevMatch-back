import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/message.controller.js";

const massageroute = express.Router();

// Place POST /send/:id before GET /:id to avoid route shadowing
massageroute.post("/send/:id", authenticate, sendMessage);
massageroute.get("/users", authenticate, getUsersForSidebar);
massageroute.get("/:id", authenticate, getMessages);

export default massageroute;
