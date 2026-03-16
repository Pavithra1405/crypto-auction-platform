import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

/* =========================
   MIDDLEWARE
========================= */

// Allow frontend from Vercel
app.use(
  cors({
    origin: "https://crypto-auction-platform.vercel.app",
    credentials: true,
  })
);

// Parse JSON requests
app.use(express.json());

/* =========================
   API ROUTES
========================= */

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend working 🚀" });
});

/* =========================
   SERVE FRONTEND
========================= */

// Serve static React build
app.use(express.static(join(__dirname, "dist")));

// React router fallback
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "production"}`);
});