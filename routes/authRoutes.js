import express from 'express';
import * as authController from '../controllers/authController.js';
import { validateUser } from '../middleware/validationMiddleware.js';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/signup', validateUser, authController.signup);
router.post('/login', authController.login);
router.get('/verify-email', authController.verifyEmail);
router.get('/me', authController.getMe);
router.post('/update-role', authController.updateRole);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        // Generate JWT token with user id, role, and email
        const token = jwt.sign({ id: req.user._id, role: req.user.role, email: req.user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        // Redirect to frontend with both token and email
        res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${token}&email=${encodeURIComponent(req.user.email)}`);
    }
);

export default router;