"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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
    },
  ];

  const steps = [
    { num: "01", title: "Share Your Skills", desc: "Tell us what you're good at — from Python to public speaking." },
    { num: "02", title: "Pick Your Interests", desc: "Select what excites you — we find surprising connections." },
    { num: "03", title: "Get Matched", desc: "Our engine scores you against 20+ non-obvious career paths." },
    { num: "04", title: "Start Your Roadmap", desc: "Follow a concrete 90-day plan tailored to your chosen path." },
  ];

  const careerPreviews = [
    { title: "Data Ethicist", cat: "Ethics & Policy", growth: "Very High", salary: "$115k" },
    { title: "Developer Advocate", cat: "Tech & Community", growth: "High", salary: "$120k" },
    { title: "Sports Analytics", cat: "Sports & Data", growth: "High", salary: "$95k" },
    { title: "Cybersecurity", cat: "Tech & Security", growth: "Very High", salary: "$105k" },
    { title: "Product Designer", cat: "Design & Tech", growth: "High", salary: "$115k" },
    { title: "Climate Tech PM", cat: "Environment", growth: "Very High", salary: "$130k" },
  ];

  return (
    <>
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center">
        {/* Animated background */}
        <div className="absolute inset-0 hero-mesh" />
        <div className="absolute inset-0 grid-pattern opacity-40" />

        {/* Animated blobs */}
        <div className="absolute top-20 left-[10%] w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-teal-200/15 rounded-full blur-3xl animate-blob" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-100/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: "4s" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <div className={`space-y-8 ${mounted ? "animate-fade-in-up" : "opacity-0"}`}>
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-emerald-700">20+ non-obvious career paths</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                Your skills lead to
                <span className="block gradient-text mt-1">careers you&apos;d never expect</span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-500 max-w-lg leading-relaxed">
                PathNotTaken discovers hidden career paths by analyzing your unique combination of skills, interests, and experience. No more generic job boards.
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
              <div className="grid grid-cols-4 gap-6 pt-4 border-t border-gray-100">
                {[
                  { value: "20+", label: "Career Paths" },
                  { value: "50+", label: "Skills Tracked" },
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
                      className="card-static p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 opacity-0 animate-fade-in-up"
                      style={{ animationDelay: `${500 + i * 100}ms`, animationFillMode: "forwards" }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                          i % 3 === 0 ? "from-emerald-400 to-emerald-600" :
                          i % 3 === 1 ? "from-blue-400 to-indigo-600" :
                          "from-purple-400 to-pink-600"
                        } flex items-center justify-center flex-shrink-0`}>
                          <span className="text-white text-sm font-bold">{career.title.charAt(0)}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{career.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{career.cat}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">{career.growth}</span>
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

      {/* ─── Features Section ─── */}
      <section className="py-20 md:py-28 bg-white relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-emerald-600 tracking-wide uppercase mb-3">Why PathNotTaken</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Career discovery, <span className="gradient-text">reimagined</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              We don&apos;t just match keywords. Our engine understands how skills transfer across fields to find careers you&apos;d never think to search for.
            </p>
            <div className="section-divider mt-6" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group relative card-static p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 text-emerald-600 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-20 md:py-28 bg-[#fafbfc] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-emerald-600 tracking-wide uppercase mb-3">How it works</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              From skills to roadmap in <span className="gradient-text">4 steps</span>
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
                      <span className="text-white font-extrabold text-lg">{step.num}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-5" />
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
            Stop searching for obvious careers
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-10 text-lg">
            The best career for you might be one you&apos;ve never heard of. Let your unique skill combination guide you to unexpected opportunities.
          </p>

          <div className="grid grid-cols-3 gap-8 mb-10">
            {[
              { val: "20+", label: "Unique career paths across 12 categories" },
              { val: "50+", label: "Skills & interests analyzed for matches" },
              { val: "90", label: "Days to your first career milestone" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-4xl font-extrabold text-emerald-400 mb-1">{s.val}</p>
                <p className="text-sm text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>

          <Link
            href="/explore"
            className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-base hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 group"
          >
            Start Your Discovery
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}