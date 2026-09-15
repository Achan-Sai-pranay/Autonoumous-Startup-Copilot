// hooks/useScrollReveal.js
import { useEffect } from "react";

export function useScrollReveal(dependency) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    function revealVisible() {
      const elements = document.querySelectorAll(".reveal-on-scroll:not(.is-revealed)");
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        // If element is already anywhere in or near the viewport, reveal immediately
        if (rect.top <= viewportHeight * 0.95 && rect.bottom >= -50) {
          el.classList.add("is-revealed");
        }
      });
    }

    // Run immediately on render
    revealVisible();
    const t1 = setTimeout(revealVisible, 50);
    const t2 = setTimeout(revealVisible, 200);
    const t3 = setTimeout(revealVisible, 600);

    let observer;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-revealed");
            }
          });
        },
        {
          threshold: 0.05,
          rootMargin: "80px 0px 80px 0px",
        }
      );

      const elements = document.querySelectorAll(".reveal-on-scroll");
      elements.forEach((el) => observer.observe(el));
    }

    window.addEventListener("scroll", revealVisible, { passive: true });
    window.addEventListener("resize", revealVisible, { passive: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener("scroll", revealVisible);
      window.removeEventListener("resize", revealVisible);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [dependency]);
}
