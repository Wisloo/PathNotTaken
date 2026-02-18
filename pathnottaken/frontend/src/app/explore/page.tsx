import SkillsForm from "@/components/SkillsForm";

export default function ExplorePage() {
  return (
    <section className="min-h-screen bg-[#fafbfc]">
      {/* Mini hero */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-48 h-48 bg-teal-500/15 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">Discover your path</p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2">
            Tell us about <span className="text-emerald-400">you</span>
          </h1>
          <p className="text-gray-400 text-sm max-w-lg">
            Share your skills and interests &mdash; we&apos;ll surface career paths you&apos;d never expect.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <SkillsForm />
      </div>
    </section>
  );
}
