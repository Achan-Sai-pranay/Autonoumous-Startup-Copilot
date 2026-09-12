// server.js
// ---------------------------------------------------------------------------
// The entire backend "app" lives in this one file:
//   - sets up Express
//   - exposes ONE route: POST /api/generate-blueprint
//   - calls the orchestrator in agents.js
//
// V2 CHANGE: the route now STREAMS progress as newline-delimited JSON
// (NDJSON) instead of waiting silently and returning one final blob. This
// is what makes the "currently running agent" indicator on the frontend
// real instead of a simulated timer. No extra libraries needed — this uses
// plain Node/Express response streaming (res.write / res.end).
//
// Each line written to the response is one JSON object, one of:
//   { "type": "progress", "step": 0, "agent": "Idea Analysis", "status": "running" }
//   { "type": "progress", "step": 0, "agent": "Idea Analysis", "status": "done" }
//   { "type": "result", "data": { ...full blueprint... } }
//   { "type": "error", "message": "..." }   (only for truly fatal errors)
// ---------------------------------------------------------------------------

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { runAllAgents } from "./agents.js";
import { chatGemini, streamChatGemini } from "./gemini.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Simple health check — useful to confirm the server is up.
app.get("/", (req, res) => {
  res.send("LaunchPilot AI backend is running.");
});

// The one and only API endpoint. Streams progress, then the final result.
app.post("/api/generate-blueprint", async (req, res) => {
  const { idea } = req.body;

  if (!idea || typeof idea !== "string" || idea.trim().length < 5) {
    return res.status(400).json({
      error: "Please provide a startup idea (at least 5 characters).",
    });
  }

  // Switch to a streaming NDJSON response. We send headers now and keep
  // the connection open, writing one JSON line per event.
  res.writeHead(200, {
    "Content-Type": "application/x-ndjson",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const writeEvent = (event) => {
    res.write(JSON.stringify(event) + "\n");
  };

  try {
    const blueprint = await runAllAgents(idea.trim(), (progress) => {
      writeEvent({ type: "progress", ...progress });
    });

    writeEvent({ type: "result", data: blueprint });
  } catch (error) {
    // runAllAgents() is designed to never throw for individual agent
    // failures — this only fires for truly unexpected errors.
    console.error("Blueprint generation failed unexpectedly:", error.message);
    writeEvent({
      type: "error",
      message: "Failed to generate blueprint. See server logs for details.",
    });
  } finally {
    res.end();
  }
});

// Commercial Website AI Copilot Assistant Endpoint
app.post("/api/chat-agent", async (req, res) => {
  const { messages = [], blueprintContext = null } = req.body;

  let systemPrompt =
    "You are the LaunchPilot Startup Assistant, a helpful, polite, and concise AI co-founder on our website. " +
    "CRITICAL FORMATTING & STYLE RULES: " +
    "1. Keep answers SHORT, CRISP, DIRECT, and ACTIONABLE (2 to 4 sentences max, or 2-3 brief lines). " +
    "2. NEVER use markdown hashtags (#, ##, ###, ####). " +
    "3. NEVER use bold asterisks (**) or bullet asterisks (*). Write clean, plain conversational English. For lists, use simple numbers (1., 2.) or clean dashes (- ). " +
    "4. NEVER use markdown dividers (---). " +
    "5. Directly answer the founder's specific query without generic fluff, intros, or robotic sign-offs.";

  if (blueprintContext) {
    systemPrompt += `\n\nACTIVE STARTUP BLUEPRINT CONTEXT:\n${JSON.stringify(blueprintContext, null, 2).slice(0, 8000)}`;
  }

  try {
    const reply = await chatGemini(messages, systemPrompt);
    res.json({ reply });
  } catch (error) {
    console.error("Chat agent error:", error.message);
    res.status(500).json({ error: error.message || "Failed to get assistant response" });
  }
});

// Strong AI Co-Founder & YC Partner Interactive Consultant Streaming Endpoint
app.post("/api/consultant", async (req, res) => {
  const { message, history = [], blueprint = null, originalIdea = "" } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Please provide a query message." });
  }

  // Set streaming headers
  res.writeHead(200, {
    "Content-Type": "text/plain; charset=utf-8",
    "Transfer-Encoding": "chunked",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  // Prepare system prompt with active blueprint context
  let systemPrompt = [
    "You are the elite LaunchPilot AI Co-Founder, YC partner, and senior startup growth strategist.",
    "Your mission: partner with the founder to test assumptions, sharpen product positioning, pressure-test unit economics, dissect competitive defensibility, and design aggressive go-to-market strategies.",
    "Tone & Style Guidelines:",
    "- High-signal, authoritative, supportive yet rigorous and intellectually honest (like a top Y Combinator partner during office hours).",
    "- Directly answer questions with tactical specificity rather than generic business clichés.",
    "- When advising on strategy, pricing, or product, directly reference the founder's specific idea, market, and blueprint data.",
    "- Format with crisp bullet points, clean formatting, bold highlights, and code/template blocks where appropriate.",
    "- When abbreviations or acronyms like TAM, SAM, SOM are mentioned, write out their full forms in brackets beside them: e.g. TAM (Total Addressable Market), SAM (Serviceable Available Market), SOM (Serviceable Obtainable Market).",
    "- If grilled or asked to find flaws, give honest, fatal failure modes and high-leverage solutions.",
  ].join("\n");

  if (originalIdea) {
    systemPrompt += `\n\n[STARTUP CONCEPT / ORIGINAL IDEA]:\n${originalIdea}`;
  }

  if (blueprint) {
    systemPrompt += `\n\n[ACTIVE STARTUP BLUEPRINT REPORT CONTEXT]:\n${JSON.stringify(blueprint, null, 2).slice(0, 15000)}`;
  }

  const messages = [...history];
  messages.push({ role: "user", text: message.trim() });

  try {
    await streamChatGemini(messages, systemPrompt, (chunk) => {
      res.write(chunk);
    });
  } catch (err) {
    console.error("Consultant stream error:", err.message);
    res.write(`\n\n[Co-Founder Note]: Response stream encountered a network issue (${err.message}).`);
  } finally {
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`LaunchPilot AI backend running on http://localhost:${PORT}`);
});