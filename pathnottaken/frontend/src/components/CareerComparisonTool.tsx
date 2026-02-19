"use client";

import { useState } from "react";
import { CareerRecommendation } from "@/lib/api";

interface Props {
  careers: CareerRecommendation[];
  userSkills: string[];
}

export default function CareerComparisonTool({ careers, userSkills }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [limitHint, setLimitHint] = useState(false);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        setLimitHint(false);
        return prev.filter((s) => s !== id);
      }
      if (prev.length >= 3) {
        setLimitHint(true);
        setTimeout(() => setLimitHint(false), 2500);
        return prev;
      }
      setLimitHint(false);
      return [...prev, id];
    });
  };

  const compared = careers.filter((c) => selected.includes(c.id));

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-3.5 px-5 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl text-sm font-medium text-indigo-700 hover:from-indigo-100 hover:to-purple-100 transition-all flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        ⚖️ Compare Careers Side-by-Side
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-indigo-800 flex items-center gap-2">
            ⚖️ Career Comparison Tool
          </h3>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <p className="text-xs text-indigo-600/70 mt-1">
          Select up to 3 careers to compare
          {limitHint && <span className="ml-2 text-amber-600 font-semibold animate-pulse">— Maximum 3 reached! Deselect one first.</span>}
        </p>

        {/* Career selector chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {careers.map((c) => (
            <button
              key={c.id}
              onClick={() => toggleSelect(c.id)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                selected.includes(c.id)
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>
      </div>

      {compared.length >= 2 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Metric</th>
                {compared.map((c) => (
                  <th key={c.id} className="text-center px-4 py-3 text-xs font-semibold text-gray-700 min-w-[140px]">
                    {c.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Match Score */}
              <tr>
                <td className="px-4 py-3 text-xs font-medium text-gray-500">Match Score</td>
                {compared.map((c) => (
                  <td key={c.id} className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center justify-center w-12 h-12 rounded-xl text-lg font-bold ${
                      c.matchScore >= 70 ? 'bg-emerald-100 text-emerald-700' :
                      c.matchScore >= 50 ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {c.matchScore}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Salary */}
              <tr className="bg-gray-50/50">
                <td className="px-4 py-3 text-xs font-medium text-gray-500">Median Salary</td>
                {compared.map((c) => {
                  const maxSalary = Math.max(...compared.map(x => x.salaryRange.median || x.salaryRange.max));
                  const salary = c.salaryRange.median || Math.round((c.salaryRange.min + c.salaryRange.max) / 2);
                  return (
                    <td key={c.id} className="px-4 py-3 text-center">
                      <div className={`font-bold text-base ${salary === maxSalary ? 'text-emerald-600' : 'text-gray-700'}`}>
                        ${(salary / 1000).toFixed(0)}K
                        {salary === maxSalary && <span className="ml-1 text-xs">👑</span>}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        ${(c.salaryRange.min / 1000).toFixed(0)}K – ${(c.salaryRange.max / 1000).toFixed(0)}K
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Growth */}
              <tr>
                <td className="px-4 py-3 text-xs font-medium text-gray-500">Growth</td>
                {compared.map((c) => (
                  <td key={c.id} className="px-4 py-3 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                      c.growthOutlook === 'Very High' ? 'bg-emerald-100 text-emerald-700' :
                      c.growthOutlook === 'High' ? 'bg-emerald-100 text-emerald-700' :
                      c.growthOutlook === 'Moderate' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {c.growthOutlook === 'Very High' || c.growthOutlook === 'High' ? '📈 ' : c.growthOutlook === 'Moderate' ? '📊 ' : '📉 '}
                      {c.growthOutlook}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Skill Overlap */}
              <tr className="bg-gray-50/50">
                <td className="px-4 py-3 text-xs font-medium text-gray-500">Your Skill Match</td>
                {compared.map((c) => {
                  const overlap = c.matchedSkills?.length || 0;
                  const total = userSkills.length || 1;
                  const pct = Math.round((overlap / total) * 100);
                  return (
                    <td key={c.id} className="px-4 py-3 text-center">
                      <div className="w-full bg-gray-100 rounded-full h-2 mb-1.5">
                        <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{overlap}/{total} skills ({pct}%)</span>
                    </td>
                  );
                })}
              </tr>

              {/* Skills to Learn */}
              <tr>
                <td className="px-4 py-3 text-xs font-medium text-gray-500">Skills to Learn</td>
                {compared.map((c) => (
                  <td key={c.id} className="px-4 py-3 text-center">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {(c.missingSkills || []).slice(0, 4).map((s) => (
                        <span key={s} className="text-[10px] px-2 py-0.5 bg-red-50 text-red-600 rounded-full border border-red-100">
                          {s.replace(/-/g, " ")}
                        </span>
                      ))}
                      {(c.missingSkills || []).length > 4 && (
                        <span className="text-[10px] text-gray-400">+{c.missingSkills!.length - 4} more</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Category */}
              <tr className="bg-gray-50/50">
                <td className="px-4 py-3 text-xs font-medium text-gray-500">Category</td>
                {compared.map((c) => (
                  <td key={c.id} className="px-4 py-3 text-center text-xs text-gray-600">{c.category}</td>
                ))}
              </tr>

              {/* Pros */}
              <tr>
                <td className="px-4 py-3 text-xs font-medium text-gray-500">Top Pros</td>
                {compared.map((c) => (
                  <td key={c.id} className="px-4 py-3">
                    <ul className="space-y-1">
                      {(c.pros || []).slice(0, 3).map((p, i) => (
                        <li key={i} className="text-[11px] text-gray-600 flex items-start gap-1">
                          <span className="text-emerald-500 mt-0.5">✓</span>
                          <span>{p.length > 60 ? p.slice(0, 57) + "…" : p}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>

              {/* Cons */}
              <tr className="bg-gray-50/50">
                <td className="px-4 py-3 text-xs font-medium text-gray-500">Top Cons</td>
                {compared.map((c) => (
                  <td key={c.id} className="px-4 py-3">
                    <ul className="space-y-1">
                      {(c.cons || []).slice(0, 3).map((p, i) => (
                        <li key={i} className="text-[11px] text-gray-600 flex items-start gap-1">
                          <span className="text-red-400 mt-0.5">✗</span>
                          <span>{p.length > 60 ? p.slice(0, 57) + "…" : p}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {compared.length < 2 && (
        <div className="p-8 text-center text-gray-400 text-sm">
          Select at least 2 careers above to see a side-by-side comparison
        </div>
      )}
    </div>
  );
}
