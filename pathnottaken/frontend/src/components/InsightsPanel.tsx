"use client";

import { CareerRecommendation } from "@/lib/api";
import Link from "next/link";

interface Props {
  recommendations: CareerRecommendation[];
  userSkills: string[];
  userInterests: string[];
}

export default function InsightsPanel({ recommendations, userSkills, userInterests }: Props) {
  if (recommendations.length === 0) return null;

  // ——— Compute insights ———
  const allMatched = recommendations.flatMap((r) => r.matchedSkills || []);
  const skillCounts: Record<string, number> = {};
  allMatched.forEach((s) => { skillCounts[s] = (skillCounts[s] || 0) + 1; });
  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const allMissing = recommendations.flatMap((r) => r.missingSkills || []);
  const missingCounts: Record<string, number> = {};
  allMissing.forEach((s) => { missingCounts[s] = (missingCounts[s] || 0) + 1; });
  const topMissing = Object.entries(missingCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const avgMatch = Math.round(
    recommendations.reduce((sum, r) => sum + r.matchScore, 0) / recommendations.length
  );

  const highGrowth = recommendations.filter((r) => r.growthOutlook === "High" || r.growthOutlook === "Very High");
  const medians = recommendations
    .map((r) => r.salaryRange.median || Math.round((r.salaryRange.min + r.salaryRange.max) / 2))
    .sort((a, b) => b - a);
  const topSalary = medians[0] ?? 0;

  // Quick wins: careers with highest match score that have ≤ 2 missing skills
  const quickWins = [...recommendations]
    .filter((r) => (r.missingSkills || []).length <= 3)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);

  // Most versatile skill
  const mostVersatile = topSkills[0];

  return (
    <div className="space-y-5">
      {/* AI Insights Panel */}
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border border-indigo-200 p-5">
        <h3 className="text-sm font-bold text-indigo-800 flex items-center gap-2 mb-4">
          🧠 AI Career Insights
        </h3>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center border border-white/60">
            <div className="text-2xl font-bold text-indigo-700">{avgMatch}%</div>
            <div className="text-[10px] text-gray-500 mt-0.5">Avg Match Score</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center border border-white/60">
            <div className="text-2xl font-bold text-emerald-600">{highGrowth.length}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">High Growth Careers</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center border border-white/60">
            <div className="text-2xl font-bold text-amber-600">${(topSalary / 1000).toFixed(0)}K</div>
            <div className="text-[10px] text-gray-500 mt-0.5">Top Median Salary</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center border border-white/60">
            <div className="text-2xl font-bold text-purple-600">{userSkills.length}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">Skills Analyzed</div>
          </div>
        </div>

        {/* Personalized insights */}
        <div className="space-y-3">
          {mostVersatile && (
            <div className="flex items-start gap-3 bg-white/70 rounded-xl p-3">
              <span className="text-lg mt-0.5">💎</span>
              <div>
                <p className="text-xs font-semibold text-gray-700">Your Most Versatile Skill</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  <span className="font-semibold text-indigo-600">{formatLabel(mostVersatile[0])}</span> matches{" "}
                  {mostVersatile[1]} of {recommendations.length} recommended careers — it&apos;s your strongest asset!
                </p>
              </div>
            </div>
          )}

          {topMissing.length > 0 && (
            <div className="flex items-start gap-3 bg-white/70 rounded-xl p-3">
              <span className="text-lg mt-0.5">🎯</span>
              <div>
                <p className="text-xs font-semibold text-gray-700">Highest-Impact Skill to Learn</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Learning <span className="font-semibold text-purple-600">{formatLabel(topMissing[0][0])}</span> would
                  unlock {topMissing[0][1]} more career paths. It&apos;s the single skill with the biggest impact on your options.
                </p>
              </div>
            </div>
          )}

          {highGrowth.length > 0 && (
            <div className="flex items-start gap-3 bg-white/70 rounded-xl p-3">
              <span className="text-lg mt-0.5">📈</span>
              <div>
                <p className="text-xs font-semibold text-gray-700">Market Outlook</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {highGrowth.length === 1
                    ? `${highGrowth[0].title} has high growth potential in the current market.`
                    : `${highGrowth.length} of your matches have high growth potential: ${highGrowth.slice(0, 3).map((r) => r.title).join(", ")}.`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Wins */}
      {quickWins.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-5">
          <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2 mb-1">
            ⚡ Quick Wins — Fastest Paths
          </h3>
          <p className="text-[11px] text-emerald-600/70 mb-4">
            Careers you&apos;re closest to based on your existing skills
          </p>

          <div className="space-y-3">
            {quickWins.map((career) => {
              const total = userSkills.length || 1;
              const matched = career.matchedSkills?.length || 0;
              const missing = career.missingSkills || [];

              return (
                <div key={career.id} className="bg-white/80 rounded-xl p-4 border border-emerald-100">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-semibold text-gray-800">{career.title}</span>
                      <span className="ml-2 text-xs text-emerald-600 font-medium">{career.matchScore}% match</span>
                    </div>
                    <Link
                      href={`/roadmap?career=${career.id}&skills=${userSkills.join(",")}`}
                      className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                    >
                      Start →
                    </Link>
                  </div>

                  <div className="w-full bg-emerald-100 rounded-full h-2 mb-2">
                    <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${career.matchScore}%` }} />
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-gray-400">{matched}/{total} skills ready</span>
                    {missing.length > 0 && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span className="text-[10px] text-gray-400">
                          Learn: {missing.map(formatLabel).join(", ")}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function formatLabel(id: string): string {
  return id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
