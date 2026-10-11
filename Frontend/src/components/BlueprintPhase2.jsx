// components/BlueprintPhase2.jsx
// ---------------------------------------------------------------------------
// Phase 2 of the blueprint reader redesign.
//   SectionGatewayHeader  drop-in replacement (same props) for the local one
//   ViabilitySpotlight    replaces block "1. Executive Viability Spotlight"
//   ActionDeck            replaces block "2. Executive Quick Action Deck"
//   StoryTrio             replaces block "4. Core Value Proposition Breakdown"
//   ScrollProgress        thin reading-progress bar (transform only, no state)
//   Reveal                scroll-triggered entrance, one observer per element
// Styles: ./blueprint.css
// ---------------------------------------------------------------------------
import { useEffect, useRef, useState } from "react";
import {
  Check,
  Edit2,
  X,
  AlertTriangle,
  Lightbulb,
  Rocket,
  Target,
  Hammer,
  Wallet,
  Flag,
  Bot,
} from "lucide-react";
import "./home.css";
import "./workspace.css";
import "./blueprint.css";

const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------ */
/* Motion helpers                                                      */
/* ------------------------------------------------------------------ */
export function useReveal(threshold = 0.18) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReduced() || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, shown];
}

export function Reveal({ as: Tag = "div", delay = 0, className = "", style, children, ...rest }) {
  const [ref, shown] = useReveal();
  return (
    <Tag
      ref={ref}
      className={`bp-rv ${shown ? "is-in" : ""} ${className}`}
      style={{ "--d": `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function useCountUp(target, run, duration = 1500) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (prefersReduced()) {
      setValue(target);
      return;
    }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(target * (1 - Math.pow(1 - t, 4)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, duration]);
  return value;
}

export function ScrollProgress({ scrollContainerRef }) {
  const bar = useRef(null);
  useEffect(() => {
    const container = scrollContainerRef?.current;
    if (!container) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = container.scrollHeight - container.clientHeight;
      const p = max > 0 ? container.scrollTop / max : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      container.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [scrollContainerRef]);
  return (
    <div className="bp-progress" aria-hidden="true">
      <i ref={bar} />
    </div>
  );
}

/* Seven segments: the stages really are a sequence, so numbering earns its place */
function StageTrack({ current, total = 7 }) {
  return (
    <span className="bp-track" role="img" aria-label={`Stage ${current} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <i key={i} className={i < current ? "is-on" : ""} />
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Section header (same props as before)                               */
/* ------------------------------------------------------------------ */
export function SectionGatewayHeader({ numeral, title, subtitle, badge, agent, onJumpTop, isActive = false }) {
  const n = parseInt(numeral, 10) || 1;
  return (
    <Reveal as="header" className={`bp-gate ${isActive ? "is-active" : ""}`}>
      <div className="bp-gate-meta">
        <StageTrack current={n} />
        <span className="bp-gate-stage">Stage {n} of 7</span>
        {agent && (
          <span className="bp-chip">
            <Bot size={14} />
            <b>{agent}</b>
          </span>
        )}
      </div>
      <div className="bp-gate-row">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <button type="button" className="hp-btn hp-btn--ghost hp-btn--sm" onClick={onJumpTop}>
          Back to top
        </button>
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Viability spotlight                                              */
/* ------------------------------------------------------------------ */
export function ViabilitySpotlight({ isActive, ventureTitle, domain, pitch, score, verdict, edit }) {
  const [ref, shown] = useReveal(0.25);
  const R = 62;
  const C = 2 * Math.PI * R;
  const safe = Math.max(0, Math.min(100, Number(score) || 0));
  const counted = useCountUp(safe, shown);

  return (
    <section ref={ref} className={`bp-spot bp-rv ${shown ? "is-in" : ""} ${isActive ? "is-active" : ""}`}>
      <div className="bp-spot-copy">
        <div className="bp-gate-meta">
          <StageTrack current={1} />
          <span className="bp-gate-stage">Stage 1 of 7</span>
          <span className="bp-chip">
            <i />
            Industry <b>{domain}</b>
          </span>
        </div>
        {edit?.isEditing ? (
          <div className="bp-edit-row bp-spot-edit">
            <input
              ref={edit.inputRef}
              type="text"
              value={edit.editedTitle}
              onChange={(e) => edit.setEditedTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") edit.onSave();
                if (e.key === "Escape") edit.onCancel();
              }}
              aria-label="Venture title"
            />
            <button type="button" className="bp-edit" onClick={edit.onSave} title="Save title" aria-label="Save title">
              <Check size={15} />
            </button>
            <button type="button" className="bp-edit" onClick={edit.onCancel} title="Cancel" aria-label="Cancel">
              <X size={15} />
            </button>
          </div>
        ) : (
          <div className="bp-spot-title">
            <h2>{ventureTitle}</h2>
            {edit && (
              <button type="button" className="bp-edit" onClick={edit.onStart} title="Edit title" aria-label="Edit venture title">
                <Edit2 size={14} />
              </button>
            )}
          </div>
        )}
        <p>{pitch}</p>
      </div>

      <div className="bp-score">
        <div className="bp-ring">
          <svg viewBox="0 0 140 140" aria-hidden="true">
            <circle cx="70" cy="70" r={R} className="track" />
            <circle
              cx="70"
              cy="70"
              r={R}
              className="bar"
              style={{ strokeDasharray: C, strokeDashoffset: shown ? C * (1 - safe / 100) : C }}
            />
          </svg>
          <div>
            <strong>{Math.round(counted)}</strong>
            <span>out of 100</span>
          </div>
        </div>
        <span className="bp-verdict">{verdict}</span>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Action deck: four facts in one panel, hairline dividers          */
/* ------------------------------------------------------------------ */
export function ActionDeck({ targetCustomer, coreMvpScope, monetizationModel, priorityThisWeek }) {
  const items = [
    { icon: Target, label: "Target customer", value: targetCustomer },
    { icon: Hammer, label: "Core MVP scope", value: coreMvpScope },
    { icon: Wallet, label: "How it makes money", value: monetizationModel },
    { icon: Flag, label: "Priority this week", value: priorityThisWeek, hot: true },
  ];
  return (
    <section className="bp-deck" aria-label="Key pillars at a glance">
      {items.map(({ icon: Icon, label, value, hot }, i) => (
        <Reveal key={label} delay={i * 90} className={`bp-deck-cell ${hot ? "is-hot" : ""}`}>
          <span className="bp-deck-icon">
            <Icon size={17} />
          </span>
          <small>{label}</small>
          <p>{value}</p>
        </Reveal>
      ))}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Problem, solution, edge: a real sequence, so one connected row   */
/* ------------------------------------------------------------------ */
export function StoryTrio({ problem, solution, whyItWins }) {
  const cols = [
    {
      tone: "rose",
      icon: AlertTriangle,
      label: "The problem",
      title: "What frustrates users today?",
      body: problem,
      foot: "Pain point identified from target customer interviews.",
    },
    {
      tone: "green",
      icon: Lightbulb,
      label: "The solution",
      title: "How does your product solve it?",
      body: solution,
      foot: "Directly removes the friction with a simple, focused tool.",
    },
    {
      tone: "orange",
      icon: Rocket,
      label: "Why it wins",
      title: "Why customers will choose this",
      body: whyItWins,
      foot: "Your unique differentiator against alternatives.",
    },
  ];
  return (
    <section className="bp-story" aria-label="Problem, solution and advantage">
      {cols.map(({ tone, icon: Icon, label, title, body, foot }, i) => (
        <Reveal as="article" key={label} delay={i * 120} className={`bp-story-col is-${tone}`}>
          <div className="bp-story-head">
            <span className="bp-story-icon">
              <Icon size={18} />
            </span>
          </div>
          <h4>{label}</h4>
          <h3>{title}</h3>
          <p>{body}</p>
          <small>{foot}</small>
        </Reveal>
      ))}
    </section>
  );
}
