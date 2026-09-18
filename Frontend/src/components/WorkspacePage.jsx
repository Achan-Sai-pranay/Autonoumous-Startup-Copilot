// components/WorkspacePage.jsx
// ---------------------------------------------------------------------------
// VenturusAI-Identical Post-Login Studio Platform for LaunchPilot AI
// Features:
// 1. Collapsible Left Sidebar (Your Ventures, Analyze New, Business Analysis, Tools, User Footer)
// 2. 'Your Ventures' Hub with user-isolated venture cards, KPIs, and search
// 3. 'Analyze New Venture' Prompt Studio with live 12-agent streaming pipeline
// 4. Interactive Synthesized Blueprint Dashboard with SWOT, Viability, and PDF Export
// ---------------------------------------------------------------------------
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import LoadingTimeline from "./LoadingTimeline.jsx";
import BlueprintDashboard, { BUSINESS_SECTIONS } from "./BlueprintDashboard.jsx";
import { useSpeechToText } from "../hooks/useSpeechToText.js";
import { downloadPdf } from "./exportBlueprint.js";
import { saveToHistory } from "../lib/projectHistory.js";
import {
  ArrowLeft,
  Zap,
  Mic,
  MicOff,
  Sparkles,
  History,
  RotateCcw,
  PlusCircle,
  FileText,
  CheckCircle2,
  ChevronDown,
  User,
  LogOut,
  PanelLeft,
  PanelLeftClose,
  FolderKanban,
  LayoutDashboard,
  Search,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Layers,
  Download,
  Check,
  Lightbulb,
  TrendingUp,
  ListChecks,
  Landmark,
  Rocket,
  ChevronRight,
  Clock,
  Briefcase,
  SlidersHorizontal,
  LayoutGrid,
  MessageSquare,
  BookOpen,
  Settings,
  HelpCircle,
  Home,
  Crosshair,
} from "lucide-react";

const SUGGESTIONS = [
  {
    label: "B2B AI Contract Auditor",
    text: "An AI-powered B2B platform that audits enterprise vendor contracts, flags compliance risks, and benchmarks pricing automatically.",
    category: "LegalTech / SaaS",
  },
  {
    label: "Sub-ms Vector Cache",
    text: "A high-performance in-memory semantic cache for LLMs that cuts OpenAI/Anthropic API costs by 70% with sub-millisecond p99 latency.",
    category: "Developer Infra",
  },
  {
    label: "Micro-Fulfillment Logistics OS",
    text: "An autonomous operating system for dark stores and quick-commerce warehouses featuring dynamic inventory slotting and predictive restock.",
    category: "Supply Chain",
  },
  {
    label: "Rural Health Triage EHR",
    text: "An offline-first voice-driven EHR and triage copilot designed for rural clinics with automated ICD-10 coding and SMS patient follow-ups.",
    category: "Digital Health",
  },
];

export default function WorkspacePage({
  idea,
  setIdea,
  onGenerate,
  isLoading,
  blueprint,
  setBlueprint,
  agentSteps,
  error,
  setError,
  onBackToHome,
  onOpenHistory,
  history = [],
  historyCount = 0,
  onLoadProject,
  onDeleteProject,
  currentUser,
  onOpenAuth,
  onSignOut,
  quota,
  onOpenPayment,
}) {
  const inputRef = useRef(null);
  const mainScrollRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [exportingId, setExportingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);

  // Scroll to the very top (Startup Brief header banner)
  const scrollToTop = useCallback(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  // Active view inside the platform:
  // "startups" (Your Startups hub) | "new" (Analyze new startup prompt) | "blueprint" (Viewing current blueprint)
  const [activeView, setActiveView] = useState(() => {
    if (blueprint) return "blueprint";
    if (idea && idea.trim().length > 0) return "new";
    if (history && history.length > 0) return "startups";
    return "startups";
  });

  // Business Analysis navigation & viewMode for Blueprint
  const [activeSection, setActiveSection] = useState("overview");
  const [viewMode, setViewMode] = useState("dashboard"); // "dashboard" | "prd"
  const [isBusinessOpen, setIsBusinessOpen] = useState(true);

  // Keep view updated if user generates a new blueprint or starts loading
  useEffect(() => {
    if (isLoading) {
      setActiveView("new");
    } else if (blueprint) {
      setActiveView("blueprint");
      setActiveSection("overview");
      scrollToTop();
    }
  }, [isLoading, blueprint, scrollToTop]);

  // Ensure scroll container is always reset to the top when navigating to a blueprint
  useEffect(() => {
    if (activeView === "blueprint") {
      scrollToTop();
      const t1 = setTimeout(scrollToTop, 20);
      const t2 = setTimeout(scrollToTop, 100);
      const t3 = setTimeout(scrollToTop, 300);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [activeView, blueprint, scrollToTop]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleStartNew = () => {
    setBlueprint(null);
    setActiveView("new");
    setActiveSection("overview");
    setError("");
    scrollToTop();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleOpenStartup = (entry) => {
    if (onLoadProject) {
      onLoadProject(entry);
    } else {
      setIdea(entry.idea);
      setBlueprint(entry.blueprint);
    }
    setActiveView("blueprint");
    setActiveSection("overview");
    setViewMode("dashboard");
    scrollToTop();
    showToast(`Loaded "${entry.idea.slice(0, 30)}..."`);
  };

  const handleExportStartupPdf = async (e, entry) => {
    e.stopPropagation();
    setExportingId(entry.id);
    try {
      await downloadPdf(entry.blueprint, entry.idea);
      showToast("PDF exported successfully");
    } catch (err) {
      console.error(err);
      showToast("PDF export failed");
    } finally {
      setExportingId(null);
    }
  };

  const handleDeleteStartup = (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this startup blueprint?")) {
      onDeleteProject?.(id);
      showToast("Startup removed from vault");
      if (blueprint && history.length <= 1) {
        setBlueprint(null);
      }
    }
  };

  // Filtered startups for current user
  const filteredStartups = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase();
    return history.filter(
      (v) =>
        v.idea.toLowerCase().includes(q) ||
        v.blueprint?.ideaAnalysis?.problem?.toLowerCase().includes(q) ||
        v.blueprint?.ideaAnalysis?.goal?.toLowerCase().includes(q)
    );
  }, [history, searchQuery]);

  // Average viability score
  const avgViability = useMemo(() => {
    if (!history.length) return "N/A";
    const scores = history
      .map((h) => h.blueprint?.ideaAnalysis?.viabilityScore || 88)
      .filter(Boolean);
    if (!scores.length) return "88%";
    const sum = scores.reduce((a, b) => a + Number(b), 0);
    return `${Math.round(sum / scores.length)}%`;
  }, [history]);

  return (
    <div className="h-screen w-full bg-slate-50 text-slate-900 flex font-sans selection:bg-orange-500 selection:text-white antialiased overflow-hidden">
      {/* ------------------------------------------------------------------- */}
      {/* 1. COLLAPSIBLE FROZEN SIDEBAR                                       */}
      {/* ------------------------------------------------------------------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-64" : "w-16"
        } md:static md:translate-x-0 h-full shrink-0`}
      >
        {/* Workspace Brand Header */}
        <div className="h-14 border-b border-slate-100 flex items-center justify-between px-3.5">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-black text-xs shadow-xs shrink-0 animate-idea-pulse">
              IP
            </div>
            {sidebarOpen && (
              <div className="flex flex-col truncate">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 truncate">
                  {currentUser?.name ? `${currentUser.name.split(" ")[0]}'s Studio` : "IdeaPulse Studio"}
                </span>
                <span className="text-[10px] font-mono text-orange-600 font-semibold truncate">
                  {currentUser?.plan || "Community Free (3/wk)"}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors hidden md:inline-flex"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-2.5 space-y-5 scrollbar-thin">
          {/* Section 1: Platform */}
          <div>
            {sidebarOpen && (
              <p className="px-2 mb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Platform
              </p>
            )}
            <nav className="space-y-1">
              <button
                onClick={() => setActiveView("startups")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeView === "startups"
                    ? "bg-orange-50 text-orange-600 border border-orange-200 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
                }`}
                title="Your ventures"
              >
                <FolderKanban size={16} className={activeView === "startups" ? "text-orange-600" : "text-slate-400"} />
                {sidebarOpen && (
                  <span className="flex-1 text-left flex items-center justify-between">
                    <span>Your ventures</span>
                    <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                      {historyCount}
                    </span>
                  </span>
                )}
              </button>

              <button
                onClick={handleStartNew}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeView === "new"
                    ? "bg-orange-50 text-orange-600 border border-orange-200 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
                }`}
                title="Analyze new venture"
              >
                <PlusCircle size={16} className={activeView === "new" ? "text-orange-600" : "text-slate-400"} />
                {sidebarOpen && <span>Analyze new venture</span>}
              </button>

              <button
                onClick={onBackToHome}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent transition-all cursor-pointer"
                title="Back to Website"
              >
                <Home size={16} className="text-slate-400" />
                {sidebarOpen && <span>Website Homepage</span>}
              </button>
            </nav>
          </div>

          {/* Section 2: Venture (Active Startup Analysis & Sections) */}
          {(blueprint || (history && history.length > 0)) && (
            <div>
              {sidebarOpen && (
                <div className="px-2 mb-1.5 flex items-center justify-between">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Venture
                  </p>
                  {blueprint && (
                    <span className="text-[9px] font-mono bg-orange-100 text-orange-700 px-1.5 py-0.2 rounded font-bold">
                      Live
                    </span>
                  )}
                </div>
              )}
              <nav className="space-y-1">
                {/* Dashboard Overview */}
                <button
                  onClick={() => {
                    if (!blueprint && history.length > 0) {
                      handleOpenStartup(history[0]);
                    }
                    setActiveView("blueprint");
                    setActiveSection("dashboard");
                    setViewMode("dashboard");
                    scrollToTop();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeView === "blueprint" && viewMode === "dashboard" && activeSection === "dashboard"
                      ? "bg-slate-100 text-slate-900 font-bold border border-slate-200/80 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
                  }`}
                  title="Dashboard"
                >
                  <LayoutGrid
                    size={16}
                    className={
                      activeView === "blueprint" && viewMode === "dashboard" && activeSection === "dashboard"
                        ? "text-slate-900"
                        : "text-slate-400"
                    }
                  />
                  {sidebarOpen && <span className="truncate">Dashboard</span>}
                </button>

                {/* Business Analysis Expandable Section with Vertical Ash Line */}
                <div>
                  <button
                    onClick={() => {
                      if (!sidebarOpen) setSidebarOpen(true);
                      setIsBusinessOpen(!isBusinessOpen);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeView === "blueprint" && viewMode === "dashboard" && activeSection !== "dashboard"
                        ? "text-slate-900 bg-slate-50"
                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                    title="Business analysis"
                  >
                    <div className="flex items-center gap-2.5">
                      <Briefcase size={16} className="text-slate-400" />
                      {sidebarOpen && <span>Business analysis</span>}
                    </div>
                    {sidebarOpen && (
                      <ChevronDown
                        size={14}
                        className={`text-slate-400 transition-transform duration-200 ${
                          isBusinessOpen ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>

                  {/* Indented Sub-sections with the SLIGHT ASH VERTICAL LINE */}
                  {sidebarOpen && isBusinessOpen && (
                    <div className="border-l-2 border-slate-200 ml-4 pl-3.5 space-y-1 my-1.5 animate-fade-in">
                      {BUSINESS_SECTIONS.map((sec) => {
                        const isActive =
                          activeView === "blueprint" &&
                          viewMode === "dashboard" &&
                          activeSection === sec.id;
                        return (
                          <button
                            key={sec.id}
                            onClick={() => {
                              if (!blueprint && history.length > 0) {
                                handleOpenStartup(history[0]);
                              }
                              setActiveView("blueprint");
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
                  title="Ask the AI"
                >
                  <MessageSquare size={16} className="text-slate-400 group-hover:text-orange-500" />
                  {sidebarOpen && <span>Ask the AI</span>}
                </button>

                {/* Pitch deck */}
                <button
                  onClick={() => {
                    if (!blueprint && history.length > 0) {
                      handleOpenStartup(history[0]);
                    }
                    setActiveView("blueprint");
                    setViewMode(viewMode === "prd" ? "dashboard" : "prd");
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    activeView === "blueprint" && viewMode === "prd"
                      ? "bg-slate-100 text-slate-900 font-bold border border-slate-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                  title="Pitch deck"
                >
                  <FileText
                    size={16}
                    className={
                      activeView === "blueprint" && viewMode === "prd"
                        ? "text-slate-900"
                        : "text-slate-400"
                    }
                  />
                  {sidebarOpen && <span>Pitch deck</span>}
                </button>

                {/* Resources */}
                <button
                  onClick={async () => {
                    const targetBlueprint = blueprint || history[0]?.blueprint;
                    const targetIdea = idea || history[0]?.idea;
                    if (targetBlueprint) {
                      setExportingId("current");
                      try {
                        await downloadPdf(targetBlueprint, targetIdea);
                        showToast("Executive PDF exported successfully");
                      } catch (e) {
                        showToast("PDF export failed");
                      } finally {
                        setExportingId(null);
                      }
                    } else {
                      showToast("Select or analyze a venture first");
                    }
                  }}
                  disabled={exportingId === "current"}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Resources"
                >
                  <BookOpen size={16} className="text-slate-400" />
                  {sidebarOpen && (
                    <span>{exportingId === "current" ? "Exporting PDF..." : "Resources"}</span>
                  )}
                </button>
              </nav>
            </div>
          )}

          {/* Section 3: Honest Plan Status Card */}
          {sidebarOpen && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-900">
                <span className="flex items-center gap-1.5">
                  {quota?.isPro ? (
                    <span className="text-orange-600 flex items-center gap-1">
                      <Sparkles size={12} /> Pro Founder
                    </span>
                  ) : (
                    <span>Free Plan</span>
                  )}
                </span>
                <span className="text-[10px] font-mono text-orange-700 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded font-bold">
                  {quota?.remaining ?? (quota?.isPro ? 10 : 3)}/{quota?.total ?? (quota?.isPro ? 10 : 3)} Left
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span>Weekly Limit:</span>
                  <span className="font-bold text-slate-700 font-mono">
                    {quota?.remaining ?? 3} of {quota?.total ?? 3}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(
                          (((quota?.total || 3) - (quota?.remaining ?? 3)) / (quota?.total || 3)) * 100
                        )
                      )}%`,
                    }}
                  />
                </div>
                {!quota?.isPro && (
                  <button
                    type="button"
                    onClick={onOpenPayment}
                    className="w-full mt-1.5 py-1.5 px-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-[10px] transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Zap size={11} />
                    <span>Upgrade to Pro (₹149)</span>
                  </button>
                )}
                <div className="flex justify-between pt-1 text-[10px] text-slate-400">
                  <span>Saved in Vault:</span>
                  <span className="font-mono">{historyCount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Tools */}
          <div>
            {sidebarOpen && (
              <p className="px-2 mb-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Tools
              </p>
            )}
            <nav className="space-y-1">
              <button
                onClick={onOpenHistory}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
                title="Vault Archive"
              >
                <History size={16} className="text-slate-400" />
                {sidebarOpen && <span>Vault Archive</span>}
              </button>
              {sidebarOpen && (
                <>
                  <button
                    onClick={() => {
                      if (history.length > 0) handleOpenStartup(history[0]);
                      else showToast("No example ventures loaded yet");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Sparkles size={14} className="text-slate-400" />
                    <span>Example ventures</span>
                  </button>
                  <button
                    onClick={() => showToast("Settings are configured for Founder mode")}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Settings size={14} className="text-slate-400" />
                      <span>Settings</span>
                    </div>
                    <span className="text-slate-400 text-[10px]">›</span>
                  </button>
                  <button
                    onClick={() => showToast("Need assistance? Join our founder Discord.")}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <HelpCircle size={14} className="text-slate-400" />
                    <span>Help</span>
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer User Profile Card */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          {currentUser ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 truncate">
                <img
                  src={currentUser.avatarUrl || "/images/avatar1.jpeg"}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full border border-orange-200 object-cover shrink-0"
                />
                {sidebarOpen && (
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {currentUser.name || "Founder"}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
                  </div>
                )}
              </div>
              {sidebarOpen && (
                <button
                  onClick={onSignOut}
                  className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                  title="Sign Out"
                >
                  <LogOut size={14} />
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onOpenAuth?.("login")}
                className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-700 hover:text-orange-600 border border-slate-200 bg-white transition-all cursor-pointer"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ------------------------------------------------------------------- */}
      {/* 2. MAIN PLATFORM CONTENT AREA                                       */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <header className="shrink-0 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs z-30">
          {/* Left: Sidebar Toggle + Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <PanelLeft size={18} />
            </button>

            <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <button
                onClick={() => setActiveView("startups")}
                className="hover:text-slate-900 transition-colors"
              >
                Platform
              </button>
              <ChevronRight size={12} className="text-slate-300" />
              {activeView === "startups" && (
                <span className="font-semibold text-slate-900">Your Startups</span>
              )}
              {activeView === "new" && (
                <span className="font-semibold text-slate-900">Analyze New Startup</span>
              )}
              {activeView === "blueprint" && (
                <span className="font-semibold text-slate-900 truncate max-w-[160px] sm:max-w-xs">
                  {idea ? idea.slice(0, 32) + "…" : "Startup Blueprint"}
                </span>
              )}
            </nav>
          </div>

          {/* Right: Quick actions + User menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {activeView !== "new" && (
              <button
                onClick={handleStartNew}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <PlusCircle size={14} />
                <span className="hidden sm:inline">New Startup</span>
              </button>
            )}

            <button
              onClick={onOpenHistory}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-orange-300 hover:text-orange-600 transition-all cursor-pointer shadow-2xs"
              title="Open saved projects vault"
            >
              <History size={14} className="text-slate-500" />
              <span className="hidden sm:inline">Vault</span>
              {historyCount > 0 && (
                <span className="ml-0.5 text-[10px] font-mono bg-orange-600 text-white rounded-full px-1.5 py-0.2 leading-none font-bold">
                  {historyCount}
                </span>
              )}
            </button>

            {!currentUser ? (
              <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2">
                <button
                  onClick={() => onOpenAuth?.("login")}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-orange-600 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth?.("signup")}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 transition-all"
                >
                  Sign Up
                </button>
              </div>
            ) : (
              <div className="relative border-l border-slate-200 pl-2" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-orange-300 transition-all cursor-pointer shadow-2xs"
                >
                  <img
                    src={currentUser.avatarUrl || "/images/avatar1.jpeg"}
                    alt={currentUser.name || "User"}
                    className="w-5 h-5 rounded-full border border-orange-200 object-cover"
                  />
                  <span className="text-xs font-semibold text-slate-800 max-w-[80px] truncate hidden sm:inline">
                    {currentUser.name || "Founder"}
                  </span>
                  <ChevronDown size={12} className="text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-toast-in">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {currentUser.name || "Founder"}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-mono text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded font-semibold">
                        {currentUser.plan || "Free Starter"}
                      </span>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setActiveView("startups");
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-orange-50 hover:text-orange-700 flex items-center gap-2 cursor-pointer"
                      >
                        <FolderKanban size={13} />
                        <span>Your Startups ({historyCount})</span>
                      </button>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onSignOut?.();
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut size={13} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* ------------------------------------------------------------------- */}
        {/* 3. PLATFORM VIEW SWITCHER                                           */}
        {/* ------------------------------------------------------------------- */}
        <main ref={mainScrollRef} className="flex-1 overflow-y-auto p-4 sm:p-8">
          {/* VIEW A: "YOUR STARTUPS" DASHBOARD */}
          {activeView === "startups" && (
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
              {/* Header & Metric Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Your Startups
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Manage, review, and export all startup concepts analyzed for this account.
                  </p>
                </div>

                <button
                  onClick={handleStartNew}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer active:scale-95 self-start sm:self-auto"
                >
                  <Zap size={15} />
                  <span>Analyze New Startup</span>
                </button>
              </div>

              {/* KPI Stats Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Startups Analyzed
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">
                      {history.length}
                    </span>
                    <span className="text-xs text-slate-500">saved in vault</span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Avg. Viability Index
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl sm:text-3xl font-black text-orange-600">
                      {avgViability}
                    </span>
                    <span className="text-xs text-slate-500">composite score</span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Autonomous Co-Founders
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-600">12</span>
                    <span className="text-xs text-slate-500">AI agents ready</span>
                  </div>
                </div>
              </div>

              {/* Search & Filter Bar */}
              {history.length > 0 && (
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search startups by idea, market, or problem statement…"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-2xs"
                  />
                </div>
              )}

              {/* Empty State when User has 0 Startups */}
              {history.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-14 text-center max-w-2xl mx-auto shadow-sm">
                  <div className="h-16 w-16 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center mx-auto mb-4">
                    <Rocket size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    No startups analyzed yet in this account
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                    Your personal vault is ready. Describe any startup thesis to generate financial models,
                    SWOT analysis, technical architecture, and PRDs in under 30 seconds.
                  </p>
                  <button
                    onClick={handleStartNew}
                    className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-500/25 transition-all cursor-pointer active:scale-95"
                  >
                    <Zap size={16} />
                    <span>Analyze Your First Startup</span>
                  </button>

                  {/* Quick Starter Suggestions */}
                  <div className="mt-10 pt-8 border-t border-slate-100 text-left">
                    <p className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-orange-600" />
                      <span>Or pick a high-impact thesis to test:</span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {SUGGESTIONS.slice(0, 4).map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setIdea(s.text);
                            setActiveView("new");
                          }}
                          className="p-3 rounded-xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50/50 text-left transition-all cursor-pointer group"
                        >
                          <span className="text-xs font-bold text-slate-900 group-hover:text-orange-700 block">
                            {s.label}
                          </span>
                          <span className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                            {s.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Grid of Saved Startups */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredStartups.map((item) => {
                    const viability = item.blueprint?.ideaAnalysis?.viabilityScore || 89;
                    const dateFormatted = new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleOpenStartup(item)}
                        className="group bg-white rounded-2xl border border-slate-200/90 hover:border-orange-400 hover:shadow-lg transition-all duration-200 p-5 flex flex-col justify-between cursor-pointer shadow-xs"
                      >
                        <div>
                          {/* Top Card Meta */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500">
                              <Clock size={12} />
                              <span>{dateFormatted}</span>
                            </span>

                            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700">
                              <ShieldCheck size={12} />
                              <span>{viability}/100</span>
                            </span>
                          </div>

                          {/* Startup Idea Title */}
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-2 group-hover:text-orange-600 transition-colors leading-snug">
                            {item.idea}
                          </h4>

                          {/* Problem / Solution Excerpt */}
                          <p className="text-xs text-slate-500 line-clamp-3 mt-2 leading-relaxed">
                            {item.blueprint?.ideaAnalysis?.problem ||
                              item.blueprint?.pitch?.elevatorPitch ||
                              "12 autonomous AI co-founders synthesized this startup blueprint."}
                          </p>
                        </div>

                        {/* Card Bottom Actions */}
                        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => handleOpenStartup(item)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
                          >
                            <span>Open Blueprint</span>
                            <ChevronRight size={13} />
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => handleExportStartupPdf(e, item)}
                              disabled={exportingId === item.id}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Download PDF"
                            >
                              <Download size={14} className={exportingId === item.id ? "animate-bounce text-orange-600" : ""} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteStartup(e, item.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete startup"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VIEW B: "ANALYZE NEW STARTUP" (Prompt Deck & 12 Co-Founders Studio) */}
          {activeView === "new" && (
            <div className="max-w-3xl mx-auto flex flex-col items-center animate-fade-in">
              <div className="text-center mb-6 w-full">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-orange-50 text-orange-600 border border-orange-200 mb-2">
                  <Sparkles size={13} />
                  Analyze New Startup
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  What do you want to build?
                </h1>
                <p className="text-xs sm:text-base text-slate-500 mt-2 max-w-xl mx-auto leading-relaxed">
                  Type your idea in plain English. 12 autonomous AI specialists will test market demand,
                  calculate bottom-up TAM, model unit economics, and scope your MVP build plan.
                </p>
              </div>

              {/* Prompt Input Deck */}
              <div className="w-full">
                <WorkspaceInput
                  idea={idea}
                  setIdea={setIdea}
                  onGenerate={onGenerate}
                  isLoading={isLoading}
                  inputRef={inputRef}
                  currentUser={currentUser}
                  onOpenAuth={onOpenAuth}
                  quota={quota}
                  onOpenPayment={onOpenPayment}
                />

                {/* Error Banner */}
                {error && (
                  <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between">
                    <span>{error}</span>
                    <button
                      onClick={() => setError("")}
                      className="text-red-500 hover:text-red-800 font-bold ml-2"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Live Timeline Streaming Animation */}
                {isLoading && (
                  <div className="mt-8 w-full bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm animate-fade-in">
                    <LoadingTimeline steps={agentSteps} />
                  </div>
                )}

                {/* Suggestion Cards */}
                {!isLoading && (
                  <div className="mt-8">
                    <p className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-orange-600" />
                      <span>Inspiration & Starter Concepts</span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {SUGGESTIONS.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => setIdea(s.text)}
                          className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-orange-300 hover:bg-orange-50/40 text-left transition-all cursor-pointer shadow-2xs group"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-orange-600">
                              {s.label}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-medium">
                              {s.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {s.text}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW C: FULL BLUEPRINT DASHBOARD (Active Analyzed Venture) */}
          {activeView === "blueprint" && blueprint && (
            <div className="w-full max-w-7xl mx-auto animate-fade-in">
              {/* Clean Breadcrumb Bar Matching Screenshot */}
              <div className="mb-4 flex items-center justify-between bg-white px-5 py-2.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium truncate">
                  <button
                    onClick={() => setActiveView("startups")}
                    className="hover:text-orange-600 transition-colors font-semibold cursor-pointer"
                  >
                    Platform
                  </button>
                  <ChevronRight size={13} className="text-slate-400 shrink-0" />
                  <span className="text-slate-900 font-semibold truncate max-w-lg">
                    {idea || "Venture Blueprint"}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleStartNew}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-all cursor-pointer"
                  >
                    <PlusCircle size={13} />
                    <span>Analyze New Venture</span>
                  </button>
                </div>
              </div>

              {/* Dashboard with synchronized section, viewMode & live card editing */}
              <BlueprintDashboard
                blueprint={blueprint}
                setBlueprint={(updater) => {
                  setBlueprint((prev) => {
                    const next = typeof updater === "function" ? updater(prev) : updater;
                    if (idea && next) {
                      saveToHistory(idea, next, currentUser?.id);
                    }
                    return next;
                  });
                }}
                originalIdea={idea}
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />
            </div>
          )}
        </main>
      </div>

      {/* Success Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-toast-in">
          <div className="flex items-center gap-2.5 bg-slate-900 text-white text-xs px-4 py-3 rounded-2xl shadow-xl border border-slate-800">
            <Check size={14} className="text-orange-400" />
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Internal Workspace IdeaInput ---
function WorkspaceInput({
  idea,
  setIdea,
  onGenerate,
  isLoading,
  inputRef,
  currentUser,
  onOpenAuth,
  quota,
  onOpenPayment,
}) {
  const {
    isSupported: micSupported,
    isListening,
    error: micError,
    toggleListening,
  } = useSpeechToText({
    onResult: (transcript) => {
      setIdea((prev) => (prev.trim() ? `${prev.trim()} ${transcript}` : transcript));
    },
  });

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !isLoading) {
      e.preventDefault();
      onGenerate();
    }
  };

  const QUICK_TAGS = [
    "B2B SaaS",
    "Consumer Mobile",
    "AI Tool",
    "Marketplace",
    "HealthTech",
    "FinTech",
    "DevTool",
    "Local Service",
  ];

  const handleAddTag = (tag) => {
    setIdea((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return `[${tag}] `;
      if (trimmed.includes(`[${tag}]`)) return trimmed;
      return `${trimmed} [${tag}]`;
    });
    inputRef.current?.focus();
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-slate-200 shadow-xl shadow-orange-500/5 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/15 transition-all">
      <div className="relative">
        <textarea
          ref={inputRef}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What startup or problem do you want to build? (e.g. 'A mobile app to connect dog walkers with busy pet owners' or 'A micro-SaaS that monitors website downtime and alerts via WhatsApp')"
          rows={4}
          disabled={isLoading}
          className="w-full resize-none bg-transparent px-3.5 pt-2 pb-3 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none disabled:opacity-50 font-sans leading-relaxed"
        />

        {/* Quick Tag Pills */}
        <div className="flex flex-wrap items-center gap-1.5 px-3.5 pb-3">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold mr-1">
            Category Tags:
          </span>
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleAddTag(tag)}
              disabled={isLoading}
              className={`text-[11px] font-medium px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                idea.includes(`[${tag}]`)
                  ? "bg-orange-100 border-orange-300 text-orange-800 font-semibold"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:border-orange-300 hover:bg-orange-50/50"
              }`}
            >
              +{tag}
            </button>
          ))}
        </div>

        {/* Bottom Deck Actions */}
        <div className="flex items-center justify-between px-2 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>{idea.length} chars</span>
            {idea.length > 0 && (
              <button
                type="button"
                onClick={() => setIdea("")}
                className="hover:text-slate-700 ml-1 cursor-pointer font-sans"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {micSupported && (
              <button
                type="button"
                onClick={toggleListening}
                disabled={isLoading}
                title={isListening ? "Stop recording" : "Dictate your idea (Chrome/Edge)"}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isListening
                    ? "bg-red-50 text-red-600 border border-red-200 animate-pulse"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                <span className="hidden sm:inline text-[11px]">
                  {isListening ? "Listening..." : "Dictate"}
                </span>
              </button>
            )}

            {(quota?.remaining ?? 3) <= 0 ? (
              <button
                type="button"
                onClick={() => {
                  if (!currentUser) {
                    onOpenAuth?.("signup");
                  } else {
                    onOpenPayment?.();
                  }
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-500/20 transition-all cursor-pointer active:scale-95"
              >
                <Zap size={15} />
                <span>{currentUser ? "Upgrade to Pro (10 Ideas)" : "Sign Up for 3 Free Ideas"}</span>
              </button>
            ) : (
              <button
                onClick={onGenerate}
                disabled={isLoading || !idea.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-orange-600 hover:bg-orange-700 text-white disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-md shadow-orange-500/20 transition-all cursor-pointer active:scale-95"
              >
                <Zap size={15} className={isLoading ? "animate-spin" : ""} />
                <span>{isLoading ? "Synthesizing…" : "Generate Blueprint"}</span>
                <span className="hidden sm:inline-flex px-1.5 py-0.2 rounded bg-orange-700/60 text-[10px] font-mono text-orange-100">
                  ⌘↵
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
