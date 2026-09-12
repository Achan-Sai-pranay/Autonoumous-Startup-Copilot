// components/AiCopilotAgent.jsx
// ---------------------------------------------------------------------------
// Autonomous AI Startup Copilot Widget powered by Google Gemini 3.7 Flash
// Features:
// 1. Persistent floating widget with Gemini 3.7 Flash badge & glowing pulse
// 2. Real-time streaming/REST conversation with /api/chat-agent
// 3. Full awareness of active startup blueprint context (swot, tech, unit economics)
// 4. Quick strategic starter prompts (Moat critique, pricing, growth hacks, risk audit)
// 5. Clean markdown formatting, copy-to-clipboard, and conversation clear
// ---------------------------------------------------------------------------
import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Sparkles,
  Send,
  X,
  ChevronDown,
  Copy,
  Check,
  RotateCcw,
  Zap,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";

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
        text: `Hey founder! I've loaded your blueprint for **"${originalIdea.slice(0, 40)}..."**. Ask me anything—critique your moat, simulate pricing changes, draft investor emails, or analyze competitors with Gemini 3.7 Flash.`,
      }
    : {
        role: "assistant",
        text: "Hey! I'm your **LaunchPilot AI Startup Copilot**, powered by **Google Gemini 3.7 Flash**. What startup idea or strategic challenge are you tackling today?",
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
        { label: "Critique my moat", icon: ShieldCheck, query: "Critique my startup moat and defensibility based on the active blueprint. Where am I most vulnerable to copycats?" },
        { label: "How should I price this?", icon: DollarSign, query: "Based on our target persona and competitor benchmarks, what pricing tiers and pricing psychology will maximize early ARR?" },
        { label: "3 GTM growth hacks", icon: TrendingUp, query: "Give me 3 unconventional, zero-cost growth hacks to get the first 100 paying B2B customers for this startup." },
        { label: "Top 3 fatal risks", icon: AlertTriangle, query: "What are the 3 most fatal assumptions or risks in this business model, and how can I de-risk them in the next 14 days?" },
      ]
    : [
        { label: "Test a B2B SaaS thesis", icon: Zap, query: "Help me brainstorm an unfair-advantage B2B AI SaaS thesis for enterprise procurement or workflow automation." },
        { label: "Validate my market size", icon: TrendingUp, query: "How should I calculate TAM, SAM, and SOM for an AI-native developer infrastructure tool?" },
        { label: "High-margin niches", icon: Lightbulb, query: "What are 3 underserved, high-margin software niches with low venture-capital saturation right now?" },
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

      // Extract blueprint context if available
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

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.reply || "I analyzed your query. Let me know if you need deeper financial or architectural modeling.",
        },
      ]);
    } catch (err) {
      console.error("AI Copilot request error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "I experienced a brief connection hiccup. Please try asking again in a moment.",
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
      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div className="pointer-events-auto mb-3 w-[92vw] sm:w-[410px] h-[540px] max-h-[82vh] bg-white rounded-3xl border border-slate-200/90 shadow-2xl flex flex-col overflow-hidden animate-toast-in text-slate-900">
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center text-orange-400 shadow-xs">
                <Bot size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold tracking-tight">LaunchPilot Copilot</h3>
                  <span className="flex items-center gap-1 text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <p className="text-[10px] font-mono text-orange-400/90">
                  Powered by Google Gemini 3.7 Flash
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
                title="Reset conversation"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
                title="Close drawer"
              >
                <ChevronDown size={17} />
              </button>
            </div>
          </div>

          {/* Active Blueprint Badge Strip */}
          {blueprint && (
            <div className="px-4 py-1.5 bg-orange-50 border-b border-orange-100 flex items-center justify-between text-[11px] text-orange-800">
              <span className="truncate font-medium">Context: {originalIdea.slice(0, 36)}…</span>
              <span className="font-mono text-[10px] font-bold text-orange-600 shrink-0 ml-2">
                ACTIVE
              </span>
            </div>
          )}

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin bg-slate-50/50">
            {messages.map((m, idx) => {
              const isAi = m.role === "assistant" || m.role === "ai";
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isAi ? "items-start" : "items-end"}`}
                >
                  <div
                    className={`relative group max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isAi
                        ? "bg-white border border-slate-200/90 text-slate-800 shadow-2xs whitespace-pre-wrap"
                        : "bg-orange-600 text-white rounded-br-xs shadow-xs font-medium"
                    }`}
                  >
                    {m.text}

                    {isAi && (
                      <button
                        onClick={() => handleCopyText(m.text, idx)}
                        className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 bg-white border border-slate-200 p-1 rounded-md text-slate-500 hover:text-orange-600 shadow-xs transition-opacity"
                        title="Copy message"
                      >
                        {copiedIndex === idx ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl w-fit shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                <span className="text-xs text-slate-500 font-mono">
                  Gemini 3.7 Flash thinking…
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Strategic Starter Prompts */}
          <div className="px-3 py-2 border-t border-slate-100 bg-white">
            <p className="text-[10px] font-mono uppercase text-slate-400 font-bold mb-1.5">
              Quick Inquiries
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {quickPrompts.map((qp, i) => {
                const Icon = qp.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(qp.query)}
                    className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-700 border border-slate-200 hover:border-orange-300 transition-all cursor-pointer whitespace-nowrap active:scale-95"
                  >
                    <Icon size={12} className="text-orange-600" />
                    <span>{qp.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input Box */}
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
              placeholder={blueprint ? "Ask about your startup or request a pivot..." : "Ask your startup copilot..."}
              disabled={loading}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white transition-all shadow-xs active:scale-95 cursor-pointer disabled:cursor-not-allowed"
              title="Send message"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-2xl border border-slate-700 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
      >
        <div className="relative flex items-center justify-center">
          <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-xs">
            <Bot size={16} />
          </div>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse" />
        </div>

        <div className="flex flex-col items-start text-left">
          <span className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
            AI Copilot
            <Sparkles size={11} className="text-orange-400" />
          </span>
          <span className="text-[9px] font-mono text-slate-400 group-hover:text-orange-300 transition-colors">
            Gemini 3.7 Flash
          </span>
        </div>
      </button>
    </div>
  );
}
