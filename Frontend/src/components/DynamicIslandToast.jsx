// components/DynamicIslandToast.jsx
// ---------------------------------------------------------------------------
// Apple Dynamic Island Toast
// Always obsidian (like hardware), tone-lit by status (success/error/info),
// expanding capsule via clip-path, orbiting border hairline, portaled to body.
// Styling: island.css
// ---------------------------------------------------------------------------
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "../styles/island.css";

function detectTone(message) {
  if (!message) return "info";
  const m = message.toLowerCase();
  if (
    m.includes("fail") ||
    m.includes("error") ||
    m.includes("unable") ||
    m.includes("invalid") ||
    m.includes("denied")
  ) {
    return "error";
  }
  if (
    m.includes("copied") ||
    m.includes("success") ||
    m.includes("downloaded") ||
    m.includes("saved") ||
    m.includes("unlocked") ||
    m.includes("activated") ||
    m.includes("upgraded") ||
    m.includes("loaded") ||
    m.includes("complete") ||
    m.includes("exported")
  ) {
    return "success";
  }
  return "info";
}

export default function DynamicIslandToast({ message, tone: explicitTone }) {
  const [lastMessage, setLastMessage] = useState(message);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (message) {
      setLastMessage(message);
      setIsExiting(false);
    } else if (lastMessage && !isExiting) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setLastMessage(null);
        setIsExiting(false);
      }, 380);
      return () => clearTimeout(timer);
    }
  }, [message, lastMessage, isExiting]);

  const activeMessage = message || (isExiting ? lastMessage : null);
  if (!activeMessage) return null;

  const tone = explicitTone || detectTone(activeMessage);

  const node = (
    <div className="di-root" role="status" aria-live="polite">
      <div className="di-island" data-tone={tone} data-state={isExiting ? "exit" : "enter"}>
        <div className="di-ring" aria-hidden="true" />
        <div className="di-clip">
          <span className="di-icon" aria-hidden="true">
            {tone === "success" ? (
              <svg viewBox="0 0 24 24">
                <polyline className="di-stroke" points="20 6 9 17 4 12" />
              </svg>
            ) : tone === "error" ? (
              <svg viewBox="0 0 24 24">
                <line className="di-stroke" x1="18" y1="6" x2="6" y2="18" />
                <line className="di-stroke" x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <span className="di-orb" />
            )}
          </span>
          <span className="di-text">{activeMessage}</span>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(node, document.body) : node;
}
