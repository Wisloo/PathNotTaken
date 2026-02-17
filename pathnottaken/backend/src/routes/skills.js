const express = require("express");
const router = express.Router();
const careersData = require("../data/careers.json");
const learningResources = require("../data/learningResources.json");
const { 
  generatePersonalizedRoadmap, 
  analyzeLearningStyle, 
  generateSkillGapAnalysis 
} = require("../services/aiService");

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

// POST /api/skills/personalized-roadmap - Generate learning-style aware roadmap
router.post("/personalized-roadmap", async (req, res) => {
  try {
    const { careerId, userProfile } = req.body;
    if (!careerId) {
      return res.status(400).json({ error: "careerId is required" });
    }

    const roadmap = await generatePersonalizedRoadmap(careerId, userProfile || {});
    return res.json({ success: true, roadmap });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to generate roadmap" });
  }
});

// POST /api/skills/analyze-learning-style - Analyze user's learning preferences
router.post("/analyze-learning-style", (req, res) => {
  try {
    const { userActivity } = req.body;
    const analysis = analyzeLearningStyle(userActivity || {});
    return res.json({ success: true, analysis });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to analyze learning style" });
  }
});

// POST /api/skills/gap-analysis - Detailed skill gap analysis
router.post("/gap-analysis", (req, res) => {
  try {
    const { userSkills, targetCareer } = req.body;
    if (!targetCareer) {
      return res.status(400).json({ error: "targetCareer is required" });
    }

    const analysis = generateSkillGapAnalysis(userSkills || [], targetCareer);
    return res.json({ success: true, analysis });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to analyze skill gap" });
  }
});

// GET /api/skills/learning-resources/:skillId - Get learning resources for a specific skill
router.get("/learning-resources/:skillId", (req, res) => {
  const skillId = req.params.skillId;
  const resources = learningResources.skillResources[skillId] 
    || (learningResources.additionalSkills && learningResources.additionalSkills[skillId])
    || learningResources.defaultResources;
  return res.json({ success: true, skillId, resources });
});

// POST /api/skills/concrete-roadmap - Generate a concrete 90-day roadmap with real resources
router.post("/concrete-roadmap", (req, res) => {
  try {
    const { careerId, userSkills = [], weeklyHours = 10 } = req.body;
    if (!careerId) {
      return res.status(400).json({ error: "careerId is required" });
    }

    const career = careersData.careers.find(c => c.id === careerId);
    if (!career) {
      return res.status(404).json({ error: "Career not found" });
    }

    const requiredSkills = career.requiredSkills || [];
    const userSkillSet = new Set((userSkills || []).map(s => s.toLowerCase()));
    const matchedSkills = requiredSkills.filter(s => userSkillSet.has(s));
    const missingSkills = requiredSkills.filter(s => !userSkillSet.has(s));

    // Prioritize missing skills first, then matched skills for deepening
    const orderedSkills = [...missingSkills, ...matchedSkills];

    // Helper: ensure every resource has a usable URL
    function ensureUrl(resource, skillLabel) {
      if (!resource) return resource;
      if (!resource.url || resource.url.trim() === '') {
        resource = { ...resource, url: `https://www.google.com/search?q=${encodeURIComponent('learn ' + skillLabel + ' ' + (resource.title || ''))}` };
      }
      return resource;
    }

    // Build 12 weeks of concrete tasks
    const weeks = [];
    for (let w = 0; w < 12; w++) {
      const month = Math.floor(w / 4); // 0, 1, 2
      const weekInMonth = w % 4;
      
      // Rotate through skills
      const primarySkillIdx = w % orderedSkills.length;
      const primarySkill = orderedSkills[primarySkillIdx];
      const skillData = learningResources.skillResources[primarySkill] 
        || (learningResources.additionalSkills && learningResources.additionalSkills[primarySkill]) 
        || learningResources.defaultResources;
      
      const isMissing = missingSkills.includes(primarySkill);
      const phase = month === 0 ? 'foundation' : month === 1 ? 'practice' : 'project';

      const tasks = [];
      const skillLabel = (skillData.label || primarySkill).replace(/-/g, ' ');

      // Theory / Learning task
      if (phase === 'foundation' || weekInMonth < 2) {
        const resourcePool = month === 0 ? (skillData.beginnerResources || []) : (skillData.intermediateResources || []);
        const resource = resourcePool[weekInMonth % resourcePool.length] || resourcePool[0];
        const safeResource = ensureUrl(resource, skillLabel);
        tasks.push({
          id: `w${w}-learn`,
          title: `Learn: ${skillLabel} — ${safeResource ? safeResource.title : 'core concepts'}`,
          type: 'learn',
          estimatedHours: Math.min(Math.round(weeklyHours * 0.3), safeResource?.hours || 3),
          resource: safeResource || null,
          done: false
        });
      }

      // Practice task
      const exerciseIdx = w % (skillData.exercises || []).length;
      const exercise = (skillData.exercises || [])[exerciseIdx];
      if (exercise) {
        tasks.push({
          id: `w${w}-practice`,
          title: `Practice: ${exercise}`,
          type: 'practice',
          estimatedHours: Math.round(weeklyHours * 0.3),
          done: false
        });
      }

      // Build / Project task
      if (phase === 'project' || weekInMonth >= 2) {
        const projectPool = skillData.projectIdeas || [];
        const project = projectPool[month % projectPool.length] || projectPool[0];
        tasks.push({
          id: `w${w}-build`,
          title: `Build: ${project ? project.title + ' — ' + project.description : 'Apply ' + skillLabel + ' to a mini-project'}`,
          type: 'build',
          estimatedHours: Math.round(weeklyHours * 0.3),
          project: project || null,
          done: false
        });
      }

      // Milestone task (reflection + checkpoint)
      const milestoneIdx = weekInMonth % (skillData.weeklyMilestones || []).length;
      const milestone = (skillData.weeklyMilestones || [])[milestoneIdx];
      tasks.push({
        id: `w${w}-milestone`,
        title: `Milestone: ${milestone || 'Review progress and adjust plan'}`,
        type: 'milestone',
        estimatedHours: Math.round(weeklyHours * 0.1),
        done: false
      });

      weeks.push({
        week: w + 1,
        month: month + 1,
        focusSkill: primarySkill,
        focusSkillLabel: skillLabel,
        isMissing,
        phase,
        tasks,
        totalHours: weeklyHours,
        tip: getTip(phase, weekInMonth, isMissing, skillLabel)
      });
    }

    // Build month summaries
    const months = [0, 1, 2].map(m => {
      const monthWeeks = weeks.filter(w => w.month === m + 1);
      const focusSkills = [...new Set(monthWeeks.map(w => w.focusSkillLabel))];
      return {
        month: m + 1,
        title: m === 0 ? 'Foundation' : m === 1 ? 'Practice & Deepen' : 'Build & Apply',
        focus: focusSkills.join(', '),
        phase: m === 0 ? 'foundation' : m === 1 ? 'practice' : 'project',
        weeks: monthWeeks
      };
    });

    // Milestones
    const milestones = [
      { week: 4, title: 'Foundation Complete', description: `You should have a working knowledge of: ${missingSkills.slice(0, 3).map(s => s.replace(/-/g, ' ')).join(', ')}` },
      { week: 8, title: 'Portfolio Piece #1', description: 'Complete your first project that demonstrates new skills' },
      { week: 12, title: 'Career-Ready', description: `Present your portfolio, update your resume, and start exploring ${career.title} opportunities` }
    ];

    // Aggregate top recommended resources (deduplicated, most relevant first)
    const seenUrls = new Set();
    const topResources = [];
    for (const skill of orderedSkills) {
      const sd = learningResources.skillResources[skill] 
        || (learningResources.additionalSkills && learningResources.additionalSkills[skill])
        || learningResources.defaultResources;
      const label = (sd.label || skill).replace(/-/g, ' ');
      const allRes = [...(sd.beginnerResources || []), ...(sd.intermediateResources || [])];
      for (const r of allRes) {
        const safeR = ensureUrl({ ...r }, label);
        if (safeR && safeR.url && !seenUrls.has(safeR.url)) {
          seenUrls.add(safeR.url);
          topResources.push({ ...safeR, skill: label, skillId: skill, isFree: safeR.free === true });
          if (topResources.length >= 12) break;
        }
      }
      if (topResources.length >= 12) break;
    }

    return res.json({
      success: true,
      roadmap: {
        careerId,
        careerTitle: career.title,
        category: career.category,
        matchedSkills,
        missingSkills,
        weeklyHours,
        months,
        milestones,
        topResources,
        totalWeeks: 12,
        careerContext: {
          title: career.title,
          description: career.description,
          dayInLife: career.dayInLife,
          salaryRange: career.salaryRange,
          growthOutlook: career.growthOutlook,
          whyNonObvious: career.whyNonObvious
        }
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to generate roadmap" });
  }
});

function getTip(phase, weekInMonth, isMissing, skillLabel) {
  if (phase === 'foundation' && isMissing) {
    return `${skillLabel} is new for you — focus on understanding the "why" before the "how". Don't rush.`;
  }
  if (phase === 'foundation' && !isMissing) {
    return `You already know ${skillLabel} — use this week to go deeper and fill any gaps.`;
  }
  if (phase === 'practice') {
    return `This is your practice phase. Aim for hands-on exercises over passive learning. Mistakes are progress.`;
  }
  if (phase === 'project' && weekInMonth < 2) {
    return `Start building something real. Even a simple project teaches more than hours of tutorials.`;
  }
  return `You're in the home stretch. Focus on creating portfolio-worthy work you can show to others.`;
}

module.exports = router;
