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
  CheckCircle2,
  Clock,
  ArrowRight,
  Rocket,
  FileDown,
  FileText,
  Loader2,
  LayoutGrid,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Briefcase,
  Home,
  MessageSquare,
  BookOpen,
  Edit2,
  Trash2,
  Plus,
  Info,
  Sparkles,
  Flame,
  Settings,
  HelpCircle,
  X,
  Zap,
  Bot,
  Code,
  Share2,
} from "lucide-react";
import { downloadMarkdown, downloadPdf } from "../components/exportBlueprint.js";
import {
  VenturusMarketSizeBubbleChart,
  VenturusViabilityGaugeChart,
  SwotAnalysisMatrix,
  LeanCanvasMatrix,
  UpmetricsFinancialSimulator,
} from "./CompetitorUpgrades.jsx";
import PrdDossier from "./PrdDossier.jsx";
import AiDebateWarRoomSection from "./BlueprintPhase3.jsx";
import LiveMarketEvidence from "./LiveMarketEvidence.jsx";
import PromptPackModal from "./PromptPackModal.jsx";
import SharePitchModal from "./SharePitchModal.jsx";
import {
  SectionGatewayHeader,
  ViabilitySpotlight,
  ActionDeck,
  StoryTrio,
} from "./BlueprintPhase2.jsx";
import {
  StatCard,
  PortersCard,
  DemandSignals,
  VulnerabilityGrid,
} from "./BlueprintPhase4.jsx";
import {
  CopyBlock,
  ChannelList,
  LaunchChecklist,
  InfoTooltip,
} from "./BlueprintPhase5.jsx";
import { STARTUP_GLOSSARY } from "../lib/cloudPricing.js";
import { AiDebateSummaryCard } from "./BlueprintPhase1.jsx";
import {
  ViabilityBreakdown,
  RoadmapStrip,
  EconomicsSnapshot,
  ExploreGrid,
} from "./BlueprintPhase7.jsx";
import {
  ReaderToolbar,
  EditableList,
  ResponsiveCardGrid,
  TileGrid,
  Tile,
  MetricRow,
  MilestoneTimeline,
  CompletionHero,
  Toast,
  useScrollSpy,
} from "./BlueprintPhase6.jsx";
import { formatCurrency, convertCurrencyString, useExchangeRate } from "../lib/currency.js";
import DictionaryBadge from "./dictionary/DictionaryBadge.jsx";


// ---------------------------------------------------------------------------
// Business Analysis Sub-Sections — 7-stage Institutional Startup Flow
// Enriched with specialized AI Agent co-founder metadata & telemetry.
// ---------------------------------------------------------------------------
export const BUSINESS_SECTIONS = [
  {
    id: "overview",
    label: "Executive Overview",
    title: "Executive Overview & Viability",
    agent: "Venture Synthesizer & Lead Analyst",
    agentShort: "Lead Synthesizer",
    agentRole: "Core Synthesis",
    numeral: "01",
  },
  {
    id: "vc-debate",
    label: "AI Debate (War Room)",
    title: "Multi-Agent VC Investment Committee Debate",
    agent: "Groq Llama 3.3, DeepSeek V3 & Gemini",
    agentShort: "Groq & DeepSeek VCs",
    agentRole: "VC War Room",
    numeral: "02",
  },
  {
    id: "customer-discovery",
    label: "Customer & Discovery",
    title: "Customer Persona & Discovery",
    agent: "Customer Discovery & Mom Test Agent",
    agentShort: "Customer Discovery",
    agentRole: "Lean Discovery",
    numeral: "03",
  },
  {
    id: "market-competitors",
    label: "Market & Competitors",
    title: "Market & Competitive Intelligence",
    agent: "Market Sizing & Competitor Intel Agent",
    agentShort: "Market & Intel",
    agentRole: "Competitive Intel",
    numeral: "04",
  },
  {
    id: "product-mvp",
    label: "Product & MVP",
    title: "Product Architecture & MVP Scope",
    agent: "Product & Technical Architect",
    agentShort: "Product Architect",
    agentRole: "MVP & Tech Stack",
    numeral: "05",
  },
  {
    id: "finances",
    label: "Financial Model",
    title: "Financial Model & Unit Economics",
    agent: "Financial Modeler & Unit Economics Agent",
    agentShort: "Financial Modeler",
    agentRole: "Cloud & Revenue Model",
    numeral: "06",
  },
  {
    id: "gtm",
    label: "Go-to-Market",
    title: "Go-to-Market & Launch Execution",
    agent: "Growth Hacker & GTM Strategist",
    agentShort: "Growth Strategist",
    agentRole: "Launch Engine",
    numeral: "07",
  },
];

// ---------------------------------------------------------------------------
// Robust Normalization Helpers for Model JSON Discrepancies
// ---------------------------------------------------------------------------
export function toSafeString(val, fallback = "") {
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

export function toSafeArray(val, fallback = []) {
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

export class SafeChartWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err, errInfo) {
    console.warn("Chart render fallback:", err, errInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500">
          <p className="font-semibold text-slate-700 mb-1">Chart visualization temporarily unavailable</p>
          <p className="text-[11px] text-slate-400">All data metrics remain fully accessible in the cards below.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

class SectionErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, retryKey: 0, isRetrying: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error, isRetrying: false };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Section render error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ isRetrying: true }, () => {
      setTimeout(() => {
        this.setState((prev) => ({
          hasError: false,
          error: null,
          retryKey: prev.retryKey + 1,
          isRetrying: false,
        }));
      }, 100);
    });
  };

  handleHardRefresh = () => {
    try {
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.isRetrying) {
      return (
        <div className="p-8 rounded-2xl bg-white border border-orange-200 shadow-xs max-w-xl text-center">
          <Loader2 size={24} className="animate-spin text-orange-600 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">Re-rendering section components...</p>
        </div>
      );
    }

    if (this.state.hasError) {
      return (
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-rose-200 shadow-xs max-w-3xl">
          <div className="flex items-center gap-3 text-rose-600 mb-2">
            <AlertTriangle size={22} className="shrink-0" />
            <h3 className="font-bold text-base">Section Notice</h3>
          </div>
          <p className="text-xs text-slate-600 mb-3 leading-relaxed">
            The view encountered a layout parsing difference from the AI model output. Click <strong>Retry Section</strong> to reload the components, or use <strong>Refresh Page</strong>.
          </p>

          {this.state.error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs font-mono text-rose-800 whitespace-pre-wrap overflow-x-auto max-h-32">
              {this.state.error?.message || String(this.state.error)}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={this.handleRetry}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              <Rocket size={13} />
              <span>Retry Section</span>
            </button>
            <button
              type="button"
              onClick={this.handleHardRefresh}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 active:scale-95 transition-all cursor-pointer border border-slate-200"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return <div key={this.state.retryKey}>{this.props.children}</div>;
  }
}

// ---------------------------------------------------------------------------
// Inline Editable List Component for Interactive Card Customization
export default function BlueprintDashboard({
  blueprint,
  setBlueprint,
  originalIdea,
  activeSection: controlledActiveSection,
  setActiveSection: setControlledActiveSection,
  viewMode: controlledViewMode,
  setViewMode: setControlledViewMode,
  scrollContainerRef,
  currentUser = null,
  onOpenPayment = () => {},
}) {
  const [internalActiveSection, setInternalActiveSection] = useState("overview");
  const activeSection =
    controlledActiveSection !== undefined ? controlledActiveSection : internalActiveSection;
  const setActiveSection = setControlledActiveSection || setInternalActiveSection;

  const [showPromptPackModal, setShowPromptPackModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const [displayMode, setDisplayMode] = useState("continuous"); // "continuous" | "focused"
  const isProgrammaticScrollRef = useRef(false);
  const activeSectionRef = useRef(activeSection);
  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  const sectionHeaderRef = useRef(null);
  const prevBlueprintRef = useRef(blueprint);
  const isFirstMountRef = useRef(true);

  // Interactive title editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [customTitle, setCustomTitle] = useState(null);
  const titleInputRef = useRef(null);

  const [internalViewMode, setInternalViewMode] = useState("dashboard");
  const viewMode = controlledViewMode !== undefined ? controlledViewMode : internalViewMode;
  const setViewMode = setControlledViewMode || setInternalViewMode;

  const [isFounderMode, setIsFounderMode] = useState(true);
  const [exporting, setExporting] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }, []);

  // Updaters for modifying blueprint cards live
  const updateSectionField = useCallback((sectionKey, fieldKey, updatedVal) => {
    if (setBlueprint) {
      setBlueprint((prev) => {
        const sec = prev?.[sectionKey] || {};
        return {
          ...prev,
          [sectionKey]: {
            ...sec,
            [fieldKey]: updatedVal,
          },
        };
      });
    }
    showToast("Updated item & saved to vault");
  }, [setBlueprint, showToast]);

  const updateRootField = useCallback((fieldKey, updatedVal) => {
    if (setBlueprint) {
      setBlueprint((prev) => ({
        ...prev,
        [fieldKey]: updatedVal,
      }));
    }
    showToast("Updated item & saved to vault");
  }, [setBlueprint, showToast]);

  // Bidirectional smooth jump with sticky header offset compensation
  const handleSmoothScrollToSection = useCallback((secId) => {
    setActiveSection(secId);
    activeSectionRef.current = secId;
    isProgrammaticScrollRef.current = true;

    const scrollTarget = scrollContainerRef?.current;
    const targetEl = document.getElementById(`section-${secId}`);

    if (scrollTarget && targetEl) {
      const containerRect = scrollTarget.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();
      // Apply clean 20px padding offset from the viewport top
      const targetTop = scrollTarget.scrollTop + (targetRect.top - containerRect.top) - 20;
      scrollTarget.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
    } else if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 700);
  }, [setActiveSection, scrollContainerRef]);

  // Seamless accelerator from SectionContinuumPortal
  const handleDescendToSection = handleSmoothScrollToSection;

  const handleScrollToTop = useCallback(() => {
    isProgrammaticScrollRef.current = true;
    activeSectionRef.current = "overview";
    const scrollTarget = scrollContainerRef?.current || document.querySelector("main.overflow-y-auto") || window;
    if (scrollTarget.scrollTo) {
      scrollTarget.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      scrollTarget.scrollTop = 0;
    }
    setActiveSection("overview");
    setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 800);
  }, [scrollContainerRef, setActiveSection]);

  // Smart scroll management on initial mount or blueprint swap only
  // DO NOT scroll on activeSection change - that causes the auto-scroll-to-top bug
  useEffect(() => {
    if (prevBlueprintRef.current !== blueprint || isFirstMountRef.current) {
      prevBlueprintRef.current = blueprint;
      isFirstMountRef.current = false;
      const mainEl = scrollContainerRef?.current || document.querySelector("main.overflow-y-auto") || document.querySelector("main");
      if (mainEl) {
        mainEl.scrollTop = 0;
        // Also scroll window to top for any fixed elements
        if (mainEl !== window) {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }
      }
      return;
    }

    // Only scroll to section header in focused mode when user clicks nav (not on scroll-driven section change)
    if (displayMode === "focused" && sectionHeaderRef.current && !isProgrammaticScrollRef.current) {
      sectionHeaderRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [blueprint, displayMode, scrollContainerRef]); // Removed activeSection dependency

    useScrollSpy({
    containerRef: scrollContainerRef,
    enabled: displayMode === "continuous",
    lockedRef: isProgrammaticScrollRef,
    activeRef: activeSectionRef,
    onChange: setActiveSection,
  });

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
    aiDebate,
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
    customTitle || pitch?.elevatorPitch || originalIdea || "IdeaPulse Venture Blueprint";

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
    <div className="w-full max-w-7xl mx-auto mt-4 sm:mt-8 px-2 sm:px-4 pb-24 animate-fade-in text-slate-900">
      <ReaderToolbar
        briefNo={(originalIdea.length % 900) + 100}
        isFounderMode={isFounderMode}
        setIsFounderMode={setIsFounderMode}
        onCopy={handleCopySummary}
        onMarkdown={handleExportMarkdown}
        onPdf={handleExportPdf}
        exporting={exporting}
        onToast={showToast}
      />

      {viewMode === "prd" ? (
        <PrdDossier
          blueprint={blueprint}
          originalIdea={originalIdea}
          onSwitchToDashboard={() => setViewMode("dashboard")}
          onToast={showToast}
          onOpenPromptPack={() => setShowPromptPackModal(true)}
        />
      ) : (
        <div className="w-full">
          {/* MAIN CONTENT AREA */}
          <div className="w-full min-w-0">
            {/* Continuous vs Focused Section Rendering */}
            {displayMode === "continuous" ? (
              <div className="space-y-16">
                {/* 1. EXECUTIVE OVERVIEW & VIABILITY */}
                <section
                  id="section-overview"
                  data-section-id="overview"
                  className="blueprint-section section-anchor animate-section-in scroll-mt-20"
                >
                  <SectionErrorBoundary key="overview">
                    <OverviewSection
                      titleEdit={{
                        isEditing: isEditingTitle,
                        editedTitle,
                        setEditedTitle,
                        onStart: handleStartEditTitle,
                        onSave: handleSaveTitle,
                        onCancel: handleCancelEditTitle,
                        inputRef: titleInputRef,
                      }}
                      viabilityScorecard={viabilityScorecard}
                      ideaAnalysis={ideaAnalysis}
                      marketSizing={marketSizing}
                      originalIdea={originalIdea}
                      pitch={pitch}
                      ventureTitle={ventureTitle}
                      customerPersona={customerPersona}
                      productPlan={productPlan}
                      businessStrategy={businessStrategy}
                      roadmap={roadmap}
                      launchChecklist={launchChecklist}
                      costEstimator={costEstimator}
                      revenueSimulator={revenueSimulator}
                      marketResearch={marketResearch}
                      competitorWeaknessAnalysis={competitorWeaknessAnalysis}
                      isFounderMode={isFounderMode}
                      aiDebate={aiDebate}
                      onNavigate={handleSmoothScrollToSection}
                      isActive={activeSection === "overview" || activeSection === "dashboard"}
                    />
                  </SectionErrorBoundary>
                </section>

                {/* 2. 3-AI WAR ROOM DEBATE */}
                <section
                  id="section-vc-debate"
                  data-section-id="vc-debate"
                  className="blueprint-section section-anchor animate-section-in scroll-mt-20"
                >
                  <SectionGatewayHeader
                    numeral="02"
                    title="Multi-Agent VC Investment Committee Debate"
                    subtitle="Autonomous VC War Room clashing Bull, Bear, and Judge models."
                    badge="VC War Room"
                    agent="Groq Llama, DeepSeek & Gemini"
                    onJumpTop={handleScrollToTop}
                    isActive={activeSection === "vc-debate"}
                  />
                  <SectionErrorBoundary key="vc-debate">
                    <AiDebateWarRoomSection
                      aiDebate={aiDebate}
                      blueprint={blueprint}
                      originalIdea={originalIdea}
                      onUpdateAiDebate={(val) => updateRootField("aiDebate", val)}
                      onUpdateViabilityScorecard={(val) => updateRootField("viabilityScorecard", val)}
                      onToast={showToast}
                    />
                  </SectionErrorBoundary>
                </section>

                {/* 3. CUSTOMER & DISCOVERY */}
                <section
                  id="section-customer-discovery"
                  data-section-id="customer-discovery"
                  className="blueprint-section section-anchor animate-section-in scroll-mt-20"
                >
                  <SectionGatewayHeader
                    numeral="03"
                    title="Customer Persona & Lean Discovery"
                    subtitle="Uncompromising customer empathy based on The Mom Test methodology."
                    badge="ICP & Personas"
                    agent="Customer Discovery Agent"
                    onJumpTop={handleScrollToTop}
                    isActive={activeSection === "customer-discovery"}
                  />
                  <SectionErrorBoundary key="customer-discovery">
                    <CustomerDiscoverySection
                      customerPersona={customerPersona}
                      customerDiscovery={customerDiscovery}
                      onUpdatePainPoints={(val) => updateSectionField("customerPersona", "painPoints", val)}
                      onUpdateQuestions={(val) => updateSectionField("customerDiscovery", "interviewQuestions", val)}
                      onUpdateRedFlags={(val) => updateSectionField("customerDiscovery", "redFlags", val)}
                      onUpdateWtpSignals={(val) => updateSectionField("customerDiscovery", "willingnessToPaySignals", val)}
                    />
                  </SectionErrorBoundary>
                </section>

                {/* 4. MARKET & COMPETITORS */}
                <section
                  id="section-market-competitors"
                  data-section-id="market-competitors"
                  className="blueprint-section section-anchor animate-section-in scroll-mt-20"
                >
                  <SectionGatewayHeader
                    numeral="04"
                    title="Market & Competitive Intelligence"
                    subtitle="Strategic frameworks, industry dynamics, and incumbent vulnerability mapping."
                    badge="Market Intelligence"
                    agent="Competitive Intelligence Agent"
                    onJumpTop={handleScrollToTop}
                    isActive={activeSection === "market-competitors"}
                  />
                  <SectionErrorBoundary key="market-competitors">
                    <MarketCompetitorsSection
                      swotAnalysis={swotAnalysis}
                      portersFiveForces={portersFiveForces}
                      competitorWeaknessAnalysis={competitorWeaknessAnalysis}
                      marketResearch={marketResearch}
                      ideaAnalysis={ideaAnalysis}
                      customerPersona={customerPersona}
                      blueprint={blueprint}
                      currentUser={currentUser}
                      onOpenPayment={onOpenPayment}
                      onToast={showToast}
                      originalIdea={originalIdea}
                    />
                  </SectionErrorBoundary>
                </section>

                {/* 5. PRODUCT & MVP */}
                <section
                  id="section-product-mvp"
                  data-section-id="product-mvp"
                  className="blueprint-section section-anchor animate-section-in scroll-mt-20"
                >
                  <SectionGatewayHeader
                    numeral="05"
                    title="Product Architecture & MVP Scope"
                    subtitle="Disciplined lean feature scoping and modern production technology choices."
                    badge="Architecture & MVP"
                    agent="Product & Tech Architect"
                    onJumpTop={handleScrollToTop}
                    isActive={activeSection === "product-mvp"}
                  />
                  <SectionErrorBoundary key="product-mvp">
                    <ProductMvpSection
                      productPlan={productPlan}
                      technicalArchitecture={technicalArchitecture}
                      roadmap={roadmap}
                      onUpdateMvpFeatures={(val) => updateSectionField("productPlan", "mvpFeatures", val)}
                      onUpdateFutureFeatures={(val) => updateSectionField("productPlan", "futureFeatures", val)}
                      onOpenPromptPack={() => setShowPromptPackModal(true)}
                    />
                  </SectionErrorBoundary>
                </section>

                {/* 6. FINANCIAL MODEL */}
                <section
                  id="section-finances"
                  data-section-id="finances"
                  className="blueprint-section section-anchor animate-section-in scroll-mt-20"
                >
                  <SectionGatewayHeader
                    numeral="06"
                    title="Financial Model & Unit Economics"
                    subtitle="Realistic cost models and revenue simulators tailored to your business archetype."
                    badge="Financial Modeler"
                    agent="Financial Modeler Agent"
                    onJumpTop={handleScrollToTop}
                    isActive={activeSection === "finances"}
                  />
                  <SectionErrorBoundary key="finances">
                    <FinancesSection
                      costEstimator={costEstimator}
                      revenueSimulator={revenueSimulator}
                      businessStrategy={businessStrategy}
                      marketResearch={marketResearch}
                      ideaAnalysis={ideaAnalysis}
                      productPlan={productPlan}
                      blueprint={blueprint}
                    />
                  </SectionErrorBoundary>
                </section>

                {/* 7. GO-TO-MARKET */}
                <section
                  id="section-gtm"
                  data-section-id="gtm"
                  className="blueprint-section section-anchor animate-section-in scroll-mt-20"
                >
                  <SectionGatewayHeader
                    numeral="07"
                    title="Go-to-Market & Launch Execution"
                    subtitle="Zero-to-one organic distribution engine and interactive launch checklist."
                    badge="Launch Playbook"
                    agent="Growth & GTM Strategist"
                    onJumpTop={handleScrollToTop}
                    isActive={activeSection === "gtm"}
                  />
                  <SectionErrorBoundary key="gtm">
                    <GoToMarketSection
                      goToMarket={goToMarket}
                      launchChecklist={launchChecklist}
                      pitch={pitch}
                      ideaAnalysis={ideaAnalysis}
                      customerPersona={blueprint?.customerPersona}
                      onToast={showToast}
                      onUpdateChecklist={(val) => updateRootField("launchChecklist", val)}
                    />
                  </SectionErrorBoundary>

                  {/* Blueprint Completion & Export Hero */}
                  <CompletionHero
                    onExportPdf={handleExportPdf}
                    onExportMarkdown={handleExportMarkdown}
                    onScrollToTop={handleScrollToTop}
                  />
                </section>
              </div>
            ) : (
              /* Single Section Focused Mode */
              <div>
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
                        onClick={() => handleSmoothScrollToSection(prevSection.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                      >
                        <ChevronLeft size={14} />
                        <span>Previous</span>
                      </button>
                    )}
                    {nextSection && (
                      <button
                        onClick={() => handleSmoothScrollToSection(nextSection.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                      >
                        <span>Next</span>
                        <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div key={activeSection} className="animate-fade-in">
                  <SectionErrorBoundary key={activeSection}>
                    {(activeSection === "overview" || activeSection === "dashboard") && (
                      <OverviewSection
                        titleEdit={{
                          isEditing: isEditingTitle,
                          editedTitle,
                          setEditedTitle,
                          onStart: handleStartEditTitle,
                          onSave: handleSaveTitle,
                          onCancel: handleCancelEditTitle,
                          inputRef: titleInputRef,
                        }}
                        viabilityScorecard={viabilityScorecard}
                        ideaAnalysis={ideaAnalysis}
                        marketSizing={marketSizing}
                        originalIdea={originalIdea}
                        pitch={pitch}
                        ventureTitle={ventureTitle}
                        customerPersona={customerPersona}
                        productPlan={productPlan}
                        businessStrategy={businessStrategy}
                        roadmap={roadmap}
                        launchChecklist={launchChecklist}
                        costEstimator={costEstimator}
                        revenueSimulator={revenueSimulator}
                        marketResearch={marketResearch}
                        competitorWeaknessAnalysis={competitorWeaknessAnalysis}
                        isFounderMode={isFounderMode}
                        aiDebate={aiDebate}
                        onNavigate={handleSmoothScrollToSection}
                      />
                    )}

                    {activeSection === "vc-debate" && (
                      <AiDebateWarRoomSection
                        aiDebate={aiDebate}
                        blueprint={blueprint}
                        originalIdea={originalIdea}
                        onUpdateAiDebate={(val) => updateRootField("aiDebate", val)}
                        onUpdateViabilityScorecard={(val) => updateRootField("viabilityScorecard", val)}
                        onToast={showToast}
                      />
                    )}

                    {activeSection === "customer-discovery" && (
                      <CustomerDiscoverySection
                        customerPersona={customerPersona}
                        customerDiscovery={customerDiscovery}
                        onUpdatePainPoints={(val) => updateSectionField("customerPersona", "painPoints", val)}
                        onUpdateQuestions={(val) => updateSectionField("customerDiscovery", "interviewQuestions", val)}
                        onUpdateRedFlags={(val) => updateSectionField("customerDiscovery", "redFlags", val)}
                        onUpdateWtpSignals={(val) => updateSectionField("customerDiscovery", "willingnessToPaySignals", val)}
                      />
                    )}

                    {activeSection === "market-competitors" && (
                      <MarketCompetitorsSection
                        swotAnalysis={swotAnalysis}
                        portersFiveForces={portersFiveForces}
                        competitorWeaknessAnalysis={competitorWeaknessAnalysis}
                        marketResearch={marketResearch}
                        ideaAnalysis={ideaAnalysis}
                        customerPersona={customerPersona}
                        blueprint={blueprint}
                        currentUser={currentUser}
                        onOpenPayment={onOpenPayment}
                        onToast={showToast}
                        originalIdea={originalIdea}
                      />
                    )}

                    {activeSection === "product-mvp" && (
                      <ProductMvpSection
                        productPlan={productPlan}
                        technicalArchitecture={technicalArchitecture}
                        roadmap={roadmap}
                        onUpdateMvpFeatures={(val) => updateSectionField("productPlan", "mvpFeatures", val)}
                        onUpdateFutureFeatures={(val) => updateSectionField("productPlan", "futureFeatures", val)}
                        onOpenPromptPack={() => setShowPromptPackModal(true)}
                      />
                    )}

                    {activeSection === "finances" && (
                      <FinancesSection
                        costEstimator={costEstimator}
                        revenueSimulator={revenueSimulator}
                        businessStrategy={businessStrategy}
                        marketResearch={marketResearch}
                        ideaAnalysis={ideaAnalysis}
                        productPlan={productPlan}
                        blueprint={blueprint}
                      />
                    )}

                    {activeSection === "gtm" && (
                      <GoToMarketSection
                        goToMarket={goToMarket}
                        launchChecklist={launchChecklist}
                        pitch={pitch}
                        ideaAnalysis={ideaAnalysis}
                        customerPersona={blueprint?.customerPersona}
                        onToast={showToast}
                        onUpdateChecklist={(val) => updateRootField("launchChecklist", val)}
                      />
                    )}
                  </SectionErrorBoundary>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {/* 1-Click Prompt Pack Modal */}
      <PromptPackModal
        isOpen={showPromptPackModal}
        onClose={() => setShowPromptPackModal(false)}
        idea={originalIdea || blueprint?.idea}
        blueprint={blueprint}
        onToast={showToast}
      />

      {/* Share Pitch Modal */}
      <SharePitchModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        idea={originalIdea || blueprint?.idea}
        blueprint={blueprint}
        currentUser={currentUser}
        onOpenPayment={onOpenPayment}
        onToast={showToast}
      />

      {/* Toast */}
      <Toast message={toast} />
    </div>
  );
}

// ============================================================================
// ============================================================================
// SECTION 1: EXECUTIVE OVERVIEW & VIABILITY
// ============================================================================
function OverviewSection({
  titleEdit,
  viabilityScorecard,
  ideaAnalysis,
  marketSizing,
  originalIdea,
  pitch,
  ventureTitle,
  customerPersona,
  productPlan,
  businessStrategy,
  roadmap,
  launchChecklist,
  costEstimator,
  revenueSimulator,
  marketResearch,
  competitorWeaknessAnalysis,
  isFounderMode = true,
  aiDebate = {},
  onNavigate = () => {},
  isActive = false,
}) {
  const parseNum = (val, fallback) => {
    if (typeof val === "number" && !isNaN(val)) return val;
    if (typeof val === "string") {
      const match = val.match(/\d+(\.\d+)?/);
      if (match) return parseFloat(match[0]);
    }
    return fallback;
  };

  const score = Math.max(0, Math.min(100, parseNum(viabilityScorecard?.score, 84)));
  const marketDemandScore = Math.max(0, Math.min(100, parseNum(viabilityScorecard?.marketDemandScore, 88)));
  const technicalFeasibilityScore = Math.max(0, Math.min(100, parseNum(viabilityScorecard?.technicalFeasibilityScore, 82)));
  const monetizationScore = Math.max(0, Math.min(100, parseNum(viabilityScorecard?.monetizationScore, 85)));

  const verdict = toSafeString(viabilityScorecard?.verdict, "Proceed");
  const verdictReasoning = toSafeString(
    viabilityScorecard?.verdictReasoning,
    "Clear everyday user demand with manageable build requirements and healthy profit potential."
  );

  const targetCustomer = useMemo(() => {
    const list = toSafeArray(customerPersona?.targetUsers, []);
    if (list.length > 0) return list[0];
    return toSafeString(customerPersona?.userProfile, "Everyday users facing this problem");
  }, [customerPersona]);

  const coreMvpScope = useMemo(() => {
    const list = toSafeArray(productPlan?.mvpFeatures, []);
    return list.slice(0, 2).join(", ") || "Core MVP Launch";
  }, [productPlan]);

  const monetizationModel = useMemo(() => {
    return toSafeString(
      businessStrategy?.pricingIdea || businessStrategy?.revenueModel,
      "Monthly Subscription / Freemium"
    );
  }, [businessStrategy]);

  const priorityThisWeek = useMemo(() => {
    const milestoneTask = roadmap?.milestones?.[0]?.tasks?.[0];
    if (milestoneTask) return toSafeString(milestoneTask);
    const checklistItems = toSafeArray(launchChecklist, []);
    return toSafeString(checklistItems[0], "Talk to 5-10 real target customers to confirm their interest");
  }, [roadmap, launchChecklist]);

  const safeRiskTraps = useMemo(() => {
    const traps = toSafeArray(viabilityScorecard?.fatalRiskTraps, []);
    return traps.length > 0
      ? traps
      : [
          "Relying on polite compliments from friends instead of seeing if people will actually use or pre-order it.",
          "Trying to build too many features at once instead of launching a simple first version within 4 weeks.",
          "Spending heavily on paid ads before confirming that early users stick around and tell others.",
        ];
  }, [viabilityScorecard]);

  const problemText = toSafeString(
    ideaAnalysis?.problem,
    "Users face a repetitive, frustrating problem with existing tools that are clunky, overly complicated, or expensive."
  );

  const solutionText = toSafeString(
    ideaAnalysis?.goal || pitch?.elevatorPitch,
    "Provides a fast, easy-to-use, and accessible solution that directly solves this pain without friction."
  );

  const whyItWins = toSafeString(
    aiDebate?.bull?.unfairWedge || businessStrategy?.competitiveAdvantage,
    "Super simple design, zero setup hassle, and built specifically for what everyday users actually need."
  );

  const milestonesList = useMemo(() => {
    const raw = roadmap?.milestones;
    if (Array.isArray(raw) && raw.length >= 3) {
      return raw.slice(0, 4).map((m, idx) => ({
        week: `Week ${idx + 1}`,
        title: toSafeString(m.phase || m.title || `Phase ${idx + 1}`),
        task: toSafeString(m.tasks?.[0] || m.focus || m.description || "Validate with target users"),
      }));
    }
    return [
      { week: "Week 1", title: "Customer Interviews", task: "Interview 10 real users to confirm the exact pain points and test interest." },
      { week: "Week 2", title: "Build Version 1 (MVP)", task: "Build the simplest working version containing only the #1 core feature." },
      { week: "Week 3", title: "Private Beta Testing", task: "Give early access to 10 testers, observe how they use it, and fix rough spots." },
      { week: "Week 4", title: "Launch & First Revenue", task: "Launch to target online communities, ask for pre-orders or paid signups." },
    ];
  }, [roadmap]);

  const estimatedMonthlyCost = convertCurrencyString(toSafeString(costEstimator?.estimatedMonthlyCost, "₹1,500 - ₹4,900 / month"), "INR");
  const estimatedRevenue = convertCurrencyString(
    toSafeString(
      revenueSimulator?.year1Revenue || revenueSimulator?.estimatedYear1Revenue,
      "₹48,00,000 - ₹1,16,00,000 / year"
    ),
    "INR"
  );

  return (
    <div className="space-y-7 animate-fade-in text-slate-900">
            {/* 1. Executive Viability Spotlight Header (Phase 2) */}
      <ViabilitySpotlight
        isActive={isActive}
        ventureTitle={toSafeString(ventureTitle, "Startup Blueprint")}
        domain={toSafeString(ideaAnalysis?.domain, "Digital Venture")}
        pitch={toSafeString(pitch?.executiveSummary || ideaAnalysis?.problem || originalIdea)}
        score={score}
        verdict={verdict}
        edit={titleEdit}
      />

      {/* 2. Executive Quick Action Deck (Phase 2) */}
      <ActionDeck
        targetCustomer={targetCustomer}
        coreMvpScope={coreMvpScope}
        monetizationModel={monetizationModel}
        priorityThisWeek={priorityThisWeek}
      />

      {/* 3. 3-AI Multi-Agent Investment Committee Consensus ("VC War Room") */}
      <AiDebateSummaryCard
        aiDebate={aiDebate}
        viabilityScorecard={viabilityScorecard}
        onEnterWarRoom={() => onNavigate("vc-debate")}
      />

      {/* 4. Core Value Proposition Breakdown (Phase 2) */}
      <StoryTrio
        problem={problemText}
        solution={solutionText}
        whyItWins={whyItWins}
      />

      {/* 5. Venture Viability & Survival Breakdown (Phase 7) */}
      <ViabilityBreakdown
        score={score}
        verdict={verdict}
        thesis={verdictReasoning}
        risks={safeRiskTraps}
        pillars={[
          { icon: TrendingUp, label: "Market demand", value: marketDemandScore, text: "Measures whether real target users have an urgent, everyday need." },
          { icon: Cpu, label: "Ease of building", value: technicalFeasibilityScore, text: "Measures how fast it is to build and deploy version 1." },
          { icon: Wallet, label: "Profit and monetization", value: monetizationScore, text: "Measures whether customers will pay enough to sustain profit." },
        ]}
      />

      {/* 6. Visual Charts: Viability Gauge + Market Sizing Bubbles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SafeChartWrapper fallbackTitle="Viability Gauge">
          <VenturusViabilityGaugeChart viabilityScorecard={viabilityScorecard} ideaTitle={ventureTitle} />
        </SafeChartWrapper>
        <SafeChartWrapper fallbackTitle="Market Sizing Bubbles">
          <VenturusMarketSizeBubbleChart marketSizing={marketSizing} ideaTitle={ventureTitle} />
        </SafeChartWrapper>
      </div>

      {/* 7. 4-Week Milestone Execution Roadmap (Phase 7) */}
      <RoadmapStrip milestones={milestonesList} onViewAll={() => onNavigate("product-mvp")} />

      {/* 8. Financial Runway & Economics Snapshot (Phase 7) */}
      <EconomicsSnapshot cost={estimatedMonthlyCost} revenue={estimatedRevenue} model={monetizationModel} />

      {/* 9. Business Analysis Navigation Jump-Pad (Phase 7) */}
      <ExploreGrid sections={BUSINESS_SECTIONS.filter((s) => s.id !== "overview")} onNavigate={onNavigate} />
    </div>
  );
}

// ============================================================================
// SECTION 2: CUSTOMER PERSONA & DISCOVERY
// ============================================================================
function CustomerDiscoverySection({
  customerPersona,
  customerDiscovery,
  onUpdatePainPoints,
  onUpdateQuestions,
  onUpdateRedFlags,
  onUpdateWtpSignals,
}) {
  const users = useMemo(() => {
    return toSafeArray(customerPersona?.targetUsers, [
      "Everyday Consumers & Users",
      "Early Adopters Facing This Problem",
    ]);
  }, [customerPersona]);

  const painPoints = useMemo(() => {
    return toSafeArray(customerPersona?.painPoints, [
      "Current tools and workarounds are slow, confusing, or overly expensive.",
      "Losing hours every week trying to do repetitive tasks manually.",
      "Existing alternatives don't solve the core problem directly or simply.",
    ]);
  }, [customerPersona]);

  const profile = toSafeString(
    customerPersona?.userProfile,
    "People who struggle with this problem today and want a fast, simple, and dependable way to solve it."
  );

  const interviewQuestions = useMemo(() => {
    return toSafeArray(customerDiscovery?.interviewQuestions, [
      "What is the most frustrating part about dealing with this today?",
      "When was the last time you experienced this problem, and how did you handle it?",
      "Why did that workaround feel annoying or incomplete?",
      "Have you spent any money or time trying to fix this over the last few months?",
      "What would make you immediately recommend a new tool to others?",
    ]);
  }, [customerDiscovery]);

  const redFlags = useMemo(() => {
    return toSafeArray(customerDiscovery?.redFlags, [
      "\"That sounds cool, I'd probably use that if it existed\" (Polite praise with no real intent to use or pay).",
      "\"Send me a link once you launch in a few months\" (Polite brush-off showing low urgency).",
      "\"Other people I know might want this\" (Passing curiosity from someone who won't use it themselves).",
    ]);
  }, [customerDiscovery]);

  const wtpSignals = useMemo(() => {
    return toSafeArray(customerDiscovery?.willingnessToPaySignals, [
      "Customer asks when they can start using it or tries to pre-order immediately.",
      "Customer volunteers to test your earliest prototype and share honest feedback.",
      "Customer refers friends or coworkers who also face this exact frustration.",
    ]);
  }, [customerDiscovery]);

  return (
    <ResponsiveCardGrid>
      {/* Card 1: Customer Persona & Profile */}
      <StatCard
        title="Target Customer Profile"
        action={<DictionaryBadge termId="icp" />}
        icon={Users}
        iconColor="text-orange-500"
        stat={`${users.length} ICP Segments`}
        subtitle="Primary Economic Buyer"
        detailsTitle="Behavioral archetype"
        detailsText={profile}
      >
        <h5 className="bp-label">Target demographic / cohorts</h5>
        <div className="bp-tags is-orange">{users.map((u, i) => <span key={i}>{u}</span>)}</div>
      </StatCard>

      {/* Card 2: Critical Pain Points (Editable) */}
      <StatCard
        title="Critical Pain Points"
        icon={AlertTriangle}
        iconColor="text-rose-500"
        stat={`${painPoints.length} Core Bottlenecks`}
        subtitle="Workflow Friction Areas"
        detailsTitle="Impact on Purchasing Urgency"
        detailsText="These pain points create significant operational friction, resulting in high willingness to pay for a dedicated solution. Hover to edit or add custom pain points."
      >
        <EditableList
          items={painPoints}
          onUpdate={onUpdatePainPoints}
          placeholder="e.g. Inability to track unit-level profitability"
          addButtonLabel="Add Pain Point"
          accentColor="orange"
          icon={AlertTriangle}
        />
      </StatCard>

      {/* Card 3: Lean Customer Discovery — Mom Test (Editable) */}
      <StatCard
        title="Lean Customer Discovery"
        action={<DictionaryBadge termId="mom-test" />}
        icon={Lightbulb}
        iconColor="text-orange-500"
        stat="The Mom Test"
        subtitle="Founder Interview Validation Guide"
        detailsTitle="Validation Criteria & Hypotheses"
        detailsText="Focus strictly on past user habits, current workarounds, and financial trade-offs rather than hypothetical commitments."
      >
        <EditableList
          items={interviewQuestions}
          onUpdate={onUpdateQuestions}
          placeholder="e.g. How much did you spend trying to solve this last month?"
          addButtonLabel="Add Mom Test Question"
          accentColor="orange"
          icon={HelpCircle}
        />
      </StatCard>

      {/* Card 4: Red Flags (False Positives) (Editable) */}
      <StatCard
        title="False-Positive Red Flags"
        icon={AlertTriangle}
        iconColor="text-amber-500"
        stat={`${redFlags.length} Warning Signs`}
        subtitle="Answers That Deceive Founders"
        detailsTitle="Why Red Flags Matter"
        detailsText="These are common responses from interviewees that sound encouraging but indicate no real commitment. If you hear these, dig deeper — don't celebrate."
      >
        <EditableList
          items={redFlags}
          onUpdate={onUpdateRedFlags}
          placeholder="e.g. 'That sounds super cool, email me when it's done'"
          addButtonLabel="Add Red Flag"
          accentColor="amber"
          icon={AlertTriangle}
        />
      </StatCard>

      {/* Card 5: Willingness-to-Pay Signals (Editable) */}
      <StatCard
        title="Willingness-to-Pay Signals"
        action={<DictionaryBadge termId="willingness-to-pay" />}
        icon={Wallet}
        iconColor="text-emerald-500"
        stat={`${wtpSignals.length} Commitment Tests`}
        subtitle="Prove Buyer Intent Before Code"
        detailsTitle="Why Commitment Tests Matter"
        detailsText="These concrete commitment tests prove real buyer intent before you write a single line of code. Ask for skin in the game."
      >
        <EditableList
          items={wtpSignals}
          onUpdate={onUpdateWtpSignals}
          placeholder="e.g. Founder introduces you to their finance lead to approve PO"
          addButtonLabel="Add Commitment Signal"
          accentColor="emerald"
          icon={Wallet}
        />
      </StatCard>
    </ResponsiveCardGrid>
  );
}



// ============================================================================
// SECTION 3: MARKET & COMPETITIVE INTELLIGENCE
// ============================================================================
function MarketCompetitorsSection({
  swotAnalysis,
  portersFiveForces,
  competitorWeaknessAnalysis,
  marketResearch,
  ideaAnalysis,
  customerPersona,
  blueprint,
  currentUser = null,
  onOpenPayment = () => {},
  onToast = () => {},
  originalIdea = "",
}) {
  const resolvePorterForce = (key, aliases = [], fallbackAnalysis = "Moderate market dynamic.") => {
    const raw = portersFiveForces || blueprint?.portersFiveForces || {};
    let val = raw[key];
    if (!val) {
      for (const alias of aliases) {
        if (raw[alias]) {
          val = raw[alias];
          break;
        }
      }
    }
    let level = "Moderate";
    let analysis = fallbackAnalysis;
    if (typeof val === "string") {
      level = val;
    } else if (val && typeof val === "object") {
      level = toSafeString(val.level || val.intensity || val.rating || val.score, "Moderate");
      analysis = toSafeString(val.analysis || val.explanation || val.description || val.text, fallbackAnalysis);
    }
    return { level, analysis };
  };

  const buyerPower = resolvePorterForce(
    "buyerPower",
    ["buyers", "buyer_power", "customerPower"],
    "Customers face low-to-moderate initial switching costs; building automated workflow integrations creates compounding retention."
  );
  const supplierPower = resolvePorterForce(
    "supplierPower",
    ["suppliers", "supplier_power"],
    "Underlying LLM foundation models and cloud infrastructure continue to experience price commoditization and performance surges."
  );
  const competitiveRivalry = resolvePorterForce(
    "competitiveRivalry",
    ["rivalry", "industry_rivalry"],
    "Incumbents carry substantial enterprise technical debt; targeted speed and vertical personalization win early customers."
  );
  const threatOfSubstitutes = resolvePorterForce(
    "threatOfSubstitutes",
    ["substitutes", "threat_substitutes"],
    "Manual spreadsheets and fragmented agency retainer services represent the primary status-quo alternative."
  );
  const threatOfNewEntry = resolvePorterForce(
    "threatOfNewEntry",
    ["new_entrants", "newEntrants"],
    "Low technical barrier to entry for wrappers, but defensibility compounds rapidly via localized customer workflows and proprietary data."
  );

  const competitorsList = useMemo(() => {
    return toSafeArray(marketResearch?.competitors, [
      "Traditional Competitor",
      "General Tool Alternative",
      "Manual In-House Workaround",
    ]);
  }, [marketResearch?.competitors]);

  const vulnerabilities = useMemo(() => {
    const rawList = Array.isArray(competitorWeaknessAnalysis)
      ? competitorWeaknessAnalysis
      : competitorWeaknessAnalysis && typeof competitorWeaknessAnalysis === "object"
      ? Object.values(competitorWeaknessAnalysis)
      : [];

    if (rawList.length > 0) {
      return rawList.map((c) => ({
        competitor: toSafeString(c?.competitor || c?.name, "Market Alternative"),
        offering: toSafeString(
          c?.offering || c?.description || c?.provides || c?.product,
          `Established general-purpose market alternative.`
        ),
        weaknesses: toSafeArray(c?.weaknesses || c?.weakness, [
          "Clunky, hard to use, and often too expensive for everyday users.",
        ]).join("; "),
        missedOpportunities: toSafeArray(c?.missedOpportunities || c?.missedOpportunity, []).join("; "),
        suggestedDifferentiation: toSafeString(
          c?.suggestedDifferentiation || c?.differentiation,
          "Provide a fast, friendly, zero-friction solution tailored to what users actually want."
        ),
      }));
    }

    return competitorsList.map((comp) => {
      const name = toSafeString(comp, "Market Alternative");
      return {
        competitor: name,
        offering: `Legacy incumbent providing manual software and complex workflows in this space.`,
        weaknesses: "Clunky interface, slow customer support, and expensive pricing plans.",
        missedOpportunities: "Overlooked simple self-serve onboarding, autonomous AI speed, and affordable pricing.",
        suggestedDifferentiation: `Deliver a fast, intuitive solution that gets the job done in seconds at a fraction of ${name}'s cost.`,
      };
    });
  }, [competitorWeaknessAnalysis, competitorsList]);

  const marketOpps = useMemo(() => {
    return toSafeArray(marketResearch?.opportunities, [
      "Strong demand for tools that save time and eliminate tedious manual tasks.",
      "Users want focused, straightforward tools instead of complex all-in-one software.",
      "People are willing to pay for tools that make their lives or work noticeably easier.",
    ]);
  }, [marketResearch?.opportunities]);

  return (
    <div className="space-y-6">
      {/* 1. Full 4-Quadrant SWOT Strategic Matrix (Institutional-Grade) */}
      <SwotAnalysisMatrix
        swotAnalysis={swotAnalysis}
        ideaAnalysis={ideaAnalysis}
        marketResearch={marketResearch}
        competitorWeaknessAnalysis={competitorWeaknessAnalysis}
        customerPersona={customerPersona}
        blueprint={blueprint}
      />

      {/* 2. Porter's Five Forces & Market Demand Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PortersCard
          forces={[
            { label: "Buyer Power", level: buyerPower.level, analysis: buyerPower.analysis, force: buyerPower },
            { label: "Supplier Power", level: supplierPower.level, analysis: supplierPower.analysis, force: supplierPower },
            { label: "Competitive Rivalry", level: competitiveRivalry.level, analysis: competitiveRivalry.analysis, force: competitiveRivalry },
            { label: "Threat of Substitution", level: threatOfSubstitutes.level, analysis: threatOfSubstitutes.analysis, force: threatOfSubstitutes },
            { label: "Threat of New Entrants", level: threatOfNewEntry.level, analysis: threatOfNewEntry.analysis, force: threatOfNewEntry },
          ]}
        />
        <DemandSignals
          domain={ideaAnalysis?.domain || "Market Intelligence"}
          demandText={marketResearch?.marketDemand || "Growing tailwinds driven by demand for autonomous AI workflows."}
          opportunities={marketOpps}
          competitors={competitorsList}
        />
      </div>

      {/* 3. Competitor Vulnerability & Exploit Strategies */}
      <VulnerabilityGrid items={vulnerabilities} vulnerabilities={vulnerabilities} />

      {/* 4. Live Competitor & Reddit Evidence Grounding (Scale Founder Feature) */}
      <LiveMarketEvidence
        idea={originalIdea || blueprint?.idea}
        domain={ideaAnalysis?.domain}
        competitors={competitorsList}
        currentUser={currentUser}
        onOpenPayment={onOpenPayment}
        onToast={onToast}
      />
    </div>
  );
}

// ============================================================================
// SECTION 4: PRODUCT ARCHITECTURE & MVP SCOPE
// ============================================================================
function ProductMvpSection({
  productPlan,
  technicalArchitecture,
  roadmap,
  onUpdateMvpFeatures,
  onUpdateFutureFeatures,
  onOpenPromptPack = () => {},
}) {
  return (
    <div className="space-y-6">
      {/* 1-Click AI Prompt Pack (Cursor, Lovable, Bolt, v0) */}
      <div className="rounded-2xl border border-orange-200/90 bg-gradient-to-r from-orange-50/70 via-white to-amber-50/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Code size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-mono uppercase font-bold text-orange-700">Developer Bridge</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold">Free & Pro</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              Export to Cursor, Bolt, Lovable & v0
            </h4>
            <p className="text-xs text-slate-500">
              Turn this 7-stage validated blueprint into ready-to-paste <code>.cursorrules</code> and full-app prompts in 1-click.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenPromptPack}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Sparkles size={13} className="text-orange-400" />
          Export Prompt Pack
        </button>
      </div>

      <ResponsiveCardGrid>
        {/* Card 1: MVP Scope (Sprint 1) */}
        <StatCard
          title="Product Plan"
          action={<DictionaryBadge termId="mvp-scope" />}
          icon={ListChecks}
          stat="Sprint 1 MVP"
          subtitle={`Priority: ${productPlan?.developmentPriority || "Speed to Market"}`}
          detailsTitle="Scope Rationale"
          detailsText="Prioritized to validate core customer value proposition and collect telemetry in under 4 weeks. Hover to edit, delete, or add custom features."
        >
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
              Core MVP Features (Editable)
            </span>
            <EditableList
              items={productPlan?.mvpFeatures || []}
              onUpdate={onUpdateMvpFeatures}
              placeholder="e.g. Automated real-time report generator"
              addButtonLabel="Add MVP Feature"
              accentColor="orange"
              icon={Check}
            />
          </div>
        </StatCard>

        {/* Card 2: Production Technical Architecture (Phase 6 Tiles + MetricRow) */}
        <StatCard
          title="Technical Architecture"
          action={<DictionaryBadge termId="cloud-architecture" />}
          icon={Cpu}
          stat="Production Stack"
          subtitle="Cloud & AI Infrastructure"
          detailsTitle="Architecture Overview"
          detailsText={toSafeString(technicalArchitecture?.architectureOverview, "Containerized cloud backend with modern reactive frontend.")}
        >
          <div className="space-y-3">
            <TileGrid cols={2}>
              <Tile label="Frontend" value={toSafeString(technicalArchitecture?.frontend, "React / Tailwind")} />
              <Tile label="Backend" value={toSafeString(technicalArchitecture?.backend, "FastAPI / Python")} />
              <Tile label="Database" value={toSafeString(technicalArchitecture?.database, "PostgreSQL / Vector")} />
              <Tile label="Cloud" value={toSafeString(technicalArchitecture?.hosting, "AWS / Vercel")} />
            </TileGrid>
            {technicalArchitecture?.documentIngestion && (
              <MetricRow
                label="Ingestion & OCR Pipeline"
                value={toSafeString(technicalArchitecture.documentIngestion)}
                tone="orange"
              />
            )}
            <MetricRow
              label="AI Models & APIs"
              value={toSafeString(technicalArchitecture?.aiApis, "Anthropic Claude / OpenAI / Local Embeddings")}
              tone="orange"
            />
          </div>
        </StatCard>

        {/* Card 3: Future Roadmap Phases */}
        <StatCard
          title="Future Roadmap"
          icon={MapIcon}
          stat="Phase 2 & 3"
          subtitle="Scaling & Enterprise Expansion"
          detailsTitle="Launch Strategy"
          detailsText={toSafeString(roadmap?.launchPlan, "Staged rollout to design partners followed by broad self-serve onboarding.")}
        >
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
              Future Expansion Roadmap (Editable)
            </span>
            <EditableList
              items={toSafeArray(productPlan?.futureFeatures, [])}
              onUpdate={onUpdateFutureFeatures}
              placeholder="e.g. Enterprise RBAC & Audit Trails"
              addButtonLabel="Add Roadmap Item"
              accentColor="orange"
              icon={Sparkles}
            />
          </div>
        </StatCard>
      </ResponsiveCardGrid>

      {/* Execution Milestones Timeline (Phase 6) */}
      {Array.isArray(roadmap?.milestones) && roadmap.milestones.length > 0 && (
        <MilestoneTimeline
          milestones={roadmap.milestones.map((m) => ({
            title: toSafeString(m.title),
            week: toSafeString(m.week),
            tasks: toSafeArray(m.tasks, []),
          }))}
        />
      )}
    </div>
  );
}

// ============================================================================
// SECTION 5: FINANCIAL MODEL & UNIT ECONOMICS
// ============================================================================
const COST_KEYS = ["domain", "hosting", "database", "aiApis", "email", "analytics", "storage", "authentication"];
const COST_LABELS = {
  domain: "🌐 Domain", hosting: "☁️ Hosting", database: "🗄️ Database", aiApis: "🤖 AI APIs",
  email: "📧 Email", analytics: "📊 Analytics", storage: "💾 Storage", authentication: "🔐 Auth",
};

function FinancesSection({
  costEstimator,
  revenueSimulator,
  businessStrategy,
  marketResearch,
  ideaAnalysis,
  productPlan,
  blueprint,
}) {
  const [selectedArchetype, setSelectedArchetype] = useState(() => {
    const domain = (ideaAnalysis?.domain || "").toLowerCase();
    const model = (businessStrategy?.revenueModel || "").toLowerCase();
    if (
      domain.includes("d2c") || domain.includes("retail") ||
      domain.includes("ecommerce") || domain.includes("physical") ||
      domain.includes("hardware") || model.includes("ecommerce")
    ) {
      return "d2c";
    }
    if (domain.includes("marketplace") || domain.includes("platform") || model.includes("marketplace") || model.includes("commission")) {
      return "marketplace";
    }
    if (domain.includes("agency") || domain.includes("service") || domain.includes("consult") || model.includes("service")) {
      return "agency";
    }
    return "saas";
  });

  const ARCHETYPES = {
    saas: { id: "saas", name: "B2B SaaS", grossMargin: 88, ltvMultiplier: 20, cacDivisor: 3, payback: "< 6 mos", typeLabel: "Software Subscription", churnNote: "5% monthly SaaS churn benchmark" },
    d2c: { id: "d2c", name: "D2C / E-Commerce", grossMargin: 54, ltvMultiplier: 2.2, cacDivisor: 2.0, payback: "First Order", typeLabel: "Physical Consumer Brand", churnNote: "Factoring manufacturing COGS & shipping" },
    marketplace: { id: "marketplace", name: "Marketplace", grossMargin: 22, ltvMultiplier: 25, cacDivisor: 3.5, payback: "< 8 mos", typeLabel: "Two-Sided Net Take Rate", churnNote: "4% platform churn with network effects" },
    agency: { id: "agency", name: "Agency / Retainer", grossMargin: 65, ltvMultiplier: 28, cacDivisor: 4, payback: "< 2 mos", typeLabel: "Client Retainers", churnNote: "3.5% client churn" },
  };

  const activeArch = ARCHETYPES[selectedArchetype] || ARCHETYPES.saas;
  const { rate: exchangeRate } = useExchangeRate();

  const arpuUsd = useMemo(() => {
    if (revenueSimulator?.pricingAssumption) {
      const match = String(revenueSimulator.pricingAssumption).match(/\$(\d+)/);
      if (match && match[1]) return parseInt(match[1], 10);
    }
    return 29;
  }, [revenueSimulator]);
  const arpu = Math.round(arpuUsd * exchangeRate);

  const monthlyBurnUsd = useMemo(() => {
    if (costEstimator?.estimatedMonthlyCost) {
      const match = String(costEstimator.estimatedMonthlyCost).match(/\$(\d+)/);
      if (match && match[1]) return parseInt(match[1], 10);
    }
    return 35;
  }, [costEstimator]);
  const monthlyBurn = Math.round(monthlyBurnUsd * exchangeRate);

  const breakevenSubscribers = Math.max(1, Math.ceil(monthlyBurn / arpu));
  const estimatedLtv = Math.round(arpu * activeArch.ltvMultiplier);
  const targetCac = Math.max(1, Math.round(estimatedLtv / activeArch.cacDivisor));
  const grossMargin = activeArch.grossMargin;

  return (
    <div className="space-y-6">
      {/* 1. Upmetrics Financial Simulator (Phase 5) */}
      <UpmetricsFinancialSimulator
        costEstimator={costEstimator}
        revenueSimulator={revenueSimulator}
      />

      {/* 2. Core Financial Cards Grid (Phase 6 Tiles + MetricRow) */}
      <ResponsiveCardGrid>
        {/* Card 1: Infrastructure & Cloud Costs */}
        <StatCard
          title={
            <span className="inline-flex items-center gap-1.5">
              <span>Infrastructure Costs</span>
              <InfoTooltip
                title={STARTUP_GLOSSARY.infraCosts.title}
                text={STARTUP_GLOSSARY.infraCosts.text}
                tip={STARTUP_GLOSSARY.infraCosts.tip}
                align="left"
              />
            </span>
          }
          action={<DictionaryBadge termId="cloud-architecture" />}
          icon={Wallet}
          stat={convertCurrencyString(toSafeString(costEstimator?.estimatedMonthlyCost, "₹1,500 - ₹4,900"), "INR")}
          subtitle="Estimated Monthly Burn"
          detailsTitle="Annual Projection"
          detailsText={`Estimated yearly cloud burn: ${convertCurrencyString(toSafeString(costEstimator?.estimatedYearlyCost, "₹18,000 - ₹58,000"), "INR")}. Highly cost-efficient serverless foundation with free tiers.`}
        >
          <div className="space-y-1">
            {COST_KEYS.map((key) => {
              const item = costEstimator?.[key];
              if (!item) return null;
              return (
                <MetricRow
                  key={key}
                  label={COST_LABELS[key] || key}
                  value={convertCurrencyString(toSafeString(item.monthlyCost, "₹0"), "INR")}
                  tag={item.freeTierSufficient ? "Free tier" : null}
                />
              );
            })}
          </div>
        </StatCard>

        {/* Card 2: User-Tier Revenue Projections */}
        <StatCard
          title={
            <span className="inline-flex items-center gap-1.5">
              <span>Revenue Projections</span>
              <InfoTooltip
                title={STARTUP_GLOSSARY.revProjections.title}
                text={STARTUP_GLOSSARY.revProjections.text}
                tip={STARTUP_GLOSSARY.revProjections.tip}
                align="left"
              />
            </span>
          }
          action={<DictionaryBadge termId="arr" label="ARR/MRR" />}
          icon={TrendingUp}
          stat={convertCurrencyString(toSafeString(revenueSimulator?.projections?.[2]?.annualRevenue, "₹5.7 Crore"), "INR")}
          subtitle={convertCurrencyString(toSafeString(revenueSimulator?.pricingAssumption, "Based on subscription model"), "INR")}
          detailsTitle="Pricing Assumption"
          detailsText={convertCurrencyString(revenueSimulator?.pricingAssumption || businessStrategy?.pricingIdea || "Tiered B2B SaaS pricing model with self-serve starter and high-ticket growth plans.", "INR")}
        >
          <div className="space-y-1">
            {(revenueSimulator?.projections || [
              { users: 100, monthlyRevenue: "₹4.7 Lakhs", annualRevenue: "₹56.4 Lakhs" },
              { users: 500, monthlyRevenue: "₹23.5 Lakhs", annualRevenue: "₹2.8 Crore" },
              { users: 1000, monthlyRevenue: "₹47 Lakhs", annualRevenue: "₹5.7 Crore" },
              { users: 5000, monthlyRevenue: "₹2.3 Crore", annualRevenue: "₹28 Crore" },
            ]).map((proj, i) => (
              <MetricRow
                key={i}
                label={`${proj.users?.toLocaleString()} users (${i === 0 ? "Traction" : i === 1 ? "PMF" : i === 2 ? "Scale" : "Leader"})`}
                value={`${convertCurrencyString(proj.monthlyRevenue, "INR")}/mo`}
                tag={`${convertCurrencyString(proj.annualRevenue, "INR")}/yr`}
                tone="orange"
              />
            ))}
          </div>
        </StatCard>

        {/* Card 3: Unit Economics & Multi-Archetype Health Ratios */}
        <StatCard
          title={
            <span className="inline-flex items-center gap-1.5">
              <span>Unit Economics & Ratios</span>
              <InfoTooltip
                title={STARTUP_GLOSSARY.unitEconomics.title}
                text={STARTUP_GLOSSARY.unitEconomics.text}
                tip={STARTUP_GLOSSARY.unitEconomics.tip}
                align="right"
              />
            </span>
          }
          action={<DictionaryBadge termId="unit-economics" />}
          icon={BarChart3}
          stat={`${formatCurrency(estimatedLtv, "INR")} LTV`}
          subtitle={`ARPU: ${formatCurrency(arpu, "INR")}/mo | Target CAC: <${formatCurrency(targetCac, "INR")}`}
          detailsTitle="Industry Benchmark"
          detailsText={`Configured for ${activeArch.typeLabel}. ${activeArch.churnNote}. Maintaining a healthy LTV:CAC ensures sustainable unit margins.`}
        >
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1.5">
                Select Business Model Archetype:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.values(ARCHETYPES).map((arch) => (
                  <button
                    key={arch.id}
                    type="button"
                    onClick={() => setSelectedArchetype(arch.id)}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold text-center transition-all cursor-pointer border ${
                      selectedArchetype === arch.id
                        ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {arch.name}
                  </button>
                ))}
              </div>
            </div>

            <TileGrid cols={2}>
              <Tile label="Gross Margin" value={`${grossMargin}%`} sub={activeArch.name} tone="green" />
              <Tile
                label="Payback Period"
                value={revenueSimulator?.retentionMetrics?.cacPaybackMonths || activeArch.payback}
                sub="Acquisition Recoup"
              />
            </TileGrid>

            <div>
              <MetricRow label="Average Revenue / Order (ARPU)" value={`${formatCurrency(arpu, "INR")}/mo`} />
              <MetricRow label="Expected Customer Lifetime Value" value={formatCurrency(estimatedLtv, "INR")} tone="green" />
              <MetricRow label="Max Allowable Target CAC" value={`< ${formatCurrency(targetCac, "INR")}`} tone="orange" />
              {revenueSimulator?.retentionMetrics?.projectedMonthlyChurn && (
                <MetricRow
                  label="Projected Monthly Churn"
                  value={revenueSimulator.retentionMetrics.projectedMonthlyChurn}
                  tone="slate"
                />
              )}
              {revenueSimulator?.retentionMetrics?.netLtvToCacRatio && (
                <MetricRow
                  label="Net LTV:CAC Ratio"
                  value={revenueSimulator.retentionMetrics.netLtvToCacRatio}
                  tone="green"
                />
              )}
            </div>
          </div>
        </StatCard>

        {/* Card 4: Breakeven & Capital Runway Analysis */}
        <StatCard
          title="Breakeven & Runway"
          icon={ShieldCheck}
          stat={`${breakevenSubscribers} subscribers`}
          subtitle="Monthly Cash Flow Breakeven"
          detailsTitle="Capital Efficiency"
          detailsText={`With monthly infrastructure burn estimated at ~${formatCurrency(monthlyBurn, "INR")} and ARPU at ~${formatCurrency(arpu, "INR")}/mo, cash flow breakeven is reached at just ${breakevenSubscribers} customers.`}
        >
          <div className="space-y-3">
            <TileGrid cols={2}>
              <Tile label="Monthly Burn" value={`${formatCurrency(monthlyBurn, "INR")}/mo`} />
              <Tile label="ARPU" value={`${formatCurrency(arpu, "INR")}/mo`} />
            </TileGrid>

            <div className="p-3 rounded-2xl bg-orange-50/70 border border-orange-100">
              <div className="flex items-center justify-between mb-1 text-xs">
                <span className="text-slate-600 font-mono">Breakeven Target</span>
                <span className="font-mono font-bold text-orange-700">{breakevenSubscribers} paying users</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: "0%" }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 mt-2">
                <span>Bootstrapped: Zero external capital</span>
                <span className="font-bold text-emerald-700">Infinite Runway</span>
              </div>
            </div>
          </div>
        </StatCard>

        {/* Card 5: Business Strategy & Monetization Tiers */}
        <StatCard
          title="Monetization Architecture"
          icon={Briefcase}
          stat="Tiered Model"
          subtitle={businessStrategy?.revenueModel || "Tiered SaaS Subscription"}
          detailsTitle="Pricing Architecture"
          detailsText={businessStrategy?.pricingIdea || "Three-tier subscription architecture with clear feature differentiation and usage upsells."}
        >
          <div className="space-y-3">
            <TileGrid cols={3}>
              <Tile label="Starter" value={`${formatCurrency(Math.max(499, Math.round(arpu * 0.6)), "INR")}/mo`} />
              <Tile label="Pro (Core)" value={`${formatCurrency(arpu, "INR")}/mo`} tone="orange" />
              <Tile label="Scale" value={`${formatCurrency(Math.round(arpu * 3), "INR")}/mo`} />
            </TileGrid>

            {businessStrategy?.marketingChannels?.length > 0 && (
              <div className="mt-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                  Primary Customer Acquisition Channels
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {businessStrategy.marketingChannels.map((ch, i) => (
                    <span
                      key={i}
                      className="text-[11px] bg-orange-50 text-orange-800 border border-orange-200 px-2 py-0.5 rounded-md font-medium"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </StatCard>
      </ResponsiveCardGrid>

      {/* 3. Lean Canvas Matrix */}
      <LeanCanvasMatrix
        ideaAnalysis={ideaAnalysis}
        productPlan={productPlan}
        marketResearch={marketResearch}
        costEstimator={costEstimator}
        businessStrategy={businessStrategy}
        swotAnalysis={blueprint?.swotAnalysis}
        pitch={blueprint?.pitch}
        goToMarket={blueprint?.goToMarket}
        customerPersona={blueprint?.customerPersona}
        viabilityScorecard={blueprint?.viabilityScorecard}
        competitorWeaknessAnalysis={blueprint?.competitorWeaknessAnalysis}
      />
    </div>
  );
}

// ============================================================================
// SECTION 6: GO-TO-MARKET & LAUNCH EXECUTION
// ============================================================================
function formatTemplateContent(content) {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((c) => (typeof c === "object" ? formatTemplateContent(c) : String(c)))
      .filter(Boolean)
      .join("\n\n");
  }
  if (typeof content === "object") {
    const subject = content.subject || content.subjectLine || content.headline || content.title;
    const body = content.body || content.emailBody || content.content || content.text || content.message || content.post;
    if (subject && body) {
      return `Subject: ${subject}\n\n${body}`;
    }
    if (body) {
      return String(body);
    }
    if (content.hook && content.thread) {
      const threadStr = Array.isArray(content.thread) ? content.thread.join("\n\n") : content.thread;
      return `${content.hook}\n\n${threadStr}`;
    }
    if (content.tweet || content.post) {
      return String(content.tweet || content.post);
    }
    return Object.entries(content)
      .map(([k, v]) => `${k.toUpperCase()}:\n${typeof v === "object" ? JSON.stringify(v, null, 2) : v}`)
      .join("\n\n");
  }
  return String(content);
}

function GoToMarketSection({
  goToMarket,
  launchChecklist,
  pitch,
  ideaAnalysis,
  customerPersona,
  onToast,
  onUpdateChecklist,
}) {
  const coldEmailText = formatTemplateContent(goToMarket?.coldEmailTemplate);
  const linkedInDmText = formatTemplateContent(goToMarket?.linkedInDmTemplate);
  const redditPostText = formatTemplateContent(goToMarket?.redditLaunchPost);
  const twitterPostText = formatTemplateContent(goToMarket?.twitterLaunchPost);
  const linkedInQueries = toSafeArray(goToMarket?.linkedInSearchStrategy, []);

  const platformsList = useMemo(() => {
    const raw = goToMarket?.platforms || [];
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((p) => {
        if (typeof p === "string") {
          return {
            name: p,
            why: "Direct outbound & high-intent organic distribution.",
            platform: p,
            strategy: "Direct outbound & high-intent organic distribution.",
            urgency: "Immediate",
          };
        }
        const name = toSafeString(p?.name || p?.platform || p?.channel || p?.title, "Channel");
        const why = toSafeString(p?.why || p?.strategy || p?.tactic || p?.description || p?.details, "Direct outbound & high-intent organic distribution.");
        const urgency = toSafeString(p?.urgency || p?.timing || p?.timeline, "Immediate");
        return {
          name,
          why,
          platform: name,
          strategy: why,
          urgency,
        };
      });
    }
    return [
      { name: "Founder-Led Outbound", why: "Direct personal outreach to 50 targeted prospects.", platform: "Founder-Led Outbound", strategy: "Direct personal outreach to 50 targeted prospects.", urgency: "Week 1" },
      { name: "Niche Communities", why: "Participate in subreddits & Discord servers answering relevant questions.", platform: "Niche Communities", strategy: "Participate in subreddits & Discord servers answering relevant questions.", urgency: "Week 2" },
      { name: "Organic Social / Build in Public", why: "Share transparent lessons and milestones to build trust.", platform: "Organic Social / Build in Public", strategy: "Share transparent lessons and milestones to build trust.", urgency: "Ongoing" },
    ];
  }, [goToMarket?.platforms]);

  const safeChecklist = toSafeArray(launchChecklist, [
    "Finalize customer interview script based on Mom Test guidelines",
    "Identify and message 30 target ICP contacts for discovery calls",
    "Ship landing page with clear value proposition and email capture",
    "Deploy core MVP with single high-value workflow loop",
    "Onboard first 5 design partners and instrument telemetry events",
    "Conduct weekly feedback reviews to iterate product-market fit",
  ]);

  return (
    <div className="space-y-6">
      <ResponsiveCardGrid>
        {/* Card 1: Founder Outreach Templates */}
        <StatCard
          title="Founder Outreach Templates"
          icon={Target}
          stat="Production Copy"
          subtitle="Cold Hooks & Outbound Templates"
          detailsTitle="Outbound Playbook"
          detailsText="Founder-led outbound playbook to secure the first 20 design partners with zero paid ad spend."
        >
          <div className="space-y-3 text-xs">
            {coldEmailText ? (
              <CopyBlock label="Cold email" text={coldEmailText} onCopy={onToast} />
            ) : null}

            {linkedInDmText ? (
              <CopyBlock label="LinkedIn DM" text={linkedInDmText} onCopy={onToast} />
            ) : null}
          </div>
        </StatCard>

        {/* Card 2: Acquisition Channels */}
        <StatCard
          title="Acquisition Channels"
          icon={Rocket}
          stat={`${platformsList.length} Channels`}
          subtitle="Growth Flywheel"
          detailsTitle="Target Audience"
          detailsText={
            typeof goToMarket?.targetAudience === "string"
              ? goToMarket.targetAudience
              : (goToMarket?.targetAudience ? JSON.stringify(goToMarket.targetAudience) : "Blend high-intent organic search with community distribution.")
          }
        >
          <ChannelList channels={platformsList} />
          {Array.isArray(goToMarket?.channelBenchmarks) && goToMarket.channelBenchmarks.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1.5">
                Conversion & Channel Benchmarks:
              </span>
              <div className="space-y-1.5">
                {goToMarket.channelBenchmarks.map((b, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px] bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/60 font-sans">
                    <span className="font-semibold text-slate-700">{b.channel || b.platform}</span>
                    <span className="font-mono text-orange-600 font-bold">{b.benchmark || b.conversionRate || b.openOrClickRate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </StatCard>

        {/* Card 3: Social Launch Copy */}
        <StatCard
          title="Social Launch Copy"
          icon={MessageSquare}
          stat="Ready-to-Post"
          subtitle="Reddit, X (Twitter) & LinkedIn"
          detailsTitle="Launch Distribution"
          detailsText="Pre-written launch posts optimized for each platform's audience and algorithm."
        >
          <div className="space-y-3 text-xs">
            {redditPostText ? (
              <CopyBlock label="Reddit launch post" text={redditPostText} onCopy={onToast} />
            ) : null}

            {twitterPostText ? (
              <CopyBlock label="X (Twitter) launch post" text={twitterPostText} onCopy={onToast} />
            ) : null}

            {linkedInQueries.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-900 block mb-1">🔍 LinkedIn Search Queries</span>
                <div className="space-y-1">
                  {linkedInQueries.map((q, i) => (
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

      {/* Launch Readiness Checklist (Phase 5) */}
      <LaunchChecklist items={safeChecklist} onUpdate={onUpdateChecklist} />
    </div>
  );
}
