// components/VentureComparisonModal.jsx
// ---------------------------------------------------------------------------
// Side-by-Side Idea Comparison ("Compare 2 Ventures") — Scale Founder Feature
// Compares Viability Score, Breakeven Customers, CAC Risk & Time-to-MVP.
// Provides an automated "Which to Build First" AI Co-Founder Verdict.
// ---------------------------------------------------------------------------
import { useState, useMemo } from "react";
import {
  Scale,
  X,
  Trophy,
  ArrowRight,
  TrendingUp,
  Clock,
  Wallet,
  Users,
  CheckCircle2,
  Lock,
  Sparkles,
  Zap,
  ShieldAlert,
} from "lucide-react";
import { isUserScaleFounder } from "../lib/quotaManager.js";

function getViability(entry) {
  return (
    entry?.blueprint?.ideaAnalysis?.viabilityScore ??
    entry?.blueprint?.ideaAnalysis?.viability ??
    entry?.blueprint?.viabilityScore ??
    80
  );
}

function getBreakeven(entry) {
  const rev = entry?.blueprint?.revenueSimulator?.breakEvenUsers || entry?.blueprint?.costEstimator?.breakEvenUsers;
  if (rev && typeof rev === "number") return rev;
  // Deterministic calculation from viability and problem scope
  const viab = getViability(entry);
  return Math.max(60, Math.round(1000 - viab * 8));
}

function getCloudBurn(entry) {
  const cost = entry?.blueprint?.costEstimator?.monthlyTotalUsd || entry?.blueprint?.costEstimator?.totalUsd;
  if (cost) return `$${Math.round(cost)}/mo`;
  return "$65 - $120/mo";
}

function getTimeToMvp(entry) {
  const viab = getViability(entry);
  if (viab >= 85) return "2–3 weeks (Rapid)";
  if (viab >= 75) return "4–5 weeks (Moderate)";
  return "6–8 weeks (Complex)";
}

function getCacRisk(entry) {
  const viab = getViability(entry);
  if (viab >= 85) return { level: "Low", tone: "green", desc: "Organic word-of-mouth & viral loops" };
  if (viab >= 75) return { level: "Moderate", tone: "amber", desc: "Targeted outbound & content marketing" };
  return { level: "High", tone: "rose", desc: "High competitive ad-spend required" };
}

export default function VentureComparisonModal({
  isOpen,
  onClose,
  history = [],
  currentUser = null,
  onOpenPayment = () => {},
  onSelectVenture = () => {},
}) {
  const isScale = isUserScaleFounder(currentUser?.id);

  const [idA, setIdA] = useState(() => history[0]?.id || "");
  const [idB, setIdB] = useState(() => history[1]?.id || history[0]?.id || "");

  const ventureA = useMemo(() => history.find((h) => h.id === idA) || history[0], [history, idA]);
  const ventureB = useMemo(
    () => history.find((h) => h.id === idB) || (history[1] || history[0]),
    [history, idB]
  );

  if (!isOpen) return null;

  if (history.length < 2) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl p-6 max-w-md w-full text-center shadow-2xl border border-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-10 w-10 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center mx-auto mb-3">
            <Scale size={20} />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Need At Least 2 Startups</h3>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            Analyze at least two different startup concepts to compare them side-by-side on viability, customer breakeven targets, and CAC risk.
          </p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors w-full cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    );
  }

  const viabA = getViability(ventureA);
  const viabB = getViability(ventureB);

  const breakevenA = getBreakeven(ventureA);
  const breakevenB = getBreakeven(ventureB);

  const cacA = getCacRisk(ventureA);
  const cacB = getCacRisk(ventureB);

  const timeA = getTimeToMvp(ventureA);
  const timeB = getTimeToMvp(ventureB);

  // Recommendation logic
  const scoreA = viabA * 1.5 - breakevenA * 0.1;
  const scoreB = viabB * 1.5 - breakevenB * 0.1;
  const winnerIsA = scoreA >= scoreB;
  const winningVenture = winnerIsA ? ventureA : ventureB;
  const losingVenture = winnerIsA ? ventureB : ventureA;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[92vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-orange-50 border border-orange-200 text-orange-600 shadow-2xs">
              <Scale size={16} />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                Compare 2 Ventures Side-by-Side
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-orange-50 text-orange-700 border border-orange-200">
                  Scale Founder
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Data-driven duel comparing viability, breakeven speed, and CAC exposure.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body with Scale Gate */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 relative">
          {/* Venture Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
              <label className="text-[11px] font-mono uppercase font-bold text-slate-500 block mb-1.5">
                Venture A (Reference)
              </label>
              <select
                value={idA}
                onChange={(e) => setIdA(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                {history.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.idea.slice(0, 50)}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
              <label className="text-[11px] font-mono uppercase font-bold text-slate-500 block mb-1.5">
                Venture B (Challenger)
              </label>
              <select
                value={idB}
                onChange={(e) => setIdB(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                {history.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.idea.slice(0, 50)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={`space-y-6 ${!isScale ? "filter blur-[3px] select-none pointer-events-none" : ""}`}>
            {/* AI Recommendation Verdict Banner */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5 flex items-start gap-3.5">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-600 text-white shrink-0 shadow-xs">
                <Trophy size={18} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-800 block mb-0.5">
                  AI Co-Founder Strategic Recommendation
                </span>
                <h4 className="text-sm sm:text-base font-bold text-emerald-950">
                  Build “{winningVenture?.idea.slice(0, 40)}…” First
                </h4>
                <p className="text-xs text-emerald-800/90 mt-1 leading-relaxed">
                  {winnerIsA
                    ? `Venture A possesses higher viability (${viabA}/100 vs ${viabB}/100) and reaches breakeven with ${Math.round(Math.abs(breakevenB - breakevenA))} fewer customers. It has lower CAC friction, making it the superior cash-flow engine.`
                    : `Venture B delivers stronger overall traction fundamentals with a faster breakeven runway (${breakevenB} users vs ${breakevenA} users) and lower CAC risk.`}
                </p>
              </div>
            </div>

            {/* Comparison Matrix Table */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
              <div className="grid grid-cols-3 bg-slate-100/70 p-3 text-xs font-semibold text-slate-700 border-b border-slate-200">
                <span>Metric / Factor</span>
                <span className="text-center font-bold text-slate-900 truncate pr-2">
                  Venture A: {ventureA?.idea.slice(0, 20)}…
                </span>
                <span className="text-center font-bold text-slate-900 truncate pl-2">
                  Venture B: {ventureB?.idea.slice(0, 20)}…
                </span>
              </div>

              {/* Row 1: Viability */}
              <div className="grid grid-cols-3 p-3.5 border-b border-slate-100 text-xs items-center hover:bg-slate-50/50 transition-colors">
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  <TrendingUp size={13} className="text-orange-500" /> Viability Score
                </span>
                <div className="text-center font-bold text-slate-900">
                  <span className={`px-2.5 py-1 rounded-full text-xs ${viabA >= viabB ? "bg-emerald-100 text-emerald-800 font-extrabold" : "bg-slate-100 text-slate-700"}`}>
                    {viabA}/100 {viabA > viabB && "★"}
                  </span>
                </div>
                <div className="text-center font-bold text-slate-900">
                  <span className={`px-2.5 py-1 rounded-full text-xs ${viabB >= viabA ? "bg-emerald-100 text-emerald-800 font-extrabold" : "bg-slate-100 text-slate-700"}`}>
                    {viabB}/100 {viabB > viabA && "★"}
                  </span>
                </div>
              </div>

              {/* Row 2: Breakeven Users */}
              <div className="grid grid-cols-3 p-3.5 border-b border-slate-100 text-xs items-center hover:bg-slate-50/50 transition-colors">
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  <Users size={13} className="text-blue-500" /> Breakeven Customers
                </span>
                <div className="text-center font-semibold text-slate-800">
                  {breakevenA} customers {breakevenA < breakevenB && <span className="text-[10px] text-emerald-600 block">Faster (Winner)</span>}
                </div>
                <div className="text-center font-semibold text-slate-800">
                  {breakevenB} customers {breakevenB < breakevenA && <span className="text-[10px] text-emerald-600 block">Faster (Winner)</span>}
                </div>
              </div>

              {/* Row 3: CAC Risk */}
              <div className="grid grid-cols-3 p-3.5 border-b border-slate-100 text-xs items-center hover:bg-slate-50/50 transition-colors">
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  <ShieldAlert size={13} className="text-rose-500" /> CAC Exposure Risk
                </span>
                <div className="text-center text-xs">
                  <span className="font-bold text-slate-800">{cacA.level}</span>
                  <span className="text-[10px] text-slate-400 block truncate">{cacA.desc}</span>
                </div>
                <div className="text-center text-xs">
                  <span className="font-bold text-slate-800">{cacB.level}</span>
                  <span className="text-[10px] text-slate-400 block truncate">{cacB.desc}</span>
                </div>
              </div>

              {/* Row 4: Time to MVP */}
              <div className="grid grid-cols-3 p-3.5 text-xs items-center hover:bg-slate-50/50 transition-colors">
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  <Clock size={13} className="text-amber-500" /> Sprint 1 Velocity
                </span>
                <div className="text-center font-medium text-slate-800">{timeA}</div>
                <div className="text-center font-medium text-slate-800">{timeB}</div>
              </div>
            </div>
          </div>

          {/* Frosted Glass Gate for Non-Scale Founders */}
          {!isScale && (
            <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-white/70 backdrop-blur-md">
              <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-xl text-center animate-fade-in">
                <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 mb-3 shadow-2xs">
                  <Lock size={20} />
                </div>
                <h4 className="text-base font-semibold text-slate-900 tracking-tight">
                  Scale Founder Exclusive
                </h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Compare two saved startups side-by-side to prioritize customer breakeven counts, CAC risk, and development velocity before writing a line of code.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <button
                    onClick={() => onOpenPayment("scale_299")}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles size={14} />
                    Upgrade to Scale Founder (₹299/mo)
                  </button>
                  <span className="text-[11px] text-slate-400">
                    Includes 10 blueprints/week, public pitch links & real-time Reddit grounding.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
