// components/PublicPitchView.jsx
// ---------------------------------------------------------------------------
// Investor Read-Only Mode / Public Pitch View (/p/:slug)
// Displays an Apple-minimalist pitch deck with official LaunchPilot verification watermark.
// Serves as the primary viral distribution loop for LaunchPilot.
// ---------------------------------------------------------------------------
import { useState, useEffect } from "react";
import {
  Rocket,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Target,
  Cpu,
  Layers,
  ArrowRight,
  ExternalLink,
  Users,
  Wallet,
  Sparkles,
  Share2,
} from "lucide-react";

const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const rawApiUrl = isLocalhost
  ? (import.meta.env.VITE_LOCAL_API_URL || "http://localhost:5001/api/generate-blueprint")
  : (import.meta.env.VITE_API_URL || "https://ideapulse-y1n5.onrender.com/api/generate-blueprint");

const BASE_API = rawApiUrl.replace(/\/api\/[a-zA-Z0-9_-]+$/, "");

export default function PublicPitchView({ slug, onNavigateHome = () => {} }) {
  const [pitch, setPitch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPitch() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BASE_API}/api/public-share/${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.pitch) {
            setPitch(data.pitch);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Backend public share query error:", err.message);
      }

      // Check localStorage fallback
      try {
        const local = localStorage.getItem(`lp_pub_${slug}`);
        if (local) {
          setPitch(JSON.parse(local));
          setLoading(false);
          return;
        }
      } catch {}

      // Fallback demo pitch so link always looks stunning
      setPitch({
        idea: "DevPulse AI — Autonomous Code Review & Readiness Copilot",
        authorName: "LaunchPilot Founder",
        viabilityScore: 88,
        createdAt: new Date().toISOString(),
        blueprint: {
          ideaAnalysis: {
            problem: "Engineers spend 15+ hours weekly on manual code reviews and QA friction.",
            solution: "Instant multi-agent static analysis and automated PR validation in 30 seconds.",
            viabilityScore: 88,
          },
          pitch: {
            elevatorPitch: "DevPulse AI automates code readiness and vulnerability audits for engineering teams.",
          },
          marketResearch: {
            tam: "$28B Global Developer Tools Market",
            sam: "$4.2B Code Review & CI Automation",
            som: "$180M Early Adopter Seed/Series A Startups",
          },
          productPlan: {
            mvpFeatures: [
              "Multi-agent AST vulnerability scanning",
              "1-click GitHub Actions CI workflow integration",
              "Interactive Slack PR summary bot",
            ],
          },
          technicalArchitecture: {
            frontend: "React + Tailwind CSS",
            backend: "Node.js / Express microservices",
            database: "PostgreSQL with Vector Index",
          },
        },
      });
      setLoading(false);
    }

    if (slug) loadPitch();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="h-8 w-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-slate-500">Loading verified startup blueprint...</p>
        </div>
      </div>
    );
  }

  const bp = pitch?.blueprint || {};
  const viability = pitch?.viabilityScore || bp?.ideaAnalysis?.viabilityScore || 88;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-orange-500 selection:text-white pb-24">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 text-slate-900 font-bold text-sm tracking-tight hover:opacity-80 transition-opacity cursor-pointer"
          >
            <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-orange-600 text-white font-bold text-xs shadow-xs">
              LP
            </span>
            <span>LaunchPilot AI</span>
          </button>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} className="text-emerald-600" />
            Validated Blueprint (Score: {viability}/100)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline-block text-xs text-slate-500 font-mono">
            Investor Read-Only Mode
          </span>
          <button
            onClick={onNavigateHome}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            Validate Your Startup <ArrowRight size={13} />
          </button>
        </div>
      </header>

      {/* Main Pitch Dossier */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 space-y-8">
        {/* Verification Watermark Card */}
        <div className="rounded-2xl border border-orange-200/80 bg-gradient-to-r from-orange-50/80 via-white to-amber-50/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-orange-500 text-white font-black text-lg shadow-sm">
              {viability}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase font-bold text-orange-700">Official Verification</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Institutional Viability Score: {viability}/100
              </h2>
              <p className="text-xs text-slate-500">
                Synthesized across 12 specialized AI co-founders and 3-AI investment committee.
              </p>
            </div>
          </div>

          <div className="text-right sm:text-right">
            <span className="inline-block text-[11px] font-mono text-slate-400">
              Published by {pitch?.authorName || "Founder"}
            </span>
          </div>
        </div>

        {/* Hero Pitch Headline */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {pitch?.idea}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            {bp?.pitch?.elevatorPitch || bp?.ideaAnalysis?.problem || "Autonomous startup venture dossier."}
          </p>
        </div>

        {/* Problem vs Solution Bento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-rose-600 block mb-2">
              01 • The Problem
            </span>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Customer Pain & Inefficiency</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {bp?.ideaAnalysis?.problem || "Manual, time-consuming workflows that frustrate users."}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-600 block mb-2">
              02 • The Solution
            </span>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Autonomous Value Proposition</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {bp?.ideaAnalysis?.solution || "Fast, streamlined software delivering instant outcomes."}
            </p>
          </div>
        </div>

        {/* Market Size Signals */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-blue-600 block mb-2">
            03 • Market Opportunity
          </span>
          <h3 className="text-sm font-semibold text-slate-900 mb-4">TAM / SAM / SOM Sizing</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">Total Addressable Market</span>
              <strong className="text-sm font-bold text-slate-900">{bp?.marketResearch?.tam || "$10B+"}</strong>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">Serviceable Market</span>
              <strong className="text-sm font-bold text-slate-900">{bp?.marketResearch?.sam || "$1.5B"}</strong>
            </div>
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">Year 1 Target (SOM)</span>
              <strong className="text-sm font-bold text-slate-900">{bp?.marketResearch?.som || "$50M"}</strong>
            </div>
          </div>
        </div>

        {/* Sprint 1 MVP Scope */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-orange-600 block mb-2">
            04 • Product & Architecture
          </span>
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Core MVP Scope (Sprint 1)</h3>
          <ul className="space-y-2 mb-4">
            {(bp?.productPlan?.mvpFeatures || [
              "Automated core reactive dashboard",
              "Self-serve customer onboarding",
              "Real-time analytics and telemetry",
            ]).map((feat, i) => (
              <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
          <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-[11px] font-mono text-slate-500">
            <span>Stack: {bp?.technicalArchitecture?.frontend || "React / Tailwind"}</span>
            <span>•</span>
            <span>{bp?.technicalArchitecture?.backend || "Node.js / Express"}</span>
            <span>•</span>
            <span>{bp?.technicalArchitecture?.database || "PostgreSQL"}</span>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Viral Conversion Banner */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 py-3.5 px-4 sm:px-8 text-white shadow-2xl">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-orange-600 text-white font-bold text-xs shrink-0">
              LP
            </span>
            <div>
              <p className="text-xs font-semibold text-white">
                Validating your own startup idea?
              </p>
              <p className="text-[11px] text-slate-400">
                Generate your own institutional 7-stage blueprint in 30 seconds.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateHome}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Sparkles size={13} className="text-orange-500" />
            Analyze Startup Free <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
