import express from 'express';
import * as paymentController from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create', paymentController.createPayment);
// Removed webhook route from here; it is now registered directly in server.js for correct middleware handling
router.get('/user/:userId', paymentController.getUserPayments);

export default router;
