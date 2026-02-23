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

    // Load saved skill snapshots (history of the user's skills over time)
    const snapshots = await db.all('SELECT id, skills, interests, background, "currentField", "createdAt" FROM skill_snapshots WHERE "userId" = ? ORDER BY "createdAt" DESC LIMIT 20', user.id);
    user.skillSnapshots = snapshots.map(s => ({
      ...s,
      skills: JSON.parse(s.skills || '[]'),
      interests: JSON.parse(s.interests || '[]'),
    }));

    // Load saved recommendation results
    const results = await db.all('SELECT id, skills, interests, source, "createdAt" FROM saved_results WHERE "userId" = ? ORDER BY "createdAt" DESC LIMIT 20', user.id);
    user.savedResults = results.map(r => ({
      ...r,
      skills: JSON.parse(r.skills || '[]'),
      interests: JSON.parse(r.interests || '[]'),
    }));

    // Load gamification data for the profile page
    const gamification = await db.get('SELECT xp, level, "streakDays", "tasksCompleted", "lastActivityDate", badges FROM user_gamification WHERE "userId" = ?', user.id);
    if (gamification) {
      user.gamification = {
        ...gamification,
        badges: JSON.parse(gamification.badges || '[]'),
      };
    }

    return res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "failed" });
  }
});

// POST /api/auth/save-skills — Save a snapshot of the user's current skills
// This is how a user "saves their skills to their profile" so they can compare
// 6 months later and see how they've grown.
router.post("/save-skills", async (req, res) => {
  try {
    const userId = getUserIdFromAuth(req);
    if (!userId) return res.status(401).json({ error: "unauthenticated" });

    const { skills, interests, background, currentField } = req.body;
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ error: "skills array is required" });
    }

    const createdAt = new Date().toISOString();
    await db.run(
      'INSERT INTO skill_snapshots ("userId", skills, interests, background, "currentField", "createdAt") VALUES (?,?,?,?,?,?)',
      userId,
      JSON.stringify(skills),
      JSON.stringify(interests || []),
      background || null,
      currentField || null,
      createdAt
    );

    return res.json({ success: true, createdAt });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to save skills" });
  }
});

// POST /api/auth/save-results — Save a set of recommendation results
router.post("/save-results", async (req, res) => {
  try {
    const userId = getUserIdFromAuth(req);
    if (!userId) return res.status(401).json({ error: "unauthenticated" });

    const { skills, interests, background, currentField, recommendations, source } = req.body;
    if (!recommendations || !Array.isArray(recommendations)) {
      return res.status(400).json({ error: "recommendations array is required" });
    }

    const id = (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)).toLowerCase();
    const createdAt = new Date().toISOString();
    await db.run(
      'INSERT INTO saved_results (id, "userId", skills, interests, background, "currentField", recommendations, source, "createdAt") VALUES (?,?,?,?,?,?,?,?,?)',
      id,
      userId,
      JSON.stringify(skills || []),
      JSON.stringify(interests || []),
      background || null,
      currentField || null,
      JSON.stringify(recommendations),
      source || 'unknown',
      createdAt
    );

    return res.json({ success: true, id, createdAt });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to save results" });
  }
});

// GET /api/auth/saved-results/:id — Load a specific saved result set
router.get("/saved-results/:id", async (req, res) => {
  try {
    const userId = getUserIdFromAuth(req);
    if (!userId) return res.status(401).json({ error: "unauthenticated" });

    const row = await db.get('SELECT * FROM saved_results WHERE id = ? AND "userId" = ?', req.params.id, userId);
    if (!row) return res.status(404).json({ error: "Not found" });

    row.skills = JSON.parse(row.skills || '[]');
    row.interests = JSON.parse(row.interests || '[]');
    row.recommendations = JSON.parse(row.recommendations || '[]');
    return res.json({ success: true, result: row });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load results" });
  }
});

// GET /api/auth/public-profile/:userId — Public profile for sharing
router.get("/public-profile/:userId", async (req, res) => {
  try {
    const targetId = req.params.userId;
    const user = await db.get('SELECT id, name, "createdAt" FROM users WHERE id = ?', targetId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Public roadmaps
    const roadmaps = await db.all('SELECT id, "careerId", title, "createdAt" FROM roadmaps WHERE "ownerId" = ? ORDER BY "createdAt" DESC', targetId);

    // Gamification data (public)
    const gamification = await db.get('SELECT xp, level, "streakDays", "tasksCompleted", badges FROM user_gamification WHERE "userId" = ?', targetId);

    // Latest skill snapshot (public)
    const latestSkills = await db.get('SELECT skills, "createdAt" FROM skill_snapshots WHERE "userId" = ? ORDER BY "createdAt" DESC LIMIT 1', targetId);

    return res.json({
      success: true,
      profile: {
        id: user.id,
        name: user.name || 'Anonymous',
        memberSince: user.createdAt,
        roadmaps: roadmaps.map(r => ({ id: r.id, careerId: r.careerId, title: r.title, createdAt: r.createdAt })),
        gamification: gamification ? {
          xp: gamification.xp,
          level: gamification.level,
          streakDays: gamification.streakDays,
          tasksCompleted: gamification.tasksCompleted,
          badges: JSON.parse(gamification.badges || '[]'),
        } : null,
        skills: latestSkills ? JSON.parse(latestSkills.skills || '[]') : [],
        skillsUpdatedAt: latestSkills?.createdAt || null,
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load profile" });
  }
});

module.exports = router;