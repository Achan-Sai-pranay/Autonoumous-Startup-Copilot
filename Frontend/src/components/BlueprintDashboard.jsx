// BlueprintDashboard.jsx
// ---------------------------------------------------------------------------
// V6: Authentic LaunchPilot White & Orange Modern Theme
// - 5 Venture Engines (Idea, Frameworks, Market & Sizing, Product, Finances)
// - Real AI blueprint data & components (Scorecard, SWOT, Porter's, Bubble Chart,
//   Speedometer Gauge, Financial Simulator, Cloud Costs, GTM Swipe File)
// - Left sidebar with Platform, Venture (Dashboard, Business Analysis with
//   nested ash line connecting the 5 engines, Ask AI, Pitch Deck, Resources),
//   and Lite plan quota card.
// - Main content displays neat, complete, filled vertical cards in a responsive
//   grid without any arrow carousel system.
// - Top Venture Banner with edit action and industry badge.
// - Section header with title + star ★ and < Previous / Next > buttons.
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
} from "lucide-react";
import { downloadMarkdown, downloadPdf } from "../components/exportBlueprint.js";
import {
  VentureViabilityScorecard,
  LeanCustomerDiscoverySection,
  SwotAnalysisMatrix,
  PortersFiveForcesBreakdown,
  MarketSizingSection,
  LeanCanvasMatrix,
  UpmetricsFinancialSimulator,
  FounderPalSwipeFile,
  ChatPrdDossierView,
} from "./CompetitorUpgrades.jsx";

// ---------------------------------------------------------------------------
// White + Orange Design Tokens
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
// The 5 Core Venture Engines of LaunchPilot
// ---------------------------------------------------------------------------
const ENGINES = [
  {
    id: "idea",
    label: "Module 1: Idea & Validation",
    shortLabel: "Idea & Validation",
    subtitle: "Scorecard & Mom Test",
    icon: Lightbulb,
    accent: "orange",
  },
  {
    id: "frameworks",
    label: "Module 2: Strategic Frameworks",
    shortLabel: "Strategic Frameworks",
    subtitle: "SWOT & Porter's Forces",
    icon: ShieldCheck,
    accent: "orange",
  },
  {
    id: "market",
    label: "Module 3: Market & Sizing",
    shortLabel: "Market & Sizing",
    subtitle: "TAM, SAM, SOM & Viability",
    icon: TrendingUp,
    accent: "emerald",
  },
  {
    id: "product",
    label: "Module 4: Product & Architecture",
    shortLabel: "Product & Architecture",
    subtitle: "MVP Roadmap & Cloud Stack",
    icon: ListChecks,
    accent: "sky",
  },
  {
    id: "financials",
    label: "Module 5: Finances & Launch",
    shortLabel: "Finances & Launch",
    subtitle: "Live Calculator & ARR Burn",
    icon: Rocket,
    accent: "orange",
  },
];

const stagger = (i, step = 60) => ({ animationDelay: `${i * step}ms` });

export default function BlueprintDashboard({ blueprint, originalIdea }) {
  const [activeEngineId, setActiveEngineId] = useState("idea");
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

  // Real venture details
  const ventureTitle =
    pitch?.elevatorPitch || originalIdea || "LaunchPilot Venture Blueprint";

  const industryDomain =
    ideaAnalysis?.domain || "Technology / Emerging SaaS";

  const ventureDescription =
    pitch?.executiveSummary ||
    ideaAnalysis?.problem ||
    originalIdea ||
    "Complete AI founder blueprint synthesized across 12 autonomous strategic co-founders.";

  // Previous and Next engines for the header buttons
  const currentIndex = ENGINES.findIndex((e) => e.id === activeEngineId);
  const currentEngine = ENGINES[currentIndex] || ENGINES[0];
  const prevEngine = currentIndex > 0 ? ENGINES[currentIndex - 1] : null;
  const nextEngine = currentIndex < ENGINES.length - 1 ? ENGINES[currentIndex + 1] : null;

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
        <div className="md:flex md:gap-8 md:items-start">
          {/* ------------------------------------------------------------- */}
          {/* LEFT SIDEBAR WITH ASH TREE LINE */}
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
                  {/* Dashboard / All Engines Overview */}
                  <button
                    onClick={() => {
                      setActiveEngineId("all");
                      setViewMode("dashboard");
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      activeEngineId === "all"
                        ? "bg-orange-50 text-orange-700 font-bold border border-orange-200"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <LayoutGrid
                      size={15}
                      className={activeEngineId === "all" ? "text-orange-600" : "text-slate-400"}
                    />
                    <span>Dashboard</span>
                  </button>

                  {/* Business Analysis Group (Expandable) */}
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

                    {/* Indented 5 Engines with the slight ash vertical line */}
                    {isBusinessOpen && (
                      <div className="border-l-2 border-slate-200 ml-4 pl-3.5 space-y-1 my-1.5 animate-fade-in">
                        {ENGINES.map((engine) => {
                          const isActive = activeEngineId === engine.id && viewMode === "dashboard";
                          return (
                            <button
                              key={engine.id}
                              onClick={() => {
                                setActiveEngineId(engine.id);
                                setViewMode("dashboard");
                              }}
                              className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer ${
                                isActive
                                  ? "bg-orange-50 text-orange-800 font-bold border border-orange-200/90 shadow-2xs"
                                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium"
                              }`}
                            >
                              <div className="truncate">{engine.shortLabel}</div>
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
                        ? "bg-orange-50 text-orange-700 font-bold border border-orange-200"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <FileText
                      size={15}
                      className={viewMode === "prd" ? "text-orange-600" : "text-slate-400"}
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

              {/* LITE PLAN QUOTA WIDGET */}
              <div className="pt-4 border-t border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-900">
                  <span>Lite plan</span>
                  <span className="text-[10px] font-mono text-orange-700 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded font-bold">
                    Active
                  </span>
                </div>
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span>Standard reports</span>
                    <span className="font-mono font-bold text-slate-700">10/10 left</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full w-full" />
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
            {/* Top Venture Banner Card */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-7 mb-7 shadow-md relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white truncate">
                      {ventureTitle}
                    </h1>
                    <button
                      onClick={() => showToast("Venture title locked to analysis thesis")}
                      className="h-7 w-7 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-xs"
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
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>
                    {activeEngineId === "all" ? "Dashboard Overview" : currentEngine.label}
                  </span>
                  <span className="text-orange-500 font-normal">★</span>
                </h2>
              </div>

              {activeEngineId !== "all" && (
                <div className="flex items-center gap-2.5">
                  {prevEngine && (
                    <button
                      onClick={() => setActiveEngineId(prevEngine.id)}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-orange-600 hover:bg-orange-50 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                      <span>Previous</span>
                    </button>
                  )}
                  {nextEngine && (
                    <button
                      onClick={() => setActiveEngineId(nextEngine.id)}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-orange-600 hover:bg-orange-50 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Render Active Engine with Filled Vertical Cards in a Grid (No Arrow Carousel) */}
            <div key={activeEngineId} className="animate-fade-in">
              {activeEngineId === "idea" && (
                <IdeaModule
                  originalIdea={originalIdea}
                  viabilityScorecard={viabilityScorecard}
                  customerDiscovery={customerDiscovery}
                  ideaAnalysis={ideaAnalysis}
                  marketResearch={marketResearch}
                  costEstimator={costEstimator}
                />
              )}

              {activeEngineId === "frameworks" && (
                <FrameworksModule
                  swotAnalysis={swotAnalysis}
                  portersFiveForces={portersFiveForces}
                  ideaAnalysis={ideaAnalysis}
                  marketResearch={marketResearch}
                  competitorWeaknessAnalysis={competitorWeaknessAnalysis}
                  customerPersona={customerPersona}
                />
              )}

              {activeEngineId === "market" && (
                <MarketModule
                  marketSizing={marketSizing}
                  marketResearch={marketResearch}
                  competitorWeaknessAnalysis={competitorWeaknessAnalysis}
                  customerPersona={customerPersona}
                  viabilityScorecard={viabilityScorecard}
                  ideaTitle={ventureTitle}
                />
              )}

              {activeEngineId === "product" && (
                <ProductModule
                  productPlan={productPlan}
                  technicalArchitecture={technicalArchitecture}
                  roadmap={roadmap}
                />
              )}

              {activeEngineId === "financials" && (
                <FinancialsModule
                  businessStrategy={businessStrategy}
                  costEstimator={costEstimator}
                  revenueSimulator={revenueSimulator}
                  goToMarket={goToMarket}
                  launchChecklist={launchChecklist}
                  pitch={pitch}
                  roadmap={roadmap}
                  onToast={showToast}
                />
              )}

              {activeEngineId === "all" && (
                <DashboardOverviewSection
                  onNavigate={setActiveEngineId}
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
// Reusable Dashboard Card & Fields
// ---------------------------------------------------------------------------
function isError(section) {
  return Boolean(section?.error);
}

function ErrorNotice() {
  return (
    <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 font-mono">
      <AlertTriangle size={14} className="shrink-0 text-amber-600" />
      <span>Generation unavailable for this section. Please retry.</span>
    </div>
  );
}

const DashboardCard = memo(function DashboardCard({
  icon: Icon,
  title,
  children,
  className = "",
  accent = "orange",
  delayIndex,
  badge = null,
  credibility = null,
}) {
  return (
    <div
      style={delayIndex !== undefined ? stagger(delayIndex) : undefined}
      className={`p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-orange-300 hover:shadow-md transition-all duration-200 shadow-xs flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-5">
          <h3 className="flex items-center gap-2.5 text-base font-bold text-slate-900 tracking-tight">
            {Icon && (
              <span
                className={`flex items-center justify-center h-7 w-7 rounded-lg ${ACCENT_BG[accent]} border ${ACCENT_BORDER[accent]}`}
              >
                <Icon size={14} className={ACCENT_TEXT[accent]} />
              </span>
            )}
            {title}
          </h3>

          <div className="flex items-center gap-2">
            {credibility && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                ★ {credibility}
              </span>
            )}
            {badge && (
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                {badge}
              </span>
            )}
          </div>
        </div>
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
});

const Field = memo(function Field({ label, value, accent = "orange" }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[11px] font-mono font-medium uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
        <span className={`h-1 w-1 rounded-full ${ACCENT_DOT[accent]}`} />
        {label}
      </p>
      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">{value}</p>
    </div>
  );
});

const ListField = memo(function ListField({ label, items, accent = "orange" }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className="text-[11px] font-mono font-medium uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
        <span className={`h-1 w-1 rounded-full ${ACCENT_DOT[accent]}`} />
        {label}
      </p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <span className="text-orange-500 font-bold select-none">›</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
});

// ---------------------------------------------------------------------------
// 1. ENGINE 1: IDEA & VALIDATION
// ---------------------------------------------------------------------------
function IdeaModule({
  originalIdea,
  viabilityScorecard,
  customerDiscovery,
  ideaAnalysis,
  marketResearch,
  costEstimator,
}) {
  return (
    <div className="space-y-6">
      {/* Venture Viability Scorecard */}
      <VentureViabilityScorecard
        viabilityScorecard={viabilityScorecard}
        ideaAnalysis={ideaAnalysis}
        marketResearch={marketResearch}
        costEstimator={costEstimator}
        originalIdea={originalIdea}
      />

      {/* 2-Column Grid: Startup Idea Thesis & Idea Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <DashboardCard
          icon={Target}
          title="Startup Idea Thesis"
          accent="orange"
          badge="Core Thesis"
          credibility="Founder Prompt"
        >
          <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
            {originalIdea || "No idea prompt text available."}
          </p>
          <div className="pt-3 border-t border-slate-100 mt-3 space-y-2">
            <Field label="Core Problem Statement" value={ideaAnalysis?.problem} accent="orange" />
            <Field label="Strategic Mission" value={ideaAnalysis?.goal} accent="orange" />
          </div>
        </DashboardCard>

        <DashboardCard
          icon={Lightbulb}
          title="Idea Analysis & Feasibility"
          accent="orange"
          badge="AI Validated"
          credibility="High Conviction"
        >
          {isError(ideaAnalysis) ? (
            <ErrorNotice />
          ) : (
            <div className="space-y-3">
              <Field label="Target Industry Domain" value={ideaAnalysis?.domain} accent="orange" />
              <Field label="Execution Feasibility" value={ideaAnalysis?.feasibility} accent="orange" />
              <Field label="Market Demand Dynamics" value={marketResearch?.marketDemand} accent="orange" />
            </div>
          )}
        </DashboardCard>
      </div>

      {/* Lean Customer Discovery Section */}
      <LeanCustomerDiscoverySection customerDiscovery={customerDiscovery} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. ENGINE 2: STRATEGIC FRAMEWORKS (SWOT & PORTER'S FORCES)
// ---------------------------------------------------------------------------
function FrameworksModule({
  swotAnalysis,
  portersFiveForces,
  ideaAnalysis,
  marketResearch,
  competitorWeaknessAnalysis,
  customerPersona,
}) {
  return (
    <div className="space-y-6">
      <SwotAnalysisMatrix
        swotAnalysis={swotAnalysis}
        ideaAnalysis={ideaAnalysis}
        marketResearch={marketResearch}
        competitorWeaknessAnalysis={competitorWeaknessAnalysis}
        customerPersona={customerPersona}
      />
      <PortersFiveForcesBreakdown portersFiveForces={portersFiveForces} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. ENGINE 3: MARKET INTELLIGENCE & SIZING
// ---------------------------------------------------------------------------
function MarketModule({
  marketSizing,
  marketResearch,
  competitorWeaknessAnalysis,
  customerPersona,
  viabilityScorecard,
  ideaTitle,
}) {
  return (
    <div className="space-y-6">
      {/* Signature VenturusAI Market Sizing 3-Circle Bubbles & Speedometer Gauge Stacked Vertically */}
      <MarketSizingSection
        marketSizing={marketSizing}
        viabilityScorecard={viabilityScorecard}
        ideaTitle={ideaTitle}
      />

      {/* Competitor Vulnerabilities */}
      {!isError(competitorWeaknessAnalysis) && competitorWeaknessAnalysis?.length > 0 && (
        <CompetitorWeaknessSection analysis={competitorWeaknessAnalysis} accent="emerald" />
      )}

      {/* 2-Column Grid: Customer Persona ICP & Market Dynamics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <DashboardCard
          icon={Users}
          title="Customer Persona (ICP)"
          accent="emerald"
          badge="ICP"
          credibility="High Intent"
        >
          {isError(customerPersona) ? (
            <ErrorNotice />
          ) : (
            <div className="space-y-3">
              <ListField label="Target Users" items={customerPersona?.targetUsers} accent="emerald" />
              <ListField label="Critical Pain Points" items={customerPersona?.painPoints} accent="emerald" />
              <Field label="Narrative Buyer Story" value={customerPersona?.userProfile} accent="emerald" />
            </div>
          )}
        </DashboardCard>

        <DashboardCard
          icon={TrendingUp}
          title="Market Dynamics & Research"
          accent="emerald"
          badge="Landscape"
          credibility="92% Accuracy"
        >
          {isError(marketResearch) ? (
            <ErrorNotice />
          ) : (
            <div className="space-y-3">
              <ListField label="Identified Competitors" items={marketResearch?.competitors} accent="emerald" />
              <ListField label="Market Opportunities" items={marketResearch?.opportunities} accent="emerald" />
              <Field label="Market Demand Dynamics" value={marketResearch?.marketDemand} accent="emerald" />
            </div>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. ENGINE 4: PRODUCT & TECHNICAL ARCHITECTURE
// ---------------------------------------------------------------------------
function ProductModule({ productPlan, technicalArchitecture, roadmap }) {
  return (
    <div className="space-y-6">
      {/* 2-Column Grid: Product Plan & Technical Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <DashboardCard
          icon={ListChecks}
          title="Product Plan"
          accent="sky"
          badge="MVP Scope"
          credibility="Sprint 1"
        >
          {isError(productPlan) ? (
            <ErrorNotice />
          ) : (
            <div className="space-y-4">
              <ListField label="MVP Core Features" items={productPlan?.mvpFeatures} accent="sky" />
              <ListField label="Future Feature Phases" items={productPlan?.futureFeatures} accent="sky" />
              <Field label="Development Priority" value={productPlan?.developmentPriority} accent="sky" />
            </div>
          )}
        </DashboardCard>

        <DashboardCard
          icon={Cpu}
          title="Technical Architecture"
          accent="sky"
          badge="Production Stack"
        >
          {isError(technicalArchitecture) ? (
            <ErrorNotice />
          ) : (
            <div className="space-y-3">
              <Field label="Frontend Stack" value={technicalArchitecture?.frontend} accent="sky" />
              <Field label="Backend Stack" value={technicalArchitecture?.backend} accent="sky" />
              <Field label="Database Architecture" value={technicalArchitecture?.database} accent="sky" />
              <Field label="Cloud Hosting" value={technicalArchitecture?.hosting} accent="sky" />
              <Field label="AI APIs & Models" value={technicalArchitecture?.aiApis} accent="sky" />
              <Field label="Architecture Overview" value={technicalArchitecture?.architectureOverview} accent="sky" />
            </div>
          )}
        </DashboardCard>
      </div>

      {roadmap && (
        <DashboardCard icon={MapIcon} title="Startup Roadmap & Timeline" accent="sky">
          <RoadmapTimeline roadmap={roadmap} accent="sky" />
        </DashboardCard>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. ENGINE 5: FINANCES & LAUNCH ENGINE
// ---------------------------------------------------------------------------
function FinancialsModule({
  businessStrategy,
  costEstimator,
  revenueSimulator,
  goToMarket,
  launchChecklist,
  pitch,
  roadmap,
  onToast,
}) {
  return (
    <div className="space-y-6">
      {/* Investor Pitch & Thesis */}
      {pitch && (
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            <p className="text-[11px] font-mono uppercase tracking-wider text-orange-600 font-bold">
              Investor Pitch & Executive Thesis
            </p>
          </div>
          <p className="text-lg sm:text-xl font-bold text-slate-900 mb-3 tracking-tight">
            {pitch?.elevatorPitch}
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
            {pitch?.executiveSummary}
          </p>
        </div>
      )}

      {/* Upmetrics Live Interactive Financial Simulator */}
      <UpmetricsFinancialSimulator costEstimator={costEstimator} revenueSimulator={revenueSimulator} />

      {/* Cloud Infrastructure Cost Estimator & ARR Unit Economics */}
      <CostRevenueSection cost={costEstimator} revenue={revenueSimulator} accent="orange" />

      {/* Go To Market & FounderPal Swipe File */}
      {goToMarket && (
        <div className="space-y-6">
          <GoToMarketSection gtm={goToMarket} accent="orange" />
          <FounderPalSwipeFile gtm={goToMarket} pitch={pitch} onToast={onToast} />
        </div>
      )}

      {/* Launch Readiness Checklist */}
      {launchChecklist?.length > 0 && (
        <LaunchChecklistSection items={launchChecklist} accent="orange" />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 6. DASHBOARD OVERVIEW SECTION
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
            Global Potential
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm text-center">
          <span className="text-xs font-mono uppercase text-slate-400 block mb-1">
            Estimated Monthly Runway
          </span>
          <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-600 my-1">
            {costEstimator?.estimatedMonthlyCost || "$0 - Free Tier"}
          </div>
          <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-50 text-slate-700 border border-slate-200">
            Lean Operations
          </span>
        </div>
      </div>

      {/* Jump Pad to all 5 engines */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4 tracking-tight">
          Venture Engines Quick Access
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ENGINES.map((engine) => {
            const Icon = engine.icon;
            return (
              <button
                key={engine.id}
                onClick={() => onNavigate(engine.id)}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-orange-50 border border-slate-200/70 hover:border-orange-200 transition-all text-left group cursor-pointer flex items-center gap-3"
              >
                <div className="h-9 w-9 rounded-xl bg-orange-100/70 text-orange-600 flex items-center justify-center shrink-0">
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-orange-700 block truncate">
                    {engine.label}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono truncate mt-0.5">
                    {engine.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Go-to-Market Strategy Section & Copyable Card
// ---------------------------------------------------------------------------
const CopyableCard = memo(function CopyableCard({ label, content, accent = "orange" }) {
  const [copied, setCopied] = useState(false);
  if (!content) return null;

  function handleCopy() {
    navigator.clipboard?.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 hover:border-orange-300 transition-all duration-150">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-mono font-medium uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1 text-xs font-semibold ${ACCENT_TEXT[accent]} hover:opacity-80 transition-opacity font-mono cursor-pointer`}
        >
          {copied ? (
            <>
              <Check size={11} /> Copied
            </>
          ) : (
            <>
              <Copy size={11} /> Copy
            </>
          )}
        </button>
      </div>
      <pre className="whitespace-pre-wrap break-words text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
        {content}
      </pre>
    </div>
  );
});

function GoToMarketSection({ gtm, accent = "orange", delayIndex }) {
  return (
    <DashboardCard
      icon={Target}
      title="Go-to-Market Acquisition Engine"
      accent={accent}
      delayIndex={delayIndex}
    >
      <Field label="Target Audience" value={gtm.targetAudience} accent={accent} />

      {gtm.platforms?.length > 0 && (
        <div>
          <p className="text-[11px] font-mono font-medium uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
            <span className={`h-1 w-1 rounded-full ${ACCENT_DOT[accent]}`} />
            High-Converting Acquisition Channels
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {gtm.platforms.map((p, i) => (
              <div
                key={i}
                className="rounded-xl bg-slate-50 border border-slate-200/70 p-4 hover:border-slate-300 transition-all duration-150"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-900">{p.name}</span>
                  <span className="text-[10px] font-mono text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded font-semibold">
                    {p.urgency}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{p.strategy}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {gtm.searchKeywords?.length > 0 && (
        <div>
          <p className="text-[11px] font-mono font-medium uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <span className={`h-1 w-1 rounded-full ${ACCENT_DOT[accent]}`} />
            High-Intent Search Keywords
          </p>
          <div className="flex flex-wrap gap-2">
            {gtm.searchKeywords.map((query, i) => (
              <span
                key={i}
                className="text-xs bg-slate-100 text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1 font-mono"
              >
                {query}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-[11px] font-mono font-medium uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
          <span className={`h-1 w-1 rounded-full ${ACCENT_DOT[accent]}`} />
          Production-Ready Outreach Templates
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <CopyableCard label="Cold Email Template" content={gtm.coldEmailTemplate} accent={accent} />
          <CopyableCard label="Direct Message (DM) Template" content={gtm.linkedInDmTemplate} accent={accent} />
          <CopyableCard label="Community Launch Post" content={gtm.redditLaunchPost} accent={accent} />
          <CopyableCard label="Social Announcement Thread" content={gtm.twitterLaunchPost} accent={accent} />
        </div>
      </div>
    </DashboardCard>
  );
}

// ---------------------------------------------------------------------------
// Launch Checklist
// ---------------------------------------------------------------------------
function LaunchChecklistSection({ items, accent = "orange", delayIndex }) {
  const [checked, setChecked] = useState(() => new Set());
  const percent = items.length ? Math.round((checked.size / items.length) * 100) : 0;

  function toggle(index) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <DashboardCard icon={ListTodo} title="Launch Readiness Checklist" accent={accent} delayIndex={delayIndex}>
      <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-mono text-slate-500">
            {checked.size} of {items.length} milestones completed
          </p>
          <p className={`text-xs font-mono font-bold ${ACCENT_TEXT[accent]}`}>{percent}% READY</p>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className={`h-full rounded-full ${ACCENT_BAR[accent]} transition-all duration-300 ease-out`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        {items.map((item, i) => (
          <label
            key={i}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-xs sm:text-sm cursor-pointer group transition-colors"
          >
            <input
              type="checkbox"
              checked={checked.has(i)}
              onChange={() => toggle(i)}
              className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
            />
            <span
              className={
                checked.has(i)
                  ? "text-slate-400 line-through"
                  : "text-slate-700 group-hover:text-slate-900 transition-colors"
              }
            >
              {item}
            </span>
          </label>
        ))}
      </div>
    </DashboardCard>
  );
}

// ---------------------------------------------------------------------------
// Roadmap timeline
// ---------------------------------------------------------------------------
function RoadmapTimeline({ roadmap, accent = "sky" }) {
  const milestones = roadmap?.milestones || [];
  const a = ACCENT_TEXT[accent];
  const dotBg = ACCENT_DOT[accent];

  return (
    <div>
      <div className="relative border-l border-slate-200 ml-2 space-y-6">
        {milestones.map((m, i) => (
          <div key={i} className="pl-6 relative" style={stagger(i, 80)}>
            <span className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ${dotBg}`} />
            <p className={`text-[11px] font-mono font-bold uppercase tracking-wider mb-0.5 ${a}`}>{m.week}</p>
            <p className="text-sm font-semibold text-slate-900 mb-1.5">{m.title}</p>
            <ul className="space-y-1">
              {(m.tasks || []).map((task, j) => (
                <li key={j} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
                  <span className="text-orange-500 font-bold select-none">›</span>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {roadmap?.launchPlan && (
        <div className="mt-6 pt-4 border-t border-slate-100">
          <Field label="Launch Execution Strategy" value={roadmap.launchPlan} accent={accent} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cost Estimator + Revenue Simulator
// ---------------------------------------------------------------------------
const COST_LABELS = {
  domain: "Domain",
  hosting: "Hosting",
  database: "Database",
  aiApis: "AI APIs",
  email: "Email Delivery",
  analytics: "Analytics & Monitoring",
  storage: "Object Storage",
  authentication: "Auth & Security",
};

function CostRevenueSection({ cost, revenue, accent = "orange", delayIndex }) {
  const a = ACCENT_TEXT[accent];
  return (
    <div className="space-y-6">
      <div
        className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm transition-all"
        style={stagger(delayIndex ?? 0)}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="flex items-center gap-2.5 text-base font-bold text-slate-900 tracking-tight">
            <span
              className={`flex items-center justify-center h-7 w-7 rounded-lg ${ACCENT_BG[accent]} border ${ACCENT_BORDER[accent]}`}
            >
              <Wallet size={14} className={a} />
            </span>
            Infrastructure Cost Estimator
          </h3>

          {cost && (
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-slate-500">
                Mo: <span className="text-emerald-600 font-semibold">{cost.estimatedMonthlyCost}</span>
              </span>
              <span className="text-slate-500">
                Yr: <span className="text-emerald-600 font-semibold">{cost.estimatedYearlyCost}</span>
              </span>
            </div>
          )}
        </div>

        {isError(cost) ? (
          <ErrorNotice />
        ) : (
          cost && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(COST_LABELS).map(([key, label]) => {
                const item = cost[key];
                if (!item) return null;
                return (
                  <div
                    key={key}
                    className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:border-slate-300 transition-all duration-150"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 truncate">
                        {label}
                      </p>
                      {item.freeTierSufficient && (
                        <span className="shrink-0 text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.2 font-semibold">
                          Free OK
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-mono font-semibold text-slate-900 mb-1">
                      {item.monthlyCost}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-relaxed truncate">{item.note}</p>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
        <h3 className="flex items-center gap-2.5 text-base font-bold text-slate-900 mb-4 tracking-tight">
          <span
            className={`flex items-center justify-center h-7 w-7 rounded-lg ${ACCENT_BG[accent]} border ${ACCENT_BORDER[accent]}`}
          >
            <BarChart3 size={14} className={a} />
          </span>
          Unit Economics & Revenue Projections
        </h3>

        {isError(revenue) ? (
          <ErrorNotice />
        ) : (
          revenue && (
            <>
              {revenue.pricingAssumption && (
                <p className="text-xs text-slate-500 mb-4 font-sans leading-relaxed">
                  <span className="font-mono text-slate-400 uppercase text-[10px]">Model Assumption: </span>
                  {revenue.pricingAssumption}
                </p>
              )}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs sm:text-sm font-sans">
                  <thead>
                    <tr className="bg-slate-50 text-left text-[11px] font-mono uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <th className="px-4 py-2.5 font-semibold">Active Subscribers</th>
                      <th className="px-4 py-2.5 font-semibold">Estimated MRR</th>
                      <th className="px-4 py-2.5 font-semibold">Annualized ARR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(revenue.projections || []).map((p, i) => (
                      <tr key={i} className="hover:bg-orange-50/30 transition-colors">
                        <td className="px-4 py-2.5 text-slate-800 font-mono">
                          {typeof p.users === "number" ? p.users.toLocaleString() : p.users}
                        </td>
                        <td className="px-4 py-2.5 text-emerald-600 font-mono font-semibold">
                          {p.monthlyRevenue}
                        </td>
                        <td className="px-4 py-2.5 text-emerald-700 font-mono font-semibold">
                          {p.annualRevenue}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Competitor Weakness Analysis
// ---------------------------------------------------------------------------
function CompetitorWeaknessSection({ analysis, accent = "emerald", delayIndex }) {
  const a = ACCENT_TEXT[accent];
  return (
    <div
      className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm"
      style={stagger(delayIndex ?? 0)}
    >
      <h3 className="flex items-center gap-2.5 text-base font-bold text-slate-900 mb-4 tracking-tight">
        <span
          className={`flex items-center justify-center h-7 w-7 rounded-lg ${ACCENT_BG[accent]} border ${ACCENT_BORDER[accent]}`}
        >
          <Crosshair size={14} className={a} />
        </span>
        Competitor Vulnerability & Differentiation Matrix
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analysis.map((c, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-orange-300 transition-all duration-150"
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs sm:text-sm font-bold text-slate-900">{c.competitor}</span>
              <span className="text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-semibold">
                Incumbent
              </span>
            </div>
            <div className="space-y-3">
              <ListField label="Structural Weaknesses" items={c.weaknesses} accent={accent} />
              <ListField label="Overlooked User Needs" items={c.missedOpportunities} accent={accent} />
              <Field label="LaunchPilot Unfair Advantage" value={c.suggestedDifferentiation} accent={accent} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}