"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useSite } from "@/components/providers/SiteProvider";
import { categories } from "@/content/catalog";
import { href } from "@/lib/i18n";
import { IconArrow } from "@/components/ui/Icons";
import { TractorTop } from "./TractorTop";

/*
 * Banorama-style illustrated scroll scene: an aerial Libyan farm (pivot circles, crop strips,
 * a dirt track). The tractor drives the track as you scroll; each category is a stop.
 */
const W = 1000;
const H = 2600;
const stops = [
  { x: 330, y: 420, side: "right" as const },
  { x: 680, y: 1030, side: "left" as const },
  { x: 320, y: 1640, side: "right" as const },
  { x: 660, y: 2230, side: "left" as const },
];
const track = `M500,-20 C500,180 330,260 ${stops[0].x},${stops[0].y} S760,760 ${stops[1].x},${stops[1].y} S240,1380 ${stops[2].x},${stops[2].y} S740,1980 ${stops[3].x},${stops[3].y} S500,2500 500,2640`;

const r2 = (n: number) => Math.round(n * 100) / 100;

function Pivot({ cx, cy, r, tone = "#6c9a35", spin = 0 }: { cx: number; cy: number; r: number; tone?: string; spin?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={tone} />
      <circle cx={cx} cy={cy} r={r * 0.66} fill="none" stroke="#ffffff22" strokeWidth={2} />
      <circle cx={cx} cy={cy} r={r * 0.33} fill="none" stroke="#ffffff22" strokeWidth={2} />
      <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: `gg-spin ${40 + spin}s linear infinite` }}>
        <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke="#f1eee9" strokeWidth={3} />
        <path d={`M${cx},${cy} L${cx + r},${cy} A${r},${r} 0 0,0 ${r2(cx + r * Math.cos(-0.5))},${r2(cy + r * Math.sin(-0.5))} Z`} fill="#ffffff18" />
      </g>
      <circle cx={cx} cy={cy} r={5} fill="#f1eee9" />
    </g>
  );
}

function Strip({ x, y, w, h, fill, rows, rot = 0 }: { x: number; y: number; w: number; h: number; fill: string; rows: string; rot?: number }) {
  return (
    <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
      <rect x={x} y={y} width={w} height={h} fill={fill} />
      {Array.from({ length: Math.floor(h / 14) }, (_, i) => (
        <line key={i} x1={x} x2={x + w} y1={y + 7 + i * 14} y2={y + 7 + i * 14} stroke={rows} strokeWidth={2} />
      ))}
    </g>
  );
}

export function FieldJourney() {
  const { d, lang } = useSite();
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const tractor = q("[data-tractor]")[0];
      const path = q("[data-track]")[0] as unknown as SVGPathElement;
      const dust = q("[data-drawn]")[0] as unknown as SVGPathElement;
      const len = path.getTotalLength();
      gsap.set(dust, { strokeDasharray: len, strokeDashoffset: len });

      if (document.documentElement.classList.contains("lite")) {
        gsap.set(tractor, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: true, start: 0.5, end: 0.5 } });
        gsap.set(dust, { strokeDashoffset: 0 });
        return;
      }
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: q("[data-map]")[0], start: "top 55%", end: "bottom 55%", scrub: 0.8 },
      });
      tl.to(tractor, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: true }, duration: 1 }, 0).to(
        dust,
        { strokeDashoffset: 0, duration: 1 },
        0,
      );
      tl.progress(0.0001);

      // cards light up as the tractor reaches each stop
      q("[data-stop]").forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 62%",
          end: "bottom 30%",
          toggleClass: { targets: el, className: "is-on" },
        });
        gsap.from(el.querySelector("[data-card]"), {
          y: 60,
          opacity: 0,
          duration: 1,
          scrollTrigger: { trigger: el, start: "top 80%", once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative overflow-hidden bg-[#e8dcc4]">
      <div className="wrap section-y relative z-10 pb-0!">
        <h2 className="display mt-4 max-w-5xl">{d.home.journeyTitle}</h2>
        <p className="lead mt-6 max-w-xl">{d.home.journeyLead}</p>
      </div>

      <div data-map className="relative mx-auto mt-10 w-full max-w-[1100px]" style={{ aspectRatio: `${W} / ${H}` }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full" aria-hidden>
          <defs>
            <pattern id="sand" width="18" height="18" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="1.2" fill="#d8c7a5" />
              <circle cx="12" cy="11" r="0.9" fill="#d8c7a5" />
            </pattern>
          </defs>
          <rect width={W} height={H} fill="url(#sand)" />
          {/* fields */}
          <Strip x={40} y={120} w={240} h={180} fill="#c9a659" rows="#b8943f" rot={-4} />
          <Strip x={720} y={180} w={240} h={260} fill="#7e9a46" rows="#6b8738" rot={3} />
          <Pivot cx={760} cy={600} r={150} tone="#5f8e2e" />
          <Pivot cx={150} cy={780} r={120} tone="#7aa23d" spin={8} />
          <Strip x={60} y={1020} w={300} h={200} fill="#a9784b" rows="#8f6339" rot={-2} />
          <Pivot cx={830} cy={1300} r={130} tone="#6c9a35" spin={4} />
          <Pivot cx={180} cy={1350} r={95} tone="#88ad4a" spin={12} />
          <Strip x={640} y={1600} w={320} h={180} fill="#d1b06a" rows="#bc9a52" rot={4} />
          <Pivot cx={140} cy={1950} r={140} tone="#5f8e2e" spin={6} />
          <Strip x={60} y={2280} w={260} h={220} fill="#7e9a46" rows="#6b8738" rot={-3} />
          <Pivot cx={860} cy={2450} r={110} tone="#7aa23d" spin={2} />
          {/* track */}
          <path d={track} fill="none" stroke="#cdb48a" strokeWidth={46} strokeLinecap="round" />
          <path d={track} fill="none" stroke="#bfa274" strokeWidth={46} strokeDasharray="2 22" strokeLinecap="round" opacity={0.5} />
          <path data-track d={track} fill="none" stroke="none" />
          {/* tyre marks drawn behind the tractor */}
          <path data-drawn d={track} fill="none" stroke="#8f7650" strokeWidth={3} strokeDasharray="6 8" opacity={0.7} transform="translate(-14 0)" />
          {stops.map((s, i) => (
            <g key={i}>
              <circle cx={s.x} cy={s.y} r={36} fill="#f1eee9" stroke="#43780e" strokeWidth={3} />
              <text x={s.x} y={s.y + 7} textAnchor="middle" fontSize="22" fontFamily="var(--font-geist-mono)" fill="#43780e">
                {categories[i].num}
              </text>
            </g>
          ))}
          <g data-tractor>
            <g transform="scale(1.3)">
              <TractorTop />
            </g>
          </g>
        </svg>

        {/* stop cards (HTML, positioned in % so they scale with the illustration) */}
        {stops.map((s, i) => {
          const c = categories[i];
          const left = (s.x / W) * 100;
          const top = (s.y / H) * 100;
          const rightSide = s.side === "right";
          return (
            <div
              key={c.slug}
              data-stop
              className="group/stop absolute -translate-y-1/2"
              style={{
                top: `${top}%`,
                ...(rightSide ? { left: `calc(${left}% + 6%)` } : { right: `calc(${100 - left}% + 6%)` }),
                width: "min(38%, 340px)",
                height: "10%",
              }}
            >
              <Link
                data-card
                href={href(`/products/${c.slug}`, lang)}
                className="absolute top-1/2 block w-full -translate-y-1/2 bg-sand-50 p-3 shadow-[0_20px_40px_-20px_rgba(20,20,15,0.35)] transition-all duration-500 group-[.is-on]/stop:-translate-y-[55%] group-[.is-on]/stop:shadow-[0_30px_60px_-20px_rgba(20,20,15,0.45)] md:p-4"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-sand-200">
                  <Image src={c.image} alt="" fill sizes="(max-width:768px) 42vw, 380px" className="object-cover transition duration-700 group-hover/stop:scale-105" />
                </div>
                <div className="mt-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="eyebrow text-[10px] text-green-700 md:text-xs">
                      {c.num} · {c.short[lang]}
                    </p>
                    <p className="mt-1 font-display text-base leading-tight text-ink-900 md:text-2xl">{c.title[lang]}</p>
                  </div>
                  <IconArrow className="mt-1 size-4 shrink-0 text-green-700" />
                </div>
                <p className="mt-2 hidden text-sm text-ink-700 md:block">{c.intro[lang]}</p>
              </Link>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes gg-spin{to{transform:rotate(360deg)}} html.lite [style*="gg-spin"]{animation:none!important}`}</style>
    </section>
  );
}
