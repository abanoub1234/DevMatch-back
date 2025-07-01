// profileRoutes.js
import express from 'express';
import * as profileController from '../controllers/profileController.js';
import * as authMiddleware from '../middleware/authMiddleware.js';
import { validateRecruiterProfile } from '../validation/recruiterProfileValidate.js';
import { completeRecruiterProfile, editRecruiterProfile, getRecruiterProfile } from '../controllers/profileController.js';
const router = express.Router();

// Recruiter Profile Routes
router.route('/recruiter')
    // Complete Recruiter Profile (POST)
    .post(
        authMiddleware.authenticate,
        authMiddleware.checkRole(['recruiter']),
        validateRecruiterProfile, // Validate fields (no multer/uploadImage)
        completeRecruiterProfile
    )
    // Edit Recruiter Profile (PUT)
    .put(
        authMiddleware.authenticate,
        authMiddleware.checkRole(['recruiter']),
        validateRecruiterProfile, // Validate fields (no multer/uploadImage)
        editRecruiterProfile
    )
    // Get Recruiter Profile (GET)
    .get(
        authMiddleware.authenticate,
        authMiddleware.checkRole(['recruiter']),
        getRecruiterProfile
    );

export default router;