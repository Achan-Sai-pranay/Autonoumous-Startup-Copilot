// components/ScreenshotSlideshow.jsx
// ---------------------------------------------------------------------------
// Homepage product showcase. Same prop as before: <ScreenshotSlideshow onCtaClick={...} />
// Light Apple-style window frame, sliding segmented control, silent autoplay,
// click-to-expand viewer, swipe + arrow keys.
//
// Image paths & slide definitions live in `src/lib/screenshotSlidesConfig.js`
// so you can swap screenshots anytime without touching this file's logic or CSS.
// ---------------------------------------------------------------------------
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Lock,
  Maximize2,
  Pause,
  Play,
  X,
} from "lucide-react";
import { SLIDES as DEFAULT_SLIDES } from "../lib/screenshotSlidesConfig.js";
import "./ScreenshotSlideshow.css";

const AUTOPLAY_MS = 5000;

export default function ScreenshotSlideshow({ onCtaClick, slides = DEFAULT_SLIDES }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState({});
  const [failed, setFailed] = useState({});

  const root = useRef(null);
  const touch = useRef({ x: 0, y: 0 });

  const next = useCallback(() => setIndex((i) => (i + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + slides.length) % slides.length), [slides.length]);

  // reveal once, pause when off screen
  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      setRevealed(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting);
        if (e.isIntersecting) setRevealed(true);
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const paused = !playing || hovered || !inView || expanded;

  // Silent autoplay interval (no visible progress timer bar)
  useEffect(() => {
    if (paused) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, next, index]);

  // warm the next image so the cross-fade never shows a blank frame
  useEffect(() => {
    if (!slides.length) return;
    const img = new Image();
    img.src = slides[(index + 1) % slides.length].image;
  }, [index, slides]);

  // expanded viewer: Esc closes, page scroll locked
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e) => e.key === "Escape" && setExpanded(false);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [expanded]);

  const slide = slides[index] || slides[0];

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  };
  const onTouchStart = (e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY });
  const onTouchEnd = (e) => {
    const dx = touch.current.x - e.changedTouches[0].clientX;
    const dy = touch.current.y - e.changedTouches[0].clientY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) (dx > 0 ? next : prev)();
  };

  if (!slide) return null;

  return (
    <section ref={root} className={`ps ${revealed ? "is-in" : ""}`} aria-label="Product tour" onKeyDown={onKeyDown}>
      <div className="ps-glow" aria-hidden="true" />

      <div className="ps-wrap">
        <header className="ps-head">
          <span className="ps-eyebrow">
            <i />
            Inside the product
          </span>
          <h2>See exactly what you get.</h2>
          <p>Real screens from LaunchPilot. From a one-line idea to a debated, costed and launch-ready plan.</p>
        </header>

        {/* Segmented control with a sliding thumb */}
        <div className="ps-tabs-scroll">
          <div className="ps-tabs" role="tablist" aria-label="Product tour" style={{ "--n": slides.length, "--i": index }}>
            <i className="ps-thumb" aria-hidden="true" />
            {slides.map((s, i) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  id={`ps-tab-${s.id}`}
                  aria-selected={i === index}
                  aria-controls={`ps-panel-${s.id}`}
                  className={i === index ? "is-on" : ""}
                  onClick={() => setIndex(i)}
                >
                  <Icon size={15} />
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Window */}
        <div
          className="ps-stage"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="ps-window">
            <div className="ps-bar">
              <span className="ps-lights" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className="ps-address" key={slide.url}>
                <Lock size={11} />
                {slide.url}
              </span>
              <span className="ps-bar-end" />
            </div>

            <button type="button" className="ps-view" onClick={() => setExpanded(true)} aria-label="Expand screenshot">
              {slides.map((s, i) => (
                <span
                  key={s.id}
                  id={`ps-panel-${s.id}`}
                  role="tabpanel"
                  aria-labelledby={`ps-tab-${s.id}`}
                  aria-hidden={i !== index}
                  className={`ps-slide ${i === index ? "is-on" : ""} ${i < index ? "is-before" : ""}`}
                >
                  {failed[s.id] ? (
                    <span className="ps-missing">Screenshot unavailable</span>
                  ) : (
                    <img
                      src={s.image}
                      alt={`${s.title} A screenshot of the ${s.label} view in LaunchPilot.`}
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                      className={loaded[s.id] ? "is-loaded" : ""}
                      onLoad={() => setLoaded((l) => ({ ...l, [s.id]: true }))}
                      onError={() => setFailed((f) => ({ ...f, [s.id]: true }))}
                    />
                  )}
                </span>
              ))}
              <span className="ps-expand" aria-hidden="true">
                <Maximize2 size={14} /> Click to expand
              </span>
            </button>
          </div>
        </div>

        {/* Caption */}
        <div className="ps-caption">
          <div key={slide.id} className="ps-caption-text">
            <span className="ps-tag">{slide.tag}</span>
            <h3>{slide.title}</h3>
            <p>{slide.desc}</p>
            <ul>
              {slide.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>

          <div className="ps-caption-actions">
            <button type="button" className="ps-round" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause tour" : "Play tour"} title={playing ? "Pause" : "Play"}>
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button type="button" className="hp-btn hp-btn--primary hp-btn--lg" onClick={() => onCtaClick?.()}>
              Test your idea <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded viewer */}
      {expanded && (
        <div className="ps-lightbox" role="dialog" aria-modal="true" aria-label={`${slide.label} screenshot`} onMouseDown={(e) => e.target === e.currentTarget && setExpanded(false)}>
          <button type="button" className="ps-lightbox-close" onClick={() => setExpanded(false)} aria-label="Close">
            <X size={20} />
          </button>
          <div className="ps-lightbox-scroll">
            <img src={slide.image} alt={`${slide.label} screenshot, full size`} />
          </div>
        </div>
      )}
    </section>
  );
}
