// components/CoFounderChatDrawer.jsx
// ---------------------------------------------------------------------------
// Real-time Streaming AI Co-Founder Chat Drawer for LaunchPilot AI
// Features:
// 1. Slide-out right drawer with crisp White + Orange styling
// 2. Active Blueprint Context pill & telemetry
// 3. Real-time chunked token streaming from POST /api/consultant
// 4. Pre-set Strategic Action Chips (YC Partner Grill, Acquisition, Pricing, Cold Outreach)
// 5. Rich markdown formatting (lists, bolding, code) + 1-click Copy button
// ---------------------------------------------------------------------------
import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageSquare,
  Send,
  X,
  ChevronDown,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Flame,
  TrendingUp,
  Wallet,
  Mail,
  Cpu,
  Bot,
  User,
  PanelRightClose,
  Maximize2,
  Minimize2,
  AlertCircle,
} from "lucide-react";
import "./home.css";
import "./studio.css";

const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const rawApiUrl = isLocalhost
  ? (import.meta.env.VITE_LOCAL_API_URL || "http://localhost:5001/api/generate-blueprint")
  : (import.meta.env.VITE_API_URL || "https://ideapulse-y1n5.onrender.com/api/generate-blueprint");

const CONSULTANT_URL = rawApiUrl.includes("/api/")
  ? rawApiUrl.replace(/\/api\/[a-zA-Z0-9_-]+$/, "/api/consultant")
  : `${rawApiUrl.replace(/\/+$/, "")}/api/consultant`;

const STRATEGIC_CHIPS = [
  {
    label: "Grill me like a YC partner",
    icon: Flame,
    prompt:
      "Grill me like a veteran Y Combinator partner during batch office hours. Brutally critique our defensibility, market risk, and assumptions. Where are we most likely to fail, and what should we test immediately?",
  },
  {
    label: "Acquire first 20 customers",
    icon: TrendingUp,
    prompt:
      "Give me an aggressive, zero-dollar playbook to acquire our first 20 paying customers within the next 3 weeks. Be hyper-specific on which channels, exact search filters, and messaging hooks to use.",
  },
  {
    label: "Alternative B2B pricing models",
    icon: Wallet,
    prompt:
      "Analyze our pricing model and suggest 3 high-margin alternative B2B pricing structures (e.g. usage-based, tiered seat + value metric, performance-fee). Include exact recommended pricing tiers.",
  },
  {
    label: "Draft 3-step cold outreach",
    icon: Mail,
    prompt:
      "Draft a high-conversion 3-step cold outreach sequence (Email 1: High-pain teaser, Email 2: Social proof / ROI quantification, Email 3: 48-hour breakup hook) personalized for our target persona.",
  },
];

// Helper to format text with clean bolding, bullet points, and code snippets
function renderFormattedMessage(text) {
  if (!text) return null;

  // Split into paragraphs / lines
  const lines = text.split("\n");
  const elements = [];
  let inCodeBlock = false;
  let codeBuffer = [];

  lines.forEach((line, index) => {
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${index}`}
            className="my-2.5 p-3 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto border border-slate-800"
          >
            <code>{codeBuffer.join("\n")}</code>
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // Bullet line
    const bulletMatch = line.match(/^(\s*)[-*•]\s+(.*)$/);
    if (bulletMatch) {
      elements.push(
        <div key={index} className="flex items-start gap-2 text-xs sm:text-sm my-1 leading-relaxed text-slate-800">
          <span className="text-orange-500 font-bold select-none mt-0.5">›</span>
          <span className="flex-1">{formatInline(bulletMatch[2])}</span>
        </div>
      );
      return;
    }

    // Numbered line
    const numMatch = line.match(/^(\s*)(\d+\.)\s+(.*)$/);
    if (numMatch) {
      elements.push(
        <div key={index} className="flex items-start gap-2 text-xs sm:text-sm my-1 leading-relaxed text-slate-800">
          <span className="text-orange-600 font-mono text-[11px] font-bold select-none mt-0.5">{numMatch[2]}</span>
          <span className="flex-1">{formatInline(numMatch[3])}</span>
        </div>
      );
      return;
    }

    // Empty line
    if (!line.trim()) {
      elements.push(<div key={index} className="h-2" />);
      return;
    }

    // Normal paragraph
    elements.push(
      <p key={index} className="text-xs sm:text-sm my-1 leading-relaxed text-slate-800">
        {formatInline(line)}
      </p>
    );
  });

  if (inCodeBlock && codeBuffer.length > 0) {
    elements.push(
      <pre
        key="code-end"
        className="my-2.5 p-3 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto border border-slate-800"
      >
        <code>{codeBuffer.join("\n")}</code>
      </pre>
    );
  }

  return elements;
}

function formatInline(text) {
  // Bold matches: **word**
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function CoFounderChatDrawer({ blueprint = null, originalIdea = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [streamError, setStreamError] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Initialize welcoming greeting
  useEffect(() => {
    if (messages.length === 0) {
      const startupContext = blueprint?.ideaAnalysis?.domain || originalIdea.slice(0, 45) || null;
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: startupContext
            ? `👋 Hi founder! I've loaded your blueprint for **${startupContext}**.\n\nI'm your dedicated AI Co-Founder and YC-grade strategic partner. What would you like to stress-test or execute today?`
            : "👋 Hi founder! I'm your IdeaPulse AI Co-Founder.\n\nDescribe your business concept, ask me to grill your assumptions, or test your monetization strategy.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  }, [blueprint, originalIdea, messages.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming, isOpen]);

  // Listen for external open triggers (e.g. from sidebar)
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-cofounder-chat", handleOpen);
    return () => window.removeEventListener("open-cofounder-chat", handleOpen);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const handleCopy = useCallback((text, id) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  }, []);

  const handleClear = () => {
    if (isStreaming && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
    setStreamError(null);
    const startupContext = blueprint?.ideaAnalysis?.domain || originalIdea.slice(0, 45) || null;
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: startupContext
          ? `Chat cleared. Active context: **${startupContext}**. What's on your mind?`
          : "Chat cleared. What startup challenge can I assist you with?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const sendMessage = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isStreaming) return;

    setInput("");
    setStreamError(null);

    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now()}`;

    const userMsg = {
      id: userMessageId,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Prepare assistant placeholder for streaming tokens
    const placeholderAssistantMsg = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg, placeholderAssistantMsg]);
    setIsStreaming(true);

    try {
      abortControllerRef.current = new AbortController();

      // Build history payload
      const historyPayload = messages
        .filter((m) => m.id !== "welcome" && !m.id.startsWith("welcome-"))
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await fetch(CONSULTANT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
          blueprint,
          originalIdea,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content: accumulated } : msg
          )
        );
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Co-Founder stream failed:", err);
        setStreamError(err.message || "Failed to reach AI Co-Founder");
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId && !msg.content
              ? {
                  ...msg,
                  content:
                    "I had trouble connecting to the advisory server. Please ensure the backend is active on port 5001 and try asking again.",
                }
              : msg
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const activeStartupName =
    blueprint?.ideaAnalysis?.domain ||
    (originalIdea ? originalIdea.slice(0, 36) + "..." : null);

  return (
    <>
      {/* 1. Floating Launch Trigger Button (Bottom Right) */}
      {!isOpen && (
        <button
          id="open-cofounder-chat-btn"
          type="button"
          onClick={() => setIsOpen(true)}
          className="cf-trigger"
          title="Open AI Co-Founder"
        >
          <span className="cf-trigger-icon">
            <img src="/chatbot-logo.png" alt="" />
          </span>
          <span>Co-Founder</span>
          <span className="cf-trigger-dot" />
        </button>
      )}

      {/* 2. Slide-out Drawer Overlay & Container */}
      {isOpen && (
        <>
          <div className="cf-backdrop" onClick={() => setIsOpen(false)} aria-hidden="true" />
          <aside
            className={`cf-drawer ${isExpanded ? "is-wide" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label="AI Co-Founder chat"
          >
            {/* Top Navigation Bar */}
            <header className="cf-head">
              <div className="cf-brand">
                <div className="cf-avatar">
                  <img src="/chatbot-logo.png" alt="Co-Founder" />
                </div>
                <div className="cf-title">
                  <div className="cf-title-row">
                    <h3>Co-Founder</h3>
                    <span className="cf-model-pill">
                      <span className="cf-model-dot" />
                      Gemini 3.7
                    </span>
                  </div>
                  <p className="cf-subtitle">YC-Grade Advisory · Real-Time Streaming</p>
                </div>
              </div>

              {/* Window Controls */}
              <div className="cf-actions">
                <button
                  type="button"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  title={isExpanded ? "Collapse width" : "Expand width"}
                  aria-label={isExpanded ? "Collapse width" : "Expand width"}
                  className="hidden sm:inline-flex"
                >
                  {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  title="Clear conversation"
                  aria-label="Clear conversation"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close drawer"
                  aria-label="Close drawer"
                >
                  <X size={18} />
                </button>
              </div>
            </header>

            {/* Active Blueprint Context Badge */}
            <div className="cf-context">
              <div className="cf-context-info">
                <span className="cf-context-dot" />
                <span>
                  Context: <b>{activeStartupName || "General Consultation"}</b>
                </span>
              </div>
              {blueprint && <span className="cf-context-badge">Full Intel Synced</span>}
            </div>

            {/* Messages Scroll Area */}
            <div className="cf-body">
              {messages.map((msg) => {
                const isAssistant = msg.role === "assistant";
                return (
                  <div
                    key={msg.id}
                    className={`cf-msg ${isAssistant ? "is-ai" : "is-user"}`}
                  >
                    <div className="cf-msg-meta">
                      <span>{isAssistant ? "Co-Founder" : "You"}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div className={isAssistant ? "cf-bubble-ai" : "cf-bubble-user"}>
                      {isAssistant ? (
                        <>
                          <div>
                            {renderFormattedMessage(msg.content)}
                            {isStreaming && msg.content && (
                              <span className="inline-block h-3.5 w-1.5 bg-orange-500 ml-1 animate-pulse" />
                            )}
                            {isStreaming && !msg.content && (
                              <div className="flex items-center gap-1.5 text-slate-400 py-1 text-xs">
                                <span className="h-2 w-2 rounded-full bg-orange-400 animate-bounce" />
                                <span className="h-2 w-2 rounded-full bg-orange-500 animate-bounce delay-150" />
                                <span className="h-2 w-2 rounded-full bg-orange-600 animate-bounce delay-300" />
                                <span className="ml-1 text-xs">Reasoning with blueprint...</span>
                              </div>
                            )}
                          </div>

                          {/* 1-Click Copy on Assistant Answer */}
                          {msg.content && !isStreaming && (
                            <button
                              type="button"
                              className="cf-copy-btn"
                              onClick={() => handleCopy(msg.content, msg.id)}
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check size={12} className="text-emerald-600" />
                                  <span className="text-emerald-600">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={12} />
                                  <span>Copy answer</span>
                                </>
                              )}
                            </button>
                          )}
                        </>
                      ) : (
                        <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{msg.content}</p>
                      )}
                    </div>
                  </div>
                );
              })}

              {streamError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-rose-500" />
                  <span>{streamError}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Strategic Action Chips (Quick Inquiries) */}
            <div className="cf-chips">
              <div className="cf-chips-label">
                <Sparkles size={11} className="text-orange-500" />
                <span>Strategic Action Prompts</span>
              </div>
              <div className="cf-chips-list">
                {STRATEGIC_CHIPS.map((chip, idx) => {
                  const Icon = chip.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => sendMessage(chip.prompt)}
                      disabled={isStreaming}
                      className="cf-chip"
                    >
                      <Icon size={12} />
                      <span>{chip.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Form Deck */}
            <footer className="cf-foot">
              <div className="cf-input-box">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask your AI Co-Founder about strategy, customer acquisition, pricing..."
                  rows={2}
                  disabled={isStreaming}
                />

                <div className="cf-input-bar">
                  <span>
                    {input.length} chars · Enter ↵ to send
                  </span>
                  <div className="flex items-center gap-2">
                    {isStreaming && (
                      <button
                        type="button"
                        onClick={() => abortControllerRef.current?.abort()}
                        className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer px-2"
                      >
                        Stop
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => sendMessage()}
                      disabled={isStreaming || !input.trim()}
                      className="hp-btn hp-btn--primary hp-btn--sm"
                      style={{ height: 32, padding: "0 14px", borderRadius: 999 }}
                    >
                      <Send size={12} />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              </div>
            </footer>
          </aside>
        </>
      )}
    </>
  );
}
