import User from '../models/User.mongo.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Signup Controller
export const signup = async(req, res) => {
    try {
        const { name, email, password, role, cv_url } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Validate CV URL based on role
        if (role === 'recruiter' && cv_url) {
            return res.status(400).json({
                message: 'CV URL is only available for programmer role'
            });
        }

        // Validate CV URL format if provided (for programmers)
        if (role === 'programmer' && cv_url) {
            try {
                new URL(cv_url); // Validate URL format
            } catch (err) {
                return res.status(400).json({
                    message: 'Invalid CV URL format'
                });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
            registration_date: new Date(),
            isProfileComplete: false
        });

        // Only add CV URL if role is programmer and URL exists
        if (role === 'programmer' && cv_url) {
            newUser.cv_url = cv_url;
        }

        await newUser.save();

        // Generate token
        const token = jwt.sign({ id: newUser._id, role: newUser.role, email: newUser.email },
            process.env.JWT_SECRET, { expiresIn: '12h' }
        );

        // Prepare response data
        const responseData = {
            message: 'User created successfully',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                isProfileComplete: newUser.isProfileComplete,
                image:newUser.image
            },
            token
        };

        // Only include CV URL in response if it exists (for programmers)
        if (newUser.cv_url) {
            responseData.user.cv_url = newUser.cv_url;
        }

        res.status(201).json(responseData);
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

// Login Controller
export const login = async(req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ id: user._id, role: user.role, email: user.email },
            process.env.JWT_SECRET, { expiresIn: '1h' }
        );

        // Prepare response data
        const userData = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isProfileComplete: user.isProfileComplete,
          

        };

        // Only include CV URL if user is a programmer and has one
        if (user.role === 'programmer' && user.cv_url) {
            userData.cv_url = user.cv_url;
        }

        res.status(200).json({
            message: 'Login successful',
            user: userData,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};




export const updateProfile = async (req, res) => {
  try {
    const { image } = req.body;
    const userId =  req.user.id;

    if (!image) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,// by token
      { image },  // Store Base64 string directly
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = async(req, res) => {
  try {
    console.log(req.user)
    req.user= await User.findById(req.user.id).select("-password");//add this
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
