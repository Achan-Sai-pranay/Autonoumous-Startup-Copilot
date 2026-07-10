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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

app.listen(PORT, () => {
  console.log(`LaunchPilot AI backend running on http://localhost:${PORT}`);
});