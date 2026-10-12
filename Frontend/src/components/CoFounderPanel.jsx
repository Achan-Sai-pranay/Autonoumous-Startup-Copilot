// components/CoFounderPanel.jsx
// ---------------------------------------------------------------------------
// Presentational redesign of the Co-Founder chat.
// Wired through props to retain existing state, streaming, and API logic.
// ---------------------------------------------------------------------------
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Check,
  ChevronDown,
  Copy,
  Flame,
  Maximize2,
  Minimize2,
  RefreshCw,
  RotateCcw,
  Search,
  Square,
  Tag,
  Users,
  X,
} from "lucide-react";
import "./home.css";
import "./cofounder.css";

const DEFAULT_SUGGESTIONS = [
  {
    icon: Flame,
    title: "Grill my assumptions",
    text: "Grill me like a veteran Y Combinator partner during batch office hours. Brutally critique our defensibility, market risk, and assumptions. Where are we most likely to fail, and what should we test immediately?",
  },
  {
    icon: Users,
    title: "Win my first 20 customers",
    text: "Give me an aggressive, zero-dollar playbook to acquire our first 20 paying customers within the next 3 weeks. Be hyper-specific on which channels, exact search filters, and messaging hooks to use.",
  },
  {
    icon: Tag,
    title: "Test my pricing",
    text: "Analyze our pricing model and suggest 3 high-margin alternative B2B pricing structures (e.g. usage-based, tiered seat + value metric, performance-fee). Include exact recommended pricing tiers.",
  },
  {
    icon: Search,
    title: "Find the weakest part",
    text: "What is the single weakest part of this venture and how do I fix it?",
  },
];

export function Avatar({ src, size = 32 }) {
  return (
    <span className="cf-avatar" style={{ width: size, height: size }}>
      {src ? <img src={src} alt="" /> : <b>C</b>}
    </span>
  );
}

function Message({ m, isLast, isStreaming, avatarSrc, renderContent, onRegenerate }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(m.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (m.role === "user") {
    return (
      <li className="cf-msg is-user" title={m.time || m.timestamp}>
        <p>{m.content}</p>
      </li>
    );
  }

  const waiting = m.streaming && !m.content;
  return (
    <li className="cf-msg is-ai" title={m.time || m.timestamp}>
      <Avatar src={avatarSrc} size={28} />
      <div>
        {waiting ? (
          <span className="cf-dots" aria-label="Co-Founder is thinking">
            <i />
            <i />
            <i />
          </span>
        ) : (
          <div className={`cf-text ${m.streaming ? "is-streaming" : ""}`}>
            {renderContent ? renderContent(m.content) : m.content}
          </div>
        )}
        {!m.streaming && m.content && (
          <div className="cf-actions">
            <button type="button" onClick={copy} aria-label="Copy answer">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
            {isLast && !isStreaming && onRegenerate && (
              <button type="button" onClick={onRegenerate} aria-label="Regenerate answer">
                <RefreshCw size={14} /> Retry
              </button>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

export default function CoFounderPanel({
  open,
  onClose,
  onReset,
  expanded = false,
  onToggleExpand,
  ventureName,
  messages = [],
  isStreaming = false,
  onSend,
  onStop,
  onRegenerate,
  suggestions = DEFAULT_SUGGESTIONS,
  renderContent,
  avatarSrc,
}) {
  const [draft, setDraft] = useState("");
  const [atBottom, setAtBottom] = useState(true);
  const scroller = useRef(null);
  const inputRef = useRef(null);

  const empty = messages.length === 0;
  const canSend = draft.trim().length > 0 && !isStreaming;

  // grow the textarea with its content, up to a limit
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
  }, [draft, open]);

  // keep the latest message in view unless the reader scrolled up
  useEffect(() => {
    const el = scroller.current;
    if (el && atBottom) el.scrollTop = el.scrollHeight;
  }, [messages, atBottom]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const onScroll = () => {
    const el = scroller.current;
    if (el) setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 80);
  };

  const submit = (text = draft) => {
    const t = text.trim();
    if (!t || isStreaming) return;
    onSend?.(t);
    setDraft("");
    setAtBottom(true);
  };

  const jumpToLatest = () => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  };

  return (
    <section
      className={`cf ${expanded ? "is-expanded" : ""}`}
      role="dialog"
      aria-label="Co-Founder chat"
    >
      <header className="cf-head">
        <Avatar src={avatarSrc} size={38} />
        <div>
          <h2>Co-Founder</h2>
          <p>
            {ventureName
              ? `Working on ${ventureName.length > 34 ? `${ventureName.slice(0, 34)}…` : ventureName}`
              : "Your AI business partner"}
          </p>
        </div>
        <div className="cf-tools">
          {onToggleExpand && (
            <button
              type="button"
              onClick={onToggleExpand}
              aria-label={expanded ? "Shrink" : "Expand"}
              title={expanded ? "Shrink" : "Expand"}
            >
              {expanded ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            </button>
          )}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              aria-label="New chat"
              title="New chat"
              disabled={empty}
            >
              <RotateCcw size={17} />
            </button>
          )}
          <button type="button" onClick={onClose} aria-label="Close" title="Close">
            <X size={18} />
          </button>
        </div>
      </header>

      <div className="cf-scroll" ref={scroller} onScroll={onScroll}>
        {empty ? (
          <div className="cf-empty">
            <Avatar src={avatarSrc} size={52} />
            <h3>{ventureName ? "What should we work on?" : "How can I help?"}</h3>
            <p>Ask about strategy, customers or pricing. I already know your venture.</p>
            <ul>
              {suggestions.map(({ icon: Icon, title, text }, i) => (
                <li key={title} style={{ "--i": i }}>
                  <button type="button" onClick={() => submit(text)}>
                    <span>{Icon && <Icon size={16} />}</span>
                    <b>{title}</b>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ol className="cf-thread">
            {messages.map((m, i) => (
              <Message
                key={m.id ?? i}
                m={m}
                isLast={i === messages.length - 1}
                isStreaming={isStreaming}
                avatarSrc={avatarSrc}
                renderContent={renderContent}
                onRegenerate={onRegenerate}
              />
            ))}
          </ol>
        )}
      </div>

      {!atBottom && !empty && (
        <div className="cf-jump-bar">
          <button type="button" className="cf-jump" onClick={jumpToLatest} aria-label="Jump to latest messages">
            <ChevronDown size={15} /> Latest
          </button>
        </div>
      )}

      <footer className="cf-foot">
        <form
          className="cf-composer"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Message your Co-Founder"
            aria-label="Message your Co-Founder"
          />
          {isStreaming ? (
            <button
              type="button"
              className="cf-send is-stop"
              onClick={onStop}
              aria-label="Stop generating"
            >
              <Square size={13} fill="currentColor" />
            </button>
          ) : (
            <button
              type="submit"
              className="cf-send"
              disabled={!canSend}
              aria-label="Send message"
            >
              <ArrowUp size={18} strokeWidth={2.4} />
            </button>
          )}
        </form>
        <small>AI can make mistakes. Check important decisions.</small>
      </footer>
    </section>
  );
}

/* Floating launcher: replaces the orange "Co-Founder" button */
export function CoFounderLauncher({ onClick, avatarSrc, hidden }) {
  if (hidden) return null;
  return (
    <button
      id="open-cofounder-chat-btn"
      type="button"
      className="cf-launch"
      onClick={onClick}
      aria-label="Open Co-Founder chat"
    >
      <Avatar src={avatarSrc} size={30} />
      <span>Co-Founder</span>
    </button>
  );
}
