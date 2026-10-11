// ResourcesVault.jsx
// ---------------------------------------------------------------------------
// Replacement for ResourcesModal.jsx (same props: isOpen, onClose, blueprint,
// idea, onToast).
//
// New behaviour: search across all tabs, a sliding tab indicator, tick-able
// checklists with per-card progress, copy checklist, Esc / backdrop to close,
// staggered card entrance and a download footer.
// ---------------------------------------------------------------------------
import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Check, Copy, FileDown, FileText, Layers, Loader2, Rocket, Search, Shield, X } from "lucide-react";
import { downloadMarkdown, downloadPdf } from "./exportBlueprint.js";
import "./studio.css";

const ICONS = { rocket: Rocket, shield: Shield, layers: Layers };

export const DEFAULT_TABS = [
  {
    id: "yc",
    label: "YC and PMF playbooks",
    icon: "rocket",
    items: [
      {
        id: "yc-school",
        title: "Y Combinator Startup School",
        badge: "Curriculum",
        tag: "Accelerator",
        description: "Official curriculum, video lectures, and masterclasses from Y Combinator partners on finding product-market fit and talking to users.",
        checklist: [
          "Register free at startupschool.org",
          "Complete weekly goal updates and co-founder matching",
          "Watch the PMF curriculum by Michael Seibel & Dalton Caldwell",
          "Apply insights directly into your customer discovery sprints",
        ],
      },
      {
        id: "mom-test",
        title: "The Mom Test customer discovery",
        badge: "Essential",
        tag: "Customer Discovery",
        description: "Rob Fitzpatrick's battle-tested framework for talking to customers and evaluating demand without getting polite false positives.",
        checklist: [
          "Ask about what they actually did in the past, never what they might do in the future",
          "Ask about specific instances, workarounds, and how much money/time they lost",
          "Talk less than 20% of the time and never pitch your solution during discovery",
          "Commit to talking to at least 20 active target prospects",
        ],
      },
      {
        id: "pg-scale",
        title: "Paul Graham: Do Things That Don't Scale",
        tag: "Growth Tactics",
        description: "Why the best early startups recruit users manually, create delightful bespoke experiences, and push past the cold-start barrier.",
        checklist: [
          "Manually recruit your first 10 paying or active users",
          "Provide ridiculously high-touch, bespoke customer support",
          "Delight early adopters individually before automating onboarding",
          "Focus on unscalable extreme quality over vanity metrics",
        ],
      },
    ],
  },
  {
    id: "legal",
    label: "Pitching and legal",
    icon: "shield",
    items: [
      {
        id: "sequoia-pitch",
        title: "Sequoia Capital 10-slide pitch structure",
        badge: "Investor Standard",
        tag: "Fundraising",
        description: "The gold-standard presentation flow used by Silicon Valley's top tier founders to raise Seed and Series A rounds.",
        checklist: [
          "1. Company Purpose & 1-Sentence Vision",
          "2. Severe Problem & Current Broken Alternatives",
          "3. Your Solution & Product Value Wedge",
          "4. Market Sizing (Bottom-up TAM / SAM / SOM)",
          "5. Business Model, Margins & Unit Economics",
          "6. Team, unfair advantage & capital ask",
        ],
      },
      {
        id: "yc-safe",
        title: "YC standard post-money SAFE",
        badge: "Legal Template",
        tag: "Convertible Note",
        description: "The industry standard convertible financing instrument. Simple, clean, and recognized by angel investors and VCs globally.",
        checklist: [
          "Download standard Post-Money Valuation Cap template from ycombinator.com/documents",
          "Decide on Valuation Cap and Discount Rate with lead angel",
          "Confirm accredited investor status and execute digital signature",
          "File Form D with the SEC within 15 days if applicable",
        ],
      },
      {
        id: "stripe-atlas",
        title: "Stripe Atlas incorporation guide",
        tag: "Legal & Banking",
        description: "How to incorporate a Delaware C-Corporation, issue founder stock with 83(b) tax elections, and open a business bank account.",
        checklist: [
          "Incorporate Delaware C-Corp with 10M authorized common shares",
          "Execute 83(b) election within 30 days of stock issuance (critical IRS deadline)",
          "Obtain federal EIN and open Silicon Valley/Mercury business checking account",
          "Sign standard CIIA (Confidential Information & Inventions Assignment) agreements",
        ],
      },
    ],
  },
  {
    id: "frameworks",
    label: "Strategic frameworks",
    icon: "layers",
    items: [
      {
        id: "lean-canvas",
        title: "Ash Maurya’s 9-box lean canvas",
        badge: "Built in",
        tag: "Venture architecture",
        description: "A one-page business model format built for rapid iteration, hypothesis testing and investor diligence.",
        checklist: [
          "Problem and existing alternatives",
          "Customer segments and early adopters",
          "Unique value proposition and pitch",
          "Solution and top MVP capabilities",
          "Channels, metrics and cost / revenue economics",
        ],
      },
      {
        id: "ph-launch",
        title: "Product Hunt launch playbook",
        tag: "Launch engine",
        description: "The complete checklist to rank in the top five on launch day, including hunter outreach, animated assets and first-comment copy.",
        checklist: [
          "Schedule launch for 12:01 AM PST on a Tuesday or Wednesday",
          "Prepare 4 to 5 high-contrast 1270×760 gallery cards",
          "Write a personal maker comment explaining why you built this",
        ],
      },
    ],
  },
];

export default function ResourcesVault({ isOpen, onClose, blueprint, idea, onToast, tabs = DEFAULT_TABS }) {
  const [tabId, setTabId] = useState(tabs[0]?.id);
  const [query, setQuery] = useState("");
  const [done, setDone] = useState({});
  const [busy, setBusy] = useState(null);
  const [copied, setCopied] = useState(null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  const tabIndex = Math.max(0, tabs.findIndex((t) => t.id === tabId));
  const searching = query.trim().length > 0;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return (tabs[tabIndex]?.items || []).map((it) => ({ ...it, from: null }));
    return tabs.flatMap((t) =>
      t.items
        .filter((it) => [it.title, it.description, it.tag, ...(it.checklist || [])].join(" ").toLowerCase().includes(q))
        .map((it) => ({ ...it, from: t.label }))
    );
  }, [tabs, tabIndex, query]);

  if (!isOpen) return null;

  const tick = (itemId, i) => setDone((d) => ({ ...d, [`${itemId}:${i}`]: !d[`${itemId}:${i}`] }));
  const countDone = (it) => (it.checklist || []).filter((_, i) => done[`${it.id}:${i}`]).length;

  const copyChecklist = (it) => {
    navigator.clipboard?.writeText(`${it.title}\n${(it.checklist || []).map((c) => `- [ ] ${c}`).join("\n")}`);
    setCopied(it.id);
    onToast?.("Checklist copied to clipboard");
    setTimeout(() => setCopied(null), 1600);
  };

  const exportAs = async (kind) => {
    if (!blueprint) return onToast?.("Open a venture first to download its blueprint");
    setBusy(kind);
    try {
      if (kind === "pdf") await downloadPdf(blueprint, idea);
      else downloadMarkdown(blueprint, idea);
      onToast?.(kind === "pdf" ? "PDF exported" : "Markdown exported");
    } catch (e) {
      console.error(e);
      onToast?.("Export failed, please try again");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="rv-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="rv" role="dialog" aria-modal="true" aria-labelledby="rv-title">
        <header className="rv-head">
          <span className="rv-icon">
            <BookOpen size={20} />
          </span>
          <div>
            <h2 id="rv-title">Founder resource vault</h2>
            <p>Startup frameworks, launch playbooks and legal templates, all in one place.</p>
          </div>
          <button ref={closeRef} type="button" className="wk-iconbtn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="rv-tools">
          <label className="rv-search">
            <Search size={16} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search every playbook" aria-label="Search resources" />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
                <X size={14} />
              </button>
            )}
          </label>

          <div className={`rv-tabs ${searching ? "is-dim" : ""}`} role="tablist" style={{ "--n": tabs.length, "--i": tabIndex }}>
            <i aria-hidden="true" />
            {tabs.map((t) => {
              const Icon = ICONS[t.icon] || Layers;
              return (
                <button key={t.id} type="button" role="tab" aria-selected={!searching && t.id === tabId} onClick={() => { setQuery(""); setTabId(t.id); }}>
                  <Icon size={15} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rv-body" key={`${tabId}-${searching}`}>
          {visible.length === 0 ? (
            <p className="rv-empty">{searching ? `Nothing matches “${query}”.` : "Nothing in this tab yet."}</p>
          ) : (
            visible.map((it, n) => {
              const finished = countDone(it);
              const listLen = it.checklist?.length || 0;
              const pct = listLen ? Math.round((finished / listLen) * 100) : 0;
              return (
                <article key={it.id} className="rv-card" style={{ "--i": n }}>
                  <div className="rv-card-top">
                    <h3>
                      {it.title}
                      {it.badge && <em>{it.badge}</em>}
                    </h3>
                    <span>{it.from || it.tag}</span>
                  </div>
                  <p>{it.description}</p>

                  {it.checklist && it.checklist.length > 0 && (
                    <ul>
                      {it.checklist.map((c, i) => {
                        const on = !!done[`${it.id}:${i}`];
                        return (
                          <li key={i} className={on ? "is-done" : ""}>
                            <button type="button" role="checkbox" aria-checked={on} onClick={() => tick(it.id, i)}>
                              <span className="rv-box">
                                <Check size={12} strokeWidth={3} />
                              </span>
                              {c}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  <div className="rv-card-foot">
                    <div className="rv-prog" aria-label={`${finished} of ${listLen} done`}>
                      <i style={{ width: `${pct}%` }} />
                    </div>
                    <small>
                      {finished}/{listLen}
                    </small>
                    <button type="button" onClick={() => copyChecklist(it)}>
                      {copied === it.id ? <Check size={14} /> : <Copy size={14} />}
                      {copied === it.id ? "Copied" : "Copy checklist"}
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>

        <footer className="rv-foot">
          <div>
            <b>Want to download this blueprint?</b>
            <small>Only downloads when you click a button.</small>
          </div>
          <div>
            <button type="button" className="hp-btn hp-btn--ghost hp-btn--sm" onClick={() => exportAs("md")} disabled={busy === "md"}>
              {busy === "md" ? <Loader2 size={14} className="bp-spin" /> : <FileText size={14} />} Markdown
            </button>
            <button type="button" className="hp-btn hp-btn--primary hp-btn--sm" onClick={() => exportAs("pdf")} disabled={busy === "pdf"}>
              {busy === "pdf" ? <Loader2 size={14} className="bp-spin" /> : <FileDown size={14} />} Download PDF
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
