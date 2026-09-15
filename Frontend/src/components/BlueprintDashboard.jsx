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
  Trash2,
  Plus,
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
  SwotAnalysisMatrix,
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

// ---------------------------------------------------------------------------
// Inline Editable List Component for Interactive Card Customization
// ---------------------------------------------------------------------------
function EditableList({
  items = [],
  onUpdate,
  placeholder = "Add new item...",
  addButtonLabel = "Add Item",
  accentColor = "sky",
  icon: ItemIcon = Check,
}) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newItemText, setNewItemText] = useState("");

  const safeItems = useMemo(() => {
    let arr = [];
    if (Array.isArray(items)) {
      arr = items;
    } else if (items && typeof items === "object") {
      arr = Object.values(items);
    } else if (typeof items === "string") {
      arr = [items];
    }
    return arr.map((it) => {
      if (typeof it === "string") return it;
      if (it && typeof it === "object") {
        return it.text || it.title || it.task || it.item || it.name || it.description || JSON.stringify(it);
      }
      return String(it ?? "");
    });
  }, [items]);

  const handleStartEdit = (idx, text) => {
    setEditingIndex(idx);
    setEditText(text);
  };

  const handleSaveEdit = (idx) => {
    if (editText.trim()) {
      const updated = [...safeItems];
      updated[idx] = editText.trim();
      onUpdate?.(updated);
    }
    setEditingIndex(null);
  };

  const handleDelete = (idx) => {
    const updated = safeItems.filter((_, i) => i !== idx);
    onUpdate?.(updated);
  };

  const handleAddItem = () => {
    if (newItemText.trim()) {
      const updated = [...safeItems, newItemText.trim()];
      onUpdate?.(updated);
      setNewItemText("");
      setIsAdding(false);
    }
  };

  const colorStyles = {
    sky: {
      icon: "text-sky-500",
      addBtn: "text-sky-600 hover:text-sky-700 bg-sky-50/70 hover:bg-sky-100 border-sky-200",
      editInput: "focus:border-sky-500 focus:ring-sky-500/20",
    },
    orange: {
      icon: "text-orange-500",
      addBtn: "text-orange-600 hover:text-orange-700 bg-orange-50/70 hover:bg-orange-100 border-orange-200",
      editInput: "focus:border-orange-500 focus:ring-orange-500/20",
    },
    emerald: {
      icon: "text-emerald-500",
      addBtn: "text-emerald-600 hover:text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100 border-emerald-200",
      editInput: "focus:border-emerald-500 focus:ring-emerald-500/20",
    },
    amber: {
      icon: "text-amber-500",
      addBtn: "text-amber-600 hover:text-amber-700 bg-amber-50/70 hover:bg-amber-100 border-amber-200",
      editInput: "focus:border-amber-500 focus:ring-amber-500/20",
    },
  }[accentColor] || {
    icon: "text-orange-500",
    addBtn: "text-orange-600 hover:text-orange-700 bg-orange-50/70 hover:bg-orange-100 border-orange-200",
    editInput: "focus:border-orange-500 focus:ring-orange-500/20",
  };

  return (
    <div className="space-y-2">
      <ul className="space-y-1.5">
        {safeItems.map((item, idx) => (
          <li
            key={idx}
            className="group relative flex items-start justify-between gap-2 text-xs text-slate-700 leading-relaxed bg-slate-50 hover:bg-white p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-all shadow-2xs"
          >
            {editingIndex === idx ? (
              <div className="flex items-center gap-1.5 w-full">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit(idx);
                    if (e.key === "Escape") setEditingIndex(null);
                  }}
                  autoFocus
                  className={`flex-1 text-xs px-2 py-1 bg-white rounded-lg border border-slate-300 outline-none transition-all ${colorStyles.editInput}`}
                />
                <button
                  type="button"
                  onClick={() => handleSaveEdit(idx)}
                  className="p-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-600 cursor-pointer"
                  title="Save"
                >
                  <Check size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingIndex(null)}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
                  title="Cancel"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <ItemIcon size={14} className={`${colorStyles.icon} shrink-0 mt-0.5`} />
                  <span className="break-words select-text">{item}</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 ml-1">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(idx, item)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                    title="Edit item"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(idx)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                    title="Delete item"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* Add New Item */}
      {isAdding ? (
        <div className="flex items-center gap-1.5 pt-1">
          <input
            type="text"
            value={newItemText}
            placeholder={placeholder}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddItem();
              if (e.key === "Escape") {
                setIsAdding(false);
                setNewItemText("");
              }
            }}
            autoFocus
            className={`flex-1 text-xs px-2.5 py-1.5 bg-white rounded-xl border border-slate-300 outline-none transition-all ${colorStyles.editInput}`}
          />
          <button
            type="button"
            onClick={handleAddItem}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdding(false);
              setNewItemText("");
            }}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className={`w-full py-1.5 px-3 rounded-xl border border-dashed text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${colorStyles.addBtn}`}
        >
          <Plus size={13} />
          <span>{addButtonLabel}</span>
        </button>
      )}
    </div>
  );
}

export default function BlueprintDashboard({
  blueprint,
  setBlueprint,
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
          {/* Founder vs Investor Mode Toggle */}
          <div className="inline-flex p-0.5 bg-slate-100 rounded-xl border border-slate-200 text-xs shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setIsFounderMode(true);
                showToast("Switched to Plain-English Founder Mode");
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                isFounderMode
                  ? "bg-white text-orange-600 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Plain-English terms without MBA jargon"
            >
              💡 Founder Mode
            </button>
            <button
              type="button"
              onClick={() => {
                setIsFounderMode(false);
                showToast("Switched to VC & Investor Mode");
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                !isFounderMode
                  ? "bg-white text-orange-600 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Standard institutional & VC terms (TAM/SAM/SOM, Porter's, etc.)"
            >
              📊 Investor Mode
            </button>
          </div>

          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:text-orange-600 hover:border-orange-300 transition-colors cursor-pointer shadow-2xs"
          >
            <Copy size={13} />
            <span className="hidden sm:inline">Copy Brief</span>
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
                    customerPersona={customerPersona}
                    productPlan={productPlan}
                    businessStrategy={businessStrategy}
                    roadmap={roadmap}
                    launchChecklist={launchChecklist}
                    isFounderMode={isFounderMode}
                  />
                )}

                {/* 2. CUSTOMER PERSONA & DISCOVERY */}
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
                    onUpdateMvpFeatures={(val) => updateSectionField("productPlan", "mvpFeatures", val)}
                    onUpdateFutureFeatures={(val) => updateSectionField("productPlan", "futureFeatures", val)}
                  />
                )}

                {/* 5. FINANCIAL MODEL & UNIT ECONOMICS */}
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

                {/* 6. GO-TO-MARKET & LAUNCH EXECUTION */}
                {activeSection === "gtm" && (
                  <GoToMarketSection
                    goToMarket={goToMarket}
                    launchChecklist={launchChecklist}
                    pitch={pitch}
                    onToast={showToast}
                    onUpdateChecklist={(val) => updateRootField("launchChecklist", val)}
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
  const safeText = (val) => {
    if (val === null || val === undefined) return null;
    if (typeof val === "string" || typeof val === "number") return val;
    if (Array.isArray(val)) return val.map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v))).join(", ");
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  };

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
            {safeText(stat)}
          </div>
          {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{safeText(subtitle)}</p>}
        </div>
      )}

      {/* Card Body Content */}
      {children && <div className="flex-1">{children}</div>}

      {/* Bottom Details Tray */}
      {detailsTitle && (
        <div className="pt-4 border-t border-slate-100 mt-4">
          <h4 className="text-xs font-bold text-slate-900 mb-1">{detailsTitle}</h4>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">{safeText(detailsText)}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SECTION 1: EXECUTIVE OVERVIEW & VIABILITY
// ============================================================================
function OverviewSection({
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
  isFounderMode = true,
}) {
  const score = viabilityScorecard?.score ?? 84;
  const verdict = viabilityScorecard?.verdict || "Proceed";

  return (
    <div className="space-y-6">
      {/* 🚀 Instant Action Deck: What to build & ship first */}
      <div className="bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-white rounded-2xl p-5 border border-orange-200/90 shadow-2xs">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center justify-center h-6 w-6 rounded-lg bg-orange-600 text-white">
            <Zap size={13} />
          </span>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-orange-800">
            Executive Action Deck • Your Core Next Steps
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block mb-1">
              🎯 Target Customer
            </span>
            <p className="font-semibold text-slate-800 line-clamp-2">
              {customerPersona?.targetUsers?.[0] || customerPersona?.userProfile || "Early Adopter"}
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block mb-1">
              🛠️ Core MVP Scope
            </span>
            <p className="font-semibold text-slate-800 line-clamp-2">
              {productPlan?.mvpFeatures?.slice(0, 2).join(", ") || "Production MVP"}
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block mb-1">
              💰 Monetization Model
            </span>
            <p className="font-semibold text-slate-800 line-clamp-2">
              {businessStrategy?.pricingIdea || businessStrategy?.revenueModel || "Subscription Tier"}
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block mb-1">
              🚀 Priority This Week
            </span>
            <p className="font-semibold text-orange-700 line-clamp-2">
              {roadmap?.milestones?.[0]?.tasks?.[0] || launchChecklist?.[0] || "Validate Mom Test questions"}
            </p>
          </div>
        </div>
      </div>

      {/* Hero Charts: Viability Gauge + TAM/SAM/SOM Bubbles — Side by Side on Large Screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VenturusViabilityGaugeChart viabilityScorecard={viabilityScorecard} ideaTitle={ventureTitle} />
        <VenturusMarketSizeBubbleChart marketSizing={marketSizing} ideaTitle={ventureTitle} />
      </div>

      {/* Cards Grid */}
      <ResponsiveCardGrid>
        {/* Card 1: Venture Viability Scorecard */}
        <StatCard
          title={isFounderMode ? "Startup Viability & Survival Score" : "Venture Viability Scorecard"}
          icon={ShieldCheck}
          iconColor="text-orange-500"
          stat={`${score} / 100`}
          subtitle={`Verdict: ${verdict}`}
          detailsTitle={isFounderMode ? "Why this verdict?" : "Executive Investment Thesis"}
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
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-mono uppercase text-rose-600 font-bold block mb-1.5">
                Identified Risk Traps
              </span>
              <div className="space-y-1">
                {(viabilityScorecard?.fatalRiskTraps?.length > 0
                  ? viabilityScorecard.fatalRiskTraps
                  : [
                      "Over-indexing on polite hypothetical feedback without demanding upfront financial commitments.",
                      "Scope creep delaying production MVP launch beyond a disciplined 4-week shipping sprint.",
                      "Underestimating enterprise procurement, single sign-on (SSO), and data compliance review timelines."
                    ]
                ).map((risk, i) => (
                  <div key={i} className="text-xs text-rose-800 bg-rose-50/60 p-2 rounded-lg border border-rose-100 leading-snug">
                    • {risk}
                  </div>
                ))}
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
          detailsText={ideaAnalysis?.feasibility || "High feasibility with modern serverless architecture and production AI APIs."}
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
              <p className="leading-relaxed text-slate-700">
                {ideaAnalysis?.problem || "Founders and operators struggle with manual, fragmented workflows that introduce high operational overhead and slow delivery."}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                Strategic Mission & Objectives
              </span>
              <p className="leading-relaxed text-slate-700">
                {ideaAnalysis?.goal || "Deliver an autonomous copilot platform that eliminates 80% of repetitive operational tasks and accelerates time-to-market."}
              </p>
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
function CustomerDiscoverySection({
  customerPersona,
  customerDiscovery,
  onUpdatePainPoints,
  onUpdateQuestions,
  onUpdateRedFlags,
  onUpdateWtpSignals,
}) {
  const users = customerPersona?.targetUsers?.length > 0
    ? customerPersona.targetUsers
    : ["Early-Stage Founders & Builders", "Growth Operators & Product Leads"];

  const painPoints = customerPersona?.painPoints?.length > 0
    ? customerPersona.painPoints
    : [
        "Excessive time lost to manual configuration and non-core operational setup.",
        "High subscription spend across fragmented point-solutions that do not interoperate.",
        "Uncertainty around genuine buyer willingness-to-pay before committing engineering burn."
      ];

  const profile = customerPersona?.userProfile || "High-agency early-stage founder or team lead seeking maximum execution leverage and low initial burn.";

  const interviewQuestions = customerDiscovery?.interviewQuestions?.length > 0
    ? customerDiscovery.interviewQuestions
    : [
        "What is the hardest part about handling this workflow today?",
        "When was the last time you encountered this issue, and what specific workaround did you use?",
        "Why was that workaround frustrating or inadequate?",
        "How much money or staff hours have you allocated to solve this problem over the past 6 months?",
        "Where did you look to find current solutions, and why didn't existing tools satisfy you?"
      ];

  const redFlags = customerDiscovery?.redFlags?.length > 0
    ? customerDiscovery.redFlags
    : [
        "\"I would definitely use something like that if it existed\" (Hypothetical praise with zero financial commitment).",
        "\"Send me a link once you have version 1.0 launched\" (Polite deferral masking low purchasing urgency).",
        "\"My team would love this\" from an employee with zero procurement authority or budget ownership."
      ];

  const wtpSignals = customerDiscovery?.willingnessToPaySignals?.length > 0
    ? customerDiscovery.willingnessToPaySignals
    : [
        "Prospect signs a Letter of Intent (LOI) or pays a refundable pilot deposit before code is written.",
        "Customer shares proprietary internal workflow files or commits their technical team to an onboarding working session."
      ];

  return (
    <ResponsiveCardGrid>
      {/* Card 1: Customer Persona & Profile */}
      <StatCard
        title="Target Customer Profile"
        icon={Users}
        iconColor="text-orange-500"
        stat={`${users.length} ICP Segments`}
        subtitle="Primary Economic Buyer"
        detailsTitle="Ideal Customer Profile (ICP)"
        detailsText={profile}
      >
        <div className="space-y-3 text-xs">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1.5">
              Target Demographic / Cohorts
            </span>
            <div className="flex flex-wrap gap-1.5">
              {users.map((u, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-orange-50/70 border border-orange-100 text-orange-800 font-medium text-[11px]"
                >
                  {u}
                </span>
              ))}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 leading-relaxed text-[11px]">
            <span className="font-bold text-slate-800 block mb-0.5">Behavioral Archetype:</span>
            {profile}
          </div>
        </div>
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
        icon={DollarSign}
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
          icon={DollarSign}
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
}) {
  // Resolve Porter's Five Forces with multiple alias keys and rich fallback analysis
  const resolvePorterForce = (key, aliases = [], fallbackAnalysis = "Moderate market dynamic.") => {
    const raw = portersFiveForces || blueprint?.portersFiveForces || {};
    let obj = raw[key];
    if (!obj || typeof obj !== "object") {
      for (const alias of aliases) {
        if (raw[alias] && typeof raw[alias] === "object") {
          obj = raw[alias];
          break;
        }
      }
    }
    const level = obj?.level || obj?.intensity || obj?.rating || "Moderate";
    const analysis = obj?.analysis || obj?.explanation || obj?.description || fallbackAnalysis;
    return { level, analysis };
  };

  const buyerPower = resolvePorterForce(
    "buyerPower",
    ["buyers", "buyer_power", "customerPower"],
    "Customers face low-to-moderate initial switching costs; building automated workflow integrations creates compounding retention."
  );
  const supplierPower = resolvePorterForce(
    "supplierPower",
    ["suppliers", "supplier_power", "vendorPower"],
    "Low reliance on single cloud/AI vendors due to modular containerized architecture and interchangeable foundation LLM models."
  );
  const competitiveRivalry = resolvePorterForce(
    "competitiveRivalry",
    ["rivalry", "competition", "industryRivalry"],
    "High density of generic tools competing on broad messaging, but low direct feature overlap in tailored vertical workflows."
  );
  const threatOfSubstitutes = resolvePorterForce(
    "threatOfSubstitutes",
    ["threatOfSubstitution", "substitutes", "substitutionThreat"],
    "Current alternatives rely on disjointed manual spreadsheets and fragmented point solutions, which are slow and error-prone."
  );
  const threatOfNewEntry = resolvePorterForce(
    "threatOfNewEntry",
    ["threatOfNewEntrants", "newEntrants", "entryBarriers"],
    "Low technical barriers for shallow AI wrappers, but high defensibility built through proprietary data loops and integrations."
  );

  // Competitor vulnerability matrix items with intelligent fallback synthesis if backend omitted it
  const competitorsList = marketResearch?.competitors?.length > 0
    ? marketResearch.competitors
    : ["Legacy Incumbent", "Horizontal SaaS Platform", "Manual In-House Tools"];

  const vulnerabilities = useMemo(() => {
    if (competitorWeaknessAnalysis?.length > 0) return competitorWeaknessAnalysis;
    return competitorsList.map((comp) => {
      const name = typeof comp === "string" ? comp : comp?.name || "Market Incumbent";
      return {
        competitor: name,
        weaknesses: [
          "Bloated legacy codebase with slow feature turnaround and rigid multi-month deployment cycles.",
          "Prohibitive enterprise pricing tiers and high consulting setup fees."
        ],
        missedOpportunities: [
          "Neglected self-serve SMB and early-stage founder onboarding experience."
        ],
        suggestedDifferentiation: `Deliver an autonomous, zero-configuration solution that deploys in seconds at a fraction of ${name} costs.`
      };
    });
  }, [competitorWeaknessAnalysis, competitorsList]);

  // Market opportunities with fallback
  const marketOpps = marketResearch?.opportunities?.length > 0
    ? marketResearch.opportunities
    : [
        "Accelerating demand for autonomous agentic workflows that eliminate manual operator overhead.",
        "Unbundling of monolithic legacy software suites into fast, modular vertical copilots.",
        "Growing willingness among founders and operators to pay for instant time-to-value solutions."
      ];

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
        {/* Card: Porter's Five Forces */}
        <StatCard
          title="Porter's Five Forces"
          icon={Target}
          iconColor="text-orange-500"
          stat="Market Defensibility"
          subtitle="Industry Structure & Competitive Moats"
          detailsTitle="Defensibility Strategy"
          detailsText="Compound user workflow telemetry and proprietary data pipelines to steadily increase customer switching barriers."
        >
          <div className="space-y-2.5 text-xs">
            {[
              { force: buyerPower, label: "Buyer Power" },
              { force: supplierPower, label: "Supplier Power" },
              { force: competitiveRivalry, label: "Competitive Rivalry" },
              { force: threatOfSubstitutes, label: "Threat of Substitution" },
              { force: threatOfNewEntry, label: "Threat of New Entrants" },
            ].map(({ force, label }) => (
              <div key={label} className="p-3 rounded-xl bg-slate-50 border border-slate-100/80">
                <div className="flex justify-between items-center font-bold mb-1">
                  <span className="text-slate-900">{label}</span>
                  <span
                    className={`font-mono px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                      force.level === "High"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : force.level === "Low"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {force.level}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">{force.analysis}</p>
              </div>
            ))}
          </div>
        </StatCard>

        {/* Card: Market Demand Signals & Validation */}
        <StatCard
          title="Market Demand Signals"
          icon={Lightbulb}
          iconColor="text-orange-500"
          stat={ideaAnalysis?.domain || "Market Intelligence"}
          subtitle="Sector Validation & Tailwinds"
          detailsTitle="Demand Dynamics"
          detailsText={marketResearch?.marketDemand || "Growing tailwinds driven by demand for autonomous AI workflows."}
        >
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-2">
                Sector Opportunities & Tailwinds
              </span>
              <ul className="space-y-2">
                {marketOpps.map((opp, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-slate-700 bg-orange-50/40 p-2.5 rounded-xl border border-orange-100 leading-relaxed"
                  >
                    <span className="text-orange-500 font-bold select-none">↗</span>
                    <span>{opp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1.5">
                Identified Industry Competitors
              </span>
              <div className="flex flex-wrap gap-1.5">
                {competitorsList.map((c, i) => (
                  <span
                    key={i}
                    className="text-[11px] bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-slate-200/80"
                  >
                    {typeof c === "string" ? c : c?.name || "Competitor"}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </StatCard>
      </div>

      {/* 3. Competitor Vulnerability & Exploit Strategies */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shadow-2xs">
              <Crosshair size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Competitor Vulnerability & Exploit Strategies
              </h3>
              <p className="text-xs text-slate-500">
                Architectural weaknesses of incumbents and strategic wedge angles to capture market share.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase hidden sm:inline-block">
            Differentiation Engine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vulnerabilities.map((c, i) => (
            <div
              key={i}
              className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900">{c.competitor}</span>
                  <span className="text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-bold">
                    Incumbent
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-0.5">
                      Structural Weakness
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {Array.isArray(c.weaknesses) ? c.weaknesses.join("; ") : c.weaknesses || c.weakness}
                    </p>
                  </div>

                  {c.missedOpportunities && (
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-0.5">
                        Missed Opportunity
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {Array.isArray(c.missedOpportunities)
                          ? c.missedOpportunities.join("; ")
                          : c.missedOpportunities}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-[10px] font-mono uppercase text-orange-600 font-bold block mb-1">
                  Our Differentiation Wedge
                </span>
                <p className="text-xs text-orange-900 leading-relaxed font-medium bg-orange-50/70 p-2.5 rounded-xl border border-orange-100">
                  {c.suggestedDifferentiation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
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
}) {
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
              accentColor="sky"
              icon={Check}
            />
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
              Future Expansion Roadmap (Editable)
            </span>
            <EditableList
              items={productPlan?.futureFeatures || []}
              onUpdate={onUpdateFutureFeatures}
              placeholder="e.g. Enterprise RBAC & Audit Trails"
              addButtonLabel="Add Roadmap Item"
              accentColor="sky"
              icon={Sparkles}
            />
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
// SECTION 5: FINANCIAL MODEL & UNIT ECONOMICS (Elaborated Institutional Suite)
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
  // Business Model Archetype Selector (eliminates B2B SaaS bias)
  const [selectedArchetype, setSelectedArchetype] = useState(() => {
    const domain = (ideaAnalysis?.domain || "").toLowerCase();
    const model = (businessStrategy?.revenueModel || "").toLowerCase();
    if (
      domain.includes("d2c") ||
      domain.includes("retail") ||
      domain.includes("ecommerce") ||
      domain.includes("physical") ||
      domain.includes("hardware") ||
      model.includes("ecommerce")
    ) {
      return "d2c";
    }
    if (
      domain.includes("marketplace") ||
      domain.includes("platform") ||
      model.includes("marketplace") ||
      model.includes("commission")
    ) {
      return "marketplace";
    }
    if (
      domain.includes("agency") ||
      domain.includes("service") ||
      domain.includes("consult") ||
      model.includes("service")
    ) {
      return "agency";
    }
    return "saas";
  });

  const ARCHETYPES = {
    saas: {
      id: "saas",
      name: "B2B SaaS",
      grossMargin: 88,
      ltvMultiplier: 20,
      cacDivisor: 3,
      payback: "< 6 mos",
      typeLabel: "Software Subscription",
      churnNote: "5% monthly SaaS churn benchmark (20-month average lifecycle)",
    },
    d2c: {
      id: "d2c",
      name: "D2C / E-Commerce",
      grossMargin: 54,
      ltvMultiplier: 2.2,
      cacDivisor: 2.0,
      payback: "First Order",
      typeLabel: "Physical Consumer Brand",
      churnNote: "Factoring manufacturing COGS, shipping, and 1.8x repeat purchases",
    },
    marketplace: {
      id: "marketplace",
      name: "Marketplace",
      grossMargin: 22,
      ltvMultiplier: 25,
      cacDivisor: 3.5,
      payback: "< 8 mos",
      typeLabel: "Two-Sided Net Take Rate",
      churnNote: "4% platform churn with buyer/seller retention network effects",
    },
    agency: {
      id: "agency",
      name: "Agency / Retainer",
      grossMargin: 65,
      ltvMultiplier: 28,
      cacDivisor: 4,
      payback: "< 2 mos",
      typeLabel: "High-Ticket Client Retainers",
      churnNote: "3.5% client churn (28-month average account lifecycle)",
    },
  };

  const activeArch = ARCHETYPES[selectedArchetype] || ARCHETYPES.saas;

  // Dynamic ARPU calculation
  const arpu = useMemo(() => {
    if (revenueSimulator?.pricingAssumption) {
      const match = revenueSimulator.pricingAssumption.match(/\$(\d+)/);
      if (match && match[1]) return parseInt(match[1], 10);
    }
    return 29;
  }, [revenueSimulator]);

  // Dynamic monthly infrastructure burn
  const monthlyBurn = useMemo(() => {
    if (costEstimator?.estimatedMonthlyCost) {
      const match = costEstimator.estimatedMonthlyCost.match(/\$(\d+)/);
      if (match && match[1]) return parseInt(match[1], 10);
    }
    return 35;
  }, [costEstimator]);

  const breakevenSubscribers = Math.max(1, Math.ceil(monthlyBurn / arpu));
  const estimatedLtv = Math.round(arpu * activeArch.ltvMultiplier);
  const targetCac = Math.max(1, Math.round(estimatedLtv / activeArch.cacDivisor));
  const grossMargin = activeArch.grossMargin;

  return (
    <div className="space-y-6">
      {/* 1. TOP HERO: Upmetrics™ Interactive Financial Simulator (Always Visible) */}
      <UpmetricsFinancialSimulator
        costEstimator={costEstimator}
        revenueSimulator={revenueSimulator}
      />

      {/* 2. Core Financial Cards Grid */}
      <ResponsiveCardGrid>
        {/* Card 1: Infrastructure & Cloud Costs */}
        <StatCard
          title="Infrastructure & Cloud Costs"
          icon={DollarSign}
          iconColor="text-orange-500"
          stat={costEstimator?.estimatedMonthlyCost || "$16-51"}
          subtitle="Estimated Monthly Cost"
          detailsTitle="Annual Projection"
          detailsText={`Estimated yearly cloud burn: ${costEstimator?.estimatedYearlyCost || "$192-612"}. Highly cost-efficient serverless foundation with free tiers.`}
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
                      <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                        FREE TIER
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-slate-800">{item.monthlyCost}</span>
                </div>
              );
            })}
          </div>
        </StatCard>

        {/* Card 2: User-Tier Revenue Projections */}
        <StatCard
          title="Revenue Projections"
          icon={TrendingUp}
          iconColor="text-orange-500"
          stat={revenueSimulator?.projections?.[2]?.annualRevenue || "$588,000"}
          subtitle={revenueSimulator?.pricingAssumption || "Based on subscription model"}
          detailsTitle="Pricing Assumption"
          detailsText={revenueSimulator?.pricingAssumption || businessStrategy?.pricingIdea || "Tiered B2B SaaS pricing model with self-serve starter and high-ticket growth plans."}
        >
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
              User-Tier Revenue Milestones
            </span>
            {(revenueSimulator?.projections || [
              { users: 100, monthlyRevenue: "$4,900", annualRevenue: "$58,800" },
              { users: 500, monthlyRevenue: "$24,500", annualRevenue: "$294,000" },
              { users: 1000, monthlyRevenue: "$49,000", annualRevenue: "$588,000" },
              { users: 5000, monthlyRevenue: "$245,000", annualRevenue: "$2,940,000" },
            ]).map((proj, i) => (
              <div key={i} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{proj.users?.toLocaleString()} users</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {i === 0 ? "Traction" : i === 1 ? "PMF" : i === 2 ? "Scale" : "Leader"}
                  </span>
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

        {/* Card 3: Unit Economics & Multi-Archetype Health Ratios */}
        <StatCard
          title="Unit Economics & Ratios"
          icon={BarChart3}
          iconColor="text-emerald-500"
          stat={`$${estimatedLtv} LTV`}
          subtitle={`ARPU: $${arpu}/mo | Target CAC: <$${targetCac}`}
          detailsTitle="Industry Benchmark"
          detailsText={`Configured for ${activeArch.typeLabel}. ${activeArch.churnNote}. Maintaining a healthy LTV:CAC ensures sustainable unit margins.`}
        >
          <div className="space-y-2.5 text-xs">
            {/* Archetype switcher pills */}
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

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
                <span className="text-[10px] text-emerald-800 block font-mono uppercase">Gross Margin</span>
                <span className="font-bold font-mono text-emerald-900 text-base">{grossMargin}%</span>
                <span className="text-[9px] text-emerald-600 block mt-0.5">{activeArch.name}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 block font-mono uppercase">Payback Period</span>
                <span className="font-bold font-mono text-slate-900 text-base">{activeArch.payback}</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Acquisition Recoup</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">Average Revenue / Order (ARPU):</span>
                <span className="font-mono font-bold text-slate-900">${arpu}/mo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Expected Customer Lifetime Value:</span>
                <span className="font-mono font-bold text-emerald-700">${estimatedLtv}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Max Allowable Target CAC:</span>
                <span className="font-mono font-bold text-orange-600">&lt; ${targetCac}</span>
              </div>
            </div>
          </div>
        </StatCard>

        {/* Card 4: Breakeven & Capital Runway Analysis */}
        <StatCard
          title="Breakeven & Capital Runway"
          icon={ShieldCheck}
          iconColor="text-orange-500"
          stat={`${breakevenSubscribers} subscribers`}
          subtitle="Monthly Cash Flow Breakeven"
          detailsTitle="Capital Efficiency"
          detailsText={`With monthly infrastructure burn estimated at ~$${monthlyBurn} and ARPU at ~$${arpu}/mo, cash flow breakeven is reached at just ${breakevenSubscribers} customers.`}
        >
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 block font-mono">Monthly Burn</span>
                <span className="font-bold font-mono text-slate-900">${monthlyBurn}/mo</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 block font-mono">ARPU</span>
                <span className="font-bold font-mono text-slate-900">${arpu}/mo</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-600 font-mono">Breakeven Target</span>
                <span className="font-mono font-bold text-orange-700">{breakevenSubscribers} paying users</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: "0%" }} />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
                <span>Bootstrapped: Zero external capital needed</span>
                <span className="font-bold text-emerald-700">Infinite Runway</span>
              </div>
            </div>
          </div>
        </StatCard>

        {/* Card 5: Business Strategy & Monetization Tiers */}
        <StatCard
          title="Monetization Architecture"
          icon={Briefcase}
          iconColor="text-orange-500"
          stat="Tiered Model"
          subtitle={businessStrategy?.revenueModel || "Tiered SaaS Subscription"}
          detailsTitle="Pricing Architecture"
          detailsText={businessStrategy?.pricingIdea || "Three-tier subscription architecture with clear feature differentiation and usage upsells."}
        >
          <div className="space-y-2.5 text-xs">
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block">Starter</span>
                <span className="font-bold font-mono text-slate-900">${Math.max(9, Math.round(arpu * 0.6))}/mo</span>
              </div>
              <div className="p-2 rounded-lg bg-orange-50 border border-orange-200">
                <span className="text-[9px] font-mono uppercase text-orange-600 font-bold block">Pro (Core)</span>
                <span className="font-bold font-mono text-orange-900">${arpu}/mo</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block">Scale</span>
                <span className="font-bold font-mono text-slate-900">${Math.round(arpu * 3)}/mo</span>
              </div>
            </div>

            {businessStrategy?.marketingChannels?.length > 0 && (
              <div>
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

      {/* 3. 9-Box Strategic Lean Canvas Matrix */}
      <LeanCanvasMatrix
        ideaAnalysis={ideaAnalysis}
        productPlan={productPlan}
        marketResearch={marketResearch}
        costEstimator={costEstimator}
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
      .map((c) => (typeof c === "object" ? JSON.stringify(c, null, 2) : String(c)))
      .join("\n\n");
  }
  if (typeof content === "object") {
    if (content.subject && content.body) {
      return `Subject: ${content.subject}\n\n${content.body}`;
    }
    if (content.title && content.post) {
      return `Title: ${content.title}\n\n${content.post}`;
    }
    if (content.title && content.body) {
      return `Title: ${content.title}\n\n${content.body}`;
    }
    if (content.hook && content.thread) {
      const threadStr = Array.isArray(content.thread) ? content.thread.join("\n\n") : content.thread;
      return `${content.hook}\n\n${threadStr}`;
    }
    if (content.tweet) {
      return content.tweet;
    }
    return Object.entries(content)
      .map(([k, v]) => `${k.toUpperCase()}:\n${typeof v === "object" ? JSON.stringify(v, null, 2) : v}`)
      .join("\n\n");
  }
  return String(content);
}

function GoToMarketSection({ goToMarket, launchChecklist, pitch, onToast, onUpdateChecklist }) {
  const [completedItems, setCompletedItems] = useState(() => new Set());
  const [editingIdx, setEditingIdx] = useState(null);
  const [editText, setEditText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newItemText, setNewItemText] = useState("");

  // Normalize launchChecklist into a safe array of strings
  const safeChecklist = useMemo(() => {
    if (Array.isArray(launchChecklist)) {
      return launchChecklist.map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          return item.task || item.title || item.milestone || item.step || item.item || item.name || JSON.stringify(item);
        }
        return String(item ?? "");
      });
    }
    if (launchChecklist && typeof launchChecklist === "object") {
      if (Array.isArray(launchChecklist.checklist)) {
        return launchChecklist.checklist.map((item) => (typeof item === "string" ? item : item?.task || item?.title || JSON.stringify(item)));
      }
      if (Array.isArray(launchChecklist.items)) {
        return launchChecklist.items.map((item) => (typeof item === "string" ? item : item?.task || item?.title || JSON.stringify(item)));
      }
      return Object.values(launchChecklist).map((val) => (typeof val === "string" ? val : JSON.stringify(val)));
    }
    if (typeof launchChecklist === "string" && launchChecklist.trim()) {
      return [launchChecklist.trim()];
    }
    return [
      "Secure Primary Domain and SSL Certificate",
      "Deploy High-Conversion Waitlist Landing Page",
      "Configure Product Analytics & Conversion Funnel",
      "Complete 15 Mom Test Customer Discovery Interviews",
      "Publish Launch Post on Reddit and Twitter",
    ];
  }, [launchChecklist]);

  // Normalize platforms list
  const platformsList = useMemo(() => {
    const raw = goToMarket?.platforms;
    if (Array.isArray(raw)) {
      return raw.map((p) => {
        if (!p) return { name: "Channel", why: "Strategic distribution channel" };
        if (typeof p === "string") return { name: p, why: "Target organic and community growth." };
        if (typeof p === "object") {
          return {
            name: typeof p.name === "string" ? p.name : p.platform || p.title || p.channel || "Channel",
            why: typeof p.why === "string" ? p.why : p.strategy || p.reason || (typeof p.description === "string" ? p.description : "High-intent customer acquisition channel."),
          };
        }
        return { name: String(p), why: "" };
      });
    }
    if (raw && typeof raw === "object") {
      return Object.entries(raw).map(([key, val]) => ({
        name: key,
        why: typeof val === "string" ? val : typeof val?.why === "string" ? val.why : JSON.stringify(val),
      }));
    }
    if (typeof raw === "string" && raw.trim()) {
      return raw.split(",").map((s) => ({ name: s.trim(), why: "Growth channel" }));
    }
    return [
      { name: "LinkedIn", why: "Direct outreach to economic buyers and clinical operators." },
      { name: "Reddit", why: "Community-driven feedback in niche healthcare forums." },
    ];
  }, [goToMarket?.platforms]);

  // Normalize LinkedIn search queries
  const linkedInQueries = useMemo(() => {
    const raw = goToMarket?.linkedInSearchStrategy;
    if (Array.isArray(raw)) {
      return raw
        .map((q) => {
          if (typeof q === "string") return q;
          if (q && typeof q === "object") return q.query || q.search || q.title || JSON.stringify(q);
          return String(q ?? "");
        })
        .filter(Boolean);
    }
    if (typeof raw === "string" && raw.trim()) {
      return [raw.trim()];
    }
    if (raw && typeof raw === "object") {
      return Object.values(raw)
        .map((v) => (typeof v === "string" ? v : JSON.stringify(v)))
        .filter(Boolean);
    }
    return [];
  }, [goToMarket?.linkedInSearchStrategy]);

  const coldEmailText = formatTemplateContent(goToMarket?.coldEmailTemplate);
  const linkedInDmText = formatTemplateContent(goToMarket?.linkedInDmTemplate);
  const redditPostText = formatTemplateContent(goToMarket?.redditLaunchPost);
  const twitterPostText = formatTemplateContent(goToMarket?.twitterLaunchPost);

  const toggleComplete = (idx) => {
    setCompletedItems((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleSaveEdit = (idx) => {
    if (editText.trim() && onUpdateChecklist) {
      const updated = [...safeChecklist];
      updated[idx] = editText.trim();
      onUpdateChecklist(updated);
    }
    setEditingIdx(null);
  };

  const handleDeleteItem = (idx) => {
    if (onUpdateChecklist) {
      const updated = safeChecklist.filter((_, i) => i !== idx);
      onUpdateChecklist(updated);
    }
  };

  const handleAddItem = () => {
    if (newItemText.trim() && onUpdateChecklist) {
      const updated = [...safeChecklist, newItemText.trim()];
      onUpdateChecklist(updated);
      setNewItemText("");
      setIsAdding(false);
    }
  };

  const totalCount = safeChecklist.length;
  const completedCount = Array.from(completedItems).filter((idx) => idx < totalCount).length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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
            {coldEmailText ? (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-900">Cold Email Template</span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(coldEmailText);
                      onToast?.("Cold email copied to clipboard");
                    }}
                    className="text-[11px] font-mono text-orange-600 font-bold hover:underline cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-slate-600 font-mono text-[11px] whitespace-pre-wrap">{coldEmailText}</p>
              </div>
            ) : null}

            {linkedInDmText ? (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-900">LinkedIn DM Template</span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(linkedInDmText);
                      onToast?.("LinkedIn DM copied to clipboard");
                    }}
                    className="text-[11px] font-mono text-orange-600 font-bold hover:underline cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-slate-600 font-mono text-[11px] whitespace-pre-wrap">{linkedInDmText}</p>
              </div>
            ) : null}
          </div>
        </StatCard>

        {/* Card 2: Acquisition Channels */}
        <StatCard
          title="Acquisition Channels"
          icon={Rocket}
          iconColor="text-orange-500"
          stat={`${platformsList.length} Channels`}
          subtitle="Growth Flywheel"
          detailsTitle="Target Audience"
          detailsText={
            typeof goToMarket?.targetAudience === "string"
              ? goToMarket.targetAudience
              : (goToMarket?.targetAudience ? JSON.stringify(goToMarket.targetAudience) : "Blend high-intent organic search with community distribution.")
          }
        >
          <div className="space-y-2 text-xs">
            {platformsList.map((p, i) => (
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

        {/* Card 3: Social Launch Copy */}
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
            {redditPostText ? (
              <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-900">🟠 Reddit Launch Post</span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(redditPostText);
                      onToast?.("Reddit post copied to clipboard");
                    }}
                    className="text-[11px] font-mono text-orange-600 font-bold hover:underline cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-slate-700 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">{redditPostText}</p>
              </div>
            ) : null}

            {twitterPostText ? (
              <div className="p-3 rounded-xl bg-sky-50/50 border border-sky-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-900">𝕏 Twitter Launch Post</span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(twitterPostText);
                      onToast?.("Twitter post copied to clipboard");
                    }}
                    className="text-[11px] font-mono text-sky-600 font-bold hover:underline cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-slate-700 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">{twitterPostText}</p>
              </div>
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

      {/* Launch Readiness Checklist (Interactive & Editable) */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ListTodo size={16} className="text-orange-500" />
            <span>Launch Readiness Checklist</span>
            <span className="text-xs font-mono font-normal text-slate-500">
              ({completedCount}/{totalCount} completed • {progressPct}%)
            </span>
          </h3>

          {/* Mini progress track */}
          <div className="w-full sm:w-48 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
            <div
              className="bg-orange-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          {safeChecklist.map((item, idx) => (
            <div
              key={idx}
              className={`group flex items-center justify-between gap-2.5 p-3 rounded-xl border transition-all ${
                completedItems.has(idx)
                  ? "bg-emerald-50/40 border-emerald-200 text-slate-500 line-through"
                  : "bg-slate-50 hover:bg-white border-slate-100 hover:border-slate-200 text-slate-800"
              }`}
            >
              {editingIdx === idx ? (
                <div className="flex items-center gap-1.5 w-full">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit(idx);
                      if (e.key === "Escape") setEditingIdx(null);
                    }}
                    autoFocus
                    className="flex-1 text-xs px-2 py-1 bg-white rounded-lg border border-orange-300 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(idx)}
                    className="p-1 rounded bg-emerald-50 text-emerald-600 cursor-pointer"
                  >
                    <Check size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingIdx(null)}
                    className="p-1 rounded bg-slate-100 text-slate-500 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <>
                  <label className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={completedItems.has(idx)}
                      onChange={() => toggleComplete(idx)}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                    />
                    <span className="leading-snug break-words">{item}</span>
                  </label>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 ml-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingIdx(idx);
                        setEditText(item);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                      title="Edit milestone"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(idx)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Delete milestone"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Add Milestone Item */}
        {isAdding ? (
          <div className="flex items-center gap-1.5 pt-1">
            <input
              type="text"
              value={newItemText}
              placeholder="e.g. Set up Stripe Billing webhook & production DNS"
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddItem();
                if (e.key === "Escape") {
                  setIsAdding(false);
                  setNewItemText("");
                }
              }}
              autoFocus
              className="flex-1 text-xs px-2.5 py-1.5 bg-white rounded-xl border border-slate-300 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
            />
            <button
              type="button"
              onClick={handleAddItem}
              className="px-2.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewItemText("");
              }}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="w-full py-2 px-3 rounded-xl border border-dashed border-orange-200 text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50/50 hover:bg-orange-100/70 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus size={13} />
            <span>Add Custom Launch Milestone</span>
          </button>
        )}
      </div>
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