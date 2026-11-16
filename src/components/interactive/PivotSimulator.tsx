"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useSite } from "@/components/providers/SiteProvider";
import { ContactButton } from "@/components/contact/ContactButton";

/*
 * Pivot coverage simulator. Indicative maths only:
 *   centre pivot: radius = spans × span length (+ end-gun throw), area = π r²
 *   linear: area = machine width × field length
 * TODO(client): replace span lengths / end-gun throw with Western model data.
 */
const SPAN_LENGTHS = [42, 48, 54, 60];
const END_GUN = 18; // metres, indicative

function Ticker({ value, digits = 0 }: { value: number; digits?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);
  useEffect(() => {
    const o = { v: prev.current };
    const t = gsap.to(o, {
      v: value,
      duration: 0.6,
      ease: "power2.out",
      onUpdate: () => {
        if (ref.current) ref.current.textContent = o.v.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits });
      },
    });
    prev.current = value;
    return () => {
      t.kill();
    };
  }, [value, digits]);
  return (
    <span ref={ref} dir="ltr">
      {value.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits })}
    </span>
  );
}

export function PivotSimulator({ dark = false }: { dark?: boolean }) {
  const { d } = useSite();
  const [mode, setMode] = useState<"centre" | "linear">("centre");
  const [spans, setSpans] = useState(6);
  const [len, setLen] = useState(54);
  const [gun, setGun] = useState(true);
  const [fieldLen, setFieldLen] = useState(800);
  const arm = useRef<SVGGElement>(null);
  const root = useRef<HTMLDivElement>(null);

  const radius = spans * len + (gun ? END_GUN : 0);
  const area = mode === "centre" ? (Math.PI * radius * radius) / 10000 : (spans * len * fieldLen) / 10000;

  useGSAP(
    () => {
      if (!arm.current) return;
      gsap.to(arm.current, { rotation: 360, duration: 18, repeat: -1, ease: "none", svgOrigin: "200 200" });
    },
    { scope: root, dependencies: [mode] },
  );

  const maxR = 10 * 60 + END_GUN;
  const rPx = Math.round((radius / maxR) * 18000) / 100;
  const towers = spans;
  const detail =
    mode === "centre"
      ? `${d.sim.centre}, ${spans} × ${len} m${gun ? ` + ${d.sim.endgun}` : ""}, ≈ ${area.toFixed(0)} ha`
      : `${d.sim.linear}, ${spans} × ${len} m, ${fieldLen} m, ≈ ${area.toFixed(0)} ha`;

  const fg = dark ? "text-white" : "text-ink-900";
  const muted = dark ? "text-white/60" : "text-ink-400";
  const line = dark ? "border-white/15" : "border-ink-900/10";

  return (
    <div ref={root} className={`grid gap-10 md:grid-cols-12 ${fg}`}>
      <div className="md:col-span-7">
        <div className={`relative aspect-square w-full max-w-[640px] ${dark ? "bg-[#c8b48a]/20" : "bg-[#e8dcc4]"}`}>
          <svg viewBox="0 0 400 400" className="absolute inset-0 size-full" role="img" aria-label={detail}>
            <defs>
              <pattern id="rows" width="8" height="8" patternUnits="userSpaceOnUse">
                <rect width="8" height="8" fill="#5f8e2e" />
                <line x1="0" y1="4" x2="8" y2="4" stroke="#6f9f39" strokeWidth="2" />
              </pattern>
            </defs>
            {mode === "centre" ? (
              <g>
                <circle cx={200} cy={200} r={rPx} fill="url(#rows)" style={{ transition: "r .6s cubic-bezier(.22,1,.36,1)" }} />
                {gun && <circle cx={200} cy={200} r={rPx} fill="none" stroke="#a9c98a" strokeWidth={(END_GUN / maxR) * 180 * 2} strokeOpacity={0.5} />}
                <g ref={arm}>
                  <line x1={200} y1={200} x2={200 + rPx} y2={200} stroke="#f1eee9" strokeWidth={3} />
                  {Array.from({ length: towers }, (_, i) => {
                    const x = 200 + ((i + 1) / towers) * (rPx - (gun ? (END_GUN / maxR) * 180 : 0));
                    return <rect key={i} x={x - 3} y={194} width={6} height={12} fill="#14140f" />;
                  })}
                  <path d={`M200,200 L${200 + rPx},200 A${rPx},${rPx} 0 0,0 ${(200 + rPx * Math.cos(-0.35)).toFixed(2)},${(200 + rPx * Math.sin(-0.35)).toFixed(2)} Z`} fill="#9db8e3" opacity={0.35} />
                </g>
                <circle cx={200} cy={200} r={6} fill="#f1eee9" stroke="#14140f" strokeWidth={2} />
              </g>
            ) : (
              <g>
                {(() => {
                  const w = ((spans * len) / (10 * 60)) * 340;
                  const h = (fieldLen / 1200) * 340;
                  return (
                    <g>
                      <rect x={200 - w / 2} y={200 - h / 2} width={w} height={h} fill="url(#rows)" style={{ transition: "all .6s" }} />
                      <g>
                        <line x1={200 - w / 2} x2={200 + w / 2} y1={200 + h / 2} y2={200 + h / 2} stroke="#f1eee9" strokeWidth={3}>
                          <animate attributeName="y1" values={`${200 + h / 2};${200 - h / 2};${200 + h / 2}`} dur="14s" repeatCount="indefinite" />
                          <animate attributeName="y2" values={`${200 + h / 2};${200 - h / 2};${200 + h / 2}`} dur="14s" repeatCount="indefinite" />
                        </line>
                      </g>
                    </g>
                  );
                })()}
              </g>
            )}
          </svg>
          <div className={`absolute start-3 top-3 eyebrow ${dark ? "text-white/80" : "text-ink-700"}`}>{mode === "centre" ? d.sim.centre : d.sim.linear}</div>
        </div>
      </div>

      <div className="flex flex-col md:col-span-5">
        <div className="flex gap-2">
          {(["centre", "linear"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`h-10 flex-1 border px-4 text-sm transition ${
                mode === m ? "border-green-700 bg-green-700 text-white" : `${line} ${dark ? "hover:border-white" : "hover:border-ink-900"}`
              }`}
            >
              {m === "centre" ? d.sim.centre : d.sim.linear}
            </button>
          ))}
        </div>

        <label className={`mt-8 block border-t pt-5 ${line}`}>
          <span className="flex justify-between text-sm">
            <span className={muted}>{d.sim.spans}</span>
            <span className="font-mono">{spans}</span>
          </span>
          <input type="range" min={1} max={10} value={spans} onChange={(e) => setSpans(+e.target.value)} className="mt-3 w-full accent-green-700" />
        </label>

        <div className={`mt-5 border-t pt-5 ${line}`}>
          <span className={`text-sm ${muted}`}>{d.sim.spanLength}</span>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {SPAN_LENGTHS.map((l) => (
              <button
                key={l}
                onClick={() => setLen(l)}
                className={`h-10 border font-mono text-sm ${len === l ? "border-green-700 bg-green-700 text-white" : line}`}
              >
                {l} m
              </button>
            ))}
          </div>
        </div>

        {mode === "centre" ? (
          <label className={`mt-5 flex items-center justify-between border-t pt-5 ${line}`}>
            <span className={`text-sm ${muted}`}>{d.sim.endgun}</span>
            <button
              onClick={() => setGun((g) => !g)}
              className={`h-9 w-24 border text-sm ${gun ? "border-green-700 bg-green-700 text-white" : line}`}
              aria-pressed={gun}
            >
              {gun ? d.sim.on : d.sim.off}
            </button>
          </label>
        ) : (
          <label className={`mt-5 block border-t pt-5 ${line}`}>
            <span className="flex justify-between text-sm">
              <span className={muted}>{d.sim.length}</span>
              <span className="font-mono">{fieldLen} m</span>
            </span>
            <input type="range" min={200} max={1200} step={50} value={fieldLen} onChange={(e) => setFieldLen(+e.target.value)} className="mt-3 w-full accent-green-700" />
          </label>
        )}

        <div className={`mt-8 grid grid-cols-2 gap-4 border-t pt-6 ${line}`}>
          <div>
            <p className={`eyebrow ${muted}`}>{mode === "centre" ? d.sim.radius : d.sim.width}</p>
            <p className="mt-2 font-display text-4xl font-light">
              <Ticker value={mode === "centre" ? radius : spans * len} /> <span className="text-lg">{d.sim.m}</span>
            </p>
          </div>
          <div>
            <p className={`eyebrow ${muted}`}>{d.sim.area}</p>
            <p className="mt-2 font-display text-4xl font-light text-green-500">
              <Ticker value={area} digits={1} /> <span className="text-lg">{d.sim.ha}</span>
            </p>
          </div>
        </div>
        <p className={`mt-4 text-xs ${muted}`}>{d.sim.note}</p>
        <div className="mt-6">
          <ContactButton topic={{ label: "Western pivot", kind: "quote", detail }} variant={dark ? "light" : "primary"}>
            {d.cta.getQuote}
          </ContactButton>
        </div>
      </div>
    </div>
  );
}
