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

    // Guard against empty skills
    if (orderedSkills.length === 0) {
      return res.status(400).json({ error: 'This career has no required skills defined.' });
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
      const skillLabel = formatSkillLabel(skillData.label || primarySkill);

      // Theory / Learning task
      if (phase === 'foundation' || weekInMonth < 2) {
        const resourcePool = month === 0 ? (skillData.beginnerResources || []) : (skillData.intermediateResources || []);
        // Use w-based index to avoid repeating same resource across rotations
        const resIdx = resourcePool.length > 0 ? Math.floor(w / orderedSkills.length) % resourcePool.length : 0;
        const resource = resourcePool.length > 0 ? resourcePool[resIdx] : null;
        const safeResource = ensureUrl(resource, skillLabel);
        const phaseVerb = month === 0 ? 'Learn' : 'Deepen';
        tasks.push({
          id: `w${w}-learn`,
          title: `${phaseVerb}: ${skillLabel} — ${safeResource ? safeResource.title : 'core concepts'}`,
          type: 'learn',
          estimatedHours: Math.min(Math.round(weeklyHours * 0.3), safeResource?.hours || 3),
          resource: safeResource || null,
          done: false
        });
      }

      // Practice task
      const exercises = skillData.exercises || [];
      // Avoid repeating same exercise: use combined w + skill index
      const exerciseIdx = exercises.length > 0 ? (Math.floor(w / orderedSkills.length) + weekInMonth) % exercises.length : 0;
      const exercise = exercises.length > 0 ? exercises[exerciseIdx] : null;
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
        const projIdx = projectPool.length > 0 ? (month + Math.floor(w / orderedSkills.length)) % projectPool.length : 0;
        const project = projectPool[projIdx] || projectPool[0];
        const buildVerb = phase === 'project' ? 'Build' : 'Apply';
        tasks.push({
          id: `w${w}-build`,
          title: `${buildVerb}: ${project ? project.title : 'Apply ' + skillLabel + ' to a mini-project'}`,
          type: 'build',
          estimatedHours: Math.round(weeklyHours * 0.3),
          project: project || null,
          done: false
        });
      }

      // Milestone task (reflection + checkpoint)
      const milestoneArr = skillData.weeklyMilestones || [];
      const milestoneIdx = milestoneArr.length > 0 ? weekInMonth % milestoneArr.length : 0;
      const milestone = milestoneArr[milestoneIdx];
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
      const phaseDescriptions = {
        0: 'Learn the fundamentals and set up your environment',
        1: 'Apply your knowledge through hands-on practice and exercises',
        2: 'Build portfolio projects and prepare for real-world applications'
      };
      return {
        month: m + 1,
        title: m === 0 ? 'Foundation' : m === 1 ? 'Practice & Deepen' : 'Build & Apply',
        focus: focusSkills.join(', '),
        phase: m === 0 ? 'foundation' : m === 1 ? 'practice' : 'project',
        description: phaseDescriptions[m],
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
  const tips = {
    foundation: {
      missing: [
        `${skillLabel} is new for you — focus on understanding the "why" before the "how". Don't rush.`,
        `Take time to absorb ${skillLabel} fundamentals. Active note-taking boosts retention by 30%.`,
        `Compare ${skillLabel} concepts to skills you already know — analogies accelerate learning.`,
        `Set up your ${skillLabel} environment or tools early. A smooth setup prevents frustration later.`
      ],
      known: [
        `You already know ${skillLabel} — use this week to go deeper and fill gaps you didn't know existed.`,
        `Try teaching ${skillLabel} concepts to someone else (even a rubber duck). Teaching reveals blind spots.`,
        `Explore advanced ${skillLabel} techniques you haven't tried. Push past your comfort zone.`,
        `Review best practices and industry standards for ${skillLabel}. What have you been doing differently?`
      ]
    },
    practice: [
      `Hands-on practice with ${skillLabel} is key this week. Aim for typing code/doing work over watching videos.`,
      `Mistakes are progress. If your ${skillLabel} exercises feel easy, increase the difficulty.`,
      `Try to complete exercises without looking at solutions first. Struggling builds stronger neural pathways.`,
      `Pair ${skillLabel} practice with a timer — 25 min focused work, 5 min break (Pomodoro technique).`
    ],
    project: [
      `Start building something real with ${skillLabel}. Even a simple project teaches more than hours of tutorials.`,
      `Focus on creating portfolio-worthy ${skillLabel} work you can showcase to potential employers.`,
      `Document your ${skillLabel} project process — decision logs and READMEs impress hiring managers.`,
      `You're in the home stretch. Polish your ${skillLabel} project and prepare to present it.`
    ]
  };

  if (phase === 'foundation') {
    const pool = isMissing ? tips.foundation.missing : tips.foundation.known;
    return pool[weekInMonth % pool.length];
  }
  if (phase === 'practice') {
    return tips.practice[weekInMonth % tips.practice.length];
  }
  return tips.project[weekInMonth % tips.project.length];
}

function formatSkillLabel(raw) {
  return raw
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\bCi Cd\b/i, 'CI/CD')
    .replace(/\bUi\b/g, 'UI')
    .replace(/\bUx\b/g, 'UX')
    .replace(/\bAi\b/g, 'AI')
    .replace(/\bApi\b/g, 'API')
    .replace(/\bDevops\b/g, 'DevOps')
    .replace(/\bGis\b/g, 'GIS');
}

module.exports = router;
