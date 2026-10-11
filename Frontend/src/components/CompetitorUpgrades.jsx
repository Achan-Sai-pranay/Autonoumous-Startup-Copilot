// CompetitorUpgrades.jsx
// ---------------------------------------------------------------------------
// Advanced features stolen & upgraded from top direct competitors:
// 1. VenturusAI: Venture Viability Index & 4-Quadrant SWOT Matrix
// 2. FounderPal: High-Contrast Founder Outreach Swipe File & 1-Click Copy Station
// 3. Upmetrics: Interactive Financial & Unit Economics Simulator + Break-Even Calculator
// 4. ChatPRD: Document-meets-Dashboard Continuous Executive PRD Dossier
// ---------------------------------------------------------------------------

import { useState, useMemo, memo, useCallback, useRef, useEffect } from "react";
import { LeanCanvasView } from "./BlueprintPhase7.jsx";
import {
  ShieldCheck,
  TrendingUp,
  Award,
  Zap,
  Check,
  Copy,
  Sliders,
  DollarSign,
  Calculator,
  ArrowRight,
  ArrowDown,
  Sparkles,
  Layers,
  FileText,
  LayoutGrid,
  ChevronRight,
  Target,
  Users,
  Cpu,
  Landmark,
  Rocket,
  Flame,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Robust Normalization Helpers for Model JSON Discrepancies
// ---------------------------------------------------------------------------
function toSafeString(val, fallback = "") {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") return val.trim();
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (Array.isArray(val)) {
    const list = val.map((item) => toSafeString(item)).filter(Boolean);
    return list.length > 0 ? list.join(", ") : fallback;
  }
  if (typeof val === "object") {
    const candidate =
      val.text ||
      val.title ||
      val.name ||
      val.task ||
      val.item ||
      val.description ||
      val.problem ||
      val.goal ||
      val.summary ||
      val.verdict ||
      val.reasoning ||
      val.role ||
      val.userProfile ||
      val.value ||
      val.message;
    if (candidate) return toSafeString(candidate, fallback);
    try {
      return Object.values(val).map((v) => toSafeString(v)).filter(Boolean).join(" • ") || fallback;
    } catch {
      return fallback;
    }
  }
  return String(val);
}

function toSafeArray(val, fallback = []) {
  if (!val) return fallback;
  if (Array.isArray(val)) {
    const mapped = val.map((item) => toSafeString(item)).filter(Boolean);
    return mapped.length > 0 ? mapped : fallback;
  }
  if (typeof val === "string") {
    const split = val
      .split(/\n|•|;/)
      .map((s) => s.replace(/^\s*[-*\d.]+\s*/, "").trim())
      .filter(Boolean);
    return split.length > 0 ? split : [val.trim()];
  }
  if (typeof val === "object") {
    const candidateList = val.checklist || val.items || val.features || val.list || val.tasks || val.questions;
    if (Array.isArray(candidateList)) {
      const mapped = candidateList.map((item) => toSafeString(item)).filter(Boolean);
      return mapped.length > 0 ? mapped : fallback;
    }
    const vals = Object.values(val).map((v) => toSafeString(v)).filter(Boolean);
    return vals.length > 0 ? vals : fallback;
  }
  return fallback;
}

// ---------------------------------------------------------------------------
// 1. VENTURUSAI FEATURE: Venture Viability Scorecard & 4-Quadrant SWOT Matrix
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// 1 & 2. VENTURUSAI SIGNATURE CHARTS: Viability Gauge & Market Size Bubbles
// Imported from BlueprintPhase3.jsx redesign
// ---------------------------------------------------------------------------
import {
  VenturusViabilityGaugeChart,
  VenturusMarketSizeBubbleChart,
} from "./BlueprintPhase3.jsx";
import { SwotView } from "./BlueprintPhase4.jsx";
import { UpmetricsFinancialSimulator } from "./BlueprintPhase5.jsx";

export { VenturusViabilityGaugeChart, VenturusMarketSizeBubbleChart };

// ---------------------------------------------------------------------------
// 3. STRATEGIC OVERVIEW HERO ROW (White & Orange Theme)
// ---------------------------------------------------------------------------
export const StrategicOverviewHero = memo(function StrategicOverviewHero({
  marketSizing,
  viabilityScorecard,
  ideaTitle,
  domain,
}) {
  return (
    <div className="mb-8 animate-fade-in">
      {/* Overview Section Title matching screenshot in White & Orange */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl sm:text-3xl font-black text-orange-600 tracking-tight">
            Overview
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-50 text-orange-600 border border-orange-200">
            VENTURE INTELLIGENCE
          </span>
        </div>
        {domain && (
          <span className="text-xs font-mono text-slate-600 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto">
            Industry: <strong className="text-slate-900">{domain}</strong>
          </span>
        )}
      </div>

      {/* Side-by-Side Hero Cards: Market Sizing Bubbles & Viability Speedometer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VenturusMarketSizeBubbleChart marketSizing={marketSizing} ideaTitle={ideaTitle} />
        <VenturusViabilityGaugeChart viabilityScorecard={viabilityScorecard} ideaTitle={ideaTitle} />
      </div>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Venture Viability Scorecard (Module 1 Component)
// ---------------------------------------------------------------------------
export const VentureViabilityScorecard = memo(function VentureViabilityScorecard({
  viabilityScorecard,
  ideaAnalysis,
  marketResearch,
  costEstimator,
  originalIdea,
}) {
  const score = Math.max(0, Math.min(100, viabilityScorecard?.score ?? 84));
  const marketScore = Math.max(0, Math.min(100, viabilityScorecard?.marketDemandScore ?? 88));
  const techScore = Math.max(0, Math.min(100, viabilityScorecard?.technicalFeasibilityScore ?? 82));
  const capitalScore = Math.max(0, Math.min(100, viabilityScorecard?.monetizationScore ?? 85));

  const verdict = viabilityScorecard?.verdict || "Proceed";
  const reasoning =
    viabilityScorecard?.verdictReasoning ||
    "Strong product-market alignment with manageable technical complexity and straightforward monetization pathways.";

  const traps = viabilityScorecard?.fatalRiskTraps || [
    "Underestimating customer acquisition costs (CAC) across initial marketing channels.",
    "Over-engineering secondary features prior to securing 10 committed paying pilot users.",
    "Relying on generic AI wrappers without building proprietary domain workflow defensibility.",
  ];

  const verdictBadge =
    verdict === "Proceed"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : verdict === "Pivot Recommended"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shadow-2xs">
            <Award size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Venture Viability Scorecard
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${verdictBadge}`}>
                {verdict}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Institutional-grade venture readiness and early-stage survival scorecard.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-orange-50 px-3.5 py-2 rounded-2xl border border-orange-200 shadow-2xs">
          <span className="text-xs font-mono uppercase text-orange-800 font-bold">Score:</span>
          <span className="text-lg font-black font-mono text-orange-600">{score}/100</span>
        </div>
      </div>

      {/* Executive Thesis */}
      <div className="mt-5 p-4 rounded-2xl bg-orange-50/40 border border-orange-100">
        <p className="text-xs font-mono uppercase tracking-wider text-orange-800 font-bold mb-1 flex items-center gap-1.5">
          <Sparkles size={12} className="text-orange-600" />
          Executive Investment Thesis
        </p>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">{reasoning}</p>
      </div>

      {/* 3 Sub-Scores */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5">
        <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase text-slate-500 font-bold">Market Demand</span>
            <span className="text-xs font-mono font-bold text-orange-600">{marketScore}/100</span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{ width: `${marketScore}%` }} />
          </div>
          <span className="text-[10px] text-slate-400 block mt-2">Organic pull & ICP urgency</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase text-slate-500 font-bold">Tech Feasibility</span>
            <span className="text-xs font-mono font-bold text-indigo-600">{techScore}/100</span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${techScore}%` }} />
          </div>
          <span className="text-[10px] text-slate-400 block mt-2">API availability & dev velocity</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase text-slate-500 font-bold">Monetization Engine</span>
            <span className="text-xs font-mono font-bold text-orange-600">{capitalScore}/100</span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{ width: `${capitalScore}%` }} />
          </div>
          <span className="text-[10px] text-slate-400 block mt-2">Willingness to pay & gross margins</span>
        </div>
      </div>

      {/* 3 Fatal Risk Traps */}
      <div className="mt-5 p-4 rounded-2xl bg-rose-50/50 border border-rose-200/70">
        <p className="text-xs font-mono uppercase tracking-wider text-rose-800 font-bold mb-2 flex items-center gap-1.5">
          <Flame size={13} className="text-rose-600" />
          3 Fatal Risk Traps (Watch Out For)
        </p>
        <ul className="space-y-1.5">
          {traps.map((trap, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-rose-900 leading-relaxed font-sans">
              <span className="text-rose-600 font-bold select-none">•</span>
              <span>{trap}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

export const LeanCustomerDiscoverySection = memo(function LeanCustomerDiscoverySection({
  customerDiscovery,
}) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const questions = customerDiscovery?.interviewQuestions || [
    "When was the last time you experienced this specific workflow bottleneck?",
    "How much money or time did you spend trying to solve it this month?",
    "What specific workarounds or tools are you currently stitching together?",
    "What is the most painful part of your current solution?",
    "Who else in your organization feels the pain or needs to approve changes?",
  ];

  const redFlags = customerDiscovery?.redFlags || [
    "Prospect says 'This sounds like a great idea!' without mentioning past spend or action.",
    "Prospect requests endless non-essential custom features before committing to trial.",
    "Prospect is willing to use it only if it is completely free forever.",
  ];

  const wtpSignals = customerDiscovery?.willingnessToPaySignals || [
    "Signed Letter of Intent (LOI) or paid pilot deposit ($100-$500 commitment) prior to build.",
    "Customer offers immediate access to internal data/APIs for manual concierge onboarding.",
  ];

  const handleCopyQuestion = (q, idx) => {
    navigator.clipboard?.writeText(q);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-2xs">
            <Target size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Lean Customer Discovery (The "Mom Test" Protocol)
            </h3>
            <p className="text-xs text-slate-500">
              Unbiased questions to validate real buyer urgency before writing a line of code.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase bg-slate-50 px-2 py-1 rounded border border-slate-200 font-bold hidden sm:inline-block">
          Pre-Code Validation
        </span>
      </div>

      {/* 5 Interview Questions */}
      <div className="space-y-2 mb-5">
        <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
          5 Core Interview Questions (Click to Copy)
        </p>
        {questions.map((q, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:border-orange-300 transition-all group"
          >
            <div className="flex items-start gap-2.5 min-w-0">
              <span className="text-xs font-mono font-bold text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-0.2 rounded shrink-0">
                Q{i + 1}
              </span>
              <p className="text-xs sm:text-sm text-slate-800 font-sans leading-relaxed">{q}</p>
            </div>
            <button
              onClick={() => handleCopyQuestion(q, i)}
              className="flex items-center gap-1 text-[11px] font-mono text-slate-400 group-hover:text-orange-600 transition-colors shrink-0 cursor-pointer"
            >
              {copiedIndex === i ? (
                <>
                  <Check size={12} className="text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
        {/* Red Flags */}
        <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-200/70">
          <p className="text-xs font-mono uppercase tracking-wider text-rose-800 font-bold mb-2 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            False-Positive Red Flags (Beware)
          </p>
          <ul className="space-y-1.5">
            {redFlags.map((flag, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                <span className="text-rose-500 font-bold select-none">✕</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Commitment Signals */}
        <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/70">
          <p className="text-xs font-mono uppercase tracking-wider text-emerald-800 font-bold mb-2 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Willingness-to-Pay Commitment Tests
          </p>
          <ul className="space-y-1.5">
            {wtpSignals.map((sig, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                <span className="text-emerald-600 font-bold select-none">✓</span>
                <span>{sig}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
});

// Normalizer helper for robust list extraction from varied model outputs
function normalizeSwotList(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") {
          return item.text || item.point || item.title || item.description || "";
        }
        return String(item).trim();
      })
      .filter((s) => s && s.length > 0);
  }
  if (typeof raw === "string") {
    return raw
      .split(/\n|•|;/)
      .map((s) => s.replace(/^\s*[-*\d.]+\s*/, "").trim())
      .filter((s) => s.length > 1);
  }
  return [];
}

export const SwotAnalysisMatrix = memo(function SwotAnalysisMatrix({
  swotAnalysis,
  ideaAnalysis,
  marketResearch,
  competitorWeaknessAnalysis,
  customerPersona,
  blueprint,
}) {
  const rawSwot = swotAnalysis || blueprint?.swotAnalysis || {};

  const strengths = useMemo(() => {
    const parsed = normalizeSwotList(
      rawSwot?.strengths || rawSwot?.Strengths || rawSwot?.strength || rawSwot?.s
    );
    if (parsed.length >= 3) return parsed;
    const list = [...parsed];
    if (ideaAnalysis?.feasibility && !list.includes(ideaAnalysis.feasibility)) {
      list.push(ideaAnalysis.feasibility);
    }
    if (competitorWeaknessAnalysis?.[0]?.suggestedDifferentiation && !list.includes(competitorWeaknessAnalysis[0].suggestedDifferentiation)) {
      list.push(competitorWeaknessAnalysis[0].suggestedDifferentiation);
    }
    if (blueprint?.pitch?.elevatorPitch && !list.includes(blueprint.pitch.elevatorPitch)) {
      list.push(`Core Value Proposition: ${blueprint.pitch.elevatorPitch}`);
    }
    list.push("Lean serverless cloud footprint with low initial burn and high operational gross margins (85%+).");
    list.push("Agile deployment velocity and specialized workflow focus compared to legacy bloated incumbents.");
    return Array.from(new Set(list)).slice(0, 4);
  }, [rawSwot, ideaAnalysis, competitorWeaknessAnalysis, blueprint]);

  const weaknesses = useMemo(() => {
    const parsed = normalizeSwotList(
      rawSwot?.weaknesses || rawSwot?.Weaknesses || rawSwot?.weakness || rawSwot?.w
    );
    if (parsed.length >= 3) return parsed;
    const list = [...parsed];
    if (blueprint?.viabilityScorecard?.fatalRiskTraps?.length > 0) {
      list.push(blueprint.viabilityScorecard.fatalRiskTraps[0]);
    }
    list.push("Initial cold-start distribution hurdle and unproven organic search domain authority.");
    list.push("Reliance on upstream foundation AI model API pricing, rate limits, and latency SLAs.");
    list.push("Early lack of proprietary user behavioral feedback loops prior to reaching 1,000 active cohorts.");
    list.push("Single-founder or small-team bandwidth requiring disciplined focus on high-leverage workflows.");
    return Array.from(new Set(list)).slice(0, 4);
  }, [rawSwot, blueprint]);

  const opportunities = useMemo(() => {
    const parsed = normalizeSwotList(
      rawSwot?.opportunities || rawSwot?.Opportunities || rawSwot?.opportunity || rawSwot?.o
    );
    if (parsed.length >= 3) return parsed;
    const list = [...parsed];
    if (marketResearch?.opportunities?.length > 0) {
      marketResearch.opportunities.forEach((opp) => {
        if (!list.includes(opp)) list.push(opp);
      });
    }
    list.push("Expansion from single-player founder utility into collaborative multi-seat enterprise team workflows.");
    list.push("Building programmatic API integrations and export plugins for compounding user workflow lock-in.");
    list.push("Capitalizing on widespread customer dissatisfaction with expensive, non-AI legacy incumbent pricing.");
    return Array.from(new Set(list)).slice(0, 4);
  }, [rawSwot, marketResearch]);

  const threats = useMemo(() => {
    const parsed = normalizeSwotList(
      rawSwot?.threats || rawSwot?.Threats || rawSwot?.threat || rawSwot?.t
    );
    if (parsed.length >= 3) return parsed;
    const list = [...parsed];
    const compList = toSafeArray(marketResearch?.competitors, []);
    if (compList.length > 0) {
      list.push(`Fast-follow feature replication and bundling from established incumbents like ${compList.slice(0, 2).join(", ")}.`);
    }
    list.push("Foundation LLM providers natively integrating vertical capabilities into core base models.");
    list.push("Rising customer acquisition costs (CAC) across competitive search and paid social distribution channels.");
    list.push("Commoditization risks if proprietary domain context and personalized telemetry are omitted.");
    return Array.from(new Set(list)).slice(0, 4);
  }, [rawSwot, marketResearch]);

  return <SwotView strengths={strengths} weaknesses={weaknesses} opportunities={opportunities} threats={threats} />;
});

export const PortersFiveForcesBreakdown = memo(function PortersFiveForcesBreakdown({
  portersFiveForces,
}) {
  const defaultAnalysis = {
    buyerPower: { level: "Moderate", analysis: "Buyers have alternatives, but high switching friction can be built via deeply integrated workflows." },
    supplierPower: { level: "Low", analysis: "Foundational AI models and cloud hosts are highly commoditized, reducing supplier lock-in risk." },
    competitiveRivalry: { level: "Moderate", analysis: "Incumbents exist but move slowly, leaving agile beachheads open for modern UX." },
    threatOfSubstitutes: { level: "Moderate", analysis: "Manual spreadsheets and fragmented scripts remain primary alternatives to displace." },
    threatOfNewEntry: { level: "Moderate", analysis: "Low code barriers exist, but proprietary data integrations form defensible moats." },
  };

  const forces = [
    { key: "buyerPower", label: "Buyer Bargaining Power", data: portersFiveForces?.buyerPower || defaultAnalysis.buyerPower },
    { key: "supplierPower", label: "Supplier Bargaining Power", data: portersFiveForces?.supplierPower || defaultAnalysis.supplierPower },
    { key: "competitiveRivalry", label: "Competitive Rivalry", data: portersFiveForces?.competitiveRivalry || defaultAnalysis.competitiveRivalry },
    { key: "threatOfSubstitutes", label: "Threat of Substitutes", data: portersFiveForces?.threatOfSubstitutes || defaultAnalysis.threatOfSubstitutes },
    { key: "threatOfNewEntry", label: "Threat of New Entrants", data: portersFiveForces?.threatOfNewEntry || defaultAnalysis.threatOfNewEntry },
  ];

  const getBadgeStyle = (level = "Moderate") => {
    const l = String(level || "Moderate").toLowerCase();
    if (l.includes("low")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (l.includes("high")) return "bg-rose-50 text-rose-700 border-rose-200";
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-2xs">
            <Layers size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Porter's Five Forces Industry Defensibility
            </h3>
            <p className="text-xs text-slate-500">
              Structural analysis of industry rivalry, entry barriers, and pricing power.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono uppercase bg-slate-50 text-slate-500 px-2 py-1 rounded border border-slate-200 font-bold hidden sm:inline-block">
          Harvard Framework
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {forces.map((f, i) => (
          <div
            key={f.key}
            className={`p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:border-orange-300 transition-all ${
              i === 4 ? "sm:col-span-2 lg:col-span-1" : ""
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 truncate">
                {f.label}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border shrink-0 ${getBadgeStyle(f.data?.level)}`}>
                {toSafeString(f.data?.level, "Moderate")}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">{toSafeString(f.data?.analysis, "Moderate structural impact.")}</p>
          </div>
        ))}
      </div>
    </div>
  );
});

export const MarketSizingSection = memo(function MarketSizingSection({
  marketSizing,
  viabilityScorecard,
  ideaTitle,
}) {
  const tam = marketSizing?.tam || "$14.2B";
  const sam = marketSizing?.sam || "$2.1B";
  const som = marketSizing?.som || "$48M";

  const tamVal = typeof tam === "string" ? tam : toSafeString(tam?.value, "$14.2B");
  const tamDesc = typeof tam === "object" ? toSafeString(tam?.description, "TAM (Total Addressable Market): Global sector market opportunity.") : "TAM (Total Addressable Market): Global sector market opportunity.";

  const samVal = typeof sam === "string" ? sam : toSafeString(sam?.value, "$2.1B");
  const samDesc = typeof sam === "object" ? toSafeString(sam?.description, "SAM (Serviceable Available Market): Addressable beachhead segment.") : "SAM (Serviceable Available Market): Addressable beachhead segment.";

  const somVal = typeof som === "string" ? som : toSafeString(som?.value, "$48M");
  const somDesc = typeof som === "object" ? toSafeString(som?.description, "SOM (Serviceable Obtainable Market): Realistic 1–3 year capture target.") : "SOM (Serviceable Obtainable Market): Realistic 1–3 year capture target.";

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
            <DollarSign size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Market Sizing & Venture Viability Architecture
            </h3>
            <p className="text-xs text-slate-500">
              TAM, SAM, SOM bottom-up market sizing projections and institutional venture viability index.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono uppercase bg-slate-50 text-slate-500 px-2 py-1 rounded border border-slate-200 font-bold hidden sm:inline-block">
          Bottom-Up Financials & Viability
        </span>
      </div>

      {/* Signature VenturusAI Visuals: 3-Circle Market Sizing Bubbles & Viability Speedometer Gauge Stacked Vertically */}
      <div className="flex flex-col gap-6 mb-6">
        <VenturusMarketSizeBubbleChart marketSizing={marketSizing} ideaTitle={ideaTitle || "Target Market"} />
        <VenturusViabilityGaugeChart viabilityScorecard={viabilityScorecard} ideaTitle={ideaTitle || "this Venture"} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* TAM */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-50/40 via-white to-white border border-orange-200/70 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-600">
              TAM (Total Addressable Market)
            </span>
            <span className="text-[10px] font-mono text-orange-700 bg-orange-100/80 px-2 py-0.5 rounded font-bold">
              Global
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight my-2">
            {tamVal}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">{tamDesc}</p>
        </div>

        {/* SAM */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/40 via-white to-white border border-amber-200/70 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700">
              SAM (Serviceable Available Market)
            </span>
            <span className="text-[10px] font-mono text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded font-bold">
              Segment
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight my-2">
            {samVal}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">{samDesc}</p>
        </div>

        {/* SOM */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/40 via-white to-white border border-emerald-200/70 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700">
              SOM (Serviceable Obtainable Market)
            </span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded font-bold">
              Year 1–3
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight my-2">
            {somVal}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">{somDesc}</p>
        </div>
      </div>
    </div>
  );
});


// ---------------------------------------------------------------------------
// VENTURUSAI FEATURE: 360° Macro PESTEL Analysis Framework
// ---------------------------------------------------------------------------
export const PestelAnalysisMatrix = memo(function PestelAnalysisMatrix({
  ideaAnalysis,
  marketResearch,
}) {
  const domain = ideaAnalysis?.domain || "Technology / B2B SaaS";

  const pillars = [
    {
      code: "P",
      title: "Political",
      rating: "Low Friction",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      points: [
        "Government incentives for AI digital transformation and enterprise productivity.",
        "Cross-border sovereign cloud storage and AI compute sovereignty policies.",
      ],
    },
    {
      code: "E",
      title: "Economic",
      rating: "High ROI Tailwind",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      points: [
        "Tight enterprise budgets favoring fast ROI tooling over headcount expansion.",
        "Sub-12-month payback periods demanded by CFOs for software procurement.",
      ],
    },
    {
      code: "S",
      title: "Social",
      rating: "Cultural Shift",
      badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
      points: [
        "Widespread founder and knowledge worker acceptance of autonomous copilots.",
        "Demand for transparency, trust, and human-in-the-loop auditability.",
      ],
    },
    {
      code: "T",
      title: "Technological",
      rating: "Accelerating",
      badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
      points: [
        "Breakthrough reasoning in frontier models like Google Gemini 3.7 Flash.",
        "Decreasing token inference costs making complex 12-agent synthesis viable.",
      ],
    },
    {
      code: "E",
      title: "Environmental",
      rating: "Neutral",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      points: [
        "Growing scrutiny on datacenters prompting energy-efficient inference architectures.",
        "Zero-hardware pure cloud deployment minimizing physical supply chain impact.",
      ],
    },
    {
      code: "L",
      title: "Legal & Regulatory",
      rating: "Compliance Gate",
      badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
      points: [
        "GDPR, CCPA, and emerging global AI regulatory compliance standards.",
        "Clear contractual terms needed regarding IP ownership of AI-assisted outputs.",
      ],
    },
  ];

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <TrendingUp size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                360° Macro PESTEL Strategic Audit
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                CREDIBILITY: 96%
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Macro-environmental evaluation across political, economic, social, tech, eco, and legal vectors for {domain}.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
          Signal: Bullish Tailwinds
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pillars.map((p, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/80 hover:border-slate-300 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-md bg-white border border-slate-200 text-slate-900 text-xs font-mono font-black flex items-center justify-center shadow-2xs">
                    {p.code}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{p.title}</span>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${p.badgeClass}`}>
                  {p.rating}
                </span>
              </div>
              <ul className="space-y-1.5">
                {p.points.map((pt, i) => (
                  <li key={i} className="text-xs text-slate-600 leading-relaxed flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// ---------------------------------------------------------------------------
// VENTURUSAI FEATURE: Strategic Lean Canvas Matrix
// ---------------------------------------------------------------------------
export const LeanCanvasMatrix = memo(function LeanCanvasMatrix({
  ideaAnalysis,
  productPlan,
  marketResearch,
  costEstimator,
  businessStrategy,
  swotAnalysis,
  pitch,
  goToMarket,
  customerPersona,
  viabilityScorecard,
  competitorWeaknessAnalysis,
}) {
  const problem = ideaAnalysis?.problem || "Severe operational friction and resource drain from legacy manual workflows.";
  
  const existingAlternatives = useMemo(() => {
    if (Array.isArray(marketResearch?.competitors) && marketResearch.competitors.length > 0) {
      return marketResearch.competitors.slice(0, 3).join(", ");
    }
    if (Array.isArray(competitorWeaknessAnalysis) && competitorWeaknessAnalysis.length > 0) {
      return competitorWeaknessAnalysis.map((c) => c.competitor).filter(Boolean).slice(0, 3).join(", ");
    }
    return "Legacy spreadsheets, fragmented point solutions, manual ad-hoc methods.";
  }, [marketResearch?.competitors, competitorWeaknessAnalysis]);

  const solution = productPlan?.mvpFeatures?.[0] || ideaAnalysis?.goal || "Autonomous solution streamlining end-to-end workflows with intelligent automation.";
  
  const topFeatures = useMemo(() => {
    if (Array.isArray(productPlan?.mvpFeatures) && productPlan.mvpFeatures.length > 1) {
      return productPlan.mvpFeatures.slice(1, 3).join(" • ");
    }
    return productPlan?.developmentPriority || "Core automation engine with verified outputs.";
  }, [productPlan?.mvpFeatures, productPlan?.developmentPriority]);

  const keyMetrics = useMemo(() => {
    const scores = [];
    if (viabilityScorecard?.marketDemandScore) scores.push(`Demand Index: ${viabilityScorecard.marketDemandScore}/100`);
    if (viabilityScorecard?.monetizationScore) scores.push(`Monetization: ${viabilityScorecard.monetizationScore}/100`);
    if (scores.length > 0) return scores.join(" • ");
    return "Time saved per workflow, Net Revenue Retention (NRR > 115%), LTV:CAC > 3:1";
  }, [viabilityScorecard]);

  const uvp = pitch?.elevatorPitch || ideaAnalysis?.goal || "10x faster execution and massive overhead reduction through domain-specific intelligence.";
  
  const highLevelConcept = ideaAnalysis?.domain
    ? `The modern standard for ${ideaAnalysis.domain}.`
    : (pitch?.executiveSummary ? pitch.executiveSummary.slice(0, 110) + "..." : "Turnkey high-leverage execution platform.");

  const unfairMoat = useMemo(() => {
    if (Array.isArray(swotAnalysis?.strengths) && swotAnalysis.strengths.length > 0) {
      return swotAnalysis.strengths[0];
    }
    if (Array.isArray(competitorWeaknessAnalysis) && competitorWeaknessAnalysis[0]?.suggestedDifferentiation) {
      return competitorWeaknessAnalysis[0].suggestedDifferentiation;
    }
    return "Proprietary vertical domain synthesis & defensible user workflow lock-in.";
  }, [swotAnalysis?.strengths, competitorWeaknessAnalysis]);

  const moatSecondary = useMemo(() => {
    if (Array.isArray(swotAnalysis?.strengths) && swotAnalysis.strengths.length > 1) {
      return swotAnalysis.strengths[1];
    }
    return "High customer switching barrier via compounding historical data and integrations.";
  }, [swotAnalysis?.strengths]);

  const channels = useMemo(() => {
    if (Array.isArray(goToMarket?.platforms) && goToMarket.platforms.length > 0) {
      return goToMarket.platforms.map((p) => (typeof p === "string" ? p : p?.name)).filter(Boolean).slice(0, 3).join(", ");
    }
    if (Array.isArray(businessStrategy?.marketingChannels) && businessStrategy.marketingChannels.length > 0) {
      return businessStrategy.marketingChannels.slice(0, 3).join(", ");
    }
    return "Founder outbound, niche communities, programmatic search.";
  }, [goToMarket?.platforms, businessStrategy?.marketingChannels]);

  const channelAudience = typeof goToMarket?.targetAudience === "string" && goToMarket.targetAudience.trim()
    ? goToMarket.targetAudience
    : "High-intent early adopters searching for specialized solutions.";

  const customerSegments = useMemo(() => {
    if (Array.isArray(customerPersona?.targetUsers) && customerPersona.targetUsers.length > 0) {
      return customerPersona.targetUsers.join(", ");
    }
    if (customerPersona?.userProfile) {
      return customerPersona.userProfile.slice(0, 110) + "...";
    }
    return ideaAnalysis?.domain ? `Operators and leaders in ${ideaAnalysis.domain}` : "Primary operators and key economic decision makers.";
  }, [customerPersona, ideaAnalysis?.domain]);

  const earlyAdopters = useMemo(() => {
    if (Array.isArray(customerPersona?.targetUsers) && customerPersona.targetUsers.length > 0) {
      return `${customerPersona.targetUsers[0]} facing urgent workflow pain points.`;
    }
    return "Early-stage adopters actively seeking alternatives to legacy tooling.";
  }, [customerPersona]);

  const costStructure = useMemo(() => {
    if (costEstimator?.estimatedMonthlyCost) {
      return `Estimated Cloud Burn: ${costEstimator.estimatedMonthlyCost}/mo (Yearly: ${costEstimator.estimatedYearlyCost || "N/A"})`;
    }
    return "Serverless lean architecture (~$15-50/mo during initial pilot phase).";
  }, [costEstimator]);

  const revenueStreams = useMemo(() => {
    if (businessStrategy?.revenueModel) return businessStrategy.revenueModel;
    if (businessStrategy?.pricingIdea) return businessStrategy.pricingIdea.slice(0, 110);
    return "Tiered SaaS subscription with usage-based expansion tiers.";
  }, [businessStrategy]);

  const pricingDetails = useMemo(() => {
    if (businessStrategy?.pricingIdea) return businessStrategy.pricingIdea;
    return "Self-serve starter tier + custom enterprise plan with SLA guarantees.";
  }, [businessStrategy]);

  return <LeanCanvasView boxes={[
    { n: "01", label: "Problem", tag: "Core pain", main: problem, subLabel: "Existing alternatives", sub: existingAlternatives },
    { n: "02", label: "Solution", tag: "MVP wedge", main: solution, subLabel: "Key MVP capabilities", sub: topFeatures },
    { n: "03", label: "Unique value prop", tag: "Primary hook", main: uvp, subLabel: "High-level pitch", sub: `"${highLevelConcept}"`, hot: true },
    { n: "04", label: "Unfair moat", tag: "Defensibility", main: unfairMoat, subLabel: "Defensive wedge", sub: moatSecondary },
    { n: "05", label: "Customer segments", tag: "Target ICP", main: customerSegments, subLabel: "Early adopter beachhead", sub: earlyAdopters },
    { n: "06", label: "Channels", tag: "Distribution", main: channels, subLabel: "Acquisition focus", sub: channelAudience },
    { n: "07", label: "Key metrics", tag: "North star", main: keyMetrics, subLabel: "Target benchmark", sub: "LTV:CAC > 3.0x, payback < 6 months, low monthly churn." },
    { n: "08", label: "Cost structure", tag: "Burn and capex", main: costStructure, subLabel: "Primary cost drivers", sub: "Model inference, data storage, auth, domain, paid outbound." },
    { n: "09", label: "Revenue streams", tag: "Monetization", main: revenueStreams, subLabel: "Pricing model", sub: pricingDetails },
  ]} />;
});

// ---------------------------------------------------------------------------
// 2. UPMETRICS FEATURE: Interactive Financial Simulator & Break-Even Calculator
// (Imported and re-exported from BlueprintPhase5.jsx)
// ---------------------------------------------------------------------------
export { UpmetricsFinancialSimulator };

// ---------------------------------------------------------------------------
// 3. FOUNDERPAL FEATURE: High-Contrast Founder Outreach Swipe File
// ---------------------------------------------------------------------------

export const FounderPalSwipeFile = memo(function FounderPalSwipeFile({ gtm, pitch, onToast }) {
  const [activeTab, setActiveTab] = useState("email");
  const [copiedField, setCopiedField] = useState(null);

  const copyToClipboard = useCallback(
    (text, label) => {
      navigator.clipboard?.writeText(text);
      setCopiedField(label);
      if (onToast) onToast(`${label} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 1800);
    },
    [onToast]
  );

  const templates = useMemo(() => {
    return {
      email: {
        id: "email",
        title: "Cold Outreach Email",
        badge: "B2B Direct Response",
        subject: `Quick question regarding ${gtm?.targetAudience || "your workflow"}`,
        body:
          gtm?.coldEmailTemplate ||
          `Hi {{FirstName}},\n\nSaw your work on {{Company}} and noticed how teams in {{Industry}} struggle with ${gtm?.targetAudience || "scaling their workflow"}.\n\nWe built a solution that automates this end-to-end, cutting execution time by 80% without added headcount.\n\nWould you be open to a 5-minute Loom preview this Thursday?\n\nBest,\n[Your Name]`,
        tip: "Send on Tuesday or Thursday between 8:30 AM – 10:00 AM in prospect's local timezone.",
      },
      dm: {
        id: "dm",
        title: "LinkedIn InMail / DM",
        badge: "Casual Founder-to-Founder",
        subject: "Direct Message",
        body:
          gtm?.linkedInDmTemplate ||
          `Hey {{FirstName}}, loved your recent post on {{Topic}}! Working on an AI co-pilot designed specifically for {{Role}}s to solve ${gtm?.targetAudience || "workflow bottlenecks"}. Would love to share early access and get your brutal feedback if you have 3 mins?`,
        tip: "Keep below 300 characters to ensure 100% of the text fits in mobile push notifications.",
      },
      reddit: {
        id: "reddit",
        title: "Reddit Launch Post",
        badge: "Community Value Drop",
        subject: `I spent 30 days building a tool to fix ${gtm?.targetAudience || "a huge founder headache"} [Open Source / Free Beta]`,
        body:
          gtm?.redditLaunchPost ||
          `Hey r/startups,\n\nLike many of you, I got sick of wasting 15+ hours every week on repetitive workflow setup.\n\nSo I built this lightweight tool that does it in 60 seconds.\n\nHere is what I learned building it:\n1. Keep cloud costs under $10/mo\n2. Automate boring setup first\n3. Talk to 20 users before writing complex code\n\nTry it free here: [Link] — roast my landing page!`,
        tip: "Post to r/SaaS, r/startups, or r/SideProject with high-effort founder journey context.",
      },
      twitter: {
        id: "twitter",
        title: "Twitter / X Thread Starter",
        badge: "Viral Hook Format",
        subject: "Hook Tweet",
        body:
          gtm?.twitterLaunchPost ||
          `Most founders waste 40 hours on tasks that AI can solve in 30 seconds.\n\nHere is the exact blueprint I used to automate ${gtm?.targetAudience || "the startup workflow"} from scratch (step-by-step breakdown) 🧵👇`,
        tip: "Include a 5-second screen recording GIF in the hook tweet for 3.4x higher retweets.",
      },
      pitch: {
        id: "pitch",
        title: "60-Second Investor Elevator Pitch",
        badge: "Verbal Pitch & Demo Day",
        subject: "Verbal Script",
        body:
          pitch?.elevatorPitch ||
          "We help founders validate, architect, and launch high-conviction startups in 90 seconds instead of 6 months.",
        tip: "Deliver with high conviction in under 45 seconds to leave room for partner Q&A.",
      },
    };
  }, [gtm, pitch]);

  const current = templates[activeTab] || templates.email;

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                FounderPal™ 1-Click Outreach Swipe File
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-50 text-orange-700 border border-orange-200">
                1-CLICK COPY
              </span>
            </div>
            <p className="text-xs text-slate-500">
              High-converting, typography-led templates ready to copy and paste directly into Gmail, LinkedIn, or X.
            </p>
          </div>
        </div>

        {/* 1-Click Copy Main Button */}
        <button
          onClick={() =>
            copyToClipboard(
              current.subject && current.subject !== "Direct Message" && current.subject !== "Verbal Script"
                ? `Subject: ${current.subject}\n\n${current.body}`
                : current.body,
              current.title
            )
          }
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-orange-600 transition-all shadow-sm active:scale-95 self-start sm:self-center shrink-0"
        >
          {copiedField === current.title ? (
            <>
              <Check size={14} className="text-emerald-400" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy Full {current.title}</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pt-5 pb-2 -mx-2 px-2 border-b border-slate-100">
        {Object.values(templates).map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === t.id
                ? "bg-orange-500 text-white shadow-xs font-semibold"
                : "bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/70"
            }`}
          >
            {t.title}
          </button>
        ))}
      </div>

      {/* Active Template Card */}
      <div className="mt-5 p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 font-sans space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
            {current.badge}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {toSafeString(current?.body).length} characters • ~{Math.ceil(String(current?.body || "").split(/\s+/).filter(Boolean).length / 200)} min read
          </span>
        </div>

        {current.subject && current.subject !== "Direct Message" && current.subject !== "Verbal Script" && (
          <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Subject Line</span>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{current.subject}</p>
            </div>
            <button
              onClick={() => copyToClipboard(current.subject, "Subject line")}
              className="text-xs font-mono font-medium text-slate-500 hover:text-orange-600 shrink-0 flex items-center gap-1"
            >
              {copiedField === "Subject line" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              <span>Copy Subject</span>
            </button>
          </div>
        )}

        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-800 leading-relaxed">
            {current.body}
          </pre>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-sans bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
          <span className="font-mono text-amber-700 font-bold uppercase text-[10px]">Founder Tip:</span>
          <span>{current.tip}</span>
        </div>
      </div>
    </div>
  );
});

// ---------------------------------------------------------------------------
// 4. CHATPRD FEATURE: Continuous Executive PRD Dossier View
// ---------------------------------------------------------------------------

export const ChatPrdDossierView = memo(function ChatPrdDossierView({
  blueprint,
  originalIdea,
  onSwitchToDashboard,
  onExportPdf,
  onExportMarkdown,
  onToast,
}) {
  const {
    ideaAnalysis,
    marketResearch,
    customerPersona,
    productPlan,
    technicalArchitecture,
    businessStrategy,
    pitch,
    roadmap,
    goToMarket,
    launchChecklist,
    costEstimator,
    revenueSimulator,
    competitorWeaknessAnalysis,
  } = blueprint;

  const [activeHeading, setActiveHeading] = useState("summary");

  const scrollToSection = (id) => {
    setActiveHeading(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const copyFullPrd = () => {
    const text = `# Executive PRD & Startup Blueprint: ${pitch?.elevatorPitch || originalIdea}
    
## 1. Problem Statement
${ideaAnalysis?.problem || originalIdea}

## 2. Target Market & User Persona
${customerPersona?.targetUsers?.join(", ") || "Target founders"}
Pain points: ${customerPersona?.painPoints?.join("; ") || "Identified"}

## 3. Product Specification (MVP)
${productPlan?.mvpFeatures?.map((f) => `- ${f}`).join("\n") || "Core features"}

## 4. Technical Architecture
- Frontend: ${technicalArchitecture?.frontend || "React / Vite"}
- Backend: ${technicalArchitecture?.backend || "Node / Express"}
- Database: ${technicalArchitecture?.database || "PostgreSQL / Supabase"}
- Hosting: ${technicalArchitecture?.hosting || "Vercel"}

## 5. Financial & Unit Economics
- Monthly Burn: ${costEstimator?.estimatedMonthlyCost || "$0"}
- Pricing Model: ${businessStrategy?.pricingIdea || "SaaS subscription"}`;

    navigator.clipboard?.writeText(text);
    if (onToast) onToast("Full PRD copied as Markdown");
  };

  const TOC = [
    { id: "summary", label: "01. Executive Brief" },
    { id: "viability", label: "02. Viability & SWOT" },
    { id: "market", label: "03. Market & Competitors" },
    { id: "persona", label: "04. Customer Personas" },
    { id: "product", label: "05. Product PRD Specs" },
    { id: "tech", label: "06. Technical Architecture" },
    { id: "financials", label: "07. Unit Economics" },
    { id: "gtm", label: "08. GTM & Outreach" },
    { id: "roadmap", label: "09. Launch Roadmap" },
  ];

  return (
    <div className="mt-6">
      {/* Top PRD Banner & Quick Actions */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 mb-8 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-mono text-[11px] text-orange-400 uppercase tracking-widest font-bold">
            <span>ChatPRD™ Mode</span>
            <span>•</span>
            <span>Continuous Notion-Grade PRD Dossier</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Product Requirements Document (PRD)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            A unified, continuous executive document prepared for co-founders, engineers, and seed investors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={copyFullPrd}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700 transition-all shadow-xs"
          >
            <Copy size={13} />
            <span>Copy PRD</span>
          </button>
          <button
            onClick={onSwitchToDashboard}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-all shadow-xs"
          >
            <LayoutGrid size={13} />
            <span>Grid Dashboard</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Sticky Left TOC + Continuous Document */}
      <div className="lg:flex lg:gap-8 lg:items-start">
        {/* Mobile Quick-Jump Outline Bar */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none touch-scroll -mx-1 px-1">
          {TOC.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-mono font-medium border transition-all cursor-pointer whitespace-nowrap ${
                activeHeading === item.id
                  ? "bg-orange-500 text-white border-orange-500 shadow-xs font-bold"
                  : "bg-white text-slate-700 border-slate-200 hover:border-orange-300"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Left Sticky Table of Contents */}
        <aside className="hidden lg:block w-64 shrink-0 sticky top-24 self-start">
          <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-3 px-2">
              PRD Outline (ChatPRD)
            </span>
            {TOC.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center justify-between ${
                  activeHeading === item.id
                    ? "bg-orange-50 text-orange-600 font-bold border border-orange-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight size={12} className={activeHeading === item.id ? "text-orange-500" : "text-slate-300"} />
              </button>
            ))}
          </div>
        </aside>

        {/* Continuous PRD Document Body */}
        <main className="flex-1 min-w-0 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-sm space-y-12">
          {/* 01. Executive Brief */}
          <section id="summary" className="scroll-mt-28 space-y-4 pb-8 border-b border-slate-100">
            <span className="text-xs font-mono font-bold text-orange-600 uppercase tracking-wider">
              Section 01 // Executive Brief
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {pitch?.elevatorPitch || originalIdea}
            </h3>
            <div className="p-4 bg-orange-50/50 border-l-4 border-orange-500 rounded-r-xl text-slate-800 text-sm leading-relaxed font-sans">
              <strong>Executive Summary: </strong>
              {pitch?.executiveSummary || ideaAnalysis?.problem}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Target Domain</span>
                <p className="text-xs font-bold text-slate-900">{ideaAnalysis?.domain || "B2B SaaS"}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Runway Feasibility</span>
                <p className="text-xs font-bold text-emerald-600">{ideaAnalysis?.feasibility || "High Potential"}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Estimated Monthly Burn</span>
                <p className="text-xs font-bold text-indigo-600">{costEstimator?.estimatedMonthlyCost || "$0"}</p>
              </div>
            </div>
          </section>

          {/* 02. Viability & SWOT */}
          <section id="viability" className="scroll-mt-28 space-y-4 pb-8 border-b border-slate-100">
            <span className="text-xs font-mono font-bold text-orange-600 uppercase tracking-wider">
              Section 02 // Venture Viability & SWOT Matrix
            </span>
            <VentureViabilityScorecard
              ideaAnalysis={ideaAnalysis}
              marketResearch={marketResearch}
              costEstimator={costEstimator}
              originalIdea={originalIdea}
            />
            <SwotAnalysisMatrix
              ideaAnalysis={ideaAnalysis}
              marketResearch={marketResearch}
              competitorWeaknessAnalysis={competitorWeaknessAnalysis}
              customerPersona={customerPersona}
            />
          </section>

          {/* 03. Market & Competitors */}
          <section id="market" className="scroll-mt-28 space-y-4 pb-8 border-b border-slate-100">
            <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-wider">
              Section 03 // Market Intelligence & Competitive Moat
            </span>
            <h4 className="text-lg font-bold text-slate-900">Competitors & Unfair Differentiation</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-mono font-bold text-slate-700 block mb-2">Identified Competitors</span>
                <ul className="space-y-1 text-xs text-slate-600">
                  {(marketResearch?.competitors || []).map((c, i) => (
                    <li key={i}>• {c}</li>
                  ))}
                </ul>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-mono font-bold text-slate-700 block mb-2">Market Opportunities</span>
                <ul className="space-y-1 text-xs text-slate-600">
                  {(marketResearch?.opportunities || []).map((o, i) => (
                    <li key={i}>• {o}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 04. Customer Personas */}
          <section id="persona" className="scroll-mt-28 space-y-4 pb-8 border-b border-slate-100">
            <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider">
              Section 04 // Ideal Customer Profile (ICP)
            </span>
            <h4 className="text-lg font-bold text-slate-900">Target Persona & Core Pain Points</h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{customerPersona?.userProfile}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-100">
                <span className="text-xs font-mono font-bold text-indigo-900 block mb-2">Target Segments</span>
                <ul className="space-y-1 text-xs text-slate-700">
                  {(customerPersona?.targetUsers || []).map((u, i) => (
                    <li key={i}>✓ {u}</li>
                  ))}
                </ul>
              </div>
              <div className="p-4 bg-rose-50/40 rounded-xl border border-rose-100">
                <span className="text-xs font-mono font-bold text-rose-900 block mb-2">Acute Pain Points</span>
                <ul className="space-y-1 text-xs text-slate-700">
                  {(customerPersona?.painPoints || []).map((p, i) => (
                    <li key={i}>× {p}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 05. Product PRD Specs */}
          <section id="product" className="scroll-mt-28 space-y-4 pb-8 border-b border-slate-100">
            <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider">
              Section 05 // Product Requirements & Feature Specs
            </span>
            <h4 className="text-lg font-bold text-slate-900">MVP Engineering Scope</h4>
            <div className="space-y-2">
              {(productPlan?.mvpFeatures || []).map((f, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                  <span className="h-5 w-5 rounded bg-orange-100 text-orange-700 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900">{f}</p>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold">P0 Must-Have for MVP Launch</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 06. Technical Architecture */}
          <section id="tech" className="scroll-mt-28 space-y-4 pb-8 border-b border-slate-100">
            <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider">
              Section 06 // Technical Architecture
            </span>
            <h4 className="text-lg font-bold text-slate-900">System Stack & Cloud Pipeline</h4>
            <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl font-mono text-xs space-y-2">
              <p>
                <span className="text-orange-400">Frontend:</span> {technicalArchitecture?.frontend || "React / Vite / Tailwind"}
              </p>
              <p>
                <span className="text-orange-400">Backend:</span> {technicalArchitecture?.backend || "Node.js / Express"}
              </p>
              <p>
                <span className="text-orange-400">Database:</span> {technicalArchitecture?.database || "PostgreSQL / Supabase"}
              </p>
              <p>
                <span className="text-orange-400">Hosting:</span> {technicalArchitecture?.hosting || "Vercel / Railway"}
              </p>
              <p>
                <span className="text-orange-400">AI APIs:</span> {technicalArchitecture?.aiApis || "Gemini 2.5 Pro / Flash"}
              </p>
            </div>
          </section>

          {/* 07. Unit Economics */}
          <section id="financials" className="scroll-mt-28 space-y-4 pb-8 border-b border-slate-100">
            <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-wider">
              Section 07 // Financial Model & Unit Economics
            </span>
            <UpmetricsFinancialSimulator costEstimator={costEstimator} revenueSimulator={revenueSimulator} />
          </section>

          {/* 08. GTM & Outreach */}
          <section id="gtm" className="scroll-mt-28 space-y-4 pb-8 border-b border-slate-100">
            <span className="text-xs font-mono font-bold text-rose-600 uppercase tracking-wider">
              Section 08 // Go-To-Market & Founder Swipe File
            </span>
            <FounderPalSwipeFile gtm={goToMarket} pitch={pitch} onToast={onToast} />
          </section>

          {/* 09. Launch Roadmap */}
          <section id="roadmap" className="scroll-mt-28 space-y-4">
            <span className="text-xs font-mono font-bold text-rose-600 uppercase tracking-wider">
              Section 09 // Execution Roadmap
            </span>
            <div className="space-y-4">
              {(roadmap?.milestones || []).map((m, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-rose-600 uppercase">{m.week}</span>
                    <span className="text-xs font-semibold text-slate-900">{m.title}</span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {(m.tasks || []).map((t, j) => (
                      <li key={j}>• {t}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
});
