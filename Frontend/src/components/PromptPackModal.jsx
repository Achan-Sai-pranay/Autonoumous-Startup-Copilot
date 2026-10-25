// components/PromptPackModal.jsx
// ---------------------------------------------------------------------------
// 1-Click AI Prompt Pack Export Modal (Available to All Founders)
// Generates ready-to-paste .cursorrules, Lovable.dev, Bolt.new, and v0 prompts.
// Mac code-editor window: sliding pill tabs, line numbers, light syntax
// styling and a floating Copy Prompt dock.
// Styling: auth.css (shared tokens) + prompt.css
// ---------------------------------------------------------------------------
import { useState, useEffect, useMemo } from "react";
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
import "../styles/auth.css";
import "../styles/prompt.css";

/* ------------------------- lightweight highlighter ------------------------ */

const INLINE_RE = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(https?:\/\/[^\s)>\]]+)/g;

function inline(text, keyBase) {
  if (!text) return null;
  const out = [];
  let last = 0;
  let m;
  let n = 0;
  INLINE_RE.lastIndex = 0;
  while ((m = INLINE_RE.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const cls = m[1] ? "tk-code" : m[2] ? "tk-strong" : "tk-url";
    out.push(
      <span className={cls} key={`${keyBase}-${n++}`}>
        {m[0]}
      </span>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function highlight(content) {
  const lines = (content || "").replace(/\r/g, "").split("\n");
  let inFence = false;

  const nodes = lines.map((line, i) => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return <span className="tk-dim" key={`f-${i}`}>{line}</span>;
    }
    if (inFence) return <span className="tk-fence" key={`fc-${i}`}>{line}</span>;
    if (/^\s*#{1,6}(\s|$)/.test(line)) return <span className="tk-h" key={`h-${i}`}>{line}</span>;
    if (/^\s*>/.test(line)) return <span className="tk-quote" key={`q-${i}`}>{line}</span>;
    if (/^\s*(---+|\*\*\*+|___+)\s*$/.test(line) || /^\s*<!--/.test(line)) {
      return <span className="tk-dim" key={`d-${i}`}>{line}</span>;
    }

    let m = line.match(/^(\s*)([-*•]|\d+[.)])(\s+)(.*)$/);
    if (m) {
      return (
        <span key={`b-row-${i}`}>
          {m[1]}
          <span className="tk-b">{m[2]}</span>
          {m[3]}
          {inline(m[4], `b${i}`)}
        </span>
      );
    }

    m = line.match(/^(\s*)([A-Za-z][\w &/().-]{0,32}):(\s.*|)$/);
    if (m) {
      return (
        <span key={`k-row-${i}`}>
          {m[1]}
          <span className="tk-key">{m[2]}:</span>
          {inline(m[3], `k${i}`)}
        </span>
      );
    }

    return <span key={`l-row-${i}`}>{inline(line, `l${i}`)}</span>;
  });

  return nodes;
}

/* --------------------------------- modal ---------------------------------- */

export default function PromptPackModal({
  isOpen,
  onClose,
  idea,
  blueprint,
  onToast = () => {},
  theme = "light", // "light" | "dark" (the code window is always dark)
}) {
  const [activeTab, setActiveTab] = useState("cursor"); // "cursor" | "lovable" | "v0" | "master"
  const [copied, setCopied] = useState(false);

  const pack = useMemo(
    () => (isOpen ? generatePromptPack(idea, blueprint) : null),
    [isOpen, idea, blueprint]
  );

  const tabs = useMemo(
    () =>
      pack
        ? [
            { id: "cursor", label: "Cursor (.cursorrules)", short: "Cursor", icon: Terminal, content: pack.cursorRules, filename: ".cursorrules" },
            { id: "lovable", label: "Lovable & Bolt.new", short: "Lovable", icon: Layers, content: pack.lovableBoltPrompt, filename: "lovable-prompt.md" },
            { id: "v0", label: "v0.dev UI Prompt", short: "v0.dev", icon: Sparkles, content: pack.v0Prompt, filename: "v0-prompt.md" },
            { id: "master", label: "7-Stage Master Prompt", short: "Master", icon: FileCode, content: pack.masterSystemPrompt, filename: "master-system-prompt.md" },
          ]
        : [],
    [pack]
  );

  const activeIndex = Math.max(0, tabs.findIndex((t) => t.id === activeTab));
  const currentTab = tabs[activeIndex];
  const content = currentTab?.content || "";

  const lines = useMemo(() => highlight(content), [content]);

  // Esc to close + lock page scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !currentTab) return null;

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

  const lnWidth = `${String(lines.length).length}ch`;

  return (
    <div
      className="ax-overlay"
      data-theme={theme}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="ax-card pp-card" role="dialog" aria-modal="true" aria-labelledby="pp-title">
        {/* Header */}
        <div className="ax-head">
          <div className="pp-brand">
            <span className="pp-brand-icon">
              <Code size={18} />
            </span>
            <div>
              <div className="pp-title-row">
                <h2 className="pp-title" id="pp-title">Export to AI Builders</h2>
                <span className="pp-pill">All Tiers Included</span>
              </div>
              <p className="pp-caption">
                Bridge the gap from validated blueprint to shipping code in seconds.
              </p>
            </div>
          </div>
          <button type="button" className="ax-close" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <div className="pp-body">
          {/* Sliding pill tabs */}
          <div className="pp-seg" role="tablist" style={{ "--i": activeIndex }}>
            <span className="pp-seg-pill" />
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCopied(false);
                  }}
                >
                  <Icon size={14} />
                  <span className="pp-full">{tab.label}</span>
                  <span className="pp-short">{tab.short}</span>
                </button>
              );
            })}
          </div>

          {/* Mac-style code editor */}
          <div className="pp-window">
            <div className="pp-bar">
              <div className="pp-dots">
                <button
                  type="button"
                  className="pp-dot pp-dot--r"
                  onClick={onClose}
                  aria-label="Close"
                />
                <span className="pp-dot pp-dot--y" aria-hidden="true" />
                <span className="pp-dot pp-dot--g" aria-hidden="true" />
              </div>

              <div className="pp-file" key={currentTab.id}>
                <FileCode size={13} />
                <span>{currentTab.filename}</span>
              </div>

              <div className="pp-stats">
                {copied ? (
                  <span className="pp-copied">
                    <Check size={12} strokeWidth={3} /> Copied
                  </span>
                ) : (
                  <span>
                    {lines.length} lines · {content.length.toLocaleString()} characters
                  </span>
                )}
              </div>
            </div>

            <div className="pp-scroll" key={currentTab.id} style={{ "--lnw": lnWidth }}>
              {lines.map((node, i) => (
                <div className="pp-line" key={i}>
                  <span className="pp-ln" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className="pp-code">{node}</span>
                </div>
              ))}
            </div>

            {/* Floating dock */}
            <div className="pp-dock-wrap">
              <div className="pp-dock">
                <button type="button" className="pp-ghost" onClick={handleDownload}>
                  <Download size={15} />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  className="pp-copy"
                  data-copied={copied}
                  onClick={handleCopy}
                >
                  {copied ? <Check size={15} strokeWidth={2.6} key="c" /> : <Copy size={15} key="n" />}
                  <span>{copied ? "Copied" : "Copy Prompt"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Where to paste it */}
          <div className="pp-foot">
            {activeTab === "cursor" && (
              <span>
                Drop into your repository root as <code>.cursorrules</code>
              </span>
            )}
            {activeTab === "lovable" && (
              <a href="https://lovable.dev" target="_blank" rel="noreferrer">
                Open Lovable.dev <ExternalLink size={12} />
              </a>
            )}
            {activeTab === "v0" && (
              <a href="https://v0.dev" target="_blank" rel="noreferrer">
                Open v0.dev <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
