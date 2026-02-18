"use client";

import { useState } from "react";

interface Props {
  userSkills: string[];
  careerSkills: string[];
  matchedSkills: string[];
  careerTitle: string;
  skillTransfers?: Record<string, string>;
}

export default function SkillTransferVisualizer({
  userSkills,
  careerSkills,
  matchedSkills,
  careerTitle,
  skillTransfers,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const matchedSet = new Set(matchedSkills.map((s) => s.toLowerCase()));
  const careerSet = new Set(careerSkills.map((s) => s.toLowerCase()));

  // User skills that directly transfer to the career
  const transferring = userSkills.filter((s) => matchedSet.has(s.toLowerCase()));
  // User skills that don't match but still valuable
  const bonusSkills = userSkills.filter(
    (s) => !matchedSet.has(s.toLowerCase()) && !careerSet.has(s.toLowerCase())
  );
  // Career skills the user needs to learn
  const toLearn = careerSkills.filter((s) => !matchedSet.has(s.toLowerCase()));

  const coverage = careerSkills.length > 0
    ? Math.round((matchedSkills.length / careerSkills.length) * 100)
    : 0;

  // Determine strength label
  const strengthLabel =
    coverage >= 75 ? "Excellent" : coverage >= 50 ? "Strong" : coverage >= 25 ? "Good" : "Growing";
  const strengthColor =
    coverage >= 75
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : coverage >= 50
      ? "text-blue-700 bg-blue-50 border-blue-200"
      : coverage >= 25
      ? "text-amber-700 bg-amber-50 border-amber-200"
      : "text-orange-700 bg-orange-50 border-orange-200";

  const barColor =
    coverage >= 75
      ? "from-emerald-400 to-emerald-600"
      : coverage >= 50
      ? "from-blue-400 to-blue-600"
      : coverage >= 25
      ? "from-amber-400 to-amber-500"
      : "from-orange-400 to-orange-500";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Skill Transfer Analysis</h3>
            <p className="text-xs text-gray-400">
              How your skills align with <span className="font-medium text-gray-600">{careerTitle}</span>
            </p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${strengthColor}`}>
          {strengthLabel} — {coverage}% match
        </span>
      </div>

      {/* Coverage bar */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-500 font-medium">
            {transferring.length} of {careerSkills.length} required skills covered
          </span>
          <span className="text-xs font-bold text-gray-700">{coverage}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className={`bg-gradient-to-r ${barColor} h-2.5 rounded-full transition-all duration-700`}
            style={{ width: `${coverage}%` }}
          />
        </div>
      </div>

      {/* Three-column breakdown */}
      <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Column 1: Transferring skills */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-800">Skills You&apos;ll Transfer</p>
              <p className="text-[10px] text-emerald-600">{transferring.length} skill{transferring.length !== 1 ? "s" : ""} ready</p>
            </div>
          </div>
          {transferring.length > 0 ? (
            <div className="space-y-1.5">
              {transferring.map((skill) => (
                <div
                  key={skill}
                  className="group relative flex items-center gap-2 bg-white/80 rounded-lg px-3 py-2 border border-emerald-100 hover:border-emerald-300 transition-all cursor-default"
                >
                  <span className="text-xs">✅</span>
                  <span className="text-xs font-medium text-emerald-800">{fmt(skill)}</span>
                  {skillTransfers?.[skill] && (
                    <div className="hidden group-hover:block absolute left-0 top-full mt-1 z-20 w-56 p-2.5 bg-gray-900 text-white text-xs rounded-lg shadow-lg leading-relaxed">
                      {skillTransfers[skill]}
                      <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-600 italic">This is a brand new area for you — exciting!</p>
          )}
        </div>

        {/* Column 2: Skills to learn */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-amber-800">Skills to Learn</p>
              <p className="text-[10px] text-amber-600">{toLearn.length} skill{toLearn.length !== 1 ? "s" : ""} to develop</p>
            </div>
          </div>
          {toLearn.length > 0 ? (
            <div className="space-y-1.5">
              {(expanded ? toLearn : toLearn.slice(0, 5)).map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-2 bg-white/80 rounded-lg px-3 py-2 border border-amber-100"
                >
                  <span className="text-xs">📚</span>
                  <span className="text-xs font-medium text-amber-800">{fmt(skill)}</span>
                </div>
              ))}
              {!expanded && toLearn.length > 5 && (
                <button
                  onClick={() => setExpanded(true)}
                  className="text-xs text-amber-600 hover:text-amber-700 font-medium mt-1"
                >
                  +{toLearn.length - 5} more skills...
                </button>
              )}
            </div>
          ) : (
            <p className="text-xs text-amber-600 italic">You already have all the required skills!</p>
          )}
        </div>

        {/* Column 3: Your advantage / bonus */}
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-800">Your Edge</p>
              <p className="text-[10px] text-indigo-600">{bonusSkills.length} bonus skill{bonusSkills.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          {bonusSkills.length > 0 ? (
            <div className="space-y-1.5">
              {bonusSkills.slice(0, 5).map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-2 bg-white/80 rounded-lg px-3 py-2 border border-indigo-100"
                >
                  <span className="text-xs">⭐</span>
                  <span className="text-xs font-medium text-indigo-800">{fmt(skill)}</span>
                </div>
              ))}
              {bonusSkills.length > 5 && (
                <p className="text-[10px] text-indigo-500 mt-1">+{bonusSkills.length - 5} more</p>
              )}
              <p className="text-[10px] text-indigo-600 mt-2 leading-relaxed">
                These skills give you a unique advantage that other candidates may lack.
              </p>
            </div>
          ) : (
            <p className="text-xs text-indigo-600 leading-relaxed">
              All your skills directly apply to this career — you&apos;re a focused fit!
            </p>
          )}
        </div>
      </div>

      {/* Bottom summary */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-500 leading-relaxed">
          {coverage >= 75 ? (
            <>🎯 <strong className="text-gray-700">Excellent fit.</strong> You already have most skills needed. Focus your roadmap on deepening {toLearn.length > 0 ? `the ${toLearn.length} remaining skill${toLearn.length !== 1 ? "s" : ""}` : "your expertise"}.</>
          ) : coverage >= 50 ? (
            <>💪 <strong className="text-gray-700">Strong foundation.</strong> Your {transferring.length} transferable skills give you a solid head start. A focused {toLearn.length <= 3 ? "few weeks" : "12-week plan"} could bridge the gap.</>
          ) : coverage >= 25 ? (
            <>🌱 <strong className="text-gray-700">Great starting point.</strong> You have {transferring.length} relevant skill{transferring.length !== 1 ? "s" : ""}. The roadmap below will guide you through the {toLearn.length} new skills step by step.</>
          ) : (
            <>🚀 <strong className="text-gray-700">New adventure ahead!</strong> This is a fresh direction — your {bonusSkills.length > 0 ? `${bonusSkills.length} bonus skills give you a unique edge` : "diverse background will bring fresh perspective"}. The roadmap has everything you need.</>
          )}
        </p>
      </div>
    </div>
  );
}

function fmt(id: string): string {
  return id
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bCi Cd\b/i, "CI/CD")
    .replace(/\bUi\b/g, "UI")
    .replace(/\bUx\b/g, "UX")
    .replace(/\bAi\b/g, "AI")
    .replace(/\bApi\b/g, "API")
    .replace(/\bDevops\b/g, "DevOps")
    .replace(/\bGis\b/g, "GIS");
}
