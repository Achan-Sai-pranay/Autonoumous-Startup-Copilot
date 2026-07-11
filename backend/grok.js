// grok.js
// ---------------------------------------------------------------------------
// This is the ONLY file that knows how to talk to the Grok API (xAI).
// Every agent in agents.js calls the single function exported here.
//
// Features:
// - Automatic retries with exponential backoff
// - Returns plain JSON text
// - Same API as callGemini()
// - JSON extraction mirrors gemini.js: brace-depth matching for trailing
//   content, with a jsonrepair fallback for malformed JSON from the model
//   itself (single-quoted strings, unescaped quotes, truncation, etc.)
// ---------------------------------------------------------------------------

import { jsonrepair } from "jsonrepair";

const GROK_MODEL = "grok-4";
const GROK_URL = "https://api.x.ai/v1/chat/completions";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

export async function callGrok(prompt) {
  const apiKey = process.env.XAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing XAI_API_KEY. Add it to backend/.env"
    );
  }

  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await requestOnce(prompt, apiKey);
    } catch (error) {
      lastError = error;

      if (attempt === MAX_RETRIES) break;

      const delay = BASE_DELAY_MS * 2 ** attempt;

      console.warn(
        `Grok failed (attempt ${attempt + 1}/${MAX_RETRIES + 1}): ${
          error.message
        }. Retrying in ${delay}ms...`
      );

      await sleep(delay);
    }
  }

  throw lastError;
}

async function requestOnce(prompt, apiKey) {
  const response = await fetch(GROK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROK_MODEL,

      messages: [
        {
          role: "system",
          content:
            "Return ONLY valid JSON. No markdown. No explanations.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.7,

      response_format: {
        type: "json_object",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Grok API Error (${response.status}): ${await response.text()}`
    );
  }

  const data = await response.json();

  const text = data?.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("Grok returned an empty response.");
  }

  const extracted = extractJSON(text);
  if (!extracted || !extracted.trim().startsWith("{") || !extracted.trim().endsWith("}")) {
    throw new Error("Grok did not return a valid JSON object.");
  }
  return extracted;
}

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