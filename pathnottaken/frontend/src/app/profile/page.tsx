"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { fetchPublicProfile } from "@/lib/api";

/* ─── Types (matches backend response shape) ─── */
interface RoadmapItem { id: string; careerId: string; title: string; createdAt: string }
interface GamificationData { xp: number; level: number; streakDays: number; tasksCompleted: number; badges: string[] }
interface PublicProfile {
  id: string;
  name: string;
  memberSince: string;
  roadmaps: RoadmapItem[];
  gamification: GamificationData | null;
  skills: string[];
  skillsUpdatedAt: string | null;
}

const BADGE_META: Record<string, { icon: string; title: string; description: string; color: string }> = {
  "first-steps":       { icon: "👣", title: "First Steps",        description: "Completed first task",      color: "from-green-400 to-emerald-500" },
  "week-warrior":      { icon: "🔥", title: "Week Warrior",       description: "7-day streak achieved",     color: "from-orange-400 to-red-500" },
  "month-master":      { icon: "🏆", title: "Month Master",       description: "30-day streak achieved",    color: "from-amber-400 to-yellow-500" },
  "unstoppable":       { icon: "💎", title: "Unstoppable",        description: "90-day streak achieved",    color: "from-cyan-400 to-blue-500" },
  "committed-learner": { icon: "📚", title: "Committed Learner",  description: "50 tasks completed",        color: "from-violet-400 to-purple-500" },
  "master-achiever":   { icon: "🎯", title: "Master Achiever",    description: "200 tasks completed",       color: "from-rose-400 to-pink-500" },
  "polymath":          { icon: "🧠", title: "Polymath",           description: "5 skill categories",        color: "from-teal-400 to-emerald-500" },
  "renaissance":       { icon: "🌟", title: "Renaissance Person", description: "10 skill categories",       color: "from-yellow-400 to-orange-500" },
  "explorer":          { icon: "🗺️", title: "Career Explorer",    description: "10 careers explored",       color: "from-blue-400 to-indigo-500" },
  "pathfinder":        { icon: "🚀", title: "Pathfinder",         description: "Completed a roadmap",       color: "from-emerald-400 to-teal-500" },
  "ai-pioneer":        { icon: "🤖", title: "AI Pioneer",         description: "3 AI/ML skills",            color: "from-gray-400 to-slate-500" },
  "data-wizard":       { icon: "📊", title: "Data Wizard",        description: "5 data skills",             color: "from-indigo-400 to-blue-500" },
};

function ProfileContent() {
  const params = useSearchParams();
  const userId = params.get("user");
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!userId) { setLoading(false); setError(true); return; }
    fetchPublicProfile(userId)
      .then((p: PublicProfile | null) => { if (p) setProfile(p); else setError(true); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-gray-600 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Profile not found</h2>
          <p className="text-sm text-gray-400 mb-6">This profile link may be invalid or the user may not exist.</p>
          <Link href="/" className="inline-flex px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium rounded-xl transition-colors">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  const g = profile.gamification || { xp: 0, level: 1, streakDays: 0, tasksCompleted: 0, badges: [] };
  const roadmaps = profile.roadmaps || [];
  const skills = profile.skills || [];
  const memberDate = new Date(profile.memberSince);
  const daysSinceJoin = Math.max(1, Math.floor((Date.now() - memberDate.getTime()) / (1000 * 60 * 60 * 24)));
  const xpToNext = g.level * 500;
  const xpProgress = Math.min(100, Math.round((g.xp % xpToNext) / xpToNext * 100));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* ── Hero header ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 via-teal-600/10 to-cyan-600/20" />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-16">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-5">
              <div className="w-28 h-28 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/20 ring-4 ring-emerald-500/20">
                <span className="text-white font-bold text-5xl">{profile.name[0].toUpperCase()}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-gray-900">
                Lv.{g.level}
              </div>
            </div>

            {/* Name & member since */}
            <h1 className="text-3xl font-bold text-white mb-1">{profile.name}</h1>
            <p className="text-sm text-gray-400 mb-1">
              Member since {memberDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
            <p className="text-xs text-gray-500">{daysSinceJoin} days on the platform</p>

            {/* XP bar */}
            <div className="w-full max-w-xs mt-5">
              <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                <span>Level {g.level}</span>
                <span>{g.xp % xpToNext} / {xpToNext} XP</span>
                <span>Level {g.level + 1}</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                <div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-700" style={{ width: `${xpProgress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="max-w-4xl mx-auto px-4 -mt-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total XP", value: g.xp.toLocaleString(), icon: "⭐", gradient: "from-amber-500/20 to-orange-500/20", border: "border-amber-500/30" },
            { label: "Day Streak", value: g.streakDays.toString(), icon: "🔥", gradient: "from-red-500/20 to-pink-500/20", border: "border-red-500/30" },
            { label: "Tasks Done", value: g.tasksCompleted.toString(), icon: "✅", gradient: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/30" },
            { label: "Roadmaps", value: roadmaps.length.toString(), icon: "🗺️", gradient: "from-blue-500/20 to-indigo-500/20", border: "border-blue-500/30" },
          ].map(stat => (
            <div key={stat.label} className={`bg-gradient-to-br ${stat.gradient} backdrop-blur border ${stat.border} rounded-xl p-4 text-center`}>
              <div className="text-xl mb-1">{stat.icon}</div>
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-[10px] text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Content sections ── */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Badges / Achievements */}
        {g.badges.length > 0 && (
          <div className="bg-gray-800/40 backdrop-blur border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-lg">🏅</span> Achievements
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">{g.badges.length} earned</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {g.badges.map(badgeId => {
                const meta = BADGE_META[badgeId] || { icon: '🏅', title: badgeId, description: '', color: 'from-gray-400 to-gray-500' };
                return (
                  <div key={badgeId} className="group relative bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 text-center hover:border-gray-600 transition-all">
                    <div className={`w-12 h-12 mx-auto mb-2 bg-gradient-to-br ${meta.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <span className="text-2xl">{meta.icon}</span>
                    </div>
                    <p className="text-xs font-bold text-white">{meta.title}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{meta.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="bg-gray-800/40 backdrop-blur border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="text-lg">🧠</span> Skills
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">{skills.length} skills</span>
              </h3>
              {profile.skillsUpdatedAt && (
                <span className="text-[10px] text-gray-500">
                  Updated {new Date(profile.skillsUpdatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span
                  key={s}
                  className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3 py-1.5 rounded-full font-medium hover:bg-emerald-500/20 transition-colors"
                >
                  {s.replace(/-/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Roadmaps */}
        {roadmaps.length > 0 && (
          <div className="bg-gray-800/40 backdrop-blur border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-lg">📋</span> Career Roadmaps
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">{roadmaps.length} roadmaps</span>
            </h3>
            <div className="space-y-2">
              {roadmaps.map((rm, i) => (
                <div
                  key={rm.id}
                  className="flex items-center gap-3 p-3 bg-gray-900/40 border border-gray-700/30 rounded-xl hover:border-gray-600/50 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-300">#{i + 1}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{rm.title || 'Untitled Roadmap'}</p>
                    <p className="text-[10px] text-gray-500">
                      Created {new Date(rm.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA — Join banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-cyan-600/20 border border-emerald-500/20 rounded-2xl p-8 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5" />
          <div className="relative">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="text-lg font-bold text-white mb-2">Discover Your Own Career Path</h3>
            <p className="text-sm text-gray-400 mb-5 max-w-md mx-auto">
              Join Path Not Taken and explore career paths tailored to your unique skills and interests.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/explore" className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-500/20">
                Explore Careers
              </Link>
              <Link href="/signup" className="px-6 py-2.5 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 text-gray-200 text-sm font-medium rounded-xl transition-colors">
                Create Account
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 pt-4">Powered by Path Not Taken</p>
      </div>
    </div>
  );
}

export default function PublicProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-gray-600 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
