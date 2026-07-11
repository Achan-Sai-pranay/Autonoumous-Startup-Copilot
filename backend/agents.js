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

import { callGemini } from "./gemini.js";

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
const STEPS = [
  { keys: ["ideaAnalysis"], name: "Idea Analysis" },
  { keys: ["marketResearch"], name: "Market Research" },
  { keys: ["customerPersona"], name: "Customer Persona" },
  { keys: ["productPlan"], name: "Product Planning" },
  { keys: ["technicalArchitecture"], name: "Technical Architecture" },
  { keys: ["businessStrategy"], name: "Business Strategy" },
  { keys: ["pitch"], name: "Pitch Generation" },
  { keys: ["roadmap"], name: "Roadmap" },
  { keys: ["goToMarket"], name: "Go-to-Market Strategy" },
  { keys: ["launchChecklist"], name: "Launch Checklist" },
  { keys: ["costEstimator", "revenueSimulator"], name: "Cost & Revenue" },
  { keys: ["competitorWeaknessAnalysis"], name: "Competitor Weakness Analysis" },
];

export const AGENT_STEP_NAMES = STEPS.map((s) => s.name);

// Small cosmetic delay between step reveals once the real response is in
// hand, so the checklist doesn't just flash from empty to fully complete
// instantly. Purely visual — the actual work already finished by this
// point since it's all one Gemini call.
const STEP_REVEAL_DELAY_MS = 150;

// ---------------------------------------------------------------------------
// The single mega-prompt: 8 planning agents + AI Critic + 6 execution
// sections, one JSON schema, one Gemini call.
// ---------------------------------------------------------------------------
function buildMegaPrompt(idea) {
  return `
You are LaunchPilot AI, an autonomous startup co-founder made up of several
specialist roles. Given a single startup idea, generate a COMPLETE startup
blueprint AND an execution plan by reasoning through all roles below, in
order, then return everything as ONE JSON object.

// ✅ After (fix):
Startup idea:
"${idea}"
---
PART A — PLANNING (roles 1-8)

ROLE 1 — Senior Startup Analyst → key "ideaAnalysis"
Analyze the core problem, goal, domain, and feasibility.

ROLE 2 — Market Research Analyst → key "marketResearch"
Based on general knowledge (no live web search), identify competitors,
opportunities, and market demand.

ROLE 3 — UX Researcher → key "customerPersona"
Define the ideal target users, their pain points, and a narrative user
profile.

ROLE 4 — Senior Product Manager → key "productPlan"
Define MVP features, future features, and development priority.

ROLE 5 — Software Architect → key "technicalArchitecture"
Recommend frontend, backend, database, hosting, relevant AI APIs, and a
high-level architecture overview.

ROLE 6 — Business Strategist → key "businessStrategy"
Define the revenue model, pricing idea, and marketing channels.

ROLE 7 — Startup Pitch Coach → key "pitch"
Write a punchy elevator pitch and an executive summary.

ROLE 8 — Technical Project Manager → key "roadmap"
Create a build roadmap of 4 to 6 milestones (roughly one per week), each
with a title and specific tasks, plus a launch plan.

---
PART B — EXECUTION (roles 9-12). This is what makes LaunchPilot an
execution platform, not just an advisor: be concrete and actionable, not
generic.

ROLE 9 — Growth Marketer → key "goToMarket"
Define the target audience, then recommend specific platforms to reach them
(choose from: LinkedIn, Reddit, Discord, X (Twitter), Facebook Groups,
Slack Communities, Product Hunt, Hacker News — pick whichever genuinely fit
this idea) and explain WHY each one fits. Write a LinkedIn search strategy
(example search queries a founder could paste into LinkedIn search), a cold
email template, a LinkedIn DM template, a Reddit launch post, and an X
(Twitter) launch post — all personalized to this specific idea, ready to
copy-paste.

ROLE 10 — Launch Operations Lead → key "launchChecklist"
Produce a professional pre-launch checklist as a flat list of short,
concrete action items (e.g. "Buy Domain", "Create Landing Page", "Setup
Analytics", "Privacy Policy", "Find First 20 Users").

ROLE 11a — Finance: Cost Estimator → key "costEstimator"
Estimate monthly costs for: domain, hosting, database, AI APIs, email,
analytics, storage, and authentication. For each, note whether a free tier
is sufficient at early stage. Provide overall estimated monthly and yearly
totals.

ROLE 11b — Finance: Revenue Simulator → key "revenueSimulator"
Using the pricing idea from businessStrategy, project monthly and annual
revenue at 100, 500, 1000, and 5000 users. State the pricing assumption
used.

ROLE 12 — Competitive Strategist → key "competitorWeaknessAnalysis"
For each competitor named in marketResearch.competitors, identify their
weaknesses, missed opportunities, and a suggested way this startup can
differentiate against them.

---
Return ONE JSON object with this exact structure:
{
  "ideaAnalysis": {
    "problem": "the core problem this idea solves, 2-3 sentences",
    "goal": "the main goal/mission of this product, 1-2 sentences",
    "domain": "the industry/domain this belongs to, e.g. EdTech, FinTech",
    "feasibility": "a short honest assessment of how feasible this is to build, 2-3 sentences"
  },
  "marketResearch": {
    "competitors": ["competitor 1", "competitor 2", "competitor 3"],
    "opportunities": ["opportunity 1", "opportunity 2", "opportunity 3"],
    "marketDemand": "a short paragraph describing current market demand/trend"
  },
  "customerPersona": {
    "targetUsers": ["user type 1", "user type 2"],
    "painPoints": ["pain point 1", "pain point 2", "pain point 3"],
    "userProfile": "a short narrative profile of the primary target user (age range, behavior, motivations)"
  },
  "productPlan": {
    "mvpFeatures": ["feature 1", "feature 2", "feature 3", "feature 4"],
    "futureFeatures": ["future feature 1", "future feature 2", "future feature 3"],
    "developmentPriority": "a short paragraph explaining what to build first and why"
  },
  "technicalArchitecture": {
    "frontend": "recommended frontend stack and why",
    "backend": "recommended backend stack and why",
    "database": "recommended database and why",
    "hosting": "recommended hosting platform(s) and why",
    "aiApis": "recommended AI APIs/models to use, if relevant",
    "architectureOverview": "a short paragraph describing the high-level system architecture"
  },
  "businessStrategy": {
    "revenueModel": "how this startup makes money",
    "pricingIdea": "a suggested pricing structure",
    "marketingChannels": ["channel 1", "channel 2", "channel 3"]
  },
  "pitch": {
    "elevatorPitch": "a punchy 1-2 sentence elevator pitch",
    "executiveSummary": "a 3-4 sentence executive summary of the whole business"
  },
  "roadmap": {
    "milestones": [
      { "week": "Week 1", "title": "short milestone title", "tasks": ["task 1", "task 2", "task 3"] }
    ],
    "launchPlan": "a short paragraph describing how to launch after the final milestone"
  },
  "goToMarket": {
    "targetAudience": "who exactly to target, 1-2 sentences",
    "platforms": [
      { "name": "e.g. LinkedIn", "why": "why this platform fits this specific idea" }
    ],
    "linkedInSearchStrategy": ["example search query 1", "example search query 2"],
    "coldEmailTemplate": "a full, ready-to-send cold email, personalized to this idea, with a subject line",
    "linkedInDmTemplate": "a full, ready-to-send LinkedIn DM, personalized to this idea",
    "redditLaunchPost": "a full Reddit launch post, personalized to this idea",
    "twitterLaunchPost": "a full X (Twitter) launch post/thread starter, personalized to this idea"
  },
  "launchChecklist": ["Buy Domain", "Create Landing Page", "Setup Analytics"],
  "costEstimator": {
    "domain": { "monthlyCost": "e.g. $1 (amortized)", "freeTierSufficient": false, "note": "short note" },
    "hosting": { "monthlyCost": "e.g. $0", "freeTierSufficient": true, "note": "short note" },
    "database": { "monthlyCost": "e.g. $0", "freeTierSufficient": true, "note": "short note" },
    "aiApis": { "monthlyCost": "e.g. $10-50", "freeTierSufficient": false, "note": "short note" },
    "email": { "monthlyCost": "e.g. $0", "freeTierSufficient": true, "note": "short note" },
    "analytics": { "monthlyCost": "e.g. $0", "freeTierSufficient": true, "note": "short note" },
    "storage": { "monthlyCost": "e.g. $0", "freeTierSufficient": true, "note": "short note" },
    "authentication": { "monthlyCost": "e.g. $0", "freeTierSufficient": true, "note": "short note" },
    "estimatedMonthlyCost": "e.g. $15-60",
    "estimatedYearlyCost": "e.g. $180-720"
  },
  "revenueSimulator": {
    "pricingAssumption": "restate the pricing model being used for this projection",
    "projections": [
      { "users": 100, "monthlyRevenue": "e.g. $500", "annualRevenue": "e.g. $6,000" },
      { "users": 500, "monthlyRevenue": "e.g. $2,500", "annualRevenue": "e.g. $30,000" },
      { "users": 1000, "monthlyRevenue": "e.g. $5,000", "annualRevenue": "e.g. $60,000" },
      { "users": 5000, "monthlyRevenue": "e.g. $25,000", "annualRevenue": "e.g. $300,000" }
    ]
  },
  "competitorWeaknessAnalysis": [
    {
      "competitor": "competitor name (match marketResearch.competitors)",
      "weaknesses": ["weakness 1", "weakness 2"],
      "missedOpportunities": ["missed opportunity 1"],
      "suggestedDifferentiation": "how this startup can win against this specific competitor"
    }
  ]
}

Rules:
- Generate between 4 and 6 milestone objects in "roadmap.milestones", in order.
- Include 3-6 items in "launchChecklist", ordered logically (earliest task first).
- Include one "competitorWeaknessAnalysis" entry per competitor listed in "marketResearch.competitors".
- Every field must be filled in — do not leave placeholders like "TBD".
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
  onProgress({ step: 0, agent: STEPS[0].name, status: "running" });

  let parsed = null;

  try {
    const rawText = await callGemini(buildMegaPrompt(idea));
    // Additional sanitization: remove trailing commas before ] or }
    const cleaned = rawText
      .trim()
      // Remove trailing commas before closing brackets or braces
      .replace(/,\s*([\]}])/g, '$1');
    parsed = JSON.parse(cleaned);
  } catch (error) {
    // Covers both network/API failures (after gemini.js's retries) and
    // malformed JSON that didn't parse. Every section falls back to
    // "unavailable" below.
    console.error("Blueprint generation call failed:", error.message);
  }

  const result = {};

  for (let i = 0; i < STEPS.length; i++) {
    const { keys, name } = STEPS[i];

    if (i > 0) {
      onProgress({ step: i, agent: name, status: "running" });
    }

    let stepIsFullyValid = true;

    for (const key of keys) {
      const section = parsed?.[key];
      // Accept objects AND arrays (e.g. launchChecklist, competitorWeaknessAnalysis
      // are top-level arrays) — anything non-null/non-undefined of type "object".
      const isValidSection = section !== null && section !== undefined && typeof section === "object";

      if (isValidSection) {
        result[key] = section;
      } else {
        console.warn(`Missing or invalid "${key}" section in Gemini response.`);
        result[key] = unavailableSection();
        stepIsFullyValid = false;
      }
    }

    onProgress({ step: i, agent: name, status: stepIsFullyValid ? "done" : "failed" });

    // Purely cosmetic stagger so the checklist reveals section by section
    // instead of flashing straight to fully done.
    await sleep(STEP_REVEAL_DELAY_MS);
  }

  return result;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}