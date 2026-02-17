"use client";

import { useEffect, useState } from "react";

interface SkillGapAnalysis {
  totalRequired: number;
  hasSkills: string[];
  missingSkills: Array<{
    id: string;
    name: string;
    estimatedHours: number;
    importance: string;
    priority: number;
    reason: string;
  }>;
  readinessScore: number;
  estimatedLearningTime: number;
  priority: Array<{
    id: string;
    name: string;
    estimatedHours: number;
    priority: number;
    reason: string;
  }>;
}

interface Props {
  userSkills: string[];
  targetCareer: string;
}

export default function SkillGapVisualizer({ userSkills, targetCareer }: Props) {
  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userSkills && targetCareer) {
      fetchAnalysis();
    }
  }, [userSkills, targetCareer]);

  async function fetchAnalysis() {
    try {
      const { API_ORIGIN } = await import("@/lib/api");
      const res = await fetch(`${API_ORIGIN}/api/skills/gap-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userSkills, targetCareer }),
      });

      if (res.ok) {
        const json = await res.json();
        setAnalysis(json.analysis);
      }
    } catch (err) {
      console.error("Failed to fetch skill gap analysis:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="animate-pulse bg-gray-100 rounded-lg p-6 h-64" />;
  }

  if (!analysis) return null;

  const readinessColor =
    analysis.readinessScore >= 75
      ? "text-green-600"
      : analysis.readinessScore >= 50
      ? "text-blue-600"
      : analysis.readinessScore >= 25
      ? "text-yellow-600"
      : "text-red-600";

  const readinessBg =
    analysis.readinessScore >= 75
      ? "bg-green-100"
      : analysis.readinessScore >= 50
      ? "bg-blue-100"
      : analysis.readinessScore >= 25
      ? "bg-yellow-100"
      : "bg-red-100";

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          📊 Skill Gap Analysis
        </h3>
        <p className="text-sm text-gray-600">
          Your path to becoming job-ready
        </p>
      </div>

      {/* Readiness Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">
            Career Readiness
          </span>
          <span className={`text-2xl font-bold ${readinessColor}`}>
            {analysis.readinessScore}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-full ${readinessBg} transition-all duration-500`}
            style={{ width: `${analysis.readinessScore}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {analysis.hasSkills.length} of {analysis.totalRequired} skills acquired •{" "}
          ~{Math.round(analysis.estimatedLearningTime / 40)} weeks of learning remaining
        </div>
      </div>

      {/* Skills You Have */}
      {analysis.hasSkills.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Skills You Already Have
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.hasSkills.map((skill) => (
              <span
                key={skill}
                className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1.5 rounded-full border border-green-300"
              >
                {skill.replace(/-/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Priority Learning Path */}
      {analysis.priority.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            🎯 Recommended Learning Order
          </h4>
          <div className="space-y-3">
            {analysis.priority.slice(0, 5).map((skill, index) => (
              <div
                key={skill.id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-indigo-100 text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-semibold text-gray-900">
                        {skill.name}
                      </h5>
                      <span className="text-xs text-gray-500">
                        ~{skill.estimatedHours}h
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 italic">{skill.reason}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-indigo-500 h-full rounded-full w-0" />
                      </div>
                      <span className="text-xs text-gray-500">Not started</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time Investment Summary */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">
            Total Time Investment
          </span>
          <span className="text-2xl font-bold text-indigo-600">
            {analysis.estimatedLearningTime}h
          </span>
        </div>
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>• At 10 hours/week:</span>
            <span className="font-medium">
              {Math.ceil(analysis.estimatedLearningTime / 10)} weeks
            </span>
          </div>
          <div className="flex justify-between">
            <span>• At 20 hours/week:</span>
            <span className="font-medium">
              {Math.ceil(analysis.estimatedLearningTime / 20)} weeks
            </span>
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-600 italic">
          {analysis.readinessScore >= 75
            ? "You're almost there! 🎉 Start applying while you polish the remaining skills."
            : analysis.readinessScore >= 50
            ? "Great progress! 💪 Focus on the priority skills to accelerate your journey."
            : "Every expert was once a beginner. 🚀 Start with the foundational skills."}
        </p>
      </div>
    </div>
  );
}
