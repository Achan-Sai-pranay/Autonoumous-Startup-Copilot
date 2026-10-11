// StudioSidebar.jsx
// ---------------------------------------------------------------------------
// Drop-in replacement for the whole <aside className="wk-side"> block in
// WorkspacePage.jsx. Keeps the same container classes (wk-side, wk-side-head,
// wk-brand, wk-iconbtn) from workspace.css, everything inside is new (ss-*
// classes in studio.css).
// ---------------------------------------------------------------------------
import { useEffect, useRef, useState } from "react";
import {
  Rocket,
  Plus,
  FolderKanban,
  LayoutGrid,
  FileText,
  MessageSquare,
  BookOpen,
  PanelLeft,
  PanelLeftClose,
  X,
  ChevronUp,
  Settings,
  HelpCircle,
  Home,
  LogOut,
  Zap,
  Sparkles,
} from "lucide-react";
import { BUSINESS_SECTIONS } from "./BlueprintDashboard.jsx";
import "./studio.css";

function Item({ icon: Icon, label, count, active, open, onClick, title }) {
  return (
    <button
      type="button"
      className={`ss-item ${active ? "is-active" : ""}`}
      onClick={onClick}
      title={title || label}
      aria-current={active ? "page" : undefined}
    >
      <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
      {open && (
        <>
          <span>{label}</span>
          {count !== undefined && <em>{count}</em>}
        </>
      )}
    </button>
  );
}

export default function StudioSidebar({
  sidebarOpen,
  setSidebarOpen,
  closeSidebarOnMobile,
  studioName,
  currentUser,
  quota,
  historyCount,
  history = [],
  blueprint,
  ideaTitle,
  activeView,
  setActiveView,
  viewMode,
  setViewMode,
  activeSection,
  setActiveSection,
  handleStartNew,
  handleOpenStartup,
  scrollToSection,
  onBackToHome,
  onOpenAuth,
  onOpenPayment,
  onSignOut,
  onOpenResources,
  onOpenSettings, // optional: menu item only shows when provided
  helpUrl, // optional: menu item only shows when provided
}) {
  const open = sidebarOpen;
  const hasVenture = Boolean(blueprint) || history.length > 0;
  const inReport = activeView === "blueprint" && viewMode === "dashboard";
  const activeIdx = inReport
    ? Math.max(0, BUSINESS_SECTIONS.findIndex((s) => s.id === (activeSection === "dashboard" ? "overview" : activeSection)))
    : -1;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    if (!menuOpen) return;
    const away = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false);
    const esc = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [menuOpen]);

  const openVentureIfNeeded = () => {
    if (!blueprint && history.length > 0) handleOpenStartup(history[0]);
  };

  const goSection = (id) => {
    closeSidebarOnMobile();
    openVentureIfNeeded();
    setActiveView("blueprint");
    setActiveSection(id);
    setViewMode("dashboard");
    setTimeout(() => scrollToSection(`section-${id}`), 40);
  };

  const toggleBrief = () => {
    closeSidebarOnMobile();
    openVentureIfNeeded();
    setActiveView("blueprint");
    setViewMode(viewMode === "prd" ? "dashboard" : "prd");
  };

  const qTotal = quota?.total ?? (quota?.isPro ? 100 : 3);
  const qLeft = quota?.remaining ?? qTotal;
  const qUsed = quota?.isUnlimited ? 0 : Math.min(100, Math.round(((qTotal - qLeft) / qTotal) * 100));
  const shortTitle = ideaTitle ? (ideaTitle.length > 30 ? `${ideaTitle.slice(0, 30)}…` : ideaTitle) : "Current venture";

  return (
    <aside className={`wk-side ${open ? "is-open" : ""}`} aria-label="Studio navigation">
      {/* Head */}
      <div className="wk-side-head">
        <button
          type="button"
          className="wk-brand"
          onClick={() => {
            closeSidebarOnMobile();
            setActiveView("startups");
          }}
          title="Your ventures"
        >
          <span className="wk-mark">
            <Rocket size={16} />
          </span>
          {open && (
            <span className="wk-brand-text wk-label">
              <b>{studioName}</b>
              <small>{currentUser ? (currentUser.plan || (quota?.isPro ? "Pro founder" : "Free · 3 a week")) : "3 free ideas/wk with account"}</small>
            </span>
          )}
        </button>
        <button
          type="button"
          className="wk-iconbtn wk-only-desktop"
          onClick={() => setSidebarOpen(!open)}
          title={open ? "Collapse sidebar" : "Expand sidebar"}
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        >
          {open ? <PanelLeftClose size={17} /> : <PanelLeft size={17} />}
        </button>
        <button type="button" className="wk-iconbtn wk-only-mobile" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
          <X size={18} />
        </button>
      </div>

      <div className="ss-scroll">
        {/* Primary action */}
        <button
          type="button"
          className={`hp-btn hp-btn--primary ss-new ${open ? "" : "is-rail"}`}
          onClick={handleStartNew}
          title="New venture"
        >
          <Plus size={17} />
          {open && "New venture"}
        </button>

        {/* Workspace */}
        <nav className="ss-group" aria-label="Workspace">
          {open && <p className="ss-label">Workspace</p>}
          <Item
            icon={FolderKanban}
            label="Your ventures"
            count={historyCount}
            open={open}
            active={activeView === "startups"}
            onClick={() => {
              closeSidebarOnMobile();
              setActiveView("startups");
            }}
          />
        </nav>

        {/* Report outline */}
        {hasVenture && (
          <nav className="ss-group" aria-label="Report">
            {open && (
              <p className="ss-label">
                <span>{shortTitle}</span>
                {blueprint && <i className="ss-live">Live</i>}
              </p>
            )}

            {open ? (
              <ol className="ss-outline">
                {BUSINESS_SECTIONS.map((s, i) => (
                  <li key={s.id} className={i === activeIdx ? "is-active" : i < activeIdx ? "is-past" : ""}>
                    <button type="button" onClick={() => goSection(s.id)} aria-current={i === activeIdx ? "step" : undefined}>
                      <i />
                      <span>{s.label}</span>
                      <em>{s.numeral}</em>
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <Item icon={LayoutGrid} label="Report" open={false} active={inReport} onClick={() => goSection(BUSINESS_SECTIONS[0].id)} />
            )}

            <Item icon={FileText} label="Product brief" title="Product requirements document" open={open} active={activeView === "blueprint" && viewMode === "prd"} onClick={toggleBrief} />
          </nav>
        )}

        {/* Help from the product */}
        <nav className="ss-group" aria-label="Assistance">
          {open && <p className="ss-label">Assistance</p>}
          {hasVenture && (
            <Item
              icon={MessageSquare}
              label="Co-Founder"
              title="Ask the AI co-founder"
              open={open}
              onClick={() => {
                closeSidebarOnMobile();
                window.dispatchEvent(new CustomEvent("open-cofounder-chat"));
              }}
            />
          )}
          <Item
            icon={BookOpen}
            label="Resources"
            title="Founder resources and knowledge vault"
            open={open}
            onClick={() => {
              closeSidebarOnMobile();
              onOpenResources();
            }}
          />
        </nav>
      </div>

      {/* Usage */}
      {open && (
        <div className="ss-plan">
          {currentUser ? (
            <>
              <div>
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
              <i aria-hidden="true">
                <u style={{ width: `${qUsed}%` }} />
              </i>
              {!quota?.isPro && (
                <button type="button" className="hp-btn hp-btn--primary hp-btn--sm" onClick={onOpenPayment}>
                  <Zap size={13} /> Upgrade to Pro
                </button>
              )}
            </>
          ) : (
            <>
              <div>
                <b>Free Starter</b>
                <span>3 ideas / week</span>
              </div>
              <p style={{ margin: "2px 0 6px 0", fontSize: "11px", color: "var(--hp-text-muted, #64748b)", lineHeight: 1.3 }}>
                Sign in to activate your 3 free weekly blueprints.
              </p>
              <button type="button" className="hp-btn hp-btn--primary hp-btn--sm" onClick={() => onOpenAuth?.("signup")}>
                <Zap size={13} /> Create free account
              </button>
            </>
          )}
        </div>
      )}

      {/* Account */}
      <div className="ss-foot" ref={menuRef}>
        {menuOpen && currentUser && (
          <div className="ss-menu" role="menu">
            {onOpenSettings && (
              <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); onOpenSettings(); }}>
                <Settings size={15} /> Settings
              </button>
            )}
            {helpUrl && (
              <a role="menuitem" href={helpUrl} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}>
                <HelpCircle size={15} /> Help and feedback
              </a>
            )}
            <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); onBackToHome(); }}>
              <Home size={15} /> Back to website
            </button>
            <button type="button" role="menuitem" className="is-danger" onClick={() => { setMenuOpen(false); onSignOut?.(); }}>
              <LogOut size={15} /> Sign out
            </button>
          </div>
        )}

        {currentUser ? (
          <button type="button" className="ss-me" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen} aria-haspopup="menu" title={currentUser.name}>
            <img src={currentUser.avatarUrl || "/images/avatar1.jpeg"} alt="" />
            {open && (
              <>
                <span>
                  <b>{currentUser.name || "Founder"}</b>
                  <small>{currentUser.email}</small>
                </span>
                <ChevronUp size={16} className={menuOpen ? "is-open" : ""} />
              </>
            )}
          </button>
        ) : (
          <button type="button" className="hp-btn hp-btn--ghost hp-btn--sm wk-block" onClick={() => onOpenAuth?.("login")}>
            {open ? "Sign in" : <LogOut size={14} style={{ transform: "scaleX(-1)" }} />}
          </button>
        )}
      </div>
    </aside>
  );
}
