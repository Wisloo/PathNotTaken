const careersData = require("../data/careers.json");

// ─── AI Provider Detection ───
// Priority: OPENAI_API_KEY > HUGGINGFACE_API_KEY > rule-based fallback
const HF_TOKEN = process.env.HUGGINGFACE_API_KEY || '';
const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
const AI_PROVIDER =
  OPENAI_KEY.length > 10 ? 'openai' :
  HF_TOKEN.length > 5 ? 'huggingface' :
  'rule';

console.log(`[AI Provider] Using: ${AI_PROVIDER}${AI_PROVIDER === 'huggingface' ? ' (model: ' + (process.env.HF_MODEL || 'Qwen/Qwen2.5-72B-Instruct') + ')' : ''}`);

/**
 * Call Hugging Face Inference API (text-generation).
 * Works with any Inference-API-enabled model on the Hub.
 */
/** Helper: race a promise against a timeout (ms). */
function withTimeout(promise, ms, label = 'operation') {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

async function callHuggingFace(prompt, opts = {}) {
  const model = process.env.HF_MODEL || 'Qwen/Qwen2.5-72B-Instruct';
  const maxTokens = opts.maxTokens ?? 800;
  const temperature = opts.temperature ?? 0.7;
  const timeoutMs = opts.timeout ?? 10000; // 10 s default timeout

  const start = Date.now();

  const fetchPromise = fetch('https://router.huggingface.co/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'You are a career advisor API. Respond ONLY with valid JSON — no markdown fences, no commentary.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: maxTokens,
      temperature,
    }),
  });

  const res = await withTimeout(fetchPromise, timeoutMs, 'HuggingFace API');

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HuggingFace API error ${res.status}: ${body}`);
  }

  const payload = await res.json();
  console.log(`[HF] Response received in ${Date.now() - start}ms`);
  // OpenAI-compatible chat completions format
  if (payload.choices?.[0]?.message?.content) return payload.choices[0].message.content;
  if (Array.isArray(payload) && payload[0]?.generated_text) return payload[0].generated_text;
  return typeof payload === 'string' ? payload : JSON.stringify(payload);
}

/**
 * Extract JSON from an LLM response that may contain markdown fences or preamble text.
 */
function extractJSON(text) {
  // Try direct parse first
  try { return JSON.parse(text); } catch (_) {}
  // Try to extract from ```json ... ``` fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) try { return JSON.parse(fenceMatch[1].trim()); } catch (_) {}
  // Try to find first [ or { and parse from there
  const start = text.search(/[\[{]/);
  if (start >= 0) try { return JSON.parse(text.slice(start)); } catch (_) {}
  return null;
}

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
  "c#": ["programming"],
  "c-sharp": ["programming"],
  swift: ["programming"],
  kotlin: ["programming"],
  rust: ["programming"],
  go: ["programming"],
  ruby: ["programming"],
  php: ["programming", "web-development"],
  sql: ["programming", "data-analysis"],
  react: ["programming", "ui-design"],
  angular: ["programming", "web-development"],
  vue: ["programming", "web-development"],
  "node.js": ["programming", "web-development"],
  nodejs: ["programming", "web-development"],
  excel: ["data-analysis"],
  tableau: ["data-analysis"],
  "power bi": ["data-analysis"],
  powerbi: ["data-analysis"],
  r: ["data-analysis"],
  matlab: ["data-analysis"],
  spss: ["data-analysis"],
  statistics: ["data-analysis", "analytical-thinking"],
  tensorflow: ["machine-learning", "programming"],
  pytorch: ["machine-learning", "programming"],
  nlp: ["machine-learning"],
  "deep learning": ["machine-learning"],
  "neural networks": ["machine-learning"],
  figma: ["design", "ui-design"],
  sketch: ["design", "ui-design"],
  adobe: ["design", "creativity"],
  photoshop: ["design", "creativity"],
  illustrator: ["design", "creativity"],
  "ux design": ["design", "empathy", "research"],
  "ui design": ["design", "ui-design"],
  "user research": ["research", "empathy", "interviewing"],
  "usability testing": ["research", "empathy", "testing"],
  "public speaking": ["public-speaking", "communication"],
  presenting: ["public-speaking", "communication"],
  teaching: ["communication", "empathy", "mentoring"],
  tutoring: ["communication", "empathy"],
  coaching: ["communication", "empathy", "mentoring"],
  writing: ["communication", "content-creation"],
  blogging: ["communication", "content-creation"],
  copywriting: ["communication", "content-creation"],
  editing: ["communication", "attention-to-detail"],
  proofreading: ["communication", "attention-to-detail"],
  translation: ["languages", "communication", "cultural-awareness"],
  interpreting: ["languages", "communication"],
  bilingual: ["languages", "communication"],
  multilingual: ["languages", "cultural-awareness"],
  spanish: ["languages"],
  french: ["languages"],
  mandarin: ["languages"],
  german: ["languages"],
  japanese: ["languages"],
  korean: ["languages"],
  arabic: ["languages"],
  hindi: ["languages"],
  leadership: ["project-management", "communication"],
  management: ["project-management", "communication"],
  "project management": ["project-management"],
  agile: ["project-management"],
  scrum: ["project-management"],
  jira: ["project-management"],
  trello: ["project-management"],
  teamwork: ["collaboration", "communication"],
  collaboration: ["collaboration", "communication"],
  research: ["research", "analytical-thinking"],
  analysis: ["analytical-thinking", "data-analysis"],
  "critical thinking": ["analytical-thinking", "problem-solving"],
  "problem solving": ["problem-solving", "analytical-thinking"],
  debugging: ["problem-solving", "programming", "testing"],
  testing: ["testing", "attention-to-detail"],
  qa: ["testing", "attention-to-detail"],
  "quality assurance": ["testing", "attention-to-detail"],
  accessibility: ["accessibility", "empathy"],
  wcag: ["accessibility", "web-development"],
  "screen reader": ["accessibility"],
  aria: ["accessibility", "web-development"],
  seo: ["content-creation", "data-analysis"],
  marketing: ["content-creation", "communication"],
  psychology: ["psychology", "empathy", "understanding-people"],
  counseling: ["psychology", "empathy"],
  "data science": ["data-analysis", "machine-learning", "programming"],
  "machine learning": ["machine-learning", "programming"],
  ai: ["machine-learning", "programming"],
  "artificial intelligence": ["machine-learning", "programming"],
  html: ["web-development"],
  css: ["web-development", "design"],
  git: ["programming"],
  linux: ["programming"],
  docker: ["programming", "devops", "cloud-computing"],
  aws: ["cloud-computing", "devops"],
  cloud: ["cloud-computing"],
  gcp: ["cloud-computing", "devops"],
  azure: ["cloud-computing", "devops"],
  kubernetes: ["devops", "cloud-computing"],
  terraform: ["devops", "cloud-computing", "automation"],
  ansible: ["devops", "automation"],
  "ci/cd": ["devops", "automation"],
  jenkins: ["devops", "automation"],
  "github actions": ["devops", "automation"],
  cybersecurity: ["cybersecurity", "computer-networking"],
  "penetration testing": ["cybersecurity", "testing"],
  "ethical hacking": ["cybersecurity"],
  firewall: ["cybersecurity", "computer-networking"],
  encryption: ["cybersecurity"],
  "security+": ["cybersecurity"],
  comptia: ["cybersecurity"],
  splunk: ["cybersecurity", "data-analysis"],
  wireshark: ["cybersecurity", "computer-networking"],
  "supply chain": ["supply-chain", "project-management"],
  logistics: ["supply-chain", "organization"],
  inventory: ["supply-chain", "data-analysis"],
  forecasting: ["statistics", "data-analysis"],
  "demand planning": ["supply-chain", "statistics"],
  "six sigma": ["supply-chain", "problem-solving"],
  "sports analytics": ["data-analysis", "sports-science", "statistics"],
  sabermetrics: ["statistics", "sports-science"],
  "player evaluation": ["sports-science", "data-analysis"],
  "instructional design": ["education-theory", "design"],
  "curriculum design": ["education-theory", "teaching"],
  "e-learning": ["education-theory", "design"],
  "content strategy": ["content-strategy", "writing", "digital-marketing"],
  "content marketing": ["content-strategy", "digital-marketing"],
  "digital marketing": ["digital-marketing", "communication"],
  "social media": ["digital-marketing", "communication"],
  "google analytics": ["data-analysis", "digital-marketing"],
  networking: ["communication", "networking"],
  empathy: ["empathy", "understanding-people"],
  listening: ["empathy", "communication"],
  curiosity: ["research", "problem-solving"],
  creativity: ["creativity", "design"],
  "attention to detail": ["attention-to-detail"],
  organization: ["project-management", "attention-to-detail"],
  "time management": ["project-management"],

  // additional common tools & skills
  mongodb: ["database-management", "programming"],
  postgresql: ["database-management", "programming"],
  mysql: ["database-management", "programming"],
  redis: ["database-management"],
  graphql: ["api-development", "web-development"],
  "rest api": ["api-development", "web-development"],
  flutter: ["mobile-development", "programming"],
  "react native": ["mobile-development", "programming"],
  "swift ui": ["mobile-development", "programming"],
  "android development": ["mobile-development", "programming"],
  "ios development": ["mobile-development", "programming"],
  negotiation: ["negotiation", "communication"],
  "conflict resolution": ["conflict-resolution", "communication"],
  budgeting: ["budgeting", "accounting"],
  "change management": ["change-management", "project-management"],
  "product management": ["product-management", "strategy"],
  "data modeling": ["data-modeling", "data-analysis"],
  "process improvement": ["process-improvement", "problem-solving"],
  "video editing": ["video-production", "creativity"],
  "premiere pro": ["video-production"],
  "after effects": ["video-production", "design"],
  "final cut": ["video-production"],
  copywriting: ["copywriting", "writing"],
  "brand strategy": ["digital-marketing", "strategy"],
  "email marketing": ["digital-marketing", "copywriting"],
  notion: ["organization", "project-management"],
  asana: ["project-management"],
  monday: ["project-management"],
  salesforce: ["data-analysis", "digital-marketing"],
  hubspot: ["digital-marketing", "data-analysis"],
  "power automate": ["automation"],
  zapier: ["automation"],
  "google sheets": ["data-analysis"],
  "data entry": ["data-analysis", "attention-to-detail"],
  typing: ["attention-to-detail"],
  bookkeeping: ["accounting", "attention-to-detail"],
  "financial modeling": ["accounting", "data-analysis"],
  "customer service": ["communication", "empathy"],
  "client management": ["communication", "stakeholder-management"],
  fundraising: ["communication", "strategy"],
  "grant writing": ["writing", "research"],
  "event planning": ["project-management", "organization"],

  // ─── Agriculture & Food ───
  agriculture: ["biology", "environmental-science", "data-analysis"],
  farming: ["biology", "environmental-science", "project-management"],
  agronomy: ["biology", "environmental-science", "research"],
  horticulture: ["biology", "environmental-science", "creativity"],
  "crop science": ["biology", "research", "data-analysis"],
  "soil science": ["biology", "environmental-science", "research"],
  "food science": ["biology", "research", "data-analysis"],
  "animal husbandry": ["biology", "project-management"],
  "precision agriculture": ["data-analysis", "automation", "gis"],
  "food safety": ["biology", "attention-to-detail", "policy"],
  "sustainable farming": ["environmental-science", "biology", "strategy"],
  irrigation: ["environmental-science", "automation", "gis"],
  "farm management": ["project-management", "budgeting", "leadership"],
  "pest management": ["biology", "research", "problem-solving"],
  forestry: ["environmental-science", "biology", "gis"],
  aquaculture: ["biology", "environmental-science", "project-management"],

  // ─── Healthcare & Medical ───
  nursing: ["healthcare-knowledge", "empathy", "communication"],
  "patient care": ["healthcare-knowledge", "empathy", "communication"],
  "clinical research": ["research", "healthcare-knowledge", "data-analysis"],
  pharmacy: ["healthcare-knowledge", "biology", "attention-to-detail"],
  "medical coding": ["healthcare-knowledge", "data-analysis", "attention-to-detail"],
  "medical billing": ["healthcare-knowledge", "accounting", "attention-to-detail"],
  "physical therapy": ["healthcare-knowledge", "empathy", "biology"],
  "occupational therapy": ["healthcare-knowledge", "empathy", "psychology"],
  "mental health": ["psychology", "empathy", "healthcare-knowledge"],
  epidemiology: ["data-analysis", "research", "healthcare-knowledge"],
  "public health": ["healthcare-knowledge", "policy", "communication"],
  nutrition: ["biology", "healthcare-knowledge", "research"],
  "health informatics": ["healthcare-knowledge", "data-analysis", "programming"],

  // ─── Real Estate & Property ───
  "real estate": ["negotiation", "communication", "accounting"],
  "property management": ["project-management", "communication", "budgeting"],
  appraisal: ["data-analysis", "attention-to-detail", "accounting"],
  mortgage: ["accounting", "communication", "attention-to-detail"],
  zoning: ["policy", "research", "gis"],
  "home staging": ["design", "creativity", "communication"],

  // ─── Manufacturing & Engineering ───
  manufacturing: ["project-management", "process-improvement", "attention-to-detail"],
  "quality control": ["attention-to-detail", "data-analysis", "process-improvement"],
  "lean manufacturing": ["process-improvement", "project-management", "data-analysis"],
  cnc: ["technical-literacy", "attention-to-detail", "3d-modeling"],
  cad: ["3d-modeling", "design", "technical-literacy"],
  autocad: ["3d-modeling", "design", "technical-literacy"],
  solidworks: ["3d-modeling", "design"],
  welding: ["technical-literacy", "attention-to-detail"],
  "industrial engineering": ["process-improvement", "data-analysis", "project-management"],
  robotics: ["programming", "automation", "machine-learning"],
  "3d printing": ["3d-modeling", "creativity", "design"],
  plc: ["automation", "programming", "technical-literacy"],

  // ─── Legal ───
  "legal research": ["research", "attention-to-detail", "writing"],
  "contract law": ["policy", "negotiation", "attention-to-detail"],
  paralegal: ["research", "writing", "attention-to-detail"],
  compliance: ["policy", "attention-to-detail", "risk-assessment"],
  litigation: ["research", "communication", "writing"],
  mediation: ["conflict-resolution", "negotiation", "empathy"],
  "regulatory affairs": ["policy", "research", "communication"],

  // ─── Hospitality & Tourism ───
  "hotel management": ["project-management", "communication", "leadership"],
  "food service": ["project-management", "communication", "leadership"],
  catering: ["project-management", "organization", "creativity"],
  "restaurant management": ["leadership", "budgeting", "communication"],
  concierge: ["communication", "organization", "cultural-awareness"],

  // ─── Human Resources ───
  recruiting: ["communication", "interviewing", "empathy"],
  "talent acquisition": ["communication", "interviewing", "strategy"],
  "employee relations": ["communication", "conflict-resolution", "empathy"],
  compensation: ["accounting", "data-analysis", "policy"],
  onboarding: ["communication", "organization", "teaching"],
  "workforce planning": ["data-analysis", "strategy", "project-management"],
  "hr analytics": ["data-analysis", "statistics", "communication"],

  // ─── Military & Defense ───
  "military leadership": ["leadership", "project-management", "communication"],
  "military operations": ["project-management", "leadership", "strategy"],
  "military intelligence": ["research", "data-analysis", "cybersecurity"],
  security: ["cybersecurity", "risk-assessment", "attention-to-detail"],
  "crisis management": ["leadership", "communication", "problem-solving"],
  "emergency management": ["leadership", "project-management", "communication"],

  // ─── Nonprofit & Social Impact ───
  "community organizing": ["communication", "leadership", "empathy"],
  "volunteer management": ["leadership", "communication", "organization"],
  advocacy: ["communication", "writing", "policy"],
  "social work": ["empathy", "communication", "psychology"],
  "impact measurement": ["data-analysis", "research", "strategy"],

  // ─── Finance & Banking ───
  "financial analysis": ["accounting", "data-analysis", "statistics"],
  trading: ["data-analysis", "risk-assessment", "statistics"],
  "wealth management": ["accounting", "communication", "strategy"],
  "risk management": ["risk-assessment", "data-analysis", "statistics"],
  auditing: ["accounting", "attention-to-detail", "data-analysis"],
  taxation: ["accounting", "attention-to-detail", "policy"],
  actuarial: ["statistics", "mathematics", "data-analysis"],
  blockchain: ["programming", "cybersecurity", "data-analysis"],
  fintech: ["programming", "accounting", "data-analysis"],

  // ─── Science & Research ───
  "lab work": ["research", "biology", "attention-to-detail"],
  chemistry: ["research", "attention-to-detail", "data-analysis"],
  physics: ["mathematics", "research", "problem-solving"],
  geology: ["environmental-science", "research", "gis"],
  meteorology: ["data-analysis", "environmental-science", "statistics"],

  // ─── Government & Public Sector ───
  "public administration": ["project-management", "communication", "policy"],
  "public policy": ["policy", "research", "communication"],
  "urban planning": ["gis", "policy", "design"],
  diplomacy: ["communication", "cultural-awareness", "negotiation"],
  "intelligence analysis": ["research", "data-analysis", "analytical-thinking"],

  // ─── Retail & E-commerce ───
  merchandising: ["data-analysis", "design", "strategy"],
  "inventory management": ["supply-chain", "data-analysis", "organization"],
  "e-commerce": ["digital-marketing", "web-development", "data-analysis"],
  "customer experience": ["communication", "empathy", "data-analysis"],

  // ─── Construction & Trades ───
  construction: ["project-management", "budgeting", "leadership"],
  plumbing: ["technical-literacy", "problem-solving"],
  carpentry: ["creativity", "attention-to-detail"],
  hvac: ["technical-literacy", "problem-solving"],
  surveying: ["gis", "mathematics", "attention-to-detail"],

  // ─── Energy & Environment ───
  "renewable energy": ["environmental-science", "project-management", "data-analysis"],
  "solar energy": ["environmental-science", "technical-literacy", "project-management"],
  sustainability: ["environmental-science", "strategy", "data-analysis"],
  "climate science": ["environmental-science", "data-analysis", "research"],

  // ─── Transportation & Logistics ───
  warehousing: ["supply-chain", "organization", "project-management"],
  procurement: ["supply-chain", "negotiation", "budgeting"],
  purchasing: ["supply-chain", "negotiation", "data-analysis"],
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
 * Uses weighted scoring: foundational skills (listed first) count more.
 */
function getBuiltInRecommendations(skills, interests, currentField) {
  const careers = careersData.careers;

  // expand any free-text or unknown skills using server-side normalization
  const normalizedSkills = [...new Set(skills.flatMap((s) => normalizeSkillInput(s)))];

  // Industry affinity map: maps user's current field to related career industries / categories
  // so that careers in adjacent (but NOT same) industries get a small bonus
  const INDUSTRY_AFFINITY = {
    'software': ['technology', 'data', 'security', 'design'],
    'technology': ['technology', 'data', 'security', 'design'],
    'it': ['technology', 'data', 'security'],
    'finance': ['data', 'business', 'technology', 'law'],
    'banking': ['finance', 'data', 'business', 'technology'],
    'accounting': ['finance', 'data', 'business'],
    'healthcare': ['healthcare', 'science', 'data', 'technology'],
    'medical': ['healthcare', 'science', 'data'],
    'nursing': ['healthcare', 'helping', 'science'],
    'education': ['teaching', 'design', 'technology', 'psychology'],
    'teaching': ['teaching', 'psychology', 'design', 'technology'],
    'marketing': ['marketing', 'data', 'writing', 'design', 'business'],
    'advertising': ['marketing', 'design', 'writing', 'data'],
    'sales': ['business', 'marketing', 'communication'],
    'retail': ['business', 'marketing', 'supply chain'],
    'design': ['design', 'technology', 'marketing', 'creativity'],
    'engineering': ['technology', 'data', 'science', 'manufacturing'],
    'manufacturing': ['supply chain', 'data', 'technology', 'business'],
    'construction': ['engineering', 'management', 'environment'],
    'legal': ['law', 'investigation', 'data', 'writing'],
    'law': ['law', 'investigation', 'writing'],
    'government': ['law', 'data', 'social impact', 'environment'],
    'nonprofit': ['social impact', 'helping', 'community', 'environment'],
    'media': ['writing', 'design', 'marketing', 'technology'],
    'journalism': ['writing', 'investigation', 'media'],
    'consulting': ['business', 'data', 'strategy', 'technology'],
    'real estate': ['business', 'finance', 'data'],
    'hospitality': ['business', 'travel', 'community'],
    'food': ['business', 'science', 'sustainability'],
    'agriculture': ['science', 'sustainability', 'data', 'environment'],
    'logistics': ['supply chain', 'data', 'technology', 'business'],
    'transportation': ['supply chain', 'logistics', 'technology'],
    'military': ['security', 'technology', 'leadership'],
    'science': ['science', 'data', 'technology', 'environment'],
    'research': ['science', 'data', 'technology', 'investigation'],
    'hr': ['psychology', 'communication', 'business'],
    'human resources': ['psychology', 'communication', 'business'],
    'customer service': ['helping', 'communication', 'business'],
    'student': [],  // no bias for students — explore all
    'none': [],     // no current field — explore all
  };

  // Determine if we should diversify results (user has no field or is a student/career changer)
  const fieldKey = (currentField || '').toLowerCase().trim();
  const affinityTags = INDUSTRY_AFFINITY[fieldKey] || [];

  const scored = careers.map((career) => {
    // Weighted skill match — skills listed earlier are slightly more foundational,
    // but weighting is softened so that matching MORE skills always wins over
    // matching a single highly-weighted skill.
    const n = career.requiredSkills.length;
    const totalWeight = career.requiredSkills.reduce(
      (sum, _, i) => sum + (1 + (n - 1 - i) * 0.3), 0
    );
    let matchedWeight = 0;
    const matchedSkills = [];
    const missingSkills = [];

    career.requiredSkills.forEach((s, i) => {
      const weight = 1 + (n - 1 - i) * 0.3; // soft positional weight (e.g. 2.8, 2.5 … 1.0 for 7 skills)
      if (normalizedSkills.includes(s)) {
        matchedWeight += weight;
        matchedSkills.push(s);
      } else {
        missingSkills.push(s);
      }
    });

    const skillScore = totalWeight > 0 ? matchedWeight / totalWeight : 0;

    // Interest match scoring
    const matchedInterests = career.relatedInterests.filter((i) => interests.includes(i));
    const interestScore = career.relatedInterests.length
      ? matchedInterests.length / career.relatedInterests.length
      : 0;

    // Coverage bonus: reward careers where user covers more of the required skills
    const coverageBonus = career.requiredSkills.length > 0
      ? (matchedSkills.length / career.requiredSkills.length) * 0.15
      : 0;

    // Absolute skill count bonus: directly rewards matching more skills regardless
    // of career size or positional weighting. Each matched skill adds +7%, capped at 35%.
    // This ensures that matching 5 skills ALWAYS beats matching 2 skills.
    const absoluteSkillBonus = Math.min(matchedSkills.length * 0.07, 0.35);

    // Industry affinity bonus: slightly boost careers whose category/interests overlap
    // with the user's current field (encourages adjacent-industry recommendations)
    let industryBonus = 0;
    if (affinityTags.length > 0) {
      const careerTags = [
        ...(career.relatedInterests || []),
        (career.category || '').toLowerCase(),
      ];
      const overlap = affinityTags.filter(tag =>
        careerTags.some(ct => ct.includes(tag))
      ).length;
      industryBonus = Math.min(overlap * 0.03, 0.08); // up to 8% bonus
    }

    // Combined score: skills 40%, interests 25%, coverage 15%, absolute count 35%, industry 8%
    // Rebalanced to make raw skill count the dominant differentiator.
    const totalScore = Math.min(1, skillScore * 0.40 + interestScore * 0.25 + coverageBonus + absoluteSkillBonus + industryBonus);

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
    // Use the new skillTransfers data if available for richer explanations
    if (career.skillTransfers) {
      const transferExplanations = matchedSkills
        .filter(s => career.skillTransfers[s])
        .slice(0, 2)
        .map(s => career.skillTransfers[s]);
      
      if (transferExplanations.length > 0) {
        parts.push(transferExplanations.join('. ') + '.');
      } else {
        const skillLabels = matchedSkills.map((s) => s.replace(/-/g, " ")).join(", ");
        parts.push(`Your skills in ${skillLabels} directly apply to this role.`);
      }
    } else {
      const skillLabels = matchedSkills.map((s) => s.replace(/-/g, " ")).join(", ");
      parts.push(`Your skills in ${skillLabels} directly apply to this role.`);
    }
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

  // Add entry path hint if available
  if (career.entryPaths && career.entryPaths.length > 0) {
    parts.push(`To get started: ${career.entryPaths[0]}.`);
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
 * AI-powered recommendations using OpenAI or HuggingFace (auto-detected).
 */
async function getAIRecommendations(skills, interests, background) {
  const skillLabels = skills.map((s) => s.replace(/-/g, " ")).join(", ");
  const interestLabels = interests.map((i) => i.replace(/-/g, " ")).join(", ");

  const prompt = `Skills: ${skillLabels}. Interests: ${interestLabels}.${background ? ` Background: ${background}.` : ''}
Suggest 2 non-obvious, emerging career paths. Return: {"careers":[{"title":"...","category":"...","explanation":"one sentence","salaryRange":{"min":0,"max":0},"growthOutlook":"High","missingSkills":["skill1","skill2"],"matchScore":75}]}`;

  let content;

  if (AI_PROVIDER === 'openai') {
    const OpenAI = require("openai");
    const openai = new OpenAI({ apiKey: OPENAI_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });
    content = response.choices[0].message.content;
  } else if (AI_PROVIDER === 'huggingface') {
    console.log('Requesting HuggingFace-powered recommendations...');
    content = await callHuggingFace(prompt, { maxTokens: 350, temperature: 0.7, timeout: 15000 });
  } else {
    throw new Error('No AI provider configured');
  }

  const parsed = extractJSON(content);
  if (!parsed) throw new Error('AI response was not valid JSON');

  // Normalize the response and enrich AI careers with full data
  // so they work with CareerCard tabs (overview, pros/cons, skills) and roadmaps
  const recommendations = (parsed.careers || parsed.recommendations || []).map(
    (career, index) => {
      const title = career.title || 'AI Career';
      const explanation = career.explanation || career.description || '';
      const missingSkills = career.missingSkills || career.missing_skills || [];
      const salaryRange = career.salaryRange || career.salary_range || { min: 60000, max: 120000 };

      // Build a realistic requiredSkills list: user's matched skills + missing skills
      const requiredSkillsList = [
        ...skills.map(s => s.replace(/-/g, ' ')),
        ...missingSkills.map(s => typeof s === 'string' ? s : ''),
      ].filter(Boolean);

      // Generate pros/cons from the career data
      const salaryLabel = salaryRange.max >= 130000 ? 'competitive' : salaryRange.max >= 90000 ? 'solid' : 'growing';
      const growthOutlook = career.growthOutlook || career.growth_outlook || 'High';
      const pros = [
        `Leverages your existing skills in ${skills.slice(0, 2).map(s => s.replace(/-/g, ' ')).join(' and ')}`,
        `${growthOutlook} growth outlook with ${salaryLabel} salary potential`,
        `Non-traditional path — less competition from conventional candidates`,
      ];
      const cons = [
        `Requires developing new skills: ${missingSkills.slice(0, 2).join(', ') || 'domain expertise'}`,
        `May need additional certifications or portfolio work`,
        `Emerging field — fewer established mentorship paths`,
      ];

      // Build skill transfer explanations
      const skillTransfers = {};
      skills.forEach(s => {
        const label = s.replace(/-/g, ' ');
        skillTransfers[label] = `Your ${label} experience directly applies to ${title} work`;
      });

      return {
        id: `ai-${index}`,
        title,
        category: career.category || 'AI Recommended',
        description: explanation,
        dayInLife: career.dayInLife || career.day_in_life || `A typical day involves applying ${skills.slice(0, 2).map(s => s.replace(/-/g, ' ')).join(' and ')} skills to solve complex problems in this emerging field.`,
        salaryRange,
        growthOutlook,
        matchScore: Math.min(95, Math.max(40, career.matchScore || career.match_score || 70)),
        matchedSkills: skills.map(s => s.replace(/-/g, ' ')),
        matchedInterests: interests.map(i => i.replace(/-/g, ' ')),
        requiredSkills: requiredSkillsList,
        missingSkills,
        explanation,
        whyNonObvious: career.whyNonObvious || career.why_non_obvious || 'This career combines your skills in an unexpected way that most people overlook.',
        nonObvious: true,
        source: 'ai',
        pros,
        cons,
        skillTransfers,
        entryPaths: [
          `Build foundational knowledge in ${missingSkills[0] || 'the domain'}`,
          `Create 2-3 portfolio projects demonstrating your cross-disciplinary skills`,
          `Network with professionals in the ${career.category || 'field'} space`,
        ],
        careerProgression: [
          `Junior ${title}`,
          `Mid-level ${title}`,
          `Senior ${title}`,
          `Lead / Director`,
        ],
        industries: [career.category || 'Technology', 'Consulting', 'Startups'].filter(Boolean),
        typicalBackgrounds: ['Career changers', 'Cross-disciplinary professionals', 'Self-taught specialists'],
      };
    }
  );

  return recommendations;
}

/**
 * Main recommendation function — tries AI first, falls back to built-in.
 */
async function getRecommendations(skills, interests, background, currentField) {
  // 1) Run built-in engine (fast, <50ms) — this is the primary source
  console.log("Running built-in recommendation engine...");
  const builtInResults = getBuiltInRecommendations(skills, interests, currentField);

  // 2) If an AI provider is available, run AI in PARALLEL with a timeout
  //    so we never block the response for more than ~10 seconds total.
  if (AI_PROVIDER !== 'rule') {
    // Fire AI & semantic in parallel (both best-effort)
    const aiPromise = (async () => {
      try {
        console.log("Requesting LLM-powered recommendations...");
        return await getAIRecommendations(skills, interests, background);
      } catch (err) {
        console.warn("LLM recommendations failed:", err.message);
        return [];
      }
    })();

    const semanticPromise = (async () => {
      if (AI_PROVIDER !== 'openai') return [];
      try {
        const OpenAI = require("openai");
        const openai = new OpenAI({ apiKey: OPENAI_KEY });
        return await getSemanticRecommendations(openai, skills, interests, background);
      } catch (err) {
        console.warn("Semantic recommendation (embeddings) failed:", err.message);
        return [];
      }
    })();

    // Wait for both with a hard ceiling (if HF is slow, we still return built-in)
    const [aiSettled, semSettled] = await Promise.allSettled([
      withTimeout(aiPromise, 18000, 'AI recommendations'),
      withTimeout(semanticPromise, 18000, 'Semantic recommendations'),
    ]);

    const aiResults = aiSettled.status === 'fulfilled' ? aiSettled.value : [];
    const semanticResults = semSettled.status === 'fulfilled' ? semSettled.value : [];

    if (aiSettled.status === 'rejected') console.warn('AI timed out or failed:', aiSettled.reason?.message);
    if (semSettled.status === 'rejected') console.warn('Semantic timed out or failed:', semSettled.reason?.message);

    // Merge: built-in first (they have accurate scores), then AI extras
    const merged = [];
    const seen = new Set();

    const pushIfNew = (item) => {
      const id = item.id || item.title;
      if (!seen.has(id)) {
        seen.add(id);
        merged.push(item);
      }
    };

    // Built-in first (reliable scores), then AI (creative extras), then semantic
    builtInResults.forEach(pushIfNew);
    aiResults.forEach(pushIfNew);
    semanticResults.forEach(pushIfNew);

    const source = aiResults.length > 0 ? 'huggingface' : (semanticResults.length > 0 ? 'semantic' : 'built-in');
    return { source, recommendations: merged.slice(0, 8) };
  }

  // No AI provider: return built-in
  return { source: "built-in", recommendations: builtInResults };
}

module.exports = { 
  getRecommendations, 
  getBuiltInRecommendations, 
  generatePersonalizedRoadmap,
  analyzeLearningStyle,
  generateSkillGapAnalysis
};

/**
 * UNIQUE FEATURE: Generate personalized roadmap based on learning style and time availability
 */
async function generatePersonalizedRoadmap(careerId, userProfile) {
  const { 
    weeklyHours = 10, 
    learningStyle = 'balanced', // visual, hands-on, theoretical, balanced
    experienceLevel = 'beginner',
    timeframe = 12 // weeks
  } = userProfile;

  const career = careersData.careers.find(c => c.id === careerId);
  if (!career) throw new Error('Career not found');

  const skills = career.requiredSkills || [];
  
  // Adjust roadmap based on learning style
  const learningStrategies = {
    visual: {
      emphasis: ['video tutorials', 'diagrams', 'infographics', 'visual documentation'],
      ratio: { theory: 0.2, practice: 0.5, projects: 0.3 }
    },
    'hands-on': {
      emphasis: ['coding exercises', 'projects', 'labs', 'experimentation'],
      ratio: { theory: 0.1, practice: 0.4, projects: 0.5 }
    },
    theoretical: {
      emphasis: ['reading', 'courses', 'lectures', 'research papers'],
      ratio: { theory: 0.5, practice: 0.3, projects: 0.2 }
    },
    balanced: {
      emphasis: ['mix of theory and practice', 'guided projects', 'interactive courses'],
      ratio: { theory: 0.3, practice: 0.4, projects: 0.3 }
    }
  };

  const strategy = learningStrategies[learningStyle] || learningStrategies.balanced;
  
  // Calculate task distribution per week
  const hoursPerWeek = weeklyHours;
  const theoryHours = Math.round(hoursPerWeek * strategy.ratio.theory);
  const practiceHours = Math.round(hoursPerWeek * strategy.ratio.practice);
  const projectHours = Math.round(hoursPerWeek * strategy.ratio.projects);

  // Build weekly plan
  const weeklyPlan = [];
  for (let week = 0; week < timeframe; week++) {
    const skillIndex = week % skills.length;
    const currentSkill = skills[skillIndex].replace(/-/g, ' ');
    
    const tasks = [];
    
    // Theory task
    if (theoryHours > 0) {
      tasks.push({
        id: `w${week}-theory`,
        title: `Learn: ${currentSkill} fundamentals`,
        type: 'theory',
        estimatedHours: theoryHours,
        resources: strategy.emphasis.slice(0, 2)
      });
    }
    
    // Practice task
    if (practiceHours > 0) {
      tasks.push({
        id: `w${week}-practice`,
        title: `Practice: ${currentSkill} exercises`,
        type: 'practice',
        estimatedHours: practiceHours,
        resources: strategy.emphasis.slice(2)
      });
    }
    
    // Project task (every other week or based on hours)
    if (projectHours > 0 && (week % 2 === 1 || projectHours >= 5)) {
      tasks.push({
        id: `w${week}-project`,
        title: `Build: Apply ${currentSkill} to mini-project`,
        type: 'project',
        estimatedHours: projectHours,
        deliverable: true
      });
    }

    weeklyPlan.push({
      week: week + 1,
      focusSkill: currentSkill,
      tasks,
      totalHours: hoursPerWeek
    });
  }

  return {
    careerId,
    careerTitle: career.title,
    timeframe,
    weeklyHours,
    learningStyle,
    strategy: strategy.emphasis,
    weeklyPlan,
    milestones: generateMilestones(timeframe, skills)
  };
}

/**
 * UNIQUE FEATURE: Analyze user's learning style from their activity patterns
 */
function analyzeLearningStyle(userActivity) {
  const {
    videosWatched = 0,
    articlesRead = 0,
    exercisesCompleted = 0,
    projectsBuilt = 0,
    avgSessionLength = 60, // minutes
    preferredTime = 'evening' // morning, afternoon, evening
  } = userActivity;

  const total = videosWatched + articlesRead + exercisesCompleted + projectsBuilt;
  if (total === 0) return { style: 'balanced', confidence: 0 };

  // Calculate preferences
  const visualScore = (videosWatched / total) * 100;
  const theoreticalScore = (articlesRead / total) * 100;
  const handsOnScore = ((exercisesCompleted + projectsBuilt) / total) * 100;

  // Determine primary style
  let style = 'balanced';
  let confidence = 50;

  if (visualScore > 50) {
    style = 'visual';
    confidence = Math.min(95, visualScore + 15);
  } else if (theoreticalScore > 40) {
    style = 'theoretical';
    confidence = Math.min(95, theoreticalScore + 20);
  } else if (handsOnScore > 60) {
    style = 'hands-on';
    confidence = Math.min(95, handsOnScore + 10);
  }

  return {
    style,
    confidence: Math.round(confidence),
    breakdown: {
      visual: Math.round(visualScore),
      theoretical: Math.round(theoreticalScore),
      handsOn: Math.round(handsOnScore)
    },
    recommendations: getLearningRecommendations(style, avgSessionLength, preferredTime)
  };
}

/**
 * Get personalized learning recommendations
 */
function getLearningRecommendations(style, sessionLength, preferredTime) {
  const recommendations = [];

  if (style === 'visual') {
    recommendations.push('Use video tutorials and visual documentation');
    recommendations.push('Create mind maps and diagrams while learning');
  } else if (style === 'hands-on') {
    recommendations.push('Jump into coding exercises early');
    recommendations.push('Build projects alongside learning concepts');
  } else if (style === 'theoretical') {
    recommendations.push('Read documentation and books thoroughly');
    recommendations.push('Take detailed notes and write summaries');
  }

  if (sessionLength < 45) {
    recommendations.push('Break learning into 25-minute focused sprints');
  } else if (sessionLength > 120) {
    recommendations.push('Take breaks every 90 minutes to maintain focus');
  }

  return recommendations;
}

/**
 * Generate milestone markers for long-term plan
 */
function generateMilestones(weeks, skills) {
  const milestones = [];
  const quarterMark = Math.floor(weeks / 4);

  milestones.push({
    week: quarterMark,
    title: 'First Checkpoint',
    goal: `Master ${skills.slice(0, 2).join(' and ').replace(/-/g, ' ')}`,
    validation: 'Complete a small project demonstrating these skills'
  });

  milestones.push({
    week: quarterMark * 2,
    title: 'Halfway Point',
    goal: 'Portfolio project #1 complete',
    validation: 'Share your project for feedback'
  });

  milestones.push({
    week: quarterMark * 3,
    title: 'Advanced Skills',
    goal: `Learn advanced concepts in ${skills[skills.length - 1].replace(/-/g, ' ')}`,
    validation: 'Contribute to open source or start a complex project'
  });

  milestones.push({
    week: weeks,
    title: 'Job Ready',
    goal: 'Complete portfolio + start applications',
    validation: 'Ready for interviews in target career'
  });

  return milestones;
}

/**
 * UNIQUE FEATURE: Detailed skill gap analysis with learning path
 */
function generateSkillGapAnalysis(userSkills, targetCareer) {
  const career = careersData.careers.find(c => c.id === targetCareer);
  if (!career) throw new Error('Career not found');

  const requiredSkills = career.requiredSkills || [];
  const userSkillSet = new Set(userSkills.map(s => s.toLowerCase()));

  const analysis = {
    totalRequired: requiredSkills.length,
    hasSkills: [],
    missingSkills: [],
    readinessScore: 0,
    estimatedLearningTime: 0,
    priority: []
  };

  requiredSkills.forEach(skill => {
    if (userSkillSet.has(skill.toLowerCase())) {
      analysis.hasSkills.push(skill);
    } else {
      const skillInfo = {
        id: skill,
        name: skill.replace(/-/g, ' '),
        estimatedHours: estimateLearningTime(skill),
        importance: 'medium',
        learningPath: []
      };
      analysis.missingSkills.push(skillInfo);
      analysis.estimatedLearningTime += skillInfo.estimatedHours;
    }
  });

  // Calculate readiness
  analysis.readinessScore = Math.round((analysis.hasSkills.length / analysis.totalRequired) * 100);

  // Prioritize skills
  analysis.priority = prioritizeSkills(analysis.missingSkills, career);

  return analysis;
}

/**
 * Estimate learning time for a skill (in hours)
 */
function estimateLearningTime(skillId) {
  const complexSkills = {
    'machine-learning': 120,
    'programming': 200,
    'data-analysis': 80,
    'ux-design': 100,
    'cybersecurity': 150
  };

  return complexSkills[skillId] || 40; // default 40 hours
}

/**
 * Prioritize which skills to learn first
 */
function prioritizeSkills(missingSkills, career) {
  // Skills mentioned early in required list are typically more foundational
  return missingSkills
    .map((skill, index) => ({
      ...skill,
      priority: missingSkills.length - index,
      reason: index < 3 ? 'foundational skill' : 'supporting skill'
    }))
    .sort((a, b) => b.priority - a.priority);
}
