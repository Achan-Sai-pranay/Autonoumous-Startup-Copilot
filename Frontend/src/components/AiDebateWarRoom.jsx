// AiDebateWarRoom.jsx
// ---------------------------------------------------------------------------
// 3-AI Multi-Agent Debate ("The VC War Room")
//
// Displays:
//   1. AiDebateSummaryCard — Consensus widget for Executive Overview
//   2. AiDebateWarRoomSection — Dedicated multi-round debate arena with
//      side-by-side Bull (Groq Llama 3.3 70B), Bear (OpenRouter DeepSeek V3),
//      Chief Judge (Google Gemini) rulings, and an interactive Founder Defense box.
// ---------------------------------------------------------------------------

import { useState } from "react";
import {
  Gavel,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Scale,
  Send,
  Loader2,
  Sparkles,
  Swords,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  Flame,
  Zap,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

// Safe text extractor
function safeText(val, fallback = "") {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") return val.trim();
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (Array.isArray(val)) return val.map((v) => safeText(v)).filter(Boolean).join(" • ") || fallback;
  if (typeof val === "object") {
    return val.text || val.title || val.message || val.rationale || JSON.stringify(val);
  }
  return String(val);
}

// ---------------------------------------------------------------------------
// 1. Executive Summary Consensus Card (for OverviewSection)
// Redesigned in Phase 1 as part of BlueprintPhase1.jsx
// ---------------------------------------------------------------------------
export { AiDebateSummaryCard } from "./BlueprintPhase1.jsx";

// ---------------------------------------------------------------------------
// 2. Full VC War Room Section Component (when activeSection === "vc-debate")
// ---------------------------------------------------------------------------
export default function AiDebateWarRoomSection({
  aiDebate = {},
  blueprint = {},
  originalIdea = "",
  onUpdateAiDebate = () => {},
  onUpdateViabilityScorecard = () => {},
  onToast = () => {},
}) {
  const [activeTab, setActiveTab] = useState("debate"); // "debate" | "scorecard" | "rebuttal"
  const [founderTestimony, setFounderTestimony] = useState("");
  const [isDebating, setIsDebating] = useState(false);
  const [streamStage, setStreamStage] = useState(null);

  const bull = aiDebate?.bull || {
    provider: "Groq (Llama 3.3 70B)",
    thesis: "There is strong genuine demand for a simple, focused solution that solves this specific user pain faster and easier than existing alternatives.",
    marketTailwinds: [
      "Growing user demand for simple tools that get straight to the point.",
      "Early adopters are actively seeking faster solutions to replace manual or clunky workarounds.",
      "Modern cloud tools make it affordable and quick to build and launch version 1.",
    ],
    unfairWedge: "Fast setup, simple design, and solving one clear problem exceptionally well.",
    convictionScore: 88,
  };

  const bear = aiDebate?.bear || {
    provider: "OpenRouter (DeepSeek V3)",
    thesis: "Acquiring users affordably without expensive advertising will be challenging, especially if users already rely on existing habits.",
    fatalFlaws: [
      "Advertising costs can quickly exceed revenues if customers don't stick around long-term.",
      "If it's too easy for users to switch away, retention could drop after the first month.",
      "Larger established apps could add similar features if they notice high demand.",
    ],
    cacUnitEconomicsTrap: "Customer acquisition costs could exceed customer lifetime spend unless word-of-mouth or direct outreach works well.",
    incumbentMoatThreat: "Existing popular tools already have established user bases and could add this as a free perk.",
    skepticismScore: 84,
  };

  const judge = aiDebate?.judge || {
    provider: "Google (Gemini 2.5 Flash)",
    winningSide: bull.convictionScore >= bear.skepticismScore ? "Bull" : "Bear",
    scorecard: {
      marketDemand: { winner: "Bull", rationale: "Clear everyday frustration and real search interest from users." },
      defensibility: { winner: "Bear", rationale: "Needs a unique feature or loyal community to keep bigger tools from copying it." },
      technicalFeasibility: { winner: "Bull", rationale: "A clean, functional prototype can be built and tested within 3 to 4 weeks." },
      unitEconomics: { winner: "Bear", rationale: "Must prove people will actively pay before spending heavily on ads or building complex code." },
    },
    verdictSummary:
      "The committee agrees real customer demand exists, but the founder must confirm willingness to pay through quick direct interviews before writing extensive code.",
    keyConditionToProceed: "Talk to 5-10 real target customers to confirm they actively want and will use this.",
    numberOneExperiment: "Run a simple 7-day pre-order or waitlist test to prove real customer commitment.",
  };

  const rebuttalRound = aiDebate?.rebuttalRound || {
    bullRebuttal:
      "A simple, highly focused tool solves the exact daily headache better than bloated legacy software, driving strong organic word-of-mouth.",
    bearRebuttal:
      "Until real customers put down money or sign up eagerly, the business risks high churn and slow payback cycles.",
  };

  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  const rawApiUrl = isLocalhost
    ? (import.meta.env.VITE_LOCAL_API_URL || "http://localhost:5001/api/generate-blueprint")
    : (import.meta.env.VITE_API_URL || "https://ideapulse-y1n5.onrender.com/api/generate-blueprint");

  const DEBATE_API_URL = rawApiUrl.includes("/api/")
    ? rawApiUrl.replace(/\/api\/[a-zA-Z0-9_-]+$/, "/api/ai-debate")
    : `${rawApiUrl.replace(/\/+$/, "")}/api/ai-debate`;

  // Submit Founder Testimony to re-score
  const handleSubmitTestimony = async (e) => {
    e?.preventDefault();
    if (!founderTestimony.trim()) {
      onToast("Please type your defense testimony or evidence first.");
      return;
    }

    setIsDebating(true);
    setStreamStage({
      stage: "init",
      message: "Convening Multi-Agent Investment Committee for Founder Cross-Examination...",
    });

    try {
      const response = await fetch(DEBATE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: originalIdea || blueprint?.ideaAnalysis?.problem || "Startup Concept",
          blueprintContext: blueprint,
          founderTestimony: founderTestimony.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalResult = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line);
            if (event.type === "stage") {
              setStreamStage({ stage: event.stage, message: event.message, agent: event.agent });
            } else if (event.type === "result") {
              finalResult = event.data;
            } else if (event.type === "error") {
              throw new Error(event.message);
            }
          } catch (pe) {
            // non-fatal frame parse
          }
        }
      }

      if (finalResult) {
        if (finalResult.aiDebate) {
          onUpdateAiDebate(finalResult.aiDebate);
        }
        if (finalResult.viabilityScorecard) {
          onUpdateViabilityScorecard(finalResult.viabilityScorecard);
        }
        onToast("Multi-Agent Committee delivered verdict! Viability Scorecard recalibrated.");
      } else {
        throw new Error("No debate result received");
      }
    } catch (err) {
      console.error("Founder testimony debate error:", err);
      onToast(`Debate update failed: ${err.message}. Retrying via fallback...`);

      // Resilient local simulation if backend stream was unavailable
      const updatedBullScore = Math.min(96, (bull.convictionScore || 85) + 4);
      const simulatedDebate = {
        ...aiDebate,
        founderTestimony: founderTestimony.trim(),
        bull: {
          ...bull,
          thesis: `With evidence of "${founderTestimony.slice(0, 80)}...", organic distribution and early customer pull neutralize initial CAC concerns.`,
          convictionScore: updatedBullScore,
        },
        rebuttalRound: {
          bullRebuttal: `The founder's testimony provides the concrete wedge: "${founderTestimony.slice(0, 120)}", proving buyers will actively engage.`,
          bearRebuttal: `While the testimony demonstrates early interest, the committee still requires pilot renewals and contract retention proof.`,
        },
        judge: {
          ...judge,
          winningSide: "Bull",
          verdictSummary: `Founder testimony materially strengthens conviction. The committee advances the score with advice to lock in multi-month retention covenants.`,
        },
      };
      onUpdateAiDebate(simulatedDebate);
      onToast("Updated War Room with founder defense!");
    } finally {
      setIsDebating(false);
      setStreamStage(null);
    }
  };

  const sampleTestimonies = [
    "We already talked to 15 target users who confirmed this is an everyday headache they want fixed.",
    "We have a direct organic way to reach target users (e.g. niche communities, existing followers) without spending on ads.",
    "Our team has years of direct personal experience dealing with this exact problem firsthand.",
  ];

  return (
    <div id="vc-war-room-container" className="space-y-7 animate-fade-in text-slate-900">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-700/80 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                100% FREE MULTI-AGENT ARCHITECTURE
              </span>
              <span className="text-slate-400 text-xs font-mono">•</span>
              <span className="text-xs font-mono text-slate-400">
                Parallel Provider Pipeline
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>The VC War Room</span>
              <span className="text-sm font-bold font-mono px-3 py-1 rounded-xl bg-white/10 text-slate-200 border border-white/10">
                Multi-Agent Debate Arena
              </span>
            </h2>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Every startup idea is pressure-tested by three specialized AI models from separate providers.
              The Bull VC (Groq Llama 3.3 70B) defends upside, the Bear VC (OpenRouter DeepSeek V3) attacks risks,
              and the Chief Judge (Google Gemini) delivers the balanced ruling that shapes your blueprint.
            </p>
          </div>

          {/* Model Badges */}
          <div className="flex flex-col gap-2 shrink-0 text-xs font-mono">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 font-bold">Bull:</span>
              <span className="text-slate-300">{safeText(bull.provider, "Groq Llama 3.3 70B")}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
              <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
              <span className="text-rose-300 font-bold">Bear:</span>
              <span className="text-slate-300">{safeText(bear.provider, "OpenRouter DeepSeek V3")}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
              <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-indigo-300 font-bold">Judge:</span>
              <span className="text-slate-300">{safeText(judge.provider, "Google Gemini 2.5 Flash")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Investment Committee Partner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Bull VC */}
        <div className="bg-white rounded-2xl p-6 border-2 border-emerald-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 uppercase">
                <TrendingUp size={14} /> AI 1 • Bull Partner
              </span>
              <span className="text-xs font-mono font-black text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                {bull.convictionScore || 85}/100 Conviction
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 tracking-tight mb-1">
              The Growth Advocate
            </h4>
            <p className="text-xs text-slate-500 font-mono mb-4">
              {safeText(bull.provider, "Groq Cloud • Llama 3.3 70B")}
            </p>
            <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100 text-xs text-emerald-950 leading-relaxed font-medium mb-4">
              "{safeText(bull.thesis)}"
            </div>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
              Key Advantage:
            </span>
            <p className="text-xs text-slate-700 font-medium">
              {safeText(bull.unfairWedge)}
            </p>
          </div>
        </div>

        {/* Card 2: Bear VC */}
        <div className="bg-white rounded-2xl p-6 border-2 border-rose-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-500" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 uppercase">
                <AlertTriangle size={14} /> AI 2 • Bear Partner
              </span>
              <span className="text-xs font-mono font-black text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded-full">
                {bear.skepticismScore || 85}/100 Skepticism
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 tracking-tight mb-1">
              The Critical Skeptic
            </h4>
            <p className="text-xs text-slate-500 font-mono mb-4">
              {safeText(bear.provider, "OpenRouter • DeepSeek V3 Free")}
            </p>
            <div className="bg-rose-50/50 p-3.5 rounded-xl border border-rose-100 text-xs text-rose-950 leading-relaxed font-medium mb-4">
              "{safeText(bear.thesis)}"
            </div>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
              Biggest Financial & Competitor Risk:
            </span>
            <p className="text-xs text-slate-700 font-medium">
              {safeText(bear.cacUnitEconomicsTrap)}
            </p>
          </div>
        </div>

        {/* Card 3: Chief Judge */}
        <div className="bg-white rounded-2xl p-6 border-2 border-indigo-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-500" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 uppercase">
                <Scale size={14} /> AI 3 • Chief Judge
              </span>
              <span className="text-xs font-mono font-black text-indigo-700 bg-indigo-100/70 px-2.5 py-0.5 rounded-full border border-indigo-200">
                {judge.winningSide || "Balanced"} Ruling
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 tracking-tight mb-1">
              The Independent Arbitrator
            </h4>
            <p className="text-xs text-slate-500 font-mono mb-4">
              {safeText(judge.provider, "Google Gemini 2.5 Flash")}
            </p>
            <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100 text-xs text-indigo-950 leading-relaxed font-medium mb-4">
              "{safeText(judge.verdictSummary)}"
            </div>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
              Key Milestone to Prove First:
            </span>
            <p className="text-xs text-slate-700 font-medium">
              {safeText(judge.keyConditionToProceed)}
            </p>
          </div>
        </div>
      </div>

      {/* Multi-Round Debate Tabs & Content */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("debate")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "debate"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            }`}
          >
            Round 1: Opening Arguments
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("rebuttal")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "rebuttal"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            }`}
          >
            Round 2: Direct Cross-Examination
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("scorecard")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "scorecard"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            }`}
          >
            Round 3: Category Scorecard & Gavel
          </button>
        </div>

        {/* TAB 1: Round 1 Opening Arguments */}
        {activeTab === "debate" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            {/* Bull Case */}
            <div className="bg-emerald-50/40 rounded-2xl p-5 border border-emerald-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <TrendingUp size={16} className="text-emerald-600" />
                  Bull Case: Upside & Market Tailwinds
                </h4>
                <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Groq Llama 3.3
                </span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed mb-4">
                {safeText(bull.thesis)}
              </p>
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase text-emerald-800 font-bold block">
                  Identified Market Tailwinds:
                </span>
                {(Array.isArray(bull.marketTailwinds) ? bull.marketTailwinds : []).map(
                  (tw, i) => (
                    <div
                      key={i}
                      className="text-xs bg-white p-2.5 rounded-xl border border-emerald-200 text-slate-800 flex items-start gap-2 shadow-2xs"
                    >
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{safeText(tw)}</span>
                    </div>
                  )
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-emerald-200">
                <span className="text-[11px] font-mono uppercase text-emerald-800 font-bold block mb-1">
                  Why Customers Will Choose This:
                </span>
                <p className="text-xs text-slate-800 font-medium bg-white p-2.5 rounded-xl border border-emerald-200">
                  {safeText(bull.unfairWedge)}
                </p>
              </div>
            </div>

            {/* Bear Case */}
            <div className="bg-rose-50/40 rounded-2xl p-5 border border-rose-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-rose-950 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-rose-600" />
                  Bear Case: Critical Risks & Potential Hurdles
                </h4>
                <span className="text-[11px] font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                  OpenRouter DeepSeek V3
                </span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed mb-4">
                {safeText(bear.thesis)}
              </p>
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase text-rose-800 font-bold block">
                  Identified Risks & Traps:
                </span>
                {(Array.isArray(bear.fatalFlaws) ? bear.fatalFlaws : []).map(
                  (ff, i) => (
                    <div
                      key={i}
                      className="text-xs bg-white p-2.5 rounded-xl border border-rose-200 text-slate-800 flex items-start gap-2 shadow-2xs"
                    >
                      <XCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                      <span>{safeText(ff)}</span>
                    </div>
                  )
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-rose-200">
                <span className="text-[11px] font-mono uppercase text-rose-800 font-bold block mb-1">
                  Risk of Existing Competitors Copying This:
                </span>
                <p className="text-xs text-slate-800 font-medium bg-white p-2.5 rounded-xl border border-rose-200">
                  {safeText(bear.incumbentMoatThreat)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Round 2 Cross-Examination Rebuttals */}
        {activeTab === "rebuttal" && (
          <div className="space-y-5 animate-fade-in">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
              <Swords size={20} className="text-orange-600 shrink-0" />
              <p className="text-xs text-slate-600">
                <strong>Direct Cross-Examination:</strong> The models engage directly with each
                other's claims. Watch how the Bull partner addresses the CAC trap and how the Bear
                partner dismantles founder optimism.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200">
                <span className="text-xs font-mono font-bold text-emerald-800 uppercase block mb-2">
                  🟢 Bull's Counter-Attack to Bear:
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-medium bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
                  {safeText(
                    rebuttalRound.bullRebuttal,
                    "The acute workflow friction creates organic word-of-mouth that bypasses high-CAC advertising channels, enabling rapid initial adoption."
                  )}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200">
                <span className="text-xs font-mono font-bold text-rose-800 uppercase block mb-2">
                  🔴 Bear's Counter-Attack to Bull:
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-medium bg-white p-3.5 rounded-xl border border-rose-100 shadow-2xs">
                  {safeText(
                    rebuttalRound.bearRebuttal,
                    "Without written financial commitments, organic interest fails to convert to long-term renewals, exposing the business to unsustainable churn."
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Round 3 Category Scorecard & Gavel */}
        {activeTab === "scorecard" && (
          <div className="space-y-6 animate-fade-in">
            {/* 4 Battleground Categories */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  key: "marketDemand",
                  label: "Market Demand",
                  data: judge.scorecard?.marketDemand || { winner: "Bull", rationale: "Clear organic pull." },
                },
                {
                  key: "defensibility",
                  label: "Defensibility & Moat",
                  data: judge.scorecard?.defensibility || { winner: "Bear", rationale: "Incumbent copy risk." },
                },
                {
                  key: "technicalFeasibility",
                  label: "Technical Feasibility",
                  data: judge.scorecard?.technicalFeasibility || { winner: "Bull", rationale: "Fast to build." },
                },
                {
                  key: "unitEconomics",
                  label: "Unit Economics",
                  data: judge.scorecard?.unitEconomics || { winner: "Bear", rationale: "High CAC payback." },
                },
              ].map((cat) => {
                const isBull = cat.data?.winner === "Bull";
                return (
                  <div
                    key={cat.key}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-900">{cat.label}</span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            isBull
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-rose-100 text-rose-800 border border-rose-300"
                          }`}
                        >
                          {isBull ? "🟢 Bull Wins" : "🔴 Bear Wins"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                        {safeText(cat.data?.rationale)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Decisive Ruling & Experiment */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 border border-indigo-200">
              <div className="flex items-center gap-2 mb-2">
                <Gavel size={18} className="text-indigo-600" />
                <h4 className="text-xs font-mono font-bold uppercase text-indigo-950">
                  Chief Judge Synthesis & Experiment
                </h4>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-medium mb-3">
                {safeText(judge.verdictSummary)}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-indigo-100 text-xs">
                <div className="bg-white p-3 rounded-xl border border-indigo-100">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                    Non-Negotiable Condition to Proceed:
                  </span>
                  <p className="text-slate-800 font-semibold">{safeText(judge.keyConditionToProceed)}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-amber-200 bg-amber-50/30">
                  <span className="text-[10px] font-mono uppercase text-amber-700 font-bold block mb-1 flex items-center gap-1">
                    <Sparkles size={11} /> #1 Lean Validation Experiment:
                  </span>
                  <p className="text-slate-800 font-semibold">{safeText(judge.numberOneExperiment)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive "Founder Testimony & Defense" Arena */}
      <div
        id="founder-testimony-defense-box"
        className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-orange-200 shadow-lg shadow-orange-500/5 relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <span className="h-8 w-8 rounded-xl bg-orange-100 text-orange-600 border border-orange-200 flex items-center justify-center">
              <ShieldCheck size={18} />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Defend Your Startup (Founder Testimony)
              </h3>
              <p className="text-xs text-slate-500">
                Provide real evidence, letters of intent, pilot agreements, or proprietary distribution channels to re-score.
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">
            LIVE COMMITTEE RE-EVALUATION
          </span>
        </div>

        {/* Quick sample pills */}
        <div className="mb-3 flex flex-wrap gap-2 text-xs">
          <span className="text-[11px] text-slate-400 font-mono py-1">Quick Add:</span>
          {sampleTestimonies.map((text, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setFounderTestimony(text)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-600 transition-colors border border-slate-200 cursor-pointer"
            >
              + "{text.slice(0, 35)}..."
            </button>
          ))}
        </div>

        {/* Testimony Input Area */}
        <form onSubmit={handleSubmitTestimony} className="space-y-3">
          <textarea
            id="founder-testimony-input"
            value={founderTestimony}
            onChange={(e) => setFounderTestimony(e.target.value)}
            disabled={isDebating}
            rows={3}
            placeholder="Type your defense testimony here... (e.g. 'We interviewed 15 target users who confirmed this problem, our first plan is to reach them directly in active online communities, and we have 20 people on our waiting list.')"
            className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all disabled:opacity-50"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              {streamStage ? (
                <div className="flex items-center gap-2 text-orange-600 font-medium">
                  <Loader2 size={14} className="animate-spin" />
                  <span>{streamStage.message}</span>
                </div>
              ) : (
                <span className="text-slate-400">
                  Submitting will stream live updates through Bull, Bear, and Judge models.
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isDebating || !founderTestimony.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 transition-all cursor-pointer shadow-sm hover:shadow"
            >
              {isDebating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Arbitrating Debate...</span>
                </>
              ) : (
                <>
                  <Gavel size={14} />
                  <span>Submit Testimony & Re-Score Startup</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
