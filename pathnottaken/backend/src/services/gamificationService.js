/**
 * Gamification Service - Makes learning addictive through XP, levels, badges, and streaks
 * UNIQUE FEATURES:
 * - Dynamic XP based on skill difficulty & market demand
 * - Career-specific achievements
 * - Learning streaks with multipliers
 * - Peer comparison (percentile ranking)
 */

const db = require("../db");

// XP multipliers based on skill market demand (would integrate with real API)
const SKILL_DEMAND_MULTIPLIERS = {
  "machine-learning": 2.5,
  "ai": 2.5,
  "blockchain": 2.0,
  "cybersecurity": 2.0,
  "data-analysis": 1.8,
  "cloud-computing": 1.8,
  "programming": 1.5,
  "ux-design": 1.5,
  "project-management": 1.3,
  "communication": 1.2,
};

// Level thresholds (exponential growth)
const LEVEL_THRESHOLDS = Array.from({ length: 100 }, (_, i) => 
  Math.floor(100 * Math.pow(1.5, i))
);

// Achievement definitions
const ACHIEVEMENTS = {
  // Streak achievements
  "week-warrior": {
    id: "week-warrior",
    title: "Week Warrior",
    description: "Maintain a 7-day learning streak",
    icon: "🔥",
    xp: 500,
    criteria: { streakDays: 7 }
  },
  "month-master": {
    id: "month-master",
    title: "Month Master",
    description: "Maintain a 30-day learning streak",
    icon: "🏆",
    xp: 2000,
    criteria: { streakDays: 30 }
  },
  "unstoppable": {
    id: "unstoppable",
    title: "Unstoppable",
    description: "Maintain a 90-day learning streak",
    icon: "💎",
    xp: 10000,
    criteria: { streakDays: 90 }
  },

  // Task completion achievements
  "first-steps": {
    id: "first-steps",
    title: "First Steps",
    description: "Complete your first learning task",
    icon: "👣",
    xp: 100,
    criteria: { tasksCompleted: 1 }
  },
  "committed-learner": {
    id: "committed-learner",
    title: "Committed Learner",
    description: "Complete 50 learning tasks",
    icon: "📚",
    xp: 1000,
    criteria: { tasksCompleted: 50 }
  },
  "master-achiever": {
    id: "master-achiever",
    title: "Master Achiever",
    description: "Complete 200 learning tasks",
    icon: "🎯",
    xp: 5000,
    criteria: { tasksCompleted: 200 }
  },

  // Skill diversity achievements
  "polymath": {
    id: "polymath",
    title: "Polymath",
    description: "Learn skills from 5 different categories",
    icon: "🧠",
    xp: 1500,
    criteria: { categoriesLearned: 5 }
  },
  "renaissance": {
    id: "renaissance",
    title: "Renaissance Person",
    description: "Learn skills from 10 different categories",
    icon: "🌟",
    xp: 5000,
    criteria: { categoriesLearned: 10 }
  },

  // Career exploration achievements
  "explorer": {
    id: "explorer",
    title: "Career Explorer",
    description: "Explore 10 different careers",
    icon: "🗺️",
    xp: 500,
    criteria: { careersExplored: 10 }
  },
  "pathfinder": {
    id: "pathfinder",
    title: "Pathfinder",
    description: "Complete a roadmap",
    icon: "🚀",
    xp: 3000,
    criteria: { roadmapsCompleted: 1 }
  },

  // High-demand skill achievements
  "ai-pioneer": {
    id: "ai-pioneer",
    title: "AI Pioneer",
    description: "Master 3 AI/ML skills",
    icon: "🤖",
    xp: 3000,
    criteria: { specificSkills: ["machine-learning", "nlp", "computer-vision"], count: 3 }
  },
  "data-wizard": {
    id: "data-wizard",
    title: "Data Wizard",
    description: "Master 5 data skills",
    icon: "📊",
    xp: 2500,
    criteria: { categorySkills: "data-analysis", count: 5 }
  }
};

class GamificationService {
  /**
   * Initialize gamification for a new user
   */
  static async initializeUser(userId) {
    try {
      await db.run(`
        INSERT INTO user_gamification 
        ("userId", xp, level, "streakDays", "lastActivityDate", "tasksCompleted", badges, statistics)
        VALUES (?, 0, 1, 0, NULL, 0, '[]', '{}')
        ON CONFLICT DO NOTHING
      `, userId);
    } catch (err) {
      console.error("Error initializing gamification:", err);
    }
  }

  /**
   * Award XP for completing a task
   * XP varies based on skill difficulty, market demand, and user streak
   */
  static async awardTaskXP(userId, taskData) {
    const { skillIds = [], difficulty = "medium" } = taskData;

    // Base XP by difficulty
    const baseXP = {
      easy: 10,
      medium: 25,
      hard: 50,
      expert: 100
    }[difficulty] || 25;

    // Calculate skill demand multiplier (average of involved skills)
    let demandMultiplier = 1.0;
    if (skillIds.length > 0) {
      const multipliers = skillIds.map(s => SKILL_DEMAND_MULTIPLIERS[s] || 1.0);
      demandMultiplier = multipliers.reduce((a, b) => a + b, 0) / multipliers.length;
    }

    // Get current streak for streak multiplier
    const userData = await this.getUserGamification(userId);
    const streakMultiplier = 1 + (Math.min(userData.streakDays, 30) * 0.02); // +2% per day, max 60%

    // Calculate final XP
    const finalXP = Math.round(baseXP * demandMultiplier * streakMultiplier);

    // Award XP and check for level up
    await this.addXP(userId, finalXP);
    await this.incrementTaskCount(userId);

    // Check for new achievements
    await this.checkAchievements(userId);

    return { xpAwarded: finalXP, demandMultiplier, streakMultiplier };
  }

  /**
   * Update user streak (call daily when user completes a task)
   */
  static async updateStreak(userId) {
    const today = new Date().toISOString().split('T')[0];
    const userData = await db.get(
      'SELECT "streakDays", "lastActivityDate" FROM user_gamification WHERE "userId" = ?',
      userId
    );

    if (!userData) {
      await this.initializeUser(userId);
      return { streakDays: 0, isNewStreak: true };
    }

    const lastDate = userData.lastActivityDate?.split('T')[0];
    let newStreak = userData.streakDays || 0;
    let isNewStreak = false;

    if (!lastDate || lastDate === today) {
      // Same day or first activity
      await db.run(
        'UPDATE user_gamification SET "lastActivityDate" = ? WHERE "userId" = ?',
        new Date().toISOString(), userId
      );
      return { streakDays: newStreak, isNewStreak: false };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastDate === yesterdayStr) {
      // Consecutive day
      newStreak += 1;
      isNewStreak = true;
    } else {
      // Streak broken
      newStreak = 1;
      isNewStreak = true;
    }

    await db.run(
      'UPDATE user_gamification SET "streakDays" = ?, "lastActivityDate" = ? WHERE "userId" = ?',
      newStreak, new Date().toISOString(), userId
    );

    // Check streak achievements
    await this.checkAchievements(userId);

    return { streakDays: newStreak, isNewStreak };
  }

  /**
   * Add XP and handle level ups
   */
  static async addXP(userId, xp) {
    const userData = await this.getUserGamification(userId);
    const newXP = userData.xp + xp;
    const newLevel = this.calculateLevel(newXP);
    const leveledUp = newLevel > userData.level;

    await db.run(
      'UPDATE user_gamification SET xp = ?, level = ? WHERE "userId" = ?',
      newXP, newLevel, userId
    );

    return { newXP, newLevel, leveledUp };
  }

  /**
   * Calculate level from XP
   */
  static calculateLevel(xp) {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1;
  }

  /**
   * Get XP needed for next level
   */
  static getXPForNextLevel(currentLevel) {
    if (currentLevel >= LEVEL_THRESHOLDS.length) {
      return null; // Max level
    }
    return LEVEL_THRESHOLDS[currentLevel];
  }

  /**
   * Increment task completion count
   */
  static async incrementTaskCount(userId) {
    await db.run(
      'UPDATE user_gamification SET "tasksCompleted" = "tasksCompleted" + 1 WHERE "userId" = ?',
      userId
    );
  }

  /**
   * Check and award achievements
   */
  static async checkAchievements(userId) {
    const userData = await this.getUserGamification(userId);
    const currentBadges = userData.badges || [];
    const newBadges = [];

    for (const [achievementId, achievement] of Object.entries(ACHIEVEMENTS)) {
      // Skip if already earned
      if (currentBadges.includes(achievementId)) continue;

      let earned = false;

      // Check criteria
      if (achievement.criteria.streakDays && userData.streakDays >= achievement.criteria.streakDays) {
        earned = true;
      }
      if (achievement.criteria.tasksCompleted && userData.tasksCompleted >= achievement.criteria.tasksCompleted) {
        earned = true;
      }

      // Award badge
      if (earned) {
        newBadges.push(achievementId);
        currentBadges.push(achievementId);
        await this.addXP(userId, achievement.xp);
      }
    }

    if (newBadges.length > 0) {
      await db.run(
        'UPDATE user_gamification SET badges = ? WHERE "userId" = ?',
        JSON.stringify(currentBadges), userId
      );
    }

    return newBadges.map(id => ACHIEVEMENTS[id]);
  }

  /**
   * Get user's gamification data
   */
  static async getUserGamification(userId) {
    let userData = await db.get(
      'SELECT * FROM user_gamification WHERE "userId" = ?',
      userId
    );

    if (!userData) {
      await this.initializeUser(userId);
      userData = await db.get(
        'SELECT * FROM user_gamification WHERE "userId" = ?',
        userId
      );
    }

    if (userData.badges && typeof userData.badges === 'string') {
      userData.badges = JSON.parse(userData.badges);
    }
    if (userData.statistics && typeof userData.statistics === 'string') {
      userData.statistics = JSON.parse(userData.statistics);
    }

    // Calculate level progress
    const currentLevelXP = LEVEL_THRESHOLDS[userData.level - 1] || 0;
    const nextLevelXP = this.getXPForNextLevel(userData.level);
    const xpIntoLevel = userData.xp - currentLevelXP;
    const xpNeededForNextLevel = nextLevelXP ? nextLevelXP - currentLevelXP : 0;
    const levelProgress = nextLevelXP ? (xpIntoLevel / xpNeededForNextLevel) * 100 : 100;

    return {
      ...userData,
      currentLevelXP,
      nextLevelXP,
      levelProgress,
      earnedAchievements: userData.badges.map(id => ACHIEVEMENTS[id]).filter(Boolean)
    };
  }

  /**
   * Get leaderboard (percentile ranking)
   */
  static async getLeaderboard(limit = 100) {
    const users = await db.all(
      `SELECT "userId", xp, level, "streakDays", "tasksCompleted", badges
       FROM user_gamification 
       ORDER BY xp DESC
       LIMIT ?`,
      limit
    );

    return users.map((u, index) => ({
      ...u,
      rank: index + 1,
      badges: JSON.parse(u.badges || '[]')
    }));
  }

  /**
   * Get user's percentile ranking
   */
  static async getUserPercentile(userId) {
    const totalUsers = await db.get('SELECT COUNT(*) as count FROM user_gamification');
    const usersAbove = await db.get(
      'SELECT COUNT(*) as count FROM user_gamification WHERE xp > (SELECT xp FROM user_gamification WHERE "userId" = ?)',
      userId
    );

    const percentile = totalUsers.count > 0 
      ? Math.round((1 - usersAbove.count / totalUsers.count) * 100)
      : 0;

    return percentile;
  }
}

module.exports = GamificationService;
