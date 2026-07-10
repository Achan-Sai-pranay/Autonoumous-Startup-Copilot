// BlueprintDashboard.jsx
// ---------------------------------------------------------------------------
// Renders the full blueprint report returned by the backend.
//
// V2 CHANGES:
//   - New sections: Startup Score (animated bars), SWOT Analysis, Risk
//     Analysis, Budget Estimation, and the AI Critic review (all fed by the
//     new `criticReview` field the backend returns).
//   - Roadmap now renders as a milestone timeline instead of 3 flat weeks.
//   - Every card can gracefully show "Generation unavailable. Please
//     retry." instead of breaking if that agent failed on the backend.
//   - Added icons (lucide-react), hover effects, and entrance transitions.
// All helper components stay in this single file since they're only ever
// used here — keeping the file count the same as V1.
// ---------------------------------------------------------------------------
import { useEffect, useState } from "react";
import {
  Lightbulb,
  TrendingUp,
  Users,
  ListChecks,
  Cpu,
  Landmark,
  Map as MapIcon,
  Gauge,
  Grid2x2,
  ShieldAlert,
  Wallet,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

export default function BlueprintDashboard({ blueprint }) {
  const {
    ideaAnalysis,
    marketResearch,
    customerPersona,
    productPlan,
    technicalArchitecture,
    businessStrategy,
    pitch,
    roadmap,
    criticReview,
  } = blueprint;

  return (
    <div className="w-full max-w-6xl mx-auto mt-12 px-4 pb-24 animate-[fadeIn_0.4s_ease-out]">
      {/* Pitch section gets top billing — it's the headline. */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border border-indigo-500/30 hover:border-indigo-500/50 transition-colors">
        <p className="text-xs uppercase tracking-widest text-indigo-400 mb-2">
          Elevator Pitch
        </p>
        {isError(pitch) ? (
          <ErrorNotice />
        ) : (
          <>
            <p className="text-xl md:text-2xl font-semibold text-white mb-4">
              {pitch?.elevatorPitch}
            </p>
            <p className="text-slate-300 leading-relaxed">
              {pitch?.executiveSummary}
            </p>
          </>
        )}
      </div>

      {/* Startup Score */}
      {!isError(criticReview) && criticReview?.startupScore && (
        <ScoreBoard scores={criticReview.startupScore} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <DashboardCard icon={Lightbulb} title="Idea Analysis">
          {isError(ideaAnalysis) ? (
            <ErrorNotice />
          ) : (
            <>
              <Field label="Problem" value={ideaAnalysis?.problem} />
              <Field label="Goal" value={ideaAnalysis?.goal} />
              <Field label="Domain" value={ideaAnalysis?.domain} />
              <Field label="Feasibility" value={ideaAnalysis?.feasibility} />
            </>
          )}
        </DashboardCard>

        <DashboardCard icon={TrendingUp} title="Market Research">
          {isError(marketResearch) ? (
            <ErrorNotice />
          ) : (
            <>
              <ListField label="Competitors" items={marketResearch?.competitors} />
              <ListField label="Opportunities" items={marketResearch?.opportunities} />
              <Field label="Market Demand" value={marketResearch?.marketDemand} />
            </>
          )}
        </DashboardCard>

        <DashboardCard icon={Users} title="Customer Persona">
          {isError(customerPersona) ? (
            <ErrorNotice />
          ) : (
            <>
              <ListField label="Target Users" items={customerPersona?.targetUsers} />
              <ListField label="Pain Points" items={customerPersona?.painPoints} />
              <Field label="User Profile" value={customerPersona?.userProfile} />
            </>
          )}
        </DashboardCard>

        <DashboardCard icon={ListChecks} title="Product Plan">
          {isError(productPlan) ? (
            <ErrorNotice />
          ) : (
            <>
              <ListField label="MVP Features" items={productPlan?.mvpFeatures} />
              <ListField label="Future Features" items={productPlan?.futureFeatures} />
              <Field label="Priority" value={productPlan?.developmentPriority} />
            </>
          )}
        </DashboardCard>

        <DashboardCard icon={Cpu} title="Technical Architecture">
          {isError(technicalArchitecture) ? (
            <ErrorNotice />
          ) : (
            <>
              <Field label="Frontend" value={technicalArchitecture?.frontend} />
              <Field label="Backend" value={technicalArchitecture?.backend} />
              <Field label="Database" value={technicalArchitecture?.database} />
              <Field label="Hosting" value={technicalArchitecture?.hosting} />
              <Field label="AI APIs" value={technicalArchitecture?.aiApis} />
              <Field label="Overview" value={technicalArchitecture?.architectureOverview} />
            </>
          )}
        </DashboardCard>

        <DashboardCard icon={Landmark} title="Business Strategy">
          {isError(businessStrategy) ? (
            <ErrorNotice />
          ) : (
            <>
              <Field label="Revenue Model" value={businessStrategy?.revenueModel} />
              <Field label="Pricing Idea" value={businessStrategy?.pricingIdea} />
              <ListField label="Marketing Channels" items={businessStrategy?.marketingChannels} />
            </>
          )}
        </DashboardCard>
      </div>

      {/* SWOT Analysis */}
      {!isError(criticReview) && criticReview?.swot && (
        <SwotSection swot={criticReview.swot} />
      )}

      {/* Enhanced Roadmap */}
      <DashboardCard icon={MapIcon} title="Roadmap" className="mt-6">
        {isError(roadmap) ? (
          <ErrorNotice />
        ) : (
          <RoadmapTimeline roadmap={roadmap} />
        )}
      </DashboardCard>

      {/* Risk Analysis */}
      {!isError(criticReview) && criticReview?.riskAnalysis && (
        <RiskSection riskAnalysis={criticReview.riskAnalysis} />
      )}

      {/* Budget Estimation */}
      {!isError(criticReview) && criticReview?.budgetEstimation && (
        <BudgetSection budget={criticReview.budgetEstimation} />
      )}

      {/* AI Critic Review — always last */}
      <DashboardCard icon={Sparkles} title="AI Critic Review" className="mt-6">
        {isError(criticReview) ? (
          <ErrorNotice />
        ) : (
          <CriticReview critique={criticReview?.critique} />
        )}
      </DashboardCard>
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
    <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-950/30 border border-amber-900 rounded-lg px-3 py-2">
      <AlertTriangle size={16} className="shrink-0" />
      <span>Generation unavailable. Please retry.</span>
    </div>
  );
}

// Reusable card shell used for every section.
function DashboardCard({ icon: Icon, title, children, className = "" }) {
  return (
    <div
      className={`p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:shadow-lg hover:shadow-indigo-950/40 transition-all duration-300 ${className}`}
    >
      <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
        {Icon && <Icon size={18} className="text-indigo-400" />}
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

// Small labeled text block.
function Field({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
        {label}
      </p>
      <p className="text-sm text-slate-200 leading-relaxed">{value}</p>
    </div>
  );
}

// Small labeled bullet list.
function ListField({ label, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
        {label}
      </p>
      <ul className="list-disc list-inside space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-slate-200 leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Startup Score — animated horizontal bars
// ---------------------------------------------------------------------------
const SCORE_LABELS = {
  innovation: "Innovation",
  marketDemand: "Market Demand",
  technicalFeasibility: "Technical Feasibility",
  businessPotential: "Business Potential",
  investmentReadiness: "Investment Readiness",
  scalability: "Scalability",
};

function ScoreBoard({ scores }) {
  return (
    <DashboardCard icon={Gauge} title="Startup Score">
      <div className="flex items-center gap-4 mb-6">
        <div className="text-4xl font-bold text-indigo-400">
          {scores.overall ?? "—"}
        </div>
        <div className="text-sm text-slate-400">
          Overall Score <br /> out of 100
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {Object.entries(SCORE_LABELS).map(([key, label]) => (
          <ScoreBar key={key} label={label} value={scores[key] ?? 0} />
        ))}
      </div>
    </DashboardCard>
  );
}

function ScoreBar({ label, value }) {
  const [width, setWidth] = useState(0);

  // Animate from 0 to the real value shortly after mount.
  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), 150);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div>
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>{label}</span>
        <span>{value}/100</span>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SWOT Analysis — four color-coded cards
// ---------------------------------------------------------------------------
// Tailwind's JIT compiler only includes class names it can find as complete,
// static strings in the source — a template literal like `bg-${color}-950`
// would silently produce no styling in the production build. So each
// quadrant's full class list is written out explicitly here instead.
const SWOT_QUADRANTS = [
  {
    key: "strengths",
    label: "Strengths",
    card: "bg-emerald-950/20 border-emerald-900/50 hover:border-emerald-700",
    label_text: "text-emerald-400",
  },
  {
    key: "weaknesses",
    label: "Weaknesses",
    card: "bg-red-950/20 border-red-900/50 hover:border-red-700",
    label_text: "text-red-400",
  },
  {
    key: "opportunities",
    label: "Opportunities",
    card: "bg-sky-950/20 border-sky-900/50 hover:border-sky-700",
    label_text: "text-sky-400",
  },
  {
    key: "threats",
    label: "Threats",
    card: "bg-amber-950/20 border-amber-900/50 hover:border-amber-700",
    label_text: "text-amber-400",
  },
];

function SwotSection({ swot }) {
  return (
    <div className="mt-6">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4 px-1">
        <Grid2x2 size={18} className="text-indigo-400" />
        SWOT Analysis
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SWOT_QUADRANTS.map((q) => (
          <div
            key={q.key}
            className={`p-5 rounded-2xl border transition-colors ${q.card}`}
          >
            <p className={`text-sm font-semibold mb-2 ${q.label_text}`}>
              {q.label}
            </p>
            <ul className="list-disc list-inside space-y-1">
              {(swot[q.key] || []).map((item, i) => (
                <li key={i} className="text-sm text-slate-200 leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Enhanced Roadmap — milestone timeline
// ---------------------------------------------------------------------------
function RoadmapTimeline({ roadmap }) {
  const milestones = roadmap?.milestones || [];

  return (
    <div>
      <div className="relative border-l border-slate-800 ml-2 space-y-6">
        {milestones.map((m, i) => (
          <div key={i} className="pl-6 relative">
            <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20" />
            <p className="text-xs uppercase tracking-wide text-indigo-400 mb-0.5">
              {m.week}
            </p>
            <p className="text-sm font-semibold text-white mb-1">{m.title}</p>
            <ul className="list-disc list-inside space-y-0.5">
              {(m.tasks || []).map((task, j) => (
                <li key={j} className="text-sm text-slate-300">
                  {task}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {roadmap?.launchPlan && (
        <div className="mt-6">
          <Field label="Launch Plan" value={roadmap.launchPlan} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Risk Analysis — grouped cards with severity badges
// ---------------------------------------------------------------------------
const SEVERITY_STYLES = {
  Low: "bg-emerald-950/40 text-emerald-400 border-emerald-800",
  Medium: "bg-amber-950/40 text-amber-400 border-amber-800",
  High: "bg-red-950/40 text-red-400 border-red-800",
};

const RISK_CATEGORY_LABELS = {
  technical: "Technical Risks",
  business: "Business Risks",
  financial: "Financial Risks",
  market: "Market Risks",
};

function RiskSection({ riskAnalysis }) {
  return (
    <div className="mt-6">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4 px-1">
        <ShieldAlert size={18} className="text-indigo-400" />
        Risk Analysis
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(RISK_CATEGORY_LABELS).map(([key, label]) => (
          <div
            key={key}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <p className="text-sm font-semibold text-white mb-3">{label}</p>
            <div className="space-y-3">
              {(riskAnalysis[key] || []).map((risk, i) => (
                <div key={i} className="border-t border-slate-800 pt-3 first:border-t-0 first:pt-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <p className="text-sm text-slate-200">{risk.description}</p>
                    <span
                      className={`shrink-0 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                        SEVERITY_STYLES[risk.severity] || SEVERITY_STYLES.Medium
                      }`}
                    >
                      {risk.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Mitigation: {risk.mitigation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Budget Estimation — four stage cards
// ---------------------------------------------------------------------------
const BUDGET_LABELS = {
  prototype: "Prototype",
  mvp: "MVP",
  betaLaunch: "Beta Launch",
  fullProduct: "Full Product",
};

function BudgetSection({ budget }) {
  return (
    <div className="mt-6">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4 px-1">
        <Wallet size={18} className="text-indigo-400" />
        Budget Estimation
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(BUDGET_LABELS).map(([key, label]) => (
          <div
            key={key}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
              {label}
            </p>
            <p className="text-lg font-semibold text-indigo-400 mb-2">
              {budget[key]?.range || "—"}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              {budget[key]?.assumptions}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AI Critic Review
// ---------------------------------------------------------------------------
function CriticReview({ critique }) {
  if (!critique) return <ErrorNotice />;

  return (
    <>
      <ListField label="Weak Assumptions" items={critique.weakAssumptions} />
      <ListField label="Missing Features" items={critique.missingFeatures} />
      <ListField
        label="Overly Ambitious MVP Features"
        items={critique.overambitiousMvpFeatures}
      />
      <ListField label="Risks Identified" items={critique.risksIdentified} />
      <ListField label="Contradictions" items={critique.contradictions} />
      <ListField label="Suggestions" items={critique.suggestions} />
    </>
  );
}