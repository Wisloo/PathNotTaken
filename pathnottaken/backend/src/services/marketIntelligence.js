/**
 * Market Intelligence Service - Real-time job market insights
 * UNIQUE FEATURES:
 * - Skill demand tracking (trending up/down)
 * - Salary premium calculations
 * - Skill obsolescence warnings
 * - Regional market differences
 * - Career transition difficulty scores
 */

const db = require("../db");

// Simulated market data (in production, would integrate with LinkedIn, Indeed, Glassdoor APIs)
const SKILL_MARKET_DATA = {
  "machine-learning": {
    demandTrend: "rising-fast", // rising-fast, rising, stable, declining
    trendPercentage: 245, // % change over last year
    avgSalaryPremium: 25000, // additional salary vs baseline
    jobPostings: 45230,
    growthRate: 28.5, // annual % growth
    obsolescenceRisk: "low",
    hotRegions: ["San Francisco", "New York", "Seattle", "Austin"],
    avgTimeToHire: 45 // days
  },
  "ai": {
    demandTrend: "rising-fast",
    trendPercentage: 312,
    avgSalaryPremium: 30000,
    jobPostings: 38920,
    growthRate: 35.2,
    obsolescenceRisk: "low",
    hotRegions: ["San Francisco", "Boston", "Seattle"],
    avgTimeToHire: 38
  },
  "blockchain": {
    demandTrend: "rising",
    trendPercentage: 85,
    avgSalaryPremium: 15000,
    jobPostings: 8430,
    growthRate: 12.3,
    obsolescenceRisk: "medium",
    hotRegions: ["San Francisco", "Miami", "Austin"],
    avgTimeToHire: 52
  },
  "data-analysis": {
    demandTrend: "stable",
    trendPercentage: 15,
    avgSalaryPremium: 12000,
    jobPostings: 78430,
    growthRate: 8.5,
    obsolescenceRisk: "low",
    hotRegions: ["New York", "San Francisco", "Chicago"],
    avgTimeToHire: 35
  },
  "programming": {
    demandTrend: "stable",
    trendPercentage: 8,
    avgSalaryPremium: 18000,
    jobPostings: 125840,
    growthRate: 5.2,
    obsolescenceRisk: "low",
    hotRegions: ["San Francisco", "Seattle", "Austin", "New York"],
    avgTimeToHire: 42
  },
  "cybersecurity": {
    demandTrend: "rising",
    trendPercentage: 95,
    avgSalaryPremium: 22000,
    jobPostings: 34210,
    growthRate: 15.8,
    obsolescenceRisk: "low",
    hotRegions: ["Washington DC", "San Francisco", "New York"],
    avgTimeToHire: 48
  },
  "flash": {
    demandTrend: "declining",
    trendPercentage: -85,
    avgSalaryPremium: -5000,
    jobPostings: 120,
    growthRate: -42.5,
    obsolescenceRisk: "critical",
    hotRegions: [],
    avgTimeToHire: 180
  },
  "jquery": {
    demandTrend: "declining",
    trendPercentage: -35,
    avgSalaryPremium: 0,
    jobPostings: 8420,
    growthRate: -12.3,
    obsolescenceRisk: "high",
    hotRegions: ["San Francisco", "New York"],
    avgTimeToHire: 55
  }
};

// Career transition difficulty matrix (simulated)
const CAREER_TRANSITIONS = {
  "software-engineer": {
    "data-scientist": { difficulty: "moderate", avgMonths: 6, successRate: 65, topSkillsNeeded: ["statistics", "machine-learning", "python"] },
    "product-manager": { difficulty: "moderate", avgMonths: 4, successRate: 55, topSkillsNeeded: ["product-strategy", "communication", "business"] },
    "ux-researcher": { difficulty: "hard", avgMonths: 9, successRate: 35, topSkillsNeeded: ["research", "empathy", "psychology"] }
  },
  "marketing-specialist": {
    "ux-researcher": { difficulty: "easy", avgMonths: 4, successRate: 70, topSkillsNeeded: ["research", "analytics", "user-testing"] },
    "data-analyst": { difficulty: "moderate", avgMonths: 6, successRate: 55, topSkillsNeeded: ["sql", "statistics", "data-visualization"] },
    "product-manager": { difficulty: "easy", avgMonths: 3, successRate: 75, topSkillsNeeded: ["product-strategy", "analytics", "communication"] }
  },
  "teacher": {
    "ux-researcher": { difficulty: "moderate", avgMonths: 6, successRate: 60, topSkillsNeeded: ["research", "empathy", "data-analysis"] },
    "technical-writer": { difficulty: "easy", avgMonths: 3, successRate: 80, topSkillsNeeded: ["writing", "technical-literacy", "communication"] },
    "developer-advocate": { difficulty: "moderate", avgMonths: 8, successRate: 45, topSkillsNeeded: ["programming", "public-speaking", "teaching"] }
  }
};

class MarketIntelligenceService {
  /**
   * Get market data for a specific skill
   */
  static getSkillMarketData(skillId) {
    return SKILL_MARKET_DATA[skillId] || {
      demandTrend: "stable",
      trendPercentage: 0,
      avgSalaryPremium: 0,
      jobPostings: 1000,
      growthRate: 0,
      obsolescenceRisk: "low",
      hotRegions: [],
      avgTimeToHire: 60
    };
  }

  /**
   * Get market insights for a career path
   */
  static getCareerMarketInsights(career) {
    const skills = career.requiredSkills || [];
    const skillsData = skills.map(s => ({
      id: s,
      ...this.getSkillMarketData(s)
    }));

    // Calculate aggregate metrics
    const avgGrowthRate = skillsData.reduce((sum, s) => sum + s.growthRate, 0) / skillsData.length || 0;
    const totalSalaryPremium = skillsData.reduce((sum, s) => sum + s.avgSalaryPremium, 0);
    const highDemandSkills = skillsData.filter(s => s.demandTrend.includes("rising"));
    const obsoleteSkills = skillsData.filter(s => s.obsolescenceRisk === "high" || s.obsolescenceRisk === "critical");

    // Market strength score (0-100)
    const marketStrength = Math.min(100, Math.max(0,
      50 + (avgGrowthRate * 2) + (highDemandSkills.length * 10) - (obsoleteSkills.length * 15)
    ));

    return {
      marketStrength: Math.round(marketStrength),
      avgGrowthRate: Math.round(avgGrowthRate * 10) / 10,
      salaryPremium: totalSalaryPremium,
      highDemandSkills: highDemandSkills.map(s => s.id),
      obsoleteSkills: obsoleteSkills.map(s => s.id),
      skillsBreakdown: skillsData,
      recommendation: this.getMarketRecommendation(marketStrength, avgGrowthRate, obsoleteSkills.length)
    };
  }

  /**
   * Generate market-based recommendation
   */
  static getMarketRecommendation(strength, growthRate, obsoleteCount) {
    if (strength >= 80) {
      return {
        level: "excellent",
        message: "🚀 Excellent market opportunity! High demand and strong growth.",
        color: "green"
      };
    } else if (strength >= 60) {
      return {
        level: "good",
        message: "✅ Good market prospects with steady demand.",
        color: "blue"
      };
    } else if (obsoleteCount > 2) {
      return {
        level: "caution",
        message: "⚠️ Caution: Some required skills are declining in demand.",
        color: "orange"
      };
    } else {
      return {
        level: "moderate",
        message: "→ Moderate opportunity. Consider complementary skills.",
        color: "yellow"
      };
    }
  }

  /**
   * Get career transition analysis
   */
  static getTransitionAnalysis(fromCareerId, toCareerId) {
    const transitionData = CAREER_TRANSITIONS[fromCareerId]?.[toCareerId];
    
    if (!transitionData) {
      // Calculate generic transition based on skill overlap
      return {
        difficulty: "unknown",
        avgMonths: 12,
        successRate: 50,
        topSkillsNeeded: [],
        isCommon: false
      };
    }

    return {
      ...transitionData,
      isCommon: true,
      estimatedCost: this.estimateTransitionCost(transitionData.avgMonths),
      timeline: this.generateTransitionTimeline(transitionData)
    };
  }

  /**
   * Estimate cost of career transition
   */
  static estimateTransitionCost(months) {
    // Assumes bootcamp/courses average $500/month
    const educationCost = months * 500;
    // Potential income loss if leaving job early
    const opportunityCost = months * 4000; // rough estimate
    
    return {
      education: educationCost,
      opportunityCost: opportunityCost,
      total: educationCost + opportunityCost
    };
  }

  /**
   * Generate transition timeline
   */
  static generateTransitionTimeline(transitionData) {
    const months = transitionData.avgMonths;
    const phases = [];

    // Phase 1: Foundation (25% of time)
    phases.push({
      phase: "Foundation",
      duration: Math.ceil(months * 0.25),
      focus: "Learn core concepts and fundamentals",
      milestones: ["Complete online courses", "Build basic projects"]
    });

    // Phase 2: Skill Building (40% of time)
    phases.push({
      phase: "Skill Building",
      duration: Math.ceil(months * 0.4),
      focus: "Deep dive into required skills",
      milestones: ["Work on complex projects", "Contribute to open source", "Get certifications"]
    });

    // Phase 3: Portfolio & Network (20% of time)
    phases.push({
      phase: "Portfolio & Network",
      duration: Math.ceil(months * 0.2),
      focus: "Build portfolio and connections",
      milestones: ["Complete 3-5 portfolio projects", "Attend industry events", "Connect with professionals"]
    });

    // Phase 4: Job Search (15% of time)
    phases.push({
      phase: "Job Search",
      duration: Math.ceil(months * 0.15),
      focus: "Apply and interview",
      milestones: ["Tailor resume", "Practice interviews", "Apply to roles"]
    });

    return phases;
  }

  /**
   * Get trending skills (across all careers)
   */
  static getTrendingSkills(limit = 10) {
    const skills = Object.entries(SKILL_MARKET_DATA)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.trendPercentage - a.trendPercentage)
      .slice(0, limit);

    return skills;
  }

  /**
   * Get skills at risk (declining demand)
   */
  static getSkillsAtRisk() {
    return Object.entries(SKILL_MARKET_DATA)
      .filter(([_, data]) => data.demandTrend === "declining")
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => a.trendPercentage - b.trendPercentage);
  }

  /**
   * Calculate skill investment ROI
   */
  static calculateSkillROI(skillId, hoursToLearn = 100) {
    const marketData = this.getSkillMarketData(skillId);
    const avgHourlyRate = 50; // baseline developer rate
    const learningCost = hoursToLearn * avgHourlyRate; // opportunity cost
    const annualPremium = marketData.avgSalaryPremium;
    
    // ROI = (Annual Premium / Learning Cost) * 100
    const roi = learningCost > 0 ? (annualPremium / learningCost) * 100 : 0;
    
    // Payback period in months
    const monthlyPremium = annualPremium / 12;
    const paybackMonths = monthlyPremium > 0 ? learningCost / monthlyPremium : 999;

    return {
      roi: Math.round(roi),
      paybackMonths: Math.round(paybackMonths),
      learningCost,
      annualPremium,
      marketStrength: this.getSkillMarketStrength(marketData)
    };
  }

  /**
   * Get skill market strength score
   */
  static getSkillMarketStrength(marketData) {
    const factors = [
      marketData.trendPercentage > 50 ? 25 : marketData.trendPercentage > 0 ? 15 : 0,
      marketData.growthRate > 20 ? 25 : marketData.growthRate > 10 ? 15 : 5,
      marketData.obsolescenceRisk === "low" ? 25 : marketData.obsolescenceRisk === "medium" ? 15 : 0,
      Math.min(25, marketData.jobPostings / 1000)
    ];

    return Math.round(factors.reduce((a, b) => a + b, 0));
  }

  /**
   * Get personalized market insights for user
   */
  static async getPersonalizedInsights(userId, userSkills = [], targetCareer = null) {
    // Calculate what skills to prioritize based on market + user gap
    const insights = {
      skillsToLearn: [],
      skillsToAvoid: [],
      marketOpportunities: [],
      warnings: []
    };

    // Check if user has any declining skills
    const decliningSkills = userSkills.filter(s => {
      const data = this.getSkillMarketData(s);
      return data.demandTrend === "declining";
    });

    if (decliningSkills.length > 0) {
      insights.warnings.push({
        type: "obsolescence",
        message: `${decliningSkills.length} of your skills are declining in demand`,
        skills: decliningSkills
      });
    }

    // Recommend high-ROI skills
    const trending = this.getTrendingSkills(5);
    const highROI = trending
      .map(s => ({ ...s, roi: this.calculateSkillROI(s.id) }))
      .filter(s => !userSkills.includes(s.id))
      .sort((a, b) => b.roi.roi - a.roi.roi)
      .slice(0, 3);

    insights.skillsToLearn = highROI;

    return insights;
  }
}

module.exports = MarketIntelligenceService;
