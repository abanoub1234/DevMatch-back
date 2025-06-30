// routes/followRoutes.js
import express from 'express';
import {
  followUser,
  unfollowUser,
  getFollowing,
  checkFollowStatus
} from '../controllers/followController.js';
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/follow', authenticate,followUser);
router.post('/unfollow',authenticate, unfollowUser);
router.get('/following',authenticate, getFollowing);
router.get('/status/:followingId',authenticate, checkFollowStatus);

export default router;