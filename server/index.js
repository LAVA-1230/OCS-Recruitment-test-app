import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// // Routes
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import applicationRoutes from "./routes/application.routes.js";

app.use('/api', authRoutes);
app.use('/api', profileRoutes);
app.use('/api', applicationRoutes);

app.get('/', (req, res) => {
    res.send('OCS Recruitment API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
