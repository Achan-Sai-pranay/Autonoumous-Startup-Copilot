// StickySectionSpyRail.jsx
// ---------------------------------------------------------------------------
// Precision Sticky Section Spy Rail & Progress Header:
// Tracks real-time scroll progression across all 7 institutional blueprint stages,
// provides one-click smooth anchor jumps, and supports toggling between
// 'Continuous Story' and 'Single Section Focused' views.
// ---------------------------------------------------------------------------
import { useRef, useEffect } from "react";
import { BUSINESS_SECTIONS } from "./BlueprintDashboard.jsx";
import {
  Layers,
  Sparkles,
  ChevronRight,
  SlidersHorizontal,
  Compass,
} from "lucide-react";

export default function StickySectionSpyRail({
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

  // Auto-scroll the active pill into view within the horizontal rail
  useEffect(() => {
    if (!railScrollRef.current) return;
    const activeBtn = railScrollRef.current.querySelector(`[data-section-id="${activeSection}"]`);
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeSection]);

  return (
    <div className="sticky top-0 z-20 -mx-4 sm:-mx-8 px-4 sm:px-8 py-2.5 sticky-glass-rail shadow-xs transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Section Progress Badge & Stage Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="h-6 w-6 rounded-lg bg-orange-600 text-white font-mono font-bold flex items-center justify-center text-[11px] shadow-xs">
              0{currentIndex + 1}
            </span>
            <div className="leading-tight">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                Stage {currentIndex + 1} of {BUSINESS_SECTIONS.length} • {progressPercent}% Read
              </span>
              <span className="text-xs font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs block">
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
                data-section-id={sec.id}
                onClick={() => onSelectSection?.(sec.id)}
                className={`group shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs font-bold ring-2 ring-orange-500/30"
                    : "bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900"
                }`}
                title={sec.title}
              >
                <span
                  className={`text-[10px] font-mono px-1 rounded ${
                    isActive ? "bg-orange-500 text-white font-bold" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                >
                  0{idx + 1}
                </span>
                <span className="truncate">{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: View Mode Toggle */}
        <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-200">
          <button
            type="button"
            onClick={onToggleDisplayMode}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-slate-200 hover:border-orange-300 text-slate-700 hover:text-orange-600 transition-colors cursor-pointer shadow-2xs"
            title={
              displayMode === "continuous"
                ? "Switch to Single Section Focused Mode"
                : "Switch to Continuous Story Flow Mode"
            }
          >
            <SlidersHorizontal size={12} className="text-orange-500" />
            <span>
              {displayMode === "continuous" ? "Continuous Story Flow" : "Single Section View"}
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
    </div>
  );
}
