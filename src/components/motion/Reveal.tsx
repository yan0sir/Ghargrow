"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";

/** Fade/slide children in as they enter the viewport. Use `stagger` to animate direct children in sequence. */
export function Reveal({
  children,
  className = "",
  stagger = 0,
  y = 40,
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
  delay?: number;
  as?: React.ElementType;
}) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const el = ref.current!;
      if (document.documentElement.classList.contains("lite")) return;
      const targets = stagger ? Array.from(el.children) : [el];
      gsap.set(targets, { y, opacity: 0 });
      ScrollTrigger.batch(targets, {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { y: 0, opacity: 1, duration: 1.1, delay, stagger: stagger || 0, ease: "power3.out", overwrite: true }),
      });
    },
    { scope: ref },
  );
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

/** Headline that reveals line by line (Noho / ZettaJoule style). */
export function SplitHeading({
  children,
  className = "",
  as: Tag = "h2",
  immediate = false,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  immediate?: boolean;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const el = ref.current!;
      if (document.documentElement.classList.contains("lite")) return;
      let split: SplitText | null = null;
      const run = () => {
        split = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line-inner",
          // whole lines stay readable as they are, so no aria-label is needed (it is invalid on a <p>)
          aria: "none",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 110,
              duration: 1.2,
              stagger: 0.09,
              delay,
              ease: "power4.out",
              scrollTrigger: immediate ? undefined : { trigger: el, start: "top 88%", once: true },
            }),
        });
      };
      // wait for fonts so line breaks are correct
      if (document.fonts?.status === "loaded") run();
      else document.fonts.ready.then(run);
      return () => split?.revert();
    },
    { scope: ref },
  );
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
