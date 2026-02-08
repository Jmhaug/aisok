"use client";

import {
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Link2,
  Eye,
  Zap,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useDashboardData } from "@/lib/dashboard-context";

function KPICard({ title, value, change, icon: Icon, suffix = "" }) {
  const isPositive = change >= 0;
  return (
    <div
      style={{
        flex: 1,
        padding: "24px",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.08)",
        backgroundColor: "rgba(255,255,255,0.03)",
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>{title}</span>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: "rgba(167,139,250,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={18} color="#a78bfa" />
        </div>
      </div>
      <div className="flex items-end" style={{ gap: 12 }}>
        <span style={{ fontSize: 32, fontWeight: 600, color: "#fff", lineHeight: 1 }}>
          {value}{suffix}
        </span>
        <span
          className="flex items-center"
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: isPositive ? "#4ade80" : "#f87171",
            gap: 2,
            paddingBottom: 4,
          }}
        >
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {isPositive ? "+" : ""}{change}%
        </span>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null;
  return (
    <div
      style={{
        background: "#1a1a1a",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 13,
      }}
    >
      <p style={{ color: "rgba(255,255,255,0.5)", margin: 0, marginBottom: 6 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, margin: 0, marginBottom: 2 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { loading, kpiSummary, visibilityTrends, recentMentions, brands, platformBreakdown } = useDashboardData();

  if (loading) {
    return (
      <div style={{ padding: "32px 40px", color: "rgba(255,255,255,0.5)" }}>Laster data...</div>
    );
  }

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1400 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: "#fff", margin: 0, marginBottom: 6 }}>
          Oversikt
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", margin: 0 }}>
          AI-synlighetsovervåking for norske merkevarer
        </p>
      </div>

      {/* KPI Cards */}
      <div className="flex" style={{ gap: 16, marginBottom: 32 }}>
        <KPICard
          title="Omtaler denne uken"
          value={kpiSummary.totalMentionsThisWeek}
          change={kpiSummary.mentionsChange}
          icon={MessageSquare}
        />
        <KPICard
          title="Siteringer denne uken"
          value={kpiSummary.totalCitationsThisWeek}
          change={kpiSummary.citationsChange}
          icon={Link2}
        />
        <KPICard
          title="Gj.snitt synlighetspoeng"
          value={kpiSummary.averageVisibilityScore}
          change={kpiSummary.scoreChange}
          icon={Eye}
        />
        <KPICard
          title="Aktive prompts"
          value={kpiSummary.activePrompts}
          change={0}
          icon={Zap}
        />
      </div>

      {/* Charts Row */}
      <div className="flex" style={{ gap: 16, marginBottom: 32 }}>
        {/* Visibility Trends */}
        <div
          style={{
            flex: 2,
            padding: "24px",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.08)",
            backgroundColor: "rgba(255,255,255,0.03)",
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff", margin: 0, marginBottom: 24 }}>
            Synlighetstrender
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={visibilityTrends}>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              {brands.map((b, i) => (
                <Line key={b.id} type="monotone" dataKey={b.name} stroke={b.color} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center" style={{ gap: 24, marginTop: 12 }}>
            {brands.map((b) => (
              <div key={b.id} className="flex items-center" style={{ gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: b.color }} />
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{b.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Breakdown */}
        <div
          style={{
            flex: 1,
            padding: "24px",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.08)",
            backgroundColor: "rgba(255,255,255,0.03)",
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff", margin: 0, marginBottom: 24 }}>
            Plattformoversikt
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={platformBreakdown} barGap={8}>
              <XAxis
                dataKey="platform"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="mentions" fill="#a78bfa" radius={[6, 6, 0, 0]} name="Omtaler" />
              <Bar dataKey="citations" fill="#7c3aed" radius={[6, 6, 0, 0]} name="Siteringer" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex" style={{ gap: 16 }}>
        {/* Brand Scores */}
        <div
          style={{
            flex: 1,
            padding: "24px",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.08)",
            backgroundColor: "rgba(255,255,255,0.03)",
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff", margin: 0 }}>
              Synlighetspoeng per merkevare
            </h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {brands.slice(0, 6).map((brand) => {
              const change = brand.visibilityScore - brand.previousScore;
              const isPositive = change >= 0;
              return (
                <div
                  key={brand.id}
                  className="flex items-center justify-between"
                  style={{
                    padding: "12px 16px",
                    borderRadius: 10,
                    backgroundColor: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div className="flex items-center" style={{ gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        backgroundColor: brand.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#fff",
                      }}
                    >
                      {brand.logo}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>{brand.name}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                        {brand.mentionsThisWeek} omtaler denne uken
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center" style={{ gap: 8 }}>
                    <span style={{ fontSize: 20, fontWeight: 600, color: "#fff" }}>
                      {brand.visibilityScore}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: isPositive ? "#4ade80" : "#f87171",
                        fontWeight: 500,
                      }}
                    >
                      {isPositive ? "+" : ""}{change}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Mentions Feed */}
        <div
          style={{
            flex: 1,
            padding: "24px",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.08)",
            backgroundColor: "rgba(255,255,255,0.03)",
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff", margin: 0 }}>
              Siste omtaler
            </h3>
            <a
              href="/dashboard/mentions"
              className="flex items-center no-underline"
              style={{ fontSize: 13, color: "#a78bfa", gap: 4 }}
            >
              Se alle <ArrowUpRight size={14} />
            </a>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recentMentions.slice(0, 5).map((mention) => (
              <div
                key={mention.id}
                style={{
                  padding: "14px 16px",
                  borderRadius: 10,
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                  <div className="flex items-center" style={{ gap: 8 }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#a78bfa",
                        padding: "2px 8px",
                        borderRadius: 4,
                        backgroundColor: "rgba(167,139,250,0.12)",
                      }}
                    >
                      {mention.brandName}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.35)",
                        padding: "2px 6px",
                        borderRadius: 4,
                        backgroundColor: "rgba(255,255,255,0.06)",
                      }}
                    >
                      {mention.platform}
                    </span>
                  </div>
                  {mention.hasCitation && (
                    <ExternalLink size={13} color="rgba(255,255,255,0.3)" />
                  )}
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: 0, marginBottom: 6, fontStyle: "italic" }}>
                  &ldquo;{mention.query}&rdquo;
                </p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: 1.5 }}>
                  {mention.response.slice(0, 120)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
