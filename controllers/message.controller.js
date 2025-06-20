import User from "../models/User.mongo.js";
import Message from "../models/message.model.js";
import Application from "../models/Application.mongo.js";
import Job from "../models/Job.mongo.js";

import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;
    const loggedInUser = await User.findById(loggedInUserId);
    if (!loggedInUser) return res.status(404).json({ error: "User not found" });

    let users = [];
    if (["Programmer", "Developer"].includes(loggedInUser.role)) {
      // Find accepted applications for this user
      const acceptedApps = await Application.find({ applicant_id: loggedInUserId, status: "accepted" });
      const jobIds = acceptedApps.map((app) => app.job_id);
      // Find recruiters who own these jobs
      const jobs = await Job.find({ id: { $in: jobIds } });
      const recruiterIds = jobs.map((job) => job.recruiter_id);
      users = await User.find({ _id: { $in: recruiterIds } }).select("-password");
    } else if (["Recruiter", "HR"].includes(loggedInUser.role)) {
      // Find jobs owned by this recruiter
      const jobs = await Job.find({ recruiter_id: loggedInUserId });
      const jobIds = jobs.map((job) => job.id);
      // Find accepted applications for these jobs
      const acceptedApps = await Application.find({ job_id: { $in: jobIds }, status: "accepted" });
      const programmerIds = acceptedApps.map((app) => app.applicant_id);
      users = await User.find({ _id: { $in: programmerIds } }).select("-password");
    } else {
      // Default: return all users except self
      users = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    }
    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user.id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    // Accept both _id and id from JWT for compatibility
    const senderId = req.user._id || req.user.id;

    // If image is provided, just save the base64 string directly
    let imageUrl = image || null;

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });
    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
