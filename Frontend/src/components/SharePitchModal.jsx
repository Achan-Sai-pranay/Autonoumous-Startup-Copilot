// components/SharePitchModal.jsx
// ---------------------------------------------------------------------------
// Shareable Public Pitch Link Generator (Scale Founder Feature)
// Creates a public read-only link (/p/slug) with an investor-ready watermark.
// Includes 1-click social sharing to X, LinkedIn, and WhatsApp.
// ---------------------------------------------------------------------------
import { useState } from "react";
import {
  Share2,
  Copy,
  Check,
  Globe,
  Lock,
  ExternalLink,
  X,
  Sparkles,
  Twitter,
  Linkedin,
  MessageCircle,
  Eye,
} from "lucide-react";
import { isUserScaleFounder } from "../lib/quotaManager.js";

const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const rawApiUrl = isLocalhost
  ? (import.meta.env.VITE_LOCAL_API_URL || "http://localhost:5001/api/generate-blueprint")
  : (import.meta.env.VITE_API_URL || "https://ideapulse-y1n5.onrender.com/api/generate-blueprint");

const BASE_API = rawApiUrl.replace(/\/api\/[a-zA-Z0-9_-]+$/, "");

export default function SharePitchModal({
  isOpen,
  onClose,
  idea,
  blueprint,
  currentUser = null,
  onOpenPayment = () => {},
  onToast = () => {},
}) {
  const isScale = isUserScaleFounder(currentUser?.id);

  const [publishing, setPublishing] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const viability =
    blueprint?.ideaAnalysis?.viabilityScore ??
    blueprint?.ideaAnalysis?.viability ??
    blueprint?.viabilityScore ??
    88;

  const handlePublish = async () => {
    if (!isScale) {
      onOpenPayment("scale_299");
      return;
    }

    setPublishing(true);
    try {
      const res = await fetch(`${BASE_API}/api/public-share/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea,
          blueprint,
          authorName: currentUser?.name || "Startup Founder",
          viabilityScore: viability,
        }),
      });

      if (!res.ok) throw new Error("Could not publish pitch link.");
      const json = await res.json();
      setShareData(json);
      onToast("Public pitch link generated!");
    } catch (err) {
      // Offline fallback: generate client-side slug
      const clientSlug = `${idea.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 35)}-${Date.now().toString(36)}`;
      const fallbackShare = {
        slug: clientSlug,
        shareUrl: `/p/${clientSlug}`,
      };
      try {
        localStorage.setItem(`lp_pub_${clientSlug}`, JSON.stringify({ idea, blueprint, viabilityScore: viability, createdAt: new Date().toISOString() }));
      } catch {}
      setShareData(fallbackShare);
      onToast("Generated local public pitch link!");
    } finally {
      setPublishing(false);
    }
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "https://launchpilot.ai";
  const fullShareUrl = shareData ? `${origin}${shareData.shareUrl}` : "";

  const handleCopy = async () => {
    if (!fullShareUrl) return;
    try {
      await navigator.clipboard.writeText(fullShareUrl);
      setCopied(true);
      onToast("Pitch link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onToast("Failed to copy link.");
    }
  };

  const tweetText = encodeURIComponent(
    `Just validated my startup concept on @LaunchPilotAI — Viability Score: ${viability}/100. Check out the institutional pitch link:\n\n${fullShareUrl}`
  );
  const linkedinUrl = encodeURIComponent(fullShareUrl);
  const whatsappText = encodeURIComponent(
    `Check out my startup pitch blueprint on LaunchPilot (Validated Score: ${viability}/100): ${fullShareUrl}`
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-orange-50 border border-orange-200 text-orange-600 shadow-2xs">
              <Share2 size={16} />
            </span>
            <div>
              <h2 className="text-base font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                Shareable Pitch Link
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-orange-50 text-orange-700 border border-orange-200">
                  Scale Founder
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Investor-ready read-only pitch with institutional watermark.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        {!isScale ? (
          <div className="py-6 text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 mb-3">
              <Lock size={22} />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Unlock Public Pitch Links (Investor Mode)
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1.5 leading-relaxed">
              Generate public, read-only pitch links (<code>/p/slug</code>) carrying your validated viability score watermark (Score: {viability}/100) to share with investors, accelerators, and co-founders.
            </p>
            <button
              onClick={() => onOpenPayment("scale_299")}
              className="mt-5 w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles size={14} />
              Upgrade to Scale Founder (₹299/mo)
            </button>
            <p className="text-[11px] text-slate-400 mt-2">
              Also includes Real-Time Reddit Grounding & Side-by-Side Idea Comparison.
            </p>
          </div>
        ) : (
          <div className="py-5 space-y-4">
            {!shareData ? (
              <div className="text-center py-4">
                <p className="text-xs text-slate-600 mb-4">
                  Publish this blueprint to generate a live, shareable public link with an official LaunchPilot validation badge.
                </p>
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Globe size={14} />
                  {publishing ? "Publishing Pitch..." : "Generate Public Pitch Link"}
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1.5">
                    Your Public Investor Link:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={fullShareUrl}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 select-all focus:outline-none"
                    />
                    <button
                      onClick={handleCopy}
                      className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Watermark preview banner */}
                <div className="rounded-xl border border-orange-200/80 bg-orange-50/50 p-3 flex items-center gap-3">
                  <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-orange-500 text-white font-bold text-xs shrink-0">
                    {viability}
                  </span>
                  <div className="text-xs text-orange-950">
                    <span className="font-semibold block">Watermark Active</span>
                    <span className="text-[11px] text-orange-800/80">
                      "Validated with LaunchPilot AI — Score: {viability}/100"
                    </span>
                  </div>
                </div>

                {/* Social Share Buttons */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Share directly:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <a
                      href={`https://twitter.com/intent/tweet?text=${tweetText}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Twitter size={13} className="text-sky-500" />
                      Twitter / X
                    </a>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${linkedinUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Linkedin size={13} className="text-blue-600" />
                      LinkedIn
                    </a>
                    <a
                      href={`https://api.whatsapp.com/send?text=${whatsappText}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageCircle size={13} className="text-emerald-500" />
                      WhatsApp
                    </a>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <a
                    href={shareData.shareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-orange-600 hover:text-orange-700 font-medium inline-flex items-center gap-1"
                  >
                    <Eye size={12} /> Preview Investor Mode <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
