const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("../db");
const { getUserIdFromAuth, signToken, JWT_SECRET } = require("../middleware/auth");
const jwt = require("jsonwebtoken");

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: "email, name and password required" });

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ error: "Please provide a valid email address" });

    // Password strength validation
    if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters long" });

    const exists = await db.get('SELECT id FROM users WHERE email = ?', email.toLowerCase());
    if (exists) return res.status(409).json({ error: "User already exists" });

    const id = (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)).toLowerCase();
    const passwordHash = bcrypt.hashSync(password, 10);
    const createdAt = new Date().toISOString();
    await db.run('INSERT INTO users (id,email,name,"passwordHash","createdAt") VALUES (?,?,?,?,?)', id, email.toLowerCase(), name || null, passwordHash, createdAt);

    const token = signToken(id);
    return res.json({ success: true, token, user: { id, email: email.toLowerCase(), name } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "registration failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password required" });

    const row = await db.get('SELECT id,email,name,"passwordHash","createdAt" FROM users WHERE email = ?', email.toLowerCase());
    if (!row) return res.status(401).json({ error: "invalid credentials" });

    if (!bcrypt.compareSync(password, row.passwordHash)) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    const token = signToken(row.id);
    return res.json({ success: true, token, user: { id: row.id, email: row.email, name: row.name } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "login failed" });
  }
});

// GET /api/auth/me
router.get("/me", async (req, res) => {
  try {
    const userId = getUserIdFromAuth(req);
    if (!userId) return res.status(401).json({ error: "unauthenticated" });

    const user = await db.get('SELECT id,email,name,"createdAt" FROM users WHERE id = ?', userId);
    if (!user) return res.status(401).json({ error: "unauthenticated" });

    // load user's roadmap summaries
    const rrows = await db.all('SELECT id, "careerId", title, "createdAt" FROM roadmaps WHERE "ownerId" = ? ORDER BY "createdAt" DESC', user.id);
    user.roadmaps = rrows.map(r => r.id);
    user.roadmapDetails = rrows.map(r => ({ id: r.id, careerId: r.careerId, title: r.title, createdAt: r.createdAt }));
    return res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "failed" });
  }
});

module.exports = router;