require("dotenv").config();
const express = require("express");
const cors = require("cors");

const careerRoutes = require("./routes/careers");
const skillRoutes = require("./routes/skills");
const roadmapRoutes = require("./routes/roadmaps");
const authRoutes = require("./routes/auth");
const gamificationRoutes = require("./routes/gamification");
const marketRoutes = require("./routes/market");
const portfolioRoutes = require("./routes/portfolio");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // allow same-origin (server-side requests) and any localhost in dev
      if (!origin) return callback(null, true);
      try {
        const url = new URL(origin);
        if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return callback(null, true);
      } catch (e) {
        // fall through
      }
      const allowed = [process.env.FRONTEND_URL || "http://localhost:3001"];
      if (allowed.indexOf(origin) !== -1) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

// Routes
app.use("/api/careers", careerRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/roadmaps", roadmapRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/portfolio", portfolioRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

app.listen(PORT, () => {
  console.log(`🛤️  PathNotTaken API running on http://localhost:${PORT}`);
});
