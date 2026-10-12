// Frontend/src/components/dictionary/DictionaryBadge.jsx
// ---------------------------------------------------------------------------
// Contextual dictionary trigger badge.
// Drop into any card, section header, or metric tile across the 7 agentic sections.
// Clicking dispatches an 'open-dictionary' event with the specific termId,
// automatically opening the Founder Dictionary focused on that exact entry.
// ---------------------------------------------------------------------------
import { BookMarked, HelpCircle, Sparkles } from "lucide-react";
import { getDictionaryTerm } from "../../lib/startupDictionaryData.js";
import "./dictionary.css";

export default function DictionaryBadge({
  termId,
  label,
  variant = "badge", // "badge" | "icon" | "pill" | "subtle"
  className = "",
  title,
}) {
  const termData = getDictionaryTerm(termId);
  const termTitle = termData?.term || termId;
  const tooltipText = title || `Open Founder Dictionary: What is "${termTitle}"?`;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent("open-dictionary", {
        detail: { termId },
      })
    );
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        className={`dict-trigger-icon ${className}`}
        onClick={handleClick}
        title={tooltipText}
        aria-label={tooltipText}
      >
        <BookMarked size={14} className="dict-trigger-icon-svg" />
      </button>
    );
  }

  if (variant === "subtle") {
    return (
      <button
        type="button"
        className={`dict-trigger-subtle ${className}`}
        onClick={handleClick}
        title={tooltipText}
      >
        <HelpCircle size={12} />
        <span>{label || "Explain term"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`dict-trigger-badge ${className}`}
      onClick={handleClick}
      title={tooltipText}
      aria-label={tooltipText}
    >
      <BookMarked size={12} className="dict-trigger-badge-icon" />
      <span className="dict-trigger-badge-text">{label || "Dictionary"}</span>
    </button>
  );
}
