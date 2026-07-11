// App.jsx
// ---------------------------------------------------------------------------
// The entire page lives in this one file. Navbar, Hero, IdeaInput, and
// Footer are small enough and used only once, so they're plain functions
// in this file rather than separate component files.
//
// ---------------------------------------------------------------------------
import { useState, useEffect } from "react";
import LoadingTimeline, { AGENT_STEP_NAMES } from "./components/LoadingTimeline.jsx";
import BlueprintDashboard from "./components/BlueprintDashboard.jsx";
import SplineBackground from "./components/SplineBackground.jsx";
import HistoryPanel from "./components/HistoryPanel.jsx";
import { getHistory, saveToHistory, deleteFromHistory } from "./lib/projectHistory.js";
import { useSpeechToText } from "./hooks/useSpeechToText.js";
import { History, Mic, MicOff } from "lucide-react";

// Change this if your backend runs on a different port.
const API_URL = "http://localhost:5001/api/generate-blueprint";

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

  // --- Startup History & Saved Projects (localStorage-backed) -------------
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load whatever was saved from previous sessions on first mount.
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  function handleOpenHistory() {
    setHistory(getHistory()); // refresh in case another tab changed it
    setShowHistory(true);
  }

  function handleLoadProject(entry) {
    setIdea(entry.idea);
    setBlueprint(entry.blueprint);
    setError("");
    setShowHistory(false);
  }

  function handleDeleteProject(id) {
    setHistory(deleteFromHistory(id));
  }

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
        onResult: (data) => {
          setBlueprint(data);
          // Auto-save every completed blueprint to history.
          setHistory(saveToHistory(idea.trim(), data));
        },
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
    <>
      <SplineBackground />
      <div className="relative z-10 min-h-screen bg-transparent text-white flex flex-col">
        <Navbar onOpenHistory={handleOpenHistory} historyCount={history.length} />
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
             <BlueprintDashboard blueprint={blueprint} originalIdea={idea} />
          )}
        </main>
        <Footer />
      </div>

      <HistoryPanel
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={history}
        onLoad={handleLoadProject}
        onDelete={handleDeleteProject}
      />
    </>
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
function Navbar({ onOpenHistory, historyCount }) {
  return (
    <header className="w-full border-b border-slate-900 px-6 py-4 flex items-center justify-between">
      <span className="font-bold text-lg tracking-tight">
        Launch<span className="text-indigo-400">Pilot</span> AI
      </span>

      <div className="flex items-center gap-4">
        <button
          onClick={onOpenHistory}
          className="relative flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-100 transition-colors"
        >
          <History size={16} />
          <span className="hidden sm:inline">History</span>
          {historyCount > 0 && (
            <span className="ml-0.5 text-xs bg-indigo-600 text-white rounded-full px-1.5 py-0.5 leading-none">
              {historyCount}
            </span>
          )}
        </button>
        <span className="text-xs text-slate-500 hidden sm:block">
          Your Autonomous AI Co-Founder
        </span>
      </div>
    </header>
  );
}

// --- Hero --------------------------------------------------------------------
function Hero() {
  return (
    <section className="text-center max-w-2xl mt-16 mb-6">
      <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 drop-shadow-[0_2px_20px_rgba(2,6,23,0.9)]">
        Turn your idea into a{" "}
        <span className="text-cyan-300 drop-shadow-[0_2px_16px_rgba(2,6,23,0.9)]">
          full
        </span>{" "}
        startup blueprint
      </h1>
      <p className="text-slate-300 text-base md:text-lg drop-shadow-[0_2px_12px_rgba(2,6,23,0.9)]">
        5 specialized AI agents collaborate to validate your idea, research your market, design your product, craft your business strategy, and generate a launch-ready startup blueprint.
      </p>
    </section>
  );
}

// --- IdeaInput ---------------------------------------------------------------
function IdeaInput({ idea, setIdea, onGenerate, isLoading }) {
  const {
    isSupported: micSupported,
    isListening,
    error: micError,
    toggleListening,
  } = useSpeechToText({
    onResult: (transcript) => {
      setIdea((prev) => (prev.trim() ? `${prev.trim()} ${transcript}` : transcript));
    },
  });

  return (
    <div className="w-full max-w-2xl">
      <div className="relative">
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder='e.g. "I want to build an AI platform for placement preparation."'
          rows={3}
          disabled={isLoading}
          className="w-full resize-none rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 pr-12 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-shadow"
        />

        {micSupported && (
          <button
            type="button"
            onClick={toggleListening}
            disabled={isLoading}
            title={isListening ? "Stop recording" : "Speak your idea"}
            className={`absolute bottom-3 right-3 flex items-center justify-center w-8 h-8 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              isListening
                ? "bg-red-600 text-white animate-pulse"
                : "bg-slate-800 text-slate-400 hover:text-indigo-400 hover:bg-slate-700"
            }`}
          >
            {isListening ? <MicOff size={15} /> : <Mic size={15} />}
          </button>
        )}
      </div>

      {isListening && (
        <p className="mt-2 text-xs text-indigo-400 animate-pulse">
          Listening… speak your idea.
        </p>
      )}
      {micError && <p className="mt-2 text-xs text-red-400">{micError}</p>}

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
      LaunchPilot AI — Version 3
    </footer>
  );
}