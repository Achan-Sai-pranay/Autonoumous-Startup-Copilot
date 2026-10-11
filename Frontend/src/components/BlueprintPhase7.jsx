// BlueprintPhase7.jsx
// ---------------------------------------------------------------------------
// Phase 7: fixes after review. One overview, and the old-style leftovers.
//   ViabilityBreakdown   replaces "Startup Viability & Survival Analysis"
//   RoadmapStrip         replaces "4-Week Founder Execution Roadmap"
//   EconomicsSnapshot    replaces the three cost / revenue / model cards
//   ExploreGrid          replaces "Explore Detailed Business Analysis Agents"
//   LeanCanvasView       presentational half of the 9-box lean canvas
// Needs BlueprintPhase2.jsx (Reveal, useReveal) and ./blueprint.css
// ---------------------------------------------------------------------------
import { ChevronRight } from "lucide-react";
import { Reveal, useReveal } from "./BlueprintPhase2.jsx";
import "./blueprint.css";

/* ------------------------------------------------------------------ */
/* Viability                                                           */
/* ------------------------------------------------------------------ */
// pillars: [{ icon, label, value (0-100), text }]
export function ViabilityBreakdown({ score, verdict, pillars = [], thesis, risks = [] }) {
  const [ref, shown] = useReveal(0.2);
  return (
    <section ref={ref} className={`bp-viab bp-rv ${shown ? "is-in" : ""}`}>
      <div className="bp-sec-head">
        <div>
          <h3>Startup viability and survival</h3>
          <p>Independent scoring based on market demand, ease of building and monetization potential.</p>
        </div>
        <span className="bp-verdict">
          {score}/100 · {verdict}
        </span>
      </div>

      <div className="bp-pillars">
        {pillars.map(({ icon: Icon, label, value, text }) => (
          <div key={label} className="bp-pillar">
            <h4>
              {Icon && <Icon size={16} />}
              {label}
            </h4>
            <strong>{value}%</strong>
            <div className="bp-meter">
              <i style={{ width: shown ? `${value}%` : "0%" }} />
            </div>
            <p>{text}</p>
          </div>
        ))}
      </div>

      <div className="bp-viab-foot">
        <div className="bp-thesis">
          <h4>Executive investment thesis</h4>
          <p>{thesis}</p>
        </div>
        <div className="bp-risks">
          <h4>Top risks to avoid</h4>
          <ul>
            {risks.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Roadmap strip: [{ week, title, task }]                              */
/* ------------------------------------------------------------------ */
export function RoadmapStrip({ milestones = [], onViewAll }) {
  return (
    <Reveal as="section" className="bp-strip">
      <div className="bp-sec-head">
        <div>
          <h3>Your first four weeks</h3>
          <p>A disciplined weekly shipping sprint, from first customer interviews to first launch.</p>
        </div>
        {onViewAll && (
          <button type="button" className="bp-link" onClick={onViewAll}>
            View full roadmap →
          </button>
        )}
      </div>
      <ol>
        {milestones.map((m, i) => (
          <Reveal as="li" key={i} delay={i * 100}>
            <small>{m.week}</small>
            <h4>{m.title}</h4>
            <p>{m.task}</p>
          </Reveal>
        ))}
      </ol>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* Economics snapshot                                                  */
/* ------------------------------------------------------------------ */
export function EconomicsSnapshot({ cost, revenue, model }) {
  return (
    <Reveal as="section" className="bp-eco">
      <div>
        <small>Monthly operating cost</small>
        <strong>{cost}</strong>
        <span>Lean operations</span>
      </div>
      <div className="is-accent">
        <small>Estimated year 1 revenue</small>
        <strong>{revenue}</strong>
        <span>High growth potential</span>
      </div>
      <div>
        <small>Monetization model</small>
        <strong>{model}</strong>
        <span>Proven business model</span>
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* Explore grid                                                        */
/* ------------------------------------------------------------------ */
export function ExploreGrid({ sections = [], onNavigate }) {
  return (
    <Reveal as="section" className="bp-explore">
      <h3>Go deeper</h3>
      <p>Each specialist agent has a full breakdown of its own area.</p>
      <div className="bp-explore-grid">
        {sections.map((s) => (
          <button key={s.id} type="button" onClick={() => onNavigate(s.id)}>
            <span>
              <b>{s.title}</b>
              <small>View breakdown</small>
            </span>
            <ChevronRight size={18} />
          </button>
        ))}
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* Lean canvas: boxes = [{ n, label, tag, main, subLabel, sub, hot }]  */
/* ------------------------------------------------------------------ */
export function LeanCanvasView({ boxes = [] }) {
  return (
    <Reveal as="section" className="bp-canvas">
      <div className="bp-sec-head">
        <div>
          <h3>Lean canvas</h3>
          <p>Your whole business model on one page, ready for founder iteration and investor diligence.</p>
        </div>
      </div>
      <div className="bp-canvas-grid">
        {boxes.map((b, i) => (
          <Reveal as="article" key={b.n} delay={(i % 3) * 80} className={`bp-cell ${b.hot ? "is-hot" : ""}`}>
            <div className="bp-cell-top">
              <b>
                <em>{b.n}</em>
                {b.label}
              </b>
              <span>{b.tag}</span>
            </div>
            <p>{b.main}</p>
            <div>
              <small>{b.subLabel}</small>
              <p>{b.sub}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Reveal>
  );
}
