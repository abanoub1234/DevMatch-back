// profileController.js
import User from '../models/User.mongo.js';
import multer from 'multer';
import path from 'path';

// Configure Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, 'profile-' + uniqueSuffix + ext);
    }
});

// Configure file filter for images only
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Initialize Multer middleware
export const uploadImage = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).single('image');

// Complete Recruiter Profile
export const completeRecruiterProfile = async(req, res) => {
    try {
        const userId = req.user.id;
        const {
            company_name,
            company_description,
            company_website,
            company_size,
            founded_year,
            linkedin,
            location
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

        if (req.file) {
            updateData.image = req.file.path;
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
export const editRecruiterProfile = async(req, res) => {
    try {
        const userId = req.user.id;
        const {
            company_name,
            company_description,
            company_website,
            company_size,
            founded_year,
            linkedin,
            location
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

        if (req.file) {
            updateData.image = req.file.path;
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
export const getRecruiterProfile = async(req, res) => {
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