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

const COLORS = ["#a78bfa", "#38bdf8", "#f87171", "#4ade80", "#fbbf24", "#f472b6", "#fb923c", "#818cf8"];

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
        <p key={p.name} style={{ color: p.color || "#a78bfa", margin: 0, marginBottom: 2 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { loading, visibilityTrends, brands, platformBreakdown, dailyAggregations, weeklyAggregations } = useDashboardData();

  if (loading) {
    return <div style={{ padding: "32px 40px", color: "rgba(255,255,255,0.5)" }}>Laster data...</div>;
  }

  const brandMentionShare = brands.map((b, i) => ({
    name: b.name,
    value: b.mentionsThisWeek,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1400 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: "#fff", margin: 0, marginBottom: 6 }}>
          Analyse
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", margin: 0 }}>
          Detaljerte analysediagrammer og innsikt
        </p>
      </div>

      {/* Row 1 */}
      <div className="flex" style={{ gap: 16, marginBottom: 16 }}>
        {/* Visibility Trends - Full width */}
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
            Synlighetstrender — Konkurrentsammenligning
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={visibilityTrends}>
              <defs>
                {brands.slice(0, 2).map((b, i) => (
                  <linearGradient key={b.id} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={b.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={b.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
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
                i < 2
                  ? <Area key={b.id} type="monotone" dataKey={b.name} stroke={b.color} strokeWidth={2} fill={`url(#grad${i})`} />
                  : <Line key={b.id} type="monotone" dataKey={b.name} stroke={b.color} strokeWidth={2} dot={false} />
              ))}
            </AreaChart>
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

        {/* Brand Share Pie */}
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
                paddingAngle={3}
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
                <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: entry.color }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="flex" style={{ gap: 16, marginBottom: 16 }}>
        {/* Daily aggregations */}
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
            Daglig aktivitet
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dailyAggregations}>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                tickFormatter={(v) => v.split("-")[2] + " feb"}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="totalMentions" fill="#a78bfa" radius={[4, 4, 0, 0]} name="Omtaler" />
              <Bar dataKey="totalCitations" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Siteringer" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly summary table */}
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
            Ukentlig oppsummering
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Uke</th>
                <th style={{ textAlign: "right", padding: "10px 12px", fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Omtaler</th>
                <th style={{ textAlign: "right", padding: "10px 12px", fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Siteringer</th>
                <th style={{ textAlign: "right", padding: "10px 12px", fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Gj.snitt</th>
              </tr>
            </thead>
            <tbody>
              {weeklyAggregations.map((w) => (
                <tr key={w.week} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "12px", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{w.week}</td>
                  <td style={{ padding: "12px", fontSize: 13, color: "#fff", textAlign: "right", fontWeight: 500 }}>{w.totalMentions}</td>
                  <td style={{ padding: "12px", fontSize: 13, color: "#fff", textAlign: "right", fontWeight: 500 }}>{w.totalCitations}</td>
                  <td style={{ padding: "12px", fontSize: 13, color: "#a78bfa", textAlign: "right", fontWeight: 500 }}>{w.avgScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 3 — Competitor Comparison Table */}
      <div
        style={{
          padding: "24px",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.08)",
          backgroundColor: "rgba(255,255,255,0.03)",
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff", margin: 0, marginBottom: 24 }}>
          Konkurrentsammenligning
        </h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Merkevare</th>
              <th style={{ textAlign: "center", padding: "10px 12px", fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Synlighetspoeng</th>
              <th style={{ textAlign: "center", padding: "10px 12px", fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Omtaler</th>
              <th style={{ textAlign: "center", padding: "10px 12px", fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Siteringer</th>
              <th style={{ textAlign: "center", padding: "10px 12px", fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Endring</th>
            </tr>
          </thead>
          <tbody>
            {brands.sort((a, b) => b.visibilityScore - a.visibilityScore).map((brand, i) => {
              const change = brand.visibilityScore - brand.previousScore;
              return (
                <tr key={brand.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "14px 12px" }}>
                    <div className="flex items-center" style={{ gap: 10 }}>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", width: 20 }}>#{i + 1}</span>
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
                      <span style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>{brand.name}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: "center", padding: "14px 12px" }}>
                    <span style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}>{brand.visibilityScore}</span>
                  </td>
                  <td style={{ textAlign: "center", padding: "14px 12px", fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
                    {brand.mentionsThisWeek}
                  </td>
                  <td style={{ textAlign: "center", padding: "14px 12px", fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
                    {brand.citationsThisWeek}
                  </td>
                  <td style={{ textAlign: "center", padding: "14px 12px" }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: change >= 0 ? "#4ade80" : "#f87171" }}>
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
