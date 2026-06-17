import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import oauthRoutes from './routes/oauth.routes.js';

// Load local .env file
dotenv.config(); 

const app = express();

app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/oauth", oauthRoutes);

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", service: "Auth Service" });
});

export default app;
