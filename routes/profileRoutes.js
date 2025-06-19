import express from 'express';
import * as profileController from '../controllers/profileController.js';
import * as authMiddleware from '../middleware/authMiddleware.js';
import { validateRecruiterProfile } from '../middleware/recruiterProfileValidation.js';

const router = express.Router();

// Recruiter profile completion
router.post(
    '/recruiter',
    authMiddleware.authenticate,
    authMiddleware.checkRole(['recruiter']),
    validateRecruiterProfile,
    profileController.completeRecruiterProfile
);

// Edit recruiter profile
router.put(
    '/recruiter',
    authMiddleware.authenticate,
    authMiddleware.checkRole(['recruiter']),
    validateRecruiterProfile,
    profileController.editRecruiterProfile
);

// // Programmer profile completion
// router.post(
//     '/programmer',
//     authMiddleware.authenticate,
//     authMiddleware.checkRole(['programmer']),
//     profileController.completeProgrammerProfile
// );

export default router;