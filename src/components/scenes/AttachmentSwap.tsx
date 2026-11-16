"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useSite } from "@/components/providers/SiteProvider";
import { findProduct, productHref } from "@/content/catalog";
import { href } from "@/lib/i18n";
import { Btn } from "@/components/ui/Btn";

/*
 * United-Carriers-style layered machine: one tractor, wheels turning with the scroll,
 * the implement swaps per step (mower → swather → baler) with copy to match.
 */
const STEPS = ["claas-disco-9300", "claas-liner-2800", "claas-markant-650"];

const r2 = (n: number) => Math.round(n * 100) / 100;

function Wheel({ cx, cy, r, hub = "#c2412d" }: { cx: number; cy: number; r: number; hub?: string }) {
  return (
    <g data-wheel data-origin={`${cx} ${cy}`}>
      <circle cx={cx} cy={cy} r={r} fill="#1e1e1a" />
      {Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={r2(cx + Math.cos(a) * (r - 2))}
            y1={r2(cy + Math.sin(a) * (r - 2))}
            x2={r2(cx + Math.cos(a) * (r - 14))}
            y2={r2(cy + Math.sin(a) * (r - 14))}
            stroke="#3a3a33"
            strokeWidth={6}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.58} fill={hub} />
      <circle cx={cx} cy={cy} r={r * 0.42} fill="none" stroke="#00000033" strokeWidth={3} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return <circle key={i} cx={r2(cx + Math.cos(a) * r * 0.28)} cy={r2(cy + Math.sin(a) * r * 0.28)} r={r * 0.05} fill="#7b2a1d" />;
      })}
      <circle cx={cx} cy={cy} r={r * 0.12} fill="#d9d9cf" />
    </g>
  );
}

function Tractor() {
  return (
    <g>
      {/* exhaust */}
      <rect x={640} y={110} width={10} height={100} fill="#3a3a33" />
      {/* hood */}
      <path d="M560 190 H800 Q840 190 845 230 L850 290 H560 Z" fill="#b9cf2c" />
      <path d="M800 200 Q835 205 838 240 L842 285 H805 Z" fill="#1e1e1a" opacity={0.85} />
      {[215, 235, 255, 275].map((y) => (
        <line key={y} x1={808} x2={836} y1={y} y2={y} stroke="#b9cf2c" strokeWidth={3} />
      ))}
      <rect x={570} y={205} width={210} height={8} fill="#a6bb22" />
      <text x={660} y={252} fontSize={22} fontFamily="var(--font-geist)" fontWeight={600} fill="#c2412d" letterSpacing={2}>
        CLAAS
      </text>
      {/* chassis */}
      <rect x={430} y={270} width={420} height={40} fill="#2a2a24" />
      {/* cab */}
      <path d="M430 70 H610 L620 280 H425 Z" fill="#b9cf2c" />
      <path d="M445 85 H598 L605 262 H440 Z" fill="#cfe0ea" opacity={0.85} />
      <path d="M520 85 V262" stroke="#b9cf2c" strokeWidth={6} />
      <rect x={420} y={58} width={200} height={16} fill="#f4f4ee" />
      {/* fender */}
      <path d="M395 300 A125 125 0 0 1 645 300 L630 300 A110 110 0 0 0 410 300 Z" fill="#a6bb22" />
      {/* hitch */}
      <rect x={385} y={292} width={50} height={14} fill="#3a3a33" />
      {/* light */}
      <rect x={846} y={235} width={8} height={18} fill="#fff6c7" />
    </g>
  );
}

function Mower() {
  return (
    <g data-impl>
      <path d="M390 300 L300 330 L140 352" stroke="#3a3a33" strokeWidth={10} fill="none" />
      <rect x={110} y={350} width={250} height={34} fill="#c2412d" />
      <rect x={110} y={350} width={250} height={8} fill="#8e2c1f" />
      {[140, 190, 240, 290, 340].map((x) => (
        <ellipse key={x} data-spin cx={x} cy={388} rx={20} ry={5} fill="#3a3a33" data-origin={`${x} 388`} />
      ))}
      <rect x={110} y={330} width={250} height={20} fill="#b9cf2c" />
      <text x={130} y={345} fontSize={14} fontFamily="var(--font-geist-mono)" fill="#1f3a07">
        DISCO
      </text>
    </g>
  );
}

function Swather() {
  return (
    <g data-impl>
      <path d="M390 300 L200 300" stroke="#3a3a33" strokeWidth={10} />
      <rect x={110} y={250} width={260} height={18} fill="#b9cf2c" />
      {[160, 300].map((cx) => (
        <g key={cx}>
          <rect x={cx - 4} y={262} width={8} height={40} fill="#3a3a33" />
          <ellipse cx={cx} cy={305} rx={80} ry={12} fill="#c2412d" />
          <g data-tines data-origin={`${cx} 330`}>
            {Array.from({ length: 9 }, (_, i) => (
              <line key={i} x1={cx - 72 + i * 18} y1={310} x2={cx - 74 + i * 18} y2={378} stroke="#3a3a33" strokeWidth={3} />
            ))}
          </g>
          <circle cx={cx - 50} cy={378} r={14} fill="#1e1e1a" />
          <circle cx={cx + 50} cy={378} r={14} fill="#1e1e1a" />
        </g>
      ))}
      <text x={120} y={264} fontSize={14} fontFamily="var(--font-geist-mono)" fill="#1f3a07">
        LINER
      </text>
    </g>
  );
}

function Baler() {
  return (
    <g data-impl>
      <path d="M390 300 L330 300" stroke="#3a3a33" strokeWidth={10} />
      <path d="M60 180 H330 V340 H60 Z" fill="#b9cf2c" />
      <rect x={60} y={180} width={270} height={14} fill="#a6bb22" />
      <path d="M260 340 H360 L370 372 H250 Z" fill="#3a3a33" />
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1={258 + i * 14} y1={372} x2={262 + i * 14} y2={384} stroke="#c2412d" strokeWidth={3} />
      ))}
      <rect x={140} y={210} width={120} height={22} fill="#f1eee9" />
      <text x={150} y={227} fontSize={14} fontFamily="var(--font-geist)" fontWeight={600} fill="#c2412d">
        CLAAS
      </text>
      <circle cx={170} cy={352} r={34} fill="#1e1e1a" />
      <circle cx={170} cy={352} r={18} fill="#c2412d" />
      {/* bales sliding out the back */}
      {[0, 1, 2].map((i) => (
        <g key={i} data-bale>
          <rect x={-10} y={300} width={70} height={42} fill="#c9b15b" />
          <line x1={5} y1={300} x2={5} y2={342} stroke="#8f7a32" strokeWidth={2} />
          <line x1={45} y1={300} x2={45} y2={342} stroke="#8f7a32" strokeWidth={2} />
        </g>
      ))}
    </g>
  );
}

export function AttachmentSwap() {
  const { d, lang } = useSite();
  const root = useRef<HTMLElement>(null);
  const items = STEPS.map((s) => findProduct(s)!);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const impls = q("[data-impl]");
      const copies = q("[data-copy]");
      const dots = q("[data-dot]");
      const lite = document.documentElement.classList.contains("lite");

      gsap.set(impls, { autoAlpha: 0, x: -260 });
      gsap.set(copies, { autoAlpha: 0, y: 40 });
      gsap.set([impls[0]], { autoAlpha: 1, x: 0 });
      gsap.set(copies[0], { autoAlpha: 1, y: 0 });
      if (lite) return;

      // idle motion
      const origin = (el: Element) => el.getAttribute("data-origin") ?? "0 0";
      q("[data-spin]").forEach((el) => gsap.to(el, { scaleX: 0.2, repeat: -1, yoyo: true, duration: 0.15, ease: "sine.inOut", svgOrigin: origin(el) }));
      q("[data-tines]").forEach((el) => gsap.to(el, { scaleX: -1, repeat: -1, yoyo: true, duration: 0.5, ease: "sine.inOut", svgOrigin: origin(el) }));
      gsap.to(q("[data-body]"), { y: -2, repeat: -1, yoyo: true, duration: 0.18, ease: "sine.inOut" });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "+=260%",
          pin: q("[data-stage]")[0],
          scrub: 0.5,
          onUpdate: (self) => {
            const i = Math.min(2, Math.floor(self.progress * 3));
            dots.forEach((dot, k) => dot.classList.toggle("bg-green-700", k === i));
          },
        },
      });
      q("[data-wheel]").forEach((el) => tl.to(el, { rotation: 1440, duration: 3, svgOrigin: el.getAttribute("data-origin")! }, 0));
      tl.to(q("[data-ground]"), { x: -1600, duration: 3 }, 0);
      // swap at 1 and 2
      [1, 2].forEach((k) => {
        tl.to(impls[k - 1], { x: -500, autoAlpha: 0, duration: 0.25, ease: "power2.in" }, k - 0.15)
          .to(copies[k - 1], { y: -40, autoAlpha: 0, duration: 0.2 }, k - 0.15)
          .fromTo(impls[k], { x: -320, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.3, ease: "power2.out" }, k + 0.05)
          .fromTo(copies[k], { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.25 }, k + 0.08);
      });
      // bales pop out during the last step
      q("[data-bale]").forEach((b, i) => {
        tl.fromTo(b, { x: 0, autoAlpha: 0 }, { x: -260 - i * 10, autoAlpha: 1, duration: 0.5 }, 2.2 + i * 0.22);
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative" data-immersive>
      <div data-stage className="relative flex h-svh flex-col overflow-hidden bg-sand-100">
        <div className="wrap pt-24 md:pt-28">
          <h2 className="h1 mt-3">{d.home.swapTitle}</h2>
        </div>

        <div className="wrap grid flex-1 items-center gap-6 pb-10 md:grid-cols-12">
          <div className="relative order-2 min-h-[220px] md:order-1 md:col-span-4">
            {items.map((p, i) => (
              <div key={p.slug} data-copy className="absolute inset-0 flex flex-col justify-center" style={i ? { visibility: "hidden" } : undefined}>
                <p className="h2 mt-3">{p.name}</p>
                <p className="mt-3 max-w-sm">{p.summary[lang]}</p>
                {p.keySpec && <p className="mt-3 font-mono text-sm text-green-700">{p.keySpec[lang]}</p>}
                <div className="mt-6">
                  <Btn href={href(productHref(p), lang)} variant="outline">
                    {d.cta.viewProduct}
                  </Btn>
                </div>
              </div>
            ))}
          </div>
          <div className="order-1 md:order-2 md:col-span-8">
            <div>
              <svg viewBox="40 40 840 380" className="w-full overflow-visible" aria-hidden>
                <g data-ground>
                  {Array.from({ length: 60 }, (_, i) => (
                    <rect key={i} x={i * 60} y={402} width={34} height={4} fill="#c9b994" />
                  ))}
                  {Array.from({ length: 40 }, (_, i) => (
                    <path key={i} d={`M${i * 90 + 20} 400 l6 -16 l6 16`} stroke="#6c9a35" strokeWidth={2} fill="none" />
                  ))}
                </g>
                <line x1={-200} x2={1200} y1={398} y2={398} stroke="#14140f" strokeOpacity={0.15} />
                <Mower />
                <Swather />
                <Baler />
                <g data-body>
                  <Tractor />
                </g>
                <Wheel cx={520} cy={300} r={98} />
                <Wheel cx={770} cy={335} r={64} />
              </svg>
            </div>
            <div className="mt-4 flex justify-center gap-2">
              {items.map((p, i) => (
                <span key={p.slug} data-dot className={`h-1 w-10 bg-ink-900/15 transition-colors ${i === 0 ? "bg-green-700" : ""}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
