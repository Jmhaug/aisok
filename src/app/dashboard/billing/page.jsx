"use client";

import { Check, Sparkles, CreditCard, ArrowRight } from "lucide-react";
import { subscriptionTiers } from "@/lib/mock-data";

export default function BillingPage() {
  const currentPlan = "pro";

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1400 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: "var(--text-primary)", margin: 0, marginBottom: 6 }}>
          Abonnement
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-tertiary)", margin: 0 }}>
          Administrer ditt abonnement og fakturering
        </p>
      </div>

      {/* Current plan banner */}
      <div
        style={{
          padding: "20px 24px",
          borderRadius: 14,
          border: "1px solid var(--accent-bg-hover)",
          background: "var(--accent-bg)",
          marginBottom: 32,
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
              background: "var(--accent-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>
              Nåværende plan: Pro
            </div>
            <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
              5 merkevarer · 500 spørringer/måned · 3 brukere
            </div>
          </div>
        </div>
        <div className="flex items-center" style={{ gap: 12 }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>
            2 490 <span style={{ fontSize: 14, fontWeight: 400, color: "var(--text-tertiary)" }}>NOK/mnd</span>
          </span>
        </div>
      </div>

      {/* Plans grid */}
      <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", margin: 0, marginBottom: 20 }}>
        Tilgjengelige planer
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {subscriptionTiers.map((tier) => {
          const isCurrent = tier.id === currentPlan;
          const isPopular = tier.popular;

          return (
            <div
              key={tier.id}
              style={{
                padding: "24px",
                borderRadius: 14,
                border: `1px solid ${isCurrent ? "var(--accent-bg-hover)" : isPopular ? "var(--accent-bg-hover)" : "var(--border-primary)"}`,
                backgroundColor: isCurrent ? "var(--accent-bg)" : "var(--bg-card)",
                position: "relative",
              }}
            >
              {isPopular && (
                <span
                  style={{
                    position: "absolute",
                    top: -10,
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 12px",
                    borderRadius: 6,
                    background: "var(--accent-gradient)",
                    color: "#fff",
                    letterSpacing: "0.05em",
                  }}
                >
                  POPULÆR
                </span>
              )}

              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", margin: 0, marginBottom: 8 }}>
                  {tier.name}
                </h3>
                <div>
                  {tier.price ? (
                    <>
                      <span style={{ fontSize: 32, fontWeight: 700, color: "var(--text-primary)" }}>
                        {tier.price.toLocaleString("nb-NO")}
                      </span>
                      <span style={{ fontSize: 14, color: "var(--text-tertiary)", marginLeft: 4 }}>
                        {tier.currency}/{tier.period}
                      </span>
                    </>
                  ) : (
                    <span style={{ fontSize: 18, fontWeight: 500, color: "var(--text-secondary)" }}>
                      Kontakt oss
                    </span>
                  )}
                </div>
              </div>

              <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: 24 }}>
                {tier.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start"
                    style={{ gap: 8, marginBottom: 10 }}
                  >
                    <Check size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                style={{
                  width: "100%",
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: isCurrent ? "1px solid var(--accent-bg-hover)" : "none",
                  background: isCurrent ? "transparent" : "var(--accent-gradient)",
                  color: isCurrent ? "var(--text-primary)" : "#fff",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: isCurrent ? "default" : "pointer",
                  opacity: isCurrent ? 0.6 : 1,
                }}
                disabled={isCurrent}
              >
                {isCurrent ? "Nåværende plan" : tier.price ? "Oppgrader" : "Kontakt salg"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Payment method */}
      <div
        style={{
          padding: "24px",
          borderRadius: 14,
          border: "1px solid var(--border-primary)",
          backgroundColor: "var(--bg-card)",
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: 0, marginBottom: 16 }}>
          Betalingsmetode
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center" style={{ gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 30,
                borderRadius: 6,
                backgroundColor: "var(--border-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CreditCard size={18} color="var(--text-secondary)" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>•••• •••• •••• 4242</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Utløper 12/2027</div>
            </div>
          </div>
          <button
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid var(--border-primary)",
              backgroundColor: "transparent",
              color: "var(--text-secondary)",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Endre
          </button>
        </div>
      </div>
    </div>
  );
}
