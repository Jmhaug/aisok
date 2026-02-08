import { motion } from "motion/react";
import HlsVideo from "./HlsVideo";

const TASK_AUTOMATION_VIDEO =
  "https://customer-cbeadsgr09pnsezs.cloudflarestream.com/257c7359efd4b4aaebcc03aa8fc78a36/manifest/video.m3u8";
const SMART_WORKFLOWS_VIDEO =
  "https://customer-cbeadsgr09pnsezs.cloudflarestream.com/592747c6820f3774a1ce343ef4782769/manifest/video.m3u8";

function ChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M11 4L6 9L11 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M7 4L12 9L7 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const cards = [
  {
    video: TASK_AUTOMATION_VIDEO,
    title: "Task Automation",
    description:
      "We simplify your work by turning manual tasks into automated ones!",
  },
  {
    video: SMART_WORKFLOWS_VIDEO,
    title: "Smart Workflows",
    description:
      "Create smart workflows that simplify complex tasks across different tools.",
  },
];

export default function Services() {
  return (
    <section
      style={{
        backgroundColor: "#000",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <div
        className="mx-auto flex items-start"
        style={{
          maxWidth: 1400,
          paddingLeft: 48,
          paddingRight: 48,
          paddingTop: 100,
          paddingBottom: 100,
          gap: 80,
        }}
      >
        {/* ──────── Left Column ──────── */}
        <motion.div
          style={{
            flexShrink: 0,
            width: 520,
            paddingTop: 20,
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h2
            className="font-sans"
            style={{
              fontSize: 52,
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "#fff",
              margin: 0,
            }}
          >
            Smarter Services,
            <br />
            <span
              className="font-serif"
              style={{ fontStyle: "italic", color: "rgba(255,255,255,0.85)" }}
            >
              Built with AI
            </span>
          </h2>

          <p
            style={{
              marginTop: 28,
              maxWidth: 480,
              fontSize: 16,
              lineHeight: 1.75,
              color: "rgba(255,255,255,0.4)",
            }}
          >
            Discover all the tools you need to streamline your operations and
            supercharge your productivity! With our solutions, you can easily
            automate tasks.
          </p>

          {/* Arrow Buttons */}
          <div className="flex items-center" style={{ marginTop: 40, gap: 12 }}>
            <button
              style={{
                width: 44,
                height: 44,
                borderRadius: 9999,
                border: "1px solid rgba(255,255,255,0.15)",
                backgroundColor: "transparent",
                color: "rgba(255,255,255,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              aria-label="Previous"
            >
              <ChevronLeft />
            </button>
            <button
              style={{
                width: 44,
                height: 44,
                borderRadius: 9999,
                border: "1px solid rgba(255,255,255,0.25)",
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              aria-label="Next"
            >
              <ChevronRight />
            </button>
          </div>
        </motion.div>

        {/* ──────── Right Column — Cards ──────── */}
        <div
          className="flex"
          style={{
            gap: 24,
            flex: 1,
            minWidth: 0,
            justifyContent: "flex-end",
          }}
        >
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              style={{
                width: 300,
                height: 440,
                flexShrink: 0,
                borderRadius: 20,
                overflow: "hidden",
                position: "relative",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.6,
                delay: 0.15 + i * 0.12,
                ease: "easeOut",
              }}
            >
              {/* Video — fills entire card */}
              <HlsVideo
                src={card.video}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />

              {/* Gradient overlay for text readability */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.65) 60%, rgba(0,0,0,0.92) 100%)",
                }}
              />

              {/* Content — overlaid at bottom */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "24px 24px 28px",
                }}
              >
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: "#fff",
                    margin: 0,
                    marginBottom: 10,
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.65,
                    color: "rgba(255,255,255,0.5)",
                    margin: 0,
                    marginBottom: 20,
                  }}
                >
                  {card.description}
                </p>
                <a
                  href="#get-started"
                  className="no-underline"
                  style={{
                    display: "inline-block",
                    borderRadius: 9999,
                    backgroundColor: "rgba(255,255,255,0.12)",
                    paddingLeft: 22,
                    paddingRight: 22,
                    paddingTop: 10,
                    paddingBottom: 10,
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#fff",
                  }}
                >
                  Get started
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
