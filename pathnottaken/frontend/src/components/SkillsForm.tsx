"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Interest,
  fetchInterests,
  fetchSkillCategories,
} from "@/lib/api";

// --- Synonym map: common free-text skills -> canonical backend skill IDs ---
const SYNONYMS: Record<string, string | string[]> = {
  // Programming languages
  python: ["programming", "data-analysis", "machine-learning"],
  javascript: ["programming", "web-development"],
  typescript: ["programming", "web-development"],
  java: "programming",
  "c++": "programming",
  "c#": "programming",
  swift: "programming",
  kotlin: "programming",
  rust: "programming",
  go: "programming",
  ruby: "programming",
  php: ["programming", "web-development"],
  sql: ["programming", "data-analysis"],
  html: "web-development",
  css: ["web-development", "design"],

  // Frameworks & libraries
  react: ["programming", "ui-design", "web-development"],
  angular: ["programming", "web-development"],
  vue: ["programming", "web-development"],
  "node.js": ["programming", "web-development"],
  django: ["programming", "web-development"],
  flask: ["programming", "web-development"],
  "next.js": ["programming", "web-development"],
  "spring boot": ["programming", "api-development"],
  flutter: ["mobile-development", "programming"],
  "react native": ["mobile-development", "programming"],
  "swift ui": ["mobile-development", "programming"],

  // Data tools
  excel: "data-analysis",
  "google sheets": "data-analysis",
  tableau: "data-analysis",
  "power bi": "data-analysis",
  r: "data-analysis",
  matlab: "data-analysis",
  spss: "data-analysis",
  pandas: ["data-analysis", "programming"],
  numpy: ["data-analysis", "programming"],
  "data analysis": "data-analysis",
  "data entry": ["data-analysis", "attention-to-detail"],
  "data science": ["data-analysis", "machine-learning", "programming"],

  // ML / AI
  tensorflow: "machine-learning",
  pytorch: "machine-learning",
  nlp: "machine-learning",
  "computer vision": "machine-learning",
  "deep learning": "machine-learning",
  "machine learning": "machine-learning",
  ai: "machine-learning",
  "artificial intelligence": "machine-learning",
  chatgpt: "machine-learning",
  "prompt engineering": ["machine-learning", "writing"],

  // Design tools
  figma: ["design", "ui-design"],
  sketch: ["design", "ui-design"],
  "adobe xd": ["design", "ui-design"],
  photoshop: ["design", "creativity"],
  illustrator: ["design", "creativity"],
  canva: ["design", "creativity"],
  "ux design": ["design", "ui-design"],
  "ui design": ["design", "ui-design"],
  "graphic design": "design",
  "user research": ["research", "empathy"],

  // Cloud & DevOps
  aws: "cloud-computing",
  azure: "cloud-computing",
  gcp: "cloud-computing",
  docker: ["devops", "cloud-computing"],
  kubernetes: ["devops", "cloud-computing"],
  terraform: ["devops", "cloud-computing"],
  ansible: ["devops", "automation"],
  "ci/cd": ["devops", "automation"],
  jenkins: ["devops", "automation"],
  "github actions": ["devops", "automation"],

  // Database
  mongodb: ["database-management", "programming"],
  postgresql: ["database-management", "programming"],
  mysql: ["database-management", "programming"],
  redis: "database-management",
  graphql: ["api-development", "web-development"],
  "rest api": ["api-development", "web-development"],

  // Cybersecurity
  cybersecurity: "cybersecurity",
  "penetration testing": "cybersecurity",
  "ethical hacking": "cybersecurity",
  splunk: ["cybersecurity", "data-analysis"],
  wireshark: ["cybersecurity", "computer-networking"],

  // Supply chain
  "supply chain": "supply-chain",
  logistics: "supply-chain",
  "six sigma": ["supply-chain", "process-improvement"],
  "lean management": "process-improvement",

  // Marketing & content
  seo: ["digital-marketing", "data-analysis"],
  "content marketing": ["content-strategy", "digital-marketing"],
  "digital marketing": "digital-marketing",
  "social media": "digital-marketing",
  "content strategy": "content-strategy",
  "email marketing": ["digital-marketing", "copywriting"],
  "brand strategy": ["digital-marketing", "strategy"],
  hubspot: ["digital-marketing", "data-analysis"],
  salesforce: ["data-analysis", "digital-marketing"],
  copywriting: ["copywriting", "writing"],
  blogging: ["writing", "content-strategy"],

  // Video & media
  "video editing": ["video-production", "creativity"],
  "premiere pro": "video-production",
  "after effects": ["video-production", "design"],
  "final cut": "video-production",
  "davinci resolve": "video-production",

  // Education
  "instructional design": ["education-theory", "design"],
  "curriculum design": "education-theory",
  "e-learning": "education-theory",

  // Soft skills / management
  "project management": "project-management",
  "product management": "product-management",
  "public speaking": "public-speaking",
  communication: "communication",
  writing: "writing",
  agile: "agile-methodology",
  scrum: "agile-methodology",
  leadership: "leadership",
  negotiation: "negotiation",
  "conflict resolution": "conflict-resolution",
  "change management": "change-management",
  budgeting: ["budgeting", "accounting"],
  "financial modeling": ["accounting", "data-analysis"],
  bookkeeping: ["accounting", "attention-to-detail"],

  // Productivity tools
  jira: "project-management",
  trello: "project-management",
  asana: "project-management",
  notion: ["organization", "project-management"],
  monday: "project-management",
  zapier: "automation",
  "power automate": "automation",

  // Other
  "customer service": ["communication", "empathy"],
  "event planning": ["project-management", "organization"],
  fundraising: ["communication", "strategy"],
  "grant writing": ["writing", "research"],
  research: "research",
  teaching: ["teaching", "communication"],
  coaching: ["teaching", "empathy"],
  counseling: ["empathy", "psychology"],
  translation: ["languages", "communication"],

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
  "organic farming": ["biology", "environmental-science"],
  forestry: ["environmental-science", "biology", "gis"],
  aquaculture: ["biology", "environmental-science", "project-management"],
  viticulture: ["biology", "environmental-science", "creativity"],

  // ─── Healthcare & Medical ───
  nursing: ["healthcare-knowledge", "empathy", "communication"],
  "patient care": ["healthcare-knowledge", "empathy", "communication"],
  "clinical research": ["research", "healthcare-knowledge", "data-analysis"],
  pharmacy: ["healthcare-knowledge", "biology", "attention-to-detail"],
  "medical coding": ["healthcare-knowledge", "data-analysis", "attention-to-detail"],
  "medical billing": ["healthcare-knowledge", "accounting", "attention-to-detail"],
  phlebotomy: ["healthcare-knowledge", "attention-to-detail"],
  radiology: ["healthcare-knowledge", "technical-literacy"],
  "physical therapy": ["healthcare-knowledge", "empathy", "biology"],
  "occupational therapy": ["healthcare-knowledge", "empathy", "psychology"],
  "speech therapy": ["healthcare-knowledge", "communication", "psychology"],
  "mental health": ["psychology", "empathy", "healthcare-knowledge"],
  epidemiology: ["data-analysis", "research", "healthcare-knowledge"],
  "public health": ["healthcare-knowledge", "policy", "communication"],
  nutrition: ["biology", "healthcare-knowledge", "research"],
  dentistry: ["healthcare-knowledge", "attention-to-detail"],
  emt: ["healthcare-knowledge", "empathy", "problem-solving"],
  "first aid": ["healthcare-knowledge", "empathy"],
  cpr: ["healthcare-knowledge"],
  "health informatics": ["healthcare-knowledge", "data-analysis", "programming"],

  // ─── Real Estate & Property ───
  "real estate": ["negotiation", "communication", "accounting"],
  "property management": ["project-management", "communication", "budgeting"],
  appraisal: ["data-analysis", "attention-to-detail", "accounting"],
  "real estate investment": ["accounting", "data-analysis", "strategy"],
  mortgage: ["accounting", "communication", "attention-to-detail"],
  zoning: ["policy", "research", "gis"],
  "property valuation": ["data-analysis", "attention-to-detail", "accounting"],
  "real estate law": ["policy", "negotiation", "communication"],
  "commercial real estate": ["negotiation", "accounting", "strategy"],
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
  "mechanical engineering": ["3d-modeling", "problem-solving", "mathematics"],
  "civil engineering": ["mathematics", "project-management", "gis"],
  "electrical engineering": ["technical-literacy", "mathematics", "problem-solving"],
  "chemical engineering": ["biology", "mathematics", "research"],
  robotics: ["programming", "automation", "machine-learning"],
  "3d printing": ["3d-modeling", "creativity", "design"],
  plc: ["automation", "programming", "technical-literacy"],
  "process engineering": ["process-improvement", "data-analysis", "problem-solving"],

  // ─── Legal ───
  "legal research": ["research", "attention-to-detail", "writing"],
  "contract law": ["policy", "negotiation", "attention-to-detail"],
  paralegal: ["research", "writing", "attention-to-detail"],
  compliance: ["policy", "attention-to-detail", "risk-assessment"],
  "intellectual property": ["research", "policy", "writing"],
  litigation: ["research", "communication", "writing"],
  mediation: ["conflict-resolution", "negotiation", "empathy"],
  arbitration: ["conflict-resolution", "negotiation", "communication"],
  "regulatory affairs": ["policy", "research", "communication"],
  "corporate law": ["policy", "negotiation", "accounting"],
  "contract management": ["project-management", "attention-to-detail", "negotiation"],

  // ─── Hospitality & Tourism ───
  "hotel management": ["project-management", "communication", "leadership"],
  "food service": ["project-management", "communication", "leadership"],
  "event management": ["project-management", "organization", "communication"],
  catering: ["project-management", "organization", "creativity"],
  "restaurant management": ["leadership", "budgeting", "communication"],
  "tourism management": ["communication", "project-management", "cultural-awareness"],
  bartending: ["communication", "creativity"],
  "guest relations": ["communication", "empathy", "problem-solving"],
  concierge: ["communication", "organization", "cultural-awareness"],

  // ─── Human Resources ───
  recruiting: ["communication", "interviewing", "empathy"],
  "talent acquisition": ["communication", "interviewing", "strategy"],
  "employee relations": ["communication", "conflict-resolution", "empathy"],
  compensation: ["accounting", "data-analysis", "policy"],
  "benefits administration": ["accounting", "organization", "policy"],
  onboarding: ["communication", "organization", "teaching"],
  "performance management": ["communication", "data-analysis", "leadership"],
  "workforce planning": ["data-analysis", "strategy", "project-management"],
  "hr analytics": ["data-analysis", "statistics", "communication"],
  "organizational development": ["strategy", "psychology", "change-management"],

  // ─── Military & Defense ───
  "military leadership": ["leadership", "project-management", "communication"],
  "military operations": ["project-management", "leadership", "strategy"],
  "military intelligence": ["research", "data-analysis", "cybersecurity"],
  security: ["cybersecurity", "risk-assessment", "attention-to-detail"],
  "physical security": ["risk-assessment", "project-management", "communication"],
  surveillance: ["attention-to-detail", "technical-literacy"],
  "crisis management": ["leadership", "communication", "problem-solving"],
  "emergency management": ["leadership", "project-management", "communication"],
  "disaster response": ["leadership", "communication", "problem-solving"],

  // ─── Nonprofit & Social Impact ───
  "community organizing": ["communication", "leadership", "empathy"],
  "volunteer management": ["leadership", "communication", "organization"],
  "nonprofit management": ["project-management", "budgeting", "leadership"],
  advocacy: ["communication", "writing", "policy"],
  "social work": ["empathy", "communication", "psychology"],
  "community development": ["communication", "strategy", "leadership"],
  "impact measurement": ["data-analysis", "research", "strategy"],
  philanthropy: ["communication", "strategy", "budgeting"],

  // ─── Finance & Banking ───
  "financial analysis": ["accounting", "data-analysis", "statistics"],
  "investment banking": ["accounting", "data-analysis", "strategy"],
  trading: ["data-analysis", "risk-assessment", "statistics"],
  "wealth management": ["accounting", "communication", "strategy"],
  "risk management": ["risk-assessment", "data-analysis", "statistics"],
  auditing: ["accounting", "attention-to-detail", "data-analysis"],
  taxation: ["accounting", "attention-to-detail", "policy"],
  "credit analysis": ["accounting", "data-analysis", "risk-assessment"],
  "financial planning": ["accounting", "communication", "strategy"],
  actuarial: ["statistics", "mathematics", "data-analysis"],
  "corporate finance": ["accounting", "data-analysis", "strategy"],
  blockchain: ["programming", "cybersecurity", "data-analysis"],
  cryptocurrency: ["data-analysis", "risk-assessment", "programming"],
  fintech: ["programming", "accounting", "data-analysis"],

  // ─── Science & Research ───
  "lab work": ["research", "biology", "attention-to-detail"],
  "lab technician": ["research", "biology", "attention-to-detail"],
  microscopy: ["research", "biology", "attention-to-detail"],
  chemistry: ["research", "attention-to-detail", "data-analysis"],
  physics: ["mathematics", "research", "problem-solving"],
  astronomy: ["mathematics", "research", "data-analysis"],
  geology: ["environmental-science", "research", "gis"],
  oceanography: ["environmental-science", "research", "data-analysis"],
  meteorology: ["data-analysis", "environmental-science", "statistics"],

  // ─── Government & Public Sector ───
  "public administration": ["project-management", "communication", "policy"],
  "public policy": ["policy", "research", "communication"],
  "urban planning": ["gis", "policy", "design"],
  diplomacy: ["communication", "cultural-awareness", "negotiation"],
  "intelligence analysis": ["research", "data-analysis", "analytical-thinking"],
  "program management": ["project-management", "budgeting", "leadership"],

  // ─── Retail & E-commerce ───
  merchandising: ["data-analysis", "design", "strategy"],
  "visual merchandising": ["design", "creativity", "communication"],
  "inventory management": ["supply-chain", "data-analysis", "organization"],
  "store management": ["leadership", "communication", "budgeting"],
  "e-commerce": ["digital-marketing", "web-development", "data-analysis"],
  "customer experience": ["communication", "empathy", "data-analysis"],
  "loss prevention": ["risk-assessment", "attention-to-detail", "investigation"],

  // ─── Construction & Trades ───
  construction: ["project-management", "budgeting", "leadership"],
  plumbing: ["technical-literacy", "problem-solving"],
  "electrical work": ["technical-literacy", "attention-to-detail"],
  carpentry: ["creativity", "attention-to-detail"],
  hvac: ["technical-literacy", "problem-solving"],
  "building inspection": ["attention-to-detail", "risk-assessment", "policy"],
  "site management": ["project-management", "leadership", "budgeting"],
  surveying: ["gis", "mathematics", "attention-to-detail"],
  "landscape architecture": ["design", "environmental-science", "creativity"],


  // ─── Energy & Environment ───
  "renewable energy": ["environmental-science", "project-management", "data-analysis"],
  "solar energy": ["environmental-science", "technical-literacy", "project-management"],
  "wind energy": ["environmental-science", "technical-literacy"],
  sustainability: ["environmental-science", "strategy", "data-analysis"],
  "environmental consulting": ["environmental-science", "research", "communication"],
  "waste management": ["environmental-science", "project-management", "policy"],
  "water treatment": ["environmental-science", "biology", "technical-literacy"],
  "climate science": ["environmental-science", "data-analysis", "research"],

  // ─── Transportation & Logistics ───
  "fleet management": ["supply-chain", "project-management", "budgeting"],
  warehousing: ["supply-chain", "organization", "project-management"],
  shipping: ["supply-chain", "organization", "communication"],
  "freight management": ["supply-chain", "negotiation", "budgeting"],
  "route planning": ["supply-chain", "data-analysis", "gis"],
  procurement: ["supply-chain", "negotiation", "budgeting"],
  purchasing: ["supply-chain", "negotiation", "data-analysis"],
};

// Popular skill chips users can click for quick-add
const POPULAR_SKILLS = [
  { label: "Python", synonym: "python" },
  { label: "Excel", synonym: "excel" },
  { label: "JavaScript", synonym: "javascript" },
  { label: "SQL", synonym: "sql" },
  { label: "Project Management", synonym: "project management" },
  { label: "Data Analysis", synonym: "data analysis" },
  { label: "Figma", synonym: "figma" },
  { label: "Communication", synonym: "communication" },
  { label: "Writing", synonym: "writing" },
  { label: "Leadership", synonym: "leadership" },
  { label: "Marketing", synonym: "digital marketing" },
  { label: "React", synonym: "react" },
];

// Predefined industry options
const INDUSTRIES = [
  { value: "", label: "Select your industry..." },
  { value: "none", label: "No current field / Career changer" },
  { value: "student", label: "Student / Recent graduate" },
  { value: "technology", label: "Technology / Software" },
  { value: "it", label: "IT / Infrastructure" },
  { value: "engineering", label: "Engineering" },
  { value: "data-science", label: "Data Science / Analytics" },
  { value: "finance", label: "Finance / Banking" },
  { value: "accounting", label: "Accounting" },
  { value: "consulting", label: "Consulting" },
  { value: "sales", label: "Sales" },
  { value: "real-estate", label: "Real Estate" },
  { value: "marketing", label: "Marketing / Advertising" },
  { value: "design", label: "Design / Creative" },
  { value: "media", label: "Media / Journalism" },
  { value: "healthcare", label: "Healthcare / Medical" },
  { value: "science", label: "Science / Research" },
  { value: "education", label: "Education / Teaching" },
  { value: "government", label: "Government / Public Sector" },
  { value: "nonprofit", label: "Nonprofit / NGO" },
  { value: "legal", label: "Legal / Law" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "logistics", label: "Logistics / Supply Chain" },
  { value: "retail", label: "Retail / E-commerce" },
  { value: "hospitality", label: "Hospitality / Tourism" },
  { value: "food", label: "Food & Agriculture" },
  { value: "military", label: "Military / Defense" },
  { value: "hr", label: "Human Resources" },
  { value: "customer-service", label: "Customer Service" },
];

// Suggestions will be loaded from the backend skill catalog at runtime
// Using a module-level ref pattern (stable across renders, no stale closure issues)

export default function SkillsForm() {
  const router = useRouter();
  const remoteSuggestionsRef = useRef<{ id: string; label: string }[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [skills, setSkills] = useState<Array<{ id: string; label: string }>>([]);
  const [skillInput, setSkillInput] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<Array<{ id: string; label: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [educationLevel, setEducationLevel] = useState("");
  const [yearsExperience, setYearsExperience] = useState("0");
  const [currentField, setCurrentField] = useState("");

  // UI state
  const [interestSearch, setInterestSearch] = useState("");
  const [showAllInterests, setShowAllInterests] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Calculate form completion for progress bar
  const formProgress = (() => {
    let p = 0;
    if (skills.length > 0) p += 40;
    if (skills.length >= 3) p += 10;
    if (selectedInterests.length > 0) p += 30;
    if (selectedInterests.length >= 3) p += 10;
    if (currentField) p += 10;
    return Math.min(100, p);
  })();

  useEffect(() => {
    async function loadData() {
      try {
        const [ints, categories] = await Promise.all([fetchInterests(), fetchSkillCategories()]);
        setInterests(ints);
        remoteSuggestionsRef.current = categories.flatMap((cat) => cat.skills.map((s) => ({ id: s.id, label: s.label })));
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to connect. Make sure the backend is running on port 5000.");
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function fuzzyScore(query: string, target: string) {
    const q = query.toLowerCase().trim();
    const t = target.toLowerCase();
    if (q === t) return 100;
    if (t.startsWith(q)) return 80;
    if (t.includes(q)) return 60;
    const qTokens = q.split(/[^a-z0-9]+/).filter(Boolean);
    const tTokens = t.split(/[^a-z0-9]+/).filter(Boolean);
    const overlap = qTokens.filter((x) => tTokens.includes(x)).length;
    if (overlap > 0) return 50 + overlap * 5;
    return 0;
  }

  const handleSkillInputChange = (value: string) => {
    setSkillInput(value);
    if (value.trim().length > 0) {
      const q = value.toLowerCase();
      const scored = remoteSuggestionsRef.current
        .filter((s) => !skills.find((sk) => sk.id === s.id))
        .map((s) => ({ s, score: fuzzyScore(q, s.label) }))
        .filter((r) => r.score > 20)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map((r) => r.s);

      // also include exact synonyms mapped to remote suggestions
      const canon = SYNONYMS[q];
      if (canon) {
        const ids = Array.isArray(canon) ? canon : [canon];
        ids.forEach((id) => {
          const found = remoteSuggestionsRef.current.find((s) => s.id === id);
          if (found && !scored.find((x) => x.id === found.id)) scored.unshift(found);
        });
      }

      // partial-match synonym keys so typing "agri" surfaces agriculture synonyms
      if (q.length >= 3) {
        const seenIds = new Set(scored.map((s) => s.id));
        for (const key of Object.keys(SYNONYMS)) {
          if (key.startsWith(q) || key.includes(q)) {
            const mapped = SYNONYMS[key];
            const ids = Array.isArray(mapped) ? mapped : [mapped];
            for (const id of ids) {
              if (seenIds.has(id)) continue;
              const found = remoteSuggestionsRef.current.find((s) => s.id === id);
              if (found && !skills.find((sk) => sk.id === found.id)) {
                scored.push(found);
                seenIds.add(id);
              }
            }
          }
          if (scored.length >= 8) break;
        }
      }

      setFilteredSuggestions(scored.slice(0, 8));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const addSkill = (skillLabel: string) => {
    const trimmed = skillLabel.trim();
    if (!trimmed) return;

    // 1) prefer exact match from remote suggestions
    const exact = remoteSuggestionsRef.current.find((s) => s.label.toLowerCase() === trimmed.toLowerCase());
    if (exact && !skills.find((sk) => sk.id === exact.id)) {
      setSkills((prev) => [...prev, exact]);
      setSkillInput("");
      setShowSuggestions(false);
      inputRef.current?.focus();
      return;
    }

    // 2) try synonyms -> canonical id(s)
    const canon = SYNONYMS[trimmed.toLowerCase()];
    if (canon) {
      const ids = Array.isArray(canon) ? canon : [canon];
      const toAdd: Array<{ id: string; label: string }> = [];
      ids.forEach((id) => {
        const remote = remoteSuggestionsRef.current.find((s) => s.id === id);
        if (remote && !skills.find((sk) => sk.id === remote.id)) toAdd.push(remote);
        else if (!skills.find((sk) => sk.id === id)) toAdd.push({ id, label: trimmed });
      });
      if (toAdd.length > 0) {
        setSkills((prev) => [...prev, ...toAdd]);
        setSkillInput("");
        setShowSuggestions(false);
        inputRef.current?.focus();
        return;
      }
    }

    // 2b) try fuzzy match
    const q = trimmed.toLowerCase();
    const fuzzyMatches = remoteSuggestionsRef.current
      .filter((s) => !skills.find((sk) => sk.id === s.id))
      .map((s) => ({ s, score: fuzzyScore(q, s.label) }))
      .filter((r) => r.score > 40)
      .sort((a, b) => b.score - a.score);

    if (fuzzyMatches.length > 0) {
      const best = fuzzyMatches[0].s;
      setSkills((prev) => [...prev, best]);
      setSkillInput("");
      setShowSuggestions(false);
      inputRef.current?.focus();
      return;
    }

    // 3) free-text fallback
    const freeId = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (!skills.find((sk) => sk.id === freeId)) {
      setSkills((prev) => [...prev, { id: freeId, label: trimmed }]);
    }
    setSkillInput("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const addPopularSkill = (synonym: string) => {
    addSkill(synonym);
  };

  const removeSkill = (skillId: string) => {
    setSkills((prev) => prev.filter((s) => s.id !== skillId));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      addSkill(skillInput);
    }
    if (e.key === "Backspace" && !skillInput && skills.length > 0) {
      removeSkill(skills[skills.length - 1].id);
    }
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Filter interests by search
  const filteredInterests = interestSearch.trim()
    ? interests.filter((i) => i.label.toLowerCase().includes(interestSearch.toLowerCase()))
    : interests;

  const visibleInterests = showAllInterests ? filteredInterests : filteredInterests.slice(0, 12);

  const handleSubmit = () => {
    const skillIds = skills.map((s) => s.id);

    try {
      localStorage.setItem('pn_user_skills', JSON.stringify(skillIds));
    } catch { /* quota exceeded */ }

    const background = [
      educationLevel && `Education: ${educationLevel}`,
      yearsExperience !== "0" && `${yearsExperience} years of experience`,
      currentField && currentField !== "none" && currentField !== "student" && `Current field: ${currentField}`,
    ]
      .filter(Boolean)
      .join(". ");

    const params = new URLSearchParams({
      skills: skillIds.join(","),
      interests: selectedInterests.join(","),
      ...(background && { background }),
      ...(currentField && { currentField }),
    });
    router.push(`/results?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-shimmer h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Connection Error</h3>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <code className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg">
            cd backend &amp;&amp; npm run dev
          </code>
        </div>
      </div>
    );
  }

  const canSubmit = skills.length > 0 && selectedInterests.length > 0;

  // Step status for visual stepper
  const stepStatus = {
    skills: skills.length > 0 ? 'done' : 'active',
    interests: skills.length > 0 ? (selectedInterests.length > 0 ? 'done' : 'active') : 'upcoming',
    background: (skills.length > 0 && selectedInterests.length > 0) ? (currentField ? 'done' : 'active') : 'upcoming',
  } as const;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress Header with Steps */}
      <div className="mb-8 animate-fade-in-down">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Build Your <span className="gradient-text">Career Profile</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Tell us about yourself and we'll reveal career paths you never knew existed
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-1 mb-4">
          {[
            { key: 'skills', label: 'Skills', icon: '🛠️', status: stepStatus.skills },
            { key: 'interests', label: 'Interests', icon: '💜', status: stepStatus.interests },
            { key: 'background', label: 'Background', icon: '💼', status: stepStatus.background },
          ].map((step, i, arr) => (
            <div key={step.key} className="flex items-center">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                step.status === 'done'
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : step.status === 'active'
                  ? 'bg-white text-gray-900 border-2 border-emerald-400 shadow-sm shadow-emerald-100'
                  : 'bg-gray-50 text-gray-400 border border-gray-200'
              }`}>
                <span className="text-sm">{step.status === 'done' ? '✓' : step.icon}</span>
                <span className="hidden sm:inline">{step.label}</span>
              </div>
              {i < arr.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 rounded-full transition-colors duration-500 ${
                  step.status === 'done' ? 'bg-emerald-300' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden max-w-md mx-auto">
          <div
            className={`h-1.5 rounded-full transition-all duration-700 ease-out ${formProgress >= 80 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : formProgress >= 50 ? 'bg-gradient-to-r from-amber-400 to-amber-300' : 'bg-gradient-to-r from-gray-300 to-gray-400'}`}
            style={{ width: `${formProgress}%` }}
          />
        </div>
        <p className="text-center text-[11px] text-gray-400 mt-1.5">
          {formProgress}% complete {formProgress >= 80 && '— Ready to go!'}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Main Form */}
        <div className="flex-1 min-w-0">
          <div className="animate-fade-in-up">
            {/* Section 1: Skills */}
            <div className="card-static p-6 md:p-8 mb-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <svg className="w-4.5 h-4.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">What are your skills?</h2>
                  <p className="text-xs text-gray-400">Add tools, technologies, and abilities you&apos;re confident in</p>
                </div>
              </div>

              {/* Popular Skills Quick-add */}
              <div className="mt-4 mb-4">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Popular &#8212; click to add</p>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SKILLS.map((ps) => {
                    const canon = SYNONYMS[ps.synonym];
                    const ids = canon ? (Array.isArray(canon) ? canon : [canon]) : [ps.synonym];
                    const alreadyAdded = ids.some((id) => skills.some((sk) => sk.id === id));
                    return (
                      <button
                        key={ps.label}
                        onClick={() => !alreadyAdded && addPopularSkill(ps.synonym)}
                        disabled={alreadyAdded}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          alreadyAdded
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200 cursor-default opacity-60"
                            : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
                        }`}
                      >
                        {alreadyAdded ? "\u2713 " : "+ "}{ps.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Free-type Skill Input */}
              <div className="mb-2">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Your Skills <span className="text-red-500">*</span>
                  {skills.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-emerald-600">
                      {skills.length} skill{skills.length !== 1 ? 's' : ''} added
                    </span>
                  )}
                </label>
                <div className="relative" ref={suggestionsRef}>
                  <div
                    className={`border rounded-xl px-3 py-2.5 flex flex-wrap gap-2 items-center min-h-[48px] bg-white transition-all cursor-text ${
                      skills.length > 0 ? 'border-emerald-300 ring-1 ring-emerald-100' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => inputRef.current?.focus()}
                  >
                    {skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-sm font-medium px-3 py-1 rounded-full border border-emerald-200 animate-scale-in"
                      >
                        {skill.label}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSkill(skill.id);
                          }}
                          className="text-emerald-400 hover:text-emerald-700 transition-colors"
                          aria-label={`Remove ${skill.label}`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                    <input
                      ref={inputRef}
                      type="text"
                      value={skillInput}
                      onChange={(e) => handleSkillInputChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() => skillInput.trim() && setShowSuggestions(true)}
                      placeholder={skills.length === 0 ? "Type a skill or tool... (e.g., Python, Excel, Leadership)" : "Add more..."}
                      className="flex-1 min-w-[180px] outline-none text-sm text-gray-700 placeholder:text-gray-400 bg-transparent py-0.5"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                    <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Press Enter to add &#8212; type specific tools like &quot;Python&quot; or &quot;Figma&quot; and we&apos;ll auto-map them to skill areas
                  </p>

                  {/* Autocomplete dropdown */}
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-1.5 animate-fade-in max-h-56 overflow-y-auto">
                      {filteredSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onClick={() => addSkill(suggestion.label)}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center gap-2"
                        >
                          <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          {suggestion.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Interests & Passions */}
            <div className="card-static p-6 md:p-8 mb-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <svg className="w-4.5 h-4.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">What excites you?</h2>
                  <p className="text-xs text-gray-400">Pick topics you&apos;re genuinely passionate about &#8212; even if they seem unrelated to work</p>
                </div>
              </div>

              {selectedInterests.length > 0 && (
                <div className="mt-3 mb-3 flex items-center gap-2">
                  <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
                    {selectedInterests.length} selected
                  </span>
                  {selectedInterests.length < 2 && (
                    <span className="text-[11px] text-amber-600">Pick at least 2 for better results</span>
                  )}
                </div>
              )}

              {/* Interest search */}
              {interests.length > 12 && (
                <div className="mt-3 mb-3 relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={interestSearch}
                    onChange={(e) => setInterestSearch(e.target.value)}
                    placeholder="Search interests..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 transition-all"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                {visibleInterests.map((interest) => (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-left transition-all text-sm ${
                      selectedInterests.includes(interest.id)
                        ? "bg-purple-50 border-purple-300 text-purple-700 shadow-sm shadow-purple-100"
                        : "bg-white border-gray-200 text-gray-600 hover:border-purple-200 hover:bg-purple-50/30"
                    }`}
                  >
                    <span className="text-lg flex-shrink-0">{interest.icon}</span>
                    <span className="font-medium text-[13px] leading-tight">{interest.label}</span>
                    {selectedInterests.includes(interest.id) && (
                      <svg className="w-4 h-4 text-purple-500 ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              {filteredInterests.length > 12 && !showAllInterests && !interestSearch && (
                <button
                  onClick={() => setShowAllInterests(true)}
                  className="mt-3 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  Show all {filteredInterests.length} interests
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
              {showAllInterests && !interestSearch && (
                <button
                  onClick={() => setShowAllInterests(false)}
                  className="mt-3 text-sm text-gray-400 hover:text-gray-600 font-medium flex items-center gap-1"
                >
                  Show less
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
              )}
            </div>

            {/* Section 3: Background */}
            <div className="card-static p-6 md:p-8 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-4.5 h-4.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Your Background</h2>
                  <p className="text-xs text-gray-400">This helps us tailor recommendations to your experience level</p>
                </div>
              </div>

              {/* Current Field/Industry */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Current Field / Industry
                </label>
                <select
                  value={currentField}
                  onChange={(e) => setCurrentField(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer transition-all"
                  style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")",
                    backgroundPosition: "right 12px center",
                    backgroundSize: "16px",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind.value} value={ind.value}>{ind.label}</option>
                  ))}
                </select>
                {currentField === "none" && (
                  <p className="text-[11px] text-emerald-600 mt-1.5 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Great! We&apos;ll show you the widest range of career possibilities
                  </p>
                )}
                {currentField === "student" && (
                  <p className="text-[11px] text-blue-600 mt-1.5 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    We&apos;ll prioritize careers with accessible entry paths for new grads
                  </p>
                )}
                {currentField && currentField !== "none" && currentField !== "student" && currentField !== "" && (
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    We&apos;ll highlight career paths that leverage your {INDUSTRIES.find(i => i.value === currentField)?.label || currentField} experience
                  </p>
                )}
              </div>

              {/* Education & Experience Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Education Level
                  </label>
                  <select
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer transition-all"
                    style={{
                      backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")",
                      backgroundPosition: "right 12px center",
                      backgroundSize: "16px",
                      backgroundRepeat: "no-repeat",
                    }}
                  >
                    <option value="">Select...</option>
                    <option value="High School">High School</option>
                    <option value="Some College">Some College</option>
                    <option value="Associate Degree">Associate Degree</option>
                    <option value="Bachelor's Degree">Bachelor&apos;s Degree</option>
                    <option value="Master's Degree">Master&apos;s Degree</option>
                    <option value="PhD">PhD / Doctorate</option>
                    <option value="Self-taught">Self-taught</option>
                    <option value="Bootcamp">Bootcamp / Certificate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={yearsExperience}
                    onChange={(e) => {
                      const v = parseInt(e.target.value) || 0;
                      setYearsExperience(String(Math.max(0, Math.min(50, v))));
                    }}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`rounded-2xl p-6 transition-all duration-500 ${canSubmit ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 shadow-sm' : 'card-static'}`}>
              {canSubmit && (
                <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-gray-500 animate-fade-in">
                  <span className="font-medium text-gray-700">Summary:</span>
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{skills.length} skill{skills.length !== 1 ? 's' : ''}</span>
                  <span className="text-gray-300">+</span>
                  <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">{selectedInterests.length} interest{selectedInterests.length !== 1 ? 's' : ''}</span>
                  {currentField && currentField !== '' && (
                    <>
                      <span className="text-gray-300">+</span>
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{INDUSTRIES.find(i => i.value === currentField)?.label || currentField}</span>
                    </>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  {!canSubmit ? (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {skills.length === 0 ? "Add at least 1 skill to continue" : "Select at least 1 interest to continue"}
                    </span>
                  ) : (
                    <span className="text-emerald-600 flex items-center gap-1.5 font-medium">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Ready to discover your hidden career paths!
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={`text-sm px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 group transition-all duration-300 ${
                    canSubmit
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 hover:-translate-y-0.5 hover:from-emerald-700 hover:to-emerald-800'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Discover My Paths
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-4">

            {/* Live Profile Card */}
            <div className="card-static p-5">
              <h3 className="font-bold text-sm text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Your Profile
              </h3>
              <div className="space-y-3">
                {/* Skills count */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium text-gray-500">Skills added</span>
                    <span className={`text-xs font-bold ${skills.length >= 3 ? 'text-emerald-600' : 'text-gray-400'}`}>{skills.length} / 3+</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 to-emerald-400"
                      style={{ width: `${Math.min(100, (skills.length / 5) * 100)}%` }}
                    />
                  </div>
                </div>
                {/* Interests count */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium text-gray-500">Interests selected</span>
                    <span className={`text-xs font-bold ${selectedInterests.length >= 2 ? 'text-emerald-600' : 'text-gray-400'}`}>{selectedInterests.length} / 2+</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 to-blue-400"
                      style={{ width: `${Math.min(100, (selectedInterests.length / 4) * 100)}%` }}
                    />
                  </div>
                </div>
                {/* Overall readiness */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium text-gray-500">Profile strength</span>
                    <span className={`text-xs font-bold ${formProgress >= 80 ? 'text-emerald-600' : formProgress >= 50 ? 'text-amber-600' : 'text-gray-400'}`}>{formProgress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        formProgress >= 80 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                        : formProgress >= 50 ? 'bg-gradient-to-r from-amber-400 to-amber-300'
                        : 'bg-gradient-to-r from-gray-300 to-gray-400'
                      }`}
                      style={{ width: `${formProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    {formProgress >= 80 ? '✓ Ready to discover your paths!' : formProgress >= 50 ? 'Almost there — add a few more.' : 'Add skills & interests to continue.'}
                  </p>
                </div>
              </div>
            </div>

            {/* What we analyze */}
            <div className="card-static p-5">
              <h3 className="font-bold text-sm text-gray-900 mb-3">What we analyze</h3>
              <div className="space-y-2.5">
                {[
                  { label: 'Skills tracked', value: '85+', color: 'text-emerald-600' },
                  { label: 'Career paths', value: '20+', color: 'text-blue-600' },
                  { label: 'Industries', value: '15+', color: 'text-purple-600' },
                  { label: 'Interest areas', value: '35+', color: 'text-amber-600' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-500">{item.label}</span>
                    <span className={`text-xs font-bold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="card-static p-5">
              <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-1.5">
                <span>&#128161;</span> Tips
              </h3>
              <ul className="space-y-2.5">
                {[
                  { tip: 'Type industry terms like \"agriculture\" or \"nursing\" — we auto-map them', color: 'bg-emerald-400' },
                  { tip: 'Soft skills like Leadership and Communication unlock many hidden paths', color: 'bg-purple-400' },
                  { tip: 'Select your current industry to boost cross-field match relevance', color: 'bg-blue-400' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${item.color}`} />
                    <p className="text-[11px] text-gray-500 leading-relaxed">{item.tip}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Browse link */}
            <a
              href="/careers"
              className="block text-center text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl py-3 transition-colors"
            >
              Or browse all careers &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

