// BlueprintDashboard.jsx
// ---------------------------------------------------------------------------
// V5: Matches VenturusAI reference with:
// 1. Left sidebar grouped into Platform, Venture (Dashboard, Business Analysis
//    with expandable tree connected by a slight ash line, Ask AI, Pitch deck,
//    Resources), and Lite plan quota progress bars.
// 2. Top Venture Banner with Edit icon, Industry badge, and narrative brief.
// 3. Section header with title + star ★, and < Previous / Next > buttons.
// 4. Clean, complete vertical card sections in a multi-column grid (no arrow carousel).
// 5. Finances section matching the reference screenshot:
//    - Market Research ($150 Billion, Target, Competitors, USP, Details)
//    - Startup Costs ($50,000-$70,000, 4-grid tiles, Breakdown)
//    - Revenue Projections ($720,000, SVG green line chart, Projections)
// ---------------------------------------------------------------------------
import { useState, memo, useCallback } from "react";
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
} from "lucide-react";
import { downloadMarkdown, downloadPdf } from "../components/exportBlueprint.js";
import {
  VentureViabilityScorecard,
  LeanCustomerDiscoverySection,
  SwotAnalysisMatrix,
  PortersFiveForcesBreakdown,
  MarketSizingSection,
  VenturusMarketSizeBubbleChart,
  VenturusViabilityGaugeChart,
  LeanCanvasMatrix,
  UpmetricsFinancialSimulator,
  FounderPalSwipeFile,
  ChatPrdDossierView,
} from "./CompetitorUpgrades.jsx";

// ---------------------------------------------------------------------------
// Accent system — White + Orange and Crisp Multi-Module Contrast
// ---------------------------------------------------------------------------
const ACCENT_TEXT = {
  sky: "text-sky-600",
  emerald: "text-emerald-600",
  amber: "text-amber-600",
  orange: "text-orange-600",
  rose: "text-rose-600",
  indigo: "text-indigo-600",
};
const ACCENT_BG = {
  sky: "bg-sky-50",
  emerald: "bg-emerald-50",
  amber: "bg-amber-50",
  orange: "bg-orange-50",
  rose: "bg-rose-50",
  indigo: "bg-indigo-50",
};
const ACCENT_BORDER = {
  sky: "border-sky-200",
  emerald: "border-emerald-200",
  amber: "border-amber-200",
  orange: "border-orange-200",
  rose: "border-rose-200",
  indigo: "border-indigo-200",
};
const ACCENT_DOT = {
  sky: "bg-sky-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  orange: "bg-orange-500",
  rose: "bg-rose-500",
  indigo: "bg-indigo-500",
};
const ACCENT_BAR = {
  sky: "bg-sky-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  orange: "bg-orange-500",
  rose: "bg-rose-500",
  indigo: "bg-indigo-500",
};

// ---------------------------------------------------------------------------
// Sub-sections under "Business analysis" (indented with left ash line)
// ---------------------------------------------------------------------------
const BUSINESS_SECTIONS = [
  { id: "standard-analysis", label: "Standard analysis", title: "Standard Analysis" },
  { id: "path-to-mvp", label: "Path to an MVP", title: "Path to an MVP" },
  { id: "usp", label: "Unique selling points", title: "Unique Selling Points" },
  { id: "customer-persona", label: "Customer persona", title: "Customer Persona" },
  { id: "finances", label: "Finances", title: "Finances" },
  { id: "gtm", label: "Go-to-market strategy", title: "Go-to-market Strategy" },
  { id: "competitive-analysis", label: "Competitive analysis", title: "Competitive Analysis" },
];

export default function BlueprintDashboard({ blueprint, originalIdea }) {
  // Defaults to "finances" matching user reference screenshot
  const [activeSection, setActiveSection] = useState("finances");
  const [isBusinessOpen, setIsBusinessOpen] = useState(true);
  const [viewMode, setViewMode] = useState("dashboard"); // "dashboard" | "prd"
  const [exporting, setExporting] = useState(null); // null | "pdf" | "md"
  const [toast, setToast] = useState(null); // null | string

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

  // Title, Domain, Description for the Top Venture Banner
  const ventureTitle =
    pitch?.elevatorPitch
      ? pitch.elevatorPitch.length > 50
        ? pitch.elevatorPitch.slice(0, 50) + "..."
        : pitch.elevatorPitch
      : originalIdea?.length > 50
      ? originalIdea.slice(0, 50) + "..."
      : originalIdea || "Entrepreneur Academy";

  const industryDomain =
    ideaAnalysis?.domain || "Professional and Management Development Training";

  const ventureDescription =
    pitch?.executiveSummary ||
    ideaAnalysis?.problem ||
    originalIdea ||
    "A digital platform specifically designed for entrepreneurs with curated case studies, technical architecture, and mentorship.";

  // Find previous and next sub-sections for the top-right < Previous / Next > buttons
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
      {/* Top Utility Bar (Brief Tag, Copy Brief, PDF & Markdown Export) */}
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
        <div className="md:flex md:gap-8 md:items-start">
          {/* ------------------------------------------------------------- */}
          {/* LEFT SIDEBAR (Matching Reference Screenshot) */}
          {/* ------------------------------------------------------------- */}
          <aside className="w-full md:w-64 shrink-0 mb-8 md:mb-0 sticky md:top-4 self-start max-h-[calc(100vh-4rem)] overflow-y-auto z-20 scrollbar-thin">
            <div className="bg-white border border-slate-200/80 p-4 rounded-3xl space-y-6 shadow-xs">
              {/* PLATFORM Category */}
              <div>
                <div className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Platform
                </div>
                <div className="space-y-0.5 mt-1">
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      showToast("Your ventures view");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Home size={15} className="text-slate-400" />
                    <span>Your ventures</span>
                  </button>
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      showToast("Analyze new venture ready");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Crosshair size={15} className="text-slate-400" />
                    <span>Analyze new venture</span>
                  </button>
                </div>
              </div>

              {/* VENTURE Category */}
              <div>
                <div className="px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Venture
                </div>
                <div className="space-y-0.5 mt-1">
                  {/* Dashboard */}
                  <button
                    onClick={() => {
                      setActiveSection("dashboard");
                      setViewMode("dashboard");
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      activeSection === "dashboard"
                        ? "bg-slate-100 text-slate-900 font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <LayoutGrid
                      size={15}
                      className={activeSection === "dashboard" ? "text-slate-900" : "text-slate-400"}
                    />
                    <span>Dashboard</span>
                  </button>

                  {/* Business Analysis Group (Expandable with Down Arrow) */}
                  <div>
                    <button
                      onClick={() => setIsBusinessOpen(!isBusinessOpen)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Briefcase size={15} className="text-slate-400" />
                        <span>Business analysis</span>
                      </div>
                      <ChevronDown
                        size={14}
                        className={`text-slate-400 transition-transform duration-200 ${
                          isBusinessOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Indented Sub-sections with the slight ash vertical line */}
                    {isBusinessOpen && (
                      <div className="border-l-2 border-slate-200 ml-4 pl-3.5 space-y-1 my-1.5 animate-fade-in">
                        {BUSINESS_SECTIONS.map((sec) => {
                          const isActive = activeSection === sec.id && viewMode === "dashboard";
                          return (
                            <button
                              key={sec.id}
                              onClick={() => {
                                setActiveSection(sec.id);
                                setViewMode("dashboard");
                              }}
                              className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer ${
                                isActive
                                  ? "bg-slate-100 text-slate-900 font-bold"
                                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium"
                              }`}
                            >
                              {sec.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Ask the AI */}
                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("open-cofounder-chat"));
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-orange-600 hover:bg-orange-50/60 transition-colors cursor-pointer group"
                  >
                    <MessageSquare size={15} className="text-slate-400 group-hover:text-orange-500" />
                    <span>Ask the AI</span>
                  </button>

                  {/* Pitch deck */}
                  <button
                    onClick={() => setViewMode(viewMode === "prd" ? "dashboard" : "prd")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      viewMode === "prd"
                        ? "bg-slate-100 text-slate-900 font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <FileText
                      size={15}
                      className={viewMode === "prd" ? "text-slate-900" : "text-slate-400"}
                    />
                    <span>Pitch deck</span>
                  </button>

                  {/* Resources */}
                  <button
                    onClick={handleExportPdf}
                    disabled={exporting === "pdf"}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <BookOpen size={15} className="text-slate-400" />
                    <span>Resources</span>
                  </button>
                </div>
              </div>

              {/* LITE PLAN QUOTA WIDGET (Matching Reference Screenshot) */}
              <div className="pt-4 border-t border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-900">
                  <span>Lite plan</span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
                    Active
                  </span>
                </div>
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span>Standard reports</span>
                    <span className="font-mono font-bold text-slate-700">10/10 left</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-full" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span>Premium reports</span>
                    <span className="font-mono font-bold text-slate-700">20/22 left</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full w-[90%]" />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* ------------------------------------------------------------- */}
          {/* MAIN CONTENT AREA */}
          {/* ------------------------------------------------------------- */}
          <main className="flex-1 min-w-0">
            {/* Top Venture Banner Card (Matching Screenshot Header) */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-7 mb-7 shadow-md relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white truncate">
                      {ventureTitle}
                    </h1>
                    <button
                      onClick={() => showToast("Venture title is locked to analysis thesis")}
                      className="h-7 w-7 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-xs"
                      title="Edit venture details"
                    >
                      <Edit2 size={13} />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-slate-200 border border-white/10 backdrop-blur-sm">
                      <Info size={13} className="text-purple-400" />
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
            <div className="flex items-center justify-between mb-6 pb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>{currentSectionObj.title}</span>
                  <span className="text-emerald-500 text-xl font-normal">★</span>
                </h2>
              </div>

              <div className="flex items-center gap-2.5">
                {prevSection && (
                  <button
                    onClick={() => setActiveSection(prevSection.id)}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-orange-600 hover:bg-orange-50 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                    <span>Previous</span>
                  </button>
                )}
                {nextSection && (
                  <button
                    onClick={() => setActiveSection(nextSection.id)}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-orange-600 hover:bg-orange-50 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Render Active Section Content as Neat, Complete Vertical Cards */}
            <div key={activeSection} className="animate-fade-in">
              {/* FINANCES (Exact match to reference screenshot) */}
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

              {/* UNIQUE SELLING POINTS (SWOT & PORTER'S FORCES) */}
              {activeSection === "usp" && (
                <UniqueSellingPointsSection
                  swotAnalysis={swotAnalysis}
                  portersFiveForces={portersFiveForces}
                  competitorWeaknessAnalysis={competitorWeaknessAnalysis}
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

              {/* COMPETITIVE ANALYSIS (Stacked Bubble Chart, Speedometer Gauge, Matrix) */}
              {activeSection === "competitive-analysis" && (
                <CompetitiveAnalysisFullSection
                  marketSizing={marketSizing}
                  viabilityScorecard={viabilityScorecard}
                  competitorWeaknessAnalysis={competitorWeaknessAnalysis}
                  ideaTitle={ventureTitle}
                />
              )}

              {/* DASHBOARD (Overview) */}
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
            </div>
          </main>
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
// 1. FINANCES SECTION (Exact match to Reference Screenshot)
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
    marketResearch?.competitors?.slice(0, 3) || ["Coursera", "Udemy", "LinkedIn Learning"]
  ).join(", ");
  const usp = businessStrategy?.revenueStreams?.[0] || "Tailored MBA insights";
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
      {/* 3 Complete Vertical Cards (Matching Reference Screenshot) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {/* Card 1: Market Research */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Market Research</h3>
              <BarChart3 size={18} className="text-emerald-500" />
            </div>

            <div className="mb-5">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                {tamValue}
              </div>
              <p className="text-xs text-slate-500 mt-1">{tamSubtitle}</p>
            </div>

            <div className="space-y-2.5 mb-6 text-xs text-slate-700">
              <div className="flex items-start gap-2">
                <Users size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Target:</strong> {targetUser}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Target size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Competitors:</strong> {competitors}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Flame size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>USP:</strong> {usp}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-auto">
            <h4 className="text-xs font-bold text-slate-900 mb-2">Market Research Details</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">{marketDetails}</p>
          </div>
        </div>

        {/* Card 2: Startup Costs */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Startup Costs</h3>
              <DollarSign size={18} className="text-emerald-500" />
            </div>

            <div className="mb-5">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                {startupCostValue}
              </div>
              <p className="text-xs text-slate-500 mt-1">Estimated Total Startup Cost</p>
            </div>

            {/* 4 Tiles in 2x2 Grid Matching Screenshot */}
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-base block mb-0.5">💻</span>
                <span className="text-[10px] text-slate-500 block font-medium">Platform Development</span>
                <span className="text-xs font-bold text-slate-900 font-mono mt-0.5 block">$20k–$30k</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-base block mb-0.5">📚</span>
                <span className="text-[10px] text-slate-500 block font-medium">Content Creation</span>
                <span className="text-xs font-bold text-slate-900 font-mono mt-0.5 block">$10k–$15k</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-base block mb-0.5">📣</span>
                <span className="text-[10px] text-slate-500 block font-medium">Initial Marketing</span>
                <span className="text-xs font-bold text-slate-900 font-mono mt-0.5 block">$10k–$15k</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-base block mb-0.5">📜</span>
                <span className="text-[10px] text-slate-500 block font-medium">Licensing Fees</span>
                <span className="text-xs font-bold text-slate-900 font-mono mt-0.5 block">$5k–$10k</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-auto">
            <h4 className="text-xs font-bold text-slate-900 mb-2">Startup Costs Breakdown</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">{startupBreakdown}</p>
          </div>
        </div>

        {/* Card 3: Revenue Projections */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Revenue Projections</h3>
              <TrendingUp size={18} className="text-emerald-500" />
            </div>

            <div className="mb-5">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                {revenueValue}
              </div>
              <p className="text-xs text-slate-500 mt-1">Projected Annual Revenue</p>
            </div>

            {/* SVG Line Chart Matching Screenshot */}
            <div className="h-28 w-full mb-6 relative flex items-center justify-center">
              <svg viewBox="0 0 240 80" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="revenueGreenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <polygon
                  points="10,65 70,55 140,38 210,12 210,75 10,75"
                  fill="url(#revenueGreenGrad)"
                />
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="10,65 70,55 140,38 210,12"
                />
                <circle cx="10" cy="65" r="3.5" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
                <circle cx="70" cy="55" r="3.5" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
                <circle cx="140" cy="38" r="3.5" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
                <circle cx="210" cy="12" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                <text x="10" y="78" fontSize="8" fill="#94a3b8" fontFamily="monospace">
                  M1
                </text>
                <text x="70" y="78" fontSize="8" fill="#94a3b8" fontFamily="monospace">
                  M6
                </text>
                <text x="140" y="78" fontSize="8" fill="#94a3b8" fontFamily="monospace">
                  Y1
                </text>
                <text x="200" y="78" fontSize="8" fill="#10b981" fontFamily="monospace" fontWeight="bold">
                  Y2
                </text>
              </svg>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-auto">
            <h4 className="text-xs font-bold text-slate-900 mb-2">Revenue Projections</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">{revenueDetails}</p>
          </div>
        </div>
      </div>

      {/* Expandable Live Simulator */}
      <div className="pt-2">
        <button
          onClick={() => setShowSimulator(!showSimulator)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 transition-colors cursor-pointer"
        >
          <Sparkles size={14} className="text-emerald-600" />
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
// 2. STANDARD ANALYSIS SECTION
// ---------------------------------------------------------------------------
function StandardAnalysisSection({
  viabilityScorecard,
  ideaAnalysis,
  customerDiscovery,
  originalIdea,
  marketResearch,
  costEstimator,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
      {/* Card 1: Venture Viability Scorecard */}
      <div className="lg:col-span-1">
        <VentureViabilityScorecard
          viabilityScorecard={viabilityScorecard}
          ideaAnalysis={ideaAnalysis}
          marketResearch={marketResearch}
          costEstimator={costEstimator}
          originalIdea={originalIdea}
        />
      </div>

      {/* Card 2: Startup Idea Thesis */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-orange-300 hover:shadow-md transition-all">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Startup Idea Thesis</h3>
            <Target size={18} className="text-orange-500" />
          </div>

          <div className="mb-4">
            <span className="text-[10px] font-mono uppercase bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200 font-bold">
              Core Founder Thesis
            </span>
            <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium mt-3">
              {originalIdea || "No idea prompt provided."}
            </p>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                Problem Statement
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{ideaAnalysis?.problem}</p>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                Mission & Goal
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{ideaAnalysis?.goal}</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 mt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Domain Feasibility</span>
            <span className="font-bold text-orange-600">{ideaAnalysis?.feasibility || "High"}</span>
          </div>
        </div>
      </div>

      {/* Card 3: Lean Customer Discovery */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-orange-300 hover:shadow-md transition-all">
        <LeanCustomerDiscoverySection customerDiscovery={customerDiscovery} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. PATH TO AN MVP SECTION
// ---------------------------------------------------------------------------
function PathToMvpSection({ productPlan, technicalArchitecture, roadmap }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
      {/* Card 1: Product Plan (Sprint 1 MVP Scope) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-sky-300 hover:shadow-md transition-all">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Product Plan</h3>
            <ListChecks size={18} className="text-sky-500" />
          </div>

          <div className="mb-4">
            <span className="text-[10px] font-mono uppercase bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-200 font-bold">
              MVP (Minimum Viable Product)
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-2">Core MVP Features (Sprint 1)</h4>
              <ul className="space-y-2">
                {(productPlan?.mvpFeatures || []).map((feat, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                    <Check size={13} className="text-sky-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 mt-4">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
            Development Priority
          </span>
          <p className="text-xs text-slate-700">{productPlan?.developmentPriority || "Speed to launch"}</p>
        </div>
      </div>

      {/* Card 2: Technical Architecture */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-sky-300 hover:shadow-md transition-all">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Technical Architecture</h3>
            <Cpu size={18} className="text-sky-500" />
          </div>

          <div className="mb-4">
            <span className="text-[10px] font-mono uppercase bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-200 font-bold">
              Production Cloud Stack
            </span>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                Frontend Stack
              </span>
              <p className="font-semibold text-slate-900">{technicalArchitecture?.frontend}</p>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                Backend Stack
              </span>
              <p className="font-semibold text-slate-900">{technicalArchitecture?.backend}</p>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                Database Architecture
              </span>
              <p className="font-semibold text-slate-900">{technicalArchitecture?.database}</p>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                Cloud Hosting
              </span>
              <p className="font-semibold text-slate-900">{technicalArchitecture?.hosting}</p>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                AI Models & APIs
              </span>
              <p className="font-semibold text-slate-900">{technicalArchitecture?.aiApis}</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 mt-4">
          <h4 className="text-[10px] font-mono uppercase text-slate-400 font-bold mb-1">Architecture Overview</h4>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            {technicalArchitecture?.architectureOverview}
          </p>
        </div>
      </div>

      {/* Card 3: Future Phases & Roadmap */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-sky-300 hover:shadow-md transition-all">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Future Roadmap</h3>
            <MapIcon size={18} className="text-sky-500" />
          </div>

          <div className="mb-4">
            <span className="text-[10px] font-mono uppercase bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-200 font-bold">
              Phased Expansion
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-2">Phase 2 & 3 Expansion</h4>
              <ul className="space-y-2">
                {(productPlan?.futureFeatures || []).map((feat, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                    <span className="text-sky-500 font-bold select-none">›</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 mt-4">
          <h4 className="text-[10px] font-mono uppercase text-slate-400 font-bold mb-1">Launch Plan</h4>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">{roadmap?.launchPlan}</p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. UNIQUE SELLING POINTS (SWOT & PORTER'S FORCES)
// ---------------------------------------------------------------------------
function UniqueSellingPointsSection({
  swotAnalysis,
  portersFiveForces,
  competitorWeaknessAnalysis,
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <SwotAnalysisMatrix swotAnalysis={swotAnalysis} />
        <PortersFiveForcesBreakdown portersFiveForces={portersFiveForces} />
      </div>

      {competitorWeaknessAnalysis?.length > 0 && (
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4 tracking-tight flex items-center gap-2">
            <ShieldCheck size={18} className="text-orange-500" />
            <span>Proprietary Strategic Moats & Defensibility</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {competitorWeaknessAnalysis.slice(0, 2).map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-bold text-slate-900 mb-1">Moat #{idx + 1}: Against {item.competitor}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{item.suggestedDifferentiation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. CUSTOMER PERSONA SECTION
// ---------------------------------------------------------------------------
function CustomerPersonaSection({ customerPersona }) {
  const users = customerPersona?.targetUsers || [];
  const painPoints = customerPersona?.painPoints || [];
  const profile = customerPersona?.userProfile || "Profile data currently being synthesized.";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
      {/* Card 1: Target Users (ICP) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Ideal Customer (ICP)</h3>
            <Users size={18} className="text-emerald-500" />
          </div>
          <div className="space-y-2.5">
            {users.map((u, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                <span className="text-emerald-600 font-bold mr-1.5 font-mono">0{i + 1}.</span>
                {u}
              </div>
            ))}
          </div>
        </div>
        <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-500 font-mono">
          High purchasing authority & commercial urgency
        </div>
      </div>

      {/* Card 2: High-Friction Pain Points */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Critical Pain Points</h3>
            <AlertTriangle size={18} className="text-rose-500" />
          </div>
          <div className="space-y-2.5">
            {painPoints.map((p, i) => (
              <div key={i} className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 text-xs text-rose-900">
                <span className="text-rose-600 font-bold mr-1.5">✕</span>
                {p}
              </div>
            ))}
          </div>
        </div>
        <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-500 font-mono">
          Identified via The Mom Test discovery questions
        </div>
      </div>

      {/* Card 3: Narrative Buyer Story */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Buyer Narrative Story</h3>
            <Target size={18} className="text-emerald-500" />
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">{profile}</p>
        </div>
        <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-500 font-mono">
          Emotional triggers & workflow friction narrative
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 6. GO-TO-MARKET STRATEGY FULL SECTION
// ---------------------------------------------------------------------------
function GoToMarketFullSection({ goToMarket, launchChecklist, pitch, onToast }) {
  return (
    <div className="space-y-6">
      <FounderPalSwipeFile gtm={goToMarket} pitch={pitch} onToast={onToast} />

      {launchChecklist?.length > 0 && (
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ListTodo size={18} className="text-orange-500" />
              <span>Launch Readiness Checklist</span>
            </h3>
            <span className="text-xs font-mono text-slate-500">{launchChecklist.length} Milestones</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {launchChecklist.map((item, idx) => (
              <label
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70 hover:bg-white transition-colors cursor-pointer text-xs sm:text-sm text-slate-800"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 7. COMPETITIVE ANALYSIS FULL SECTION (Stacked Vertically)
// ---------------------------------------------------------------------------
function CompetitiveAnalysisFullSection({
  marketSizing,
  viabilityScorecard,
  competitorWeaknessAnalysis,
  ideaTitle,
}) {
  return (
    <div className="space-y-6">
      {/* 3-Circle Bubble Chart and Viability Speedometer Stacked Vertically as Requested */}
      <VenturusMarketSizeBubbleChart marketSizing={marketSizing} ideaTitle={ideaTitle} />
      <VenturusViabilityGaugeChart viabilityScorecard={viabilityScorecard} ideaTitle={ideaTitle} />

      {/* Competitor Vulnerabilities Matrix */}
      {competitorWeaknessAnalysis?.length > 0 && (
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4 tracking-tight flex items-center gap-2">
            <Crosshair size={18} className="text-emerald-500" />
            <span>Incumbent Vulnerability & Exploit Strategies</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {competitorWeaknessAnalysis.map((c, i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{c.competitor}</span>
                  <span className="text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-bold">
                    Incumbent
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                    Structural Weakness
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {(c.weaknesses || []).join("; ") || c.weakness}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-emerald-600 font-bold block mb-1">
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
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm text-center">
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

        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm text-center">
          <span className="text-xs font-mono uppercase text-slate-400 block mb-1">
            Total Addressable Market (TAM)
          </span>
          <div className="text-3xl sm:text-4xl font-black font-mono text-slate-900 my-1">
            {marketSizing?.tam?.value || "$14.2B"}
          </div>
          <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            High Growth Sector
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm text-center">
          <span className="text-xs font-mono uppercase text-slate-400 block mb-1">
            Estimated Monthly Burn
          </span>
          <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-600 my-1">
            {costEstimator?.estimatedMonthlyCost || "$50k-$70k"}
          </div>
          <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-50 text-slate-700 border border-slate-200">
            Lean Operations
          </span>
        </div>
      </div>

      {/* Quick Access to Business Analysis Sections */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4 tracking-tight">
          Business Analysis Jump Pad
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {BUSINESS_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => onNavigate(sec.id)}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-orange-50 border border-slate-200/70 hover:border-orange-200 transition-all text-left group cursor-pointer"
            >
              <span className="text-xs font-bold text-slate-900 group-hover:text-orange-700 block">
                {sec.title}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block font-mono">
                Click to view analysis →
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}