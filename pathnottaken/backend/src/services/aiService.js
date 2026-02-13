const careersData = require("../data/careers.json");

/**
 * Built-in recommendation engine that scores careers based on skill/interest overlap.
 * Works without any external API.
 */
function getBuiltInRecommendations(skills, interests) {
  const careers = careersData.careers;

  const scored = careers.map((career) => {
    // Skill match scoring
    const matchedSkills = career.requiredSkills.filter((s) =>
      skills.includes(s)
    );
    const skillScore = career.requiredSkills.length
      ? matchedSkills.length / career.requiredSkills.length
      : 0;

    // Interest match scoring
    const matchedInterests = career.relatedInterests.filter((i) =>
      interests.includes(i)
    );
    const interestScore = career.relatedInterests.length
      ? matchedInterests.length / career.relatedInterests.length
      : 0;

    // Combined score (skills weighted slightly more)
    const totalScore = skillScore * 0.6 + interestScore * 0.4;

    // Skills the user still needs
    const missingSkills = career.requiredSkills.filter(
      (s) => !skills.includes(s)
    );

    // Generate match explanation
    const explanation = generateExplanation(
      career,
      matchedSkills,
      matchedInterests,
      missingSkills
    );

    return {
      ...career,
      matchScore: Math.round(totalScore * 100),
      matchedSkills,
      matchedInterests,
      missingSkills,
      explanation,
    };
  });

  // Sort by score and return top results
  return scored
    .filter((c) => c.matchScore > 15)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 6);
}

function generateExplanation(
  career,
  matchedSkills,
  matchedInterests,
  missingSkills
) {
  const parts = [];

  if (matchedSkills.length > 0) {
    const skillLabels = matchedSkills
      .map((s) => s.replace(/-/g, " "))
      .join(", ");
    parts.push(
      `Your skills in ${skillLabels} directly apply to this role.`
    );
  }

  if (matchedInterests.length > 0) {
    const interestLabels = matchedInterests
      .map((i) => i.replace(/-/g, " "))
      .join(", ");
    parts.push(
      `Your interest in ${interestLabels} aligns well with the day-to-day work.`
    );
  }

  if (career.whyNonObvious) {
    parts.push(career.whyNonObvious);
  }

  if (missingSkills.length > 0 && missingSkills.length <= 3) {
    const missing = missingSkills.map((s) => s.replace(/-/g, " ")).join(", ");
    parts.push(
      `To strengthen your candidacy, consider developing: ${missing}.`
    );
  }

  return parts.join(" ");
}

/**
 * AI-powered recommendations using OpenAI (when API key is available).
 */
async function getAIRecommendations(skills, interests, background) {
  const OpenAI = require("openai");

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const skillLabels = skills.map((s) => s.replace(/-/g, " ")).join(", ");
  const interestLabels = interests.map((i) => i.replace(/-/g, " ")).join(", ");

  const prompt = `You are a career exploration advisor specializing in non-obvious, alternative career paths. A user has the following profile:

Skills: ${skillLabels}
Interests: ${interestLabels}
${background ? `Background: ${background}` : ""}

Recommend 5 non-obvious, alternative career paths that most people wouldn't immediately think of. For each career, provide:
1. Career title
2. Why it's a good fit based on their skills and interests
3. What makes this a "path not taken" (why it's non-obvious)
4. Salary range (USD)
5. Growth outlook (Low/Moderate/High/Very High)
6. 2-3 skills they'd need to develop
7. A brief "day in the life" description

Focus on careers that are:
- Emerging or under-recognized
- At the intersection of multiple disciplines
- Leveraging transferable skills in unexpected ways

Respond in valid JSON format as an array of objects with keys: title, category, explanation, whyNonObvious, salaryRange (object with min, max), growthOutlook, missingSkills (array), dayInLife, matchScore (1-100 based on fit).`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.8,
  });

  const content = response.choices[0].message.content;
  const parsed = JSON.parse(content);

  // Normalize the response
  const recommendations = (parsed.careers || parsed.recommendations || []).map(
    (career, index) => ({
      id: `ai-${index}`,
      title: career.title,
      category: career.category || "AI Recommended",
      description: career.explanation || career.description,
      dayInLife: career.dayInLife || career.day_in_life || "",
      salaryRange: career.salaryRange || career.salary_range || { min: 0, max: 0 },
      growthOutlook: career.growthOutlook || career.growth_outlook || "Unknown",
      matchScore: career.matchScore || career.match_score || 70,
      matchedSkills: skills,
      matchedInterests: interests,
      missingSkills: career.missingSkills || career.missing_skills || [],
      explanation: career.explanation || "",
      whyNonObvious: career.whyNonObvious || career.why_non_obvious || "",
      nonObvious: true,
      source: "ai",
    })
  );

  return recommendations;
}

/**
 * Main recommendation function — tries AI first, falls back to built-in.
 */
async function getRecommendations(skills, interests, background) {
  // Try AI recommendations if API key is set
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 10) {
    try {
      console.log("Using AI-powered recommendations...");
      const aiResults = await getAIRecommendations(
        skills,
        interests,
        background
      );
      if (aiResults.length > 0) {
        return { source: "ai", recommendations: aiResults };
      }
    } catch (error) {
      console.error("AI recommendation failed, falling back to built-in:", error.message);
    }
  }

  // Fall back to built-in recommendations
  console.log("Using built-in recommendation engine...");
  const builtInResults = getBuiltInRecommendations(skills, interests);
  return { source: "built-in", recommendations: builtInResults };
}

module.exports = { getRecommendations, getBuiltInRecommendations };
