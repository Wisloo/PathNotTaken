"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import MarketInsights from "@/components/MarketInsights";
import CareerTransitionAnalyzer from "@/components/CareerTransitionAnalyzer";
import SkillGapVisualizer from "@/components/SkillGapVisualizer";
import GamificationWidget from "@/components/GamificationWidget";

interface Career {
  id: string;
  title: string;
  category: string;
  description: string;
  dayInLife: string;
  salaryRange: { min: number; max: number };
  growthOutlook: string;
  requiredSkills: string[];
  relatedInterests: string[];
  nonObvious: boolean;
  whyNonObvious?: string;
  pros?: string[];
  cons?: string[];
}

export default function CareerDetailPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="text-white text-lg">Loading...</div></div>}>
      <CareerDetailPage />
    </Suspense>
  );
}

function CareerDetailPage() {
  const searchParams = useSearchParams();
  const careerId = searchParams?.get("id") || "";
  const [career, setCareer] = useState<Career | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTransition, setShowTransition] = useState(false);
  const [currentCareer, setCurrentCareer] = useState("");
  const [userSkills, setUserSkills] = useState<string[]>([]);

  useEffect(() => {
    if (careerId) {
      loadCareer();
    }

    // Load user's current skills from localStorage if available
    const savedSkills = localStorage.getItem("userSkills");
    if (savedSkills) {
      setUserSkills(JSON.parse(savedSkills));
    }
  }, [careerId]);

  async function loadCareer() {
    try {
      const { API_ORIGIN } = await import("@/lib/api");
      const res = await fetch(`${API_ORIGIN}/api/careers/${careerId}`);
      if (res.ok) {
        const json = await res.json();
        setCareer(json.career);
      }
    } catch (err) {
      console.error("Failed to load career:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-[3px] border-gray-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading career details...</p>
        </div>
      </div>
    );
  }

  if (!career) {
    return (
      <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Career Not Found</h2>
          <Link
            href="/careers"
            className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm"
          >
            ← Browse All Careers
          </Link>
        </div>
      </div>
    );
  }

  const formatSalary = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white py-12 md:py-16 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <Link
              href="/careers"
              className="text-white/70 hover:text-white text-sm flex items-center gap-2 mb-4 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Careers
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            {career.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-xl text-sm font-semibold border border-white/20">
              {career.category}
            </span>
            <span className="text-white/90 text-sm font-medium">
              {formatSalary(career.salaryRange.min)} – {formatSalary(career.salaryRange.max)}
            </span>
            <span className="bg-white/15 backdrop-blur-sm px-3 py-1 rounded-xl text-sm font-medium border border-white/20">
              {career.growthOutlook} Growth
            </span>
          </div>
          <p className="text-lg text-white/85 max-w-3xl mb-8 leading-relaxed">
            {career.description}
          </p>
          
          {career.nonObvious && career.whyNonObvious && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h3 className="font-bold mb-1">Why This is Non-Obvious</h3>
                  <p className="text-white/85 text-sm leading-relaxed">{career.whyNonObvious}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Day in the Life */}
            <div className="card-static p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-base">📅</span>
                A Day in the Life
              </h2>
              <p className="text-gray-600 leading-relaxed">{career.dayInLife}</p>
            </div>

            {/* Pros & Cons */}
            {(career.pros?.length || career.cons?.length) ? (
              <div className="grid sm:grid-cols-2 gap-5">
                {career.pros && career.pros.length > 0 && (
                  <div className="card-static p-6">
                    <h2 className="text-lg font-bold text-emerald-700 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Pros
                    </h2>
                    <div className="space-y-3">
                      {career.pros.map((pro, i) => (
                        <div key={i} className="flex gap-2.5 items-start">
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
                  <div className="card-static p-6">
                    <h2 className="text-lg font-bold text-amber-700 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Cons
                    </h2>
                    <div className="space-y-3">
                      {career.cons.map((con, i) => (
                        <div key={i} className="flex gap-2.5 items-start">
                          <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.834-2.694-.834-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <span className="text-sm text-gray-700 leading-relaxed">{con}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Skills Required */}
            <div className="card-static p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Required Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {career.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-emerald-50 text-emerald-700 px-3.5 py-2 rounded-xl border border-emerald-200/60 text-sm font-medium"
                  >
                    {skill.replace(/-/g, " ")}
                  </span>
                ))}
              </div>
            </div>

            {/* Related Interests */}
            <div className="card-static p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                You'll Love This If You're Into
              </h2>
              <div className="flex flex-wrap gap-2">
                {career.relatedInterests.map((interest) => (
                  <span
                    key={interest}
                    className="bg-purple-50 text-purple-700 px-3.5 py-2 rounded-xl border border-purple-200/60 text-sm font-medium"
                  >
                    {interest.replace(/-/g, " ")}
                  </span>
                ))}
              </div>
            </div>

            {/* Market Intelligence */}
            <MarketInsights careerId={career.id} />

            {/* Skill Gap Analysis */}
            {userSkills.length > 0 && (
              <SkillGapVisualizer
                userSkills={userSkills}
                targetCareer={career.id}
              />
            )}

            {/* Career Transition Analyzer */}
            <div className="card-static p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-base">🔄</span>
                Career Transition Assistant
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                Switching careers? See how to transition into this role from your current position.
              </p>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter your current career (e.g., software-engineer)"
                  value={currentCareer}
                  onChange={(e) => setCurrentCareer(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50 text-sm transition-all"
                />
                <button
                  onClick={() => setShowTransition(true)}
                  disabled={!currentCareer}
                  className="w-full btn-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                  Analyze Transition Path
                </button>
              </div>

              {showTransition && currentCareer && (
                <div className="mt-6">
                  <CareerTransitionAnalyzer
                    fromCareer={currentCareer}
                    toCareer={career.id}
                    toCareerTitle={career.title}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Actions & Gamification */}
          <div className="space-y-6">
            {/* CTA Card */}
            <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white rounded-2xl p-6 shadow-lg shadow-emerald-600/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl translate-x-8 -translate-y-8" />
              <h3 className="text-lg font-bold mb-4 relative">Ready to Start?</h3>
              <div className="space-y-3 relative">
                <Link
                  href={`/roadmap?career=${career.id}`}
                  className="block w-full bg-white text-emerald-700 px-6 py-3 rounded-xl font-semibold text-center hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Create My Roadmap
                </Link>
                <button className="w-full bg-white/15 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/25 transition-colors border border-white/20">
                  Save Career
                </button>
                <button className="w-full bg-white/15 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/25 transition-colors border border-white/20">
                  Share
                </button>
              </div>
            </div>

            {/* Gamification Widget */}
            <GamificationWidget />

            {/* Quick Stats */}
            <div className="card-static p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Facts</h3>
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Entry Salary</span>
                  <span className="font-bold text-gray-900">{formatSalary(career.salaryRange.min)}</span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Senior Salary</span>
                  <span className="font-bold text-gray-900">{formatSalary(career.salaryRange.max)}</span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Skills Needed</span>
                  <span className="font-bold text-gray-900">{career.requiredSkills.length}</span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Growth Outlook</span>
                  <span className={`font-bold ${
                    career.growthOutlook === "Very High" ? "text-emerald-600" :
                    career.growthOutlook === "High" ? "text-emerald-600" :
                    "text-amber-600"
                  }`}>
                    {career.growthOutlook}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
