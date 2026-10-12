"use client";

import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";

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

/* Typewriter career rotation */
function useTypewriter(words: string[], typingSpeed = 100, deletingSpeed = 50, pauseTime = 2000) {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const tick = useCallback(() => {
    const currentWord = words[wordIndex];
    if (isDeleting) {
      setText(currentWord.substring(0, text.length - 1));
    } else {
      setText(currentWord.substring(0, text.length + 1));
    }
  }, [text, wordIndex, isDeleting, words]);

  useEffect(() => {
    const currentWord = words[wordIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && text === currentWord) {
      timeout = setTimeout(() => setIsDeleting(true), pauseTime);
    } else if (isDeleting && text === '') {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
    } else {
      timeout = setTimeout(tick, isDeleting ? deletingSpeed : typingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words, tick, typingSpeed, deletingSpeed, pauseTime]);

  return text;
}

/* Small monospaced system status tag */
function StatusTag({ label, className = "" }: { label: string; className?: string }) {
  return (
    <span className={`status-tag text-white/50 ${className}`}>
      <span className="status-dot" />
      {label}
    </span>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const rotatingCareer = useTypewriter(
    ['Data Ethicist', 'Developer Advocate', 'Climate Tech PM', 'UX Researcher', 'Sports Analyst', 'Cybersecurity Lead'],
    80, 40, 2200
  );

  const stat1 = useCountUp(20, 1500);
  const stat2 = useCountUp(85, 1800);
  const stat3 = useCountUp(90, 1400);
  const stat4 = useCountUp(35, 1600);

  const careerPreviews = [
    { title: "Data Ethicist", cat: "Ethics & Policy", growth: "Very High", salary: "₱63K/mo" },
    { title: "Developer Advocate", cat: "Tech & Community", growth: "High", salary: "₱70K/mo" },
    { title: "Sports Analyst", cat: "Sports & Data", growth: "High", salary: "₱50K/mo" },
    { title: "Cybersecurity", cat: "Tech & Security", growth: "Very High", salary: "₱68K/mo" },
    { title: "Climate Tech PM", cat: "Environment", growth: "Very High", salary: "₱75K/mo" },
    { title: "UX Researcher", cat: "Design & Research", growth: "High", salary: "₱55K/mo" },
  ];

  const industries = [
    "Technology", "Healthcare", "Agriculture", "Finance", "Education",
    "Manufacturing", "Legal", "Real Estate", "Nonprofit", "Government",
    "Hospitality", "Energy", "Retail", "Media", "Engineering",
  ];

  const barHeights = [42, 68, 55, 88, 72, 96, 60, 78, 50, 84, 66, 92];

  const swatches = [
    { name: "Lime", value: "#ccff00" },
    { name: "Emerald", value: "#10b981" },
    { name: "Obsidian", value: "#0c0c0c" },
    { name: "Signal", value: "#ebebeb" },
  ];

  const testimonials = [
    {
      name: "Shandy N.",
      role: "Teacher → Software Engineer",
      quote: "I had no idea my problem-solving and analytical skills translated directly into software engineering. PathNotTaken connected the dots I never could have.",
      match: 87,
    },
    {
      name: "Daniel A.",
      role: "Draftsman → Architect",
      quote: "I thought my only option was staying a draftsman. Turns out, my attention to detail and spatial reasoning are exactly what architecture firms need.",
      match: 82,
    },
    {
      name: "Demson V.",
      role: "Technician → Engineer",
      quote: "As a technician, I felt stuck. This tool showed me how my hands-on skills plus technical knowledge open doors in engineering I didn't know existed.",
      match: 79,
    },
  ];

  const skillPaths = [
    { field: "Agriculture", skills: ["Farming", "Crop Science", "Soil Analysis"], arrow: "Climate Tech PM, Data Analyst" },
    { field: "Healthcare", skills: ["Patient Care", "Medical Coding", "Lab Work"], arrow: "UX Researcher, Data Ethicist" },
    { field: "Finance", skills: ["Auditing", "Risk Management", "Taxation"], arrow: "Policy Analyst, Sports Analyst" },
    { field: "Construction", skills: ["CAD", "Surveying", "Budgeting"], arrow: "GIS Analyst, Climate Tech PM" },
    { field: "Education", skills: ["Teaching", "Curriculum Design", "Research"], arrow: "UX Researcher, Content Strategist" },
    { field: "Military", skills: ["Leadership", "Operations", "Intelligence"], arrow: "Cybersecurity, Project Manager" },
  ];

  return (
    <div className="obsidian-viewport min-h-screen p-3 font-display sm:p-5">
      <div className="obsidian-shell obsidian-scroll relative mx-auto max-w-[1600px] overflow-hidden rounded-[2.5rem] ring-1 ring-white/10 shadow-2xl">
        {/* ─── Background layers ─── */}
        <div className="pointer-events-none absolute inset-0 grid-pattern-dark" />
        <div className="noise-overlay" />
        <div className="glow-sphere left-[-10%] top-[-5%] h-[520px] w-[520px] bg-lime/10" />
        <div className="glow-sphere right-[-8%] top-[30%] h-[460px] w-[460px] bg-emeraldGlow/10" />
        <div className="glow-sphere bottom-[-10%] left-[35%] h-[500px] w-[500px] bg-lime/5" />

        <div className="relative z-10">
          {/* ─── Hero Section ─── */}
          <section className="px-5 pt-6 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 gap-10 py-12 lg:grid-cols-12 lg:gap-8 lg:py-20">
              {/* Left: Copy */}
              <div className={`lg:col-span-7 ${mounted ? "animate-fade-in-up" : "opacity-0"}`}>
                <StatusTag label="AI Career Engine // Online" />

                <h1 className="mt-7 text-[clamp(2.75rem,7.6vw,7.5rem)] font-light leading-[0.85] tracking-[-0.06em] text-ink">
                  Your skills lead to
                  <span className="block italic text-lime-gradient">
                    careers you&apos;d never expect
                  </span>
                </h1>

                <div className="mt-8 flex flex-wrap items-center gap-3 font-mono text-sm text-white/50">
                  <span className="text-white/30">// like becoming a</span>
                  <span className="font-medium text-lime">
                    {rotatingCareer}
                    <span className="animate-pulse">_</span>
                  </span>
                </div>

                <p className="mt-7 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
                  PathNotTaken discovers hidden career paths by analyzing your unique
                  combination of skills, interests, and experience — across every industry
                  from tech to agriculture.
                </p>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link href="/explore" className="btn-lime group text-base">
                    Discover My Paths
                    <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <Link
                    href="/careers"
                    className="glass-obsidian inline-flex items-center justify-center rounded-full px-8 py-4 text-sm font-medium text-white/70 transition-colors hover:text-white"
                  >
                    Browse All Careers
                  </Link>
                </div>

                {/* Stats bar */}
                <div className="mt-12 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 sm:grid-cols-4">
                  {[
                    { value: "20+", label: "Career Paths" },
                    { value: "85+", label: "Skills Tracked" },
                    { value: "90", label: "Day Plans" },
                    { value: "Free", label: "No Catch" },
                  ].map((stat, i) => (
                    <div key={i}>
                      <p className="font-display text-2xl font-light text-ink">{stat.value}</p>
                      <p className="font-mono-label mt-1 text-white/30">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Interactive glass mockup */}
              <div className={`lg:col-span-5 ${mounted ? "animate-fade-in opacity-0" : "opacity-0"}`} style={{ animationDelay: "300ms", animationFillMode: "forwards" }}>
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  <div className="glass-obsidian-lg relative overflow-hidden p-5">
                    <div className="mb-5 flex items-center justify-between">
                      <span className="font-mono-label text-white/40">Match Engine</span>
                      <span className="flex gap-1.5">
                        <i className="h-2 w-2 rounded-full bg-white/15" />
                        <i className="h-2 w-2 rounded-full bg-white/15" />
                        <i className="h-2 w-2 rounded-full bg-lime" />
                      </span>
                    </div>

                    <div className="space-y-3">
                      {careerPreviews.slice(0, 3).map((career, i) => (
                        <div
                          key={i}
                          className="glass-obsidian float-anim flex items-center gap-3 p-3.5"
                          style={{ animationDelay: `${i * 0.8}s` }}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lime text-xs font-bold text-black">
                            {career.title.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-ink">{career.title}</p>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-white/30">{career.cat}</p>
                          </div>
                          <span className="font-mono text-[10px] text-lime">{career.salary}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 h-px w-full bg-white/10" />
                    <div className="mt-4 flex items-center justify-between">
                      <span className="font-mono-label text-white/30">Confidence</span>
                      <span className="font-mono text-xs text-lime">94.2%</span>
                    </div>
                  </div>

                  {/* AI Cursor label */}
                  <div
                    className="float-anim absolute -bottom-4 -left-4 flex items-center gap-2 rounded-full bg-lime px-3.5 py-2 shadow-[0_0_30px_rgba(204,255,0,0.4)]"
                    style={{ animationDelay: "1.2s" }}
                  >
                    <svg className="h-3.5 w-3.5 text-black" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5.5 3.2l12.6 8.1-5.4.7 3.1 6.3-2.4 1.2-3.1-6.3-4 3.6z" />
                    </svg>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-black">AI</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ─── Industries Marquee ─── */}
          <section className="relative overflow-hidden border-y border-white/10 py-5">
            <div className="flex w-max animate-obsidian-marquee gap-3">
              {[...industries, ...industries].map((ind, i) => (
                <span
                  key={i}
                  className="shrink-0 whitespace-nowrap rounded-full border border-white/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-white/40"
                >
                  {ind}
                </span>
              ))}
            </div>
          </section>

          {/* ─── Stats Counter Section ─── */}
          <section className="px-5 py-16 sm:px-8 lg:px-12">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { stat: stat1, suffix: "+", label: "Career Paths" },
                { stat: stat2, suffix: "+", label: "Skills Tracked" },
                { stat: stat3, suffix: "", label: "Day Roadmaps" },
                { stat: stat4, suffix: "+", label: "Interests" },
              ].map((item, i) => (
                <div key={i} ref={item.stat.ref} className="glass-obsidian p-6">
                  <p className="font-display text-4xl font-light tabular-nums text-lime md:text-5xl">
                    {item.stat.count}{item.suffix}
                  </p>
                  <p className="font-mono-label mt-2 text-white/40">{item.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ─── Bento Grid Features ─── */}
          <section className="px-5 pb-20 sm:px-8 lg:px-12">
            <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="font-mono-label text-lime">01 — Capabilities</span>
                <h2 className="mt-3 text-4xl font-light tracking-[-0.04em] text-ink sm:text-5xl">
                  Career discovery, <span className="italic text-lime-gradient">reimagined</span>
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-white/50">
                We don&apos;t just match keywords. Our engine understands how skills
                transfer across fields to find careers you&apos;d never think to search for.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:auto-rows-[190px] lg:grid-cols-4">
              {/* Large card — data visualization */}
              <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 p-7 transition-colors duration-300 hover:border-lime/40 md:col-span-2 lg:col-span-2 lg:row-span-2">
                <span className="font-mono-label text-white/40">Match Analytics</span>
                <h3 className="mt-3 text-2xl font-light tracking-[-0.03em] text-ink">Hidden Paths Revealed</h3>
                <p className="mt-2 max-w-xs text-sm text-white/40">
                  Roles at the intersection of your unique skill combinations — surfaced
                  from patterns no search engine shows you.
                </p>
                <div className="mt-8 flex h-40 items-end gap-2">
                  {barHeights.map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-md bg-gradient-to-t from-lime/20 to-lime transition-all duration-500 group-hover:from-lime/30"
                      style={{ height: `${h}%`, opacity: 0.4 + (h / 160) }}
                    />
                  ))}
                </div>
                <div className="mt-3 flex justify-between font-mono text-[10px] uppercase tracking-widest text-white/25">
                  <span>Skills</span><span>Transferability</span>
                </div>
              </div>

              {/* Tall card — token swatches */}
              <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 p-7 transition-colors duration-300 hover:border-lime/40 lg:row-span-2">
                <span className="font-mono-label text-white/40">System Tokens</span>
                <h3 className="mt-3 text-lg font-light text-ink">Skill Transfer Maps</h3>
                <div className="mt-6 space-y-3">
                  {swatches.map((s) => (
                    <div key={s.name} className="flex items-center gap-3">
                      <span
                        className="h-8 w-8 rounded-lg border border-white/10"
                        style={{ backgroundColor: s.value }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm text-ink">{s.name}</p>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-white/30">{s.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Small card */}
              <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 p-6 transition-colors duration-300 hover:border-lime/40">
                <span className="font-mono-label text-lime">Weighted</span>
                <h3 className="mt-2 text-base font-medium text-ink">Data-Driven Matching</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/40">
                  Synonym matching and interest alignment — not keyword matching.
                </p>
              </div>

              {/* Small card */}
              <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 p-6 transition-colors duration-300 hover:border-lime/40">
                <span className="font-mono-label text-lime">90 Days</span>
                <h3 className="mt-2 text-base font-medium text-ink">Actionable Roadmaps</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/40">
                  Month-by-month milestones, resources, and progress tracking.
                </p>
              </div>

              {/* Accent card */}
              <div className="accent-lime rounded-[2.5rem] md:col-span-2 lg:col-span-2">
                <div className="noise-overlay" />
                <div className="relative flex h-full flex-col justify-between p-7">
                  <span className="font-mono-label text-black/60">Any Background</span>
                  <div>
                    <h3 className="text-2xl font-light tracking-[-0.03em] text-black">
                      From agriculture to AI — your skills count.
                    </h3>
                    <Link href="/explore" className="mt-4 inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-black">
                      Start the scan
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Small card */}
              <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 p-6 transition-colors duration-300 hover:border-lime/40">
                <span className="font-mono-label text-white/40">Cross-Industry</span>
                <h3 className="mt-2 text-base font-medium text-ink">35 Interest Areas</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/40">
                  Surprising connections across every sector.
                </p>
              </div>

              {/* Small card */}
              <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 p-6 transition-colors duration-300 hover:border-lime/40">
                <span className="font-mono-label text-white/40">Gamified</span>
                <h3 className="mt-2 text-base font-medium text-ink">XP & Badges</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/40">
                  Streaks, levels, and skill history as you grow.
                </p>
              </div>
            </div>
          </section>

          {/* ─── Contrast / Methodology Section ─── */}
          <section className="relative rounded-t-[4rem] bg-[#e5e5e5] px-5 py-20 text-black sm:px-8 lg:px-12">
            <div className="mx-auto max-w-6xl">
              <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:items-center">
                {/* Left: numbered methodology */}
                <div>
                  <span className="font-mono-label text-black/50">02 — Methodology</span>
                  <h2 className="mt-4 text-4xl font-light tracking-[-0.04em] sm:text-5xl">
                    From skills to roadmap in{" "}
                    <span className="italic">four steps</span>
                  </h2>

                  <ol className="mt-10 space-y-7">
                    {[
                      { num: "01", title: "Share Your Skills", desc: "Tell us what you're good at — from Python to public speaking, agriculture to accounting." },
                      { num: "02", title: "Pick Your Interests", desc: "Select what excites you — we find surprising connections across 35 interest areas." },
                      { num: "03", title: "Get Matched", desc: "Our engine scores you against 20+ non-obvious career paths with detailed explanations." },
                    ].map((step) => (
                      <li key={step.num} className="flex gap-5">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-black/15 font-mono text-xs font-bold">
                          {step.num}
                        </span>
                        <div>
                          <h3 className="text-lg font-medium">{step.title}</h3>
                          <p className="mt-1 max-w-md text-sm leading-relaxed text-black/55">{step.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Right: portrait + testimonial */}
                <div className="relative mx-auto w-full max-w-sm">
                  <div className="relative aspect-square overflow-hidden rounded-full bg-gradient-to-br from-gray-300 to-gray-500 grayscale">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="h-40 w-40 text-gray-600/60" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
                      </svg>
                    </div>
                  </div>

                  {/* Glass testimonial card */}
                  <div className="glass-obsidian absolute -bottom-6 left-1/2 w-[88%] -translate-x-1/2 p-5 text-white shadow-2xl">
                    <p className="text-sm leading-relaxed text-white/80">
                      &ldquo;I found a path I never knew existed — and a plan to get there
                      in 90 days.&rdquo;
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-ink">Shandy N.</p>
                        <p className="font-mono text-[9px] uppercase tracking-widest text-lime">Teacher → SWE</p>
                      </div>
                      <span className="font-mono text-xs font-bold text-lime">87%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ─── Skill Examples ─── */}
          <section className="px-5 py-20 sm:px-8 lg:px-12">
            <div className="mb-10 text-center">
              <span className="font-mono-label text-lime">03 — Coverage</span>
              <h2 className="mt-3 text-4xl font-light tracking-[-0.04em] text-ink sm:text-5xl">
                We understand <span className="italic text-lime-gradient">your industry</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {skillPaths.map((item, i) => (
                <div key={i} className="group rounded-[2rem] border border-white/10 p-6 transition-colors duration-300 hover:border-lime/40">
                  <h3 className="text-lg font-medium text-ink">{item.field}</h3>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {item.skills.map((s) => (
                      <span key={s} className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white/40">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4">
                    <svg className="h-4 w-4 shrink-0 text-lime" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span className="font-mono text-[11px] text-white/60">{item.arrow}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ─── Testimonials ─── */}
          <section className="px-5 pb-20 sm:px-8 lg:px-12">
            <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="font-mono-label text-lime">04 — Signals</span>
                <h2 className="mt-3 text-4xl font-light tracking-[-0.04em] text-ink sm:text-5xl">
                  Real paths, <span className="italic text-lime-gradient">real discoveries</span>
                </h2>
              </div>
              <p className="max-w-sm text-sm text-white/50">
                See how others found careers they never knew existed.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {testimonials.map((story, i) => (
                <div key={i} className="glass-obsidian flex flex-col p-6">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className="h-4 w-4 text-lime" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mt-4 flex-1 text-sm italic leading-relaxed text-white/60">
                    &ldquo;{story.quote}&rdquo;
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-lime font-bold text-black">
                        {story.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-ink">{story.name}</p>
                        <p className="font-mono text-[9px] uppercase tracking-widest text-white/40">{story.role}</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-lime">{story.match}%</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ─── CTA Section ─── */}
          <section className="relative overflow-hidden border-t border-white/10 px-5 py-24 text-center sm:px-8 lg:px-12">
            <StatusTag label="100% Free // No Card Required" className="justify-center" />
            <h2 className="mx-auto mt-7 max-w-3xl text-[clamp(2rem,5vw,4.5rem)] font-light leading-[0.95] tracking-[-0.05em] text-ink">
              Stop searching for <span className="italic text-lime-gradient">obvious careers</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/50">
              The best career for you might be one you&apos;ve never heard of. Let your
              unique skill combination guide you to unexpected opportunities.
            </p>

            <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-6">
              {[
                { val: "20+", label: "Career paths" },
                { val: "85+", label: "Skills analyzed" },
                { val: "90", label: "Days to milestone" },
              ].map((s, i) => (
                <div key={i}>
                  <p className="font-display text-3xl font-light text-lime md:text-4xl">{s.val}</p>
                  <p className="font-mono-label mt-1 text-white/40">{s.label}</p>
                </div>
              ))}
            </div>

            <Link href="/signup" className="cta-slide mt-12 inline-flex items-center gap-3 rounded-full px-12 py-5 text-base font-bold uppercase tracking-widest">
              Get Started Free
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
