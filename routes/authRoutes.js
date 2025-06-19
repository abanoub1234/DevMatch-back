import express from 'express';
import * as authController from '../controllers/authController.js';
import { validateUser } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/signup', validateUser, authController.signup);
router.post('/login', authController.login);

export default router;