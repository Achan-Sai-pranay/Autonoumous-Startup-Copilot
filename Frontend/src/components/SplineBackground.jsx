// components/SplineBackground.jsx
// ---------------------------------------------------------------------------
// Full-screen animated 3D background using Spline. Lazy-loaded (code-split)
// so it never blocks the initial app bundle, and pointer-events-none so it
// never intercepts clicks, scroll, hover, or form interactions. Sits fixed
// behind everything else at z-0; app content is rendered at z-10 in App.jsx.
// ---------------------------------------------------------------------------
import { Suspense, lazy } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

// Get this from the Spline editor: File -> Export -> Code Export -> React,
// then copy the "scene" URL (looks like
// https://prod.spline.design/XXXXXXXXXXXXXXXXX/scene.splinecode).
// The community.spline.design link you shared is just the viewer page, so
// you'll need to open the scene in the Spline editor to grab this.
const SPLINE_SCENE_URL =
  "https://prod.spline.design/XXXXXXXXXXXXXXXXX/scene.splinecode";

export default function SplineBackground() {
  return (
    <div
      className="fixed inset-0 z-0 bg-slate-950 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <Suspense fallback={null}>
        <Spline scene={"https://prod.spline.design/sa4LtsCoSAMP0vOa/scene.splinecode"} className="w-full h-full" />
      </Suspense>
    </div>
  );
}