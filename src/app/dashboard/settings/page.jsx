"use client";

import {
  Building,
  Users,
  Globe,
  Bell,
  Key,
  Shield,
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div style={{ padding: "32px 40px", maxWidth: 900 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: "#fff", margin: 0, marginBottom: 6 }}>
          Innstillinger
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", margin: 0 }}>
          Administrer arbeidsområde og kontoinnstillinger
        </p>
      </div>

      {/* Workspace settings */}
      <div
        style={{
          padding: "24px",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.08)",
          backgroundColor: "rgba(255,255,255,0.03)",
          marginBottom: 16,
        }}
      >
        <div className="flex items-center" style={{ gap: 12, marginBottom: 24 }}>
          <Building size={20} color="#a78bfa" />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#fff", margin: 0 }}>Arbeidsområde</h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>
              Arbeidsområdenavn
            </label>
            <input
              type="text"
              defaultValue="Norske Banker AS"
              style={{
                width: "100%",
                maxWidth: 400,
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.1)",
                backgroundColor: "rgba(255,255,255,0.04)",
                color: "#fff",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>
              Standard språk
            </label>
            <select
              defaultValue="nb"
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.1)",
                backgroundColor: "rgba(255,255,255,0.04)",
                color: "#fff",
                fontSize: 14,
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="nb">Norsk (Bokmål)</option>
              <option value="nn">Norsk (Nynorsk)</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* Team members */}
      <div
        style={{
          padding: "24px",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.08)",
          backgroundColor: "rgba(255,255,255,0.03)",
          marginBottom: 16,
        }}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
          <div className="flex items-center" style={{ gap: 12 }}>
            <Users size={20} color="#a78bfa" />
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#fff", margin: 0 }}>Teammedlemmer</h2>
          </div>
          <button
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Inviter medlem
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { name: "James Haugen", email: "james@lgpsm.no", role: "Admin" },
            { name: "Kari Nordmann", email: "kari@lgpsm.no", role: "Redaktør" },
            { name: "Ola Nordmann", email: "ola@lgpsm.no", role: "Leser" },
          ].map((member) => (
            <div
              key={member.email}
              className="flex items-center justify-between"
              style={{
                padding: "14px 16px",
                borderRadius: 10,
                backgroundColor: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div className="flex items-center" style={{ gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9999,
                    background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#fff",
                  }}
                >
                  {member.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>{member.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{member.email}</div>
                </div>
              </div>
              <span
                style={{
                  fontSize: 12,
                  padding: "4px 10px",
                  borderRadius: 6,
                  backgroundColor: member.role === "Admin" ? "rgba(167,139,250,0.12)" : "rgba(255,255,255,0.06)",
                  color: member.role === "Admin" ? "#a78bfa" : "rgba(255,255,255,0.5)",
                  fontWeight: 500,
                }}
              >
                {member.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div
        style={{
          padding: "24px",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.08)",
          backgroundColor: "rgba(255,255,255,0.03)",
          marginBottom: 16,
        }}
      >
        <div className="flex items-center" style={{ gap: 12, marginBottom: 24 }}>
          <Bell size={20} color="#a78bfa" />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#fff", margin: 0 }}>Varsler</h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "Ukentlig synlighetsrapport", description: "Motta ukentlig oppsummering per e-post", enabled: true },
            { label: "Nye omtaler", description: "Varsel når merkevaren din blir nevnt i AI-søk", enabled: true },
            { label: "Synlighetsendringer", description: "Varsel ved betydelige endringer i synlighetspoeng", enabled: false },
          ].map((notif) => (
            <div key={notif.label} className="flex items-center justify-between">
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#fff", marginBottom: 2 }}>{notif.label}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{notif.description}</div>
              </div>
              <div
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: notif.enabled ? "#7c3aed" : "rgba(255,255,255,0.1)",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background-color 0.2s ease",
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: "#fff",
                    position: "absolute",
                    top: 3,
                    left: notif.enabled ? 23 : 3,
                    transition: "left 0.2s ease",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Keys */}
      <div
        style={{
          padding: "24px",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.08)",
          backgroundColor: "rgba(255,255,255,0.03)",
        }}
      >
        <div className="flex items-center" style={{ gap: 12, marginBottom: 24 }}>
          <Key size={20} color="#a78bfa" />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#fff", margin: 0 }}>API-nøkler</h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { name: "Perplexity Sonar API", status: "konfigurert", key: "pplx_•••••••abc" },
            { name: "OpenAI Web Search API", status: "konfigurert", key: "sk_•••••••xyz" },
            { name: "Resend E-post", status: "ikke konfigurert", key: null },
          ].map((api) => (
            <div
              key={api.name}
              className="flex items-center justify-between"
              style={{
                padding: "14px 16px",
                borderRadius: 10,
                backgroundColor: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div className="flex items-center" style={{ gap: 12 }}>
                <Shield size={16} color="rgba(255,255,255,0.4)" />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>{api.name}</div>
                  {api.key && (
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>{api.key}</div>
                  )}
                </div>
              </div>
              <span
                style={{
                  fontSize: 12,
                  padding: "4px 10px",
                  borderRadius: 6,
                  backgroundColor: api.status === "konfigurert" ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.06)",
                  color: api.status === "konfigurert" ? "#4ade80" : "rgba(255,255,255,0.4)",
                  fontWeight: 500,
                }}
              >
                {api.status === "konfigurert" ? "Konfigurert" : "Ikke konfigurert"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
