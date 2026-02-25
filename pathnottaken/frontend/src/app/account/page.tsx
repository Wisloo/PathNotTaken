"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchMe, API_ORIGIN } from "@/lib/api";
import { useToast } from "@/components/Toast";

/* ─── Type Definitions ─── */
interface RoadmapDetail { id: string; careerId: string; title: string; createdAt: string }
interface SkillSnapshot { id: number; skills: string[]; interests: string[]; background?: string; currentField?: string; createdAt: string }
interface SavedResult { id: string; skills: string[]; interests: string[]; source: string; createdAt: string }
interface GamificationData { xp: number; level: number; streakDays: number; tasksCompleted: number; lastActivityDate?: string; badges: string[] }
interface UserProfile {
  id: string; email: string; name?: string; createdAt?: string;
  roadmaps?: string[]; roadmapDetails?: RoadmapDetail[];
  skillSnapshots?: SkillSnapshot[]; savedResults?: SavedResult[];
  gamification?: GamificationData;
}

/* Badge metadata (mirrors gamificationService.js ACHIEVEMENTS) */
const BADGE_META: Record<string, { icon: string; title: string; description: string; howTo: string }> = {
  "first-steps":       { icon: "👣", title: "First Steps",        description: "Completed first task",  howTo: "Complete any task to earn this badge" },
  "week-warrior":      { icon: "🔥", title: "Week Warrior",       description: "7-day streak",          howTo: "Use the app for 7 consecutive days" },
  "month-master":      { icon: "🏆", title: "Month Master",       description: "30-day streak",         howTo: "Maintain a 30-day activity streak" },
  "unstoppable":       { icon: "💎", title: "Unstoppable",        description: "90-day streak",         howTo: "Keep your streak going for 90 days straight!" },
  "committed-learner": { icon: "📚", title: "Committed Learner",  description: "50 tasks completed",    howTo: "Complete 50 tasks across any activities" },
  "master-achiever":   { icon: "🎯", title: "Master Achiever",    description: "200 tasks completed",   howTo: "Reach 200 total completed tasks" },
  "polymath":          { icon: "🧠", title: "Polymath",           description: "5 skill categories",    howTo: "Learn skills from 5 different categories" },
  "renaissance":       { icon: "🌟", title: "Renaissance Person", description: "10 skill categories",   howTo: "Master skills across 10 different categories" },
  "explorer":          { icon: "🗺️", title: "Career Explorer",    description: "10 careers explored",   howTo: "Explore and view details for 10 different careers" },
  "pathfinder":        { icon: "🚀", title: "Pathfinder",         description: "Completed a roadmap",   howTo: "Complete all steps in any career roadmap" },
  "ai-pioneer":        { icon: "🤖", title: "AI Pioneer",         description: "3 AI/ML skills",        howTo: "Add 3 AI/ML skills like Machine Learning, NLP, or Computer Vision" },
  "data-wizard":       { icon: "📊", title: "Data Wizard",        description: "5 data skills",         howTo: "Learn 5 data analysis related skills" },
};

/* ─── Contribution Calendar (streak heatmap) ─── */
function ContributionCalendar({ lastActivityDate, streakDays }: { lastActivityDate?: string; streakDays: number }) {
  const today = new Date();
  const cells: { date: string; active: boolean }[] = [];

  // Calculate which dates were "active" based on streak
  const activeSet = new Set<string>();
  if (streakDays > 0 && lastActivityDate) {
    const latestDate = new Date(lastActivityDate);
    for (let i = 0; i < streakDays; i++) {
      const d = new Date(latestDate);
      d.setDate(d.getDate() - i);
      activeSet.add(d.toISOString().split('T')[0]);
    }
  }

  // Build 26 weeks (6 months) of cells
  const totalDays = 26 * 7;
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - totalDays + 1);
  // Align to Monday
  const dayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    cells.push({ date: dateStr, active: activeSet.has(dateStr) });
  }

  // Group into columns (weeks)
  const weeks: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const monthLabels: string[] = [];
  let lastMonth = -1;
  weeks.forEach((week) => {
    const d = new Date(week[0].date);
    if (d.getMonth() !== lastMonth) {
      lastMonth = d.getMonth();
      monthLabels.push(d.toLocaleString('en-US', { month: 'short' }));
    } else {
      monthLabels.push('');
    }
  });

  return (
    <div>
      <div className="flex gap-[3px] text-[10px] text-gray-400 mb-1.5 ml-8">
        {monthLabels.map((label, i) => (
          <div key={i} className="w-[16px] text-center">{label ? <span className="whitespace-nowrap">{label}</span> : ''}</div>
        ))}
      </div>
      <div className="flex gap-[3px]">
        <div className="flex flex-col gap-[3px] mr-1.5 text-[10px] text-gray-400 justify-between">
          <span>Mon</span><span></span><span>Wed</span><span></span><span>Fri</span><span></span><span></span>
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((cell, di) => {
              const isToday = cell.date === today.toISOString().split('T')[0];
              return (
                <div
                  key={di}
                  title={`${cell.date}${cell.active ? ' — active' : ''}`}
                  className={`w-[16px] h-[16px] rounded transition-colors ${
                    cell.active
                      ? 'bg-emerald-500 hover:bg-emerald-400'
                      : 'bg-gray-100 hover:bg-gray-200'
                  } ${isToday ? 'ring-2 ring-emerald-300 ring-offset-1' : ''}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function AccountPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'roadmaps' | 'skills'>('overview');
  const [profileCopied, setProfileCopied] = useState(false);
  const router = useRouter();
  const { toast, confirm } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("pn_token");
    if (!token) { setLoading(false); return; }
    fetchMe(token)
      .then((res) => setUser(res?.user || null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  function logout() {
    localStorage.removeItem("pn_token");
    localStorage.removeItem("pn_user_name");
    setUser(null);
    toast("Signed out successfully.", "info");
    router.push("/");
  }

  async function deleteRoadmap(id: string) {
    confirm("Are you sure you want to delete this roadmap? This cannot be undone.", async () => {
      setDeletingId(id);
      try {
        const token = localStorage.getItem("pn_token");
        const res = await fetch(`${API_ORIGIN}/api/roadmaps/${id}`, {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const j = await res.json();
        if (j?.success) {
          setUser((prev) => prev ? { ...prev, roadmaps: prev.roadmaps?.filter((r) => r !== id), roadmapDetails: prev.roadmapDetails?.filter((r) => r.id !== id) } : prev);
          toast("Roadmap deleted.", "success");
        } else {
          toast("Failed to delete roadmap.", "error");
        }
      } catch { toast("Connection error. Please try again.", "error"); }
      finally { setDeletingId(null); }
    });
  }

  function shareProfileLink() {
    if (!user) return;
    const url = `${window.location.origin}/profile?user=${user.id}`;
    navigator.clipboard.writeText(url);
    setProfileCopied(true);
    toast("Profile link copied!", "success");
    setTimeout(() => setProfileCopied(false), 3000);
  }

  /* ─── Loading state ─── */
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-20 px-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-6 h-6 border-3 border-gray-200 border-t-emerald-600 rounded-full animate-spin" />
          <span className="text-gray-500">Loading your profile...</span>
        </div>
      </div>
    );
  }

  /* ─── Not signed in ─── */
  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4">
        <div className="card-static p-8 text-center">
          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Not signed in</h2>
          <p className="text-sm text-gray-500 mb-4">Sign in to save your roadmaps and track your progress.</p>
          <div className="flex justify-center gap-3">
            <Link href="/login" className="btn-primary px-4 py-2 text-sm">Sign in</Link>
            <Link href="/signup" className="btn-secondary px-4 py-2 text-sm">Create account</Link>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Gamification data ─── */
  const g = user.gamification || { xp: 0, level: 1, streakDays: 0, tasksCompleted: 0, badges: [], lastActivityDate: undefined };
  // Use exponential thresholds matching backend (100 * 1.5^level)
  const LEVEL_THRESHOLDS = Array.from({ length: 100 }, (_, i) => Math.floor(100 * Math.pow(1.5, i)));
  const currentLevelXP = LEVEL_THRESHOLDS[g.level - 1] || 0;
  const nextLevelXP = LEVEL_THRESHOLDS[g.level] || currentLevelXP + 500;
  const xpToNext = nextLevelXP - currentLevelXP;
  const xpIntoLevel = g.xp - currentLevelXP;
  const xpProgress = xpToNext > 0 ? Math.min(100, Math.round((xpIntoLevel / xpToNext) * 100)) : 100;
  const memberSince = user.createdAt ? new Date(user.createdAt) : new Date();
  const daysSinceJoin = Math.max(1, Math.floor((Date.now() - memberSince.getTime()) / (1000 * 60 * 60 * 24)));
  const roadmapCount = (user.roadmapDetails || []).length;
  const snapshotCount = (user.skillSnapshots || []).length;

  return (
    <div className="max-w-5xl mx-auto pb-8">
      {/* ═══════════════════════════════════════════════════
          PROFILE HEADER (with gradient banner)
          ═══════════════════════════════════════════════════ */}
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        {/* Gradient banner */}
        <div className="relative h-28 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-teal-600/20" />
          <div className="absolute top-3 left-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-3 right-10 w-32 h-32 bg-teal-300/10 rounded-full blur-2xl" />
        </div>

        {/* Profile content — avatar overlaps the banner edge */}
        <div className="px-5 sm:px-6 pb-5">
          <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
            {/* Avatar — pulled up into the banner */}
            <div className="relative flex-shrink-0 -mt-10">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white">
                <span className="text-white font-bold text-3xl">{(user.name || user.email)[0].toUpperCase()}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow">
                Lv.{g.level}
              </div>
            </div>

            {/* Name & info */}
            <div className="flex-1 text-center md:text-left min-w-0 pt-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{user.name || user.email.split('@')[0]}</h1>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
              {user.createdAt && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })} &middot; {daysSinceJoin} days
                </p>
              )}
            </div>

            {/* Share Profile Button */}
            <div className="flex-shrink-0 pt-2">
              <button onClick={shareProfileLink} className="px-4 py-2 text-xs font-medium border border-gray-200 bg-white rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-1.5 shadow-sm">
                {profileCopied ? '✓ Copied!' : '🔗 Share Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 text-center">
            <div className="text-xl">⭐</div>
            <div className="text-lg font-bold text-gray-800">{g.xp.toLocaleString()}</div>
            <div className="text-[10px] text-gray-500">Total XP</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-3 text-center">
            <div className="text-xl">🏆</div>
            <div className="text-lg font-bold text-gray-800">Level {g.level}</div>
            <div className="text-[10px] text-gray-500">{xpProgress}% to next</div>
          </div>
            <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-3 text-center">
              <div className="text-xl">🔥</div>
              <div className="text-lg font-bold text-gray-800">{g.streakDays}</div>
              <div className="text-[10px] text-gray-500">Day Streak</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 text-center">
              <div className="text-xl">✅</div>
              <div className="text-lg font-bold text-gray-800">{g.tasksCompleted}</div>
              <div className="text-[10px] text-gray-500">Tasks Done</div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-3 mt-3 mb-6">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Level {g.level}</span>
              <span>{Math.max(0, xpIntoLevel)} / {xpToNext} XP</span>
              <span>Level {g.level + 1}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div className="h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500" style={{ width: `${xpProgress}%` }} />
            </div>
          </div>

      {/* ═══════════════════════════════════════════════════
          CONTRIBUTION CALENDAR (GitHub-style streak heatmap)
          ═══════════════════════════════════════════════════ */}
      <div className="card-static p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800">{g.tasksCompleted} contributions in the last 6 months</h3>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Less</span>
            <div className="flex gap-[3px]">
              <div className="w-[16px] h-[16px] rounded bg-gray-100" />
              <div className="w-[16px] h-[16px] rounded bg-emerald-200" />
              <div className="w-[16px] h-[16px] rounded bg-emerald-400" />
              <div className="w-[16px] h-[16px] rounded bg-emerald-600" />
            </div>
            <span>More</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <ContributionCalendar lastActivityDate={g.lastActivityDate} streakDays={g.streakDays} />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          BADGES (earned achievements)
          ═══════════════════════════════════════════════════ */}
      <div className="card-static p-5 mb-6">
        <h3 className="text-sm font-bold text-gray-800 mb-3">🏅 Achievements</h3>
        {g.badges.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {g.badges.map((badgeId) => {
              const meta = BADGE_META[badgeId] || { icon: '🏅', title: badgeId, description: '' };
              return (
                <div key={badgeId} className="flex items-center gap-2 bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl px-3 py-2">
                  <span className="text-xl">{meta.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-gray-800">{meta.title}</p>
                    <p className="text-[10px] text-gray-500">{meta.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-xs text-gray-400">Complete tasks and maintain streaks to earn achievements!</p>
          </div>
        )}

        {/* Show locked badges */}
        {Object.keys(BADGE_META).filter(id => !g.badges.includes(id)).length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 mb-2 uppercase tracking-wider font-medium">Locked</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(BADGE_META).filter(([id]) => !g.badges.includes(id)).map(([id, meta]) => (
                <div key={id} className="group relative flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 opacity-50 hover:opacity-80 transition-opacity cursor-help">
                  <span className="text-lg grayscale">{meta.icon}</span>
                  <div>
                    <p className="text-xs font-medium text-gray-500">{meta.title}</p>
                    <p className="text-[10px] text-gray-400">{meta.description}</p>
                  </div>
                  {/* Hover tooltip showing how to unlock */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-[11px] rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
                    <div className="font-semibold mb-0.5">How to unlock:</div>
                    <div>{meta.howTo}</div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════
          TABBED CONTENT (Roadmaps / Skills / Saved Results)
          ═══════════════════════════════════════════════════ */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {[
            { key: 'overview' as const, label: 'Overview', count: roadmapCount },
            { key: 'roadmaps' as const, label: 'Roadmaps', count: roadmapCount },
            { key: 'skills' as const, label: 'Skill History', count: snapshotCount },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{tab.count}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* ─── Overview Tab ─── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick summary stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card-static p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center"><span className="text-lg">🗺️</span></div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{roadmapCount}</p>
                  <p className="text-xs text-gray-500">Roadmaps Created</p>
                </div>
              </div>
            </div>
            <div className="card-static p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><span className="text-lg">📊</span></div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{snapshotCount}</p>
                  <p className="text-xs text-gray-500">Skill Snapshots</p>
                </div>
              </div>
            </div>

          </div>

          {/* Member stats */}
          <div className="card-static p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3">📈 Your Journey</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-emerald-600">{daysSinceJoin}</p>
                <p className="text-xs text-gray-500">Days as member</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{g.tasksCompleted}</p>
                <p className="text-xs text-gray-500">Tasks completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{g.badges.length}</p>
                <p className="text-xs text-gray-500">Achievements</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">{g.streakDays}</p>
                <p className="text-xs text-gray-500">Current streak</p>
              </div>
            </div>
          </div>

          {/* Latest skill snapshot */}
          {(user.skillSnapshots || []).length > 0 && (
            <div className="card-static p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-800">🧠 Latest Skills</h3>
                <span className="text-[10px] text-gray-400">
                  Saved {new Date(user.skillSnapshots![0].createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {user.skillSnapshots![0].skills.map(s => (
                  <span key={s} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
                    {s.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recent roadmaps */}
          {(user.roadmapDetails || []).length > 0 && (
            <div className="card-static p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-3">📋 Recent Roadmaps</h3>
              <div className="space-y-2">
                {(user.roadmapDetails || []).slice(0, 3).map(rm => (
                  <Link key={rm.id} href={`/roadmap?share=${rm.id}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">🗺️</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 truncate">{rm.title || 'Untitled Roadmap'}</p>
                      <p className="text-[10px] text-gray-400">{new Date(rm.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Roadmaps Tab ─── */}
      {activeTab === 'roadmaps' && (
        <div className="card-static p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Saved Roadmaps</h2>
            <Link href="/careers" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">+ Create new</Link>
          </div>
          {(user.roadmapDetails || []).length > 0 ? (
            <div className="space-y-3">
              {(user.roadmapDetails || []).map((rm) => (
                <div key={rm.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <Link href={`/roadmap?share=${rm.id}`} className="text-sm font-semibold text-gray-900 hover:text-emerald-600 truncate block">
                        {rm.title || 'Untitled Roadmap'}
                      </Link>
                      {rm.createdAt && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Created {new Date(rm.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 ml-4">
                    <Link href={`/roadmap?share=${rm.id}`} className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-medium">
                      Open
                    </Link>
                    <button
                      className="text-xs px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-red-600 hover:bg-red-100 disabled:opacity-50 font-medium"
                      onClick={() => deleteRoadmap(rm.id)}
                      disabled={deletingId === rm.id}
                    >
                      {deletingId === rm.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-3xl mb-3 block">🗺️</span>
              <p className="text-sm text-gray-500 mb-1">No saved roadmaps yet</p>
              <p className="text-xs text-gray-400">Create one from a career page and click &quot;Save roadmap.&quot;</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Skill History Tab ─── */}
      {activeTab === 'skills' && (
        <div className="space-y-5">
          {/* Summary Banner */}
          {(user.skillSnapshots || []).length > 0 && (() => {
            const snaps = user.skillSnapshots!;
            const allSkillsEver = new Set(snaps.flatMap(s => s.skills));
            const latestCount = snaps[0].skills.length;
            const oldestCount = snaps[snaps.length - 1].skills.length;
            const growth = latestCount - oldestCount;
            return (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="card-static p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-600">{allSkillsEver.size}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Total Unique Skills</div>
                </div>
                <div className="card-static p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{snaps.length}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Snapshots Saved</div>
                </div>
                <div className="card-static p-4 text-center">
                  <div className={`text-2xl font-bold ${growth > 0 ? 'text-green-600' : growth < 0 ? 'text-red-500' : 'text-gray-600'}`}>
                    {growth > 0 ? `+${growth}` : growth === 0 ? '—' : String(growth)}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Skill Growth</div>
                </div>
              </div>
            );
          })()}

          {/* Skill Growth Chart (mini bar visualization) */}
          {(user.skillSnapshots || []).length > 1 && (() => {
            const snaps = [...(user.skillSnapshots || [])].reverse(); // oldest first for chart
            const maxSkills = Math.max(...snaps.map(s => s.skills.length), 1);
            return (
              <div className="card-static p-5">
                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span>📈</span> Skill Growth Over Time
                </h3>
                <div className="flex items-end gap-2 h-28">
                  {snaps.map((snap, i) => {
                    const height = Math.max(8, (snap.skills.length / maxSkills) * 100);
                    const isLatest = i === snaps.length - 1;
                    return (
                      <div key={snap.id} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div className="text-[10px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          {snap.skills.length}
                        </div>
                        <div
                          className={`w-full max-w-[48px] rounded-t-lg transition-all duration-300 ${
                            isLatest
                              ? 'bg-gradient-to-t from-emerald-500 to-emerald-400 shadow-sm'
                              : 'bg-gradient-to-t from-gray-200 to-gray-100 group-hover:from-emerald-200 group-hover:to-emerald-100'
                          }`}
                          style={{ height: `${height}%` }}
                          title={`${snap.skills.length} skills — ${new Date(snap.createdAt).toLocaleDateString()}`}
                        />
                        <span className="text-[9px] text-gray-400 mt-0.5 whitespace-nowrap">
                          {new Date(snap.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Timeline */}
          <div className="card-static p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-800">🧠 Skill Snapshots</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Each time you save your skills, a snapshot is recorded to track your growth
                </p>
              </div>
              <Link href="/explore" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                + New snapshot
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>

            {(user.skillSnapshots || []).length > 0 ? (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[15px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-emerald-300 via-emerald-200 to-gray-200 rounded-full" />

                <div className="space-y-5">
                  {(user.skillSnapshots || []).map((snap, i) => {
                    const prevSnap = (user.skillSnapshots || [])[i + 1];
                    const newSkills = prevSnap ? snap.skills.filter(s => !prevSnap.skills.includes(s)) : [];
                    const removedSkills = prevSnap ? prevSnap.skills.filter(s => !snap.skills.includes(s)) : [];
                    const isLatest = i === 0;

                    return (
                      <div key={snap.id} className="relative pl-10">
                        {/* Timeline dot */}
                        <div className={`absolute left-[9px] top-3 w-3.5 h-3.5 rounded-full border-2 ${
                          isLatest
                            ? 'bg-emerald-500 border-emerald-300 ring-4 ring-emerald-50'
                            : 'bg-white border-gray-300'
                        }`} />

                        <div className={`rounded-xl border p-4 transition-all ${
                          isLatest
                            ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white shadow-sm'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}>
                          {/* Header row */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-gray-800">
                                {new Date(snap.createdAt).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
                              </span>
                              {isLatest && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Current</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">
                                {snap.skills.length} skill{snap.skills.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>

                          {/* Change summary badges */}
                          {(newSkills.length > 0 || removedSkills.length > 0) && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {newSkills.length > 0 && (
                                <span className="text-[10px] font-bold text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                  +{newSkills.length} new
                                </span>
                              )}
                              {removedSkills.length > 0 && (
                                <span className="text-[10px] font-medium text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                  -{removedSkills.length} removed
                                </span>
                              )}
                            </div>
                          )}

                          {/* Skill tags */}
                          <div className="flex flex-wrap gap-1.5">
                            {snap.skills.map(s => {
                              const isNew = newSkills.includes(s);
                              return (
                                <span
                                  key={s}
                                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                                    isNew
                                      ? 'bg-green-100 text-green-700 border border-green-300 ring-1 ring-green-100'
                                      : 'bg-gray-50 text-gray-600 border border-gray-200'
                                  }`}
                                >
                                  {isNew && <span className="mr-0.5">✨</span>}{s.replace(/-/g, ' ')}
                                </span>
                              );
                            })}
                          </div>

                          {/* Interests if present */}
                          {snap.interests && snap.interests.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Interests</p>
                              <div className="flex flex-wrap gap-1.5">
                                {snap.interests.map(int => (
                                  <span key={int} className="text-[11px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200 font-medium">
                                    {int.replace(/-/g, ' ')}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">📊</span>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">No skill snapshots yet</p>
                <p className="text-xs text-gray-400 mb-4">
                  Go to the <Link href="/explore" className="text-emerald-600 hover:underline font-medium">Explore page</Link>, search for careers, and click &quot;Save Results &amp; Skills&quot; on the results page.
                </p>
                <Link href="/explore" className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors">
                  Start exploring
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
