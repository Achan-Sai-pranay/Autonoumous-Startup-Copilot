// components/MarketingSections.jsx
// ---------------------------------------------------------------------------
// LaunchPilot landing page sections.
// Same exports and handler props as before. Styles live in ./home.css.
// ---------------------------------------------------------------------------
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Minus,
  Plus,
  X,
  Sparkles,
  Zap,
  Rocket,
  Cpu,
  Bot,
  GraduationCap,
  Briefcase,
  Lightbulb,
  Swords,
  Users,
  Search,
  Wallet,
  TrendingUp,
  ShieldAlert,
  Scale,
  Copy,
  FolderKanban,
  Layers,
  Code2,
  Globe,
  Share2,
  GitCompare,
} from "lucide-react";
import "./home.css";

// The Mac demo lives in its own file; App.jsx still imports it from here.
export { LiveProductSimulator } from "./LiveProductSimulator.jsx";

export const BRAND = "LaunchPilot";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */
function Reveal({ children, delay = 0, className = "", as: Tag = "div", ...rest }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined" || prefersReducedMotion()) {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      ref={ref}
      className={`hp-rv ${on ? "is-in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

function Head({ title, lede }) {
  return (
    <Reveal className="hp-head">
      <h2 className="hp-h2">{title}</h2>
      {lede && <p className="hp-lede">{lede}</p>}
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Announcement banner                                              */
/* ------------------------------------------------------------------ */
export function AnnouncementBanner({ onCtaClick }) {
  return (
    <div id="banner" className="hp hp-banner">
      <p>
        <b>New</b> Real-time Reddit grounding, 1-Click Cursor & Lovable prompt packs, and Side-by-Side Venture Comparison are live.
      </p>
      <button type="button" onClick={onCtaClick}>
        Try 1 demo blueprint free <ArrowRight size={13} />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Hero                                                             */
/* ------------------------------------------------------------------ */
const PLACEHOLDERS = [
  "An AI platform that audits vendor contracts and flags risky renewals…",
  "A gym app where missed workouts cost you a small deposit…",
  "A semantic cache that cuts LLM token bills by 70%…",
  "A voice receptionist that books and triages for dental clinics…",
];

function useTypedPlaceholder(lines, active) {
  const [text, setText] = useState("");
  useEffect(() => {
    if (!active) return;
    if (prefersReducedMotion()) {
      setText(lines[0]);
      return;
    }
    let li = 0;
    let ci = 0;
    let erasing = false;
    let t;
    const tick = () => {
      const line = lines[li];
      if (!erasing) {
        ci += 1;
        setText(line.slice(0, ci));
        if (ci >= line.length) {
          erasing = true;
          t = setTimeout(tick, 1800);
          return;
        }
        t = setTimeout(tick, 28);
      } else {
        ci -= 2;
        if (ci <= 0) {
          ci = 0;
          erasing = false;
          li = (li + 1) % lines.length;
          setText("");
          t = setTimeout(tick, 350);
          return;
        }
        setText(line.slice(0, ci));
        t = setTimeout(tick, 12);
      }
    };
    t = setTimeout(tick, 500);
    return () => clearTimeout(t);
  }, [active, lines]);
  return text;
}

export function HeroSection({ onStartWithIdea, initialIdea = "" }) {
  const [heroPrompt, setHeroPrompt] = useState(initialIdea);
  const [focused, setFocused] = useState(false);
  const typed = useTypedPlaceholder(PLACEHOLDERS, !heroPrompt && !focused);

  const sampleChips = [
    {
      label: "B2B contract auditor",
      prompt:
        "An AI-powered B2B platform that audits enterprise vendor contracts, flags compliance risks, and benchmarks pricing automatically against industry norms.",
    },
    {
      label: "Fitness stakes app",
      prompt:
        "A social micro-community mobile app that pairs solo gym lifters with accountability buddies with forfeit deposit stakes for missed workouts.",
    },
    {
      label: "LLM semantic cache",
      prompt:
        "A high-performance in-memory semantic cache for LLMs that cuts OpenAI and Anthropic token bills by 70% with sub-millisecond p99 latency.",
    },
    {
      label: "Dental intake agent",
      prompt:
        "An autonomous voice and chat receptionist for dental clinics that conducts insurance pre-checks, books appointments, and triages emergencies.",
    },
  ];

  function handleSubmit(e) {
    e?.preventDefault?.();
    onStartWithIdea(heroPrompt.trim() || sampleChips[0].prompt);
  }

  return (
    <section className="hp hp-hero">
      <div className="hp-hero-glow" aria-hidden="true" />
      <div className="hp-wrap hp-hero-inner">
        <h1 className="hp-h1">
          Know what the market thinks.
          <span>Before you build it.</span>
        </h1>
        <p className="hp-sub">
          Twelve AI specialists and a three-model investor debate test your idea’s demand, economics and
          competition in about 30 seconds.
        </p>

        <form className="hp-prompt" onSubmit={handleSubmit}>
          <textarea
            value={heroPrompt}
            onChange={(e) => setHeroPrompt(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={typed || "Describe your startup idea"}
            rows={3}
            aria-label="Describe your startup idea"
          />
          <div className="hp-prompt-bar">
            <span>1 free demo blueprint per device</span>
            <button type="submit" className="hp-btn hp-btn--primary">
              <Zap size={15} />
              Run market pulse
            </button>
          </div>
        </form>

        <div className="hp-chips" role="group" aria-label="Example ideas">
          <span>Try an example</span>
          {sampleChips.map((c) => (
            <button key={c.label} type="button" onClick={() => setHeroPrompt(c.prompt)}>
              {c.label}
            </button>
          ))}
        </div>

        <ul className="hp-assure">
          <li>
            <Check size={14} /> No credit card
          </li>
          <li>
            <Check size={14} /> Free public beta
          </li>
          <li>
            <Check size={14} /> PDF and Markdown export
          </li>
          <li>
            <Sparkles size={14} /> Llama 3.3, DeepSeek V3, Gemini 2.5
          </li>
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Audience marquee                                                 */
/* ------------------------------------------------------------------ */
export function MarqueeLogos() {
  const items = [
    { label: "Y Combinator applicants", icon: Sparkles },
    { label: "Indie Hackers", icon: Zap },
    { label: "Product Hunt makers", icon: Rocket },
    { label: "Solo SaaS engineers", icon: Cpu },
    { label: "AI hackathon teams", icon: Bot },
    { label: "University founders", icon: GraduationCap },
    { label: "Angel-backed ventures", icon: Briefcase },
  ];
  const loop = [...items, ...items];
  return (
    <section className="hp hp-marquee" aria-label="Who LaunchPilot is built for">
      <p>Made for founders at every stage</p>
      <div className="hp-marquee-mask">
        <div className="hp-marquee-track">
          {loop.map((it, i) => {
            const Icon = it.icon;
            return (
              <span key={i} className="hp-pill" aria-hidden={i >= items.length}>
                <Icon size={14} />
                {it.label}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 4. VC War Room                                                      */
/* ------------------------------------------------------------------ */
const DEBATES = {
  saas: {
    tab: "B2B SaaS",
    title: "AI contract and vendor audit platform",
    category: "B2B LegalTech SaaS",
    rounds: [
      {
        label: "Customer pain and wedge",
        bull: "Every mid-market company with 50+ staff bleeds ₹35 Lakhs – ₹1.2 Crore a year on zombie SaaS renewals and unbenchmarked seats. A five-minute Slack or Google Drive scan with zero setup friction gets us onto corporate credit cards fast.",
        bear: "Incumbent contract vendors like Ironclad and ContractPodAI already hold the customer contracts. You can’t win on a generic OCR parser without enterprise certifications like SOC 2 Type II.",
        judge: "Bypass enterprise procurement entirely. Target Series A and B tech startups where the head of ops or the founder buys tools on a corporate card.",
        conviction: "86%",
        ruling: "Pass, with a clear wedge",
      },
      {
        label: "Acquisition cost vs churn",
        bull: "The audit report is a viral Trojan horse. When an ops manager exports a PDF showing ₹28 Lakhs in savings, they forward it to investors and finance Slack groups, which drives referrals at negative acquisition cost.",
        bear: "Contract audits have a 360-day churn loop. Once a founder renegotiates their top three contracts, why keep paying ₹7,500 a month for the other eleven?",
        judge: "Fatal trap. Move pricing from one-off audits to continuous renewal monitoring with 90-day cancellation alerts.",
        conviction: "78%",
        ruling: "Rework into continuous monitoring",
      },
      {
        label: "Defensibility and verdict",
        bull: "By anonymizing rate cards across 500 customers, we build the “Glassdoor for SaaS pricing”, a dataset incumbents can’t copy without breaking enterprise NDAs.",
        bear: "If OpenAI or Anthropic adds native structured PDF parsing to their base assistant, your technical moat shrinks to a UI wrapper.",
        judge: "High conviction if the rate-card network effect gets built. Seed the database with 50 YC companies before approaching Series A investors.",
        conviction: "91%",
        ruling: "Seed approved",
      },
    ],
  },
  consumer: {
    tab: "Consumer",
    title: "Deposit-stakes gym accountability app",
    category: "Consumer mobile · behavioral stakes",
    rounds: [
      {
        label: "Loss aversion vs acquisition",
        bull: "Loss aversion is about 2.5x stronger than reward. People hate losing a ₹1,500 deposit to a friend far more than they want gym points, and buddy invites are built into the core loop.",
        bear: "Chargebacks and gambling-style regulation around forfeits will crush your margins, and churn spikes once a user forfeits money twice in a row.",
        judge: "Frame forfeits as escrowed charity donations or buddy dinner gift cards, not house rake. Test retention with 20 college students before building native apps.",
        conviction: "72%",
        ruling: "Proceed with caution; fix stakes legality",
      },
      {
        label: "Unit economics and payment rake",
        bull: "A 10% fee on peer stakes creates high-velocity transaction volume with zero inventory cost.",
        bear: "Stripe and Apple’s 30% digital fee policies will block deposit-forfeit mechanics or label you an unregulated casino.",
        judge: "Serious store-policy risk. Launch as a progressive web app with bank transfers to avoid Apple’s 30% cut.",
        conviction: "68%",
        ruling: "Bypass the app store with a PWA",
      },
      {
        label: "Retention and habit formation",
        bull: "Cohorts with financial accountability show 78% attendance at 90 days, against a 14% industry baseline.",
        bear: "Users will fake workout proof with GPS spoofing and photo uploads unless you verify with a smart watch or biometrics.",
        judge: "Require Apple Health or Strava heart-rate verification, 120+ BPM for 30 minutes, to remove cheating.",
        conviction: "84%",
        ruling: "Approve with biometric lock",
      },
    ],
  },
  infra: {
    tab: "Dev infra",
    title: "Sub-millisecond semantic vector cache",
    category: "Developer infrastructure · LLM ops",
    rounds: [
      {
        label: "Latency wedge vs token savings",
        bull: "Enterprises spend ₹42 Lakhs a month on OpenAI with 60% redundant queries. A drop-in semantic cache cuts the bill overnight and pays for itself within 48 hours.",
        bear: "Embedding latency plus cosine similarity in Python will hurt p99. Unless you build in C++ or Rust at the edge, developers will write their own Redis cache in an afternoon.",
        judge: "Strong technical wedge. Build an open-source Rust proxy and win the latency benchmarks on Hacker News before charging for enterprise tiers.",
        conviction: "89%",
        ruling: "Strong proceed: launch open-source benchmarks",
      },
      {
        label: "Redis and cloud competition",
        bull: "Redis has vector search, but lacks fuzzy threshold calibration and prompt-temperature-aware invalidation.",
        bear: "Cloudflare Workers AI or AWS ElastiCache will ship a native LLM semantic cache within six months.",
        judge: "The wedge must be multi-modal caching (text plus vision embeddings), where generic caches fail.",
        conviction: "82%",
        ruling: "Pivot to multi-modal embeddings",
      },
      {
        label: "Commercial moat",
        bull: "A SOC 2-compliant, self-hosted Helm chart for banks spending ₹1.6 Crore a month on internal LLM agent workflows.",
        bear: "Enterprise sales means a nine-month procurement cycle unless you offer a one-line drop-in proxy.",
        judge: "Ship a one-line Python and TypeScript SDK proxy: client = CacheProxy(openai). Immediate traction.",
        conviction: "94%",
        ruling: "Strong buy: seed ready",
      },
    ],
  },
  health: {
    tab: "HealthTech",
    title: "Autonomous dental intake and triage",
    category: "HealthTech · voice AI agents",
    rounds: [
      {
        label: "Labor shortage vs patient trust",
        bull: "Dental clinics miss 35% of inbound calls at lunch and after 5 PM. A sub-400ms voice agent booking straight into Dentrix recovers about ₹6.5 Lakhs a month per clinic.",
        bear: "Patients hang up on robotic voices past 600ms, or if the agent misreads emergency symptoms like an abscess.",
        judge: "High urgency and clear ROI. Deploy a sub-400ms WebRTC voice stack with a strict human escalation fail-safe.",
        conviction: "88%",
        ruling: "Proceed with mandatory escalation safeguards",
      },
      {
        label: "Practice-software integration",
        bull: "At ₹32,000 a month per clinic, one root-canal booking worth ₹95,000 makes this a no-brainer.",
        bear: "Legacy dental software like Dentrix and Eaglesoft runs closed, on-premise Windows databases with no modern REST APIs.",
        judge: "Partner with dental EHR sync providers such as NexHealth or Curve Dental instead of reverse-engineering databases.",
        conviction: "84%",
        ruling: "Integrate through established sync APIs",
      },
      {
        label: "HIPAA and expansion",
        bull: "Once installed in 50 clinics, expand into orthodontics, chiropractic and veterinary practices.",
        bear: "One leak of patient records carries up to ₹40 Lakhs in statutory penalties.",
        judge: "Sign a BAA with HIPAA-compliant voice inference hosts. High venture upside.",
        conviction: "92%",
        ruling: "Approved for clinic pilot",
      },
    ],
  },
};

export function VcWarRoomSpotlight({ onCtaClick }) {
  const [topicKey, setTopicKey] = useState("saas");
  const [roundIdx, setRoundIdx] = useState(0);
  const [challenge, setChallenge] = useState(false);

  const topic = DEBATES[topicKey];
  const round = topic.rounds[roundIdx];

  return (
    <section id="vc-debate" className="hp hp-sec hp-dark">
      <div className="hp-wrap">
        <Head
          title="One AI flatters you. Three argue with you."
          lede="Single chatbots are built to agree. LaunchPilot sets three models against each other with opposing goals, so the weak points of your idea show up before your customers find them."
        />

        <div className="hp-trio">
          <Reveal className="hp-agent hp-agent--bull">
            <span className="hp-avatar">
              <TrendingUp size={18} />
            </span>
            <h3>Bull partner</h3>
            <p className="hp-model">Llama 3.3 70B · Groq</p>
            <p>Looks for the 100x wedge, the viral loop and the distribution advantage others miss.</p>
          </Reveal>
          <Reveal className="hp-agent hp-agent--judge" delay={80}>
            <span className="hp-avatar">
              <Scale size={18} />
            </span>
            <h3>Chief judge</h3>
            <p className="hp-model">Gemini 2.5 Flash · Google</p>
            <p>Weighs both sides and returns a ruling, a conviction score and the one experiment to run first.</p>
            <strong className="hp-agent-stat">{round.conviction} conviction</strong>
          </Reveal>
          <Reveal className="hp-agent hp-agent--bear" delay={160}>
            <span className="hp-avatar">
              <ShieldAlert size={18} />
            </span>
            <h3>Bear partner</h3>
            <p className="hp-model">DeepSeek V3 · OpenRouter</p>
            <p>Attacks acquisition cost, churn, incumbents and the assumption most likely to kill the business.</p>
          </Reveal>
        </div>

        <Reveal className="hp-console">
          <div className="hp-console-head">
            <div>
              <h3>{topic.title}</h3>
              <p>{topic.category}</p>
            </div>
            <div className="hp-seg hp-seg--dark" role="tablist" aria-label="Sample idea">
              {Object.entries(DEBATES).map(([key, d]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={topicKey === key}
                  className={topicKey === key ? "is-on" : ""}
                  onClick={() => {
                    setTopicKey(key);
                    setRoundIdx(0);
                    setChallenge(false);
                  }}
                >
                  {d.tab}
                </button>
              ))}
            </div>
          </div>

          <div className="hp-rounds" role="tablist" aria-label="Debate round">
            {topic.rounds.map((r, i) => (
              <button
                key={r.label}
                role="tab"
                aria-selected={roundIdx === i}
                className={roundIdx === i ? "is-on" : ""}
                onClick={() => setRoundIdx(i)}
              >
                <span>Round {i + 1}</span>
                {r.label}
              </button>
            ))}
          </div>

          <div key={`${topicKey}-${roundIdx}`} className="hp-thread">
            <article className="hp-msg hp-msg--bull">
              <header>
                <TrendingUp size={14} /> Bull partner
              </header>
              <p>“{round.bull}”</p>
            </article>
            <article className="hp-msg hp-msg--bear">
              <header>
                <ShieldAlert size={14} /> Bear partner
              </header>
              <p>“{round.bear}”</p>
            </article>
            <article className="hp-msg hp-msg--judge">
              <header>
                <Scale size={14} /> Chief judge
              </header>
              <p>“{round.judge}”</p>
              <div className="hp-verdict">
                <div className="hp-meter" aria-hidden="true">
                  <i style={{ width: round.conviction }} />
                </div>
                <span>
                  <b>{round.conviction}</b> {round.ruling}
                </span>
              </div>
            </article>
          </div>

          <div className="hp-challenge">
            <div>
              <b>Think the Bear is wrong?</b>
              <span>Try a founder rebuttal.</span>
            </div>
            <button type="button" onClick={() => setChallenge((v) => !v)} aria-expanded={challenge}>
              {challenge ? "Close rebuttal" : "Challenge the Bear"}
            </button>
          </div>
          {challenge && (
            <div className="hp-rebut">
              <p>
                <b>You</b> We counter churn by locking customers into annual prepay with a guaranteed 15% rate
                discount and automated quarterly audit re-runs.
              </p>
              <p>
                <b>Judge</b> Counter accepted. Annual contracts protect early cash flow and remove month-to-month
                cancellations. Conviction up 8%.
              </p>
            </div>
          )}

          <div className="hp-console-foot">
            <span>Want the committee to debate your idea?</span>
            <button type="button" className="hp-btn hp-btn--primary" onClick={onCtaClick}>
              Stress-test my idea <ArrowRight size={15} />
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Pipeline (scroll-linked timeline)                                */
/* ------------------------------------------------------------------ */
const STAGES = [
  {
    title: "Concept dissection and lean canvas",
    desc: "Breaks your raw concept into a nine-box business model and names the customer, the problem and the wedge.",
    icon: Lightbulb,
  },
  {
    title: "3-AI VC committee stress test",
    desc: "Bull and Bear debate your thesis while Gemini rules and scores conviction.",
    icon: Swords,
  },
  {
    title: "Demand check with The Mom Test",
    desc: "Writes unbiased interview questions, based on Rob Fitzpatrick’s framework, to test willingness to pay.",
    icon: Users,
  },
  {
    title: "Competitor vulnerability matrix",
    desc: "Finds the overlooked complaints and pricing flaws of direct and indirect rivals, and your angle against them.",
    icon: Search,
  },
  {
    title: "Unit economics and financial model",
    desc: "Models server and AI token costs, projects revenue at 100, 500 and 5,000 customers, and finds break-even.",
    icon: Wallet,
  },
  {
    title: "Go-to-market kit and PDF export",
    desc: "Outputs LinkedIn messages, a Reddit launch post, a 10-slide pitch deck and a formatted PDF.",
    icon: Rocket,
  },
];

export function PipelineWorkflowSection() {
  const listRef = useRef(null);
  const [reached, setReached] = useState(0);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.style.setProperty("--prog", "1");
      setReached(STAGES.length);
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.62 - r.top) / r.height));
      el.style.setProperty("--prog", p.toFixed(3));
      setReached(Math.min(STAGES.length, Math.floor(p * STAGES.length + 0.35) + (p > 0 ? 1 : 0)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="pipeline" className="hp hp-sec hp-soft">
      <div className="hp-wrap hp-pipe">
        <Reveal className="hp-pipe-intro">
          <h2 className="hp-h2 hp-h2--left">From a rough idea to a report you can act on.</h2>
          <p className="hp-lede">
            Six stages stream into one continuous report, so each analysis builds on the one before it.
          </p>
        </Reveal>

        <ol className="hp-tl" ref={listRef} style={{ "--prog": 0 }}>
          <span className="hp-tl-line" aria-hidden="true">
            <i />
          </span>
          {STAGES.map((s, i) => {
            const Icon = s.icon;
            return (
              <li key={s.title} className={`hp-step ${i < reached ? "is-lit" : ""}`}>
                <span className="hp-step-dot">
                  <Icon size={16} />
                </span>
                <div>
                  <small>Step {i + 1}</small>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Bento features                                                   */
/* ------------------------------------------------------------------ */
const AGENTS = [
  "Lean canvas strategist",
  "Bull partner",
  "Bear partner",
  "Chief judge",
  "Market sizing lead",
  "Mom Test lead",
  "SWOT strategist",
  "Competitor hunter",
  "Software architect",
  "CFO and unit economics",
  "Outreach copywriter",
  "YC pitch coach",
];

export function BentoFeatureGrid() {
  return (
    <section id="features" className="hp hp-sec">
      <div className="hp-wrap">
        <Head
          title="Everything from raw concept to investor deck."
          lede="Specialist reasoning, checked arithmetic, live market evidence, and code prompts to ship your MVP."
        />

        <div className="hp-bento">
          {/* Row 1: 12 Specialists + One Report */}
          <Reveal className="hp-tile hp-tile--agents hp-tile--dark">
            <h3>Twelve specialists, working in parallel.</h3>
            <p>
              Instead of one generalist model, a dedicated agent handles each part of the work, from market sizing
              to the pitch deck.
            </p>
            <ul>
              {AGENTS.map((a) => (
                <li key={a}>
                  <Check size={13} /> {a}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="hp-tile hp-tile--rail" delay={80}>
            <div className="hp-rail" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <i key={i} className={i === 2 ? "is-on" : ""} />
              ))}
            </div>
            <span className="hp-tile-icon">
              <Layers size={18} />
            </span>
            <h3>One report, one scroll.</h3>
            <p>A sticky section rail keeps you oriented as the analysis streams in.</p>
          </Reveal>

          {/* Row 2: Prompt Pack + Reddit Grounding */}
          <Reveal className="hp-tile hp-tile--half" delay={40}>
            <div className="hp-code-preview" aria-hidden="true">
              <header>
                <span>.cursorrules · Lovable Prompt</span>
                <span style={{ color: "#34d399", fontWeight: 700 }}>Ready to ship</span>
              </header>
              <div style={{ fontFamily: "monospace", color: "#cbd5e1", fontSize: "11px", lineHeight: "1.4" }}>
                <span style={{ color: "#38bdf8" }}># Architecture Specification</span><br />
                Stack: React 19, Tailwind, Supabase<br />
                P0 Features: 5 core workflows defined
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <span className="hp-tile-icon">
                <Code2 size={18} />
              </span>
              <span style={{ padding: "3px 8px", borderRadius: "999px", fontSize: "10.5px", fontWeight: 700, background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0" }}>
                All Tiers · Free
              </span>
            </div>
            <h3>1-Click Cursor, Lovable & Bolt Prompt Pack.</h3>
            <p>Bridges the chasm from blueprint to shipping code. Generates .cursorrules, Lovable kick-off prompts, and master specs in one click.</p>
          </Reveal>

          <Reveal className="hp-tile hp-tile--half" delay={80}>
            <div className="hp-reddit-preview" aria-hidden="true">
              <header>
                <span>r/startups · 142 upvotes</span>
                <span style={{ color: "#ea580c", fontWeight: 700 }}>Unmet Need</span>
              </header>
              <p>“Existing contract tools charge ₹2.5L/yr and take 3 months to onboard. We just need simple automated renewal alerts…”</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <span className="hp-tile-icon">
                <Globe size={18} />
              </span>
              <span style={{ padding: "3px 8px", borderRadius: "999px", fontSize: "10.5px", fontWeight: 700, background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa" }}>
                Scale Founder Exclusive
              </span>
            </div>
            <h3>Live Web & Reddit Complaint Grounding.</h3>
            <p>Scrapes real competitor pricing tiers and crawls Reddit threads (r/startups, r/SaaS) to find verified complaints and underserved wedges.</p>
          </Reveal>

          {/* Row 3: Public Pitch Links + Venture Comparison Duel */}
          <Reveal className="hp-tile hp-tile--half" delay={120}>
            <div className="hp-share-preview" aria-hidden="true">
              <span className="hp-share-url">launchpilot.ai/p/b2b-audit-89</span>
              <span className="hp-share-badge">
                <Check size={11} /> 89/100 Validated
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <span className="hp-tile-icon">
                <Share2 size={18} />
              </span>
              <span style={{ padding: "3px 8px", borderRadius: "999px", fontSize: "10.5px", fontWeight: 700, background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa" }}>
                Scale Founder Exclusive
              </span>
            </div>
            <h3>One-Click Shareable Public Pitch Links.</h3>
            <p>Publish an investor-ready read-only pitch page with a LaunchPilot verification watermark to share with angels, accelerators, or on X.</p>
          </Reveal>

          <Reveal className="hp-tile hp-tile--half" delay={160}>
            <div className="hp-duel-preview" aria-hidden="true">
              <div className="hp-duel-card">
                <b>Contract Auditor</b>
                <span>Score: <em>89</em> · 22 Mo</span>
                <span style={{ fontSize: "10px", color: "#059669", fontWeight: 700 }}>Recommended to build</span>
              </div>
              <div className="hp-duel-card">
                <b>Gym Stakes App</b>
                <span>Score: <em>78</em> · 45 Mo</span>
                <span style={{ fontSize: "10px", color: "#64748b" }}>Secondary project</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <span className="hp-tile-icon">
                <GitCompare size={18} />
              </span>
              <span style={{ padding: "3px 8px", borderRadius: "999px", fontSize: "10.5px", fontWeight: 700, background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa" }}>
                Scale Founder Exclusive
              </span>
            </div>
            <h3>Side-by-Side Venture Comparison Duel.</h3>
            <p>Compare two ventures head-to-head on Viability Score, break-even targets, and CAC risk. The AI co-founder rules which idea to build first.</p>
          </Reveal>

          {/* Row 4: Outreach, Chat & Vault */}
          <Reveal className="hp-tile" delay={0}>
            <div className="hp-sample">
              <b>Sample message</b>
              <p>Hi Sam, I noticed your team is scaling vendor spend. We built a quick audit that flags renewals…</p>
              <span>
                <Copy size={12} /> Copy
              </span>
            </div>
            <h3>Outreach, ready to send.</h3>
            <p>LinkedIn messages, cold emails and a Reddit launch post, one click to copy.</p>
          </Reveal>

          <Reveal className="hp-tile" delay={80}>
            <div className="hp-chat" aria-hidden="true">
              <span>Should I price at ₹3,999 or ₹6,999?</span>
              <span className="is-ai">At ₹6,999 your margin holds up with AI costs. Test ₹3,999 for a startup tier.</span>
            </div>
            <h3>Ask your co-founder.</h3>
            <p>Follow up on your blueprint: pivots, pricing, tech stack. It knows the whole report.</p>
          </Reveal>

          <Reveal className="hp-tile" delay={160}>
            <div className="hp-vault" aria-hidden="true">
              <span>
                <FolderKanban size={13} /> Contract auditor
              </span>
              <span>
                <FolderKanban size={13} /> Gym stakes app
              </span>
              <span>
                <FolderKanban size={13} /> Semantic cache
              </span>
            </div>
            <h3>A vault for every idea.</h3>
            <p>Past blueprints, SWOT matrices and dossiers sync across your devices with Appwrite.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 7. Comparison                                                       */
/* ------------------------------------------------------------------ */
export function ComparisonSection({ onCtaClick }) {
  const rows = [
    ["Time to a full validation", "3–6 months of building blind", "10 minutes of chat", "About 30 seconds"],
    ["Honest pushback", "Friends who don’t want to hurt you", "Polite, agreeable answers", "A Bull-vs-Bear investor debate"],
    ["Models used", "None", "One generalist model", "Three specialized models"],
    ["Market sizing", "Napkin guesses", "Top-down numbers with no sources", "Bottom-up TAM, SAM and SOM"],
    ["Customer discovery", "Leading questions", "Generic survey questions", "Mom Test interview scripts"],
    ["Financial model", "Spreadsheets you build yourself", "Advice with no real cost numbers", "Interactive costs, MRR and break-even"],
    ["Market Evidence Grounding", "Outdated Google results", "Static training data", "Live competitor pricing & Reddit complaint threads"],
    ["Code & MVP Launch Pack", "Start from blank prompt", "Vague code snippets", "1-Click Cursor, Lovable & Bolt Prompt Pack"],
    ["Export", "Scattered notes and docs", "Copied chat logs", "16-part PDF, pitch deck, Markdown"],
    ["Cost", "₹8–20 Lakhs in consulting", "₹1,600 a month, no structure", "Free demo on your device, from ₹129/mo"],
  ];
  return (
    <section id="compare" className="hp hp-sec hp-soft">
      <div className="hp-wrap">
        <Head
          title="Building blind, asking a chatbot, or testing properly."
          lede="How the three common ways of validating an idea compare."
        />
        <Reveal className="hp-table-wrap">
          <table className="hp-table">
            <thead>
              <tr>
                <th scope="col">What you get</th>
                <th scope="col">Building blind</th>
                <th scope="col">A generic chatbot</th>
                <th scope="col" className="is-us">
                  {BRAND}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([feat, a, b, c]) => (
                <tr key={feat}>
                  <th scope="row">{feat}</th>
                  <td>
                    <X size={14} className="no" />
                    {a}
                  </td>
                  <td>
                    <Minus size={14} className="meh" />
                    {b}
                  </td>
                  <td className="is-us">
                    <Check size={14} className="yes" />
                    {c}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
        <div className="hp-center">
          <button type="button" className="hp-btn hp-btn--primary" onClick={onCtaClick}>
            Try it free <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 8. Sample blueprints                                                */
/* ------------------------------------------------------------------ */
const SAMPLES = {
  b2b: {
    tab: "Enterprise B2B",
    category: "B2B SaaS · LegalTech",
    title: "AI contract and vendor audit platform",
    prompt:
      "An AI-powered B2B platform that audits enterprise vendor contracts, flags compliance risks, and benchmarks pricing automatically.",
    tam: "₹1.15 Lakh Cr",
    tamNote: "Global enterprise contract management",
    verdict: "Proceed. High enterprise urgency.",
    score: 89,
    action: "Cold email 30 procurement managers using the pre-generated LinkedIn query.",
  },
  consumer: {
    tab: "Consumer app",
    category: "Consumer mobile · Fitness",
    title: "Social accountability gym partner app",
    prompt:
      "A micro-community app that pairs solo lifters with matched gym accountability buddies with deposit-forfeit stakes.",
    tam: "₹34,000 Cr",
    tamNote: "Boutique fitness and accountability",
    verdict: "Proceed with caution. Focus on retention.",
    score: 78,
    action: "Validate with 15 university students using Mom Test questions before coding.",
  },
  devtool: {
    tab: "Developer infra",
    category: "Developer infra · LLM ops",
    title: "Sub-millisecond semantic vector cache",
    prompt:
      "A high-performance in-memory semantic cache for LLMs that cuts OpenAI and Anthropic token bills by 70% with sub-ms p99 latency.",
    tam: "₹56,000 Cr",
    tamNote: "AI infrastructure and middleware",
    verdict: "Strong proceed. Clear ROI wedge.",
    score: 92,
    action: "Publish an open-source benchmark repo on Hacker News to build a waitlist.",
  },
};

export function AudienceTabs({ onSelectTab }) {
  const [key, setKey] = useState("b2b");
  const s = SAMPLES[key];
  return (
    <section className="hp hp-sec">
      <div className="hp-wrap">
        <Head
          title="See what a blueprint uncovers."
          lede="Three sample ideas, three different markets. Switch between them to see how specific the output gets."
        />
        <div className="hp-center">
          <div className="hp-seg" role="tablist" aria-label="Sample idea">
            {Object.entries(SAMPLES).map(([k, v]) => (
              <button
                key={k}
                role="tab"
                aria-selected={key === k}
                className={key === k ? "is-on" : ""}
                onClick={() => setKey(k)}
              >
                {v.tab}
              </button>
            ))}
          </div>
        </div>

        <Reveal className="hp-sample-card">
          <div key={key} className="hp-sample-grid">
            <div>
              <p className="hp-muted">{s.category}</p>
              <h3>{s.title}</h3>
              <blockquote>“{s.prompt}”</blockquote>
            </div>
            <dl>
              <div>
                <dt>Market size</dt>
                <dd>{s.tam}</dd>
                <small>{s.tamNote}</small>
              </div>
              <div>
                <dt>Viability score</dt>
                <dd>
                  {s.score}
                  <em> / 100</em>
                </dd>
                <span className="hp-meter hp-meter--light" aria-hidden="true">
                  <i style={{ width: `${s.score}%` }} />
                </span>
              </div>
              <div className="hp-dl-wide">
                <dt>Verdict</dt>
                <dd className="hp-dd-sm">{s.verdict}</dd>
              </div>
            </dl>
          </div>
          <div className="hp-action">
            <div>
              <b>Week 1 action</b>
              <p>{s.action}</p>
            </div>
            <button type="button" className="hp-btn hp-btn--dark" onClick={() => onSelectTab?.(s.prompt)}>
              Test this concept <ArrowRight size={15} />
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 9. Testimonials                                                     */
/* ------------------------------------------------------------------ */
export function TestimonialsSection() {
  const items = [
    {
      quote:
        "The Bull and Bear debate shocked me. The Bear flagged the exact enterprise compliance hole a real angel investor had pointed out the week before.",
      name: "Alex V.",
      role: "Solo B2B SaaS founder",
      badge: "YC W25 applicant",
    },
    {
      quote:
        "The Mom Test questions alone saved me two months of building the wrong feature. They push you to look at real willingness to pay, not polite feedback.",
      name: "Priya S.",
      role: "AI product engineer",
      badge: "Hackathon winner",
    },
    {
      quote:
        "Architecture, cost estimates and launch copy in 30 seconds makes testing a weekend project actually viable.",
      name: "Marcus K.",
      role: "Full-stack dev and indie hacker",
      badge: "₹3.5L MRR, bootstrapped",
    },
  ];
  return (
    <section className="hp hp-sec hp-soft">
      <div className="hp-wrap">
        <Head title="Built for execution, not just conversation." />
        <div className="hp-quotes">
          {items.map((t, i) => (
            <Reveal as="figure" key={t.name} className="hp-quote" delay={i * 80}>
              <blockquote>“{t.quote}”</blockquote>
              <figcaption>
                <span className="hp-initial">{t.name[0]}</span>
                <div>
                  <b>{t.name}</b>
                  <small>{t.role}</small>
                </div>
                <em>{t.badge}</em>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 10. Pricing                                                         */
/* ------------------------------------------------------------------ */
export function PricingSection({ onSelectPlan }) {
  const free = [
    "1 full demo blueprint per device",
    "All 12 specialist AI co-founders",
    "Full 3-AI VC War Room debate",
    "1-Click Cursor, Lovable & Bolt Prompt Pack",
    "Bottom-up TAM, SAM and SOM sizing",
    "SWOT and competitor vulnerability matrix",
    "Unit economics and financial simulator",
    "Executive PDF and Markdown export",
  ];
  const starter = [
    "5 startup blueprints per week",
    "All 12 specialist AI co-founders",
    "Full 3-AI VC War Room debate",
    "1-Click Cursor, Lovable & Bolt Prompt Pack",
    "Priority AI response velocity",
    "Crisp, prediction-focused Co-Founder chat",
    "Full PDF and PRD dossier suite",
    "Project cloud vault sync",
  ];
  const scale = [
    "10 startup blueprints per week",
    "Live Web & Reddit Complaint Grounding (r/startups, r/SaaS)",
    "Public Shareable Pitch Links with Investor Mode",
    "Side-by-Side Venture Comparison Duel",
    "1-Click Cursor, Lovable & Bolt Prompt Pack",
    "Highest priority AI queue",
    "Unlimited VC War Room rebuttals",
    "Voucher code support (FOUNDER_PASS)",
  ];

  return (
    <section id="pricing" className="hp hp-sec">
      <div className="hp-wrap">
        <Head
          title="Try 1 demo blueprint free. Upgrade for weekly validation."
          lede="Experience the entire institutional AI pipeline on your device. Unlock 5 or 10 blueprints per week with instant UPI."
        />

        <div className="hp-plans" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          {/* Free Demo Plan */}
          <Reveal className="hp-plan">
            <header>
              <h3>Free Demo</h3>
              <p>Test your first idea with zero features hidden.</p>
            </header>
            <div className="hp-price">
              <strong>₹0</strong>
              <span>/ 1 idea per device</span>
            </div>
            <button type="button" className="hp-btn hp-btn--ghost" onClick={() => onSelectPlan?.("starter")}>
              Try Demo Blueprint
            </button>
            <ul>
              {free.map((f) => (
                <li key={f}>
                  <Check size={15} /> {f}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Starter Plan (₹129) */}
          <Reveal className="hp-plan hp-plan--pro" delay={100}>
            <header>
              <h3>
                Starter Founder <span>Popular</span>
              </h3>
              <p>For builders actively testing multiple venture angles.</p>
            </header>
            <div className="hp-price">
              <strong>₹129</strong>
              <span>/ month · 5 ideas/wk</span>
            </div>
            <button type="button" className="hp-btn hp-btn--primary" onClick={() => onSelectPlan?.("starter_129")}>
              <Zap size={15} />
              Unlock Starter (₹129)
            </button>
            <ul>
              {starter.map((f) => (
                <li key={f}>
                  <Check size={15} /> {f}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Scale Plan (₹299) */}
          <Reveal className="hp-plan" delay={200}>
            <header>
              <h3>Scale Founder</h3>
              <p>For serious founders and studios launching weekly.</p>
            </header>
            <div className="hp-price">
              <strong>₹299</strong>
              <span>/ month · 10 ideas/wk</span>
            </div>
            <button type="button" className="hp-btn hp-btn--ghost" onClick={() => onSelectPlan?.("scale_299")}>
              <Zap size={15} />
              Unlock Scale (₹299)
            </button>
            <ul>
              {scale.map((f) => (
                <li key={f}>
                  <Check size={15} /> {f}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 11. FAQ                                                             */
/* ------------------------------------------------------------------ */
export function FaqSection({ onCtaClick }) {
  const [open, setOpen] = useState(0);
  const faqs = [
    {
      q: `What makes ${BRAND} different from asking ChatGPT or Claude?`,
      a: "General chatbots tend to agree with you and give high-level summaries. LaunchPilot runs a multi-stage pipeline with a three-model VC debate (Llama 3.3 as Bull, DeepSeek V3 as Bear, Gemini 2.5 as Chief Judge) to expose fatal assumptions, calculate unit economics and write Mom Test interview questions.",
    },
    {
      q: "How does the 3-AI VC War Room work?",
      a: "The Bull argues why your idea could reach ₹800 Crore ARR. The Bear attacks acquisition costs, retention and incumbent retaliation. The Chief Judge returns a ruling and names the one experiment you should run first.",
    },
    {
      q: "How does the device quota and subscription work?",
      a: "Every device gets 1 complete demo blueprint for free with zero locked features. To validate multiple ideas, upgrade to Starter Founder (₹129/mo for 5 ideas/wk) or Scale Founder (₹299/mo for 10 ideas/wk plus live Reddit intelligence, public pitch links, and side-by-side venture comparisons). Instant UPI activation with Razorpay.",
    },
    {
      q: "Can I trust the market size numbers?",
      a: "They are bottom-up estimates built from industry benchmarks and comparable businesses. Treat them as a disciplined ballpark for accelerator applications, angel conversations and team alignment, then confirm with your own research.",
    },
    {
      q: "Can I download or share my blueprint?",
      a: "Yes. Every blueprint exports in one click as a formatted PDF or Markdown file, or you can generate a public read-only pitch link with an authentic viability watermark for investors.",
    },
  ];

  return (
    <section id="faq" className="hp hp-sec hp-soft">
      <div className="hp-wrap hp-wrap--narrow">
        <Head title="Questions, answered." />
        <div className="hp-faq">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className={`hp-faq-item ${isOpen ? "is-open" : ""}`}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                  >
                    <span>{f.q}</span>
                    <Plus size={18} />
                  </button>
                </h3>
                <div className="hp-faq-a" id={`faq-${i}`} role="region">
                  <div>
                    <p>{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="hp-center">
          <button type="button" className="hp-btn hp-btn--primary" onClick={onCtaClick}>
            Launch Studio <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 12. Final CTA                                                       */
/* ------------------------------------------------------------------ */
export function FinalCtaBanner({ onCtaClick }) {
  return (
    <section className="hp hp-final">
      <div className="hp-final-glow" aria-hidden="true" />
      <Reveal className="hp-wrap hp-final-inner">
        <h2 className="hp-h2">Test your idea before someone else tests it for you.</h2>
        <p className="hp-lede">
          Twelve AI specialists and a three-model investor committee, working on your idea in under 30 seconds.
        </p>
        <button type="button" className="hp-btn hp-btn--primary hp-btn--lg" onClick={onCtaClick}>
          <Zap size={16} />
          Validate your idea, free
          <ArrowRight size={16} />
        </button>
        <small>No credit card · 1 free demo blueprint · Instant UPI unlock</small>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 13. Footer                                                          */
/* ------------------------------------------------------------------ */
export function FullFooter() {
  return (
    <footer className="hp hp-foot">
      <div className="hp-wrap hp-foot-grid">
        <div>
          <div className="hp-brand">
            <span className="hp-brand-mark">
              <Rocket size={15} />
            </span>
            {BRAND}
          </div>
          <p>Autonomous startup copilot and 3-AI VC War Room.</p>
        </div>
        <nav aria-label="Product">
          <h4>Product</h4>
          <a href="#demo">Demo</a>
          <a href="#vc-debate">VC debate</a>
          <a href="#pipeline">How it works</a>
          <a href="#features">Features</a>
        </nav>
        <nav aria-label="Explore">
          <h4>Explore</h4>
          <a href="#compare">Compare</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </nav>
      </div>
      <div className="hp-wrap hp-foot-base">
        <span>© {new Date().getFullYear()} {BRAND}. Built for ambitious founders.</span>
      </div>
    </footer>
  );
}

/* Legacy exports kept so old imports don't break */
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
