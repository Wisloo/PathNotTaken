"use client";

import { useState, useEffect } from "react";
import { API_ORIGIN } from "@/lib/api";

interface ProgressData {
  totalXP: number;
  level: number;
  tasksCompleted: number;
  streak: number;
  roadmapCount: number;
  skillBreakdown: { skill: string; count: number }[];
  weeklyActivity: number[];
}

export default function ProgressDashboard() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProgress() {
      try {
        const token = localStorage.getItem("pn_token");
        if (!token) { setLoading(false); return; }

        const res = await fetch(`${API_ORIGIN}/api/gamification/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) { setLoading(false); return; }
        const json = await res.json();

        // Build progress data from gamification profile
        setData({
          totalXP: json.xp || 0,
          level: json.level || 1,
          tasksCompleted: json.tasksCompleted || 0,
          streak: json.streak?.streakDays || 0,
          roadmapCount: json.roadmaps || 0,
          skillBreakdown: json.skillBreakdown || [],
          weeklyActivity: json.weeklyActivity || [0, 0, 0, 0, 0, 0, 0],
        });
      } catch {
        // Silently fail - profile endpoint may not exist yet
      }
      setLoading(false);
    }
    loadProgress();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-50 rounded-2xl h-48" />
    );
  }

  // Show a starter dashboard even without data
  const xp = data?.totalXP ?? 0;
  const level = data?.level ?? 1;
  const tasks = data?.tasksCompleted ?? 0;
  const streak = data?.streak ?? 0;
  const xpToNext = level * 500;
  const xpProgress = Math.min(100, Math.round((xp % xpToNext) / xpToNext * 100));

  // Mini bar chart data (7 days)
  const activity = data?.weeklyActivity ?? [0, 0, 0, 0, 0, 0, 0];
  const maxActivity = Math.max(...activity, 1);
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-5">
      <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4">
        📊 Your Progress
      </h3>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard icon="⭐" value={xp.toLocaleString()} label="Total XP" color="amber" />
        <StatCard icon="🏆" value={`Level ${level}`} label={`${xpProgress}% to next`} color="emerald" />
        <StatCard icon="✅" value={tasks.toString()} label="Tasks Done" color="blue" />
        <StatCard icon="🔥" value={`${streak} days`} label="Current Streak" color="red" />
      </div>

      {/* XP Progress Bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
          <span>Level {level}</span>
          <span>{xp % xpToNext} / {xpToNext} XP</span>
          <span>Level {level + 1}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
      </div>

      {/* Weekly Activity Chart */}
      <div>
        <p className="text-xs font-semibold text-gray-600 mb-3">Weekly Activity</p>
        <div className="flex items-end gap-2 h-20">
          {activity.map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full rounded-t-md transition-all ${val > 0 ? 'bg-emerald-400' : 'bg-gray-100'}`}
                style={{ height: `${Math.max(4, (val / maxActivity) * 64)}px` }}
              />
              <span className="text-[9px] text-gray-400">{dayLabels[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Encouragement */}
      {tasks === 0 && (
        <div className="mt-4 p-3 bg-emerald-50 rounded-xl text-center">
          <p className="text-xs text-emerald-700">
            🌟 Start completing roadmap tasks to see your progress grow!
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  const colorClasses: Record<string, string> = {
    amber: "from-amber-50 to-orange-50 border-amber-200",
    emerald: "from-emerald-50 to-teal-50 border-emerald-200",
    blue: "from-blue-50 to-indigo-50 border-blue-200",
    red: "from-red-50 to-pink-50 border-red-200",
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color] || colorClasses.emerald} rounded-xl p-3 border text-center`}>
      <div className="text-lg mb-0.5">{icon}</div>
      <div className="text-base font-bold text-gray-800">{value}</div>
      <div className="text-[10px] text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}
