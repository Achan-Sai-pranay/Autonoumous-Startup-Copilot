// LoadingTimeline.jsx
// ---------------------------------------------------------------------------
// V2 CHANGE: this used to fake progress with a setInterval timer because
// the backend only returned one final response. Now the backend streams
// real per-agent progress events (see App.jsx's readNdjsonStream), so this
// component just renders whatever `steps` prop it's given — no timers, no
// guessing. It also now shows a "Currently running" line driven by real
// state, and a 9th step for the AI Critic Agent.
// ---------------------------------------------------------------------------
import { CheckCircle2, Loader2, XCircle, Circle } from "lucide-react";

// Exported so App.jsx can build its initial "all pending" step list without
// duplicating the agent names in two places.
export const AGENT_STEP_NAMES = [
  "Idea Analysis",
  "Market Research",
  "Customer Persona",
  "Product Planning",
  "Technical Architecture",
  "Business Strategy",
  "Pitch Generation",
  "Roadmap",
  "AI Critic",
];

// steps: [{ name: string, status: "pending" | "running" | "done" | "failed" }]
export default function LoadingTimeline({ steps }) {
  const runningStep = steps.find((s) => s.status === "running");

  return (
    <div className="w-full max-w-md mx-auto mt-10">
      <div className="space-y-2">
        {steps.map((step) => (
          <div
            key={step.name}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg border transition-all duration-300
              ${
                step.status === "running"
                  ? "bg-indigo-950/40 border-indigo-700 scale-[1.02]"
                  : "bg-slate-900/60 border-slate-800"
              }
            `}
          >
            <StepIcon status={step.status} />
            <span
              className={`text-sm ${
                step.status === "pending" ? "text-slate-500" : "text-slate-100"
              }`}
            >
              {step.status === "done" && `✓ ${step.name} Complete`}
              {step.status === "failed" && `${step.name} — unavailable`}
              {(step.status === "running" || step.status === "pending") &&
                step.name}
            </span>
          </div>
        ))}
      </div>

      {runningStep && (
        <p className="text-center text-xs text-indigo-400 mt-4 animate-pulse">
          Currently running: {runningStep.name} Agent...
        </p>
      )}
    </div>
  );
}

function StepIcon({ status }) {
  if (status === "done") {
    return <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />;
  }
  if (status === "failed") {
    return <XCircle size={18} className="shrink-0 text-red-500" />;
  }
  if (status === "running") {
    return (
      <Loader2 size={18} className="shrink-0 text-indigo-400 animate-spin" />
    );
  }
  return <Circle size={18} className="shrink-0 text-slate-700" />;
}