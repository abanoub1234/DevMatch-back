// profileRoutes.js
import express from 'express';
import * as profileController from '../controllers/profileController.js';
import * as authMiddleware from '../middleware/authMiddleware.js';
import { validateRecruiterProfile } from '../validation/recruiterProfileValidate.js';

const router = express.Router();

// Recruiter Profile Routes
router.route('/recruiter')
    // Complete Recruiter Profile (POST)
    .post(
        authMiddleware.authenticate,
        authMiddleware.checkRole(['recruiter']),
        profileController.uploadImage, // Handle file upload first
        validateRecruiterProfile, // Then validate other fields
        profileController.completeRecruiterProfile
    )
    // Edit Recruiter Profile (PUT)
    .put(
        authMiddleware.authenticate,
        authMiddleware.checkRole(['recruiter']),
        profileController.uploadImage, // Handle file upload first
        validateRecruiterProfile, // Then validate other fields
        profileController.editRecruiterProfile
    )
    // Get Recruiter Profile (GET)
    .get(
        authMiddleware.authenticate,
        authMiddleware.checkRole(['recruiter']),
        profileController.getRecruiterProfile
    );

export default router;