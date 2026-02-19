require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const db = require("./db");

const careerRoutes = require("./routes/careers");
const skillRoutes = require("./routes/skills");
const roadmapRoutes = require("./routes/roadmaps");
const authRoutes = require("./routes/auth");
const gamificationRoutes = require("./routes/gamification");
const marketRoutes = require("./routes/market");
const portfolioRoutes = require("./routes/portfolio");

const app = express();
const PORT = process.env.PORT || 5000;
const IS_PROD = process.env.NODE_ENV === "production";

// ---------- Security ----------
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// Rate limiting on auth routes to prevent brute-force
const isDev = process.env.NODE_ENV !== 'production';
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 100 : 20,    // generous in dev, strict in prod
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts, please try again later." },
});

// Global rate limit (generous)
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// ---------- CORS ----------
app.use(
  cors({
    origin: function (origin, callback) {
      // allow same-origin (server-side requests) and any localhost in dev
      if (!origin) return callback(null, true);
      try {
        const url = new URL(origin);
        if (!IS_PROD && (url.hostname === "localhost" || url.hostname === "127.0.0.1")) {
          return callback(null, true);
        }
      } catch (e) {
        // fall through
      }
      const allowed = (process.env.FRONTEND_URL || "http://localhost:3000")
        .split(",")
        .map((s) => s.trim());
      if (allowed.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

// ---------- Routes ----------
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/careers", careerRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/roadmaps", roadmapRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/portfolio", portfolioRoutes);

// Health check — includes DB driver info for ops
app.get("/api/health", async (req, res) => {
  try {
    // Quick DB connectivity test
    await db.get("SELECT 1 AS ok");
    res.json({
      status: "ok",
      db: db.driver,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({ status: "unhealthy", error: "database unreachable" });
  }
});

// ---------- Error handling ----------
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    error: IS_PROD ? "Internal server error" : err.message,
  });
});

// ---------- Graceful shutdown ----------
function shutdown() {
  console.log("\n🛑 Shutting down gracefully…");
  db.close().then(() => process.exit(0)).catch(() => process.exit(1));
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

app.listen(PORT, () => {
  console.log(`🛤️  PathNotTaken API running on http://localhost:${PORT}`);
  console.log(`   Database: ${db.driver} | Env: ${process.env.NODE_ENV || "development"}`);
});
