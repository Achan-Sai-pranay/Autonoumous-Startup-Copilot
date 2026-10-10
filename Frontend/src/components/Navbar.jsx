// components/Navbar.jsx
// Drop-in replacement for the Navbar function that lives in App.jsx.
// Same props. Styles are in ./home.css.
import { useEffect, useRef, useState } from "react";
import { History, LogOut, ChevronDown, Menu, X, Zap, Rocket } from "lucide-react";
import "./home.css";

const BRAND = "LaunchPilot";

const LINKS = [
  { id: "demo", label: "Demo" },
  { id: "vc-debate", label: "VC debate", badge: "New" },
  { id: "pipeline", label: "How it works" },
  { id: "features", label: "Features" },
  { id: "compare", label: "Compare" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
];

export default function Navbar({
  onOpenHistory,
  historyCount,
  currentUser,
  onOpenAuth,
  onSignOut,
  onStartClick,
  onNavigateHome,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const userRef = useRef(null);

  // Frosted edge once the page scrolls
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the link for the section in view
  useEffect(() => {
    const els = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean);
    if (!els.length || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onDown = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    const onResize = () => window.innerWidth >= 960 && setMenuOpen(false);
    const onKey = (e) => {
      if (e.key === "Escape") {
        setUserOpen(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <header className={`hp hp-nav ${scrolled ? "is-scrolled" : ""}`}>
      <div className="hp-nav-bar">
        <button
          type="button"
          className="hp-brand"
          onClick={() => {
            setMenuOpen(false);
            onNavigateHome?.();
          }}
        >
          <span className="hp-brand-mark">
            <Rocket size={15} />
          </span>
          {BRAND}
        </button>

        <nav className="hp-nav-links" aria-label="Sections">
          {LINKS.map((l) => (
            <a key={l.id} href={`#${l.id}`} className={active === l.id ? "is-active" : ""}>
              {l.label}
              {l.badge && <em>{l.badge}</em>}
            </a>
          ))}
        </nav>

        <div className="hp-nav-actions">
          {currentUser ? (
            <div className="hp-user" ref={userRef}>
              <button
                type="button"
                className="hp-user-btn"
                onClick={() => setUserOpen((v) => !v)}
                aria-expanded={userOpen}
              >
                <img src={currentUser.avatarUrl || "/images/avatar1.jpeg"} alt="" />
                <span>{currentUser.name}</span>
                <ChevronDown size={13} />
              </button>
              {userOpen && (
                <div className="hp-menu" role="menu">
                  <div className="hp-menu-head">
                    <b>{currentUser.name}</b>
                    <small>{currentUser.email}</small>
                    <em>{currentUser.plan || "Free · 3 a week"}</em>
                  </div>
                  <button
                    role="menuitem"
                    onClick={() => {
                      setUserOpen(false);
                      onStartClick();
                    }}
                  >
                    <Zap size={14} /> Launch Studio
                  </button>
                  <button
                    role="menuitem"
                    onClick={() => {
                      setUserOpen(false);
                      onOpenHistory();
                    }}
                  >
                    <History size={14} /> My blueprints ({historyCount})
                  </button>
                  <button
                    role="menuitem"
                    className="is-danger"
                    onClick={() => {
                      setUserOpen(false);
                      onSignOut();
                    }}
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button type="button" className="hp-nav-signin" onClick={() => onOpenAuth?.("login")}>
              Sign in
            </button>
          )}

          <button type="button" className="hp-btn hp-btn--primary hp-btn--sm" onClick={onStartClick}>
            Launch Studio
          </button>

          <button
            type="button"
            className="hp-burger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="hp-sheet">
          <nav aria-label="Sections">
            {LINKS.map((l) => (
              <a key={l.id} href={`#${l.id}`} onClick={() => setMenuOpen(false)}>
                {l.label}
                {l.badge && <em>{l.badge}</em>}
              </a>
            ))}
          </nav>
          <div className="hp-sheet-actions">
            <button
              type="button"
              className="hp-btn hp-btn--primary"
              onClick={() => {
                setMenuOpen(false);
                onStartClick();
              }}
            >
              <Zap size={15} /> Launch Studio
            </button>
            {currentUser ? (
              <>
                <button
                  type="button"
                  className="hp-btn hp-btn--ghost"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenHistory();
                  }}
                >
                  <History size={15} /> My blueprints ({historyCount})
                </button>
                <button
                  type="button"
                  className="hp-btn hp-btn--ghost"
                  onClick={() => {
                    setMenuOpen(false);
                    onSignOut();
                  }}
                >
                  <LogOut size={15} /> Sign out
                </button>
              </>
            ) : (
              <button
                type="button"
                className="hp-btn hp-btn--ghost"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenAuth?.("login");
                }}
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
