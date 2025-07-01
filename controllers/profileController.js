import User from '../models/User.mongo.js';
import fs from 'fs';
import path from 'path';

// Helper to save base64 image
const saveBase64Image = (base64String, folder = 'public/images') => {
    if (!base64String) return null;
    const matches = base64String.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!matches) return null;
    const ext = matches[1].split('/')[1];
    const buffer = Buffer.from(matches[2], 'base64');
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    const filename = `profile-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
    const filePath = path.join(folder, filename);
    fs.writeFileSync(filePath, buffer);
    return filePath;
};

// Complete Recruiter Profile
export const completeRecruiterProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            company_name,
            company_description,
            company_website,
            company_size,
            founded_year,
            linkedin,
            location,
            image_base64 // Accept base64 image string from frontend
        } = req.body;

        const updateData = {
            company_name,
            company_description,
            company_website,
            company_size,
            founded_year,
            linkedin,
            location,
            isProfileComplete: true
        };

        if (typeof image_base64 !== 'undefined') {
            // Store base64 string directly in DB, even if empty string (to clear image)
            updateData.image = image_base64;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData, { new: true }
        );

        res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            message: 'Error updating profile',
            error: error.message
        });
    }
};

// Edit Recruiter Profile
export const editRecruiterProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            company_name,
            company_description,
            company_website,
            company_size,
            founded_year,
            linkedin,
            location,
            image_base64 // Accept base64 image string from frontend
        } = req.body;

        const updateData = {
            company_name,
            company_description,
            company_website,
            company_size,
            founded_year,
            linkedin,
            location
        };

        if (typeof image_base64 !== 'undefined') {
            // Store base64 string directly in DB, even if empty string (to clear image)
            updateData.image = image_base64;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData, { new: true }
        );

        res.status(200).json({
            message: 'Profile edited successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error editing profile:', error);
        res.status(500).json({
            message: 'Error editing profile',
            error: error.message
        });
    }
};

// Get Recruiter Profile
export const getRecruiterProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'Recruiter profile not found'
            });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error('Error fetching recruiter profile:', error);
        res.status(500).json({
            message: 'Error fetching recruiter profile',
            error: error.message
        });
      }
};