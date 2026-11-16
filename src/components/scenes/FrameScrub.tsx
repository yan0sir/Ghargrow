"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useFrameSequence } from "@/components/motion/useFrameSequence";

/**
 * Generic pinned, scroll-scrubbed frame sequence with an overlay.
 * Used for the "on the move" pass on Home and the flagship product showcase.
 */
export function FrameScrub({
  name,
  frames,
  step = 1,
  length = "+=150%",
  children,
  poster,
  className = "",
}: {
  name: string;
  frames: number;
  step?: number;
  length?: string;
  children?: React.ReactNode;
  poster: string;
  className?: string;
}) {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const render = useFrameSequence(canvas, { name, frames, step, mobileStep: step });

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      if (document.documentElement.classList.contains("lite")) {
        render(0.5);
        return;
      }
      const callouts = q("[data-callout]");
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: length,
          pin: q("[data-stage]")[0],
          scrub: 0.5,
          onUpdate: (s) => render(s.progress),
        },
      });
      tl.to({}, { duration: 1 }, 0);
      callouts.forEach((c, i) => {
        const at = (i + 0.5) / (callouts.length + 0.5);
        tl.fromTo(c, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.08 }, at - 0.08).to(
          c,
          { autoAlpha: 0, y: -30, duration: 0.08 },
          Math.min(0.98, at + 0.22),
        );
      });
      render(0);
    },
    { scope: root },
  );

  return (
    <section ref={root} className={`relative ${className}`} data-immersive>
      <div data-stage className="relative h-svh overflow-hidden bg-ink-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={poster} alt="" className="absolute inset-0 size-full object-cover" loading="lazy" />
        <canvas ref={canvas} className="absolute inset-0 size-full" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-transparent to-ink-900/30" />
        {children}
      </div>
    </section>
  );
}
