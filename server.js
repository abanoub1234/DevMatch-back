const express = require("express");
const cors = require("cors");
const connectDB = require('./models/db');

const userRoutes = require("./routes/userRoutes");
const jobRoutes = require('./routes/jobRoutes');
const specializationRoutes = require('./routes/specializationRoutes');
const governorateRoutes = require('./routes/governorateRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

app.use("/api/users", userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/specializations', specializationRoutes);
app.use('/api/governorates', governorateRoutes);
app.use('/api/applications', applicationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
