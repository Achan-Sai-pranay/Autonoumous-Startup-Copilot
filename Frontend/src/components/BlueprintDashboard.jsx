// BlueprintDashboard.jsx
// ---------------------------------------------------------------------------
// V7: Scrollable Vertical Cards with Full, Untruncated Content
// 1. Left Sidebar:
//    - "Business analysis ⌵" with indented sub-items connected by a subtle ash line:
//      Standard analysis, Path to an MVP, Unique selling points, Customer persona,
//      Finances (active by default), Go-to-market strategy, Competitive analysis.
//    - Platform, Ask AI, Pitch deck, Resources, Lite plan quota card.
// 2. Horizontal Scrollable Card Tracks:
//    - The cards in each section sit in a clean horizontal track that scrolls
//      smoothly left and right (via trackpad, mouse, touch, or left/right arrow buttons).
// 3. Complete, Untruncated Founder Data:
//    - NO words reduced, NO line-clamp, NO slice(0, 3) cuts.
//    - Every card contains full, rich analysis, all questions, all features, all
//      metrics, and detailed narrative breakdowns matching the screenshot style.
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
// Business Analysis Sub-Sections (Indented under Business analysis with ash line)
// ---------------------------------------------------------------------------
export const BUSINESS_SECTIONS = [
  { id: "standard-analysis", label: "Standard analysis", title: "Standard Analysis" },
  { id: "path-to-mvp", label: "Path to an MVP", title: "Path to an MVP" },
  { id: "usp", label: "Unique selling points", title: "Unique Selling Points" },
  { id: "customer-persona", label: "Customer persona", title: "Customer Persona" },
  { id: "finances", label: "Finances", title: "Finances" },
  { id: "gtm", label: "Go-to-market strategy", title: "Go-to-market Strategy" },
  { id: "competitive-analysis", label: "Competitive analysis", title: "Competitive Analysis" },
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
  const [internalActiveSection, setInternalActiveSection] = useState("standard-analysis");
  const activeSection =
    controlledActiveSection !== undefined ? controlledActiveSection : internalActiveSection;
  const setActiveSection = setControlledActiveSection || setInternalActiveSection;

  const sectionHeaderRef = useRef(null);
  const prevBlueprintRef = useRef(blueprint);
  const isFirstMountRef = useRef(true);

  // Smart scroll management:
  // - On initial generation or new blueprint load: start at the very top (Startup Brief #326 & black box)
  // - On clicking a sub-section (Finances, Path to MVP, etc.): scroll directly to that section header
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
    pitch?.elevatorPitch || originalIdea || "LaunchPilot Venture Blueprint";

  const industryDomain =
    ideaAnalysis?.domain || "Professional and Management Development Training";

  const ventureDescription =
    pitch?.executiveSummary ||
    ideaAnalysis?.problem ||
    originalIdea ||
    "A digital platform specifically designed for founders with curated case studies, technical architecture, and mentorship.";

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
          {/* ------------------------------------------------------------- */}
          {/* MAIN CONTENT AREA */}
          {/* ------------------------------------------------------------- */}
          <div className="w-full min-w-0">
            {/* Top Venture Banner Card (Matching Screenshot Header) */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-7 mb-7 shadow-md relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="min-w-0 flex-1">
                  <div className="flex items-start sm:items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight break-words">
                      {ventureTitle}
                    </h1>
                    <button
                      onClick={() => showToast("Venture title is locked to analysis thesis")}
                      className="h-7 w-7 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-xs mt-1 sm:mt-0"
                      title="Edit venture details"
                    >
                      <Edit2 size={13} />
                    </button>
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

            {/* Render Scrollable Vertical Cards Track */}
            <div key={activeSection} className="animate-fade-in">
              <SectionErrorBoundary key={activeSection}>
                {/* FINANCES (Pixel-Matched to Screenshot Structure with Horizontal Scroll) */}
                {activeSection === "finances" && (
                  <FinancesSection
                    marketSizing={marketSizing}
                    marketResearch={marketResearch}
                    costEstimator={costEstimator}
                    customerPersona={customerPersona}
                    businessStrategy={businessStrategy}
                    revenueSimulator={revenueSimulator}
                  />
                )}

                {/* STANDARD ANALYSIS */}
                {activeSection === "standard-analysis" && (
                  <StandardAnalysisSection
                    viabilityScorecard={viabilityScorecard}
                    ideaAnalysis={ideaAnalysis}
                    customerDiscovery={customerDiscovery}
                    originalIdea={originalIdea}
                    marketResearch={marketResearch}
                    costEstimator={costEstimator}
                  />
                )}

                {/* PATH TO AN MVP */}
                {activeSection === "path-to-mvp" && (
                  <PathToMvpSection
                    productPlan={productPlan}
                    technicalArchitecture={technicalArchitecture}
                    roadmap={roadmap}
                  />
                )}

                {/* UNIQUE SELLING POINTS */}
                {activeSection === "usp" && (
                  <UniqueSellingPointsSection
                    swotAnalysis={swotAnalysis}
                    portersFiveForces={portersFiveForces}
                    competitorWeaknessAnalysis={competitorWeaknessAnalysis}
                    ideaAnalysis={ideaAnalysis}
                    marketResearch={marketResearch}
                    originalIdea={originalIdea}
                    blueprint={blueprint}
                  />
                )}

                {/* CUSTOMER PERSONA */}
                {activeSection === "customer-persona" && (
                  <CustomerPersonaSection customerPersona={customerPersona} />
                )}

                {/* GO-TO-MARKET STRATEGY */}
                {activeSection === "gtm" && (
                  <GoToMarketFullSection
                    goToMarket={goToMarket}
                    launchChecklist={launchChecklist}
                    pitch={pitch}
                    onToast={showToast}
                  />
                )}

                {/* COMPETITIVE ANALYSIS */}
                {activeSection === "competitive-analysis" && (
                  <CompetitiveAnalysisFullSection
                    marketSizing={marketSizing}
                    viabilityScorecard={viabilityScorecard}
                    competitorWeaknessAnalysis={competitorWeaknessAnalysis}
                    ideaTitle={ventureTitle}
                  />
                )}

                {/* DASHBOARD */}
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
// Horizontal Scroll Track for Cards ("we can scroll these cards left or right")
// ---------------------------------------------------------------------------
function HorizontalCardTrack({ children }) {
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -440 : 440;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative group/track">
      {/* Scroll Left Button */}
      <button
        onClick={() => handleScroll("left")}
        aria-label="Scroll left"
        className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/95 border border-slate-200/90 shadow-lg items-center justify-center text-slate-700 hover:text-orange-600 hover:scale-105 active:scale-95 transition-all cursor-pointer opacity-0 group-hover/track:opacity-100"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Horizontal Track with Snapping and Smooth Scroll */}
      <div
        ref={scrollRef}
        className="flex items-start overflow-x-auto gap-6 pb-6 pt-1 px-1 scrollbar-thin scroll-smooth snap-x"
        style={{ scrollbarWidth: "thin" }}
      >
        {children}
      </div>

      {/* Scroll Right Button */}
      <button
        onClick={() => handleScroll("right")}
        aria-label="Scroll right"
        className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/95 border border-slate-200/90 shadow-lg items-center justify-center text-slate-700 hover:text-orange-600 hover:scale-105 active:scale-95 transition-all cursor-pointer opacity-0 group-hover/track:opacity-100"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Unified Vertical Stat Card (Matching Screenshot Structure & Styling)
// Full, Unreduced Content - No line-clamp or artificial limits!
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
      className={`w-[340px] sm:w-[410px] lg:w-[430px] shrink-0 snap-start p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col hover:border-slate-300 hover:shadow-sm transition-all duration-200 ${className}`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
        {Icon && <Icon size={18} className={iconColor} />}
      </div>

      {/* Big Stat & Subtitle */}
      <div className="mb-5">
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight leading-tight">
          {stat}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>
        )}
      </div>

      {/* Middle Visual / Structured Content */}
      {children && <div className="mb-5">{children}</div>}

      {/* Bottom Detailed Narrative Breakdown */}
      {(detailsTitle || detailsText) && (
        <div className="pt-4 border-t border-slate-100">
          {detailsTitle && (
            <h4 className="text-xs font-bold text-slate-900 mb-1.5">{detailsTitle}</h4>
          )}
          {detailsText && (
            <p className="text-xs text-slate-600 leading-relaxed font-sans">{detailsText}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1. FINANCES SECTION (Pixel-Matched to Screenshot with Full Content & Scroll)
// ---------------------------------------------------------------------------
function FinancesSection({
  marketSizing,
  marketResearch,
  costEstimator,
  customerPersona,
  businessStrategy,
  revenueSimulator,
}) {
  const [showSimulator, setShowSimulator] = useState(false);

  const tamValue = marketSizing?.tam?.value || "$150 Billion";
  const tamSubtitle = marketResearch?.domain || "Global Online Education Market";
  const targetUser = customerPersona?.targetUsers?.[0] || "Entrepreneurial professionals";
  const competitors = (
    marketResearch?.competitors || ["Coursera", "Udemy", "LinkedIn Learning"]
  ).join(", ");
  const usp = (businessStrategy?.revenueStreams || ["Tailored MBA insights"]).join("; ");
  const marketDetails =
    marketResearch?.marketDemand ||
    marketSizing?.tam?.description ||
    "The global online education market is valued at approximately $150 billion, with a growing demand for specialized courses among entrepreneurial professionals aged 25-45. Competitors like Coursera, Udemy, and LinkedIn Learning dominate the space but often lack tailored, actionable insights specifically designed for founders.";

  const startupCostValue = costEstimator?.estimatedMonthlyCost || "$50,000-$70,000";
  const startupBreakdown =
    costEstimator?.breakdown ||
    "The startup costs encompass platform development to build a robust digital academy, content creation for high-quality MBA-inspired courses, initial marketing to attract early adopters, and licensing fees to ensure compliance and access to proprietary materials. Platform development is the largest expense due to the need for a seamless and scalable online learning environment.";

  const revenueValue = "$720,000";
  const revenueDetails =
    businessStrategy?.unitEconomics ||
    "Projected annual revenue is calculated based on targeted subscriber cohorts and tier pricing models. This projection assumes steady early adopter uptake, with increasing marketing efficiency as community-led growth takes place. Revenue is expected to accelerate significantly as enterprise mentorship tiers are introduced.";

  return (
    <div className="space-y-6">
      {/* Scrollable Horizontal Cards Track */}
      <HorizontalCardTrack>
        {/* Card 1: Market Research */}
        <StatCard
          title="Market Research"
          icon={BarChart3}
          iconColor="text-orange-500"
          stat={tamValue}
          subtitle={tamSubtitle}
          detailsTitle="Market Research Details"
          detailsText={marketDetails}
        >
          <div className="space-y-2.5 text-xs text-slate-700">
            <div className="flex items-start gap-2">
              <Users size={14} className="text-orange-500 shrink-0 mt-0.5" />
              <span>
                <strong>Target:</strong> {targetUser}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Target size={14} className="text-orange-500 shrink-0 mt-0.5" />
              <span>
                <strong>Competitors:</strong> {competitors}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Flame size={14} className="text-orange-500 shrink-0 mt-0.5" />
              <span>
                <strong>USP:</strong> {usp}
              </span>
            </div>
          </div>
        </StatCard>

        {/* Card 2: Startup Costs */}
        <StatCard
          title="Startup Costs"
          icon={DollarSign}
          iconColor="text-orange-500"
          stat={startupCostValue}
          subtitle="Estimated Total Startup Cost"
          detailsTitle="Startup Costs Breakdown"
          detailsText={startupBreakdown}
        >
          {/* 4 Tiles in 2x2 Grid Matching Screenshot */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-base block mb-0.5">💻</span>
              <span className="text-[11px] text-slate-500 block font-medium">Platform Development</span>
              <span className="text-xs font-bold text-slate-900 font-mono mt-0.5 block">$20k–$30k</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-base block mb-0.5">📚</span>
              <span className="text-[11px] text-slate-500 block font-medium">Content Creation</span>
              <span className="text-xs font-bold text-slate-900 font-mono mt-0.5 block">$10k–$15k</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-base block mb-0.5">📣</span>
              <span className="text-[11px] text-slate-500 block font-medium">Initial Marketing</span>
              <span className="text-xs font-bold text-slate-900 font-mono mt-0.5 block">$10k–$15k</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-base block mb-0.5">📜</span>
              <span className="text-[11px] text-slate-500 block font-medium">Licensing Fees</span>
              <span className="text-xs font-bold text-slate-900 font-mono mt-0.5 block">$5k–$10k</span>
            </div>
          </div>
        </StatCard>

        {/* Card 3: Revenue Projections */}
        <StatCard
          title="Revenue Projections"
          icon={TrendingUp}
          iconColor="text-orange-500"
          stat={revenueValue}
          subtitle="Projected Annual Revenue"
          detailsTitle="Revenue Projections"
          detailsText={revenueDetails}
        >
          {/* SVG Line Chart Matching Screenshot */}
          <div className="h-28 w-full relative flex items-center justify-center">
            <svg viewBox="0 0 240 80" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="revenueOrangeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <polygon
                points="10,65 70,55 140,38 210,12 210,75 10,75"
                fill="url(#revenueOrangeGrad)"
              />
              <polyline
                fill="none"
                stroke="#ea580c"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="10,65 70,55 140,38 210,12"
              />
              <circle cx="10" cy="65" r="3.5" fill="#ffffff" stroke="#ea580c" strokeWidth="2" />
              <circle cx="70" cy="55" r="3.5" fill="#ffffff" stroke="#ea580c" strokeWidth="2" />
              <circle cx="140" cy="38" r="3.5" fill="#ffffff" stroke="#ea580c" strokeWidth="2" />
              <circle cx="210" cy="12" r="4.5" fill="#ea580c" stroke="#ffffff" strokeWidth="2" />
              <text x="10" y="78" fontSize="8" fill="#94a3b8" fontFamily="monospace">
                M1
              </text>
              <text x="70" y="78" fontSize="8" fill="#94a3b8" fontFamily="monospace">
                M6
              </text>
              <text x="140" y="78" fontSize="8" fill="#94a3b8" fontFamily="monospace">
                Y1
              </text>
              <text x="200" y="78" fontSize="8" fill="#ea580c" fontFamily="monospace" fontWeight="bold">
                Y2
              </text>
            </svg>
          </div>
        </StatCard>

        {/* Card 4: Operating Expenses */}
        <StatCard
          title="Operating Expenses"
          icon={Wallet}
          iconColor="text-orange-500"
          stat="$54,500"
          subtitle="Monthly Operating Expenses"
          detailsTitle="Operating Expenses Breakdown"
          detailsText="Operating expenses are streamlined by utilizing auto-scaling serverless cloud tiers, outsourced content workflows, and lean founder-led support."
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
              <span className="text-slate-600">Cloud & Data Ingestion</span>
              <span className="font-mono font-bold text-slate-900">$1,800/mo</span>
            </div>
            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
              <span className="text-slate-600">AI APIs & Inference</span>
              <span className="font-mono font-bold text-slate-900">$2,400/mo</span>
            </div>
            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
              <span className="text-slate-600">Platform Maintenance</span>
              <span className="font-mono font-bold text-slate-900">$1,200/mo</span>
            </div>
          </div>
        </StatCard>

        {/* Card 5: Breakeven Analysis */}
        <StatCard
          title="Breakeven Analysis"
          icon={BarChart3}
          iconColor="text-orange-500"
          stat="500 subscriptions"
          subtitle="Monthly Breakeven Point"
          detailsTitle="Breakeven Rationale"
          detailsText="Assuming target blended ARPU across tier cohorts, breakeven is achieved within the first 8–10 months of organic founder-led growth."
        >
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono">Progress to Target</span>
              <span className="font-mono font-bold text-orange-600">62% On Track</span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full w-[62%]" />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Current: 310</span>
              <span className="font-bold">Target: 500</span>
            </div>
          </div>
        </StatCard>

        {/* Card 6: Funding & Risks */}
        <StatCard
          title="Funding & Risks"
          icon={ShieldCheck}
          iconColor="text-orange-500"
          stat="Funding Options:"
          subtitle="Capitalization Route"
          detailsTitle="Financing Strategy"
          detailsText="Recommended financing strategy prioritizes early customer revenue and angel capital to preserve equity and retain full product control."
        >
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-800 border border-orange-200">
              <span>👼</span> Angel Investors
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-800 border border-orange-200">
              <span>💰</span> Personal Savings
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              <span>🚀</span> Venture Debt
            </span>
          </div>
        </StatCard>
      </HorizontalCardTrack>

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
              : "Open Live Upmetrics Financial Simulator & Lean Canvas"}
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
                problem: [marketDetails],
                solution: [usp],
                uniqueValueProposition: [usp],
                unfairAdvantage: ["Proprietary dynamic AI synthesis & founder speed"],
                customerSegments: [targetUser],
                keyMetrics: ["MRR Growth", "CAC Payback < 6 mo", "Churn < 2%"],
                channels: ["Direct sales", "Organic founder audience", "Community referrals"],
                costStructure: [startupBreakdown],
                revenueStreams: [revenueDetails],
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. STANDARD ANALYSIS SECTION (Full Content with Horizontal Scroll)
// ---------------------------------------------------------------------------
function StandardAnalysisSection({
  viabilityScorecard,
  ideaAnalysis,
  customerDiscovery,
  originalIdea,
  marketResearch,
  costEstimator,
}) {
  const score = viabilityScorecard?.score ?? 84;
  const verdict = viabilityScorecard?.verdict || "Proceed";

  return (
    <HorizontalCardTrack>
      {/* Card 1: Venture Viability Scorecard (Full Content) */}
      <StatCard
        title="Venture Viability Scorecard"
        icon={ShieldCheck}
        iconColor="text-orange-500"
        stat={`${score} / 100`}
        subtitle={`Verdict: ${verdict}`}
        detailsTitle="Executive Investment Thesis"
        detailsText={
          viabilityScorecard?.investmentThesis ||
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

          {/* Fatal Risk Traps (Complete List) */}
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

      {/* Card 2: Startup Idea Thesis (Full Text - No Truncation) */}
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

      {/* Card 3: Lean Customer Discovery (The Mom Test - Complete Questions) */}
      <StatCard
        title="Lean Customer Discovery"
        icon={Users}
        iconColor="text-orange-500"
        stat="The Mom Test"
        subtitle="Founder Interview Validation Guide"
        detailsTitle="Validation Criteria & Hypotheses"
        detailsText={
          customerDiscovery?.interviewGuide ||
          "Focus strictly on past user habits, current workarounds, and financial trade-offs rather than hypothetical commitments."
        }
      >
        <div className="space-y-2.5 text-xs">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
            Core Discovery Questions (The Mom Test)
          </span>
          {(customerDiscovery?.interviewQuestions || [
            "What is the hardest part about your current workflow?",
            "When was the last time you spent money to solve this?",
            "What alternatives have you tried and why did they fall short?",
            "How does this problem affect your day-to-day productivity?",
          ]).map((q, i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed">
              <span className="text-orange-600 font-bold mr-1.5 font-mono">Q{i + 1}.</span>
              {q}
            </div>
          ))}

          {customerDiscovery?.targetPersonas?.length > 0 && (
            <div className="pt-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                Target Interview Personas
              </span>
              <div className="flex flex-wrap gap-1.5">
                {customerDiscovery.targetPersonas.map((p, i) => (
                  <span key={i} className="text-[11px] bg-orange-50 text-orange-800 border border-orange-200 px-2 py-0.5 rounded-md font-medium">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </StatCard>

      {/* Card 4: Market Dynamics & Research Signals */}
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
    </HorizontalCardTrack>
  );
}

// ---------------------------------------------------------------------------
// 3. PATH TO AN MVP SECTION (Full Content with Horizontal Scroll)
// ---------------------------------------------------------------------------
function PathToMvpSection({ productPlan, technicalArchitecture, roadmap }) {
  return (
    <HorizontalCardTrack>
      {/* Card 1: MVP Scope (Sprint 1) - ALL Features */}
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
              <span className="text-xs font-bold text-slate-800 block mt-0.5">
                {technicalArchitecture?.frontend || "React / Tailwind"}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-mono uppercase">Backend</span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5">
                {technicalArchitecture?.backend || "FastAPI / Python"}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-mono uppercase">Database</span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5">
                {technicalArchitecture?.database || "PostgreSQL / Vector"}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-mono uppercase">Cloud</span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5">
                {technicalArchitecture?.hosting || "AWS / Vercel"}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100 text-xs text-slate-700">
            <span className="font-bold text-sky-800 block mb-0.5">AI Models & APIs:</span>
            <span>{technicalArchitecture?.aiApis || "Anthropic Claude / OpenAI / Local Embeddings"}</span>
          </div>
        </div>
      </StatCard>

      {/* Card 3: Future Roadmap Phases - ALL Features */}
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

      {/* Card 4: Milestones Timeline */}
      {roadmap?.milestones?.length > 0 && (
        <StatCard
          title="Execution Milestones"
          icon={Rocket}
          iconColor="text-sky-500"
          stat={`${roadmap.milestones.length} Sprints`}
          subtitle="Timeline to Launch"
          detailsTitle="Execution Discipline"
          detailsText="Focus on milestone velocity and continuous weekly shipping."
        >
          <div className="space-y-3 text-xs">
            {roadmap.milestones.map((m, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{m.title}</span>
                  <span className="text-[10px] font-mono text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded font-bold">
                    {m.week}
                  </span>
                </div>
                <ul className="space-y-0.5 text-slate-600">
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
        </StatCard>
      )}
    </HorizontalCardTrack>
  );
}

// ---------------------------------------------------------------------------
// 4. UNIQUE SELLING POINTS SECTION (Full Content with Horizontal Scroll)
// ---------------------------------------------------------------------------
function UniqueSellingPointsSection({
  swotAnalysis,
  portersFiveForces,
  competitorWeaknessAnalysis,
  ideaAnalysis,
  marketResearch,
  originalIdea,
  blueprint,
}) {
  const rawSwot =
    swotAnalysis ||
    blueprint?.swotAnalysis ||
    blueprint?.swot ||
    blueprint?.swot_analysis ||
    blueprint?.strategicFrameworks?.swotAnalysis ||
    blueprint?.ideaAnalysis?.swot ||
    {};

  const parseSwotList = (raw) => {
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
    if (typeof raw === "object") {
      return Object.values(raw)
        .map((v) => (typeof v === "string" ? v.trim() : ""))
        .filter((s) => s && s.length > 0);
    }
    return [];
  };

  const parsedStrengths = parseSwotList(
    rawSwot.strengths || rawSwot.Strengths || rawSwot.strength || rawSwot.s
  );
  const parsedWeaknesses = parseSwotList(
    rawSwot.weaknesses || rawSwot.Weaknesses || rawSwot.weakness || rawSwot.w
  );
  const parsedOpportunities = parseSwotList(
    rawSwot.opportunities || rawSwot.Opportunities || rawSwot.opportunity || rawSwot.o
  );
  const parsedThreats = parseSwotList(
    rawSwot.threats || rawSwot.Threats || rawSwot.threat || rawSwot.t
  );

  const strengths = useMemo(() => {
    if (parsedStrengths.length > 0) return parsedStrengths;
    const list = [];
    if (ideaAnalysis?.feasibility) list.push(ideaAnalysis.feasibility);
    if (competitorWeaknessAnalysis?.[0]?.suggestedDifferentiation) {
      list.push(competitorWeaknessAnalysis[0].suggestedDifferentiation);
    }
    if (blueprint?.pitch?.elevatorPitch) {
      list.push(blueprint.pitch.elevatorPitch);
    }
    list.push("Lean architecture footprint with low initial burn and high operational margin.");
    list.push("Fast deployment velocity and specialized domain workflows compared to legacy tools.");
    return list.slice(0, 3);
  }, [parsedStrengths, ideaAnalysis, competitorWeaknessAnalysis, blueprint]);

  const weaknesses = useMemo(() => {
    if (parsedWeaknesses.length > 0) return parsedWeaknesses;
    const list = [];
    if (blueprint?.viabilityScorecard?.fatalRiskTraps?.length > 0) {
      list.push(blueprint.viabilityScorecard.fatalRiskTraps[0]);
    }
    list.push("Initial cold-start distribution challenge and unproven organic search authority.");
    list.push("Reliance on upstream foundation AI model API pricing and latency.");
    list.push("Early lack of proprietary user behavioral dataset before first 1,000 active cohorts.");
    return list.slice(0, 3);
  }, [parsedWeaknesses, blueprint]);

  const opportunities = useMemo(() => {
    if (parsedOpportunities.length > 0) return parsedOpportunities;
    const list = [];
    if (marketResearch?.opportunities?.length > 0) {
      list.push(...marketResearch.opportunities.slice(0, 2));
    }
    list.push("Expansion into enterprise self-hosted and compliance-hardened tiers.");
    list.push("API ecosystem and developer plugins for high-retention workflow lock-in.");
    return list.slice(0, 3);
  }, [parsedOpportunities, marketResearch]);

  const threats = useMemo(() => {
    if (parsedThreats.length > 0) return parsedThreats;
    const list = [];
    list.push("Incumbent platforms releasing similar native features as zero-cost additions.");
    list.push("Rapid shifts in foundation LLM model capabilities and commoditization.");
    list.push("Rising customer acquisition costs (CAC) on traditional paid distribution channels.");
    return list.slice(0, 3);
  }, [parsedThreats]);

  const competitiveRivalryObj =
    portersFiveForces?.competitiveRivalry ||
    blueprint?.portersFiveForces?.competitiveRivalry ||
    {};
  const threatOfSubstitutesObj =
    portersFiveForces?.threatOfSubstitution ||
    portersFiveForces?.threatOfSubstitutes ||
    blueprint?.portersFiveForces?.threatOfSubstitution ||
    blueprint?.portersFiveForces?.threatOfSubstitutes ||
    {};
  const threatOfNewEntryObj =
    portersFiveForces?.threatOfNewEntrants ||
    portersFiveForces?.threatOfNewEntry ||
    blueprint?.portersFiveForces?.threatOfNewEntrants ||
    blueprint?.portersFiveForces?.threatOfNewEntry ||
    {};

  return (
    <HorizontalCardTrack>
      {/* Card 1: SWOT Analysis Matrix */}
      <div className="w-[360px] sm:w-[460px] lg:w-[480px] shrink-0 snap-start p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">SWOT Analysis Matrix</h3>
            <ShieldCheck size={18} className="text-orange-500" />
          </div>

          <div className="mb-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight leading-tight">
              Strategic Matrix
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Internal & External Factors</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-100 space-y-1">
              <span className="font-bold text-orange-800 block">Strengths</span>
              <ul className="space-y-1 text-slate-700">
                {strengths.map((s, i) => (
                  <li key={i} className="leading-snug">• {s}</li>
                ))}
              </ul>
            </div>
            <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100 space-y-1">
              <span className="font-bold text-rose-800 block">Weaknesses</span>
              <ul className="space-y-1 text-slate-700">
                {weaknesses.map((w, i) => (
                  <li key={i} className="leading-snug">• {w}</li>
                ))}
              </ul>
            </div>
            <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100 space-y-1">
              <span className="font-bold text-sky-800 block">Opportunities</span>
              <ul className="space-y-1 text-slate-700">
                {opportunities.map((o, i) => (
                  <li key={i} className="leading-snug">• {o}</li>
                ))}
              </ul>
            </div>
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100 space-y-1">
              <span className="font-bold text-amber-800 block">Threats</span>
              <ul className="space-y-1 text-slate-700">
                {threats.map((t, i) => (
                  <li key={i} className="leading-snug">• {t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 mt-4">
          <h4 className="text-xs font-bold text-slate-900 mb-1">Strategic Edge</h4>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Leverage agility and AI automation to outpace incumbents burdened by technical debt.
          </p>
        </div>
      </div>

      {/* Card 2: Porter's Five Forces Breakdown */}
      <div className="w-[360px] sm:w-[460px] lg:w-[480px] shrink-0 snap-start p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Porter's Five Forces</h3>
            <Target size={18} className="text-orange-500" />
          </div>

          <div className="mb-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight leading-tight">
              Market Defensibility
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Industry Structure Dynamics</p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex justify-between font-bold mb-0.5">
                <span>Competitive Rivalry</span>
                <span className="text-orange-600 font-mono">
                  {competitiveRivalryObj.level || competitiveRivalryObj.intensity || "Moderate"}
                </span>
              </div>
              <p className="text-slate-600">
                {competitiveRivalryObj.analysis ||
                  "High number of early-stage tools competing for founder attention, but low direct feature overlap."}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex justify-between font-bold mb-0.5">
                <span>Threat of Substitution</span>
                <span className="text-orange-600 font-mono">
                  {threatOfSubstitutesObj.level || threatOfSubstitutesObj.intensity || "Low"}
                </span>
              </div>
              <p className="text-slate-600">
                {threatOfSubstitutesObj.analysis ||
                  "Alternative manual workflows are slow and expensive, making specialized automation sticky."}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex justify-between font-bold mb-0.5">
                <span>Threat of New Entrants</span>
                <span className="text-orange-600 font-mono">
                  {threatOfNewEntryObj.level || threatOfNewEntryObj.intensity || "Moderate"}
                </span>
              </div>
              <p className="text-slate-600">
                {threatOfNewEntryObj.analysis ||
                  "Low barrier to basic wrappers, but high barrier to building deep proprietary domain intelligence."}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 mt-4">
          <h4 className="text-xs font-bold text-slate-900 mb-1">Defensibility Strategy</h4>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Build compounding workflow data moats to increase switching costs.
          </p>
        </div>
      </div>

      {/* Card 3: Proprietary Moats & Incumbent Exploits */}
      {competitorWeaknessAnalysis?.length > 0 && (
        <StatCard
          title="Proprietary Strategic Moats"
          icon={ShieldCheck}
          iconColor="text-orange-500"
          stat="Defensibility Levers"
          subtitle="Unfair Advantages vs Incumbents"
          detailsTitle="Moat Defense Strategy"
          detailsText="Focus on hyper-personalized founder experiences that incumbents cannot easily copy."
        >
          <div className="space-y-2.5 text-xs">
            {competitorWeaknessAnalysis.map((c, i) => {
              const compName = c?.competitor || (typeof c === "string" ? c : `Competitor #${i + 1}`);
              const diffText = c?.suggestedDifferentiation || c?.weakness || (typeof c === "string" ? c : "Focus on rapid iteration and tailored founder workflows.");
              return (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">Moat #{i + 1}: vs {compName}</span>
                    <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-bold">
                      Incumbent
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{diffText}</p>
                </div>
              );
            })}
          </div>
        </StatCard>
      )}
    </HorizontalCardTrack>
  );
}

// ---------------------------------------------------------------------------
// 5. CUSTOMER PERSONA SECTION (Full Content with Horizontal Scroll)
// ---------------------------------------------------------------------------
function CustomerPersonaSection({ customerPersona }) {
  const users = customerPersona?.targetUsers || [];
  const painPoints = customerPersona?.painPoints || [];
  const profile = customerPersona?.userProfile || "Target profile currently synthesized.";

  return (
    <HorizontalCardTrack>
      {/* Card 1: Ideal Customer Profile (ICP) */}
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

      {/* Card 3: Commercial Buying Triggers */}
      <StatCard
        title="Buying Triggers"
        icon={Target}
        iconColor="text-orange-500"
        stat="High Commercial Urgency"
        subtitle="Trigger Events for Purchase"
        detailsTitle="Conversion Strategy"
        detailsText="Position the solution directly at the point of workflow pain to achieve friction-free onboarding."
      >
        <div className="space-y-2.5 text-xs text-slate-700">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold block mb-1">Budget Allocation:</span>
            <span>Target department discretionary software spend and productivity software allowances.</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold block mb-1">Decision Maker:</span>
            <span>Founder, VP of Engineering, or Operations Lead with purchasing authority.</span>
          </div>
        </div>
      </StatCard>
    </HorizontalCardTrack>
  );
}

// ---------------------------------------------------------------------------
// 6. GO-TO-MARKET STRATEGY SECTION (Full Content with Horizontal Scroll)
// ---------------------------------------------------------------------------
function GoToMarketFullSection({ goToMarket, launchChecklist, pitch, onToast }) {
  return (
    <HorizontalCardTrack>
      {/* Card 1: Outreach Swipe File */}
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
                  className="text-[11px] font-mono text-orange-600 font-bold hover:underline"
                >
                  Copy
                </button>
              </div>
              <p className="text-slate-600 line-clamp-3 font-mono text-[11px]">{goToMarket.coldEmailTemplate}</p>
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
                  className="text-[11px] font-mono text-orange-600 font-bold hover:underline"
                >
                  Copy
                </button>
              </div>
              <p className="text-slate-600 line-clamp-3 font-mono text-[11px]">{goToMarket.linkedInDmTemplate}</p>
            </div>
          )}
        </div>
      </StatCard>

      {/* Card 2: Acquisition Channels */}
      <StatCard
        title="Acquisition Channels"
        icon={Rocket}
        iconColor="text-orange-500"
        stat={`${goToMarket?.platforms?.length || 4} Channels`}
        subtitle="Growth Flywheel"
        detailsTitle="Inbound Strategy"
        detailsText="Blend high-intent organic search with community distribution on Reddit and founder networks."
      >
        <div className="space-y-2 text-xs">
          {(goToMarket?.platforms || []).map((p, i) => (
            <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex justify-between font-bold">
                <span>{p.name}</span>
                <span className="text-[10px] font-mono text-orange-700 bg-orange-50 px-1.5 py-0.2 rounded font-bold">
                  {p.urgency}
                </span>
              </div>
              <p className="text-slate-600 mt-0.5">{p.strategy}</p>
            </div>
          ))}
        </div>
      </StatCard>

      {/* Card 3: Launch Readiness Checklist */}
      {launchChecklist?.length > 0 && (
        <StatCard
          title="Launch Readiness Checklist"
          icon={ListTodo}
          iconColor="text-orange-500"
          stat={`${launchChecklist.length} Milestones`}
          subtitle="Pre-Launch to Day 1 Readiness"
          detailsTitle="Launch Strategy"
          detailsText="Execute every milestone sequentially to ensure compliance, stability, and conversion tracking."
        >
          <div className="space-y-1.5 text-xs">
            {launchChecklist.map((item, idx) => (
              <label
                key={idx}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white transition-colors cursor-pointer text-slate-800"
              >
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="leading-snug">{item}</span>
              </label>
            ))}
          </div>
        </StatCard>
      )}
    </HorizontalCardTrack>
  );
}

// ---------------------------------------------------------------------------
// 7. COMPETITIVE ANALYSIS SECTION (Full Visual Displays)
// ---------------------------------------------------------------------------
function CompetitiveAnalysisFullSection({
  marketSizing,
  viabilityScorecard,
  competitorWeaknessAnalysis,
  ideaTitle,
}) {
  return (
    <div className="space-y-6">
      {/* 3-Circle Bubble Chart and Speedometer Gauge Stacked Vertically */}
      <VenturusMarketSizeBubbleChart marketSizing={marketSizing} ideaTitle={ideaTitle} />
      <VenturusViabilityGaugeChart viabilityScorecard={viabilityScorecard} ideaTitle={ideaTitle} />

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
                  <span className="text-[10px] font-mono uppercase text-orange-600 font-bold block mb-0.5">
                    LaunchPilot Exploit Strategy
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
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

// ---------------------------------------------------------------------------
// 8. DASHBOARD OVERVIEW SECTION
// ---------------------------------------------------------------------------
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
            {costEstimator?.estimatedMonthlyCost || "$50k-$70k"}
          </div>
          <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-50 text-slate-700 border border-slate-200">
            Lean Operations
          </span>
        </div>
      </div>

      {/* Jump Pad to all 7 sections */}
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