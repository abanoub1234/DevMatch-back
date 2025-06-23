import dotenv from 'dotenv';
dotenv.config();

import Payment from '../models/Payment.mongo.js';
import User from '../models/User.mongo.js';
import Stripe from 'stripe';

console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY); // Debug log
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create a payment intent and save payment info
export async function createPayment(req, res) {
  try {
    const { userId, amount, currency, method, name } = req.body;
    console.log('Received createPayment request:', { userId, amount, currency, method, name });
    if (!userId || !amount || !method || !name) {
      console.warn('Missing required fields in createPayment:', { userId, amount, method, name });
      return res.status(400).json({ message: 'userId, name, amount, and method are required.' });
    }
    if (typeof amount !== 'number' || amount <= 0) {
      console.warn('Invalid amount in createPayment:', amount);
      return res.status(400).json({ message: 'Amount must be a positive number.' });
    }
    const user = await User.findById(userId);
    if (!user) {
      console.warn('User not found in createPayment:', userId);
      return res.status(404).json({ message: 'User not found.' });
    }
    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects cents
      currency: currency || 'usd',
      metadata: { userId, method, name }
    });
    console.log('Stripe paymentIntent created:', paymentIntent.id);
    // Save payment info
    const payment = new Payment({
      userId,
      amount,
      currency: currency || 'usd',
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      method
    });
    await payment.save();
    console.log('Payment document saved:', payment);
    res.status(201).json({
      message: 'Payment intent created',
      clientSecret: paymentIntent.client_secret,
      payment
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ message: 'Error creating payment', error: error.message });
  }
}

// Webhook to update payment status
export async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('Stripe webhook event constructed:', event.type);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  // Listen for both payment_intent.succeeded and charge.succeeded
  if (event.type === 'payment_intent.succeeded' || event.type === 'charge.succeeded') {
    const object = event.data.object;
    // Extract userId from metadata (works for both event types)
    const userId = object.metadata && object.metadata.userId;
    console.log(`Webhook event: ${event.type}, paymentIntent/charge id: ${object.id}, userId from metadata: ${userId}`);
    if (!userId) {
      console.warn('No userId found in event metadata. Skipping user update.');
      return res.json({ received: true });
    }
    // Update user isPaid: true
    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId.toString(),
        { isPaid: true },
        { new: true }
      );
      if (!updatedUser) {
        console.warn(`User with ID ${userId} not found for webhook update.`);
      } else {
        console.log(`User ${updatedUser._id} isPaid updated to true after event ${event.type} (${object.id})`);
      }
    } catch (err) {
      console.error('Error updating user isPaid status from webhook:', err);
    }
    // Optionally, update Payment document status if paymentIntentId or chargeId matches
    if (event.type === 'payment_intent.succeeded') {
      await Payment.findOneAndUpdate(
        { paymentIntentId: object.id },
        { status: object.status, updatedAt: new Date() }
      );
    }
    if (event.type === 'charge.succeeded' && object.payment_intent) {
      await Payment.findOneAndUpdate(
        { paymentIntentId: object.payment_intent },
        { status: object.status, updatedAt: new Date() }
      );
    }
  } else {
    console.log('Unhandled Stripe webhook event type:', event.type);
  }
  res.json({ received: true });
}

// Get all payments for a user
export async function getUserPayments(req, res) {
  try {
    const { userId } = req.params;
    console.log('Received getUserPayments request for userId:', userId);
    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
    console.log('Payments found for user:', payments.length);
    // Fetch the user to return isPaid status
    const user = await User.findById(userId);
    if (!user) {
      console.warn(`User with ID ${userId} not found when fetching payments.`);
    } else {
      console.log(`User ${userId} isPaid status:`, user.isPaid);
    }
    res.json({
      isPaid: user ? user.isPaid : false,
      payments
    });
  } catch (error) {
    console.error('Error fetching payments or user isPaid status:', error);
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
}
