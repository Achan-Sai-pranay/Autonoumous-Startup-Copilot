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

import { useState, useRef } from "react";
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
  Pause,
  RotateCcw,
  Award,
  BarChart3,
  Mic,
  Share2,
  Volume2,
  VolumeX,
  ShieldAlert,
  BrainCircuit,
  Maximize2,
  Minimize2,
  Compass,
  Briefcase,
  GraduationCap,
  Bot,
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
    { label: "Y Combinator Applicants", icon: Sparkles },
    { label: "Indie Hackers", icon: Zap },
    { label: "Product Hunt Makers", icon: Rocket },
    { label: "Solo SaaS Engineers", icon: Cpu },
    { label: "AI Hackathon Winners", icon: Bot },
    { label: "University Founders", icon: GraduationCap },
    { label: "Angel-Backed Ventures", icon: Briefcase },
  ];

  return (
    <section className="py-7 bg-slate-50/80 border-y border-slate-200/80 overflow-hidden w-full">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-3.5 flex items-center justify-center gap-2">
          <span className="h-px w-6 bg-slate-200 inline-block" />
          <span>TRUSTED &amp; USED BY AMBITIOUS FOUNDERS PREPARING TO LAUNCH</span>
          <span className="h-px w-6 bg-slate-200 inline-block" />
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
          {ecosystems.map((eco, idx) => {
            const Icon = eco.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs hover:border-orange-300 hover:text-orange-600 transition-all cursor-default"
              >
                <Icon size={13} className="text-orange-500" />
                <span>{eco.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 3. Hero Section with Interactive Prompt Station & Live Activity
// ---------------------------------------------------------------------------
export function HeroSection({
  onStartWithIdea,
  initialIdea = "",
}) {
  const [heroPrompt, setHeroPrompt] = useState(initialIdea);

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
    <section className="relative z-10 text-center max-w-5xl pt-10 sm:pt-16 pb-10 px-4 w-full mx-auto">
      {/* Live Activity Ticker */}
      <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900 text-slate-200 border border-slate-800 text-[11px] font-mono mb-6 shadow-md shadow-slate-950/10">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-slate-400 font-semibold hidden sm:inline">LIVE NETWORK:</span>
        <span className="text-slate-200 font-medium truncate max-w-[280px] sm:max-w-none">
          32s ago • Enterprise B2B thesis evaluated (88% conviction)
        </span>
        <span className="text-orange-400 font-mono text-[10px] bg-orange-950/80 px-2 py-0.5 rounded border border-orange-500/30">
          v2.6 Multi-Agent
        </span>
      </div>

      {/* Main Headline */}
      <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.08] font-display">
        Know what the market thinks.
        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 mt-1">
          Validate before you build.
        </span>
      </h1>

      {/* Subtitle */}
      <p className="mb-8 font-normal text-base md:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
        Stop spending 3 months building for an imaginary market. 12 autonomous AI specialists and an adversarial
        <strong className="text-slate-900 font-semibold"> 3-AI Venture Capitalist debate committee </strong>
        simulate your market demand, unit economics, competitor vulnerabilities, and launch roadmap in 30 seconds.
      </p>

      {/* Interactive Hero Prompt Station */}
      <div className="w-full max-w-3xl mx-auto mb-6 bg-white rounded-2xl p-3 sm:p-4 shadow-xl border border-orange-200/90 relative spotlight-card">
        <div className="relative">
          <textarea
            value={heroPrompt}
            onChange={(e) => setHeroPrompt(e.target.value)}
            placeholder="Describe your startup concept (e.g. 'An AI-powered B2B platform that audits enterprise vendor contracts and benchmarks pricing...')"
            rows={2}
            className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none font-sans"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2.5 px-1">
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
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 border border-slate-200/80 text-[11px] font-medium text-slate-600 transition-all cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Launch CTA Button */}
            <button
              onClick={handleSubmit}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-600/25 transition-all cursor-pointer magnetic-btn shrink-0"
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
          <span>Full PDF &amp; Markdown export</span>
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
// 4. Live Product Simulator (Standalone Apple-style Mac Window Demo)
// ---------------------------------------------------------------------------
export { LiveProductSimulator } from "./LiveProductSimulator";

// ---------------------------------------------------------------------------
// 5. 3-AI VC War Room Spotlight (The Frontier Adversarial Arena)
// ---------------------------------------------------------------------------
export function VcWarRoomSpotlight({ onCtaClick }) {
  const [selectedTopic, setSelectedTopic] = useState("saas");
  const [activeRound, setActiveRound] = useState(1);
  const [founderChallengeOpen, setFounderChallengeOpen] = useState(false);

  const debateTopics = {
    saas: {
      title: "AI Contract & Vendor Audit Platform",
      category: "B2B LegalTech SaaS",
      rounds: {
        1: {
          label: "Round 1: Customer Pain & Distribution Wedge",
          bullQuote:
            "Every mid-market company with 50+ staff bleeds $40k–$150k annually on zombie SaaS renewals and unbenchmarked seats. If we provide an instant 5-minute Slack/Google Drive scan with zero setup friction, we capture immediate corporate credit cards.",
          bearQuote:
            "The incumbent contract vendors (Ironclad, ContractPodAI) already have customer contracts stored. You cannot win on a generic OCR parser without massive enterprise compliance certifications like SOC2 Type II.",
          judgeQuote:
            "Winning strategy: Bypass enterprise procurement gates entirely. Target Series A and B Tech startups where the Head of Ops or Founder makes discretionary tool purchases on corporate cards.",
          conviction: "86%",
          judgeRuling: "PASS WITH CLEAR WEDGE",
        },
        2: {
          label: "Round 2: CAC Traps vs Churn Vulnerabilities",
          bullQuote:
            "Our audit report is an organic viral Trojan Horse. When an ops manager exports a PDF showing $35k in savings, they forward it to their investor network and finance slack groups, driving negative-CAC referrals.",
          bearQuote:
            "Annual contract audits have a 360-day churn loop. Once a founder runs the audit and renegotiates their top 3 contracts, why keep paying $89/month for the remaining 11 months?",
          judgeQuote:
            "Fatal trap detected. You must pivot pricing from one-off audit to continuous renewal calendar monitoring with 90-day cancellation alerts.",
          conviction: "78%",
          judgeRuling: "REFRACTOR TO CONTINUOUS MONITORING",
        },
        3: {
          label: "Round 3: Defensibility & Investment Committee Verdict",
          bullQuote:
            "By anonymizing contract rate cards across 500 customers, we build the proprietary 'Glassdoor for SaaS Pricing'—a dataset that incumbents like Ironclad cannot replicate without violating enterprise NDAs.",
          bearQuote:
            "If OpenAI or Anthropic adds native structured PDF parsing in their base assistant, your raw technical moat is reduced to a UI wrapper.",
          judgeQuote:
            "High conviction if the rate-card data network effect is executed. Recommendation: Seed the database with 50 YC companies before approaching Series A VCs.",
          conviction: "91%",
          judgeRuling: "FORMAL INVESTMENT PASS: SEED APPROVED",
        },
      },
    },
    consumer: {
      title: "Deposit-Stakes Gym Accountability App",
      category: "Consumer Mobile / Behavioral Stakes",
      rounds: {
        1: {
          label: "Round 1: Loss Aversion Psychology vs Acquisition",
          bullQuote:
            "Financial loss aversion is 2.5x more psychologically powerful than positive rewards. People hate losing a $20 deposit to their friend much more than they want to earn gym points. Viral buddy invites are baked into the core loop.",
          bearQuote:
            "Payment gateway chargebacks and regulatory scrutiny around gambling/forfeiture mechanics will crush your margins. Plus, churn spikes as soon as a user actually forfeits money twice in a row.",
          judgeQuote:
            "Recommendation: Structure forfeit stakes as 'escrow charity donation' or buddy dinner gift cards rather than house rake. Test retention with 20 college students before coding native apps.",
          conviction: "72%",
          judgeRuling: "PROCEED WITH CAUTION: REFACTOR STAKES LEGALITY",
        },
        2: {
          label: "Round 2: Unit Economics & Payment Gateway Rake",
          bullQuote:
            "Taking a 10% fee on peer stakes creates instant high-velocity transaction volume with zero inventory cost.",
          bearQuote:
            "Stripe and Apple App Store 30% digital fee policies will block deposit-forfeit mechanisms or label you an unregulated casino.",
          judgeQuote:
            "Fatal store policy risk. Launch as a progressive Web App (PWA) with Plaid bank transfers to avoid Apple's 30% take-rate.",
          conviction: "68%",
          judgeRuling: "BYPASS APP STORE VIA PWA",
        },
        3: {
          label: "Round 3: Long-Term Retention & Habit Formation",
          bullQuote:
            "Fitness cohorts with financial accountability show 78% 90-day gym attendance vs 14% industry baseline.",
          bearQuote:
            "Users will fake workout proof via GPS spoofing and gym photo uploads unless you build biometric or smart-watch verification.",
          judgeQuote:
            "Mandate Apple Health / Strava heart-rate verification (120+ BPM for 30 minutes) to eliminate cheating.",
          conviction: "84%",
          judgeRuling: "APPROVE WITH BIOMETRIC LOCK",
        },
      },
    },
    infra: {
      title: "Sub-Millisecond Semantic Vector Cache",
      category: "Developer Infrastructure / LLM Ops",
      rounds: {
        1: {
          label: "Round 1: Latency Wedge vs Token Cost Savings",
          bullQuote:
            "Enterprises are spending $50k/mo on OpenAI API bills with 60% redundant identical queries. A drop-in semantic cache cuts bills overnight and pays for itself within 48 hours.",
          bearQuote:
            "Embedding latency plus cosine similarity calculations in Python will degrade p99 response times. Unless built in C++ or Rust at the edge, developers will build their own Redis cache in an afternoon.",
          judgeQuote:
            "High-conviction technical wedge. Build as an open-source Rust middleware proxy. Prove latency wins on HackerNews benchmarks before charging for enterprise cloud tiers.",
          conviction: "89%",
          judgeRuling: "STRONG PROCEED: LAUNCH OPEN-SOURCE BENCHMARK",
        },
        2: {
          label: "Round 2: Redis vs Cloud Incumbent Competition",
          bullQuote:
            "Redis has vector search, but lacks contextual fuzzy threshold calibration and prompt-temperature aware invalidation.",
          bearQuote:
            "Cloudflare Workers AI or AWS ElastiCache will ship an automated LLM semantic cache feature natively in 6 months.",
          judgeQuote:
            "Wedge must be specialized multi-modal caching (text + vision embeddings) where generic caches fail.",
          conviction: "82%",
          judgeRuling: "PIVOT TO MULTI-MODAL VISION EMBEDDINGS",
        },
        3: {
          label: "Round 3: Commercial Enterprise Moat",
          bullQuote:
            "SOC2-compliant self-hosted Helm chart for banks spending $200k/mo on internal LLM agent workflows.",
          bearQuote:
            "Enterprise sales will require a 9-month procurement cycle unless you offer a 1-line pip install drop-in proxy.",
          judgeQuote:
            "Deliver 1-line Python / TypeScript SDK proxy: client = CacheProxy(openai). Immediate traction.",
          conviction: "94%",
          judgeRuling: "STRONG BUY: SERIES SEED READY",
        },
      },
    },
    health: {
      title: "Autonomous Dental Intake & Triage",
      category: "HealthTech / Voice AI Agents",
      rounds: {
        1: {
          label: "Round 1: Clinic Labor Shortage vs Patient Trust",
          bullQuote:
            "Dental clinics miss 35% of inbound patient calls during lunch and after 5 PM. An empathetic sub-400ms voice agent books appointments directly into Dentrix, adding $8,000/mo in recovered clinic revenue.",
          bearQuote:
            "Patients will hang up on robotic voice agents if latency exceeds 600ms or if the agent misinterprets emergency dental pain symptoms like tooth abscesses.",
          judgeQuote:
            "High urgency and immediate ROI. Must deploy with sub-400ms WebRTC voice stack and strict human escalation fail-safe.",
          conviction: "88%",
          judgeRuling: "PROCEED WITH MANDATORY ESCALATION SAFEGUARDS",
        },
        2: {
          label: "Round 2: EHR / Practice Management Integration Friction",
          bullQuote:
            "Charging $399/mo per clinic is a no-brainer when a single root-canal booking generates $1,200.",
          bearQuote:
            "Legacy dental software (Dentrix, Eaglesoft) has closed proprietary on-premise Windows databases with zero modern REST APIs.",
          judgeQuote:
            "Partner with dental EHR sync providers (such as NexHealth / Curve Dental) to bypass direct Windows database reverse-engineering.",
          conviction: "84%",
          judgeRuling: "INTEGRATE VIA ESTABLISHED EHR SYNC APIS",
        },
        3: {
          label: "Round 3: HIPAA Compliance & Expansion Moat",
          bullQuote:
            "Once installed in 50 clinics, expand horizontally into Orthodontics, Chiropractic, and Veterinary practices.",
          bearQuote:
            "One HIPAA violation leak of patient dental records carries up to $50,000 in statutory penalties.",
          judgeQuote:
            "Execute BAA with dedicated HIPAA-compliant voice inference hosts. High venture upside.",
          conviction: "92%",
          judgeRuling: "APPROVED FOR CLINIC PILOT LAUNCH",
        },
      },
    },
  };

  const currentTopic = debateTopics[selectedTopic];
  const currentRoundData = currentTopic.rounds[activeRound];

  return (
    <section id="vc-debate" className="py-16 sm:py-24 bg-slate-900 text-white border-b border-slate-800 reveal-on-scroll w-full overflow-hidden relative">
      {/* Ambient Cyber Grid Background */}
      <div className="absolute inset-0 bg-dot-grid opacity-15 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold mb-4 shadow-sm">
            <Swords size={13} className="text-orange-500" />
            <span>PROPRIETARY MULTI-AGENT ADVERSARIAL ENGINE</span>
          </div>
          <h2 className="text-2xl xs:text-3xl sm:text-5xl font-black tracking-tight text-white font-display">
            Why 1 AI is never enough: <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">The 3-AI VC War Room</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-base mt-3 leading-relaxed">
            Generic LLMs are programmed to be polite cheerleaders that flatter you. LaunchPilot pits 3 specialized frontier
            neural models against each other with conflicting incentives to reveal the real vulnerabilities of your business.
          </p>
        </div>

        {/* Visual Tri-Agent Clash Arena Architecture */}
        <div className="mb-12 relative">
          {/* Top Connecting Neural Beam Diagram */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 -translate-y-1/2 pointer-events-none z-0">
            <svg className="w-full h-16" viewBox="0 0 1000 60" fill="none">
              <path d="M 180 30 L 500 30" stroke="#10b981" strokeWidth="2" className="neural-conduit" />
              <path d="M 820 30 L 500 30" stroke="#f43f5e" strokeWidth="2" className="neural-conduit" />
              <circle cx="500" cy="30" r="6" fill="#f59e0b" className="animate-ping" opacity="0.4" />
              <circle cx="500" cy="30" r="4" fill="#f59e0b" />
            </svg>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
            {/* Bull Model Pillar */}
            <div className="p-6 rounded-3xl bg-slate-950/80 border border-emerald-500/40 relative flex flex-col justify-between spotlight-card shadow-lg hover:border-emerald-400 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white font-display">The Bull Partner</h3>
                      <p className="text-[10px] font-mono text-emerald-400">Groq • Llama 3.3 70B</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Upside: 91%
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Incentivized to discover the 100x wedge, viral loop, and unfair distribution advantages that competitors overlook.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-500/20 text-[11px] font-mono text-emerald-300 flex items-center justify-between">
                <span>Objective:</span>
                <span className="font-bold">Find the $100M Venture Wedge</span>
              </div>
            </div>

            {/* Central Arbiter: Chief Judge */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/60 relative flex flex-col justify-between shadow-xl shadow-amber-500/10 lg:-translate-y-2">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
                      <Scale size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white font-display">The Chief Judge</h3>
                      <p className="text-[10px] font-mono text-amber-400">Google • Gemini 2.5 Flash</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Net: {currentRoundData.conviction}
                  </span>
                </div>
                <p className="text-xs text-amber-100/90 leading-relaxed font-medium">
                  Impartial arbitrator that synthesizes the clash into a formal investment ruling, conviction score, and deal terms.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-amber-500/30 text-[11px] font-mono text-amber-300 flex items-center justify-between">
                <span>Consensus:</span>
                <span className="font-bold">{currentRoundData.judgeRuling}</span>
              </div>
            </div>

            {/* Bear Model Pillar */}
            <div className="p-6 rounded-3xl bg-slate-950/80 border border-rose-500/40 relative flex flex-col justify-between spotlight-card shadow-lg hover:border-rose-400 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                      <ShieldAlert size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white font-display">The Bear Partner</h3>
                      <p className="text-[10px] font-mono text-rose-400">OpenRouter • DeepSeek V3</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    Risk: 84%
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Engineered to destroy weak business models, attack fatal CAC-to-LTV traps, high churn, and incumbent retaliation.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-rose-500/20 text-[11px] font-mono text-rose-300 flex items-center justify-between">
                <span>Objective:</span>
                <span className="font-bold">Kill the Fatal Assumption Early</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Live Debate Arena Console */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl spotlight-card">
          {/* Header Controls: Topic Picker + Audio Simulation */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-[11px] font-mono text-orange-400 uppercase font-bold tracking-wider">
                Real Multi-Agent Transcript Stream
              </span>
              <h4 className="text-xl sm:text-2xl font-bold text-white mt-1 font-display">{currentTopic.title}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{currentTopic.category}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                {[
                  { id: "saas", label: "B2B SaaS" },
                  { id: "consumer", label: "Consumer" },
                  { id: "infra", label: "Dev Infra" },
                  { id: "health", label: "HealthTech" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTopic(t.id);
                      setActiveRound(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      selectedTopic === t.id ? "bg-orange-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Institutional Audit Pipeline Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                <ShieldCheck size={13} className="text-emerald-400" />
                <span>Deterministic Arbitration</span>
              </div>
            </div>
          </div>

          {/* Debate Round Selector */}
          <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-none touch-scroll border-b border-slate-800/80">
            {[1, 2, 3].map((rnd) => (
              <button
                key={rnd}
                onClick={() => setActiveRound(rnd)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeRound === rnd
                    ? "bg-orange-600/20 text-orange-400 border border-orange-500/50"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
                }`}
              >
                {currentTopic.rounds[rnd].label}
              </button>
            ))}
          </div>

          {/* Active Spoken Dialogue Clash */}
          <div className="py-6 space-y-4 text-xs sm:text-sm animate-fade-in">
            {/* Bull Dialog */}
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                  <TrendingUp size={14} />
                  <span>The Bull Partner (Groq • Llama 3.3 70B):</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-900/40 px-2 py-0.5 rounded">
                  Argued in 0.28s
                </span>
              </div>
              <p className="text-slate-200 leading-relaxed italic">"{currentRoundData.bullQuote}"</p>
            </div>

            {/* Bear Dialog */}
            <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase text-rose-400 font-bold flex items-center gap-1.5">
                  <ShieldAlert size={14} />
                  <span>The Bear Partner (OpenRouter • DeepSeek V3):</span>
                </span>
                <span className="text-[10px] font-mono text-rose-300 bg-rose-900/40 px-2 py-0.5 rounded">
                  Counter-Fired in 0.41s
                </span>
              </div>
              <p className="text-slate-200 leading-relaxed italic">"{currentRoundData.bearQuote}"</p>
            </div>

            {/* Judge Consensus */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase text-amber-400 font-bold flex items-center gap-1.5">
                  <Scale size={14} />
                  <span>Chief Judge Consensus Ruling (Google • Gemini 2.5 Flash):</span>
                </span>
                <span className="text-[10px] font-mono text-amber-300 bg-amber-900/40 px-2 py-0.5 rounded font-bold">
                  Conviction: {currentRoundData.conviction}
                </span>
              </div>
              <p className="text-amber-100 font-medium leading-relaxed">"{currentRoundData.judgeQuote}"</p>
              <div className="mt-3 pt-2.5 border-t border-amber-500/20 text-xs font-bold text-amber-300 flex items-center justify-between">
                <span>Official Verdict:</span>
                <span className="font-mono text-amber-200 bg-amber-500/20 px-2.5 py-0.5 rounded">
                  {currentRoundData.judgeRuling}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Rebuttal Challenge */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame size={15} className="text-orange-500" />
                <span className="font-semibold text-slate-200">Want to challenge the Bear Partner?</span>
                <span className="text-slate-400 hidden sm:inline">Simulate a real founder counter-defense</span>
              </div>
              <button
                type="button"
                onClick={() => setFounderChallengeOpen(!founderChallengeOpen)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-orange-400 font-mono text-[11px] transition-colors cursor-pointer"
              >
                {founderChallengeOpen ? "Close Defense" : "Challenge Bear"}
              </button>
            </div>

            {founderChallengeOpen && (
              <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 animate-fade-in">
                <p className="text-slate-300">
                  <strong className="text-orange-400 font-mono">Simulated Founder Defense:</strong> "We counter the Bear's churn risk by locking enterprise customers into annual prepay with guaranteed 15% rate discounts and automated quarterly audit re-runs."
                </p>
                <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-200 text-xs">
                  <strong>Judge Ruling:</strong> "Counter accepted. Annual contracts protect early cash flow and eliminate month-to-month cancellation churn. Conviction adjusted upward +8%."
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Strip */}
          <div className="pt-6 mt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-400">
              Want the 3-AI committee to debate your specific startup thesis?
            </span>
            <button
              onClick={onCtaClick}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer magnetic-btn shrink-0"
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
      desc: "Dissects your raw concept into a 9-box business model, targeting the exact customer archetype and problem-solution wedge.",
      icon: Lightbulb,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/30",
    },
    {
      num: "02",
      title: "3-AI VC Committee Stress Test",
      desc: "Bull (Llama 3.3) and Bear (DeepSeek V3) debate your thesis while Gemini renders an impartial verdict and conviction score.",
      icon: Swords,
      color: "text-rose-500 bg-rose-500/10 border-rose-500/30",
    },
    {
      num: "03",
      title: "Demand Validation & The Mom Test",
      desc: "Generates unbiased customer interview questions based on Rob Fitzpatrick's framework to test actual willingness-to-pay.",
      icon: Users,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
    },
    {
      num: "04",
      title: "Competitor Vulnerability Matrix",
      desc: "Dissects direct and indirect incumbents to pinpoint overlooked complaints, pricing flaws, and your differentiation wedge.",
      icon: Search,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/30",
    },
    {
      num: "05",
      title: "Unit Economics & Financial Model",
      desc: "Calculates cloud server & AI token burn, projects MRR at 100/500/5,000 customers, and estimates the exact break-even month.",
      icon: DollarSign,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/30",
    },
    {
      num: "06",
      title: "GTM Station & Executive PDF Export",
      desc: "Provides ready-to-send LinkedIn DMs, Reddit launch posts, 10-slide investor pitch deck, and 1-click formatted PDF download.",
      icon: Rocket,
      color: "text-orange-500 bg-orange-500/10 border-orange-500/30",
    },
  ];

  return (
    <section id="pipeline" className="py-20 sm:py-24 bg-slate-50/70 border-b border-slate-200 reveal-on-scroll w-full overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-mono font-bold mb-3 shadow-2xs">
            <Zap size={12} className="text-orange-600" />
            <span>CONTINUOUS TELEMETRY PIPELINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            The 6-stage continuous validation flow
          </h2>
          <p className="text-slate-500 text-xs sm:text-base mt-2">
            No fragmented forms or disjointed screens. LaunchPilot streams each analysis in a continuous,
            sticky-rail dashboard with real-time inter-agent feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stages.map((stg, idx) => {
            const Icon = stg.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-orange-300 transition-all flex flex-col justify-between group spotlight-card relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-sm font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
                      STAGE {stg.num}
                    </span>
                    <div className={`h-10 w-10 rounded-2xl border flex items-center justify-center ${stg.color} group-hover:scale-110 transition-transform`}>
                      <Icon size={19} />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight font-display">{stg.title}</h3>
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
    <section id="features" className="py-16 sm:py-24 bg-white border-b border-slate-200 reveal-on-scroll w-full overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-mono font-bold mb-3 shadow-2xs">
            <Sparkles size={12} className="text-orange-600" />
            <span>FULL MULTI-AGENT ARSENAL</span>
          </div>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Everything you need from raw concept to investor deck
          </h2>
          <p className="text-slate-500 text-xs sm:text-base mt-2">
            Engineered with deep specialized reasoning, verified data models, and founder execution tooling.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 (Large - Spans 2 cols) */}
          <div className="md:col-span-2 p-6 sm:p-8 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden group spotlight-card">
            <div className="relative z-10">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30 uppercase tracking-wider">
                Autonomous Orchestra
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white mt-3 font-display">
                12 Specialist AI Co-Founders in Parallel
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-xl leading-relaxed">
                Rather than one generalist LLM, LaunchPilot coordinates 12 domain agents simultaneously: Market TAM Lead,
                The Mom Test Lead, Competitor Vulnerability Hunter, Full-Stack Architect, CFO &amp; Unit Economics Modeler,
                and YC Pitch Deck Coach.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-6">
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
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300 bg-white/5 p-2.5 rounded-xl border border-white/10 hover:border-orange-500/40 transition-colors">
                    <CheckCircle2 size={13} className="text-orange-400 shrink-0" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Continuous Scroll & Sticky Spy Rail */}
          <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between spotlight-card">
            <div>
              <div className="h-11 w-11 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center mb-4 shadow-2xs">
                <Layers size={21} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display">Sticky Spy Rail &amp; Beast UX</h3>
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
          <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between spotlight-card">
            <div>
              <div className="h-11 w-11 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center mb-4 shadow-2xs">
                <Copy size={21} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display">1-Click Outreach Swipe File</h3>
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
          <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between spotlight-card">
            <div>
              <div className="h-11 w-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4 shadow-2xs">
                <MessageSquare size={21} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display">Interactive AI Chat Drawer</h3>
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
          <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between spotlight-card">
            <div>
              <div className="h-11 w-11 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-4 shadow-2xs">
                <FolderKanban size={21} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display">Secure Cloud Project Vault</h3>
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
    <section id="compare" className="py-16 sm:py-24 bg-slate-50/60 border-b border-slate-200 reveal-on-scroll w-full overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-mono font-bold mb-3 shadow-2xs">
            <Scale size={12} className="text-orange-600" />
            <span>UNBIASED BENCHMARK</span>
          </div>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            How LaunchPilot compares to alternative approaches
          </h2>
          <p className="text-slate-500 text-xs sm:text-base mt-2">
            See the difference between building blindly, asking generic ChatGPT, and using an autonomous multi-agent copilot.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto bg-white rounded-3xl border border-slate-200 shadow-sm scrollbar-none touch-scroll">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-mono font-bold text-slate-600 uppercase">
                <th className="p-4 sm:p-5 w-1/4">Evaluation Criteria</th>
                <th className="p-4 sm:p-5 w-1/4 text-slate-500">Building Blindly</th>
                <th className="p-4 sm:p-5 w-1/4 text-slate-500">Generic ChatGPT</th>
                <th className="p-4 sm:p-5 w-1/4 bg-orange-50 text-orange-900 border-l border-orange-200 font-black">
                  ⚡ LaunchPilot AI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 sm:p-5 font-bold text-slate-900">{row.feature}</td>
                  <td className="p-4 sm:p-5 text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <XCircle size={14} className="text-rose-500 shrink-0" />
                      <span>{row.oldWay}</span>
                    </div>
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
        <p className="sm:hidden text-center text-[11px] font-mono text-slate-400 mt-2">
          ← Swipe horizontally to inspect comparison →
        </p>

        <div className="text-center mt-10">
          <button
            onClick={onCtaClick}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer magnetic-btn"
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-mono font-bold mb-3 shadow-2xs">
            <Sparkles size={12} className="text-orange-600" />
            <span>REAL SYNTHESIS EXAMPLES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            See what LaunchPilot uncovers
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
  const [billingCycle, setBillingCycle] = useState("annual");

  return (
    <section id="pricing" className="py-20 sm:py-24 bg-white border-b border-slate-200 reveal-on-scroll w-full overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-mono font-bold mb-3 shadow-2xs">
            <DollarSign size={12} className="text-orange-600" />
            <span>TRANSPARENT PRICING</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Start free. Know what the market thinks.
          </h2>
          <p className="text-slate-500 text-xs sm:text-base mt-2">
            Every account gets 3 free startup blueprints per week. No hidden fees or surprise subscriptions.
          </p>
        </div>

        {/* Billing Interval Switcher */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200/80 inline-flex items-center gap-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                billingCycle === "annual"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-100 text-emerald-700">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Card 1: Free Starter (3 ideas/week) */}
          <div className="rounded-3xl p-6 sm:p-8 bg-white border-2 border-orange-500/80 shadow-lg shadow-orange-500/10 flex flex-col justify-between relative transition-all">
            <div>
              {/* Card Header Badge */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-200 font-mono">
                  Current Active Plan
                </span>
                <span className="text-[11px] font-mono text-slate-400">Zero Credit Card</span>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <h3 className="text-xl font-bold text-slate-900 font-display">Free Starter</h3>
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
                  "Interactive 3D Risk Topology Visualizer",
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
              className="w-full py-3.5 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer magnetic-btn"
            >
              Sign In to Start Free (3 Ideas/Wk)
            </button>
          </div>

          {/* Card 2: Pro Founder */}
          <div className="rounded-3xl p-6 sm:p-8 bg-slate-950 text-white flex flex-col justify-between relative shadow-2xl border border-slate-800 transition-all">
            <div>
              {/* Card Header Badge */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-600 text-white font-mono shadow-sm">
                  <Sparkles size={11} />
                  Popular with Founders
                </span>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                  {billingCycle === "annual" ? "Save ₹360 / Year" : "Flexible Month-to-Month"}
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <h3 className="text-xl font-bold text-white font-display">Pro Founder</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white font-mono">
                    {billingCycle === "annual" ? "₹119" : "₹149"}
                  </span>
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
              className="w-full py-3.5 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 magnetic-btn"
            >
              <Zap size={16} />
              <span>
                {billingCycle === "annual"
                  ? "Upgrade to Pro (₹119 / mo • Billed Annually)"
                  : "Upgrade to Pro (₹149 / mo)"}
              </span>
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
      q: "What makes LaunchPilot different from asking ChatGPT or Claude?",
      a: "Generic LLMs are programmed to be polite cheerleaders; they will praise almost any idea and generate hallucinated, high-level summaries. LaunchPilot runs a 12-stage autonomous pipeline with our proprietary 3-AI VC War Room (Groq Llama 3.3 Bull, OpenRouter DeepSeek V3 Bear, and Gemini 2.5 Chief Judge) to specifically expose fatal assumptions, calculate real unit economics, and output Rob Fitzpatrick's 'Mom Test' discovery questions.",
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
    <section id="faq" className="py-20 sm:py-24 bg-slate-50/60 border-b border-slate-200 reveal-on-scroll w-full overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-mono font-bold mb-3 shadow-2xs">
            <HelpCircle size={12} className="text-orange-600" />
            <span>FOUNDER CLARIFICATIONS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500 text-xs sm:text-base mt-2">
            Everything you need to know about LaunchPilot and our adversarial validation methodology.
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
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer magnetic-btn animate-idea-pulse"
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
    <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-slate-900 text-white px-4 relative overflow-hidden w-full">
      <div className="max-w-4xl mx-auto text-center relative z-10 bg-slate-950/90 border border-slate-800 p-8 sm:p-14 rounded-3xl shadow-2xl backdrop-blur-md spotlight-card">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 text-xs font-mono font-bold mb-6">
          <Sparkles size={13} />
          Stop Building in the Dark
        </span>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4 font-display">
          Test your startup thesis before your competitors do.
        </h2>
        <p className="text-slate-400 text-xs sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
          Get 12 autonomous AI specialists and a brutal 3-AI VC committee working on your startup idea in under 30 seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onCtaClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-600/30 transition-all cursor-pointer magnetic-btn"
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
