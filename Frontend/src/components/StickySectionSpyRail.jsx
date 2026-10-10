// StickySectionSpyRail.jsx
// ---------------------------------------------------------------------------
// Precision Sticky Section Spy Rail & AI Agent Telemetry Header:
// Tracks real-time scroll progression across all 7 institutional blueprint stages,
// showcases the active specialized AI Agent co-founder for each section, provides
// one-click smooth anchor jumps, and supports toggling between 'Continuous Story'
// and 'Single Section Focused' views.
// ---------------------------------------------------------------------------
import { useRef, useEffect, memo } from "react";
import { BUSINESS_SECTIONS } from "./BlueprintDashboard.jsx";
import {
  Sparkles,
  SlidersHorizontal,
  Bot,
} from "lucide-react";

function StickySectionSpyRail({
  activeSection = "overview",
  onSelectSection,
  displayMode = "continuous",
  onToggleDisplayMode,
}) {
  const railScrollRef = useRef(null);

  const currentIndex = Math.max(
    0,
    BUSINESS_SECTIONS.findIndex((s) => s.id === activeSection)
  );
  const currentSection = BUSINESS_SECTIONS[currentIndex] || BUSINESS_SECTIONS[0];
  const progressPercent = Math.round(((currentIndex + 1) / BUSINESS_SECTIONS.length) * 100);

  // Auto-scroll the active pill horizontally into view within the rail only.
  // Uses boundingClientRect math to avoid scrollIntoView() hijacking page position.
  useEffect(() => {
    const rail = railScrollRef.current;
    if (!rail) return;
    const activeBtn = rail.querySelector(`[data-rail-section-id="${activeSection}"]`);
    if (!activeBtn) return;
    const railRect = rail.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    const targetLeft =
      rail.scrollLeft +
      (btnRect.left - railRect.left) -
      (rail.clientWidth - btnRect.width) / 2;
    rail.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
  }, [activeSection]);

  return (
    <nav
      aria-label="Blueprint Navigation Rail"
      className="sticky top-0 z-20 -mx-4 sm:-mx-8 px-4 sm:px-8 py-2.5 sticky-glass-rail shadow-xs transition-all border-b border-slate-200/80 backdrop-blur-md bg-white/90"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Section Progress Badge, Stage Title & Active AI Agent */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="h-7 w-7 rounded-lg bg-orange-600 text-white font-mono font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
              {currentSection.numeral || `0${currentIndex + 1}`}
            </span>
            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                  Stage {currentIndex + 1} of {BUSINESS_SECTIONS.length} • {progressPercent}% Read
                </span>
                {/* Active Agent Specialist Pill */}
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-orange-50 text-orange-700 border border-orange-200/80">
                  <Bot size={10} className="text-orange-500 animate-pulse" />
                  <span className="truncate max-w-[140px] sm:max-w-[200px]">
                    {currentSection.agentShort || currentSection.agent || "Specialist Agent"}
                  </span>
                </span>
              </div>
              <span className="text-xs font-bold text-slate-900 truncate max-w-[220px] sm:max-w-xs block mt-0.5">
                {currentSection.label}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Scrollable 7-Stage Pill Rail */}
        <div
          ref={railScrollRef}
          className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-1 min-w-0"
        >
          {BUSINESS_SECTIONS.map((sec, idx) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                data-rail-section-id={sec.id}
                aria-current={isActive ? "location" : undefined}
                onClick={() => onSelectSection?.(sec.id)}
                className={`group shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs font-bold ring-2 ring-orange-500/40"
                    : "bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900"
                }`}
                title={`${sec.title} — Specialist: ${sec.agent || "AI Co-Founder"}`}
              >
                <span
                  className={`text-[10px] font-mono px-1 rounded ${
                    isActive
                      ? "bg-orange-500 text-white font-bold"
                      : "text-slate-400 group-hover:text-slate-600"
                  }`}
                >
                  {sec.numeral || `0${idx + 1}`}
                </span>
                <span className="truncate">{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: View Mode Toggle (Continuous vs Focused) */}
        <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-200/80">
          <button
            type="button"
            onClick={onToggleDisplayMode}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-white border border-slate-200 hover:border-orange-300 text-slate-700 hover:text-orange-600 transition-colors cursor-pointer shadow-2xs"
            title={
              displayMode === "continuous"
                ? "Switch to Single Section Focused View"
                : "Switch to Continuous Story Flow View"
            }
          >
            <SlidersHorizontal size={12} className="text-orange-500" />
            <span>
              {displayMode === "continuous" ? "Continuous Story" : "Single Section"}
            </span>
          </button>
        </div>
      </div>

      {/* Thin Micro-Progress Line along bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-200/80 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </nav>
  );
}

export default memo(StickySectionSpyRail);
