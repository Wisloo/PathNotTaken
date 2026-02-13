const careersData = require("../data/careers.json");

// Build a quick lookup of skill labels -> id from the careers dataset (server-side synonym base)
const skillLabelToId = {};
careersData.skillCategories.forEach((cat) => {
  cat.skills.forEach((s) => {
    skillLabelToId[s.label.toLowerCase()] = s.id;
    skillLabelToId[s.id.toLowerCase()] = s.id;
  });
});

// Small server-side synonym map (mirrors and expands client synonyms).
const SERVER_SYNONYMS = {
  python: ["programming", "data-analysis", "machine-learning"],
  javascript: ["programming", "web-development"],
  typescript: ["programming", "web-development"],
  java: ["programming"],
  "c++": ["programming"],
  sql: ["programming", "data-analysis"],
  react: ["programming", "ui-design"],
  excel: ["data-analysis"],
  tableau: ["data-analysis"],
  r: ["data-analysis"],
  matlab: ["data-analysis"],
  tensorflow: ["machine-learning"],
  pytorch: ["machine-learning"],
  nlp: ["machine-learning"],
  figma: ["design"],
  "ux design": ["design"],
  "public speaking": ["public-speaking"],
};

// In-memory cache for career embeddings (computed if OpenAI key available)
let careerEmbeddings = null; // [{ id, vector, career }]

// Basic fuzzy scoring utility used server-side (token-overlap + prefix/includes)
function fuzzyScore(a, b) {
  const q = (a || "").toLowerCase().trim();
  const t = (b || "").toLowerCase();
  if (q === t) return 100;
  if (t.startsWith(q)) return 80;
  if (t.includes(q)) return 60;
  const qTokens = q.split(/[^a-z0-9]+/).filter(Boolean);
  const tTokens = t.split(/[^a-z0-9]+/).filter(Boolean);
  const overlap = qTokens.filter((x) => tTokens.includes(x)).length;
  if (overlap > 0) return 50 + overlap * 5;
  const lenDiff = Math.abs(q.length - t.length);
  return Math.max(0, 30 - lenDiff);
}

// Normalize a user-provided skill identifier or free-text into one or more canonical skill IDs
function normalizeSkillInput(input) {
  if (!input) return [];
  const key = input.toLowerCase().trim();

  // direct id match
  if (Object.values(skillLabelToId).includes(key)) return [key];

  // label -> id map
  if (skillLabelToId[key]) return [skillLabelToId[key]];

  // server synonyms
  if (SERVER_SYNONYMS[key]) return SERVER_SYNONYMS[key];

  // fuzzy match against labels in skillLabelToId
  const labelScores = Object.keys(skillLabelToId)
    .map((label) => ({ id: skillLabelToId[label], label, score: fuzzyScore(key, label) }))
    .filter((r) => r.score > 50)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.id);

  if (labelScores.length > 0) return Array.from(new Set(labelScores));

  // last resort: return the hyphenated version so downstream can still handle it
  return [key.replace(/[^a-z0-9]+/g, "-")];
}

/**
 * Built-in recommendation engine that scores careers based on skill/interest overlap.
 * Works without any external API. Performs server-side normalization/fuzzying.
 */
function getBuiltInRecommendations(skills, interests) {
  const careers = careersData.careers;

  // expand any free-text or unknown skills using server-side normalization
  const normalizedSkills = skills.flatMap((s) => normalizeSkillInput(s));

  const scored = careers.map((career) => {
    // Skill match scoring (use normalized skills)
    const matchedSkills = career.requiredSkills.filter((s) => normalizedSkills.includes(s));
    const skillScore = career.requiredSkills.length
      ? matchedSkills.length / career.requiredSkills.length
      : 0;

    // Interest match scoring
    const matchedInterests = career.relatedInterests.filter((i) => interests.includes(i));
    const interestScore = career.relatedInterests.length
      ? matchedInterests.length / career.relatedInterests.length
      : 0;

    // Combined score (skills weighted slightly more)
    const totalScore = skillScore * 0.6 + interestScore * 0.4;

    // Skills the user still needs
    const missingSkills = career.requiredSkills.filter((s) => !normalizedSkills.includes(s));

    // Generate match explanation
    const explanation = generateExplanation(career, matchedSkills, matchedInterests, missingSkills);

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
  // include slightly lower-scoring but still relevant matches (>= 10)
  return scored
    .filter((c) => c.matchScore >= 10)
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
 * --- Embeddings / semantic matching helpers ---
 */
function dot(a, b) {
  return a.reduce((sum, v, i) => sum + v * (b[i] ?? 0), 0);
}
function norm(a) {
  return Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
}
function cosineSim(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  const d = dot(a, b);
  const n = norm(a) * norm(b);
  return n === 0 ? 0 : d / n;
}

async function ensureCareerEmbeddings(openai) {
  if (careerEmbeddings) return careerEmbeddings;
  // create embedding inputs for each career
  const inputs = careersData.careers.map((c) => `${c.title} — ${c.description} Skills: ${c.requiredSkills.join(" ")} Interests: ${c.relatedInterests.join(" ")}`);

  // request embeddings in batches (small dataset so single call ok)
  const res = await openai.embeddings.create({ model: "text-embedding-3-small", input: inputs });
  careerEmbeddings = res.data.map((item, i) => ({ id: careersData.careers[i].id, vector: item.embedding, career: careersData.careers[i] }));
  return careerEmbeddings;
}

async function getSemanticRecommendations(openai, skills, interests, background) {
  // build user text
  const userText = [`Skills: ${skills.join(" ")}`, `Interests: ${interests.join(" ")}`, background || ""].join(" \n");
  const userEmb = await openai.embeddings.create({ model: "text-embedding-3-small", input: userText });
  const userVec = userEmb.data[0].embedding;

  await ensureCareerEmbeddings(openai);

  const scored = careerEmbeddings.map((c) => ({ career: c.career, id: c.id, score: cosineSim(userVec, c.vector) }));
  scored.sort((a, b) => b.score - a.score);

  // Map top semantic matches into recommendation objects (scale score to 0-100)
  return scored.slice(0, 8).map((s, idx) => ({
    ...s.career,
    id: `sem-${s.id}`,
    source: "semantic",
    matchScore: Math.round(Math.min(100, s.score * 100)),
    explanation: `Semantic match (${Math.round(s.score * 100)}%) — based on description, skills and interests.`,
  }));
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
  // 1) Always try the built-in engine first (fast + deterministic)
  console.log("Running built-in recommendation engine...");
  const builtInResults = getBuiltInRecommendations(skills, interests);

  // 2) If OpenAI is available, compute semantic embeddings and AI recommendations, then merge
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 10) {
    const OpenAI = require("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // 2a) Try the LLM-based creative recommendations (best-effort)
    let aiResults = [];
    try {
      console.log("Requesting LLM-powered recommendations...");
      aiResults = await getAIRecommendations(skills, interests, background);
    } catch (err) {
      console.warn("LLM recommendations failed:", err.message);
    }

    // 2b) Semantic (embedding) matches — useful as a robust fallback and to surface related items
    let semanticResults = [];
    try {
      semanticResults = await getSemanticRecommendations(openai, skills, interests, background);
    } catch (err) {
      console.warn("Semantic recommendation (embeddings) failed:", err.message);
    }

    // 2c) Merge results: prefer AI > built-in > semantic; dedupe by career id
    const merged = [];
    const seen = new Set();

    const pushIfNew = (item) => {
      const id = item.id || item.title;
      if (!seen.has(id)) {
        seen.add(id);
        merged.push(item);
      }
    };

    // Add LLM results first (if any)
    aiResults.forEach(pushIfNew);
    // Then built-in
    builtInResults.forEach(pushIfNew);
    // Then semantic
    semanticResults.forEach(pushIfNew);

    return { source: aiResults.length > 0 ? "ai" : "semantic", recommendations: merged.slice(0, 8) };
  }

  // No OpenAI: return built-in
  return { source: "built-in", recommendations: builtInResults };
}

module.exports = { getRecommendations, getBuiltInRecommendations };
