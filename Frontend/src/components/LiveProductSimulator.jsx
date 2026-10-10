// components/LiveProductSimulator.jsx
// ---------------------------------------------------------------------------
// LaunchPilot — product window demo
// Drop-in replacement for the old LiveProductSimulator in MarketingSections.jsx.
// No Three.js. Same props: <LiveProductSimulator onCtaClick={...} />
// ---------------------------------------------------------------------------
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Swords,
  Target,
  Users,
  DollarSign,
  FileText,
  TrendingUp,
  ShieldAlert,
  Scale,
  Check,
  X,
  Rocket,
  Share2,
  ArrowRight,
} from "lucide-react";
import "./LiveProductSimulator.css";

/* ------------------------------------------------------------------ */
/* Small hooks                                                         */
/* ------------------------------------------------------------------ */
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Eases a number toward its new value (used for every live metric).
function useCountUp(value, duration = 750) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    if (prefersReducedMotion()) {
      fromRef.current = value;
      setDisplay(value);
      return;
    }
    const from = fromRef.current;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      const v = from + (value - from) * eased;
      fromRef.current = v;
      setDisplay(v);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return display;
}

function Num({ value, format }) {
  const v = useCountUp(value);
  return <>{format ? format(v) : Math.round(v).toLocaleString()}</>;
}

// Types text out so the judge's answer feels like it is being written.
function useTypewriter(text, step = 2, every = 16) {
  const [out, setOut] = useState(text);
  useEffect(() => {
    if (prefersReducedMotion()) {
      setOut(text);
      return;
    }
    setOut("");
    let i = 0;
    const id = setInterval(() => {
      i += step;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, every);
    return () => clearInterval(id);
  }, [text, step, every]);
  return out;
}

const pct = (v, min, max) => ((v - min) / (max - min)) * 100;

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */
const TABS = [
  { id: "debate", label: "VC debate", icon: Swords },
  { id: "tam", label: "Market size", icon: Target },
  { id: "momtest", label: "Customer interviews", icon: Users },
  { id: "financials", label: "Unit economics", icon: DollarSign },
  { id: "export", label: "Export", icon: FileText },
];

const BASE_CONVICTION = 77;
const DEFENSES = [
  {
    label: "Sell to small teams first",
    prompt:
      "Target startups with fewer than 50 employees first, so we skip corporate security reviews entirely.",
    judge:
      "Strong pivot. It cuts the sales cycle from about 120 days to about a week, because an ops lead can buy with a company card and no legal review.",
    delta: 9,
    verdict: "High-conviction wedge",
  },
  {
    label: "Run it locally in Docker",
    prompt:
      "Ship it as a local container with zero data retention, so contracts never leave the customer's firewall.",
    judge:
      "This removes the security objection at once. Pilots with large legal teams can start in weeks instead of quarters.",
    delta: 12,
    verdict: "Enterprise moat unlocked",
  },
  {
    label: "Partner with accounting firms",
    prompt:
      "Partner with startup CPAs and fractional CFOs, and let them offer the audit as part of their service.",
    judge:
      "A very high-leverage channel. It cuts customer acquisition cost by roughly 80% and gives you distribution people already trust.",
    delta: 14,
    verdict: "Unfair distribution channel",
  },
];

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */
function Gauge({ value }) {
  const R = 44;
  const C = 2 * Math.PI * R;
  return (
    <div className="lps-gauge" role="img" aria-label={`Net conviction ${value} out of 100`}>
      <svg viewBox="0 0 108 108" aria-hidden="true">
        <defs>
          <linearGradient id="lpsGaugeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fdba74" />
            <stop offset="1" stopColor="#f97316" />
          </linearGradient>
        </defs>
        <circle cx="54" cy="54" r={R} className="lps-gauge-track" />
        <circle
          cx="54"
          cy="54"
          r={R}
          className="lps-gauge-bar"
          style={{ strokeDasharray: C, strokeDashoffset: C * (1 - value / 100) }}
        />
      </svg>
      <div className="lps-gauge-label">
        <strong>
          <Num value={value} />
        </strong>
        <span>Net conviction</span>
      </div>
    </div>
  );
}

function Slider({ label, valueLabel, min, max, step, value, onChange }) {
  return (
    <label className="lps-slider">
      <span className="lps-slider-top">
        <span>{label}</span>
        <strong>{valueLabel}</strong>
      </span>
      <input
        type="range"
        className="lps-range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ "--fill": `${pct(value, min, max)}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */
export function LiveProductSimulator({ onCtaClick }) {
  const [activeTab, setActiveTab] = useState("debate");
  const [defenseIndex, setDefenseIndex] = useState(0);

  // Market size
  const [accounts, setAccounts] = useState(3500);
  const [acv, setAcv] = useState(8000);
  const som = Math.round((accounts * acv) / 1e6); // $M
  const sam = Math.round(som * 8.2); // $M
  const tam = (sam * 5.1) / 1000; // $B

  // Unit economics
  const [customers, setCustomers] = useState(500);
  const [price, setPrice] = useState(89);
  const aiCostPerCustomer = 11;
  const fixedInfra = 800;
  const mrr = customers * price;
  const cost = customers * aiCostPerCustomer + fixedInfra;
  const profit = mrr - cost;
  const margin = Math.round((profit / mrr) * 100);
  const breakEven = Math.ceil(fixedInfra / (price - aiCostPerCustomer));
  const costShare = Math.min(100, Math.max(0, (cost / mrr) * 100));

  // Interview tracker
  const [paid, setPaid] = useState([true, true, true, false, false]);
  const paidCount = paid.filter(Boolean).length;

  const defense = DEFENSES[defenseIndex];
  const score = BASE_CONVICTION + defense.delta;
  const typedJudge = useTypewriter(defense.judge);

  /* ---- scroll-driven rise + pointer tilt (written straight to CSS vars) ---- */
  const sectionRef = useRef(null);
  const tiltRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.style.setProperty("--p", "1");
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, 1 - (r.top - vh * 0.12) / (vh * 0.7)));
      el.style.setProperty("--p", p.toFixed(3));
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

  const onPointerMove = (e) => {
    if (e.pointerType !== "mouse" || prefersReducedMotion()) return;
    const el = tiltRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${((0.5 - py) * 4).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${((px - 0.5) * 5).toFixed(2)}deg`);
    el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
  };
  const onPointerLeave = () => {
    const el = tiltRef.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  /* ---- sliding tab pill ---- */
  const tabRefs = useRef({});
  const scrollerRef = useRef(null);
  const [pill, setPill] = useState({ x: 0, w: 0, ready: false });

  useLayoutEffect(() => {
    const measure = () => {
      const el = tabRefs.current[activeTab];
      if (!el) return;
      setPill({ x: el.offsetLeft, w: el.offsetWidth, ready: true });
      const sc = scrollerRef.current;
      if (sc && sc.scrollWidth > sc.clientWidth) {
        sc.scrollTo({
          left: el.offsetLeft + el.offsetWidth / 2 - sc.clientWidth / 2,
          behavior: "smooth",
        });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeTab]);

  const onTabKey = (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const i = TABS.findIndex((t) => t.id === activeTab);
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const next = TABS[(i + dir + TABS.length) % TABS.length];
    setActiveTab(next.id);
    tabRefs.current[next.id]?.focus();
  };

  return (
    <section id="demo" className="lps" ref={sectionRef} style={{ "--p": 1 }}>
      <div className="lps-inner">
        <header className="lps-head">
          <h2>See what a validated idea looks like.</h2>
          <p>
            This is a sample report for a contract-audit startup. Argue with the investors,
            resize the market, and change the numbers. Everything updates as you go.
          </p>
        </header>

        <div className="lps-rise">
          <div className="lps-frame">
            <div
              className="lps-tilt"
              ref={tiltRef}
              onPointerMove={onPointerMove}
              onPointerLeave={onPointerLeave}
            >
              <div className="lps-window">
                <div className="lps-sheen" aria-hidden="true" />

                {/* Title bar */}
                <div className="lps-titlebar">
                  <div className="lps-lights" aria-hidden="true">
                    <i /> <i /> <i />
                  </div>
                  <div className="lps-title">LaunchPilot · Contract &amp; vendor auditor</div>
                  <div className="lps-title-end">Sample report</div>
                </div>

                {/* Tabs */}
                <div className="lps-tabbar">
                  <div className="lps-tabscroll" ref={scrollerRef}>
                    <div className="lps-tablist" role="tablist" aria-label="Report sections" onKeyDown={onTabKey}>
                      <span
                        className={`lps-pill ${pill.ready ? "is-ready" : ""}`}
                        style={{ transform: `translateX(${pill.x}px)`, width: pill.w }}
                        aria-hidden="true"
                      />
                      {TABS.map((t) => {
                        const Icon = t.icon;
                        const on = activeTab === t.id;
                        return (
                          <button
                            key={t.id}
                            ref={(n) => (tabRefs.current[t.id] = n)}
                            role="tab"
                            id={`lps-tab-${t.id}`}
                            aria-selected={on}
                            aria-controls="lps-panel"
                            tabIndex={on ? 0 : -1}
                            className={`lps-tab ${on ? "is-on" : ""}`}
                            onClick={() => setActiveTab(t.id)}
                          >
                            <Icon size={15} strokeWidth={2} />
                            <span>{t.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Stage */}
                <div className="lps-stage">
                  <div key={activeTab} className="lps-panel" id="lps-panel" role="tabpanel" aria-labelledby={`lps-tab-${activeTab}`}>
                    {/* ---------------- VC DEBATE ---------------- */}
                    {activeTab === "debate" && (
                      <div className="lps-stack">
                        <div className="lps-card lps-verdict">
                          <div>
                            <p className="lps-kicker">
                              <Scale size={14} /> Judge’s ruling
                            </p>
                            <h3 key={defenseIndex} className="lps-verdict-title">
                              {defense.verdict}
                            </h3>
                            <p className="lps-muted lps-verdict-copy">
                              Buyers feel the pain right away: one audit can save $20k or more a year. The
                              Bear’s main worry is real, though. Procurement can stretch a sale to 3–6 months.
                            </p>
                          </div>
                          <Gauge value={score} />
                        </div>

                        <div className="lps-two">
                          <article className="lps-card lps-agent lps-agent--bull">
                            <header>
                              <span className="lps-avatar">
                                <TrendingUp size={17} />
                              </span>
                              <div>
                                <h4>Bull partner</h4>
                                <p>Llama 3.3 70B · Groq</p>
                              </div>
                              <span className="lps-chip">91% convinced</span>
                            </header>
                            <h5>Painful, unmonitored auto-renewals</h5>
                            <blockquote>
                              “Mid-market CFOs lose $40k–$150k a year to stealth renewals and unbenchmarked
                              seat tiers. A tool that parses PDFs, pulls out contract dates, and flags 25%
                              price gaps pays for itself in week one.”
                            </blockquote>
                            <footer>
                              <b>Wedge</b> One-click Google Drive and Slack connector with an instant audit report.
                            </footer>
                          </article>

                          <article className="lps-card lps-agent lps-agent--bear">
                            <header>
                              <span className="lps-avatar">
                                <ShieldAlert size={17} />
                              </span>
                              <div>
                                <h4>Bear partner</h4>
                                <p>DeepSeek V3 · OpenRouter</p>
                              </div>
                              <span className="lps-chip">84% skeptical</span>
                            </header>
                            <h5>Security reviews and procurement gates</h5>
                            <blockquote>
                              “Legal teams won’t upload confidential vendor contracts to a young startup
                              without SOC 2 Type II and custom data agreements. Your acquisition cost explodes
                              unless you offer self-hosting or zero data retention.”
                            </blockquote>
                            <footer>
                              <b>Trap</b> Six-month enterprise sales cycles drain an early runway.
                            </footer>
                          </article>
                        </div>

                        <div className="lps-card lps-defense">
                          <div className="lps-defense-head">
                            <div>
                              <h4>Defend your idea</h4>
                              <p className="lps-muted">Pick a counter-argument and see how the judge scores it.</p>
                            </div>
                            <span className="lps-delta" key={`d-${defenseIndex}`}>
                              +{defense.delta} conviction
                            </span>
                          </div>

                          <div className="lps-options" role="radiogroup" aria-label="Founder defense">
                            {DEFENSES.map((d, i) => (
                              <button
                                key={d.label}
                                role="radio"
                                aria-checked={defenseIndex === i}
                                className={`lps-option ${defenseIndex === i ? "is-on" : ""}`}
                                onClick={() => setDefenseIndex(i)}
                              >
                                {d.label}
                              </button>
                            ))}
                          </div>

                          <p className="lps-founder">
                            <span>You</span>
                            {defense.prompt}
                          </p>
                          <div className="lps-judge">
                            <span>Judge · Gemini 2.5 Flash</span>
                            <div className="lps-typed-wrap">
                              <p className="lps-ghost" aria-hidden="true">
                                {defense.judge}
                              </p>
                              <p className="lps-typed" aria-live="polite">
                                {typedJudge}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ---------------- MARKET SIZE ---------------- */}
                    {activeTab === "tam" && (
                      <div className="lps-stack">
                        <div className="lps-section-title">
                          <h3>Market size, built from the bottom up</h3>
                          <p className="lps-muted">
                            Start with how many companies you can reach and what each one pays. The rest follows.
                          </p>
                        </div>

                        <div className="lps-card lps-controls">
                          <Slider
                            label="Companies you can sell to"
                            valueLabel={`${accounts.toLocaleString()} accounts`}
                            min={1000}
                            max={20000}
                            step={500}
                            value={accounts}
                            onChange={setAccounts}
                          />
                          <Slider
                            label="Average yearly contract"
                            valueLabel={`$${acv.toLocaleString()} / year`}
                            min={2000}
                            max={25000}
                            step={1000}
                            value={acv}
                            onChange={setAcv}
                          />
                        </div>

                        <div className="lps-funnel">
                          <div className="lps-tier">
                            <div className="lps-tier-top">
                              <span>Total market</span>
                              <strong>
                                $<Num value={tam} format={(v) => v.toFixed(1)} />B
                              </strong>
                            </div>
                            <div className="lps-bar">
                              <i style={{ width: "100%" }} />
                            </div>
                            <p>Contract management and procurement automation, worldwide.</p>
                          </div>
                          <div className="lps-tier">
                            <div className="lps-tier-top">
                              <span>Reachable market</span>
                              <strong>
                                $<Num value={sam} />M
                              </strong>
                            </div>
                            <div className="lps-bar">
                              <i style={{ width: "58%" }} />
                            </div>
                            <p>Tech and professional-services firms with 50–500 people in the US, UK and EU.</p>
                          </div>
                          <div className="lps-tier lps-tier--hero">
                            <div className="lps-tier-top">
                              <span>What you can win in 3 years</span>
                              <strong>
                                $<Num value={som} />M
                              </strong>
                            </div>
                            <div className="lps-bar">
                              <i style={{ width: "24%" }} />
                            </div>
                            <p>
                              {accounts.toLocaleString()} companies at ${acv.toLocaleString()} a year, within 36
                              months of launch.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ---------------- INTERVIEWS ---------------- */}
                    {activeTab === "momtest" && (
                      <div className="lps-stack">
                        <div className="lps-section-title">
                          <h3>Interview questions that get honest answers</h3>
                          <p className="lps-muted">
                            Never ask whether someone likes your idea. Ask how they spend time and money today.
                          </p>
                        </div>

                        <div className="lps-two">
                          <div className="lps-card lps-qs lps-qs--bad">
                            <h4>
                              <X size={16} /> Questions people lie to
                            </h4>
                            <ul>
                              <li>“Would you pay $99 a month for an AI tool that audits your contracts?”</li>
                              <li>“Do you think contract auto-renewals are a big problem?”</li>
                              <li>“If we built this, would you join the beta?”</li>
                              <li>“Isn’t software pricing getting out of hand?”</li>
                            </ul>
                          </div>
                          <div className="lps-card lps-qs lps-qs--good">
                            <h4>
                              <Check size={16} /> Questions that reveal the truth
                            </h4>
                            <ul>
                              <li>“When did you last pay for a vendor renewal you didn’t expect?”</li>
                              <li>“Walk me through how you track vendor agreements today.”</li>
                              <li>“What software did you buy this quarter, and who approved the budget?”</li>
                              <li>“What have you already tried, and why didn’t it work?”</li>
                            </ul>
                          </div>
                        </div>

                        <div className="lps-card lps-tracker">
                          <div>
                            <h4>Run five interviews</h4>
                            <p className="lps-muted">
                              Tap each person who paid to solve this in the last 60 days. Three or more means the
                              problem is real.
                            </p>
                          </div>
                          <div className="lps-tracker-side">
                            <div className="lps-dots">
                              {paid.map((on, i) => (
                                <button
                                  key={i}
                                  className={`lps-dot ${on ? "is-on" : ""}`}
                                  aria-pressed={on}
                                  aria-label={`Interview ${i + 1}: ${on ? "paid" : "has not paid"}`}
                                  onClick={() => setPaid((p) => p.map((v, j) => (j === i ? !v : v)))}
                                >
                                  {on ? <Check size={15} strokeWidth={3} /> : i + 1}
                                </button>
                              ))}
                            </div>
                            <p className={`lps-signal ${paidCount >= 3 ? "is-good" : "is-weak"}`}>
                              {paidCount >= 3
                                ? `${paidCount} of 5 paid. Strong signal.`
                                : `${paidCount} of 5 paid. Rework your pitch.`}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ---------------- UNIT ECONOMICS ---------------- */}
                    {activeTab === "financials" && (
                      <div className="lps-stack">
                        <div className="lps-econ-head">
                          <div className="lps-section-title">
                            <h3>Unit economics</h3>
                            <p className="lps-muted">Revenue, AI and server costs, and margin at any scale.</p>
                          </div>
                          <div className="lps-seg" role="radiogroup" aria-label="Plan price">
                            {[49, 89, 199].map((p) => (
                              <button
                                key={p}
                                role="radio"
                                aria-checked={price === p}
                                className={price === p ? "is-on" : ""}
                                onClick={() => setPrice(p)}
                              >
                                ${p}/mo
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="lps-card lps-controls lps-controls--one">
                          <Slider
                            label="Paying customers"
                            valueLabel={`${customers.toLocaleString()} accounts`}
                            min={50}
                            max={3000}
                            step={50}
                            value={customers}
                            onChange={setCustomers}
                          />
                        </div>

                        <div className="lps-metrics">
                          <div className="lps-metric">
                            <span>Monthly revenue</span>
                            <strong className="is-green">
                              $<Num value={mrr} />
                            </strong>
                            <em>at ${price} a month</em>
                          </div>
                          <div className="lps-metric">
                            <span>Yearly run rate</span>
                            <strong>
                              $<Num value={mrr * 12} />
                            </strong>
                            <em>if you hold this scale</em>
                          </div>
                          <div className="lps-metric">
                            <span>Monthly costs</span>
                            <strong className="is-rose">
                              $<Num value={cost} />
                            </strong>
                            <em>${aiCostPerCustomer} per user + servers</em>
                          </div>
                          <div className="lps-metric lps-metric--hero">
                            <span>Gross margin</span>
                            <strong>
                              <Num value={margin} />%
                            </strong>
                            <em>
                              $<Num value={profit} /> a month profit
                            </em>
                          </div>
                        </div>

                        <div className="lps-card lps-split-card">
                          <div className="lps-split" aria-hidden="true">
                            <i className="cost" style={{ width: `${costShare}%` }} />
                            <i className="profit" style={{ width: `${100 - costShare}%` }} />
                          </div>
                          <div className="lps-split-legend">
                            <span>
                              <b className="cost" /> Costs
                            </span>
                            <span>
                              <b className="profit" /> Profit
                            </span>
                            <p>
                              You break even at <strong>{breakEven} paying accounts</strong>.{" "}
                              {customers >= breakEven
                                ? `At ${customers.toLocaleString()}, you are ${(customers - breakEven).toLocaleString()} past it.`
                                : "You are below that today."}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ---------------- EXPORT ---------------- */}
                    {activeTab === "export" && (
                      <div className="lps-stack">
                        <div className="lps-section-title">
                          <h3>Everything in one 16-part report</h3>
                          <p className="lps-muted">Download it as a PDF, Markdown or JSON, then share it with your team.</p>
                        </div>
                        <div className="lps-three">
                          <div className="lps-card lps-doc">
                            <span className="lps-doc-icon">
                              <FileText size={18} />
                            </span>
                            <h4>Product requirements</h4>
                            <p>Problem, target users, MVP scope, what you won’t build, and a four-week roadmap.</p>
                          </div>
                          <div className="lps-card lps-doc">
                            <span className="lps-doc-icon">
                              <Rocket size={18} />
                            </span>
                            <h4>10-slide pitch deck</h4>
                            <p>Problem, solution, market size, advantage, business model and the ask.</p>
                          </div>
                          <div className="lps-card lps-doc">
                            <span className="lps-doc-icon">
                              <Share2 size={18} />
                            </span>
                            <h4>Outreach drafts</h4>
                            <p>LinkedIn messages, a Reddit launch post and founder emails, ready to send.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer bar */}
                <div className="lps-footer">
                  <p>Built by 12 specialist AI agents working in parallel.</p>
                  <button className="lps-cta" onClick={onCtaClick}>
                    <span>Test your own idea</span>
                    <ArrowRight size={16} strokeWidth={2.4} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LiveProductSimulator;
