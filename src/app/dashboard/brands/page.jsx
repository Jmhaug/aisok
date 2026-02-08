"use client";

import { useState } from "react";
import {
  Building2,
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import { useDashboardData } from "@/lib/dashboard-context";

export default function BrandsPage() {
  const { loading, brands } = useDashboardData();
  const [searchQuery, setSearchQuery] = useState("");

  if (loading) {
    return <div style={{ padding: "32px 40px", color: "rgba(255,255,255,0.5)" }}>Laster data...</div>;
  }

  const filtered = brands.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.nameVariations.some((v) => v.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1400 }}>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: "#fff", margin: 0, marginBottom: 6 }}>
            Merkevarer
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", margin: 0 }}>
            Administrer merkevarer og navnevariasjoner
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
          Legg til merkevare
        </button>
      </div>

      {/* Search */}
      <div
        style={{
          position: "relative",
          marginBottom: 24,
          maxWidth: 400,
        }}
      >
        <Search
          size={16}
          style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }}
        />
        <input
          type="text"
          placeholder="Søk etter merkevare..."
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

      {/* Brand Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
          gap: 16,
        }}
      >
        {filtered.map((brand) => {
          const change = brand.visibilityScore - brand.previousScore;
          const isPositive = change >= 0;

          return (
            <div
              key={brand.id}
              style={{
                padding: "24px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.08)",
                backgroundColor: "rgba(255,255,255,0.03)",
                cursor: "pointer",
                transition: "border-color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(167,139,250,0.3)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
            >
              {/* Top row */}
              <div className="flex items-start justify-between" style={{ marginBottom: 20 }}>
                <div className="flex items-center" style={{ gap: 14 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: brand.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#fff",
                    }}
                  >
                    {brand.logo}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>{brand.name}</div>
                    <a
                      href={`https://${brand.domain}`}
                      className="flex items-center no-underline"
                      style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", gap: 4, marginTop: 2 }}
                    >
                      {brand.domain} <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
                <button
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "transparent",
                    color: "rgba(255,255,255,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>

              {/* Score */}
              <div className="flex items-end justify-between" style={{ marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>
                    Synlighetspoeng
                  </div>
                  <div className="flex items-end" style={{ gap: 8 }}>
                    <span style={{ fontSize: 36, fontWeight: 700, color: "#fff", lineHeight: 1 }}>
                      {brand.visibilityScore}
                    </span>
                    <span
                      className="flex items-center"
                      style={{
                        fontSize: 13,
                        color: isPositive ? "#4ade80" : "#f87171",
                        gap: 2,
                        paddingBottom: 4,
                      }}
                    >
                      {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {isPositive ? "+" : ""}{change}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>
                    Denne uken
                  </div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
                    {brand.mentionsThisWeek} omtaler · {brand.citationsThisWeek} siteringer
                  </div>
                </div>
              </div>

              {/* Score bar */}
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    width: "100%",
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "rgba(255,255,255,0.06)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${brand.visibilityScore}%`,
                      height: "100%",
                      borderRadius: 3,
                      background: "linear-gradient(90deg, #7c3aed 0%, #a78bfa 100%)",
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
              </div>

              {/* Name variations */}
              <div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>
                  Navnevariasjoner
                </div>
                <div className="flex flex-wrap" style={{ gap: 6 }}>
                  {brand.nameVariations.map((v) => (
                    <span
                      key={v}
                      style={{
                        fontSize: 12,
                        padding: "3px 10px",
                        borderRadius: 6,
                        backgroundColor: "rgba(255,255,255,0.06)",
                        color: "rgba(255,255,255,0.5)",
                      }}
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
