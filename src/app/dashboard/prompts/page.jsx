"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Play,
  Pause,
  Clock,
  Zap,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import { useDashboardData } from "@/lib/dashboard-context";

export default function PromptsPage() {
  const { loading, prompts } = useDashboardData();
  const [filter, setFilter] = useState("all");

  if (loading) {
    return <div style={{ padding: "32px 40px", color: "rgba(255,255,255,0.5)" }}>Laster data...</div>;
  }

  const filtered = filter === "all" ? prompts : filter === "active" ? prompts.filter((p) => p.isActive) : prompts.filter((p) => !p.isActive);

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1400 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: "#fff", margin: 0, marginBottom: 6 }}>
            Søk & Prompts
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", margin: 0 }}>
            Administrer AI-spørringene som brukes til å overvåke merkevarer
          </p>
        </div>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          <Plus size={16} />
          Ny prompt
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center" style={{ gap: 8, marginBottom: 24 }}>
        {[
          { key: "all", label: `Alle (${prompts.length})` },
          { key: "active", label: `Aktive (${prompts.filter((p) => p.isActive).length})` },
          { key: "paused", label: `Pauset (${prompts.filter((p) => !p.isActive).length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid",
              borderColor: filter === tab.key ? "rgba(167,139,250,0.4)" : "rgba(255,255,255,0.1)",
              backgroundColor: filter === tab.key ? "rgba(167,139,250,0.12)" : "transparent",
              color: filter === tab.key ? "#a78bfa" : "rgba(255,255,255,0.5)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Prompt List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((prompt) => {
          const lastRunDate = new Date(prompt.lastRun);
          const lastRunStr = lastRunDate.toLocaleDateString("nb-NO", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={prompt.id}
              style={{
                padding: "20px 24px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.08)",
                backgroundColor: "rgba(255,255,255,0.03)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ flex: 1 }}>
                <div className="flex items-center" style={{ gap: 10, marginBottom: 8 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: prompt.isActive ? "#4ade80" : "rgba(255,255,255,0.2)",
                    }}
                  />
                  <span style={{ fontSize: 15, fontWeight: 500, color: "#fff" }}>
                    {prompt.query}
                  </span>
                </div>
                <div className="flex items-center" style={{ gap: 12, marginLeft: 18 }}>
                  <span
                    style={{
                      fontSize: 12,
                      padding: "2px 8px",
                      borderRadius: 4,
                      backgroundColor: "rgba(167,139,250,0.12)",
                      color: "#a78bfa",
                    }}
                  >
                    {prompt.category}
                  </span>
                  {prompt.platforms.map((p) => (
                    <span
                      key={p}
                      style={{
                        fontSize: 12,
                        padding: "2px 8px",
                        borderRadius: 4,
                        backgroundColor: "rgba(255,255,255,0.06)",
                        color: "rgba(255,255,255,0.45)",
                      }}
                    >
                      {p === "chatgpt" ? "ChatGPT" : "Perplexity"}
                    </span>
                  ))}
                  <span className="flex items-center" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", gap: 4 }}>
                    <Clock size={12} />
                    {prompt.frequency === "daily" ? "Daglig" : "Ukentlig"}
                  </span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
                    Sist kjørt: {lastRunStr}
                  </span>
                </div>
              </div>

              <div className="flex items-center" style={{ gap: 8 }}>
                <button
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "transparent",
                    color: "rgba(255,255,255,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  title={prompt.isActive ? "Pause" : "Aktiver"}
                >
                  {prompt.isActive ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "transparent",
                    color: "rgba(255,255,255,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <MoreHorizontal size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
