"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import CareerCard from "@/components/CareerCard";
import CareerComparisonTool from "@/components/CareerComparisonTool";
import InsightsPanel from "@/components/InsightsPanel";
import SkillTransferVisualizer from "@/components/SkillTransferVisualizer";
import { CareerRecommendation, fetchRecommendations } from "@/lib/api";

function ResultsContent() {
  const searchParams = useSearchParams();
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [sortBy, setSortBy] = useState("best-match");
  const [salaryMin, setSalaryMin] = useState(30000);
  const [growthFilter, setGrowthFilter] = useState("Any");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const skills = searchParams.get("skills")?.split(",").filter(Boolean) || [];
  const interests = searchParams.get("interests")?.split(",").filter(Boolean) || [];
  const background = searchParams.get("background") || undefined;
  const currentField = searchParams.get("currentField") || undefined;

  useEffect(() => {
    async function loadResults() {
      try {
        if (skills.length === 0 || interests.length === 0) {
          setError("Please select at least one skill and one interest.");
          setLoading(false);
          return;
        }
        const result = await fetchRecommendations(skills, interests, background, currentField);
        setRecommendations(result.recommendations);
        setSource(result.source);
      } catch {
        setError("Failed to get recommendations. Is the backend running?");
      }
      setLoading(false);
    }
    loadResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply filters and sorting
  const filtered = recommendations
    .filter((c) => {
      if (c.salaryRange.max < salaryMin) return false;
      if (growthFilter !== "Any" && c.growthOutlook !== growthFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = c.title.toLowerCase().includes(q);
        const categoryMatch = c.category?.toLowerCase().includes(q);
        const skillMatch = (c.requiredSkills ?? []).some(s => s.toLowerCase().includes(q));
        if (!titleMatch && !categoryMatch && !skillMatch) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "best-match") return b.matchScore - a.matchScore;
      if (sortBy === "salary-high") return b.salaryRange.max - a.salaryRange.max;
      if (sortBy === "salary-low") return a.salaryRange.min - b.salaryRange.min;
      if (sortBy === "growth") {
        const growthOrder: Record<string, number> = { "Very High": 4, "High": 3, "Moderate": 2, "Low": 1 };
        return (growthOrder[b.growthOutlook] || 0) - (growthOrder[a.growthOutlook] || 0);
      }
      return 0;
    });

  if (loading) {
    return (
      <section className="py-12 md:py-20 min-h-screen bg-[#fafbfc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-10 h-10 border-[3px] border-gray-200 border-t-emerald-600 rounded-full animate-spin" />
              <span className="text-lg font-semibold text-gray-700">
                Discovering your hidden paths...
              </span>
            </div>
            <p className="text-sm text-gray-400">Analyzing skills and matching careers</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-shimmer h-80 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 md:py-20 min-h-screen bg-[#fafbfc]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="card-static p-10 border-red-200 bg-red-50">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.834-2.694-.834-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-red-800 mb-2">Something went wrong</h3>
            <p className="text-sm text-red-600 mb-6">{error}</p>
            <Link
              href="/explore"
              className="btn-primary"
            >
              &larr; Try Again
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // Best match for hero display
  const bestMatch = filtered.length > 0 ? filtered[0] : null;
  const avgMatch = filtered.length > 0
    ? Math.round(filtered.reduce((sum, r) => sum + r.matchScore, 0) / filtered.length)
    : 0;

  return (
    <section className="min-h-screen bg-[#fafbfc]">
      {/* Personalized Hero Banner */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-48 h-48 bg-teal-500/15 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="animate-fade-in-up">
              <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">Your Career Discovery</p>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2">
                We found <span className="text-emerald-400">{filtered.length}</span> hidden paths for you
              </h1>
              <p className="text-gray-400 text-sm max-w-lg">
                Based on your {skills.length} skill{skills.length !== 1 ? 's' : ''} and {interests.length} interest{interests.length !== 1 ? 's' : ''},
                here are career paths most people never consider.
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {skills.slice(0, 5).map((skill) => (
                  <span key={skill} className="text-xs font-medium bg-white/10 text-white/80 px-2.5 py-1 rounded-lg border border-white/10 backdrop-blur-sm">
                    {skill.replace(/-/g, " ")}
                  </span>
                ))}
                {skills.length > 5 && (
                  <span className="text-xs text-gray-500">+{skills.length - 5} more</span>
                )}
              </div>
            </div>

            {/* Stats cards */}
            <div className="flex gap-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3 text-center min-w-[80px]">
                <p className="text-2xl font-extrabold text-emerald-400">{bestMatch?.matchScore || 0}%</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Top Match</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3 text-center min-w-[80px]">
                <p className="text-2xl font-extrabold text-white">{avgMatch}%</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Avg Match</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3 text-center min-w-[80px]">
                <p className="text-2xl font-extrabold text-teal-400">{filtered.filter(r => r.growthOutlook === 'High' || r.growthOutlook === 'Very High').length}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">High Growth</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="sticky top-16 z-30 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search careers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white focus:outline-none focus:border-emerald-500 transition-all"
            >
              <option value="best-match">Best Match</option>
              <option value="salary-high">Highest Salary</option>
              <option value="salary-low">Lowest Salary</option>
              <option value="growth">Highest Growth</option>
            </select>
          </div>
          <Link
            href="/explore"
            className="hidden sm:flex px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Refine
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* ─── Sidebar Filters ─── */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="sticky top-32 card-static p-5 space-y-6">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </h3>

              {/* Salary Range */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Salary Range
                </label>
                <input
                  type="range"
                  min={30000}
                  max={200000}
                  step={10000}
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>$30k</span>
                  <span className="font-medium text-emerald-600">
                    ${Math.round(salaryMin / 1000)}k+
                  </span>
                  <span>$200k+</span>
                </div>
              </div>

              {/* Growth Potential */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Growth Potential
                </label>
                <select
                  value={growthFilter}
                  onChange={(e) => setGrowthFilter(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50 transition-all"
                >
                  <option value="Any">Any</option>
                  <option value="Very High">Very High</option>
                  <option value="High">High</option>
                  <option value="Moderate">Moderate</option>
                </select>
              </div>

              {/* Reset */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => {
                    setSalaryMin(30000);
                    setGrowthFilter("Any");
                  }}
                  className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl transition-colors hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>
            </div>
          </aside>

          {/* ─── Main Content ─── */}
          <div className="flex-1 min-w-0">

            {/* Mobile filter toggle */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="lg:hidden w-full mb-4 py-3 card-static text-sm font-medium text-gray-700 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {filtersOpen ? "Hide Filters" : "Show Filters"}
            </button>

            {/* Mobile filters */}
            {filtersOpen && (
              <div className="lg:hidden card-static p-5 mb-4 space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Salary Range</label>
                    <input type="range" min={30000} max={200000} step={10000} value={salaryMin} onChange={(e) => setSalaryMin(Number(e.target.value))} className="w-full accent-emerald-600" />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>$30k</span>
                      <span className="font-medium text-emerald-600">${Math.round(salaryMin / 1000)}k+</span>
                      <span>$200k+</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Growth Potential</label>
                    <select value={growthFilter} onChange={(e) => setGrowthFilter(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white">
                      <option value="Any">Any</option>
                      <option value="Very High">Very High</option>
                      <option value="High">High</option>
                      <option value="Moderate">Moderate</option>
                    </select>
                  </div>
                </div>
                <button onClick={() => { setSalaryMin(30000); setGrowthFilter("Any"); }} className="text-sm text-gray-500 hover:text-gray-700">Reset filters</button>
              </div>
            )}

            {/* ── AI Insights + Quick Wins ── */}
            {filtered.length > 0 && (
              <div className="mb-6">
                <InsightsPanel
                  recommendations={filtered}
                  userSkills={skills}
                  userInterests={interests}
                />
              </div>
            )}

            {/* ── Skill Transfer Visualizer (top match) ── */}
            {filtered.length > 0 && filtered[0].matchedSkills && (
              <div className="mb-6">
                <SkillTransferVisualizer
                  userSkills={skills}
                  careerSkills={filtered[0].requiredSkills || []}
                  matchedSkills={filtered[0].matchedSkills || []}
                  careerTitle={filtered[0].title}
                  skillTransfers={filtered[0].skillTransfers}
                />
              </div>
            )}

            {/* ── Career Comparison Tool ── */}
            {filtered.length >= 2 && (
              <div className="mb-6">
                <CareerComparisonTool careers={filtered} userSkills={skills} />
              </div>
            )}

            {/* Cards Grid */}
            {filtered.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {filtered.map((career, index) => (
                  <CareerCard key={career.id} career={career} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 card-static">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">
                  No matches found
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  Try adjusting your filters or adding more skills.
                </p>
                <Link
                  href="/explore"
                  className="btn-primary"
                >
                  &larr; Adjust Your Profile
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <section className="py-12 md:py-20 min-h-screen bg-[#fafbfc]">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="w-10 h-10 border-[3px] border-gray-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
          </div>
        </section>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
