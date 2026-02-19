"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";

/* Animated counter hook */
function useCountUp(target: number, duration = 2000, startOnMount = false) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (startOnMount) { setStarted(true); return; }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [startOnMount]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref };
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const stat1 = useCountUp(20, 1500);
  const stat2 = useCountUp(85, 1800);
  const stat3 = useCountUp(90, 1400);
  const stat4 = useCountUp(35, 1600);

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: "Hidden Paths Revealed",
      desc: "Our AI finds careers you'd never Google — roles at the intersection of your unique skill combinations.",
      color: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Data-Driven Matching",
      desc: "Weighted skill scoring, synonym matching, and interest alignment — not just keyword matching.",
      color: "from-blue-500 to-indigo-500",
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      title: "90-Day Roadmaps",
      desc: "Every career comes with a concrete, month-by-month plan with milestones, resources, and progress tracking.",
      color: "from-purple-500 to-pink-500",
      bg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      title: "Skill Transfer Maps",
      desc: "See exactly how each of your existing skills transfers to a new role — no guessing, just clarity.",
      color: "from-amber-500 to-orange-500",
      bg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];

  const steps = [
    { num: "01", title: "Share Your Skills", desc: "Tell us what you're good at — from Python to public speaking, agriculture to accounting.", icon: "🛠️" },
    { num: "02", title: "Pick Your Interests", desc: "Select what excites you — we find surprising connections across 35 interest areas.", icon: "💜" },
    { num: "03", title: "Get Matched", desc: "Our engine scores you against 20+ non-obvious career paths with detailed explanations.", icon: "🎯" },
    { num: "04", title: "Start Your Roadmap", desc: "Follow a concrete 90-day plan tailored to your chosen path with real resources.", icon: "🗺️" },
  ];

  const careerPreviews = [
    { title: "Data Ethicist", cat: "Ethics & Policy", growth: "Very High", salary: "$115k", color: "from-emerald-400 to-emerald-600" },
    { title: "Developer Advocate", cat: "Tech & Community", growth: "High", salary: "$120k", color: "from-blue-400 to-indigo-600" },
    { title: "Sports Analyst", cat: "Sports & Data", growth: "High", salary: "$95k", color: "from-purple-400 to-pink-600" },
    { title: "Cybersecurity", cat: "Tech & Security", growth: "Very High", salary: "$105k", color: "from-red-400 to-rose-600" },
    { title: "Climate Tech PM", cat: "Environment", growth: "Very High", salary: "$130k", color: "from-teal-400 to-cyan-600" },
    { title: "UX Researcher", cat: "Design & Research", growth: "High", salary: "$92k", color: "from-amber-400 to-orange-600" },
  ];

  // Industries marquee
  const industries = [
    "Technology", "Healthcare", "Agriculture", "Finance", "Education",
    "Manufacturing", "Legal", "Real Estate", "Nonprofit", "Government",
    "Hospitality", "Energy", "Retail", "Media", "Engineering",
  ];

  return (
    <>
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center noise-bg">
        {/* Animated background */}
        <div className="absolute inset-0 hero-mesh" />
        <div className="absolute inset-0 grid-pattern opacity-30" />

        {/* Animated blobs — softer and more organic */}
        <div className="absolute top-20 left-[10%] w-80 h-80 bg-emerald-200/15 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-teal-200/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-100/8 rounded-full blur-3xl animate-blob" style={{ animationDelay: "4s" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <div className={`space-y-8 ${mounted ? "animate-fade-in-up" : "opacity-0"}`}>
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-emerald-700">Discover 20+ non-obvious career paths</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                Your skills lead to
                <span className="block animate-gradient-text mt-1">careers you&apos;d never expect</span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-500 max-w-lg leading-relaxed">
                PathNotTaken discovers hidden career paths by analyzing your unique combination of skills, interests, and experience — across every industry from tech to agriculture.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/explore"
                  className="btn-primary text-base px-8 py-4 shadow-lg shadow-emerald-500/20 group"
                >
                  Discover My Paths
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/careers"
                  className="btn-secondary text-base px-8 py-4"
                >
                  Browse All Careers
                </Link>
              </div>

              {/* Stats bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 border-t border-gray-100">
                {[
                  { value: "20+", label: "Career Paths" },
                  { value: "85+", label: "Skills Tracked" },
                  { value: "90", label: "Day Plans" },
                  { value: "Free", label: "No Catch" },
                ].map((stat, i) => (
                  <div key={i} className={`${mounted ? "animate-fade-in-up opacity-0" : "opacity-0"}`} style={{ animationDelay: `${400 + i * 100}ms`, animationFillMode: "forwards" }}>
                    <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Visual — floating career preview cards */}
            <div className={`hidden lg:block ${mounted ? "animate-fade-in opacity-0" : "opacity-0"}`} style={{ animationDelay: "300ms", animationFillMode: "forwards" }}>
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  {careerPreviews.map((career, i) => (
                    <div
                      key={i}
                      className="glass-card rounded-2xl p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 opacity-0 animate-fade-in-up card-lift"
                      style={{ animationDelay: `${500 + i * 100}ms`, animationFillMode: "forwards" }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${career.color} flex items-center justify-center flex-shrink-0`}>
                          <span className="text-white text-sm font-bold">{career.title.charAt(0)}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{career.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{career.cat}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              career.growth === "Very High" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                            }`}>{career.growth}</span>
                            <span className="text-[10px] text-gray-400">{career.salary}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Decorative gradient ring */}
                <div className="absolute -z-10 -inset-4 bg-gradient-to-br from-emerald-100/40 via-transparent to-teal-100/40 rounded-3xl blur-sm" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Industries Marquee ─── */}
      <section className="py-6 bg-white border-y border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Skills mapped across every industry</p>
          <div className="relative overflow-hidden">
            <div className="flex animate-marquee gap-8">
              {[...industries, ...industries].map((ind, i) => (
                <span key={i} className="flex-shrink-0 text-sm font-medium text-gray-500 bg-gray-50 px-4 py-2 rounded-full border border-gray-100 whitespace-nowrap">
                  {ind}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Counter Section ─── */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { ref: stat1.ref, count: stat1.count, suffix: "+", label: "Career Paths", icon: "🎯" },
              { ref: stat2.ref, count: stat2.count, suffix: "+", label: "Skills Tracked", icon: "🛠️" },
              { ref: stat3.ref, count: stat3.count, suffix: "", label: "Day Roadmaps", icon: "🗺️" },
              { ref: stat4.ref, count: stat4.count, suffix: "+", label: "Interests", icon: "💜" },
            ].map((stat, i) => (
              <div key={i} ref={stat.ref} className="text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <p className="text-4xl md:text-5xl font-extrabold text-white mb-1 tabular-nums">
                  {stat.count}{stat.suffix}
                </p>
                <p className="text-emerald-100 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section className="py-20 md:py-28 bg-white relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-emerald-600 tracking-wide uppercase mb-3">Why PathNotTaken</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Career discovery, <span className="animate-gradient-text">reimagined</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              We don&apos;t just match keywords. Our engine understands how skills transfer across fields to find careers you&apos;d never think to search for.
            </p>
            <div className="section-divider mt-6" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group relative card-static p-6 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden glow-border"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-5 ${feature.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Before/After Section ─── */}
      <section className="py-20 md:py-28 bg-[#fafbfc] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-emerald-600 tracking-wide uppercase mb-3">The difference</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Traditional search vs. <span className="animate-gradient-text">PathNotTaken</span>
            </h2>
            <div className="section-divider mt-6" />
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Traditional */}
            <div className="card-static p-8 border-red-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-red-500" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Traditional Job Search</h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Search for job titles you already know",
                  "Generic results from keyword matching",
                  "No understanding of skill transferability",
                  "Limited to your current industry",
                  "No actionable path to transition",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-500">
                    <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* PathNotTaken */}
            <div className="card-static p-8 border-emerald-100 relative overflow-hidden group shadow-lg shadow-emerald-500/5">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">PathNotTaken</h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Discover careers you've never heard of",
                  "Weighted scoring across 85+ skill dimensions",
                  "Detailed skill transfer explanations",
                  "Cross-industry recommendations from any field",
                  "Concrete 90-day roadmap to get started",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-20 md:py-28 bg-white relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-emerald-600 tracking-wide uppercase mb-3">How it works</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              From skills to roadmap in <span className="animate-gradient-text">4 steps</span>
            </h2>
            <div className="section-divider mt-6" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative group">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+32px)] w-[calc(100%-64px)] h-px bg-gradient-to-r from-emerald-200 to-transparent" />
                )}
                <div className="text-center">
                  <div className="relative inline-flex mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 group-hover:scale-110 transition-all duration-300">
                      <span className="text-2xl">{step.icon}</span>
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white border-2 border-emerald-200 text-xs font-extrabold text-emerald-600 flex items-center justify-center shadow-sm">{step.num}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Skill Examples Section ─── */}
      <section className="py-20 md:py-28 bg-[#fafbfc] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-emerald-600 tracking-wide uppercase mb-3">Any background welcome</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              We understand <span className="animate-gradient-text">your industry</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Type skills from any field — agriculture, healthcare, finance, construction — and we auto-map them to matching career paths.
            </p>
            <div className="section-divider mt-6" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { field: "Agriculture", skills: ["Farming", "Crop Science", "Soil Analysis", "Sustainability"], arrow: "Climate Tech PM, Data Analyst", color: "from-green-400 to-emerald-500", emoji: "🌾" },
              { field: "Healthcare", skills: ["Patient Care", "Medical Coding", "Lab Work", "Nutrition"], arrow: "UX Researcher, Data Ethicist", color: "from-blue-400 to-indigo-500", emoji: "🏥" },
              { field: "Finance", skills: ["Auditing", "Risk Management", "Financial Modeling", "Taxation"], arrow: "Policy Analyst, Sports Analyst", color: "from-amber-400 to-orange-500", emoji: "💰" },
              { field: "Construction", skills: ["CAD", "Surveying", "Site Management", "Budgeting"], arrow: "GIS Analyst, Climate Tech PM", color: "from-orange-400 to-red-500", emoji: "🏗️" },
              { field: "Education", skills: ["Teaching", "Curriculum Design", "Mentoring", "Research"], arrow: "UX Researcher, Content Strategist", color: "from-purple-400 to-pink-500", emoji: "📚" },
              { field: "Military", skills: ["Leadership", "Operations", "Intelligence", "Security"], arrow: "Cybersecurity, Project Manager", color: "from-gray-500 to-gray-700", emoji: "🎖️" },
            ].map((item, i) => (
              <div key={i} className="card-static p-5 hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5 group glow-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-lg`}>
                    {item.emoji}
                  </div>
                  <h3 className="font-bold text-gray-900">{item.field}</h3>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {item.skills.map((s) => (
                    <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{s}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span className="text-xs text-emerald-600 font-semibold">{item.arrow}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials / Social Proof ─── */}
      <section className="py-20 md:py-28 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-emerald-600 tracking-wide uppercase mb-3">Success Stories</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Real paths, <span className="animate-gradient-text">real discoveries</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              See how others found careers they never knew existed
            </p>
            <div className="section-divider mt-6" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Shandy N.",
                role: "Former Teacher → Software Engineer",
                quote: "I had no idea my problem-solving and analytical skills translated directly into software engineering. PathNotTaken connected the dots I never could have.",
                skills: ["Problem Solving", "Logic", "Communication"],
                match: 87,
              },
              {
                name: "Daniel A.",
                role: "Draftsman → Architect",
                quote: "I thought my only option was staying a draftsman. Turns out, my attention to detail and spatial reasoning are exactly what architecture firms need.",
                skills: ["Design", "Spatial Reasoning", "Attention to Detail"],
                match: 82,
              },
              {
                name: "Demson V.",
                role: "Technician → Engineer",
                quote: "As a technician, I felt stuck. This tool showed me how my hands-on skills + technical knowledge open doors in engineering I didn't know existed.",
                skills: ["Technical Skills", "Problem Solving", "Mathematics"],
                match: 79,
              },
            ].map((story, i) => (
              <div
                key={i}
                className="group card-static p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden glow-border"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Star rating */}
                <div className="flex gap-0.5 mb-4">
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <blockquote className="text-sm text-gray-600 leading-relaxed mb-5 italic">
                  &ldquo;{story.quote}&rdquo;
                </blockquote>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold">
                    {story.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{story.name}</p>
                    <p className="text-xs text-emerald-600 font-medium">{story.role}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-1">
                    {story.skills.map((skill) => (
                      <span key={skill} className="text-[10px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-emerald-600">{story.match}% match</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden noise-bg">
        <div className="absolute inset-0 dot-pattern opacity-5" />
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-emerald-500/8 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-teal-500/8 rounded-full blur-3xl animate-blob" style={{ animationDelay: '3s' }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-900/30 border border-emerald-700/30 px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-emerald-300">100% free — no credit card needed</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Stop searching for obvious careers
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-10 text-lg">
            The best career for you might be one you&apos;ve never heard of. Let your unique skill combination guide you to unexpected opportunities.
          </p>

          <div className="grid grid-cols-3 gap-8 mb-10">
            {[
              { val: "20+", label: "Unique career paths across 12 categories" },
              { val: "85+", label: "Skills from every industry analyzed" },
              { val: "90", label: "Days to your first career milestone" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-4xl font-extrabold text-emerald-400 mb-1">{s.val}</p>
                <p className="text-sm text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>

          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-base hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 group"
          >
            Get Started Free
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}