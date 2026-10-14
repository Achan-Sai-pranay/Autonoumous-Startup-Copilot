// components/CoFounderChatDrawer.jsx
// ---------------------------------------------------------------------------
// Stateful controller for the redesigned Co-Founder chat.
// Connects real-time streaming from POST /api/consultant with CoFounderPanel & CoFounderLauncher.
// ---------------------------------------------------------------------------
import { useState, useRef, useEffect, useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import CoFounderPanel, { CoFounderLauncher, parseMessageContent } from "./CoFounderPanel.jsx";
import { getHistory } from "../lib/projectHistory.js";
import "./home.css";
import "./cofounder.css";

// Configure marked with GitHub-flavored markdown and soft breaks
marked.setOptions({
  gfm: true,
  breaks: true,
  pedantic: false,
});

// Configure DOMPurify hook to ensure all external links open securely in new tab
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A" && node.hasAttribute("href")) {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  }
});

const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const rawApiUrl = isLocalhost
  ? (import.meta.env.VITE_LOCAL_API_URL || "http://localhost:5001/api/generate-blueprint")
  : (import.meta.env.VITE_API_URL || "https://ideapulse-y1n5.onrender.com/api/generate-blueprint");

const CONSULTANT_URL = rawApiUrl.includes("/api/")
  ? rawApiUrl.replace(/\/api\/[a-zA-Z0-9_-]+$/, "/api/consultant")
  : `${rawApiUrl.replace(/\/+$/, "")}/api/consultant`;

/**
 * Production-grade markdown renderer powered by marked and DOMPurify.
 * Renders headings, tables, code blocks, lists, quotes, and bold highlights cleanly.
 */
function renderFormattedMessage(text) {
  if (!text) return null;
  try {
    const rawHtml = marked.parse(text);
    const cleanHtml = DOMPurify.sanitize(rawHtml, {
      ADD_TAGS: ["table", "thead", "tbody", "tr", "th", "td", "hr", "blockquote", "code", "pre"],
      ADD_ATTR: ["target", "rel", "align"],
    });
    return (
      <div
        className="cf-markdown-body"
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
    );
  } catch (err) {
    console.error("Markdown parse error:", err);
    return <div className="cf-markdown-body">{text}</div>;
  }
}

export default function CoFounderChatDrawer({ blueprint = null, originalIdea = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState(null);

  const abortControllerRef = useRef(null);

  // Resolve active venture context from props or fallback to latest saved project in history
  const { effectiveBlueprint, effectiveIdea } = useMemo(() => {
    if (blueprint || originalIdea) {
      return { effectiveBlueprint: blueprint, effectiveIdea: originalIdea };
    }
    try {
      const hist = getHistory(null);
      if (hist && hist.length > 0) {
        return {
          effectiveBlueprint: hist[0]?.blueprint || null,
          effectiveIdea: hist[0]?.idea || hist[0]?.title || "",
        };
      }
    } catch {
      // ignore
    }
    return { effectiveBlueprint: null, effectiveIdea: "" };
  }, [blueprint, originalIdea]);

  // Listen for external open triggers (e.g. from sidebar "Co-Founder" item)
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-cofounder-chat", handleOpen);
    return () => window.removeEventListener("open-cofounder-chat", handleOpen);
  }, []);

  const handleClear = () => {
    if (isStreaming && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
    setStreamError(null);
    setMessages([]);
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setMessages((prev) =>
      prev.map((msg) => (msg.streaming ? { ...msg, streaming: false } : msg))
    );
  };

  const sendMessage = async (textToSend, customHistory = null) => {
    const query = (textToSend || "").trim();
    if (!query || isStreaming) return;

    setStreamError(null);

    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMsg = {
      id: userMessageId,
      role: "user",
      content: query,
      timestamp,
      time: timestamp,
    };

    const placeholderAssistantMsg = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      streaming: true,
      timestamp,
      time: timestamp,
    };

    const baseMessages = customHistory !== null ? customHistory : messages;
    setMessages([...baseMessages, userMsg, placeholderAssistantMsg]);
    setIsStreaming(true);

    try {
      abortControllerRef.current = new AbortController();

      const historyPayload = baseMessages
        .filter((m) => (m.role === "user" || m.role === "assistant") && m.content)
        .map((m) => ({
          role: m.role,
          content: parseMessageContent(m.content).cleanText || m.content,
        }));

      const res = await fetch(CONSULTANT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
          blueprint: effectiveBlueprint,
          originalIdea: effectiveIdea,
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
            msg.id === assistantMessageId
              ? { ...msg, content: accumulated, streaming: true }
              : msg
          )
        );
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, streaming: false }
            : msg
        )
      );
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Co-Founder stream failed:", err);
        setStreamError(err.message || "Failed to reach AI Co-Founder");
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content:
                    msg.content ||
                    "I had trouble connecting to the advisory server. Please ensure the backend is active on port 5001 and try asking again.",
                  streaming: false,
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

  const handleRegenerate = () => {
    if (isStreaming || messages.length === 0) return;
    let lastUserIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        lastUserIndex = i;
        break;
      }
    }
    if (lastUserIndex === -1) return;
    const lastUserMsg = messages[lastUserIndex];
    const trimmed = messages.slice(0, lastUserIndex);
    sendMessage(lastUserMsg.content, trimmed);
  };

  const ventureName =
    effectiveBlueprint?.ideaAnalysis?.domain ||
    effectiveBlueprint?.title ||
    (effectiveIdea ? (effectiveIdea.length > 36 ? `${effectiveIdea.slice(0, 36)}…` : effectiveIdea) : null);

  return (
    <>
      <CoFounderLauncher
        onClick={() => setIsOpen(true)}
        avatarSrc="/chatbot-logo.png"
        hidden={isOpen}
      />
      <CoFounderPanel
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onReset={handleClear}
        expanded={isExpanded}
        onToggleExpand={() => setIsExpanded((prev) => !prev)}
        ventureName={ventureName}
        messages={messages}
        isStreaming={isStreaming}
        onSend={sendMessage}
        onStop={handleStop}
        onRegenerate={handleRegenerate}
        renderContent={renderFormattedMessage}
        avatarSrc="/chatbot-logo.png"
      />
    </>
  );
}

export { CoFounderPanel, CoFounderLauncher };
