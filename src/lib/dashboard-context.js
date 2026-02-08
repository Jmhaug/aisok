"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { transformAnalysis } from "./transform-analysis";
import * as mock from "./mock-data";

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("lgpsm_analysis_result");
      if (raw) {
        const result = JSON.parse(raw);
        const transformed = transformAnalysis(result);
        if (transformed) {
          setData(transformed);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Fall through to mock data
    }

    // Fallback to mock data
    setData({
      brands: mock.brands,
      recentMentions: mock.recentMentions,
      platformBreakdown: mock.platformBreakdown,
      kpiSummary: mock.kpiSummary,
      visibilityTrends: mock.visibilityTrends,
      prompts: mock.prompts,
      dailyAggregations: mock.dailyAggregations,
      weeklyAggregations: mock.weeklyAggregations,
      competitors: mock.competitors,
    });
    setLoading(false);
  }, []);

  return (
    <DashboardContext.Provider value={{ ...data, loading }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardData() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboardData must be used within a DashboardProvider");
  }
  return ctx;
}
