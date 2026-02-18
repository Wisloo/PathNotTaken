const express = require("express");
const router = express.Router();
const careersData = require("../data/careers.json");
const { getRecommendations } = require("../services/aiService");

// POST /api/careers/recommend
router.post("/recommend", async (req, res) => {
  try {
    const { skills, interests, background, currentField } = req.body;

    if (!skills || !interests || skills.length === 0 || interests.length === 0) {
      return res.status(400).json({
        error: "Please provide at least one skill and one interest.",
      });
    }

    const result = await getRecommendations(skills, interests, background, currentField);

    res.json({
      success: true,
      source: result.source,
      count: result.recommendations.length,
      recommendations: result.recommendations,
    });
  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({
      error: "Failed to generate recommendations. Please try again.",
    });
  }
});

// GET /api/careers/all
router.get("/all", (req, res) => {
  res.json({
    success: true,
    count: careersData.careers.length,
    careers: careersData.careers,
  });
});

// GET /api/careers/:id
router.get("/:id", (req, res) => {
  const career = careersData.careers.find((c) => c.id === req.params.id);

  if (!career) {
    return res.status(404).json({ error: "Career not found." });
  }

  res.json({ success: true, career });
});

module.exports = router;
