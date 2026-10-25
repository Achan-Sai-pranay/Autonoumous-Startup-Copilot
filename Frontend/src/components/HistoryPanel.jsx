// components/HistoryPanel.jsx
// ---------------------------------------------------------------------------
// Project Vault — frosted slide-over drawer listing saved projects from
// localStorage. Styling: auth.css (shared tokens) + history.css
// ---------------------------------------------------------------------------
import { useState, useEffect, useMemo } from "react";
import { History, X, Trash2, ChevronRight, Search, FolderOpen } from "lucide-react";
import "../styles/auth.css";
import "../styles/history.css";

function truncate(text, max = 110) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

// Map to saved blueprint viability score (0–100).
// Returns null when none is found, and the badge is simply hidden.
function getScore(entry) {
  const bp = entry?.blueprint;
  const raw =
    bp?.viabilityScorecard?.score ??
    bp?.viabilityScorecard?.overallScore ??
    bp?.viabilityScore ??
    bp?.score ??
    bp?.ideaAnalysis?.viabilityScore ??
    entry?.viabilityScore ??
    entry?.score ??
    entry?.viability?.score ??
    entry?.result?.viability?.score ??
    null;
  const n = Number(raw);
  if (Number.isFinite(n) && n > 0) return Math.min(99, Math.max(10, Math.round(n)));

  // Fallback: bull conviction if present
  if (bp?.aiDebate?.bull?.convictionScore) {
    const conv = Number(bp.aiDebate.bull.convictionScore);
    if (Number.isFinite(conv) && conv > 0) return Math.min(99, Math.max(10, Math.round(conv)));
  }

  return null;
}

function scoreTone(n) {
  if (n >= 80) return "good";
  if (n >= 60) return "mid";
  return "low";
}

function ageInDays(iso) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return Infinity;
  return (Date.now() - t) / 86400000;
}

function isToday(iso) {
  const d = new Date(iso);
  const n = new Date();
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  );
}

const FILTERS = [
  { id: "all", label: "All", test: () => true },
  { id: "today", label: "Today", test: (e) => isToday(e.createdAt) },
  { id: "week", label: "This week", test: (e) => ageInDays(e.createdAt) <= 7 },
  { id: "top", label: "Top rated", test: (e) => (getScore(e) ?? -1) >= 80 },
];

export default function HistoryPanel({
  isOpen,
  onClose,
  history = [],
  onLoad,
  onDelete,
  theme = "light", // "light" | "dark"
}) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [removingId, setRemovingId] = useState(null);

  // keep mounted briefly so the drawer can animate out
  const [mounted, setMounted] = useState(isOpen);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setClosing(false);
      return;
    }
    if (!mounted) return;
    setClosing(true);
    const t = setTimeout(() => {
      setMounted(false);
      setClosing(false);
      setQuery("");
      setFilter("all");
    }, 280);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Esc to close + lock page scroll while the drawer is up
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  const counts = useMemo(
    () => Object.fromEntries(FILTERS.map((f) => [f.id, history.filter(f.test).length])),
    [history]
  );

  const visible = useMemo(() => {
    const active = FILTERS.find((f) => f.id === filter) || FILTERS[0];
    const q = query.trim().toLowerCase();
    return history.filter(
      (e) => active.test(e) && (!q || (e.idea || "").toLowerCase().includes(q))
    );
  }, [history, filter, query]);

  if (!mounted) return null;

  // hide "Top rated" when no entry carries a score
  const hasScores = history.some((e) => getScore(e) !== null);
  const filters = FILTERS.filter((f) => f.id !== "top" || hasScores);

  function handleDelete(id) {
    setRemovingId(id);
    setTimeout(() => {
      onDelete(id);
      setRemovingId(null);
    }, 240);
  }

  const isEmpty = history.length === 0;

  return (
    <div
      className="ax-overlay hp-root"
      data-theme={theme}
      data-state={closing ? "closing" : "open"}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <aside className="hp-drawer" role="dialog" aria-modal="true" aria-labelledby="hp-title">
        {/* Header */}
        <div className="hp-head">
          <div className="hp-head-left">
            <span className="hp-head-icon">
              <History size={17} />
            </span>
            <div>
              <h2 className="hp-title" id="hp-title">Project Vault</h2>
              <p className="hp-count">
                {history.length} {history.length === 1 ? "blueprint" : "blueprints"} saved
              </p>
            </div>
          </div>
          <button
            type="button"
            className="ax-close"
            onClick={onClose}
            aria-label="Close saved projects"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search + quick filters */}
        {!isEmpty && (
          <div className="hp-tools">
            <label className="hp-search">
              <Search size={15} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your startups"
                spellCheck={false}
              />
            </label>
            <div className="hp-chips" role="group" aria-label="Filter blueprints">
              {filters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className="hp-chip"
                  aria-pressed={filter === f.id}
                  onClick={() => setFilter(f.id)}
                >
                  <span>{f.label}</span>
                  <b>{counts[f.id]}</b>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* List */}
        <div className="hp-list">
          {isEmpty && (
            <div className="hp-empty">
              <div className="hp-empty-icon">
                <FolderOpen size={22} />
              </div>
              <h3>No blueprints in vault yet</h3>
              <p>Every generated startup plan is saved here automatically.</p>
            </div>
          )}

          {!isEmpty && visible.length === 0 && (
            <div className="hp-empty">
              <div className="hp-empty-icon">
                <Search size={22} />
              </div>
              <h3>No matching blueprints</h3>
              <p>Try a different search or filter.</p>
              <button
                type="button"
                className="ax-link"
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
              >
                Clear filters
              </button>
            </div>
          )}

          {visible.map((entry, i) => {
            const score = getScore(entry);
            return (
              <article
                key={entry.id}
                className="hp-card"
                data-removing={removingId === entry.id}
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
              >
                <button type="button" className="hp-main" onClick={() => onLoad(entry)}>
                  <p className="hp-idea">{truncate(entry.idea)}</p>
                  <div className="hp-meta">
                    {score !== null && (
                      <span className={`hp-score hp-score--${scoreTone(score)}`}>
                        {score}
                        <small>/100</small>
                      </span>
                    )}
                    <span className="hp-date">{formatDate(entry.createdAt)}</span>
                    <span className="hp-open">
                      Load Blueprint <ChevronRight size={13} />
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  className="hp-del"
                  onClick={() => handleDelete(entry.id)}
                  title="Delete blueprint"
                  aria-label="Delete blueprint"
                >
                  <Trash2 size={14} />
                </button>
              </article>
            );
          })}
        </div>

        <div className="hp-foot">Saved on this device</div>
      </aside>
    </div>
  );
}