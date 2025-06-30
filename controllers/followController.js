// controllers/followController.js
import Follow from '../models/Follow.js';
import User from '../models/User.mongo.js';

// Follow a user
export const followUser = async (req, res) => {
  try {
    const followerId = req.user.id; // Get the follower ID from the authenticated user
    if (!followerId) {
      return res.status(401).json({ message: "Unauthorized: User not logged in" });
    }
    const {  followingId } = req.body;

    // Check if user is trying to follow themselves
    if (followerId === followingId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // Check if follow relationship already exists
    const existingFollow = await Follow.findOne({ follower: followerId, following: followingId });
    if (existingFollow) {
      return res.status(400).json({ message: "You are already following this user" });
    }

    // Create new follow relationship
    const follow = new Follow({
      follower: followerId,
      following: followingId
    });

    await follow.save();
    res.status(201).json({ message: "Successfully followed user", follow });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.id; // Get the follower ID from the authenticated user
    if (!followerId) {
      return res.status(401).json({ message: "Unauthorized: User not logged in" });
    }
    const {  followingId } = req.body;

    const follow = await Follow.findOneAndDelete({ 
      follower: followerId, 
      following: followingId 
    });

    if (!follow) {
      return res.status(404).json({ message: "Follow relationship not found" });
    }

    res.json({ message: "Successfully unfollowed user" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users that the current user follows
export const getFollowing = async (req, res) => {
  try {
const userId = req.user.id; // Get the user ID from the authenticated user
    if (!userId) {  
        return res.status(401).json({ message: "Unauthorized: User not logged in" });
        }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const follows = await Follow.find({ follower: userId })
      .populate('following', 'name email image location technology')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Follow.countDocuments({ follower: userId });

    res.json({
      follows: follows.map(f => f.following),
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check if current user follows another user
export const checkFollowStatus = async (req, res) => {
  try {
      const followerId = req.user.id; // Get the follower ID from the authenticated user
    if (!followerId) {
      return res.status(401).json({ message: "Unauthorized: User not logged in" });
    }
    const {  followingId } = req.params;

    const follow = await Follow.findOne({ 
      follower: followerId, 
      following: followingId 
    });

    res.json({ isFollowing: !!follow });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};