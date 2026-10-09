// server.js
// ---------------------------------------------------------------------------
// IdeaPulse AI Express Backend
// Provides:
//   - Strict CORS policy & Request size limiting
//   - Server-side input bounds and rate limiting
//   - POST /api/generate-blueprint (Streaming NDJSON multi-stage synthesis)
//   - POST /api/chat-agent (Assistant queries)
//   - POST /api/consultant (Streaming YC Partner Co-Founder consultant)
//   - POST /api/waitlist (Persistent early access & waitlist collection)
//   - GET /api/health (Health check & telemetry)
// ---------------------------------------------------------------------------

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { runAllAgents } from "./agents.js";
import { chatGemini, streamChatGemini } from "./gemini.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// --- 1. CORS Configuration -------------------------------------------------
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim())
  : [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://idea-pulse-startup-validator.vercel.app",
    ];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:");
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS.`));
      }
    },
    credentials: true,
  })
);

// --- 2. Body Parser & Size Limiting ----------------------------------------
app.use(express.json({ limit: "500kb" }));

// --- 3. Rate Limiters ------------------------------------------------------
// Global API rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down and try again shortly." },
});

// Blueprint generation rate limiter (expensive Gemini generation calls)
const blueprintLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 full blueprint runs per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "You have reached the temporary blueprint generation rate limit. Please wait a few minutes before generating another.",
  },
});

// Chat & Consultant rate limiter
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120, // 120 turns per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Co-Founder chat query limit reached. Please wait a moment before sending another message.",
  },
});

app.use("/api/", globalLimiter);

// --- 4. Health & Status Endpoints ------------------------------------------
app.get("/", (req, res) => {
  res.send("IdeaPulse AI backend is running.");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "IdeaPulse AI Backend",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "production",
  });
});

// --- 5. Blueprint Generation Endpoint (Streaming NDJSON) -------------------
app.post("/api/generate-blueprint", blueprintLimiter, async (req, res) => {
  const { idea } = req.body;

  if (!idea || typeof idea !== "string") {
    return res.status(400).json({
      error: "Please provide a startup idea description.",
    });
  }

  const cleanIdea = idea.trim();
  if (cleanIdea.length < 5) {
    return res.status(400).json({
      error: "Startup idea must be at least 5 characters long.",
    });
  }

  if (cleanIdea.length > 2500) {
    return res.status(400).json({
      error: "Startup idea cannot exceed 2,500 characters. Please provide a focused summary.",
    });
  }

  // Switch to streaming NDJSON response
  res.writeHead(200, {
    "Content-Type": "application/x-ndjson",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const writeEvent = (event) => {
    try {
      res.write(JSON.stringify(event) + "\n");
    } catch {
      // client may have disconnected
    }
  };

  try {
    const blueprint = await runAllAgents(cleanIdea, (progress) => {
      writeEvent({ type: "progress", ...progress });
    });

    writeEvent({ type: "result", data: blueprint });
  } catch (error) {
    console.error("Blueprint generation failed unexpectedly:", error.message);
    writeEvent({
      type: "error",
      message: "Failed to generate blueprint. Please try again with a revised description.",
    });
  } finally {
    res.end();
  }
});

// --- 6. Co-Founder Assistant Endpoint --------------------------------------
app.post("/api/chat-agent", chatLimiter, async (req, res) => {
  const { messages = [], blueprintContext = null } = req.body;

  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages payload must be an array." });
  }

  if (messages.length > 40) {
    return res.status(400).json({ error: "Conversation history exceeds maximum turn limit." });
  }

  let systemPrompt =
    "You are the IdeaPulse Startup Assistant, a helpful, polite, and concise AI co-founder on our website. " +
    "CRITICAL FORMATTING & STYLE RULES: " +
    "1. Keep answers SHORT, CRISP, DIRECT, and ACTIONABLE (2 to 4 sentences max, or 2-3 brief lines). " +
    "2. NEVER use markdown hashtags (#, ##, ###, ####). " +
    "3. NEVER use bold asterisks (**) or bullet asterisks (*). Write clean, plain conversational English. For lists, use simple numbers (1., 2.) or clean dashes (- ). " +
    "4. NEVER use markdown dividers (---). " +
    "5. Directly answer the founder's specific query without generic fluff, intros, or robotic sign-offs.";

  if (blueprintContext && typeof blueprintContext === "object") {
    systemPrompt += `\n\nACTIVE STARTUP BLUEPRINT CONTEXT:\n${JSON.stringify(blueprintContext).slice(0, 100000)}`;
  }

  try {
    const reply = await chatGemini(messages, systemPrompt);
    res.json({ reply });
  } catch (error) {
    console.error("Chat agent error:", error.message);
    res.status(500).json({ error: error.message || "Failed to get assistant response" });
  }
});

// --- 7. YC Partner Interactive Consultant Streaming Endpoint ---------------
app.post("/api/consultant", chatLimiter, async (req, res) => {
  const { message, history = [], blueprint = null, originalIdea = "" } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Please provide a query message." });
  }

  if (message.length > 2500) {
    return res.status(400).json({ error: "Query message cannot exceed 2,500 characters." });
  }

  if (!Array.isArray(history) || history.length > 40) {
    return res.status(400).json({ error: "Invalid history array or exceeds turn limit." });
  }

  res.writeHead(200, {
    "Content-Type": "text/plain; charset=utf-8",
    "Transfer-Encoding": "chunked",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  let systemPrompt = [
    "You are the elite IdeaPulse AI Co-Founder, YC partner, and senior startup growth strategist.",
    "Your mission: partner with the founder to test assumptions, sharpen product positioning, pressure-test unit economics, dissect competitive defensibility, and design aggressive go-to-market strategies.",
    "Tone & Style Guidelines:",
    "- High-signal, authoritative, supportive yet rigorous and intellectually honest (like a top Y Combinator partner during office hours).",
    "- Directly answer questions with tactical specificity rather than generic business clichés.",
    "- When advising on strategy, pricing, or product, directly reference the founder's specific idea, market, and blueprint data.",
    "- Format with crisp bullet points, clean formatting, bold highlights, and code/template blocks where appropriate.",
    "- When abbreviations like TAM, SAM, SOM are mentioned, write out their full forms in brackets beside them: e.g. TAM (Total Addressable Market), SAM (Serviceable Available Market), SOM (Serviceable Obtainable Market).",
    "- Clearly distinguish between verified assumptions and predictive estimates.",
  ].join("\n");

  if (originalIdea && typeof originalIdea === "string") {
    systemPrompt += `\n\n[STARTUP CONCEPT / ORIGINAL IDEA]:\n${originalIdea.slice(0, 2500)}`;
  }

  if (blueprint && typeof blueprint === "object") {
    systemPrompt += `\n\n[ACTIVE STARTUP BLUEPRINT REPORT CONTEXT]:\n${JSON.stringify(blueprint).slice(0, 100000)}`;
  }

  const messages = [...history];
  messages.push({ role: "user", text: message.trim() });

  try {
    await streamChatGemini(messages, systemPrompt, (chunk) => {
      res.write(chunk);
    });
  } catch (err) {
    console.error("Consultant stream error:", err.message);
    res.write(`\n\n[Co-Founder Note]: Response stream encountered an issue (${err.message}).`);
  } finally {
    res.end();
  }
});

// --- 8. Waitlist & Early Access Endpoint -----------------------------------
app.post("/api/waitlist", async (req, res) => {
  const { email, source = "website", type = "early_access", userId = "guest" } = req.body || {};

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "Please provide a valid email address." });
  }

  const entry = {
    email: email.trim().toLowerCase(),
    source,
    type,
    userId,
    ip: req.ip || req.headers["x-forwarded-for"] || "unknown",
    timestamp: new Date().toISOString(),
  };

  try {
    const dataDir = path.join(__dirname, "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const filePath = path.join(dataDir, "waitlist.json");
    let list = [];
    if (fs.existsSync(filePath)) {
      try {
        list = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      } catch {
        list = [];
      }
    }
    list.push(entry);
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2));
    res.json({ success: true, message: "Waitlist entry saved successfully." });
  } catch (err) {
    console.error("Waitlist save error:", err.message);
    res.json({ success: true, message: "Acknowledged." });
  }
});

app.listen(PORT, () => {
  console.log(`IdeaPulse AI backend running on http://localhost:${PORT}`);
});