// hooks/useScrollReveal.js
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function useScrollReveal(dependency, containerRef) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scrollTarget = containerRef?.current || window;

    // 1. Cursor Spotlight Tracking for Bento & Mac Cards
    function handlePointerMove(e) {
      const cards = document.querySelectorAll(".spotlight-card, .spotlight-border");
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        // Only update if card is visible near cursor
        if (
          e.clientX >= rect.left - 100 &&
          e.clientX <= rect.right + 100 &&
          e.clientY >= rect.top - 100 &&
          e.clientY <= rect.bottom + 100
        ) {
          card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
          card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
        }
      });
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    // 2. Scroll-driven progress
    function updateScrollProgress() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      const progressBar = document.getElementById("global-scroll-progress");
      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }
    }
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    updateScrollProgress();

    // 3. GSAP ScrollTrigger for smooth reveals & element entry
    let ctx;
    if (!isReducedMotion) {
      ctx = gsap.context(() => {
        const elements = document.querySelectorAll(".reveal-on-scroll:not(.is-revealed)");
        elements.forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 28 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: "expo.out",
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                once: true,
                onEnter: () => el.classList.add("is-revealed"),
              },
            }
          );
        });
      });
    } else {
      // Immediate reveal for reduced motion
      document.querySelectorAll(".reveal-on-scroll").forEach((el) => el.classList.add("is-revealed"));
    }

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", updateScrollProgress);
      if (ctx) ctx.revert();
    };
  }, [dependency, containerRef]);
}

