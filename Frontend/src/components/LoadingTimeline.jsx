// LoadingTimeline.jsx
// ---------------------------------------------------------------------------
// Precision Multi-Agent Command Tracker:
// Displays live orchestrator execution, active agent telemetry, elapsed duration,
// and completion status across the 12 specialized AI co-founders.
// ---------------------------------------------------------------------------
import { useState, useEffect } from "react";
import { CheckCircle2, Loader2, XCircle, Circle, Cpu, Sparkles } from "lucide-react";

// Exported so App.jsx can build its initial "all pending" step list without
// duplicating the agent names in two places. Order MUST match the STEPS
// array in backend/agents.js.
export const AGENT_STEP_NAMES = [
  "Idea Analysis",
  "Market Research",
  "Customer Persona",
  "Product Planning",
  "Technical Architecture",
  "Business Strategy",
  "Pitch Generation",
  "Roadmap",
  "Go-to-Market Strategy",
  "Launch Checklist",
  "Cost & Revenue",
  "Competitor Weakness Analysis",
];

// steps: [{ name: string, status: "pending" | "running" | "done" | "failed" }]
export default function LoadingTimeline({ steps }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalSteps = steps.length;
  const completedSteps = steps.filter((s) => s.status === "done").length;
  const runningStepIndex = steps.findIndex((s) => s.status === "running");
  const runningStep = runningStepIndex !== -1 ? steps[runningStepIndex] : null;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-8 animate-fade-in">
      {/* Elevated Status Header Card */}
      <div className="bg-white rounded-2xl p-5 mb-4 border border-orange-200 shadow-lg shadow-orange-500/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-orange-50 border border-orange-200 text-orange-600">
              <Cpu size={16} className="animate-pulse" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                12-Agent Startup Synthesis
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-100 text-orange-700 border border-orange-200">
                  LIVE
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {runningStep
                  ? `Agent ${runningStepIndex + 1} of ${totalSteps}: ${runningStep.name}`
                  : "Finalizing startup architecture..."}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="font-mono text-xs text-slate-400">Elapsed</span>
            <p className="font-mono text-sm font-bold text-slate-900">{formatTime(elapsed)}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
          <div
            className="bg-gradient-to-r from-orange-500 to-amber-500 h-full transition-all duration-500 ease-out rounded-full"
            style={{ width: `${Math.max(progressPercent, 8)}%` }}
          />
        </div>
      </div>

      {/* Structured Agent Pipeline Grid */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm divide-y divide-slate-100">
        {steps.map((step, idx) => {
          const isRunning = step.status === "running";
          const isDone = step.status === "done";
          const isFailed = step.status === "failed";

          return (
            <div
              key={step.name}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
                isRunning
                  ? "bg-orange-50/80 border border-orange-200"
                  : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-[11px] text-slate-400 w-5">
                  {(idx + 1).toString().padStart(2, "0")}
                </span>
                <StepIcon status={step.status} />
                <span
                  className={`text-xs font-medium truncate ${
                    isRunning
                      ? "text-orange-700 font-bold"
                      : isDone
                      ? "text-slate-800"
                      : "text-slate-400"
                  }`}
                >
                  {step.name}
                </span>
              </div>

              <div className="shrink-0 pl-2">
                {isRunning && (
                  <span className="flex items-center gap-1.5 text-[11px] font-mono text-orange-600 font-semibold animate-pulse">
                    <Sparkles size={11} />
                    Synthesizing
                  </span>
                )}
                {isDone && (
                  <span className="text-[11px] font-mono font-medium text-emerald-600">
                    Ready
                  </span>
                )}
                {isFailed && (
                  <span className="text-[11px] font-mono text-red-600">
                    Bypassed
                  </span>
                )}
                {!isRunning && !isDone && !isFailed && (
                  <span className="text-[11px] font-mono text-slate-400">
                    Queued
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepIcon({ status }) {
  if (status === "done") {
    return <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />;
  }
  if (status === "failed") {
    return <XCircle size={15} className="shrink-0 text-red-500" />;
  }
  if (status === "running") {
    return <Loader2 size={15} className="shrink-0 text-orange-600 animate-spin" />;
  }
  return <Circle size={15} className="shrink-0 text-slate-300" />;
}