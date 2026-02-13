import Link from "next/link";
import HeroWelcome from "@/components/HeroWelcome";

export default function Home() {
  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-white">
        {/* Growth-themed background (radial gradients + subtle sprout SVG) */}
        <div className="absolute inset-0 -z-10 hero-growth">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-transparent to-white opacity-70" />

          {/* floating soft circles */}
          <svg className="absolute left-8 top-12 w-72 h-72 opacity-30" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="50" fill="rgba(34,197,94,0.08)" />
            <circle cx="140" cy="140" r="36" fill="rgba(5,150,105,0.06)" />
          </svg>

          {/* animated sprout */}
          <svg className="absolute right-16 bottom-10 w-28 h-28 sprout" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none">
            <path d="M32 56c0-12 6-20 14-24" stroke="rgba(16,185,129,0.95)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M32 48c0-8 4-12 9-14" stroke="rgba(34,197,94,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M32 36c0-6-4-10-10-12" stroke="rgba(16,185,129,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 24c3 0 6-4 6-8s-4-8-6-8" stroke="rgba(34,197,94,0.95)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 md:pt-32 md:pb-36">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1] mb-6">
              Grow into better career opportunities —
              <span className="font-serif-display text-brand-600"> one step at a time</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Actionable, skill‑first roadmaps backed by market signals. Start small,
              build steadily, and show measurable growth in 90 days.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <Link
                href="/explore"
                className="inline-flex items-center justify-center gap-2 bg-brand-600 text-white px-8 py-3.5 rounded-lg text-base font-semibold hover:bg-brand-700 transition-colors shadow-lg"
              >
                Start Exploring Free
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-3.5 rounded-lg text-base font-semibold border border-surface-200 hover:bg-surface-50 transition-colors"
              >
                Watch Demo
              </Link>
            </div>

            {/* personalized welcome when signed in */}
            <HeroWelcome />

            {/* Hero visual placeholder */}
            <div className="relative max-w-2xl mx-auto">
              <div className="bg-surface-50 border border-surface-200 rounded-2xl aspect-[16/9] flex items-center justify-center overflow-hidden">
                <div className="text-center p-8">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {["JavaScript", "Communication", "Data Analysis", "Problem Solving", "Design", "Leadership"].map((skill) => (
                      <span
                        key={skill}
                        className="bg-white border border-surface-200 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full animate-float"
                        style={{ animationDelay: `${Math.random() * 2}s` }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <svg className="w-8 h-8 text-brand-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                  </svg>
                  <div className="flex justify-center gap-3">
                    {["UX Researcher — 92%", "Data Ethicist — 87%", "Dev Advocate — 84%"].map((result) => (
                      <span
                        key={result}
                        className="bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full"
                      >
                        {result}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── VALUE PROPOSITION ─── */}
      <section className="py-20 md:py-28 bg-surface-50 border-y border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-14">
            Why PathNotTaken?
          </h2>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                title: "AI-Powered Matching",
                desc: "Our engine analyzes your unique combination of skills and interests to find career paths that traditional assessments miss entirely.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                ),
              },
              {
                title: "Non-Obvious Careers",
                desc: "We specialize in careers at the intersection of disciplines — the hidden gems that perfectly fit your profile but you'd never think of on your own.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
                  </svg>
                ),
              },
              {
                title: "Skill Alignment",
                desc: "See exactly how your existing skills transfer to new fields, with clear gap analysis and development roadmaps for each recommended path.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-14 h-14 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-16">
            How It Works
          </h2>

          <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-6 md:gap-0">
            {[
              { step: 1, title: "Enter Your Skills", desc: "Type your skills freely — technical, creative, soft skills — anything you're good at." },
              { step: 2, title: "Share Interests", desc: "Tell us what excites you. The more you share, the better we match." },
              { step: 3, title: "Get Matched", desc: "Our AI reveals non-obvious career paths tailored to your unique profile." },
              { step: 4, title: "Explore Paths", desc: "Dive deep into each career — salary, growth, day-to-day, and what skills to build." },
            ].map((item, index) => (
              <div key={item.step} className="flex flex-col md:flex-row items-center">
                <div className="flex flex-col items-center text-center max-w-[180px]">
                  <div className="w-14 h-14 rounded-full bg-brand-600 text-white flex items-center justify-center text-xl font-bold mb-4 shadow-lg shadow-brand-600/20">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block mx-6 mt-[-28px]">
                    <svg className="w-6 h-6 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ─── CTA ─── */}
      <section className="py-20 md:py-28 bg-brand-950 text-white relative grain">
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
            Ready to start growing your career?
          </h2>
          <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto">
            Pick a path, follow a simple 90‑day plan, and track real progress — no fluff.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 bg-white text-brand-900 px-10 py-4 rounded-lg text-base font-semibold hover:bg-slate-100 transition-colors"
          >
            Start Your 90‑Day Plan — Free
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
