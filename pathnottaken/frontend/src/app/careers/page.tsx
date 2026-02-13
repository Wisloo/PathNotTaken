"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CareerRecommendation, fetchAllCareers } from "@/lib/api";

export default function CareersPage() {
  const [careers, setCareers] = useState<CareerRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAllCareers();
        setCareers(data);
      } catch {
        // silently fail
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
    <section className="py-12 md:py-20 bg-surface-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Browse All Careers
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto mb-6">
            Explore our database of non-obvious career paths. Each career sits
            at the intersection of multiple disciplines.
          </p>
          <input
            type="text"
            placeholder="Search careers..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full max-w-md mx-auto px-5 py-3 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-shimmer h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((career, index) => (
              <div
                key={career.id}
                className="animate-fade-in-up opacity-0 bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  animationDelay: `${index * 60}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">
                        {career.title}
                      </h3>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
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
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {career.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="flex flex-wrap gap-1.5">
                      {career.matchedSkills?.slice(0, 4).map((skill: string) => (
                        <span
                          key={skill}
                          className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full border border-brand-200"
                        >
                          {skill.replace(/-/g, " ")}
                        </span>
                      ))}
                      {(career.matchedSkills?.length || 0) > 4 && (
                        <span className="text-xs text-gray-400 px-1">
                          +{(career.matchedSkills?.length || 0) - 4}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
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

        <div className="text-center mt-12">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 bg-brand-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors shadow-sm"
          >
            Get Personalized Recommendations →
          </Link>
        </div>
      </div>
    </section>
  );
}
