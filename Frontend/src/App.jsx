// App.jsx
// ---------------------------------------------------------------------------
// LaunchPilot AI — Complete White + Orange Homepage inspired by VenturusAI
// Features 12 Autonomous AI Co-Founders, Interactive Auth (Sign In / Sign Out),
// Real-time NDJSON streaming pipeline, Project Vault, and Full Marketing Suite.
// ---------------------------------------------------------------------------
import { useState, useEffect, useRef } from "react";
import LoadingTimeline, { AGENT_STEP_NAMES } from "./components/LoadingTimeline.jsx";
import BlueprintDashboard from "./components/BlueprintDashboard.jsx";
import WorkspacePage from "./components/WorkspacePage.jsx";
import SplineBackground from "./components/SplineBackground.jsx";
import HistoryPanel from "./components/HistoryPanel.jsx";
import AuthModal from "./components/AuthModal.jsx";
import CoFounderChatDrawer from "./components/CoFounderChatDrawer.jsx";
import {
  AnnouncementBanner,
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
import { getHistory, saveToHistory, deleteFromHistory, syncHistoryFromCloud } from "./lib/projectHistory.js";
import { getCurrentUser, logout } from "./lib/authContext.js";
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

const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api/generate-blueprint";
const API_URL = rawApiUrl.endsWith("/api/generate-blueprint")
  ? rawApiUrl
  : `${rawApiUrl.replace(/\/+$/, "")}/api/generate-blueprint`;

function buildInitialSteps() {
  return AGENT_STEP_NAMES.map((name) => ({ name, status: "pending" }));
}

export default function App() {
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const hash = window.location.hash;
      return path === "/app" || hash === "#app" ? "workspace" : "home";
    }
    return "home";
  });

  const [idea, setIdea] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [blueprint, setBlueprint] = useState(null);
  const [error, setError] = useState("");
  const [agentSteps, setAgentSteps] = useState(buildInitialSteps());

  // --- Auth & Session State ------------------------------------------------
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");

  function handleOpenAuth(mode = "login") {
    setAuthModalMode(mode);
    setShowAuthModal(true);
  }

  // --- Startup History & Saved Projects -----------------------------------
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) {
        setCurrentUser(user);
        setHistory(getHistory(user.id));
        // Auto-navigate to dashboard if user has active session
        setCurrentView("workspace");
        if (typeof window !== "undefined") {
          window.history.replaceState({ view: "workspace" }, "", "/app");
        }
      } else {
        setHistory(getHistory(null));
      }
    });
  }, []);

  useEffect(() => {
    setHistory(getHistory(currentUser?.id));
  }, [currentUser]);

  function navigateTo(view, updateHistory = true, replace = false) {
    setCurrentView(view);
    if (updateHistory && typeof window !== "undefined") {
      const targetUrl = view === "workspace" ? "/app" : "/";
      if (replace) {
        window.history.replaceState({ view }, "", targetUrl);
      } else if (window.location.pathname !== targetUrl) {
        window.history.pushState({ view }, "", targetUrl);
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    function handlePopState(e) {
      if (currentUser) {
        // Authenticated user always stays inside workspace dashboard
        setCurrentView("workspace");
        if (typeof window !== "undefined" && window.location.pathname !== "/app") {
          window.history.replaceState({ view: "workspace" }, "", "/app");
        }
        return;
      }
      const view =
        e.state?.view ||
        (window.location.pathname === "/app" || window.location.hash === "#app"
          ? "workspace"
          : "home");
      setCurrentView(view);
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [currentUser]);

  const generatorRef = useRef(null);
  const inputRef = useRef(null);

  async function handleOpenHistory() {
    setHistory(getHistory(currentUser?.id));
    setShowHistory(true);
    if (currentUser?.id) {
      try {
        const cloudProjects = await syncHistoryFromCloud(currentUser.id);
        if (cloudProjects && cloudProjects.length > 0) {
          setHistory(cloudProjects);
        }
      } catch (e) {
        // Safe fallback to local history
      }
    }
  }

  function handleLoadProject(entry) {
    setIdea(entry.idea);
    setBlueprint(entry.blueprint);
    setError("");
    setShowHistory(false);
    navigateTo("workspace");
  }

  function handleDeleteProject(id) {
    setHistory(deleteFromHistory(id, currentUser?.id));
  }

  async function handleSignOut() {
    await logout();
    setCurrentUser(null);
    setBlueprint(null);
    setIdea("");
    setHistory(getHistory(null));
    navigateTo("home", true, true);
  }

  function handleAuthSuccess(user) {
    setCurrentUser(user);
    setShowAuthModal(false);
    setHistory(getHistory(user?.id));
    navigateTo("workspace", true, true);
  }

  function handleLiveDemo() {
    setIdea(
      "An AI-powered B2B platform that audits enterprise vendor contracts, flags compliance risks, and benchmarks pricing automatically."
    );
    navigateTo("workspace");
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
          setHistory(saveToHistory(idea.trim(), data, currentUser?.id));
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

  // --- VIEW 1: DEDICATED WORKSPACE & COPILOT PAGE (/app) ----------------------
  if (currentView === "workspace") {
    return (
      <div className="relative h-screen w-full bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white antialiased overflow-hidden">
        <WorkspacePage
          idea={idea}
          setIdea={setIdea}
          onGenerate={handleGenerate}
          isLoading={isLoading}
          blueprint={blueprint}
          setBlueprint={setBlueprint}
          agentSteps={agentSteps}
          error={error}
          setError={setError}
          onBackToHome={() => navigateTo("home")}
          onOpenHistory={handleOpenHistory}
          history={history}
          historyCount={history.length}
          onLoadProject={handleLoadProject}
          onDeleteProject={handleDeleteProject}
          currentUser={currentUser}
          onOpenAuth={handleOpenAuth}
          onSignOut={handleSignOut}
        />

        <CoFounderChatDrawer blueprint={blueprint} originalIdea={idea} />

        <AuthModal
          isOpen={showAuthModal}
          initialMode={authModalMode}
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

  // --- VIEW 2: VENTURUSAI-IDENTICAL HOMEPAGE (/) -----------------------------
  return (
    <div className="relative min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white antialiased">
      <SplineBackground />

      {/* 1. Top Announcement Bar */}
      <AnnouncementBanner onCtaClick={() => navigateTo("workspace")} />

      {/* 2. Sticky Glass Navbar */}
      <Navbar
        onOpenHistory={handleOpenHistory}
        historyCount={history.length}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onSignOut={handleSignOut}
        onCtaClick={handleLiveDemo}
        onStartClick={() => navigateTo("workspace")}
      />

      <main className="relative z-10 flex-1 flex flex-col items-center w-full">
        {/* 3. VenturusAI Hero Section (Exact Match) */}
        <Hero
          onStartClick={() => navigateTo("workspace")}
          onDemoClick={handleLiveDemo}
        />

        {/* 4. VenturusAI Marketing Sections Suite */}
        <div className="w-full">
          <MarqueeLogos />
          <div id="how-it-works">
            <StatsSection />
          </div>
          <FeaturesGrid />
          <div id="audience">
            <AudienceTabs onSelectTab={() => navigateTo("workspace")} />
          </div>
          <TestimonialsSection />
          <PricingSection onSelectPlan={() => navigateTo("workspace")} />
          <FaqSection onCtaClick={() => navigateTo("workspace")} />
        </div>
      </main>

      {/* 6. Full Clean Footer */}
      <FullFooter />

      {/* 7. Floating Gemini 3.7 Flash AI Co-Founder Chat Drawer */}
      <CoFounderChatDrawer blueprint={blueprint} originalIdea={idea} />

      {/* Modals & Overlays */}
      <AuthModal
        isOpen={showAuthModal}
        initialMode={authModalMode}
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

      {/* Right Actions: Unblocked Start / Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
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
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => onOpenAuth?.("login")}
              className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-orange-600 px-2.5 sm:px-3 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => onOpenAuth?.("signup")}
              className="inline-flex items-center justify-center rounded-lg text-xs sm:text-sm font-semibold transition-all bg-orange-600 text-white shadow-xs hover:bg-orange-700 h-9 sm:h-10 px-3 sm:px-4 py-2 cursor-pointer active:scale-95"
            >
              <span>Create Account</span>
            </button>
          </div>
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

        {/* Line 2: Authentic founder-focused trust signal */}
        <div className="flex flex-wrap xs:flex-nowrap items-center justify-center gap-2.5 pt-1">
          <span className="text-sm text-gray-600 flex items-center font-medium">
            <span className="inline-flex items-center justify-center w-5 h-5 mr-1.5 border border-gray-400 rounded-full text-gray-600">
              <Heart size={11} fill="currentColor" />
            </span>
            <span>Empowering early-stage founders & builders to launch faster</span>
          </span>
        </div>
      </div>
    </section>
  );
}