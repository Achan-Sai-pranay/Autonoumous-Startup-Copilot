// components/BlueprintPhase1.jsx
// ---------------------------------------------------------------------------
// Blueprint reader, Phase 1: Venture Hero + Multi-Agent Investment Committee
// Replaces the dark gradient top banner and dark 3-box consensus widget with
// clean, high-craft surfaces matching the terracotta and graphite design system.
// ---------------------------------------------------------------------------
import { Check, X, Pencil, TrendingUp, AlertTriangle, Scale, Gavel, ArrowRight } from "lucide-react";
import "./home.css";
import "./workspace.css";
import "./blueprint.css";

const safeText = (val, fallback = "") => (typeof val === "string" && val.trim() ? val : fallback);

/* ------------------------------------------------------------------ */
/* 1. Venture Hero Banner                                              */
/* ------------------------------------------------------------------ */
export function VentureHero({
  title,
  industry,
  description,
  isEditing,
  editedTitle,
  setEditedTitle,
  onStartEdit,
  onSave,
  onCancel,
  inputRef,
}) {
  return (
    <div className="bp-hero">
      <div className="bp-hero-title">
        {isEditing ? (
          <div className="bp-edit-row">
            <input
              ref={inputRef}
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSave();
                if (e.key === "Escape") onCancel();
              }}
              aria-label="Edit venture title"
              autoFocus
            />
            <button
              type="button"
              className="bp-edit"
              onClick={onSave}
              title="Save title"
              aria-label="Save title"
            >
              <Check size={16} />
            </button>
            <button
              type="button"
              className="bp-edit"
              onClick={onCancel}
              title="Cancel editing"
              aria-label="Cancel editing"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <h1>{title}</h1>
            <button
              type="button"
              className="bp-edit"
              onClick={onStartEdit}
              title="Edit venture title"
              aria-label="Edit venture title"
            >
              <Pencil size={15} />
            </button>
          </>
        )}
      </div>

      <div className="bp-hero-side">
        {industry && (
          <div className="bp-chip">
            <i aria-hidden="true" />
            <span>
              Industry: <b>{industry}</b>
            </span>
          </div>
        )}
        {description && <p>{description}</p>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Committee Verdict Consensus Card                                 */
/* ------------------------------------------------------------------ */
export function AiDebateSummaryCard({
  aiDebate,
  viabilityScorecard,
  onEnterWarRoom = () => {},
}) {
  const bull = aiDebate?.bull || {
    provider: "Groq (Llama 3.3 70B)",
    thesis:
      "There is strong demand for a simple, focused solution that solves this specific user pain faster and easier than existing tools.",
    unfairWedge: "Fast setup, simple design, and solving one clear problem exceptionally well.",
    convictionScore: 86,
  };

  const bear = aiDebate?.bear || {
    provider: "OpenRouter (DeepSeek V3)",
    thesis:
      "Acquiring users affordably without expensive advertising will be challenging, especially if users already rely on existing habits.",
    cacUnitEconomicsTrap: "Ad costs can eat up margins unless users keep returning or recommend it by word-of-mouth.",
    skepticismScore: 83,
  };

  const judge = aiDebate?.judge || {
    provider: "Google (Gemini 2.5 Flash)",
    winningSide: bull.convictionScore >= bear.skepticismScore ? "Bull" : "Bear",
    verdictSummary:
      viabilityScorecard?.verdictReasoning ||
      "The committee recommends moving forward, starting with quick, direct conversations with real target users to confirm interest before heavy development.",
    keyConditionToProceed: "Talk with 5-10 real target users to verify they actively want this solution.",
    numberOneExperiment: "Run a simple 7-day landing page or pre-order test to prove real demand.",
  };

  const bullScore = bull.convictionScore || 85;
  const bearScore = bear.skepticismScore || 83;
  const winningSide = judge.winningSide || (bullScore >= bearScore ? "Bull" : "Bear");
  const isBull = String(winningSide).toLowerCase().includes("bull");
  const isBear = String(winningSide).toLowerCase().includes("bear");

  const verdictText = isBull
    ? "Bull consensus (Strong upside)"
    : isBear
    ? "Bear skepticism (High caution)"
    : "Balanced consensus";

  return (
    <div id="vc-war-room-consensus-card" className="bp-committee">
      <div className="bp-c-head">
        <div>
          <h3>Multi-agent investment committee</h3>
          <p>
            Live multi-model analysis between Groq (Llama 3.3), OpenRouter (DeepSeek V3) and Google (Gemini 2.5 Flash).
          </p>
        </div>
        <div className={`bp-verdict ${isBull ? "is-bull" : isBear ? "is-bear" : ""}`}>
          <Gavel size={14} />
          <span>{verdictText}</span>
        </div>
      </div>

      <div className="bp-balance">
        <div className="bp-balance-nums">
          <div className="is-bull">
            <span>Bull conviction</span>
            <strong>{bullScore}%</strong>
          </div>
          <div className="is-bear">
            <span>Bear skepticism</span>
            <strong>{bearScore}%</strong>
          </div>
        </div>
        <div className="bp-bar" aria-hidden="true">
          <i style={{ flex: bullScore }} />
          <i style={{ flex: bearScore }} />
        </div>
      </div>

      <div className="bp-args">
        <div className="bp-arg is-bull">
          <h4>
            <TrendingUp size={15} />
            <span>Bull partner</span>
            <small>{safeText(bull.provider, "Groq • Llama 3.3 70B")}</small>
          </h4>
          <blockquote>"{safeText(bull.thesis)}"</blockquote>
          <dl>
            <dt>Key advantage</dt>
            <dd>{safeText(bull.unfairWedge)}</dd>
          </dl>
        </div>

        <div className="bp-arg is-bear">
          <h4>
            <AlertTriangle size={15} />
            <span>Bear partner</span>
            <small>{safeText(bear.provider, "OpenRouter • DeepSeek V3")}</small>
          </h4>
          <blockquote>"{safeText(bear.thesis)}"</blockquote>
          <dl>
            <dt>Top risk to avoid</dt>
            <dd>{safeText(bear.cacUnitEconomicsTrap)}</dd>
          </dl>
        </div>
      </div>

      <div className="bp-ruling">
        <div>
          <h4>
            <Scale size={15} />
            <span>Chief judge's ruling</span>
          </h4>
          <p>{safeText(judge.verdictSummary)}</p>
        </div>
        <dl>
          <div>
            <dt>Key condition to proceed</dt>
            <dd>{safeText(judge.keyConditionToProceed)}</dd>
          </div>
          <div>
            <dt>#1 Quick test to run</dt>
            <dd>{safeText(judge.numberOneExperiment, "Talk with 10 potential customers before writing code.")}</dd>
          </div>
        </dl>
      </div>

      <div className="bp-c-foot">
        <p>
          <b>VC War Room</b>
          Full 3-model debate transcript and founder defense station ready.
        </p>
        <button
          type="button"
          className="hp-btn hp-btn--primary hp-btn--sm"
          onClick={onEnterWarRoom}
        >
          <span>Enter VC War Room</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
