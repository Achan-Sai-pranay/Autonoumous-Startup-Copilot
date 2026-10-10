// components/MarketingSections.jsx
// ---------------------------------------------------------------------------
// IdeaPulse AI — "Know what the market thinks."
// World-Class Autonomous Startup Co-Founder & 3-AI VC Debate Platform
//
// Flagship Sections:
// 1. AnnouncementBanner: Live v1 Beta + 3-AI VC War Room launch alert
// 2. HeroSection: Ultra-premium headline, interactive prompt station & quick tags
// 3. LiveProductSimulator: High-fidelity interactive Mac-style window with 5 tabs:
//      - Tab 1: 3-AI VC War Room (Groq Llama 3.3 Bull, OpenRouter DeepSeek Bear, Gemini Judge)
//      - Tab 2: Bottom-Up TAM / SAM / SOM Market Sizing
//      - Tab 3: The Mom Test Customer Discovery Guide
//      - Tab 4: Unit Economics & Break-Even Simulator
//      - Tab 5: Executive 16-Part PDF & PRD Dossier Export
// 4. MarqueeLogos: Ecosystem trust marquee (YC, Indie Hackers, Product Hunt, etc.)
// 5. VcWarRoomSpotlight: Multi-agent debate deep-dive with interactive debate clips
// 6. PipelineWorkflowSection: 6-Stage continuous scroll validation journey
// 7. BentoFeatureGrid: 12 Co-Founders, Sticky Spy Rail, Swipe File, Cloud Vault
// 8. ComparisonSection: Head-to-head comparison (Old Way vs Generic AI vs IdeaPulse)
// 9. AudienceTabs: Real market pulse samples (B2B, Consumer, Dev Infra, HealthTech)
// 10. TestimonialsSection: Authentic founder feedback
// 11. PricingSection: Free Starter (3 ideas/wk) vs Pro Founder (₹149/mo)
// 12. FaqSection: Comprehensive founder FAQ accordion
// 13. FinalCtaBanner: High-conversion closing banner with quick prompt trigger
// 14. FullFooter: Institutional footer
// ---------------------------------------------------------------------------

import { useState } from "react";
import {
  FileText,
  Users,
  TrendingUp,
  Lightbulb,
  ArrowRight,
  ChevronDown,
  Check,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Cpu,
  Zap,
  Target,
  Rocket,
  DollarSign,
  HelpCircle,
  Clock,
  Layers,
  Search,
  BookOpen,
  Activity,
  Swords,
  Scale,
  Gavel,
  Flame,
  Sliders,
  Copy,
  ExternalLink,
  MessageSquare,
  FolderKanban,
  FileDown,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Award,
  BarChart3,
  Mic,
  Share2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// 1. Announcement Banner
// ---------------------------------------------------------------------------
export function AnnouncementBanner({ onCtaClick }) {
  return (
    <div
      id="banner"
      className="w-full bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border-b border-orange-200/80 py-2 px-4 text-xs font-medium text-slate-800 z-30"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-600 text-white uppercase tracking-wider shadow-2xs">
          <Sparkles size={10} />
          NEW: 3-AI VC WAR ROOM
        </span>
        <span className="text-slate-800 font-semibold">
          Stress-test your startup thesis against Groq Llama 3.3, DeepSeek V3 & Gemini 2.5 Flash.
        </span>
        <button
          onClick={onCtaClick}
          className="inline-flex items-center gap-1 font-bold text-orange-600 hover:text-orange-700 underline ml-1 cursor-pointer transition-colors"
        >
          Try 3 Free Ideas / Week <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Ecosystem Trust Bar
// ---------------------------------------------------------------------------
export function MarqueeLogos() {
  const ecosystems = [
    { label: "Y Combinator Applicants", icon: "🍊" },
    { label: "Indie Hackers", icon: "⚡" },
    { label: "Product Hunt Makers", icon: "🚀" },
    { label: "Solo SaaS Engineers", icon: "💻" },
    { label: "AI Hackathon Winners", icon: "🤖" },
    { label: "University Founders", icon: "🎓" },
    { label: "Angel-Backed Ventures", icon: "💼" },
  ];

  return (
    <section className="py-7 bg-slate-50/70 border-y border-slate-200/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-3.5">
          TRUSTED & USED BY AMBITIOUS FOUNDERS PREPARING TO LAUNCH
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
          {ecosystems.map((eco, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 text-xs font-semibold text-slate-700 shadow-2xs hover:border-orange-300 hover:shadow-xs transition-all"
            >
              <span>{eco.icon}</span>
              <span>{eco.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 3. Hero Section with Interactive Prompt Station & Quick Chips
// ---------------------------------------------------------------------------
export function HeroSection({
  onStartWithIdea,
  initialIdea = "",
}) {
  const [heroPrompt, setHeroPrompt] = useState(initialIdea);
  const [isCopied, setIsCopied] = useState(false);

  const sampleChips = [
    {
      label: "B2B AI Contract Auditor",
      prompt: "An AI-powered B2B platform that audits enterprise vendor contracts, flags compliance risks, and benchmarks pricing automatically against industry norms.",
    },
    {
      label: "Fitness Accountability Stakes",
      prompt: "A social micro-community mobile app that pairs solo gym lifters with accountability buddies with forfeit deposit stakes for missed workouts.",
    },
    {
      label: "Sub-ms LLM Vector Cache",
      prompt: "A high-performance in-memory semantic cache for LLMs that cuts OpenAI and Anthropic token bills by 70% with sub-millisecond p99 latency.",
    },
    {
      label: "Autonomous Dental Intake",
      prompt: "An autonomous voice and chat receptionist for dental clinics that conducts insurance pre-checks, books appointments, and triages emergencies.",
    },
  ];

  function handleSubmit(e) {
    e?.preventDefault?.();
    const finalPrompt = heroPrompt.trim() || sampleChips[0].prompt;
    onStartWithIdea(finalPrompt);
  }

  function handleSelectChip(promptText) {
    setHeroPrompt(promptText);
  }

  return (
    <section className="relative z-10 text-center max-w-5xl pt-10 sm:pt-14 pb-8 px-4 w-full mx-auto">
      {/* Top Floating Pill */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-mono font-bold mb-6 animate-slide-up shadow-2xs">
        <Sparkles size={13} className="text-orange-600 animate-pulse" />
        <span>Autonomous Startup Copilot • 3-AI VC Committee • 2026 Engine</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-4xl xs:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6 leading-tight animate-slide-up">
        Know what the market thinks.
        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 mt-1">
          Validate before you build.
        </span>
      </h1>

      {/* Subtitle */}
      <p className="mb-8 font-normal text-base md:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed animate-slide-up">
        Stop spending 3 months building for an imaginary market. 12 autonomous AI specialists and a brutal
        <strong className="text-slate-900 font-semibold"> 3-AI Venture Capitalist debate committee </strong>
        simulate your market demand, unit economics, competitor vulnerabilities, and launch roadmap in 30 seconds.
      </p>

      {/* Interactive Hero Prompt Station */}
      <div className="w-full max-w-3xl mx-auto mb-6 bg-white rounded-2xl p-2.5 sm:p-3 shadow-xl border border-orange-200/90 relative animate-slide-up">
        <div className="relative">
          <textarea
            value={heroPrompt}
            onChange={(e) => setHeroPrompt(e.target.value)}
            placeholder="Describe your startup concept (e.g. 'An AI-powered B2B platform that audits enterprise vendor contracts and benchmarks pricing...')"
            rows={2}
            className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 p-3 pr-24 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 px-1">
            {/* Quick 1-Click Idea Chips */}
            <div className="flex items-center gap-1.5 flex-wrap justify-start text-[11px] text-slate-500">
              <span className="font-mono text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Lightbulb size={12} className="text-amber-500" />
                Quick Prompts:
              </span>
              {sampleChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectChip(chip.prompt)}
                  className="px-2 py-1 rounded-md bg-slate-100 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 border border-slate-200/80 text-[11px] font-medium text-slate-600 transition-all cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Launch CTA Button */}
            <button
              onClick={handleSubmit}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-600/25 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <Zap size={15} />
              <span>Run Market Pulse (3 Free/Wk)</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Trust & Transparency Strip */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-500 font-medium pt-1">
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
        <span className="flex items-center gap-1.5">
          <Sparkles size={14} className="text-orange-500" />
          <span>Llama 3.3 + DeepSeek + Gemini 2.5</span>
        </span>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 4. Live Product Simulator (Interactive Mac-Style Dashboard Mockup)
// ---------------------------------------------------------------------------
export function LiveProductSimulator({ onCtaClick }) {
  const [activeTab, setActiveTab] = useState("debate");
  const [founderRebuttalOpen, setFounderRebuttalOpen] = useState(false);
  const [customerCount, setCustomerCount] = useState(500);

  // Financial calculations
  const pricePerCustomer = 89; // $/mo
  const monthlyRevenue = customerCount * pricePerCustomer;
  const aiCostPerCustomer = 11; // $/mo token & compute
  const fixedInfra = 800; // $/mo
  const totalCost = customerCount * aiCostPerCustomer + fixedInfra;
  const grossProfit = monthlyRevenue - totalCost;
  const marginPct = Math.round((grossProfit / monthlyRevenue) * 100);

  return (
    <section id="demo" className="py-14 sm:py-20 bg-white border-b border-slate-200 reveal-on-scroll">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full shadow-2xs">
            Interactive Product Preview
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Inspect the institutional blueprint output
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-2">
            Click through the interactive tabs below to experience how IdeaPulse transforms a raw idea into
            a battle-tested venture thesis with opposing VC arguments, financial simulations, and Mom Test discovery.
          </p>
        </div>

        {/* Mac Window Wrapper */}
        <div className="bg-slate-900 rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden text-slate-100">
          {/* Top Window Bar */}
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 font-mono text-[11px] text-slate-400 font-semibold hidden sm:inline">
                IdeaPulse Studio • Venture: AI Contract & Vendor Auditor
              </span>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
              {[
                { id: "debate", label: "3-AI VC War Room", icon: Swords, badge: "New" },
                { id: "tam", label: "TAM / SAM / SOM", icon: Target },
                { id: "momtest", label: "The Mom Test", icon: Users },
                { id: "financials", label: "Unit Economics", icon: DollarSign },
                { id: "export", label: "PRD & PDF Dossier", icon: FileText },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                      isActive
                        ? "bg-orange-600 text-white shadow-xs"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    <Icon size={13} />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-bold uppercase">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content Display Area */}
          <div className="p-5 sm:p-8 min-h-[440px] flex flex-col justify-between">
            {/* --- TAB 1: 3-AI VC WAR ROOM --- */}
            {activeTab === "debate" && (
              <div className="space-y-6 animate-fade-in">
                {/* Header Verdict Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-850 via-slate-800 to-slate-850 border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shrink-0">
                      <Scale size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">Chief Judge Consensus Verdict:</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          PROCEED WITH CAUTION
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        High enterprise buyer urgency. The Bull demonstrates clear ROI ($20k+ annual savings per audit).
                        However, the Bear flags serious procurement sales-cycle inertia (3-6 month sales cycles).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono text-slate-400">Net Conviction:</span>
                    <span className="text-xl font-mono font-black text-orange-400">86 / 100</span>
                  </div>
                </div>

                {/* Side-by-Side Opposing Models */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Bull Card */}
                  <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 relative">
                    <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                          🐂
                        </div>
                        <div>
                          <p className="text-xs font-bold text-emerald-300">The Bull Partner</p>
                          <p className="text-[10px] font-mono text-emerald-400/80">Groq • Llama 3.3 70B</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Conviction: 91%
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white mb-1.5">Thesis: Painful Unmonitored Auto-Renewals</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      "Mid-market CFOs bleed $40k–$150k annually on stealth contract renewals and unbenchmarked SaaS seat tiers.
                      A tool that automatically parses PDFs, extracts contract dates, and flags 25% pricing disparities provides
                      immediate 10x ROI on week 1."
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-emerald-500/20 text-[11px] text-emerald-200">
                      <strong>Unfair Wedge:</strong> 1-Click Google Drive / Slack connector with instant executive audit report.
                    </div>
                  </div>

                  {/* Bear Card */}
                  <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-500/40 relative">
                    <div className="flex items-center justify-between pb-3 border-b border-rose-500/20 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold text-xs">
                          🐻
                        </div>
                        <div>
                          <p className="text-xs font-bold text-rose-300">The Bear Partner</p>
                          <p className="text-[10px] font-mono text-rose-400/80">OpenRouter • DeepSeek V3</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        Skepticism: 84%
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white mb-1.5">Fatal Risk: Enterprise Security & Procurement Gates</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      "Legal teams will NOT upload confidential vendor contracts into a raw startup's cloud without SOC2 Type II,
                      ISO 27001, and customized Data Processing Agreements. Your CAC will explode unless you solve self-hosted or zero-data-retention compliance."
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-rose-500/20 text-[11px] text-rose-200">
                      <strong>Fatal Trap:</strong> 6-month enterprise sales cycles kill early founder cash runway.
                    </div>
                  </div>
                </div>

                {/* Interactive Founder Rebuttal Simulator */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame size={15} className="text-orange-500" />
                      <span className="font-bold text-slate-200">Interactive Defense Simulation:</span>
                      <span className="text-slate-400 hidden sm:inline">"What if we target sub-50 employee startups first?"</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFounderRebuttalOpen(!founderRebuttalOpen)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-orange-400 font-mono text-[11px] cursor-pointer"
                    >
                      {founderRebuttalOpen ? "Hide Response" : "Simulate Rebuttal"}
                    </button>
                  </div>

                  {founderRebuttalOpen && (
                    <div className="mt-3 pt-3 border-t border-slate-800 text-slate-300 space-y-2 animate-fade-in">
                      <p className="text-slate-400 italic">
                        Founder Counter: "We bypass SOC2 friction by starting with Series A tech startups (20-80 staff) where the Head of Ops or Founder makes instant software purchasing decisions."
                      </p>
                      <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-200 text-xs">
                        <strong>Judge Ruling (Gemini 2.5):</strong> "Viable pivot. Reduces sales cycles from 120 days down to 7 days. Recommendation accepted: Target Series A Ops leads with pre-built Google Workspace integrations."
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* --- TAB 2: TAM / SAM / SOM --- */}
            {activeTab === "tam" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white">Bottom-Up Market Sizing Model</h3>
                    <p className="text-xs text-slate-400">Institutional analytical breakdown calculated from empirical B2B SaaS benchmarks.</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Validated Model
                  </span>
                </div>

                <div className="space-y-4">
                  {/* TAM */}
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-mono uppercase text-slate-400 font-bold">Total Addressable Market (TAM)</span>
                      <span className="text-lg font-mono font-bold text-white">$14.2 Billion</span>
                    </div>
                    <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full w-full" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Global contract lifecycle management & enterprise procurement automation across all verticals worldwide.
                    </p>
                  </div>

                  {/* SAM */}
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-mono uppercase text-slate-400 font-bold">Serviceable Available Market (SAM)</span>
                      <span className="text-lg font-mono font-bold text-emerald-400">$2.8 Billion</span>
                    </div>
                    <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full w-[45%]" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Mid-market tech and professional service firms (50–500 employees) in the US, UK, and EU with high recurring SaaS vendor count.
                    </p>
                  </div>

                  {/* SOM */}
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-mono uppercase text-slate-400 font-bold">Serviceable Obtainable Market (SOM - Year 1-3)</span>
                      <span className="text-lg font-mono font-bold text-orange-400">$340 Million</span>
                    </div>
                    <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-orange-500 h-full rounded-full w-[12%]" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Targeting 3,500 tech companies at $8,000 average annual contract value (ACV) within 36 months of launch.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB 3: THE MOM TEST --- */}
            {activeTab === "momtest" && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white">The Mom Test Customer Discovery Protocol</h3>
                    <p className="text-xs text-slate-400">Rob Fitzpatrick's validation framework: Never ask if they like your idea. Ask how they currently spend money.</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Unbiased Interview Guide
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30">
                    <div className="flex items-center gap-2 text-rose-300 font-bold mb-2">
                      <XCircle size={15} />
                      <span>Bad Leading Questions (They Lie To Be Polite)</span>
                    </div>
                    <ul className="space-y-2 text-slate-300">
                      <li>• "Would you pay $99/mo for an AI tool that audits your contracts?"</li>
                      <li>• "Do you think contract auto-renewals are a big problem in business?"</li>
                      <li>• "If we built this dashboard, would you sign up for our beta?"</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold mb-2">
                      <CheckCircle2 size={15} />
                      <span>The Mom Test Unbiased Questions (Reveals Truth)</span>
                    </div>
                    <ul className="space-y-2 text-slate-200">
                      <li>• "When was the last time you paid for an unexpected vendor auto-renewal?"</li>
                      <li>• "Walk me through how you currently track vendor agreements across your team."</li>
                      <li>• "What software tool did you buy this quarter, and who signed the budget?"</li>
                    </ul>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-200 text-xs">
                  <strong>Discovery Action Step:</strong> Conduct 5 conversations using the Mom Test questions above. If 3+ interviewees cannot recall spending money to solve this in the past 60 days, pivot messaging.
                </div>
              </div>
            )}

            {/* --- TAB 4: UNIT ECONOMICS & BREAK-EVEN --- */}
            {activeTab === "financials" && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white">Interactive Unit Economics & Break-Even Simulator</h3>
                    <p className="text-xs text-slate-400">Live dynamic modeling of MRR, AI token costs, server footprint, and gross margins.</p>
                  </div>

                  {/* Customer Target Buttons */}
                  <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
                    {[100, 500, 2500].map((count) => (
                      <button
                        key={count}
                        onClick={() => setCustomerCount(count)}
                        className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                          customerCount === count
                            ? "bg-orange-600 text-white"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {count.toLocaleString()} Customers
                      </button>
                    ))}
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Monthly Recurring (MRR)</span>
                    <span className="text-xl sm:text-2xl font-mono font-black text-emerald-400 mt-1 block">
                      ${monthlyRevenue.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">at ${pricePerCustomer}/mo plan</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Annual Run-Rate (ARR)</span>
                    <span className="text-xl sm:text-2xl font-mono font-black text-white mt-1 block">
                      ${(monthlyRevenue * 12).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">projected year 1</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Cloud & AI Token Cost</span>
                    <span className="text-xl sm:text-2xl font-mono font-black text-rose-400 mt-1 block">
                      ${totalCost.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">${aiCostPerCustomer}/user + infra</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Gross Margin</span>
                    <span className="text-xl sm:text-2xl font-mono font-black text-orange-400 mt-1 block">
                      {marginPct}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">high SaaS efficiency</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/80 text-xs text-slate-300 flex items-center justify-between">
                  <span>
                    <strong>Break-Even Milestone:</strong> Achieved at <strong className="text-white">14 active paying accounts</strong>. Estimated time to break-even: <strong className="text-emerald-400">Month 3</strong>.
                  </span>
                  <span className="font-mono text-emerald-400 text-xs font-bold">14 / 500 ACCOUNTS</span>
                </div>
              </div>
            )}

            {/* --- TAB 5: PRD & PDF DOSSIER --- */}
            {activeTab === "export" && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white">Executive 16-Part Institutional Dossier</h3>
                    <p className="text-xs text-slate-400">Complete venture package exportable with 1-click as formatted PDF or Markdown.</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">
                    Ready to Present
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                    <FileText size={16} className="text-orange-400 mb-2" />
                    <h4 className="font-bold text-white mb-1">Executive PRD</h4>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Problem statement, target personas, MVP feature scope, non-goals, and 4-week execution roadmap.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                    <Rocket size={16} className="text-purple-400 mb-2" />
                    <h4 className="font-bold text-white mb-1">10-Slide Pitch Deck</h4>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Problem, Solution, Market Size (TAM/SAM/SOM), Unfair Advantage, Business Model, and Ask slide.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                    <Share2 size={16} className="text-emerald-400 mb-2" />
                    <h4 className="font-bold text-white mb-1">Outreach Station</h4>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Pre-written LinkedIn cold DMs, high-converting Reddit launch drafts, and founder email templates.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Export formats supported: <strong className="text-slate-200">Executive PDF, Markdown (.md), and Raw JSON</strong>
                  </span>
                  <button
                    onClick={onCtaClick}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs cursor-pointer"
                  >
                    <FileDown size={14} />
                    <span>Generate Free Blueprint</span>
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Interactive Bar */}
            <div className="pt-6 mt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <Activity size={14} className="text-emerald-500 animate-pulse" />
                <span>Simulated live with 12 autonomous specialist co-founders</span>
              </div>
              <button
                onClick={onCtaClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-500/25 transition-all cursor-pointer active:scale-95"
              >
                <span>Launch Studio to Test Your Idea</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 5. 3-AI VC War Room Spotlight Section
// ---------------------------------------------------------------------------
export function VcWarRoomSpotlight({ onCtaClick }) {
  const [selectedTopic, setSelectedTopic] = useState("saas");

  const debateTopics = {
    saas: {
      title: "AI Contract & Vendor Audit Platform",
      category: "B2B LegalTech SaaS",
      bullQuote:
        "Every company with 50+ employees is burning money on duplicate software licenses. If we provide an instant 5-minute Slack/Google Drive scan with zero setup friction, we capture immediate corporate credit cards.",
      bearQuote:
        "The incumbent legal software vendors (Ironclad, ContractPodAI) already have customer contracts stored. You cannot win on a generic OCR parser without massive enterprise compliance certifications like SOC2.",
      judgeQuote:
        "Winning strategy: Bypass enterprise procurement gates entirely. Target Series A and B Tech startups where the Head of Ops or Founder makes discretionary tool purchases on corporate cards.",
      verdict: "Pass with Clear Wedge: Target Series A Ops Leads",
    },
    consumer: {
      title: "Deposit-Stakes Gym Accountability App",
      category: "Consumer Mobile / Behavioral Stakes",
      bullQuote:
        "Financial loss aversion is 2.5x more psychologically powerful than positive rewards. People hate losing a $20 deposit to their friend much more than they want to earn gym points. Viral mechanics are baked in.",
      bearQuote:
        "Payment gateway chargebacks and regulatory scrutiny around gambling/forfeiture mechanics will crush your margins. Plus, churn spikes as soon as users actually lose money twice.",
      judgeQuote:
        "Recommendation: Structure stakes as 'escrow charity donation' or buddy gift cards rather than house rake. Test retention with 20 college students before coding native apps.",
      verdict: "Proceed with Caution: Refactor Forfeit Legal Structure",
    },
    infra: {
      title: "Sub-Millisecond Semantic Vector Cache",
      category: "Developer Infrastructure / LLM Ops",
      bullQuote:
        "Enterprises are spending $50k/mo on OpenAI API bills with 60% redundant identical queries. A drop-in semantic cache cuts bills overnight and pays for itself within 48 hours.",
      bearQuote:
        "Embedding latency plus cosine similarity calculations in Python will degrade p99 response times. Unless built in C++ or Rust at the edge, developers will build their own Redis cache.",
      judgeQuote:
        "High-conviction technical wedge. Build as an open-source Rust middleware proxy. Prove latency wins on HackerNews benchmarks before charging for enterprise cloud tiers.",
      verdict: "Strong Proceed: Launch Open-Source Benchmark Wedge",
    },
  };

  const currentTopic = debateTopics[selectedTopic];

  return (
    <section id="vc-debate" className="py-20 bg-slate-900 text-white border-b border-slate-800 reveal-on-scroll">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-full shadow-2xs">
            Proprietary Architecture
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mt-3">
            Why 1 AI is never enough: <span className="text-orange-500">The 3-AI VC War Room</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-base mt-2">
            ChatGPT and Claude are programmed to flatter you. IdeaPulse pits 3 specialized frontier models against each
            other with conflicting incentives to reveal the real vulnerabilities of your business.
          </p>
        </div>

        {/* 3 Model Persona Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {/* Bull */}
          <div className="p-6 rounded-2xl bg-slate-800/80 border border-emerald-500/40 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">🐂</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                  Groq • Llama 3.3 70B
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">The Bull Partner</h3>
              <p className="text-xs text-slate-400 mt-1">
                Optimized for finding exponential upside, distribution wedges, viral loops, and 10x positioning angles.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700 text-xs font-mono text-emerald-300">
              Goal: Find why this could be a $100M venture.
            </div>
          </div>

          {/* Bear */}
          <div className="p-6 rounded-2xl bg-slate-800/80 border border-rose-500/40 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">🐻</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                  OpenRouter • DeepSeek V3
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">The Bear Partner</h3>
              <p className="text-xs text-slate-400 mt-1">
                Engineered to attack fatal unit economics, high CAC traps, retention friction, and incumbent retaliation.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700 text-xs font-mono text-rose-300">
              Goal: Uncover the fatal assumption before you code.
            </div>
          </div>

          {/* Chief Judge */}
          <div className="p-6 rounded-2xl bg-slate-800/80 border border-amber-500/40 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">⚖️</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  Google • Gemini 2.5 Flash
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">The Chief Judge</h3>
              <p className="text-xs text-slate-400 mt-1">
                Synthesizes the clash into a formal investment verdict, conviction score, and the single highest-priority test.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700 text-xs font-mono text-amber-300">
              Goal: Deliver an actionable, disciplined roadmap.
            </div>
          </div>
        </div>

        {/* Live Debate Snippet Selector */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono text-orange-400 uppercase font-bold tracking-wider">
                Real Debate Transcript Sample
              </span>
              <h4 className="text-xl font-bold text-white mt-1">{currentTopic.title}</h4>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setSelectedTopic("saas")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  selectedTopic === "saas" ? "bg-orange-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                B2B SaaS
              </button>
              <button
                onClick={() => setSelectedTopic("consumer")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  selectedTopic === "consumer" ? "bg-orange-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Consumer
              </button>
              <button
                onClick={() => setSelectedTopic("infra")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  selectedTopic === "infra" ? "bg-orange-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Developer Infra
              </button>
            </div>
          </div>

          <div className="py-6 space-y-4 text-xs sm:text-sm">
            {/* Bull Dialog */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block mb-1">
                🐂 Bull Partner (Groq Llama 3.3 70B):
              </span>
              <p className="text-slate-200 leading-relaxed italic">"{currentTopic.bullQuote}"</p>
            </div>

            {/* Bear Dialog */}
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30">
              <span className="text-[10px] font-mono uppercase text-rose-400 font-bold block mb-1">
                🐻 Bear Partner (OpenRouter DeepSeek V3):
              </span>
              <p className="text-slate-200 leading-relaxed italic">"{currentTopic.bearQuote}"</p>
            </div>

            {/* Judge Consensus */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block mb-1">
                ⚖️ Chief Judge Consensus Ruling (Gemini 2.5):
              </span>
              <p className="text-amber-100 font-medium leading-relaxed">"{currentTopic.judgeQuote}"</p>
              <div className="mt-2 pt-2 border-t border-amber-500/20 text-xs font-bold text-amber-300">
                Official Verdict: {currentTopic.verdict}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-400">
              Want the 3-AI committee to debate your startup thesis?
            </span>
            <button
              onClick={onCtaClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer active:scale-95"
            >
              <span>Stress-Test Your Startup Idea Now</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 6. The 6-Stage Continuous Validation Journey
// ---------------------------------------------------------------------------
export function PipelineWorkflowSection() {
  const stages = [
    {
      num: "01",
      title: "Concept Dissection & Lean Canvas",
      desc: "Dissects your raw sentence into a 9-box business model, targeting the exact customer archetype and problem-solution wedge.",
      icon: Lightbulb,
      color: "text-amber-500 bg-amber-50 border-amber-200",
    },
    {
      num: "02",
      title: "3-AI VC Committee Stress Test",
      desc: "Bull (Llama 3.3) and Bear (DeepSeek V3) debate your thesis while Gemini renders an impartial verdict and conviction score.",
      icon: Swords,
      color: "text-rose-500 bg-rose-50 border-rose-200",
    },
    {
      num: "03",
      title: "Demand Validation & The Mom Test",
      desc: "Generates unbiased customer interview questions based on Rob Fitzpatrick's framework to test actual willingness-to-pay.",
      icon: Users,
      color: "text-emerald-500 bg-emerald-50 border-emerald-200",
    },
    {
      num: "04",
      title: "Competitor Vulnerability Matrix",
      desc: "Dissects direct and indirect incumbents to pinpoint overlooked complaints, pricing flaws, and your differentiation wedge.",
      icon: Search,
      color: "text-purple-500 bg-purple-50 border-purple-200",
    },
    {
      num: "05",
      title: "Unit Economics & Financial Model",
      desc: "Calculates cloud server & AI token burn, projects MRR at 100/500/5,000 customers, and estimates the exact break-even month.",
      icon: DollarSign,
      color: "text-blue-500 bg-blue-50 border-blue-200",
    },
    {
      num: "06",
      title: "GTM Station & Executive PDF Export",
      desc: "Provides ready-to-send LinkedIn DMs, Reddit launch posts, 10-slide investor pitch deck, and 1-click formatted PDF download.",
      icon: Rocket,
      color: "text-orange-500 bg-orange-50 border-orange-200",
    },
  ];

  return (
    <section id="pipeline" className="py-20 bg-slate-50/70 border-b border-slate-200 reveal-on-scroll">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full shadow-2xs">
            Continuous Beast UX
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            The 6-stage continuous validation flow
          </h2>
          <p className="text-slate-500 text-xs sm:text-base mt-2">
            No fragmented forms or disjointed screens. IdeaPulse streams each analysis in a continuous,
            sticky-rail dashboard with live inter-agent feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stages.map((stg, idx) => {
            const Icon = stg.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xl font-black text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-200">
                      STAGE {stg.num}
                    </span>
                    <div className={`h-9 w-9 rounded-xl border flex items-center justify-center ${stg.color} group-hover:scale-110 transition-transform`}>
                      <Icon size={18} />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">{stg.title}</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{stg.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 7. Bento Grid: 12 Co-Founders & Proprietary Features
// ---------------------------------------------------------------------------
export function BentoFeatureGrid() {
  return (
    <section id="features" className="py-20 bg-white border-b border-slate-200 reveal-on-scroll">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full shadow-2xs">
            The Complete Copilot Suite
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Everything you need from raw concept to investor deck
          </h2>
          <p className="text-slate-500 text-xs sm:text-base mt-2">
            Engineered with deep specialized reasoning, verified data models, and founder execution tooling.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 (Large - Spans 2 cols) */}
          <div className="md:col-span-2 p-7 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30 uppercase">
                Autonomous Orchestra
              </span>
              <h3 className="text-2xl font-black text-white mt-3">12 Specialist AI Co-Founders in Parallel</h3>
              <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-xl leading-relaxed">
                Rather than one generalist LLM, IdeaPulse runs 12 domain agents simultaneously: Market TAM Lead,
                The Mom Test Lead, Competitor Vulnerability Hunter, Full-Stack Architect, CFO & Unit Economics Modeler,
                and YC Pitch Deck Coach.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
                {[
                  "Market Sizing Lead",
                  "Mom Test Lead",
                  "SWOT Strategist",
                  "Competitor Hunter",
                  "Software Architect",
                  "CFO & Unit Modeler",
                  "Outreach Copy Lead",
                  "YC Pitch Coach",
                  "Continuous Spy Rail",
                ].map((spec, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300 bg-white/5 p-2 rounded-lg border border-white/10">
                    <CheckCircle2 size={13} className="text-orange-400 shrink-0" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Continuous Scroll & Sticky Spy Rail */}
          <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center mb-4">
                <Layers size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Sticky Spy Rail & Beast UX</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Smooth continuous scrolling flow with dynamic continuum portals, real-time telemetry, and quick section anchors.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-orange-600">
              <span>Zero-lag navigation</span>
              <ArrowRight size={13} />
            </div>
          </div>

          {/* Card 3: 1-Click Founder Outreach Swipe File */}
          <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center mb-4">
                <Copy size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">1-Click Outreach Swipe File</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Ready-to-send LinkedIn connection requests, cold outreach emails, and high-converting Reddit launch post drafts.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-purple-600">
              <span>Copy-ready messaging</span>
              <ArrowRight size={13} />
            </div>
          </div>

          {/* Card 4: Co-Founder AI Chat Drawer */}
          <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4">
                <MessageSquare size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Interactive AI Chat Drawer</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Have follow-up conversations with your AI Co-Founder about your specific blueprint. Ask for pivots, pricing adjustments, or tech stack tweaks.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <span>Context-aware assistance</span>
              <ArrowRight size={13} />
            </div>
          </div>

          {/* Card 5: Secure Cloud Project Vault */}
          <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-4">
                <FolderKanban size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Secure Cloud Project Vault</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Powered by Appwrite Cloud. All your past venture ideas, SWOT matrices, and investor dossiers are encrypted and synced across all your devices.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-blue-600">
              <span>Automatic cloud backup</span>
              <ArrowRight size={13} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 8. Head-to-Head Competitor Comparison Table
// ---------------------------------------------------------------------------
export function ComparisonSection({ onCtaClick }) {
  const comparisonRows = [
    {
      feature: "Time to Comprehensive Validation",
      oldWay: "3–6 Months of blind building",
      genericAi: "10 Minutes of high-level chat",
      ideaPulse: "30 Seconds multi-agent pipeline",
    },
    {
      feature: "Unbiased Harsh Pushback",
      oldWay: "Emotional echo chamber & friends lying",
      genericAi: "Polite yes-man cheerleading",
      ideaPulse: "Brutal 3-AI VC Committee (Bull vs Bear)",
    },
    {
      feature: "Multi-Model Frontier Inference",
      oldWay: "None",
      genericAi: "Single generalist model",
      ideaPulse: "3 Specialized Models (Llama 3.3, DeepSeek, Gemini)",
    },
    {
      feature: "Bottom-Up Market Sizing (TAM/SAM/SOM)",
      oldWay: "Guesstimates on napkins",
      genericAi: "Hallucinated macro market numbers",
      ideaPulse: "Verified bottom-up SaaS arithmetic",
    },
    {
      feature: "Customer Discovery Methodology",
      oldWay: "Leading questions ('Would you buy this?')",
      genericAi: "Generic survey questions",
      ideaPulse: "The Mom Test unbiased interview scripts",
    },
    {
      feature: "Financial & Unit Economics Modeling",
      oldWay: "Complex spreadsheet formulas",
      genericAi: "Vague advice without real cost estimates",
      ideaPulse: "Interactive token burn, MRR, & break-even model",
    },
    {
      feature: "Export & Sharing Suite",
      oldWay: "Scattered notes & Google Docs",
      genericAi: "Copy-pasting ChatGPT chat logs",
      ideaPulse: "16-Part Executive PDF, Pitch Deck, & Markdown",
    },
    {
      feature: "Cost to Early Founder",
      oldWay: "$10,000–$25,000 consultant fees",
      genericAi: "$20/month with zero structure",
      ideaPulse: "100% Free Public Beta (3 ideas/week)",
    },
  ];

  return (
    <section id="compare" className="py-20 bg-slate-50/60 border-b border-slate-200 reveal-on-scroll">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full shadow-2xs">
            Why Ambitious Founders Choose IdeaPulse
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            How IdeaPulse compares to alternative approaches
          </h2>
          <p className="text-slate-500 text-xs sm:text-base mt-2">
            See the difference between building blindly, asking generic ChatGPT, and using an autonomous multi-agent copilot.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto bg-white rounded-3xl border border-slate-200 shadow-sm">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-mono font-bold text-slate-600 uppercase">
                <th className="p-4 sm:p-5 w-1/4">Evaluation Criteria</th>
                <th className="p-4 sm:p-5 w-1/4 text-slate-500">Building Blindly</th>
                <th className="p-4 sm:p-5 w-1/4 text-slate-500">Generic ChatGPT</th>
                <th className="p-4 sm:p-5 w-1/4 bg-orange-50 text-orange-900 border-l border-orange-200 font-black">
                  ⚡ IdeaPulse AI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">{row.feature}</td>
                  <td className="p-4 sm:p-5 text-slate-500 flex items-center gap-1.5">
                    <XCircle size={14} className="text-rose-500 shrink-0" />
                    <span>{row.oldWay}</span>
                  </td>
                  <td className="p-4 sm:p-5 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                      <span>{row.genericAi}</span>
                    </div>
                  </td>
                  <td className="p-4 sm:p-5 bg-orange-50/40 border-l border-orange-200 font-semibold text-slate-900">
                    <div className="flex items-center gap-1.5 text-orange-900">
                      <CheckCircle2 size={15} className="text-orange-600 shrink-0" />
                      <span>{row.ideaPulse}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-center mt-10">
          <button
            onClick={onCtaClick}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer active:scale-95"
          >
            <span>Experience the Difference Free</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 9. Interactive Sample Blueprint Showcase (Audience Tabs)
// ---------------------------------------------------------------------------
export function AudienceTabs({ onSelectTab }) {
  const [activeTab, setActiveTab] = useState("b2b");

  const samples = {
    b2b: {
      category: "B2B SaaS / LegalTech",
      title: "AI Contract & Vendor Audit Platform",
      prompt:
        "An AI-powered B2B platform that audits enterprise vendor contracts, flags compliance risks, and benchmarks pricing automatically.",
      tam: "$14.2B Global Enterprise Contract Management",
      verdict: "Proceed — High Enterprise Urgency",
      score: "89 / 100",
      topAction: "Cold email 30 procurement managers using the pre-generated LinkedIn query.",
    },
    consumer: {
      category: "Consumer Mobile / Fitness",
      title: "Social Accountability Gym Partner App",
      prompt:
        "A micro-community app that pairs solo lifters with matched gym accountability buddies with deposit-forfeit stakes.",
      tam: "$4.1B Boutique Fitness & Accountability",
      verdict: "Proceed with Caution — Focus on Retention",
      score: "78 / 100",
      topAction: "Validate with 15 university students via Mom Test questions before coding.",
    },
    devtool: {
      category: "Developer Infra / LLM Ops",
      title: "Sub-Millisecond Semantic Vector Cache",
      prompt:
        "A high-performance in-memory semantic cache for LLMs that cuts OpenAI & Anthropic token bills by 70% with sub-ms p99 latency.",
      tam: "$6.8B AI Infrastructure & Middleware",
      verdict: "Strong Proceed — Clear ROI Wedge",
      score: "92 / 100",
      topAction: "Publish open-source benchmark repo on HackerNews to capture waitlist.",
    },
  };

  const current = samples[activeTab];

  return (
    <section id="samples" className="py-20 bg-white border-b border-slate-200 reveal-on-scroll">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full shadow-2xs">
            Real Market Pulse Output
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            See what IdeaPulse uncovers
          </h2>
          <p className="text-slate-500 text-xs sm:text-base mt-2">
            Switch between these example concepts to see how deep, quantitative, and tailored the synthesized blueprints are.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-inner">
            <button
              onClick={() => setActiveTab("b2b")}
              className={`px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "b2b" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Enterprise B2B
            </button>
            <button
              onClick={() => setActiveTab("consumer")}
              className={`px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "consumer" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Consumer App
            </button>
            <button
              onClick={() => setActiveTab("devtool")}
              className={`px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "devtool" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Developer Infra
            </button>
          </div>
        </div>

        {/* Interactive Sample Card */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-9 shadow-xl border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono text-orange-400 font-bold uppercase tracking-wider">
                {current.category}
              </span>
              <h3 className="text-xl sm:text-2xl font-black mt-1 tracking-tight text-white">{current.title}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-mono font-bold">
                Viability: {current.score}
              </span>
            </div>
          </div>

          <div className="py-6 space-y-4 text-xs sm:text-sm">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">Original Input</span>
              <p className="text-slate-200 bg-white/5 p-3.5 rounded-xl border border-white/10 font-medium">
                "{current.prompt}"
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                  Market Sizing (TAM)
                </span>
                <p className="text-slate-200 font-semibold">{current.tam}</p>
              </div>

              <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                  Investment Verdict
                </span>
                <p className="text-emerald-400 font-semibold">{current.verdict}</p>
              </div>
            </div>

            <div className="bg-orange-500/10 border border-orange-500/30 p-3.5 rounded-xl text-orange-200">
              <span className="text-[10px] font-mono uppercase text-orange-400 font-bold block mb-0.5">
                Week 1 Action Item
              </span>
              <p>{current.topAction}</p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-400 font-mono">Ready to see what the market thinks of your idea?</span>
            <button
              onClick={() => onSelectTab?.(current.prompt)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-500/25 transition-all cursor-pointer active:scale-95"
            >
              <span>Test This Concept in Studio</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 10. Authentic Founder Testimonials
// ---------------------------------------------------------------------------
export function TestimonialsSection() {
  const highlights = [
    {
      quote:
        "The 3-AI VC debate between the Bull and Bear completely shocked me. The Bear flagged the exact enterprise compliance hole that a real angel investor had pointed out to me the week before.",
      name: "Alex V.",
      role: "Solo B2B SaaS Founder",
      badge: "YC W25 Applicant",
    },
    {
      quote:
        "The customer discovery Mom Test questions alone saved me 2 months of building the wrong feature. It forces you to look at real willingness-to-pay rather than polite feedback.",
      name: "Priya S.",
      role: "AI Product Engineer",
      badge: "Hackathon Winner",
    },
    {
      quote:
        "Having the technical stack architecture, server/token cost estimates, and Reddit launch copy synthesized together in 30 seconds makes testing weekend projects actually viable.",
      name: "Marcus K.",
      role: "Full-Stack Dev & Indie Hacker",
      badge: "Bootstrapped to $4k MRR",
    },
  ];

  return (
    <section className="py-20 bg-slate-50/70 border-b border-slate-200 reveal-on-scroll">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full shadow-2xs">
            Founder Feedback
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Built for execution, not just conversation
          </h2>
          <p className="text-slate-500 text-xs sm:text-base mt-2">
            What ambitious builders say about stress-testing their startup thesis with IdeaPulse.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {highlights.map((h, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <p className="text-slate-700 text-xs sm:text-sm leading-relaxed italic mb-6">"{h.quote}"</p>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 text-xs">{h.name}</p>
                  <p className="text-[11px] text-slate-400">{h.role}</p>
                </div>
                <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-[10px] font-semibold border border-orange-200 font-mono">
                  {h.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 11. Transparent Pricing Section
// ---------------------------------------------------------------------------
export function PricingSection({ onSelectPlan }) {
  return (
    <section id="pricing" className="py-20 bg-white border-b border-slate-200 reveal-on-scroll">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full shadow-2xs">
            Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Start free. Know what the market thinks.
          </h2>
          <p className="text-slate-500 text-xs sm:text-base mt-2">
            Every account gets 3 free startup blueprints per week. No hidden fees or surprise subscriptions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Card 1: Free Starter (3 ideas/week) */}
          <div className="rounded-3xl p-8 bg-white border-2 border-orange-500 shadow-lg shadow-orange-500/10 flex flex-col justify-between relative">
            <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-600 text-white font-mono shadow-2xs">
              Current Active Plan
            </span>

            <div>
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="text-xl font-bold text-slate-900">Free Starter</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900 font-mono">₹0</span>
                  <span className="text-xs text-slate-500 font-mono">/ week</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Free account required. Ideal for early founders and students validating initial problem-solution fit.
              </p>

              <ul className="space-y-3 mb-8 text-xs text-slate-700">
                {[
                  "3 Startup Blueprints per week (Free)",
                  "All 12 Specialist AI Co-Founders",
                  "3-AI VC War Room Debate (Llama + DeepSeek + Gemini)",
                  "Bottom-Up TAM / SAM / SOM Market Sizing",
                  "Full SWOT & Competitor Vulnerability matrix",
                  "Financial Unit Economics & Cost Simulator",
                  "Executive PDF & Markdown download",
                ].map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2.5">
                    <CheckCircle2 size={15} className="text-orange-600 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => onSelectPlan?.("starter")}
              className="w-full py-3 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer active:scale-95"
            >
              Sign In to Start Free (3 Ideas/Wk)
            </button>
          </div>

          {/* Card 2: Pro Founder (10 ideas/week - ₹149/mo) */}
          <div className="rounded-3xl p-8 bg-slate-900 text-white flex flex-col justify-between relative shadow-xl border border-slate-800">
            <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-600 text-white font-mono shadow-2xs">
              Popular with Founders
            </span>

            <div>
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="text-xl font-bold text-white">Pro Founder</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white font-mono">₹149</span>
                  <span className="text-xs text-slate-400 font-mono">/ month</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                For active venture creators, solo founders, and agency builders wanting high-volume validation:
              </p>

              <ul className="space-y-3 mb-8 text-xs text-slate-300">
                {[
                  "10 Startup Blueprints per week",
                  "Unlimited 3-AI VC War Room Debates & Rebuttals",
                  "Priority AI inference with zero queueing",
                  "Unlimited Co-Founder & YC Partner chat",
                  "Full PDF & PRD dossier export suite",
                  "Priority cloud vault backup (Appwrite)",
                  "Voucher code support (FOUNDER_PASS)",
                ].map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2.5">
                    <Sparkles size={15} className="text-orange-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onSelectPlan?.("pro")}
              className="w-full py-3 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <Zap size={16} />
              <span>Upgrade to Pro (₹149 / mo)</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 12. Founder-Focused FAQ Accordion
// ---------------------------------------------------------------------------
export function FaqSection({ onCtaClick }) {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "What makes IdeaPulse different from asking ChatGPT or Claude?",
      a: "Generic LLMs are programmed to be polite cheerleaders; they will praise almost any idea and generate hallucinated, high-level summaries. IdeaPulse runs a 12-stage autonomous pipeline with our proprietary 3-AI VC War Room (Groq Llama 3.3 Bull, OpenRouter DeepSeek V3 Bear, and Gemini 2.5 Chief Judge) to specifically expose fatal assumptions, calculate real unit economics, and output Rob Fitzpatrick's 'Mom Test' discovery questions.",
    },
    {
      q: "How does the 3-AI VC War Room debate work?",
      a: "When your blueprint is synthesized, our system convenes a 3-agent venture capital committee: The Bull (Llama 3.3 70B) advocates for why the idea could reach $100M ARR; The Bear (DeepSeek V3) attacks acquisition costs, retention friction, and incumbent retaliation; and The Chief Judge (Gemini 2.5 Flash) renders an impartial consensus ruling and highlights the #1 experiment you must run.",
    },
    {
      q: "How does the weekly generation quota work?",
      a: "Every registered free account receives 3 complete startup blueprint generations per week. The quota automatically resets every 7 days. If you require higher volume, Pro Founder provides 10 blueprints per week for ₹149/month, or you can activate unlimited testing with the FOUNDER_PASS voucher.",
    },
    {
      q: "Are the TAM / SAM / SOM market size calculations reliable?",
      a: "They are bottom-up analytical estimates synthesized based on verified industry benchmarks and comparable business models. They provide a disciplined, defensible ballpark for accelerator applications, angel meetings, and team alignment.",
    },
    {
      q: "Can I download or share my synthesized blueprint?",
      a: "Yes! Every blueprint can be exported with 1 click as a formatted Executive PDF or Markdown file ready to share with co-founders, incubators, or advisors.",
    },
  ];

  return (
    <section id="faq" className="py-20 bg-slate-50/60 border-b border-slate-200 reveal-on-scroll">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full shadow-2xs">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500 text-xs sm:text-base mt-2">
            Everything you need to know about IdeaPulse and the validation methodology.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <span className="text-sm font-bold text-slate-900">{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-orange-600" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={onCtaClick}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer active:scale-95 animate-idea-pulse"
          >
            <Activity size={16} />
            <span>Ready to test your startup idea? Launch Studio</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 13. Final High-Impact CTA Banner
// ---------------------------------------------------------------------------
export function FinalCtaBanner({ onCtaClick }) {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-slate-900 text-white px-4 relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center relative z-10 bg-slate-900/90 border border-slate-800 p-8 sm:p-14 rounded-3xl shadow-2xl backdrop-blur-md">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 text-xs font-mono font-bold mb-6">
          <Sparkles size={13} />
          Stop Building in the Dark
        </span>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
          Test your startup thesis before your competitors do.
        </h2>
        <p className="text-slate-400 text-xs sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
          Get 12 autonomous AI specialists and a brutal 3-AI VC committee working on your startup idea in under 30 seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onCtaClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-600/30 transition-all cursor-pointer active:scale-95"
          >
            <Zap size={16} />
            <span>Validate Your Idea (3 Free / Week)</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <p className="text-[11px] text-slate-500 font-mono mt-4">
          Zero credit card required • Instant results • Appwrite cloud sync
        </p>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 14. Full Clean Institutional Footer
// ---------------------------------------------------------------------------
export function FullFooter() {
  return (
    <footer className="bg-white border-t border-slate-200 py-12 px-4 sm:px-8 text-xs text-slate-500">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-orange-600 flex items-center justify-center text-white font-black text-xs shadow-2xs">
            IP
          </div>
          <span className="font-extrabold text-sm text-slate-900 tracking-tight">
            Idea<span className="text-orange-600">Pulse</span>
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-[11px] font-medium text-slate-600 italic">
            Autonomous Startup Copilot & 3-AI VC War Room
          </span>
        </div>

        <div className="flex items-center gap-6 text-slate-500 font-medium">
          <a href="#demo" className="hover:text-orange-600 transition-colors">
            Demo
          </a>
          <a href="#vc-debate" className="hover:text-orange-600 transition-colors">
            VC Debate
          </a>
          <a href="#features" className="hover:text-orange-600 transition-colors">
            12 Agents
          </a>
          <a href="#compare" className="hover:text-orange-600 transition-colors">
            Compare
          </a>
          <a href="#pricing" className="hover:text-orange-600 transition-colors">
            Pricing
          </a>
          <a href="#faq" className="hover:text-orange-600 transition-colors">
            FAQ
          </a>
        </div>

        <p className="text-center sm:text-right text-[11px] text-slate-400 max-w-xs">
          © {new Date().getFullYear()} IdeaPulse AI. Built for ambitious founders.
        </p>
      </div>
    </footer>
  );
}

// Legacy fallback exports to avoid breaking imports
export function StatsSection() {
  return null;
}

export function FeaturesGrid() {
  return null;
}

export function HeroMockupPreview() {
  return null;
}

export function FloatingChatWidget() {
  return null;
}
