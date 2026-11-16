"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * The Ghargrow mark built from two layers (G-link body + leaves) so the leaves can "bloom":
 * they grow and unfurl from the stem. mode="scroll" blooms when scrolled into view,
 * mode="once" blooms immediately (loader).
 */
export function LeafMark({
  className = "",
  light = false,
  mode = "scroll",
  onDone,
}: {
  className?: string;
  light?: boolean;
  mode?: "scroll" | "once" | "static";
  onDone?: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const suf = light ? "-white" : "";
  useGSAP(
    () => {
      if (mode === "static") return;
      const leaves = root.current!.querySelector("[data-leaves]");
      const body = root.current!.querySelector("[data-body]");
      const tl = gsap.timeline({
        paused: mode === "scroll",
        onComplete: onDone,
        defaults: { ease: "back.out(1.6)" },
      });
      tl.from(body, { clipPath: "inset(100% 0 0 0)", duration: 0.9, ease: "expo.out" })
        // stem sits at roughly 22% / 30% of the mark box (bottom of the leaf pair)
        .from(leaves, { scale: 0, rotate: -35, transformOrigin: "22% 30%", duration: 1.1 }, "-=0.35");
      if (mode === "scroll") {
        ScrollTrigger.create({ trigger: root.current, start: "top 90%", once: true, onEnter: () => tl.play() });
      }
    },
    { scope: root },
  );
  return (
    <div ref={root} className={`relative aspect-[600/554] ${className}`} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img data-body src={`/media/logo/mark-body${suf}.png`} alt="" className="absolute inset-0 size-full" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img data-leaves src={`/media/logo/mark-leaves${suf}.png`} alt="" className="absolute inset-0 size-full" />
    </div>
  );
}
