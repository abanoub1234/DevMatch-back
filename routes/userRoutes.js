import express from "express";
import * as userController from "../controllers/userController.js";
import userLogger from "../middleware/userLogger.js";
import * as authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(userLogger);

router.get("/technologies", userController.getAllTechnologies);
router.get("/freelancers", userController.getAllFreelancers);
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUserById);
router.post("/", userController.createUser);
router.delete("/:id", userController.deleteUser);

// Get current user from token
router.get('/me', authMiddleware.authenticate, (req, res) => {
    res.status(200).json(req.user);
});

// Mark recruiter as paid (for frontend sync after payment)
router.put('/recruiter/mark-paid', authMiddleware.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const updatedUser = await userController.updateUserByIdPaid(userId);
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ message: 'User marked as paid.', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error marking user as paid', error: error.message });
    }
});


export default router;