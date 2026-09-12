// components/SplineBackground.jsx
// ---------------------------------------------------------------------------
// Clean White + Orange Ambient Canvas: Zero-latency, GPU-composited atmospheric
// warm glow and soft dot-matrix backdrop matching VenturusAI light theme.
// ---------------------------------------------------------------------------
export default function SplineBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Top Center Warm Orange Spotlight */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] bg-gradient-to-b from-orange-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl opacity-70" />

      {/* Subtle secondary warm glows */}
      <div className="absolute top-1/4 -left-48 w-[600px] h-[500px] bg-orange-100/40 rounded-full blur-[120px] opacity-40" />
      <div className="absolute top-1/3 -right-48 w-[600px] h-[500px] bg-amber-100/40 rounded-full blur-[120px] opacity-40" />

      {/* Micro-dot grid texture */}
      <div className="absolute inset-0 bg-dot-grid opacity-30" />
    </div>
  );
}