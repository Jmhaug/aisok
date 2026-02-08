"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function ScoreRing({ score }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#4ade80" : score >= 40 ? "#fbbf24" : "#f87171";

  return (
    <div style={{ position: "relative", width: 140, height: 140 }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset 1.5s ease" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 36, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>av 100</span>
      </div>
    </div>
  );
}

export default function FreeAnalysis() {
  const [step, setStep] = useState("form"); // form | loading | result | error
  const [email, setEmail] = useState("");
  const [input, setInput] = useState("");
  const [inputType, setInputType] = useState("url"); // url | prompt
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !input) return;

    setStep("loading");
    setError("");

    try {
      const body = { email };
      if (inputType === "url") {
        body.url = input;
      } else {
        body.prompt = input;
      }

      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await resp.json();

      if (!resp.ok) {
        setError(data.error || "Noe gikk galt. Prøv igjen.");
        setStep("error");
        return;
      }

      setResult(data);
      setStep("result");
    } catch {
      setError("Kunne ikke koble til tjenesten. Prøv igjen senere.");
      setStep("error");
    }
  }

  return (
    <section id="free-analysis" style={{ backgroundColor: "#000", width: "100%" }}>
      <div
        className="mx-auto"
        style={{ maxWidth: 1400, paddingLeft: 48, paddingRight: 48, paddingTop: 80, paddingBottom: 100 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{ textAlign: "center", marginBottom: 48 }}
        >
          <h2
            className="font-sans"
            style={{
              fontSize: 48,
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "#fff",
              margin: 0,
              marginBottom: 16,
            }}
          >
            Gratis AI-synlighetsanalyse
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", margin: 0, maxWidth: 520, marginInline: "auto" }}>
            Sjekk hvor synlig merkevaren din er i AI-søkemotorer som ChatGPT og Perplexity.
            Helt gratis — ingen forpliktelser.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          style={{
            maxWidth: 640,
            marginInline: "auto",
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.1)",
            backgroundColor: "rgba(255,255,255,0.03)",
            padding: 32,
          }}
        >
          <AnimatePresence mode="wait">
            {/* ─── Form ─── */}
            {step === "form" && (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
              >
                {/* Input type toggle */}
                <div className="flex items-center" style={{ gap: 8, marginBottom: 20 }}>
                  {[
                    { key: "url", label: "Nettside-URL" },
                    { key: "prompt", label: "Merkevarenavn / søk" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => { setInputType(opt.key); setInput(""); }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 8,
                        border: "1px solid",
                        borderColor: inputType === opt.key ? "rgba(167,139,250,0.4)" : "rgba(255,255,255,0.1)",
                        backgroundColor: inputType === opt.key ? "rgba(167,139,250,0.12)" : "transparent",
                        color: inputType === opt.key ? "#a78bfa" : "rgba(255,255,255,0.5)",
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* URL or prompt input */}
                <input
                  type={inputType === "url" ? "url" : "text"}
                  placeholder={inputType === "url" ? "https://ditt-nettsted.no" : "F.eks. DNB, SpareBank 1, ditt firmanavn..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.12)",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    color: "#fff",
                    fontSize: 15,
                    outline: "none",
                    marginBottom: 12,
                  }}
                />

                {/* Email input */}
                <input
                  type="email"
                  placeholder="din@epost.no"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.12)",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    color: "#fff",
                    fontSize: 15,
                    outline: "none",
                    marginBottom: 20,
                  }}
                />

                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "14px 28px",
                    borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)",
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Kjør gratis analyse
                </button>

                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textAlign: "center", marginTop: 12, margin: "12px 0 0" }}>
                  1 gratis analyse per e-postadresse. Resultater sendes også til din e-post.
                </p>
              </motion.form>
            )}

            {/* ─── Loading ─── */}
            {step === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ textAlign: "center", padding: "40px 0" }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    border: "3px solid rgba(255,255,255,0.1)",
                    borderTopColor: "#a78bfa",
                    borderRadius: 9999,
                    margin: "0 auto 24px",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <p style={{ fontSize: 16, color: "#fff", fontWeight: 500, margin: 0, marginBottom: 8 }}>
                  Analyserer AI-synlighet...
                </p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: 0 }}>
                  Spør ChatGPT og Perplexity om merkevaren din. Dette tar ca. 30-60 sekunder.
                </p>
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
              </motion.div>
            )}

            {/* ─── Result ─── */}
            {step === "result" && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between" style={{ marginBottom: 28 }}>
                  <div>
                    <h3 style={{ fontSize: 22, fontWeight: 600, color: "#fff", margin: 0, marginBottom: 4 }}>
                      {result.brand_name}
                    </h3>
                    {result.domain && (
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: 0 }}>{result.domain}</p>
                    )}
                  </div>
                  <ScoreRing score={Math.round(result.visibility_score)} />
                </div>

                {/* Summary */}
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.65, margin: 0, marginBottom: 24 }}>
                  {result.summary}
                </p>

                {/* Platform scores */}
                <div className="flex" style={{ gap: 12, marginBottom: 24 }}>
                  {result.platform_scores.map((ps) => (
                    <div
                      key={ps.platform}
                      style={{
                        flex: 1,
                        padding: "16px",
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.08)",
                        backgroundColor: "rgba(255,255,255,0.03)",
                      }}
                    >
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
                        {ps.platform}
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
                        {Math.round(ps.score)}
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                        {ps.mentions_found}/{ps.total_queries} omtaler · {ps.citations} siteringer
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                <div style={{ marginBottom: 24 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: 0, marginBottom: 12 }}>
                    Anbefalinger
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {result.recommendations.map((rec, i) => (
                      <div key={i} className="flex" style={{ gap: 10 }}>
                        <span style={{ color: "#a78bfa", flexShrink: 0, marginTop: 2 }}>
                          <CheckIcon />
                        </span>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, margin: 0 }}>
                          {rec}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <a
                  href="/sign-up"
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "14px 28px",
                    borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)",
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 600,
                    textAlign: "center",
                    textDecoration: "none",
                  }}
                >
                  Opprett konto for løpende overvåking
                </a>
              </motion.div>
            )}

            {/* ─── Error ─── */}
            {step === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ textAlign: "center", padding: "24px 0" }}
              >
                <p style={{ fontSize: 15, color: "#f87171", margin: 0, marginBottom: 16 }}>
                  {error}
                </p>
                <button
                  onClick={() => setStep("form")}
                  style={{
                    padding: "10px 24px",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.15)",
                    backgroundColor: "transparent",
                    color: "#fff",
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  Prøv igjen
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
