// components/MarketingSections.jsx
// ---------------------------------------------------------------------------
// IdeaPulse AI — "Know what the market thinks."
// Authentic startup co-founder experience:
// 1. Live Beta Announcement Banner
// 2. Ecosystem Trust Bar (Y Combinator, Indie Hackers, Product Hunt, GitHub, Gemini AI)
// 3. Core Metric / Speed Breakdown
// 4. 12 Autonomous Co-Founders Capability Matrix
// 5. Interactive Sample Blueprint Showcase
// 6. Transparent Beta Pricing (3 Free Ideas/Week + V2 ₹149/Mo Waitlist)
// 7. Real Founder FAQ Accordion
// 8. Polished Modern Footer
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
} from "lucide-react";

// --- 1. Top Announcement Banner --------------------------------------------
export function AnnouncementBanner({ onCtaClick }) {
  return (
    <div
      id="banner"
      className="w-full bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border-b border-orange-200/80 py-2.5 px-4 text-xs font-medium text-slate-800 z-30"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-600 text-white uppercase tracking-wider">
          v1 Public Beta
        </span>
        <span className="text-slate-800 font-semibold">
          ⚡ IdeaPulse is live — Know what the market thinks before you write code (3 Free ideas/week!)
        </span>
        <button
          onClick={onCtaClick}
          className="inline-flex items-center gap-1 font-bold text-orange-600 hover:text-orange-700 underline ml-1 cursor-pointer transition-colors"
        >
          Validate Your Idea <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

// --- 2. Real Ecosystem Trust Marquee ---------------------------------------
export function MarqueeLogos() {
  const ecosystems = [
    { label: "Y Combinator Applicants", icon: "🍊" },
    { label: "Indie Hackers", icon: "⚡" },
    { label: "Product Hunt Launchers", icon: "🚀" },
    { label: "Student & College Builders", icon: "🎓" },
    { label: "Solo SaaS Engineers", icon: "💻" },
    { label: "AI Hackathon Projects", icon: "🤖" },
  ];

  return (
    <section className="py-8 bg-slate-50/70 border-y border-slate-200/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-4">
          BUILT FOR FOUNDERS WHO WANT TO KNOW WHAT THE MARKET THINKS
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
          {ecosystems.map((eco, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 text-xs font-semibold text-slate-700 shadow-2xs hover:border-orange-300 transition-colors"
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

// --- 3. Stats & Speed Section ----------------------------------------------
export function StatsSection() {
  const stats = [
    {
      value: "12",
      label: "Autonomous Specialists",
      desc: "Simulating Market Analysts, Software Architects, CFOs, and YC pitch coaches.",
    },
    {
      value: "30s",
      label: "Pulse Check Duration",
      desc: "From raw concept to a complete 16-part institutional market brief.",
    },
    {
      value: "3 / wk",
      label: "Free Ideas Each Week",
      desc: "Zero paywalls or commitments for Version 1. Sign in and test.",
    },
    {
      value: "100%",
      label: "Unbiased Market Reality",
      desc: "Know real buyer willingness-to-pay before spending engineering hours.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-slate-200 reveal-on-scroll">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
            The Market Pulse Engine
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Why spend 3 weeks guessing what takes 30 seconds to know?
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2">
            Most startups die because founders build for an imaginary market. IdeaPulse runs an immediate
            pulse check on demand, competitor weaknesses, and willingness-to-pay.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div
              key={i}
              className={`p-6 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-orange-300 hover:bg-white hover:shadow-md transition-all duration-300 reveal-stagger-${i + 1}`}
            >
              <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight text-orange-600">
                {s.value}
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-2">{s.label}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- 4. 12-Agent Orchestra Grid --------------------------------------------
export function FeaturesGrid() {
  const agents = [
    {
      title: "Market Demand & TAM Specialist",
      role: "Agent 1 & 4",
      desc: "Calculates bottom-up Total Addressable Market (TAM), Serviceable Market (SAM), and realistic year 1-3 obtainable share.",
      icon: Target,
      color: "text-blue-500 bg-blue-50 border-blue-200",
    },
    {
      title: "Lean Discovery & Mom Test Lead",
      role: "Agent 2",
      desc: "Crafts unbiased customer interview questions based on The Mom Test to uncover true buyer willingness-to-pay.",
      icon: Users,
      color: "text-emerald-500 bg-emerald-50 border-emerald-200",
    },
    {
      title: "Defensibility & SWOT Strategist",
      role: "Agent 3",
      desc: "Evaluates internal unfair advantages, structural vulnerabilities, and competitive barriers to entry.",
      icon: ShieldCheck,
      color: "text-amber-500 bg-amber-50 border-amber-200",
    },
    {
      title: "Competitor Vulnerability Hunter",
      role: "Agent 5",
      desc: "Dissects direct incumbents to pinpoint their pricing flaws, overlooked user complaints, and your differentiation wedge.",
      icon: Search,
      color: "text-purple-500 bg-purple-50 border-purple-200",
    },
    {
      title: "Full-Stack Software Architect",
      role: "Agent 6 & 7",
      desc: "Recommends production-grade tech stacks (frontend, backend, database, AI APIs) and scopes your minimum viable product (MVP).",
      icon: Cpu,
      color: "text-orange-500 bg-orange-50 border-orange-200",
    },
    {
      title: "CFO & Unit Economics Modeler",
      role: "Agent 8 & 12",
      desc: "Estimates monthly operational server/AI costs and projects revenue targets at 100, 500, and 5,000 active customers.",
      icon: DollarSign,
      color: "text-green-500 bg-green-50 border-green-200",
    },
    {
      title: "Growth & Cold Outreach Lead",
      role: "Agent 11",
      desc: "Generates ready-to-send LinkedIn DMs, cold email copy, Reddit launch drafts, and high-converting launch checklists.",
      icon: Rocket,
      color: "text-rose-500 bg-rose-50 border-rose-200",
    },
    {
      title: "YC Batch Pitch Coach",
      role: "Agent 9 & 10",
      desc: "Synthesizes an executive 1-sentence hook, an investor summary, and a step-by-step 4-week execution roadmap.",
      icon: Sparkles,
      color: "text-indigo-500 bg-indigo-50 border-indigo-200",
    },
  ];

  return (
    <section id="features" className="py-20 bg-slate-50/60 border-b border-slate-200 reveal-on-scroll">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
            Under the Hood
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            12 AI co-founders diagnosing your startup thesis
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2">
            Each specialist runs with tailored domain reasoning, cross-validating market demand,
            architectural feasibility, and go-to-market execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {agents.map((agent, i) => {
            const Icon = agent.icon;
            return (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`h-9 w-9 rounded-xl border flex items-center justify-center ${agent.color} group-hover:scale-110 transition-transform`}
                    >
                      <Icon size={18} />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {agent.role}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-snug">
                    {agent.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{agent.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// --- 5. Interactive Sample Showcase ----------------------------------------
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
    <section id="sample-blueprint" className="py-20 bg-white border-b border-slate-200 reveal-on-scroll">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
            Real Market Pulse Output
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            See what IdeaPulse uncovers
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2">
            Switch between these example concepts to see how deep, quantitative, and tailored
            the synthesized blueprints are.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-inner">
            <button
              onClick={() => setActiveTab("b2b")}
              className={`px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "b2b"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Enterprise B2B
            </button>
            <button
              onClick={() => setActiveTab("consumer")}
              className={`px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "consumer"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Consumer App
            </button>
            <button
              onClick={() => setActiveTab("devtool")}
              className={`px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "devtool"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
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
              <h3 className="text-xl sm:text-2xl font-black mt-1 tracking-tight text-white">
                {current.title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-mono font-bold">
                Viability: {current.score}
              </span>
            </div>
          </div>

          <div className="py-6 space-y-4 text-xs sm:text-sm">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                Original Input
              </span>
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
            <span className="text-xs text-slate-400 font-mono">
              Ready to see what the market thinks of your idea?
            </span>
            <button
              onClick={onSelectTab}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-500/25 transition-all cursor-pointer active:scale-95"
            >
              <span>Get Your Free IdeaPulse Check</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- 6. Authentic Community / Builder Highlights ---------------------------
export function TestimonialsSection() {
  const highlights = [
    {
      quote:
        "The customer discovery Mom Test questions alone saved me 2 months of building the wrong feature. It forces you to look at real willingness-to-pay.",
      name: "Early Beta Founder",
      role: "Solo SaaS Builder",
    },
    {
      quote:
        "Having the technical stack recommendation, cloud cost estimates, and Reddit launch copy together in one place makes starting on a weekend actually realistic.",
      name: "Hackathon Lead",
      role: "Full-Stack Engineer",
    },
    {
      quote:
        "The competitor vulnerability matrix was genuinely useful. It pulled out the exact weak spots of existing tools that I can leverage in cold DMs.",
      name: "Venture Applicant",
      role: "YC W25 Applicant",
    },
  ];

  return (
    <section className="py-20 bg-slate-50/70 border-b border-slate-200 reveal-on-scroll">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
            Founder Feedback
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Built for execution, not just conversation
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2">
            What early builders say about running an IdeaPulse check on their startup thesis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {highlights.map((h, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <p className="text-slate-700 text-xs sm:text-sm leading-relaxed italic mb-6">
                "{h.quote}"
              </p>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 text-xs">{h.name}</p>
                  <p className="text-[11px] text-slate-400">{h.role}</p>
                </div>
                <span className="text-orange-500 text-xs font-bold">Verified Tester</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- 7. Transparent Beta Pricing (3 Ideas/Week + V2 ₹149/Mo Waitlist) -------
export function PricingSection({ onSelectPlan }) {
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  const handleWaitlistSubmit = (e) => {
    e.preventDefault();
    if (waitlistEmail.trim()) {
      setWaitlistSubmitted(true);
    }
  };

  return (
    <section id="pricing" className="py-20 bg-white border-b border-slate-200 reveal-on-scroll">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
            Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Start free. Know what the market thinks.
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2">
            Every account gets 3 free startup blueprints per week. Create an account to begin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Card 1: Free Public Beta (3 ideas/week) */}
          <div className="rounded-3xl p-8 bg-white border-2 border-orange-500 shadow-lg shadow-orange-500/10 flex flex-col justify-between relative">
            <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-600 text-white font-mono shadow-xs">
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
              onClick={onSelectPlan}
              className="w-full py-3 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer active:scale-95"
            >
              Sign In to Start Free (3 Ideas/Wk)
            </button>
          </div>

          {/* Card 2: Pro Founder (10 ideas/week - ₹149/mo) */}
          <div className="rounded-3xl p-8 bg-slate-900 text-white flex flex-col justify-between relative shadow-xl border border-slate-800">
            <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-600 text-white font-mono shadow-xs">
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
                  "Priority AI inference with zero queueing",
                  "Unlimited Co-Founder & YC Partner chat",
                  "Full PDF & PRD dossier export suite",
                  "Priority cloud vault backup",
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

// --- 8. Founder-Focused FAQ Accordion ---------------------------------------
export function FaqSection({ onCtaClick }) {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "What is IdeaPulse and what does 'Know what the market thinks' mean?",
      a: "IdeaPulse is an autonomous startup intelligence platform. Instead of spending weeks building in the dark, IdeaPulse runs 12 specialist AI co-founders to analyze real customer willingness-to-pay, competitor vulnerabilities, and bottom-up market size in 30 seconds.",
    },
    {
      q: "How does the free quota work?",
      a: "Every free account gets 3 complete startup blueprint generations per week. It resets automatically every 7 days. Version 2 will offer a Pro tier with 10 ideas per week for ₹149/month.",
    },
    {
      q: "Do I have to create an account to use IdeaPulse?",
      a: "Yes. Creating a free account ensures all your generated blueprints and pitch decks are securely saved in your personal vault so you never lose them.",
    },
    {
      q: "Are the market size (TAM/SAM/SOM) numbers real or estimates?",
      a: "They are bottom-up analytical estimates synthesized by our Market Sizing agent based on verified industry benchmarks and comparable SaaS metrics. They give you a disciplined ballpark for early investor conversations and validation.",
    },
    {
      q: "Can I download or share my blueprint?",
      a: "Yes! Every blueprint can be exported with 1 click as a formatted Executive PDF or Markdown file ready to share with co-founders, incubators, or advisors.",
    },
  ];

  return (
    <section id="faq" className="py-20 bg-slate-50/60 border-b border-slate-200 reveal-on-scroll">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Everything you need to know about IdeaPulse.
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

// --- 9. Clean Modern Footer -------------------------------------------------
export function FullFooter() {
  return (
    <footer className="bg-white border-t border-slate-200 py-12 px-4 sm:px-8 text-xs text-slate-500">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-orange-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
            IP
          </div>
          <span className="font-extrabold text-sm text-slate-900 tracking-tight">
            Idea<span className="text-orange-600">Pulse</span>
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-[11px] font-medium text-slate-600 italic">
            Know what the market thinks.
          </span>
        </div>

        <p className="text-center sm:text-right text-[11px] text-slate-400 max-w-md">
          AI estimates & frameworks are synthesized for early validation and planning.
          © {new Date().getFullYear()} IdeaPulse AI. Built for ambitious founders.
        </p>
      </div>
    </footer>
  );
}

// Fallbacks to avoid breaking any legacy imports
export function HeroMockupPreview({ onCtaClick }) {
  return null;
}

export function FloatingChatWidget() {
  return null;
}
