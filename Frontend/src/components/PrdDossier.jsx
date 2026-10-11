// PrdDossier.jsx
// ---------------------------------------------------------------------------
// Drop-in replacement for ChatPrdDossierView (same props). Also contains the
// restyled swipe file (replaces FounderPalSwipeFile for this view).
// Reuses: Reveal (Phase2), ViabilityBreakdown (Phase7), UpmetricsFinancialSimulator
// (Phase5), MetricRow + MilestoneTimeline (Phase6), SwotAnalysisMatrix (existing,
// now returning SwotView).
// ---------------------------------------------------------------------------
import { memo, useEffect, useMemo, useState } from "react";
import { Check, Copy, Cpu, DollarSign, LayoutGrid, TrendingUp } from "lucide-react";
import { Reveal } from "./BlueprintPhase2.jsx";
import { ViabilityBreakdown } from "./BlueprintPhase7.jsx";
import { UpmetricsFinancialSimulator } from "./BlueprintPhase5.jsx";
import { MetricRow, MilestoneTimeline } from "./BlueprintPhase6.jsx";
import { SwotAnalysisMatrix } from "./CompetitorUpgrades.jsx";
import "./studio.css";

const str = (v, fb = "") => {
  if (v === null || v === undefined) return fb;
  if (typeof v === "string") return v.trim() || fb;
  if (typeof v === "number") return String(v);
  if (Array.isArray(v)) return v.map((x) => str(x)).filter(Boolean).join(", ") || fb;
  if (typeof v === "object") return str(v.text || v.title || v.name || v.description || Object.values(v)[0], fb);
  return String(v);
};
const arr = (v) => (Array.isArray(v) ? v.map((x) => str(x)).filter(Boolean) : []);
const score = (v, fb) => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").match(/\d+(\.\d+)?/)?.[0]);
  return Math.max(0, Math.min(100, Number.isFinite(n) ? n : fb));
};

const TOC = [
  { id: "summary", label: "Executive brief" },
  { id: "viability", label: "Viability and SWOT" },
  { id: "market", label: "Market and competitors" },
  { id: "persona", label: "Customers" },
  { id: "product", label: "Product requirements" },
  { id: "tech", label: "Technical architecture" },
  { id: "financials", label: "Unit economics" },
  { id: "gtm", label: "Go-to-market" },
  { id: "roadmap", label: "Launch roadmap" },
];

function Section({ id, n, title, lede, children }) {
  return (
    <Reveal as="section" id={id} className="pr-sec">
      <header>
        <span>{String(n).padStart(2, "0")}</span>
        <h3>{title}</h3>
        {lede && <p>{lede}</p>}
      </header>
      {children}
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* Swipe file                                                          */
/* ------------------------------------------------------------------ */
export const SwipeFile = memo(function SwipeFile({ gtm, pitch, onToast }) {
  const [tab, setTab] = useState("email");
  const [copied, setCopied] = useState(null);
  const aud = gtm?.targetAudience || "your workflow";

  const T = useMemo(
    () => ({
      email: {
        title: "Cold email",
        tag: "Direct response",
        subject: `Quick question regarding ${aud}`,
        body:
          str(gtm?.coldEmailTemplate) ||
          `Hi {{FirstName}},\n\nSaw your work at {{Company}} and noticed how teams in {{Industry}} struggle with ${aud}.\n\nWe built a solution that handles this end to end, cutting execution time by 80% without added headcount.\n\nWould you be open to a 5-minute Loom preview this Thursday?\n\nBest,\n[Your name]`,
        tip: "Send Tuesday or Thursday, 8:30 to 10:00 in the prospect’s local time.",
      },
      dm: {
        title: "LinkedIn DM",
        tag: "Founder to founder",
        body:
          str(gtm?.linkedInDmTemplate) ||
          `Hey {{FirstName}}, loved your recent post on {{Topic}}. I’m building an AI co-pilot for {{Role}}s to solve ${aud}. Could I share early access and get your honest feedback? It takes 3 minutes.`,
        tip: "Stay under 300 characters so it fits in a mobile notification.",
      },
      reddit: {
        title: "Reddit post",
        tag: "Community value drop",
        subject: `I spent 30 days building a tool to fix ${aud} [free beta]`,
        body:
          str(gtm?.redditLaunchPost) ||
          `Hey r/startups,\n\nLike many of you, I was sick of losing 15+ hours a week on repetitive setup.\n\nSo I built a lightweight tool that does it in 60 seconds.\n\nWhat I learned building it:\n1. Keep cloud costs under $10/mo\n2. Automate the boring setup first\n3. Talk to 20 users before writing complex code\n\nTry it free: [Link]. Roast my landing page.`,
        tip: "Post to r/SaaS, r/startups or r/SideProject with real founder-journey context.",
      },
      twitter: {
        title: "X thread",
        tag: "Viral hook",
        body:
          str(gtm?.twitterLaunchPost) ||
          `Most founders waste 40 hours on tasks AI can do in 30 seconds.\n\nHere is the exact blueprint I used to automate ${aud} from scratch 🧵👇`,
        tip: "Add a 5-second screen recording to the hook tweet for far higher reach.",
      },
      pitch: {
        title: "60-second pitch",
        tag: "Demo day",
        body: str(pitch?.elevatorPitch) || "We help founders validate, architect and launch high-conviction startups in 90 seconds instead of 6 months.",
        tip: "Deliver in under 45 seconds to leave room for partner questions.",
      },
    }),
    [gtm, pitch, aud]
  );

  const cur = T[tab];
  const copy = (text, label) => {
    navigator.clipboard?.writeText(text);
    onToast?.(`${label} copied to clipboard`);
    setCopied(label);
    setTimeout(() => setCopied(null), 1600);
  };

  return (
    <div className="pr-swipe">
      <div className="hp-seg pr-seg" role="tablist">
        {Object.entries(T).map(([id, t]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? "is-on" : ""} onClick={() => setTab(id)}>
            {t.title}
          </button>
        ))}
      </div>

      <div key={tab} className="pr-swipe-card bp-fade">
        <div className="pr-swipe-top">
          <span className="bp-chip">
            <i />
            {cur.tag}
          </span>
          <small>
            {cur.body.length} characters · about {Math.max(1, Math.ceil(cur.body.split(/\s+/).length / 200))} min read
          </small>
        </div>

        {cur.subject && (
          <div className="pr-subject">
            <div>
              <small>Subject line</small>
              <b>{cur.subject}</b>
            </div>
            <button type="button" onClick={() => copy(cur.subject, "Subject line")}>
              {copied === "Subject line" ? <Check size={14} /> : <Copy size={14} />} Copy
            </button>
          </div>
        )}

        <pre>{cur.body}</pre>

        <div className="pr-swipe-foot">
          <p>
            <b>Founder tip</b> {cur.tip}
          </p>
          <button
            type="button"
            className="hp-btn hp-btn--dark hp-btn--sm"
            onClick={() => copy(cur.subject ? `Subject: ${cur.subject}\n\n${cur.body}` : cur.body, cur.title)}
          >
            {copied === cur.title ? <Check size={14} /> : <Copy size={14} />} Copy {cur.title.toLowerCase()}
          </button>
        </div>
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Dossier                                                             */
/* ------------------------------------------------------------------ */
export const PrdDossier = memo(function PrdDossier({ blueprint, originalIdea, onSwitchToDashboard, onToast }) {
  const {
    ideaAnalysis,
    marketResearch,
    customerPersona,
    productPlan,
    technicalArchitecture,
    businessStrategy,
    pitch,
    roadmap,
    goToMarket,
    costEstimator,
    revenueSimulator,
    competitorWeaknessAnalysis,
    viabilityScorecard,
  } = blueprint || {};

  const [active, setActive] = useState("summary");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const els = TOC.map((t) => document.getElementById(t.id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-18% 0px -68% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const jump = (id) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const copyFullPrd = () => {
    const text = `# Executive PRD and Startup Blueprint: ${pitch?.elevatorPitch || originalIdea}

## 1. Problem statement
${ideaAnalysis?.problem || originalIdea}

## 2. Target market and user persona
${customerPersona?.targetUsers?.join(", ") || "Target founders"}
Pain points: ${customerPersona?.painPoints?.join("; ") || "Identified"}

## 3. Product specification (MVP)
${productPlan?.mvpFeatures?.map((f) => `- ${f}`).join("\n") || "Core features"}

## 4. Technical architecture
- Frontend: ${technicalArchitecture?.frontend || "React / Vite"}
- Backend: ${technicalArchitecture?.backend || "Node / Express"}
- Database: ${technicalArchitecture?.database || "PostgreSQL / Supabase"}
- Hosting: ${technicalArchitecture?.hosting || "Vercel"}

## 5. Financial and unit economics
- Monthly burn: ${costEstimator?.estimatedMonthlyCost || "$0"}
- Pricing model: ${businessStrategy?.pricingIdea || "SaaS subscription"}`;
    navigator.clipboard?.writeText(text);
    onToast?.("Full PRD copied as Markdown");
  };

  const milestones = (roadmap?.milestones || []).map((m, i) => ({
    title: str(m.title || m.phase, `Milestone ${i + 1}`),
    week: str(m.week, `Sprint ${i + 1}`),
    tasks: arr(m.tasks),
  }));

  const competitorsList = useMemo(() => arr(marketResearch?.competitors), [marketResearch?.competitors]);
  const competitorCards = useMemo(() => {
    const raw = Array.isArray(competitorWeaknessAnalysis)
      ? competitorWeaknessAnalysis
      : competitorWeaknessAnalysis && typeof competitorWeaknessAnalysis === "object"
      ? Object.values(competitorWeaknessAnalysis)
      : [];
    if (raw.length > 0) {
      return raw.map((c) => ({
        name: str(c?.competitor || c?.name, "Market Competitor"),
        offering: str(
          c?.offering || c?.description || c?.provides,
          "Established market tool providing legacy domain workflows."
        ),
        disadvantage: str(
          c?.weaknesses || c?.weakness,
          "Clunky user interface, high monthly pricing, and slow customer support."
        ),
        wedge: str(
          c?.suggestedDifferentiation || c?.differentiation,
          "Deliver an intuitive, modern AI-first solution that gets the job done faster at lower cost."
        ),
      }));
    }
    return competitorsList.map((comp) => ({
      name: str(comp, "Market Competitor"),
      offering: `Legacy incumbent providing manual software and complex workflows in this space.`,
      disadvantage: "High subscription cost, clunky onboarding, and slow iteration velocity.",
      wedge: `Deliver a streamlined modern experience that solves the exact problem faster than ${comp}.`,
    }));
  }, [competitorWeaknessAnalysis, competitorsList]);

  const risks = arr(viabilityScorecard?.fatalRiskTraps);

  return (
    <div className="pr">
      <Reveal as="header" className="pr-top">
        <div>
          <span className="bp-chip">
            <i />
            Product requirements document
          </span>
          <h2>One document for founders, engineers and investors.</h2>
          <p>Everything about this venture in a single continuous read. Copy it, share it, or go back to the dashboard.</p>
        </div>
        <div className="pr-top-actions">
          <button type="button" className="hp-btn hp-btn--ghost" onClick={copyFullPrd}>
            <Copy size={15} /> Copy PRD
          </button>
          <button type="button" className="hp-btn hp-btn--primary" onClick={onSwitchToDashboard}>
            <LayoutGrid size={15} /> Dashboard view
          </button>
        </div>
      </Reveal>

      <div className="pr-layout">
        <nav className="pr-toc" aria-label="Document outline">
          <p>On this page</p>
          <ol>
            {TOC.map((t, i) => (
              <li key={t.id} className={active === t.id ? "is-active" : ""}>
                <button type="button" onClick={() => jump(t.id)}>
                  <em>{String(i + 1).padStart(2, "0")}</em>
                  {t.label}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <main className="pr-doc">
          <Section id="summary" n={1} title={str(pitch?.elevatorPitch, originalIdea)}>
            <p className="pr-lede">{str(pitch?.executiveSummary, ideaAnalysis?.problem)}</p>
            <dl className="pr-facts">
              <div>
                <dt>Target domain</dt>
                <dd>{str(ideaAnalysis?.domain, "B2B SaaS")}</dd>
              </div>
              <div>
                <dt>Runway feasibility</dt>
                <dd className="is-green">{str(ideaAnalysis?.feasibility, "High potential")}</dd>
              </div>
              <div>
                <dt>Estimated monthly burn</dt>
                <dd className="is-accent">{str(costEstimator?.estimatedMonthlyCost, "$0")}</dd>
              </div>
            </dl>
          </Section>

          <Section id="viability" n={2} title="Viability and SWOT" lede="How strong the idea is, and where it is exposed.">
            <ViabilityBreakdown
              score={score(viabilityScorecard?.score, 84)}
              verdict={str(viabilityScorecard?.verdict, "Proceed")}
              thesis={str(viabilityScorecard?.verdictReasoning, "Strong product-market alignment with manageable technical complexity.")}
              risks={risks.length ? risks : ["Underestimating customer acquisition cost.", "Over-building before 10 paying pilot users.", "Relying on a generic AI wrapper with no workflow moat."]}
              pillars={[
                { icon: TrendingUp, label: "Market demand", value: score(viabilityScorecard?.marketDemandScore, 88), text: "Organic pull and urgency of the target customer." },
                { icon: Cpu, label: "Tech feasibility", value: score(viabilityScorecard?.technicalFeasibilityScore, 82), text: "API availability and development velocity." },
                { icon: DollarSign, label: "Monetization", value: score(viabilityScorecard?.monetizationScore, 85), text: "Willingness to pay and gross margins." },
              ]}
            />
            <SwotAnalysisMatrix
              swotAnalysis={blueprint?.swotAnalysis}
              ideaAnalysis={ideaAnalysis}
              marketResearch={marketResearch}
              competitorWeaknessAnalysis={competitorWeaknessAnalysis}
              customerPersona={customerPersona}
              blueprint={blueprint}
            />
          </Section>

          <Section id="market" n={3} title="Market and competitors" lede="Competitor breakdown, what each incumbent provides, their structural disadvantages, and your unfair winning wedge.">
            {competitorCards.length > 0 && (
              <div className="pr-comp-grid">
                {competitorCards.map((c, i) => (
                  <article key={i} className="pr-comp-card">
                    <div className="pr-comp-head">
                      <h4>{c.name}</h4>
                      <span className="bp-chip"><i />Incumbent</span>
                    </div>
                    <div className="pr-comp-body">
                      <div>
                        <span className="pr-comp-label">What it provides</span>
                        <p>{c.offering}</p>
                      </div>
                      <div>
                        <span className="pr-comp-label is-rose">Disadvantages & weaknesses</span>
                        <p className="pr-comp-disadvantage">{c.disadvantage}</p>
                      </div>
                      <div className="pr-comp-wedge">
                        <span className="pr-comp-label is-orange">Your winning wedge</span>
                        <p>{c.wedge}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="pr-cols">
              <div>
                <h4>Identified competitors</h4>
                <ul>{competitorsList.map((c, i) => <li key={i}>{c}</li>)}</ul>
              </div>
              <div>
                <h4>Market opportunities</h4>
                <ul>{arr(marketResearch?.opportunities).map((o, i) => <li key={i}>{o}</li>)}</ul>
              </div>
            </div>
          </Section>

          <Section id="persona" n={4} title="Ideal customer profile" lede={str(customerPersona?.userProfile)}>
            <div className="pr-cols">
              <div>
                <h4>Target segments</h4>
                <ul className="is-green">{arr(customerPersona?.targetUsers).map((u, i) => <li key={i}>{u}</li>)}</ul>
              </div>
              <div>
                <h4>Acute pain points</h4>
                <ul className="is-rose">{arr(customerPersona?.painPoints).map((p, i) => <li key={i}>{p}</li>)}</ul>
              </div>
            </div>
          </Section>

          <Section id="product" n={5} title="MVP engineering scope">
            <ol className="pr-reqs">
              {arr(productPlan?.mvpFeatures).map((f, i) => (
                <li key={i}>
                  <span>{i + 1}</span>
                  <b>{f}</b>
                  <em>P0 · must have</em>
                </li>
              ))}
            </ol>
          </Section>

          <Section id="tech" n={6} title="System stack and cloud pipeline">
            <div className="pr-kv">
              <MetricRow label="Frontend" value={str(technicalArchitecture?.frontend, "React / Vite / Tailwind")} />
              <MetricRow label="Backend" value={str(technicalArchitecture?.backend, "Node.js / Express")} />
              <MetricRow label="Database" value={str(technicalArchitecture?.database, "PostgreSQL / Supabase")} />
              <MetricRow label="Hosting" value={str(technicalArchitecture?.hosting, "Vercel / Railway")} />
              <MetricRow label="AI APIs" value={str(technicalArchitecture?.aiApis, "Gemini 2.5 Pro / Flash")} />
            </div>
          </Section>

          <Section id="financials" n={7} title="Financial model and unit economics">
            <UpmetricsFinancialSimulator costEstimator={costEstimator} revenueSimulator={revenueSimulator} />
          </Section>

          <Section id="gtm" n={8} title="Go-to-market and outreach" lede="Ready-to-send copy for every channel.">
            <SwipeFile gtm={goToMarket} pitch={pitch} onToast={onToast} />
          </Section>

          <Section id="roadmap" n={9} title="Launch roadmap">
            {milestones.length > 0 ? <MilestoneTimeline milestones={milestones} title="Execution milestones" /> : <p className="pr-lede">No milestones were generated for this venture.</p>}
          </Section>
        </main>
      </div>
    </div>
  );
});

export default PrdDossier;
