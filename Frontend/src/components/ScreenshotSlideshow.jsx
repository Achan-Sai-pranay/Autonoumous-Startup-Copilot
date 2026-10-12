// components/ScreenshotSlideshow.jsx
// ---------------------------------------------------------------------------
// Real Product Screenshot Slideshow for LaunchPilot Homepage
// Shows authentic screenshots of LaunchPilot Studio and the 7-section blueprint
// with a VenturusAI-inspired pill tab bar and macOS chassis.
// ---------------------------------------------------------------------------
import { useState, useEffect, useRef, useCallback } from "react";
import {
  FolderKanban,
  ShieldCheck,
  Swords,
  Wallet,
  Rocket,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  ArrowRight,
  Lock,
} from "lucide-react";
import "./ScreenshotSlideshow.css";

const SLIDES = [
  {
    id: "workspace",
    numeral: "Hub",
    label: "Startup Studio",
    icon: FolderKanban,
    tag: "Platform Workspace",
    title: "LaunchPilot Studio & 12 AI Specialists",
    desc: "Manage saved blueprints, monitor composite viability trends, and launch deep multi-agent analyses from your private founder vault.",
    url: "launchpilot.ai/app • Founder Studio Hub",
    image: "/screenshots/workspace.png",
  },
  {
    id: "overview",
    numeral: "01",
    label: "Executive Overview",
    icon: ShieldCheck,
    tag: "Stage 01 of 7",
    title: "Venture Viability Spotlight (92/100)",
    desc: "Instant synthesis with calibrated viability scoring, core value proposition story trio, and strategic founder brief.",
    url: "launchpilot.ai/app#overview • Stage 01 Viability",
    image: "/screenshots/overview.png",
  },
  {
    id: "vc-debate",
    numeral: "02",
    label: "VC War Room",
    icon: Swords,
    tag: "Stage 02 of 7",
    title: "3-AI Multi-Agent Committee Debate",
    desc: "Groq Llama 3.3 (Bull) defends the upside, OpenRouter DeepSeek V3 (Bear) attacks fatal risks, and Gemini 2.5 delivers the arbitrated ruling.",
    url: "launchpilot.ai/app#vc-debate • 3-AI War Room",
    image: "/screenshots/vc-debate.png",
  },
  {
    id: "finances",
    numeral: "06",
    label: "Financial Simulator",
    icon: Wallet,
    tag: "Stage 06 of 7",
    title: "Dynamic Unit Economics & Revenue Modeling",
    desc: "Interactive pricing and customer volume sliders calculate real cloud burn, break-even thresholds, and ARR projections in real-time.",
    url: "launchpilot.ai/app#finances • Unit Economics",
    image: "/screenshots/financials.png",
  },
  {
    id: "gtm-kit",
    numeral: "07",
    label: "Go-to-Market",
    icon: Rocket,
    tag: "Stage 07 of 7",
    title: "Distribution Flywheel & Ready-to-Post Copy",
    desc: "Channel-specific growth flywheels, proven founder outreach playbooks, and pre-written Reddit, LinkedIn, and X launch templates.",
    url: "launchpilot.ai/app#gtm • Go-to-Market Engine",
    image: "/screenshots/gtm-kit.png",
  },
];

const AUTOPLAY_DURATION = 4500; // 4.5 seconds

export default function ScreenshotSlideshow({ onCtaClick }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isInViewport, setIsInViewport] = useState(true);

  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Check prefers-reduced-motion
  const prefersReduced = useCallback(() => {
    return (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  const goToIndex = (idx) => {
    setCurrentIndex(idx);
  };

  // Pause offscreen with IntersectionObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Autoplay timer logic
  useEffect(() => {
    if (prefersReduced() || !isPlaying || isHovered || !isInViewport) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      goToNext();
    }, AUTOPLAY_DURATION);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isHovered, isInViewport, goToNext, prefersReduced, currentIndex]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      goToPrev();
    } else if (e.key === "ArrowRight") {
      goToNext();
    }
  };

  // Touch swipe support
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNext();
      else goToPrev();
    }
  };

  const currentSlide = SLIDES[currentIndex];

  return (
    <section
      ref={containerRef}
      className="hp-slideshow"
      aria-label="LaunchPilot Real Screenshot Tour"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="hp-slideshow-wrap">
        {/* Section Heading */}
        <div className="hp-slideshow-head">
          <div className="hp-slideshow-badge">
            <span className="hp-slideshow-badge-dot" aria-hidden="true" />
            Live Platform Showcase
          </div>
          <h2 className="hp-slideshow-title">
            See the exact blueprints our 12 AI co-founders build.
          </h2>
          <p className="hp-slideshow-lede">
            Real interactive screenshots from LaunchPilot Studio. From multi-model investor debates to dynamic unit economics and ready-to-post launch copy.
          </p>
        </div>

        {/* Tab Pills Bar (VenturusAI-inspired) */}
        <div className="hp-slideshow-tabs" role="tablist" aria-label="Product tour tabs">
          {SLIDES.map((slide, idx) => {
            const Icon = slide.icon;
            const isActive = idx === currentIndex;
            return (
              <button
                key={slide.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`slide-panel-${slide.id}`}
                id={`slide-tab-${slide.id}`}
                className={`hp-slideshow-tab ${isActive ? "is-active" : ""}`}
                onClick={() => goToIndex(idx)}
              >
                <span className="hp-slideshow-tab-icon">
                  <Icon size={16} />
                </span>
                <span>{slide.label}</span>
                <span className="hp-slideshow-tab-num">{slide.numeral}</span>
                {isActive && isPlaying && !isHovered && isInViewport && (
                  <span
                    className="hp-slideshow-tab-timer"
                    style={{ animationDuration: `${AUTOPLAY_DURATION}ms` }}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Mac Window Frame */}
        <div
          className="hp-slideshow-frame"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* macOS Titlebar */}
          <div className="hp-slideshow-titlebar">
            <div className="hp-slideshow-dots" aria-hidden="true">
              <span className="hp-slideshow-dot is-close" />
              <span className="hp-slideshow-dot is-min" />
              <span className="hp-slideshow-dot is-max" />
            </div>

            <div className="hp-slideshow-address">
              <span className="is-lock" aria-hidden="true">
                <Lock size={12} />
              </span>
              <strong>{currentSlide.url}</strong>
            </div>

            <div className="hp-slideshow-titlebar-right">
              <span className="hp-slideshow-live-badge">
                Real capture
              </span>
            </div>
          </div>

          {/* Viewport for Screenshots */}
          <div className="hp-slideshow-viewport">
            {SLIDES.map((slide, idx) => (
              <div
                key={slide.id}
                id={`slide-panel-${slide.id}`}
                role="tabpanel"
                aria-labelledby={`slide-tab-${slide.id}`}
                className={`hp-slideshow-slide ${idx === currentIndex ? "is-active" : ""}`}
              >
                <img
                  src={slide.image}
                  alt={`${slide.title} — Real screenshot from LaunchPilot`}
                  className="hp-slideshow-img"
                  loading={idx === 0 ? "eager" : "lazy"}
                />
              </div>
            ))}

            {/* Previous Arrow */}
            <button
              type="button"
              className="hp-slideshow-arrow is-prev"
              onClick={goToPrev}
              aria-label="Previous screenshot"
            >
              <ChevronLeft size={22} />
            </button>

            {/* Next Arrow */}
            <button
              type="button"
              className="hp-slideshow-arrow is-next"
              onClick={goToNext}
              aria-label="Next screenshot"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          {/* Bottom Information Glass Bar */}
          <div className="hp-slideshow-caption-bar">
            <div className="hp-slideshow-caption-text">
              <div className="hp-slideshow-caption-title">
                <span>{currentSlide.title}</span>
                <span className="hp-slideshow-caption-pill">{currentSlide.tag}</span>
              </div>
              <p className="hp-slideshow-caption-desc">{currentSlide.desc}</p>
            </div>

            <div className="hp-slideshow-caption-actions">
              <button
                type="button"
                className="hp-slideshow-playpause"
                onClick={() => setIsPlaying(!isPlaying)}
                aria-label={isPlaying ? "Pause slideshow autoplay" : "Resume slideshow autoplay"}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} />}
              </button>

              <button
                type="button"
                className="hp-slideshow-cta"
                onClick={() => onCtaClick?.()}
              >
                Test your idea now <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Dot Indicators */}
        <div className="hp-slideshow-indicators" role="tablist" aria-label="Jump to slide">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              className={`hp-slideshow-indicator-dot ${idx === currentIndex ? "is-active" : ""}`}
              onClick={() => goToIndex(idx)}
              aria-label={`Jump to slide ${idx + 1}: ${slide.label}`}
              aria-selected={idx === currentIndex}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
