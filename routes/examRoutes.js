import { submitExam } from '../controllers/examController.js';
import express from 'express';
import { authenticate } from "../middleware/authMiddleware.js";
const router = express.Router();
router.post('/api/exam/submit',authenticate, submitExam);
export default router;