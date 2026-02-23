const express = require("express");
const router = express.Router();
const GamificationService = require("../services/gamificationService");
const { getUserIdFromAuth } = require("../middleware/auth");
const db = require("../db");

// Helper to gather user context for achievement checks
async function getAchievementContext(userId) {
  const roadmapCount = await db.get(
    'SELECT COUNT(*) as count FROM roadmaps WHERE "ownerId" = ?', userId
  );
  const explorationCount = await db.get(
    'SELECT COUNT(*) as count FROM saved_results WHERE "userId" = ?', userId
  ).catch(() => ({ count: 0 }));

  return {
    roadmapsCompleted: roadmapCount?.count || 0,
    careersExplored: explorationCount?.count || 0,
  };
}

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

    const context = await getAchievementContext(userId);
    const newAchievements = await GamificationService.checkAchievements(userId, context);

    return res.json({
      success: true,
      newAchievements
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to check achievements" });
  }
});

// POST /api/gamification/complete-roadmap - Called when user completes all tasks in a roadmap
router.post("/complete-roadmap", async (req, res) => {
  try {
    const userId = getUserIdFromAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Award bonus XP for completing a full roadmap
    const bonusXP = 500;
    await GamificationService.addXP(userId, bonusXP);

    // Check achievements with roadmap context
    const context = await getAchievementContext(userId);
    // Mark at least 1 roadmap completed (since the roadmap just finished)
    context.roadmapsCompleted = Math.max(context.roadmapsCompleted, 1);
    const newAchievements = await GamificationService.checkAchievements(userId, context);

    const updatedData = await GamificationService.getUserGamification(userId);

    return res.json({
      success: true,
      bonusXP,
      newAchievements,
      profile: updatedData
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to process roadmap completion" });
  }
});

module.exports = router;
