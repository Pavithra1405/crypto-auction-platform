import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import authRoutes from "./routes/auth.js";
import auctionRoutes from "./routes/auctions.js";
import bidRoutes from "./routes/bids.js";
import blockchainRoutes from "./routes/blockchain.js";
import ratingRoutes from "./routes/ratings.js";
import userRoutes from "./routes/users.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Import routes
import authRoutes from "./routes/auth.js";
import auctionRoutes from "./routes/auctions.js";
import bidRoutes from "./routes/bids.js";
import blockchainRoutes from "./routes/blockchain.js";
import ratingRoutes from "./routes/ratings.js";
import userRoutes from "./routes/users.js";

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/blockchain", blockchainRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/users", userRoutes);
// ===== TEST API =====
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend working 🚀" });
});


// ===== API ROUTES =====
app.use("/api/auth", authRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/blockchain", blockchainRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/users", userRoutes);

// Serve frontend build
app.use(express.static(join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "production"}`);
});