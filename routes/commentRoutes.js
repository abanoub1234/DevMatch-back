import express from 'express';
import { createComment,updateComment, deleteComment} from '../controllers/commentController.js';
import { authenticate } from "../middleware/authMiddleware.js";

const commentroute = express.Router();

commentroute.post('/:messageId', authenticate, createComment);
commentroute.put('/:commentId', authenticate, updateComment);
commentroute.delete('/:commentId', authenticate, deleteComment);

export default commentroute;