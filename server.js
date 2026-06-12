// =====================================================================
// Pachtaki Yadu Portal — Express server
// Now backed by MongoDB (Mongoose) with Google login + JWT auth.
//  - Citizens log in with Google and file complaints tied to their account.
//  - Admins (emails in ADMIN_EMAILS) can view/manage every complaint.
// Still serves the static frontend (index.html, etc.) from this folder.
// =====================================================================
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const os = require("os");

const { connectDB } = require("./server/db");
const authRoutes = require("./server/routes/auth");
const complaintRoutes = require("./server/routes/complaints");

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Ensure the (cached) DB connection is ready before any /api route runs. A
// failure becomes a clean 500 instead of crashing the process.
app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection error:", err.message);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// Health check.
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Pachtaki Yadu Portal is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes.
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);

// JSON 404 for unknown API routes.
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// Serve the static frontend (index.html and assets) from the project root.
app.use(express.static(__dirname));

// Start the server locally. (On a serverless host, export the app instead.)
if (!process.env.VERCEL) {
  app.listen(PORT, HOST, () => {
    console.log("");
    console.log("╔═══════════════════════════════════════════════════╗");
    console.log("║  🚀 PACHTAKI YADU PORTAL (MongoDB + Google login) ║");
    console.log(`║  📍 http://localhost:${PORT.toString().padEnd(31)}║`);

    const ifaces = os.networkInterfaces();
    for (const name of Object.keys(ifaces)) {
      for (const iface of ifaces[name]) {
        if (iface.family === "IPv4" && !iface.internal) {
          console.log(
            `║  🌐 http://${iface.address}:${PORT.toString().padEnd(28)}║`
          );
          break;
        }
      }
    }
    console.log("║  ✅ API Ready | 🏠 Portal Live                    ║");
    console.log("╚═══════════════════════════════════════════════════╝");
    console.log("");
  });
}

module.exports = app;
