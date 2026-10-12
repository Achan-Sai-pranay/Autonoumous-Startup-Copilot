// BlueprintPhase4.jsx
// ---------------------------------------------------------------------------
// Phase 4 of the blueprint reader redesign: market and competitor section.
//   StatCard            drop-in (same props) for the local StatCard, so every
//                       section that uses it picks up the new look at once
//   SwotView            presentational: pass the four arrays your useMemo builds
//   PortersCard         presentational: pass the five resolved forces
//   DemandSignals       replaces the "Market Demand Signals" StatCard
//   VulnerabilityGrid   replaces the competitor vulnerability panel
// Needs BlueprintPhase2.jsx (Reveal) and ./blueprint.css
// ---------------------------------------------------------------------------
import { Reveal } from "./BlueprintPhase2.jsx";
import "./blueprint.css";

const flat = (val) => {
  if (val === null || val === undefined) return null;
  if (typeof val === "string" || typeof val === "number") return val;
  if (Array.isArray(val)) return val.map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v))).join(", ");
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
};

/* ------------------------------------------------------------------ */
/* StatCard                                                            */
/* ------------------------------------------------------------------ */
export function StatCard({
  title,
  icon: Icon,
  stat,
  subtitle,
  children,
  detailsTitle,
  detailsText,
  className = "",
}) {
  return (
    <Reveal as="article" className={`bp-stat ${className}`}>
      <header>
        <h3>{title}</h3>
        {Icon && (
          <span className="bp-stat-icon">
            <Icon size={17} />
          </span>
        )}
      </header>

      {stat && (
        <div className="bp-stat-big">
          <strong>{flat(stat)}</strong>
          {subtitle && <span>{flat(subtitle)}</span>}
        </div>
      )}

      {children && <div className="bp-stat-body">{children}</div>}

      {detailsTitle && (
        <footer>
          <h4>{detailsTitle}</h4>
          <p>{flat(detailsText)}</p>
        </footer>
      )}
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* SWOT: one matrix, a cross of hairlines, not four coloured boxes     */
/* ------------------------------------------------------------------ */
const QUADS = [
  { key: "s", tone: "green", letter: "S", title: "Strengths", sub: "Internal advantages" },
  { key: "w", tone: "amber", letter: "W", title: "Weaknesses", sub: "Internal vulnerabilities" },
  { key: "o", tone: "orange", letter: "O", title: "Opportunities", sub: "Market tailwinds" },
  { key: "t", tone: "rose", letter: "T", title: "Threats", sub: "External competitors and risks" },
];

export function SwotView({ strengths = [], weaknesses = [], opportunities = [], threats = [] }) {
  const data = { s: strengths, w: weaknesses, o: opportunities, t: threats };
  return (
    <section className="bp-swot" aria-label="SWOT analysis">
      {QUADS.map((q, i) => (
        <Reveal key={q.key} delay={i * 90} className={`bp-swot-q is-${q.tone}`}>
          <div className="bp-swot-head">
            <span>{q.letter}</span>
            <div>
              <h4>{q.title}</h4>
              <small>{q.sub}</small>
            </div>
          </div>
          <ul>
            {data[q.key].map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        </Reveal>
      ))}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Porter's five forces: level shown as three pips                     */
/* ------------------------------------------------------------------ */
const pipsFor = (level) => {
  const l = String(level || "").toLowerCase().trim();
  if (l.includes("high") || l.includes("strong") || l.includes("poor") || l === "3") {
    return { n: 3, tone: "rose", text: level || "High" };
  }
  if (l.includes("low") || l.includes("weak") || l.includes("good") || l === "1") {
    return { n: 1, tone: "green", text: level || "Low" };
  }
  return { n: 2, tone: "amber", text: level || "Moderate" };
};

export function PortersCard({ forces = [] }) {
  return (
    <Reveal as="article" className="bp-stat">
      <header>
        <h3>Porter’s five forces</h3>
      </header>
      <div className="bp-stat-big">
        <strong>Market defensibility</strong>
        <span>Industry structure and competitive moats</span>
      </div>
      <ul className="bp-forces">
        {forces.map((item) => {
          const label = item?.label || item?.name || "Market Force";
          const rawLevel = item?.level ?? item?.force?.level ?? item?.force?.intensity ?? item?.rating;
          const analysis = item?.analysis ?? item?.force?.analysis ?? item?.force?.explanation ?? item?.description;
          const { n, tone, text } = pipsFor(rawLevel);
          const displayLevel = rawLevel || text;
          return (
            <li key={label}>
              <div>
                <b>{label}</b>
                <span className={`bp-pips is-${tone}`} title={displayLevel}>
                  {[1, 2, 3].map((p) => (
                    <i key={p} className={p <= n ? "is-on" : ""} />
                  ))}
                  <em>{displayLevel}</em>
                </span>
              </div>
              {analysis && <p>{analysis}</p>}
            </li>
          );
        })}
      </ul>
      <footer>
        <h4>Defensibility strategy</h4>
        <p>
          Compound user workflow telemetry and proprietary data pipelines to steadily raise customer switching
          barriers.
        </p>
      </footer>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* Demand signals                                                      */
/* ------------------------------------------------------------------ */
export function DemandSignals({ domain, demand, opportunities = [], competitors = [] }) {
  return (
    <Reveal as="article" className="bp-stat">
      <header>
        <h3>Market demand signals</h3>
      </header>
      <div className="bp-stat-big">
        <strong>{domain || "Market intelligence"}</strong>
        <span>Sector validation and tailwinds</span>
      </div>
      <div className="bp-stat-body">
        <h5 className="bp-label">Opportunities and tailwinds</h5>
        <ul className="bp-arrows">
          {opportunities.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ul>
        <h5 className="bp-label">Industry competitors</h5>
        <div className="bp-tags">
          {competitors.map((c, i) => (
            <span key={i}>{typeof c === "string" ? c : c?.name || "Competitor"}</span>
          ))}
        </div>
      </div>
      <footer>
        <h4>Demand dynamics</h4>
        <p>{demand || "Growing tailwinds driven by demand for autonomous AI workflows."}</p>
      </footer>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* Competitor vulnerabilities & incumbent intelligence                 */
/* ------------------------------------------------------------------ */
const joined = (v) => (Array.isArray(v) ? v.join("; ") : v);

export function VulnerabilityGrid({ items = [], vulnerabilities = [] }) {
  const list = items?.length > 0 ? items : vulnerabilities || [];
  return (
    <section className="bp-vuln" aria-label="Competitor vulnerabilities">
      <Reveal className="bp-vuln-head">
        <h3>Where incumbents are weak</h3>
        <p>Structural weaknesses of competitors, what they provide, and the winning wedge you can use to win share.</p>
      </Reveal>
      <div className="bp-vuln-grid">
        {list.map((c, i) => (
          <Reveal as="article" key={i} delay={(i % 3) * 90} className="bp-vuln-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
              <h4>{c.competitor}</h4>
              <span className="bp-chip"><i />Incumbent</span>
            </div>
            <dl>
              <dt>What it provides</dt>
              <dd>{c.offering || c.description || c.provides || `${c.competitor} offers established domain features but relies on complex, legacy manual processes.`}</dd>

              <dt>Disadvantages & weaknesses</dt>
              <dd>{joined(c.weaknesses || c.weakness || "Clunky, slow, and expensive for modern automated workflows.")}</dd>

              {c.missedOpportunities && (
                <>
                  <dt>Missed opportunity</dt>
                  <dd>{joined(c.missedOpportunities)}</dd>
                </>
              )}
            </dl>
            <div className="bp-wedge">
              <small>Your winning wedge</small>
              <p>{c.suggestedDifferentiation || "Deliver a fast, frictionless solution tailored specifically to user pain points at higher velocity."}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
