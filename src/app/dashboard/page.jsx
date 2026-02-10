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
        padding: "28px",
        borderRadius: 14,
        border: "1px solid var(--border-secondary)",
        backgroundColor: "var(--bg-card)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <span style={{
          fontSize: 12,
          color: "var(--text-secondary)",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.03em",
        }}>{title}</span>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: "var(--accent-bg)",
            border: "1px solid var(--accent-bg-hover)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={18} color="var(--accent)" />
        </div>
      </div>
      <div className="flex items-end" style={{ gap: 12 }}>
        <span style={{ fontSize: 32, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1, letterSpacing: "-0.02em" }}>
          {value}{suffix}
        </span>
        <span
          className="flex items-center"
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: isPositive ? "var(--success)" : "var(--error)",
            gap: 4,
            paddingBottom: 4,
            padding: "3px 8px",
            borderRadius: 9999,
            backgroundColor: isPositive ? "var(--success-bg)" : "var(--error-bg)",
          }}
        >
          {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
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
        background: "var(--tooltip-bg)",
        border: "1px solid var(--border-primary)",
        borderRadius: 10,
        padding: "10px 14px",
        fontSize: 13,
        backdropFilter: "blur(12px)",
        boxShadow: "var(--tooltip-shadow)",
      }}
    >
      <p style={{
        color: "var(--text-secondary)",
        margin: 0,
        marginBottom: 6,
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, margin: 0, marginBottom: 2, fontSize: 13 }}>
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
      <div style={{ padding: "40px 48px", color: "var(--text-secondary)" }}>Laster data...</div>
    );
  }

  return (
    <div style={{ padding: "40px 48px", maxWidth: 1400 }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{
          fontSize: 30,
          fontWeight: 400,
          color: "var(--text-primary)",
          margin: 0,
          marginBottom: 8,
          fontFamily: "'Instrument Serif', serif",
        }}>
          Oversikt
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0 }}>
          AI-synlighetsovervåking for norske merkevarer
        </p>
      </div>

      {/* KPI Cards */}
      <div className="flex" style={{ gap: 20, marginBottom: 32 }}>
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
      <div className="flex" style={{ gap: 20, marginBottom: 32 }}>
        {/* Visibility Trends */}
        <div
          style={{
            flex: 2,
            padding: "28px",
            borderRadius: 14,
            border: "1px solid var(--border-secondary)",
            backgroundColor: "var(--bg-card)",
            backdropFilter: "blur(12px)",
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: 0, marginBottom: 24 }}>
            Synlighetstrender
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={visibilityTrends}>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--chart-tick)", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--chart-tick)", fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              {brands.map((b, i) => (
                <Line key={b.id} type="monotone" dataKey={b.name} stroke={b.color} strokeWidth={1.5} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center" style={{ gap: 24, marginTop: 12 }}>
            {brands.map((b) => (
              <div key={b.id} className="flex items-center" style={{ gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 9999, backgroundColor: b.color }} />
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{b.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Breakdown */}
        <div
          style={{
            flex: 1,
            padding: "28px",
            borderRadius: 14,
            border: "1px solid var(--border-secondary)",
            backgroundColor: "var(--bg-card)",
            backdropFilter: "blur(12px)",
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: 0, marginBottom: 24 }}>
            Plattformoversikt
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={platformBreakdown} barGap={8}>
              <XAxis
                dataKey="platform"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--chart-tick)", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--chart-tick)", fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="mentions" fill="var(--accent)" radius={[6, 6, 0, 0]} name="Omtaler" />
              <Bar dataKey="citations" fill="var(--accent-deep)" radius={[6, 6, 0, 0]} name="Siteringer" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex" style={{ gap: 20 }}>
        {/* Brand Scores */}
        <div
          style={{
            flex: 1,
            padding: "28px",
            borderRadius: 14,
            border: "1px solid var(--border-secondary)",
            backgroundColor: "var(--bg-card)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
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
                    backgroundColor: "var(--bg-card-inner)",
                    border: "1px solid var(--border-faint)",
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
                      <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{brand.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {brand.mentionsThisWeek} omtaler denne uken
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center" style={{ gap: 8 }}>
                    <span style={{ fontSize: 22, fontWeight: 500, color: "var(--text-primary)" }}>
                      {brand.visibilityScore}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: isPositive ? "var(--success)" : "var(--error)",
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
            padding: "28px",
            borderRadius: 14,
            border: "1px solid var(--border-secondary)",
            backgroundColor: "var(--bg-card)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
              Siste omtaler
            </h3>
            <a
              href="/dashboard/mentions"
              className="flex items-center no-underline"
              style={{ fontSize: 13, color: "var(--accent)", gap: 4 }}
            >
              Se alle <ArrowUpRight size={14} />
            </a>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recentMentions.slice(0, 5).map((mention) => (
              <div
                key={mention.id}
                style={{
                  padding: "16px",
                  borderRadius: 10,
                  backgroundColor: "var(--bg-card-inner)",
                  border: "1px solid var(--border-faint)",
                }}
              >
                <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                  <div className="flex items-center" style={{ gap: 8 }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--accent)",
                        padding: "2px 8px",
                        borderRadius: 6,
                        backgroundColor: "var(--accent-bg-hover)",
                      }}
                    >
                      {mention.brandName}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        padding: "2px 6px",
                        borderRadius: 6,
                        backgroundColor: "var(--bg-input)",
                      }}
                    >
                      {mention.platform}
                    </span>
                  </div>
                  {mention.hasCitation && (
                    <ExternalLink size={13} color="var(--text-faint)" />
                  )}
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, marginBottom: 6, fontStyle: "italic" }}>
                  &ldquo;{mention.query}&rdquo;
                </p>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
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
