"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import Link from "next/link";
import HlsVideo from "./HlsVideo";

const VIDEO_SRC =
  "https://customer-cbeadsgr09pnsezs.cloudflarestream.com/c9ddd33ac3d964e5d33b31ce849e8f95/manifest/video.m3u8";

const navLinks = ["Funksjoner", "Tjenester", "Om oss", "Team", "FAQ", "Kontakt"];

const features = [
  { icon: "radar", label: "Merkevareovervåking" },
  { icon: "bot", label: "AI-plattformsporing (ChatGPT, Perplexity)" },
  { icon: "at", label: "Deteksjon av merkevareomtaler" },
  { icon: "link", label: "Siteringssporing" },
  { icon: "chart", label: "Synlighetspoengberegning" },
];

/* ── Icons ── */

function ArrowRight({ size = 18, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      className={`ml-2.5 inline-block ${className}`}
    >
      <path
        d="M4 9H14M14 9L10 5M14 9L10 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LgpsmLogo() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" className="mr-3 shrink-0">
      <circle cx="22" cy="22" r="20" stroke="white" strokeWidth="1.8" />
      <path d="M15 22C15 18.134 18.134 15 22 15" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M29 22C29 25.866 25.866 29 22 29" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M22 15C25.866 15 29 18.134 29 22" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M22 29C18.134 29 15 25.866 15 22" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="22" cy="22" r="2.5" fill="white" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="mr-2 shrink-0">
      <path d="M8 1L9.5 6.5L15 8L9.5 9.5L8 15L6.5 9.5L1 8L6.5 6.5L8 1Z" fill="white" opacity="0.85" />
    </svg>
  );
}

function PaperclipIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05L12.25 20.24C10.45 22.04 7.53 22.04 5.73 20.24C3.93 18.44 3.93 15.52 5.73 13.72L14.92 4.53C16.12 3.33 18.04 3.33 19.24 4.53C20.44 5.73 20.44 7.65 19.24 8.85L10.05 18.04C9.45 18.64 8.49 18.64 7.89 18.04C7.29 17.44 7.29 16.48 7.89 15.88L16.28 7.49" />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function SendIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.2s" }}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function FeatureIcon({ type }) {
  const s = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" };
  switch (type) {
    case "radar":
      return <svg {...s}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>;
    case "bot":
      return <svg {...s}><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="9" cy="16" r="1" /><circle cx="15" cy="16" r="1" /><path d="M12 3v4" /><path d="M8 7h8" /></svg>;
    case "at":
      return <svg {...s}><circle cx="12" cy="12" r="4" /><path d="M16 12v1a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" /></svg>;
    case "link":
      return <svg {...s}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>;
    case "chart":
      return <svg {...s}><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" /></svg>;
    default:
      return null;
  }
}

/* ── Component ── */

export default function Hero() {
  const [url, setUrl] = useState("");
  const router = useRouter();

  function handleAnalyze(e) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;
    localStorage.setItem("lgpsm_analyze_query", trimmed);
    router.push("/sign-up");
  }

  return (
    <section className="relative w-full overflow-hidden bg-black" style={{ minHeight: "100vh" }}>
      {/* Background Video */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <HlsVideo
          src={VIDEO_SRC}
          className="h-full w-full scale-150 object-cover object-left-top origin-top-left opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
      </div>

      {/* ──────────────── Navbar ──────────────── */}
      <nav className="relative z-50 w-full">
        <div
          className="mx-auto flex items-center justify-between"
          style={{ maxWidth: 1400, paddingLeft: 48, paddingRight: 48, paddingTop: 20, paddingBottom: 20 }}
        >
          <motion.a
            href="#"
            className="flex items-center text-white no-underline"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <LgpsmLogo />
            <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: "0.04em" }}>LGPSM</span>
            <span style={{ fontSize: 8, position: "relative", top: -8, marginLeft: 2 }}>®</span>
          </motion.a>

          <motion.div
            className="hidden lg:flex items-center"
            style={{ gap: 40 }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          >
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="no-underline transition-colors duration-200"
                style={{ fontSize: 15, color: "rgba(255,255,255,0.85)" }}
                onMouseEnter={(e) => (e.target.style.color = "#fff")}
                onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.85)")}
              >
                {link}
              </a>
            ))}
          </motion.div>

          <motion.div
            className="flex items-center"
            style={{ gap: 12 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          >
            <Link
              href="/sign-in"
              className="no-underline transition-all duration-200"
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.85)",
                paddingLeft: 20,
                paddingRight: 20,
                paddingTop: 12,
                paddingBottom: 12,
              }}
            >
              Logg inn
            </Link>
            <Link
              href="/sign-up"
              className="group inline-flex items-center no-underline transition-all duration-200"
              style={{
                borderRadius: 9999,
                border: "1px solid rgba(255,255,255,0.25)",
                backgroundColor: "transparent",
                paddingLeft: 28,
                paddingRight: 28,
                paddingTop: 12,
                paddingBottom: 12,
                fontSize: 15,
                color: "#fff",
              }}
            >
              Kom i gang
              <ArrowRight />
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* ──────────────── Hero Content (CENTERED) ──────────────── */}
      <div
        className="relative z-10 mx-auto flex flex-col items-center"
        style={{ maxWidth: 1400, paddingLeft: 48, paddingRight: 48, paddingTop: 80, paddingBottom: 80 }}
      >
        {/* Tag pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          style={{ marginBottom: 32 }}
        >
          <span
            className="inline-flex items-center"
            style={{
              borderRadius: 9999,
              border: "1px solid rgba(255,255,255,0.12)",
              backgroundColor: "rgba(255,255,255,0.05)",
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 10,
              paddingBottom: 10,
              fontSize: 14,
              color: "#fff",
            }}
          >
            <SparkleIcon />
            Ny AI-automatiseringspartner
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="font-sans"
          style={{
            maxWidth: 820,
            fontSize: 80,
            fontWeight: 400,
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            color: "#fff",
            margin: 0,
            textAlign: "center",
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
        >
          Lås opp kraften i AI
          <br />
          for din{" "}
          <span className="font-serif" style={{ fontStyle: "italic", color: "rgba(255,255,255,0.8)" }}>
            Bedrift.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          style={{
            marginTop: 28,
            maxWidth: 580,
            fontSize: 17,
            lineHeight: 1.7,
            color: "rgba(255,255,255,0.45)",
            textAlign: "center",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55, ease: "easeOut" }}
        >
          Vår banebrytende AI-plattform automatiserer, analyserer og akselererer
          arbeidsflyten din, slik at du kan fokusere på det som virkelig betyr noe.
        </motion.p>

        {/* Try for free */}
        <motion.p
          style={{
            marginTop: 24,
            fontSize: 13,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.04em",
            textAlign: "center",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.65, ease: "easeOut" }}
        >
          Prøv gratis — ingen kredittkort nødvendig
        </motion.p>

        {/* ──────── Chat Input Bar ──────── */}
        <motion.div
          style={{
            marginTop: 44,
            width: "100%",
            maxWidth: 720,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.85, ease: "easeOut" }}
        >
          <form
            onSubmit={handleAnalyze}
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              padding: "18px 20px",
            }}
          >
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Skriv inn merkevarenavn, nettadresse eller søk..."
              style={{
                width: "100%",
                fontSize: 15,
                color: "#fff",
                backgroundColor: "transparent",
                border: "none",
                outline: "none",
                margin: 0,
                marginBottom: 16,
              }}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center" style={{ gap: 8 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <PaperclipIcon />
                </div>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: "rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <WrenchIcon />
                </div>
              </div>
              <div className="flex items-center" style={{ gap: 8 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <MicIcon />
                </div>
                <button
                  type="submit"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    backgroundColor: url.trim() ? "rgba(255,255,255,0.15)" : "transparent",
                    border: "none",
                    transition: "background-color 0.2s",
                  }}
                >
                  <SendIcon active={!!url.trim()} />
                </button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* ──────── Feature Pills ──────── */}
        <motion.div
          className="flex flex-wrap items-center justify-center"
          style={{ marginTop: 24, gap: 10 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1, ease: "easeOut" }}
        >
          {features.map((f) => (
            <span
              key={f.label}
              className="inline-flex items-center"
              style={{
                borderRadius: 9999,
                border: "1px solid rgba(255,255,255,0.1)",
                backgroundColor: "rgba(255,255,255,0.04)",
                paddingLeft: 16,
                paddingRight: 18,
                paddingTop: 9,
                paddingBottom: 9,
                gap: 8,
                fontSize: 13,
                fontWeight: 500,
                color: "rgba(255,255,255,0.6)",
                whiteSpace: "nowrap",
              }}
            >
              <FeatureIcon type={f.icon} />
              {f.label}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
