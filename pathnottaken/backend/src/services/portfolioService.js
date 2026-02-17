/**
 * Portfolio Service - Helps users build portfolio while learning
 * UNIQUE FEATURES:
 * - Auto-suggested projects based on learning path
 * - Project templates for each career
 * - Skill validation through projects
 * - Shareable portfolio profiles
 */

const db = require("../db");

// Project templates for different careers
const PROJECT_TEMPLATES = {
  "ux-researcher": [
    {
      title: "User Research Case Study",
      description: "Conduct user interviews and create personas for a product redesign",
      skills: ["research", "empathy", "data-analysis"],
      estimatedHours: 20,
      difficulty: "medium",
      deliverables: ["Research plan", "Interview transcripts", "Personas", "Insights report"]
    },
    {
      title: "Usability Testing Project",
      description: "Design and conduct usability tests for a website or app",
      skills: ["user-testing", "analytical-thinking", "communication"],
      estimatedHours: 15,
      difficulty: "easy",
      deliverables: ["Test plan", "Task scenarios", "Findings report", "Recommendations"]
    }
  ],
  "data-scientist": [
    {
      title: "Predictive Analytics Dashboard",
      description: "Build a machine learning model and dashboard to predict customer churn",
      skills: ["machine-learning", "python", "data-analysis", "visualization"],
      estimatedHours: 40,
      difficulty: "hard",
      deliverables: ["Jupyter notebook", "Trained model", "Dashboard", "Documentation"]
    },
    {
      title: "Exploratory Data Analysis",
      description: "Analyze a public dataset and uncover insights with visualizations",
      skills: ["python", "data-analysis", "statistics", "visualization"],
      estimatedHours: 15,
      difficulty: "medium",
      deliverables: ["Analysis report", "Visualizations", "Code repository"]
    }
  ],
  "web-developer": [
    {
      title: "Full-Stack Web App",
      description: "Build a complete web application with authentication and database",
      skills: ["programming", "web-development", "databases", "ui-design"],
      estimatedHours: 60,
      difficulty: "hard",
      deliverables: ["Live application", "GitHub repository", "Documentation", "API docs"]
    },
    {
      title: "Responsive Portfolio Site",
      description: "Create a personal portfolio website with modern design",
      skills: ["html", "css", "javascript", "ui-design"],
      estimatedHours: 20,
      difficulty: "easy",
      deliverables: ["Live website", "Source code", "Design mockups"]
    }
  ],
  "technical-writer": [
    {
      title: "API Documentation",
      description: "Write comprehensive documentation for a public API",
      skills: ["writing", "technical-literacy", "communication"],
      estimatedHours: 25,
      difficulty: "medium",
      deliverables: ["API reference", "Quick start guide", "Code examples", "Tutorials"]
    }
  ]
};

class PortfolioService {
  /**
   * Get project templates for a career
   */
  static getCareerTemplates(careerId) {
    return PROJECT_TEMPLATES[careerId] || [];
  }

  /**
   * Create a portfolio project
   */
  static async createProject(userId, projectData) {
    const {
      title,
      description,
      skills = [],
      githubUrl,
      liveUrl,
      imageUrl,
      visibility = "public"
    } = projectData;

    const id = (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)).toLowerCase();
    const completedAt = new Date().toISOString();

    await db.run(
      `INSERT INTO portfolio_projects 
       (id, userId, title, description, skills, githubUrl, liveUrl, imageUrl, completedAt, visibility)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id, userId, title, description, JSON.stringify(skills), githubUrl || null, liveUrl || null,
      imageUrl || null, completedAt, visibility
    );

    return { id, ...projectData, completedAt };
  }

  /**
   * Get user's portfolio projects
   */
  static async getUserProjects(userId, includePrivate = true) {
    const query = includePrivate
      ? `SELECT * FROM portfolio_projects WHERE userId = ? ORDER BY completedAt DESC`
      : `SELECT * FROM portfolio_projects WHERE userId = ? AND visibility = 'public' ORDER BY completedAt DESC`;

    const projects = await db.all(query, userId);

    return projects.map(p => ({
      ...p,
      skills: JSON.parse(p.skills || '[]')
    }));
  }

  /**
   * Update a project
   */
  static async updateProject(userId, projectId, updates) {
    const project = await db.get(
      'SELECT userId FROM portfolio_projects WHERE id = ?',
      projectId
    );

    if (!project || project.userId !== userId) {
      throw new Error('Unauthorized or project not found');
    }

    const {
      title,
      description,
      skills,
      githubUrl,
      liveUrl,
      imageUrl,
      visibility
    } = updates;

    await db.run(
      `UPDATE portfolio_projects 
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           skills = COALESCE(?, skills),
           githubUrl = COALESCE(?, githubUrl),
           liveUrl = COALESCE(?, liveUrl),
           imageUrl = COALESCE(?, imageUrl),
           visibility = COALESCE(?, visibility)
       WHERE id = ?`,
      title || null,
      description || null,
      skills ? JSON.stringify(skills) : null,
      githubUrl || null,
      liveUrl || null,
      imageUrl || null,
      visibility || null,
      projectId
    );

    return this.getProjectById(projectId);
  }

  /**
   * Delete a project
   */
  static async deleteProject(userId, projectId) {
    const project = await db.get(
      'SELECT userId FROM portfolio_projects WHERE id = ?',
      projectId
    );

    if (!project || project.userId !== userId) {
      throw new Error('Unauthorized or project not found');
    }

    await db.run('DELETE FROM portfolio_projects WHERE id = ?', projectId);
    return { success: true };
  }

  /**
   * Get a single project by ID
   */
  static async getProjectById(projectId) {
    const project = await db.get(
      'SELECT * FROM portfolio_projects WHERE id = ?',
      projectId
    );

    if (!project) return null;

    return {
      ...project,
      skills: JSON.parse(project.skills || '[]')
    };
  }

  /**
   * Get public portfolio for sharing
   */
  static async getPublicPortfolio(userId) {
    const projects = await db.all(
      `SELECT id, title, description, skills, githubUrl, liveUrl, imageUrl, completedAt
       FROM portfolio_projects 
       WHERE userId = ? AND visibility = 'public'
       ORDER BY completedAt DESC`,
      userId
    );

    // Get user info
    const user = await db.get(
      'SELECT id, name, email FROM users WHERE id = ?',
      userId
    );

    // Get user skills
    const userSkills = await db.all(
      'SELECT skillId, proficiency FROM user_skills WHERE userId = ?',
      userId
    );

    return {
      user: {
        id: user?.id,
        name: user?.name,
        // Don't expose email in public portfolio
      },
      projects: projects.map(p => ({
        ...p,
        skills: JSON.parse(p.skills || '[]')
      })),
      skills: userSkills
    };
  }

  /**
   * Suggest next project based on learning path
   */
  static async suggestNextProject(userId, careerId, completedSkills = []) {
    const templates = this.getCareerTemplates(careerId);
    const userProjects = await this.getUserProjects(userId);
    
    // Filter out already completed similar projects
    const completedTitles = new Set(userProjects.map(p => p.title.toLowerCase()));
    const availableTemplates = templates.filter(t => 
      !completedTitles.has(t.title.toLowerCase())
    );

    if (availableTemplates.length === 0) {
      return null;
    }

    // Score templates based on skill overlap
    const scored = availableTemplates.map(template => {
      const skillOverlap = template.skills.filter(s => 
        completedSkills.includes(s)
      ).length;
      const readinessScore = skillOverlap / template.skills.length;

      return {
        ...template,
        readinessScore,
        missingSkills: template.skills.filter(s => !completedSkills.includes(s))
      };
    });

    // Sort by readiness (skills user already has) and difficulty
    scored.sort((a, b) => {
      if (Math.abs(a.readinessScore - b.readinessScore) > 0.2) {
        return b.readinessScore - a.readinessScore;
      }
      // If similar readiness, prefer easier projects
      const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    });

    return scored[0];
  }

  /**
   * Track skill usage in projects
   */
  static async updateUserSkillsFromProjects(userId) {
    const projects = await this.getUserProjects(userId);
    const skillUsage = {};

    // Count skill usage across projects
    projects.forEach(project => {
      project.skills.forEach(skill => {
        skillUsage[skill] = (skillUsage[skill] || 0) + 1;
      });
    });

    // Update user_skills table
    for (const [skillId, usageCount] of Object.entries(skillUsage)) {
      const existing = await db.get(
        'SELECT id FROM user_skills WHERE userId = ? AND skillId = ?',
        userId, skillId
      );

      if (existing) {
        // Increase proficiency based on usage
        await db.run(
          'UPDATE user_skills SET proficiency = MIN(10, proficiency + ?) WHERE userId = ? AND skillId = ?',
          Math.min(3, usageCount), userId, skillId
        );
      } else {
        // Add new skill
        await db.run(
          'INSERT INTO user_skills (userId, skillId, proficiency, lastPracticedAt) VALUES (?, ?, ?, ?)',
          userId, skillId, Math.min(5, usageCount), new Date().toISOString()
        );
      }
    }

    return skillUsage;
  }
}

module.exports = PortfolioService;
