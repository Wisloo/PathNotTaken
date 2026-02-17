"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Interest,
  fetchInterests,
  fetchSkillCategories,
} from "@/lib/api";

// Small synonyms map so common free-text skills (e.g. "Python") map to canonical backend skill IDs.
// Values can be a single id or an array of ids to broaden matches (multi-mapping).
const SYNONYMS: Record<string, string | string[]> = {
  // languages -> programming (also map to data/ML when relevant)
  python: ["programming", "data-analysis", "machine-learning"],
  javascript: ["programming", "web-development"],
  typescript: ["programming", "web-development"],
  java: "programming",
  "c++": "programming",
  sql: ["programming", "data-analysis"],
  react: ["programming", "ui-design"],
  "node.js": "programming",

  // data tools -> data-analysis
  excel: "data-analysis",
  tableau: "data-analysis",
  r: "data-analysis",
  matlab: "data-analysis",
  "data analysis": "data-analysis",

  // ml -> machine-learning
  tensorflow: "machine-learning",
  pytorch: "machine-learning",
  nlp: "machine-learning",
  "computer vision": "machine-learning",

  // design -> design
  figma: "design",
  "ux design": "design",
  "ui design": ["design", "ui-design"],
  "graphic design": "design",

  // cloud & devops
  aws: "cloud-computing",
  azure: "cloud-computing",
  gcp: "cloud-computing",
  docker: ["devops", "cloud-computing"],
  kubernetes: ["devops", "cloud-computing"],
  terraform: ["devops", "cloud-computing"],

  // cybersecurity
  cybersecurity: "cybersecurity",
  "penetration testing": "cybersecurity",
  "ethical hacking": "cybersecurity",
  splunk: ["cybersecurity", "data-analysis"],

  // supply chain
  "supply chain": "supply-chain",
  logistics: "supply-chain",
  "six sigma": ["supply-chain", "problem-solving"],

  // marketing & content
  seo: ["digital-marketing", "data-analysis"],
  "content marketing": ["content-strategy", "digital-marketing"],
  "digital marketing": "digital-marketing",
  "social media": "digital-marketing",
  "content strategy": "content-strategy",

  // education
  "instructional design": ["education-theory", "design"],
  "curriculum design": "education-theory",
  "e-learning": "education-theory",

  // soft skills / management
  "project management": "project-management",
  "product management": "project-management",
  "public speaking": "public-speaking",
  communication: "communication",
  writing: "writing",
  agile: "agile-methodology",
  scrum: "agile-methodology",
};

// Suggestions will be loaded from the backend skill catalog at runtime
let REMOTE_SUGGESTIONS: { id: string; label: string }[] = [];

export default function SkillsForm() {
  const router = useRouter();
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  // store selected skills as {id,label} to send canonical IDs to backend
  const [skills, setSkills] = useState<Array<{ id: string; label: string }>>([]);
  const [skillInput, setSkillInput] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<Array<{ id: string; label: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [educationLevel, setEducationLevel] = useState("");
  const [yearsExperience, setYearsExperience] = useState("0");
  const [currentField, setCurrentField] = useState("");
  const [step, setStep] = useState(1);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [ints, categories] = await Promise.all([fetchInterests(), fetchSkillCategories()]);
        setInterests(ints);

        // build remote suggestions from categories
        REMOTE_SUGGESTIONS = categories.flatMap((cat) => cat.skills.map((s) => ({ id: s.id, label: s.label })));

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

  // Basic fuzzy scorer: token overlap + prefix + inclusion. Fast and dependency-free.
  function fuzzyScore(query: string, target: string) {
    const q = query.toLowerCase().trim();
    const t = target.toLowerCase();
    if (q === t) return 100;
    if (t.startsWith(q)) return 80;
    if (t.includes(q)) return 60;
    // token overlap
    const qTokens = q.split(/[^a-z0-9]+/).filter(Boolean);
    const tTokens = t.split(/[^a-z0-9]+/).filter(Boolean);
    const overlap = qTokens.filter((x) => tTokens.includes(x)).length;
    if (overlap > 0) return 50 + overlap * 5;
    // small fuzzy length penalty
    const lenDiff = Math.abs(q.length - t.length);
    return Math.max(0, 30 - lenDiff);
  }

  const handleSkillInputChange = (value: string) => {
    setSkillInput(value);
    if (value.trim().length > 0) {
      const q = value.toLowerCase();
      // score remote suggestions by fuzzyScore and filter out already-selected ones
      const scored = REMOTE_SUGGESTIONS
        .filter((s) => !skills.find((sk) => sk.id === s.id))
        .map((s) => ({ s, score: fuzzyScore(q, s.label) }))
        .filter((r) => r.score > 20)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map((r) => r.s);

      // also include exact synonyms mapped to remote suggestions
      const canon = SYNONYMS[value.toLowerCase()];
      if (canon) {
        const ids = Array.isArray(canon) ? canon : [canon];
        ids.forEach((id) => {
          const found = REMOTE_SUGGESTIONS.find((s) => s.id === id);
          if (found && !scored.find((x) => x.id === found.id)) scored.unshift(found);
        });
      }

      setFilteredSuggestions(scored);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const addSkill = (skillLabel: string) => {
    const trimmed = skillLabel.trim();
    if (!trimmed) return;

    // 1) prefer exact match from remote suggestions
    const exact = REMOTE_SUGGESTIONS.find((s) => s.label.toLowerCase() === trimmed.toLowerCase());
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

      // prefer adding remote suggestion objects when available
      const toAdd: Array<{ id: string; label: string }> = [];
      ids.forEach((id) => {
        const remote = REMOTE_SUGGESTIONS.find((s) => s.id === id);
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

    // 2b) try fuzzy match to pick the best remote suggestion automatically
    const q = trimmed.toLowerCase();
    const fuzzyMatches = REMOTE_SUGGESTIONS
      .filter((s) => !skills.find((sk) => sk.id === s.id))
      .map((s) => ({
        s,
        score: Math.max(0, (function fuzzyScoreLocal(qs: string, ts: string) {
          const ql = qs.toLowerCase();
          const tl = ts.toLowerCase();
          if (ql === tl) return 100;
          if (tl.startsWith(ql)) return 80;
          if (tl.includes(ql)) return 60;
          const qTokens = ql.split(/[^a-z0-9]+/).filter(Boolean);
          const tTokens = tl.split(/[^a-z0-9]+/).filter(Boolean);
          const overlap = qTokens.filter((x) => tTokens.includes(x)).length;
          if (overlap > 0) return 50 + overlap * 5;
          return 0;
        })(q, s.label))
      }))
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

    // 3) free-text fallback — send a hyphenated id (may not match backend but preserves user's input)
    const freeId = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (!skills.find((sk) => sk.id === freeId)) {
      setSkills((prev) => [...prev, { id: freeId, label: trimmed }]);
    }
    setSkillInput("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeSkill = (skillIdOrLabel: string) => {
    setSkills((prev) => prev.filter((s) => s.id !== skillIdOrLabel && s.label !== skillIdOrLabel));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      addSkill(skillInput);
    }
    if (e.key === "Backspace" && !skillInput && skills.length > 0) {
      removeSkill(skills[skills.length - 1].id || skills[skills.length - 1].label);
    }
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    // Send canonical skill IDs to the backend
    const skillIds = skills.map((s) => s.id);

    // Persist skills to localStorage for roadmap page
    try {
      localStorage.setItem('pn_user_skills', JSON.stringify(skillIds));
    } catch { /* quota exceeded */ }

    const background = [
      educationLevel && `Education: ${educationLevel}`,
      yearsExperience !== "0" && `${yearsExperience} years of experience`,
      currentField && `Current field: ${currentField}`,
    ]
      .filter(Boolean)
      .join(". ");

    const params = new URLSearchParams({
      skills: skillIds.join(","),
      interests: selectedInterests.join(","),
      ...(background && { background }),
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

  return (
    <div className="max-w-5xl mx-auto">
      {/* ─── Progress Header ─── */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">PN</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Step {step} of 1:{" "}
              Skills & Interests
            </p>
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-emerald-500 to-emerald-700 h-2 rounded-full transition-all duration-500"
            style={{ width: `100%` }}
          />
        </div>
      </div>

      <div className="flex gap-8">
        {/* ─── Main Form ─── */}
        <div className="flex-1 min-w-0">
          {step === 1 && (
            <div className="animate-fade-in-up">
              <div className="card-static p-6 md:p-8 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Tell us about your skills
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  The more specific you are, the better your recommendations.
                </p>

                {/* ─── Free-type Skill Input ─── */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Current Skills <span className="text-red-500">*</span>
                  </label>
                  <div className="relative" ref={suggestionsRef}>
                    <div className="tag-input-container border border-gray-200 rounded-lg px-3 py-2.5 flex flex-wrap gap-2 items-center min-h-[48px] bg-white transition-all cursor-text"
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
                        placeholder={skills.length === 0 ? "Start typing... (e.g., Python, Project Management)" : "Add more skills..."}
                        className="flex-1 min-w-[200px] outline-none text-sm text-gray-700 placeholder:text-gray-400 bg-transparent py-0.5"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">
                      Press Enter to add
                    </p>

                    {/* Autocomplete dropdown */}
                    {showSuggestions && filteredSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 animate-fade-in">
                        {filteredSuggestions.map((suggestion) => (
                          <button
                            key={suggestion.id}
                            onClick={() => addSkill(suggestion.label)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                          >
                            {suggestion.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ─── Interests Checkboxes ─── */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Interests & Passions <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {interests.map((interest) => (
                      <label
                        key={interest.id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all text-sm ${
                          selectedInterests.includes(interest.id)
                            ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                            : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedInterests.includes(interest.id)}
                          onChange={() => toggleInterest(interest.id)}
                          className="sr-only"
                        />
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            selectedInterests.includes(interest.id)
                              ? "bg-emerald-600 border-emerald-600"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {selectedInterests.includes(interest.id) && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="font-medium">{interest.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* ─── Education & Experience Row ─── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Education Level
                    </label>
                    <select
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
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
                      onChange={(e) => setYearsExperience(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </div>

                {/* ─── Current Field ─── */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Current Field/Industry
                  </label>
                  <input
                    type="text"
                    value={currentField}
                    onChange={(e) => setCurrentField(e.target.value)}
                    placeholder="e.g., Software Development, Marketing"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              {/* ─── Action Buttons ─── */}
              <div className="flex items-center justify-between card-static px-6 py-4">
                <button
                  disabled
                  className="px-6 py-2.5 text-sm font-medium text-gray-400 border border-gray-200 rounded-lg cursor-not-allowed"
                >
                  &larr; Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={skills.length === 0 || selectedInterests.length === 0}
                  className="btn-primary text-sm px-8 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Discover My Paths &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── Helpful Tips Sidebar ─── */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-24 card-static p-6 space-y-5">
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide">
              Helpful Tips
            </h3>

            {[
              {
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Be Specific",
                desc: "Instead of \"good with computers\", try \"Python programming\" or \"Excel data analysis\"",
              },
              {
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Include Soft Skills",
                desc: "Don't forget communication, leadership, and other interpersonal abilities",
              },
              {
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "List All Interests",
                desc: "Even if they seem unrelated — our AI finds surprising connections",
              },
            ].map((tip, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {tip.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{tip.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed mt-0.5">
                    {tip.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
