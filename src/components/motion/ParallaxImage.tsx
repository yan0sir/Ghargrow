"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Image that sits taller than its frame and drifts upward as the frame scrolls through (ZettaJoule style). */
export function ParallaxImage({ src, alt, sizes, className = "" }: { src: string; alt: string; sizes: string; className?: string }) {
  const frame = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (document.documentElement.classList.contains("lite") || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        "[data-px]",
        { yPercent: -8 },
        { yPercent: 8, ease: "none", scrollTrigger: { trigger: frame.current, start: "top bottom", end: "bottom top", scrub: true } },
      );
    },
    { scope: frame },
  );
  return (
    <div ref={frame} className={`absolute inset-0 overflow-hidden ${className}`}>
      <div data-px className="absolute inset-x-0 -top-[10%] h-[120%]">
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
      </div>
    </div>
  );
}
