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

// Recruiter: Reject an application
router.put(
    '/reject/:application_id',
    authMiddleware.authenticate,
    authMiddleware.checkRole(['recruiter']),
    applicationController.rejectApplication
);

// Get a single application by ID
router.get(
    '/:application_id',
    authMiddleware.authenticate,
    applicationController.getApplicationById
);

// Get all applications (optionally filter by job_id)
router.get(
    '/',
    authMiddleware.authenticate,
    applicationController.getApplications
);

// Update application status (generic PATCH)
router.patch(
    '/:application_id',
    authMiddleware.authenticate,
    applicationController.updateApplicationStatus
);

// Check if programmer has applied to a specific job
router.get(
    '/check/:jobId',
    authMiddleware.authenticate,
    authMiddleware.checkRole(['programmer']),
    applicationController.checkIfApplied
);

export default router;