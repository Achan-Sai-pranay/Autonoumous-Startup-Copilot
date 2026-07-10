// grok.js
// ---------------------------------------------------------------------------
// This is the ONLY file that knows how to talk to the Grok API (xAI).
// Every agent in agents.js calls the single function exported here.
//
// Features:
// - Automatic retries with exponential backoff
// - Returns plain JSON text
// - Same API as callGemini()
// ---------------------------------------------------------------------------

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

  return stripCodeFences(text);
}

function stripCodeFences(text) {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}