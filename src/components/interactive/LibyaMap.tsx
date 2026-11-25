"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useSite } from "@/components/providers/SiteProvider";
import { branches, type Branch } from "@/content/site";
import { waLink } from "@/lib/whatsapp";
import { IconPhone, IconWhatsApp } from "@/components/ui/Icons";

/*
 * Stylised Libya outline (simplified from approximate border coordinates — not survey-accurate).
 * Projection: equirectangular over lon 9–26°E, lat 19–34°N.
 */
const LON0 = 9,
  LON1 = 26,
  LAT0 = 19,
  LAT1 = 34;
const VW = 600,
  VH = (VW * (LAT1 - LAT0)) / (LON1 - LON0);
const px = (lon: number, lat: number) => [((lon - LON0) / (LON1 - LON0)) * VW, ((LAT1 - lat) / (LAT1 - LAT0)) * VH] as const;

const outline: [number, number][] = [
  [11.56, 33.17], [12.3, 32.84], [13.19, 32.89], [14.2, 32.72], [15.2, 32.35], [15.6, 31.65], [16.6, 31.2], [17.6, 30.9], [18.6, 30.45],
  [19.2, 30.3], [19.75, 30.6], [20.15, 31.2], [20.05, 32.1], [20.55, 32.55], [21.6, 32.9], [22.6, 32.8], [23.2, 32.45], [23.95, 32.05],
  [24.7, 31.95], [25.15, 31.6], [24.85, 31.0], [24.95, 30.1], [24.7, 29.2], [25.0, 28.0], [25.0, 22.0], [25.0, 20.0], [24.0, 20.0],
  [24.0, 19.5], [21.0, 21.0], [18.0, 22.5], [16.0, 23.45], [15.0, 23.0], [14.2, 22.6], [13.5, 23.1], [12.0, 23.5], [11.6, 24.3],
  [10.3, 24.6], [10.0, 25.3], [9.4, 26.2], [9.9, 27.0], [9.8, 28.0], [9.6, 29.0], [9.5, 30.2], [10.2, 30.8], [10.0, 31.4], [10.9, 32.2],
  [11.5, 32.6],
];
const outlinePath = "M" + outline.map(([lo, la]) => px(lo, la).map((n) => n.toFixed(1)).join(",")).join(" L") + " Z";

export function LibyaMap() {
  const { d, lang } = useSite();
  const [active, setActive] = useState<Branch>(branches[0]);
  const svgRef = useRef<SVGSVGElement>(null);

  /*
   * When the map is actually on screen: the border draws itself in one continuous stroke, the land and
   * labels fade in, then the three branch cities pop up one after another.
   * (An IntersectionObserver rather than a ScrollTrigger: the pinned 3D sections above shift the page after
   * ScrollTrigger measures it, which made the drawing fire long before the map was visible.)
   */
  useGSAP(
    () => {
      const svg = svgRef.current!;
      if (document.documentElement.classList.contains("lite") || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const q = gsap.utils.selector(svg);
      const border = svg.querySelector("[data-border]") as SVGPathElement;
      const blen = border.getTotalLength();
      // real lengths (not pathLength) so the stroke reliably appears only where the pen has been
      border.setAttribute("stroke-dasharray", `${blen} ${blen}`);
      border.setAttribute("stroke-dashoffset", String(blen));
      gsap.set(q("[data-land], [data-label]"), { opacity: 0 });
      gsap.set(q("[data-city]"), { opacity: 0, scale: 0.4, transformOrigin: "50% 50%" });
      const tl = gsap
        .timeline({ paused: true })
        .to(q("[data-border]"), {
          duration: 2.2,
          ease: "none",
          // a pen tip leads the stroke round the border, so it reads as being drawn by hand
          onUpdate() {
            const path = svg.querySelector("[data-border]") as SVGPathElement;
            const pen = svg.querySelector("[data-pen]") as SVGCircleElement;
            const len = path.getTotalLength();
            const pt = path.getPointAtLength(len * this.progress());
            pen.setAttribute("cx", String(pt.x));
            pen.setAttribute("cy", String(pt.y));
            path.setAttribute("stroke-dashoffset", String(len * (1 - this.progress())));
            pen.style.opacity = this.progress() < 1 ? "1" : "0";
          },
        })
        .to(q("[data-land]"), { opacity: 1, duration: 0.8, ease: "power2.out" }, "-=0.3")
        .to(q("[data-label]"), { opacity: 1, duration: 0.5, ease: "power2.out" }, "<")
        .to(q("[data-city]"), { opacity: 1, scale: 1, duration: 0.7, stagger: 0.25, ease: "back.out(2)" }, "-=0.2");
      const io = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return;
          tl.play();
          io.disconnect();
        },
        { threshold: 0.45 },
      );
      io.observe(svg);
      return () => io.disconnect();
    },
    { scope: svgRef },
  );

  return (
    <div className="grid gap-10 md:grid-cols-12 md:items-center">
      <div className="md:order-2 md:col-span-7">
        <svg ref={svgRef} viewBox={`0 0 ${VW} ${VH}`} className="mx-auto w-[60%]" role="img" aria-label="Map of Libya with Ghargrow branches">
          <defs>
            <pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="5" cy="5" r="1.4" fill="#43780e" opacity="0.35" />
            </pattern>
          </defs>
          <path data-land d={outlinePath} fill="url(#dots)" stroke="none" />
          <path
            data-border
            d={outlinePath}
            fill="none"
            stroke="#43780e"
            strokeWidth={1.8}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle data-pen r={5} fill="#43780e" opacity={0} style={{ transition: "opacity .3s" }} />
          {/* Mediterranean label */}
          <text data-label x={px(16, 33.6)[0]} y={px(16, 33.6)[1]} fontSize={12} fill="#67635c" fontFamily="var(--font-geist-mono)" letterSpacing={3}>
            {lang === "ar" ? "البحر المتوسط" : "MEDITERRANEAN SEA"}
          </text>
          {/* Tripoli reference */}
          {(() => {
            const [tx, ty] = px(13.19, 32.89);
            return (
              <g data-label>
                <circle cx={tx} cy={ty} r={3} fill="#67635c" />
                <text x={tx + 8} y={ty + 16} fontSize={12} fill="#67635c">
                  {lang === "ar" ? "طرابلس" : "Tripoli"}
                </text>
              </g>
            );
          })()}
          {branches.map((b) => {
            const [bx, by] = px(b.lon, b.lat);
            const on = b.id === active.id;
            return (
              <g data-city key={b.id} className="cursor-pointer" onClick={() => setActive(b)} onMouseEnter={() => setActive(b)}>
                <circle cx={bx} cy={by} r={on ? 26 : 16} fill="#43780e" opacity={0.15}>
                  <animate attributeName="r" values={on ? "16;30;16" : "12;18;12"} dur="2.4s" repeatCount="indefinite" />
                </circle>
                <circle cx={bx} cy={by} r={8} fill={on ? "#43780e" : "#f1eee9"} stroke="#43780e" strokeWidth={3} />
                <text x={bx} y={by - 18} textAnchor="middle" fontSize={16} fill="#14140f" fontWeight={on ? 600 : 400}>
                  {b.city[lang]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="md:col-span-5">
        <div className="flex gap-2">
          {branches.map((b) => (
            <button
              key={b.id}
              onClick={() => setActive(b)}
              className={`h-10 flex-1 border text-sm transition ${b.id === active.id ? "border-green-700 bg-green-700 text-white" : "border-ink-900/15 hover:border-ink-900"}`}
            >
              {b.city[lang]}
            </button>
          ))}
        </div>
        <div className="mt-8 border-t border-ink-900/10 pt-8">
          <p className="eyebrow text-ink-400">{active.hq ? d.contact.hq : d.footer.branches}</p>
          <p className="display mt-2">{active.city[lang]}</p>
          <p dir="ltr" className={`mt-4 font-mono text-lg text-ink-900 ${lang === "ar" ? "text-right" : ""}`}>
            {active.phoneDisplay}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={`tel:${active.phone}`} className="group inline-flex h-12 items-center gap-3 bg-ink-900 px-6 text-white hover:bg-green-700">
              <IconPhone /> {d.cta.call}
            </a>
            <a
              href={waLink(active.whatsapp, d.contact.waGeneral)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-3 bg-whatsapp px-6 text-ink-900 hover:brightness-95"
            >
              <IconWhatsApp /> {d.cta.whatsapp}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
