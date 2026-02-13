require("dotenv").config();
const express = require("express");
const cors = require("cors");

const careerRoutes = require("./routes/careers");
const skillRoutes = require("./routes/skills");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api/careers", careerRoutes);
app.use("/api/skills", skillRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🛤️  PathNotTaken API running on http://localhost:${PORT}`);
});
