"use client";

import { useState } from "react";
import { useSite } from "@/components/providers/SiteProvider";
import { branches, type Branch } from "@/content/site";
import { projects } from "@/content/more";
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

  return (
    <div className="grid gap-10 md:grid-cols-12 md:items-center">
      <div className="md:col-span-7">
        <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full" role="img" aria-label="Map of Libya with Ghargrow branches">
          <defs>
            <pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="5" cy="5" r="1.4" fill="#43780e" opacity="0.35" />
            </pattern>
          </defs>
          <path d={outlinePath} fill="url(#dots)" stroke="#43780e" strokeWidth={1.5} strokeLinejoin="round" />
          {/* Mediterranean label */}
          <text x={px(16, 33.6)[0]} y={px(16, 33.6)[1]} fontSize={12} fill="#8a867f" fontFamily="var(--font-geist-mono)" letterSpacing={3}>
            {lang === "ar" ? "البحر المتوسط" : "MEDITERRANEAN SEA"}
          </text>
          {/* Tripoli reference */}
          {(() => {
            const [tx, ty] = px(13.19, 32.89);
            return (
              <g>
                <circle cx={tx} cy={ty} r={3} fill="#8a867f" />
                <text x={tx + 8} y={ty + 16} fontSize={12} fill="#8a867f">
                  {lang === "ar" ? "طرابلس" : "Tripoli"}
                </text>
              </g>
            );
          })()}
          {projects
            .filter((p) => p.coords)
            .map((p) => {
              const [qx, qy] = px(p.coords!.lon, p.coords!.lat);
              return <rect key={p.slug} x={qx - 4} y={qy - 4} width={8} height={8} fill="#d9b26a" transform={`rotate(45 ${qx} ${qy})`} />;
            })}
          {branches.map((b) => {
            const [bx, by] = px(b.lon, b.lat);
            const on = b.id === active.id;
            return (
              <g key={b.id} className="cursor-pointer" onClick={() => setActive(b)} onMouseEnter={() => setActive(b)}>
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
          <p className="mt-8 flex items-center gap-2 text-sm text-ink-400">
            <span className="inline-block size-2 rotate-45 bg-wheat-400" /> {d.projects.title}
          </p>
        </div>
      </div>
    </div>
  );
}
