// MARIA
import express from 'express';
import * as jobController from '../controllers/jobController.js';
import * as authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: Get all jobs
router.get('/', jobController.getAllJobs);

// Public: Get job by ID
router.get('/:id', jobController.getJobById);

// Recruiter: Create job
router.post(
    '/',
    authMiddleware.authenticate,
    authMiddleware.checkRole(['recruiter']),
    jobController.createJob
);

// Recruiter: Edit job by ID (must own job)
router.put(
    '/:id',
    authMiddleware.authenticate,
    authMiddleware.checkRole(['recruiter']),
    jobController.updateJobById
);

// Recruiter: Delete job by ID (must own job)
router.delete(
    '/:id',
    authMiddleware.authenticate,
    authMiddleware.checkRole(['recruiter']),
    jobController.deleteJobById
);

export default router;