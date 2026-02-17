"use client";

import { useEffect, useState } from "react";

interface MarketInsight {
  marketStrength: number;
  avgGrowthRate: number;
  salaryPremium: number;
  highDemandSkills: string[];
  obsoleteSkills: string[];
  recommendation: {
    level: string;
    message: string;
    color: string;
  };
}

interface Props {
  careerId: string;
}

export default function MarketInsights({ careerId }: Props) {
  const [insights, setInsights] = useState<MarketInsight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (careerId) {
      fetchMarketInsights();
    }
  }, [careerId]);

  async function fetchMarketInsights() {
    try {
      const { API_ORIGIN } = await import("@/lib/api");
      const res = await fetch(`${API_ORIGIN}/api/market/career/${careerId}`);

      if (res.ok) {
        const json = await res.json();
        setInsights(json.insights);
      }
    } catch (err) {
      console.error("Failed to fetch market insights:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg p-6 h-40" />
    );
  }

  if (!insights) return null;

  const strengthColor =
    insights.marketStrength >= 80
      ? "text-green-600"
      : insights.marketStrength >= 60
      ? "text-blue-600"
      : "text-yellow-600";

  const strengthBg =
    insights.marketStrength >= 80
      ? "bg-green-100"
      : insights.marketStrength >= 60
      ? "bg-blue-100"
      : "bg-yellow-100";

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          📊 Market Intelligence
        </h3>
        <div
          className={`${strengthBg} ${strengthColor} px-3 py-1 rounded-full text-sm font-bold`}
        >
          {insights.marketStrength}/100
        </div>
      </div>

      {/* Recommendation Banner */}
      <div
        className={`mb-4 p-4 rounded-lg border-l-4 ${
          insights.recommendation.color === "green"
            ? "bg-green-50 border-green-500"
            : insights.recommendation.color === "blue"
            ? "bg-blue-50 border-blue-500"
            : insights.recommendation.color === "orange"
            ? "bg-orange-50 border-orange-500"
            : "bg-yellow-50 border-yellow-500"
        }`}
      >
        <p className="text-sm font-medium text-gray-800">
          {insights.recommendation.message}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Growth Rate</div>
          <div className="text-2xl font-bold text-gray-900">
            {insights.avgGrowthRate > 0 ? "+" : ""}
            {insights.avgGrowthRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">annually</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Salary Premium</div>
          <div className="text-2xl font-bold text-gray-900">
            {insights.salaryPremium >= 0 ? "+" : ""}$
            {(insights.salaryPremium / 1000).toFixed(0)}k
          </div>
          <div className="text-xs text-gray-500">vs baseline</div>
        </div>
      </div>

      {/* High Demand Skills */}
      {insights.highDemandSkills.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-700 mb-2">
            🔥 High-Demand Skills
          </div>
          <div className="flex flex-wrap gap-2">
            {insights.highDemandSkills.map((skill) => (
              <span
                key={skill}
                className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full"
              >
                {skill.replace(/-/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Obsolete Skills Warning */}
      {insights.obsoleteSkills.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-700 mb-2">
            ⚠️ Declining Skills
          </div>
          <div className="flex flex-wrap gap-2">
            {insights.obsoleteSkills.map((skill) => (
              <span
                key={skill}
                className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-1 rounded-full"
              >
                {skill.replace(/-/g, " ")}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2 italic">
            Consider modern alternatives or complementary skills
          </p>
        </div>
      )}

      {/* Updated timestamp */}
      <div className="text-xs text-gray-400 text-center mt-4">
        Market data updated daily
      </div>
    </div>
  );
}
