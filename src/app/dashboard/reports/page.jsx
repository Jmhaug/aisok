"use client";

import {
  FileText,
  Download,
  Eye,
  Calendar,
  Mail,
  Palette,
} from "lucide-react";

const reports = [
  {
    id: "r1",
    title: "Ukentlig synlighetsrapport — Uke 6",
    type: "weekly",
    date: "2026-02-03",
    brands: ["DNB", "Nordea Norge", "SpareBank 1"],
    status: "ready",
  },
  {
    id: "r2",
    title: "Ukentlig synlighetsrapport — Uke 5",
    type: "weekly",
    date: "2026-01-27",
    brands: ["DNB", "Nordea Norge", "SpareBank 1"],
    status: "ready",
  },
  {
    id: "r3",
    title: "Månedlig analyserapport — Januar 2026",
    type: "monthly",
    date: "2026-02-01",
    brands: ["Alle merkevarer"],
    status: "ready",
  },
  {
    id: "r4",
    title: "Konkurrentrapport — DNB vs Nordea",
    type: "competitor",
    date: "2026-01-30",
    brands: ["DNB", "Nordea Norge"],
    status: "ready",
  },
];

export default function ReportsPage() {
  return (
    <div style={{ padding: "32px 40px", maxWidth: 1400 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: "#fff", margin: 0, marginBottom: 6 }}>
            Rapporter
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", margin: 0 }}>
            Generer og last ned synlighetsrapporter
          </p>
        </div>
        <div className="flex items-center" style={{ gap: 10 }}>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.15)",
              backgroundColor: "transparent",
              color: "#fff",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <Palette size={16} />
            White-label innstillinger
          </button>
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
            <FileText size={16} />
            Ny rapport
          </button>
        </div>
      </div>

      {/* White-label info banner */}
      <div
        style={{
          padding: "16px 20px",
          borderRadius: 12,
          border: "1px solid rgba(167,139,250,0.2)",
          backgroundColor: "rgba(167,139,250,0.06)",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Palette size={18} color="#a78bfa" />
        <div>
          <span style={{ fontSize: 14, color: "#a78bfa", fontWeight: 500 }}>White-label rapporter tilgjengelig</span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginLeft: 8 }}>
            Tilpass rapporter med din merkevare, logo og farger for dine kunder.
          </span>
        </div>
      </div>

      {/* Reports List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {reports.map((report) => {
          const date = new Date(report.date).toLocaleDateString("nb-NO", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });

          return (
            <div
              key={report.id}
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
              <div className="flex items-center" style={{ gap: 16 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    backgroundColor: "rgba(167,139,250,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FileText size={20} color="#a78bfa" />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: "#fff", marginBottom: 4 }}>
                    {report.title}
                  </div>
                  <div className="flex items-center" style={{ gap: 10 }}>
                    <span className="flex items-center" style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", gap: 4 }}>
                      <Calendar size={12} /> {date}
                    </span>
                    <div className="flex items-center" style={{ gap: 4 }}>
                      {report.brands.map((b) => (
                        <span
                          key={b}
                          style={{
                            fontSize: 11,
                            padding: "2px 6px",
                            borderRadius: 4,
                            backgroundColor: "rgba(255,255,255,0.06)",
                            color: "rgba(255,255,255,0.4)",
                          }}
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center" style={{ gap: 8 }}>
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "transparent",
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  <Eye size={14} /> Vis
                </button>
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "transparent",
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  <Download size={14} /> Last ned
                </button>
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "transparent",
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  <Mail size={14} /> Send
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
