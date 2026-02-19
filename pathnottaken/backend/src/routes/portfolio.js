const express = require("express");
const router = express.Router();
const PortfolioService = require("../services/portfolioService");
const { getUserIdFromAuth } = require("../middleware/auth");

// GET /api/portfolio/templates/:careerId - Get project templates for a career
router.get("/templates/:careerId", (req, res) => {
  try {
    const { careerId } = req.params;
    const templates = PortfolioService.getCareerTemplates(careerId);

    return res.json({
      success: true,
      careerId,
      templates
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch templates" });
  }
});

// POST /api/portfolio/projects - Create a new project
router.post("/projects", async (req, res) => {
  try {
    const userId = getUserIdFromAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const project = await PortfolioService.createProject(userId, req.body);

    // Update user skills based on project
    await PortfolioService.updateUserSkillsFromProjects(userId);

    return res.json({
      success: true,
      project
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create project" });
  }
});

// GET /api/portfolio/projects - Get user's portfolio projects
router.get("/projects", async (req, res) => {
  try {
    const userId = getUserIdFromAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const projects = await PortfolioService.getUserProjects(userId);

    return res.json({
      success: true,
      projects
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// PUT /api/portfolio/projects/:projectId - Update a project
router.put("/projects/:projectId", async (req, res) => {
  try {
    const userId = getUserIdFromAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { projectId } = req.params;
    const project = await PortfolioService.updateProject(userId, projectId, req.body);

    return res.json({
      success: true,
      project
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to update project" });
  }
});

// DELETE /api/portfolio/projects/:projectId - Delete a project
router.delete("/projects/:projectId", async (req, res) => {
  try {
    const userId = getUserIdFromAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { projectId } = req.params;
    await PortfolioService.deleteProject(userId, projectId);

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to delete project" });
  }
});

// GET /api/portfolio/public/:userId - Get public portfolio (shareable)
router.get("/public/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const portfolio = await PortfolioService.getPublicPortfolio(userId);

    return res.json({
      success: true,
      portfolio
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch portfolio" });
  }
});

// POST /api/portfolio/suggest-next - Get suggested next project
router.post("/suggest-next", async (req, res) => {
  try {
    const userId = getUserIdFromAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { careerId, completedSkills } = req.body;
    const suggestion = await PortfolioService.suggestNextProject(
      userId,
      careerId,
      completedSkills || []
    );

    return res.json({
      success: true,
      suggestion
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to generate suggestion" });
  }
});

module.exports = router;
