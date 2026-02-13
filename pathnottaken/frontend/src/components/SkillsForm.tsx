"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Interest,
  fetchInterests,
} from "@/lib/api";

const SKILL_SUGGESTIONS = [
  "JavaScript", "Python", "TypeScript", "React", "Node.js", "SQL", "Java", "C++",
  "HTML/CSS", "Git", "Docker", "AWS", "Machine Learning", "Data Analysis",
  "Excel", "Tableau", "R", "MATLAB", "Figma", "Adobe Photoshop", "Illustrator",
  "Project Management", "Agile/Scrum", "Communication", "Public Speaking",
  "Leadership", "Problem Solving", "Critical Thinking", "Research",
  "Writing", "Editing", "Teaching", "Mentoring", "Empathy", "Negotiation",
  "Marketing", "SEO", "Social Media", "Accounting", "Financial Analysis",
  "Statistics", "Biology", "Chemistry", "Physics", "Psychology",
  "Graphic Design", "UX Design", "UI Design", "3D Modeling", "Animation",
  "Video Editing", "Photography", "Music Production", "Creative Writing",
  "Spanish", "French", "Mandarin", "Japanese", "German",
  "Customer Service", "Sales", "Business Development", "Strategy",
  "Supply Chain", "Operations", "HR", "Recruiting",
  "Cybersecurity", "Networking", "Linux", "Kubernetes",
  "TensorFlow", "PyTorch", "NLP", "Computer Vision",
  "Blockchain", "Smart Contracts", "Solidity",
  "GIS", "AutoCAD", "Civil Engineering", "Mechanical Engineering",
];

export default function SkillsForm() {
  const router = useRouter();
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
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
        const ints = await fetchInterests();
        setInterests(ints);
        setLoading(false);
      } catch {
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

  const handleSkillInputChange = (value: string) => {
    setSkillInput(value);
    if (value.trim().length > 0) {
      const filtered = SKILL_SUGGESTIONS.filter(
        (s) =>
          s.toLowerCase().includes(value.toLowerCase()) &&
          !skills.includes(s)
      ).slice(0, 6);
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setSkillInput("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      addSkill(skillInput);
    }
    if (e.key === "Backspace" && !skillInput && skills.length > 0) {
      removeSkill(skills[skills.length - 1]);
    }
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    // Map free-typed skills to closest matching IDs for the backend
    const skillIds = skills.map((s) => s.toLowerCase().replace(/[\s/]+/g, "-"));
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
          <div className="w-9 h-9 bg-brand-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">PN</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Step {step} of 2:{" "}
              {step === 1 ? "Skills & Interests" : "Preferences"}
            </p>
          </div>
        </div>
        <div className="w-full bg-surface-200 rounded-full h-2">
          <div
            className="bg-brand-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex gap-8">
        {/* ─── Main Form ─── */}
        <div className="flex-1 min-w-0">
          {step === 1 && (
            <div className="animate-fade-in-up">
              <div className="bg-white border border-surface-200 rounded-xl p-6 md:p-8 mb-6">
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
                    <div className="tag-input-container border border-surface-200 rounded-lg px-3 py-2.5 flex flex-wrap gap-2 items-center min-h-[48px] bg-white transition-all cursor-text"
                      onClick={() => inputRef.current?.focus()}
                    >
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 text-sm font-medium px-3 py-1 rounded-full border border-brand-200 animate-scale-in"
                        >
                          {skill}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSkill(skill);
                            }}
                            className="text-brand-400 hover:text-brand-700 transition-colors"
                            aria-label={`Remove ${skill}`}
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
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-surface-200 rounded-lg shadow-lg z-20 py-1 animate-fade-in">
                        {filteredSuggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => addSkill(suggestion)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                          >
                            {suggestion}
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
                  <div className="grid grid-cols-2 gap-2.5">
                    {interests.map((interest) => (
                      <label
                        key={interest.id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all text-sm ${
                          selectedInterests.includes(interest.id)
                            ? "bg-brand-50 border-brand-300 text-brand-700"
                            : "bg-white border-surface-200 text-gray-600 hover:border-surface-300"
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
                              ? "bg-brand-600 border-brand-600"
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
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Education Level
                    </label>
                    <select
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value)}
                      className="w-full px-4 py-2.5 border border-surface-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 appearance-none cursor-pointer"
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
                      className="w-full px-4 py-2.5 border border-surface-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
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
                    className="w-full px-4 py-2.5 border border-surface-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>

              {/* ─── Action Buttons ─── */}
              <div className="flex items-center justify-between bg-white border border-surface-200 rounded-xl px-6 py-4">
                <button
                  disabled
                  className="px-6 py-2.5 text-sm font-medium text-gray-400 border border-surface-200 rounded-lg cursor-not-allowed"
                >
                  &larr; Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={skills.length === 0 || selectedInterests.length === 0}
                  className="px-8 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Discover My Paths &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── Helpful Tips Sidebar ─── */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-24 bg-white border border-surface-200 rounded-xl p-6 space-y-5">
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
                <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center flex-shrink-0 mt-0.5">
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
