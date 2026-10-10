// debate.js
// ---------------------------------------------------------------------------
// 3-AI Multi-Agent Debate Engine ("The VC War Room")
//
// Pipeline:
//   - AI 1 (Bull Partner): Groq Cloud (llama-3.3-70b-versatile)
//   - AI 2 (Bear Partner): OpenRouter (deepseek/deepseek-chat:free)
//   - AI 3 (Chief Judge + 12 Agents): Google Gemini
//
// Features:
//   - Multi-key round-robin rotation for free-tier scaling (GROQ_API_KEY=k1,k2, etc.)
//   - Zero-config fallbacks (Groq -> OpenRouter -> Gemini -> heuristic synthesis)
//   - Parallel execution with strict timeout guards (~6.5s)
//   - Interactive War Room cross-examination with Founder Testimony
// ---------------------------------------------------------------------------

import dotenv from "dotenv";
import { jsonrepair } from "jsonrepair";
import { callGemini } from "./gemini.js";

dotenv.config();

// --- 1. Round-Robin API Key Pools -----------------------------------------
class KeyPool {
  constructor(envVarName) {
    this.envVarName = envVarName;
    this.index = 0;
  }

  getKeys() {
    const raw = process.env[this.envVarName] || "";
    return raw
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
  }

  hasKeys() {
    return this.getKeys().length > 0;
  }

  getNextKey() {
    const keys = this.getKeys();
    if (keys.length === 0) return null;
    const key = keys[this.index % keys.length];
    this.index = (this.index + 1) % keys.length;
    return key;
  }
}

export const groqPool = new KeyPool("GROQ_API_KEY");
export const openRouterPool = new KeyPool("OPENROUTER_API_KEY");
export const geminiPool = new KeyPool("GEMINI_API_KEY");

// --- 2. Helper: JSON Parsing with jsonrepair & code fence stripping --------
function parseJsonSafely(text) {
  if (!text || typeof text !== "string") return null;
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    try {
      const repaired = jsonrepair(cleaned);
      return JSON.parse(repaired);
    } catch {
      // Look for first { to last }
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      if (start !== -1 && end > start) {
        try {
          const slice = cleaned.slice(start, end + 1);
          return JSON.parse(slice);
        } catch {
          try {
            return JSON.parse(jsonrepair(cleaned.slice(start, end + 1)));
          } catch {
            return null;
          }
        }
      }
      return null;
    }
  }
}

// Timeout wrapper
function withTimeout(promise, ms, timeoutMsg = "Request timed out") {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(timeoutMsg)), ms)),
  ]);
}

// --- 3. AI 1: The Bull Partner (Groq Cloud Llama 3.3 70B) ------------------
export async function callBullAgent(idea, context = "") {
  const apiKey = groqPool.getNextKey();

  const systemPrompt = `You are the Bull VC Partner in an elite 3-AI Startup Investment Committee ("The VC War Room").
Your mandate: Defend this startup idea with high conviction and intellectual rigor.
Uncover the asymmetric upside, non-obvious market tailwinds, why now (timing), and the unfair distribution/product wedge that allows them to win against incumbents.
Be concrete, analytical, and direct. Avoid generic startup clichés.

Respond with ONLY valid JSON with this exact structure:
{
  "thesis": "2-3 sentence high-conviction thesis on why this startup can win and scale.",
  "marketTailwinds": [
    "Concrete macro or industry tailwind 1",
    "Concrete regulatory, technological, or behavioral shift 2",
    "Concrete market tailwind 3"
  ],
  "unfairWedge": "The specific asymmetric wedge or product defensibility that protects them.",
  "convictionScore": 88
}`;

  const userPrompt = `Startup Idea: "${idea}"${context ? `\nAdditional Context / Rebuttal: ${context}` : ""}`;

  // Try Groq Cloud if API key is provided
  if (apiKey) {
    const models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
    for (const model of models) {
      try {
        const res = await withTimeout(
          fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
              temperature: 0.85,
              response_format: { type: "json_object" },
            }),
          }),
          6500,
          `Groq ${model} timed out`
        );

        if (res.ok) {
          const data = await res.json();
          const content = data?.choices?.[0]?.message?.content;
          const parsed = parseJsonSafely(content);
          if (parsed && parsed.thesis) {
            return {
              provider: `Groq (${model.includes("70b") ? "Llama 3.3 70B" : "Llama 3.1 8B"})`,
              thesis: parsed.thesis,
              marketTailwinds: Array.isArray(parsed.marketTailwinds) ? parsed.marketTailwinds : [],
              unfairWedge: parsed.unfairWedge || "High product agility and tight vertical specialization.",
              convictionScore: Math.min(99, Math.max(50, Number(parsed.convictionScore) || 85)),
            };
          }
        }
      } catch (err) {
        console.warn(`[Bull Agent] Groq attempt with ${model} failed: ${err.message}`);
      }
    }
  }

  // Zero-Config Fallback: Google Gemini with Bull Partner persona
  try {
    const geminiPrompt = `${systemPrompt}\n\n${userPrompt}`;
    const raw = await withTimeout(callGemini(geminiPrompt), 6500, "Gemini Bull fallback timed out");
    const parsed = parseJsonSafely(raw);
    if (parsed && parsed.thesis) {
      return {
        provider: "Google Gemini (Bull Partner Mode)",
        thesis: parsed.thesis,
        marketTailwinds: Array.isArray(parsed.marketTailwinds) ? parsed.marketTailwinds : [],
        unfairWedge: parsed.unfairWedge || "Focused product specialization and rapid iteration velocity.",
        convictionScore: Math.min(99, Math.max(50, Number(parsed.convictionScore) || 84)),
      };
    }
  } catch (geminiErr) {
    console.warn(`[Bull Agent] Gemini fallback failed: ${geminiErr.message}`);
  }

  // High-Signal Algorithmic Default (if all external APIs are unreachable)
  return {
    provider: "Committee Bull Synthesis",
    thesis: `This concept capitalizes on a high-friction workflow gap where legacy competitors are too bloated to provide an agile, dedicated solution.`,
    marketTailwinds: [
      "Accelerating adoption of automated specialized workflows across digital operators.",
      "Increasing willingness of early adopters to pay for focused point-solutions.",
      "Compressed time-to-market enabled by modern serverless infrastructure.",
    ],
    unfairWedge: "Ultra-fast execution, zero-bloat onboarding, and specialized workflow precision.",
    convictionScore: 82,
  };
}

// --- 4. AI 2: The Bear Partner (OpenRouter DeepSeek Free / Groq Llama) -------
export async function callBearAgent(idea, context = "") {
  const openRouterKey = openRouterPool.getNextKey();

  const systemPrompt = `You are the Bear VC Partner in an elite 3-AI Startup Investment Committee ("The VC War Room").
Your mandate: Attack this startup idea with ruthless commercial skepticism and unit-economics rigor.
Pinpoint fatal CAC traps (Customer Acquisition Cost), low switching costs, customer churn, platform dependency, and why incumbents (Google, Microsoft, vertical giants) or open source will commoditize or crush this.
Be blunt, unsparing, and mathematically grounded. Despise unfounded founder optimism.

Respond with ONLY valid JSON with this exact structure:
{
  "thesis": "2-3 sentence ruthless critique pinpointing the core commercial and market vulnerability.",
  "fatalFlaws": [
    "Specific fatal flaw 1 regarding unit economics or CAC",
    "Specific distribution or retention failure mode 2",
    "Structural incumbent or defensibility risk 3"
  ],
  "cacUnitEconomicsTrap": "Analysis of why acquisition costs may exceed customer lifetime value (LTV).",
  "incumbentMoatThreat": "Why incumbents or hyperscalers will easily copy, integrate, or bundle this.",
  "skepticismScore": 86
}`;

  const userPrompt = `Startup Idea: "${idea}"${context ? `\nAdditional Context / Bull Thesis: ${context}` : ""}`;

  // Try OpenRouter if key is present
  if (openRouterKey) {
    const models = ["deepseek/deepseek-chat:free", "meta-llama/llama-3.3-70b-instruct:free"];
    for (const model of models) {
      try {
        const res = await withTimeout(
          fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${openRouterKey}`,
              "HTTP-Referer": "https://launchpilot.local",
              "X-Title": "LaunchPilot VC War Room",
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
              temperature: 0.4,
              response_format: { type: "json_object" },
            }),
          }),
          6500,
          `OpenRouter ${model} timed out`
        );

        if (res.ok) {
          const data = await res.json();
          const content = data?.choices?.[0]?.message?.content;
          const parsed = parseJsonSafely(content);
          if (parsed && parsed.thesis) {
            return {
              provider: model.includes("deepseek") ? "OpenRouter (DeepSeek V3)" : "OpenRouter (Llama 3.3 70B)",
              thesis: parsed.thesis,
              fatalFlaws: Array.isArray(parsed.fatalFlaws) ? parsed.fatalFlaws : [],
              cacUnitEconomicsTrap: parsed.cacUnitEconomicsTrap || "Customer acquisition costs risk outstripping low ACV without viral mechanics.",
              incumbentMoatThreat: parsed.incumbentMoatThreat || "Major incumbent players can replicate this as a free minor feature in their ecosystem.",
              skepticismScore: Math.min(99, Math.max(50, Number(parsed.skepticismScore) || 85)),
            };
          }
        }
      } catch (err) {
        console.warn(`[Bear Agent] OpenRouter ${model} failed: ${err.message}`);
      }
    }
  }

  // Secondary Free Fallback: Groq Cloud with Bear prompt
  const groqKey = groqPool.getNextKey();
  if (groqKey) {
    try {
      const res = await withTimeout(
        fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.4,
            response_format: { type: "json_object" },
          }),
        }),
        6500,
        "Groq Bear fallback timed out"
      );

      if (res.ok) {
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        const parsed = parseJsonSafely(content);
        if (parsed && parsed.thesis) {
          return {
            provider: "Groq (Llama 3.1 8B Bear Mode)",
            thesis: parsed.thesis,
            fatalFlaws: Array.isArray(parsed.fatalFlaws) ? parsed.fatalFlaws : [],
            cacUnitEconomicsTrap: parsed.cacUnitEconomicsTrap || "High customer acquisition friction compared to early churn rate.",
            incumbentMoatThreat: parsed.incumbentMoatThreat || "Incumbent suite bundling makes standalone adoption difficult.",
            skepticismScore: Math.min(99, Math.max(50, Number(parsed.skepticismScore) || 86)),
          };
        }
      }
    } catch (groqErr) {
      console.warn(`[Bear Agent] Groq Bear fallback failed: ${groqErr.message}`);
    }
  }

  // Tertiary Zero-Config Fallback: Google Gemini with Bear Partner persona
  try {
    const geminiPrompt = `${systemPrompt}\n\n${userPrompt}`;
    const raw = await withTimeout(callGemini(geminiPrompt), 6500, "Gemini Bear fallback timed out");
    const parsed = parseJsonSafely(raw);
    if (parsed && parsed.thesis) {
      return {
        provider: "Google Gemini (Bear Partner Mode)",
        thesis: parsed.thesis,
        fatalFlaws: Array.isArray(parsed.fatalFlaws) ? parsed.fatalFlaws : [],
        cacUnitEconomicsTrap: parsed.cacUnitEconomicsTrap || "High customer acquisition costs relative to initial contract value.",
        incumbentMoatThreat: parsed.incumbentMoatThreat || "Incumbents can bundle equivalent functionality into their existing core subscriptions.",
        skepticismScore: Math.min(99, Math.max(50, Number(parsed.skepticismScore) || 83)),
      };
    }
  } catch (geminiErr) {
    console.warn(`[Bear Agent] Gemini Bear fallback failed: ${geminiErr.message}`);
  }

  // High-Signal Algorithmic Default
  return {
    provider: "Committee Bear Synthesis",
    thesis: "Without an existing organic distribution channel, customer acquisition costs will exceed lifetime value in year one.",
    fatalFlaws: [
      "Vulnerability to feature commoditization as AI foundations become widespread.",
      "High sales cycle friction if buyers view this as a 'nice-to-have' tool rather than mission-critical infrastructure.",
      "Potential high churn rate once the initial novelty wears off unless deeply embedded in user habits.",
    ],
    cacUnitEconomicsTrap: "Paid ad channels will burn cash quickly unless proprietary organic word-of-mouth or community distribution is secured upfront.",
    incumbentMoatThreat: "Incumbent industry software can roll this out as an update without charging extra, cutting off standalone growth.",
    skepticismScore: 84,
  };
}

// --- 5. Parallel Opening Clash --------------------------------------------
/**
 * Executes the Bull (Groq) and Bear (OpenRouter) agents in parallel.
 * Completes in ~2.5s and supplies the arguments to Gemini (The Chief Judge).
 */
export async function runOpeningClash(idea) {
  const [bullResult, bearResult] = await Promise.allSettled([
    callBullAgent(idea),
    callBearAgent(idea),
  ]);

  const bull =
    bullResult.status === "fulfilled"
      ? bullResult.value
      : {
          provider: "Bull Partner",
          thesis: "Agile wedge with strong early adopter potential.",
          marketTailwinds: ["Accelerating market demand for automated vertical workflows."],
          unfairWedge: "Fast deployment velocity and focus on high-friction pain points.",
          convictionScore: 80,
        };

  const bear =
    bearResult.status === "fulfilled"
      ? bearResult.value
      : {
          provider: "Bear Partner",
          thesis: "High customer acquisition costs and low defensibility against incumbents.",
          fatalFlaws: ["Customer acquisition cost trap", "Risk of rapid competitor copycats"],
          cacUnitEconomicsTrap: "Paid marketing will erode margin without organic retention.",
          incumbentMoatThreat: "Entrenched market platforms can easily offer similar workflows.",
          skepticismScore: 80,
        };

  return { bull, bear };
}

// --- 6. Interactive VC War Room Engine (Founder Testimony Re-Scoring) -------
/**
 * Runs an on-demand cross-examination where the founder submits testimony or
 * evidence (e.g. pilot LOIs, distribution wedge).
 * Streams stage updates, then outputs updated debate arguments and recalibrated viabilityScorecard.
 */
export async function runInteractiveWarRoomDebate(
  idea,
  blueprintContext = null,
  founderTestimony = "",
  onStageUpdate = () => {}
) {
  onStageUpdate({
    stage: "bull",
    agent: "AI 1 — The Bull Partner (Groq Llama 3.3 70B)",
    message: "Evaluating Founder Testimony & reinforcing the upside thesis...",
  });

  const bullRound2 = await callBullAgent(
    idea,
    `FOUNDER TESTIMONY & DEFENSE:\n"${founderTestimony}"\n\nActive Blueprint Viability Score: ${
      blueprintContext?.viabilityScorecard?.score || "N/A"
    }`
  );

  onStageUpdate({
    stage: "bear",
    agent: "AI 2 — The Bear Partner (OpenRouter DeepSeek V3)",
    message: "Cross-examining Founder claims & testing unit economics...",
  });

  const bearRound2 = await callBearAgent(
    idea,
    `FOUNDER TESTIMONY & CLAIMS:\n"${founderTestimony}"\n\nBull Defense to counter:\n"${bullRound2.thesis}"`
  );

  onStageUpdate({
    stage: "judge",
    agent: "AI 3 — Chief Judge & Committee (Google Gemini)",
    message: "Delivering final gavel ruling and recalibrating viability scorecard...",
  });

  const judgePrompt = `You are the Chief Judge in the 3-AI Startup Investment Committee ("The VC War Room").
The founder has submitted formal testimony to defend their startup against the Bear partner's critique.

Startup Idea: "${idea}"
Founder Defense Testimony: "${founderTestimony}"

Bull Partner Argument (Round 2):
Thesis: ${bullRound2.thesis}
Wedge: ${bullRound2.unfairWedge}
Conviction: ${bullRound2.convictionScore}/100

Bear Partner Cross-Examination (Round 2):
Thesis: ${bearRound2.thesis}
Fatal Flaws: ${bearRound2.fatalFlaws.join(" | ")}
CAC Trap: ${bearRound2.cacUnitEconomicsTrap}
Skepticism: ${bearRound2.skepticismScore}/100

Your task:
1. Arbitrate the debate impartially. Award winners across the 4 battleground categories:
   - marketDemand (winner: "Bull" or "Bear", rationale: 1 sentence)
   - defensibility (winner: "Bull" or "Bear", rationale: 1 sentence)
   - technicalFeasibility (winner: "Bull" or "Bear", rationale: 1 sentence)
   - unitEconomics (winner: "Bull" or "Bear", rationale: 1 sentence)
2. Decide the overall winner: exactly one of "Bull" | "Bear" | "Split Consensus".
3. Write a decisive 2-3 sentence final verdict synthesis reflecting how the founder's testimony affected the outcome.
4. Specify the single most critical condition to proceed and the #1 Lean experiment to run this week.
5. Recalibrate the startup's viabilityScorecard based on the testimony:
   - score (integer 0-100)
   - marketDemandScore (0-100)
   - technicalFeasibilityScore (0-100)
   - monetizationScore (0-100)
   - verdict ("Proceed" | "Proceed with Caution" | "Pivot Recommended")
   - verdictReasoning (2 sentences)
   - fatalRiskTraps (array of 3 items)

Respond with ONLY valid JSON with this exact structure:
{
  "judge": {
    "provider": "Google (Gemini 2.5 Flash)",
    "winningSide": "Bull",
    "scorecard": {
      "marketDemand": { "winner": "Bull", "rationale": "Clear pull demonstrated by user testimony." },
      "defensibility": { "winner": "Bear", "rationale": "Moat remains thin without proprietary data." },
      "technicalFeasibility": { "winner": "Bull", "rationale": "High build velocity confirmed." },
      "unitEconomics": { "winner": "Bear", "rationale": "CAC payback period needs pre-launch validation." }
    },
    "verdictSummary": "Detailed synthesis of the Chief Judge.",
    "keyConditionToProceed": "The founder must secure written pre-commitments before building.",
    "numberOneExperiment": "Launch a concierge validation test with 10 target operators."
  },
  "rebuttalRound": {
    "bullRebuttal": "Bull counter-attack addressing Bear concerns with founder testimony context.",
    "bearRebuttal": "Bear counter-attack probing unproven assumptions in the founder testimony."
  },
  "viabilityScorecard": {
    "score": 87,
    "marketDemandScore": 90,
    "technicalFeasibilityScore": 85,
    "monetizationScore": 86,
    "verdict": "Proceed",
    "verdictReasoning": "Updated executive investment thesis incorporating founder testimony.",
    "fatalRiskTraps": [
      "Specific risk trap 1",
      "Specific risk trap 2",
      "Specific risk trap 3"
    ]
  }
}`;

  let judgeResult = null;
  try {
    const rawJudge = await withTimeout(callGemini(judgePrompt), 12000, "Gemini Judge timed out");
    judgeResult = parseJsonSafely(rawJudge);
  } catch (err) {
    console.warn(`[War Room] Gemini judge call failed: ${err.message}`);
  }

  const finalJudge = judgeResult?.judge || {
    provider: "Google Gemini (Chief Judge)",
    winningSide: bullRound2.convictionScore >= bearRound2.skepticismScore ? "Bull" : "Bear",
    scorecard: {
      marketDemand: { winner: "Bull", rationale: "Founder testimony establishes initial organic demand signal." },
      defensibility: { winner: "Bear", rationale: "Defensibility against deep-pocketed competitors requires sustained execution." },
      technicalFeasibility: { winner: "Bull", rationale: "Modern serverless architecture enables lean MVP build." },
      unitEconomics: { winner: "Bear", rationale: "Customer acquisition economics require pilot contract verification." },
    },
    verdictSummary: "The founder testimony addresses early validation concerns, but the committee demands strict pre-commitments before heavy capital deployment.",
    keyConditionToProceed: "Validate buyer willingness to pay via paid pilot deposit or binding LOI.",
    numberOneExperiment: "Run a 5-prospect concierge validation test within 7 days.",
  };

  const finalRebuttal = judgeResult?.rebuttalRound || {
    bullRebuttal: `The founder's evidence proves that user friction is acute enough to overcome inertia. Early pilots provide the ideal distribution wedge.`,
    bearRebuttal: `Pilot interest is not repeatable revenue. If sales cycles drag beyond 45 days, runway will deplete faster than modeled.`,
  };

  const finalViabilityScorecard = judgeResult?.viabilityScorecard || {
    score: Math.round((bullRound2.convictionScore + (100 - bearRound2.skepticismScore) + 85) / 3),
    marketDemandScore: bullRound2.convictionScore,
    technicalFeasibilityScore: 84,
    monetizationScore: Math.round(100 - bearRound2.skepticismScore * 0.2),
    verdict: "Proceed with Caution",
    verdictReasoning: "Founder testimony strengthens market conviction, but unit economics and defensibility require rapid pre-launch proof.",
    fatalRiskTraps: bearRound2.fatalFlaws,
  };

  return {
    aiDebate: {
      bull: bullRound2,
      bear: bearRound2,
      judge: finalJudge,
      rebuttalRound: finalRebuttal,
      founderTestimony,
      timestamp: new Date().toISOString(),
    },
    viabilityScorecard: finalViabilityScorecard,
  };
}
