import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";   // ADD THIS
import sensorRoutes from "./routes/sensor.routes.js";
import authRoutes from "./routes/auth.routes.js";
import hourlyCron from "./cron/hourlyCron.js";
import dailyCron from "./cron/dailyCron.js";
import monthlyCron from "./cron/monthlyCron.js";
import historyRoutes from "./routes/history.routes.js";
import minuteCron from "./cron/minuteCron.js";

dotenv.config();

const app = express();

// CONNECT TO DATABASE
connectDB();   // ⭐ VERY IMPORTANT

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/sensor", sensorRoutes);
app.use("/api/history", historyRoutes);

// Cron Jobs
hourlyCron();
dailyCron();
monthlyCron();
minuteCron();
// Health Check
app.get("/", (req, res) => {
  res.send("Smart Tree Care Backend Running...");
});

export default app;
