// App.jsx
// ---------------------------------------------------------------------------
// LaunchPilot AI — Complete White + Orange Homepage inspired by VenturusAI
// Features 12 Autonomous AI Co-Founders, Interactive Auth (Sign In / Sign Out),
// Real-time NDJSON streaming pipeline, Project Vault, and Full Marketing Suite.
// ---------------------------------------------------------------------------
import { useState, useEffect, useRef } from "react";
import LoadingTimeline, { AGENT_STEP_NAMES } from "./components/LoadingTimeline.jsx";
import BlueprintDashboard from "./components/BlueprintDashboard.jsx";
import SplineBackground from "./components/SplineBackground.jsx";
import HistoryPanel from "./components/HistoryPanel.jsx";
import AuthModal from "./components/AuthModal.jsx";
import {
  AnnouncementBanner,
  HeroMockupPreview,
  MarqueeLogos,
  StatsSection,
  FeaturesGrid,
  AudienceTabs,
  TestimonialsSection,
  PricingSection,
  FaqSection,
  FullFooter,
  FloatingChatWidget,
} from "./components/MarketingSections.jsx";
import { getHistory, saveToHistory, deleteFromHistory } from "./lib/projectHistory.js";
import { getStoredUser, clearUserSession } from "./lib/authContext.js";
import { useSpeechToText } from "./hooks/useSpeechToText.js";
import {
  History,
  Mic,
  MicOff,
  ArrowRight,
  Sparkles,
  Check,
  Heart,
  User,
  LogOut,
  ChevronDown,
  Zap,
} from "lucide-react";

const API_URL = "http://localhost:5001/api/generate-blueprint";

function buildInitialSteps() {
  return AGENT_STEP_NAMES.map((name) => ({ name, status: "pending" }));
}

export default function App() {
  const [idea, setIdea] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [blueprint, setBlueprint] = useState(null);
  const [error, setError] = useState("");
  const [agentSteps, setAgentSteps] = useState(buildInitialSteps());

  // --- Auth & Session State ------------------------------------------------
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // --- Startup History & Saved Projects -----------------------------------
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const generatorRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setHistory(getHistory());
    setCurrentUser(getStoredUser());
  }, []);

  function handleOpenHistory() {
    setHistory(getHistory());
    setShowHistory(true);
  }

  function handleLoadProject(entry) {
    setIdea(entry.idea);
    setBlueprint(entry.blueprint);
    setError("");
    setShowHistory(false);
    setTimeout(() => {
      generatorRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  function handleDeleteProject(id) {
    setHistory(deleteFromHistory(id));
  }

  function handleSignOut() {
    clearUserSession();
    setCurrentUser(null);
  }

  function handleAuthSuccess(user) {
    setCurrentUser(user);
    setShowAuthModal(false);
  }

  function scrollToGenerator(focus = true) {
    generatorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (focus) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 400);
    }
  }

  function handleLiveDemo() {
    setIdea(
      "An AI-powered B2B platform that audits enterprise vendor contracts, flags compliance risks, and benchmarks pricing automatically."
    );
    scrollToGenerator(true);
  }

  async function handleGenerate() {
    if (!idea.trim()) {
      setError("Please describe your startup idea first.");
      scrollToGenerator(true);
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
          setHistory(saveToHistory(idea.trim(), data));
        },
        onError: (message) => setError(message),
      });
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong while generating your blueprint. Is the backend running on port 5001?"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white antialiased">
      <SplineBackground />

      {/* 1. Top Announcement Bar */}
      <AnnouncementBanner onCtaClick={() => scrollToGenerator(true)} />

      {/* 2. Sticky Glass Navbar */}
      <Navbar
        onOpenHistory={handleOpenHistory}
        historyCount={history.length}
        currentUser={currentUser}
        onOpenAuth={() => setShowAuthModal(true)}
        onSignOut={handleSignOut}
        onCtaClick={handleLiveDemo}
        onStartClick={() => scrollToGenerator(true)}
      />

      <main className="relative z-10 flex-1 flex flex-col items-center w-full">
        {/* 3. VenturusAI Hero Section (Exact Match) */}
        <Hero
          onStartClick={() => scrollToGenerator(true)}
          onDemoClick={handleLiveDemo}
        />

        {/* 4. Hero Dashboard Mockup Showcase */}
        <HeroMockupPreview onCtaClick={() => scrollToGenerator(true)} />

        {/* 5. Interactive Generator Input Deck - UNBLOCKED AGENT COPILOT */}
        <div ref={generatorRef} id="generator" className="w-full max-w-3xl px-4 mt-2 mb-16 scroll-mt-20">
          <div className="text-center mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-orange-50 text-orange-600 border border-orange-200">
              <Sparkles size={13} />
              Autonomous Startup Copilot
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Turn your startup idea into a comprehensive venture blueprint
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Free & instant. No signup required. Evaluated by 12 Autonomous AI Co-Founders.
            </p>
          </div>

          <IdeaInput
            idea={idea}
            setIdea={setIdea}
            onGenerate={handleGenerate}
            isLoading={isLoading}
            inputRef={inputRef}
          />

          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError("")}
                className="text-red-500 hover:text-red-800 font-bold ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {isLoading && <LoadingTimeline steps={agentSteps} />}
        </div>

        {/* 6. Complete Synthesized Dashboard (when blueprint exists) */}
        {blueprint && !isLoading && (
          <div className="w-full border-t border-slate-200/80 bg-slate-50/40 py-8">
            <BlueprintDashboard blueprint={blueprint} originalIdea={idea} />
          </div>
        )}

        {/* 7. VenturusAI Marketing Sections */}
        <div className="w-full">
          <MarqueeLogos />
          <div id="how-it-works">
            <StatsSection />
          </div>
          <FeaturesGrid />
          <div id="audience">
            <AudienceTabs onSelectTab={() => scrollToGenerator(true)} />
          </div>
          <TestimonialsSection />
          <PricingSection onSelectPlan={() => scrollToGenerator(true)} />
          <FaqSection onCtaClick={() => scrollToGenerator(true)} />
        </div>
      </main>

      {/* 8. Full Clean Footer */}
      <FullFooter />

      {/* 9. Floating AI Assistant Chat Widget */}
      <FloatingChatWidget
        onSuggestionClick={(text) => {
          setIdea(text);
          scrollToGenerator(true);
        }}
      />

      {/* Modals & Overlays */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleAuthSuccess}
      />

      <HistoryPanel
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={history}
        onLoad={handleLoadProject}
        onDelete={handleDeleteProject}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reads a fetch() Response body as a stream of newline-delimited JSON
// ---------------------------------------------------------------------------
async function readNdjsonStream(response, { onProgress, onResult, onError }) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
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

// --- Navbar Component -------------------------------------------------------
function Navbar({
  onOpenHistory,
  historyCount,
  currentUser,
  onOpenAuth,
  onSignOut,
  onCtaClick,
  onStartClick,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full border-b border-gray-200 bg-white/95 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40 transition-all">
      {/* Brand Logo & Live Demo Link (matching VenturusAI) */}
      <div className="flex items-center gap-5">
        <a href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-xs shadow-sm group-hover:scale-105 transition-transform">
            LP
          </div>
          <span className="font-extrabold text-lg tracking-tight text-gray-900">
            Launch<span className="text-orange-600">Pilot</span>
          </span>
        </a>

        <button
          onClick={onCtaClick}
          className="font-bold text-sm text-orange-600 hover:text-orange-700 cursor-pointer hidden xs:inline-block transition-colors"
        >
          Live demo
        </button>
      </div>

      {/* Nav Links (VenturusAI exact style) */}
      <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-gray-700">
        <a href="#features" className="hover:text-orange-600 transition-colors">
          Features
        </a>
        <a href="#how-it-works" className="hover:text-orange-600 transition-colors">
          How it Works
        </a>
        <a href="#audience" className="hover:text-orange-600 transition-colors">
          Audience
        </a>
        <a href="#pricing" className="hover:text-orange-600 transition-colors">
          Pricing
        </a>
        <a href="#testimonials" className="hover:text-orange-600 transition-colors">
          Reviews
        </a>
        <a href="#faq" className="hover:text-orange-600 transition-colors">
          FAQ
        </a>
      </nav>

      {/* Right Actions: Vault & Unblocked Start / Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        <button
          onClick={onOpenHistory}
          className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 hover:border-orange-300 hover:text-orange-600 transition-all cursor-pointer shadow-2xs"
          title="Open saved projects vault"
        >
          <History size={14} className="text-gray-500" />
          <span className="hidden sm:inline">Vault</span>
          {historyCount > 0 && (
            <span className="ml-0.5 text-[10px] font-mono bg-orange-600 text-white rounded-full px-1.5 py-0.2 leading-none font-bold">
              {historyCount}
            </span>
          )}
        </button>

        {currentUser ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:border-orange-300 transition-all cursor-pointer"
            >
              <img
                src={currentUser.avatarUrl || "/images/avatar1.jpeg"}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full border border-orange-200 object-cover"
              />
              <span className="text-xs font-semibold text-gray-800 max-w-[90px] truncate hidden sm:inline">
                {currentUser.name}
              </span>
              <ChevronDown size={13} className="text-gray-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-gray-200 shadow-xl py-2 z-50 animate-toast-in">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-900 truncate">{currentUser.name}</p>
                  <p className="text-[11px] text-gray-500 truncate">{currentUser.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-mono text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.2 rounded font-semibold">
                    {currentUser.plan || "Free Starter"}
                  </span>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenHistory();
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-orange-50 hover:text-orange-700 flex items-center gap-2 cursor-pointer"
                  >
                    <History size={13} />
                    <span>My Blueprints ({historyCount})</span>
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onSignOut();
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut size={13} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onStartClick}
            className="inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all bg-orange-600 text-white shadow-xs hover:bg-orange-700 h-9 sm:h-10 px-3.5 sm:px-4 py-2 cursor-pointer active:scale-95"
          >
            <span>Start for free</span>
          </button>
        )}
      </div>
    </header>
  );
}

// --- VenturusAI Hero Section (Exact Match) ----------------------------------
function Hero({ onStartClick, onDemoClick }) {
  return (
    <section className="relative z-10 text-center max-w-5xl pt-10 sm:pt-14 pb-4 px-4 w-full">
      {/* Two-tone Headline with Blinking Cursor */}
      <div className="text-4xl xs:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none text-gray-900 mb-6">
        <div className="flex space-x-1 my-0 justify-center items-center">
          <span className="text-orange-600 inline-block font-extrabold">
            All-in-One solution
          </span>
          <span className="inline-block rounded-sm w-[4px] bg-orange-500 h-8 xs:h-10 md:h-14 lg:h-16 ml-1 animate-pulse"></span>
        </div>
        <span className="block text-gray-900 mt-2 font-black">
          for your business
        </span>
      </div>

      {/* Subtitle matching VenturusAI exact copy */}
      <p className="mb-6 lg:mb-8 font-medium md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
        <span>Revolutionize Your Business Strategies with LaunchPilot:</span>
        <br />
        <span>Analyze, Enhance, and Drive Growth with AI-Powered Insights.</span>
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col space-y-3 xs:flex-row xs:space-y-0 xs:space-x-4 justify-center items-center mb-8">
        <button
          onClick={onStartClick}
          className="inline-flex justify-center items-center py-3.5 px-7 text-base font-semibold text-center rounded-lg bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/25 transition-all cursor-pointer active:scale-95"
        >
          <span>Start for free</span>
          <ArrowRight size={18} className="ml-2" />
        </button>

        <button
          onClick={onDemoClick}
          className="inline-flex justify-center items-center py-3.5 px-6 text-base font-semibold text-center text-gray-900 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all cursor-pointer active:scale-95"
        >
          Live Demo
        </button>
      </div>

      {/* Trust & Social Proof with Real Downloaded Avatars */}
      <div className="flex flex-col items-center space-y-2.5 mt-4">
        {/* Line 1: No credit card required with circular checkmark */}
        <p className="text-sm text-gray-600 flex items-center font-medium">
          <span className="inline-flex items-center justify-center w-5 h-5 mr-1.5 border border-gray-400 rounded-full text-gray-600">
            <Check size={11} strokeWidth={3} />
          </span>
          No credit card required
        </p>

        {/* Line 2: Loved by 156,000+ users with circular heart + 4 avatars + +156k */}
        <div className="flex flex-wrap xs:flex-nowrap items-center justify-center gap-2.5 pt-1">
          <span className="text-sm text-gray-600 flex items-center font-medium">
            <span className="inline-flex items-center justify-center w-5 h-5 mr-1.5 border border-gray-400 rounded-full text-gray-600">
              <Heart size={11} fill="currentColor" />
            </span>
            <span>Loved by 156,000+ users</span>
          </span>

          <div className="flex -space-x-3 rtl:space-x-reverse overflow-hidden items-center">
            <img
              className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-xs"
              src="/images/avatar1.jpeg"
              alt="User Avatar 1"
            />
            <img
              className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-xs"
              src="/images/avatar2.jpeg"
              alt="User Avatar 2"
            />
            <img
              className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-xs"
              src="/images/avatar3.jpeg"
              alt="User Avatar 3"
            />
            <img
              className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-xs"
              src="/images/avatar4.jpeg"
              alt="User Avatar 4"
            />
            <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-black text-center text-xs font-bold text-white shadow-xs">
              +156k
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Quick Prompt Suggestion Chips ---
const SUGGESTIONS = [
  {
    label: "B2B AI Contract Auditor",
    text: "An AI-powered B2B platform that audits enterprise vendor contracts, flags compliance risks, and benchmarks pricing automatically.",
  },
  {
    label: "Sub-ms Vector Cache",
    text: "A high-performance in-memory semantic cache for LLMs that cuts OpenAI/Anthropic API costs by 70% with sub-millisecond p99 latency.",
  },
  {
    label: "Micro-Fulfillment Logistics OS",
    text: "An autonomous operating system for dark stores and quick-commerce warehouses featuring dynamic inventory slotting and predictive restock.",
  },
  {
    label: "Rural Health Triage EHR",
    text: "An offline-first voice-driven EHR and triage copilot designed for rural clinics with automated ICD-10 coding and SMS patient follow-ups.",
  },
];

// --- IdeaInput Component ----------------------------------------------------
function IdeaInput({ idea, setIdea, onGenerate, isLoading, inputRef }) {
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
    <div className="w-full">
      {/* Elevated Prompt Deck */}
      <div className="bg-white rounded-3xl p-3.5 sm:p-5 border-2 border-gray-200 shadow-xl shadow-orange-500/5 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/15 transition-all">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your startup concept, target problem, or technical thesis... (e.g. 'An autonomous AI accounting platform for freelancers with automated receipt OCR and tax filing')"
            rows={3}
            disabled={isLoading}
            className="w-full resize-none bg-transparent px-3.5 pt-2 pb-8 text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none disabled:opacity-50 font-sans leading-relaxed"
          />

          {/* Bottom Deck Actions */}
          <div className="flex items-center justify-between px-2 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono">
              <span>{idea.length} chars</span>
              {idea.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIdea("")}
                  className="hover:text-gray-700 ml-1 cursor-pointer font-sans"
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
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-orange-600 hover:bg-orange-700 text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-md shadow-orange-500/20 transition-all cursor-pointer active:scale-95"
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

      {micError && (
        <p className="mt-2 text-xs text-red-500 font-mono text-center">{micError}</p>
      )}

      {/* Suggestion Chips */}
      {!isLoading && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="text-[11px] text-slate-400 font-mono">Try a thesis:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setIdea(s.text)}
              className="text-[11px] text-slate-600 hover:text-orange-600 bg-white hover:bg-orange-50/50 border border-slate-200 hover:border-orange-200 px-3 py-1 rounded-lg transition-all cursor-pointer shadow-2xs"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}