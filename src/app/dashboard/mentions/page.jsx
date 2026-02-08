"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Link2,
} from "lucide-react";
import { useDashboardData } from "@/lib/dashboard-context";

const sentimentConfig = {
  positive: { icon: ThumbsUp, color: "#4ade80", label: "Positiv" },
  neutral: { icon: Minus, color: "#fbbf24", label: "Nøytral" },
  negative: { icon: ThumbsDown, color: "#f87171", label: "Negativ" },
  mixed: { icon: MessageSquare, color: "#38bdf8", label: "Blandet" },
};

export default function MentionsPage() {
  const { loading, recentMentions, brands } = useDashboardData();
  const [platformFilter, setPlatformFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  if (loading) {
    return <div style={{ padding: "32px 40px", color: "rgba(255,255,255,0.5)" }}>Laster data...</div>;
  }

  const filtered = recentMentions.filter((m) => {
    if (platformFilter !== "all" && m.platform !== platformFilter) return false;
    if (brandFilter !== "all" && m.brandId !== brandFilter) return false;
    if (searchQuery && !m.query.toLowerCase().includes(searchQuery.toLowerCase()) && !m.response.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1400 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: "#fff", margin: 0, marginBottom: 6 }}>
          Omtaler
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", margin: 0 }}>
          Alle merkevareomtaler oppdaget på tvers av AI-plattformer
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center" style={{ gap: 12, marginBottom: 24 }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
          <Search
            size={16}
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }}
          />
          <input
            type="text"
            placeholder="Søk i omtaler..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 40px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.1)",
              backgroundColor: "rgba(255,255,255,0.04)",
              color: "#fff",
              fontSize: 14,
              outline: "none",
            }}
          />
        </div>
        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.1)",
            backgroundColor: "rgba(255,255,255,0.04)",
            color: "#fff",
            fontSize: 14,
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="all">Alle plattformer</option>
          <option value="ChatGPT">ChatGPT</option>
          <option value="Perplexity">Perplexity</option>
        </select>
        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.1)",
            backgroundColor: "rgba(255,255,255,0.04)",
            color: "#fff",
            fontSize: 14,
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="all">Alle merkevarer</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>
        Viser {filtered.length} av {recentMentions.length} omtaler
      </p>

      {/* Mentions List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((mention) => {
          const sentiment = sentimentConfig[mention.sentiment] || sentimentConfig.neutral;
          const SentimentIcon = sentiment.icon;
          const brand = brands.find((b) => b.id === mention.brandId);
          const time = new Date(mention.timestamp);
          const timeStr = time.toLocaleDateString("nb-NO", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={mention.id}
              style={{
                padding: "20px 24px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.08)",
                backgroundColor: "rgba(255,255,255,0.03)",
              }}
            >
              {/* Top bar */}
              <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                <div className="flex items-center" style={{ gap: 10 }}>
                  {brand && (
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        backgroundColor: brand.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#fff",
                      }}
                    >
                      {brand.logo}
                    </div>
                  )}
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
                    {mention.brandName}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      padding: "3px 8px",
                      borderRadius: 6,
                      backgroundColor: mention.platform === "ChatGPT" ? "rgba(16,163,127,0.15)" : "rgba(56,189,248,0.15)",
                      color: mention.platform === "ChatGPT" ? "#10a37f" : "#38bdf8",
                      fontWeight: 500,
                    }}
                  >
                    {mention.platform}
                  </span>
                  <span
                    className="flex items-center"
                    style={{
                      fontSize: 12,
                      padding: "3px 8px",
                      borderRadius: 6,
                      backgroundColor: `${sentiment.color}15`,
                      color: sentiment.color,
                      gap: 4,
                      fontWeight: 500,
                    }}
                  >
                    <SentimentIcon size={12} />
                    {sentiment.label}
                  </span>
                </div>
                <div className="flex items-center" style={{ gap: 10 }}>
                  {mention.hasCitation && (
                    <span
                      className="flex items-center"
                      style={{
                        fontSize: 12,
                        color: "#a78bfa",
                        gap: 4,
                      }}
                    >
                      <Link2 size={12} />
                      Sitering
                    </span>
                  )}
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                    {timeStr}
                  </span>
                </div>
              </div>

              {/* Query */}
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", margin: 0, marginBottom: 10, fontWeight: 500 }}>
                &ldquo;{mention.query}&rdquo;
              </p>

              {/* Response */}
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.65 }}>
                {mention.response}
              </p>

              {/* Citation URL */}
              {mention.citationUrl && (
                <a
                  href={mention.citationUrl}
                  className="flex items-center no-underline"
                  style={{
                    marginTop: 12,
                    fontSize: 12,
                    color: "rgba(255,255,255,0.35)",
                    gap: 4,
                  }}
                >
                  <ExternalLink size={12} />
                  {mention.citationUrl}
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
