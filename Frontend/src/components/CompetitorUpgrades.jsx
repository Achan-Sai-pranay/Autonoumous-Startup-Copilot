// CompetitorUpgrades.jsx
// ---------------------------------------------------------------------------
// Advanced features stolen & upgraded from top direct competitors:
// 1. VenturusAI: Venture Viability Index & 4-Quadrant SWOT Matrix
// 2. FounderPal: High-Contrast Founder Outreach Swipe File & 1-Click Copy Station
// 3. Upmetrics: Interactive Financial & Unit Economics Simulator + Break-Even Calculator
// 4. ChatPRD: Document-meets-Dashboard Continuous Executive PRD Dossier
// ---------------------------------------------------------------------------

import { useState, useMemo, memo, useCallback } from "react";
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
// 1. VENTURUSAI FEATURE: Venture Viability Scorecard & 4-Quadrant SWOT Matrix
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// VENTURUSAI SIGNATURE CHARTS: Speedometer Gauge & 3-Circle Market Size Bubbles
// ---------------------------------------------------------------------------

function describeArcSector(cx, cy, r, R, startAngleDeg, endAngleDeg) {
  const toRad = Math.PI / 180;
  const startRad = startAngleDeg * toRad;
  const endRad = endAngleDeg * toRad;

  // Polar coordinates with 0 deg at left (-X), 90 deg at top (-Y), 180 deg at right (+X)
  const x1 = cx - R * Math.cos(startRad);
  const y1 = cy - R * Math.sin(startRad);
  const x2 = cx - R * Math.cos(endRad);
  const y2 = cy - R * Math.sin(endRad);

  const x3 = cx - r * Math.cos(endRad);
  const y3 = cy - r * Math.sin(endRad);
  const x4 = cx - r * Math.cos(startRad);
  const y4 = cy - r * Math.sin(startRad);

  const largeArc = (endAngleDeg - startAngleDeg) > 180 ? 1 : 0;

  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${R} ${R} 0 ${largeArc} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L ${x3.toFixed(1)} ${y3.toFixed(1)} A ${r} ${r} 0 ${largeArc} 0 ${x4.toFixed(1)} ${y4.toFixed(1)} Z`;
}

// ---------------------------------------------------------------------------
// 1. VENTURUSAI VIABILITY SPEEDOMETER GAUGE CHART
// ---------------------------------------------------------------------------
export const VenturusViabilityGaugeChart = memo(function VenturusViabilityGaugeChart({
  viabilityScorecard,
  ideaTitle,
}) {
  const score = Math.max(0, Math.min(100, viabilityScorecard?.score ?? 84));
  const marketScore = Math.max(0, Math.min(100, viabilityScorecard?.marketDemandScore ?? 88));
  const techScore = Math.max(0, Math.min(100, viabilityScorecard?.technicalFeasibilityScore ?? 82));
  const capitalScore = Math.max(0, Math.min(100, viabilityScorecard?.monetizationScore ?? 85));
  const verdict = viabilityScorecard?.verdict || "Proceed";

  // SVG Gauge geometry (viewBox 0 0 320 185)
  const cx = 160;
  const cy = 152;
  const R = 125;
  const r = 75;

  // 3 Colored sectors in White & Orange theme from 0 deg (left) to 180 deg (right)
  const sector1Path = describeArcSector(cx, cy, r, R, 3, 57);   // Soft Warm Amber-Peach
  const sector2Path = describeArcSector(cx, cy, r, R, 63, 117); // Radiant Vibrant Orange
  const sector3Path = describeArcSector(cx, cy, r, R, 123, 177); // Deep Electric Orange

  // Dynamic Needle coordinates
  const needleAngleDeg = (score / 100) * 180;
  const needleRad = needleAngleDeg * (Math.PI / 180);
  const tipLength = R - 8;
  const tipX = cx - tipLength * Math.cos(needleRad);
  const tipY = cy - tipLength * Math.sin(needleRad);

  const perpRad = needleRad + Math.PI / 2;
  const base1X = cx - 7 * Math.cos(perpRad);
  const base1Y = cy - 7 * Math.sin(perpRad);
  const base2X = cx + 7 * Math.cos(perpRad);
  const base2Y = cy + 7 * Math.sin(perpRad);
  const needlePolygon = `${tipX.toFixed(1)},${tipY.toFixed(1)} ${base1X.toFixed(1)},${base1Y.toFixed(1)} ${base2X.toFixed(1)},${base2Y.toFixed(1)}`;

  const cleanTitle = ideaTitle
    ? ideaTitle.length > 55
      ? ideaTitle.slice(0, 55) + "..."
      : ideaTitle
    : "this Venture";

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
      {/* Chart Title matching screenshot */}
      <h3 className="text-base sm:text-lg font-bold text-slate-900 text-center tracking-tight mb-2">
        Viability for {cleanTitle}
      </h3>

      {/* SVG Semicircle Speedometer Gauge in White & Orange */}
      <div className="relative flex flex-col items-center justify-center my-auto py-3">
        <svg viewBox="0 0 320 185" className="w-full max-w-[320px] sm:max-w-[360px] overflow-visible">
          {/* Sector 1: Soft Warm Amber-Peach */}
          <path d={sector1Path} fill="#fdba74" className="hover:opacity-90 transition-opacity" />
          {/* Sector 2: Vibrant Orange */}
          <path d={sector2Path} fill="#fb923c" className="hover:opacity-90 transition-opacity" />
          {/* Sector 3: Deep Electric Orange */}
          <path d={sector3Path} fill="#ea580c" className="hover:opacity-90 transition-opacity" />

          {/* Dynamic Needle in Sleek Charcoal with Orange Accent */}
          <polygon points={needlePolygon} fill="#0f172a" className="transition-all duration-700 ease-out drop-shadow-md" />

          {/* Pivot Center Cap */}
          <circle cx={cx} cy={cy} r={14} fill="#0f172a" />
          <circle cx={cx} cy={cy} r={6} fill="#ea580c" />
        </svg>

        {/* Center Score Readout */}
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-3xl font-black font-mono text-orange-600 leading-none">
            {score}
          </span>
          <span className="text-xs font-mono text-slate-400 font-semibold">/ 100</span>
          <span
            className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
              verdict === "Proceed"
                ? "bg-orange-50 text-orange-700 border-orange-200"
                : verdict === "Pivot Recommended"
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            {verdict}
          </span>
        </div>
      </div>

      {/* Footer Thesis matching screenshot */}
      <div className="mt-4 pt-3 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500 leading-relaxed font-sans max-w-md mx-auto">
          The viability score is a proprietary composite rating based on Market Demand ({marketScore}/100), Technical Feasibility ({techScore}/100), and Monetization Readiness ({capitalScore}/100).
        </p>

        {/* 3 Micro Sub-Score Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
          <span className="px-2.5 py-1 rounded-xl text-[11px] font-mono bg-orange-50 text-orange-800 border border-orange-200 font-semibold">
            Demand: <strong>{marketScore}%</strong>
          </span>
          <span className="px-2.5 py-1 rounded-xl text-[11px] font-mono bg-slate-50 text-slate-700 border border-slate-200 font-semibold">
            Tech: <strong>{techScore}%</strong>
          </span>
          <span className="px-2.5 py-1 rounded-xl text-[11px] font-mono bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
            Monetization: <strong>{capitalScore}%</strong>
          </span>
        </div>
      </div>
    </div>
  );
});

// ---------------------------------------------------------------------------
// 2. VENTURUSAI 3-CIRCLE BUBBLE MARKET SIZING CHART (White & Orange Theme)
// ---------------------------------------------------------------------------
export const VenturusMarketSizeBubbleChart = memo(function VenturusMarketSizeBubbleChart({
  marketSizing,
  ideaTitle,
}) {
  const tam = marketSizing?.tam || {
    value: "258M",
    description: "Million potential customers globally across the total addressable market",
  };
  const sam = marketSizing?.sam || {
    value: "51M",
    description: "Million potential customers in primary beachhead language and ICP",
  };
  const som = marketSizing?.som || {
    value: "13M",
    description: "Million potential customers in initial 1–3 year serviceable target regions",
  };

  const cleanTitle = ideaTitle
    ? ideaTitle.length > 55
      ? ideaTitle.slice(0, 55) + "..."
      : ideaTitle
    : "this Venture";

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
      {/* Chart Title matching screenshot */}
      <h3 className="text-base sm:text-lg font-bold text-slate-900 text-center tracking-tight mb-2">
        Market size estimations for {cleanTitle}
      </h3>

      {/* 3 Overlapping Orange Bubble Circles — guaranteed round with shrink-0 & aspect-square */}
      <div className="flex items-end justify-center -space-x-4 sm:-space-x-6 pt-6 pb-4 my-auto">
        {/* TAM Circle: Largest, Vibrant Brand Orange */}
        <div className="w-36 h-36 sm:w-44 sm:h-44 shrink-0 aspect-square rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white flex flex-col items-center justify-center shadow-lg shadow-orange-500/20 hover:scale-105 transition-transform duration-300 z-10 select-none text-center px-2 border-2 border-orange-400/40">
          <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight leading-none">
            {tam.value}
          </span>
          <span className="text-xs sm:text-sm font-extrabold tracking-wider mt-1.5 opacity-95">
            TAM
          </span>
        </div>

        {/* SAM Circle: Medium, Warm Amber-Orange */}
        <div className="w-28 h-28 sm:w-36 sm:h-36 shrink-0 aspect-square rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white flex flex-col items-center justify-center shadow-md shadow-orange-500/15 hover:scale-105 transition-transform duration-300 z-20 select-none text-center px-2 border-2 border-amber-300/40">
          <span className="text-xl sm:text-2xl font-black font-mono tracking-tight leading-none">
            {sam.value}
          </span>
          <span className="text-xs sm:text-sm font-extrabold tracking-wider mt-1.5 opacity-95">
            SAM
          </span>
        </div>

        {/* SOM Circle: Smallest, Deep Terracotta Burnt Orange */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 aspect-square rounded-full bg-gradient-to-br from-orange-800 to-amber-900 text-white flex flex-col items-center justify-center shadow-sm hover:scale-105 transition-transform duration-300 z-30 select-none text-center px-1 border-2 border-orange-700/40">
          <span className="text-lg sm:text-xl font-black font-mono tracking-tight leading-none">
            {som.value}
          </span>
          <span className="text-[11px] sm:text-xs font-extrabold tracking-wider mt-1 opacity-95">
            SOM
          </span>
        </div>
      </div>

      {/* Downward Stem Lines and Clean Explanatory Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-4 pt-4 border-t border-slate-100 text-center">
        {/* TAM Stem + Note */}
        <div className="flex flex-col items-center">
          <div className="w-0.5 h-6 sm:h-8 bg-orange-500 mb-1" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-orange-600 font-bold block">
            TAM (Total Addressable Market)
          </span>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed font-sans">
            {tam.description}
          </p>
        </div>

        {/* SAM Stem + Note */}
        <div className="flex flex-col items-center">
          <div className="w-0.5 h-6 sm:h-8 bg-amber-500 mb-1" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-700 font-bold block">
            SAM (Serviceable Available Market)
          </span>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed font-sans">
            {sam.description}
          </p>
        </div>

        {/* SOM Stem + Note */}
        <div className="flex flex-col items-center">
          <div className="w-0.5 h-6 sm:h-8 bg-orange-800 mb-1" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-orange-800 font-bold block">
            SOM (Serviceable Obtainable Market)
          </span>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed font-sans">
            {som.description}
          </p>
        </div>
      </div>
    </div>
  );
});

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

export const SwotAnalysisMatrix = memo(function SwotAnalysisMatrix({
  swotAnalysis,
  ideaAnalysis,
  marketResearch,
  competitorWeaknessAnalysis,
  customerPersona,
}) {
  const strengths = useMemo(() => {
    if (swotAnalysis?.strengths?.length) return swotAnalysis.strengths;
    const list = [];
    if (ideaAnalysis?.feasibility) list.push(ideaAnalysis.feasibility);
    if (competitorWeaknessAnalysis?.[0]?.suggestedDifferentiation) {
      list.push(competitorWeaknessAnalysis[0].suggestedDifferentiation);
    }
    list.push("Lean architecture footprint with low initial burn.");
    list.push("Fast deployment velocity compared to incumbent tools.");
    return list.slice(0, 4);
  }, [swotAnalysis, ideaAnalysis, competitorWeaknessAnalysis]);

  const weaknesses = useMemo(() => {
    if (swotAnalysis?.weaknesses?.length) return swotAnalysis.weaknesses;
    return [
      "Initial cold-start distribution challenge and unproven organic search authority.",
      "Reliance on upstream foundation AI model API pricing and latency.",
      "Early lack of proprietary user behavioral dataset before first 1,000 active cohorts.",
    ];
  }, [swotAnalysis]);

  const opportunities = useMemo(() => {
    if (swotAnalysis?.opportunities?.length) return swotAnalysis.opportunities;
    const list = [];
    if (marketResearch?.opportunities?.length > 0) {
      list.push(...marketResearch.opportunities);
    }
    list.push("Expanding from initial single-player utility into collaborative multi-seat workflows.");
    return list.slice(0, 4);
  }, [swotAnalysis, marketResearch]);

  const threats = useMemo(() => {
    if (swotAnalysis?.threats?.length) return swotAnalysis.threats;
    const list = [];
    if (marketResearch?.competitors?.length > 0) {
      list.push(`Fast-follow feature replication from incumbents like ${marketResearch.competitors.slice(0, 2).join(", ")}.`);
    }
    list.push("Commoditization of generic automation if deep personalization is omitted.");
    return list.slice(0, 4);
  }, [swotAnalysis, marketResearch]);

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shadow-2xs">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              SWOT (Strengths, Weaknesses, Opportunities, Threats) Strategic Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Audit of internal capabilities vs. external market environment.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-400 uppercase hidden sm:inline-block">
          Harvard Business Review Model
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths (Emerald) */}
        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Strengths (Internal Advantages)
            </span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded font-bold">
              MOAT
            </span>
          </div>
          <ul className="space-y-2">
            {strengths.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <span className="text-emerald-600 font-bold select-none">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses (Amber) */}
        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Weaknesses (Internal Vulnerabilities)
            </span>
            <span className="text-[10px] font-mono text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded font-bold">
              GAPS
            </span>
          </div>
          <ul className="space-y-2">
            {weaknesses.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <span className="text-amber-600 font-bold select-none">!</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Opportunities (Sky) */}
        <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200/80">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-800 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              Opportunities (Market Tailwinds)
            </span>
            <span className="text-[10px] font-mono text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded font-bold">
              TAILWINDS
            </span>
          </div>
          <ul className="space-y-2">
            {opportunities.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <span className="text-sky-600 font-bold select-none">↗</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Threats (Rose) */}
        <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/80">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              Threats (External Competitors & Risks)
            </span>
            <span className="text-[10px] font-mono text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded font-bold">
              RISK
            </span>
          </div>
          <ul className="space-y-2">
            {threats.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <span className="text-rose-600 font-bold select-none">×</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
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
    const l = level.toLowerCase();
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
                {f.data?.level || "Moderate"}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">{f.data?.analysis}</p>
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
  const tam = marketSizing?.tam || {
    value: "$14.2B",
    description: "TAM (Total Addressable Market): Global market size calculation rationale based on total sector software spend.",
  };
  const sam = marketSizing?.sam || {
    value: "$2.1B",
    description: "SAM (Serviceable Available Market): Addressable market segment matching beachhead ICP geography and vertical.",
  };
  const som = marketSizing?.som || {
    value: "$48M",
    description: "SOM (Serviceable Obtainable Market): Realistic 1–3 year capture target with focused founder-led sales.",
  };

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
            {tam.value}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">{tam.description}</p>
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
            {sam.value}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">{sam.description}</p>
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
            {som.value}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">{som.description}</p>
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
}) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Layers size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                9-Box Strategic Lean Canvas
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                VENTURE ARCHITECTURE
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Complete business model on a single page, synthesized for rapid founder iteration and investor diligence.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Box 1: Problem */}
        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">01. Problem</span>
            <p className="text-xs text-slate-800 font-medium leading-relaxed">
              {ideaAnalysis?.problem || "Inefficient manual workflows causing high operating overhead and delayed cycles."}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200/60">
            <span className="text-[10px] font-mono text-slate-400 block mb-0.5">Existing Alternatives:</span>
            <p className="text-[11px] text-slate-600">Manual spreadsheets, fragmented point-solutions.</p>
          </div>
        </div>

        {/* Box 2: Solution & Metrics */}
        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">02. Solution</span>
            <p className="text-xs text-slate-800 font-medium leading-relaxed">
              {productPlan?.mvpFeatures?.[0] || ideaAnalysis?.goal || "Autonomous copilot platform automating 80% of end-to-end workflows."}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200/60">
            <span className="text-[10px] font-mono text-slate-400 block mb-0.5">Key Metrics (North Star):</span>
            <p className="text-[11px] text-slate-600">Time saved per workflow, Net Revenue Retention (NRR &gt; 120%).</p>
          </div>
        </div>

        {/* Box 3: Value Proposition */}
        <div className="p-3.5 rounded-xl bg-orange-50/40 border border-orange-200/80 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-orange-600 block mb-1">03. Unique Value Prop</span>
            <p className="text-xs text-slate-900 font-bold leading-relaxed">
              High-conviction autonomous execution in seconds instead of months at 90% lower operational cost.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-orange-200/60">
            <span className="text-[10px] font-mono text-orange-600 block mb-0.5">High-Level Pitch:</span>
            <p className="text-[11px] text-slate-700">"The autonomous operating system for modern founders."</p>
          </div>
        </div>

        {/* Box 4: Unfair Advantage */}
        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">04. Unfair Moat</span>
            <p className="text-xs text-slate-800 font-medium leading-relaxed">
              Proprietary multi-agent prompt synthesis &amp; domain benchmarking that generic wrappers cannot replicate.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200/60">
            <span className="text-[10px] font-mono text-slate-400 block mb-0.5">Channels:</span>
            <p className="text-[11px] text-slate-600">Product Hunt, Founder communities, programmatic SEO dossiers.</p>
          </div>
        </div>

        {/* Box 5: Economics */}
        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">05. Unit Economics</span>
            <p className="text-xs text-slate-800 font-medium leading-relaxed">
              {costEstimator?.estimatedMonthlyCost ? `Estimated Cloud Burn: ${costEstimator.estimatedMonthlyCost}` : "85%+ Gross Margin recurring SaaS subscription tiers."}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200/60">
            <span className="text-[10px] font-mono text-emerald-600 font-bold block mb-0.5">Break-Even Point:</span>
            <p className="text-[11px] text-slate-600">Covered with just 5-10 paying enterprise licenses.</p>
          </div>
        </div>
      </div>
    </div>
  );
});

// ---------------------------------------------------------------------------
// 2. UPMETRICS FEATURE: Interactive Financial Simulator & Break-Even Calculator
// ---------------------------------------------------------------------------

export const UpmetricsFinancialSimulator = memo(function UpmetricsFinancialSimulator({
  costEstimator,
  revenueSimulator,
}) {
  // Extract initial monthly price from backend assumption if available
  const initialPrice = useMemo(() => {
    if (revenueSimulator?.pricingAssumption) {
      const match = revenueSimulator.pricingAssumption.match(/\$(\d+)/);
      if (match && match[1]) {
        const p = parseInt(match[1], 10);
        if (p >= 5 && p <= 500) return p;
      }
    }
    return 29;
  }, [revenueSimulator]);

  // Interactive amount and volume selection states
  const [pricePerMonth, setPricePerMonth] = useState(initialPrice);
  const [customerCount, setCustomerCount] = useState(250);

  // Extract monthly infrastructure burn
  const monthlyCloudBurn = useMemo(() => {
    if (costEstimator?.estimatedMonthlyCost) {
      const match = costEstimator.estimatedMonthlyCost.match(/\$(\d+)/);
      if (match && match[1]) return parseInt(match[1], 10);
    }
    return 15; // default lean baseline
  }, [costEstimator]);

  // Automatic Real-Time Calculations
  const safePrice = Math.max(1, Number(pricePerMonth) || 1);
  const safeCustomers = Math.max(1, Number(customerCount) || 1);

  const mrr = safeCustomers * safePrice;
  const arr = mrr * 12;
  const netMonthlyProfit = Math.max(0, mrr - monthlyCloudBurn);
  const marginPercent = mrr > 0 ? Math.max(0, Math.min(100, Math.round((netMonthlyProfit / mrr) * 100))) : 0;
  const breakEvenCustomers = Math.max(1, Math.ceil(monthlyCloudBurn / safePrice));
  const estimatedLtv = Math.round(safePrice / 0.05); // Standard ~5% monthly SaaS churn benchmark
  const customersTo100kArr = Math.max(1, Math.ceil(100000 / (safePrice * 12)));
  const customersTo1mArr = Math.max(1, Math.ceil(1000000 / (safePrice * 12)));

  const PRICE_PRESETS = [9, 19, 29, 49, 79, 99, 149, 299];
  const USER_PRESETS = [50, 100, 250, 500, 1000, 2500, 5000];

  const BENCHMARK_TIERS = [
    { users: 100, label: "Initial Traction" },
    { users: 500, label: "Product-Market Fit" },
    { users: 1000, label: "Scaling Phase" },
    { users: 5000, label: "Market Leader" },
  ];

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm mt-6">
      {/* Top Header & Break-Even Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shadow-xs shrink-0">
            <Calculator size={22} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Upmetrics™ Interactive Financial Simulator
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-100 text-orange-700 border border-orange-200">
                AUTOMATIC REAL-TIME CALCULATOR
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Select or slide the monthly amount and customer volume below. Revenue, margins, and break-even metrics recalculate automatically.
            </p>
          </div>
        </div>

        {/* Break-Even Highlight Badge */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xs shrink-0">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 font-bold block">
              Break-Even Threshold
            </span>
            <p className="text-xs text-emerald-950 font-medium">
              Only <span className="font-mono font-black text-emerald-700 text-sm">{breakEvenCustomers} customers</span> needed
              at ${safePrice}/mo to cover cloud burn (${monthlyCloudBurn}/mo)
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Controls Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        {/* Control 1: Price / Amount Selection Bar */}
        <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold flex items-center gap-1.5">
                <Sliders size={14} className="text-orange-500" />
                1. Select Monthly Amount / Price
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Subscription price per user or customer
              </span>
            </div>

            {/* Direct Number Input Box */}
            <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-orange-200 shadow-xs">
              <span className="text-sm font-bold text-orange-600 font-mono">$</span>
              <input
                type="number"
                min="1"
                max="9999"
                value={pricePerMonth}
                onChange={(e) => setPricePerMonth(Math.max(1, Number(e.target.value) || 1))}
                className="w-16 font-mono font-black text-slate-900 text-base outline-none bg-transparent"
              />
              <span className="text-xs font-mono text-slate-400">/mo</span>
            </div>
          </div>

          {/* Interactive Range Slider Bar */}
          <div className="py-2">
            <input
              type="range"
              min="5"
              max="300"
              step="1"
              value={Math.min(300, safePrice)}
              onChange={(e) => setPricePerMonth(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500 focus:outline-none"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1.5">
              <span>$5/mo (Micro)</span>
              <span>$49/mo (Pro)</span>
              <span>$149/mo (Team)</span>
              <span>$300+/mo (Enterprise)</span>
            </div>
          </div>

          {/* Preset Buttons Bar */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-200/60">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold mr-1">Presets:</span>
            {PRICE_PRESETS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setPricePerMonth(val)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  safePrice === val
                    ? "bg-orange-500 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-orange-300 hover:text-orange-600"
                }`}
              >
                ${val}
              </button>
            ))}
          </div>
        </div>

        {/* Control 2: Customer Volume Selection Bar */}
        <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold flex items-center gap-1.5">
                <Users size={14} className="text-orange-500" />
                2. Select Active Customers Volume
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Paying customers / active accounts
              </span>
            </div>

            {/* Direct Number Input Box */}
            <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-orange-200 shadow-xs">
              <input
                type="number"
                min="1"
                max="100000"
                value={customerCount}
                onChange={(e) => setCustomerCount(Math.max(1, Number(e.target.value) || 1))}
                className="w-20 font-mono font-black text-slate-900 text-base outline-none bg-transparent"
              />
              <span className="text-xs font-mono text-slate-400">users</span>
            </div>
          </div>

          {/* Interactive Range Slider Bar */}
          <div className="py-2">
            <input
              type="range"
              min="10"
              max="5000"
              step="10"
              value={Math.min(5000, safeCustomers)}
              onChange={(e) => setCustomerCount(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500 focus:outline-none"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1.5">
              <span>10</span>
              <span>500 (PMF)</span>
              <span>2,500</span>
              <span>5,000+ (Scale)</span>
            </div>
          </div>

          {/* Preset Buttons Bar */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-200/60">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold mr-1">Tiers:</span>
            {USER_PRESETS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setCustomerCount(val)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  safeCustomers === val
                    ? "bg-orange-500 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-orange-300 hover:text-orange-600"
                }`}
              >
                {val.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Computed Metrics Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {/* MRR Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-orange-50/60 border border-orange-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono font-bold text-orange-800 uppercase tracking-wider">
              MRR (Monthly Recurring Revenue)
            </span>
            <span className="h-2 w-2 rounded-full bg-orange-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">
            ${mrr.toLocaleString()}
          </div>
          <p className="text-[11px] font-mono text-orange-700 mt-1">
            {safeCustomers.toLocaleString()} users × ${safePrice}/mo
          </p>
        </div>

        {/* ARR Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider">
              ARR (Annual Recurring Revenue)
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 mt-2">
            ${arr.toLocaleString()}
          </div>
          <p className="text-[11px] font-mono text-emerald-700 mt-1">
            Annualized 12-month run-rate
          </p>
        </div>

        {/* Net Profit Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono font-bold text-slate-600 uppercase tracking-wider">
              Net Monthly Profit
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
              {marginPercent}% Margin
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">
            ${netMonthlyProfit.toLocaleString()}
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-1">
            After ${monthlyCloudBurn}/mo cloud burn
          </p>
        </div>

        {/* LTV & CAC Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono font-bold text-amber-800 uppercase tracking-wider">
              LTV (Lifetime Value)
            </span>
            <span className="text-[10px] font-mono text-amber-700 font-semibold">5% churn</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-amber-900 mt-2">
            ${estimatedLtv.toLocaleString()}
          </div>
          <p className="text-[11px] font-mono text-amber-700 mt-1">
            Max target CAC (Customer Acquisition Cost): ${(estimatedLtv / 3).toFixed(0)}
          </p>
        </div>
      </div>

      {/* Visual Profit & Cost Allocation Bar */}
      <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Automatic Revenue Allocation & Net Margin Ratio
          </span>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-emerald-700 font-bold">
              ● Net Profit: {marginPercent}% (${netMonthlyProfit.toLocaleString()})
            </span>
            <span className="text-slate-500">
              ● Cloud Costs: {100 - marginPercent}% (${monthlyCloudBurn})
            </span>
          </div>
        </div>

        {/* Visual Stacked Progress Bar */}
        <div className="h-3.5 w-full bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${marginPercent}%` }}
            title={`Net Founder Profit: ${marginPercent}%`}
          />
          <div
            className="h-full bg-slate-400 transition-all duration-300"
            style={{ width: `${100 - marginPercent}%` }}
            title={`Cloud Burn: ${100 - marginPercent}%`}
          />
        </div>
      </div>

      {/* ARR Milestones Targets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div className="p-3.5 rounded-xl bg-orange-50/40 border border-orange-200/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-orange-700 font-bold block">
              $100,000 ARR Milestone Goal
            </span>
            <p className="text-xs text-slate-700 font-medium mt-0.5">
              Requires <span className="font-mono font-bold text-orange-600">{customersTo100kArr.toLocaleString()} customers</span> at your selected ${safePrice}/mo
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-orange-600 bg-white px-2.5 py-1 rounded-lg border border-orange-200 shadow-2xs">
            $8.3K MRR
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold block">
              $1,000,000 ARR Milestone Goal
            </span>
            <p className="text-xs text-slate-700 font-medium mt-0.5">
              Requires <span className="font-mono font-bold text-emerald-700">{customersTo1mArr.toLocaleString()} customers</span> at your selected ${safePrice}/mo
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
            $83.3K MRR
          </span>
        </div>
      </div>

      {/* Dynamic Benchmark Tiers Grid */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-bold text-slate-600 uppercase tracking-wider">
            Benchmark Growth Milestones at ${safePrice}/mo
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Automatically scales with your selected price
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {BENCHMARK_TIERS.map((tier) => {
            const tierMrr = tier.users * safePrice;
            const tierArr = tierMrr * 12;
            const tierNetProfit = tierMrr - monthlyCloudBurn;
            const tierMargin = Math.max(0, Math.round((tierNetProfit / tierMrr) * 100));

            return (
              <div
                key={tier.users}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-orange-300 transition-all shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-slate-900">
                    {tier.users.toLocaleString()} Subscribers
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                    {tierMargin}% Margin
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono mb-3">{tier.label}</p>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">MRR (Monthly):</span>
                    <span className="font-bold text-slate-900">${tierMrr.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ARR (Annual):</span>
                    <span className="font-bold text-emerald-600">${tierArr.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-dashed border-slate-100">
                    <span>Net Profit:</span>
                    <span className="font-medium text-slate-700">${tierNetProfit.toLocaleString()}/mo</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

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
            {current.body.length} characters • ~{Math.ceil(current.body.split(/\s+/).length / 200)} min read
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
