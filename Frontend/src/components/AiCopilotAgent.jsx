// components/AiCopilotAgent.jsx
// ---------------------------------------------------------------------------
// Minimal Commercial Website Chatbot for LaunchPilot AI
// Features:
// 1. Sleek, minimal commercial chat widget (Intercom/Crisp inspired)
// 2. Crisp, conversational answers without hashtags, asterisks, or markdown clutter
// 3. Status indicator ("Online"), 3-dot typing indicator, and quick inquiry pills
// 4. Awareness of active startup blueprint context
// ---------------------------------------------------------------------------
import { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Send,
  X,
  ChevronDown,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Lightbulb,
  Zap,
} from "lucide-react";

// Strip raw markdown symbols (###, **, *, ---) to keep commercial chatbot output clean and readable
function cleanChatText(text) {
  if (!text) return "";
  return text
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^---+\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function AiCopilotAgent({ blueprint = null, originalIdea = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const initialMessage = blueprint
    ? {
        role: "assistant",
        text: `Hi! I have loaded your startup brief. How can I help you refine your business idea, pricing, or strategy today?`,
      }
    : {
        role: "assistant",
        text: "Hi there! I'm your LaunchPilot startup assistant. What business idea or challenge can I help you with today?",
      };

  const [messages, setMessages] = useState([initialMessage]);

  // When blueprint changes, update greeting
  useEffect(() => {
    if (blueprint) {
      setMessages((prev) => {
        if (prev.length <= 1) {
          return [initialMessage];
        }
        return prev;
      });
    }
  }, [blueprint, originalIdea]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const quickPrompts = blueprint
    ? [
        {
          label: "Critique my moat",
          icon: ShieldCheck,
          query: "Critique our startup moat and defensibility based on the brief. Where are we most vulnerable to competitors?",
        },
        {
          label: "Pricing advice",
          icon: DollarSign,
          query: "What pricing model and pricing tiers would you recommend for this startup to maximize early revenue?",
        },
        {
          label: "Growth tactics",
          icon: TrendingUp,
          query: "What are 3 practical, low-cost ways to acquire our first 100 paying customers?",
        },
        {
          label: "Top fatal risks",
          icon: AlertTriangle,
          query: "What are the biggest risks in this business model, and how should we de-risk them?",
        },
      ]
    : [
        {
          label: "Brainstorm SaaS idea",
          icon: Zap,
          query: "Give me 2 underserved B2B software problems that a small team could build and monetize quickly.",
        },
        {
          label: "Market sizing tip",
          icon: TrendingUp,
          query: "How can I realistically estimate TAM and SAM for a niche SaaS product?",
        },
        {
          label: "Validate customer demand",
          icon: Lightbulb,
          query: "What are the best questions to ask potential customers in discovery interviews?",
        },
      ];

  const handleSendMessage = async (textToSend = input) => {
    const text = (textToSend || "").trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: "user", text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api/generate-blueprint";
      const baseUrl = rawApiUrl.replace(/\/api\/generate-blueprint\/?$/, "");
      const chatEndpoint = `${baseUrl}/api/chat-agent`;

      // Context from active blueprint
      const blueprintContext = blueprint
        ? {
            idea: originalIdea,
            problem: blueprint.ideaAnalysis?.problem,
            goal: blueprint.ideaAnalysis?.goal,
            viabilityScore: blueprint.ideaAnalysis?.viabilityScore,
            competitors: blueprint.marketResearch?.competitors,
            targetUsers: blueprint.customerPersona?.targetUsers,
            pricingMonthly: blueprint.costEstimator?.estimatedMonthlyCost,
            elevatorPitch: blueprint.pitch?.elevatorPitch,
            mvpFeatures: blueprint.productPlan?.mvpFeatures,
          }
        : null;

      const response = await fetch(chatEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            text: m.text,
          })),
          blueprintContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const cleanedReply = cleanChatText(
        data.reply || "I analyzed your question. Feel free to ask if you want more details on strategy or execution."
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: cleanedReply,
        },
      ]);
    } catch (err) {
      console.error("AI assistant request error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "I experienced a momentary connection issue. Please try asking again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text, idx) => {
    navigator.clipboard?.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([initialMessage]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end pointer-events-none">
      {/* Expanded Commercial Chat Drawer */}
      {isOpen && (
        <div className="pointer-events-auto mb-3 w-[92vw] sm:w-[390px] h-[520px] max-h-[82vh] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-toast-in text-slate-900">
          {/* Header */}
          <div className="px-4 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <div className="h-9 w-9 rounded-full bg-orange-600 flex items-center justify-center text-white shadow-xs">
                  <MessageSquare size={17} />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold tracking-tight text-white">
                  LaunchPilot Assistant
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Online • Ready to help</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="New conversation"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close chat"
              >
                <ChevronDown size={18} />
              </button>
            </div>
          </div>

          {/* Context pill if analyzing a startup */}
          {blueprint && (
            <div className="px-4 py-1.5 bg-orange-50/80 border-b border-orange-100 flex items-center justify-between text-[11px] text-orange-900">
              <span className="truncate font-medium">Context: {originalIdea.slice(0, 36)}…</span>
              <span className="font-mono text-[10px] font-bold text-orange-600 shrink-0 ml-2">
                ACTIVE
              </span>
            </div>
          )}

          {/* Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin bg-slate-50/60">
            {messages.map((m, idx) => {
              const isAi = m.role === "assistant" || m.role === "ai";
              const formattedText = isAi ? cleanChatText(m.text) : m.text;

              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isAi ? "items-start" : "items-end"}`}
                >
                  <div
                    className={`relative group max-w-[88%] p-3 rounded-2xl text-xs sm:text-[13px] leading-relaxed ${
                      isAi
                        ? "bg-white border border-slate-200/80 text-slate-800 shadow-2xs rounded-tl-xs whitespace-pre-wrap font-normal"
                        : "bg-slate-900 text-white rounded-tr-xs shadow-xs font-medium"
                    }`}
                  >
                    {formattedText}

                    {isAi && (
                      <button
                        onClick={() => handleCopyText(formattedText, idx)}
                        className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 bg-white border border-slate-200 p-1 rounded-md text-slate-400 hover:text-orange-600 shadow-xs transition-opacity cursor-pointer"
                        title="Copy message"
                      >
                        {copiedIndex === idx ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* 3-Dot Bouncing Typing Indicator */}
            {loading && (
              <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl rounded-tl-xs w-fit shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Pills */}
          <div className="px-3 py-2 border-t border-slate-100 bg-white">
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {quickPrompts.map((qp, i) => {
                const Icon = qp.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(qp.query)}
                    className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-700 border border-slate-200/80 hover:border-orange-300 transition-all cursor-pointer whitespace-nowrap active:scale-95"
                  >
                    <Icon size={12} className="text-orange-600" />
                    <span>{qp.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Input Field */}
          <div className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask a question..."
              disabled={loading}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-xs sm:text-[13px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || loading}
              className="h-8 w-8 rounded-full bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer shrink-0 disabled:cursor-not-allowed"
              title="Send message"
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Commercial Website Chat Launcher */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-2xl border border-slate-700 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
        aria-label="Open support chat"
      >
        <div className="relative flex items-center justify-center">
          <div className="h-7 w-7 rounded-full bg-orange-600 flex items-center justify-center text-white shadow-xs">
            {isOpen ? <X size={15} /> : <MessageSquare size={15} />}
          </div>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
        </div>

        <div className="flex flex-col items-start text-left">
          <span className="text-xs font-bold tracking-tight text-white">
            {isOpen ? "Close Chat" : "Chat with us"}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            Ask our Assistant
          </span>
        </div>
      </button>
    </div>
  );
}
