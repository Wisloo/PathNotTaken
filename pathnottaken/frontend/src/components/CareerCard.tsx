"use client";

import { CareerRecommendation } from "@/lib/api";
import { useState } from "react";

interface CareerCardProps {
  career: CareerRecommendation;
  index: number;
}

export default function CareerCard({ career, index }: CareerCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "pros-cons" | "skills">("overview");

  const formatSalary = (amount: number) => {
    if (amount >= 1000) {
      return `$${Math.round(amount / 1000)}k`;
    }
    return `$${amount}`;
  };

  const growthLabel: Record<string, { text: string; color: string }> = {
    "Very High": { text: "Very High", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    High: { text: "High", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    Moderate: { text: "Moderate", color: "text-amber-600 bg-amber-50 border-amber-200" },
    Low: { text: "Low", color: "text-gray-500 bg-gray-50 border-gray-200" },
  };

  const growth = growthLabel[career.growthOutlook] || growthLabel["Moderate"];

  const scoreGradient =
    career.matchScore >= 80
      ? "from-emerald-500 to-emerald-600"
      : career.matchScore >= 60
      ? "from-teal-400 to-emerald-500"
      : "from-slate-400 to-slate-500";

  // Build a richer explanation from skill transfers
  const getDetailedFitExplanation = () => {
    if (!career.skillTransfers || Object.keys(career.skillTransfers).length === 0) {
      return career.explanation;
    }

    const transferredSkills = career.matchedSkills?.filter(s => career.skillTransfers?.[s]) || [];
    if (transferredSkills.length === 0) return career.explanation;

    const parts = transferredSkills.slice(0, 2).map(skill => {
      const explanation = career.skillTransfers![skill];
      return explanation;
    });

    return parts.join('. ') + '.';
  };

  return (
    <div
      className="animate-fade-in-up opacity-0 overflow-hidden flex flex-col group bg-white rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-xl hover:border-emerald-200/60 transition-all duration-500 hover:-translate-y-1"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
    >
      {/* Score accent bar */}
      <div className={`h-1.5 bg-gradient-to-r ${scoreGradient}`} />

      <div className="p-6 flex-1 flex flex-col">
        {/* Header: Title + Score */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="text-lg font-bold text-gray-900 leading-snug mb-2">
              {career.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`badge border ${growth.color}`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
                {growth.text} Growth
              </span>
              <span className="badge bg-gray-50 text-gray-500 border border-gray-200">
                {career.category}
              </span>
            </div>
          </div>

          {/* Match Score Circle */}
          <div className="flex-shrink-0 relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="#f1f5f9" strokeWidth="5" />
              <circle
                cx="32" cy="32" r="28" fill="none"
                stroke={career.matchScore >= 80 ? "#059669" : career.matchScore >= 60 ? "#14b8a6" : "#94a3b8"}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${(career.matchScore / 100) * 175.93} 175.93`}
                className="score-bar-fill"
                style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-extrabold text-gray-900">{career.matchScore}%</span>
            </div>
          </div>
        </div>

        {/* Salary & Growth Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-xl px-3.5 py-2.5">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Salary Range</p>
            <p className="text-sm font-bold text-gray-900">
              {formatSalary(career.salaryRange.min)} – {formatSalary(career.salaryRange.max)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl px-3.5 py-2.5">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Match Level</p>
            <p className="text-sm font-bold text-gray-900">
              {career.matchScore >= 80 ? "Excellent" : career.matchScore >= 60 ? "Strong" : "Good"} Fit
            </p>
          </div>
        </div>

        {/* Why this fits */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
            {getDetailedFitExplanation()}
          </p>
        </div>

        {/* Matched Skills */}
        {career.matchedSkills?.length > 0 && (
          <div className="mb-4">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Your matching skills</p>
            <div className="flex flex-wrap gap-1.5">
              {career.matchedSkills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200/60"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  {skill.replace(/-/g, " ")}
                </span>
              ))}
              {career.matchedSkills.length > 4 && (
                <span className="text-xs text-gray-400 px-2 py-1">
                  +{career.matchedSkills.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Pros & Cons Preview - Always Visible */}
        {(career.pros?.length || career.cons?.length) ? (
          <div className="mb-4 grid grid-cols-2 gap-3">
            {career.pros && career.pros.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Pros
                </p>
                {career.pros.slice(0, 3).map((pro, i) => (
                  <p key={i} className="text-xs text-gray-600 leading-relaxed pl-1.5 border-l-2 border-emerald-200 ml-0.5">
                    {pro}
                  </p>
                ))}
              </div>
            )}
            {career.cons && career.cons.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Cons
                </p>
                {career.cons.slice(0, 3).map((con, i) => (
                  <p key={i} className="text-xs text-gray-600 leading-relaxed pl-1.5 border-l-2 border-amber-200 ml-0.5">
                    {con}
                  </p>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* Expanded info with tabs */}
        {expanded && (
          <div className="animate-fade-in border-t border-gray-100 pt-4 mb-4">
            {/* Tab navigation */}
            <div className="flex gap-1 mb-4 bg-gray-50 rounded-xl p-1">
              {(["overview", "pros-cons", "skills"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    activeTab === tab
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab === "overview" ? "Overview" : tab === "pros-cons" ? "Pros & Cons" : "Skills"}
                </button>
              ))}
            </div>

            {/* Tab: Overview */}
            {activeTab === "overview" && (
              <div className="space-y-4">
                {career.description && (
                  <div>
                    <p className="text-xs font-bold text-gray-800 mb-1.5">What is a {career.title}?</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{career.description}</p>
                  </div>
                )}

                {career.dayInLife && (
                  <div>
                    <p className="text-xs font-bold text-gray-800 mb-1.5">A Day in the Life</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{career.dayInLife}</p>
                  </div>
                )}

                {career.whyNonObvious && (
                  <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3.5">
                    <p className="text-xs font-bold text-amber-800 mb-1 flex items-center gap-1.5">
                      <span>💡</span> Why This Path is Hidden
                    </p>
                    <p className="text-sm text-amber-700/80 leading-relaxed">{career.whyNonObvious}</p>
                  </div>
                )}

                {career.realWorldExamples && career.realWorldExamples.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-800 mb-2">What You'd Actually Work On</p>
                    <div className="space-y-1.5">
                      {career.realWorldExamples.map((example, i) => (
                        <div key={i} className="flex gap-2.5 text-sm text-gray-600">
                          <span className="text-emerald-500 font-bold mt-0.5 flex-shrink-0">→</span>
                          <span className="leading-relaxed">{example}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {career.industries && career.industries.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-800 mb-2">Industries Hiring</p>
                    <div className="flex flex-wrap gap-1.5">
                      {career.industries.map((industry) => (
                        <span key={industry} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200/60">
                          {industry}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {career.typicalBackgrounds && career.typicalBackgrounds.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-800 mb-2">People in This Role Often Studied</p>
                    <div className="flex flex-wrap gap-1.5">
                      {career.typicalBackgrounds.map((bg) => (
                        <span key={bg} className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg border border-purple-200/60">
                          {bg}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {career.careerProgression && career.careerProgression.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-800 mb-2">Career Progression</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {career.careerProgression.map((level, i) => (
                        <span key={level} className="flex items-center gap-1.5">
                          <span className="text-xs bg-gray-50 text-gray-700 px-2.5 py-1 rounded-lg border border-gray-200">{level}</span>
                          {i < career.careerProgression!.length - 1 && (
                            <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {career.entryPaths && career.entryPaths.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-800 mb-2">How to Get Started</p>
                    <div className="space-y-2">
                      {career.entryPaths.map((step, i) => (
                        <div key={i} className="flex gap-3 text-sm text-gray-600">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center justify-center mt-0.5">
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Pros & Cons */}
            {activeTab === "pros-cons" && (
              <div className="space-y-4">
                {career.pros && career.pros.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-emerald-700 mb-2.5 flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      What's Great About This Career
                    </p>
                    <div className="space-y-2">
                      {career.pros.map((pro, i) => (
                        <div key={i} className="flex gap-2.5 items-start bg-emerald-50/60 rounded-xl px-3.5 py-2.5 border border-emerald-100">
                          <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-700 leading-relaxed">{pro}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {career.cons && career.cons.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-amber-700 mb-2.5 flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Things to Consider
                    </p>
                    <div className="space-y-2">
                      {career.cons.map((con, i) => (
                        <div key={i} className="flex gap-2.5 items-start bg-amber-50/60 rounded-xl px-3.5 py-2.5 border border-amber-100">
                          <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.834-2.694-.834-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <span className="text-sm text-gray-700 leading-relaxed">{con}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!career.pros?.length && !career.cons?.length && (
                  <p className="text-sm text-gray-400 text-center py-6">No pros/cons data available for this career yet.</p>
                )}
              </div>
            )}

            {/* Tab: Skills */}
            {activeTab === "skills" && (
              <div className="space-y-4">
                {career.skillTransfers && Object.keys(career.skillTransfers).length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-800 mb-2.5">How Your Skills Transfer</p>
                    <div className="space-y-2">
                      {Object.entries(career.skillTransfers).slice(0, 5).map(([skill, explanation]) => {
                        const isMatched = career.matchedSkills?.includes(skill);
                        return (
                          <div key={skill} className={`rounded-xl px-3.5 py-2.5 border ${isMatched ? 'bg-emerald-50/60 border-emerald-100' : 'bg-gray-50 border-gray-100'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              {isMatched && (
                                <svg className="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                </svg>
                              )}
                              <span className={`text-xs font-bold ${isMatched ? 'text-emerald-700' : 'text-gray-700'}`}>
                                {skill.replace(/-/g, ' ')}
                                {isMatched ? ' — you have this' : ''}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">{explanation}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {career.missingSkills?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-800 mb-2">Skills to Develop</p>
                    <div className="flex flex-wrap gap-1.5">
                      {career.missingSkills.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs font-medium bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-200/60"
                        >
                          {skill.replace(/-/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="px-6 pb-6 space-y-2.5 mt-auto">
        <a
          href={`/roadmap?career=${career.id}`}
          className="group/btn block w-full text-center py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-bold rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 hover:-translate-y-px"
        >
          Start 90-day plan
          <svg className="inline-block w-4 h-4 ml-1.5 group-hover/btn:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all hover:-translate-y-px"
        >
          {expanded ? "Show Less" : "Why This Career?"}
          <svg className={`inline-block w-4 h-4 ml-1.5 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
