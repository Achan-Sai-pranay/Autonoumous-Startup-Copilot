// BlueprintPhase6.jsx
// ---------------------------------------------------------------------------
// Phase 6 (final): the remaining pieces of the reader.
//   ReaderToolbar          replaces the "Top Utility Bar"
//   EditableList           drop-in (same props), used by discovery + MVP cards
//   ResponsiveCardGrid     drop-in
//   Tile / TileGrid / MetricRow   replace the slate boxes inside finance and
//                          architecture cards
//   MilestoneTimeline      replaces the "Execution Milestones" grid
//   CompletionHero         replaces BlueprintCompletionHero (light, not black)
//   Toast                  replaces the Tailwind toast
//   useScrollSpy           replaces the scroll-listener effect, no layout reads
//                          on every frame
// Needs BlueprintPhase2.jsx (Reveal) and ./blueprint.css
// ---------------------------------------------------------------------------
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Edit2, FileDown, FileText, Loader2, Plus, Sparkles, Trash2, X } from "lucide-react";
import { Reveal } from "./BlueprintPhase2.jsx";
import "./blueprint.css";

/* ------------------------------------------------------------------ */
/* Toolbar                                                             */
/* ------------------------------------------------------------------ */
export function ReaderToolbar({
  briefNo,
  isFounderMode,
  setIsFounderMode,
  onCopy,
  onMarkdown,
  onPdf,
  exporting,
  onToast,
}) {
  return (
    <div className="bp-bar-top">
      <div className="bp-bar-id">
        <span className="bp-chip">
          <i />
          Startup brief <b>#{briefNo}</b>
        </span>
        <span className="bp-bar-sub">Synthesized by 12 autonomous co-founders</span>
      </div>

      <div className="bp-bar-actions">
        <div className="hp-seg" role="group" aria-label="Reading mode">
          <button
            type="button"
            className={isFounderMode ? "is-on" : ""}
            onClick={() => {
              setIsFounderMode(true);
              onToast?.("Switched to plain-English founder mode");
            }}
            title="Plain-English terms without MBA jargon"
          >
            Founder
          </button>
          <button
            type="button"
            className={!isFounderMode ? "is-on" : ""}
            onClick={() => {
              setIsFounderMode(false);
              onToast?.("Switched to VC and investor mode");
            }}
            title="Standard institutional terms (TAM/SAM/SOM, Porter's, etc.)"
          >
            Investor
          </button>
        </div>
        <button type="button" className="hp-btn hp-btn--ghost hp-btn--sm" onClick={onCopy}>
          <Copy size={14} />
          <span className="bp-hide-sm">Copy brief</span>
        </button>
        <button type="button" className="hp-btn hp-btn--ghost hp-btn--sm" onClick={onMarkdown} disabled={exporting === "md"}>
          {exporting === "md" ? <Loader2 size={14} className="bp-spin" /> : <FileText size={14} />}
          <span className="bp-hide-sm">Markdown</span>
        </button>
        <button type="button" className="hp-btn hp-btn--dark hp-btn--sm" onClick={onPdf} disabled={exporting === "pdf"}>
          {exporting === "pdf" ? <Loader2 size={14} className="bp-spin" /> : <FileDown size={14} />}
          Executive PDF
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Editable list                                                       */
/* ------------------------------------------------------------------ */
const TONE = { sky: "ink", orange: "orange", emerald: "green", amber: "amber" };

export function EditableList({
  items = [],
  onUpdate,
  placeholder = "Add new item...",
  addButtonLabel = "Add item",
  accentColor = "orange",
  icon: ItemIcon = Check,
}) {
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState("");
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState("");

  const safe = useMemo(() => {
    let arr = [];
    if (Array.isArray(items)) arr = items;
    else if (items && typeof items === "object") arr = Object.values(items);
    else if (typeof items === "string") arr = [items];
    return arr.map((it) => {
      if (typeof it === "string") return it;
      if (it && typeof it === "object") return it.text || it.title || it.task || it.item || it.name || it.description || JSON.stringify(it);
      return String(it ?? "");
    });
  }, [items]);

  const save = (i) => {
    if (editText.trim()) onUpdate?.(safe.map((it, j) => (j === i ? editText.trim() : it)));
    setEditing(null);
  };
  const add = () => {
    if (newText.trim()) {
      onUpdate?.([...safe, newText.trim()]);
      setNewText("");
      setAdding(false);
    }
  };

  return (
    <div className={`bp-el is-${TONE[accentColor] || "orange"}`}>
      <ul>
        {safe.map((item, i) => (
          <li key={i}>
            {editing === i ? (
              <div className="bp-el-edit">
                <input
                  autoFocus
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") save(i);
                    if (e.key === "Escape") setEditing(null);
                  }}
                />
                <button type="button" onClick={() => save(i)} aria-label="Save">
                  <Check size={15} />
                </button>
                <button type="button" onClick={() => setEditing(null)} aria-label="Cancel">
                  <X size={15} />
                </button>
              </div>
            ) : (
              <>
                <ItemIcon size={15} className="bp-el-icon" />
                <span>{item}</span>
                <div className="bp-el-actions">
                  <button
                    type="button"
                    aria-label="Edit item"
                    onClick={() => {
                      setEditing(i);
                      setEditText(item);
                    }}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button type="button" aria-label="Delete item" className="is-danger" onClick={() => onUpdate?.(safe.filter((_, j) => j !== i))}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {adding ? (
        <div className="bp-el-edit bp-el-add">
          <input
            autoFocus
            value={newText}
            placeholder={placeholder}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") add();
              if (e.key === "Escape") {
                setAdding(false);
                setNewText("");
              }
            }}
          />
          <button type="button" className="hp-btn hp-btn--dark hp-btn--sm" onClick={add}>
            Add
          </button>
          <button type="button" aria-label="Cancel" onClick={() => { setAdding(false); setNewText(""); }}>
            <X size={15} />
          </button>
        </div>
      ) : (
        <button type="button" className="bp-el-new" onClick={() => setAdding(true)}>
          <Plus size={14} /> {addButtonLabel}
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Layout primitives                                                   */
/* ------------------------------------------------------------------ */
export function ResponsiveCardGrid({ children }) {
  return <div className="bp-grid">{children}</div>;
}

export function TileGrid({ cols = 2, children }) {
  return <div className="bp-tiles" style={{ "--cols": cols }}>{children}</div>;
}

/* tone: "" | "orange" | "green" */
export function Tile({ label, value, sub, tone = "" }) {
  return (
    <div className={`bp-tile ${tone ? `is-${tone}` : ""}`}>
      <small>{label}</small>
      <b>{value}</b>
      {sub && <span>{sub}</span>}
    </div>
  );
}

export function MetricRow({ label, value, tag, tone = "" }) {
  return (
    <div className="bp-metric">
      <span>
        {label}
        {tag && <em>{tag}</em>}
      </span>
      <b className={tone ? `is-${tone}` : ""}>{value}</b>
    </div>
  );
}

/* milestones: [{ title, week, tasks: string[] }] */
export function MilestoneTimeline({ milestones = [], title }) {
  if (!milestones.length) return null;
  return (
    <section className="bp-tl">
      <Reveal as="h3">{title || `Execution milestones, ${milestones.length} sprints`}</Reveal>
      <ol>
        {milestones.map((m, i) => (
          <Reveal as="li" key={i} delay={Math.min(i, 5) * 80}>
            <span className="bp-tl-dot">{i + 1}</span>
            <div>
              <small>{m.week}</small>
              <h4>{m.title}</h4>
              <ul>
                {(m.tasks || []).map((t, j) => (
                  <li key={j}>{t}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Completion + toast                                                  */
/* ------------------------------------------------------------------ */
export function CompletionHero({ onExportPdf, onExportMarkdown, onScrollToTop }) {
  return (
    <Reveal as="section" className="bp-done">
      <span className="bp-chip">
        <Sparkles size={14} />
        Complete seven-stage analysis
      </span>
      <h3>You’ve reviewed your entire startup thesis.</h3>
      <p>
        Twelve AI specialists have stress-tested viability, customers, SWOT, MVP scope, unit economics and
        go-to-market. Take it with you.
      </p>
      <div>
        <button type="button" className="hp-btn hp-btn--primary" onClick={onExportPdf}>
          <FileDown size={16} /> Export executive PDF
        </button>
        <button type="button" className="hp-btn hp-btn--ghost" onClick={onExportMarkdown}>
          <FileText size={16} /> Download Markdown
        </button>
        <button type="button" className="bp-done-top" onClick={onScrollToTop}>
          Back to top
        </button>
      </div>
    </Reveal>
  );
}

export function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="bp-toast" role="status">
      <Check size={15} />
      <span>{message}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scroll-spy                                                          */
/* A thin band near the top of the scroll container decides which      */
/* section is active. IntersectionObserver does the work off the main  */
/* thread, so there are no per-frame getBoundingClientRect reads.      */
/* ------------------------------------------------------------------ */
export function useScrollSpy({ containerRef, enabled = true, lockedRef, activeRef, onChange }) {
  useEffect(() => {
    const root = containerRef?.current;
    if (!enabled || !root || typeof IntersectionObserver === "undefined") return;

    const sections = Array.from(document.querySelectorAll("section.blueprint-section[data-section-id]"));
    if (!sections.length) return;

    const visible = new Set();
    const pick = () => {
      if (lockedRef?.current) return;
      // near the bottom: last stage wins, like the old behaviour
      const atBottom = root.scrollHeight - root.scrollTop - root.clientHeight < 80;
      const id = atBottom
        ? sections[sections.length - 1].dataset.sectionId
        : sections.find((s) => visible.has(s.dataset.sectionId))?.dataset.sectionId;
      if (id && id !== activeRef?.current) {
        if (activeRef) activeRef.current = id;
        onChange(id);
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const id = e.target.dataset.sectionId;
          if (e.isIntersecting) visible.add(id);
          else visible.delete(id);
        });
        pick();
      },
      // band: from 120px below the top to 35% down the viewport
      { root, rootMargin: "-120px 0px -65% 0px", threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));

    root.addEventListener("scroll", pick, { passive: true });
    return () => {
      io.disconnect();
      root.removeEventListener("scroll", pick);
    };
  }, [containerRef, enabled, lockedRef, activeRef, onChange]);
}
