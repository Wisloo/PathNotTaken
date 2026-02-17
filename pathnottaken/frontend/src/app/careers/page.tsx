"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CareerRecommendation, fetchAllCareers } from "@/lib/api";

export default function CareersPage() {
  const [careers, setCareers] = useState<CareerRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAllCareers();
        setCareers(data);
      } catch {
        setError("Unable to load careers. Please check your connection and try again.");
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = careers.filter(
    (c) =>
      c.title.toLowerCase().includes(filter.toLowerCase()) ||
      c.category.toLowerCase().includes(filter.toLowerCase())
  );

  const formatSalary = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);

  const growthColors: Record<string, string> = {
    "Very High": "bg-green-100 text-green-800",
    High: "bg-emerald-100 text-emerald-800",
    Moderate: "bg-yellow-100 text-yellow-800",
    Low: "bg-gray-100 text-gray-600",
  };

  return (
    <section className="py-12 md:py-20 bg-[#fafbfc] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-emerald-600 tracking-wide uppercase mb-3">Career Library</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            Browse All <span className="gradient-text">Careers</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto mb-8">
            Explore our database of {careers.length}+ non-obvious career paths. Each career sits
            at the intersection of multiple disciplines.
          </p>
          <div className="relative w-full max-w-md mx-auto">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search careers or categories..."
              aria-label="Search careers"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-11 pr-5 py-3.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all shadow-sm"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-8">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-shimmer h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((career, index) => (
              <Link
                key={career.id}
                href={`/career-detail?id=${career.id}`}
                className="animate-fade-in-up opacity-0 block bg-white border border-gray-200/60 rounded-2xl p-5 hover:shadow-lg hover:border-emerald-200/60 transition-all duration-300 hover:-translate-y-0.5 group"
                style={{
                  animationDelay: `${index * 60}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                        {career.title}
                      </h3>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          growthColors[career.growthOutlook] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {career.growthOutlook}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {career.category} • {formatSalary(career.salaryRange.min)}{" "}
                      – {formatSalary(career.salaryRange.max)}
                      {career.salaryRange.median && (
                        <span className="text-emerald-600 font-medium"> (median {formatSalary(career.salaryRange.median)})</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {career.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {(career.requiredSkills || career.matchedSkills || []).slice(0, 4).map((skill: string) => (
                        <span
                          key={skill}
                          className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200/60"
                        >
                          {skill.replace(/-/g, " ")}
                        </span>
                      ))}
                      {((career.requiredSkills || career.matchedSkills || []).length) > 4 && (
                        <span className="text-xs text-gray-400 px-1">
                          +{(career.requiredSkills || career.matchedSkills || []).length - 4}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-emerald-600 group-hover:text-emerald-700 font-semibold flex items-center gap-1">
                      View details
                      <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  No careers match your search. Try a different term.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-14">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-3.5 rounded-xl font-bold hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 hover:-translate-y-px group"
          >
            Get Personalized Recommendations
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
