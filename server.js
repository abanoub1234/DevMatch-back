import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './models/db.js';
import bodyParser from 'body-parser';
import passport from 'passport';
import './config/passport.js';

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

const app = express();
const server = http.createServer(app);

// ⚡️ Create and export socket instance
export const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true,
    }
});

// Socket handlers
io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join", (userId) => {
        socket.join(userId);
        console.log(`User joined room: ${userId}`);
    });

    socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

// Stripe webhook (before bodyParser)
app.post('/api/payments/webhook', bodyParser.raw({ type: 'application/json' }), handleStripeWebhook);

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});
app.use(passport.initialize());

// Connect to DB
connectDB();

// Routes
app.use("/api/users", userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use("/api/messages", massageroute);
app.use("/api/messagesbroadcast", massagerouteBrodcast);
app.use('/api/comments', commentroute);
app.use('/api/payments', paymentRoutes);

// Test
app.get('/test', (req, res) => {
    res.send('CORS is working');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});