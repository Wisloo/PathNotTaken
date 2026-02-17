"use client";

import { useEffect, useState } from "react";

interface GamificationData {
  xp: number;
  level: number;
  streakDays: number;
  tasksCompleted: number;
  levelProgress: number;
  nextLevelXP: number | null;
  earnedAchievements: Achievement[];
  percentile: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp: number;
}

export default function GamificationWidget() {
  const [data, setData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAchievements, setShowAchievements] = useState(false);

  useEffect(() => {
    fetchGamificationData();
  }, []);

  async function fetchGamificationData() {
    try {
      const { API_ORIGIN } = await import("@/lib/api");
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_ORIGIN}/api/gamification/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch gamification data:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !data) return null;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            Level {data.level}
          </h3>
          <p className="text-sm text-gray-600">
            Top {data.percentile}% of learners
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-purple-600">
            {data.xp.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">XP</div>
        </div>
      </div>

      {/* Level Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Progress to Level {data.level + 1}</span>
          {data.nextLevelXP && (
            <span className="text-gray-500">
              {data.nextLevelXP.toLocaleString()} XP needed
            </span>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, data.levelProgress)}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center bg-white rounded-lg p-3 shadow-sm">
          <div className="text-2xl font-bold text-orange-500">
            {data.streakDays}
          </div>
          <div className="text-xs text-gray-600">Day Streak 🔥</div>
        </div>
        <div className="text-center bg-white rounded-lg p-3 shadow-sm">
          <div className="text-2xl font-bold text-green-500">
            {data.tasksCompleted}
          </div>
          <div className="text-xs text-gray-600">Tasks Done ✅</div>
        </div>
        <div className="text-center bg-white rounded-lg p-3 shadow-sm">
          <div className="text-2xl font-bold text-purple-500">
            {data.earnedAchievements.length}
          </div>
          <div className="text-xs text-gray-600">Badges 🏆</div>
        </div>
      </div>

      {/* Recent Achievements */}
      {data.earnedAchievements.length > 0 && (
        <div className="border-t border-purple-200 pt-4">
          <button
            onClick={() => setShowAchievements(!showAchievements)}
            className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 hover:text-purple-600 transition-colors"
          >
            <span>Recent Achievements</span>
            <span className="text-xl">{showAchievements ? "▼" : "▶"}</span>
          </button>

          {showAchievements && (
            <div className="mt-3 space-y-2">
              {data.earnedAchievements.slice(0, 5).map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-white rounded-lg p-3 flex items-center gap-3 shadow-sm"
                >
                  <span className="text-3xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-800">
                      {achievement.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {achievement.description}
                    </div>
                  </div>
                  <div className="text-xs font-bold text-purple-600">
                    +{achievement.xp} XP
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Motivational Message */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-600 italic">
          {data.streakDays === 0
            ? "Start your learning streak today! 🚀"
            : data.streakDays < 7
            ? "Keep it up! You're building momentum 💪"
            : data.streakDays < 30
            ? "You're on fire! Keep that streak alive 🔥"
            : "Incredible dedication! You're unstoppable 💎"}
        </p>
      </div>
    </div>
  );
}
