import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";
import errorHandler from "./middleware/errorHandler.js";
import { PrismaClient } from "@prisma/client";

// Initialize Express app
dotenv.config();
const app = express();
const prisma = new PrismaClient();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(limiter);

// Error Handling Middleware
app.use(errorHandler);

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  try {
    await prisma.$connect();
    console.log("✅ Connected to PostgreSQL");
  } catch (error) {
    console.error("❌ Database connection failed", error);
  }
});
