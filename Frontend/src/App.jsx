// App.jsx
// ---------------------------------------------------------------------------
// LaunchPilot AI — Autonomous AI Co-Founder Platform
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
  MarqueeLogos,
  StatsSection,
  FeaturesGrid,
  AudienceTabs,
  TestimonialsSection,
  PricingSection,
  FaqSection,
  FullFooter,
} from "./components/MarketingSections.jsx";
import { getHistory, saveToHistory, deleteFromHistory, syncHistoryFromCloud } from "./lib/projectHistory.js";
import { getCurrentUser, logout } from "./lib/authContext.js";
import { getWeeklyUsage, incrementWeeklyUsage } from "./lib/quotaManager.js";
import { useSpeechToText } from "./hooks/useSpeechToText.js";
import { useScrollReveal } from "./hooks/useScrollReveal.js";
import {
  History,
  ArrowRight,
  Sparkles,
  Check,
  Heart,
  User,
  LogOut,
  ChevronDown,
  Zap,
  Rocket,
  ShieldCheck,
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

  useScrollReveal(currentView);

  const [idea, setIdea] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [blueprint, setBlueprint] = useState(null);
  const [error, setError] = useState("");
  const [agentSteps, setAgentSteps] = useState(buildInitialSteps());

  // --- Auth & Session State ------------------------------------------------
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("signup");

  function handleOpenAuth(mode = "signup") {
    setAuthModalMode(mode);
    setShowAuthModal(true);
  }

  // --- Startup History & Saved Projects -----------------------------------
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [quota, setQuota] = useState(() => getWeeklyUsage(null));

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) {
        setCurrentUser(user);
        setHistory(getHistory(user.id));
        setQuota(getWeeklyUsage(user.id));
      } else {
        setHistory(getHistory(null));
        setQuota(getWeeklyUsage(null));
      }
    });
  }, []);

  useEffect(() => {
    setHistory(getHistory(currentUser?.id));
    setQuota(getWeeklyUsage(currentUser?.id));
  }, [currentUser]);

  useEffect(() => {
    // Compulsory authentication enforcement: direct workspace access requires account
    if (currentView === "workspace" && !currentUser) {
      handleOpenAuth("signup");
    }
  }, [currentView, currentUser]);

  function handleProtectedStart() {
    if (!currentUser) {
      handleOpenAuth("signup");
    } else {
      navigateTo("workspace");
    }
  }

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
      const path = window.location.pathname;
      const hash = window.location.hash;
      const view =
        e.state?.view || (path === "/app" || hash === "#app" ? "workspace" : "home");
      setCurrentView(view);
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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
    setQuota(getWeeklyUsage(null));
    navigateTo("home", true, true);
  }

  function handleAuthSuccess(user) {
    setCurrentUser(user);
    setShowAuthModal(false);
    setHistory(getHistory(user?.id));
    setQuota(getWeeklyUsage(user?.id));
    navigateTo("workspace", true, true);
  }

  async function handleGenerate() {
    if (!currentUser) {
      setError("Please sign in or create a free account to validate your idea (3 free ideas per week).");
      handleOpenAuth("signup");
      return;
    }

    if (!idea.trim()) {
      setError("Please describe your startup idea first.");
      return;
    }

    const currentQuota = getWeeklyUsage(currentUser?.id);
    if (currentQuota.remaining <= 0) {
      setError(`You have reached your limit of ${currentQuota.limit} free blueprints this week. Quota resets in 7 days, or upgrade to Pro (10 ideas/week for ₹149/mo) coming soon!`);
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
          const updatedQuota = incrementWeeklyUsage(currentUser?.id);
          setQuota(updatedQuota);
        },
        onError: (message) => setError(message),
      });
    } catch (err) {
      setError(
        err.message ||
          "Unable to generate your startup blueprint. The AI pipeline may be experiencing high demand. Please try again shortly."
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
          quota={quota}
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

  // --- VIEW 2: ORIGINAL LAUNCHPILOT HOMEPAGE (/) -----------------------------
  return (
    <div className="relative min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white antialiased">
      <SplineBackground />

      {/* 2. Sticky Glass Navbar */}
      <Navbar
        onOpenHistory={handleOpenHistory}
        historyCount={history.length}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onSignOut={handleSignOut}
        onStartClick={handleProtectedStart}
        onNavigateHome={() => navigateTo("home")}
      />

      {/* 3. Main Content Container */}
      <main className="relative z-10 flex-1 flex flex-col items-center w-full">
        {/* Hero Section */}
        <Hero
          onStartClick={handleProtectedStart}
        />

        {/* Feature & Value Sections */}
        <div className="w-full">
          <MarqueeLogos />
          <div id="how-it-works">
            <StatsSection />
          </div>
          <FeaturesGrid />
          <div id="samples">
            <AudienceTabs onSelectTab={handleProtectedStart} />
          </div>
          <TestimonialsSection />
          <PricingSection onSelectPlan={handleProtectedStart} />
          <FaqSection onCtaClick={handleProtectedStart} />
        </div>
      </main>

      {/* 4. Full Clean Footer */}
      <FullFooter />

      {/* 5. Floating Gemini AI Co-Founder Chat Drawer */}
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
  onStartClick,
  onNavigateHome,
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
      {/* Brand Logo */}
      <div className="flex items-center gap-5">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-black text-xs shadow-sm group-hover:scale-105 transition-transform animate-idea-pulse">
            IP
          </div>
          <span className="font-extrabold text-lg tracking-tight text-gray-900">
            Idea<span className="text-orange-600">Pulse</span>
          </span>
        </button>
      </div>

      {/* Nav Links */}
      <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-gray-700">
        <a href="#how-it-works" className="hover:text-orange-600 transition-colors">
          How It Works
        </a>
        <a href="#features" className="hover:text-orange-600 transition-colors">
          12 AI Co-Founders
        </a>
        <a href="#samples" className="hover:text-orange-600 transition-colors">
          Sample Output
        </a>
        <a href="#pricing" className="hover:text-orange-600 transition-colors">
          Pricing
        </a>
        <a href="#faq" className="hover:text-orange-600 transition-colors">
          FAQ
        </a>
      </nav>

      {/* Right Actions: Launch Studio / Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        <button
          onClick={onStartClick}
          className="hidden xs:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <Zap size={13} />
          <span>Launch Studio</span>
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
                    {currentUser.plan || "Community Free (3/wk)"}
                  </span>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onStartClick();
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-orange-50 hover:text-orange-700 flex items-center gap-2 cursor-pointer font-semibold"
                  >
                    <Zap size={13} className="text-orange-600" />
                    <span>Launch Studio</span>
                  </button>
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
              onClick={onStartClick}
              className="inline-flex items-center justify-center rounded-lg text-xs sm:text-sm font-bold transition-all bg-orange-600 text-white shadow-xs hover:bg-orange-700 h-9 sm:h-10 px-3.5 sm:px-4 py-2 cursor-pointer active:scale-95"
            >
              <span>Get Started Free</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

// --- IdeaPulse Hero Section --------------------------------------
function Hero({ onStartClick }) {
  return (
    <section className="relative z-10 text-center max-w-5xl pt-12 sm:pt-16 pb-8 px-4 w-full">
      {/* Pill Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-mono font-bold mb-6 animate-slide-up">
        <Sparkles size={13} className="text-orange-600" />
        <span>Know What the Market Thinks • v1 Beta</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-4xl xs:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6 leading-tight animate-slide-up">
        Know what the market thinks.
        <span className="block text-orange-600 mt-2">Validate before you build.</span>
      </h1>

      {/* Subtitle */}
      <p className="mb-8 font-normal text-base md:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed animate-slide-up">
        Enter your raw startup concept. 12 autonomous AI specialists simulate your co-founding team —
        benchmarking competitors, modeling financial viability, predicting market sentiment, and engineering your launch roadmap in 30 seconds.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col space-y-3 xs:flex-row xs:space-y-0 xs:space-x-4 justify-center items-center mb-8 animate-slide-up">
        <button
          onClick={onStartClick}
          className="inline-flex justify-center items-center py-3.5 px-8 text-sm font-bold text-center rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/25 transition-all cursor-pointer active:scale-95"
        >
          <Zap size={16} className="mr-2" />
          <span>Validate Your Idea (3 Free / Week)</span>
          <ArrowRight size={16} className="ml-2" />
        </button>

        <a
          href="#how-it-works"
          className="inline-flex justify-center items-center py-3.5 px-6 text-sm font-semibold text-center text-slate-700 rounded-xl border border-slate-300 hover:bg-slate-50 transition-all cursor-pointer active:scale-95 bg-white shadow-2xs"
        >
          Explore How It Works
        </a>
      </div>

      {/* Trust & Transparency */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-500 font-medium pt-2">
        <span className="flex items-center gap-1.5">
          <Check size={14} className="text-emerald-600" />
          <span>Zero credit card required</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Check size={14} className="text-emerald-600" />
          <span>100% Free Public Beta</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Check size={14} className="text-emerald-600" />
          <span>Full PDF & Markdown export</span>
        </span>
      </div>
    </section>
  );
}