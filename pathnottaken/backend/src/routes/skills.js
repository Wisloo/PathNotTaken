const express = require("express");
const router = express.Router();
const careersData = require("../data/careers.json");

// GET /api/skills/categories
router.get("/categories", (req, res) => {
  res.json({
    success: true,
    categories: careersData.skillCategories,
  });
});

// GET /api/skills/interests
router.get("/interests", (req, res) => {
  res.json({
    success: true,
    interests: careersData.interests,
  });
});

module.exports = router;
