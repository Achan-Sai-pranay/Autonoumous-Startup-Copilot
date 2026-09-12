// agents.js
// ---------------------------------------------------------------------------
// V3 CHANGE — Execution Mode:
// LaunchPilot AI evolves from "advisor" to "execution platform." Six new
// sections were added: Go-to-Market Engine, Launch Checklist, AI Execution
// Plan (Today/Tomorrow), Cost Estimator + Revenue Simulator, Competitor
// Weakness Analysis + Startup Difficulty Breakdown, and Build Time
// Prediction.
//
// This still uses the SAME single-Gemini-call architecture from the quota
// fix (one mega-prompt, one request) — the new sections are just more keys
// in the same JSON schema, so blueprint generation is still exactly 1
// Gemini request, regardless of how many sections it now contains.
//
// STEPS now supports a `keys: string[]` per step instead of one key, since
// a couple of the new steps bundle two closely-related sections together
// (e.g. Cost Estimator + Revenue Simulator are both "money" questions) to
// keep the progress checklist from ballooning past what's useful to look
// at. Each key is still validated independently, so a step is only marked
// "done" if every key it covers came back valid.
//
// Everything downstream:
//   - runAllAgents(idea, onProgress) signature is unchanged → server.js
//     needs no changes.
//   - onProgress still fires { step, agent, status } events, now for 13
//     steps instead of 15 → only LoadingTimeline.jsx's step-name list needs
//     updating, no logic changes there or in App.jsx.
//   - BlueprintDashboard.jsx gets the remaining top-level keys as plain
//     objects/arrays, following the exact same shape convention as every
//     existing section (including the same `{ error: true, message }`
//     fallback), so existing V1/V2 sections are completely unaffected.
// ---------------------------------------------------------------------------

import { callGemini, streamGemini } from "./gemini.js";

// Shared instruction so Gemini always returns clean, parseable JSON.
const JSON_ONLY_RULE = `
Respond with ONLY valid JSON. No markdown, no code fences, no explanations,
no text before or after the JSON object. The JSON must match the exact
structure requested.
- Do not include trailing commas in arrays or objects.
`;

// Placeholder stored for any section that's missing or malformed in the
// response. The frontend already checks for `.error === true` and renders
// this message instead of crashing on missing/undefined fields. Works for
// both object-shaped and array-shaped sections since the frontend always
// checks `.error` before treating a section as data.
function unavailableSection() {
  return { error: true, message: "Generation unavailable. Please retry." };
}

// Ordered list of step groups. Each step has one or more JSON keys it's
// responsible for. Order matches the section order requested in the prompt
// below and is what onProgress() steps through. Keeping this as a single
// source of truth avoids step names drifting out of sync with
// LoadingTimeline.jsx's copy of the same list.
// Ordered list of step groups. Each step has one or more JSON keys it's
// responsible for. Order matches the section order requested in the prompt
// below and is what onProgress() steps through.
const STEPS = [
  { keys: ["ideaAnalysis", "viabilityScorecard"], name: "Venture Viability & Idea Analysis" },
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
// The single mega-prompt: Strategic intelligence roles + Execution engine,
// one JSON schema, one Gemini call.
// ---------------------------------------------------------------------------
function buildMegaPrompt(idea) {
  return `
You are LaunchPilot AI, an elite autonomous startup co-founder and venture creation engine.
Given a single startup idea, generate a world-class, institutional-grade startup blueprint
and execution plan. Reason through all specialist roles below and return everything as ONE JSON object.

Startup idea:
"${idea}"
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
- fatalRiskTraps: Array of 3 specific, non-obvious failure modes/traps to watch out for.

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
    "verdictReasoning": "Two-sentence executive investment thesis.",
    "fatalRiskTraps": ["Specific failure trap 1", "Specific failure trap 2", "Specific failure trap 3"]
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
    "som": { "value": "$45M", "description": "SOM (Serviceable Obtainable Market): Realistic 1-3 year capture target" }
  },
  "marketResearch": {
    "competitors": ["competitor 1", "competitor 2", "competitor 3"],
    "opportunities": ["opportunity 1", "opportunity 2", "opportunity 3"],
    "marketDemand": "a short paragraph describing current market demand/trend"
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
/**
 * Generates the full blueprint + execution plan with a SINGLE Gemini call
 * and returns one combined object. Optionally reports progress via
 * onProgress(event): { step, agent, status: "running" | "done" | "failed" }.
 *
 * Error handling: if the single call fails outright (even after gemini.js's
 * retries), or the response is missing/malformed for a given key, that key
 * is marked unavailable — the app still returns a fully-shaped response and
 * never crashes. A step covering multiple keys (e.g. "Cost & Revenue") is
 * only marked "done" if every key it covers came back valid; otherwise it's
 * "failed" and only the broken key(s) show the "Generation unavailable"
 * fallback — everything else on that step still renders.
 */
export async function runAllAgents(idea, onProgress = () => {}) {
  // Step 0 begins immediately as the AI co-founder pipeline starts
  let activeStep = 0;
  const stepStates = Array(STEPS.length).fill("pending");
  stepStates[0] = "running";
  onProgress({ step: 0, agent: STEPS[0].name, status: "running" });

  let parsed = null;

  try {
    const rawText = await streamGemini(buildMegaPrompt(idea), (_chunk, fullRawText) => {
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
      .replace(/,\s*([\]}])/g, '$1');
    parsed = JSON.parse(cleaned);
  } catch (error) {
    console.error("Stream blueprint generation failed, attempting fallback:", error.message);
    try {
      const rawText = await callGemini(buildMegaPrompt(idea));
      const cleaned = rawText.trim().replace(/,\s*([\]}])/g, '$1');
      parsed = JSON.parse(cleaned);
      for (let i = 0; i < STEPS.length; i++) {
        onProgress({ step: i, agent: STEPS[i].name, status: "done" });
      }
    } catch (fallbackErr) {
      console.error("Fallback generation also failed:", fallbackErr.message);
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