"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useSite } from "@/components/providers/SiteProvider";

/** Collect → pack → stack: bales fly into a growing stack as you scroll (Arcusin category feature). */
export function BaleFlow() {
  const { lang } = useSite();
  const root = useRef<HTMLDivElement>(null);
  const steps =
    lang === "ar"
      ? ["التقاط البالات من الحقل", "حزمها في كتل محكمة", "رصّها جاهزة للنقل"]
      : ["Pick up bales across the field", "Pack them into tight blocks", "Stack them ready for transport"];

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const bales = q("[data-b]");
      if (document.documentElement.classList.contains("lite")) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 70%", end: "bottom 60%", scrub: 0.6 } });
      bales.forEach((b, i) => {
        tl.from(b, { x: -400 + (i % 4) * 40, y: -120 - (i % 3) * 40, rotate: -40 + i * 7, opacity: 0, duration: 1, ease: "power2.out" }, i * 0.25);
      });
      q("[data-step]").forEach((s, i) => tl.from(s, { opacity: 0.2, duration: 0.5 }, i * 1.4));
    },
    { scope: root },
  );

  return (
    <div ref={root} className="grid items-end gap-12 md:grid-cols-2">
      <ol className="space-y-6">
        {steps.map((s, i) => (
          <li key={i} data-step className="flex items-baseline gap-5 border-t border-ink-900/10 pt-5">
            <span className="font-mono text-sm text-green-700">0{i + 1}</span>
            <span className="h2">{s}</span>
          </li>
        ))}
      </ol>
      <svg viewBox="0 0 400 260" className="w-full" aria-hidden>
        <line x1={0} x2={400} y1={250} y2={250} stroke="#14140f" strokeOpacity={0.2} />
        {Array.from({ length: 16 }, (_, i) => {
          const col = i % 4,
            row = Math.floor(i / 4);
          const x = 110 + col * 62,
            y = 214 - row * 44;
          return (
            <g key={i} data-b>
              <rect x={x} y={y} width={60} height={36} fill="#c9b15b" />
              <line x1={x + 14} x2={x + 14} y1={y} y2={y + 36} stroke="#8f7a32" strokeWidth={2} />
              <line x1={x + 46} x2={x + 46} y1={y} y2={y + 36} stroke="#8f7a32" strokeWidth={2} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
