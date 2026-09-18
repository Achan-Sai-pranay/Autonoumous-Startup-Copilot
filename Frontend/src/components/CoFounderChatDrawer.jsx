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
  DollarSign,
  Mail,
  Cpu,
  Bot,
  User,
  PanelRightClose,
  Maximize2,
  Minimize2,
  AlertCircle,
} from "lucide-react";

const rawApiUrl = import.meta.env.VITE_API_URL || "https://ideapulse-y1n5.onrender.com/api/generate-blueprint";
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
    icon: DollarSign,
    prompt:
      "Analyze our pricing model and suggest 3 high-margin alternative B2B pricing structures (e.g. usage-based, tiered seat + value metric, performance-fee). Include exact recommended dollar tiers.",
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
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-gentle">
          <button
            id="open-cofounder-chat-btn"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white pl-2.5 pr-4 py-2 rounded-2xl shadow-xl shadow-orange-500/25 border border-orange-400/30 transition-all duration-200 active:scale-95 cursor-pointer"
            title="Open Co - Founder"
          >
            <img
              src="/chatbot-logo.png"
              alt="Co - Founder"
              className="w-8 h-8 rounded-full object-contain bg-white/20 p-0.5 shadow-xs shrink-0"
            />
            <span className="text-sm font-bold tracking-tight text-white whitespace-nowrap">
              Co - Founder
            </span>
          </button>
        </div>
      )}

      {/* 2. Slide-out Drawer Overlay & Container */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Subtle backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity duration-300"
          />

          {/* Drawer Pane */}
          <aside
            className={`relative w-full ${
              isExpanded ? "max-w-3xl" : "max-w-lg"
            } bg-white h-full shadow-2xl flex flex-col border-l border-orange-200/80 z-10 transition-all duration-300 animate-slide-left`}
          >
            {/* Top Navigation Bar */}
            <div className="px-5 py-4 border-b border-slate-100 bg-white flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                  <img
                    src="/chatbot-logo.png"
                    alt="Co - Founder"
                    className="h-full w-full object-contain p-0.5"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                      Co - Founder
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Gemini 3.7
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    YC-Grade Advisory • Real-Time Streaming
                  </p>
                </div>
              </div>

              {/* Window Controls */}
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className="p-1.5 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer hidden sm:inline-flex"
                  title={isExpanded ? "Collapse width" : "Expand width"}
                >
                  {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>
                <button
                  onClick={handleClear}
                  className="p-1.5 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Clear conversation"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-slate-500"
                  title="Close drawer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Active Blueprint Context Badge */}
            <div className="px-5 py-2.5 bg-orange-50/60 border-b border-orange-100 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2 truncate">
                <span className="h-2 w-2 rounded-full bg-orange-500 shrink-0" />
                <span className="font-mono text-[11px] text-orange-900 font-semibold truncate">
                  Active Blueprint:{" "}
                  <span className="text-orange-700 font-normal">
                    {activeStartupName || "General Consultation (No Blueprint Loaded)"}
                  </span>
                </span>
              </div>
              {blueprint && (
                <span className="hidden sm:inline text-[10px] font-mono text-orange-600 bg-white border border-orange-200 px-2 py-0.5 rounded font-bold shrink-0">
                  Full Intel Synced
                </span>
              )}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin bg-slate-50/50">
              {messages.map((msg) => {
                const isAssistant = msg.role === "assistant";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isAssistant ? "items-start" : "items-end"
                    } group`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      {isAssistant && (
                        <img
                          src="/chatbot-logo.png"
                          alt="Co - Founder"
                          className="w-3.5 h-3.5 rounded-full object-contain"
                        />
                      )}
                      <span className="text-[10px] font-mono text-slate-500 font-semibold">
                        {isAssistant ? "Co - Founder" : "You"}
                      </span>
                      <span className="text-[10px] text-slate-300">•</span>
                      <span className="text-[10px] font-mono text-slate-400">{msg.timestamp}</span>
                    </div>

                    <div
                      className={`relative max-w-[92%] rounded-2xl px-4 py-3 text-xs sm:text-sm ${
                        isAssistant
                          ? "bg-white text-slate-900 border border-slate-200/90 shadow-2xs"
                          : "bg-orange-600 text-white shadow-xs font-medium"
                      }`}
                    >
                      {isAssistant ? (
                        <>
                          <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed">
                            {renderFormattedMessage(msg.content)}
                            {isStreaming && msg.content && (
                              <span className="inline-block h-3 w-1.5 bg-orange-500 ml-1 animate-pulse" />
                            )}
                            {isStreaming && !msg.content && (
                              <div className="flex items-center gap-1.5 text-slate-400 py-1 font-mono text-xs">
                                <span className="h-2 w-2 rounded-full bg-orange-400 animate-bounce" />
                                <span className="h-2 w-2 rounded-full bg-orange-500 animate-bounce delay-150" />
                                <span className="h-2 w-2 rounded-full bg-orange-600 animate-bounce delay-300" />
                                <span className="ml-1 text-[11px]">Reasoning with blueprint...</span>
                              </div>
                            )}
                          </div>

                          {/* 1-Click Copy on Assistant Answer */}
                          {msg.content && !isStreaming && (
                            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-end">
                              <button
                                onClick={() => handleCopy(msg.content, msg.id)}
                                className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-orange-600 transition-colors cursor-pointer"
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
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      )}
                    </div>
                  </div>
                );
              })}

              {streamError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0 text-red-500" />
                  <span>{streamError}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Strategic Action Chips (Quick Inquiries) */}
            <div className="px-4 py-2 bg-white border-t border-slate-100 shrink-0">
              <div className="flex items-center gap-1 mb-1.5">
                <Sparkles size={11} className="text-orange-500" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Strategic Action Prompts
                </span>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {STRATEGIC_CHIPS.map((chip, idx) => {
                  const Icon = chip.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => sendMessage(chip.prompt)}
                      disabled={isStreaming}
                      className="whitespace-nowrap flex items-center gap-1.5 text-[11px] font-medium bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-slate-700 hover:text-orange-700 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 shrink-0 active:scale-95"
                    >
                      <Icon size={12} className="text-orange-600 shrink-0" />
                      <span>{chip.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Form Deck */}
            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
              <div className="relative rounded-2xl border-2 border-slate-200 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all bg-white p-2.5">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask your AI Co-Founder about strategy, customer acquisition, pricing..."
                  rows={2}
                  disabled={isStreaming}
                  className="w-full resize-none text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none disabled:opacity-50 font-sans"
                />

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 mt-1">
                  <span className="text-[10px] font-mono text-slate-400">
                    {input.length} chars • Enter ↵ to send
                  </span>
                  <div className="flex items-center gap-2">
                    {isStreaming && (
                      <button
                        onClick={() => abortControllerRef.current?.abort()}
                        className="text-[11px] font-mono font-semibold text-red-600 hover:underline cursor-pointer px-2"
                      >
                        Stop
                      </button>
                    )}
                    <button
                      onClick={() => sendMessage()}
                      disabled={isStreaming || !input.trim()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer active:scale-95"
                    >
                      <Send size={12} />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
