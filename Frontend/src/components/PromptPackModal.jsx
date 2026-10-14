// components/PromptPackModal.jsx
// ---------------------------------------------------------------------------
// 1-Click AI Prompt Pack Export Modal (Available to All Founders)
// Generates ready-to-paste .cursorrules, Lovable.dev, Bolt.new, and v0 prompts.
// Apple-inspired minimalist design with tabs, code preview, and 1-click copy.
// ---------------------------------------------------------------------------
import { useState } from "react";
import {
  Code,
  Copy,
  Check,
  Download,
  X,
  Sparkles,
  Terminal,
  Layers,
  FileCode,
  ExternalLink,
} from "lucide-react";
import { generatePromptPack } from "../lib/promptPackGenerator.js";

export default function PromptPackModal({ isOpen, onClose, idea, blueprint, onToast = () => {} }) {
  const [activeTab, setActiveTab] = useState("cursor"); // "cursor" | "lovable" | "v0" | "master"
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const pack = generatePromptPack(idea, blueprint);

  const tabs = [
    { id: "cursor", label: "Cursor (.cursorrules)", icon: Terminal, content: pack.cursorRules, filename: ".cursorrules" },
    { id: "lovable", label: "Lovable & Bolt.new", icon: Layers, content: pack.lovableBoltPrompt, filename: "lovable-prompt.md" },
    { id: "v0", label: "v0.dev UI Prompt", icon: Sparkles, content: pack.v0Prompt, filename: "v0-prompt.md" },
    { id: "master", label: "7-Stage Master Prompt", icon: FileCode, content: pack.masterSystemPrompt, filename: "master-system-prompt.md" },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentTab.content);
      setCopied(true);
      onToast(`Copied ${currentTab.label} to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onToast("Unable to copy to clipboard.");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([currentTab.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = currentTab.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onToast(`Downloaded ${currentTab.filename}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[90vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-orange-50 border border-orange-200 text-orange-600 shadow-2xs">
              <Code size={17} />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                Export to AI Builders
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  All Tiers Included
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                Bridge the gap from validated blueprint to shipping code in seconds.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={17} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon size={13} className={isActive ? "text-orange-400" : "text-slate-400"} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Code Content Box */}
        <div className="flex-1 overflow-hidden p-5 flex flex-col bg-slate-900 text-slate-100">
          <div className="flex items-center justify-between pb-3 text-xs text-slate-400 font-mono border-b border-slate-800">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {currentTab.filename}
            </span>
            <span>{currentTab.content.length} characters</span>
          </div>

          <div className="flex-1 overflow-y-auto mt-3 rounded-lg bg-slate-950/70 p-3.5 border border-slate-800 font-mono text-[12px] leading-relaxed text-slate-300 selection:bg-orange-500 selection:text-white">
            <pre className="whitespace-pre-wrap font-inherit">{currentTab.content}</pre>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {activeTab === "cursor" && <span>Drop into your repository root as <code>.cursorrules</code></span>}
            {activeTab === "lovable" && (
              <a
                href="https://lovable.dev"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-slate-700 hover:text-orange-600 transition-colors font-medium"
              >
                Open Lovable.dev <ExternalLink size={12} />
              </a>
            )}
            {activeTab === "v0" && (
              <a
                href="https://v0.dev"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-slate-700 hover:text-orange-600 transition-colors font-medium"
              >
                Open v0.dev <ExternalLink size={12} />
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={13} />
              Download File
            </button>
            <button
              onClick={handleCopy}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-orange-600 hover:bg-orange-700 text-white"
              }`}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copied!" : "Copy to Clipboard"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
