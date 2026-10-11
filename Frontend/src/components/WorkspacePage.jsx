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
  Sparkles,
  History,
  Plus,
  FileText,
  ChevronDown,
  LogOut,
  PanelLeft,
  PanelLeftClose,
  FolderKanban,
  Search,
  Trash2,
  Download,
  Check,
  ChevronRight,
  ArrowRight,
  Clock,
  Briefcase,
  LayoutGrid,
  MessageSquare,
  BookOpen,
  Settings,
  HelpCircle,
  Home,
  Rocket,
  X,
} from "lucide-react";
import ResourcesModal from "./ResourcesModal.jsx";
import { ScrollProgress } from "./BlueprintPhase2.jsx";
import "./home.css";
import "./workspace.css";

const SUGGESTIONS = [
  {
    label: "B2B AI contract auditor",
    text: "An AI-powered B2B platform that audits enterprise vendor contracts, flags compliance risks, and benchmarks pricing automatically.",
    category: "LegalTech / SaaS",
  },
  {
    label: "Sub-ms vector cache",
    text: "A high-performance in-memory semantic cache for LLMs that cuts OpenAI/Anthropic API costs by 70% with sub-millisecond p99 latency.",
    category: "Developer infra",
  },
  {
    label: "Micro-fulfillment logistics OS",
    text: "An autonomous operating system for dark stores and quick-commerce warehouses featuring dynamic inventory slotting and predictive restock.",
    category: "Supply chain",
  },
  {
    label: "Rural health triage EHR",
    text: "An offline-first voice-driven EHR and triage copilot designed for rural clinics with automated ICD-10 coding and SMS patient follow-ups.",
    category: "Digital health",
  },
];

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

function NavItem({ icon: Icon, label, onClick, active, open, count, title, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title || label}
      className={`wk-item ${active ? "is-active" : ""} ${className}`}
    >
      <Icon size={17} strokeWidth={active ? 2.2 : 1.9} />
      {open && (
        <span className="wk-label">
          <span>{label}</span>
          {count !== undefined && <em>{count}</em>}
        </span>
      )}
    </button>
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
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);

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
  const [isBusinessOpen, setIsBusinessOpen] = useState(true);

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

  // Average viability (null when there is nothing to average)
  const avgViability = useMemo(() => {
    if (!history.length) return null;
    const scores = history
      .map((h) => h.blueprint?.ideaAnalysis?.viabilityScore || 88)
      .filter(Boolean);
    if (!scores.length) return 88;
    return Math.round(scores.reduce((a, b) => a + Number(b), 0) / scores.length);
  }, [history]);

  // Quota numbers for the plan card
  const qTotal = quota?.total ?? (quota?.isPro ? 100 : 3);
  const qLeft = quota?.remaining ?? qTotal;
  const qUsedPct = quota?.isUnlimited ? 0 : Math.min(100, Math.round(((qTotal - qLeft) / qTotal) * 100));

  const studioName = currentUser?.name ? `${currentUser.name.split(" ")[0]}’s studio` : "LaunchPilot studio";
  const overviewActive =
    activeView === "blueprint" &&
    viewMode === "dashboard" &&
    (activeSection === "overview" || activeSection === "dashboard");
  const businessActive =
    activeView === "blueprint" &&
    viewMode === "dashboard" &&
    activeSection !== "overview" &&
    activeSection !== "dashboard";

  return (
    <div className="wk">
      {/* Mobile scrim */}
      {sidebarOpen && <div className="wk-scrim" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}

      {/* ---------------------------- Sidebar ---------------------------- */}
      <aside className={`wk-side ${sidebarOpen ? "is-open" : ""}`} aria-label="Studio navigation">
        <div className="wk-side-head">
          <button
            type="button"
            className="wk-brand"
            onClick={() => {
              closeSidebarOnMobile();
              onBackToHome();
            }}
            title="Back to LaunchPilot home"
          >
            <span className="wk-mark">
              <Rocket size={16} />
            </span>
            {sidebarOpen && (
              <span className="wk-brand-text wk-label">
                <b>{studioName}</b>
                <small>{currentUser?.plan || "Free · 3 a week"}</small>
              </span>
            )}
          </button>
          <button
            type="button"
            className="wk-iconbtn wk-only-desktop"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? <PanelLeftClose size={17} /> : <PanelLeft size={17} />}
          </button>
          <button
            type="button"
            className="wk-iconbtn wk-only-mobile"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="wk-side-scroll">
          <nav className="wk-group" aria-label="Platform">
            {sidebarOpen && <p className="wk-group-label">Platform</p>}
            <NavItem
              icon={FolderKanban}
              label="Your ventures"
              count={historyCount}
              open={sidebarOpen}
              active={activeView === "startups"}
              onClick={() => {
                setActiveView("startups");
                closeSidebarOnMobile();
              }}
            />
            <NavItem
              icon={Plus}
              label="Analyze new venture"
              open={sidebarOpen}
              active={activeView === "new"}
              onClick={handleStartNew}
            />
          </nav>

          {(blueprint || (history && history.length > 0)) && (
            <nav className="wk-group" aria-label="Venture">
              {sidebarOpen && (
                <p className="wk-group-label">
                  Venture {blueprint && <span className="wk-live">Live</span>}
                </p>
              )}

              <NavItem
                icon={LayoutGrid}
                label="Executive overview"
                open={sidebarOpen}
                active={overviewActive}
                onClick={() => {
                  closeSidebarOnMobile();
                  if (!blueprint && history.length > 0) {
                    handleOpenStartup(history[0]);
                  }
                  setActiveView("blueprint");
                  setActiveSection("overview");
                  setViewMode("dashboard");
                  setTimeout(() => {
                    const el = document.getElementById("section-overview");
                    if (el) {
                      scrollToSection("section-overview");
                    } else {
                      scrollToTop();
                    }
                  }, 40);
                }}
              />

              {/* Business analysis (expandable) */}
              <button
                type="button"
                className={`wk-item ${businessActive ? "is-active" : ""}`}
                title="Business analysis"
                aria-expanded={isBusinessOpen}
                onClick={() => {
                  if (!sidebarOpen) setSidebarOpen(true);
                  setIsBusinessOpen(!isBusinessOpen);
                }}
              >
                <Briefcase size={17} strokeWidth={businessActive ? 2.2 : 1.9} />
                {sidebarOpen && (
                  <span className="wk-label">
                    <span>Business analysis</span>
                    <ChevronDown size={15} className={`wk-chev ${isBusinessOpen ? "is-open" : ""}`} />
                  </span>
                )}
              </button>

              {sidebarOpen && (
                <div className={`wk-sub ${isBusinessOpen ? "is-open" : ""}`}>
                  <div>
                    <ul className="wk-sub-list">
                      {BUSINESS_SECTIONS.map((sec) => {
                        const isActive =
                          activeView === "blueprint" && viewMode === "dashboard" && activeSection === sec.id;
                        return (
                          <li key={sec.id}>
                            <button
                              type="button"
                              className={`wk-sub-item ${isActive ? "is-active" : ""}`}
                              tabIndex={isBusinessOpen ? 0 : -1}
                              onClick={() => {
                                closeSidebarOnMobile();
                                if (!blueprint && history.length > 0) {
                                  handleOpenStartup(history[0]);
                                }
                                setActiveView("blueprint");
                                setActiveSection(sec.id);
                                setViewMode("dashboard");
                                setTimeout(() => {
                                  scrollToSection(`section-${sec.id}`);
                                }, 40);
                              }}
                            >
                              <span>{sec.label}</span>
                              <em>{sec.numeral}</em>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}

              <NavItem
                icon={MessageSquare}
                label="Ask the AI"
                open={sidebarOpen}
                onClick={() => {
                  closeSidebarOnMobile();
                  window.dispatchEvent(new CustomEvent("open-cofounder-chat"));
                }}
              />
              <NavItem
                icon={FileText}
                label="Pitch deck"
                open={sidebarOpen}
                active={activeView === "blueprint" && viewMode === "prd"}
                onClick={() => {
                  closeSidebarOnMobile();
                  if (!blueprint && history.length > 0) {
                    handleOpenStartup(history[0]);
                  }
                  setActiveView("blueprint");
                  setViewMode(viewMode === "prd" ? "dashboard" : "prd");
                }}
              />
              <NavItem
                icon={BookOpen}
                label="Resources"
                title="Founder resources and knowledge vault"
                open={sidebarOpen}
                onClick={() => {
                  closeSidebarOnMobile();
                  setShowResourcesModal(true);
                }}
              />
            </nav>
          )}

          {/* Plan card */}
          {sidebarOpen && (
            <div className="wk-plan">
              <div className="wk-plan-top">
                <b>
                  {quota?.isPro ? (
                    <>
                      <Sparkles size={13} /> Pro founder
                    </>
                  ) : (
                    "Free plan"
                  )}
                </b>
                <span>{quota?.isUnlimited ? "Unlimited" : `${qLeft} of ${qTotal} left`}</span>
              </div>
              <div className="wk-meter" aria-hidden="true">
                <i style={{ width: `${qUsedPct}%` }} />
              </div>
              <p>
                {quota?.isUnlimited ? "Founder Pass active." : "Resets every week."} {historyCount} saved in your vault.
              </p>
              {!quota?.isPro && (
                <button type="button" className="hp-btn hp-btn--primary hp-btn--sm" onClick={onOpenPayment}>
                  <Zap size={13} /> Upgrade to Pro
                </button>
              )}
            </div>
          )}

          <nav className="wk-group" aria-label="Tools">
            {sidebarOpen && <p className="wk-group-label">Tools</p>}
            <NavItem icon={History} label="Vault archive" open={sidebarOpen} onClick={onOpenHistory} />
            {sidebarOpen && (
              <>
                <NavItem
                  icon={Sparkles}
                  label="Example ventures"
                  open
                  onClick={() => {
                    if (history.length > 0) handleOpenStartup(history[0]);
                    else showToast("No example ventures loaded yet");
                  }}
                />
                <NavItem
                  icon={Settings}
                  label="Settings"
                  open
                  onClick={() => showToast("Settings are configured for Founder mode")}
                />
                <NavItem
                  icon={HelpCircle}
                  label="Help"
                  open
                  onClick={() => showToast("Need assistance? Join our founder Discord.")}
                />
                <NavItem
                  icon={Home}
                  label="Back to website"
                  title="Return to the marketing homepage"
                  open
                  onClick={onBackToHome}
                />
              </>
            )}
          </nav>
        </div>

        {/* Sidebar footer */}
        <div className="wk-side-foot">
          {currentUser ? (
            <div className="wk-me">
              <img src={currentUser.avatarUrl || "/images/avatar1.jpeg"} alt="" />
              {sidebarOpen && (
                <>
                  <div className="wk-label">
                    <b>{currentUser.name || "Founder"}</b>
                    <small>{currentUser.email}</small>
                  </div>
                  <button type="button" className="wk-iconbtn is-danger" onClick={onSignOut} title="Sign out" aria-label="Sign out">
                    <LogOut size={16} />
                  </button>
                </>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="hp-btn hp-btn--ghost hp-btn--sm wk-block"
              onClick={() => onOpenAuth?.("login")}
            >
              {sidebarOpen ? "Sign in" : <LogOut size={14} style={{ transform: "scaleX(-1)" }} />}
            </button>
          )}
        </div>
      </aside>

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
                <label className="wk-search">
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
                    <p>Or start from an example</p>
                    <div>
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s.label}
                          type="button"
                          onClick={() => {
                            setIdea(s.text);
                            setActiveView("new");
                          }}
                        >
                          <b>{s.label}</b>
                          <span>{s.text}</span>
                        </button>
                      ))}
                    </div>
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
                    const viability = item.blueprint?.ideaAnalysis?.viabilityScore || 89;
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
                <section className="wk-suggest" aria-label="Starter ideas">
                  <p>Need a starting point?</p>
                  <div>
                    {SUGGESTIONS.map((s) => (
                      <button key={s.label} type="button" onClick={() => setIdea(s.text)}>
                        <span className="wk-suggest-top">
                          <b>{s.label}</b>
                          <em>{s.category}</em>
                        </span>
                        <span className="wk-suggest-text">{s.text}</span>
                      </button>
                    ))}
                  </div>
                </section>
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
                <button type="button" className="hp-btn hp-btn--ghost hp-btn--sm" onClick={handleStartNew}>
                  <Plus size={14} /> Analyze new venture
                </button>
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

      <ResourcesModal
        isOpen={showResourcesModal}
        onClose={() => setShowResourcesModal(false)}
        blueprint={blueprint || history[0]?.blueprint}
        idea={idea || history[0]?.idea}
        onToast={showToast}
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

  const outOfQuota = !quota?.isPro && (quota?.remaining ?? 3) <= 0;

  return (
    <div className="wk-prompt">
      <textarea
        ref={inputRef}
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="A mobile app that connects dog walkers with busy pet owners, or a micro-SaaS that alerts you on WhatsApp when your website goes down…"
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

          {outOfQuota ? (
            <button
              type="button"
              className="hp-btn hp-btn--primary"
              onClick={() => (!currentUser ? onOpenAuth?.("signup") : onOpenPayment?.())}
            >
              <Zap size={15} />
              {currentUser ? "Upgrade to Pro" : "Sign up for 3 free ideas"}
            </button>
          ) : (
            <button
              type="button"
              className="hp-btn hp-btn--primary wk-generate"
              onClick={onGenerate}
              disabled={isLoading || !idea.trim()}
            >
              <Zap size={15} className={isLoading ? "wk-spin-icon" : ""} />
              {isLoading ? "Synthesizing…" : "Generate blueprint"}
              {!isLoading && <kbd>⌘↵</kbd>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
