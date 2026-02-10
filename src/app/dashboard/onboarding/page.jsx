"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { classifyInput } from "@/lib/detect-input";
import {
  MONITORING_CONFIG_KEY,
  MONITORING_SNAPSHOT_KEY,
  bootstrapOnboarding,
  completeOnboarding,
  fetchOnboardingJob,
  recomputeOnboardingQueries,
} from "@/lib/onboarding-client";

const STEPS = [
  { key: "profile", title: "Virksomhet" },
  { key: "competitors", title: "Konkurrenter" },
  { key: "queries", title: "Sporringer" },
  { key: "review", title: "Oppsummering" },
  { key: "running", title: "Forste kjoring" },
];

const INDUSTRY_OPTIONS = [
  "banking",
  "bike_shop",
  "insurance",
  "retail",
  "technology",
  "services",
];

const SIZE_BANDS = ["local", "regional", "national", "enterprise"];
const SCOPE_LEVELS = ["city", "region", "country"];

function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeBootstrapInput(raw) {
  const input = classifyInput(raw);
  if (input.type === "url") return input.value;
  return input.value || raw;
}

function normalizeCompetitor(payload) {
  return {
    name: payload.name?.trim() || "",
    domain: payload.domain?.trim() || null,
    scope_match: payload.scope_match || "country",
    relevance_score: Number(payload.relevance_score || 0),
    reason: payload.reason || "",
  };
}

function normalizeQuery(payload, idx = 0) {
  return {
    text: payload.text?.trim() || "",
    category: payload.category || "custom",
    priority: Number(payload.priority || idx + 1),
    scope_tags: Array.isArray(payload.scope_tags) ? payload.scope_tags : [],
  };
}

function labelForIndustry(industry) {
  const map = {
    banking: "Bank og finans",
    bike_shop: "Sykkelbutikk",
    insurance: "Forsikring",
    retail: "Handel",
    technology: "Teknologi",
    services: "Tjenester",
  };
  return map[industry] || industry;
}

function ProgressBar({ completed, total, failed }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          height: 10,
          borderRadius: 999,
          backgroundColor: "var(--border-primary)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 999,
            background:
              failed > 0
                ? "linear-gradient(90deg, #fb923c 0%, #f43f5e 100%)"
                : "linear-gradient(90deg, #14b8a6 0%, #22d3ee 100%)",
            transition: "width 0.3s ease",
          }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
          {completed}/{total} ferdig
        </span>
        <span style={{ fontSize: 12, color: failed > 0 ? "#fb923c" : "var(--text-tertiary)" }}>
          Feilet: {failed}
        </span>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();

  const [rawInput, setRawInput] = useState("");
  const [email, setEmail] = useState("");
  const [activeStep, setActiveStep] = useState(0);

  const [profile, setProfile] = useState(null);
  const [competitors, setCompetitors] = useState([]);
  const [queries, setQueries] = useState([]);

  const [loadingBootstrap, setLoadingBootstrap] = useState(true);
  const [bootstrapError, setBootstrapError] = useState("");
  const [recomputeLoading, setRecomputeLoading] = useState(false);

  const [newCompetitorName, setNewCompetitorName] = useState("");
  const [newCompetitorDomain, setNewCompetitorDomain] = useState("");
  const [newQueryText, setNewQueryText] = useState("");

  const [launching, setLaunching] = useState(false);
  const [jobId, setJobId] = useState("");
  const [jobState, setJobState] = useState(null);
  const [runError, setRunError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("lgpsm_analyze_query");
    if (!stored) {
      router.replace("/dashboard");
      return;
    }
    setRawInput(stored);
  }, [router]);

  useEffect(() => {
    if (!user) return;
    setEmail(user.primaryEmailAddress?.emailAddress || "");
  }, [user]);

  useEffect(() => {
    if (!rawInput || !email) return;

    let cancelled = false;
    async function runBootstrap() {
      setLoadingBootstrap(true);
      setBootstrapError("");
      try {
        const response = await bootstrapOnboarding({
          email,
          raw_input: normalizeBootstrapInput(rawInput),
          locale: "nb-NO",
        });
        if (cancelled) return;

        setProfile(response.profile);
        setCompetitors(
          (response.suggested_competitors || []).map((item, idx) => ({
            ...item,
            id: uid("competitor"),
            selected: idx < 5,
            custom: false,
          }))
        );
        setQueries(
          (response.suggested_queries || []).map((item, idx) => ({
            ...item,
            id: uid("query"),
            active: idx < 8,
            custom: false,
          }))
        );
      } catch (error) {
        if (!cancelled) {
          setBootstrapError(error.message || "Kunne ikke starte onboarding.");
        }
      } finally {
        if (!cancelled) {
          setLoadingBootstrap(false);
        }
      }
    }

    runBootstrap();
    return () => {
      cancelled = true;
    };
  }, [rawInput, email]);

  const selectedCompetitors = useMemo(
    () => competitors.filter((item) => item.selected && item.name?.trim()),
    [competitors]
  );

  const activeQueries = useMemo(
    () => queries.filter((item) => item.active && item.text?.trim()),
    [queries]
  );

  const canProceedFromProfile = Boolean(
    profile?.business_name?.trim() &&
      profile?.industry?.trim() &&
      profile?.size_band?.trim() &&
      profile?.country?.trim()
  );
  const canProceedFromCompetitors = selectedCompetitors.length >= 2;
  const canProceedFromQueries = activeQueries.length >= 5;

  useEffect(() => {
    if (!jobId || activeStep !== 4) return undefined;
    let cancelled = false;
    let timer = null;

    async function poll() {
      try {
        const status = await fetchOnboardingJob(jobId);
        if (cancelled) return;
        setJobState(status);

        if (status.status === "completed" && status.snapshot) {
          localStorage.setItem(MONITORING_SNAPSHOT_KEY, JSON.stringify(status.snapshot));
          localStorage.removeItem("lgpsm_analyze_query");
          setTimeout(() => router.replace("/dashboard"), 700);
          return;
        }

        if (status.status === "failed") {
          setRunError(status.error || "Kjoringen feilet.");
          return;
        }

        timer = setTimeout(poll, 1500);
      } catch (error) {
        setRunError(error.message || "Kunne ikke hente jobbstatus.");
      }
    }

    poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [jobId, activeStep, router]);

  function updateProfile(field, value) {
    setProfile((prev) => ({
      ...(prev || {}),
      [field]: value,
    }));
  }

  function toggleCompetitor(id) {
    setCompetitors((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  }

  function toggleQuery(id) {
    setQueries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active: !item.active } : item))
    );
  }

  function updateQueryText(id, value) {
    setQueries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text: value } : item))
    );
  }

  function addCompetitor() {
    if (!newCompetitorName.trim()) return;
    setCompetitors((prev) => [
      ...prev,
      {
        id: uid("competitor"),
        name: newCompetitorName.trim(),
        domain: newCompetitorDomain.trim() || null,
        scope_match: profile?.scope_level || "country",
        relevance_score: 0.5,
        reason: "Manuelt lagt til",
        selected: true,
        custom: true,
      },
    ]);
    setNewCompetitorName("");
    setNewCompetitorDomain("");
  }

  function addQuery() {
    if (!newQueryText.trim()) return;
    setQueries((prev) => [
      ...prev,
      {
        id: uid("query"),
        text: newQueryText.trim(),
        category: "custom",
        priority: prev.length + 1,
        scope_tags: [profile?.scope_level || "country"],
        active: true,
        custom: true,
      },
    ]);
    setNewQueryText("");
  }

  async function recomputeQueries() {
    setRecomputeLoading(true);
    setBootstrapError("");
    try {
      const response = await recomputeOnboardingQueries({
        email,
        profile,
        selected_competitors: selectedCompetitors.map(normalizeCompetitor),
      });
      const existingMap = new Map(
        queries.map((item) => [item.text.trim().toLowerCase(), item.active])
      );
      const manual = queries.filter((item) => item.custom);
      const merged = [...(response.suggested_queries || []), ...manual];
      const deduped = [];
      const seen = new Set();
      merged.forEach((item, idx) => {
        const key = (item.text || "").trim().toLowerCase();
        if (!key || seen.has(key)) return;
        seen.add(key);
        deduped.push({
          ...item,
          id: uid("query"),
          active: existingMap.has(key) ? existingMap.get(key) : idx < 8,
          custom: Boolean(item.custom),
        });
      });
      setQueries(deduped);
    } catch (error) {
      setBootstrapError(error.message || "Kunne ikke regenerere sporringer.");
    } finally {
      setRecomputeLoading(false);
    }
  }

  async function launchMonitoring() {
    setLaunching(true);
    setRunError("");
    try {
      const payload = {
        email,
        profile,
        selected_competitors: selectedCompetitors.map(normalizeCompetitor),
        active_queries: activeQueries.map((item, idx) => normalizeQuery(item, idx)),
        platforms: ["ChatGPT", "Perplexity"],
        auto_run: true,
      };
      const response = await completeOnboarding(payload);
      localStorage.setItem(
        MONITORING_CONFIG_KEY,
        JSON.stringify({
          config_id: response.config_id,
          profile,
          selected_competitors: payload.selected_competitors,
          active_queries: payload.active_queries,
          created_at: new Date().toISOString(),
        })
      );

      if (!response.job_id) {
        throw new Error("Mangler job_id fra backend.");
      }

      setJobId(response.job_id);
      setJobState({
        status: response.status,
        progress: {
          total_queries: payload.active_queries.length,
          completed_queries: 0,
          failed_queries: 0,
          current_query: null,
        },
        partial_top_entities: [],
      });
      setActiveStep(4);
    } catch (error) {
      setRunError(error.message || "Kunne ikke starte overvaking.");
    } finally {
      setLaunching(false);
    }
  }

  function goNext() {
    setBootstrapError("");
    if (activeStep === 0 && !canProceedFromProfile) return;
    if (activeStep === 1 && !canProceedFromCompetitors) return;
    if (activeStep === 2 && !canProceedFromQueries) return;
    if (activeStep < 3) {
      setActiveStep((prev) => prev + 1);
    }
  }

  function goBack() {
    setBootstrapError("");
    if (activeStep > 0 && activeStep < 4) {
      setActiveStep((prev) => prev - 1);
    }
  }

  const cardStyle = {
    borderRadius: 18,
    border: "1px solid var(--border-primary)",
    background:
      "linear-gradient(180deg, var(--bg-card) 0%, var(--bg-card-inner) 100%)",
    backdropFilter: "blur(4px)",
  };

  if (loadingBootstrap) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background:
            "radial-gradient(circle at 20% 0%, rgba(20,184,166,0.18), transparent 40%), var(--bg-page)",
          color: "var(--text-primary)",
          padding: 24,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 16 }}>Forbereder onboarding...</p>
          <p style={{ margin: "10px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>
            Henter forslag for: {rawInput}
          </p>
        </div>
      </div>
    );
  }

  if (bootstrapError && !profile) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "var(--bg-page)",
          color: "var(--text-primary)",
          padding: 24,
        }}
      >
        <div style={{ ...cardStyle, maxWidth: 560, width: "100%", padding: 24 }}>
          <p style={{ margin: 0, color: "#fda4af", fontSize: 14 }}>{bootstrapError}</p>
          <button
            onClick={() => router.replace("/dashboard")}
            style={{
              marginTop: 16,
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid var(--border-primary)",
              backgroundColor: "var(--bg-input)",
              color: "var(--text-primary)",
              cursor: "pointer",
            }}
          >
            Gaa til dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 5% 0%, rgba(20,184,166,0.2), transparent 36%), radial-gradient(circle at 100% 100%, rgba(249,115,22,0.17), transparent 40%), var(--bg-page)",
        color: "var(--text-primary)",
        padding: "28px 16px 32px",
      }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ marginBottom: 18 }}>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)", letterSpacing: "0.08em" }}>
            KONKURRENTSCOPED ONBOARDING
          </p>
          <h1
            style={{
              margin: "8px 0 0",
              fontSize: "clamp(28px, 6vw, 42px)",
              fontWeight: 550,
              lineHeight: 1.1,
              fontFamily: "'Iowan Old Style', 'Palatino Linotype', serif",
            }}
          >
            Bygg presis AI-overvaking
          </h1>
          <p style={{ margin: "10px 0 0", color: "var(--text-secondary)", fontSize: 14 }}>
            Input: {rawInput}
          </p>
        </div>

        <div
          style={{
            ...cardStyle,
            padding: 12,
            marginBottom: 16,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: 8,
          }}
        >
          {STEPS.map((step, idx) => {
            const done = idx < activeStep;
            const active = idx === activeStep;
            return (
              <div
                key={step.key}
                style={{
                  borderRadius: 12,
                  padding: "10px 12px",
                  backgroundColor: active
                    ? "rgba(20,184,166,0.18)"
                    : done
                      ? "rgba(34,197,94,0.14)"
                      : "var(--bg-card-inner)",
                  border: `1px solid ${active ? "rgba(45,212,191,0.6)" : done ? "rgba(74,222,128,0.32)" : "var(--border-primary)"}`,
                }}
              >
                <p style={{ margin: 0, fontSize: 11, color: "var(--text-secondary)" }}>
                  Steg {idx + 1}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>
                  {step.title}
                </p>
              </div>
            );
          })}
        </div>

        {bootstrapError && (
          <div
            style={{
              ...cardStyle,
              marginBottom: 16,
              padding: "12px 14px",
              borderColor: "rgba(251,113,133,0.45)",
              color: "#fda4af",
              fontSize: 13,
            }}
          >
            {bootstrapError}
          </div>
        )}

        {activeStep === 0 && profile && (
          <div style={{ ...cardStyle, padding: 20 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 550 }}>Virksomhetsprofil</h2>
            <p style={{ margin: "8px 0 18px", color: "var(--text-secondary)", fontSize: 13 }}>
              Juster feltene for mer presise forslag.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 12,
              }}
            >
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Virksomhetsnavn *</span>
                <input
                  value={profile.business_name || ""}
                  onChange={(event) => updateProfile("business_name", event.target.value)}
                  style={inputStyle}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Bransje *</span>
                <select
                  value={profile.industry || "services"}
                  onChange={(event) => updateProfile("industry", event.target.value)}
                  style={inputStyle}
                >
                  {INDUSTRY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {labelForIndustry(option)}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Storrelse *</span>
                <select
                  value={profile.size_band || "regional"}
                  onChange={(event) => updateProfile("size_band", event.target.value)}
                  style={inputStyle}
                >
                  {SIZE_BANDS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Land *</span>
                <input
                  value={profile.country || "NO"}
                  onChange={(event) => updateProfile("country", event.target.value)}
                  style={inputStyle}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>By</span>
                <input
                  value={profile.city || ""}
                  onChange={(event) => updateProfile("city", event.target.value)}
                  style={inputStyle}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Region</span>
                <input
                  value={profile.region || ""}
                  onChange={(event) => updateProfile("region", event.target.value)}
                  style={inputStyle}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Nettside</span>
                <input
                  value={profile.website || ""}
                  onChange={(event) => updateProfile("website", event.target.value)}
                  style={inputStyle}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Scope</span>
                <select
                  value={profile.scope_level || "country"}
                  onChange={(event) => updateProfile("scope_level", event.target.value)}
                  style={inputStyle}
                >
                  {SCOPE_LEVELS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        )}

        {activeStep === 1 && (
          <div style={{ ...cardStyle, padding: 20 }}>
            <div className="flex items-center justify-between" style={{ gap: 12, marginBottom: 14 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 550 }}>Foreslatte konkurrenter</h2>
                <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>
                  Velg minst 2. Forslagene er scoped til {profile?.scope_level || "country"}.
                </p>
              </div>
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 999,
                  border: "1px solid var(--border-primary)",
                  fontSize: 12,
                  color: "var(--text-secondary)",
                }}
              >
                Valgt: {selectedCompetitors.length}
              </div>
            </div>

            <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
              {competitors.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleCompetitor(item.id)}
                  style={{
                    textAlign: "left",
                    borderRadius: 12,
                    padding: "12px 14px",
                    border: `1px solid ${item.selected ? "rgba(45,212,191,0.55)" : "var(--border-primary)"}`,
                    backgroundColor: item.selected
                      ? "rgba(20,184,166,0.14)"
                      : "var(--bg-card-inner)",
                    cursor: "pointer",
                    color: "var(--text-primary)",
                  }}
                >
                  <div className="flex items-center justify-between" style={{ gap: 8 }}>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>{item.name}</p>
                    <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                      {Math.round((item.relevance_score || 0) * 100)}%
                    </span>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-secondary)" }}>
                    {item.reason || "Bransjenar konkurrent"} {item.domain ? `• ${item.domain}` : ""}
                  </p>
                </button>
              ))}
            </div>

            <div
              style={{
                borderRadius: 12,
                border: "1px solid var(--border-primary)",
                padding: 12,
                backgroundColor: "var(--bg-card-inner)",
              }}
            >
              <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>
                Legg til egendefinert konkurrent
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr", gap: 8 }}>
                <input
                  placeholder="Navn"
                  value={newCompetitorName}
                  onChange={(event) => setNewCompetitorName(event.target.value)}
                  style={inputStyle}
                />
                <input
                  placeholder="Domene (valgfritt)"
                  value={newCompetitorDomain}
                  onChange={(event) => setNewCompetitorDomain(event.target.value)}
                  style={inputStyle}
                />
                <button onClick={addCompetitor} style={secondaryButtonStyle}>
                  Legg til
                </button>
              </div>
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div style={{ ...cardStyle, padding: 20 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 14, gap: 10 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 550 }}>Sporringsforslag</h2>
                <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>
                  Velg minst 5 aktive sporringer. Malscope: {profile?.scope_level}.
                </p>
              </div>
              <button onClick={recomputeQueries} style={secondaryButtonStyle} disabled={recomputeLoading}>
                {recomputeLoading ? "Oppdaterer..." : "Regenerer"}
              </button>
            </div>

            <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
              {queries.map((item) => (
                <div
                  key={item.id}
                  style={{
                    borderRadius: 12,
                    padding: "12px 12px 10px",
                    border: `1px solid ${item.active ? "rgba(34,211,238,0.5)" : "var(--border-primary)"}`,
                    backgroundColor: item.active ? "rgba(34,211,238,0.08)" : "var(--bg-card-inner)",
                  }}
                >
                  <div className="flex items-center" style={{ gap: 10 }}>
                    <input
                      type="checkbox"
                      checked={item.active}
                      onChange={() => toggleQuery(item.id)}
                    />
                    <input
                      value={item.text}
                      onChange={(event) => updateQueryText(item.id, event.target.value)}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                  </div>
                  <div className="flex items-center" style={{ gap: 8, marginTop: 8, marginLeft: 28 }}>
                    <span style={chipStyle}>{item.category}</span>
                    {(item.scope_tags || []).map((tag) => (
                      <span key={`${item.id}-${tag}`} style={chipStyleMuted}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                borderRadius: 12,
                border: "1px solid var(--border-primary)",
                padding: 12,
                backgroundColor: "var(--bg-card-inner)",
              }}
            >
              <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>
                Legg til egendefinert sporring
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 110px", gap: 8 }}>
                <input
                  value={newQueryText}
                  placeholder="f.eks. beste sykkelbutikk i Bergen"
                  onChange={(event) => setNewQueryText(event.target.value)}
                  style={inputStyle}
                />
                <button onClick={addQuery} style={secondaryButtonStyle}>
                  Legg til
                </button>
              </div>
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div style={{ ...cardStyle, padding: 20 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 550 }}>Klar for oppstart</h2>
            <p style={{ margin: "6px 0 18px", fontSize: 13, color: "var(--text-secondary)" }}>
              Oppsettet starter automatisk forste overvaking pa ChatGPT og Perplexity.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <div style={summaryTileStyle}>
                <p style={summaryLabelStyle}>Virksomhet</p>
                <p style={summaryValueStyle}>{profile?.business_name}</p>
              </div>
              <div style={summaryTileStyle}>
                <p style={summaryLabelStyle}>Scope</p>
                <p style={summaryValueStyle}>{profile?.scope_level}</p>
              </div>
              <div style={summaryTileStyle}>
                <p style={summaryLabelStyle}>Konkurrenter</p>
                <p style={summaryValueStyle}>{selectedCompetitors.length}</p>
              </div>
              <div style={summaryTileStyle}>
                <p style={summaryLabelStyle}>Sporringer</p>
                <p style={summaryValueStyle}>{activeQueries.length}</p>
              </div>
            </div>

            <div style={{ ...summaryTileStyle, marginBottom: 14 }}>
              <p style={summaryLabelStyle}>Utvalgte konkurrenter</p>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--text-primary)" }}>
                {selectedCompetitors.map((item) => item.name).join(", ")}
              </p>
            </div>

            <div style={{ ...summaryTileStyle, marginBottom: 16 }}>
              <p style={summaryLabelStyle}>Aktive sporringer</p>
              <div style={{ marginTop: 6, display: "grid", gap: 6 }}>
                {activeQueries.slice(0, 8).map((item) => (
                  <p key={item.id} style={{ margin: 0, fontSize: 13, color: "var(--text-primary)" }}>
                    • {item.text}
                  </p>
                ))}
              </div>
            </div>

            <button onClick={launchMonitoring} style={primaryButtonStyle} disabled={launching}>
              {launching ? "Starter..." : "Start overvaking"}
            </button>
            {runError && (
              <p style={{ marginTop: 10, marginBottom: 0, fontSize: 13, color: "#fda4af" }}>{runError}</p>
            )}
          </div>
        )}

        {activeStep === 4 && (
          <div style={{ ...cardStyle, padding: 20 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 550 }}>Forste kjoring paagar</h2>
            <p style={{ margin: "6px 0 14px", fontSize: 13, color: "var(--text-secondary)" }}>
              Jobb ID: {jobId}
            </p>

            <ProgressBar
              completed={jobState?.progress?.completed_queries || 0}
              total={jobState?.progress?.total_queries || activeQueries.length}
              failed={jobState?.progress?.failed_queries || 0}
            />

            <div style={{ marginTop: 16, ...summaryTileStyle }}>
              <p style={summaryLabelStyle}>Status</p>
              <p style={summaryValueStyle}>{jobState?.status || "queued"}</p>
              {jobState?.progress?.current_query && (
                <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--text-secondary)" }}>
                  Aktiv sporring: {jobState.progress.current_query}
                </p>
              )}
            </div>

            <div style={{ marginTop: 12, ...summaryTileStyle }}>
              <p style={summaryLabelStyle}>Delvise toppaktorer</p>
              {!jobState?.partial_top_entities?.length && (
                <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>
                  Ingen funn enda.
                </p>
              )}
              {(jobState?.partial_top_entities || []).slice(0, 8).map((item, idx) => (
                <p key={`${item.platform}-${item.entity}-${idx}`} style={{ margin: "6px 0 0", fontSize: 13 }}>
                  #{item.position || "-"} {item.entity} <span style={{ color: "var(--text-secondary)" }}>({item.platform})</span>
                </p>
              ))}
            </div>

            {runError && (
              <p style={{ marginTop: 12, marginBottom: 0, fontSize: 13, color: "#fda4af" }}>{runError}</p>
            )}
          </div>
        )}

        {activeStep < 4 && (
          <div className="flex items-center justify-between" style={{ marginTop: 16, gap: 10 }}>
            <button
              onClick={goBack}
              style={secondaryButtonStyle}
              disabled={activeStep === 0}
            >
              Tilbake
            </button>
            <button
              onClick={goNext}
              style={primaryButtonStyle}
              disabled={
                (activeStep === 0 && !canProceedFromProfile) ||
                (activeStep === 1 && !canProceedFromCompetitors) ||
                (activeStep === 2 && !canProceedFromQueries)
              }
            >
              Neste
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  borderRadius: 10,
  border: "1px solid var(--border-primary)",
  backgroundColor: "rgba(0,0,0,0.25)",
  color: "var(--text-primary)",
  padding: "10px 12px",
  fontSize: 14,
  outline: "none",
};

const primaryButtonStyle = {
  borderRadius: 10,
  border: "1px solid rgba(45,212,191,0.75)",
  background: "linear-gradient(90deg, rgba(20,184,166,0.85) 0%, rgba(6,182,212,0.85) 100%)",
  color: "#fff",
  fontWeight: 550,
  fontSize: 14,
  padding: "10px 16px",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  borderRadius: 10,
  border: "1px solid var(--border-primary)",
  backgroundColor: "var(--bg-input)",
  color: "var(--text-primary)",
  fontWeight: 500,
  fontSize: 13,
  padding: "10px 14px",
  cursor: "pointer",
};

const chipStyle = {
  borderRadius: 999,
  border: "1px solid rgba(34,211,238,0.45)",
  backgroundColor: "rgba(34,211,238,0.14)",
  color: "#67e8f9",
  padding: "2px 8px",
  fontSize: 11,
};

const chipStyleMuted = {
  borderRadius: 999,
  border: "1px solid var(--border-primary)",
  backgroundColor: "var(--bg-input)",
  color: "var(--text-secondary)",
  padding: "2px 8px",
  fontSize: 11,
};

const summaryTileStyle = {
  borderRadius: 12,
  border: "1px solid var(--border-primary)",
  backgroundColor: "var(--bg-card-inner)",
  padding: "10px 12px",
};

const summaryLabelStyle = {
  margin: 0,
  fontSize: 11,
  color: "var(--text-secondary)",
  letterSpacing: "0.05em",
  textTransform: "uppercase",
};

const summaryValueStyle = {
  margin: "6px 0 0",
  fontSize: 15,
  color: "var(--text-primary)",
  fontWeight: 540,
};
