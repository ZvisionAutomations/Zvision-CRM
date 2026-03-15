"use client"

import { useEffect, useState, useRef } from "react"

// --- Zvision Z Logo with stroke trace animation ---
// Two paths from the real SVG, rendered with stroke-dasharray technique.
// Phase 1 (0-800ms): stroke traces the paths (fill transparent, stroke visible)
// Phase 2 (800-1100ms): fill fades in, stroke fades out
// Phase 3 (1100ms+): glow pulse starts
function ZvisionLogo({ phase }: { phase: "tracing" | "filling" | "complete" }) {
  const isFilling = phase === "filling" || phase === "complete"
  const isComplete = phase === "complete"

  return (
    <div
      className="zvision-logo-container"
      style={{
        width: 72,
        height: 72,
        filter: isComplete
          ? "drop-shadow(0 0 12px rgba(162,230,53,0.6))"
          : "none",
        animation: isComplete ? "logoGlowPulse 3s ease-in-out infinite" : "none",
      }}
    >
      <svg
        width="72"
        height="72"
        viewBox="400 550 1300 1200"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Path 1 — lower Z shape */}
        <path
          d="M753.37 1579.84 c-27.49 -20.16 -59.86 -44.18 -72.28 -53.35 -12.22 -9.16 -56.20 -41.13 -97.73 -71.26 -41.33 -29.93 -76.56 -56.20 -77.78 -58.03 -2.04 -2.44 -2.65 -32.58 -2.65 -133.98 l0 -130.72 37.26 -27.28 c20.36 -15.27 99.36 -73.10 175.51 -128.89 76.15 -55.79 167.37 -122.58 202.60 -148.64 35.23 -25.86 70.04 -51.11 77.17 -55.99 18.33 -12.22 43.98 -23.82 66.99 -30.13 l19.75 -5.50 153.73 -0.41 c146.19 -0.61 153.52 -0.41 149.04 3.05 -2.65 1.83 -15.88 12.22 -29.52 23.01 -13.64 10.59 -27.49 21.18 -30.95 23.42 -5.90 3.67 -24.64 17.71 -63.73 47.44 -10.18 7.94 -19.14 14.46 -19.75 14.46 -0.61 0 -10.18 7.33 -21.18 16.29 -11.20 8.96 -21.18 16.29 -21.99 16.29 -0.81 0 -8.14 5.29 -16.09 11.81 -7.94 6.31 -19.55 15.27 -26.06 19.75 -6.31 4.48 -26.88 19.55 -45.41 33.60 -44.79 33.80 -61.69 46.42 -80.02 59.86 -8.35 6.11 -23.42 17.51 -33.60 25.25 -9.98 7.74 -24.03 18.12 -30.75 23.01 -6.92 4.89 -18.94 13.64 -26.47 19.55 -7.74 5.90 -19.34 14.66 -25.86 19.34 -6.31 4.89 -17.31 13.03 -24.43 18.33 -6.92 5.29 -15.88 12.01 -19.75 14.86 -3.87 3.05 -19.55 14.66 -34.61 26.06 -15.07 11.40 -28.91 21.79 -30.75 22.80 -4.07 2.44 -24.23 17.51 -47.65 35.63 -9.37 7.33 -20.36 15.47 -24.43 18.33 -4.07 2.85 -17.92 13.44 -31.15 23.42 -13.03 10.18 -28.51 21.58 -34.21 25.45 -8.55 5.90 -37.26 27.08 -78.59 58.44 -4.28 3.05 -11.20 8.14 -15.27 11.40 -4.28 3.05 -15.07 11.40 -24.23 18.33 -8.96 6.92 -21.58 16.09 -27.90 20.36 -6.31 4.28 -12.01 8.55 -12.62 9.57 -0.81 1.43 120.95 2.04 346.55 2.04 227.64 0 352.25 0.81 361.01 2.04 38.28 6.11 75.95 26.06 100.79 53.35 23.21 25.66 37.87 57.01 55.99 119.32 6.72 23.01 12.22 42.56 12.22 43.37 0 1.02 -130.72 1.83 -290.56 1.83 l-290.76 -0.20 -49.89 -36.65z"
          fill={isFilling ? "#A2E635" : "none"}
          stroke="#A2E635"
          strokeWidth="40"
          strokeLinejoin="round"
          strokeLinecap="round"
          pathLength="1"
          className={
            phase === "tracing"
              ? "logo-path-trace"
              : isFilling
                ? "logo-path-fill"
                : ""
          }
        />
        {/* Path 2 — upper Z shape */}
        <path
          d="M699.41 1345.88 c1.22 -1.83 82.26 -62.92 266.73 -200.56 40.32 -30.13 127.87 -95.49 194.45 -145.38 66.58 -49.68 151.90 -113.41 189.36 -141.31 37.46 -28.10 104.25 -77.98 148.43 -111.17 l80.43 -60.27 -357.34 -1.02 c-403.36 -1.22 -363.86 0.61 -401.93 -18.12 -43.17 -21.38 -72.08 -55.18 -90.81 -106.08 -10.79 -29.93 -28.10 -92.44 -26.06 -94.68 1.43 -1.43 100.99 -2.24 288.72 -2.65 l286.69 -0.61 58.84 43.17 c68.01 50.09 148.03 108.32 203.61 148.84 l38.89 28.10 1.43 19.14 c0.61 10.59 1.22 70.25 1.22 132.76 l-0.20 113.41 -5.90 5.50 c-3.46 3.26 -10.38 8.55 -15.68 12.01 -5.29 3.46 -15.47 11 -22.80 16.49 -7.33 5.70 -25.66 19.34 -40.32 30.13 -14.86 10.79 -29.32 21.58 -32.37 23.82 -3.05 2.24 -7.53 5.50 -10.18 7.13 -2.44 1.63 -8.55 6.11 -13.44 9.77 -4.89 3.67 -17.92 13.44 -29.12 21.79 -11.20 8.35 -23.62 17.51 -27.49 20.36 -3.87 3.05 -16.09 12.01 -26.88 19.95 -10.79 8.14 -22.19 16.49 -25.25 18.73 -2.85 2.24 -7.53 5.50 -9.98 7.13 -2.65 1.63 -13.44 9.77 -24.23 17.92 -10.59 7.94 -19.95 14.66 -20.77 14.66 -0.61 0 -8.14 5.50 -16.70 12.42 -8.35 6.72 -17.71 13.85 -20.56 15.68 -2.85 1.83 -9.37 6.52 -14.46 10.59 -5.09 4.07 -11.40 8.76 -14.25 10.59 -2.85 1.83 -9.98 6.92 -15.68 11.20 -5.90 4.28 -19.55 14.25 -30.34 21.99 -10.79 7.94 -26.27 19.55 -34.41 26.06 -8.14 6.31 -15.47 11.61 -16.29 11.61 -0.81 0 -5.09 3.26 -9.77 7.13 -4.48 3.87 -9.16 7.13 -10.18 7.13 -1.02 0 -6.52 3.26 -12.01 7.33 -12.22 8.55 -39.30 20.16 -61.69 25.86 -15.68 4.07 -22.40 4.28 -169.61 4.89 -106.49 0.61 -153.12 0.20 -152.10 -1.43z"
          fill={isFilling ? "#A2E635" : "none"}
          stroke="#A2E635"
          strokeWidth="40"
          strokeLinejoin="round"
          strokeLinecap="round"
          pathLength="1"
          className={
            phase === "tracing"
              ? "logo-path-trace logo-path-trace-delay"
              : isFilling
                ? "logo-path-fill"
                : ""
          }
        />
      </svg>
    </div>
  )
}

// --- Diagnostic log lines ---
const DIAGNOSTIC_LINES = [
  { label: "SUPABASE_CONNECTION", value: "STABLE", prefix: "[OK]" },
  { label: "AUTH_MODULE", value: "LOADED", prefix: "[OK]" },
  { label: "PIPELINE_ENGINE", value: "READY", prefix: "[OK]" },
  { label: "INTEL_SCANNER", value: "ACTIVE", prefix: "[OK]" },
  { label: "FLOWS_DAEMON", value: "RUNNING", prefix: "[OK]" },
  { label: "ENCRYPTION_LAYER", value: "VERIFIED", prefix: "[OK]" },
  { label: "INITIALIZING_OPERATOR_SESSION...", value: "", prefix: ">>" },
  { label: "SYSTEM_READY", value: "EXECUTE", prefix: "[OK]" },
]

// --- Progress keyframes (non-linear jumps) ---
// Timeline: progress bar starts at 1500ms, hits 100% at 3700ms
// So the animation runs from 0 to 2200ms internally
const PROGRESS_KEYFRAMES = [
  { at: 0, pct: 0 },
  { at: 150, pct: 4 },
  { at: 300, pct: 12 },
  { at: 450, pct: 18 },
  { at: 650, pct: 24 },
  { at: 850, pct: 31 },
  { at: 1000, pct: 38 },
  { at: 1150, pct: 45 },
  { at: 1300, pct: 52 },
  { at: 1450, pct: 58 },
  { at: 1600, pct: 67 },
  { at: 1750, pct: 74 },
  { at: 1900, pct: 82 },
  { at: 2000, pct: 89 },
  { at: 2100, pct: 95 },
  { at: 2200, pct: 100 },
]

export default function BootSequence({
  onComplete,
}: {
  onComplete: () => void
}) {
  const [progress, setProgress] = useState(0)
  const [visibleLines, setVisibleLines] = useState(0)
  const [cornersVisible, setCornersVisible] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [logoPhase, setLogoPhase] = useState<"hidden" | "tracing" | "filling" | "complete">("hidden")
  const [textVisible, setTextVisible] = useState(false)
  const [subtitleVisible, setSubtitleVisible] = useState(false)
  const [progressVisible, setProgressVisible] = useState(false)
  const startTimeRef = useRef<number>(0)
  const rafRef = useRef<number>(0)

  // Master animation timeline
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    // 0ms: background + corners begin fade in
    timers.push(setTimeout(() => setCornersVisible(true), 0))

    // 300ms: Z logo starts trace animation
    timers.push(setTimeout(() => setLogoPhase("tracing"), 300))

    // 1100ms: trace complete, fill fades in
    timers.push(setTimeout(() => setLogoPhase("filling"), 1100))

    // 1200ms: "ZVISION" text fades in
    timers.push(setTimeout(() => setTextVisible(true), 1200))

    // 1300ms: fill complete, glow starts
    timers.push(setTimeout(() => setLogoPhase("complete"), 1400))

    // 1400ms: "AUTOMATION HUB" fades in
    timers.push(setTimeout(() => setSubtitleVisible(true), 1400))

    // 1500ms: progress bar starts + diagnostic log starts
    timers.push(setTimeout(() => setProgressVisible(true), 1500))

    return () => timers.forEach(clearTimeout)
  }, [])

  // Progress bar animation — starts at 1500ms mark
  useEffect(() => {
    const startDelay = setTimeout(() => {
      startTimeRef.current = performance.now()

      function tick() {
        const elapsed = performance.now() - startTimeRef.current
        let currentPct = 0

        for (let i = PROGRESS_KEYFRAMES.length - 1; i >= 0; i--) {
          if (elapsed >= PROGRESS_KEYFRAMES[i].at) {
            if (i < PROGRESS_KEYFRAMES.length - 1) {
              const seg = PROGRESS_KEYFRAMES[i]
              const next = PROGRESS_KEYFRAMES[i + 1]
              const segProgress =
                (elapsed - seg.at) / (next.at - seg.at)
              currentPct =
                seg.pct + (next.pct - seg.pct) * Math.min(segProgress, 1)
            } else {
              currentPct = PROGRESS_KEYFRAMES[i].pct
            }
            break
          }
        }

        setProgress(Math.min(Math.round(currentPct), 100))

        if (elapsed < 2200) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
          setProgress(100)
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }, 1500)

    return () => {
      clearTimeout(startDelay)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Diagnostic log lines — staggered appearance starting at 1500ms
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    DIAGNOSTIC_LINES.forEach((_, i) => {
      const delay = 1500 + i * 280
      timers.push(setTimeout(() => setVisibleLines(i + 1), delay))
    })
    return () => timers.forEach(clearTimeout)
  }, [])

  // Auto-complete: fade out at 3900ms, call onComplete 500ms later
  useEffect(() => {
    const t = setTimeout(() => {
      setExiting(true)
      setTimeout(onComplete, 500)
    }, 3900)
    return () => clearTimeout(t)
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-500 ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
      style={{
        backgroundColor: "#0A0A0A",
        backgroundImage:
          "linear-gradient(rgba(162,230,53,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(162,230,53,0.03) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        overflow: "hidden",
      }}
    >
      {/* ========== CENTER — Logo Block ========== */}
      <div className="flex flex-col items-center">
        {/* Animated Z Logo */}
        <div
          style={{
            opacity: logoPhase === "hidden" ? 0 : 1,
            transition: "opacity 0.3s ease",
          }}
        >
          {logoPhase !== "hidden" && <ZvisionLogo phase={logoPhase} />}
        </div>

        {/* ZVISION */}
        <div
          className="mt-5"
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            fontSize: 36,
            letterSpacing: 8,
            color: "#F0F0F0",
            lineHeight: 1,
            opacity: textVisible ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        >
          ZVISION
        </div>

        {/* AUTOMATION HUB */}
        <div
          className="mt-2"
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 400,
            fontSize: 11,
            letterSpacing: 4,
            color: "#A2E635",
            opacity: subtitleVisible ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        >
          AUTOMATION HUB
        </div>

        {/* ========== Progress Bar ========== */}
        <div
          className="mt-8"
          style={{
            width: 320,
            opacity: progressVisible ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        >
          {/* Percentage label */}
          <div
            className="text-right mb-1"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "#F0F0F0",
            }}
          >
            {progress}%
          </div>

          {/* Bar track */}
          <div
            style={{
              width: 320,
              height: 3,
              backgroundColor: "var(--surface-elevated, #1A1A1A)",
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            {/* Bar fill */}
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                backgroundColor: "#A2E635",
                boxShadow: "0 0 8px rgba(162,230,53,0.6)",
                transition: "width 80ms linear",
              }}
            />
          </div>
        </div>
      </div>

      {/* ========== Bottom Left — Diagnostic Log Panel ========== */}
      <div
        style={{
          position: "fixed",
          bottom: 32,
          left: 32,
          width: 280,
          backgroundColor: "rgba(13,13,16,0.9)",
          border: "1px solid var(--border-default, rgba(255,255,255,0.06))",
          borderRadius: 6,
          padding: "12px 16px",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          lineHeight: 1.6,
          overflow: "hidden",
        }}
      >
        {DIAGNOSTIC_LINES.slice(0, visibleLines).map((line, i) => (
          <div
            key={i}
            className="flex justify-between"
            style={{
              animation: "lineSlideIn 0.2s ease forwards",
              whiteSpace: "nowrap",
            }}
          >
            <span>
              <span
                style={{
                  color:
                    line.prefix === "[OK]"
                      ? "#A2E635"
                      : "var(--text-secondary, #9ca3af)",
                }}
              >
                {line.prefix}
              </span>{" "}
              <span style={{ color: "var(--text-muted, #4b5563)" }}>
                {line.label}
              </span>
            </span>
            {line.value && (
              <span
                style={{
                  color: "var(--text-secondary, #9ca3af)",
                  marginLeft: 8,
                }}
              >
                {line.value}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ========== Top Corners — System Metadata ========== */}
      {/* Top Left */}
      <div
        style={{
          position: "fixed",
          top: 24,
          left: 32,
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: "var(--text-muted, #4b5563)",
          letterSpacing: 1,
          opacity: cornersVisible ? 1 : 0,
          transition: "opacity 0.6s ease",
        }}
      >
        SYSTEM ARCHITECTURE / X-CORE_v9.4.2
      </div>

      {/* Top Right */}
      <div
        style={{
          position: "fixed",
          top: 24,
          right: 32,
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: "var(--text-muted, #4b5563)",
          letterSpacing: 1,
          opacity: cornersVisible ? 1 : 0,
          transition: "opacity 0.6s ease",
        }}
      >
        DEPLOYMENT STATUS / STABLE_PRODUCTION
      </div>

      {/* Bottom Right — Coordinates */}
      <div
        style={{
          position: "fixed",
          bottom: 32,
          right: 32,
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: "var(--text-muted, #4b5563)",
          letterSpacing: 1,
          opacity: cornersVisible ? 1 : 0,
          transition: "opacity 0.6s ease",
        }}
      >
        LAT -23.5505 / LNG -46.6333
      </div>

      {/* ========== CSS Animations ========== */}
      <style jsx>{`
        /* Stroke trace: draws the path over 800ms */
        .logo-path-trace {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: tracePath 800ms ease-out forwards;
        }

        /* Second path starts 100ms later for staggered effect */
        .logo-path-trace-delay {
          animation-delay: 100ms;
        }

        @keyframes tracePath {
          from {
            stroke-dashoffset: 1;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        /* Fill fade-in + stroke fade-out after trace completes */
        .logo-path-fill {
          fill-opacity: 1;
          stroke-opacity: 0;
          animation: fillReveal 300ms ease forwards;
        }

        @keyframes fillReveal {
          from {
            fill-opacity: 0;
            stroke-opacity: 1;
          }
          to {
            fill-opacity: 1;
            stroke-opacity: 0;
          }
        }

        /* Glow pulse on the container after fill */
        @keyframes logoGlowPulse {
          0%, 100% {
            filter: drop-shadow(0 0 12px rgba(162, 230, 53, 0.6));
          }
          50% {
            filter: drop-shadow(0 0 24px rgba(162, 230, 53, 0.8));
          }
        }

        @keyframes lineSlideIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
