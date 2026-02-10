"use client";

import { useState } from "react";
import {
  Search,
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
  const [activeRawOutput, setActiveRawOutput] = useState(null);

  if (loading) {
    return <div style={{ padding: "32px 40px", color: "var(--text-secondary)" }}>Laster data...</div>;
  }

  const filtered = recentMentions.filter((m) => {
    if (platformFilter !== "all" && m.platform !== platformFilter) return false;
    if (brandFilter !== "all" && m.brandId !== brandFilter) return false;
    if (searchQuery) {
      const needle = searchQuery.toLowerCase();
      const queryText = (m.query || "").toLowerCase();
      const responseText = (m.response || "").toLowerCase();
      const rawText = (m.rawOutput || "").toLowerCase();
      if (!queryText.includes(needle) && !responseText.includes(needle) && !rawText.includes(needle)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1400 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: "var(--text-primary)", margin: 0, marginBottom: 6 }}>
          Omtaler
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-tertiary)", margin: 0 }}>
          Alle merkevareomtaler oppdaget på tvers av AI-plattformer
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center" style={{ gap: 12, marginBottom: 24 }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
          <Search
            size={16}
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)" }}
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
              border: "1px solid var(--border-primary)",
              backgroundColor: "var(--bg-input)",
              color: "var(--text-primary)",
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
            border: "1px solid var(--border-primary)",
            backgroundColor: "var(--bg-input)",
            color: "var(--text-primary)",
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
            border: "1px solid var(--border-primary)",
            backgroundColor: "var(--bg-input)",
            color: "var(--text-primary)",
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
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
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
                border: "1px solid var(--border-primary)",
                backgroundColor: "var(--bg-card)",
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
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
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
                  {mention.position && (
                    <span
                      style={{
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 6,
                        backgroundColor: "rgba(34,211,238,0.16)",
                        color: "#67e8f9",
                        fontWeight: 700,
                      }}
                    >
                      #{mention.position}
                    </span>
                  )}
                </div>
                <div className="flex items-center" style={{ gap: 10 }}>
                  {mention.hasCitation && (
                    <span
                      className="flex items-center"
                      style={{
                        fontSize: 12,
                        color: "var(--accent)",
                        gap: 4,
                      }}
                    >
                      <Link2 size={12} />
                      Sitering
                    </span>
                  )}
                  <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
                    {timeStr}
                  </span>
                </div>
              </div>

              {/* Query */}
              <p style={{ fontSize: 14, color: "var(--text-primary)", margin: 0, marginBottom: 10, fontWeight: 500 }}>
                &ldquo;{mention.query}&rdquo;
              </p>

              {/* Response */}
              <p style={{ fontSize: 13, color: "var(--text-tertiary)", margin: 0, lineHeight: 1.65 }}>
                {mention.response}
              </p>

              {mention.rawOutput && (
                <button
                  onClick={() => setActiveRawOutput(mention)}
                  style={{
                    marginTop: 12,
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: "1px solid var(--border-primary)",
                    backgroundColor: "var(--bg-input)",
                    color: "var(--text-secondary)",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Vis full output
                </button>
              )}

              {/* Citation URL */}
              {mention.citationUrl && (
                <a
                  href={mention.citationUrl}
                  className="flex items-center no-underline"
                  style={{
                    marginTop: 12,
                    fontSize: 12,
                    color: "var(--text-muted)",
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

      {activeRawOutput && (
        <div
          onClick={() => setActiveRawOutput(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.75)",
            display: "grid",
            placeItems: "center",
            padding: 20,
            zIndex: 30,
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(860px, 95vw)",
              maxHeight: "84vh",
              overflow: "auto",
              borderRadius: 14,
              border: "1px solid var(--border-primary)",
              backgroundColor: "var(--bg-sidebar)",
              padding: 18,
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: 12, gap: 10 }}>
              <div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
                  {activeRawOutput.brandName} • {activeRawOutput.platform}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-secondary)" }}>
                  {activeRawOutput.query}
                </p>
              </div>
              <button onClick={() => setActiveRawOutput(null)} style={{ border: "none", background: "transparent", color: "var(--text-secondary)", cursor: "pointer" }}>
                Lukk
              </button>
            </div>
            <pre
              style={{
                margin: 0,
                whiteSpace: "pre-wrap",
                fontSize: 12,
                lineHeight: 1.6,
                color: "var(--text-primary)",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            >
              {activeRawOutput.rawOutput}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
