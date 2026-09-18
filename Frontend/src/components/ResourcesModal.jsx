// components/ResourcesModal.jsx
// ---------------------------------------------------------------------------
// Curated Founder Knowledge Vault & Resource Center.
// Displays playbooks, YC materials, legal templates, and optional export actions.
// ---------------------------------------------------------------------------
import { useState } from "react";
import {
  X,
  BookOpen,
  ExternalLink,
  Download,
  FileText,
  FileDown,
  Sparkles,
  Rocket,
  Shield,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { downloadMarkdown, downloadPdf } from "./exportBlueprint.js";

const RESOURCE_CATEGORIES = [
  {
    id: "playbooks",
    label: "YC & PMF Playbooks",
    icon: Rocket,
    resources: [
      {
        title: "Y Combinator Startup School",
        tag: "Accelerator",
        description: "Official curriculum, video lectures, and masterclasses from Y Combinator partners on finding product-market fit and talking to users.",
        link: "https://www.startupschool.org/",
        actionLabel: "Visit Startup School",
      },
      {
        title: "The Mom Test Cheatsheet",
        tag: "Customer Discovery",
        description: "Rob Fitzpatrick's battle-tested framework for talking to customers and evaluating demand without getting polite false positives.",
        badge: "Essential",
        bullets: [
          "Ask about what they actually did in the past, never what they might do in the future.",
          "Ask about specific instances, workarounds, and how much money/time they lost.",
          "Talk less than 20% of the time and never pitch your solution during discovery.",
        ],
      },
      {
        title: "Paul Graham: Do Things That Don't Scale",
        tag: "Growth Tactics",
        description: "Why the best early startups recruit users manually, create delightful bespoke experiences, and push past the cold-start barrier.",
        link: "https://paulgraham.com/ds.html",
        actionLabel: "Read Essay",
      },
    ],
  },
  {
    id: "pitching",
    label: "Pitching & Legal",
    icon: Shield,
    resources: [
      {
        title: "Sequoia Capital 10-Slide Pitch Structure",
        tag: "Fundraising",
        badge: "Investor Standard",
        description: "The gold-standard presentation flow used by Silicon Valley's top tier founders to raise Seed and Series A rounds.",
        bullets: [
          "1. Company Purpose & 1-Sentence Vision",
          "2. Severe Problem & Pain Point",
          "3. Your Solution & Product Value Wedge",
          "4. Market Sizing (Bottom-up TAM/SAM/SOM)",
          "5. Business Model, Margins & Unit Economics",
        ],
      },
      {
        title: "YC Standard Post-Money SAFE",
        tag: "Legal Template",
        description: "The industry standard convertible financing instrument. Simple, clean, and recognized by angel investors and VCs globally.",
        link: "https://www.ycombinator.com/documents",
        actionLabel: "Download SAFE Templates",
      },
      {
        title: "Stripe Atlas Incorporation Guide",
        tag: "Legal & Banking",
        description: "How to incorporate a Delaware C-Corporation, issue founder stock with 83(b) tax elections, and open a business bank account.",
        link: "https://stripe.com/atlas",
        actionLabel: "Explore Stripe Atlas",
      },
    ],
  },
  {
    id: "frameworks",
    label: "Strategic Frameworks",
    icon: Layers,
    resources: [
      {
        title: "Ash Maurya's 9-Box Lean Canvas",
        tag: "Venture Architecture",
        badge: "Built-in",
        description: "A 1-page business model format optimized for rapid startup iteration, hypothesis testing, and investor diligence.",
        bullets: [
          "Problem & Existing Alternatives",
          "Customer Segments & Early Adopters",
          "Unique Value Proposition & Pitch",
          "Solution & Top MVP Capabilities",
          "Channels, Metrics & Cost/Revenue Economics",
        ],
      },
      {
        title: "Product Hunt Launch Playbook",
        tag: "Launch Engine",
        description: "The complete checklist to rank in the Top 5 products on launch day, including hunter outreach, animated assets, and first-comment copy.",
        bullets: [
          "Schedule launch for 12:01 AM PST on Tuesday or Wednesday.",
          "Prepare 4-5 high-contrast 1270x760 preview gallery cards.",
          "Write a personal founder maker comment explaining WHY you built this.",
        ],
      },
    ],
  },
];

export default function ResourcesModal({
  isOpen,
  onClose,
  blueprint,
  idea,
  onToast = () => {},
}) {
  const [activeTab, setActiveTab] = useState("playbooks");
  const [isExporting, setIsExporting] = useState(null);

  if (!isOpen) return null;

  const currentCategory = RESOURCE_CATEGORIES.find((c) => c.id === activeTab) || RESOURCE_CATEGORIES[0];

  const handleDownloadPdf = async () => {
    if (!blueprint) {
      onToast("Generate or select a startup blueprint first");
      return;
    }
    setIsExporting("pdf");
    try {
      await downloadPdf(blueprint, idea);
      onToast("Executive PDF exported successfully");
    } catch (err) {
      onToast("PDF export failed — please retry");
    } finally {
      setIsExporting(null);
    }
  };

  const handleDownloadMd = () => {
    if (!blueprint) {
      onToast("Generate or select a startup blueprint first");
      return;
    }
    setIsExporting("md");
    try {
      downloadMarkdown(blueprint, idea);
      onToast("Markdown brief exported successfully");
    } catch (err) {
      onToast("Markdown export failed");
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in text-slate-900">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 font-bold">
              <BookOpen size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Founder Resource Vault
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-100 text-orange-700">
                  PLAYBOOKS &amp; KNOWLEDGE
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Curated startup frameworks, YC guides, legal templates, and venture downloads.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 px-6 pt-3 pb-2 border-b border-slate-100 bg-white shrink-0 overflow-x-auto">
          {RESOURCE_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon size={14} className={active ? "text-orange-400" : "text-slate-400"} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Resource Cards Area */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {currentCategory.resources.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-all"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-100 text-amber-800">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                  {item.tag}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {item.description}
              </p>

              {item.bullets && (
                <div className="space-y-1.5 mb-3 bg-white p-3 rounded-xl border border-slate-200/70 text-xs text-slate-700 font-medium">
                  {item.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2">
                      <CheckCircle2 size={13} className="text-orange-500 shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              )}

              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline"
                >
                  <span>{item.actionLabel || "Read Resource"}</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Active Venture Export Tray (Optional Downloads Only) */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 shrink-0 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              Want to download this blueprint?
            </span>
            <span className="text-[11px] text-slate-500">
              Only downloads when you explicitly click a button below.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadMd}
              disabled={isExporting !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:border-orange-300 hover:text-orange-600 transition-colors cursor-pointer text-slate-700 shadow-2xs"
            >
              <FileText size={13} />
              <span>{isExporting === "md" ? "Exporting..." : "Markdown"}</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isExporting !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white transition-colors cursor-pointer shadow-2xs"
            >
              <FileDown size={13} />
              <span>{isExporting === "pdf" ? "Exporting PDF..." : "Download PDF"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
