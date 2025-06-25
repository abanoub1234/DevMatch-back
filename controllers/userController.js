import User from "../models/User.mongo.js";

export const getAllUsers = async (req, res) => {
  console.log("[userController] getAllUsers called");
  try {
    const users = await User.find();
    console.log("[userController] users from DB:", users);
    res.json(users);
  } catch (err) {
    console.error("[userController] error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Find user by custom id field or MongoDB _id
export const getUserById = async (req, res) => {
  try {
    let user = await User.findOne({ id: req.params.id });
    if (!user) {
      // Try MongoDB _id
      try {
        user = await User.findById(req.params.id);
      } catch (e) {
        // ignore invalid ObjectId errors
      }
    }
    if (!user) {
      console.log(`[userController] User not found for id: ${req.params.id}`);
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createUser = async (req, res) => {
  try {
    // Check if email already exists
    const existing = await User.findOne({ email: req.body.email });
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const result = await User.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user by custom id field or MongoDB _id
export const updateUserById = async (req, res) => {
  try {
    // List of required fields for profile completion (must be in request body)
    const requiredFields = [
      'aboutMe', 'image', 'location', 'experience', 'skills', 'technology'
    ];
    const missingFields = requiredFields.filter(field => {
      const value = req.body[field];
      if (Array.isArray(value)) { return value.length === 0; }
      return value === undefined || value === null || value === '';
    });
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.map(f => {
          switch(f) {
            case 'aboutMe': return 'About Me';
            case 'image': return 'Profile Image';
            case 'location': return 'Location';
            case 'experience': return 'Experience (years)';
            case 'skills': return 'Skills (comma separated)';
            case 'technology': return 'Technology (comma separated)';
            default: return f;
          }
        }).join(', ')}`
      });
    }

    // Find the user first (by custom id or _id)
    let user = await User.findOne({ id: req.params.id });
    if (!user) {
      try {
        user = await User.findById(req.params.id);
      } catch (e) {}
    }
    if (!user) {
      console.log(`[userController] User not found for update: ${req.params.id}`);
      return res.status(404).json({ message: "User not found" });
    }

    const merged = { ...user.toObject(), ...req.body };
    const allFields = [
      'aboutMe', 'location', 'experience', 'skills', 'technology', 'image', 'name', 'email', 'role', 'password'
    ];
    let isProfileComplete = allFields.every(field => {
      const value = merged[field];
      if (Array.isArray(value)) { return value.length > 0; }
      return value !== undefined && value !== null && value !== '';
    });
    req.body.isProfileComplete = isProfileComplete;

    let updatedUser = await User.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updatedUser) {
      try {
        updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
      } catch (e) {}
    }
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Mark user as paid (for frontend sync after payment)
export const updateUserByIdPaid = async (userId) => {
  try {
    console.log('[updateUserByIdPaid] Called with userId:', userId);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isPaid: true },
      { new: true }
    );
    if (!updatedUser) {
      console.warn('[updateUserByIdPaid] No user found for userId:', userId);
    } else {
      console.log('[updateUserByIdPaid] User updated:', updatedUser);
    }
    return updatedUser;
  } catch (err) {
    console.error('[userController] Error marking user as paid:', err);
    return null;
  }
};

// Get all freelancers (programmers)
export const getAllFreelancers = async (req, res) => {
  try {
    const freelancers = await User.find({ role: 'programmer' });
    res.json(freelancers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all unique technologies from all programmers
export const getAllTechnologies = async (req, res) => {
  try {
    const programmers = await User.find({ role: 'programmer' }, 'technology');
    // Flatten and deduplicate technologies
    const techSet = new Set();
    programmers.forEach(user => {
      if (Array.isArray(user.technology)) {
        user.technology.forEach(t => techSet.add(t));
      } else if (typeof user.technology === 'string' && user.technology) {
        user.technology.split(',').map(t => t.trim()).forEach(t => techSet.add(t));
      }
    });
    res.json(Array.from(techSet));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
