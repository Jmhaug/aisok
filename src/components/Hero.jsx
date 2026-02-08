import { motion } from "motion/react";
import HlsVideo from "./HlsVideo";

const VIDEO_SRC =
  "https://customer-cbeadsgr09pnsezs.cloudflarestream.com/c9ddd33ac3d964e5d33b31ce849e8f95/manifest/video.m3u8";

const navLinks = ["Features", "Services", "About", "Team", "FAQ", "Contact"];

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
    <svg
      width="44"
      height="44"
      viewBox="0 0 44 44"
      fill="none"
      className="mr-3 shrink-0"
    >
      <circle cx="22" cy="22" r="20" stroke="white" strokeWidth="1.8" />
      <path
        d="M15 22C15 18.134 18.134 15 22 15"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M29 22C29 25.866 25.866 29 22 29"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M22 15C25.866 15 29 18.134 29 22"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M22 29C18.134 29 15 25.866 15 22"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="22" cy="22" r="2.5" fill="white" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      className="mr-2 shrink-0"
    >
      <path
        d="M8 1L9.5 6.5L15 8L9.5 9.5L8 15L6.5 9.5L1 8L6.5 6.5L8 1Z"
        fill="white"
        opacity="0.85"
      />
    </svg>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Background Video — UNTOUCHED */}
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
          {/* Logo */}
          <motion.a
            href="#"
            className="flex items-center text-white no-underline"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <LgpsmLogo />
            <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: "0.04em" }}>
              LGPSM
            </span>
            <span style={{ fontSize: 8, position: "relative", top: -8, marginLeft: 2 }}>®</span>
          </motion.a>

          {/* Center Nav Links */}
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

          {/* Get Started Button */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          >
            <a
              href="#get-started"
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
              Get Started
              <ArrowRight />
            </a>
          </motion.div>
        </div>
      </nav>

      {/* ──────────────── Hero Content ──────────────── */}
      <div
        className="relative z-10 mx-auto flex flex-col justify-center"
        style={{ maxWidth: 1400, paddingLeft: 48, paddingRight: 48, minHeight: "calc(100vh - 84px)" }}
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
            New AI Automation Ally
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="font-sans"
          style={{
            maxWidth: 780,
            fontSize: 80,
            fontWeight: 400,
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            color: "#fff",
            margin: 0,
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
        >
          Unlock the Power of AI
          <br />
          for Your{" "}
          <span className="font-serif" style={{ fontStyle: "italic", color: "rgba(255,255,255,0.8)" }}>
            Business.
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
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55, ease: "easeOut" }}
        >
          Our cutting-edge AI platform automates, analyzes, and accelerates
          your workflows so you can focus on what really matters.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex items-center"
          style={{ marginTop: 40, gap: 16 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
        >
          <a
            href="#book"
            className="group inline-flex items-center no-underline transition-all duration-200 hover:opacity-90"
            style={{
              borderRadius: 9999,
              backgroundColor: "#fff",
              paddingLeft: 32,
              paddingRight: 28,
              paddingTop: 16,
              paddingBottom: 16,
              fontSize: 15,
              fontWeight: 500,
              color: "#000",
            }}
          >
            Book A Free Call
            <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>
          <a
            href="#learn"
            className="inline-flex items-center no-underline transition-all duration-200 hover:opacity-80"
            style={{
              borderRadius: 9999,
              backgroundColor: "rgba(255,255,255,0.1)",
              paddingLeft: 32,
              paddingRight: 32,
              paddingTop: 16,
              paddingBottom: 16,
              fontSize: 15,
              color: "#fff",
            }}
          >
            Learn now
          </a>
        </motion.div>
      </div>
    </section>
  );
}
