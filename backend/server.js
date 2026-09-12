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
import { chatGemini } from "./gemini.js";

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

// Interactive Gemini 3.7 Flash AI Copilot Agent Endpoint
app.post("/api/chat-agent", async (req, res) => {
  const { messages = [], blueprintContext = null } = req.body;

  let systemPrompt =
    "You are the LaunchPilot AI Startup Copilot & Strategic Co-Founder, powered by Google Gemini 3.7 Flash. " +
    "You provide punchy, high-conviction, actionable advice to founders. Help them validate ideas, calculate runway, " +
    "craft investor pitches, critique tech architectures, and find go-to-market unfair advantages. Keep answers structured and crisp.";

  if (blueprintContext) {
    systemPrompt += `\n\nACTIVE STARTUP BLUEPRINT CONTEXT:\n${JSON.stringify(blueprintContext, null, 2).slice(0, 8000)}`;
  }

  try {
    const reply = await chatGemini(messages, systemPrompt);
    res.json({ reply, model: "gemini-3.7-flash" });
  } catch (error) {
    console.error("Chat agent error:", error.message);
    res.status(500).json({ error: error.message || "Failed to get AI copilot response" });
  }
});

app.listen(PORT, () => {
  console.log(`LaunchPilot AI backend running on http://localhost:${PORT}`);
});