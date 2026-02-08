"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { classifyInput } from "@/lib/detect-input";

const STEPS = [
  { label: "Henter nettsted...", icon: "globe" },
  { label: "Genererer AI-søk...", icon: "search" },
  { label: "Analyserer synlighet i ChatGPT...", icon: "bot" },
  { label: "Analyserer synlighet i Perplexity...", icon: "sparkle" },
  { label: "Beregner synlighetspoeng...", icon: "chart" },
];

function StepIcon({ type, active, done }) {
  const color = done
    ? "rgba(74,222,128,1)"
    : active
      ? "rgba(255,255,255,0.9)"
      : "rgba(255,255,255,0.2)";
  const s = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  if (done) {
    return (
      <svg {...s}>
        <path d="M20 6L9 17l-5-5" />
      </svg>
    );
  }
  switch (type) {
    case "globe":
      return (
        <svg {...s}>
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case "search":
      return (
        <svg {...s}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );
    case "bot":
      return (
        <svg {...s}>
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <circle cx="9" cy="16" r="1" />
          <circle cx="15" cy="16" r="1" />
          <path d="M12 3v4" />
          <path d="M8 7h8" />
        </svg>
      );
    case "sparkle":
      return (
        <svg {...s} fill={color} stroke="none">
          <path d="M12 2l2 6.5L20 12l-6 3.5L12 22l-2-6.5L4 12l6-3.5L12 2z" />
        </svg>
      );
    case "chart":
      return (
        <svg {...s}>
          <path d="M18 20V10" />
          <path d="M12 20V4" />
          <path d="M6 20v-6" />
        </svg>
      );
    default:
      return null;
  }
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [query, setQuery] = useState("");
  const [currentStep, setCurrentStep] = useState(-1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("lgpsm_analyze_query");
    if (!stored) {
      router.replace("/dashboard");
      return;
    }
    setQuery(stored);
  }, [router]);

  useEffect(() => {
    if (!query || !user) return;

    let cancelled = false;

    async function runAnalysis() {
      for (let i = 0; i < STEPS.length; i++) {
        if (cancelled) return;
        setCurrentStep(i);
        await new Promise((r) => setTimeout(r, i < 2 ? 1200 : 2500));
      }
    }

    async function callApi() {
      try {
        const input = classifyInput(query);
        const payload = {
          email: user.primaryEmailAddress?.emailAddress || "",
        };
        if (input.type === "url") payload.url = input.value;
        else if (input.type === "brand_name") payload.brand_name = input.value;
        else payload.prompt = input.value;

        const resp = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!resp.ok) {
          const data = await resp.json().catch(() => ({}));
          throw new Error(data.error || "Analysen feilet");
        }

        const data = await resp.json();
        if (!cancelled) {
          setResult(data);
          localStorage.setItem("lgpsm_analysis_result", JSON.stringify(data));
          localStorage.removeItem("lgpsm_analyze_query");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      }
    }

    runAnalysis();
    callApi();

    return () => {
      cancelled = true;
    };
  }, [query, user]);

  // Once we have a result and steps are done, show it
  const analysisComplete = result && currentStep >= STEPS.length - 1;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
      }}
    >
      <div style={{ maxWidth: 560, width: "100%" }}>
        {/* Header */}
        <h1
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: "#fff",
            margin: 0,
            marginBottom: 8,
          }}
        >
          {analysisComplete ? "Analysen er klar!" : "Analyserer din merkevare..."}
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.5)",
            margin: 0,
            marginBottom: 40,
          }}
        >
          {query}
        </p>

        {/* Error state */}
        {error && (
          <div
            style={{
              padding: "16px 20px",
              borderRadius: 12,
              backgroundColor: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              marginBottom: 24,
            }}
          >
            <p style={{ color: "rgb(239,68,68)", fontSize: 14, margin: 0, marginBottom: 8 }}>
              {error}
            </p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: 0 }}>
              Sørg for at backend-tjenesten kjører på localhost:8000
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                marginTop: 16,
                padding: "10px 24px",
                borderRadius: 8,
                backgroundColor: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Gå til dashbordet
            </button>
          </div>
        )}

        {/* Progress steps */}
        {!analysisComplete && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {STEPS.map((step, i) => {
              const done = i < currentStep || (result && i <= currentStep);
              const active = i === currentStep && !result;
              return (
                <div
                  key={step.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    opacity: i <= currentStep ? 1 : 0.3,
                    transition: "opacity 0.4s",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: done
                        ? "rgba(74,222,128,0.1)"
                        : active
                          ? "rgba(255,255,255,0.08)"
                          : "rgba(255,255,255,0.03)",
                      border: `1px solid ${done ? "rgba(74,222,128,0.2)" : active ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.4s",
                    }}
                  >
                    <StepIcon type={step.icon} active={active} done={done} />
                  </div>
                  <span
                    style={{
                      fontSize: 15,
                      color: done
                        ? "rgba(74,222,128,0.9)"
                        : active
                          ? "#fff"
                          : "rgba(255,255,255,0.4)",
                      transition: "color 0.4s",
                    }}
                  >
                    {step.label}
                  </span>
                  {active && (
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Result display */}
        {analysisComplete && result && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Score card */}
            <div
              style={{
                padding: "24px",
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 16,
                    background: `conic-gradient(rgba(74,222,128,0.8) ${(result.visibility_score || 0) * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 12,
                      backgroundColor: "#000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      fontWeight: 700,
                      color: "#fff",
                    }}
                  >
                    {result.visibility_score || 0}
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>
                    Synlighetspoeng
                  </p>
                  <p style={{ fontSize: 24, fontWeight: 600, color: "#fff", margin: 0 }}>
                    {result.brand_name || "Ukjent"}
                  </p>
                </div>
              </div>
            </div>

            {/* Summary */}
            {result.summary && (
              <div
                style={{
                  padding: "20px",
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0, marginBottom: 8 }}>
                  Oppsummering
                </p>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.75)", margin: 0 }}>
                  {result.summary}
                </p>
              </div>
            )}

            {/* Platform scores */}
            {result.platform_scores && result.platform_scores.length > 0 && (
              <div
                style={{
                  padding: "20px",
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0, marginBottom: 12 }}>
                  Plattformresultater
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {result.platform_scores.map((ps) => (
                    <div key={ps.platform} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span
                        style={{
                          fontSize: 13,
                          color: "rgba(255,255,255,0.6)",
                          width: 90,
                        }}
                      >
                        {ps.platform}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: "rgba(255,255,255,0.06)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${ps.score}%`,
                            height: "100%",
                            borderRadius: 3,
                            backgroundColor:
                              ps.score >= 60
                                ? "rgba(74,222,128,0.7)"
                                : ps.score >= 30
                                  ? "rgba(250,204,21,0.7)"
                                  : "rgba(239,68,68,0.6)",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#fff",
                          width: 36,
                          textAlign: "right",
                        }}
                      >
                        {ps.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                marginTop: 8,
                width: "100%",
                padding: "14px 24px",
                borderRadius: 12,
                backgroundColor: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 500,
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "rgba(255,255,255,0.15)")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "rgba(255,255,255,0.1)")}
            >
              Gå til dashbordet
            </button>
          </div>
        )}

        {/* Spinner keyframes */}
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
