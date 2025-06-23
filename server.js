import express from "express";
import cors from "cors";
import connectDB from './models/db.js';
import dotenv from 'dotenv';
import massageroute from "./routes/message.route.js"
import userRoutes from "./routes/userRoutes.js";
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import massagerouteBrodcast from './routes/messageRoutesBrodcast.js'
import commentroute from './routes/commentRoutes.js'
dotenv.config();
console.log('JWT_SECRET:', process.env.JWT_SECRET);

const app = express();
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

// Connect to MongoDB
connectDB();

app.use("/api/users", userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use("/api/messages", massageroute);
//massage brodcast
app.use("/api/messagesbroadcast", massagerouteBrodcast);
app.use('/api/comments', commentroute);
//
app.get('/test', (req, res) => {
  res.send('CORS is working');
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});