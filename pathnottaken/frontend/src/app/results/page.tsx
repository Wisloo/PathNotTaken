"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import CareerCard from "@/components/CareerCard";
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

  const skills = searchParams.get("skills")?.split(",") || [];
  const interests = searchParams.get("interests")?.split(",") || [];
  const background = searchParams.get("background") || undefined;

  useEffect(() => {
    async function loadResults() {
      try {
        if (skills.length === 0 || interests.length === 0) {
          setError("Please select at least one skill and one interest.");
          setLoading(false);
          return;
        }
        const result = await fetchRecommendations(skills, interests, background);
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
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "best-match") return b.matchScore - a.matchScore;
      if (sortBy === "salary-high") return b.salaryRange.max - a.salaryRange.max;
      if (sortBy === "salary-low") return a.salaryRange.min - b.salaryRange.min;
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

  return (
    <section className="min-h-screen bg-[#fafbfc]">
      {/* Header bar */}
      <div className="backdrop-blur-xl bg-white/70 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/20">
            <span className="text-white font-extrabold text-sm">PN</span>
          </div>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search careers..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* ─── Sidebar Filters ─── */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="sticky top-24 card-static p-5 space-y-6">
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
            {/* Results Header */}
            <div className="card-static p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-gray-900 mb-1">
                    We found{" "}
                    <span className="gradient-text">{filtered.length}</span>{" "}
                    alternative career paths for you
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs text-gray-400">Your top skills:</span>
                    {skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="text-xs font-medium bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200/60"
                      >
                        {skill.replace(/-/g, " ")}
                      </span>
                    ))}
                    {skills.length > 4 && (
                      <span className="text-xs text-gray-400">+{skills.length - 4}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white focus:outline-none focus:border-emerald-500 transition-all"
                    >
                      <option value="best-match">Best Match</option>
                      <option value="salary-high">Highest Salary</option>
                      <option value="salary-low">Lowest Salary</option>
                    </select>
                  </div>
                  <Link
                    href="/explore"
                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Refine Search
                  </Link>
                </div>
              </div>
            </div>

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
