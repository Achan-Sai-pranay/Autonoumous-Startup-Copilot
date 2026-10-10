// agents.js
// ---------------------------------------------------------------------------
// 3-AI Multi-Agent Debate + LLM-as-a-Judge Blueprint Architecture:
//
// 1. Parallel Opening Clash:
//    - AI 1: Bull Partner (Groq Cloud Llama 3.3 70B)
//    - AI 2: Bear Partner (OpenRouter DeepSeek Free / Groq Llama)
// 2. Chief Judge & 12 Intelligence Agents:
//    - AI 3: Google Gemini (Chief Judge arbitrates the debate, outputs
//      "aiDebate", and generates all 12 Blueprint sections grounded in
//      the Judge's ruling)
// ---------------------------------------------------------------------------

import { callGemini, streamGemini } from "./gemini.js";
import { runOpeningClash } from "./debate.js";

// Shared instruction so Gemini always returns clean, parseable JSON.
const JSON_ONLY_RULE = `
Respond with ONLY valid JSON. No markdown, no code fences, no explanations,
no text before or after the JSON object. The JSON must match the exact
structure requested.
- Do not include trailing commas in arrays or objects.
`;

// Placeholder stored for any section that's missing or malformed in the
// response.
function unavailableSection() {
  return { error: true, message: "Generation unavailable. Please retry." };
}

// Ordered list of step groups.
const STEPS = [
  { keys: ["ideaAnalysis", "viabilityScorecard", "aiDebate"], name: "Venture Viability & 3-AI Debate" },
  { keys: ["customerDiscovery", "customerPersona"], name: "Lean Customer Discovery & Personas" },
  { keys: ["swotAnalysis", "portersFiveForces"], name: "Strategic Frameworks (SWOT & Porter's)" },
  { keys: ["marketResearch", "marketSizing"], name: "Market Intelligence & Sizing (TAM/SAM/SOM)" },
  { keys: ["competitorWeaknessAnalysis"], name: "Competitor Vulnerability Matrix" },
  { keys: ["productPlan"], name: "Product Planning & MVP Scope" },
  { keys: ["technicalArchitecture"], name: "Technical Architecture" },
  { keys: ["businessStrategy"], name: "Business Strategy & Monetization" },
  { keys: ["pitch"], name: "Pitch & Executive Synthesis" },
  { keys: ["roadmap"], name: "Startup Roadmap" },
  { keys: ["goToMarket"], name: "Go-to-Market Engine" },
  { keys: ["launchChecklist", "costEstimator", "revenueSimulator"], name: "Launch Checklist & Financials" },
];

export const AGENT_STEP_NAMES = STEPS.map((s) => s.name);

// The primary JSON key that indicates the beginning of each step's generation
const STEP_START_KEYS = [
  "ideaAnalysis",
  "customerDiscovery",
  "swotAnalysis",
  "marketResearch",
  "competitorWeaknessAnalysis",
  "productPlan",
  "technicalArchitecture",
  "businessStrategy",
  "pitch",
  "roadmap",
  "goToMarket",
  "launchChecklist",
];

// ---------------------------------------------------------------------------
// Mega-Prompt with Bull Thesis + Bear Critique injected
// ---------------------------------------------------------------------------
function buildMegaPrompt(idea, openingClash = null) {
  const bull = openingClash?.bull;
  const bear = openingClash?.bear;

  return `
You are IdeaPulse AI, an institutional-grade startup investment committee and autonomous venture creation engine.
You are acting as AI 3 — THE CHIEF JUDGE & LEAD VENTURE ARCHITECT.

Startup idea:
"${idea}"

================================================================================
3-AI INVESTMENT COMMITTEE DEBATE CONTEXT ("THE VC WAR ROOM")
================================================================================
The opening clash was fought in parallel between your two committee partners:

🟢 AI 1 — THE BULL PARTNER (${bull?.provider || "Groq • Llama 3.3 70B"}):
- Conviction Score: ${bull?.convictionScore || 85}/100
- Core Upside Thesis: ${bull?.thesis || "Rapid workflow wedge with strong organic pull."}
- Market Tailwinds: ${JSON.stringify(bull?.marketTailwinds || ["Accelerating vertical workflow automation"])}
- Unfair Wedge: ${bull?.unfairWedge || "Focused product specialization and fast deployment."}

🔴 AI 2 — THE BEAR PARTNER (${bear?.provider || "OpenRouter • DeepSeek V3"}):
- Skepticism Score: ${bear?.skepticismScore || 85}/100
- Core Risk Critique: ${bear?.thesis || "High CAC risk and vulnerable to incumbent bundling."}
- Fatal Flaws: ${JSON.stringify(bear?.fatalFlaws || ["Severe customer acquisition cost trap", "Feature commoditization risk"])}
- CAC / Unit Economics Trap: ${bear?.cacUnitEconomicsTrap || "Acquisition costs risk outstripping lifetime value."}
- Incumbent Threat: ${bear?.incumbentMoatThreat || "Major incumbent platforms can bundle equivalent functionality."}

YOUR CHIEF JUDGE MANDATE:
1. ARBITRATE THE DEBATE in key "aiDebate":
   - Formulate a sharp 1-round direct Cross-Examination Rebuttal between them ("rebuttalRound.bullRebuttal" vs "rebuttalRound.bearRebuttal").
   - Score the battle across 4 critical categories: marketDemand, defensibility, technicalFeasibility, unitEconomics (winner: "Bull"|"Bear", with sharp 1-sentence rationale).
   - Issue the Chief Judge's ruling: winningSide ("Bull" | "Bear" | "Split Consensus"), verdictSummary (2-3 sentences), keyConditionToProceed (the single most critical assumption the founder must prove), and numberOneExperiment (the #1 Lean pre-launch experiment to settle the debate without writing code).
2. GROUND ALL 12 SECTIONS IN THIS DEBATE:
   - "viabilityScorecard" must reflect the real balance of the Bull vs. Bear debate.
   - "customerDiscovery" questions and red flags must test the Bear's specific fatal flaws.
   - "swotAnalysis", "productPlan", "businessStrategy", and "goToMarket" must directly target the defensibility wedge and CAC traps exposed.

---
PART A — STRATEGIC VENTURE EVALUATION & VALIDATION

ROLE 1 — Senior Startup Analyst → key "ideaAnalysis"
Analyze the core problem, goal, domain, and honest feasibility assessment.

ROLE 2 — Venture Viability Evaluator → key "viabilityScorecard"
Evaluate investment-readiness and survival probability:
- Composite score (integer 0–100).
- Sub-scores: marketDemandScore (0–100), technicalFeasibilityScore (0–100), monetizationScore (0–100).
- verdict: Exactly one of "Proceed" | "Proceed with Caution" | "Pivot Recommended".
- verdictReasoning: A sharp 2-sentence executive thesis explaining the verdict.
- fatalRiskTraps: Array of 3 specific, non-obvious failure modes/traps informed by the Bear critique.

ROLE 2B — Chief Judge Arbitrator → key "aiDebate"
Include the full 3-AI Investment Committee War Room consensus:
- bull: Include the Bull Partner's provider, thesis, marketTailwinds, unfairWedge, and convictionScore.
- bear: Include the Bear Partner's provider, thesis, fatalFlaws, cacUnitEconomicsTrap, incumbentMoatThreat, and skepticismScore.
- rebuttalRound:
  - bullRebuttal: Bull's direct counter-punch addressing Bear's CAC and moat critiques.
  - bearRebuttal: Bear's direct counter-punch dismantling Bull's optimistic wedge assumptions.
- judge:
  - provider: "Google (Gemini 2.5 Flash)"
  - winningSide: Exactly one of "Bull" | "Bear" | "Split Consensus"
  - scorecard:
    - marketDemand: { "winner": "Bull"|"Bear", "rationale": "1 sentence explanation" }
    - defensibility: { "winner": "Bull"|"Bear", "rationale": "1 sentence explanation" }
    - technicalFeasibility: { "winner": "Bull"|"Bear", "rationale": "1 sentence explanation" }
    - unitEconomics: { "winner": "Bull"|"Bear", "rationale": "1 sentence explanation" }
  - verdictSummary: Decisive 2-3 sentence executive synthesis from the Chief Judge.
  - keyConditionToProceed: The single most critical assumption the founder must prove.
  - numberOneExperiment: The #1 Lean validation test (e.g. 5 pre-orders, concierge pilot, or LOIs) to settle the debate without writing code.

ROLE 3 — Lean Customer Discovery Lead → key "customerDiscovery"
Validation before building:
- interviewQuestions: Array of 5 unbiased "Mom Test" validation questions to ask real prospective users (never ask "would you buy this", ask about past behavior and actual money spent).
- redFlags: Array of 3 false-positive answers that deceive founders into false confidence.
- willingnessToPaySignals: Array of 2 concrete commitment tests to prove buyer intent before writing code (e.g. LOI, pre-order deposit, concierge MVP).

ROLE 4 — UX Researcher → key "customerPersona"
Define target users, high-friction pain points, and a vivid narrative buyer profile.

---
PART B — STRATEGIC FRAMEWORKS & MARKET SIZING

ROLE 5 — Strategic Frameworks Specialist → keys "swotAnalysis" & "portersFiveForces"
Deep strategic defensibility:
- swotAnalysis:
  - strengths: Array of 3-4 internal unfair advantages.
  - weaknesses: Array of 3-4 internal vulnerabilities.
  - opportunities: Array of 3-4 external market tailwinds.
  - threats: Array of 3-4 external structural threats/incumbent actions.
- portersFiveForces: Evaluate all 5 industry forces with level ("Low" | "Moderate" | "High") and a 1-2 sentence sharp analysis:
  - buyerPower: { "level": "Low"|"Moderate"|"High", "analysis": "..." }
  - supplierPower: { "level": "Low"|"Moderate"|"High", "analysis": "..." }
  - competitiveRivalry: { "level": "Low"|"Moderate"|"High", "analysis": "..." }
  - threatOfSubstitutes: { "level": "Low"|"Moderate"|"High", "analysis": "..." }
  - threatOfNewEntry: { "level": "Low"|"Moderate"|"High", "analysis": "..." }

ROLE 6 — Market Sizing Specialist → key "marketSizing"
Calculate bottom-up market sizing metrics. IMPORTANT: Always state the full term in brackets alongside the acronym:
- tam: { "value": "$XB", "description": "TAM (Total Addressable Market) calculation rationale and methodology" }
- sam: { "value": "$YM", "description": "SAM (Serviceable Available Market) addressable target segment" }
- som: { "value": "$ZM", "description": "SOM (Serviceable Obtainable Market) realistic year 1-3 capture target" }

ROLE 7 — Market Research Analyst → key "marketResearch"
Identify primary competitors, market tailwinds/opportunities, and current demand dynamics.

ROLE 8 — Competitive Strategist → key "competitorWeaknessAnalysis"
For each competitor named in marketResearch.competitors, identify their structural weaknesses, overlooked user needs, and this startup's unfair differentiation wedge.

---
PART C — PRODUCT, TECH & MONETIZATION

ROLE 9 — Senior Product Manager → key "productPlan"
Define MVP features, future roadmap features, and development prioritization logic.

ROLE 10 — Software Architect → key "technicalArchitecture"
Recommend modern production-ready frontend, backend, database, hosting, relevant AI APIs, and high-level architectural design.

ROLE 11 — Business Strategist → key "businessStrategy"
Define revenue model, recommended pricing tiers, and acquisition marketing channels.

ROLE 12 — Startup Pitch Coach → key "pitch"
Craft a high-conviction 1-2 sentence elevator pitch and 3-4 sentence executive summary.

ROLE 13 — Technical Project Manager → key "roadmap"
Create a 4-to-6 milestone roadmap (Week 1 through Week N) with concrete deliverables and post-milestone launch plan.

---
PART D — EXECUTION SUITE & FINANCIALS

ROLE 14 — Growth Marketer → key "goToMarket"
Define target audience, high-converting platforms (LinkedIn, Reddit, X, etc.) with explanations, LinkedIn search queries, cold email template, LinkedIn DM template, Reddit launch post, and X (Twitter) launch post.

ROLE 15 — Launch Operations Lead → key "launchChecklist"
A flat list of 4-7 actionable, sequential pre-launch action items.

ROLE 16 — Financial Planner → keys "costEstimator" & "revenueSimulator"
- costEstimator: Monthly costs for domain, hosting, database, aiApis, email, analytics, storage, authentication (with freeTierSufficient flags) and monthly/yearly totals.
- revenueSimulator: Projections at 100, 500, 1000, and 5000 users with pricing assumptions.

---
Return ONE JSON object with this exact structure:
{
  "ideaAnalysis": {
    "problem": "the core problem this idea solves, 2-3 sentences",
    "goal": "the main goal/mission of this product, 1-2 sentences",
    "domain": "the industry/domain this belongs to, e.g. B2B SaaS, FinTech, HealthTech",
    "feasibility": "a short honest assessment of how feasible this is to build, 2-3 sentences"
  },
  "viabilityScorecard": {
    "score": 84,
    "marketDemandScore": 88,
    "technicalFeasibilityScore": 82,
    "monetizationScore": 85,
    "verdict": "Proceed",
    "verdictReasoning": "Two-sentence executive investment thesis reflecting the 3-AI committee ruling.",
    "fatalRiskTraps": ["Specific failure trap 1", "Specific failure trap 2", "Specific failure trap 3"]
  },
  "aiDebate": {
    "bull": {
      "provider": "${bull?.provider || "Groq (Llama 3.3 70B)"}",
      "thesis": "${bull?.thesis ? bull.thesis.replace(/"/g, '\\"') : "Core upside thesis"}",
      "marketTailwinds": ${JSON.stringify(bull?.marketTailwinds || ["Tailwind 1", "Tailwind 2"])},
      "unfairWedge": "${bull?.unfairWedge ? bull.unfairWedge.replace(/"/g, '\\"') : "Unfair distribution wedge"}",
      "convictionScore": ${bull?.convictionScore || 88}
    },
    "bear": {
      "provider": "${bear?.provider || "OpenRouter (DeepSeek V3)"}",
      "thesis": "${bear?.thesis ? bear.thesis.replace(/"/g, '\\"') : "Ruthless bear critique"}",
      "fatalFlaws": ${JSON.stringify(bear?.fatalFlaws || ["Fatal flaw 1", "Fatal flaw 2"])},
      "cacUnitEconomicsTrap": "${bear?.cacUnitEconomicsTrap ? bear.cacUnitEconomicsTrap.replace(/"/g, '\\"') : "Customer acquisition cost trap"}",
      "incumbentMoatThreat": "${bear?.incumbentMoatThreat ? bear.incumbentMoatThreat.replace(/"/g, '\\"') : "Incumbent platform threat"}",
      "skepticismScore": ${bear?.skepticismScore || 84}
    },
    "rebuttalRound": {
      "bullRebuttal": "Bull counter-attack addressing Bear's CAC and incumbent threats directly.",
      "bearRebuttal": "Bear counter-attack dismantling Bull's optimistic wedge assumptions."
    },
    "judge": {
      "provider": "Google (Gemini 2.5 Flash)",
      "winningSide": "Bull",
      "scorecard": {
        "marketDemand": { "winner": "Bull", "rationale": "One-sentence rationale." },
        "defensibility": { "winner": "Bear", "rationale": "One-sentence rationale." },
        "technicalFeasibility": { "winner": "Bull", "rationale": "One-sentence rationale." },
        "unitEconomics": { "winner": "Bear", "rationale": "One-sentence rationale." }
      },
      "verdictSummary": "Decisive 2-3 sentence executive synthesis from the Chief Judge.",
      "keyConditionToProceed": "The single most critical assumption the founder must prove.",
      "numberOneExperiment": "The #1 Lean validation test (e.g. 5 pre-orders or LOIs) to settle the debate without writing code."
    }
  },
  "customerDiscovery": {
    "interviewQuestions": [
      "Mom Test question 1 focusing on past behavior and actual friction",
      "Mom Test question 2",
      "Mom Test question 3",
      "Mom Test question 4",
      "Mom Test question 5"
    ],
    "redFlags": ["False positive answer 1", "False positive answer 2", "False positive answer 3"],
    "willingnessToPaySignals": ["Commitment test 1 (e.g. Paid pilot deposit)", "Commitment test 2 (e.g. Letter of Intent)"]
  },
  "customerPersona": {
    "targetUsers": ["user type 1", "user type 2"],
    "painPoints": ["pain point 1", "pain point 2", "pain point 3"],
    "userProfile": "narrative profile of primary buyer/user persona"
  },
  "swotAnalysis": {
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
    "opportunities": ["opportunity 1", "opportunity 2", "opportunity 3"],
    "threats": ["threat 1", "threat 2", "threat 3"]
  },
  "portersFiveForces": {
    "buyerPower": { "level": "Moderate", "analysis": "Explanation of customer leverage and switching costs" },
    "supplierPower": { "level": "Low", "analysis": "Explanation of vendor and API reliance" },
    "competitiveRivalry": { "level": "High", "analysis": "Explanation of competitor density" },
    "threatOfSubstitutes": { "level": "Moderate", "analysis": "Explanation of alternative workarounds" },
    "threatOfNewEntry": { "level": "Moderate", "analysis": "Explanation of capital and technical barriers" }
  },
  "marketSizing": {
    "tam": { "value": "$12.4B", "description": "TAM (Total Addressable Market): Global market size calculation rationale" },
    "sam": { "value": "$1.8B", "description": "SAM (Serviceable Available Market): Target sub-segment geography & tier" },
    "som": { "value": "$45M", "description": "SOM (Serviceable Obtainable Market): Realistic 1-3 year capture target" },
    "methodology": "Bottom-up analytical estimation based on target accounts and projected ARPU/ACV",
    "confidenceLevel": "Moderate (Analytical Model)",
    "assumptions": ["Assumption on target buyer count", "Assumption on willingness-to-pay tier"]
  },
  "marketResearch": {
    "competitors": ["competitor 1", "competitor 2", "competitor 3"],
    "opportunities": ["opportunity 1", "opportunity 2", "opportunity 3"],
    "marketDemand": "a short paragraph describing current market demand/trend",
    "researchDisclaimer": "AI market intelligence synthesized from industry benchmarks and public competitive positioning models. Validate with direct customer discovery."
  },
  "competitorWeaknessAnalysis": [
    {
      "competitor": "competitor name (match marketResearch.competitors)",
      "weaknesses": ["weakness 1", "weakness 2"],
      "missedOpportunities": ["missed opportunity 1"],
      "suggestedDifferentiation": "how this startup can win against this specific competitor"
    }
  ],
  "productPlan": {
    "mvpFeatures": ["feature 1", "feature 2", "feature 3", "feature 4"],
    "futureFeatures": ["future feature 1", "future feature 2", "future feature 3"],
    "developmentPriority": "what to build first and why"
  },
  "technicalArchitecture": {
    "frontend": "recommended frontend stack and why",
    "backend": "recommended backend stack and why",
    "database": "recommended database and why",
    "hosting": "recommended hosting platform(s) and why",
    "aiApis": "recommended AI APIs/models to use, if relevant",
    "architectureOverview": "system architecture design overview"
  },
  "businessStrategy": {
    "revenueModel": "how this startup makes money",
    "pricingIdea": "pricing structure and tiers",
    "marketingChannels": ["channel 1", "channel 2", "channel 3"]
  },
  "pitch": {
    "elevatorPitch": "a punchy 1-2 sentence elevator pitch",
    "executiveSummary": "a 3-4 sentence executive summary of the whole business"
  },
  "roadmap": {
    "milestones": [
      { "week": "Week 1", "title": "Foundation & Core MVP", "tasks": ["task 1", "task 2", "task 3"] },
      { "week": "Week 2", "title": "Integration & Pipelines", "tasks": ["task 1", "task 2"] },
      { "week": "Week 3", "title": "Closed Alpha Testing", "tasks": ["task 1", "task 2"] },
      { "week": "Week 4", "title": "Public Launch & Distribution", "tasks": ["task 1", "task 2"] }
    ],
    "launchPlan": "launch execution strategy"
  },
  "goToMarket": {
    "targetAudience": "who exactly to target",
    "platforms": [
      { "name": "LinkedIn", "why": "why this fits" },
      { "name": "Reddit", "why": "why this fits" }
    ],
    "linkedInSearchStrategy": ["query 1", "query 2"],
    "coldEmailTemplate": "full cold email with subject line",
    "linkedInDmTemplate": "full ready-to-send LinkedIn DM",
    "redditLaunchPost": "full Reddit launch post",
    "twitterLaunchPost": "full X (Twitter) launch post"
  },
  "launchChecklist": [
    "Secure Primary Domain and SSL Certificate",
    "Deploy High-Conversion Waitlist Landing Page",
    "Configure Product Analytics & Conversion Funnel",
    "Complete 15 Mom Test Customer Discovery Interviews",
    "Publish Launch Post on Reddit and Twitter"
  ],
  "costEstimator": {
    "domain": { "monthlyCost": "$1", "freeTierSufficient": false, "note": "Annual domain registration amortized" },
    "hosting": { "monthlyCost": "$0", "freeTierSufficient": true, "note": "Vercel / Netlify Free tier" },
    "database": { "monthlyCost": "$0", "freeTierSufficient": true, "note": "Supabase / Neon Free tier" },
    "aiApis": { "monthlyCost": "$15-50", "freeTierSufficient": false, "note": "Pay-as-you-go model usage" },
    "email": { "monthlyCost": "$0", "freeTierSufficient": true, "note": "Resend / Brevo 300 free emails/day" },
    "analytics": { "monthlyCost": "$0", "freeTierSufficient": true, "note": "PostHog / Google Analytics free" },
    "storage": { "monthlyCost": "$0", "freeTierSufficient": true, "note": "Cloudflare R2 free tier" },
    "authentication": { "monthlyCost": "$0", "freeTierSufficient": true, "note": "Appwrite / Supabase Auth free tier" },
    "estimatedMonthlyCost": "$16-51",
    "estimatedYearlyCost": "$192-612"
  },
  "revenueSimulator": {
    "pricingAssumption": "Pricing model assumption (e.g. $49/mo Starter, $149/mo Pro)",
    "projections": [
      { "users": 100, "monthlyRevenue": "$4,900", "annualRevenue": "$58,800" },
      { "users": 500, "monthlyRevenue": "$24,500", "annualRevenue": "$294,000" },
      { "users": 1000, "monthlyRevenue": "$49,000", "annualRevenue": "$588,000" },
      { "users": 5000, "monthlyRevenue": "$245,000", "annualRevenue": "$2,940,000" }
    ]
  }
}

Rules:
- Generate 4 to 6 milestone objects in "roadmap.milestones".
- In "marketSizing", always include the full name in brackets beside the acronym: TAM (Total Addressable Market), SAM (Serviceable Available Market), SOM (Serviceable Obtainable Market).
- Every field must be populated with realistic, tailored strategic intelligence — never leave "TBD" or empty strings.
${JSON_ONLY_RULE}`;
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------
export async function runAllAgents(idea, onProgress = () => {}) {
  // Step 0 begins immediately as the 3-AI committee convenes
  let activeStep = 0;
  const stepStates = Array(STEPS.length).fill("pending");
  stepStates[0] = "running";
  onProgress({ step: 0, agent: STEPS[0].name, status: "running" });

  // 1. Parallel Opening Clash: Groq Bull (Llama 3.3 70B) + OpenRouter Bear (DeepSeek V3)
  let openingClash = null;
  try {
    openingClash = await runOpeningClash(idea);
  } catch (err) {
    console.warn("[Agents] Opening clash encountered an error, falling back:", err.message);
  }

  let parsed = null;

  try {
    const prompt = buildMegaPrompt(idea, openingClash);
    const rawText = await streamGemini(prompt, (_chunk, fullRawText) => {
      // Check if any subsequent step has started streaming in the model output
      for (let i = activeStep + 1; i < STEP_START_KEYS.length; i++) {
        const triggerKey = `"${STEP_START_KEYS[i]}"`;
        if (fullRawText.includes(triggerKey)) {
          // Mark all previous running/pending steps up to i as done
          for (let prev = activeStep; prev < i; prev++) {
            if (stepStates[prev] !== "done") {
              stepStates[prev] = "done";
              onProgress({ step: prev, agent: STEPS[prev].name, status: "done" });
            }
          }
          activeStep = i;
          stepStates[i] = "running";
          onProgress({ step: i, agent: STEPS[i].name, status: "running" });
        }
      }
    });

    // When the stream ends, mark any remaining running/pending steps as done
    for (let i = 0; i < STEPS.length; i++) {
      if (stepStates[i] !== "done") {
        stepStates[i] = "done";
        onProgress({ step: i, agent: STEPS[i].name, status: "done" });
      }
    }

    const cleaned = rawText
      .trim()
      .replace(/,\s*([\]}])/g, "$1");
    parsed = JSON.parse(cleaned);
  } catch (error) {
    console.error("Stream blueprint generation failed, attempting fallback:", error.message);
    try {
      const prompt = buildMegaPrompt(idea, openingClash);
      const rawText = await callGemini(prompt);
      const cleaned = rawText.trim().replace(/,\s*([\]}])/g, "$1");
      parsed = JSON.parse(cleaned);
      for (let i = 0; i < STEPS.length; i++) {
        onProgress({ step: i, agent: STEPS[i].name, status: "done" });
      }
    } catch (fallbackErr) {
      console.error("Fallback generation also failed:", fallbackErr.message);
    }
  }

  // Hydrate aiDebate if missing or partially populated
  if (parsed && typeof parsed === "object") {
    if (!parsed.aiDebate) {
      parsed.aiDebate = {};
    }
    if (openingClash) {
      if (!parsed.aiDebate.bull || typeof parsed.aiDebate.bull !== "object") {
        parsed.aiDebate.bull = openingClash.bull;
      }
      if (!parsed.aiDebate.bear || typeof parsed.aiDebate.bear !== "object") {
        parsed.aiDebate.bear = openingClash.bear;
      }
    }
    if (!parsed.aiDebate.rebuttalRound) {
      parsed.aiDebate.rebuttalRound = {
        bullRebuttal: "The focused product scope and acute pain point overcome initial CAC hurdles by unlocking organic word-of-mouth.",
        bearRebuttal: "Until written customer pre-commitments are verified, low switching barriers leave high risk of churn.",
      };
    }
    if (!parsed.aiDebate.judge) {
      const bullScore = parsed.aiDebate.bull?.convictionScore || 85;
      const bearScore = parsed.aiDebate.bear?.skepticismScore || 85;
      parsed.aiDebate.judge = {
        provider: "Google Gemini (Chief Judge)",
        winningSide: bullScore >= bearScore ? "Bull" : "Bear",
        scorecard: {
          marketDemand: { winner: "Bull", rationale: "Clear workflow pain point with verified demand." },
          defensibility: { winner: "Bear", rationale: "Defensibility against incumbents requires rapid product velocity." },
          technicalFeasibility: { winner: "Bull", rationale: "Modern serverless architecture enables fast execution." },
          unitEconomics: { winner: "Bear", rationale: "CAC payback must be proven before scaling paid channels." },
        },
        verdictSummary: "The committee acknowledges high upside potential but requires strict proof of customer commitment before heavy development.",
        keyConditionToProceed: "Secure 3-5 pre-commitments or paid pilot agreements from target buyers.",
        numberOneExperiment: "Run a 7-day concierge test to validate willingness-to-pay.",
      };
    }
  }

  const result = {};

  for (let i = 0; i < STEPS.length; i++) {
    const { keys, name } = STEPS[i];
    let stepIsFullyValid = true;

    for (const key of keys) {
      const section = parsed?.[key];
      const isValidSection = section !== null && section !== undefined && typeof section === "object";

      if (isValidSection) {
        result[key] = section;
      } else {
        console.warn(`Missing or invalid "${key}" section in Gemini response.`);
        result[key] = unavailableSection();
        stepIsFullyValid = false;
      }
    }

    if (!stepIsFullyValid) {
      onProgress({ step: i, agent: name, status: "failed" });
    }
  }

  return result;
}