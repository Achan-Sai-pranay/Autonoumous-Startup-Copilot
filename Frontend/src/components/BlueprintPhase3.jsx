// BlueprintPhase3.jsx
// ---------------------------------------------------------------------------
// Phase 3 of the blueprint reader redesign (same props and behavior as before).
//   AiDebateWarRoomSection          default export, replaces AiDebateWarRoom.jsx's
//   VenturusViabilityGaugeChart     replaces the one in CompetitorUpgrades.jsx
//   VenturusMarketSizeBubbleChart   replaces the one in CompetitorUpgrades.jsx
// Needs BlueprintPhase1.jsx and BlueprintPhase2.jsx plus ./blueprint.css
// ---------------------------------------------------------------------------
import { useState, memo } from "react";
import {
  Gavel,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Scale,
  Loader2,
  Sparkles,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Reveal, useReveal, useCountUp } from "./BlueprintPhase2.jsx";
import "./home.css";
import "./workspace.css";
import "./blueprint.css";

function text(val, fallback = "") {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") return val.trim() || fallback;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (Array.isArray(val)) return val.map((v) => text(v)).filter(Boolean).join(" • ") || fallback;
  if (typeof val === "object") return val.text || val.title || val.message || val.rationale || JSON.stringify(val);
  return String(val);
}

const ROUNDS = [
  { id: "debate", label: "Opening arguments", sub: "Round 1" },
  { id: "rebuttal", label: "Cross-examination", sub: "Round 2" },
  { id: "scorecard", label: "Scorecard and ruling", sub: "Round 3" },
];

const SAMPLES = [
  "We already talked to 15 target users who confirmed this is an everyday headache they want fixed.",
  "We have a direct organic way to reach target users (niche communities, existing followers) without spending on ads.",
  "Our team has years of direct personal experience dealing with this exact problem firsthand.",
];

/* ================================================================== */
/* War Room                                                            */
/* ================================================================== */
export default function AiDebateWarRoomSection({
  aiDebate = {},
  blueprint = {},
  originalIdea = "",
  onUpdateAiDebate = () => {},
  onUpdateViabilityScorecard = () => {},
  onToast = () => {},
}) {
  const [activeTab, setActiveTab] = useState("debate");
  const [founderTestimony, setFounderTestimony] = useState("");
  const [isDebating, setIsDebating] = useState(false);
  const [streamStage, setStreamStage] = useState(null);

  const bull = aiDebate?.bull || {
    provider: "Groq (Llama 3.3 70B)",
    thesis:
      "There is strong genuine demand for a simple, focused solution that solves this specific user pain faster and easier than existing alternatives.",
    marketTailwinds: [
      "Growing user demand for simple tools that get straight to the point.",
      "Early adopters are actively seeking faster solutions to replace manual or clunky workarounds.",
      "Modern cloud tools make it affordable and quick to build and launch version 1.",
    ],
    unfairWedge: "Fast setup, simple design, and solving one clear problem exceptionally well.",
    convictionScore: 88,
  };
  const bear = aiDebate?.bear || {
    provider: "OpenRouter (DeepSeek V3)",
    thesis:
      "Acquiring users affordably without expensive advertising will be challenging, especially if users already rely on existing habits.",
    fatalFlaws: [
      "Advertising costs can quickly exceed revenues if customers don't stick around long-term.",
      "If it's too easy for users to switch away, retention could drop after the first month.",
      "Larger established apps could add similar features if they notice high demand.",
    ],
    cacUnitEconomicsTrap:
      "Customer acquisition costs could exceed customer lifetime spend unless word-of-mouth or direct outreach works well.",
    incumbentMoatThreat: "Existing popular tools already have established user bases and could add this as a free perk.",
    skepticismScore: 84,
  };
  const judge = aiDebate?.judge || {
    provider: "Google (Gemini 2.5 Flash)",
    winningSide: bull.convictionScore >= bear.skepticismScore ? "Bull" : "Bear",
    scorecard: {
      marketDemand: { winner: "Bull", rationale: "Clear everyday frustration and real search interest from users." },
      defensibility: { winner: "Bear", rationale: "Needs a unique feature or loyal community to keep bigger tools from copying it." },
      technicalFeasibility: { winner: "Bull", rationale: "A clean, functional prototype can be built and tested within 3 to 4 weeks." },
      unitEconomics: { winner: "Bear", rationale: "Must prove people will actively pay before spending heavily on ads or complex code." },
    },
    verdictSummary:
      "The committee agrees real customer demand exists, but the founder must confirm willingness to pay through quick direct interviews before writing extensive code.",
    keyConditionToProceed: "Talk to 5-10 real target customers to confirm they actively want and will use this.",
    numberOneExperiment: "Run a simple 7-day pre-order or waitlist test to prove real customer commitment.",
  };
  const rebuttalRound = aiDebate?.rebuttalRound || {
    bullRebuttal:
      "A simple, highly focused tool solves the exact daily headache better than bloated legacy software, driving strong organic word-of-mouth.",
    bearRebuttal:
      "Until real customers put down money or sign up eagerly, the business risks high churn and slow payback cycles.",
  };

  const bullScore = Number(bull.convictionScore) || 85;
  const bearScore = Number(bear.skepticismScore) || 85;
  const total = bullScore + bearScore || 1;

  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  const rawApiUrl = isLocalhost
    ? import.meta.env.VITE_LOCAL_API_URL || "http://localhost:5001/api/generate-blueprint"
    : import.meta.env.VITE_API_URL || "https://ideapulse-y1n5.onrender.com/api/generate-blueprint";
  const DEBATE_API_URL = rawApiUrl.includes("/api/")
    ? rawApiUrl.replace(/\/api\/[a-zA-Z0-9_-]+$/, "/api/ai-debate")
    : `${rawApiUrl.replace(/\/+$/, "")}/api/ai-debate`;

  const handleSubmitTestimony = async (e) => {
    e?.preventDefault();
    if (!founderTestimony.trim()) {
      onToast("Please type your defense testimony or evidence first.");
      return;
    }
    setIsDebating(true);
    setStreamStage({ stage: "init", message: "Convening the investment committee for cross-examination..." });

    try {
      const response = await fetch(DEBATE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: originalIdea || blueprint?.ideaAnalysis?.problem || "Startup Concept",
          blueprintContext: blueprint,
          founderTestimony: founderTestimony.trim(),
        }),
      });
      if (!response.ok) throw new Error(`Server returned ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalResult = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line);
            if (event.type === "stage") setStreamStage({ stage: event.stage, message: event.message, agent: event.agent });
            else if (event.type === "result") finalResult = event.data;
            else if (event.type === "error") throw new Error(event.message);
          } catch {
            // non-fatal frame parse
          }
        }
      }

      if (!finalResult) throw new Error("No debate result received");
      if (finalResult.aiDebate) onUpdateAiDebate(finalResult.aiDebate);
      if (finalResult.viabilityScorecard) onUpdateViabilityScorecard(finalResult.viabilityScorecard);
      onToast("The committee delivered its verdict. Viability scorecard recalibrated.");
    } catch (err) {
      console.error("Founder testimony debate error:", err);
      onToast(`Debate update failed: ${err.message}. Retrying via fallback...`);
      const simulatedDebate = {
        ...aiDebate,
        founderTestimony: founderTestimony.trim(),
        bull: {
          ...bull,
          thesis: `With evidence of "${founderTestimony.slice(0, 80)}...", organic distribution and early customer pull neutralize initial CAC concerns.`,
          convictionScore: Math.min(96, bullScore + 4),
        },
        rebuttalRound: {
          bullRebuttal: `The founder's testimony provides the concrete wedge: "${founderTestimony.slice(0, 120)}", proving buyers will actively engage.`,
          bearRebuttal: `While the testimony demonstrates early interest, the committee still requires pilot renewals and contract retention proof.`,
        },
        judge: {
          ...judge,
          winningSide: "Bull",
          verdictSummary: `Founder testimony materially strengthens conviction. The committee advances the score with advice to lock in multi-month retention covenants.`,
        },
      };
      onUpdateAiDebate(simulatedDebate);
      onToast("Updated the War Room with your defense.");
    } finally {
      setIsDebating(false);
      setStreamStage(null);
    }
  };

  const categories = [
    { key: "marketDemand", label: "Market demand", fallback: { winner: "Bull", rationale: "Clear organic pull." } },
    { key: "defensibility", label: "Defensibility and moat", fallback: { winner: "Bear", rationale: "Incumbent copy risk." } },
    { key: "technicalFeasibility", label: "Technical feasibility", fallback: { winner: "Bull", rationale: "Fast to build." } },
    { key: "unitEconomics", label: "Unit economics", fallback: { winner: "Bear", rationale: "High CAC payback." } },
  ];

  const list = (items) => (Array.isArray(items) ? items : []);

  return (
    <div id="vc-war-room-container" className="bp-wr">
      {/* Intro */}
      <Reveal as="header" className="bp-wr-intro">
        <div>
          <span className="bp-chip">
            <i />
            Parallel multi-agent pipeline
          </span>
          <h2>The VC War Room</h2>
          <p>
            Three specialist models from separate providers pressure-test every idea. The bull defends the upside,
            the bear attacks the risks, and the judge delivers the ruling that shapes your blueprint.
          </p>
        </div>
        <ul className="bp-wr-models">
          <li className="is-bull">
            <i />
            <b>Bull</b>
            <span>{text(bull.provider, "Groq Llama 3.3 70B")}</span>
          </li>
          <li className="is-bear">
            <i />
            <b>Bear</b>
            <span>{text(bear.provider, "OpenRouter DeepSeek V3")}</span>
          </li>
          <li className="is-judge">
            <i />
            <b>Judge</b>
            <span>{text(judge.provider, "Google Gemini 2.5 Flash")}</span>
          </li>
        </ul>
      </Reveal>

      {/* Console */}
      <Reveal className="bp-wr-console">
        <div className="bp-wr-balance">
          <div className="bp-balance-nums">
            <div className="is-bull">
              <strong>{bullScore}</strong>
              <span>Bull conviction</span>
            </div>
            <div className="is-judge">
              <span className="bp-verdict">
                <Scale size={15} />
                {judge.winningSide || "Balanced"} ruling
              </span>
            </div>
            <div className="is-bear">
              <strong>{bearScore}</strong>
              <span>Bear skepticism</span>
            </div>
          </div>
          <div className="bp-bar">
            <i style={{ flex: bullScore / total }} />
            <i style={{ flex: bearScore / total }} />
          </div>
        </div>

        <div className="hp-seg bp-wr-seg" role="tablist" aria-label="Debate rounds">
          {ROUNDS.map((r) => (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={activeTab === r.id}
              className={activeTab === r.id ? "is-on" : ""}
              onClick={() => setActiveTab(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div key={activeTab} className="bp-fade">
          {activeTab === "debate" && (
            <div className="bp-args">
              <article className="bp-arg is-bull">
                <h4>
                  <TrendingUp size={16} /> Upside and market tailwinds
                </h4>
                <blockquote>{text(bull.thesis)}</blockquote>
                <ul className="bp-points">
                  {list(bull.marketTailwinds).map((t, i) => (
                    <li key={i}>
                      <CheckCircle2 size={16} />
                      <span>{text(t)}</span>
                    </li>
                  ))}
                </ul>
                <dl>
                  <dt>Why customers will choose this</dt>
                  <dd>{text(bull.unfairWedge)}</dd>
                </dl>
              </article>

              <article className="bp-arg is-bear">
                <h4>
                  <AlertTriangle size={16} /> Critical risks and hurdles
                </h4>
                <blockquote>{text(bear.thesis)}</blockquote>
                <ul className="bp-points">
                  {list(bear.fatalFlaws).map((t, i) => (
                    <li key={i}>
                      <XCircle size={16} />
                      <span>{text(t)}</span>
                    </li>
                  ))}
                </ul>
                <dl>
                  <dt>Risk of competitors copying this</dt>
                  <dd>{text(bear.incumbentMoatThreat)}</dd>
                </dl>
              </article>
            </div>
          )}

          {activeTab === "rebuttal" && (
            <div className="bp-thread">
              <p className="bp-thread-note">
                The models answer each other directly. Watch how the bull handles the acquisition-cost trap and how
                the bear takes apart founder optimism.
              </p>
              <div className="bp-bubble is-bull">
                <small>Bull’s reply to the bear</small>
                <p>
                  {text(
                    rebuttalRound.bullRebuttal,
                    "The acute workflow friction creates organic word-of-mouth that bypasses high-CAC advertising channels."
                  )}
                </p>
              </div>
              <div className="bp-bubble is-bear">
                <small>Bear’s reply to the bull</small>
                <p>
                  {text(
                    rebuttalRound.bearRebuttal,
                    "Without written financial commitments, organic interest fails to convert to long-term renewals."
                  )}
                </p>
              </div>
            </div>
          )}

          {activeTab === "scorecard" && (
            <div>
              <ul className="bp-score-list">
                {categories.map((c) => {
                  const d = judge.scorecard?.[c.key] || c.fallback;
                  const isBull = d?.winner === "Bull";
                  return (
                    <li key={c.key}>
                      <span className={`bp-win ${isBull ? "is-bull" : "is-bear"}`}>{isBull ? "Bull wins" : "Bear wins"}</span>
                      <b>{c.label}</b>
                      <p>{text(d?.rationale)}</p>
                    </li>
                  );
                })}
              </ul>
              <div className="bp-ruling">
                <div>
                  <h4>
                    <Gavel size={16} /> Chief judge’s synthesis
                  </h4>
                  <p>{text(judge.verdictSummary)}</p>
                </div>
                <dl>
                  <div>
                    <dt>Non-negotiable condition to proceed</dt>
                    <dd>{text(judge.keyConditionToProceed)}</dd>
                  </div>
                  <div>
                    <dt>Number one lean experiment</dt>
                    <dd>{text(judge.numberOneExperiment)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>
      </Reveal>

      {/* Founder defense */}
      <Reveal id="founder-testimony-defense-box" className="bp-defend">
        <div className="bp-defend-head">
          <span className="bp-defend-icon">
            <ShieldCheck size={20} />
          </span>
          <div>
            <h3>Defend your startup</h3>
            <p>Bring real evidence, letters of intent, pilots or proprietary channels and the committee will re-score.</p>
          </div>
        </div>

        <form onSubmit={handleSubmitTestimony} className="bp-defend-box">
          <textarea
            id="founder-testimony-input"
            value={founderTestimony}
            onChange={(e) => setFounderTestimony(e.target.value)}
            disabled={isDebating}
            rows={4}
            aria-label="Founder testimony"
            placeholder="We interviewed 15 target users who confirmed this problem, we plan to reach them directly in active online communities, and 20 people are on our waiting list."
          />
          <div className="bp-defend-chips">
            <span>Quick add</span>
            {SAMPLES.map((s, i) => (
              <button key={i} type="button" onClick={() => setFounderTestimony(s)} disabled={isDebating}>
                {s.slice(0, 38)}…
              </button>
            ))}
          </div>
          <div className="bp-defend-bar">
            <span className="bp-defend-status">
              {streamStage ? (
                <>
                  <Loader2 size={15} className="bp-spin" />
                  {streamStage.message}
                </>
              ) : (
                "Submitting streams live updates through the bull, the bear and the judge."
              )}
            </span>
            <button type="submit" className="hp-btn hp-btn--primary" disabled={isDebating || !founderTestimony.trim()}>
              {isDebating ? <Loader2 size={15} className="bp-spin" /> : <Gavel size={15} />}
              {isDebating ? "Arbitrating..." : "Submit and re-score"}
            </button>
          </div>
        </form>
      </Reveal>
    </div>
  );
}

/* ================================================================== */
/* Viability gauge                                                     */
/* ================================================================== */
const num = (val, fallback) => {
  if (typeof val === "number" && !isNaN(val)) return val;
  if (typeof val === "string") {
    const m = val.match(/\d+(\.\d+)?/);
    if (m) return parseFloat(m[0]);
  }
  return fallback;
};
const clamp = (n) => Math.max(0, Math.min(100, n));

export const VenturusViabilityGaugeChart = memo(function VenturusViabilityGaugeChart({ viabilityScorecard, ideaTitle }) {
  const [ref, shown] = useReveal(0.3);
  const score = clamp(num(viabilityScorecard?.score, 84));
  const subs = [
    { label: "Demand", value: clamp(num(viabilityScorecard?.marketDemandScore, 88)) },
    { label: "Tech", value: clamp(num(viabilityScorecard?.technicalFeasibilityScore, 82)) },
    { label: "Monetization", value: clamp(num(viabilityScorecard?.monetizationScore, 85)) },
  ];
  const rawVerdict = viabilityScorecard?.verdict;
  const verdict = text(typeof rawVerdict === "string" ? rawVerdict : rawVerdict?.verdict || rawVerdict?.title, "Proceed");
  const title = text(ideaTitle, "this venture");
  const short = title.length > 55 ? `${title.slice(0, 55)}...` : title;
  const counted = useCountUp(score, shown);
  const ARC = Math.PI * 90; // half circle, radius 90

  return (
    <section ref={ref} className="bp-viz">
      <h3>Viability for {short}</h3>
      <div className="bp-gauge">
        <svg viewBox="0 0 220 125" aria-hidden="true">
          <path d="M 20 110 A 90 90 0 0 1 200 110" className="track" />
          <path
            d="M 20 110 A 90 90 0 0 1 200 110"
            className="bar"
            style={{ strokeDasharray: ARC, strokeDashoffset: shown ? ARC * (1 - score / 100) : ARC }}
          />
        </svg>
        <div>
          <strong>{Math.round(counted)}</strong>
          <span>out of 100</span>
        </div>
      </div>
      <span className="bp-verdict">{verdict}</span>
      <ul className="bp-subs">
        {subs.map((s) => (
          <li key={s.label}>
            <span>
              {s.label} <b>{s.value}%</b>
            </span>
            <div>
              <i style={{ width: shown ? `${s.value}%` : "0%" }} />
            </div>
          </li>
        ))}
      </ul>
      <p>A composite of market demand, technical feasibility and monetization readiness.</p>
    </section>
  );
});

/* ================================================================== */
/* Market size bubbles                                                 */
/* ================================================================== */
export const VenturusMarketSizeBubbleChart = memo(function VenturusMarketSizeBubbleChart({ marketSizing, ideaTitle }) {
  const [ref, shown] = useReveal(0.3);
  const [hover, setHover] = useState(null);

  const pick = (item, fv, fd) => {
    if (!item) return { value: fv, description: fd };
    if (typeof item === "string" || typeof item === "number") return { value: String(item), description: fd };
    const v = item.value ?? item.size ?? item.total ?? item.amount ?? item.marketSize ?? fv;
    const d = item.description ?? item.rationale ?? item.explanation ?? item.notes ?? fd;
    return {
      value: typeof v === "object" ? v.value || v.amount || JSON.stringify(v) : String(v ?? fv),
      description: typeof d === "object" ? d.description || d.text || JSON.stringify(d) : String(d ?? fd),
    };
  };

  const rows = [
    { id: "tam", short: "TAM", name: "Total addressable market", ...pick(marketSizing?.tam, "258M", "Potential customers across the total addressable market") },
    { id: "sam", short: "SAM", name: "Serviceable available market", ...pick(marketSizing?.sam, "51M", "Potential customers in the primary beachhead segment") },
    { id: "som", short: "SOM", name: "Serviceable obtainable market", ...pick(marketSizing?.som, "13M", "Realistic capture target in the first 1 to 3 years") },
  ];

  const title = text(ideaTitle, "this venture");
  const short = title.length > 55 ? `${title.slice(0, 55)}...` : title;

  return (
    <section ref={ref} className={`bp-viz bp-market ${shown ? "is-in" : ""}`}>
      <h3>Market size for {short}</h3>
      <div className="bp-bubbles">
        {rows.map((r, i) => (
          <button
            key={r.id}
            type="button"
            className={`bp-bubble-c is-${r.id} ${hover === r.id ? "is-hover" : ""}`}
            style={{ "--i": i }}
            onMouseEnter={() => setHover(r.id)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(r.id)}
            onBlur={() => setHover(null)}
          >
            <strong>{r.value}</strong>
            <span>{r.short}</span>
          </button>
        ))}
      </div>
      <div className="bp-market-cards">
        {rows.map((r) => (
          <div key={r.id} className={`is-${r.id} ${hover === r.id ? "is-hover" : ""}`} onMouseEnter={() => setHover(r.id)} onMouseLeave={() => setHover(null)}>
            <b>{r.name}</b>
            <p>{r.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
});
