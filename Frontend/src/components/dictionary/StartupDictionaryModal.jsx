// Frontend/src/components/dictionary/StartupDictionaryModal.jsx
// ---------------------------------------------------------------------------
// Founder Dictionary, redesigned. Same props and data file as before:
//   isOpen, onClose, activeTermId, onNavigateSection
// New: highlighted search matches, arrow-key navigation, "/" to search,
// phone layout with list -> detail navigation, animated detail transitions.
// Styles: ./dictionary.css (replace the old file; needs home.css tokens).
// ---------------------------------------------------------------------------
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookMarked, Check, Copy, HelpCircle, Lightbulb, Search, X } from "lucide-react";
import {
  DICTIONARY_CATEGORIES,
  DICTIONARY_TERMS,
  getDictionaryTerm,
  searchDictionary,
} from "../../lib/startupDictionaryData.js";
import "./dictionary.css";

function Hl({ text, q }) {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

export default function StartupDictionaryModal({ isOpen, onClose, activeTermId, onNavigateSection }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedId, setSelectedId] = useState(activeTermId || DICTIONARY_TERMS[0]?.id);
  const [showDetail, setShowDetail] = useState(Boolean(activeTermId)); // phone only
  const [copied, setCopied] = useState(false);

  const searchRef = useRef(null);
  const listRef = useRef(null);

  // open on a specific term (deep link from a DictionaryBadge)
  useEffect(() => {
    if (!activeTermId) return;
    const found = getDictionaryTerm(activeTermId);
    if (found) {
      setSelectedId(found.id);
      setShowDetail(true);
      setQuery("");
      setCategory("all");
    }
  }, [activeTermId]);

  const terms = useMemo(() => searchDictionary(query, category), [query, category]);
  const current = useMemo(
    () => getDictionaryTerm(selectedId) || terms[0] || DICTIONARY_TERMS[0],
    [selectedId, terms]
  );

  // lock page scroll while open, focus search, Esc closes, "/" focuses search
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => !activeTermId && searchRef.current?.focus(), 120);
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "/" && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose, activeTermId]);

  // keep the selected row visible
  useEffect(() => {
    listRef.current?.querySelector(`[data-term="${current?.id}"]`)?.scrollIntoView({ block: "nearest" });
  }, [current?.id]);

  if (!isOpen) return null;

  const onListKey = (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const i = terms.findIndex((t) => t.id === current?.id);
    const next = terms[Math.max(0, Math.min(terms.length - 1, i + (e.key === "ArrowDown" ? 1 : -1)))];
    if (next) setSelectedId(next.id);
  };

  const copy = () => {
    if (!current) return;
    navigator.clipboard?.writeText(
      `${current.term}\n\nDefinition: ${current.shortDefinition}\n\nWhy it matters: ${current.whyItMatters}\n\nFormula / rule: ${current.formulaOrRule}\n\nExample: ${current.example}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const jump = (id) => {
    if (!id) return;
    onClose?.();
    if (onNavigateSection) onNavigateSection(id);
    else document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const q = query.trim();

  return (
    <div className="dict-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()} role="dialog" aria-modal="true" aria-labelledby="dict-title">
      <div className="dict-window">
        {/* Header */}
        <header className="dict-head">
          <span className="dict-head-icon">
            <BookMarked size={20} />
          </span>
          <div>
            <h2 id="dict-title">Founder dictionary</h2>
            <p>Plain-English meanings, formulas and benchmarks for every term in your report.</p>
          </div>
          <button type="button" className="dict-iconbtn" onClick={onClose} aria-label="Close dictionary">
            <X size={18} />
          </button>
        </header>

        {/* Search and categories */}
        <div className="dict-tools">
          <label className="dict-search">
            <Search size={16} />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search terms, formulas or metrics"
              aria-label="Search the dictionary"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
                <X size={14} />
              </button>
            ) : (
              <kbd>/</kbd>
            )}
          </label>
          <div className="dict-cats" role="tablist" aria-label="Categories">
            {DICTIONARY_CATEGORIES.map((c) => (
              <button key={c.id} type="button" role="tab" aria-selected={category === c.id} className={category === c.id ? "is-on" : ""} onClick={() => setCategory(c.id)}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className={`dict-body ${showDetail ? "is-detail" : ""}`}>
          {/* List */}
          <div className="dict-list" ref={listRef} onKeyDown={onListKey} role="listbox" aria-label="Terms">
            <p className="dict-count">
              {terms.length} {terms.length === 1 ? "term" : "terms"}
            </p>
            {terms.length === 0 ? (
              <div className="dict-empty">
                <HelpCircle size={28} />
                <b>No matching terms</b>
                <span>Try another keyword or switch category.</span>
              </div>
            ) : (
              terms.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={item.id === current?.id}
                  data-term={item.id}
                  className={`dict-row ${item.id === current?.id ? "is-on" : ""}`}
                  style={{ "--i": Math.min(i, 10) }}
                  onClick={() => {
                    setSelectedId(item.id);
                    setShowDetail(true);
                  }}
                >
                  <span>
                    <b>
                      <Hl text={item.term} q={q} />
                    </b>
                    <em>{item.tag}</em>
                  </span>
                  <small>{item.shortDefinition}</small>
                </button>
              ))
            )}
          </div>

          {/* Detail */}
          {current && (
            <article className="dict-detail" key={current.id}>
              <button type="button" className="dict-back" onClick={() => setShowDetail(false)}>
                <ArrowLeft size={16} /> All terms
              </button>

              <div className="dict-detail-top">
                <div>
                  <span className="dict-chips">
                    <i>{current.categoryLabel}</i>
                    <i>{current.tag}</i>
                  </span>
                  <h3>{current.term}</h3>
                </div>
                <button type="button" className="dict-copy" onClick={copy}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <section className="dict-def">
                <p className="dict-lede">{current.shortDefinition}</p>
                <p>{current.detailedExplanation}</p>
              </section>

              {current.whyItMatters && (
                <section className="dict-card is-why">
                  <h4>
                    <Lightbulb size={15} /> Why founders must know this
                  </h4>
                  <p>{current.whyItMatters}</p>
                </section>
              )}

              {current.formulaOrRule && (
                <section className="dict-card is-rule">
                  <h4>Rule of thumb or formula</h4>
                  <p>{current.formulaOrRule}</p>
                </section>
              )}

              {current.example && (
                <section className="dict-card is-example">
                  <h4>Real-world scenario</h4>
                  <p>{current.example}</p>
                </section>
              )}

              {current.relatedSectionId && (
                <footer className="dict-foot">
                  <span>
                    Referenced in <b>{current.relatedSectionLabel}</b>
                  </span>
                  <button type="button" className="hp-btn hp-btn--ghost hp-btn--sm" onClick={() => jump(current.relatedSectionId)}>
                    View in report <ArrowRight size={14} />
                  </button>
                </footer>
              )}
            </article>
          )}
        </div>
      </div>
    </div>
  );
}
