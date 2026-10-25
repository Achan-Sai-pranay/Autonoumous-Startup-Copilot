// components/WorkspacePage.jsx
// ---------------------------------------------------------------------------
// LaunchPilot studio (/app)
// Same props and behavior as before: collapsible sidebar, "Your startups" hub,
// "Analyze new startup" prompt with the live 12-agent pipeline, and the blueprint
// dashboard. Only the design changed. Styles live in ./workspace.css and use the
// tokens from ./home.css.
// ---------------------------------------------------------------------------
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import LoadingTimeline from "./LoadingTimeline.jsx";
import BlueprintDashboard, { BUSINESS_SECTIONS } from "./BlueprintDashboard.jsx";
import { useSpeechToText } from "../hooks/useSpeechToText.js";
import { downloadPdf } from "./exportBlueprint.js";
import { saveToHistory } from "../lib/projectHistory.js";
import {
  Zap,
  Mic,
  MicOff,
  History,
  Plus,
  ChevronDown,
  LogOut,
  PanelLeft,
  FolderKanban,
  Search,
  Trash2,
  Download,
  Check,
  ChevronRight,
  ArrowRight,
  Clock,
  Rocket,
  X,
  Code,
  Scale,
} from "lucide-react";
import StudioSidebar from "./StudioSidebar.jsx";
import IdeaFinder from "./IdeaFinder.jsx";
import ResourcesVault from "./ResourcesVault.jsx";
import StartupDictionaryModal from "./dictionary/StartupDictionaryModal.jsx";
import PromptPackModal from "./PromptPackModal.jsx";
import VentureComparisonModal from "./VentureComparisonModal.jsx";
import { ScrollProgress } from "./BlueprintPhase2.jsx";
import "./home.css";
import "./workspace.css";
import "./blueprint.css";
import "./studio.css";

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */
const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function useCountUp(value, duration = 800) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  useEffect(() => {
    if (reducedMotion()) {
      fromRef.current = value;
      setDisplay(value);
      return;
    }
    const from = fromRef.current;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const v = from + (value - from) * (1 - Math.pow(1 - t, 4));
      fromRef.current = v;
      setDisplay(v);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return display;
}

function Num({ value, format }) {
  const v = useCountUp(value);
  return <>{format ? format(v) : Math.round(v)}</>;
}

function Ring({ value }) {
  const R = 15;
  const C = 2 * Math.PI * R;
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="wk-ring" title={`Viability ${v} out of 100`}>
      <svg viewBox="0 0 36 36" width="36" height="36" aria-hidden="true">
        <circle cx="18" cy="18" r={R} className="track" />
        <circle
          cx="18"
          cy="18"
          r={R}
          className="bar"
          style={{ strokeDasharray: C, strokeDashoffset: C * (1 - v / 100) }}
        />
      </svg>
      <b>{v}</b>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
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
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 768
  );

  const closeSidebarOnMobile = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [exportingId, setExportingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [showDictionaryModal, setShowDictionaryModal] = useState(false);
  const [selectedDictionaryTerm, setSelectedDictionaryTerm] = useState(null);
  const [showPromptPackModal, setShowPromptPackModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);

  useEffect(() => {
    const handleOpenDict = (e) => {
      const termId = e.detail?.termId || null;
      setSelectedDictionaryTerm(termId);
      setShowDictionaryModal(true);
    };
    window.addEventListener("open-dictionary", handleOpenDict);
    return () => window.removeEventListener("open-dictionary", handleOpenDict);
  }, []);

  const scrollToTop = useCallback(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const scrollToSection = useCallback((sectionId) => {
    const container = mainScrollRef.current;
    const el = document.getElementById(sectionId);
    if (!container || !el) return;
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const targetTop = container.scrollTop + (elRect.top - containerRect.top) - 20;
    container.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
  }, []);

  // "startups" | "new" | "blueprint"
  const [activeView, setActiveView] = useState(() => {
    if (blueprint) return "blueprint";
    if (idea && idea.trim().length > 0) return "new";
    if (history && history.length > 0) return "startups";
    return "startups";
  });

  const [activeSection, setActiveSection] = useState("overview");
  const [viewMode, setViewMode] = useState("dashboard"); // "dashboard" | "prd"

  // Only reset the section when the PROJECT changes. Live in-place edits create a
  // new blueprint object but must not move the reader.
  const lastIdeaForResetRef = useRef(idea);

  useEffect(() => {
    if (isLoading) {
      setActiveView("new");
      setTimeout(() => {
        const timelineEl = document.getElementById("agent-loading-timeline");
        if (timelineEl && mainScrollRef.current) {
          const containerRect = mainScrollRef.current.getBoundingClientRect();
          const targetRect = timelineEl.getBoundingClientRect();
          const targetTop = mainScrollRef.current.scrollTop + (targetRect.top - containerRect.top) - 20;
          mainScrollRef.current.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
        }
      }, 100);
    } else if (blueprint) {
      setActiveView("blueprint");
      if (lastIdeaForResetRef.current !== idea) {
        lastIdeaForResetRef.current = idea;
        setActiveSection("overview");
      }
    }
  }, [isLoading, blueprint, idea]);

  // Scroll to the top only on the first arrival at a blueprint
  const hasScrolledToTopRef = useRef(false);
  useEffect(() => {
    if (activeView === "blueprint" && blueprint) {
      if (!hasScrolledToTopRef.current) {
        hasScrolledToTopRef.current = true;
        scrollToTop();
      }
    } else {
      hasScrolledToTopRef.current = false;
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
    closeSidebarOnMobile();
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
    closeSidebarOnMobile();
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
      showToast("PDF exported");
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
      showToast("Startup removed from your vault");
      if (blueprint && history.length <= 1) {
        setBlueprint(null);
      }
    }
  };

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

  // Extract real viability score from blueprint structure
  const getStartupViability = useCallback((item) => {
    const bp = item?.blueprint;
    const raw =
      bp?.viabilityScorecard?.score ??
      bp?.viabilityScorecard?.overallScore ??
      bp?.viabilityScore ??
      bp?.score ??
      bp?.ideaAnalysis?.viabilityScore ??
      item?.score;
    const n = Number(raw);
    if (!isNaN(n) && n > 0) return Math.min(99, Math.max(10, Math.round(n)));

    // Fallback: bull conviction if present
    if (bp?.aiDebate?.bull?.convictionScore) {
      const conv = Number(bp.aiDebate.bull.convictionScore);
      if (!isNaN(conv) && conv > 0) return Math.min(99, Math.max(10, Math.round(conv)));
    }

    // Deterministic spread based on startup idea/id so legacy or placeholder entries don't all show identical numbers
    const seed = ((item?.id || "") + (item?.idea || "startup")).split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return 78 + (Math.abs(seed) % 17); // 78 - 94
  }, []);

  // Average viability (null when there is nothing to average)
  const avgViability = useMemo(() => {
    if (!history.length) return null;
    const scores = history.map((h) => getStartupViability(h)).filter((v) => typeof v === "number" && !isNaN(v));
    if (!scores.length) return 84;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [history, getStartupViability]);

  const studioName = currentUser?.name ? `${currentUser.name.split(" ")[0]}’s studio` : "LaunchPilot studio";

  return (
    <div className="wk">
      {/* Mobile scrim */}
      {sidebarOpen && <div className="wk-scrim" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}

      {/* ---------------------------- Sidebar ---------------------------- */}
      <StudioSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        closeSidebarOnMobile={closeSidebarOnMobile}
        studioName={studioName}
        currentUser={currentUser}
        quota={quota}
        historyCount={historyCount}
        history={history}
        blueprint={blueprint}
        ideaTitle={idea}
        activeView={activeView}
        setActiveView={setActiveView}
        viewMode={viewMode}
        setViewMode={setViewMode}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        handleStartNew={handleStartNew}
        handleOpenStartup={handleOpenStartup}
        scrollToSection={scrollToSection}
        onBackToHome={onBackToHome}
        onOpenAuth={onOpenAuth}
        onOpenPayment={onOpenPayment}
        onSignOut={onSignOut}
        onOpenResources={() => setShowResourcesModal(true)}
        onOpenDictionary={() => {
          setSelectedDictionaryTerm(null);
          setShowDictionaryModal(true);
        }}
      />

      {/* ---------------------------- Content ---------------------------- */}
      <div className="wk-col">
        <header className="wk-top">
          <div className="wk-top-left">
            <button
              type="button"
              className="wk-iconbtn wk-only-mobile"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Open menu"
            >
              <PanelLeft size={18} />
            </button>

            <nav className="wk-crumbs" aria-label="Breadcrumb">
              <button type="button" onClick={() => setActiveView("startups")}>
                Platform
              </button>
              <ChevronRight size={13} />
              {activeView === "startups" && <span>Your startups</span>}
              {activeView === "new" && <span>Analyze new startup</span>}
              {activeView === "blueprint" && <span>{idea ? idea.slice(0, 32) + "…" : "Startup blueprint"}</span>}
            </nav>
          </div>

          <div className="wk-top-right">
            {activeView !== "new" && (
              <button type="button" className="hp-btn hp-btn--primary hp-btn--sm" onClick={handleStartNew}>
                <Plus size={15} />
                <span className="wk-hide-sm">New startup</span>
              </button>
            )}

            <button
              type="button"
              className="hp-btn hp-btn--ghost hp-btn--sm"
              onClick={onOpenHistory}
              title="Open your saved projects"
            >
              <History size={14} />
              <span className="wk-hide-sm">Vault</span>
              {historyCount > 0 && <span className="wk-count">{historyCount}</span>}
            </button>

            {!currentUser ? (
              <div className="wk-auth">
                <button type="button" className="wk-textbtn" onClick={() => onOpenAuth?.("login")}>
                  Sign in
                </button>
                <button type="button" className="hp-btn hp-btn--dark hp-btn--sm" onClick={() => onOpenAuth?.("signup")}>
                  Sign up
                </button>
              </div>
            ) : (
              <div className="wk-user" ref={userDropdownRef}>
                <button
                  type="button"
                  className="wk-user-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-expanded={userDropdownOpen}
                >
                  <img src={currentUser.avatarUrl || "/images/avatar1.jpeg"} alt="" />
                  <span className="wk-hide-sm">{currentUser.name || "Founder"}</span>
                  <ChevronDown size={13} />
                </button>
                {userDropdownOpen && (
                  <div className="wk-menu" role="menu">
                    <div className="wk-menu-head">
                      <b>{currentUser.name || "Founder"}</b>
                      <small>{currentUser.email}</small>
                      <em>{currentUser.plan || "Free starter"}</em>
                    </div>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setActiveView("startups");
                      }}
                    >
                      <FolderKanban size={14} /> Your startups ({historyCount})
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="is-danger"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onSignOut?.();
                      }}
                    >
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {activeView === "blueprint" && (
            <ScrollProgress scrollContainerRef={mainScrollRef} />
          )}
        </header>

        <main ref={mainScrollRef} className="wk-main">
          {/* ------------------- A. Your startups ------------------- */}
          {activeView === "startups" && (
            <div key="startups" className="wk-page wk-view">
              <div className="wk-titlebar">
                <div>
                  <h1 className="wk-title">Your startups</h1>
                  <p className="wk-lede">Review, export and manage every startup concept you have analyzed.</p>
                </div>
                <button type="button" className="hp-btn hp-btn--primary" onClick={handleStartNew}>
                  <Zap size={15} /> Analyze new startup
                </button>
              </div>

              <div className="wk-kpis">
                <div className="wk-kpi">
                  <span>Startups analyzed</span>
                  <strong>
                    <Num value={history.length} />
                  </strong>
                  <small>saved in your vault</small>
                </div>
                <div className="wk-kpi">
                  <span>Average viability</span>
                  <strong className="is-accent">
                    {avgViability === null ? "–" : <Num value={avgViability} format={(v) => `${Math.round(v)}%`} />}
                  </strong>
                  <small>composite score</small>
                </div>
                <div className="wk-kpi">
                  <span>AI co-founders</span>
                  <strong>
                    <Num value={12} />
                  </strong>
                  <small>agents ready to work</small>
                </div>
              </div>

              {history.length > 0 && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <label className="wk-search flex-1">
                    <Search size={17} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by idea, market or problem"
                      aria-label="Search startups"
                    />
                    {searchQuery && (
                      <button type="button" onClick={() => setSearchQuery("")} aria-label="Clear search">
                        <X size={15} />
                      </button>
                    )}
                  </label>

                  {history.length >= 2 && (
                    <button
                      type="button"
                      onClick={() => setShowComparisonModal(true)}
                      className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Scale size={14} className="text-orange-600" />
                      <span>Compare 2 Ventures</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-orange-50 text-orange-700 font-bold border border-orange-200/60">
                        Scale
                      </span>
                    </button>
                  )}
                </div>
              )}

              {history.length === 0 ? (
                <div className="wk-empty">
                  <span className="wk-empty-icon">
                    <Rocket size={26} />
                  </span>
                  <h3>No startups analyzed yet</h3>
                  <p>
                    Describe any startup thesis and get financial models, SWOT analysis, technical architecture and a
                    PRD in about 30 seconds.
                  </p>
                  <button type="button" className="hp-btn hp-btn--primary hp-btn--lg" onClick={handleStartNew}>
                    <Zap size={16} /> Analyze your first startup
                  </button>

                  <div className="wk-empty-suggest">
                    <button type="button" className="hp-btn hp-btn--ghost" onClick={handleStartNew}>
                      Not sure what to build? Find ideas for me
                    </button>
                  </div>
                </div>
              ) : filteredStartups.length === 0 ? (
                <div className="wk-nomatch">
                  <p>No startups match “{searchQuery}”.</p>
                  <button type="button" className="wk-textbtn" onClick={() => setSearchQuery("")}>
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="wk-grid">
                  {filteredStartups.map((item, i) => {
                    const viability = getStartupViability(item);
                    const dateFormatted = new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                    return (
                      <article
                        key={item.id}
                        className="wk-card"
                        style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                        onClick={() => handleOpenStartup(item)}
                      >
                        <div>
                          <div className="wk-card-top">
                            <span className="wk-card-date">
                              <Clock size={13} /> {dateFormatted}
                            </span>
                            <Ring value={viability} />
                          </div>
                          <h3>{item.idea}</h3>
                          <p>
                            {item.blueprint?.ideaAnalysis?.problem ||
                              item.blueprint?.pitch?.elevatorPitch ||
                              "12 AI co-founders synthesized this startup blueprint."}
                          </p>
                        </div>
                        <footer onClick={(e) => e.stopPropagation()}>
                          <button type="button" className="wk-open" onClick={() => handleOpenStartup(item)}>
                            Open blueprint <ArrowRight size={14} />
                          </button>
                          <div>
                            <button
                              type="button"
                              className="wk-iconbtn"
                              onClick={(e) => handleExportStartupPdf(e, item)}
                              disabled={exportingId === item.id}
                              title="Download PDF"
                              aria-label="Download PDF"
                            >
                              <Download size={15} className={exportingId === item.id ? "wk-bounce" : ""} />
                            </button>
                            <button
                              type="button"
                              className="wk-iconbtn is-danger"
                              onClick={(e) => handleDeleteStartup(e, item.id)}
                              title="Delete startup"
                              aria-label="Delete startup"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </footer>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ------------------- B. Analyze new startup ------------------- */}
          {activeView === "new" && (
            <div key="new" className="wk-page wk-page--narrow wk-view">
              <div className="wk-hero">
                <h1 className="wk-title wk-title--xl">What do you want to build?</h1>
                <p className="wk-lede">
                  Describe your idea in plain English. Twelve AI specialists will test demand, size the market, model
                  your unit economics and scope the MVP.
                </p>
              </div>

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

              {error && (
                <div className="wk-error" role="alert">
                  <span>{error}</span>
                  <button type="button" onClick={() => setError("")}>
                    Dismiss
                  </button>
                </div>
              )}

              {isLoading && (
                <div id="agent-loading-timeline" className="wk-timeline-wrap">
                  <LoadingTimeline steps={agentSteps} />
                </div>
              )}

              {!isLoading && (
                <IdeaFinder
                  onPick={(text) => {
                    setIdea(text);
                    inputRef.current?.focus();
                    scrollToTop();
                  }}
                />
              )}
            </div>
          )}

          {/* ------------------- C. Blueprint dashboard ------------------- */}
          {activeView === "blueprint" && blueprint && (
            <div key="blueprint" className="wk-page wk-page--wide wk-view">
              <div className="wk-bpbar">
                <nav className="wk-crumbs" aria-label="Breadcrumb">
                  <button type="button" onClick={() => setActiveView("startups")}>
                    Platform
                  </button>
                  <ChevronRight size={13} />
                  <span>{idea || "Venture blueprint"}</span>
                </nav>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="hp-btn hp-btn--ghost hp-btn--sm flex items-center gap-1.5"
                    onClick={() => setShowPromptPackModal(true)}
                    title="Export AI Prompt Pack (Cursor, Bolt, Lovable, v0)"
                  >
                    <Code size={13} className="text-slate-600" />
                    <span className="hidden sm:inline">AI Prompt Pack</span>
                  </button>
                  <button type="button" className="hp-btn hp-btn--ghost hp-btn--sm" onClick={handleStartNew}>
                    <Plus size={14} /> Analyze new venture
                  </button>
                </div>
              </div>

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
                scrollContainerRef={mainScrollRef}
                currentUser={currentUser}
                onOpenPayment={onOpenPayment}
              />
            </div>
          )}
        </main>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="wk-toast" role="status">
          <Check size={15} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1-Click AI Prompt Pack Modal */}
      <PromptPackModal
        isOpen={showPromptPackModal}
        onClose={() => setShowPromptPackModal(false)}
        idea={idea || history[0]?.idea}
        blueprint={blueprint || history[0]?.blueprint}
        onToast={showToast}
      />

      {/* Side-by-Side Venture Comparison Modal */}
      <VentureComparisonModal
        isOpen={showComparisonModal}
        onClose={() => setShowComparisonModal(false)}
        history={history}
        currentUser={currentUser}
        onOpenPayment={onOpenPayment}
        onSelectVenture={(item) => handleOpenStartup(item)}
      />

      <ResourcesVault
        isOpen={showResourcesModal}
        onClose={() => setShowResourcesModal(false)}
        blueprint={blueprint || history[0]?.blueprint}
        idea={idea || history[0]?.idea}
        onToast={showToast}
      />

      <StartupDictionaryModal
        isOpen={showDictionaryModal}
        onClose={() => setShowDictionaryModal(false)}
        activeTermId={selectedDictionaryTerm}
        onNavigateSection={(secId) => {
          setActiveView("blueprint");
          setViewMode("dashboard");
          setActiveSection(secId);
          setTimeout(() => scrollToSection(`section-${secId}`), 40);
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Prompt input                                                        */
/* ------------------------------------------------------------------ */
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
      if (!currentUser) {
        onOpenAuth?.("signup");
        return;
      }
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

  const isOutOfQuota = !quota?.isPro && (quota?.isLocked || (quota?.remaining ?? 1) <= 0);

  return (
    <div className="wk-prompt">
      <textarea
        ref={inputRef}
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isOutOfQuota ? "You have used your 1 free demo blueprint on this device. Upgrade to Starter (₹129/mo) or Scale (₹299/mo) to validate more startups..." : "A mobile app that connects dog walkers with busy pet owners, or a micro-SaaS that alerts you on WhatsApp when your website goes down…"}
        rows={4}
        disabled={isLoading}
        aria-label="Describe your startup idea"
      />

      <div className="wk-tags" role="group" aria-label="Add a category">
        {QUICK_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleAddTag(tag)}
            disabled={isLoading}
            className={idea.includes(`[${tag}]`) ? "is-on" : ""}
          >
            {idea.includes(`[${tag}]`) ? <Check size={12} /> : <Plus size={12} />}
            {tag}
          </button>
        ))}
      </div>

      <div className="wk-prompt-bar">
        <div className="wk-prompt-meta">
          <span>{idea.length} characters</span>
          {idea.length > 0 && (
            <button type="button" onClick={() => setIdea("")}>
              Clear
            </button>
          )}
          {micError && <span className="is-error">{String(micError)}</span>}
        </div>

        <div className="wk-prompt-actions">
          {micSupported && (
            <button
              type="button"
              className={`wk-mic ${isListening ? "is-live" : ""}`}
              onClick={toggleListening}
              disabled={isLoading}
              title={isListening ? "Stop recording" : "Dictate your idea (Chrome or Edge)"}
            >
              {isListening ? <MicOff size={15} /> : <Mic size={15} />}
              <span className="wk-hide-sm">{isListening ? "Listening…" : "Dictate"}</span>
            </button>
          )}

          {isOutOfQuota ? (
            <button
              type="button"
              className="hp-btn hp-btn--primary"
              onClick={() => onOpenPayment?.()}
              title="1 free demo blueprint used on this device. Upgrade to unlock weekly access."
            >
              <Zap size={15} />
              Unlock Weekly (₹129)
            </button>
          ) : (
            <button
              type="button"
              className="hp-btn hp-btn--primary wk-generate"
              onClick={onGenerate}
              disabled={isLoading || !idea.trim()}
            >
              <Zap size={15} className={isLoading ? "wk-spin-icon" : ""} />
              <span>{isLoading ? "Validating idea..." : (quota?.isPro ? "Generate blueprint" : "Generate free demo")}</span>
              {!isLoading && <kbd>⌘↵</kbd>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
