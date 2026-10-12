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

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const navBar = document.querySelector(".hp-nav");
    const navHeight = navBar ? navBar.offsetHeight : 58;
    const targetGap = 20; // Exact Apple-style small gap (20px) under the sticky navbar

    // Target the section heading so content starts right below the navbar with a small gap
    const head = el.querySelector(".hp-head, .lps-head, .hp-pipe-intro, h2") || el;

    // Calculate layout position without being skewed by active CSS animation transforms (.hp-rv)
    let offsetInside = 0;
    let curr = head;
    while (curr && curr !== el) {
      offsetInside += curr.offsetTop;
      curr = curr.offsetParent;
    }
    const sectionTop = el.getBoundingClientRect().top + window.scrollY;
    const headingTop = sectionTop + offsetInside;
    const targetTop = headingTop - (navHeight + targetGap);

    window.scrollTo({
      top: Math.max(0, Math.round(targetTop)),
      behavior: "smooth",
    });

    if (window.history && window.history.pushState) {
      window.history.pushState(null, "", `#${id}`);
    }
    setActive(id);
  };

  // Intercept all in-page hash links so sections land with a uniform small gap
  useEffect(() => {
    const onAnchorClick = (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        const id = href.slice(1);
        const target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          scrollToSection(id);
        }
      }
    };
    document.addEventListener("click", onAnchorClick);
    return () => document.removeEventListener("click", onAnchorClick);
  }, []);
  // Handle initial hash in URL when landing directly on #features, #pricing, etc.
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hashId = window.location.hash.replace("#", "");
      if (hashId) {
        const timer = setTimeout(() => {
          scrollToSection(hashId);
        }, 120);
        return () => clearTimeout(timer);
      }
    }
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
            window.scrollTo({ top: 0, behavior: "smooth" });
            if (window.location.hash) {
              window.history.pushState(null, "", window.location.pathname);
            }
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
            <a
              key={l.id}
              href={`#${l.id}`}
              className={active === l.id ? "is-active" : ""}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(l.id);
              }}
            >
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
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  setMenuOpen(false);
                  scrollToSection(l.id);
                }}
              >
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
