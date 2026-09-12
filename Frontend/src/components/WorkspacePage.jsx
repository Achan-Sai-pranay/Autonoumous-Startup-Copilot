// components/WorkspacePage.jsx
// ---------------------------------------------------------------------------
// Dedicated Autonomous Startup Copilot Workspace Page
// Separates the deep working agent engine and blueprint dashboard from the
// marketing landing page. Provides dedicated prompt deck, live 12-agent
// timeline streaming, interactive synthesized blueprint tabs, and vault access.
// ---------------------------------------------------------------------------
import { useState, useRef, useEffect } from "react";
import LoadingTimeline from "./LoadingTimeline.jsx";
import BlueprintDashboard from "./BlueprintDashboard.jsx";
import { useSpeechToText } from "../hooks/useSpeechToText.js";
import {
  ArrowLeft,
  Zap,
  Mic,
  MicOff,
  Sparkles,
  History,
  RotateCcw,
  PlusCircle,
  FileText,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

const SUGGESTIONS = [
  {
    label: "B2B AI Contract Auditor",
    text: "An AI-powered B2B platform that audits enterprise vendor contracts, flags compliance risks, and benchmarks pricing automatically.",
    category: "LegalTech / SaaS",
  },
  {
    label: "Sub-ms Vector Cache",
    text: "A high-performance in-memory semantic cache for LLMs that cuts OpenAI/Anthropic API costs by 70% with sub-millisecond p99 latency.",
    category: "Developer Infra",
  },
  {
    label: "Micro-Fulfillment Logistics OS",
    text: "An autonomous operating system for dark stores and quick-commerce warehouses featuring dynamic inventory slotting and predictive restock.",
    category: "Supply Chain",
  },
  {
    label: "Rural Health Triage EHR",
    text: "An offline-first voice-driven EHR and triage copilot designed for rural clinics with automated ICD-10 coding and SMS patient follow-ups.",
    category: "Digital Health",
  },
];

export default function WorkspacePage({
  idea,
  setIdea,
  onGenerate,
  isLoading,
  blueprint,
  setBlueprint,
  agentSteps,
  error,
  setError,
  onBackToHome,
  onOpenHistory,
  historyCount,
  currentUser,
}) {
  const inputRef = useRef(null);
  const [showPromptTweak, setShowPromptTweak] = useState(false);

  useEffect(() => {
    // Focus textarea on initial load if no blueprint exists
    if (!blueprint && !isLoading) {
      inputRef.current?.focus();
    }
  }, [blueprint, isLoading]);

  const handleStartNew = () => {
    setBlueprint(null);
    setShowPromptTweak(false);
    setError("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white antialiased">
      {/* 1. Top Workspace Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between shadow-2xs">
        {/* Left: Back button + LP Brand */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
            title="Back to Landing Page"
          >
            <ArrowLeft size={14} />
            <span className="hidden xs:inline">Back to Home</span>
          </button>

          <div className="h-4 w-px bg-slate-200 hidden xs:block" />

          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              LP
            </div>
            <span className="font-extrabold text-slate-900 text-base hidden sm:inline">
              Launch<span className="text-orange-600">Pilot</span>
            </span>
            <span className="text-[11px] font-mono font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded ml-1">
              Copilot Studio
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {blueprint && !isLoading && (
            <button
              onClick={handleStartNew}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-all cursor-pointer"
            >
              <PlusCircle size={14} />
              <span className="hidden sm:inline">New Blueprint</span>
            </button>
          )}

          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-orange-300 hover:text-orange-600 transition-all cursor-pointer shadow-2xs"
            title="Open saved projects vault"
          >
            <History size={14} className="text-slate-500" />
            <span className="hidden sm:inline">Vault</span>
            {historyCount > 0 && (
              <span className="ml-0.5 text-[10px] font-mono bg-orange-600 text-white rounded-full px-1.5 py-0.2 leading-none font-bold">
                {historyCount}
              </span>
            )}
          </button>

          {currentUser && (
            <div className="flex items-center gap-1.5 pl-1">
              <img
                src={currentUser.avatarUrl || "/images/avatar1.jpeg"}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full border border-orange-200 object-cover"
              />
            </div>
          )}
        </div>
      </header>

      {/* 2. Workspace Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col items-center">
        {/* VIEW 1: Input & Synthesis View (when no blueprint or modifying) */}
        {(!blueprint || showPromptTweak || isLoading) && (
          <div className="w-full max-w-3xl animate-fade-in flex flex-col items-center">
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-orange-50 text-orange-600 border border-orange-200 mb-2">
                <Sparkles size={13} />
                Autonomous Startup Copilot
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Turn your startup concept into a full venture blueprint
              </h1>
              <p className="text-xs sm:text-base text-slate-500 mt-2 max-w-xl mx-auto leading-relaxed">
                Describe your business idea, target market, or problem thesis. 12 autonomous AI
                co-founders will synthesize financial models, technical PRDs, ICPs, and roadmaps.
              </p>
            </div>

            {/* Prompt Input Deck */}
            <div className="w-full">
              <WorkspaceInput
                idea={idea}
                setIdea={setIdea}
                onGenerate={() => {
                  setShowPromptTweak(false);
                  onGenerate();
                }}
                isLoading={isLoading}
                inputRef={inputRef}
              />

              {error && (
                <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between animate-fade-in">
                  <span>{error}</span>
                  <button
                    onClick={() => setError("")}
                    className="text-red-500 hover:text-red-800 font-bold ml-2 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* 12-Agent Live Streaming Timeline */}
              {isLoading && <LoadingTimeline steps={agentSteps} />}

              {/* Suggestions Cards (when idle) */}
              {!isLoading && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                      Inspiration theses to test:
                    </span>
                    <span className="text-[11px] text-slate-400">Click to load instantly</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => {
                          setIdea(s.text);
                          inputRef.current?.focus();
                        }}
                        className="text-left p-3.5 rounded-xl bg-white hover:bg-orange-50/40 border border-slate-200 hover:border-orange-300 transition-all cursor-pointer shadow-2xs group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                              {s.label}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-100 text-slate-500">
                              {s.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {s.text}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: Complete Synthesized Blueprint Dashboard */}
        {blueprint && !isLoading && (
          <div className="w-full animate-fade-in">
            {/* Top Prompt Banner with quick edit button */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="p-2 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 shrink-0 mt-0.5">
                  <Sparkles size={16} />
                </span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.2 rounded">
                      Synthesis Complete
                    </span>
                    <span className="text-xs text-slate-400 font-mono">12 Co-Founders Evaluated</span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-700 line-clamp-2 italic">
                    "{idea}"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                <button
                  onClick={() => setShowPromptTweak((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>{showPromptTweak ? "Hide Edit Box" : "Modify Idea"}</span>
                </button>

                <button
                  onClick={handleStartNew}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                >
                  <PlusCircle size={13} />
                  <span>New Thesis</span>
                </button>
              </div>
            </div>

            {/* Dashboard Container */}
            <BlueprintDashboard blueprint={blueprint} originalIdea={idea} />
          </div>
        )}
      </main>
    </div>
  );
}

// --- Internal Workspace IdeaInput ---
function WorkspaceInput({ idea, setIdea, onGenerate, isLoading, inputRef }) {
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

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !isLoading) {
      e.preventDefault();
      onGenerate();
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-slate-200 shadow-xl shadow-orange-500/5 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/15 transition-all">
      <div className="relative">
        <textarea
          ref={inputRef}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your startup concept, target problem, or technical thesis... (e.g. 'An autonomous AI accounting platform for freelancers with automated receipt OCR and tax filing')"
          rows={4}
          disabled={isLoading}
          className="w-full resize-none bg-transparent px-3.5 pt-2 pb-8 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none disabled:opacity-50 font-sans leading-relaxed"
        />

        {/* Bottom Deck Actions */}
        <div className="flex items-center justify-between px-2 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>{idea.length} chars</span>
            {idea.length > 0 && (
              <button
                type="button"
                onClick={() => setIdea("")}
                className="hover:text-slate-700 ml-1 cursor-pointer font-sans"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {micSupported && (
              <button
                type="button"
                onClick={toggleListening}
                disabled={isLoading}
                title={isListening ? "Stop recording" : "Dictate your idea"}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isListening
                    ? "bg-red-50 text-red-600 border border-red-200 animate-pulse"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                <span className="hidden sm:inline text-[11px]">
                  {isListening ? "Listening..." : "Dictate"}
                </span>
              </button>
            )}

            <button
              onClick={onGenerate}
              disabled={isLoading || !idea.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-orange-600 hover:bg-orange-700 text-white disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-md shadow-orange-500/20 transition-all cursor-pointer active:scale-95"
            >
              <Zap size={15} className={isLoading ? "animate-spin" : ""} />
              <span>{isLoading ? "Synthesizing…" : "Generate Blueprint"}</span>
              <span className="hidden sm:inline-flex px-1.5 py-0.2 rounded bg-orange-700/60 text-[10px] font-mono text-orange-100">
                ⌘↵
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
