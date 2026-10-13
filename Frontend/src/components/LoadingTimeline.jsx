// components/LoadingTimeline.jsx
// ---------------------------------------------------------------------------
// Live tracker for the 12-agent pipeline: current stage, progress, elapsed time
// and a status row per agent. Same props as before: <LoadingTimeline steps={...} />
// Styles live in ./workspace.css.
// ---------------------------------------------------------------------------
import { useState, useEffect, useRef } from "react";
import { Check, X } from "lucide-react";
import "./home.css";
import "./workspace.css";

// Exported so App.jsx can build its initial "all pending" step list without
// duplicating the agent names in two places. Order MUST match the STEPS
// array in backend/agents.js.
export const AGENT_STEP_NAMES = [
  "Venture Viability & 3-AI Debate",
  "Lean Customer Discovery & Personas",
  "Strategic Frameworks (SWOT & Porter's)",
  "Market Intelligence & Sizing (TAM/SAM/SOM)",
  "Competitor Vulnerability Matrix",
  "Product Planning & MVP Scope",
  "Technical Architecture",
  "Business Strategy & Monetization",
  "Pitch & Executive Synthesis",
  "Startup Roadmap",
  "Go-to-Market Engine",
  "Launch Checklist & Financials",
];

const FOUNDER_TIPS = [
  "Lean tip: never ask “Would you buy this?” Ask what workaround they paid for last month.",
  "MVP rule: an MVP should take under four weeks to build. We’re scoping your core feature set now.",
  "Unit economics: calculating your cloud and server costs at 100, 500 and 5,000 active users.",
  "Defensibility: finding structural blind spots and user complaints from direct competitors.",
  "Distribution: drafting LinkedIn outreach, Reddit launch copy and email hooks, ready to send.",
];

// steps: [{ name: string, status: "pending" | "running" | "done" | "failed" }]
export default function LoadingTimeline({ steps }) {
  const [tipIndex, setTipIndex] = useState(0);
  const listRef = useRef(null);

  useEffect(() => {
    const tipTimer = setInterval(() => setTipIndex((p) => (p + 1) % FOUNDER_TIPS.length), 7000);
    return () => {
      clearInterval(tipTimer);
    };
  }, []);

  const totalSteps = steps.length;
  const completedSteps = steps.filter((s) => s.status === "done").length;
  const runningIndex = steps.findIndex((s) => s.status === "running");
  const runningStep = runningIndex !== -1 ? steps[runningIndex] : null;
  const basePercent = Math.round(((completedSteps + (runningStep ? 0.4 : 0)) / totalSteps) * 100);
  const progress = Math.min(98, Math.max(6, basePercent));

  // Keep the active agent in view inside the list
  useEffect(() => {
    if (runningIndex >= 0 && listRef.current) {
      const el = listRef.current.querySelector(`[data-agent-index="${runningIndex}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [runningIndex]);

  return (
    <div className="wk-lt">
      <div className="wk-lt-head">
        <div>
          <h3>Building your blueprint</h3>
          <p>
            {runningStep
              ? `Stage ${runningIndex + 1} of ${totalSteps} · ${runningStep.name}`
              : "Finalizing your startup blueprint…"}
          </p>
        </div>
      </div>

      <div
        className="wk-lt-bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label="Blueprint progress"
      >
        <i style={{ width: `${Math.max(progress, 8)}%` }} />
      </div>

      <p key={tipIndex} className="wk-lt-tip">
        {FOUNDER_TIPS[tipIndex]}
      </p>

      <ol className="wk-lt-list" ref={listRef}>
        {steps.map((step, idx) => {
          const isRunning = step.status === "running";
          const isDone = step.status === "done";
          const isFailed = step.status === "failed";
          return (
            <li
              key={step.name}
              data-agent-index={idx}
              className={`wk-lt-row ${isRunning ? "is-running" : ""} ${isDone ? "is-done" : ""} ${
                isFailed ? "is-failed" : ""
              }`}
            >
              <span className="wk-lt-num">{(idx + 1).toString().padStart(2, "0")}</span>
              <span className="wk-lt-dot" aria-hidden="true">
                {isDone && <Check size={12} strokeWidth={3} />}
                {isFailed && <X size={12} strokeWidth={3} />}
                {isRunning && <span className="wk-lt-spin" />}
              </span>
              <span className="wk-lt-name">{step.name}</span>
              <span className="wk-lt-status">
                {isRunning ? "Working" : isDone ? "Ready" : isFailed ? "Skipped" : "Queued"}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}