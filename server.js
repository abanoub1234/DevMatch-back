// server.js
import { app, server, io } from "./lib/socket.js";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import connectDB from './models/db.js';
import express from "express";
// Routes
import massageroute from "./routes/message.route.js";
import userRoutes from "./routes/userRoutes.js";
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import massagerouteBrodcast from './routes/messageRoutesBrodCast.js';
import commentroute from './routes/commentRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { handleStripeWebhook } from './controllers/paymentController.js';

dotenv.config();
connectDB();

// stripe webhook (raw body)
app.post('/api/payments/webhook', bodyParser.raw({ type: 'application/json' }), handleStripeWebhook);

// middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// routes
app.use("/api/users", userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use("/api/messages", massageroute);
app.use("/api/messagesbroadcast", massagerouteBrodcast);
app.use('/api/comments', commentroute);
app.use('/api/payments', paymentRoutes);

app.get('/test', (req, res) => {
  res.send('CORS is working');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running with socket.io on http://localhost:${PORT}`);
});
