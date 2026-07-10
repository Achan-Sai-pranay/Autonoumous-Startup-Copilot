// agents.js
// ---------------------------------------------------------------------------
// V3 CHANGE — Quota fix:
// The free Gemini tier allows only 5 requests/minute. Making 9 sequential
// calls (8 agents + AI Critic) for a single blueprint blew through that
// limit almost immediately, so most requests failed with HTTP 429
// RESOURCE_EXHAUSTED.
//
// Fix: instead of 9 separate prompts, this file now builds ONE mega-prompt
// that asks Gemini to act as all 8 specialist agents AND the AI Critic in
// a single pass, returning one JSON object with every section. This drops
// usage from 9 requests/blueprint to 1.
//
// Everything downstream is unchanged:
//   - The final `result` object has the exact same shape as before
//     (ideaAnalysis, marketResearch, customerPersona, productPlan,
//     technicalArchitecture, businessStrategy, pitch, roadmap,
//     criticReview{ critique, startupScore, swot, riskAnalysis,
//     budgetEstimation }), so BlueprintDashboard.jsx needs no changes.
//   - runAllAgents(idea, onProgress) still exists with the same signature,
//     so server.js needs no changes.
//   - onProgress still fires the same { step, agent, status } events for
//     all 9 step names, so LoadingTimeline.jsx needs no changes. Since
//     there's now only one real network call, these events are emitted
//     based on validating each section of the single response rather than
//     9 independent completions — see runAllAgents() below for details.
//   - gemini.js is untouched; its existing retry/backoff now protects the
//     one call that matters instead of 9, which also helps with 429s.
// ---------------------------------------------------------------------------

import { callGemini } from "./gemini.js";

// Shared instruction so Gemini always returns clean, parseable JSON.
const JSON_ONLY_RULE = `
Respond with ONLY valid JSON. No markdown, no code fences, no explanations,
no text before or after the JSON object. The JSON must match the exact
structure requested.
`;

// Placeholder stored for any section that's missing or malformed in the
// response. The frontend already checks for `.error === true` and renders
// this message instead of crashing on missing/undefined fields.
function unavailableSection() {
  return { error: true, message: "Generation unavailable. Please retry." };
}

// Ordered list of step keys + display names. Order matches the JSON key
// order requested in the prompt below and is what onProgress() steps
// through. Keeping this as a single source of truth avoids the step names
// drifting out of sync with LoadingTimeline.jsx's copy of the same list.
const STEPS = [
  { key: "ideaAnalysis", name: "Idea Analysis" },
  { key: "marketResearch", name: "Market Research" },
  { key: "customerPersona", name: "Customer Persona" },
  { key: "productPlan", name: "Product Planning" },
  { key: "technicalArchitecture", name: "Technical Architecture" },
  { key: "businessStrategy", name: "Business Strategy" },
  { key: "pitch", name: "Pitch Generation" },
  { key: "roadmap", name: "Roadmap" },
  { key: "criticReview", name: "AI Critic" },
];

export const AGENT_STEP_NAMES = STEPS.map((s) => s.name);

// Small cosmetic delay between step reveals once the real response is in
// hand, so the checklist doesn't just flash from empty to fully complete
// instantly. Purely visual — the actual work already finished by this
// point since it's all one Gemini call now.
const STEP_REVEAL_DELAY_MS = 150;

// ---------------------------------------------------------------------------
// The single mega-prompt: all 8 agents + the AI Critic, one JSON schema.
// ---------------------------------------------------------------------------
function buildMegaPrompt(idea) {
  return `
You are LaunchPilot AI, an autonomous startup co-founder made up of 8
specialist roles plus a final independent critic. Given a single startup
idea, generate a COMPLETE startup blueprint by reasoning through all 9
roles below, in order, then return everything as ONE JSON object.

Startup idea:
"${idea}"

---
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

ROLE 9 — AI Critic (independent reviewer) → key "criticReview"
Only after "completing" roles 1-8 above, step back and critically review
the ENTIRE blueprint as one connected plan, not each part in isolation.
Identify weak business assumptions, missing features, an MVP that's too
ambitious, risks, and contradictions between sections (for example, a
"free" pricing model contradicting a paid-marketing-heavy strategy). Also
score the idea, run a SWOT analysis, break down risks by category, and
estimate a rough budget.
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
      {
        "week": "Week 1",
        "title": "short milestone title, e.g. Research & Planning",
        "tasks": ["task 1", "task 2", "task 3"]
      }
    ],
    "launchPlan": "a short paragraph describing how to launch after the final milestone"
  },
  "criticReview": {
    "critique": {
      "weakAssumptions": ["assumption 1", "assumption 2"],
      "missingFeatures": ["missing feature 1", "missing feature 2"],
      "overambitiousMvpFeatures": ["feature that should be cut from MVP 1"],
      "risksIdentified": ["risk 1", "risk 2"],
      "contradictions": ["contradiction 1"],
      "suggestions": ["concrete suggestion 1", "concrete suggestion 2"]
    },
    "startupScore": {
      "innovation": 0,
      "marketDemand": 0,
      "technicalFeasibility": 0,
      "businessPotential": 0,
      "investmentReadiness": 0,
      "scalability": 0,
      "overall": 0
    },
    "swot": {
      "strengths": ["strength 1", "strength 2"],
      "weaknesses": ["weakness 1", "weakness 2"],
      "opportunities": ["opportunity 1", "opportunity 2"],
      "threats": ["threat 1", "threat 2"]
    },
    "riskAnalysis": {
      "technical": [
        { "description": "risk description", "severity": "Low", "mitigation": "suggested mitigation" }
      ],
      "business": [
        { "description": "risk description", "severity": "Medium", "mitigation": "suggested mitigation" }
      ],
      "financial": [
        { "description": "risk description", "severity": "High", "mitigation": "suggested mitigation" }
      ],
      "market": [
        { "description": "risk description", "severity": "Medium", "mitigation": "suggested mitigation" }
      ]
    },
    "budgetEstimation": {
      "prototype": { "range": "e.g. $500 - $1,500", "assumptions": "short assumption note" },
      "mvp": { "range": "e.g. $3,000 - $8,000", "assumptions": "short assumption note" },
      "betaLaunch": { "range": "e.g. $8,000 - $20,000", "assumptions": "short assumption note" },
      "fullProduct": { "range": "e.g. $25,000+", "assumptions": "short assumption note" }
    }
  }
}

Rules:
- Generate between 4 and 6 milestone objects in "roadmap.milestones", in order.
- All "startupScore" values must be integers between 0 and 100.
- Each "severity" value must be exactly "Low", "Medium", or "High".
- Include 2-4 items per risk category array in "riskAnalysis".
- Every field must be filled in — do not leave placeholders like "TBD".
${JSON_ONLY_RULE}`;
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------
/**
 * Generates the full blueprint with a SINGLE Gemini call and returns one
 * combined object with the same shape the frontend has always expected.
 * Optionally reports progress via onProgress(event), where event looks
 * like: { step, agent, status: "running" | "done" | "failed" } — one event
 * per section, same as before, so LoadingTimeline.jsx doesn't need to
 * change even though there's only one real network request now.
 *
 * Error handling: if the single call fails outright (even after gemini.js's
 * retries), or the response is missing/malformed for a given section, that
 * section is marked unavailable — the app still returns a fully-shaped
 * response and never crashes.
 */
export async function runAllAgents(idea, onProgress = () => {}) {
  onProgress({ step: 0, agent: STEPS[0].name, status: "running" });

  let parsed = null;

  try {
    const rawText = await callGemini(buildMegaPrompt(idea));
    parsed = JSON.parse(rawText);
  } catch (error) {
    // Covers both network/API failures (after gemini.js's retries) and
    // malformed JSON that didn't parse. Every section falls back to
    // "unavailable" below.
    console.error("Blueprint generation call failed:", error.message);
  }

  const result = {};

  for (let i = 0; i < STEPS.length; i++) {
    const { key, name } = STEPS[i];

    if (i > 0) {
      onProgress({ step: i, agent: name, status: "running" });
    }

    const section = parsed?.[key];
    const isValidSection =
      section && typeof section === "object" && !Array.isArray(section);

    if (isValidSection) {
      result[key] = section;
      onProgress({ step: i, agent: name, status: "done" });
    } else {
      console.warn(`Missing or invalid "${key}" section in Gemini response.`);
      result[key] = unavailableSection();
      onProgress({ step: i, agent: name, status: "failed" });
    }

    // Purely cosmetic stagger so the checklist reveals section by section
    // instead of flashing straight to fully done.
    await sleep(STEP_REVEAL_DELAY_MS);
  }

  return result;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}