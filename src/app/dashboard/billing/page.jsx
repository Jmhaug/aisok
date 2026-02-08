"use client";

import { Check, Sparkles, CreditCard, ArrowRight } from "lucide-react";
import { subscriptionTiers } from "@/lib/mock-data";

export default function BillingPage() {
  const currentPlan = "pro";

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1400 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: "#fff", margin: 0, marginBottom: 6 }}>
          Abonnement
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", margin: 0 }}>
          Administrer ditt abonnement og fakturering
        </p>
      </div>

      {/* Current plan banner */}
      <div
        style={{
          padding: "20px 24px",
          borderRadius: 14,
          border: "1px solid rgba(167,139,250,0.3)",
          background: "linear-gradient(135deg, rgba(167,139,250,0.08) 0%, rgba(124,58,237,0.04) 100%)",
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
              background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>
              Nåværende plan: Pro
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
              5 merkevarer · 500 spørringer/måned · 3 brukere
            </div>
          </div>
        </div>
        <div className="flex items-center" style={{ gap: 12 }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>
            2 490 <span style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.4)" }}>NOK/mnd</span>
          </span>
        </div>
      </div>

      {/* Plans grid */}
      <h2 style={{ fontSize: 18, fontWeight: 600, color: "#fff", margin: 0, marginBottom: 20 }}>
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
                border: `1px solid ${isCurrent ? "rgba(167,139,250,0.4)" : isPopular ? "rgba(167,139,250,0.25)" : "rgba(255,255,255,0.08)"}`,
                backgroundColor: isCurrent ? "rgba(167,139,250,0.06)" : "rgba(255,255,255,0.03)",
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
                    background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
                    color: "#fff",
                    letterSpacing: "0.05em",
                  }}
                >
                  POPULÆR
                </span>
              )}

              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: "#fff", margin: 0, marginBottom: 8 }}>
                  {tier.name}
                </h3>
                <div>
                  {tier.price ? (
                    <>
                      <span style={{ fontSize: 32, fontWeight: 700, color: "#fff" }}>
                        {tier.price.toLocaleString("nb-NO")}
                      </span>
                      <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginLeft: 4 }}>
                        {tier.currency}/{tier.period}
                      </span>
                    </>
                  ) : (
                    <span style={{ fontSize: 18, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>
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
                    <Check size={16} color="#a78bfa" style={{ flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>
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
                  border: isCurrent ? "1px solid rgba(167,139,250,0.3)" : "none",
                  background: isCurrent ? "transparent" : "linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)",
                  color: "#fff",
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
          border: "1px solid rgba(255,255,255,0.08)",
          backgroundColor: "rgba(255,255,255,0.03)",
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff", margin: 0, marginBottom: 16 }}>
          Betalingsmetode
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center" style={{ gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 30,
                borderRadius: 6,
                backgroundColor: "rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CreditCard size={18} color="rgba(255,255,255,0.5)" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>•••• •••• •••• 4242</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Utløper 12/2027</div>
            </div>
          </div>
          <button
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.15)",
              backgroundColor: "transparent",
              color: "rgba(255,255,255,0.7)",
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
