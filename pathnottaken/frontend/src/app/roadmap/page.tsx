"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { fetchCareerById, API_ORIGIN } from "@/lib/api";
import { useToast } from "@/components/Toast";

type Resource = { type: string; title: string; provider: string; url?: string; free?: boolean; hours?: number; skill?: string; skillId?: string; isFree?: boolean };
type Project = { title: string; description: string; hours?: number; skills?: string[] };
type WeekTask = { id: string; title: string; done?: boolean; note?: string; type?: string; estimatedHours?: number; resource?: Resource | null; project?: Project | null };
type RoadmapWeek = {
  week: number;
  month: number;
  focusSkill: string;
  focusSkillLabel: string;
  isMissing: boolean;
  phase: string;
  tasks: WeekTask[];
  totalHours: number;
  tip: string;
};
type MonthData = { month: number; title: string; focus: string; phase: string; weeks: RoadmapWeek[] };
type Milestone = { week: number; title: string; description: string };

export default function RoadmapPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="flex items-center justify-center gap-3">
          <div className="w-6 h-6 border-3 border-gray-200 border-t-emerald-600 rounded-full animate-spin" />
          <span className="text-gray-500">Loading roadmap...</span>
        </div>
      </div>
    }>
      <RoadmapContent />
    </Suspense>
  );
}

function RoadmapContent() {
  const params = useSearchParams();
  const careerId = params?.get("career") || "";
  const [loading, setLoading] = useState(true);
  const [career, setCareer] = useState<any>(null);
  const [months, setMonths] = useState<MonthData[]>([]);
  const [originalMonths, setOriginalMonths] = useState<MonthData[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [topResources, setTopResources] = useState<Resource[]>([]);
  const [matchedSkills, setMatchedSkills] = useState<string[]>([]);
  const [missingSkills, setMissingSkills] = useState<string[]>([]);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [initialWeeklyHours, setInitialWeeklyHours] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [showResources, setShowResources] = useState(false);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const { toast } = useToast();

  // Convert flat weeks (old save format) into month structure so everything uses the unified accordion UI
  function flatWeeksToMonths(flatWeeks: WeekTask[][]): MonthData[] {
    const phases: string[] = ['foundation', 'practice', 'project'];
    const phaseNames = ['Foundation', 'Building Skills', 'Portfolio Projects'];
    return Array.from({ length: Math.min(3, Math.ceil(flatWeeks.length / 4)) }, (_, mi) => ({
      month: mi + 1,
      title: phaseNames[mi] || `Month ${mi + 1}`,
      focus: 'General skills',
      phase: phases[mi] || 'foundation',
      weeks: flatWeeks.slice(mi * 4, (mi + 1) * 4).map((tasks, wi) => ({
        week: mi * 4 + wi + 1,
        month: mi + 1,
        focusSkill: `week-${mi * 4 + wi + 1}`,
        focusSkillLabel: `Week ${mi * 4 + wi + 1} Tasks`,
        isMissing: false,
        phase: phases[mi] || 'foundation',
        tasks,
        totalHours: weeklyHours,
        tip: '',
      }))
    }));
  }

  // Recalculate hours from ORIGINAL data when weeklyHours changes (avoids compounding rounding)
  useEffect(() => {
    if (originalMonths.length === 0 || weeklyHours === initialWeeklyHours) return;
    const ratio = weeklyHours / initialWeeklyHours;

    // Preserve task completion state
    const completedIds = new Set<string>();
    months.forEach(m => m.weeks.forEach(w => w.tasks.forEach(t => { if (t.done) completedIds.add(t.id); })));

    setMonths(originalMonths.map(month => ({
      ...month,
      weeks: month.weeks.map(week => ({
        ...week,
        totalHours: weeklyHours,
        tasks: week.tasks.map(task => ({
          ...task,
          done: completedIds.has(task.id),
          estimatedHours: task.estimatedHours ? Math.max(1, Math.round(task.estimatedHours * ratio)) : undefined
        }))
      }))
    })));
  }, [weeklyHours, originalMonths, initialWeeklyHours]);

  useEffect(() => {
    const shareId = params?.get("share");

    async function loadShared(id: string) {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_ORIGIN}/api/roadmaps/${id}`);
        if (!res.ok) throw new Error("Roadmap not found");
        const json = await res.json();
        const r = json.roadmap;
        const c = await fetchCareerById(r.careerId);
        setCareer(c);
        // Restore month structure from saved data
        if (r.months && Array.isArray(r.months) && r.months.length > 0) {
          // New save format with full month structure
          setMonths(r.months);
          setOriginalMonths(r.months);
          setMilestones(r.milestones || []);
          setMatchedSkills(r.matchedSkills || []);
          setMissingSkills(r.missingSkills || []);
          setWeeklyHours(r.weeklyHours || 10);
          setInitialWeeklyHours(r.weeklyHours || 10);
        } else if (r.weeks && Array.isArray(r.weeks) && r.weeks.length > 0) {
          // Old save format: convert flat weeks → month structure
          const converted = flatWeeksToMonths(r.weeks);
          setMonths(converted);
          setOriginalMonths(converted);
        }
        setSavedUrl(window.location.href);
      } catch (err) {
        console.error(err);
        setError("Could not load the saved roadmap. It may have been deleted.");
      } finally {
        setLoading(false);
      }
    }

    async function buildForCareer(id: string) {
      setLoading(true);
      setError(null);
      let careerData: any = null;
      try {
        careerData = await fetchCareerById(id);
        setCareer(careerData);

        // Try loading concrete roadmap from backend

        // Get user skills from URL or localStorage
        const urlSkills = params?.get("skills")?.split(",").filter(Boolean) || [];
        const storedSkills = JSON.parse(localStorage.getItem("pn_user_skills") || "[]");
        const userSkills = urlSkills.length > 0 ? urlSkills : storedSkills;

        const res = await fetch(`${API_ORIGIN}/api/skills/concrete-roadmap`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ careerId: id, userSkills, weeklyHours })
        });

        if (res.ok) {
          const json = await res.json();
          const roadmap = json.roadmap;
          setOriginalMonths(roadmap.months);
          setMonths(roadmap.months);
          setMilestones(roadmap.milestones);
          setTopResources(roadmap.topResources || []);
          setMatchedSkills(roadmap.matchedSkills || []);
          setMissingSkills(roadmap.missingSkills || []);
          setInitialWeeklyHours(weeklyHours);
        } else {
          // Fallback to old-style generation
          buildLegacyRoadmap(careerData);
        }
      } catch (err) {
        console.error(err);
        if (careerData) buildLegacyRoadmap(careerData);
        else setError("Failed to build roadmap. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    }

    if (shareId) {
      loadShared(shareId);
    } else if (careerId) {
      buildForCareer(careerId);
    } else {
      setLoading(false);
    }
  }, [careerId]);

  function buildLegacyRoadmap(c: any) {
    const skills = [
      ...(c.missingSkills || []),
      ...(c.matchedSkills?.slice(0, 6) || []),
      ...(c.requiredSkills?.slice(0, 6) || []),
    ].map((s: string) => s.replace(/-/g, " "));

    if (skills.length === 0) skills.push('general skills');

    const phases = ['foundation', 'practice', 'project'];
    const phaseNames = ['Foundation', 'Building Skills', 'Portfolio Projects'];

    const generatedMonths: MonthData[] = Array.from({ length: 3 }, (_, mi) => ({
      month: mi + 1,
      title: phaseNames[mi],
      focus: skills[mi % skills.length] || 'General skills',
      phase: phases[mi],
      weeks: Array.from({ length: 4 }, (_, wi) => {
        const weekNum = mi * 4 + wi + 1;
        const skillIdx = (mi * 4 + wi) % Math.max(1, skills.length);
        const skill = skills[skillIdx] || 'general';
        return {
          week: weekNum,
          month: mi + 1,
          focusSkill: skill.replace(/\s+/g, '-'),
          focusSkillLabel: skill.charAt(0).toUpperCase() + skill.slice(1),
          isMissing: false,
          phase: phases[mi],
          tasks: [
            { id: `t-${weekNum}-1`, title: `Learn: core concept \u2014 ${skill}`, type: 'learn' },
            { id: `t-${weekNum}-2`, title: `Practice: complete 1 exercise`, type: 'practice' },
            { id: `t-${weekNum}-3`, title: `Build: apply to a mini-project`, type: 'build' },
            { id: `t-${weekNum}-4`, title: `Reflect: note 3 things you learned`, type: 'milestone' },
          ],
          totalHours: weeklyHours,
          tip: '',
        };
      })
    }));

    setMonths(generatedMonths);
    setOriginalMonths(generatedMonths);
  }

  function toggleTask(monthIdx: number, weekIdx: number, taskIdx: number) {
    setMonths(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const task = copy[monthIdx].weeks[weekIdx].tasks[taskIdx];
      task.done = !task.done;
      // Award XP if completing
      if (task.done) awardXPForTask(task);
      return copy;
    });
  }

  async function awardXPForTask(task: WeekTask) {
    try {
      const token = localStorage.getItem('pn_token');
      if (!token) return;
      const res = await fetch(`${API_ORIGIN}/api/gamification/task-complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ skillIds: [], difficulty: 'medium' })
      });
      if (res.ok) {
        const json = await res.json();
        const streakText = json.streak?.isNewStreak ? ` (${json.streak.streakDays} day streak!)` : '';
        toast(`+${json.xpAwarded} XP earned!${streakText}`, 'success');
      }
    } catch (err) {
      console.error('Failed to award XP:', err);
    }
  }

  async function saveRoadmap() {
    if (!career) return;
    try {
      const token = localStorage.getItem('pn_token');
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const shareId = params?.get('share');
      const payload = {
        careerId: career.id,
        title: career.title,
        weeks: months.flatMap(m => m.weeks.map(w => w.tasks)),
        months,
        milestones,
        matchedSkills,
        missingSkills,
        weeklyHours,
      };

      if (shareId) {
        const res = await fetch(`${API_ORIGIN}/api/roadmaps/${shareId}`, { method: 'PUT', headers, body: JSON.stringify(payload) });
        const j = await res.json();
        if (j?.success) { toast('Roadmap saved!', 'success'); setSavedUrl(window.location.href); }
        return;
      }

      const res = await fetch(`${API_ORIGIN}/api/roadmaps`, {
        method: "POST", headers,
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json?.url) {
        setSavedUrl(json.url);
        const u = new URL(window.location.href);
        u.searchParams.delete("career");
        u.searchParams.set("share", json.id);
        window.history.replaceState({}, "", u.toString());
        toast('Roadmap saved! You can find it in your account.', 'success');
      }
    } catch (err) {
      console.error(err);
      toast('Failed to save roadmap. Please try again.', 'error');
    }
  }

  // Calculate progress
  const allTasks = months.flatMap(m => m.weeks.flatMap(w => w.tasks));
  const completedTasks = allTasks.filter(t => t.done);
  const progressPercent = allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0;

  // Estimated completion date
  const weeksRemaining = months.length > 0 ? 12 - Math.floor((completedTasks.length / Math.max(allTasks.length, 1)) * 12) : 12;
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + weeksRemaining * 7);

  const phaseColors: Record<string, string> = {
    foundation: 'border-blue-200 bg-gradient-to-br from-blue-50 to-white',
    practice: 'border-amber-200 bg-gradient-to-br from-amber-50 to-white',
    project: 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white',
  };

  const phaseAccent: Record<string, string> = {
    foundation: 'bg-blue-600',
    practice: 'bg-amber-500',
    project: 'bg-emerald-600',
  };

  const phaseIcons: Record<string, string> = {
    foundation: '📚',
    practice: '🏋️',
    project: '🚀',
  };

  const taskTypeIcons: Record<string, string> = {
    learn: '📖',
    practice: '💪',
    build: '🔨',
    milestone: '⭐',
  };

  const resourceTypeIcons: Record<string, string> = {
    course: '🎓',
    book: '📕',
    article: '📄',
    practice: '🏋️',
    tool: '🔧',
    video: '🎥',
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-24 px-6">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-emerald-600 rounded-full animate-spin" />
          <div className="text-center">
            <p className="text-gray-700 font-medium">Building your personalized roadmap...</p>
            <p className="text-sm text-gray-400 mt-1">Curating resources and planning your 90-day journey</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-lg font-bold text-red-800 mb-2">Something went wrong</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/careers" className="inline-flex items-center gap-2 btn-primary px-6 py-2.5">
            Browse Careers
          </Link>
        </div>
      </div>
    );
  }

  if (!careerId && !params?.get("share")) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-6">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🗺️</span>
          </div>
          <h2 className="text-xl font-bold mb-2">No career selected</h2>
          <p className="text-gray-500 mb-6">Pick a career to generate your personalized 90-day learning roadmap with curated resources.</p>
          <Link href="/careers" className="inline-flex items-center gap-2 btn-primary px-6 py-2.5">
            Browse Careers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* ──────── HERO HEADER ──────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 p-6 sm:p-8 mb-8">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',backgroundSize:'40px 40px'}} />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <Link href="/careers" className="inline-flex items-center gap-1 text-emerald-200 hover:text-white text-sm transition-colors mb-3 group">
              <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to Careers
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              90-Day Roadmap
            </h1>
            <p className="text-emerald-100 mt-1.5 text-sm sm:text-base">
              Your personalized learning plan for <strong className="text-white font-semibold">{career?.title || '...'}</strong>
            </p>
            {progressPercent > 0 && progressPercent < 100 && (
              <p className="text-emerald-200 text-xs mt-2">
                {progressPercent < 25 ? "🌱 Great start! Keep the momentum going." : progressPercent < 50 ? "🔥 You're making solid progress!" : progressPercent < 75 ? "⚡ Over halfway there — amazing work!" : "🏆 Almost done — the finish line awaits!"}
              </p>
            )}
            {progressPercent === 100 && <p className="text-yellow-300 text-xs mt-2 font-semibold">🎉 Congratulations! You&apos;ve completed your roadmap!</p>}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <button
              className="px-4 py-2.5 bg-white/15 backdrop-blur border border-white/20 text-white text-sm rounded-xl hover:bg-white/25 font-medium transition-all"
              onClick={() => { navigator.clipboard.writeText(window.location.href); toast('Link copied!', 'info'); }}
            >
              📋 Copy Link
            </button>
            <button
              className="px-4 py-2.5 bg-white text-emerald-700 text-sm rounded-xl hover:bg-emerald-50 hover:shadow-lg font-semibold transition-all"
              onClick={saveRoadmap}
            >
              💾 Save Roadmap
            </button>
          </div>
        </div>

        {/* Inline progress in header */}
        <div className="relative z-10 mt-6 bg-white/10 backdrop-blur rounded-xl p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-white/70 font-medium">{completedTasks.length} of {allTasks.length} tasks completed</span>
            <span className="text-xs text-white font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className="bg-gradient-to-r from-yellow-400 to-emerald-300 h-2 rounded-full transition-all duration-700 ease-out" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* ──────── STATS ROW ──────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="relative overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4">
          <div className="absolute -right-3 -top-3 w-16 h-16 bg-emerald-100 rounded-full opacity-50" />
          <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wide">Progress</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{progressPercent}%</p>
          <p className="text-xs text-emerald-400">{completedTasks.length}/{allTasks.length} tasks</p>
        </div>
        <div className="card-static p-4">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Duration</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">12 <span className="text-sm font-medium text-gray-400">weeks</span></p>
          <p className="text-xs text-gray-400">{weeklyHours}h per week</p>
        </div>
        <div className="card-static p-4">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Skills</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{missingSkills.length + matchedSkills.length}</p>
          <p className="text-xs text-gray-400">{missingSkills.length} to learn · {matchedSkills.length} known</p>
        </div>
        <div className="card-static p-4">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Est. Complete</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{estimatedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
          <p className="text-xs text-gray-400">{weeksRemaining} weeks left</p>
        </div>
      </div>

      {/* ──────── WEEKLY HOURS SELECTOR ──────── */}
      <div className="card-static p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-lg">⏱️</span>
            <div>
              <label htmlFor="weeklyHours" className="text-sm font-semibold text-gray-700 block">Weekly time commitment</label>
              <p className="text-xs text-gray-400">Adjusts task hours across your entire roadmap</p>
            </div>
          </div>
          <select
            id="weeklyHours"
            value={weeklyHours}
            onChange={(e) => setWeeklyHours(Number(e.target.value))}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white font-medium text-gray-700 min-w-[220px]"
          >
            <option value={5}>5 hours/week — casual</option>
            <option value={10}>10 hours/week — balanced</option>
            <option value={15}>15 hours/week — intensive</option>
            <option value={20}>20 hours/week — full commitment</option>
          </select>
        </div>
        {weeklyHours !== initialWeeklyHours && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700">
            ✨ Task hours adjusted from {initialWeeklyHours}h → {weeklyHours}h per week. All task estimates have been scaled accordingly.
          </div>
        )}
      </div>

      {/* ──────── LEARNING JOURNEY SUMMARY ──────── */}
      {(missingSkills.length > 0 || matchedSkills.length > 0) && (
        <div className="card-static p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">🎯 Your Learning Journey</h3>
          <p className="text-xs text-gray-400 mb-4">
            Over 12 weeks, you&apos;ll progress from foundations to portfolio-ready projects. Here&apos;s what you&apos;re covering:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">📚</span>
              </div>
              <div>
                <p className="text-xs font-bold text-blue-800">Weeks 1–4</p>
                <p className="text-[10px] text-blue-600">Learn fundamentals & set up tools</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">🏋️</span>
              </div>
              <div>
                <p className="text-xs font-bold text-amber-800">Weeks 5–8</p>
                <p className="text-[10px] text-amber-600">Practice with exercises & projects</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">🚀</span>
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-800">Weeks 9–12</p>
                <p className="text-[10px] text-emerald-600">Build portfolio & prepare for roles</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────── SKILLS OVERVIEW ──────── */}
      {(missingSkills.length > 0 || matchedSkills.length > 0) && (
        <div className="card-static p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Skills Overview</h3>
          <div className="flex flex-wrap gap-2">
            {missingSkills.map(s => (
              <span key={s} className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-xs font-medium">
                📈 {s.replace(/-/g, ' ')}
              </span>
            ))}
            {matchedSkills.map(s => (
              <span key={s} className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-full text-xs font-medium">
                ✓ {s.replace(/-/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ──────── TOP RECOMMENDED RESOURCES ──────── */}
      {topResources.length > 0 && (
        <div className="card-static p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">📚 Recommended Resources</h3>
              <p className="text-xs text-gray-400 mt-0.5">Curated learning materials for your career path</p>
            </div>
            <button
              onClick={() => setShowResources(!showResources)}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              {showResources ? 'Show less' : `View all ${topResources.length}`}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(showResources ? topResources : topResources.slice(0, 6)).map((r, i) => (
              <a
                key={i}
                href={r.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all"
              >
                <span className="text-lg flex-shrink-0">{resourceTypeIcons[r.type] || '📄'}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 group-hover:text-emerald-700 truncate">{r.title}</p>
                  <p className="text-xs text-gray-400 truncate">{r.provider}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {r.skill && <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{r.skill}</span>}
                    {r.isFree && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-semibold">FREE</span>}
                    {r.hours && <span className="text-[10px] text-gray-400">~{r.hours}h</span>}
                  </div>
                </div>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ──────── KEY MILESTONES ──────── */}
      {milestones.length > 0 && (
        <div className="card-static p-5 mb-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs">🏁</span>
            Key Milestones
          </h3>
          <div className="relative">
            {/* Connecting line */}
            <div className="hidden sm:block absolute top-5 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-amber-200 to-emerald-200 z-0" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
              {milestones.map((m, i) => {
                const weekProgress = allTasks.length > 0
                  ? Math.min(100, Math.round((completedTasks.length / allTasks.length) * 12 / m.week * 100))
                  : 0;
                const reached = weekProgress >= 100;
                const milestonePhase = i === 0 ? 'foundation' : i === 1 ? 'practice' : 'project';

                return (
                  <div key={i} className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${reached ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-sm shadow-green-200' : `${phaseColors[milestonePhase]} shadow-sm`}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${reached ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-md shadow-green-300' : `${phaseAccent[milestonePhase]} shadow-sm`}`}>
                      <span className="text-white text-sm font-bold">{reached ? '✓' : `W${m.week}`}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{m.title}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{m.description}</p>
                    {reached && <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"><span className="text-white text-[10px]">✓</span></div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ──────── MONTH CARDS WITH TIMELINE ──────── */}
      {months.length > 0 && (
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="hidden lg:block absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-amber-300 to-emerald-300" />

          <div className="space-y-10">
            {months.map((month, mi) => {
              const monthTasks = month.weeks.flatMap(w => w.tasks);
              const monthDone = monthTasks.filter(t => t.done).length;
              const monthPercent = monthTasks.length > 0 ? Math.round((monthDone / monthTasks.length) * 100) : 0;
              const phaseGradients: Record<string, string> = {
                foundation: 'from-blue-500 to-blue-700',
                practice: 'from-amber-500 to-orange-600',
                project: 'from-emerald-500 to-emerald-700',
              };

              return (
                <div key={mi} className="lg:pl-14 relative">
                  {/* Timeline dot */}
                  <div className={`hidden lg:flex absolute left-0 top-0 w-10 h-10 rounded-xl items-center justify-center bg-gradient-to-br ${phaseGradients[month.phase] || 'from-emerald-500 to-emerald-700'} shadow-lg z-10`}>
                    <span className="text-xl">{phaseIcons[month.phase] || '📋'}</span>
                  </div>

                  {/* Month header card */}
                  <div className={`rounded-2xl border-2 overflow-hidden ${monthPercent === 100 ? 'border-green-300' : `border-gray-200`}`}>
                    <div className={`bg-gradient-to-r ${phaseGradients[month.phase] || 'from-emerald-500 to-emerald-700'} px-5 py-4`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl lg:hidden">{phaseIcons[month.phase] || '📋'}</span>
                          <div>
                            <h2 className="text-lg font-bold text-white">Month {month.month}: {month.title}</h2>
                            <p className="text-white/70 text-xs">
                              {(month as any).description || `Focus: ${month.focus}`} · Weeks {(mi * 4) + 1}–{(mi + 1) * 4}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="hidden sm:block text-right">
                            <p className="text-white font-bold text-sm">{monthPercent}%</p>
                            <p className="text-white/60 text-xs">{monthDone}/{monthTasks.length}</p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                            <svg className="w-8 h-8" viewBox="0 0 36 36">
                              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="white" strokeWidth="3" strokeDasharray={`${monthPercent}, 100`} strokeLinecap="round" className="transition-all duration-700" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Weeks */}
                    <div className="p-3 sm:p-4 space-y-3 bg-white">{month.weeks.map((week, wi) => {
                    const weekCompleted = week.tasks.filter(t => t.done).length;
                    const weekTotal = week.tasks.length;
                    const isExpanded = expandedWeek === week.week;
                    const weekPercent = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;

                    return (
                      <div key={wi} className={`border rounded-xl overflow-hidden transition-all ${phaseColors[week.phase] || 'border-gray-200 bg-white'}`}>
                        {/* Week header */}
                        <button
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-white/40 transition-colors"
                          onClick={() => setExpandedWeek(isExpanded ? null : week.week)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold ${phaseAccent[week.phase] || 'bg-emerald-600'}`}>
                              W{week.week}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-800">{week.focusSkillLabel}</span>
                                {week.isMissing && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">new skill</span>}
                              </div>
                              <span className="text-xs text-gray-400">~{week.totalHours}h this week · {weekCompleted}/{weekTotal} tasks</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {weekPercent === 100 && <span className="text-green-500 text-sm">✓</span>}
                            <div className="w-16 bg-white/60 rounded-full h-1.5 hidden sm:block">
                              <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${weekPercent}%` }} />
                            </div>
                            <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>

                        {/* Expanded tasks */}
                        {isExpanded && (
                          <div className="border-t border-white/60 bg-white p-4 space-y-3">
                            {/* Tip */}
                            {week.tip && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 flex items-start gap-2">
                                <span className="text-sm flex-shrink-0">💡</span>
                                <span>{week.tip}</span>
                              </div>
                            )}

                            {week.tasks.map((task, ti) => (
                              <div key={task.id} className={`rounded-xl border transition-all ${task.done ? 'bg-green-50/50 border-green-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                                <div className="flex items-start gap-3 p-4">
                                  <input
                                    type="checkbox"
                                    checked={!!task.done}
                                    onChange={() => toggleTask(mi, wi, ti)}
                                    className="w-5 h-5 rounded-md mt-0.5 accent-emerald-600 flex-shrink-0"
                                    aria-label={`Mark "${task.title}" as ${task.done ? 'incomplete' : 'complete'}`}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-base">{taskTypeIcons[task.type || ''] || '📋'}</span>
                                      <span className={`text-sm font-medium ${task.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                        {task.title}
                                      </span>
                                    </div>
                                    {task.estimatedHours && (
                                      <span className="text-xs text-gray-400 block mt-1 ml-7">⏱️ ~{task.estimatedHours}h estimated</span>
                                    )}

                                    {/* Resource link — prominent card style */}
                                    {task.resource?.url && (
                                      <a
                                        href={task.resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-2 ml-7 flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors group"
                                      >
                                        <span className="text-lg">{resourceTypeIcons[task.resource.type] || '🔗'}</span>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-emerald-700 group-hover:text-emerald-800 truncate">{task.resource.title}</p>
                                          <p className="text-xs text-emerald-500">{task.resource.provider}</p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                          {task.resource.free && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">FREE</span>}
                                          <svg className="w-4 h-4 text-emerald-400 group-hover:text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                          </svg>
                                        </div>
                                      </a>
                                    )}

                                    {/* Project details */}
                                    {task.project && (
                                      <div className="mt-2 ml-7 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                        <p className="text-xs font-semibold text-emerald-800 mb-1">🔨 Project</p>
                                        <p className="text-xs text-emerald-700">{task.project.description}</p>
                                        {task.project.hours && <p className="text-xs text-emerald-500 mt-1">⏱️ ~{task.project.hours}h estimated</p>}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}

                            <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
                              <span>📅 Suggested: ~{week.totalHours}h this week</span>
                              <span>{weekCompleted}/{weekTotal} completed</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ──────── CAREER CONTEXT ──────── */}
      <div className="mt-10 rounded-2xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-sm">💼</span>
            About {career?.title}
          </h3>
        </div>
        <div className="p-6 bg-white">
          <p className="text-sm text-gray-600 leading-relaxed mb-5">{career?.description}</p>
          {career?.dayInLife && (
            <div className="mb-5 p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">🏢 A Day in the Life</p>
              <p className="text-sm text-gray-600 leading-relaxed">{career.dayInLife}</p>
            </div>
          )}
          {career?.salaryRange && (
            <div className="mb-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Entry Level</p>
                <p className="text-lg font-bold text-gray-900 mt-1">${(career.salaryRange.min / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-50 rounded-xl border border-emerald-200 text-center relative">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-semibold">MEDIAN</div>
                <p className="text-lg font-bold text-emerald-700 mt-2">${(career.salaryRange.median / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Senior Level</p>
                <p className="text-lg font-bold text-gray-900 mt-1">${(career.salaryRange.max / 1000).toFixed(0)}K</p>
              </div>
            </div>
          )}
          {career?.entryPaths && career.entryPaths.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">🚀 How People Get Started</p>
              <div className="space-y-2">
                {career.entryPaths.map((step: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">{i+1}</span>
                    <span className="pt-0.5">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ──────── BOTTOM CTA ──────── */}
      <div className="mt-10 mb-6 text-center">
        <div className="inline-flex flex-col items-center gap-3 p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200">
          <span className="text-3xl">{progressPercent === 100 ? '🎉' : '💪'}</span>
          <p className="text-sm text-gray-500 max-w-md">
            {progressPercent === 100
              ? "Amazing work! You've completed your roadmap. Save it to your portfolio!"
              : "Ready to start? Save your roadmap to track progress over time."}
          </p>
          <div className="flex gap-3 mt-1">
            <button
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-600/20 transition-all hover:-translate-y-0.5"
              onClick={saveRoadmap}
            >
              💾 Save Roadmap
            </button>
            <Link
              href="/careers"
              className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all"
            >
              Explore More Careers
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
