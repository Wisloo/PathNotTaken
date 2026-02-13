"use client";

import { CareerRecommendation } from "@/lib/api";
import { useState } from "react";

interface CareerCardProps {
  career: CareerRecommendation;
  index: number;
}

export default function CareerCard({ career, index }: CareerCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formatSalary = (amount: number) => {
    if (amount >= 1000) {
      return `$${Math.round(amount / 1000)}k`;
    }
    return `$${amount}`;
  };

  const growthPercent: Record<string, string> = {
    "Very High": "20%+",
    High: "15%",
    Moderate: "8%",
    Low: "3%",
  };

  const scoreColor =
    career.matchScore >= 80
      ? "bg-brand-600"
      : career.matchScore >= 60
      ? "bg-emerald-500"
      : "bg-slate-400";

  return (
    <div
      className="animate-fade-in-up opacity-0 bg-white border border-surface-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "forwards" }}
    >
      <div className="p-5 flex-1 flex flex-col">
        {/* Title + Fav */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-900 leading-tight pr-2">
              {career.title}
            </h3>
            <div className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12l5-5 5 5M12 19V6"/></svg>
              {career.growthOutlook || 'Growth'}
            </div>
          </div>

          <button
            className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5"
            aria-label="Save career"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
        </div>

        {/* Match Score */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="text-2xl font-extrabold text-brand-600">
              {career.matchScore}%
            </span>
            <span className="text-xs text-gray-400 font-medium">Match Score</span>
          </div>
          <div className="w-full bg-surface-100 rounded-full h-2">
            <div
              className={`score-bar-fill h-2 rounded-full ${scoreColor}`}
              style={{ width: `${career.matchScore}%` }}
            />
          </div>
        </div>

        {/* Salary & Growth */}
        <div className="flex items-center gap-x-6 mb-4 text-sm">
          <div>
            <span className="text-gray-400 text-xs">Salary:</span>
            <span className="ml-2 font-semibold text-gray-900">
              {formatSalary(career.salaryRange.min)} – {formatSalary(career.salaryRange.max)}
            </span>
          </div>
          <div>
            <span className="text-gray-400 text-xs">Growth:</span>
            <span className="ml-2 font-semibold text-green-600">
              ↑ {growthPercent[career.growthOutlook] || "N/A"} annually
            </span>
          </div>
        </div>

        {/* Why this fits */}
        {career.explanation && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 mb-1">
              Why this fits:
            </p>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
              {career.explanation}
            </p>
          </div>
        )}

        {/* Matched Skills */}
        {career.matchedSkills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
            {career.matchedSkills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="text-xs font-medium bg-green-50 text-green-700 px-2.5 py-1 rounded-md border border-green-200"
              >
                {skill.replace(/-/g, " ")}
              </span>
            ))}
            {career.matchedSkills.length > 4 && (
              <span className="text-xs text-gray-400 px-1 py-1">
                +{career.matchedSkills.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Expanded info */}
        {expanded && (
          <div className="animate-fade-in space-y-3 mb-4 border-t border-surface-200 pt-4">
            {career.dayInLife && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">A Day in the Life</p>
                <p className="text-xs text-gray-500 leading-relaxed">{career.dayInLife}</p>
              </div>
            )}
            {career.whyNonObvious && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">Why This Path is Hidden</p>
                <p className="text-xs text-gray-500 leading-relaxed">{career.whyNonObvious}</p>
              </div>
            )}
            {career.missingSkills?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">Skills to Develop</p>
                <div className="flex flex-wrap gap-1.5">
                  {career.missingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md border border-amber-200"
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

      {/* Learn More button */}
      <div className="px-5 pb-5 space-y-2">
        <a href={`/roadmap?career=${career.id}`} className="block w-full text-center py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-500 transition-colors">Start 90‑day plan</a>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-2.5 bg-brand-950 text-white text-sm font-semibold rounded-lg hover:bg-brand-800 transition-colors"
        >
          {expanded ? "Show Less" : "Learn More"}
        </button>
      </div>
    </div>
  );
}
