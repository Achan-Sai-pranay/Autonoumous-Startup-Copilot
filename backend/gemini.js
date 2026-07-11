// gemini.js
// ---------------------------------------------------------------------------
// This is the ONLY file that knows how to talk to the Gemini API.
// Every agent in agents.js calls the single function exported here.
//
// V2 CHANGE: callGemini now retries automatically on failure using
// exponential backoff (1s, 2s, 4s) before giving up, up to 3 retries
// (4 attempts total). This makes the whole pipeline much more resilient to
// transient network blips or rate-limit hiccups, without agents.js needing
// to know anything about retry logic.
//
// V3 CHANGE: added an explicit maxOutputTokens. The V3 mega-prompt now
// asks for 15 sections instead of 9 (Go-to-Market templates, checklists,
// cost/revenue tables, etc.), which is a meaningfully longer JSON response.
// Without raising this, long responses risk being cut off mid-JSON, which
// would fail JSON.parse() in agents.js. This is the only change in this
// file — retry/error-handling logic is untouched.
//
// V4 CHANGE: improved JSON extraction to handle extra text before/after
// the JSON object, ensuring valid JSON is returned for parsing.
// V5 CHANGE: added validation that the extracted text looks like a JSON
// object; if not, throws an error so the caller knows the model did not
// return usable JSON.
// V6 CHANGE: brace-matching in extractJSON now respects string/escape state
// instead of naively slicing indexOf('{')..lastIndexOf('}'), which broke on
// trailing content containing its own braces. Also added a jsonrepair
// fallback for genuinely malformed JSON from the model itself (e.g. single
// -quoted strings, unescaped quotes) that brace-matching alone can't fix.
// ---------------------------------------------------------------------------

import { jsonrepair } from "jsonrepair";

const GEMINI_MODEL = "gemini-3.1-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const MAX_RETRIES = 3; // retries AFTER the first attempt (4 attempts total)
const BASE_DELAY_MS = 1000; // 1s, then 2s, then 4s
const MAX_OUTPUT_TOKENS = 32768; // increased to be extra safe for the large V3 prompt

/**
 * Sends a prompt to Gemini and returns the raw text response, retrying
 * automatically with exponential backoff if the request fails.
 *
 * @param {string} prompt - full instruction text for one agent
 * @returns {Promise<string>} raw text (expected to be a JSON string)
 */
export async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing GEMINI_API_KEY. Add it to backend/.env (see .env.example)."
    );
  }

  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await requestOnce(prompt, apiKey);
    } catch (error) {
      lastError = error;

      const isLastAttempt = attempt === MAX_RETRIES;
      if (isLastAttempt) break;

      const delayMs = BASE_DELAY_MS * 2 ** attempt; // 1000, 2000, 4000
      console.warn(
        `Gemini call failed (attempt ${attempt + 1}/${MAX_RETRIES + 1}): ${
          error.message
        }. Retrying in ${delayMs}ms...`
      );
      await sleep(delayMs);
    }
  }

  // All attempts exhausted — let the caller (agents.js) decide what to do.
  throw lastError;
}

/**
 * A single attempt at calling the Gemini API. Throws on any failure
 * (network error, non-2xx response, empty response).
 */
async function requestOnce(prompt, apiKey) {
  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        // Lower temperature = more consistent, structured output.
        temperature: 0.7,
        responseMimeType: "application/json",
        maxOutputTokens: MAX_OUTPUT_TOKENS,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Gemini API request failed (${response.status}): ${errorBody}`
    );
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error("Gemini returned an empty response.");
  }

  const extracted = extractJSON(rawText);
  // Validate that we actually got a JSON object
  if (!extracted || !extracted.trim().startsWith('{') || !extracted.trim().endsWith('}')) {
    throw new Error("Gemini did not return a valid JSON object.");
  }
  return extracted;
}

/**
 * Removes ```json ... ``` or ``` ... ``` wrappers that models sometimes
 * add around JSON output, even when explicitly told not to.
 * Then attempts to extract a JSON object if there is extra text.
 */
function stripCodeFences(text) {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

/**
 * Attempts to extract a JSON object from the given text by walking brace
 * depth (respecting string literals/escapes) from the first '{' until it
 * returns to zero — the true end of that object, regardless of any text
 * trailing after it. A naive indexOf('{')..lastIndexOf('}') slice would
 * over-grab whenever trailing content contains its own braces, producing
 * "valid JSON followed by garbage" that fails to parse.
 *
 * If the balanced slice still isn't strictly valid JSON (e.g. the model
 * used single-quoted strings or left an unescaped quote inside a value),
 * falls back to jsonrepair before giving up. If nothing parses, returns
 * the cleaned text unchanged so the caller's own validation can reject it.
 */
function extractJSON(text) {
  const cleaned = stripCodeFences(text);
  const startIdx = cleaned.indexOf("{");
  if (startIdx === -1) return cleaned;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = startIdx; i < cleaned.length; i++) {
    const char = cleaned[i];

    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (char === "{") depth++;
    else if (char === "}") {
      depth--;
      if (depth === 0) {
        const candidate = cleaned.substring(startIdx, i + 1);
        try {
          JSON.parse(candidate);
          return candidate;
        } catch {
          const repaired = tryRepair(candidate);
          if (repaired) return repaired;
          break;
        }
      }
    }
  }

  // Brace depth never balanced (likely truncated response) or the balanced
  // slice couldn't be repaired — give jsonrepair the rest of the text too,
  // since it can also complete truncated JSON.
  return tryRepair(cleaned.substring(startIdx)) || cleaned;
}

/**
 * Runs jsonrepair on a candidate string and returns the repaired JSON only
 * if it actually parses; returns null on any failure so callers can fall
 * back cleanly instead of propagating jsonrepair's own errors.
 */
function tryRepair(candidate) {
  try {
    const repaired = jsonrepair(candidate);
    JSON.parse(repaired);
    return repaired;
  } catch {
    return null;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}