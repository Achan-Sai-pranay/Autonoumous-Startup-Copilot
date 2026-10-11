// IdeaFinder.jsx
// ---------------------------------------------------------------------------
// Replaces the hard-coded <section className="wk-suggest"> in WorkspacePage.
// Asks four quick questions, scores a bank of ideas against the answers and
// shows the best four with a "why this fits" line. Picking one calls
// onPick(text), which should do what the old suggestion buttons did: setIdea(text).
//
// Works without a backend. To make suggestions model-generated later, replace
// `rank()` with a call to your API that takes `answers` and returns the same
// shape ({ label, text, category, why: string[] }).
// ---------------------------------------------------------------------------
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, RefreshCw, Sparkles } from "lucide-react";
import "./studio.css";

const QUESTIONS = [
  {
    id: "builder",
    title: "How would you describe yourself?",
    hint: "This shapes how technical the ideas can be.",
    multi: false,
    options: [
      { id: "dev", label: "I write code" },
      { id: "expert", label: "I know an industry well" },
      { id: "student", label: "I’m a student or first-timer" },
      { id: "nontech", label: "I’m non-technical" },
    ],
  },
  {
    id: "spaces",
    title: "Which spaces interest you?",
    hint: "Pick up to three.",
    multi: true,
    max: 3,
    options: [
      { id: "ai", label: "AI and automation" },
      { id: "devtools", label: "Developer tools" },
      { id: "health", label: "Health" },
      { id: "fin", label: "Finance" },
      { id: "edu", label: "Education and careers" },
      { id: "commerce", label: "Commerce and logistics" },
      { id: "climate", label: "Climate and energy" },
      { id: "creator", label: "Creators and media" },
    ],
  },
  {
    id: "audience",
    title: "Who do you want to serve?",
    hint: "The customer you would enjoy talking to.",
    multi: false,
    options: [
      { id: "b2b", label: "Businesses" },
      { id: "b2c", label: "Everyday people" },
      { id: "dev", label: "Developers" },
      { id: "any", label: "Not sure yet" },
    ],
  },
  {
    id: "effort",
    title: "How much can you put in at the start?",
    hint: "We’ll keep the first version realistic.",
    multi: false,
    options: [
      { id: "1", label: "A weekend or two" },
      { id: "2", label: "About a month" },
      { id: "3", label: "Full time, a real build" },
    ],
  },
];

// effort = the smallest commitment needed to ship a first version (1 to 3)
const BANK = [
  { label: "Silent API failure monitor", category: "Developer tools", spaces: ["devtools"], audience: ["dev", "b2b"], effort: 1, builder: ["dev", "student"], text: "A lightweight monitor that checks third-party APIs for downtime and broken response formats, then alerts freelancers and small teams before their clients notice." },
  { label: "Semantic cache for LLMs", category: "AI infrastructure", spaces: ["ai", "devtools"], audience: ["dev", "b2b"], effort: 3, builder: ["dev"], text: "A high-performance in-memory semantic cache for LLM apps that cuts API costs by 70% with sub-millisecond lookups." },
  { label: "Contract risk auditor", category: "LegalTech", spaces: ["ai", "fin"], audience: ["b2b"], effort: 3, builder: ["dev", "expert"], text: "An AI platform that audits enterprise vendor contracts, flags compliance risks and benchmarks pricing automatically." },
  { label: "Rural clinic triage copilot", category: "Digital health", spaces: ["health", "ai"], audience: ["b2b"], effort: 3, builder: ["expert", "dev"], text: "An offline-first, voice-driven EHR and triage copilot for rural clinics with automated ICD-10 coding and SMS patient follow-ups." },
  { label: "Dark store operating system", category: "Supply chain", spaces: ["commerce"], audience: ["b2b"], effort: 3, builder: ["expert", "dev"], text: "An operating system for dark stores and quick-commerce warehouses with dynamic inventory slotting and predictive restocking." },
  { label: "Internship readiness coach", category: "Career tech", spaces: ["edu", "ai"], audience: ["b2c"], effort: 2, builder: ["student", "dev"], text: "A tool that compares a student’s resume with real internship postings, explains the gaps and builds a weekly plan to close them." },
  { label: "Meeting-to-tasks assistant", category: "Productivity", spaces: ["ai"], audience: ["b2b", "b2c"], effort: 2, builder: ["dev", "nontech"], text: "An assistant that turns meeting recordings into owners, deadlines and follow-up messages, then tracks whether they happen." },
  { label: "Personal finance autopilot", category: "Fintech", spaces: ["fin", "ai"], audience: ["b2c"], effort: 3, builder: ["dev", "expert"], text: "An app that reads bank statements, finds wasteful subscriptions and moves the savings into a goal automatically." },
  { label: "Freelancer invoice chaser", category: "Fintech", spaces: ["fin"], audience: ["b2b", "b2c"], effort: 1, builder: ["dev", "nontech", "student"], text: "A micro-SaaS that politely chases late invoices over email and WhatsApp for freelancers, and shows who is likely to pay late." },
  { label: "Campus skill marketplace", category: "Marketplace", spaces: ["edu", "commerce"], audience: ["b2c"], effort: 2, builder: ["student", "nontech"], text: "A marketplace where students sell small skills to each other, such as design, tutoring or resume reviews, with ratings and escrow." },
  { label: "Local service booking page", category: "Local services", spaces: ["commerce"], audience: ["b2c", "b2b"], effort: 1, builder: ["nontech", "expert", "student"], text: "A simple booking and reminder page for independent local service providers like tutors, trainers and repair technicians." },
  { label: "Energy bill optimizer", category: "Climate tech", spaces: ["climate", "fin"], audience: ["b2c", "b2b"], effort: 2, builder: ["dev", "expert"], text: "A tool that analyzes electricity usage, finds the cheapest tariff and schedules heavy loads for off-peak hours." },
  { label: "Carbon report generator", category: "Climate tech", spaces: ["climate", "ai"], audience: ["b2b"], effort: 2, builder: ["expert", "dev"], text: "An assistant that gathers supplier data and produces audit-ready carbon reports for small manufacturers." },
  { label: "Newsletter growth analyst", category: "Creator tools", spaces: ["creator", "ai"], audience: ["b2c", "b2b"], effort: 1, builder: ["dev", "nontech"], text: "A dashboard that explains why a creator’s newsletter is growing or stalling and suggests the next three posts to write." },
  { label: "Short-video repurposer", category: "Creator tools", spaces: ["creator", "ai"], audience: ["b2c"], effort: 2, builder: ["dev"], text: "A tool that turns one long video or podcast into captioned, platform-sized clips with the best moments already picked." },
  { label: "Medication reminder for families", category: "Digital health", spaces: ["health"], audience: ["b2c"], effort: 1, builder: ["nontech", "student", "dev"], text: "A WhatsApp-first reminder service that helps families keep elderly relatives on track with their medication and tells caregivers when a dose is missed." },
  { label: "Clinic no-show reducer", category: "Digital health", spaces: ["health", "commerce"], audience: ["b2b"], effort: 1, builder: ["expert", "nontech", "dev"], text: "A reminder and rebooking system for small clinics that cuts missed appointments with smart nudges and waitlist fill-ins." },
  { label: "Codebase onboarding guide", category: "Developer tools", spaces: ["devtools", "ai"], audience: ["dev", "b2b"], effort: 2, builder: ["dev"], text: "A tool that reads a repository and writes a guided tour for new engineers, including where to start and which files matter." },
  { label: "Cloud cost explainer", category: "DevOps", spaces: ["devtools", "fin"], audience: ["dev", "b2b"], effort: 2, builder: ["dev"], text: "A service that explains each line of a cloud bill in plain English and flags idle resources that can be shut down safely." },
  { label: "Exam revision planner", category: "EdTech", spaces: ["edu", "ai"], audience: ["b2c"], effort: 1, builder: ["student", "dev", "nontech"], text: "An app that turns a syllabus and exam date into a daily revision plan, then adapts it based on quiz results." },
  { label: "Supplier price tracker", category: "Commerce", spaces: ["commerce", "fin"], audience: ["b2b"], effort: 2, builder: ["expert", "dev"], text: "A tool that tracks supplier prices across messages and spreadsheets and warns small retailers when costs quietly rise." },
  { label: "Support reply drafter", category: "Customer support", spaces: ["ai"], audience: ["b2b"], effort: 2, builder: ["dev", "expert"], text: "An assistant that drafts accurate support replies from a company’s help docs and past tickets, with a human approving each send." },
  { label: "Hackathon team matcher", category: "Community", spaces: ["edu", "devtools"], audience: ["b2c", "dev"], effort: 1, builder: ["student", "dev"], text: "A matching tool that forms balanced hackathon teams from skills, availability and past projects." },
];

const LABEL = {};
QUESTIONS.forEach((q) => q.options.forEach((o) => (LABEL[`${q.id}:${o.id}`] = o.label)));

function rank(answers, seed) {
  const level = Number(answers.effort?.[0] || 2);
  return BANK.map((idea, i) => {
    const why = [];
    let score = 0;
    (answers.spaces || []).forEach((s) => {
      if (idea.spaces.includes(s)) {
        score += 3;
        why.push(LABEL[`spaces:${s}`]);
      }
    });
    const aud = answers.audience?.[0];
    if (aud && aud !== "any" && idea.audience.includes(aud)) {
      score += 2;
      why.push(LABEL[`audience:${aud}`]);
    }
    if (idea.effort === level) {
      score += 2;
      why.push(LABEL[`effort:${level}`]);
    } else if (idea.effort < level) score += 1;
    else score -= 3; // needs more time than the user has
    const b = answers.builder?.[0];
    if (b && idea.builder.includes(b)) {
      score += 1;
      why.push(LABEL[`builder:${b}`]);
    }
    const jitter = (((i + 1) * 9301 + seed * 49297) % 233) / 233; // stable per seed
    return { ...idea, why, score: score + jitter * 0.9 };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

export default function IdeaFinder({ onPick }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [seed, setSeed] = useState(1);
  const [picked, setPicked] = useState(null);

  const done = step >= QUESTIONS.length;
  const q = QUESTIONS[Math.min(step, QUESTIONS.length - 1)];
  const current = answers[q.id] || [];
  const results = useMemo(() => (done ? rank(answers, seed) : []), [done, answers, seed]);

  const toggle = (id) => {
    setAnswers((prev) => {
      const cur = prev[q.id] || [];
      if (!q.multi) return { ...prev, [q.id]: [id] };
      if (cur.includes(id)) return { ...prev, [q.id]: cur.filter((x) => x !== id) };
      if (cur.length >= (q.max || 99)) return prev;
      return { ...prev, [q.id]: [...cur, id] };
    });
    if (!q.multi) setTimeout(() => setStep((s) => s + 1), 260);
  };

  const restart = () => {
    setStep(0);
    setAnswers({});
    setPicked(null);
  };

  return (
    <section className="if" aria-label="Idea finder">
      <header className="if-head">
        <div>
          <h2>{done ? "Four ideas that fit you" : "Need a starting point?"}</h2>
          <p>
            {done
              ? "Based on your answers. Pick one to drop it into the prompt, then edit it however you like."
              : "Answer four quick questions and we’ll suggest ideas that match you."}
          </p>
        </div>
        {!done && (
          <ol className="if-dots" aria-label={`Question ${step + 1} of ${QUESTIONS.length}`}>
            {QUESTIONS.map((_, i) => (
              <li key={i} className={i < step ? "is-done" : i === step ? "is-now" : ""} />
            ))}
          </ol>
        )}
      </header>

      {!done ? (
        <div key={step} className="if-step">
          <h3>{q.title}</h3>
          <p>{q.hint}</p>
          <div className="if-options" role={q.multi ? "group" : "radiogroup"}>
            {q.options.map((o) => {
              const on = current.includes(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  role={q.multi ? "checkbox" : "radio"}
                  aria-checked={on}
                  className={on ? "is-on" : ""}
                  onClick={() => toggle(o.id)}
                >
                  <span>{on && <Check size={13} strokeWidth={3} />}</span>
                  {o.label}
                </button>
              );
            })}
          </div>
          <div className="if-nav">
            <button type="button" className="if-text" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              <ArrowLeft size={15} /> Back
            </button>
            <div>
              <button type="button" className="if-text" onClick={() => setStep(QUESTIONS.length)}>
                Skip and show ideas
              </button>
              {q.multi && (
                <button type="button" className="hp-btn hp-btn--primary hp-btn--sm" onClick={() => setStep((s) => s + 1)} disabled={!current.length}>
                  Continue <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="if-results">
          <ul>
            {results.map((r, i) => (
              <li key={r.label} style={{ "--i": i }} className={picked === r.label ? "is-picked" : ""}>
                <button
                  type="button"
                  onClick={() => {
                    setPicked(r.label);
                    onPick(r.text);
                  }}
                >
                  <span className="if-top">
                    <b>{r.label}</b>
                    <em>{r.category}</em>
                  </span>
                  <span className="if-text-body">{r.text}</span>
                  {r.why.length > 0 && (
                    <span className="if-why">
                      <Sparkles size={13} /> Fits: {r.why.slice(0, 3).join(" · ")}
                    </span>
                  )}
                  <span className="if-use">{picked === r.label ? "Added to your prompt" : "Use this idea"}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="if-nav">
            <button type="button" className="if-text" onClick={restart}>
              <ArrowLeft size={15} /> Change my answers
            </button>
            <button type="button" className="if-text" onClick={() => setSeed((s) => s + 1)}>
              <RefreshCw size={14} /> Show different ideas
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
