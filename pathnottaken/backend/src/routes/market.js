const express = require("express");
const router = express.Router();
const MarketIntelligenceService = require("../services/marketIntelligence");
const careersData = require("../data/careers.json");
const { getUserIdFromAuth } = require("../middleware/auth");

// GET /api/market/skill/:skillId - Get market data for a specific skill
router.get("/skill/:skillId", (req, res) => {
  try {
    const { skillId } = req.params;
    const data = MarketIntelligenceService.getSkillMarketData(skillId);
    const roi = MarketIntelligenceService.calculateSkillROI(skillId);

    return res.json({
      success: true,
      skill: skillId,
      marketData: data,
      roi
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch market data" });
  }
});

// GET /api/market/career/:careerId - Get market insights for a career
router.get("/career/:careerId", (req, res) => {
  try {
    const { careerId } = req.params;
    const career = careersData.careers.find(c => c.id === careerId);
    
    if (!career) {
      return res.status(404).json({ error: "Career not found" });
    }

    const insights = MarketIntelligenceService.getCareerMarketInsights(career);

    return res.json({
      success: true,
      career: careerId,
      insights
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch career insights" });
  }
});

// GET /api/market/trending - Get trending skills
router.get("/trending", (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const trending = MarketIntelligenceService.getTrendingSkills(limit);

    return res.json({
      success: true,
      trending
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch trending skills" });
  }
});

// GET /api/market/at-risk - Get skills with declining demand
router.get("/at-risk", (req, res) => {
  try {
    const atRisk = MarketIntelligenceService.getSkillsAtRisk();

    return res.json({
      success: true,
      atRisk
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch at-risk skills" });
  }
});

// GET /api/market/transition/:fromCareer/:toCareer - Get career transition analysis
router.get("/transition/:fromCareer/:toCareer", (req, res) => {
  try {
    const { fromCareer, toCareer } = req.params;
    const analysis = MarketIntelligenceService.getTransitionAnalysis(fromCareer, toCareer);

    return res.json({
      success: true,
      from: fromCareer,
      to: toCareer,
      analysis
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to analyze transition" });
  }
});

// POST /api/market/personalized - Get personalized market insights
router.post("/personalized", async (req, res) => {
  try {
    const userId = getUserIdFromAuth(req);
    const { userSkills, targetCareer } = req.body;

    const insights = await MarketIntelligenceService.getPersonalizedInsights(
      userId,
      userSkills || [],
      targetCareer
    );

    return res.json({
      success: true,
      insights
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to generate insights" });
  }
});

module.exports = router;
