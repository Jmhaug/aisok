"use client";

import { motion } from "motion/react";

/* ── Icons ── */

function SparkleSmall() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 1L9.5 6.5L15 8L9.5 9.5L8 15L6.5 9.5L1 8L6.5 6.5L8 1Z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}

function TaskIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10H21" />
      <path d="M8 2V6" />
      <path d="M16 2V6" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" />
      <path d="M2 17L12 22L22 17" />
      <path d="M2 12L12 17L22 12" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" />
      <path d="M14 2V8H20" />
      <path d="M8 13H16" />
      <path d="M8 17H16" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2V6" />
      <path d="M8 2V6" />
      <path d="M3 10H21" />
      <path d="M8 14H8.01" />
      <path d="M12 14H12.01" />
      <path d="M16 14H16.01" />
      <path d="M8 18H8.01" />
      <path d="M12 18H12.01" />
    </svg>
  );
}

function ChevronRightCircle() {
  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 9999,
        border: "1px solid rgba(255,255,255,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        cursor: "pointer",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M6 3L11 8L6 13"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/* ── Feature Item ── */

function FeatureItem({ icon, title, description }) {
  return (
    <div style={{ flex: 1 }}>
      <div className="flex items-center" style={{ gap: 10, marginBottom: 16 }}>
        <span style={{ color: "rgba(255,255,255,0.7)" }}>{icon}</span>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{title}</span>
      </div>
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.7,
          color: "rgba(255,255,255,0.38)",
          margin: 0,
        }}
      >
        {description}
      </p>
    </div>
  );
}

/* ── Image Card ── */

function ImageCard({ gradient, title, subtitle }) {
  return (
    <div style={{ width: "100%", maxWidth: 420 }}>
      <div
        style={{
          width: "100%",
          height: 340,
          borderRadius: 16,
          overflow: "hidden",
          background: gradient,
        }}
      />
      <div
        className="flex items-end justify-between"
        style={{ paddingTop: 20, paddingBottom: 4 }}
      >
        <div>
          <h4 style={{ fontSize: 16, fontWeight: 600, color: "#fff", margin: 0, marginBottom: 4 }}>
            {title}
          </h4>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: 0 }}>
            {subtitle}
          </p>
        </div>
        <ChevronRightCircle />
      </div>
    </div>
  );
}

/* ── Main Section ── */

export default function Features() {
  return (
    <section style={{ backgroundColor: "#000", width: "100%" }}>
      <div
        className="mx-auto"
        style={{ maxWidth: 1400, paddingLeft: 48, paddingRight: 48, paddingTop: 80, paddingBottom: 100 }}
      >
        {/* ════════ Row 1: Image Left, Text Right ════════ */}
        <motion.div
          className="flex items-start"
          style={{ gap: 80 }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div style={{ flexShrink: 0, width: 420 }}>
            <ImageCard
              gradient="radial-gradient(ellipse at 50% 45%, rgba(160,100,255,0.7) 0%, rgba(100,40,200,0.5) 35%, rgba(20,5,40,0.95) 70%, #0a0a0a 100%)"
              title="Real-Time Intelligence"
              subtitle="Lorem ipsum dolor sit amet"
            />
          </div>

          <div style={{ flex: 1, paddingTop: 10 }}>
            <div className="flex items-center" style={{ gap: 8, marginBottom: 14 }}>
              <span style={{ color: "#a78bfa" }}><SparkleSmall /></span>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#a78bfa" }}>Workflow Automation</span>
            </div>

            <h2
              className="font-sans"
              style={{
                fontSize: 44,
                fontWeight: 500,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                color: "#fff",
                margin: 0,
                marginBottom: 40,
              }}
            >
              Workflow Automation
              <br />
              Made Simple!
            </h2>

            <div className="flex" style={{ gap: 48 }}>
              <FeatureItem
                icon={<TaskIcon />}
                title="Internal Task Bots"
                description="Our internal task bots take care of those boring, repetitive jobs for you. They handle everything from data entry to approvals."
              />
              <FeatureItem
                icon={<LayersIcon />}
                title="100+ Automations"
                description="With over 100 automations, you can customize your workflow to fit your needs. Just set it up once"
              />
            </div>
          </div>
        </motion.div>

        <div style={{ height: 100 }} />

        {/* ════════ Row 2: Text Left, Image Right ════════ */}
        <motion.div
          className="flex items-start"
          style={{ gap: 80 }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div style={{ flex: 1, paddingTop: 10 }}>
            <div className="flex items-center" style={{ gap: 8, marginBottom: 14 }}>
              <span style={{ color: "#a78bfa" }}><SparkleSmall /></span>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#a78bfa" }}>Tackle Your Daily To-Dos</span>
            </div>

            <h2
              className="font-sans"
              style={{
                fontSize: 44,
                fontWeight: 500,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                color: "#fff",
                margin: 0,
                marginBottom: 40,
              }}
            >
              From organizing your
              <br />
              schedule to writing emails
            </h2>

            <div className="flex" style={{ gap: 48, maxWidth: 500 }}>
              <FeatureItem
                icon={<DocIcon />}
                title="Recaps"
                description="Lorem ipsum dolor sit amet consectetur lobortis sed ut urna orci libero eu laoreet sed augue leo placerat posuere"
              />
              <FeatureItem
                icon={<CalendarIcon />}
                title="Planning"
                description="Lorem ipsum dolor sit amet consectetur lobortis sed ut urna orci libero eu laoreet sed augue leo placerat posuere"
              />
            </div>
          </div>

          <div style={{ flexShrink: 0, width: 420 }}>
            <ImageCard
              gradient="linear-gradient(135deg, rgba(180,120,60,0.8) 0%, rgba(220,160,80,0.7) 30%, rgba(200,140,70,0.6) 50%, rgba(160,100,50,0.5) 70%, rgba(40,25,15,0.9) 100%)"
              title="Smart Analyzing"
              subtitle="Lorem ipsum dolor sit amet"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
