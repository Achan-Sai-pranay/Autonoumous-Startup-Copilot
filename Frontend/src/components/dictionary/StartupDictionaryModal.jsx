// Frontend/src/components/dictionary/StartupDictionaryModal.jsx
// ---------------------------------------------------------------------------
// Founder Dictionary & Knowledge Vault Modal
// Provides founders with plain-English definitions, formulas, real-world examples,
// and actionable takeaways for complex startup, financial, and architectural terms.
// ---------------------------------------------------------------------------
import { useState, useEffect, useMemo, useRef } from "react";
import {
  BookMarked,
  Search,
  X,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Calculator,
  Compass,
} from "lucide-react";
import {
  DICTIONARY_CATEGORIES,
  DICTIONARY_TERMS,
  getDictionaryTerm,
  searchDictionary,
} from "../../lib/startupDictionaryData.js";
import "./dictionary.css";

export default function StartupDictionaryModal({
  isOpen,
  onClose,
  activeTermId,
  onNavigateSection,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTermId, setSelectedTermId] = useState(
    activeTermId || DICTIONARY_TERMS[0]?.id || "mom-test"
  );
  const [copied, setCopied] = useState(false);

  const searchInputRef = useRef(null);
  const listContainerRef = useRef(null);

  // Sync when activeTermId prop changes
  useEffect(() => {
    if (activeTermId) {
      const found = getDictionaryTerm(activeTermId);
      if (found) {
        setSelectedTermId(found.id);
        if (selectedCategory !== "all" && found.category !== selectedCategory) {
          setSelectedCategory("all");
        }
      }
    }
  }, [activeTermId]);

  // Keyboard shortcut: Esc to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Auto focus search input when opening modal
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // Filtered terms
  const filteredTerms = useMemo(() => {
    return searchDictionary(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  // Current active term
  const currentTerm = useMemo(() => {
    const direct = getDictionaryTerm(selectedTermId);
    if (direct) return direct;
    return filteredTerms[0] || DICTIONARY_TERMS[0];
  }, [selectedTermId, filteredTerms]);

  // Copy definition handler
  const handleCopy = () => {
    if (!currentTerm) return;
    const text = `${currentTerm.term}\n\nDefinition: ${currentTerm.shortDefinition}\n\nWhy It Matters: ${currentTerm.whyItMatters}\n\nFormula/Rule: ${currentTerm.formulaOrRule}\n\nExample: ${currentTerm.example}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Jump to corresponding blueprint section
  const handleJumpToSection = (sectionId) => {
    if (!sectionId) return;
    onClose?.();
    if (onNavigateSection) {
      onNavigateSection(sectionId);
    } else {
      const el = document.getElementById(`section-${sectionId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="dict-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Founder Dictionary"
    >
      <div className="dict-modal-window">
        {/* Header */}
        <header className="dict-modal-header">
          <div className="dict-header-title-wrap">
            <div className="dict-header-icon">
              <BookMarked size={20} />
            </div>
            <div>
              <h2 className="dict-header-title">Founder Dictionary & Knowledge Vault</h2>
              <p className="dict-header-subtitle">
                Clear definitions, benchmarks, and tactical formulas across the 7 agentic stages
              </p>
            </div>
          </div>
          <button
            type="button"
            className="dict-close-btn"
            onClick={onClose}
            aria-label="Close dictionary"
          >
            <X size={18} />
          </button>
        </header>

        {/* Toolbar: Search + Category Filters */}
        <div className="dict-toolbar">
          <div className="dict-search-bar">
            <Search size={16} className="dict-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="dict-search-input"
              placeholder="Search startup terms, formulas, or metrics (e.g. Mom Test, ARR, Porter's, LTV)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="dict-search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="dict-category-pills" role="tablist">
            {DICTIONARY_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat.id}
                className={`dict-category-pill ${
                  selectedCategory === cat.id ? "is-active" : ""
                }`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Two-Column Body Content */}
        <div className="dict-body">
          {/* Left Column: Term List */}
          <div className="dict-term-list" ref={listContainerRef}>
            {filteredTerms.length === 0 ? (
              <div className="dict-empty-state">
                <HelpCircle size={28} style={{ margin: "0 auto 8px auto", opacity: 0.5 }} />
                <p>No matching terms found.</p>
                <small>Try searching another keyword or switch category.</small>
              </div>
            ) : (
              filteredTerms.map((item) => {
                const isSelected = item.id === currentTerm?.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`dict-list-item ${isSelected ? "is-selected" : ""}`}
                    onClick={() => setSelectedTermId(item.id)}
                  >
                    <div className="dict-item-header">
                      <span className="dict-item-title">{item.term}</span>
                      <span className="dict-item-tag">{item.tag}</span>
                    </div>
                    <span className="dict-item-preview">{item.shortDefinition}</span>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Column: Term Detail */}
          {currentTerm && (
            <div className="dict-term-detail">
              <div className="dict-detail-head">
                <div>
                  <div className="dict-detail-badges">
                    <span className="dict-category-badge">
                      {currentTerm.categoryLabel}
                    </span>
                    <span className="dict-tag-badge">{currentTerm.tag}</span>
                  </div>
                  <h3 className="dict-detail-title">{currentTerm.term}</h3>
                </div>
                <button
                  type="button"
                  className="dict-copy-btn"
                  onClick={handleCopy}
                  title="Copy definition"
                >
                  {copied ? (
                    <>
                      <Check size={14} color="#10b981" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy Entry</span>
                    </>
                  )}
                </button>
              </div>

              {/* Core Short Definition */}
              <div className="dict-section-block">
                <span className="dict-section-label">Core Definition</span>
                <p className="dict-short-def">{currentTerm.shortDefinition}</p>
                <p className="dict-long-def">{currentTerm.detailedExplanation}</p>
              </div>

              {/* Why Founders Need This */}
              {currentTerm.whyItMatters && (
                <div className="dict-box-why">
                  <AlertCircle size={18} className="dict-box-why-icon" />
                  <div>
                    <strong style={{ display: "block", marginBottom: 3, color: "#fef3c7" }}>
                      Why Founders Must Know This
                    </strong>
                    <span className="dict-box-why-text">{currentTerm.whyItMatters}</span>
                  </div>
                </div>
              )}

              {/* Formula, Rule of Thumb or Benchmark */}
              {currentTerm.formulaOrRule && (
                <div className="dict-box-formula">
                  <span className="dict-box-formula-label">Rule of Thumb / Formula</span>
                  <div className="dict-box-formula-content">{currentTerm.formulaOrRule}</div>
                </div>
              )}

              {/* Practical Scenario / Example */}
              {currentTerm.example && (
                <div className="dict-box-example">
                  <span className="dict-box-example-label">Real-World Scenario</span>
                  <div className="dict-box-example-content">{currentTerm.example}</div>
                </div>
              )}

              {/* Footer jump to report section */}
              {currentTerm.relatedSectionId && (
                <div className="dict-footer-jump">
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                    Referenced in: <b>{currentTerm.relatedSectionLabel}</b>
                  </span>
                  <button
                    type="button"
                    className="dict-related-link"
                    onClick={() => handleJumpToSection(currentTerm.relatedSectionId)}
                  >
                    <span>View Section in Report</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
