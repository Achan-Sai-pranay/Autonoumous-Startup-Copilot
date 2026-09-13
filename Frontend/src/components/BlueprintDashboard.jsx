// BlueprintDashboard.jsx
// ---------------------------------------------------------------------------
// V8: Complete overhaul — 6-stage Lean Startup section flow with:
// 1. Executive Overview & Viability (Hero Charts: Viability Gauge + TAM/SAM/SOM Bubbles)
// 2. Customer Persona & Discovery (Mom Test + Red Flags + WTP Signals)
// 3. Market & Competitive Intelligence (SWOT, Porter's, Competitor Matrix)
// 4. Product Architecture & MVP Scope (MVP Features, Tech Stack, Roadmap)
// 5. Financial Model & Unit Economics (Dynamic AI costs, Revenue Projections)
// 6. Go-to-Market & Launch Execution (Channels with "why", Launch Copy, Checklist)
//
// Key fixes:
// - verdictReasoning wired (was investmentThesis)
// - goToMarket.platforms.why wired (was p.strategy/p.urgency)
// - redditLaunchPost, twitterLaunchPost, linkedInSearchStrategy rendered
// - customerDiscovery.redFlags and willingnessToPaySignals rendered
// - Hardcoded MBA financials replaced with dynamic costEstimator + revenueSimulator
// - Interactive venture title editing
// - Responsive grid layout (no hidden cards on desktop)
// ---------------------------------------------------------------------------
import { Component, useState, useRef, memo, useCallback, useMemo, useEffect } from "react";
import {
  Lightbulb,
  TrendingUp,
  Users,
  ListChecks,
  Cpu,
  Map as MapIcon,
  Wallet,
  AlertTriangle,
  Target,
  ListTodo,
  BarChart3,
  Crosshair,
  Copy,
  Check,
  Rocket,
  FileDown,
  FileText,
  Loader2,
  LayoutGrid,
  ShieldCheck,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Briefcase,
  Home,
  MessageSquare,
  BookOpen,
  Edit2,
  Info,
  Sparkles,
  Flame,
  Settings,
  HelpCircle,
  X,
} from "lucide-react";
import { downloadMarkdown, downloadPdf } from "../components/exportBlueprint.js";
import {
  VenturusMarketSizeBubbleChart,
  VenturusViabilityGaugeChart,
  LeanCanvasMatrix,
  UpmetricsFinancialSimulator,
  ChatPrdDossierView,
} from "./CompetitorUpgrades.jsx";

// ---------------------------------------------------------------------------
// Business Analysis Sub-Sections — 6-stage Lean Startup Flow
// ---------------------------------------------------------------------------
export const BUSINESS_SECTIONS = [
  { id: "overview", label: "Executive Overview", title: "Executive Overview & Viability" },
  { id: "customer-discovery", label: "Customer & Discovery", title: "Customer Persona & Discovery" },
  { id: "market-competitors", label: "Market & Competitors", title: "Market & Competitive Intelligence" },
  { id: "product-mvp", label: "Product & MVP", title: "Product Architecture & MVP Scope" },
  { id: "finances", label: "Financial Model", title: "Financial Model & Unit Economics" },
  { id: "gtm", label: "Go-to-Market", title: "Go-to-Market & Launch Execution" },
];

class SectionErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Section render error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 rounded-2xl bg-white border border-rose-200 shadow-xs max-w-2xl">
          <div className="flex items-center gap-3 text-rose-600 mb-2">
            <AlertTriangle size={20} />
            <h3 className="font-bold text-sm">Unable to display this section</h3>
          </div>
          <p className="text-xs text-slate-600 mb-4">
            An unexpected error occurred while parsing the venture strategic data for this view.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-3 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-semibold hover:bg-orange-700 transition-colors"
          >
            Retry Section
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function BlueprintDashboard({
  blueprint,
  originalIdea,
  activeSection: controlledActiveSection,
  setActiveSection: setControlledActiveSection,
  viewMode: controlledViewMode,
  setViewMode: setControlledViewMode,
}) {
  const [internalActiveSection, setInternalActiveSection] = useState("overview");
  const activeSection =
    controlledActiveSection !== undefined ? controlledActiveSection : internalActiveSection;
  const setActiveSection = setControlledActiveSection || setInternalActiveSection;

  const sectionHeaderRef = useRef(null);
  const prevBlueprintRef = useRef(blueprint);
  const isFirstMountRef = useRef(true);

  // Interactive title editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [customTitle, setCustomTitle] = useState(null);
  const titleInputRef = useRef(null);

  // Smart scroll management
  useEffect(() => {
    if (prevBlueprintRef.current !== blueprint || isFirstMountRef.current) {
      prevBlueprintRef.current = blueprint;
      isFirstMountRef.current = false;
      const mainEl = document.querySelector("main.overflow-y-auto") || document.querySelector("main");
      if (mainEl) mainEl.scrollTop = 0;
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      return;
    }

    if (sectionHeaderRef.current) {
      sectionHeaderRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeSection, blueprint]);

  const [internalViewMode, setInternalViewMode] = useState("dashboard");
  const viewMode = controlledViewMode !== undefined ? controlledViewMode : internalViewMode;
  const setViewMode = setControlledViewMode || setInternalViewMode;

  const [exporting, setExporting] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleExportPdf = useCallback(async () => {
    setExporting("pdf");
    try {
      await downloadPdf(blueprint, originalIdea);
      showToast("PDF exported successfully");
    } catch (err) {
      console.error("PDF export failed:", err);
      showToast("PDF export failed — please try again");
    } finally {
      setExporting(null);
    }
  }, [blueprint, originalIdea, showToast]);

  const handleExportMarkdown = useCallback(() => {
    setExporting("md");
    try {
      downloadMarkdown(blueprint, originalIdea);
      showToast("Markdown exported successfully");
    } catch (err) {
      console.error("Markdown export failed:", err);
      showToast("Markdown export failed — please try again");
    } finally {
      setExporting(null);
    }
  }, [blueprint, originalIdea, showToast]);

  const handleCopySummary = useCallback(() => {
    const summary = `${originalIdea}\n\nProblem: ${blueprint?.ideaAnalysis?.problem || ""}\nGoal: ${blueprint?.ideaAnalysis?.goal || ""}\nElevator Pitch: ${blueprint?.pitch?.elevatorPitch || ""}`;
    navigator.clipboard?.writeText(summary);
    showToast("Executive Brief copied to clipboard");
  }, [blueprint, originalIdea, showToast]);

  const {
    ideaAnalysis,
    viabilityScorecard,
    customerDiscovery,
    swotAnalysis,
    portersFiveForces,
    marketSizing,
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

  // Real venture header details
  const ventureTitle =
    customTitle || pitch?.elevatorPitch || originalIdea || "LaunchPilot Venture Blueprint";

  const industryDomain =
    ideaAnalysis?.domain || "Startup Analysis";

  const ventureDescription =
    pitch?.executiveSummary ||
    ideaAnalysis?.problem ||
    originalIdea ||
    "A comprehensive startup blueprint synthesized by 12 autonomous AI co-founders.";

  // Title editing handlers
  const handleStartEditTitle = () => {
    setEditedTitle(ventureTitle);
    setIsEditingTitle(true);
    setTimeout(() => titleInputRef.current?.focus(), 50);
  };

  const handleSaveTitle = () => {
    if (editedTitle.trim()) {
      setCustomTitle(editedTitle.trim());
      showToast("Venture title updated");
    }
    setIsEditingTitle(false);
  };

  const handleCancelEditTitle = () => {
    setIsEditingTitle(false);
  };

  // Navigation helpers for top-right < Previous / Next > buttons
  const currentIndex = BUSINESS_SECTIONS.findIndex((s) => s.id === activeSection);
  const currentSectionObj =
    BUSINESS_SECTIONS[currentIndex] || {
      id: "dashboard",
      label: "Dashboard",
      title: "Dashboard Overview",
    };
  const prevSection = currentIndex > 0 ? BUSINESS_SECTIONS[currentIndex - 1] : null;
  const nextSection =
    currentIndex >= 0 && currentIndex < BUSINESS_SECTIONS.length - 1
      ? BUSINESS_SECTIONS[currentIndex + 1]
      : null;

  return (
    <div className="w-full max-w-7xl mx-auto mt-8 px-4 pb-24 animate-fade-in text-slate-900">
      {/* Top Utility Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider bg-orange-50 text-orange-600 border border-orange-200 font-bold">
            Startup Brief #{(originalIdea.length % 900) + 100}
          </span>
          <span className="text-slate-300 text-xs font-mono">•</span>
          <span className="text-xs font-mono text-slate-500 font-medium hidden sm:inline">
            Synthesized via 12 Autonomous Co-Founders
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:text-orange-600 hover:border-orange-300 transition-colors cursor-pointer shadow-2xs"
          >
            <Copy size={13} />
            <span>Copy Brief</span>
          </button>
          <ExportButton
            icon={FileText}
            label="Markdown"
            busy={exporting === "md"}
            onClick={handleExportMarkdown}
          />
          <ExportButton
            icon={FileDown}
            label="Executive PDF"
            busy={exporting === "pdf"}
            onClick={handleExportPdf}
          />
        </div>
      </div>

      {viewMode === "prd" ? (
        <ChatPrdDossierView
          blueprint={blueprint}
          originalIdea={originalIdea}
          onSwitchToDashboard={() => setViewMode("dashboard")}
          onExportPdf={handleExportPdf}
          onExportMarkdown={handleExportMarkdown}
          onToast={showToast}
        />
      ) : (
        <div className="w-full">
          {/* MAIN CONTENT AREA */}
          <div className="w-full min-w-0">
            {/* Top Venture Banner Card */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-7 mb-7 shadow-md relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="min-w-0 flex-1">
                  <div className="flex items-start sm:items-center gap-3">
                    {isEditingTitle ? (
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <input
                          ref={titleInputRef}
                          type="text"
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveTitle();
                            if (e.key === "Escape") handleCancelEditTitle();
                          }}
                          className="flex-1 min-w-0 text-xl sm:text-2xl font-black tracking-tight text-white leading-tight bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <button
                          onClick={handleSaveTitle}
                          className="h-7 w-7 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-xs"
                          title="Save title"
                        >
                          <Check size={13} />
                        </button>
                        <button
                          onClick={handleCancelEditTitle}
                          className="h-7 w-7 rounded-lg bg-slate-600 hover:bg-slate-500 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-xs"
                          title="Cancel"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight break-words">
                          {ventureTitle}
                        </h1>
                        <button
                          onClick={handleStartEditTitle}
                          className="h-7 w-7 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-xs mt-1 sm:mt-0"
                          title="Edit venture title"
                        >
                          <Edit2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-slate-200 border border-white/10 backdrop-blur-sm">
                      <Info size={13} className="text-orange-400" />
                      <span>
                        Industry: <strong className="text-white">{industryDomain}</strong>
                      </span>
                    </span>
                  </div>
                </div>

                <div className="lg:max-w-md bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-slate-300 leading-relaxed backdrop-blur-sm shrink-0">
                  <p>{ventureDescription}</p>
                </div>
              </div>
            </div>

            {/* Section Header with Star and < Previous / Next > Navigation */}
            <div
              id="blueprint-section-anchor"
              ref={sectionHeaderRef}
              className="flex items-center justify-between mb-6 pb-2 scroll-mt-6"
            >
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>{currentSectionObj.title}</span>
                  <span className="text-orange-500 text-xl font-normal">★</span>
                </h2>
              </div>

              <div className="flex items-center gap-2.5">
                {prevSection && (
                  <button
                    onClick={() => setActiveSection(prevSection.id)}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                    <span>Previous</span>
                  </button>
                )}
                {nextSection && (
                  <button
                    onClick={() => setActiveSection(nextSection.id)}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Render Section Content */}
            <div key={activeSection} className="animate-fade-in">
              <SectionErrorBoundary key={activeSection}>
                {/* 1. EXECUTIVE OVERVIEW & VIABILITY */}
                {activeSection === "overview" && (
                  <OverviewSection
                    viabilityScorecard={viabilityScorecard}
                    ideaAnalysis={ideaAnalysis}
                    marketSizing={marketSizing}
                    originalIdea={originalIdea}
                    pitch={pitch}
                    ventureTitle={ventureTitle}
                  />
                )}

                {/* 2. CUSTOMER PERSONA & DISCOVERY */}
                {activeSection === "customer-discovery" && (
                  <CustomerDiscoverySection
                    customerPersona={customerPersona}
                    customerDiscovery={customerDiscovery}
                  />
                )}

                {/* 3. MARKET & COMPETITIVE INTELLIGENCE */}
                {activeSection === "market-competitors" && (
                  <MarketCompetitorsSection
                    swotAnalysis={swotAnalysis}
                    portersFiveForces={portersFiveForces}
                    competitorWeaknessAnalysis={competitorWeaknessAnalysis}
                    marketResearch={marketResearch}
                    ideaAnalysis={ideaAnalysis}
                    blueprint={blueprint}
                  />
                )}

                {/* 4. PRODUCT ARCHITECTURE & MVP SCOPE */}
                {activeSection === "product-mvp" && (
                  <ProductMvpSection
                    productPlan={productPlan}
                    technicalArchitecture={technicalArchitecture}
                    roadmap={roadmap}
                  />
                )}

                {/* 5. FINANCIAL MODEL & UNIT ECONOMICS */}
                {activeSection === "finances" && (
                  <FinancesSection
                    costEstimator={costEstimator}
                    revenueSimulator={revenueSimulator}
                    businessStrategy={businessStrategy}
                    marketResearch={marketResearch}
                  />
                )}

                {/* 6. GO-TO-MARKET & LAUNCH EXECUTION */}
                {activeSection === "gtm" && (
                  <GoToMarketSection
                    goToMarket={goToMarket}
                    launchChecklist={launchChecklist}
                    pitch={pitch}
                    onToast={showToast}
                  />
                )}

                {/* DASHBOARD OVERVIEW (legacy) */}
                {activeSection === "dashboard" && (
                  <DashboardOverviewSection
                    onNavigate={setActiveSection}
                    viabilityScorecard={viabilityScorecard}
                    marketSizing={marketSizing}
                    costEstimator={costEstimator}
                    revenueSimulator={revenueSimulator}
                    ideaAnalysis={ideaAnalysis}
                  />
                )}
              </SectionErrorBoundary>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-toast-in">
          <div className="flex items-center gap-2.5 bg-slate-900 text-white text-xs px-4 py-3 rounded-2xl shadow-xl border border-slate-800">
            <Check size={14} className="text-orange-400" />
            <span className="font-medium">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Export bar button
// ---------------------------------------------------------------------------
function ExportButton({ icon: Icon, label, busy, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:text-orange-600 hover:border-orange-300 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-2xs cursor-pointer"
    >
      {busy ? <Loader2 size={13} className="animate-spin text-orange-500" /> : <Icon size={13} />}
      {busy ? "Synthesizing…" : label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Responsive Card Grid — Replaces horizontal-only scroll on desktop
// Cards flow naturally in a responsive grid. On mobile, they still allow
// horizontal scrolling for touch UX.
// ---------------------------------------------------------------------------
function ResponsiveCardGrid({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Unified Vertical Stat Card
// ---------------------------------------------------------------------------
function StatCard({
  title,
  icon: Icon,
  iconColor = "text-orange-500",
  stat,
  subtitle,
  children,
  detailsTitle,
  detailsText,
  className = "",
}) {
  return (
    <div
      className={`p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col hover:border-slate-300 hover:shadow-sm transition-all duration-200 ${className}`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
        {Icon && <Icon size={18} className={iconColor} />}
      </div>

      {/* Big Stat & Subtitle */}
      {stat && (
        <div className="mb-4">
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight leading-tight">
            {stat}
          </div>
          {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
        </div>
      )}

      {/* Card Body Content */}
      {children && <div className="flex-1">{children}</div>}

      {/* Bottom Details Tray */}
      {detailsTitle && (
        <div className="pt-4 border-t border-slate-100 mt-4">
          <h4 className="text-xs font-bold text-slate-900 mb-1">{detailsTitle}</h4>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">{detailsText}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SECTION 1: EXECUTIVE OVERVIEW & VIABILITY
// ============================================================================
function OverviewSection({ viabilityScorecard, ideaAnalysis, marketSizing, originalIdea, pitch, ventureTitle }) {
  const score = viabilityScorecard?.score ?? 84;
  const verdict = viabilityScorecard?.verdict || "Proceed";

  return (
    <div className="space-y-6">
      {/* Hero Charts: Viability Gauge + TAM/SAM/SOM Bubbles — Side by Side on Large Screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VenturusViabilityGaugeChart viabilityScorecard={viabilityScorecard} ideaTitle={ventureTitle} />
        <VenturusMarketSizeBubbleChart marketSizing={marketSizing} ideaTitle={ventureTitle} />
      </div>

      {/* Cards Grid */}
      <ResponsiveCardGrid>
        {/* Card 1: Venture Viability Scorecard */}
        <StatCard
          title="Venture Viability Scorecard"
          icon={ShieldCheck}
          iconColor="text-orange-500"
          stat={`${score} / 100`}
          subtitle={`Verdict: ${verdict}`}
          detailsTitle="Executive Investment Thesis"
          detailsText={
            viabilityScorecard?.verdictReasoning ||
            "Strong domain potential with verified market tailwinds and rapid time-to-MVP."
          }
        >
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Market Demand Score</span>
                <span className="font-bold font-mono text-slate-900">
                  {viabilityScorecard?.marketDemandScore ?? 88}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${viabilityScorecard?.marketDemandScore ?? 88}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Technical Feasibility</span>
                <span className="font-bold font-mono text-slate-900">
                  {viabilityScorecard?.technicalFeasibilityScore ?? 82}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${viabilityScorecard?.technicalFeasibilityScore ?? 82}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Monetization Engine</span>
                <span className="font-bold font-mono text-slate-900">
                  {viabilityScorecard?.monetizationScore ?? 85}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${viabilityScorecard?.monetizationScore ?? 85}%` }}
                />
              </div>
            </div>

            {/* Fatal Risk Traps */}
            {viabilityScorecard?.fatalRiskTraps?.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-mono uppercase text-rose-600 font-bold block mb-1.5">
                  Identified Risk Traps
                </span>
                <div className="space-y-1">
                  {viabilityScorecard.fatalRiskTraps.map((risk, i) => (
                    <div key={i} className="text-xs text-rose-800 bg-rose-50/60 p-2 rounded-lg border border-rose-100 leading-snug">
                      • {risk}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </StatCard>

        {/* Card 2: Startup Idea Thesis */}
        <StatCard
          title="Startup Idea Thesis"
          icon={Target}
          iconColor="text-orange-500"
          stat={ideaAnalysis?.domain || "Core Thesis"}
          subtitle="Founder Problem & Mission"
          detailsTitle="Feasibility & Execution Speed"
          detailsText={ideaAnalysis?.feasibility || "High feasibility with modern serverless architecture."}
        >
          <div className="space-y-3 text-xs text-slate-700">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                Founder Prompt / Idea
              </span>
              <p className="leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium text-slate-800">
                {originalIdea}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                Core Problem Statement
              </span>
              <p className="leading-relaxed text-slate-700">{ideaAnalysis?.problem}</p>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                Strategic Mission & Objectives
              </span>
              <p className="leading-relaxed text-slate-700">{ideaAnalysis?.goal}</p>
            </div>
          </div>
        </StatCard>

        {/* Card 3: Elevator Pitch */}
        <StatCard
          title="Elevator Pitch"
          icon={Rocket}
          iconColor="text-orange-500"
          stat="Executive Pitch"
          subtitle="1-2 Sentence Hook"
          detailsTitle="Executive Summary"
          detailsText={pitch?.executiveSummary || "Full executive summary synthesized from the venture analysis."}
        >
          <div className="text-xs text-slate-700">
            <p className="leading-relaxed bg-orange-50/50 p-3 rounded-xl border border-orange-100 font-medium text-slate-800 italic">
              "{pitch?.elevatorPitch || originalIdea}"
            </p>
          </div>
        </StatCard>
      </ResponsiveCardGrid>
    </div>
  );
}

// ============================================================================
// SECTION 2: CUSTOMER PERSONA & DISCOVERY
// ============================================================================
function CustomerDiscoverySection({ customerPersona, customerDiscovery }) {
  const users = customerPersona?.targetUsers || [];
  const painPoints = customerPersona?.painPoints || [];
  const profile = customerPersona?.userProfile || "Target profile currently synthesized.";

  return (
    <ResponsiveCardGrid>
      {/* Card 1: Customer Persona (ICP) */}
      <StatCard
        title="Customer Persona (ICP)"
        icon={Users}
        iconColor="text-orange-500"
        stat={users[0] || "Target Founders"}
        subtitle="Primary Buyer Archetype"
        detailsTitle="Buyer Persona Story"
        detailsText={profile}
      >
        <div className="space-y-2 text-xs">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
            Target User Roles
          </span>
          {users.map((u, i) => (
            <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
              <span className="text-orange-600 font-bold mr-1.5 font-mono">0{i + 1}.</span>
              {u}
            </div>
          ))}
        </div>
      </StatCard>

      {/* Card 2: Critical Pain Points */}
      <StatCard
        title="Critical Pain Points"
        icon={AlertTriangle}
        iconColor="text-rose-500"
        stat={`${painPoints.length || 3} Core Bottlenecks`}
        subtitle="Workflow Friction Areas"
        detailsTitle="Impact on Purchasing Urgency"
        detailsText="These pain points create significant operational friction, resulting in high willingness to pay for a dedicated solution."
      >
        <div className="space-y-2 text-xs">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
            High-Friction Pain Points
          </span>
          {painPoints.map((p, i) => (
            <div key={i} className="p-2.5 rounded-xl bg-rose-50/50 border border-rose-100 text-rose-900 leading-snug">
              <span className="text-rose-600 font-bold mr-1.5">✕</span>
              {p}
            </div>
          ))}
        </div>
      </StatCard>

      {/* Card 3: Lean Customer Discovery — Mom Test */}
      <StatCard
        title="Lean Customer Discovery"
        icon={Lightbulb}
        iconColor="text-orange-500"
        stat="The Mom Test"
        subtitle="Founder Interview Validation Guide"
        detailsTitle="Validation Criteria & Hypotheses"
        detailsText="Focus strictly on past user habits, current workarounds, and financial trade-offs rather than hypothetical commitments."
      >
        <div className="space-y-2.5 text-xs">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
            Core Discovery Questions (The Mom Test)
          </span>
          {(customerDiscovery?.interviewQuestions || []).map((q, i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed">
              <span className="text-orange-600 font-bold mr-1.5 font-mono">Q{i + 1}.</span>
              {q}
            </div>
          ))}
        </div>
      </StatCard>

      {/* Card 4: Red Flags (False Positives) — NEW: previously discarded */}
      {customerDiscovery?.redFlags?.length > 0 && (
        <StatCard
          title="False-Positive Red Flags"
          icon={AlertTriangle}
          iconColor="text-amber-500"
          stat={`${customerDiscovery.redFlags.length} Warning Signs`}
          subtitle="Answers That Deceive Founders"
          detailsTitle="Why Red Flags Matter"
          detailsText="These are common responses from interviewees that sound encouraging but indicate no real commitment. If you hear these, dig deeper — don't celebrate."
        >
          <div className="space-y-2 text-xs">
            {customerDiscovery.redFlags.map((flag, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 text-amber-900 leading-snug">
                <span className="text-amber-600 font-bold mr-1.5">⚠</span>
                {flag}
              </div>
            ))}
          </div>
        </StatCard>
      )}

      {/* Card 5: Willingness-to-Pay Signals — NEW: previously discarded */}
      {customerDiscovery?.willingnessToPaySignals?.length > 0 && (
        <StatCard
          title="Willingness-to-Pay Signals"
          icon={DollarSign}
          iconColor="text-emerald-500"
          stat={`${customerDiscovery.willingnessToPaySignals.length} Commitment Tests`}
          subtitle="Prove Buyer Intent Before Code"
          detailsTitle="Why Commitment Tests Matter"
          detailsText="These concrete commitment tests prove real buyer intent before you write a single line of code. Ask for skin in the game."
        >
          <div className="space-y-2 text-xs">
            {customerDiscovery.willingnessToPaySignals.map((signal, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-900 leading-snug">
                <span className="text-emerald-600 font-bold mr-1.5">✓</span>
                {signal}
              </div>
            ))}
          </div>
        </StatCard>
      )}
    </ResponsiveCardGrid>
  );
}

// ============================================================================
// SECTION 3: MARKET & COMPETITIVE INTELLIGENCE
// ============================================================================
function MarketCompetitorsSection({ swotAnalysis, portersFiveForces, competitorWeaknessAnalysis, marketResearch, ideaAnalysis, blueprint }) {
  const rawSwot = swotAnalysis || blueprint?.swotAnalysis || {};

  const parseSwotList = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") return item.text || item.point || item.title || item.description || "";
        return String(item).trim();
      }).filter((s) => s && s.length > 0);
    }
    if (typeof raw === "string") return raw.split(/\n|•|;/).map((s) => s.replace(/^\s*[-*\d.]+\s*/, "").trim()).filter((s) => s.length > 1);
    return [];
  };

  const strengths = parseSwotList(rawSwot.strengths || rawSwot.Strengths);
  const weaknesses = parseSwotList(rawSwot.weaknesses || rawSwot.Weaknesses);
  const opportunities = parseSwotList(rawSwot.opportunities || rawSwot.Opportunities);
  const threats = parseSwotList(rawSwot.threats || rawSwot.Threats);

  const porterForce = (key) => {
    const obj = portersFiveForces?.[key] || {};
    return obj;
  };

  return (
    <div className="space-y-6">
      <ResponsiveCardGrid>
        {/* Card 1: SWOT Analysis Matrix */}
        <StatCard
          title="SWOT Analysis Matrix"
          icon={ShieldCheck}
          iconColor="text-orange-500"
          stat="Strategic Matrix"
          subtitle="Internal & External Factors"
          detailsTitle="Strategic Edge"
          detailsText="Leverage agility and AI automation to outpace incumbents burdened by technical debt."
        >
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-100 space-y-1">
              <span className="font-bold text-orange-800 block">Strengths</span>
              <ul className="space-y-1 text-slate-700">
                {strengths.map((s, i) => (<li key={i} className="leading-snug">• {s}</li>))}
              </ul>
            </div>
            <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100 space-y-1">
              <span className="font-bold text-rose-800 block">Weaknesses</span>
              <ul className="space-y-1 text-slate-700">
                {weaknesses.map((w, i) => (<li key={i} className="leading-snug">• {w}</li>))}
              </ul>
            </div>
            <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100 space-y-1">
              <span className="font-bold text-sky-800 block">Opportunities</span>
              <ul className="space-y-1 text-slate-700">
                {opportunities.map((o, i) => (<li key={i} className="leading-snug">• {o}</li>))}
              </ul>
            </div>
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100 space-y-1">
              <span className="font-bold text-amber-800 block">Threats</span>
              <ul className="space-y-1 text-slate-700">
                {threats.map((t, i) => (<li key={i} className="leading-snug">• {t}</li>))}
              </ul>
            </div>
          </div>
        </StatCard>

        {/* Card 2: Porter's Five Forces */}
        <StatCard
          title="Porter's Five Forces"
          icon={Target}
          iconColor="text-orange-500"
          stat="Market Defensibility"
          subtitle="Industry Structure Dynamics"
          detailsTitle="Defensibility Strategy"
          detailsText="Build compounding workflow data moats to increase switching costs."
        >
          <div className="space-y-2 text-xs">
            {[
              { key: "buyerPower", label: "Buyer Power" },
              { key: "supplierPower", label: "Supplier Power" },
              { key: "competitiveRivalry", label: "Competitive Rivalry" },
              { key: "threatOfSubstitutes", label: "Threat of Substitution" },
              { key: "threatOfNewEntry", label: "Threat of New Entrants" },
            ].map(({ key, label }) => {
              const force = porterForce(key);
              return (
                <div key={key} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between font-bold mb-0.5">
                    <span>{label}</span>
                    <span className="text-orange-600 font-mono">{force.level || "Moderate"}</span>
                  </div>
                  <p className="text-slate-600">{force.analysis || "Analysis pending."}</p>
                </div>
              );
            })}
          </div>
        </StatCard>

        {/* Card 3: Market Demand Signals */}
        <StatCard
          title="Market Demand Signals"
          icon={Lightbulb}
          iconColor="text-orange-500"
          stat={ideaAnalysis?.domain || "Market Intelligence"}
          subtitle="Sector Validation Signals"
          detailsTitle="Demand Dynamics"
          detailsText={marketResearch?.marketDemand || "Growing demand driven by manual workflow inefficiencies."}
        >
          <div className="space-y-3 text-xs">
            {marketResearch?.opportunities?.length > 0 && (
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                  Market Opportunities
                </span>
                <ul className="space-y-1.5">
                  {marketResearch.opportunities.map((opp, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700">
                      <span className="text-orange-500 font-bold select-none">✓</span>
                      <span>{opp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {marketResearch?.competitors?.length > 0 && (
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                  Identified Competitors
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {marketResearch.competitors.map((c, i) => (
                    <span key={i} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </StatCard>
      </ResponsiveCardGrid>

      {/* Competitor Vulnerabilities Matrix */}
      {competitorWeaknessAnalysis?.length > 0 && (
        <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 tracking-tight flex items-center gap-2">
            <Crosshair size={16} className="text-orange-500" />
            <span>Competitor Vulnerability & Exploit Strategies</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {competitorWeaknessAnalysis.map((c, i) => (
              <div key={i} className="p-5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{c.competitor}</span>
                  <span className="text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-bold">
                    Incumbent
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-0.5">
                    Structural Weakness
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {(c.weaknesses || []).join("; ") || c.weakness}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-0.5">
                    Missed Opportunities
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {(c.missedOpportunities || []).join("; ")}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-orange-500 font-bold block mb-0.5">
                    Our Differentiation Wedge
                  </span>
                  <p className="text-xs text-orange-800 leading-relaxed font-medium">
                    {c.suggestedDifferentiation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SECTION 4: PRODUCT ARCHITECTURE & MVP SCOPE
// ============================================================================
function ProductMvpSection({ productPlan, technicalArchitecture, roadmap }) {
  return (
    <div className="space-y-6">
      <ResponsiveCardGrid>
        {/* Card 1: MVP Scope (Sprint 1) */}
        <StatCard
          title="Product Plan"
          icon={ListChecks}
          iconColor="text-sky-500"
          stat="Sprint 1 MVP"
          subtitle={`Priority: ${productPlan?.developmentPriority || "Speed to Market"}`}
          detailsTitle="Scope Rationale"
          detailsText="Prioritized to validate core customer value proposition and collect telemetry in under 4 weeks."
        >
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
              Core MVP Features
            </span>
            <ul className="space-y-2">
              {(productPlan?.mvpFeatures || []).map((feat, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Check size={14} className="text-sky-500 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </StatCard>

        {/* Card 2: Production Technical Architecture */}
        <StatCard
          title="Technical Architecture"
          icon={Cpu}
          iconColor="text-sky-500"
          stat="Production Stack"
          subtitle="Cloud & AI Infrastructure"
          detailsTitle="Architecture Overview"
          detailsText={technicalArchitecture?.architectureOverview || "Containerized cloud backend with modern reactive frontend."}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-mono uppercase">Frontend</span>
                <span className="text-xs font-bold text-slate-800 block mt-0.5">{technicalArchitecture?.frontend || "React / Tailwind"}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-mono uppercase">Backend</span>
                <span className="text-xs font-bold text-slate-800 block mt-0.5">{technicalArchitecture?.backend || "FastAPI / Python"}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-mono uppercase">Database</span>
                <span className="text-xs font-bold text-slate-800 block mt-0.5">{technicalArchitecture?.database || "PostgreSQL / Vector"}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-mono uppercase">Cloud</span>
                <span className="text-xs font-bold text-slate-800 block mt-0.5">{technicalArchitecture?.hosting || "AWS / Vercel"}</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100 text-xs text-slate-700">
              <span className="font-bold text-sky-800 block mb-0.5">AI Models & APIs:</span>
              <span>{technicalArchitecture?.aiApis || "Anthropic Claude / OpenAI / Local Embeddings"}</span>
            </div>
          </div>
        </StatCard>

        {/* Card 3: Future Roadmap Phases */}
        <StatCard
          title="Future Roadmap"
          icon={MapIcon}
          iconColor="text-sky-500"
          stat="Phase 2 & 3"
          subtitle="Scaling & Enterprise Expansion"
          detailsTitle="Launch Strategy"
          detailsText={roadmap?.launchPlan || "Staged rollout to design partners followed by broad self-serve onboarding."}
        >
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
              Future Expansion Roadmap
            </span>
            <ul className="space-y-2">
              {(productPlan?.futureFeatures || []).map((feat, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-sky-500 font-bold select-none">›</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </StatCard>
      </ResponsiveCardGrid>

      {/* Milestones Timeline */}
      {roadmap?.milestones?.length > 0 && (
        <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 tracking-tight flex items-center gap-2">
            <Rocket size={16} className="text-sky-500" />
            <span>Execution Milestones — {roadmap.milestones.length} Sprints</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roadmap.milestones.map((m, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{m.title}</span>
                  <span className="text-[10px] font-mono text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded font-bold">{m.week}</span>
                </div>
                <ul className="space-y-0.5 text-xs text-slate-600">
                  {(m.tasks || []).map((t, j) => (
                    <li key={j} className="flex items-start gap-1.5">
                      <span className="text-sky-500">›</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SECTION 5: FINANCIAL MODEL & UNIT ECONOMICS (Dynamic AI Data)
// ============================================================================
const COST_KEYS = ["domain", "hosting", "database", "aiApis", "email", "analytics", "storage", "authentication"];
const COST_LABELS = {
  domain: "🌐 Domain", hosting: "☁️ Hosting", database: "🗄️ Database", aiApis: "🤖 AI APIs",
  email: "📧 Email", analytics: "📊 Analytics", storage: "💾 Storage", authentication: "🔐 Auth",
};

function FinancesSection({ costEstimator, revenueSimulator, businessStrategy, marketResearch }) {
  const [showSimulator, setShowSimulator] = useState(false);

  // Dynamic ARPU for breakeven calculation
  const arpu = useMemo(() => {
    if (revenueSimulator?.pricingAssumption) {
      const match = revenueSimulator.pricingAssumption.match(/\$(\d+)/);
      if (match && match[1]) return parseInt(match[1], 10);
    }
    return 29;
  }, [revenueSimulator]);

  // Dynamic breakeven
  const monthlyBurn = useMemo(() => {
    if (costEstimator?.estimatedMonthlyCost) {
      const match = costEstimator.estimatedMonthlyCost.match(/\$(\d+)/);
      if (match && match[1]) return parseInt(match[1], 10);
    }
    return 50;
  }, [costEstimator]);

  const breakevenSubscribers = Math.max(1, Math.ceil(monthlyBurn / arpu));

  return (
    <div className="space-y-6">
      <ResponsiveCardGrid>
        {/* Card 1: Dynamic Startup Costs — Real costEstimator data */}
        <StatCard
          title="Infrastructure & Cloud Costs"
          icon={DollarSign}
          iconColor="text-orange-500"
          stat={costEstimator?.estimatedMonthlyCost || "$16-51"}
          subtitle="Estimated Monthly Cost"
          detailsTitle="Annual Projection"
          detailsText={`Estimated yearly cost: ${costEstimator?.estimatedYearlyCost || "$192-612"}. Lean infrastructure leveraging free tiers where possible.`}
        >
          <div className="space-y-1.5">
            {COST_KEYS.map((key) => {
              const item = costEstimator?.[key];
              if (!item) return null;
              return (
                <div key={key} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span>{COST_LABELS[key] || key}</span>
                    {item.freeTierSufficient && (
                      <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">FREE</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900">{item.monthlyCost}/mo</span>
                  </div>
                </div>
              );
            })}
            {costEstimator && (
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-orange-50 border border-orange-100 mt-2">
                <span className="font-bold text-orange-800">Monthly Total</span>
                <span className="font-mono font-bold text-orange-800">{costEstimator.estimatedMonthlyCost}</span>
              </div>
            )}
          </div>
        </StatCard>

        {/* Card 2: Revenue Projections — Dynamic revenueSimulator data */}
        <StatCard
          title="Revenue Projections"
          icon={TrendingUp}
          iconColor="text-orange-500"
          stat={revenueSimulator?.projections?.[2]?.annualRevenue || "Dynamic"}
          subtitle={revenueSimulator?.pricingAssumption || "Based on pricing model"}
          detailsTitle="Pricing Assumption"
          detailsText={revenueSimulator?.pricingAssumption || businessStrategy?.pricingIdea || "SaaS subscription pricing model with tiered plans."}
        >
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
              User-Tier Revenue Projections
            </span>
            {(revenueSimulator?.projections || []).map((proj, i) => (
              <div key={i} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="font-bold text-slate-900">{proj.users?.toLocaleString()} users</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-orange-600">{proj.monthlyRevenue}</span>
                  <span className="text-[10px] text-slate-400 ml-1">/mo</span>
                  <span className="text-[10px] text-slate-500 ml-2">({proj.annualRevenue}/yr)</span>
                </div>
              </div>
            ))}
          </div>
        </StatCard>

        {/* Card 3: Dynamic Breakeven Analysis */}
        <StatCard
          title="Breakeven Analysis"
          icon={BarChart3}
          iconColor="text-orange-500"
          stat={`${breakevenSubscribers} subscribers`}
          subtitle="Monthly Breakeven Point"
          detailsTitle="Breakeven Rationale"
          detailsText={`At ~$${arpu}/mo ARPU and ~$${monthlyBurn}/mo infrastructure costs, breakeven is achieved at ${breakevenSubscribers} paying subscribers.`}
        >
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 block font-mono">Monthly Burn</span>
                <span className="font-bold font-mono text-slate-900">${monthlyBurn}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 block font-mono">ARPU</span>
                <span className="font-bold font-mono text-slate-900">${arpu}/mo</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-600 font-mono">Breakeven Target</span>
                <span className="font-mono font-bold text-orange-700">{breakevenSubscribers} subs</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: "0%" }} />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Progress updates once you start tracking active subscriptions.</p>
            </div>
          </div>
        </StatCard>

        {/* Card 4: Business Strategy & Monetization */}
        <StatCard
          title="Business Strategy"
          icon={Briefcase}
          iconColor="text-orange-500"
          stat="Revenue Model"
          subtitle={businessStrategy?.revenueModel || "SaaS Subscription"}
          detailsTitle="Pricing Strategy"
          detailsText={businessStrategy?.pricingIdea || "Tiered SaaS pricing with freemium entry point."}
        >
          <div className="space-y-2 text-xs">
            {businessStrategy?.marketingChannels?.length > 0 && (
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                  Marketing Channels
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {businessStrategy.marketingChannels.map((ch, i) => (
                    <span key={i} className="text-[11px] bg-orange-50 text-orange-800 border border-orange-200 px-2 py-0.5 rounded-md font-medium">{ch}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </StatCard>
      </ResponsiveCardGrid>

      {/* Expandable Live Simulator */}
      <div className="pt-2">
        <button
          onClick={() => setShowSimulator(!showSimulator)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-700 border border-slate-200 hover:border-orange-200 transition-colors cursor-pointer"
        >
          <Sparkles size={14} className="text-orange-500" />
          <span>
            {showSimulator
              ? "Hide Live Simulator"
              : "Open Live Financial Simulator & Lean Canvas"}
          </span>
        </button>

        {showSimulator && (
          <div className="mt-6 space-y-6 animate-fade-in">
            <UpmetricsFinancialSimulator
              costEstimator={costEstimator}
              revenueSimulator={revenueSimulator}
            />
            <LeanCanvasMatrix
              leanCanvas={{
                problem: [marketResearch?.marketDemand || "Core problem"],
                solution: [businessStrategy?.revenueModel || "Solution"],
                uniqueValueProposition: [businessStrategy?.pricingIdea || "UVP"],
                unfairAdvantage: ["Proprietary dynamic AI synthesis & founder speed"],
                customerSegments: [marketResearch?.competitors?.[0] || "Target segment"],
                keyMetrics: ["MRR Growth", "CAC Payback < 6 mo", "Churn < 2%"],
                channels: businessStrategy?.marketingChannels || ["Direct sales", "Organic"],
                costStructure: [costEstimator?.estimatedMonthlyCost || "$50/mo infrastructure"],
                revenueStreams: [revenueSimulator?.pricingAssumption || "SaaS subscriptions"],
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SECTION 6: GO-TO-MARKET & LAUNCH EXECUTION
// ============================================================================
function GoToMarketSection({ goToMarket, launchChecklist, pitch, onToast }) {
  return (
    <div className="space-y-6">
      <ResponsiveCardGrid>
        {/* Card 1: Founder Outreach Templates */}
        <StatCard
          title="Founder Outreach Templates"
          icon={Target}
          iconColor="text-orange-500"
          stat="Production Copy"
          subtitle="Cold Hooks & Outbound Templates"
          detailsTitle="Outbound Playbook"
          detailsText="Founder-led outbound playbook to secure the first 20 design partners with zero paid ad spend."
        >
          <div className="space-y-3 text-xs">
            {goToMarket?.coldEmailTemplate && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-900">Cold Email Template</span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(goToMarket.coldEmailTemplate);
                      onToast?.("Cold email copied to clipboard");
                    }}
                    className="text-[11px] font-mono text-orange-600 font-bold hover:underline cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-slate-600 font-mono text-[11px] whitespace-pre-wrap">{goToMarket.coldEmailTemplate}</p>
              </div>
            )}

            {goToMarket?.linkedInDmTemplate && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-900">LinkedIn DM Template</span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(goToMarket.linkedInDmTemplate);
                      onToast?.("LinkedIn DM copied to clipboard");
                    }}
                    className="text-[11px] font-mono text-orange-600 font-bold hover:underline cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-slate-600 font-mono text-[11px] whitespace-pre-wrap">{goToMarket.linkedInDmTemplate}</p>
              </div>
            )}
          </div>
        </StatCard>

        {/* Card 2: Acquisition Channels — FIXED: p.why instead of p.strategy/p.urgency */}
        <StatCard
          title="Acquisition Channels"
          icon={Rocket}
          iconColor="text-orange-500"
          stat={`${goToMarket?.platforms?.length || 0} Channels`}
          subtitle="Growth Flywheel"
          detailsTitle="Target Audience"
          detailsText={goToMarket?.targetAudience || "Blend high-intent organic search with community distribution."}
        >
          <div className="space-y-2 text-xs">
            {(goToMarket?.platforms || []).map((p, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between font-bold">
                  <span>{p.name}</span>
                  <span className="text-[10px] font-mono text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded font-bold">
                    Channel
                  </span>
                </div>
                <p className="text-slate-600 mt-0.5">{p.why}</p>
              </div>
            ))}
          </div>
        </StatCard>

        {/* Card 3: Social Launch Copy — NEW: Reddit & X posts rendered */}
        <StatCard
          title="Social Launch Copy"
          icon={MessageSquare}
          iconColor="text-orange-500"
          stat="Ready-to-Post"
          subtitle="Reddit, X (Twitter) & LinkedIn"
          detailsTitle="Launch Distribution"
          detailsText="Pre-written launch posts optimized for each platform's audience and algorithm."
        >
          <div className="space-y-3 text-xs">
            {goToMarket?.redditLaunchPost && (
              <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-900">🟠 Reddit Launch Post</span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(goToMarket.redditLaunchPost);
                      onToast?.("Reddit post copied to clipboard");
                    }}
                    className="text-[11px] font-mono text-orange-600 font-bold hover:underline cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-slate-700 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">{goToMarket.redditLaunchPost}</p>
              </div>
            )}

            {goToMarket?.twitterLaunchPost && (
              <div className="p-3 rounded-xl bg-sky-50/50 border border-sky-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-900">𝕏 Twitter Launch Post</span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(goToMarket.twitterLaunchPost);
                      onToast?.("Twitter post copied to clipboard");
                    }}
                    className="text-[11px] font-mono text-sky-600 font-bold hover:underline cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-slate-700 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">{goToMarket.twitterLaunchPost}</p>
              </div>
            )}

            {goToMarket?.linkedInSearchStrategy?.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-900 block mb-1">🔍 LinkedIn Search Queries</span>
                <div className="space-y-1">
                  {goToMarket.linkedInSearchStrategy.map((q, i) => (
                    <div key={i} className="text-slate-600 font-mono text-[11px] bg-white p-1.5 rounded border border-slate-100">
                      {q}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </StatCard>
      </ResponsiveCardGrid>

      {/* Launch Readiness Checklist */}
      {launchChecklist?.length > 0 && (
        <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 tracking-tight flex items-center gap-2">
            <ListTodo size={16} className="text-orange-500" />
            <span>Launch Readiness Checklist — {launchChecklist.length} Milestones</span>
          </h3>
          <div className="space-y-1.5 text-xs">
            {launchChecklist.map((item, idx) => (
              <label
                key={idx}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white transition-colors cursor-pointer text-slate-800"
              >
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="leading-snug">{item}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// DASHBOARD OVERVIEW (kept for legacy "dashboard" route)
// ============================================================================
function DashboardOverviewSection({
  onNavigate,
  viabilityScorecard,
  marketSizing,
  costEstimator,
  revenueSimulator,
  ideaAnalysis,
}) {
  const score = viabilityScorecard?.score ?? 84;
  const verdict = viabilityScorecard?.verdict || "Proceed";

  return (
    <div className="space-y-6">
      {/* Top 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-center">
          <span className="text-xs font-mono uppercase text-slate-400 block mb-1">
            Venture Viability Score
          </span>
          <div className="text-3xl sm:text-4xl font-black font-mono text-orange-600 my-1">
            {score} <span className="text-xs font-normal text-slate-400">/ 100</span>
          </div>
          <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-orange-50 text-orange-700 border border-orange-200">
            {verdict}
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-center">
          <span className="text-xs font-mono uppercase text-slate-400 block mb-1">
            Total Addressable Market (TAM)
          </span>
          <div className="text-3xl sm:text-4xl font-black font-mono text-slate-900 my-1">
            {marketSizing?.tam?.value || "$14.2B"}
          </div>
          <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-orange-50 text-orange-700 border border-orange-200">
            High Growth
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-center">
          <span className="text-xs font-mono uppercase text-slate-400 block mb-1">
            Monthly Runway Budget
          </span>
          <div className="text-3xl sm:text-4xl font-black font-mono text-slate-900 my-1">
            {costEstimator?.estimatedMonthlyCost || "$16-51"}
          </div>
          <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-50 text-slate-700 border border-slate-200">
            Lean Operations
          </span>
        </div>
      </div>

      {/* Jump Pad to all 6 sections */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 tracking-tight">
          Business Analysis Navigation
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {BUSINESS_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => onNavigate(sec.id)}
              className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 transition-all text-left group cursor-pointer"
            >
              <span className="text-xs font-bold text-slate-900 group-hover:text-orange-600 block">
                {sec.title}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block font-mono">
                View analysis →
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}