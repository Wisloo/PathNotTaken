const express = require("express");
const router = express.Router();
const GamificationService = require("../services/gamificationService");
const { getUserIdFromAuth } = require("../middleware/auth");

// GET /api/gamification/profile - Get user's gamification data
router.get("/profile", async (req, res) => {
  try {
    const userId = getUserIdFromAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const data = await GamificationService.getUserGamification(userId);
    const percentile = await GamificationService.getUserPercentile(userId);

    return res.json({ success: true, data: { ...data, percentile } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch gamification data" });
  }
});

// POST /api/gamification/task-complete - Award XP for completing a task
router.post("/task-complete", async (req, res) => {
  try {
    const userId = getUserIdFromAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { skillIds, difficulty } = req.body;
    
    // Update streak
    const streakUpdate = await GamificationService.updateStreak(userId);
    
    // Award XP
    const xpResult = await GamificationService.awardTaskXP(userId, { skillIds, difficulty });
    
    // Get updated profile
    const updatedData = await GamificationService.getUserGamification(userId);

    return res.json({
      success: true,
      xpAwarded: xpResult.xpAwarded,
      multipliers: {
        demand: xpResult.demandMultiplier,
        streak: xpResult.streakMultiplier
      },
      streak: streakUpdate,
      profile: updatedData
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to award XP" });
  }
});

// GET /api/gamification/leaderboard - Get top users
router.get("/leaderboard", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const leaderboard = await GamificationService.getLeaderboard(limit);

    return res.json({ success: true, leaderboard });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// GET /api/gamification/achievements - Get all available achievements
router.get("/achievements", async (req, res) => {
  try {
    const userId = getUserIdFromAuth(req);
    let userAchievements = [];

    if (userId) {
      const userData = await GamificationService.getUserGamification(userId);
      userAchievements = userData.badges || [];
    }

    // Return all achievements with earned status
    const achievements = Object.values(require("../services/gamificationService").ACHIEVEMENTS || {});
    
    return res.json({
      success: true,
      achievements: achievements.map(a => ({
        ...a,
        earned: userAchievements.includes(a.id)
      }))
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch achievements" });
  }
});

// POST /api/gamification/check-achievements - Manually trigger achievement check
router.post("/check-achievements", async (req, res) => {
  try {
    const userId = getUserIdFromAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const newAchievements = await GamificationService.checkAchievements(userId);

    return res.json({
      success: true,
      newAchievements
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to check achievements" });
  }
});

module.exports = router;
