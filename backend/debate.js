// debate.js
// ---------------------------------------------------------------------------
// 3-AI Multi-Agent Debate Engine ("The VC War Room")
//
// Models:
//   - AI 1 (Bull Partner): Groq Cloud (llama-3.3-70b-versatile)
//   - AI 2 (Bear Partner): OpenRouter (deepseek/deepseek-chat:free)
//   - AI 3 (Chief Judge + 12 Agents): Google Gemini
//
// Key Principles:
//   - Crystal-clear, plain-English explanations (no confusing buzzwords or MBA jargon)
//   - 100% grounded in the user's specific startup idea and real customers
//   - Multi-key round-robin rotation for free-tier scaling
//   - Resilient zero-config fallback to Gemini or idea-aware heuristics
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

// Idea-aware fallback generators (plain English, no hardcoded SaaS templates)
function buildIdeaSnippet(idea) {
  const clean = (idea || "").replace(/["\n\r]/g, " ").trim();
  return clean.length > 90 ? clean.slice(0, 90) + "..." : clean;
}

function getContextualBullFallback(idea) {
  const snippet = buildIdeaSnippet(idea);
  return {
    provider: "Committee Bull Partner",
    thesis: `This idea solves a clear, real problem for its target users. By keeping the initial version simple, focused, and fast to use, it can quickly win loyal early fans who are tired of existing clunky workarounds.`,
    marketTailwinds: [
      `Strong and growing interest from people specifically looking for better solutions for ${snippet}.`,
      "Users today prefer focused, easy tools that save time rather than bloated, complicated software.",
      "Low startup costs make it possible to build an MVP and start getting real feedback within weeks.",
    ],
    unfairWedge: "High personal touch with early users, faster updates, and a much simpler experience than competitors.",
    convictionScore: 84,
  };
}

function getContextualBearFallback(idea) {
  const snippet = buildIdeaSnippet(idea);
  return {
    provider: "Committee Bear Partner",
    thesis: `The biggest danger is getting noticed and convincing people to pay. Even if ${snippet} is a great idea, finding customers and getting them to switch from what they already do is harder and costs more than founders expect.`,
    fatalFlaws: [
      "Willingness to Pay Risk: People might say the idea sounds cool in casual conversations, but hesitate when asked to actually pay real money.",
      "Marketing Cost Trap: If you have to pay for online ads to find every single user, advertising costs can quickly exceed what customers pay you.",
      "Competitor Copycats: Established tools or larger existing platforms might easily add a similar feature once they see you getting traction.",
    ],
    cacUnitEconomicsTrap: "Finding paying customers through ads will drain money quickly unless your early users love it enough to recommend it by word-of-mouth.",
    incumbentMoatThreat: "Big existing companies already have millions of users and could roll out a similar feature for free to keep users on their platform.",
    skepticismScore: 82,
  };
}

// --- 3. AI 1: The Bull Partner (Groq Cloud Llama 3.3 70B) ------------------
export async function callBullAgent(idea, context = "") {
  const apiKey = groqPool.getNextKey();

  const systemPrompt = `You are the Bull Partner in a 3-AI Startup Committee ("The VC War Room").
Your mandate: Defend this startup idea with high conviction, practical optimism, and simple, plain English.
Explain clearly why customers will love this product, what real-world trends make this the right time to build it, and what unfair advantage allows this startup to win against existing competitors.

CRITICAL LANGUAGE MANDATES:
1. USE SIMPLE, EVERYDAY 8TH-GRADE ENGLISH: Speak like a smart, friendly mentor talking to a friend over coffee. Keep sentences short, punchy, and clear.
2. BANNED WORDS (DO NOT USE ANY OF THESE):
   - NO financial jargon: "CAPEX", "OPEX", "CAC", "LTV", "EBITDA", "ROI", "unit economics".
   - NO consulting buzzwords: "cohort", "secular migration", "suburban nodes", "nodes", "hyper-local", "asymmetric wedge", "wedge", "paradigm shift", "vector of disruption", "deep data gravity", "vertical point solution", "point solution", "flywheel", "disintermediation".
3. 100% SPECIFIC TO THIS IDEA: Ground every sentence directly in this exact startup concept: "${idea}". Name the actual people (e.g. neighbors, families, dog owners, shoppers, students) and what they actually buy or do.

Respond with ONLY valid JSON with this exact structure:
{
  "thesis": "2-3 clear, enthusiastic sentences in plain English explaining why this startup can succeed and grow.",
  "marketTailwinds": [
    "Simple real-world trend or user habit shift 1 that helps this idea",
    "Simple real-world trend or helpful technology shift 2",
    "Simple real-world trend 3"
  ],
  "unfairWedge": "The single biggest practical advantage or unique edge that lets this startup win customers.",
  "convictionScore": 88
}`;

  const userPrompt = `Startup Idea: "${idea}"${context ? `\nAdditional Context / Rebuttal: ${context}` : ""}`;

  // Try Groq Cloud if API key is provided
  if (apiKey) {
    const models = [
      "openai/gpt-oss-120b",
      "qwen/qwen3.8-27b",
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
    ];
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
              temperature: 0.8,
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
            const displayModel = model.includes("gpt-oss-120b")
              ? "GPT-OSS 120B"
              : model.includes("qwen")
              ? "Qwen 3.8 27B"
              : model.includes("70b")
              ? "Llama 3.3 70B"
              : "Llama 3.1 8B";
            return {
              provider: `Groq (${displayModel})`,
              thesis: parsed.thesis,
              marketTailwinds: Array.isArray(parsed.marketTailwinds) ? parsed.marketTailwinds : [],
              unfairWedge: parsed.unfairWedge || "Focused product experience and personal connection with early adopters.",
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
        provider: "Google Gemini (Bull Partner)",
        thesis: parsed.thesis,
        marketTailwinds: Array.isArray(parsed.marketTailwinds) ? parsed.marketTailwinds : [],
        unfairWedge: parsed.unfairWedge || "Simple product design and rapid iteration speed.",
        convictionScore: Math.min(99, Math.max(50, Number(parsed.convictionScore) || 84)),
      };
    }
  } catch (geminiErr) {
    console.warn(`[Bull Agent] Gemini fallback failed: ${geminiErr.message}`);
  }

  return getContextualBullFallback(idea);
}

// --- 4. AI 2: The Bear Partner (OpenRouter DeepSeek Free / Groq Llama) -------
export async function callBearAgent(idea, context = "") {
  const openRouterKey = openRouterPool.getNextKey();

  const systemPrompt = `You are the Bear Partner in a 3-AI Startup Committee ("The VC War Room").
Your mandate: Protect the founder from blind optimism by highlighting the real, honest risks and dangers of this startup in simple, plain English.
Explain why customers might not pay, why finding customers could cost too much, and why existing competitors or large platforms might crush or copy this.

CRITICAL LANGUAGE MANDATES:
1. USE SIMPLE, EVERYDAY 8TH-GRADE ENGLISH: Speak like an experienced, caring startup mentor who is being 100% honest about failure modes. Keep sentences short and clear.
2. BANNED WORDS (DO NOT USE ANY OF THESE):
   - NO financial jargon: "CAPEX", "OPEX", "CAC", "LTV", "EBITDA", "ROI", "unit economics", "TAM".
   - NO consulting buzzwords: "cohort", "secular migration", "suburban nodes", "nodes", "hyper-local", "asymmetric wedge", "wedge", "paradigm shift", "vector of disruption", "deep data gravity", "vertical point solution", "point solution", "flywheel", "disintermediation", "incumbent bundling", "feature commoditization".
   - Instead of "high CAC trap", write "spending more on advertising than each customer actually pays".
   - Instead of "incumbent bundling", write "big existing companies adding this feature for free".
   - Instead of "low switching barriers", write "customers easily canceling and going elsewhere".
3. 100% SPECIFIC TO THIS IDEA: Ground every warning directly in this exact startup concept: "${idea}".

Respond with ONLY valid JSON with this exact structure:
{
  "thesis": "2-3 clear, honest sentences in plain English pinpointing the biggest practical dangers and why this could fail.",
  "fatalFlaws": [
    "Specific customer or willingness-to-pay risk 1",
    "Specific marketing or customer-finding trap 2",
    "Specific competitor or copycat danger 3"
  ],
  "cacUnitEconomicsTrap": "Simple explanation of why getting customers might cost more money than they pay you.",
  "incumbentMoatThreat": "Simple explanation of how big existing companies or competitors could copy or undercut this.",
  "skepticismScore": 84
}`;

  const userPrompt = `Startup Idea: "${idea}"${context ? `\nAdditional Context / Bull Thesis: ${context}` : ""}`;

  // Try OpenRouter if key is present
  if (openRouterKey) {
    const models = [
      "google/gemma-4-31b-it:free",
      "nvidia/nemotron-3-super-120b-a12b:free",
      "deepseek/deepseek-chat:free",
      "meta-llama/llama-3.3-70b-instruct:free",
    ];
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
            const providerName = model.includes("gemma")
              ? "OpenRouter (Gemma 4 31B)"
              : model.includes("nemotron")
              ? "OpenRouter (Nemotron 120B)"
              : model.includes("deepseek")
              ? "OpenRouter (DeepSeek V3)"
              : "OpenRouter (Llama 3.3 70B)";
            return {
              provider: providerName,
              thesis: parsed.thesis,
              fatalFlaws: Array.isArray(parsed.fatalFlaws) ? parsed.fatalFlaws : [],
              cacUnitEconomicsTrap: parsed.cacUnitEconomicsTrap || "Marketing and ad costs risk exceeding what users actually pay.",
              incumbentMoatThreat: parsed.incumbentMoatThreat || "Larger competitors can easily copy this feature into their existing apps.",
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
            cacUnitEconomicsTrap: parsed.cacUnitEconomicsTrap || "Ad spend can eat up all profit unless early users spread the word.",
            incumbentMoatThreat: parsed.incumbentMoatThreat || "Established apps could release a similar feature for free.",
            skepticismScore: Math.min(99, Math.max(50, Number(parsed.skepticismScore) || 85)),
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
        provider: "Google Gemini (Bear Partner)",
        thesis: parsed.thesis,
        fatalFlaws: Array.isArray(parsed.fatalFlaws) ? parsed.fatalFlaws : [],
        cacUnitEconomicsTrap: parsed.cacUnitEconomicsTrap || "Getting customers through paid ads risks burning cash too quickly.",
        incumbentMoatThreat: parsed.incumbentMoatThreat || "Existing market leaders could add similar functionality for free.",
        skepticismScore: Math.min(99, Math.max(50, Number(parsed.skepticismScore) || 83)),
      };
    }
  } catch (geminiErr) {
    console.warn(`[Bear Agent] Gemini Bear fallback failed: ${geminiErr.message}`);
  }

  return getContextualBearFallback(idea);
}

// --- 5. Parallel Opening Clash --------------------------------------------
export async function runOpeningClash(idea) {
  const [bullResult, bearResult] = await Promise.allSettled([
    callBullAgent(idea),
    callBearAgent(idea),
  ]);

  const bull =
    bullResult.status === "fulfilled"
      ? bullResult.value
      : getContextualBullFallback(idea);

  const bear =
    bearResult.status === "fulfilled"
      ? bearResult.value
      : getContextualBearFallback(idea);

  return { bull, bear };
}

// --- 6. Interactive VC War Room Engine (Founder Testimony Re-Scoring) -------
export async function runInteractiveWarRoomDebate(
  idea,
  blueprintContext = null,
  founderTestimony = "",
  onStageUpdate = () => {}
) {
  onStageUpdate({
    stage: "bull",
    agent: "AI 1 — The Bull Partner (Groq Llama 3.3 70B)",
    message: "Evaluating your evidence & reinforcing the upside thesis...",
  });

  const bullRound2 = await callBullAgent(
    idea,
    `FOUNDER DEFENSE & EVIDENCE:\n"${founderTestimony}"\n\nCurrent Viability Score: ${
      blueprintContext?.viabilityScorecard?.score || "N/A"
    }`
  );

  onStageUpdate({
    stage: "bear",
    agent: "AI 2 — The Bear Partner (OpenRouter DeepSeek V3)",
    message: "Cross-examining claims & checking customer economics...",
  });

  const bearRound2 = await callBearAgent(
    idea,
    `FOUNDER DEFENSE & CLAIMS:\n"${founderTestimony}"\n\nBull Counter-Argument:\n"${bullRound2.thesis}"`
  );

  onStageUpdate({
    stage: "judge",
    agent: "AI 3 — Chief Judge (Google Gemini)",
    message: "Issuing final plain-English ruling & updating scorecard...",
  });

  const judgePrompt = `You are the Chief Judge in the 3-AI Startup Committee ("The VC War Room").
The founder has submitted formal testimony/evidence to defend their startup against the Bear partner's critique.

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

CRITICAL LANGUAGE MANDATES:
1. USE SIMPLE, EVERYDAY 8TH-GRADE ENGLISH: Speak like a clear, wise advisor explaining the decision in plain words.
2. BANNED WORDS (DO NOT USE ANY OF THESE):
   - NO financial jargon: "CAPEX", "OPEX", "CAC", "LTV", "EBITDA", "ROI", "unit economics", "TAM".
   - NO consulting buzzwords: "cohort", "secular migration", "suburban nodes", "nodes", "hyper-local", "asymmetric wedge", "wedge", "paradigm shift", "vector of disruption", "deep data gravity", "vertical point solution", "point solution", "flywheel", "disintermediation", "incumbent bundling".
3. 100% RELEVANT: Talk specifically about this exact startup concept and the founder's testimony.
4. Award winners across the 4 key battleground questions:
   - marketDemand: Do real people want this? (winner: "Bull" or "Bear", rationale: 1 simple sentence)
   - defensibility: Can competitors easily copy or kill this? (winner: "Bull" or "Bear", rationale: 1 simple sentence)
   - technicalFeasibility: Can the founder build it quickly? (winner: "Bull" or "Bear", rationale: 1 simple sentence)
   - unitEconomics: Can the business make a healthy profit per customer? (winner: "Bull" or "Bear", rationale: 1 simple sentence)

Respond with ONLY valid JSON with this exact structure:
{
  "judge": {
    "provider": "Google (Gemini 2.5 Flash)",
    "winningSide": "Bull",
    "scorecard": {
      "marketDemand": { "winner": "Bull", "rationale": "Clear demand verified by founder testimony." },
      "defensibility": { "winner": "Bear", "rationale": "Defensibility still needs unique features to stop copycats." },
      "technicalFeasibility": { "winner": "Bull", "rationale": "Simple first version can be built quickly." },
      "unitEconomics": { "winner": "Bull", "rationale": "Direct customer access helps keep marketing costs low." }
    },
    "verdictSummary": "2-3 clear, helpful sentences explaining the final ruling in plain English.",
    "keyConditionToProceed": "The single most important milestone the founder must hit before spending big money.",
    "numberOneExperiment": "A simple, practical test the founder can run this week with real people to prove customer interest."
  },
  "rebuttalRound": {
    "bullRebuttal": "Bull counter-attack in plain English addressing Bear concerns with the founder's new evidence.",
    "bearRebuttal": "Bear counter-attack in plain English pointing out remaining unproven assumptions."
  },
  "viabilityScorecard": {
    "score": 87,
    "marketDemandScore": 90,
    "technicalFeasibilityScore": 85,
    "monetizationScore": 86,
    "verdict": "Proceed",
    "verdictReasoning": "Two friendly, plain-English sentences explaining the updated score.",
    "fatalRiskTraps": [
      "Real risk 1 in plain English",
      "Real risk 2 in plain English",
      "Real risk 3 in plain English"
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
      marketDemand: { winner: "Bull", rationale: "Founder testimony provides encouraging early signal of real demand." },
      defensibility: { winner: "Bear", rationale: "Defending against larger rivals will require fast execution and loyal users." },
      technicalFeasibility: { winner: "Bull", rationale: "A simple MVP can be launched and tested with modern tools quickly." },
      unitEconomics: { winner: "Bear", rationale: "Customer willingness to pay must be verified through real paid orders." },
    },
    verdictSummary: "The founder testimony addresses early concerns well. The committee approves moving forward with advice to pre-sell to 5 customers before heavy coding.",
    keyConditionToProceed: "Get 3 to 5 real customers to pre-order or commit before building the full product.",
    numberOneExperiment: "Run a 7-day concierge test to see if 5 people will pay for the solution manually.",
  };

  const finalRebuttal = judgeResult?.rebuttalRound || {
    bullRebuttal: `The founder's evidence shows that user pain is real and pressing. Personal outreach provides a strong starting distribution channel.`,
    bearRebuttal: `Early interest is a great start, but until money changes hands, low switching costs leave risk of customer drop-off.`,
  };

  const finalViabilityScorecard = judgeResult?.viabilityScorecard || {
    score: Math.round((bullRound2.convictionScore + (100 - bearRound2.skepticismScore) + 85) / 3),
    marketDemandScore: bullRound2.convictionScore,
    technicalFeasibilityScore: 84,
    monetizationScore: Math.round(100 - bearRound2.skepticismScore * 0.2),
    verdict: "Proceed with Caution",
    verdictReasoning: "Founder testimony strengthens market conviction. Focus on getting your first 3 paying customers this week.",
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
