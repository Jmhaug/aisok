"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import { useDashboardData } from "@/lib/dashboard-context";

const COLORS = ["#b4a0fb", "#7dd3e8", "#f9a8a8", "#6ee7a0", "#f5d687", "#eca5d0", "#f4b07a", "#a5b4fc"];

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
        <p key={p.name} style={{ color: p.color || "var(--accent)", margin: 0, marginBottom: 2, fontSize: 13 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { loading, visibilityTrends, brands, platformBreakdown, dailyAggregations, weeklyAggregations } = useDashboardData();

  if (loading) {
    return <div style={{ padding: "40px 48px", color: "var(--text-secondary)" }}>Laster data...</div>;
  }

  const brandMentionShare = brands.map((b, i) => ({
    name: b.name,
    value: b.mentionsThisWeek,
    color: COLORS[i % COLORS.length],
  }));

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
          Analyse
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0 }}>
          Detaljerte analysediagrammer og innsikt
        </p>
      </div>

      {/* Row 1 */}
      <div className="flex" style={{ gap: 20, marginBottom: 20 }}>
        {/* Visibility Trends - Full width */}
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
            Synlighetstrender — Konkurrentsammenligning
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={visibilityTrends}>
              <defs>
                {brands.slice(0, 2).map((b, i) => (
                  <linearGradient key={b.id} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={b.color} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={b.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
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
                i < 2
                  ? <Area key={b.id} type="monotone" dataKey={b.name} stroke={b.color} strokeWidth={1.5} fill={`url(#grad${i})`} />
                  : <Line key={b.id} type="monotone" dataKey={b.name} stroke={b.color} strokeWidth={1.5} dot={false} />
              ))}
            </AreaChart>
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

        {/* Brand Share Pie */}
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
            Omtalefordeling
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={brandMentionShare}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
              >
                {brandMentionShare.map((entry, index) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap" style={{ gap: 8, marginTop: 8, justifyContent: "center" }}>
            {brandMentionShare.slice(0, 6).map((entry) => (
              <div key={entry.name} className="flex items-center" style={{ gap: 4 }}>
                <div style={{ width: 7, height: 7, borderRadius: 9999, backgroundColor: entry.color }} />
                <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="flex" style={{ gap: 20, marginBottom: 20 }}>
        {/* Daily aggregations */}
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
            Daglig aktivitet
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dailyAggregations}>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--chart-tick)", fontSize: 11 }}
                tickFormatter={(v) => v.split("-")[2] + " feb"}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--chart-tick)", fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="totalMentions" fill="var(--accent)" radius={[4, 4, 0, 0]} name="Omtaler" />
              <Bar dataKey="totalCitations" fill="var(--accent-deep)" radius={[4, 4, 0, 0]} name="Siteringer" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly summary table */}
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
            Ukentlig oppsummering
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-secondary)" }}>
                <th style={{ textAlign: "left", padding: "14px 12px", fontSize: 11, color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Uke</th>
                <th style={{ textAlign: "right", padding: "14px 12px", fontSize: 11, color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Omtaler</th>
                <th style={{ textAlign: "right", padding: "14px 12px", fontSize: 11, color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Siteringer</th>
                <th style={{ textAlign: "right", padding: "14px 12px", fontSize: 11, color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Gj.snitt</th>
              </tr>
            </thead>
            <tbody>
              {weeklyAggregations.map((w) => (
                <tr key={w.week} style={{ borderBottom: "1px solid var(--border-row)" }}>
                  <td style={{ padding: "14px 12px", fontSize: 13, color: "var(--text-secondary)" }}>{w.week}</td>
                  <td style={{ padding: "14px 12px", fontSize: 13, color: "var(--text-primary)", textAlign: "right", fontWeight: 500 }}>{w.totalMentions}</td>
                  <td style={{ padding: "14px 12px", fontSize: 13, color: "var(--text-primary)", textAlign: "right", fontWeight: 500 }}>{w.totalCitations}</td>
                  <td style={{ padding: "14px 12px", fontSize: 13, color: "var(--accent)", textAlign: "right", fontWeight: 500 }}>{w.avgScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 3 — Competitor Comparison Table */}
      <div
        style={{
          padding: "28px",
          borderRadius: 14,
          border: "1px solid var(--border-secondary)",
          backgroundColor: "var(--bg-card)",
          backdropFilter: "blur(12px)",
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: 0, marginBottom: 24 }}>
          Konkurrentsammenligning
        </h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-secondary)" }}>
              <th style={{ textAlign: "left", padding: "14px 12px", fontSize: 11, color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Merkevare</th>
              <th style={{ textAlign: "center", padding: "14px 12px", fontSize: 11, color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Synlighetspoeng</th>
              <th style={{ textAlign: "center", padding: "14px 12px", fontSize: 11, color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Omtaler</th>
              <th style={{ textAlign: "center", padding: "14px 12px", fontSize: 11, color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Siteringer</th>
              <th style={{ textAlign: "center", padding: "14px 12px", fontSize: 11, color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Endring</th>
            </tr>
          </thead>
          <tbody>
            {brands.sort((a, b) => b.visibilityScore - a.visibilityScore).map((brand, i) => {
              const change = brand.visibilityScore - brand.previousScore;
              return (
                <tr key={brand.id} style={{ borderBottom: "1px solid var(--border-row)" }}>
                  <td style={{ padding: "14px 12px" }}>
                    <div className="flex items-center" style={{ gap: 10 }}>
                      <span style={{ fontSize: 12, color: "var(--text-faint)", width: 20 }}>#{i + 1}</span>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          backgroundColor: brand.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#fff",
                        }}
                      >
                        {brand.logo}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{brand.name}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: "center", padding: "14px 12px" }}>
                    <span style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>{brand.visibilityScore}</span>
                  </td>
                  <td style={{ textAlign: "center", padding: "14px 12px", fontSize: 14, color: "var(--text-secondary)" }}>
                    {brand.mentionsThisWeek}
                  </td>
                  <td style={{ textAlign: "center", padding: "14px 12px", fontSize: 14, color: "var(--text-secondary)" }}>
                    {brand.citationsThisWeek}
                  </td>
                  <td style={{ textAlign: "center", padding: "14px 12px" }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: change >= 0 ? "var(--success)" : "var(--error)" }}>
                      {change >= 0 ? "+" : ""}{change}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
