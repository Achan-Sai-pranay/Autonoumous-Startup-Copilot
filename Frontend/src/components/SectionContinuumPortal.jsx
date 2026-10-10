// SectionContinuumPortal.jsx
// ---------------------------------------------------------------------------
// Smooth Agent Continuity Gateway:
// Replaces jarring scroll-hijacks with an elegant, friction-free transition.
// Users can naturally scroll down without the page yanking or jumping, while
// still enjoying an informative preview of the upcoming AI Agent's intelligence
// report and an optional "Glide to Stage" accelerator.
// ---------------------------------------------------------------------------
import { memo } from "react";
import {
  ChevronDown,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Bot,
} from "lucide-react";

function SectionContinuumPortal({
  currentSectionNumber,
  totalSections = 7,
  currentSectionTitle,
  nextSectionId,
  nextSectionNumber,
  nextSectionTitle,
  nextSectionSubtitle,
  nextSectionAgent,
  onContinue,
}) {
  const handleGlide = (e) => {
    e?.stopPropagation?.();
    onContinue?.(nextSectionId);
  };

  return (
    <div className="relative my-12 sm:my-16">
      {/* Decorative center divider with stage completion status */}
      <div className="relative flex items-center justify-center mb-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-dashed border-slate-200/90" />
        </div>
        <div className="relative flex items-center gap-2 bg-slate-50 px-4 py-1 rounded-full border border-slate-200 text-xs font-mono text-slate-500 shadow-2xs">
          <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
          <span>
            Stage {currentSectionNumber} of {totalSections} Reviewed
            {currentSectionTitle ? ` • ${currentSectionTitle}` : ""}
          </span>
        </div>
      </div>

      {/* Interactive Next-Stage Gateway Card */}
      <div
        onClick={handleGlide}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleGlide(e);
          }
        }}
        className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white border border-slate-200 hover:border-orange-400 p-5 sm:p-7 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-orange-500/40"
      >
        {/* Subtle orange ambient glow on hover */}
        <div className="absolute -right-20 -top-20 w-52 h-52 bg-orange-400/5 rounded-full blur-3xl pointer-events-none group-hover:bg-orange-400/10 transition-colors" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2.5 max-w-2xl">
            {/* Top metadata pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-200">
                <Sparkles size={11} className="text-orange-500" />
                Entering Stage {nextSectionNumber} of {totalSections}
              </span>
              {nextSectionAgent && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-600 bg-slate-100/90 px-2.5 py-0.5 rounded-full border border-slate-200/60">
                  <Bot size={12} className="text-orange-600" />
                  Specialist: <strong className="text-slate-800">{nextSectionAgent}</strong>
                </span>
              )}
            </div>

            {/* Title & Directional Arrow */}
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight group-hover:text-orange-600 transition-colors flex items-center gap-2">
              <span>{nextSectionTitle}</span>
              <span className="text-orange-500 text-sm font-normal group-hover:translate-x-1 transition-transform">
                →
              </span>
            </h3>

            {/* Stage Description / Thesis */}
            {nextSectionSubtitle && (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                {nextSectionSubtitle}
              </p>
            )}
          </div>

          {/* Action Button & Smooth Scroll Prompt */}
          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <button
              type="button"
              onClick={handleGlide}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-orange-600 text-white font-semibold text-xs sm:text-sm shadow-sm group-hover:shadow-md transition-all cursor-pointer active:scale-95"
            >
              <span>Glide to Stage {nextSectionNumber}</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400 group-hover:text-orange-600 transition-colors">
              <span>Or keep scrolling down</span>
              <ChevronDown size={13} className="text-orange-500 animate-bounce" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(SectionContinuumPortal);
