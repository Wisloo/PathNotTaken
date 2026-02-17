import Link from "next/link";

export const metadata = {
  title: "About — PathNotTaken",
  description: "Learn about PathNotTaken's mission to help you discover non-obvious career paths through skill-based matching and structured learning paths.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 300 Q200 100 400 250 T800 200" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
            <path d="M0 350 Q250 150 500 280 T800 250" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.2" />
          </svg>
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <p className="text-emerald-300 text-sm font-semibold tracking-wider uppercase mb-4">About PathNotTaken</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-6">
            Helping you discover careers<br className="hidden sm:inline" /> you didn&rsquo;t know existed
          </h1>
          <p className="text-lg text-emerald-100/80 max-w-2xl mx-auto leading-relaxed">
            Most career advice points you down the obvious road. We use skill-based matching,
            market intelligence, and structured learning paths to reveal the{" "}
            <em className="text-white font-medium">hidden careers</em> that are a
            genuinely great fit for your unique combination of talents.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Traditional career guidance funnels people into a handful of well-known roles.
              But the modern economy has thousands of emerging, interdisciplinary jobs that go
              unnoticed — careers where <span className="font-semibold text-gray-800">your exact mix of skills</span> is
              in high demand.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              <strong className="text-gray-900">PathNotTaken</strong> exists to close that gap.
              We match your abilities, interests, and background against a curated database of
              non-obvious careers and provide a concrete 90-day roadmap so you can start making
              progress today — not someday.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Whether you&rsquo;re a psychology student who doesn&rsquo;t know UX Research exists,
              or a biology major unaware of the booming field of Bioinformatics, we surface the
              paths others overlook.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { stat: "12+", label: "Non-obvious career paths", icon: "🧭" },
              { stat: "90 days", label: "Actionable learning roadmaps", icon: "📋" },
              { stat: "40+", label: "Skills we analyze", icon: "🎯" },
              { stat: "Real-time", label: "Market intelligence", icon: "📊" },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center"
              >
                <span className="text-2xl mb-2 block">{item.icon}</span>
                <p className="text-xl font-bold text-emerald-600">{item.stat}</p>
                <p className="text-xs text-gray-500 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">How PathNotTaken Works</h2>
          <p className="text-gray-500 text-center max-w-xl mx-auto mb-12">
            Three steps from &ldquo;I don&rsquo;t know what to do&rdquo; to a clear, personalized plan.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Tell Us About You",
                desc: "Select your skills, interests, and current field. No resume needed — just honest self-assessment. Our system normalizes free-text inputs and maps them to canonical skill categories.",
                color: "bg-emerald-600",
              },
              {
                step: "02",
                title: "Discover Hidden Paths",
                desc: "Our matching engine scores every career against your profile using weighted skill overlap, interest alignment, and market signals. You get personalized match percentages, salary data, growth outlook, and 'day in the life' descriptions.",
                color: "bg-emerald-600",
              },
              {
                step: "03",
                title: "Follow Your Roadmap",
                desc: "Pick a career that excites you and get a structured 90-day plan with weekly tasks, curated resources, milestone checkpoints, and a mini-project you can add to your portfolio. Track progress, earn XP, and share your roadmap.",
                color: "bg-purple-600",
              },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-xl border border-gray-200 p-6">
                <div
                  className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center text-white font-bold text-sm mb-4`}
                >
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">What Makes Us Different</h2>
        <p className="text-gray-500 text-center max-w-xl mx-auto mb-12">
          We&rsquo;re not just another "what career should I choose" quiz.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          {[
            {
              icon: "🔍",
              title: "Non-Obvious Matching",
              desc: "We specialize in interdisciplinary, emerging, and under-recognized roles — the ones that traditional guidance systems completely miss. Every career in our database was chosen because it sits at the intersection of multiple fields.",
            },
            {
              icon: "📈",
              title: "Market Intelligence",
              desc: "Every recommendation includes real salary ranges, growth outlook, demand trends, and transition analysis so you make decisions based on data, not guesswork.",
            },
            {
              icon: "🗺️",
              title: "Concrete Roadmaps",
              desc: "We don't just tell you a career exists — we give you a week-by-week learning plan with specific resources, exercises, and milestone projects tailored to the skills you already have and the ones you need.",
            },
            {
              icon: "🎮",
              title: "Gamified Progress",
              desc: "Earn XP, maintain streaks, unlock achievements, and level up as you complete learning tasks. Career exploration should feel rewarding, not overwhelming.",
            },
            {
              icon: "🔬",
              title: "Skill Gap Analysis",
              desc: "See exactly which skills you already have, which you need, and how long it will take to close each gap — with a priority learning order so you focus on what matters most.",
            },
            {
              icon: "📂",
              title: "Portfolio Building",
              desc: "Each roadmap includes mini-projects designed to build tangible proof of your new skills. Share your progress with potential employers or collaborators.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex gap-4 p-5 bg-gray-50 border border-gray-200 rounded-xl"
            >
              <span className="text-2xl flex-shrink-0 mt-0.5">{item.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>

          <div className="space-y-6">
            {[
              {
                q: "Is PathNotTaken free to use?",
                a: "Yes. Career exploration, skill matching, and the 90-day roadmap generator are all free. You can sign up for an account to save your roadmaps and track progress across sessions.",
              },
              {
                q: "How are careers selected?",
                a: "Every career in our database is hand-curated based on three criteria: it must be a genuinely growing field, it must leverage transferable skills from common educational backgrounds, and it must be under-recognized — meaning most people with the right skills don't know it exists.",
              },
              {
                q: "How accurate are the match scores?",
                a: "Match scores are calculated by comparing your skills and interests against a career's requirements using a weighted overlap algorithm. Skills are weighted at 60% and interests at 40%. The score reflects how much of the role you're already prepared for — a 30-40% score is typical and means you have a strong foundation to build on.",
              },
              {
                q: "What if I don't have many skills yet?",
                a: "That's perfectly fine. PathNotTaken is designed for people at any stage — from students to mid-career professionals. A lower match score simply means the roadmap will have more learning tasks, and you'll have more room to grow. Start with whatever you have.",
              },
              {
                q: "Can I use this for a career change?",
                a: "Absolutely. Many of our users are professionals exploring career pivots. The skill gap analysis and transition analyzer are specifically designed to help you understand what it takes to move from your current field into a new one.",
              },
              {
                q: "Do I need to sign up?",
                a: "No. You can explore careers and generate roadmaps without an account. Signing up lets you save roadmaps, track learning progress, earn XP, and resume where you left off.",
              },
            ].map((item, i) => (
              <details key={i} className="bg-white border border-gray-200 rounded-xl group">
                <summary className="flex items-center justify-between p-5 cursor-pointer text-sm font-semibold text-gray-900 select-none">
                  {item.q}
                  <svg
                    className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to discover your hidden career?</h2>
        <p className="text-gray-500 mb-8 max-w-lg mx-auto">
          It takes about 2 minutes to tell us your skills and interests. You&rsquo;ll
          get personalized career matches and a 90-day learning plan — completely free.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/explore"
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-3.5 rounded-lg text-base font-semibold hover:bg-emerald-700 transition-colors shadow-lg"
          >
            Start Exploring &rarr;
          </Link>
          <Link
            href="/careers"
            className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-3.5 rounded-lg text-base font-semibold border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Browse All Careers
          </Link>
        </div>
      </section>
    </div>
  );
}
