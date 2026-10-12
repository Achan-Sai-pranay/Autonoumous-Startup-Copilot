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
import Navbar from "./components/Navbar.jsx";
import HistoryPanel from "./components/HistoryPanel.jsx";
import AuthModal from "./components/AuthModal.jsx";
import PaymentModal from "./components/PaymentModal.jsx";
import CoFounderChatDrawer from "./components/CoFounderChatDrawer.jsx";
import {
  AnnouncementBanner,
  HeroSection,
  LiveProductSimulator,
  MarqueeLogos,
  VcWarRoomSpotlight,
  PipelineWorkflowSection,
  BentoFeatureGrid,
  ComparisonSection,
  AudienceTabs,
  TestimonialsSection,
  PricingSection,
  FaqSection,
  FinalCtaBanner,
  FullFooter,
} from "./components/MarketingSections.jsx";
import ScreenshotSlideshow from "./components/ScreenshotSlideshow.jsx";
import {
  getHistory,
  saveToHistory,
  deleteFromHistory,
  syncHistoryFromCloud,
  migrateGuestHistoryToUser,
  subscribeSyncStatus,
} from "./lib/projectHistory.js";
import { getCurrentUser, logout, getStoredUser } from "./lib/authContext.js";
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
  AlertCircle,
  Menu,
  X,
} from "lucide-react";

const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const rawApiUrl = isLocalhost
  ? (import.meta.env.VITE_LOCAL_API_URL || "http://localhost:5001/api/generate-blueprint")
  : (import.meta.env.VITE_API_URL || "https://ideapulse-y1n5.onrender.com/api/generate-blueprint");

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
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("signup");
  const [authBanner, setAuthBanner] = useState(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  function handleOpenPayment() {
    setShowPaymentModal(true);
  }

  function handlePaymentSuccess(subscription) {
    const currentHist = history.length > 0 ? history : getHistory(currentUser?.id);
    const updated = getWeeklyUsage(currentUser?.id, currentHist);
    setQuota(updated);
    if (currentUser) {
      setCurrentUser((prev) => (prev ? { ...prev, plan: subscription?.planName || "Pro Founder", isPro: true } : prev));
    }
    setShowPaymentModal(false);
  }

  function handleOpenAuth(mode = "signup") {
    setAuthModalMode(mode);
    setShowAuthModal(true);
  }

  // --- Startup History & Saved Projects -----------------------------------
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [quota, setQuota] = useState(() => getWeeklyUsage(null));
  const [syncStatus, setSyncStatus] = useState("idle");

  useEffect(() => {
    const unsub = subscribeSyncStatus(setSyncStatus);
    return () => unsub();
  }, []);

  useEffect(() => {
    // Check for social login redirect feedback in URL query
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.has("auth_error")) {
        setAuthBanner({
          type: "error",
          message: "Google Sign-In was cancelled or failed. If configuring, please verify Google OAuth provider credentials in Appwrite Console.",
        });
        window.history.replaceState({}, "", window.location.pathname);
      }
    }

    getCurrentUser().then((user) => {
      if (user) {
        setCurrentUser(user);
        migrateGuestHistoryToUser(user.id);
        const localHist = getHistory(user.id);
        setHistory(localHist);
        setQuota(getWeeklyUsage(user.id, localHist));
        syncHistoryFromCloud(user.id).then((cloud) => {
          if (cloud && cloud.length > 0) {
            setHistory(cloud);
            setQuota(getWeeklyUsage(user.id, cloud));
          }
        });
      } else {
        const guestHist = getHistory(null);
        setHistory(guestHist);
        setQuota(getWeeklyUsage(null, guestHist));
      }
    });
  }, []);

  useEffect(() => {
    const currentHist = history.length > 0 ? history : getHistory(currentUser?.id);
    setQuota(getWeeklyUsage(currentUser?.id, currentHist));

    function onQuotaUpdated(e) {
      const activeHist = history.length > 0 ? history : getHistory(currentUser?.id);
      setQuota(getWeeklyUsage(currentUser?.id, activeHist));
      if (currentUser) {
        setCurrentUser((prev) => (prev ? { ...prev, plan: e?.detail?.planName || "Pro Founder", isPro: true } : prev));
      }
    }
    window.addEventListener("quota-updated", onQuotaUpdated);
    return () => window.removeEventListener("quota-updated", onQuotaUpdated);
  }, [currentUser, history.length]);

  function handleProtectedStart() {
    if (!currentUser) {
      handleOpenAuth("signup");
      return;
    }
    navigateTo("workspace");
  }

  function handleStartWithIdea(customIdea) {
    if (customIdea && typeof customIdea === "string") {
      setIdea(customIdea);
    }
    if (!currentUser) {
      handleOpenAuth("signup");
      return;
    }
    navigateTo("workspace");
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
    setHistory([]);
    setQuota(getWeeklyUsage(null));
    navigateTo("home", true, true);
  }

  function handleAuthSuccess(user) {
    setCurrentUser(user);
    setShowAuthModal(false);
    if (user?.id) {
      migrateGuestHistoryToUser(user.id);
      const localHist = getHistory(user.id);
      setHistory(localHist);
      setQuota(getWeeklyUsage(user.id, localHist));
      syncHistoryFromCloud(user.id).then((cloud) => {
        if (cloud && cloud.length > 0) {
          setHistory(cloud);
          setQuota(getWeeklyUsage(user.id, cloud));
        }
      });
    } else {
      setHistory([]);
      setQuota(getWeeklyUsage(null));
    }
    navigateTo("workspace", true, true);
  }

  async function handleGenerate() {
    if (!idea.trim()) {
      setError("Please describe your startup idea first.");
      return;
    }

    if (!currentUser) {
      setError("Please sign in or create a free account to generate your startup blueprint (3 free ideas per week).");
      handleOpenAuth("signup");
      return;
    }

    const currentQuota = getWeeklyUsage(currentUser.id, history);
    if (!currentQuota.isPro && currentQuota.remaining <= 0) {
      setError("You have reached your free weekly limit of 3 blueprints. Enter voucher FOUNDER_PASS in Pro upgrade for unlimited testing.");
      setShowPaymentModal(true);
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
        signal: AbortSignal.timeout(180000),
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
          const updatedHistory = saveToHistory(idea.trim(), data, currentUser?.id);
          setHistory(updatedHistory);
          const updatedQuota = incrementWeeklyUsage(currentUser?.id, updatedHistory);
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
      <div className="relative h-screen min-h-[100dvh] max-h-[100dvh] w-full bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white antialiased overflow-hidden">
        {authBanner && (
          <div className="relative z-50 w-full bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-900 animate-fade-in shrink-0">
            <div className="flex items-center gap-2 max-w-4xl mx-auto">
              <AlertCircle size={15} className="text-amber-600 shrink-0" />
              <span>{authBanner.message}</span>
            </div>
            <button
              onClick={() => setAuthBanner(null)}
              className="text-amber-700 hover:text-amber-900 p-1 rounded-md cursor-pointer font-bold"
            >
              ✕
            </button>
          </div>
        )}
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
          onOpenPayment={handleOpenPayment}
        />

        {/* Fallback to latest saved project in history if active workspace has not loaded a fresh blueprint */}
        <CoFounderChatDrawer
          blueprint={blueprint || (history.length > 0 ? history[0]?.blueprint : null)}
          originalIdea={idea || (history.length > 0 ? (history[0]?.idea || history[0]?.title) : "")}
        />

        <AuthModal
          isOpen={showAuthModal}
          initialMode={authModalMode}
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleAuthSuccess}
        />

        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          currentUser={currentUser}
          onPaymentSuccess={handlePaymentSuccess}
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
    <div className="relative min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white antialiased w-full max-w-full overflow-x-clip">
      {/* Global Scroll Progress Bar */}
      <div
        id="global-scroll-progress"
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 z-50 transition-all duration-75 pointer-events-none"
        style={{ width: "0%" }}
      />

      {/* 1. Announcement Banner */}
      <AnnouncementBanner onCtaClick={handleProtectedStart} />

      {/* 2. Sticky Glass Navbar */}
      <Navbar
        onOpenHistory={handleOpenHistory}
        historyCount={history.length}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onSignOut={handleSignOut}
        onStartClick={handleProtectedStart}
        onNavigateHome={() => navigateTo("home")}
        onOpenPayment={handleOpenPayment}
      />

      {authBanner && (
        <div className="relative z-50 w-full bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between text-xs text-amber-900 animate-fade-in">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <AlertCircle size={15} className="text-amber-600 shrink-0" />
            <span>{authBanner.message}</span>
          </div>
          <button
            onClick={() => setAuthBanner(null)}
            className="text-amber-700 hover:text-amber-900 p-1 rounded-md"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. Main Content Container */}
      <main className="relative z-10 flex-1 flex flex-col w-full max-w-full overflow-x-clip">
        {/* Hero Section with Interactive Prompt Station */}
        <HeroSection
          onStartWithIdea={handleStartWithIdea}
          initialIdea={idea}
        />

        {/* Real Product Screenshot Slideshow */}
        <ScreenshotSlideshow onCtaClick={handleProtectedStart} />

        {/* Live Product Simulator (Interactive Mac Window with 5 Tabs) */}
        <LiveProductSimulator onCtaClick={handleProtectedStart} />

        {/* Ecosystem Trust Marquee */}
        <MarqueeLogos />

        {/* Dedicated 3-AI VC War Room Spotlight */}
        <VcWarRoomSpotlight onCtaClick={handleProtectedStart} />

        {/* 6-Stage Continuous Validation Journey */}
        <PipelineWorkflowSection />

        {/* Bento Grid: 12 Specialists & Proprietary Tool Suite */}
        <BentoFeatureGrid />

        {/* Head-to-Head Comparison Matrix */}
        <ComparisonSection onCtaClick={handleProtectedStart} />

        {/* Real Sample Blueprints */}
        <div id="samples" className="w-full">
          <AudienceTabs onSelectTab={handleStartWithIdea} />
        </div>

        {/* Founder Testimonials */}
        <TestimonialsSection />

        {/* Transparent Pricing */}
        <PricingSection
          onSelectPlan={(plan) => {
            if (plan === "pro" || (typeof plan === "string" && plan.toLowerCase().includes("pro"))) {
              handleOpenPayment();
            } else {
              handleProtectedStart();
            }
          }}
        />

        {/* Frequently Asked Questions */}
        <FaqSection onCtaClick={handleProtectedStart} />

        {/* High-Impact Final CTA Banner */}
        <FinalCtaBanner onCtaClick={handleProtectedStart} />
      </main>

      {/* 4. Full Clean Footer */}
      <FullFooter />

      {/* 5. Floating Gemini AI Co-Founder Chat Drawer */}
      <CoFounderChatDrawer
        blueprint={blueprint || (history.length > 0 ? history[0]?.blueprint : null)}
        originalIdea={idea || (history.length > 0 ? (history[0]?.idea || history[0]?.title) : "")}
      />

      {/* Modals & Overlays */}
      <AuthModal
        isOpen={showAuthModal}
        initialMode={authModalMode}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleAuthSuccess}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        currentUser={currentUser}
        onPaymentSuccess={handlePaymentSuccess}
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
      try {
        const event = JSON.parse(line);

        if (event.type === "progress") onProgress(event);
        else if (event.type === "result") onResult(event.data);
        else if (event.type === "error") onError(event.message);
      } catch (e) {
        console.warn("[NDJSON] Skipping invalid stream chunk:", line.slice(0, 80));
      }
    }
  }
}

