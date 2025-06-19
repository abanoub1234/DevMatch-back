import express from 'express';
import * as applicationController from '../controllers/applicationController.js';
import * as authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Programmer applies to a job
router.post(
    '/',
    authMiddleware.authenticate,
    authMiddleware.checkRole(['programmer']),
    applicationController.createApplication
);

// Recruiter: Get all applications for their jobs
router.get(
    '/recruiter',
    authMiddleware.authenticate,
    authMiddleware.checkRole(['recruiter']),
    applicationController.getApplicationsByRecruiter
);

// Recruiter: Get all applications for a specific job they own
router.get(
    '/recruiter/:job_id',
    authMiddleware.authenticate,
    authMiddleware.checkRole(['recruiter']),
    applicationController.getApplicationsByRecruiterAndJob
);

// Recruiter: Accept an application and close the job
router.put(
    '/accept/:application_id',
    authMiddleware.authenticate,
    authMiddleware.checkRole(['recruiter']),
    applicationController.acceptApplication
);

export default router;