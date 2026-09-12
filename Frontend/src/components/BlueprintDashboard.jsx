// BlueprintDashboard.jsx
// ---------------------------------------------------------------------------
// V3: module-based layout (sidebar/tabs) grouping the 12 backend sections
// into 5 modules.
//
// V4: adds PDF/Markdown export (via utils/exportBlueprint.js), a success
// toast, smooth module-switch transitions, staggered card entrance,
// progress bar on Launch Checklist, and white + orange modern theme.
// ---------------------------------------------------------------------------
import { useState, useEffect, useRef, memo, useCallback } from "react";
import {
  Lightbulb,
  TrendingUp,
  Users,
  ListChecks,
  Cpu,
  Landmark,
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
  Layers,
  Flame,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { downloadMarkdown, downloadPdf } from "../components/exportBlueprint.js";
import {
  VentureViabilityScorecard,
  LeanCustomerDiscoverySection,
  SwotAnalysisMatrix,
  PortersFiveForcesBreakdown,
  MarketSizingSection,
  PestelAnalysisMatrix,
  LeanCanvasMatrix,
  UpmetricsFinancialSimulator,
  FounderPalSwipeFile,
  ChatPrdDossierView,
} from "./CompetitorUpgrades.jsx";

// ---------------------------------------------------------------------------
// Accent system — tuned for White + Orange and crisp multi-module contrast
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
const ACCENT_CHECKBOX = {
  sky: "text-sky-600",
  emerald: "text-emerald-600",
  amber: "text-amber-600",
  orange: "text-orange-600",
  rose: "text-rose-600",
  indigo: "text-indigo-600",
};
const ACCENT_RING = {
  sky: "focus:ring-sky-500/20",
  emerald: "focus:ring-emerald-500/20",
  amber: "focus:ring-amber-500/20",
  orange: "focus:ring-orange-500/20",
  rose: "focus:ring-rose-500/20",
  indigo: "focus:ring-indigo-500/20",
};
const ACCENT_BAR = {
  sky: "bg-sky-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  orange: "bg-orange-500",
  rose: "bg-rose-500",
  indigo: "bg-indigo-500",
};

const MODULES = [
  { id: "idea", label: "Module 1: Idea & Validation", subtitle: "Scorecard & Mom Test", icon: Lightbulb, accent: "orange" },
  { id: "frameworks", label: "Module 2: Strategic Frameworks", subtitle: "SWOT & Porter's Forces", icon: ShieldCheck, accent: "orange" },
  { id: "market", label: "Module 3: Market & Sizing", subtitle: "TAM, SAM, SOM & Viability", icon: TrendingUp, accent: "orange" },
  { id: "product", label: "Module 4: Product & Architecture", subtitle: "MVP Roadmap & Cloud Stack", icon: ListChecks, accent: "orange" },
  { id: "financials", label: "Module 5: Finances & Launch", subtitle: "Live Calculator & ARR Burn", icon: Rocket, accent: "orange" },
];

// Small helper for staggered card entrance — index-based delay in ms.
const stagger = (i, step = 60) => ({ animationDelay: `${i * step}ms` });

export default function BlueprintDashboard({ blueprint, originalIdea }) {
  const [activeModule, setActiveModule] = useState("idea");
  const [viewMode, setViewMode] = useState("dashboard"); // "dashboard" | "prd"
  const [exporting, setExporting] = useState(null); // null | "pdf" | "md"
  const [toast, setToast] = useState(null); // null | string

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleSelectModule = useCallback((moduleId) => {
    setActiveModule(moduleId);
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

  return (
    <div className="w-full max-w-7xl mx-auto mt-12 px-4 pb-24 animate-fade-in text-slate-900">
      {/* Executive Founder Brief Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 mb-8 border border-slate-200/90 shadow-sm">
        {/* Top Header: Badge on Left, Action Toolbar on Right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider bg-orange-50 text-orange-600 border border-orange-200 font-bold">
              Startup Brief #{(originalIdea.length % 900) + 100}
            </span>
            <span className="text-slate-300 text-xs font-mono">•</span>
            <span className="text-xs font-mono text-slate-500 font-medium">
              Synthesized via 12 Autonomous Co-Founders
            </span>
          </div>

          {/* Action toolbar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* ChatPRD View Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                onClick={() => setViewMode("dashboard")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "dashboard"
                    ? "bg-white text-orange-600 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Modular Grid Cards"
              >
                <LayoutGrid size={13} />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setViewMode("prd")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "prd"
                    ? "bg-white text-orange-600 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Continuous Notion-grade PRD Dossier"
              >
                <FileText size={13} />
                <span>ChatPRD Dossier</span>
              </button>
            </div>

            <button
              onClick={handleCopySummary}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 hover:text-orange-600 hover:border-orange-300 transition-all shadow-xs active:scale-95 cursor-pointer"
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

        {/* Main Headline & Summary (Full Horizontal Width) */}
        <div className="pt-6 pb-2 space-y-3">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug w-full">
            {pitch?.elevatorPitch || originalIdea}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-5xl leading-relaxed">
            {pitch?.executiveSummary ||
              ideaAnalysis?.problem ||
              "Complete founder blueprint synthesized and ready for execution."}
          </p>
        </div>

        {/* 4 Core Venture Metric Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Target Market</span>
            <p className="text-sm font-semibold text-slate-900 truncate">
              {marketResearch?.targetAudience || customerPersona?.targetUsers?.[0] || "Identified"}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Industry Domain</span>
            <p className="text-sm font-semibold text-orange-600 truncate">
              {ideaAnalysis?.domain || "Technology / SaaS"}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Estimated Runway / Mo</span>
            <p className="text-sm font-semibold text-emerald-600 truncate">
              {costEstimator?.estimatedMonthlyCost || "$0 - Free Tier"}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Feasibility & Moat</span>
            <p className="text-sm font-semibold text-indigo-600 truncate">
              {ideaAnalysis?.feasibility || "High Potential"}
            </p>
          </div>
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
        <>
          {/* Mobile & Tablet: Vertical Section Selector (Zero horizontal scroll) */}
          <VerticalMobileNav
            modules={MODULES}
            activeModule={activeModule}
            onSelectModule={handleSelectModule}
          />

          <div className="md:flex md:gap-8 md:items-start">
            {/* Desktop: frozen / sticky vertical modules sidebar matching VenturusAI */}
            <aside className="hidden md:block w-64 shrink-0 sticky top-4 self-start max-h-[calc(100vh-5rem)] overflow-y-auto z-20 scrollbar-thin">
              <div className="bg-white border border-slate-200/80 p-3 rounded-2xl space-y-3 shadow-sm">
                <div>
                  <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Venture Sections
                  </div>
                  <div className="space-y-1 mt-1.5">
                    {MODULES.map((m) => (
                      <SidebarItem
                        key={m.id}
                        module={m}
                        active={activeModule === m.id}
                        onClick={() => handleSelectModule(m.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* Ask Co-Founder AI Quick Action in Sidebar */}
                <div className="pt-2.5 border-t border-slate-100">
                  <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    AI Co-Founder
                  </div>
                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent("open-cofounder-chat"));
                    }}
                    className="w-full mt-1 flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 hover:border-orange-300 transition-all shadow-2xs cursor-pointer group"
                    title="Open live streaming Co-Founder advisor"
                  >
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                      </span>
                      <span>Ask Co-Founder AI</span>
                    </div>
                    <span className="text-xs font-mono text-orange-500 group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </button>
                </div>
              </div>
            </aside>

            {/* Active module content rendered with Peeking SectionCarousel */}
            <main className="flex-1 min-w-0">
              <div key={activeModule} className="animate-fade-in">
                {activeModule === "idea" && (
                  <IdeaModule
                    originalIdea={originalIdea}
                    viabilityScorecard={viabilityScorecard}
                    customerDiscovery={customerDiscovery}
                    ideaAnalysis={ideaAnalysis}
                    marketResearch={marketResearch}
                    costEstimator={costEstimator}
                  />
                )}
                {activeModule === "frameworks" && (
                  <FrameworksModule
                    swotAnalysis={swotAnalysis}
                    portersFiveForces={portersFiveForces}
                    ideaAnalysis={ideaAnalysis}
                    marketResearch={marketResearch}
                    competitorWeaknessAnalysis={competitorWeaknessAnalysis}
                    customerPersona={customerPersona}
                  />
                )}
                {activeModule === "market" && (
                  <MarketModule
                    marketSizing={marketSizing}
                    marketResearch={marketResearch}
                    competitorWeaknessAnalysis={competitorWeaknessAnalysis}
                    customerPersona={customerPersona}
                    viabilityScorecard={viabilityScorecard}
                    ideaTitle={pitch?.elevatorPitch || originalIdea}
                  />
                )}
                {activeModule === "product" && (
                  <ProductModule
                    productPlan={productPlan}
                    technicalArchitecture={technicalArchitecture}
                  />
                )}
                {(activeModule === "financials" || activeModule === "business" || activeModule === "launch") && (
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
              </div>
            </main>
          </div>
        </>
      )}

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
      className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:text-orange-600 hover:border-orange-300 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-xs"
    >
      {busy ? <Loader2 size={13} className="animate-spin text-orange-500" /> : <Icon size={13} />}
      {busy ? "Synthesizing…" : label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Navigation pieces
// ---------------------------------------------------------------------------
const SidebarItem = memo(function SidebarItem({ module, active, onClick }) {
  const { icon: Icon, label, subtitle } = module;
  return (
    <button
      onClick={onClick}
      className={`group w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer ${
        active
          ? "bg-orange-50 text-orange-700 border border-orange-200/90 shadow-xs font-bold"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
      }`}
    >
      <span
        className={`flex items-center justify-center h-7 w-7 rounded-lg shrink-0 mt-0.5 transition-colors ${
          active ? "bg-orange-500 text-white shadow-2xs" : "bg-slate-100 text-slate-400 group-hover:text-slate-600"
        }`}
      >
        <Icon size={15} />
      </span>
      <div className="min-w-0">
        <p className={`text-xs leading-snug truncate ${active ? "font-bold text-orange-950" : "font-medium"}`}>
          {label}
        </p>
        {subtitle && (
          <p className="text-[10px] text-slate-400 font-mono leading-none mt-1 truncate">
            {subtitle}
          </p>
        )}
      </div>
    </button>
  );
});

const VerticalMobileNav = memo(function VerticalMobileNav({ modules, activeModule, onSelectModule }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const activeObj = modules.find((m) => m.id === activeModule) || modules[0];
  const ActiveIcon = activeObj.icon;

  return (
    <div className="md:hidden mb-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
      {/* Active Section Bar with Dropdown Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3.5 bg-white text-left cursor-pointer transition-colors hover:bg-slate-50/80"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shadow-2xs">
            <ActiveIcon size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold text-orange-600">Active Section</span>
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
            </div>
            <p className="text-xs font-bold text-slate-900 leading-tight mt-0.5">{activeObj.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-orange-100 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 transition-colors">
          <span>{isExpanded ? "Close" : "Switch Section"}</span>
          <span className={`transform transition-transform text-[10px] ${isExpanded ? "rotate-180" : ""}`}>▼</span>
        </div>
      </button>

      {/* Vertical Sections Stack (Always vertically aligned, NO horizontal scroll) */}
      {isExpanded && (
        <div className="border-t border-slate-100 p-2.5 bg-slate-50/50 space-y-1.5 animate-fade-in">
          <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            All Vertical Sections (Tap to switch)
          </div>
          {modules.map((m) => {
            const { icon: Icon, label, subtitle, id } = m;
            const isActive = activeModule === id;
            return (
              <button
                key={id}
                onClick={() => {
                  onSelectModule(id);
                  setIsExpanded(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                  isActive
                    ? "bg-white border-2 border-orange-500 text-orange-700 shadow-xs font-bold"
                    : "bg-white border border-slate-200/70 text-slate-700 hover:border-orange-200 hover:text-orange-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`flex items-center justify-center h-8 w-8 rounded-lg ${isActive ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                    <Icon size={15} />
                  </span>
                  <div>
                    <p className="text-xs font-bold">{label}</p>
                    {subtitle && <p className="text-[10px] text-slate-400 font-mono mt-0.5">{subtitle}</p>}
                  </div>
                </div>
                {isActive && (
                  <span className="text-xs font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});

function ModuleHeader({ icon: Icon, title, description, accent }) {
  return (
    <div className="mb-6 flex items-start gap-3.5">
      <span
        className={`flex items-center justify-center h-10 w-10 rounded-xl shrink-0 border ${ACCENT_BG[accent]} ${ACCENT_BORDER[accent]}`}
      >
        <Icon size={18} className={ACCENT_TEXT[accent]} />
      </span>
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Peeking Section Carousel with Smooth Horizontal Scroll & Left/Right Arrows
// ---------------------------------------------------------------------------
const SectionCarousel = memo(function SectionCarousel({
  sections,
  moduleTitle,
  moduleIcon: ModuleIcon,
  moduleDescription,
  accent = "orange",
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const isNavigatingRef = useRef(false);

  const scrollToSlide = useCallback((idx) => {
    const container = containerRef.current;
    if (!container) return;
    const slides = container.children;
    if (slides[idx]) {
      const slide = slides[idx];
      const targetLeft = slide.offsetLeft - (container.clientWidth - slide.clientWidth) / 2;
      isNavigatingRef.current = true;
      container.scrollTo({ left: targetLeft, behavior: "smooth" });
      setActiveIndex(idx);
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 450);
    }
  }, []);

  const handlePrev = useCallback(() => {
    if (activeIndex > 0) {
      scrollToSlide(activeIndex - 1);
    }
  }, [activeIndex, scrollToSlide]);

  const handleNext = useCallback(() => {
    if (activeIndex < sections.length - 1) {
      scrollToSlide(activeIndex + 1);
    }
  }, [activeIndex, sections.length, scrollToSlide]);

  const handleScroll = useCallback(() => {
    if (isNavigatingRef.current) return;
    const container = containerRef.current;
    if (!container) return;

    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    const slides = container.children;
    let closestIndex = 0;
    let closestDistance = Infinity;

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
      const distance = Math.abs(containerCenter - slideCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    }

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
    }
  }, [activeIndex]);

  // Center initial slide on mount and when sections change
  useEffect(() => {
    setActiveIndex(0);
    const timer = setTimeout(() => {
      scrollToSlide(0);
    }, 60);
    return () => clearTimeout(timer);
  }, [sections, scrollToSlide]);

  return (
    <div className="space-y-4">
      {/* Module Header */}
      <ModuleHeader
        icon={ModuleIcon}
        title={moduleTitle}
        description={moduleDescription}
        accent={accent}
      />

      {/* Top Section Switcher Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 sm:p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        {/* Clickable section pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 max-w-full">
          {sections.map((sec, idx) => (
            <button
              key={sec.id || idx}
              onClick={() => scrollToSlide(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                idx === activeIndex
                  ? "bg-orange-600 text-white font-bold shadow-xs scale-[1.02]"
                  : "bg-slate-50 text-slate-600 hover:bg-orange-50 hover:text-orange-700 border border-slate-200/70"
              }`}
            >
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  idx === activeIndex
                    ? "bg-orange-700/60 text-white"
                    : "bg-slate-200/70 text-slate-600"
                }`}
              >
                {idx + 1}
              </span>
              <span>{sec.title}</span>
            </button>
          ))}
        </div>

        {/* Section Counter & Mini Nav Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 ml-auto">
          <span className="text-xs font-mono text-slate-500 font-medium">
            Section <strong className="text-slate-900">{activeIndex + 1}</strong> of{" "}
            <strong>{sections.length}</strong>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              disabled={activeIndex === 0}
              className="h-8 w-8 rounded-xl flex items-center justify-center bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-600 border border-slate-200 hover:border-orange-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Previous Section (Left Arrow)"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNext}
              disabled={activeIndex === sections.length - 1}
              className="h-8 w-8 rounded-xl flex items-center justify-center bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-600 border border-slate-200 hover:border-orange-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Next Section (Right Arrow)"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Peeking Horizontal Carousel Track */}
      <div className="relative w-full overflow-hidden py-2">
        {/* Floating Left Arrow Overlay */}
        <button
          onClick={handlePrev}
          disabled={activeIndex === 0}
          aria-label="Previous Section"
          className={`absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 z-30 h-11 w-11 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl flex items-center justify-center text-slate-700 hover:text-orange-600 hover:border-orange-300 hover:scale-110 active:scale-95 transition-all cursor-pointer ${
            activeIndex === 0 ? "opacity-0 pointer-events-none" : "opacity-90 hover:opacity-100"
          }`}
        >
          <ChevronLeft size={22} className="-ml-0.5" />
        </button>

        {/* Floating Right Arrow Overlay */}
        <button
          onClick={handleNext}
          disabled={activeIndex === sections.length - 1}
          aria-label="Next Section"
          className={`absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 z-30 h-11 w-11 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl flex items-center justify-center text-slate-700 hover:text-orange-600 hover:border-orange-300 hover:scale-110 active:scale-95 transition-all cursor-pointer ${
            activeIndex === sections.length - 1
              ? "opacity-0 pointer-events-none"
              : "opacity-90 hover:opacity-100"
          }`}
        >
          <ChevronRight size={22} className="-mr-0.5" />
        </button>

        {/* Horizontal Track with Snapping and Padding to center slides */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none py-3 px-[6%] sm:px-[9%] lg:px-[11%] gap-4 sm:gap-6 items-start scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {sections.map((sec, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={sec.id || idx}
                onClick={() => {
                  if (!isActive) scrollToSlide(idx);
                }}
                className={`shrink-0 snap-center w-[88%] sm:w-[84%] lg:w-[80%] max-w-4xl transition-all duration-400 ease-out ${
                  isActive
                    ? "opacity-100 scale-100 shadow-xs pointer-events-auto"
                    : "opacity-35 hover:opacity-65 scale-[0.96] blur-[0.2px] cursor-pointer pointer-events-auto select-none"
                }`}
              >
                {sec.content}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Dots Indicator */}
      {sections.length > 1 && (
        <div className="flex items-center justify-center gap-2 pt-1 pb-2">
          {sections.map((sec, idx) => (
            <button
              key={idx}
              onClick={() => scrollToSlide(idx)}
              className={`h-2 transition-all rounded-full cursor-pointer ${
                idx === activeIndex
                  ? "w-7 bg-orange-600 shadow-2xs"
                  : "w-2 bg-slate-300 hover:bg-slate-400"
              }`}
              title={sec.title}
            />
          ))}
        </div>
      )}
    </div>
  );
});

// ---------------------------------------------------------------------------
// Shared helpers
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

// Reusable card shell with optional badge & credibility score
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
      className={`p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-orange-300 hover:shadow-md transition-all duration-200 shadow-xs ${className}`}
    >
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
// Module 1: Idea & Validation
// ---------------------------------------------------------------------------
function IdeaModule({
  originalIdea,
  viabilityScorecard,
  customerDiscovery,
  ideaAnalysis,
  marketResearch,
  costEstimator,
}) {
  const sections = [
    {
      id: "viability-scorecard",
      title: "Venture Viability Scorecard",
      content: (
        <VentureViabilityScorecard
          viabilityScorecard={viabilityScorecard}
          ideaAnalysis={ideaAnalysis}
          marketResearch={marketResearch}
          costEstimator={costEstimator}
          originalIdea={originalIdea}
        />
      ),
    },
    {
      id: "lean-customer-discovery",
      title: "Lean Customer Discovery",
      content: <LeanCustomerDiscoverySection customerDiscovery={customerDiscovery} />,
    },
    {
      id: "startup-idea-thesis",
      title: "Startup Idea Thesis",
      content: (
        <DashboardCard
          icon={Target}
          title="Startup Idea Thesis"
          accent="orange"
          delayIndex={0}
          badge="Core Thesis"
          credibility="Founder Prompt"
        >
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
            {originalIdea || "No idea text available."}
          </p>
        </DashboardCard>
      ),
    },
    {
      id: "idea-analysis",
      title: "Idea Analysis",
      content: (
        <DashboardCard
          icon={Lightbulb}
          title="Idea Analysis"
          accent="orange"
          delayIndex={1}
          badge="High Conviction"
          credibility="AI Validated"
        >
          {isError(ideaAnalysis) ? (
            <ErrorNotice />
          ) : (
            <>
              <Field label="Problem Statement" value={ideaAnalysis?.problem} accent="orange" />
              <Field label="Objectives & Mission" value={ideaAnalysis?.goal} accent="orange" />
              <Field label="Target Industry Domain" value={ideaAnalysis?.domain} accent="orange" />
              <Field label="Feasibility & Speed" value={ideaAnalysis?.feasibility} accent="orange" />
            </>
          )}
        </DashboardCard>
      ),
    },
  ];

  return (
    <SectionCarousel
      sections={sections}
      moduleTitle="Module 1: Idea & Validation"
      moduleIcon={Lightbulb}
      moduleDescription="Venture viability index, Mom Test customer discovery interviews, and core thesis."
      accent="orange"
    />
  );
}

// ---------------------------------------------------------------------------
// Module 2: Strategic Frameworks (SWOT & Porter's Five Forces)
// ---------------------------------------------------------------------------
function FrameworksModule({
  swotAnalysis,
  portersFiveForces,
  ideaAnalysis,
  marketResearch,
  competitorWeaknessAnalysis,
  customerPersona,
}) {
  const sections = [
    {
      id: "swot-analysis",
      title: "SWOT Analysis Matrix",
      content: (
        <SwotAnalysisMatrix
          swotAnalysis={swotAnalysis}
          ideaAnalysis={ideaAnalysis}
          marketResearch={marketResearch}
          competitorWeaknessAnalysis={competitorWeaknessAnalysis}
          customerPersona={customerPersona}
        />
      ),
    },
    {
      id: "porters-forces",
      title: "Porter's Five Forces Breakdown",
      content: <PortersFiveForcesBreakdown portersFiveForces={portersFiveForces} />,
    },
  ];

  return (
    <SectionCarousel
      sections={sections}
      moduleTitle="Module 2: Strategic Frameworks"
      moduleIcon={ShieldCheck}
      moduleDescription="SWOT matrix and Porter's Five Forces industry defensibility."
      accent="indigo"
    />
  );
}

// ---------------------------------------------------------------------------
// Module 3: Market Intelligence & Sizing (TAM/SAM/SOM & Competitors)
// ---------------------------------------------------------------------------
function MarketModule({
  marketSizing,
  marketResearch,
  competitorWeaknessAnalysis,
  customerPersona,
  viabilityScorecard,
  ideaTitle,
}) {
  const sections = [
    {
      id: "market-sizing",
      title: "Market Sizing & Viability",
      content: (
        <MarketSizingSection
          marketSizing={marketSizing}
          viabilityScorecard={viabilityScorecard}
          ideaTitle={ideaTitle}
        />
      ),
    },
    {
      id: "competitor-weakness",
      title: "Competitor Vulnerabilities",
      content: (
        !isError(competitorWeaknessAnalysis) && competitorWeaknessAnalysis?.length > 0 ? (
          <CompetitorWeaknessSection analysis={competitorWeaknessAnalysis} accent="emerald" delayIndex={0} />
        ) : (
          <DashboardCard icon={Crosshair} title="Competitor Analysis" accent="emerald">
            <p className="text-xs text-slate-500">No competitor vulnerabilities identified.</p>
          </DashboardCard>
        )
      ),
    },
    {
      id: "customer-persona",
      title: "Customer Persona (ICP)",
      content: (
        <DashboardCard
          icon={Users}
          title="Customer Persona (ICP)"
          accent="emerald"
          delayIndex={1}
          badge="ICP (Ideal Customer Profile)"
          credibility="High Intent"
        >
          {isError(customerPersona) ? (
            <ErrorNotice />
          ) : (
            <>
              <ListField label="Target Users" items={customerPersona?.targetUsers} accent="emerald" />
              <ListField label="High-Friction Pain Points" items={customerPersona?.painPoints} accent="emerald" />
              <Field label="Narrative Buyer Story" value={customerPersona?.userProfile} accent="emerald" />
            </>
          )}
        </DashboardCard>
      ),
    },
    {
      id: "market-dynamics",
      title: "Market Dynamics & Research",
      content: (
        <DashboardCard
          icon={TrendingUp}
          title="Market Dynamics & Research"
          accent="emerald"
          delayIndex={2}
          badge="Landscape"
          credibility="92% Accuracy"
        >
          {isError(marketResearch) ? (
            <ErrorNotice />
          ) : (
            <>
              <ListField label="Identified Competitors" items={marketResearch?.competitors} accent="emerald" />
              <ListField label="Market Opportunities" items={marketResearch?.opportunities} accent="emerald" />
              <Field label="Market Demand Dynamics" value={marketResearch?.marketDemand} accent="emerald" />
            </>
          )}
        </DashboardCard>
      ),
    },
  ];

  return (
    <SectionCarousel
      sections={sections}
      moduleTitle="Module 3: Market Intelligence & Sizing"
      moduleIcon={TrendingUp}
      moduleDescription="Bottom-up TAM/SAM/SOM financial sizing, venture viability index, competitor vulnerabilities, and customer persona."
      accent="emerald"
    />
  );
}

// ---------------------------------------------------------------------------
// Module 4: Product & Technical Architecture
// ---------------------------------------------------------------------------
function ProductModule({ productPlan, technicalArchitecture }) {
  const sections = [
    {
      id: "product-plan",
      title: "Product Plan",
      content: (
        <DashboardCard
          icon={ListChecks}
          title="Product Plan"
          accent="sky"
          delayIndex={0}
          badge="MVP (Minimum Viable Product)"
          credibility="Sprint 1"
        >
          {isError(productPlan) ? (
            <ErrorNotice />
          ) : (
            <>
              <ListField label="MVP (Minimum Viable Product) Core Features" items={productPlan?.mvpFeatures} accent="sky" />
              <ListField label="Future Feature Phases" items={productPlan?.futureFeatures} accent="sky" />
              <Field label="Development Priority" value={productPlan?.developmentPriority} accent="sky" />
            </>
          )}
        </DashboardCard>
      ),
    },
    {
      id: "technical-architecture",
      title: "Technical Architecture",
      content: (
        <DashboardCard
          icon={Cpu}
          title="Technical Architecture"
          accent="sky"
          delayIndex={1}
          badge="Production Stack"
        >
          {isError(technicalArchitecture) ? (
            <ErrorNotice />
          ) : (
            <div className="space-y-3.5">
              <Field label="Frontend Stack" value={technicalArchitecture?.frontend} accent="sky" />
              <Field label="Backend Stack" value={technicalArchitecture?.backend} accent="sky" />
              <Field label="Database Architecture" value={technicalArchitecture?.database} accent="sky" />
              <Field label="Cloud Hosting" value={technicalArchitecture?.hosting} accent="sky" />
              <Field label="AI APIs & Models" value={technicalArchitecture?.aiApis} accent="sky" />
              <Field label="High-Level Overview" value={technicalArchitecture?.architectureOverview} accent="sky" />
            </div>
          )}
        </DashboardCard>
      ),
    },
  ];

  return (
    <SectionCarousel
      sections={sections}
      moduleTitle="Module 4: Product & Technical Architecture"
      moduleIcon={ListChecks}
      moduleDescription="MVP scope prioritization, future feature roadmap, and robust system architecture."
      accent="sky"
    />
  );
}

// ---------------------------------------------------------------------------
// Module 5: Financials & Launch Engine
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
  const sections = [
    {
      id: "pitch-thesis",
      title: "Investor Pitch & Thesis",
      content: (
        <div className="card-stagger p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm transition-all">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <p className="text-[11px] font-mono uppercase tracking-wider text-amber-600 font-bold">
              Investor Pitch & Executive Thesis
            </p>
          </div>
          {isError(pitch) ? (
            <ErrorNotice />
          ) : (
            <>
              <p className="text-lg sm:text-xl font-bold text-slate-900 mb-3 tracking-tight">
                {pitch?.elevatorPitch}
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                {pitch?.executiveSummary}
              </p>
            </>
          )}
        </div>
      ),
    },
    {
      id: "financial-simulator",
      title: "Financial Simulator",
      content: (
        <UpmetricsFinancialSimulator costEstimator={costEstimator} revenueSimulator={revenueSimulator} />
      ),
    },
    {
      id: "cost-revenue",
      title: "Cloud Costs & ARR",
      content: (
        <CostRevenueSection cost={costEstimator} revenue={revenueSimulator} accent="amber" delayIndex={1} />
      ),
    },
    {
      id: "gtm-engine",
      title: "Go-to-Market & Outreach",
      content: (
        !isError(goToMarket) && goToMarket ? (
          <div className="space-y-6">
            <GoToMarketSection gtm={goToMarket} accent="amber" delayIndex={2} />
            <FounderPalSwipeFile gtm={goToMarket} pitch={pitch} onToast={onToast} />
          </div>
        ) : (
          <DashboardCard icon={Target} title="Go-to-Market Strategy" accent="amber">
            <p className="text-xs text-slate-500">Go-to-market data unavailable.</p>
          </DashboardCard>
        )
      ),
    },
    {
      id: "launch-checklist",
      title: "Launch Checklist",
      content: (
        !isError(launchChecklist) && launchChecklist?.length > 0 ? (
          <LaunchChecklistSection items={launchChecklist} accent="amber" delayIndex={3} />
        ) : (
          <DashboardCard icon={ListTodo} title="Launch Checklist" accent="amber">
            <p className="text-xs text-slate-500">Checklist unavailable.</p>
          </DashboardCard>
        )
      ),
    },
    {
      id: "roadmap",
      title: "Startup Roadmap",
      content: (
        <DashboardCard icon={MapIcon} title="Startup Roadmap" accent="amber" delayIndex={4}>
          {isError(roadmap) ? <ErrorNotice /> : <RoadmapTimeline roadmap={roadmap} accent="amber" />}
        </DashboardCard>
      ),
    },
  ];

  return (
    <SectionCarousel
      sections={sections}
      moduleTitle="Module 5: Financials & Launch Engine"
      moduleIcon={Rocket}
      moduleDescription="Cloud infrastructure costs, ARR revenue simulator, ready-to-use outreach copy, and launch checklist."
      accent="amber"
    />
  );
}

// ---------------------------------------------------------------------------
// Go-to-Market Strategy
// ---------------------------------------------------------------------------
const CopyableCard = memo(function CopyableCard({ label, content, accent = "emerald" }) {
  const [copied, setCopied] = useState(false);
  if (!content) return null;

  function handleCopy() {
    navigator.clipboard?.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-xl bg-slate-50/80 border border-slate-200/80 p-4 hover:border-orange-300 transition-all duration-150">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-mono font-medium uppercase tracking-wider text-slate-500">{label}</p>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1 text-xs font-semibold ${ACCENT_TEXT[accent]} hover:opacity-80 transition-opacity font-mono`}
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

function GoToMarketSection({ gtm, accent = "emerald", delayIndex }) {
  return (
    <DashboardCard icon={Target} title="Go-to-Market Strategy" accent={accent} delayIndex={delayIndex}>
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
                className="rounded-xl bg-slate-50/80 border border-slate-200/70 p-4 hover:border-slate-300 transition-all duration-150"
              >
                <p className="text-xs sm:text-sm font-semibold text-slate-900 mb-1">{p.name}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{p.why}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {gtm.linkedInSearchStrategy?.length > 0 && (
        <div>
          <p className="text-[11px] font-mono font-medium uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <span className={`h-1 w-1 rounded-full ${ACCENT_DOT[accent]}`} />
            Target Prospect Search Filters
          </p>
          <div className="flex flex-wrap gap-2">
            {gtm.linkedInSearchStrategy.map((query, i) => (
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
function LaunchChecklistSection({ items, accent = "rose", delayIndex }) {
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
    <DashboardCard icon={ListTodo} title="Launch Checklist" accent={accent} delayIndex={delayIndex}>
      <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-mono text-slate-500">
            {checked.size} of {items.length} items completed
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
function RoadmapTimeline({ roadmap, accent = "rose" }) {
  const milestones = roadmap?.milestones || [];
  const a = ACCENT_TEXT[accent];
  const dotBg = ACCENT_DOT[accent];

  return (
    <div>
      <div className="relative border-l border-slate-200 ml-2 space-y-6">
        {milestones.map((m, i) => (
          <div
            key={i}
            className="card-stagger pl-6 relative"
            style={stagger(i, 80)}
          >
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

function CostRevenueSection({ cost, revenue, accent = "amber", delayIndex }) {
  const a = ACCENT_TEXT[accent];
  return (
    <div className="space-y-6">
      <div
        className="card-stagger p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs transition-all"
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
                    <p className="text-xs sm:text-sm font-mono font-semibold text-slate-900 mb-1">{item.monthlyCost}</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed truncate">{item.note}</p>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      <div
        className="card-stagger p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs"
        style={stagger((delayIndex ?? 0) + 1)}
      >
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
                      <th className="px-4 py-2.5 font-semibold">Estimated MRR (Monthly Recurring Revenue)</th>
                      <th className="px-4 py-2.5 font-semibold">Annualized ARR (Annual Recurring Revenue)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(revenue.projections || []).map((p, i) => (
                      <tr key={i} className="hover:bg-orange-50/30 transition-colors">
                        <td className="px-4 py-2.5 text-slate-800 font-mono">
                          {typeof p.users === "number" ? p.users.toLocaleString() : p.users}
                        </td>
                        <td className="px-4 py-2.5 text-emerald-600 font-mono font-semibold">{p.monthlyRevenue}</td>
                        <td className="px-4 py-2.5 text-emerald-700 font-mono font-semibold">{p.annualRevenue}</td>
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
      className="card-stagger p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs"
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
            className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:border-orange-300 transition-all duration-150"
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