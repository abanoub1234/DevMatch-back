import User from '../models/User.mongo.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import fs from 'fs';
import path from 'path';

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

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        newUser.emailVerificationToken = verificationToken;
        await newUser.save();

        // Send verification email using template
        const verifyLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}&email=${newUser.email}`;
        await sendEmail({
            to: newUser.email,
            subject: 'Verify your email to join DevMatch',
            template: 'verifyEmail.html',
            templateVars: { verify_link: verifyLink }
        });

        // Prepare response data
        const responseData = {
            message: 'User created successfully. Please check your email to verify your account.',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
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
        // Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(403).json({ message: 'Please verify your email to login' });
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
            isProfileComplete: user.isProfileComplete
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

// Email verification controller
export const verifyEmail = async(req, res) => {
    console.log("VERIFY EMAIL:", req.query.token, req.query.email);
    const { token, email } = req.query;
    const user = await User.findOne({ email });
    if (!user) {
        console.log("User not found for:", email);
        return res.redirect('/login?verified=notfound');
    }
    if (user.isEmailVerified) {
        console.log("User already verified:", email);
        return res.redirect('/login?verified=already');
    }
    if (user.emailVerificationToken !== token) {
        console.log("Token invalid for:", email, token);
        return res.redirect('/login?verified=invalidtoken');
    }
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();
    return res.redirect('/login?verified=success');
};

// Get user info from token
export const getMe = async(req, res) => {
    try {
        const token = req.query.token;
        if (!token) return res.status(401).json({ message: 'No token provided' });
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        const user = await User.findById(decoded.id).select('-password -emailVerificationToken');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update role controller
export const updateRole = async(req, res) => {
    try {
        const { userId, role } = req.body;
        if (!['programmer', 'recruiter'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }
        const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
        if (!user) return res.status(404).json({ message: 'User not found' });
        // Generate a new JWT token with the updated role
        const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ user, token });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};