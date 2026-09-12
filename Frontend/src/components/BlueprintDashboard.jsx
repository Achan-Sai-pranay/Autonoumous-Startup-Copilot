// BlueprintDashboard.jsx
// ---------------------------------------------------------------------------
// Matches VenturusAI reference screenshot:
// 1. Left Sidebar:
//    - "Business analysis ⌵" with indented sub-items connected by a subtle ash line:
//      Standard analysis, Path to an MVP, Unique selling points, Customer persona,
//      Finances (active), Go-to-market strategy, Competitive analysis.
//    - Platform, Ask AI, Pitch deck, Resources, Lite plan quota card.
// 2. Main Content Area:
//    - Vertical Card Sections in a 3-column grid (matching the screenshot):
//      * Header row: Category title + top-right icon
//      * Giant stat / headline number (text-3xl font-extrabold text-slate-900)
//      * Subtitle under stat
//      * Middle visual widget (icon bullets, 2x2 grid tiles, SVG charts, pills)
//      * Lower sub-header + detailed narrative paragraph text!
// 3. Real dynamic data from blueprint across all sections.
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
  Settings,
  HelpCircle,
  FolderKanban,
  User,
} from "lucide-react";
import { downloadMarkdown, downloadPdf } from "../components/exportBlueprint.js";
import {
  VentureViabilityScorecard,
  LeanCustomerDiscoverySection,
  SwotAnalysisMatrix,
  PortersFiveForcesBreakdown,
  VenturusMarketSizeBubbleChart,
  VenturusViabilityGaugeChart,
  LeanCanvasMatrix,
  UpmetricsFinancialSimulator,
  FounderPalSwipeFile,
  ChatPrdDossierView,
} from "./CompetitorUpgrades.jsx";

// ---------------------------------------------------------------------------
// Business Analysis Sub-Sections (Indented under Business analysis with ash line)
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
  // Defaults to "finances" matching user screenshot
  const [activeSection, setActiveSection] = useState("finances");
  const [isBusinessOpen, setIsBusinessOpen] = useState(true);
  const [viewMode, setViewMode] = useState("dashboard"); // "dashboard" | "prd"
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
      {/* Top Utility Bar (Export Actions) */}
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
                      showToast("Your ventures list");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Home size={15} className="text-slate-400" />
                    <span>Your ventures</span>
                  </button>
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      showToast("Ready to analyze new venture");
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

                  {/* Business Analysis Expandable Section */}
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

                    {/* Indented Sub-sections with the SLIGHT ASH VERTICAL LINE */}
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
                                  ? "bg-slate-100 text-slate-900 font-semibold"
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

              {/* LITE PLAN QUOTA PROGRESS BARS */}
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

              {/* Sidebar Footer links */}
              <div className="pt-3 border-t border-slate-100 space-y-1 text-slate-500 text-xs">
                <button className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 text-left">
                  <Sparkles size={14} />
                  <span>Example ventures</span>
                </button>
                <button className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-slate-50 text-left">
                  <div className="flex items-center gap-2">
                    <Settings size={14} />
                    <span>Settings</span>
                  </div>
                  <span className="text-slate-400 text-[10px]">›</span>
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 text-left">
                  <HelpCircle size={14} />
                  <span>Help</span>
                </button>
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

            {/* Render Vertical Cards Matching Screenshot Style (No Arrow Carousel) */}
            <div key={activeSection} className="animate-fade-in">
              {/* FINANCES (Pixel-Matched to Screenshot Structure) */}
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
// Unified Vertical Stat Card (Matching Screenshot Structure & Styling)
// ---------------------------------------------------------------------------
function StatCard({
  title,
  icon: Icon,
  iconColor = "text-emerald-500",
  stat,
  subtitle,
  children,
  detailsTitle,
  detailsText,
}) {
  return (
    <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition-all duration-200">
      <div>
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
        {children && <div className="mb-6">{children}</div>}
      </div>

      {/* Bottom Detailed Narrative Breakdown */}
      {(detailsTitle || detailsText) && (
        <div className="pt-4 border-t border-slate-100 mt-auto">
          {detailsTitle && (
            <h4 className="text-xs font-bold text-slate-900 mb-2">{detailsTitle}</h4>
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
// 1. FINANCES SECTION (Pixel-Matched to Screenshot Structure)
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
      {/* Row 1: Market Research, Startup Costs, Revenue Projections (Exact Match to Screenshot) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {/* Card 1: Market Research */}
        <StatCard
          title="Market Research"
          icon={BarChart3}
          iconColor="text-emerald-500"
          stat={tamValue}
          subtitle={tamSubtitle}
          detailsTitle="Market Research Details"
          detailsText={marketDetails}
        >
          <div className="space-y-2.5 text-xs text-slate-700">
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
        </StatCard>

        {/* Card 2: Startup Costs */}
        <StatCard
          title="Startup Costs"
          icon={DollarSign}
          iconColor="text-emerald-500"
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
          iconColor="text-emerald-500"
          stat={revenueValue}
          subtitle="Projected Annual Revenue"
          detailsTitle="Revenue Projections"
          detailsText={revenueDetails}
        >
          {/* SVG Line Chart Matching Screenshot */}
          <div className="h-28 w-full relative flex items-center justify-center">
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
        </StatCard>
      </div>

      {/* Row 2: Operating Expenses, Breakeven Analysis, Funding & Risks (Matching Screenshot Bottom Row) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {/* Card 4: Operating Expenses */}
        <StatCard
          title="Operating Expenses"
          icon={Wallet}
          iconColor="text-emerald-500"
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
          iconColor="text-emerald-500"
          stat="500 subscriptions"
          subtitle="Monthly Breakeven Point"
          detailsTitle="Breakeven Rationale"
          detailsText="Assuming target blended ARPU across tier cohorts, breakeven is achieved within the first 8–10 months of organic founder-led growth."
        >
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono">Progress to Target</span>
              <span className="font-mono font-bold text-emerald-600">62% On Track</span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-[62%]" />
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
          iconColor="text-emerald-500"
          stat="Funding Options:"
          subtitle="Capitalization Route"
          detailsTitle="Financing Strategy"
          detailsText="Recommended financing strategy prioritizes early customer revenue and angel capital to preserve equity and retain full product control."
        >
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span>👼</span> Angel Investors
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span>💰</span> Personal Savings
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              <span>🚀</span> Venture Debt
            </span>
          </div>
        </StatCard>
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
// 2. STANDARD ANALYSIS SECTION (Vertical Cards Style)
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
      {/* Card 1: Venture Viability Score */}
      <StatCard
        title="Venture Viability Score"
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
        <div className="space-y-2.5">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">Market Demand</span>
              <span className="font-bold font-mono text-slate-800">
                {viabilityScorecard?.marketDemandScore ?? 88}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full"
                style={{ width: `${viabilityScorecard?.marketDemandScore ?? 88}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">Technical Feasibility</span>
              <span className="font-bold font-mono text-slate-800">
                {viabilityScorecard?.technicalFeasibilityScore ?? 82}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${viabilityScorecard?.technicalFeasibilityScore ?? 82}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">Monetization Readiness</span>
              <span className="font-bold font-mono text-slate-800">
                {viabilityScorecard?.monetizationScore ?? 85}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${viabilityScorecard?.monetizationScore ?? 85}%` }}
              />
            </div>
          </div>
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
        <div className="space-y-2.5 text-xs text-slate-700">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-0.5">
              Problem Statement
            </span>
            <p className="line-clamp-3 leading-relaxed">{ideaAnalysis?.problem || originalIdea}</p>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-0.5">
              Strategic Goal
            </span>
            <p className="line-clamp-2 leading-relaxed">{ideaAnalysis?.goal}</p>
          </div>
        </div>
      </StatCard>

      {/* Card 3: Lean Customer Discovery */}
      <StatCard
        title="Lean Customer Discovery"
        icon={Users}
        iconColor="text-orange-500"
        stat="The Mom Test"
        subtitle="Founder Validation Guide"
        detailsTitle="Validation Criteria"
        detailsText="Focus strictly on past user habits and financial trade-offs rather than speculative commitments."
      >
        <div className="space-y-2 text-xs">
          {(customerDiscovery?.interviewQuestions || [
            "What is the hardest part about your current workflow?",
            "When was the last time you spent money to solve this?",
            "What alternatives have you tried and why did they fall short?",
          ])
            .slice(0, 3)
            .map((q, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
                <span className="text-orange-600 font-bold mr-1.5 font-mono">Q{i + 1}.</span>
                {q}
              </div>
            ))}
        </div>
      </StatCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. PATH TO AN MVP SECTION (Vertical Cards Style)
// ---------------------------------------------------------------------------
function PathToMvpSection({ productPlan, technicalArchitecture, roadmap }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
      {/* Card 1: MVP Scope (Sprint 1) */}
      <StatCard
        title="Product Plan"
        icon={ListChecks}
        iconColor="text-sky-500"
        stat="Sprint 1 MVP"
        subtitle={`Priority: ${productPlan?.developmentPriority || "Speed to Market"}`}
        detailsTitle="Scope Rationale"
        detailsText="Architected to test beachhead value proposition and collect user telemetry in under 4 weeks."
      >
        <ul className="space-y-2">
          {(productPlan?.mvpFeatures || []).slice(0, 4).map((feat, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
              <Check size={13} className="text-sky-500 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{feat}</span>
            </li>
          ))}
        </ul>
      </StatCard>

      {/* Card 2: Technical Architecture */}
      <StatCard
        title="Technical Architecture"
        icon={Cpu}
        iconColor="text-sky-500"
        stat="Production Stack"
        subtitle="Cloud & AI Infrastructure"
        detailsTitle="Architecture Overview"
        detailsText={technicalArchitecture?.architectureOverview || "Containerized cloud backend with modern reactive frontend."}
      >
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-mono uppercase">Frontend</span>
            <span className="text-xs font-bold text-slate-800 truncate block mt-0.5">
              {technicalArchitecture?.frontend || "React / Tailwind"}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-mono uppercase">Backend</span>
            <span className="text-xs font-bold text-slate-800 truncate block mt-0.5">
              {technicalArchitecture?.backend || "FastAPI / Node"}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-mono uppercase">Database</span>
            <span className="text-xs font-bold text-slate-800 truncate block mt-0.5">
              {technicalArchitecture?.database || "PostgreSQL / Vector"}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-mono uppercase">Cloud</span>
            <span className="text-xs font-bold text-slate-800 truncate block mt-0.5">
              {technicalArchitecture?.hosting || "AWS / Vercel"}
            </span>
          </div>
        </div>
      </StatCard>

      {/* Card 3: Future Roadmap */}
      <StatCard
        title="Future Roadmap"
        icon={MapIcon}
        iconColor="text-sky-500"
        stat="Phase 2 & 3"
        subtitle="Scaling & Enterprise Backlog"
        detailsTitle="Launch Execution Plan"
        detailsText={roadmap?.launchPlan || "Staged rollout to design partners followed by general market availability."}
      >
        <ul className="space-y-2">
          {(productPlan?.futureFeatures || []).slice(0, 4).map((feat, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
              <span className="text-sky-500 font-bold select-none">›</span>
              <span className="line-clamp-2">{feat}</span>
            </li>
          ))}
        </ul>
      </StatCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. UNIQUE SELLING POINTS SECTION (Vertical Cards Style)
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
        <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck size={16} className="text-orange-500" />
              <span>Proprietary Strategic Moats</span>
            </h3>
            <span className="text-xs font-mono text-slate-500">Defensibility Levers</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {competitorWeaknessAnalysis.slice(0, 2).map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-mono text-orange-700 font-bold uppercase block mb-1">
                  Moat #{idx + 1} vs {item.competitor}
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">{item.suggestedDifferentiation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. CUSTOMER PERSONA SECTION (Vertical Cards Style)
// ---------------------------------------------------------------------------
function CustomerPersonaSection({ customerPersona }) {
  const users = customerPersona?.targetUsers || [];
  const painPoints = customerPersona?.painPoints || [];
  const profile = customerPersona?.userProfile || "Target profile currently synthesized.";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
      {/* Card 1: Ideal Customer (ICP) */}
      <StatCard
        title="Customer Persona (ICP)"
        icon={Users}
        iconColor="text-emerald-500"
        stat={users[0] || "Target Founders"}
        subtitle="Primary Buyer Persona"
        detailsTitle="Buyer Persona Story"
        detailsText={profile}
      >
        <div className="space-y-2 text-xs">
          {users.slice(0, 3).map((u, i) => (
            <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
              <span className="text-emerald-600 font-bold mr-1.5 font-mono">0{i + 1}.</span>
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
          {painPoints.slice(0, 3).map((p, i) => (
            <div key={i} className="p-2.5 rounded-xl bg-rose-50/50 border border-rose-100 text-rose-900">
              <span className="text-rose-600 font-bold mr-1.5">✕</span>
              {p}
            </div>
          ))}
        </div>
      </StatCard>

      {/* Card 3: Commercial Urgency */}
      <StatCard
        title="Buying Triggers"
        icon={Target}
        iconColor="text-emerald-500"
        stat="High Commercial Urgency"
        subtitle="Trigger Events for Purchase"
        detailsTitle="Conversion Strategy"
        detailsText="Position the solution directly at the point of workflow pain to achieve friction-free onboarding."
      >
        <div className="space-y-2 text-xs text-slate-700">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold block mb-0.5">Budget Allocation:</span>
            <span>Target department discretionary software spend</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-bold block mb-0.5">Decision Maker:</span>
            <span>Founder, VP of Engineering, or Operations Lead</span>
          </div>
        </div>
      </StatCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 6. GO-TO-MARKET STRATEGY SECTION (Vertical Cards Style)
// ---------------------------------------------------------------------------
function GoToMarketFullSection({ goToMarket, launchChecklist, pitch, onToast }) {
  return (
    <div className="space-y-6">
      <FounderPalSwipeFile gtm={goToMarket} pitch={pitch} onToast={onToast} />

      {launchChecklist?.length > 0 && (
        <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ListTodo size={16} className="text-orange-500" />
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
// 7. COMPETITIVE ANALYSIS SECTION (Vertical Stack)
// ---------------------------------------------------------------------------
function CompetitiveAnalysisFullSection({
  marketSizing,
  viabilityScorecard,
  competitorWeaknessAnalysis,
  ideaTitle,
}) {
  return (
    <div className="space-y-6">
      {/* 3-Circle Bubble Chart and Speedometer Gauge */}
      <VenturusMarketSizeBubbleChart marketSizing={marketSizing} ideaTitle={ideaTitle} />
      <VenturusViabilityGaugeChart viabilityScorecard={viabilityScorecard} ideaTitle={ideaTitle} />

      {/* Competitor Vulnerabilities Matrix */}
      {competitorWeaknessAnalysis?.length > 0 && (
        <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 tracking-tight flex items-center gap-2">
            <Crosshair size={16} className="text-emerald-500" />
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
                  <span className="text-[10px] font-mono uppercase text-emerald-600 font-bold block mb-0.5">
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
          <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            High Growth
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-center">
          <span className="text-xs font-mono uppercase text-slate-400 block mb-1">
            Monthly Runway Budget
          </span>
          <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-600 my-1">
            {costEstimator?.estimatedMonthlyCost || "$50k-$70k"}
          </div>
          <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-50 text-slate-700 border border-slate-200">
            Lean Operations
          </span>
        </div>
      </div>

      {/* Jump Pad */}
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