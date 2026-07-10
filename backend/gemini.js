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
// ---------------------------------------------------------------------------

const GEMINI_MODEL = "gemini-3-flash-preview";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const MAX_RETRIES = 3; // retries AFTER the first attempt (4 attempts total)
const BASE_DELAY_MS = 1000; // 1s, then 2s, then 4s
const MAX_OUTPUT_TOKENS = 16384; // room for the full 15-section V3 JSON blueprint

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

  return extractJSON(rawText);
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
 * Attempts to extract a JSON object from the given text.
 * Looks for the first '{' and matching '}' (handles nested braces).
 * If extraction fails, returns the cleaned text unchanged.
 */
function extractJSON(text) {
  let cleaned = stripCodeFences(text);
  // Try to find a JSON object substring
  const startIdx = cleaned.indexOf('{');
  const endIdx = cleaned.lastIndexOf('}');
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const jsonStr = cleaned.substring(startIdx, endIdx + 1);
    try {
      // Validate that it's parseable JSON
      JSON.parse(jsonStr);
      return jsonStr;
    } catch (e) {
      // If not valid, fall back to returning cleaned string
    }
  }
  return cleaned;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}