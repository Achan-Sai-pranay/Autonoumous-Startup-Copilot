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
  Zap,
  Bot,
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
import AiDebateWarRoomSection from "./BlueprintPhase3.jsx";
import {
  SectionGatewayHeader,
  ViabilitySpotlight,
  ActionDeck,
  StoryTrio,
  ScrollProgress,
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
} from "./BlueprintPhase5.jsx";
import { VentureHero, AiDebateSummaryCard } from "./BlueprintPhase1.jsx";


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
                <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 ml-1">
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

// ---------------------------------------------------------------------------
// Blueprint Completion Celebration Hero at end of all 7 sections
// ---------------------------------------------------------------------------
function BlueprintCompletionHero({ onExportPdf, onExportMarkdown, onScrollToTop }) {
  return (
    <div className="mt-12 p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white text-center shadow-xl border border-slate-800 relative overflow-hidden animate-section-in">
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 max-w-xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
          <Sparkles size={13} /> Complete 7-Stage Analysis
        </span>
        <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          You've Reviewed Your Entire Startup Thesis!
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          All 12 autonomous AI specialists have stress-tested your viability, ICPs, SWOT, MVP build scope, unit economics, and go-to-market engine.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onExportPdf}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition-all cursor-pointer active:scale-95"
          >
            <FileDown size={15} />
            <span>Export Executive PDF</span>
          </button>
          <button
            type="button"
            onClick={onExportMarkdown}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all cursor-pointer active:scale-95"
          >
            <FileText size={15} />
            <span>Download Markdown</span>
          </button>
          <button
            type="button"
            onClick={onScrollToTop}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs sm:text-sm transition-all cursor-pointer"
          >
            <span>Back to Top ↑</span>
          </button>
        </div>
      </div>
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
  scrollContainerRef,
}) {
  const [internalActiveSection, setInternalActiveSection] = useState("overview");
  const activeSection =
    controlledActiveSection !== undefined ? controlledActiveSection : internalActiveSection;
  const setActiveSection = setControlledActiveSection || setInternalActiveSection;

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

  // Real-time focal reading-line scroll synchronization across 7 blueprint stages
  useEffect(() => {
    if (displayMode !== "continuous" || typeof window === "undefined") return;

    const container = scrollContainerRef?.current || null;
    let rafId = null;

    const checkActiveSection = () => {
      // Guard: don't update activeSection during programmatic scrolls
      if (isProgrammaticScrollRef.current) return;

      const sectionElements = Array.from(
        document.querySelectorAll("section.blueprint-section[data-section-id]")
      );
      if (sectionElements.length === 0) return;

      const containerEl = scrollContainerRef?.current;
      const containerRect = containerEl
        ? containerEl.getBoundingClientRect()
        : { top: 0, height: window.innerHeight };

      // Check if user is scrolled near the bottom of container (activate last stage)
      if (
        containerEl &&
        containerEl.scrollHeight - containerEl.scrollTop - containerEl.clientHeight < 80
      ) {
        const lastSec = sectionElements[sectionElements.length - 1]?.getAttribute("data-section-id");
        if (lastSec && lastSec !== activeSectionRef.current) {
          activeSectionRef.current = lastSec;
          setActiveSection(lastSec);
        }
        return;
      }

      // Reading focal line: 120px below top of container viewport
      const readingLine = containerRect.top + 120;

      let foundSec = null;
      for (const el of sectionElements) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= readingLine && rect.bottom > readingLine) {
          foundSec = el.getAttribute("data-section-id");
          break;
        }
      }

      // If above first section or at top
      if (!foundSec && sectionElements[0]) {
        const firstRect = sectionElements[0].getBoundingClientRect();
        if (firstRect.top > readingLine) {
          foundSec = sectionElements[0].getAttribute("data-section-id");
        }
      }

      // Fallback: pick section closest to reading line
      if (!foundSec && sectionElements.length > 0) {
        let closestSec = null;
        let minDistance = Infinity;
        sectionElements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const dist = Math.abs(rect.top - readingLine);
          if (dist < minDistance) {
            minDistance = dist;
            closestSec = el.getAttribute("data-section-id");
          }
        });
        foundSec = closestSec;
      }

      if (foundSec && foundSec !== activeSectionRef.current) {
        activeSectionRef.current = foundSec;
        setActiveSection(foundSec);
      }
    };

    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(checkActiveSection);
    };

    const target = container || window;
    target.addEventListener("scroll", handleScroll, { passive: true });

    // Initial check after elements render
    const timer = setTimeout(checkActiveSection, 100);

    return () => {
      target.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(timer);
    };
  }, [displayMode, scrollContainerRef, setActiveSection]);


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
    <div className="w-full max-w-7xl mx-auto mt-8 px-4 pb-24 animate-fade-in text-slate-900">
      <ScrollProgress scrollContainerRef={scrollContainerRef} />
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
            {/* Top Venture Banner Card (Phase 1 VentureHero) */}
            <VentureHero
              title={ventureTitle}
              industry={industryDomain}
              description={ventureDescription}
              isEditing={isEditingTitle}
              editedTitle={editedTitle}
              setEditedTitle={setEditedTitle}
              onStartEdit={handleStartEditTitle}
              onSave={handleSaveTitle}
              onCancel={handleCancelEditTitle}
              inputRef={titleInputRef}
            />

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
                      blueprint={blueprint}
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
                  <BlueprintCompletionHero
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
                        blueprint={blueprint}
                      />
                    )}

                    {activeSection === "product-mvp" && (
                      <ProductMvpSection
                        productPlan={productPlan}
                        technicalArchitecture={technicalArchitecture}
                        roadmap={roadmap}
                        onUpdateMvpFeatures={(val) => updateSectionField("productPlan", "mvpFeatures", val)}
                        onUpdateFutureFeatures={(val) => updateSectionField("productPlan", "futureFeatures", val)}
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
      className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:text-orange-600 hover:border-orange-300 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-2xs cursor-pointer"
    >
      {busy ? <Loader2 size={13} className="animate-spin text-orange-500" /> : <Icon size={13} />}
      <span className="whitespace-nowrap">{busy ? "Synthesizing…" : label}</span>
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

  const estimatedMonthlyCost = toSafeString(costEstimator?.estimatedMonthlyCost, "$20 - $50 / month");
  const estimatedRevenue = toSafeString(
    revenueSimulator?.year1Revenue || revenueSimulator?.estimatedYear1Revenue,
    "$50,000 - $120,000 / year"
  );

  return (
    <div className="space-y-7 animate-fade-in text-slate-900">
            {/* 1. Executive Viability Spotlight Header (Phase 2) */}
      <ViabilitySpotlight
        isActive={isActive}
        ventureTitle={toSafeString(ventureTitle, "Startup Blueprint")}
        domain={toSafeString(ideaAnalysis?.domain, "Digital Venture")}
        pitch={toSafeString(pitch?.elevatorPitch || originalIdea, "A clear, focused solution designed to solve real user problems fast.")}
        score={score}
        verdict={verdict}
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

      {/* 5. Venture Viability & 3 Pillars Breakdown */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck size={18} className="text-orange-500" />
              <span>Startup Viability & Survival Analysis</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Independent scoring based on market demand, ease of building, and monetization potential.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Ruling:</span>
            <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-orange-50 text-orange-700 border border-orange-200">
              {score}/100 • {verdict}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pillar 1: Market Demand */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-slate-800 font-bold flex items-center gap-1.5">
                <TrendingUp size={14} className="text-orange-500" />
                1. Market Demand
              </span>
              <span className="font-bold font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {marketDemandScore}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-orange-500 rounded-full transition-all"
                style={{ width: `${marketDemandScore}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Measures whether real target users have an urgent, everyday need for this solution.
            </p>
          </div>

          {/* Pillar 2: Technical Feasibility */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-slate-800 font-bold flex items-center gap-1.5">
                <Cpu size={14} className="text-orange-500" />
                2. Ease of Building
              </span>
              <span className="font-bold font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {technicalFeasibilityScore}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-orange-500 rounded-full transition-all"
                style={{ width: `${technicalFeasibilityScore}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Measures how fast and straightforward it is to build and deploy version 1 without unnecessary complexity.
            </p>
          </div>

          {/* Pillar 3: Monetization Engine */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-slate-800 font-bold flex items-center gap-1.5">
                <DollarSign size={14} className="text-amber-500" />
                3. Profit & Monetization
              </span>
              <span className="font-bold font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {monetizationScore}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{ width: `${monetizationScore}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Measures whether customers will readily pay enough to cover costs and generate sustainable profit.
            </p>
          </div>
        </div>

        {/* Verdict Reasoning & Traps */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-orange-50/40 p-4 rounded-2xl border border-orange-100">
            <span className="text-[10px] font-mono uppercase text-orange-800 font-bold block mb-1">
              Executive Investment Thesis:
            </span>
            <p className="text-xs text-slate-800 leading-relaxed font-medium">
              {verdictReasoning}
            </p>
          </div>

          <div className="bg-rose-50/40 p-4 rounded-2xl border border-rose-100">
            <span className="text-[10px] font-mono uppercase text-rose-700 font-bold block mb-1">
              Top Risks to Avoid:
            </span>
            <div className="space-y-1.5 text-xs text-rose-900 font-medium">
              {safeRiskTraps.map((risk, idx) => (
                <div key={idx} className="flex items-start gap-1.5 leading-snug">
                  <span className="text-rose-500 mt-0.5">•</span>
                  <span>{risk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 6. Visual Charts: Viability Gauge + Market Sizing Bubbles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SafeChartWrapper fallbackTitle="Viability Gauge">
          <VenturusViabilityGaugeChart viabilityScorecard={viabilityScorecard} ideaTitle={ventureTitle} />
        </SafeChartWrapper>
        <SafeChartWrapper fallbackTitle="Market Sizing Bubbles">
          <VenturusMarketSizeBubbleChart marketSizing={marketSizing} ideaTitle={ventureTitle} />
        </SafeChartWrapper>
      </div>

      {/* 7. 4-Week Milestone Execution Roadmap */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <Clock size={15} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                4-Week Founder Execution Roadmap
              </h3>
              <p className="text-xs text-slate-500">
                Disciplined weekly shipping sprint from initial customer interviews to first launch.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate("product-mvp")}
            className="text-xs font-mono text-orange-600 font-bold hover:underline cursor-pointer"
          >
            View full roadmap →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {milestonesList.map((m, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200 inline-block mb-2">
                  {m.week}
                </span>
                <h4 className="text-xs font-bold text-slate-900 mb-1.5">
                  {m.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {m.task}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Financial Runway & Economics Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-center">
          <span className="text-xs font-mono uppercase text-slate-400 block mb-1">
            Monthly Operating Cost
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 my-1">
            {estimatedMonthlyCost}
          </div>
          <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Lean Operations
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-center">
          <span className="text-xs font-mono uppercase text-slate-400 block mb-1">
            Estimated Year 1 Revenue
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-orange-600 my-1">
            {estimatedRevenue}
          </div>
          <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-orange-50 text-orange-700 border border-orange-200">
            High Growth Potential
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-center">
          <span className="text-xs font-mono uppercase text-slate-400 block mb-1">
            Monetization Model
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 my-1 truncate">
            {monetizationModel}
          </div>
          <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Proven Business Model
          </span>
        </div>
      </div>

      {/* 9. Business Analysis Navigation Jump-Pad */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Explore Detailed Business Analysis Agents
            </h3>
            <p className="text-xs text-slate-500">
              Deep dive into every dimension of this startup with specialized AI agents.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {BUSINESS_SECTIONS.filter((s) => s.id !== "overview").map((sec) => (
            <button
              key={sec.id}
              onClick={() => onNavigate(sec.id)}
              className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-orange-200 border border-slate-200/70 transition-all text-left group cursor-pointer flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 group-hover:text-orange-600 block">
                  {sec.title}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block font-mono">
                  View breakdown →
                </span>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-orange-500 transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>
      </div>
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
    const level = toSafeString(obj?.level || obj?.intensity || obj?.rating, "Moderate");
    const analysis = toSafeString(obj?.analysis || obj?.explanation || obj?.description, fallbackAnalysis);
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
    "Low dependence on any single provider because standard cloud tools and modern APIs can easily be swapped if pricing changes."
  );
  const competitiveRivalry = resolvePorterForce(
    "competitiveRivalry",
    ["rivalry", "competition", "industryRivalry"],
    "Existing competitors focus mostly on broad, generic features, leaving room for a tool that solves this specific task better and faster."
  );
  const threatOfSubstitutes = resolvePorterForce(
    "threatOfSubstitutes",
    ["threatOfSubstitution", "substitutes", "substitutionThreat"],
    "Current workarounds (like manual spreadsheets or disjointed tools) are slow, error-prone, and frustrating for users."
  );
  const threatOfNewEntry = resolvePorterForce(
    "threatOfNewEntry",
    ["threatOfNewEntrants", "newEntrants", "entryBarriers"],
    "New competitors can enter quickly, but staying close to users, building brand loyalty, and keeping the product delightfully simple provides lasting defensibility."
  );

  // Competitor vulnerability matrix items with intelligent fallback synthesis if backend omitted it
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
        weaknesses: "Clunky interface, slow customer support, and expensive pricing plans.",
        missedOpportunities: "Overlooked simple self-serve onboarding and affordable pricing for everyday users.",
        suggestedDifferentiation: `Deliver a fast, intuitive solution that gets the job done in seconds at a fraction of ${name}'s cost.`,
      };
    });
  }, [competitorWeaknessAnalysis, competitorsList]);

  // Market opportunities with fallback
  const marketOpps = useMemo(() => {
    return toSafeArray(marketResearch?.opportunities, [
      "Strong demand for tools that save time and eliminate tedious manual tasks.",
      "Users want focused, straightforward tools instead of complex all-in-one software.",
      "People are willing to pay for tools that make their lives or work noticeably easier.",
    ]);
  }, [marketResearch?.opportunities]);

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
          <ChannelList channels={platformsList} />
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
