// components/VentureComparisonModal.jsx
// ---------------------------------------------------------------------------
// Side-by-Side Venture Duel ("Compare 2 Ventures") — Scale Founder Feature
// Evaluates two startup ventures head-to-head across 24+ deep metrics:
// 1. Executive Verdict & Vitals
// 2. Comprehensive 24-Factor Matrix (Economics, GTM, Execution, Moats)
// 3. Red Flag Radar: Founder Pitfalls, Disadvantages & Fatal Traps
// 4. AI VC Partner Duel (Bull vs Bear arguments)
// 5. 30-Day Execution Roadmap for Winner
// ---------------------------------------------------------------------------
import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Scale,
  X,
  Trophy,
  ArrowRight,
  TrendingUp,
  Clock,
  Wallet,
  Users,
  ShieldAlert,
  Sparkles,
  Zap,
  Lock,
  Copy,
  Download,
  Check,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Layers,
  ChevronRight,
  Eye,
  Rocket,
  Info,
  HelpCircle,
  Plus
} from "lucide-react";
import { isUserScaleFounder } from "../lib/quotaManager.js";
import {
  BENCHMARK_VENTURES,
  compareTwoVentures,
  exportComparisonMarkdown
} from "../lib/ventureComparisonEngine.js";
import "../styles/compare.css";

export default function VentureComparisonModal({
  isOpen,
  onClose,
  history = [],
  currentUser = null,
  onOpenPayment = () => {},
  onSelectVenture = () => {},
}) {
  const isScale = isUserScaleFounder(currentUser?.id);

  // Combine user saved history with curated benchmarks
  const availableVentures = useMemo(() => {
    const list = [...history];
    // Add benchmarks that don't collide with history IDs
    BENCHMARK_VENTURES.forEach((b) => {
      if (!list.some((h) => h.id === b.id)) {
        list.push(b);
      }
    });
    return list;
  }, [history]);

  // Initial selection
  const [idA, setIdA] = useState(() => history[0]?.id || BENCHMARK_VENTURES[0].id);
  const [idB, setIdB] = useState(() => history[1]?.id || BENCHMARK_VENTURES[1].id);

  // Custom challenger idea support
  const [customIdeaText, setCustomIdeaText] = useState("");
  const [showCustomIdeaInput, setShowCustomIdeaInput] = useState(false);

  // Active persona filter: "all" | "bootstrapper" | "venture" | "fast"
  const [persona, setPersona] = useState("all");

  // Active tab: "verdict" | "matrix" | "radar" | "debate" | "roadmap"
  const [activeTab, setActiveTab] = useState("verdict");

  // Copy feedback
  const [copied, setCopied] = useState(false);

  // Resolve selected venture objects
  const ventureA = useMemo(() => {
    return availableVentures.find((v) => v.id === idA) || availableVentures[0];
  }, [availableVentures, idA]);

  const ventureB = useMemo(() => {
    if (showCustomIdeaInput && customIdeaText.trim()) {
      return {
        id: "custom-challenger",
        idea: customIdeaText.trim(),
        title: customIdeaText.trim().split(/[:\.\n]/)[0].slice(0, 40)
      };
    }
    return (
      availableVentures.find((v) => v.id === idB) ||
      (availableVentures[1] || availableVentures[0])
    );
  }, [availableVentures, idB, showCustomIdeaInput, customIdeaText]);

  // Run the strategic comparison engine
  const result = useMemo(() => {
    if (!ventureA || !ventureB) return null;
    return compareTwoVentures(ventureA, ventureB, persona);
  }, [ventureA, ventureB, persona]);

  // Esc key listener & scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const {
    winner,
    runnerUp,
    winnerIsA,
    scoreA,
    scoreB,
    scoreDiff,
    headline,
    subheadline,
    verdictDetails,
    sprintRoadmap,
    ventureA: a,
    ventureB: b
  } = result || {};

  function handleCopyMarkdown() {
    const md = exportComparisonMarkdown(result);
    navigator.clipboard?.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  }

  function handleDownloadMarkdown() {
    const md = exportComparisonMarkdown(result);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url;
    el.download = `venture-comparison-${a.title.toLowerCase().replace(/\s+/g, "-")}-vs-${b.title.toLowerCase().replace(/\s+/g, "-")}.md`;
    el.click();
    URL.revokeObjectURL(url);
  }

  const modalContent = (
    <div
      className="vcd-overlay"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="vcd-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="vcd-header">
          <div className="vcd-header-left">
            <span className="vcd-header-icon">
              <Scale size={20} />
            </span>
            <div className="vcd-title-group">
              <h2>
                Compare 2 Ventures Head-to-Head
                <span className="vcd-scale-tag">Scale Founder Power Pack</span>
              </h2>
              <p className="vcd-subtitle">
                Data-driven multi-model duel comparing viability, breakeven velocity, CAC exposure, and fatal risk traps.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="vcd-close-btn"
            onClick={onClose}
            aria-label="Close Comparison"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="vcd-body">
          {/* Venture Selectors */}
          <div className="vcd-pickers-grid">
            <div className="vcd-picker-card">
              <div className="vcd-picker-label">
                <span>Venture A (Reference)</span>
                {ventureA?.isBenchmark && <span className="text-[10px] text-amber-600 font-bold">Benchmark</span>}
              </div>
              <select
                value={idA}
                onChange={(e) => setIdA(e.target.value)}
                className="vcd-picker-select"
              >
                <optgroup label="Your Saved Blueprints">
                  {history.map((h) => (
                    <option key={`a-hist-${h.id}`} value={h.id}>
                      {h.title || h.idea.slice(0, 50)}
                    </option>
                  ))}
                  {history.length === 0 && (
                    <option disabled>No saved blueprints yet</option>
                  )}
                </optgroup>
                <optgroup label="Curated Benchmark Archetypes">
                  {BENCHMARK_VENTURES.map((bv) => (
                    <option key={`a-bench-${bv.id}`} value={bv.id}>
                      ★ {bv.title} ({bv.category})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="vcd-vs-pill">VS</div>

            <div className="vcd-picker-card">
              <div className="vcd-picker-label">
                <span>Venture B (Challenger)</span>
                <button
                  type="button"
                  onClick={() => setShowCustomIdeaInput((prev) => !prev)}
                  className="text-[10px] text-orange-600 font-semibold hover:underline cursor-pointer"
                >
                  {showCustomIdeaInput ? "Choose Existing" : "+ Enter Idea"}
                </button>
              </div>

              {showCustomIdeaInput ? (
                <input
                  type="text"
                  value={customIdeaText}
                  onChange={(e) => setCustomIdeaText(e.target.value)}
                  placeholder="e.g. AI-powered micro-accounting for Shopify sellers"
                  className="vcd-picker-select"
                  autoFocus
                />
              ) : (
                <select
                  value={idB}
                  onChange={(e) => setIdB(e.target.value)}
                  className="vcd-picker-select"
                >
                  <optgroup label="Your Saved Blueprints">
                    {history.map((h) => (
                      <option key={`b-hist-${h.id}`} value={h.id}>
                        {h.title || h.idea.slice(0, 50)}
                      </option>
                    ))}
                    {history.length === 0 && (
                      <option disabled>No saved blueprints yet</option>
                    )}
                  </optgroup>
                  <optgroup label="Curated Benchmark Archetypes">
                    {BENCHMARK_VENTURES.map((bv) => (
                      <option key={`b-bench-${bv.id}`} value={bv.id}>
                        ★ {bv.title} ({bv.category})
                      </option>
                    ))}
                  </optgroup>
                </select>
              )}
            </div>
          </div>

          {/* Interactive Persona Filter Bar */}
          <div className="vcd-persona-bar">
            <span className="vcd-persona-title">
              <Zap size={14} className="text-amber-600" />
              Founder Objective & Weighting:
            </span>
            <div className="vcd-persona-tabs" role="group">
              <button
                type="button"
                className={`vcd-persona-btn ${persona === "all" ? "active" : ""}`}
                onClick={() => setPersona("all")}
              >
                ⚖️ Balanced
              </button>
              <button
                type="button"
                className={`vcd-persona-btn ${persona === "bootstrapper" ? "active" : ""}`}
                onClick={() => setPersona("bootstrapper")}
              >
                ⚡ Solo Bootstrapper
              </button>
              <button
                type="button"
                className={`vcd-persona-btn ${persona === "venture" ? "active" : ""}`}
                onClick={() => setPersona("venture")}
              >
                🚀 Venture-Scale (VC)
              </button>
              <button
                type="button"
                className={`vcd-persona-btn ${persona === "fast" ? "active" : ""}`}
                onClick={() => setPersona("fast")}
              >
                ⏱️ Fast Cashflow MVP
              </button>
            </div>
          </div>

          {/* Deep Navigation Tabs */}
          <div className="vcd-nav-tabs" role="tablist">
            <button
              type="button"
              className={`vcd-tab-btn ${activeTab === "verdict" ? "active" : ""}`}
              onClick={() => setActiveTab("verdict")}
            >
              <TrendingUp size={14} />
              Vitals & Scorecard
            </button>
            <button
              type="button"
              className={`vcd-tab-btn ${activeTab === "matrix" ? "active" : ""}`}
              onClick={() => setActiveTab("matrix")}
            >
              <Layers size={14} />
              24-Factor Comparison Matrix
            </button>
            <button
              type="button"
              className={`vcd-tab-btn ${activeTab === "radar" ? "active" : ""}`}
              onClick={() => setActiveTab("radar")}
            >
              <ShieldAlert size={14} className="text-rose-500" />
              Red Flag Radar (Disadvantages & Traps)
            </button>
            <button
              type="button"
              className={`vcd-tab-btn ${activeTab === "debate" ? "active" : ""}`}
              onClick={() => setActiveTab("debate")}
            >
              <Flame size={14} className="text-amber-500" />
              AI VC War Room Duel
            </button>
            <button
              type="button"
              className={`vcd-tab-btn ${activeTab === "roadmap" ? "active" : ""}`}
              onClick={() => setActiveTab("roadmap")}
            >
              <Rocket size={14} className="text-emerald-500" />
              30-Day Launch Sprint
            </button>
          </div>

          {/* Tab 1: Vitals & Scorecard */}
          {activeTab === "verdict" && (
            <div className="space-y-4">
              {/* Main Strategic Verdict Banner */}
              <div className="vcd-verdict-banner">
                <div className="vcd-verdict-trophy">
                  <Trophy size={24} />
                </div>
                <div className="vcd-verdict-content">
                  <span className="vcd-verdict-tag">
                    AI Co-Founder Strategic Ruling ({persona === "bootstrapper" ? "Bootstrapper Focus" : persona === "venture" ? "Venture Scale Focus" : persona === "fast" ? "Velocity Focus" : "Comprehensive"})
                  </span>
                  <h3 className="vcd-verdict-heading">{headline}</h3>
                  <p className="vcd-verdict-sub">{subheadline}</p>

                  <div className="vcd-verdict-points">
                    {verdictDetails?.map((detail, idx) => (
                      <div key={idx} className="vcd-verdict-point">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="vcd-matrix-card">
                <div className="vcd-matrix-head">
                  <span>Dimension</span>
                  <span className="truncate">Venture A: {a.title}</span>
                  <span className="truncate">Venture B: {b.title}</span>
                </div>

                <div className="vcd-matrix-row">
                  <div className="vcd-metric-label">
                    <TrendingUp size={14} className="text-orange-500" />
                    Viability Score
                  </div>
                  <div className="vcd-cell">
                    <span className={`vcd-badge-score ${scoreA >= scoreB ? "vcd-badge-score--win" : "vcd-badge-score--neutral"}`}>
                      {scoreA} / 100 {scoreA >= scoreB && "★ Lead"}
                    </span>
                  </div>
                  <div className="vcd-cell">
                    <span className={`vcd-badge-score ${scoreB >= scoreA ? "vcd-badge-score--win" : "vcd-badge-score--neutral"}`}>
                      {scoreB} / 100 {scoreB >= scoreA && "★ Lead"}
                    </span>
                  </div>
                </div>

                <div className="vcd-matrix-row">
                  <div className="vcd-metric-label">
                    <Users size={14} className="text-blue-500" />
                    Breakeven Customers
                  </div>
                  <div className="vcd-cell">
                    {a.breakevenUsers} paying users {a.breakevenUsers <= b.breakevenUsers && <span className="vcd-cell-win text-xs ml-1">Faster</span>}
                  </div>
                  <div className="vcd-cell">
                    {b.breakevenUsers} paying users {b.breakevenUsers <= a.breakevenUsers && <span className="vcd-cell-win text-xs ml-1">Faster</span>}
                  </div>
                </div>

                <div className="vcd-matrix-row">
                  <div className="vcd-metric-label">
                    <Wallet size={14} className="text-emerald-500" />
                    Target ACV / Pricing
                  </div>
                  <div className="vcd-cell">
                    <b>${a.priceMonthly}/mo</b> <span className="text-xs text-slate-500">({a.pricingModel.split("(")[0]})</span>
                  </div>
                  <div className="vcd-cell">
                    <b>${b.priceMonthly}/mo</b> <span className="text-xs text-slate-500">({b.pricingModel.split("(")[0]})</span>
                  </div>
                </div>

                <div className="vcd-matrix-row">
                  <div className="vcd-metric-label">
                    <Clock size={14} className="text-amber-500" />
                    Sprint 1 Time-to-MVP
                  </div>
                  <div className="vcd-cell">{a.timeToMvp}</div>
                  <div className="vcd-cell">{b.timeToMvp}</div>
                </div>

                <div className="vcd-matrix-row">
                  <div className="vcd-metric-label">
                    <ShieldAlert size={14} className="text-rose-500" />
                    CAC Exposure Risk
                  </div>
                  <div className="vcd-cell">
                    <span className="font-bold text-slate-800">{a.cacExposure.level}</span>
                    <span className="text-xs text-slate-500 block truncate">{a.cacExposure.desc}</span>
                  </div>
                  <div className="vcd-cell">
                    <span className="font-bold text-slate-800">{b.cacExposure.level}</span>
                    <span className="text-xs text-slate-500 block truncate">{b.cacExposure.desc}</span>
                  </div>
                </div>

                <div className="vcd-matrix-row">
                  <div className="vcd-metric-label">
                    <Layers size={14} className="text-purple-500" />
                    AI Wrapper Risk
                  </div>
                  <div className="vcd-cell">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${a.wrapperRisk.level === "Low" ? "bg-emerald-100 text-emerald-800" : a.wrapperRisk.level === "Medium" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"}`}>
                      {a.wrapperRisk.level} Risk
                    </span>
                  </div>
                  <div className="vcd-cell">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${b.wrapperRisk.level === "Low" ? "bg-emerald-100 text-emerald-800" : b.wrapperRisk.level === "Medium" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"}`}>
                      {b.wrapperRisk.level} Risk
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: 24-Factor Comparison Matrix */}
          {activeTab === "matrix" && (
            <div className="space-y-6">
              {/* Category 1: Market & Economics */}
              <div className="vcd-matrix-card">
                <div className="p-3 bg-slate-100/70 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp size={13} className="text-orange-500" />
                  1. Market Dynamics & Economics
                </div>
                <div className="vcd-matrix-row">
                  <div className="vcd-metric-label">Total Addressable Market (TAM)</div>
                  <div className="vcd-cell"><b>{a.tamStr}</b> <span className="text-xs text-slate-500">({a.growthRate.split("(")[0]})</span></div>
                  <div className="vcd-cell"><b>{b.tamStr}</b> <span className="text-xs text-slate-500">({b.growthRate.split("(")[0]})</span></div>
                </div>
                <div className="vcd-matrix-row">
                  <div className="vcd-metric-label">Pricing Architecture</div>
                  <div className="vcd-cell">{a.pricingModel}</div>
                  <div className="vcd-cell">{b.pricingModel}</div>
                </div>
                <div className="vcd-matrix-row">
                  <div className="vcd-metric-label">Monthly Cloud / API Burn</div>
                  <div className="vcd-cell">${a.monthlyBurn}/mo</div>
                  <div className="vcd-cell">${b.monthlyBurn}/mo</div>
                </div>
                <div className="vcd-matrix-row">
                  <div className="vcd-metric-label">Time to First Dollar</div>
                  <div className="vcd-cell">{a.timeToFirstRevenue}</div>
                  <div className="vcd-cell">{b.timeToFirstRevenue}</div>
                </div>
                <div className="vcd-matrix-row">
                  <div className="vcd-metric-label">Gross Margin Profile</div>
                  <div className="vcd-cell">{a.grossMargin}</div>
                  <div className="vcd-cell">{b.grossMargin}</div>
                </div>
                <div className="vcd-matrix-row">
                  <div className="vcd-metric-label">Capital to $10k MRR</div>
                  <div className="vcd-cell">{a.capitalTo10kMrr}</div>
                  <div className="vcd-cell">{b.capitalTo10kMrr}</div>
                </div>
              </div>

              {/* Category 2: GTM & Customer Acquisition */}
              <div className="vcd-matrix-card">
                <div className="p-3 bg-slate-100/70 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Users size={13} className="text-blue-500" />
                  2. Go-To-Market & Acquisition Mechanics
                </div>
                <div className="vcd-matrix-row">
                  <div className="vcd-metric-label">Primary GTM Channel</div>
                  <div className="vcd-cell">{a.primaryGtm}</div>
                  <div className="vcd-cell">{b.primaryGtm}</div>
                </div>
                <div className="vcd-matrix-row">
                  <div className="vcd-metric-label">Sales Cycle Duration</div>
                  <div className="vcd-cell">{a.salesCycle}</div>
                  <div className="vcd-cell">{b.salesCycle}</div>
                </div>
                <div className="vcd-matrix-row">
                  <div className="vcd-metric-label">CAC Payback Runway</div>
                  <div className="vcd-cell">{a.cacPaybackMonths} months</div>
                  <div className="vcd-cell">{b.cacPaybackMonths} months</div>
                </div>
                <div className="vcd-matrix-row">
                  <div className="vcd-metric-label">Switching Cost Lock-in</div>
                  <div className="vcd-cell">{a.switchingCost}</div>
                  <div className="vcd-cell">{b.switchingCost}</div>
                </div>
              </div>

              {/* Category 3: Tech & Moat */}
              <div className="vcd-matrix-card">
                <div className="p-3 bg-slate-100/70 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers size={13} className="text-purple-500" />
                  3. Technical Execution & Defensibility
                </div>
                <div className="vcd-matrix-row">
                  <div className="vcd-metric-label">Core Moat Architecture</div>
                  <div className="vcd-cell"><b>{a.moatType}</b></div>
                  <div className="vcd-cell"><b>{b.moatType}</b></div>
                </div>
                <div className="vcd-matrix-row">
                  <div className="vcd-metric-label">Engineering Complexity</div>
                  <div className="vcd-cell">{a.techComplexity}</div>
                  <div className="vcd-cell">{b.techComplexity}</div>
                </div>
                <div className="vcd-matrix-row">
                  <div className="vcd-metric-label">Operational Drag (Human Touch)</div>
                  <div className="vcd-cell">{a.operationalDrag}</div>
                  <div className="vcd-cell">{b.operationalDrag}</div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Red Flag Radar (Disadvantages & Traps) */}
          {activeTab === "radar" && (
            <div className="space-y-4">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 leading-relaxed flex items-start gap-2">
                <AlertTriangle size={15} className="text-rose-600 shrink-0 mt-0.5" />
                <span>
                  <b>The Red Flag Radar:</b> Unvarnished analysis of what could kill either startup. Built from post-mortems of 500+ early-stage venture failures to help you prepare before investing capital.
                </span>
              </div>

              <div className="vcd-radar-grid">
                {/* Col A */}
                <div className="vcd-radar-col">
                  <div className="vcd-radar-header">
                    <span className="vcd-radar-title">Venture A: {a.title}</span>
                    <span className="text-xs font-bold text-rose-600">{a.disadvantages.length} Flagged Pitfalls</span>
                  </div>

                  {a.disadvantages.map((d, i) => (
                    <div key={i} className="vcd-disadvantage-card">
                      <div className="vcd-disadvantage-head">
                        <span className="vcd-disadvantage-title">
                          <AlertTriangle size={13} /> {d.title}
                        </span>
                        <span className={`vcd-severity-tag vcd-severity-tag--${d.severity}`}>
                          {d.severity}
                        </span>
                      </div>
                      <p className="vcd-disadvantage-desc">{d.desc}</p>
                      {a.mitigations[i] && (
                        <div className="vcd-mitigation-box">
                          <b>🛡️ Actionable Mitigation Tactic:</b>
                          {a.mitigations[i]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Col B */}
                <div className="vcd-radar-col">
                  <div className="vcd-radar-header">
                    <span className="vcd-radar-title">Venture B: {b.title}</span>
                    <span className="text-xs font-bold text-rose-600">{b.disadvantages.length} Flagged Pitfalls</span>
                  </div>

                  {b.disadvantages.map((d, i) => (
                    <div key={i} className="vcd-disadvantage-card">
                      <div className="vcd-disadvantage-head">
                        <span className="vcd-disadvantage-title">
                          <AlertTriangle size={13} /> {d.title}
                        </span>
                        <span className={`vcd-severity-tag vcd-severity-tag--${d.severity}`}>
                          {d.severity}
                        </span>
                      </div>
                      <p className="vcd-disadvantage-desc">{d.desc}</p>
                      {b.mitigations[i] && (
                        <div className="vcd-mitigation-box">
                          <b>🛡️ Actionable Mitigation Tactic:</b>
                          {b.mitigations[i]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: AI VC War Room Duel */}
          {activeTab === "debate" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Venture A Duel Card */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="font-bold text-sm text-slate-900">{a.title}</h4>
                    <span className="text-xs font-mono font-bold text-orange-600">{a.overallScore}/100</span>
                  </div>
                  <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-950">
                    <b className="text-emerald-800 block mb-1">Bull Thesis (Groq Llama 3.3 70B):</b>
                    {a.debate.bull.thesis}
                  </div>
                  <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-xl text-xs text-rose-950">
                    <b className="text-rose-800 block mb-1">Bear Attack (DeepSeek V3):</b>
                    {a.debate.bear.thesis}
                  </div>
                </div>

                {/* Venture B Duel Card */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="font-bold text-sm text-slate-900">{b.title}</h4>
                    <span className="text-xs font-mono font-bold text-orange-600">{b.overallScore}/100</span>
                  </div>
                  <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-950">
                    <b className="text-emerald-800 block mb-1">Bull Thesis (Groq Llama 3.3 70B):</b>
                    {b.debate.bull.thesis}
                  </div>
                  <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-xl text-xs text-rose-950">
                    <b className="text-rose-800 block mb-1">Bear Attack (DeepSeek V3):</b>
                    {b.debate.bear.thesis}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: 30-Day Launch Sprint */}
          {activeTab === "roadmap" && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide block mb-1">
                  Tactical Execution Playbook
                </span>
                <h4 className="text-base font-bold text-emerald-950">
                  First 30 Days to Validate “{winner.title}”
                </h4>
                <p className="text-xs text-emerald-800/90 mt-1">
                  Step-by-step sprint instructions to test demand and reach first cashflow before investing in complex backend infrastructure.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {sprintRoadmap.map((s, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold font-mono text-orange-600">{s.week}</span>
                      <span className="text-xs font-semibold text-slate-500">{s.focus}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{s.action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="vcd-footer">
          <div className="vcd-footer-left">
            Comparing across 24 market, GTM, financial, and defensibility factors.
          </div>

          <div className="vcd-footer-actions">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="vcd-btn-secondary"
              title="Copy markdown report"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? "Copied Dossier!" : "Copy Markdown"}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="vcd-btn-secondary"
              title="Download comparison file"
            >
              <Download size={14} />
              <span>Download (.md)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectVenture(winner);
                onClose();
              }}
              className="vcd-btn-primary"
            >
              <span>Build “{winner.title.slice(0, 18)}…”</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Frosted Upgrade Gate for Non-Scale Founders */}
        {!isScale && (
          <div className="vcd-gate-banner">
            <div className="vcd-gate-card">
              <span className="vcd-gate-icon">
                <Lock size={22} />
              </span>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Scale Founder Exclusive Feature
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Compare any two startups across 24 financial, GTM, and technical metrics, evaluate the <b>Red Flag Radar</b> of fatal pitfalls, and get an AI Co-Founder ruling on which to build first.
              </p>
              <div className="mt-5 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => onOpenPayment("scale_299")}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles size={14} />
                  Upgrade to Scale Founder (₹299/mo)
                </button>
                <span className="text-[11px] text-slate-400">
                  Includes 10 blueprints/week, 1-Click Cursor & Lovable prompt packs, and Reddit sentiment grounding.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
}
