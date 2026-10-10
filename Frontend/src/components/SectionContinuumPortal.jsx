// SectionContinuumPortal.jsx
// ---------------------------------------------------------------------------
// Seamless Gateway between Blueprint Sections:
// Replaces dead-end scrolling with an interactive, animated transition card
// that invites the founder to glide into the next intelligence stage.
// ---------------------------------------------------------------------------
import { ChevronDown, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export default function SectionContinuumPortal({
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
  return (
    <div className="relative my-10 pt-6 pb-2">
      {/* Decorative center divider */}
      <div className="relative flex items-center justify-center mb-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-dashed border-slate-200" />
        </div>
        <div className="relative flex items-center gap-2 bg-slate-50 px-4 text-xs text-slate-400 font-mono">
          <CheckCircle2 size={13} className="text-emerald-500" />
          <span>Stage {currentSectionNumber} of {totalSections} Reviewed</span>
        </div>
      </div>

      {/* Interactive Next-Section Gateway Card */}
      <div
        onClick={() => onContinue?.(nextSectionId)}
        className="group relative overflow-hidden rounded-3xl bg-white border-2 border-slate-200/90 hover:border-orange-400 p-6 sm:p-7 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer text-left bg-shimmer-orange"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-2xl">
            {/* Top metadata pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200">
                <Sparkles size={11} className="text-orange-600" />
                Next Stage {nextSectionNumber} of {totalSections}
              </span>
              {nextSectionAgent && (
                <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  Specialist: <strong className="text-slate-700">{nextSectionAgent}</strong>
                </span>
              )}
            </div>

            {/* Title & Description */}
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight group-hover:text-orange-600 transition-colors flex items-center gap-2">
              <span>{nextSectionTitle}</span>
              <span className="text-orange-500 text-sm font-normal">→</span>
            </h3>

            {nextSectionSubtitle && (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                {nextSectionSubtitle}
              </p>
            )}
          </div>

          {/* Action Trigger Button & Scroll Cue */}
          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onContinue?.(nextSectionId);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 group-hover:scale-102 transition-all cursor-pointer active:scale-95"
            >
              <span>Continue to Stage {nextSectionNumber}</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400 group-hover:text-orange-600 transition-colors">
              <span>Or keep scrolling down</span>
              <ChevronDown size={13} className="animate-soft-bounce text-orange-500" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
