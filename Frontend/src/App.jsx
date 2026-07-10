// App.jsx
// ---------------------------------------------------------------------------
// The entire page lives in this one file. Navbar, Hero, IdeaInput, and
// Footer are small enough and used only once, so they're plain functions
// in this file rather than separate component files.
//
// V2 CHANGE: the backend now streams progress as newline-delimited JSON
// (NDJSON) instead of returning one final blob, so we switched from axios
// to the native fetch() streaming API (axios doesn't expose a readable
// stream for the browser the same simple way). As each line arrives we
// update `agentSteps` in real time, which LoadingTimeline renders directly
// — so "currently running agent" is now real backend state, not a timer.
// ---------------------------------------------------------------------------
import { useState } from "react";
import LoadingTimeline, { AGENT_STEP_NAMES } from "./components/LoadingTimeline.jsx";
import BlueprintDashboard from "./components/BlueprintDashboard.jsx";

// Change this if your backend runs on a different port.
const API_URL = "http://localhost:5000/api/generate-blueprint";

// Builds the initial "all pending" step list shown before any events arrive.
function buildInitialSteps() {
  return AGENT_STEP_NAMES.map((name) => ({ name, status: "pending" }));
}

export default function App() {
  const [idea, setIdea] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [blueprint, setBlueprint] = useState(null);
  const [error, setError] = useState("");
  const [agentSteps, setAgentSteps] = useState(buildInitialSteps());

  async function handleGenerate() {
    if (!idea.trim()) {
      setError("Please describe your startup idea first.");
      return;
    }

    setError("");
    setBlueprint(null);
    setAgentSteps(buildInitialSteps());
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });

      if (!response.ok) {
        // Non-streamed error path (e.g. validation error, 400/500 before
        // streaming started).
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${response.status})`);
      }

      await readNdjsonStream(response, {
        onProgress: (event) => {
          setAgentSteps((prev) =>
            prev.map((step, index) =>
              index === event.step ? { ...step, status: event.status } : step
            )
          );
        },
        onResult: (data) => setBlueprint(data),
        onError: (message) => setError(message),
      });
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong while generating your blueprint. Is the backend running?"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col items-center px-4">
        <Hero />

        <IdeaInput
          idea={idea}
          setIdea={setIdea}
          onGenerate={handleGenerate}
          isLoading={isLoading}
        />

        {error && (
          <p className="mt-6 text-sm text-red-400 bg-red-950/40 border border-red-900 px-4 py-2 rounded-lg">
            {error}
          </p>
        )}

        {isLoading && <LoadingTimeline steps={agentSteps} />}

        {blueprint && !isLoading && (
          <BlueprintDashboard blueprint={blueprint} />
        )}
      </main>

      <Footer />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reads a fetch() Response body as a stream of newline-delimited JSON
// objects and dispatches each one to the right callback. Kept in this file
// since it's only ever used by handleGenerate() above.
// ---------------------------------------------------------------------------
async function readNdjsonStream(response, { onProgress, onResult, onError }) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Lines are separated by "\n"; the last (possibly incomplete) chunk
    // stays in the buffer until more data arrives.
    const lines = buffer.split("\n");
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.trim()) continue;
      const event = JSON.parse(line);

      if (event.type === "progress") onProgress(event);
      else if (event.type === "result") onResult(event.data);
      else if (event.type === "error") onError(event.message);
    }
  }
}

// --- Navbar -----------------------------------------------------------------
function Navbar() {
  return (
    <header className="w-full border-b border-slate-900 px-6 py-4 flex items-center justify-between">
      <span className="font-bold text-lg tracking-tight">
        Launch<span className="text-indigo-400">Pilot</span> AI
      </span>
      <span className="text-xs text-slate-500 hidden sm:block">
        Your Autonomous AI Co-Founder
      </span>
    </header>
  );
}

// --- Hero --------------------------------------------------------------------
function Hero() {
  return (
    <section className="text-center max-w-2xl mt-16 mb-6">
      <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
        Turn your idea into a{" "}
        <span className="text-indigo-400">full startup blueprint</span>
      </h1>
      <p className="text-slate-400 text-base md:text-lg">
        Nine specialized AI agents analyze your idea end-to-end — market,
        customers, product, tech stack, business model, pitch, roadmap, and a
        final AI Critic review with scores, SWOT, risks, and budget.
      </p>
    </section>
  );
}

// --- IdeaInput ----------------------------------------------------------------
function IdeaInput({ idea, setIdea, onGenerate, isLoading }) {
  return (
    <div className="w-full max-w-2xl">
      <textarea
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        placeholder='e.g. "I want to build an AI platform for placement preparation."'
        rows={3}
        disabled={isLoading}
        className="w-full resize-none rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-shadow"
      />

      <button
        onClick={onGenerate}
        disabled={isLoading}
        className="mt-4 w-full md:w-auto md:px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed font-semibold transition-colors"
      >
        {isLoading ? "Generating Blueprint..." : "Generate Blueprint"}
      </button>
    </div>
  );
}

// --- Footer --------------------------------------------------------------------
function Footer() {
  return (
    <footer className="w-full border-t border-slate-900 px-6 py-4 text-center text-xs text-slate-600">
      LaunchPilot AI — Version 2
    </footer>
  );
}