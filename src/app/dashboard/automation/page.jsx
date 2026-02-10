"use client";

import {
  Clock,
  Zap,
  CheckCircle2,
  Play,
  Pause,
  Calendar,
  Mail,
  BarChart3,
} from "lucide-react";
import { scheduledJobs } from "@/lib/mock-data";

const jobIcons = {
  ai_query: Zap,
  report: Mail,
  score_calculation: BarChart3,
};

export default function AutomationPage() {
  return (
    <div style={{ padding: "32px 40px", maxWidth: 1400 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: "var(--text-primary)", margin: 0, marginBottom: 6 }}>
          Automatisering
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-tertiary)", margin: 0 }}>
          Planlagte jobber og bakgrunnsoppgaver
        </p>
      </div>

      {/* Status cards */}
      <div className="flex" style={{ gap: 16, marginBottom: 32 }}>
        <div
          style={{
            flex: 1,
            padding: "20px 24px",
            borderRadius: 14,
            border: "1px solid var(--border-primary)",
            backgroundColor: "var(--bg-card)",
          }}
        >
          <div className="flex items-center" style={{ gap: 10, marginBottom: 12 }}>
            <CheckCircle2 size={18} color="#4ade80" />
            <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>Aktive jobber</span>
          </div>
          <span style={{ fontSize: 28, fontWeight: 600, color: "var(--text-primary)" }}>
            {scheduledJobs.filter((j) => j.status === "active").length}
          </span>
        </div>
        <div
          style={{
            flex: 1,
            padding: "20px 24px",
            borderRadius: 14,
            border: "1px solid var(--border-primary)",
            backgroundColor: "var(--bg-card)",
          }}
        >
          <div className="flex items-center" style={{ gap: 10, marginBottom: 12 }}>
            <Calendar size={18} color="var(--accent)" />
            <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>Neste kjøring</span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 500, color: "var(--text-primary)" }}>
            09. feb 2026, kl. 06:00
          </span>
        </div>
        <div
          style={{
            flex: 1,
            padding: "20px 24px",
            borderRadius: 14,
            border: "1px solid var(--border-primary)",
            backgroundColor: "var(--bg-card)",
          }}
        >
          <div className="flex items-center" style={{ gap: 10, marginBottom: 12 }}>
            <Zap size={18} color="#fbbf24" />
            <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>Spørringer i dag</span>
          </div>
          <span style={{ fontSize: 28, fontWeight: 600, color: "var(--text-primary)" }}>42</span>
        </div>
      </div>

      {/* Scheduled Jobs */}
      <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", margin: 0, marginBottom: 16 }}>
        Planlagte jobber
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {scheduledJobs.map((job) => {
          const Icon = jobIcons[job.type] || Clock;
          const lastRun = new Date(job.lastRun).toLocaleDateString("nb-NO", {
            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
          });
          const nextRun = new Date(job.nextRun).toLocaleDateString("nb-NO", {
            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
          });

          return (
            <div
              key={job.id}
              style={{
                padding: "20px 24px",
                borderRadius: 12,
                border: "1px solid var(--border-primary)",
                backgroundColor: "var(--bg-card)",
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
                    backgroundColor: "var(--accent-bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={20} color="var(--accent)" />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: "var(--text-primary)", marginBottom: 4 }}>
                    {job.description}
                  </div>
                  <div className="flex items-center" style={{ gap: 12 }}>
                    <span className="flex items-center" style={{ fontSize: 12, color: "var(--text-muted)", gap: 4 }}>
                      <Clock size={12} /> {job.schedule}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
                      Sist: {lastRun}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
                      Neste: {nextRun}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center" style={{ gap: 8 }}>
                <span
                  className="flex items-center"
                  style={{
                    fontSize: 12,
                    padding: "4px 10px",
                    borderRadius: 6,
                    backgroundColor: job.status === "active" ? "var(--success-bg)" : "var(--bg-input)",
                    color: job.status === "active" ? "var(--success)" : "var(--text-tertiary)",
                    gap: 4,
                    fontWeight: 500,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: job.status === "active" ? "var(--success)" : "var(--text-faint)" }} />
                  {job.status === "active" ? "Aktiv" : "Pauset"}
                </span>
                <button
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    border: "1px solid var(--border-primary)",
                    backgroundColor: "transparent",
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  {job.status === "active" ? <Pause size={14} /> : <Play size={14} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
