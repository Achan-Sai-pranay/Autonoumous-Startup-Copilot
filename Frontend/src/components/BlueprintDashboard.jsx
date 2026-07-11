// BlueprintDashboard.jsx
// ---------------------------------------------------------------------------
// V3: module-based layout (sidebar/tabs) grouping the 12 backend sections
// into 5 modules.
//
// V4: adds PDF/Markdown export (via utils/exportBlueprint.js), a success
// toast, smooth module-switch transitions (fade+slide, driven by a `key`
// change on the content wrapper — no animation library), staggered card
// entrance, a progress bar on the Launch Checklist, subtle hover/icon
// micro-interactions, and React.memo on repeated leaf components to cut
// down re-renders.
// ---------------------------------------------------------------------------
import { useState, memo, useCallback } from "react";
import {
  Lightbulb,
  TrendingUp,
  Users,
  ListChecks,
  Cpu,
  Landmark,
  Map as MapIcon,
  Wallet,
  AlertTriangle,
  Target,
  ListTodo,
  BarChart3,
  Crosshair,
  Copy,
  Check,
  Rocket,
  FileDown,
  FileText,
  Loader2,
} from "lucide-react";
import { downloadMarkdown, downloadPdf } from "../components/exportBlueprint.js";

// ---------------------------------------------------------------------------
// Accent system — literal Tailwind class strings only (dynamic string
// concatenation would get purged by Tailwind's JIT scanner).
// ---------------------------------------------------------------------------
const ACCENT_TEXT = {
  sky: "text-sky-400",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  orange: "text-orange-400",
  rose: "text-rose-400",
  indigo: "text-indigo-400",
};
const ACCENT_BG = {
  sky: "bg-sky-500/10",
  emerald: "bg-emerald-500/10",
  amber: "bg-amber-500/10",
  orange: "bg-orange-500/10",
  rose: "bg-rose-500/10",
  indigo: "bg-indigo-500/10",
};
const ACCENT_BORDER = {
  sky: "border-sky-500/40",
  emerald: "border-emerald-500/40",
  amber: "border-amber-500/40",
  orange: "border-orange-500/40",
  rose: "border-rose-500/40",
  indigo: "border-indigo-500/40",
};
const ACCENT_DOT = {
  sky: "bg-sky-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  orange: "bg-orange-500",
  rose: "bg-rose-500",
  indigo: "bg-indigo-500",
};
const ACCENT_CHECKBOX = {
  sky: "text-sky-500",
  emerald: "text-emerald-500",
  amber: "text-amber-500",
  orange: "text-orange-500",
  rose: "text-rose-500",
  indigo: "text-indigo-500",
};
const ACCENT_RING = {
  sky: "focus:ring-sky-500",
  emerald: "focus:ring-emerald-500",
  amber: "focus:ring-amber-500",
  orange: "focus:ring-orange-500",
  rose: "focus:ring-rose-500",
  indigo: "focus:ring-indigo-500",
};
const ACCENT_BAR = {
  sky: "bg-sky-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  orange: "bg-orange-500",
  rose: "bg-rose-500",
  indigo: "bg-indigo-500",
};

const MODULES = [
  { id: "idea", label: "Idea & Validation", icon: Lightbulb, accent: "sky" },
  { id: "market", label: "Market Intelligence", icon: TrendingUp, accent: "emerald" },
  { id: "product", label: "Product Planning", icon: ListChecks, accent: "amber" },
  { id: "business", label: "Business Strategy", icon: Landmark, accent: "orange" },
  { id: "launch", label: "Launch Strategy", icon: Rocket, accent: "rose" },
];

// Small helper for staggered card entrance — index-based delay in ms.
const stagger = (i, step = 80) => ({ animationDelay: `${i * step}ms` });

export default function BlueprintDashboard({ blueprint, originalIdea }) {
  const [activeModule, setActiveModule] = useState("idea");
  const [exporting, setExporting] = useState(null); // null | "pdf" | "md"
  const [toast, setToast] = useState(null); // null | string

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleExportPdf = useCallback(async () => {
    setExporting("pdf");
    try {
      await downloadPdf(blueprint, originalIdea);
      showToast("PDF exported successfully");
    } catch (err) {
      console.error("PDF export failed:", err);
      showToast("PDF export failed — please try again");
    } finally {
      setExporting(null);
    }
  }, [blueprint, originalIdea, showToast]);

  const handleExportMarkdown = useCallback(() => {
    setExporting("md");
    try {
      downloadMarkdown(blueprint, originalIdea);
      showToast("Markdown exported successfully");
    } catch (err) {
      console.error("Markdown export failed:", err);
      showToast("Markdown export failed — please try again");
    } finally {
      setExporting(null);
    }
  }, [blueprint, originalIdea, showToast]);

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
    launchChecklist,
    costEstimator,
    revenueSimulator,
    competitorWeaknessAnalysis,
  } = blueprint;

  return (
    <div className="w-full max-w-7xl mx-auto mt-10 px-4 pb-24 animate-[fadeIn_0.4s_ease-out]">
      {/* Export bar */}
      <div className="flex flex-wrap items-center justify-end gap-3 mb-6">
        <ExportButton
          icon={FileText}
          label="Export Markdown"
          busy={exporting === "md"}
          onClick={handleExportMarkdown}
        />
        <ExportButton
          icon={FileDown}
          label="Export PDF"
          busy={exporting === "pdf"}
          onClick={handleExportPdf}
        />
      </div>

      {/* Mobile: horizontal scrollable tabs */}
      <nav className="md:hidden -mx-4 px-4 mb-6 overflow-x-auto">
        <div className="flex gap-2 w-max">
          {MODULES.map((m) => (
            <ModuleTabButton
              key={m.id}
              module={m}
              active={activeModule === m.id}
              onClick={() => setActiveModule(m.id)}
            />
          ))}
        </div>
      </nav>

      <div className="md:flex md:gap-8 md:items-start">
        {/* Desktop: sidebar */}
        <aside className="hidden md:block w-60 shrink-0 sticky top-6 self-start">
          <div className="space-y-1.5">
            {MODULES.map((m) => (
              <SidebarItem
                key={m.id}
                module={m}
                active={activeModule === m.id}
                onClick={() => setActiveModule(m.id)}
              />
            ))}
          </div>
        </aside>

        {/* Active module content — `key` forces a remount on module change,
            retriggering the animate-module-in CSS animation each switch. */}
        <main className="flex-1 min-w-0">
          <div key={activeModule} className="animate-module-in">
            {activeModule === "idea" && (
              <IdeaModule originalIdea={originalIdea} ideaAnalysis={ideaAnalysis} />
            )}
            {activeModule === "market" && (
              <MarketModule
                marketResearch={marketResearch}
                competitorWeaknessAnalysis={competitorWeaknessAnalysis}
                goToMarket={goToMarket}
              />
            )}
            {activeModule === "product" && (
              <ProductModule
                customerPersona={customerPersona}
                productPlan={productPlan}
                technicalArchitecture={technicalArchitecture}
              />
            )}
            {activeModule === "business" && (
              <BusinessModule
                businessStrategy={businessStrategy}
                costEstimator={costEstimator}
                revenueSimulator={revenueSimulator}
              />
            )}
            {activeModule === "launch" && (
              <LaunchModule
                launchChecklist={launchChecklist}
                pitch={pitch}
                roadmap={roadmap}
              />
            )}
          </div>
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-toast-in">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 text-slate-100 text-sm px-4 py-3 rounded-2xl shadow-xl">
            <Check size={16} className="text-emerald-400" />
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Export bar button
// ---------------------------------------------------------------------------
function ExportButton({ icon: Icon, label, busy, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-600 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
    >
      {busy ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
      {busy ? "Preparing…" : label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Navigation pieces
// ---------------------------------------------------------------------------
const SidebarItem = memo(function SidebarItem({ module, active, onClick }) {
  const { icon: Icon, label, accent } = module;
  return (
    <button
      onClick={onClick}
      className={`group w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold border transition-all duration-200
        ${
          active
            ? `${ACCENT_BG[accent]} ${ACCENT_BORDER[accent]} ${ACCENT_TEXT[accent]}`
            : "bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-900/60"
        }`}
    >
      <Icon size={18} className="transition-transform duration-200 group-hover:scale-110" />
      {label}
    </button>
  );
});

const ModuleTabButton = memo(function ModuleTabButton({ module, active, onClick }) {
  const { icon: Icon, label, accent } = module;
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold border transition-colors duration-200
        ${
          active
            ? `${ACCENT_BG[accent]} ${ACCENT_BORDER[accent]} ${ACCENT_TEXT[accent]}`
            : "bg-slate-900/60 border-slate-800 text-slate-400"
        }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
});

function ModuleHeader({ icon: Icon, title, description, accent }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <span
        className={`flex items-center justify-center h-12 w-12 rounded-2xl shrink-0 border ${ACCENT_BG[accent]} ${ACCENT_BORDER[accent]}`}
      >
        <Icon size={22} className={ACCENT_TEXT[accent]} />
      </span>
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------
function isError(section) {
  return Boolean(section?.error);
}

function ErrorNotice() {
  return (
    <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-950/30 border border-amber-900 rounded-xl px-3 py-2">
      <AlertTriangle size={16} className="shrink-0" />
      <span>Generation unavailable. Please retry.</span>
    </div>
  );
}

// Reusable card shell. `accent` controls the icon badge color; `delayIndex`
// (optional) applies a staggered entrance animation.
const DashboardCard = memo(function DashboardCard({
  icon: Icon,
  title,
  children,
  className = "",
  accent = "indigo",
  delayIndex,
}) {
  return (
    <div
      style={delayIndex !== undefined ? stagger(delayIndex) : undefined}
      className={`${delayIndex !== undefined ? "card-stagger" : ""} p-7 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-0.5 transition-all duration-300 ${className}`}
    >
      <h3 className="flex items-center gap-3 text-xl font-bold text-white mb-5">
        {Icon && (
          <span className={`flex items-center justify-center h-9 w-9 rounded-xl ${ACCENT_BG[accent]}`}>
            <Icon size={18} className={ACCENT_TEXT[accent]} />
          </span>
        )}
        {title}
      </h3>
      <div className="space-y-5">{children}</div>
    </div>
  );
});

const Field = memo(function Field({ label, value, accent = "indigo" }) {
  if (!value) return null;
  return (
    <div>
      <p className={`text-sm font-bold uppercase tracking-wide mb-1.5 flex items-center gap-2 ${ACCENT_TEXT[accent]}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {label}
      </p>
      <p className="text-sm text-slate-200 leading-relaxed">{value}</p>
    </div>
  );
});

const ListField = memo(function ListField({ label, items, accent = "indigo" }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className={`text-sm font-bold uppercase tracking-wide mb-2 flex items-center gap-2 ${ACCENT_TEXT[accent]}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {label}
      </p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-slate-200 leading-relaxed">
            <span className="text-slate-600 mt-0.5">›</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Module: Idea & Validation
// ---------------------------------------------------------------------------
function IdeaModule({ originalIdea, ideaAnalysis }) {
  return (
    <div>
      <ModuleHeader
        icon={Lightbulb}
        title="Idea & Validation"
        description="What you're building, and whether it holds up."
        accent="sky"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <DashboardCard icon={Target} title="Startup Idea" accent="sky" delayIndex={0}>
          <p className="text-sm text-slate-200 leading-relaxed">
            {originalIdea || "No idea text available."}
          </p>
        </DashboardCard>

        <DashboardCard icon={Lightbulb} title="Idea Analysis" accent="sky" delayIndex={1}>
          {isError(ideaAnalysis) ? (
            <ErrorNotice />
          ) : (
            <>
              <Field label="Problem Statement" value={ideaAnalysis?.problem} accent="sky" />
              <Field label="Objectives" value={ideaAnalysis?.goal} accent="sky" />
              <Field label="Domain" value={ideaAnalysis?.domain} accent="sky" />
              <Field label="Feasibility" value={ideaAnalysis?.feasibility} accent="sky" />
            </>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Module: Market Intelligence
// ---------------------------------------------------------------------------
function MarketModule({ marketResearch, competitorWeaknessAnalysis, goToMarket }) {
  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={TrendingUp}
        title="Market Intelligence"
        description="Competitors, demand, and how to reach the market."
        accent="emerald"
      />
      <DashboardCard icon={TrendingUp} title="Market Research" accent="emerald" delayIndex={0}>
        {isError(marketResearch) ? (
          <ErrorNotice />
        ) : (
          <>
            <ListField label="Competitors" items={marketResearch?.competitors} accent="emerald" />
            <ListField label="Opportunities" items={marketResearch?.opportunities} accent="emerald" />
            <Field label="Market Demand" value={marketResearch?.marketDemand} accent="emerald" />
          </>
        )}
      </DashboardCard>

      {!isError(competitorWeaknessAnalysis) && competitorWeaknessAnalysis?.length > 0 && (
        <CompetitorWeaknessSection analysis={competitorWeaknessAnalysis} accent="emerald" delayIndex={1} />
      )}

      {!isError(goToMarket) && goToMarket && (
        <GoToMarketSection gtm={goToMarket} accent="emerald" delayIndex={2} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Module: Product Planning
// ---------------------------------------------------------------------------
function ProductModule({ customerPersona, productPlan, technicalArchitecture }) {
  return (
    <div>
      <ModuleHeader
        icon={ListChecks}
        title="Product Planning"
        description="Who it's for, and what to build first."
        accent="amber"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <DashboardCard icon={Users} title="Customer Persona" accent="amber" delayIndex={0}>
          {isError(customerPersona) ? (
            <ErrorNotice />
          ) : (
            <>
              <ListField label="Target Users" items={customerPersona?.targetUsers} accent="amber" />
              <ListField label="Pain Points" items={customerPersona?.painPoints} accent="amber" />
              <Field label="User Profile" value={customerPersona?.userProfile} accent="amber" />
            </>
          )}
        </DashboardCard>

        <DashboardCard icon={ListChecks} title="Product Plan" accent="amber" delayIndex={1}>
          {isError(productPlan) ? (
            <ErrorNotice />
          ) : (
            <>
              <ListField label="MVP Features" items={productPlan?.mvpFeatures} accent="amber" />
              <ListField label="Future Features" items={productPlan?.futureFeatures} accent="amber" />
              <Field label="Development Priority" value={productPlan?.developmentPriority} accent="amber" />
            </>
          )}
        </DashboardCard>

        <DashboardCard
          icon={Cpu}
          title="Technical Architecture"
          accent="amber"
          className="md:col-span-2"
          delayIndex={2}
        >
          {isError(technicalArchitecture) ? (
            <ErrorNotice />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Frontend" value={technicalArchitecture?.frontend} accent="amber" />
              <Field label="Backend" value={technicalArchitecture?.backend} accent="amber" />
              <Field label="Database" value={technicalArchitecture?.database} accent="amber" />
              <Field label="Hosting" value={technicalArchitecture?.hosting} accent="amber" />
              <Field label="AI APIs" value={technicalArchitecture?.aiApis} accent="amber" />
              <Field label="Overview" value={technicalArchitecture?.architectureOverview} accent="amber" />
            </div>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Module: Business Strategy
// ---------------------------------------------------------------------------
function BusinessModule({ businessStrategy, costEstimator, revenueSimulator }) {
  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={Landmark}
        title="Business Strategy"
        description="How this makes money, and what it costs to run."
        accent="orange"
      />
      <DashboardCard icon={Landmark} title="Business Strategy" accent="orange" delayIndex={0}>
        {isError(businessStrategy) ? (
          <ErrorNotice />
        ) : (
          <>
            <Field label="Revenue Model" value={businessStrategy?.revenueModel} accent="orange" />
            <Field label="Pricing Strategy" value={businessStrategy?.pricingIdea} accent="orange" />
            <ListField label="Marketing Channels" items={businessStrategy?.marketingChannels} accent="orange" />
          </>
        )}
      </DashboardCard>

      <CostRevenueSection cost={costEstimator} revenue={revenueSimulator} accent="orange" delayIndex={1} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Module: Launch Strategy
// ---------------------------------------------------------------------------
function LaunchModule({ launchChecklist, pitch, roadmap }) {
  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={Rocket}
        title="Launch Strategy"
        description="The pitch, the plan, and what's left before you ship."
        accent="rose"
      />

      <div
        className="card-stagger p-7 rounded-3xl bg-gradient-to-br from-rose-600/15 to-purple-600/10 border border-rose-500/30 hover:border-rose-500/50 transition-colors"
        style={stagger(0)}
      >
        <p className="text-xs uppercase tracking-widest text-rose-400 font-bold mb-2">
          Investor Pitch
        </p>
        {isError(pitch) ? (
          <ErrorNotice />
        ) : (
          <>
            <p className="text-xl md:text-2xl font-bold text-white mb-4">
              {pitch?.elevatorPitch}
            </p>
            <p className="text-slate-300 leading-relaxed">{pitch?.executiveSummary}</p>
          </>
        )}
      </div>

      {!isError(launchChecklist) && launchChecklist?.length > 0 && (
        <LaunchChecklistSection items={launchChecklist} accent="rose" delayIndex={1} />
      )}

      <DashboardCard icon={MapIcon} title="Startup Roadmap" accent="rose" delayIndex={2}>
        {isError(roadmap) ? <ErrorNotice /> : <RoadmapTimeline roadmap={roadmap} accent="rose" />}
      </DashboardCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Go-to-Market Strategy
// ---------------------------------------------------------------------------
const CopyableCard = memo(function CopyableCard({ label, content, accent = "indigo" }) {
  const [copied, setCopied] = useState(false);
  if (!content) return null;

  function handleCopy() {
    navigator.clipboard?.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-4 hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1 text-xs ${ACCENT_TEXT[accent]} hover:opacity-80 transition-opacity`}
        >
          {copied ? (
            <>
              <Check size={12} /> Copied
            </>
          ) : (
            <>
              <Copy size={12} /> Copy
            </>
          )}
        </button>
      </div>
      <pre className="whitespace-pre-wrap break-words text-sm text-slate-200 leading-relaxed font-sans">
        {content}
      </pre>
    </div>
  );
});

function GoToMarketSection({ gtm, accent = "indigo", delayIndex }) {
  const a = ACCENT_TEXT[accent];
  return (
    <DashboardCard icon={Target} title="Go-to-Market Strategy" accent={accent} delayIndex={delayIndex}>
      <Field label="Target Audience" value={gtm.targetAudience} accent={accent} />

      {gtm.platforms?.length > 0 && (
        <div>
          <p className={`text-sm font-bold uppercase tracking-wide mb-3 flex items-center gap-2 ${a}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            Best Platforms to Reach Them
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {gtm.platforms.map((p, i) => (
              <div
                key={i}
                className="rounded-2xl bg-slate-950/60 border border-slate-800 p-4 hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-200"
              >
                <p className="text-sm font-semibold text-white mb-1">{p.name}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{p.why}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {gtm.linkedInSearchStrategy?.length > 0 && (
        <div>
          <p className={`text-sm font-bold uppercase tracking-wide mb-3 flex items-center gap-2 ${a}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            LinkedIn Search Strategy
          </p>
          <div className="flex flex-wrap gap-2">
            {gtm.linkedInSearchStrategy.map((query, i) => (
              <span
                key={i}
                className={`text-xs bg-slate-950/60 ${a} border border-slate-800 rounded-full px-3 py-1`}
              >
                {query}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className={`text-sm font-bold uppercase tracking-wide mb-3 flex items-center gap-2 ${a}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          Copy-Paste Templates
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <CopyableCard label="Cold Email Template" content={gtm.coldEmailTemplate} accent={accent} />
          <CopyableCard label="LinkedIn DM Template" content={gtm.linkedInDmTemplate} accent={accent} />
          <CopyableCard label="Reddit Launch Post" content={gtm.redditLaunchPost} accent={accent} />
          <CopyableCard label="X (Twitter) Launch Post" content={gtm.twitterLaunchPost} accent={accent} />
        </div>
      </div>
    </DashboardCard>
  );
}

// ---------------------------------------------------------------------------
// Launch Checklist — now with an animated progress bar.
// ---------------------------------------------------------------------------
function LaunchChecklistSection({ items, accent = "indigo", delayIndex }) {
  const [checked, setChecked] = useState(() => new Set());
  const percent = items.length ? Math.round((checked.size / items.length) * 100) : 0;

  function toggle(index) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <DashboardCard icon={ListTodo} title="Launch Checklist" accent={accent} delayIndex={delayIndex}>
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-slate-500">
            {checked.size} of {items.length} complete
          </p>
          <p className={`text-xs font-semibold ${ACCENT_TEXT[accent]}`}>{percent}%</p>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full ${ACCENT_BAR[accent]} transition-all duration-500 ease-out`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => (
          <label key={i} className="flex items-center gap-3 text-sm cursor-pointer group">
            <input
              type="checkbox"
              checked={checked.has(i)}
              onChange={() => toggle(i)}
              className={`h-4 w-4 rounded border-slate-700 bg-slate-900 ${ACCENT_CHECKBOX[accent]} ${ACCENT_RING[accent]} focus:ring-offset-0 cursor-pointer transition-transform duration-150 checked:scale-105`}
            />
            <span
              className={
                checked.has(i)
                  ? "text-slate-500 line-through"
                  : "text-slate-200 group-hover:text-white transition-colors"
              }
            >
              {item}
            </span>
          </label>
        ))}
      </div>
    </DashboardCard>
  );
}

// ---------------------------------------------------------------------------
// Roadmap timeline
// ---------------------------------------------------------------------------
function RoadmapTimeline({ roadmap, accent = "indigo" }) {
  const milestones = roadmap?.milestones || [];
  const a = ACCENT_TEXT[accent];
  const dotBg = ACCENT_DOT[accent];

  return (
    <div>
      <div className="relative border-l border-slate-800 ml-2 space-y-6">
        {milestones.map((m, i) => (
          <div
            key={i}
            className="card-stagger pl-6 relative"
            style={stagger(i, 100)}
          >
            <span className={`absolute -left-[7px] top-1 h-3 w-3 rounded-full ${dotBg} ring-4 ring-current/20 ${a}`} />
            <p className={`text-xs font-bold uppercase tracking-wide mb-0.5 ${a}`}>{m.week}</p>
            <p className="text-sm font-semibold text-white mb-1">{m.title}</p>
            <ul className="space-y-1">
              {(m.tasks || []).map((task, j) => (
                <li key={j} className="flex gap-2 text-sm text-slate-300">
                  <span className="text-slate-600 mt-0.5">›</span>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {roadmap?.launchPlan && (
        <div className="mt-6">
          <Field label="Launch Plan" value={roadmap.launchPlan} accent={accent} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cost Estimator + Revenue Simulator
// ---------------------------------------------------------------------------
const COST_LABELS = {
  domain: "Domain",
  hosting: "Hosting",
  database: "Database",
  aiApis: "AI APIs",
  email: "Email",
  analytics: "Analytics",
  storage: "Storage",
  authentication: "Authentication",
};

function CostRevenueSection({ cost, revenue, accent = "indigo", delayIndex }) {
  const a = ACCENT_TEXT[accent];
  return (
    <div className="space-y-6">
      <div
        className="card-stagger p-7 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
        style={stagger(delayIndex ?? 0)}
      >
        <h3 className="flex items-center gap-3 text-xl font-bold text-white mb-5">
          <span className={`flex items-center justify-center h-9 w-9 rounded-xl ${ACCENT_BG[accent]}`}>
            <Wallet size={18} className={a} />
          </span>
          Cost Estimator
        </h3>
        {isError(cost) ? (
          <ErrorNotice />
        ) : (
          cost && (
            <>
              <div className="flex flex-wrap gap-x-6 gap-y-1 mb-5">
                <p className="text-sm text-slate-300">
                  <span className="text-slate-500">Est. Monthly: </span>
                  <span className={`${a} font-semibold`}>{cost.estimatedMonthlyCost}</span>
                </p>
                <p className="text-sm text-slate-300">
                  <span className="text-slate-500">Est. Yearly: </span>
                  <span className={`${a} font-semibold`}>{cost.estimatedYearlyCost}</span>
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(COST_LABELS).map(([key, label]) => {
                  const item = cost[key];
                  if (!item) return null;
                  return (
                    <div
                      key={key}
                      className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {label}
                        </p>
                        {item.freeTierSufficient && (
                          <span className="shrink-0 text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800 rounded-full px-2 py-0.5">
                            Free tier OK
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-slate-200 mb-1">{item.monthlyCost}</p>
                      <p className="text-xs text-slate-500 leading-relaxed">{item.note}</p>
                    </div>
                  );
                })}
              </div>
            </>
          )
        )}
      </div>

      <div
        className="card-stagger p-7 rounded-3xl bg-slate-900/60 border border-slate-800"
        style={stagger((delayIndex ?? 0) + 1)}
      >
        <h3 className="flex items-center gap-3 text-xl font-bold text-white mb-5">
          <span className={`flex items-center justify-center h-9 w-9 rounded-xl ${ACCENT_BG[accent]}`}>
            <BarChart3 size={18} className={a} />
          </span>
          Revenue Simulator
        </h3>
        {isError(revenue) ? (
          <ErrorNotice />
        ) : (
          revenue && (
            <>
              {revenue.pricingAssumption && (
                <p className="text-xs text-slate-500 mb-4">
                  Assumption: {revenue.pricingAssumption}
                </p>
              )}
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-950/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3">Users</th>
                      <th className="px-4 py-3">Monthly Revenue</th>
                      <th className="px-4 py-3">Annual Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(revenue.projections || []).map((p, i) => (
                      <tr key={i} className="border-t border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 transition-colors">
                        <td className="px-4 py-3 text-slate-200 font-medium">
                          {typeof p.users === "number" ? p.users.toLocaleString() : p.users}
                        </td>
                        <td className={`px-4 py-3 ${a}`}>{p.monthlyRevenue}</td>
                        <td className={`px-4 py-3 ${a}`}>{p.annualRevenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Competitor Weakness Analysis
// ---------------------------------------------------------------------------
function CompetitorWeaknessSection({ analysis, accent = "indigo", delayIndex }) {
  const a = ACCENT_TEXT[accent];
  return (
    <div
      className="card-stagger p-7 rounded-3xl bg-slate-900/60 border border-slate-800"
      style={stagger(delayIndex ?? 0)}
    >
      <h3 className="flex items-center gap-3 text-xl font-bold text-white mb-5">
        <span className={`flex items-center justify-center h-9 w-9 rounded-xl ${ACCENT_BG[accent]}`}>
          <Crosshair size={18} className={a} />
        </span>
        Competitor Weakness Analysis
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analysis.map((c, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-200"
          >
            <p className="text-sm font-bold text-white mb-3">{c.competitor}</p>
            <div className="space-y-4">
              <ListField label="Weaknesses" items={c.weaknesses} accent={accent} />
              <ListField label="Missed Opportunities" items={c.missedOpportunities} accent={accent} />
              <Field label="Suggested Differentiation" value={c.suggestedDifferentiation} accent={accent} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}