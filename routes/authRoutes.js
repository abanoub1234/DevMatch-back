import express from 'express';
import * as authController from '../controllers/authController.js';
import { validateUser } from '../middleware/validationMiddleware.js';
import { authenticate } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post('/signup', validateUser, authController.signup);
router.post('/login', authController.login);
router.put("/update-profile",authenticate , authController.updateProfile);

router.get("/check", authenticate, authController.checkAuth);

export default router;