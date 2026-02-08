"use client";

import { Plus, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { useDashboardData } from "@/lib/dashboard-context";

export default function CompetitorsPage() {
  const { loading, brands, competitors } = useDashboardData();

  if (loading) {
    return <div style={{ padding: "32px 40px", color: "rgba(255,255,255,0.5)" }}>Laster data...</div>;
  }

  // Group competitors by brand
  const competitorsByBrand = {};
  competitors.forEach((c) => {
    if (!competitorsByBrand[c.brandId]) competitorsByBrand[c.brandId] = [];
    competitorsByBrand[c.brandId].push(c);
  });

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1400 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: "#fff", margin: 0, marginBottom: 6 }}>
            Konkurrenter
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", margin: 0 }}>
            Spor konkurrentenes AI-synlighet mot dine merkevarer
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
          Legg til konkurrent
        </button>
      </div>

      {/* Competitor groups */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {Object.entries(competitorsByBrand).map(([brandId, comps]) => {
          const brand = brands.find((b) => b.id === brandId);
          if (!brand) return null;

          return (
            <div
              key={brandId}
              style={{
                padding: "24px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.08)",
                backgroundColor: "rgba(255,255,255,0.03)",
              }}
            >
              {/* Brand header */}
              <div className="flex items-center" style={{ gap: 12, marginBottom: 20 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: brand.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  {brand.logo}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>{brand.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                    Synlighetspoeng: {brand.visibilityScore}
                  </div>
                </div>
              </div>

              {/* Competitor rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {comps.map((comp) => {
                  const compBrand = brands.find((b) => b.id === comp.competitorBrandId);
                  if (!compBrand) return null;
                  const diff = brand.visibilityScore - compBrand.visibilityScore;
                  const isAhead = diff > 0;

                  return (
                    <div
                      key={comp.id}
                      className="flex items-center justify-between"
                      style={{
                        padding: "14px 18px",
                        borderRadius: 10,
                        backgroundColor: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <div className="flex items-center" style={{ gap: 12 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            backgroundColor: compBrand.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#fff",
                          }}
                        >
                          {compBrand.logo}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>{compBrand.name}</div>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{comp.notes}</div>
                        </div>
                      </div>

                      <div className="flex items-center" style={{ gap: 16 }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Poeng</div>
                          <div style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}>
                            {compBrand.visibilityScore}
                          </div>
                        </div>
                        <div
                          className="flex items-center"
                          style={{
                            gap: 4,
                            padding: "6px 12px",
                            borderRadius: 8,
                            backgroundColor: isAhead ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
                          }}
                        >
                          {isAhead ? <TrendingUp size={14} color="#4ade80" /> : <TrendingDown size={14} color="#f87171" />}
                          <span style={{ fontSize: 13, fontWeight: 600, color: isAhead ? "#4ade80" : "#f87171" }}>
                            {isAhead ? "+" : ""}{diff}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
