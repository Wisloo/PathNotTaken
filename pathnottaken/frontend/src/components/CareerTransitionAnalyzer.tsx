"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface TransitionAnalysis {
  difficulty: string;
  avgMonths: number;
  successRate: number;
  topSkillsNeeded: string[];
  isCommon: boolean;
  estimatedCost: {
    education: number;
    opportunityCost: number;
    total: number;
  };
  timeline: Array<{
    phase: string;
    duration: number;
    focus: string;
    milestones: string[];
  }>;
}

interface Props {
  fromCareer: string;
  toCareer: string;
  fromCareerTitle?: string;
  toCareerTitle?: string;
}

export default function CareerTransitionAnalyzer({
  fromCareer,
  toCareer,
  fromCareerTitle,
  toCareerTitle,
}: Props) {
  const [analysis, setAnalysis] = useState<TransitionAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTimeline, setShowTimeline] = useState(false);

  useEffect(() => {
    if (fromCareer && toCareer) {
      fetchTransitionAnalysis();
    }
  }, [fromCareer, toCareer]);

  async function fetchTransitionAnalysis() {
    try {
      const { API_ORIGIN } = await import("@/lib/api");
      const res = await fetch(
        `${API_ORIGIN}/api/market/transition/${fromCareer}/${toCareer}`
      );

      if (res.ok) {
        const json = await res.json();
        setAnalysis(json.analysis);
      }
    } catch (err) {
      console.error("Failed to fetch transition analysis:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="animate-pulse bg-gray-100 rounded-lg p-6 h-64" />;
  }

  if (!analysis) return null;

  const difficultyConfig = {
    easy: { color: "green", icon: "✅", text: "Easy" },
    moderate: { color: "yellow", icon: "⚡", text: "Moderate" },
    hard: { color: "orange", icon: "⚠️", text: "Challenging" },
    unknown: { color: "gray", icon: "❓", text: "Unknown" },
  };

  const difficulty =
    difficultyConfig[analysis.difficulty as keyof typeof difficultyConfig] ||
    difficultyConfig.unknown;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          🔄 Career Transition Path
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">{fromCareerTitle || fromCareer}</span>
          <span>→</span>
          <span className="font-medium">{toCareerTitle || toCareer}</span>
        </div>
      </div>

      {/* Difficulty Badge */}
      <div
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 bg-${difficulty.color}-100 text-${difficulty.color}-800 border border-${difficulty.color}-300`}
      >
        <span className="text-xl">{difficulty.icon}</span>
        <span className="font-semibold">{difficulty.text} Transition</span>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <div className="text-3xl font-bold text-indigo-600">
            {analysis.avgMonths}
          </div>
          <div className="text-xs text-gray-600 mt-1">Months Average</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <div className="text-3xl font-bold text-green-600">
            {analysis.successRate}%
          </div>
          <div className="text-xs text-gray-600 mt-1">Success Rate</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-purple-600">
            ${(analysis.estimatedCost.total / 1000).toFixed(0)}k
          </div>
          <div className="text-xs text-gray-600 mt-1">Est. Investment</div>
        </div>
      </div>

      {/* Top Skills Needed */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          🎯 Priority Skills to Learn
        </h4>
        <div className="flex flex-wrap gap-2">
          {analysis.topSkillsNeeded.map((skill) => (
            <span
              key={skill}
              className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1.5 rounded-lg border border-indigo-300"
            >
              {skill.replace(/-/g, " ")}
            </span>
          ))}
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          💰 Cost Breakdown
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Education & Courses:</span>
            <span className="font-semibold">
              ${analysis.estimatedCost.education.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Opportunity Cost:</span>
            <span className="font-semibold">
              ${analysis.estimatedCost.opportunityCost.toLocaleString()}
            </span>
          </div>
          <div className="border-t pt-2 flex justify-between">
            <span className="font-semibold text-gray-800">Total Investment:</span>
            <span className="font-bold text-indigo-600">
              ${analysis.estimatedCost.total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline Toggle */}
      {analysis.timeline && analysis.timeline.length > 0 && (
        <div>
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-between"
          >
            <span>View Detailed Timeline</span>
            <span className="text-xl">{showTimeline ? "▼" : "▶"}</span>
          </button>

          {showTimeline && (
            <div className="mt-4 space-y-4">
              {analysis.timeline.map((phase, index) => (
                <div
                  key={phase.phase}
                  className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-indigo-500"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-100 text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-gray-900 mb-1">
                        {phase.phase}{" "}
                        <span className="text-sm text-gray-500 font-normal">
                          ({phase.duration} {phase.duration === 1 ? "month" : "months"})
                        </span>
                      </h5>
                      <p className="text-sm text-gray-600 mb-2">{phase.focus}</p>
                      <ul className="space-y-1">
                        {phase.milestones.map((milestone, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-gray-500 flex items-start gap-2"
                          >
                            <span className="text-green-500 flex-shrink-0">✓</span>
                            <span>{milestone}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      {analysis.isCommon && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✨ <strong>Good news!</strong> This is a well-traveled path with proven
            success. Many professionals have made this transition successfully.
          </p>
        </div>
      )}

      <Link
        href={`/roadmap?career=${toCareer}`}
        className="mt-4 block text-center bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition-colors"
      >
        Start My Transition Roadmap →
      </Link>
    </div>
  );
}
