"use client";

import { useMemo, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Deterministic PRNG so server and client render the same field. */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

type Stalk = { x: number; h: number; bend: number; kind: "wheat" | "alfalfa" | "corn"; delay: number; w: number };

/**
 * A row of crops that sprout and grow as you scroll (POLA-style growth).
 * Stems draw from the soil up, then heads/leaves unfurl.
 */
export function GrowingCrops({
  className = "",
  density = 48,
  seed = 7,
  tone = "light",
  scrub = true,
  kinds = ["wheat", "alfalfa", "corn"],
}: {
  className?: string;
  density?: number;
  seed?: number;
  tone?: "light" | "dark";
  scrub?: boolean;
  kinds?: Stalk["kind"][];
}) {
  const ref = useRef<SVGSVGElement>(null);
  const stalks = useMemo<Stalk[]>(() => {
    const r = rng(seed);
    return Array.from({ length: density }, (_, i) => ({
      x: (i + 0.2 + r() * 0.6) * (1000 / density),
      h: 55 + r() * 40,
      bend: (r() - 0.5) * 14,
      kind: kinds[Math.floor(r() * kinds.length)],
      delay: r(),
      w: 0.9 + r() * 0.6,
    }));
  }, [density, seed, kinds]);

  useGSAP(
    () => {
      const svg = ref.current!;
      const stems = svg.querySelectorAll<SVGPathElement>("[data-stem]");
      const heads = svg.querySelectorAll<SVGGElement>("[data-head]");
      if (document.documentElement.classList.contains("lite")) return;
      gsap.set(stems, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(heads, { scale: 0, transformBox: "fill-box", transformOrigin: "50% 100%" });
      const tl = gsap.timeline({
        scrollTrigger: scrub
          ? { trigger: svg, start: "top 95%", end: "bottom 45%", scrub: 0.8 }
          : { trigger: svg, start: "top 90%", once: true },
      });
      stems.forEach((s, i) => tl.to(s, { strokeDashoffset: 0, duration: 1, ease: "power2.out" }, stalks[i].delay * 0.8));
      heads.forEach((h, i) => tl.to(h, { scale: 1, duration: 0.6, ease: "back.out(2)" }, 0.7 + stalks[i].delay * 0.8));
    },
    { scope: ref },
  );

  const stem = tone === "dark" ? "currentColor" : "var(--green-700)";
  const head = tone === "dark" ? "var(--green-300)" : "var(--wheat-400)";
  const leaf = tone === "dark" ? "currentColor" : "var(--green-500)";

  return (
    <svg ref={ref} viewBox="0 0 1000 100" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden>
      {stalks.map((s, i) => {
        const top = 100 - s.h;
        const d = `M${s.x} 100 Q ${s.x + s.bend * 0.3} ${100 - s.h * 0.5} ${s.x + s.bend} ${top}`;
        return (
          <g key={i}>
            <path data-stem d={d} pathLength={1} fill="none" stroke={stem} strokeWidth={s.w * 2} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
            <g data-head>
              {s.kind === "wheat" && (
                <g>
                  {[0, 1, 2, 3, 4].map((k) => (
                    <ellipse key={k} cx={s.x + s.bend + (k % 2 ? 2.6 : -2.6)} cy={top + 2 + k * 4} rx={2.6} ry={3.8} fill={head} />
                  ))}
                  <ellipse cx={s.x + s.bend} cy={top - 2} rx={2} ry={3.4} fill={head} />
                </g>
              )}
              {s.kind === "alfalfa" && (
                <g>
                  <ellipse cx={s.x + s.bend - 5} cy={top + 8} rx={6} ry={2.6} fill={leaf} transform={`rotate(-25 ${s.x + s.bend - 5} ${top + 8})`} />
                  <ellipse cx={s.x + s.bend + 5} cy={top + 4} rx={6} ry={2.6} fill={leaf} transform={`rotate(25 ${s.x + s.bend + 5} ${top + 4})`} />
                  <circle cx={s.x + s.bend} cy={top} r={3} fill={tone === "dark" ? "var(--green-300)" : "#8e7cc3"} />
                </g>
              )}
              {s.kind === "corn" && (
                <g>
                  <path d={`M${s.x + s.bend * 0.6} ${top + 20} q 10 -6 14 -2`} stroke={leaf} strokeWidth={1.2} fill="none" vectorEffect="non-scaling-stroke" />
                  <path d={`M${s.x + s.bend * 0.4} ${top + 32} q -10 -6 -14 -2`} stroke={leaf} strokeWidth={1.2} fill="none" vectorEffect="non-scaling-stroke" />
                  <path d={`M${s.x + s.bend} ${top} l -2 -5 m 2 5 l 2 -5 m -2 5 l 0 -6`} stroke={head} strokeWidth={1} fill="none" vectorEffect="non-scaling-stroke" />
                </g>
              )}
            </g>
          </g>
        );
      })}
    </svg>
  );
}
