"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";

/*
 * Site-wide text reveal: every heading and paragraph in the page content rises into view line by line
 * (masked) the first time it scrolls into view. Skips text that already animates itself: SplitHeading,
 * the pinned 3D / scroll scenes, the planner steps, dialogs and the header. Off in lite / reduced motion.
 */
const SKIP = "[data-split], [data-immersive], [data-pg], [data-stage], [data-in], [data-step], [data-outro], [role=dialog], header, [data-no-reveal]";

export function TextReveal() {
  const pathname = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    if (root.classList.contains("lite") || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const main = document.getElementById("main");
    if (!main) return;
    const splits: SplitText[] = [];
    const tweens: gsap.core.Tween[] = [];
    let cancelled = false;

    const run = () => {
      if (cancelled) return;
      const els = Array.from(main.querySelectorAll<HTMLElement>("h1, h2, h3, h4, p, blockquote")).filter(
        (el) => !el.closest(SKIP) && !el.querySelector(SKIP) && el.textContent?.trim() && el.offsetParent !== null,
      );
      els.forEach((el) => {
        // already on screen at load: leave it alone so nothing flashes
        if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
        const heading = /^H\d$/.test(el.tagName);
        const split = SplitText.create(el, { type: "lines", mask: "lines", aria: "none", autoSplit: true,
          onSplit: (self) => {
            const t = gsap.from(self.lines, {
              yPercent: 105,
              opacity: heading ? 1 : 0,
              duration: heading ? 1.1 : 0.9,
              stagger: 0.07,
              ease: "power4.out",
              scrollTrigger: { trigger: el, start: "top 90%", once: true },
            });
            tweens.push(t);
            return t;
          },
        });
        splits.push(split);
      });
      ScrollTrigger.refresh();
    };
    // after fonts (correct line breaks) and after the page's own components have mounted
    const id = window.setTimeout(() => (document.fonts?.status === "loaded" ? run() : document.fonts.ready.then(run)), 300);
    return () => {
      cancelled = true;
      clearTimeout(id);
      tweens.forEach((t) => t.scrollTrigger?.kill());
      splits.forEach((s) => s.revert());
    };
  }, [pathname]);
  return null;
}
