"use client";

import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useSite } from "@/components/providers/SiteProvider";
import { Btn } from "@/components/ui/Btn";
import { ContactButton } from "@/components/contact/ContactButton";
import { categories } from "@/content/catalog";
import { href } from "@/lib/i18n";
import { mountFarm } from "@/components/three/mosslineFarm";

/**
 * Home hero — the 3D farm from the 3D page fills the screen from the first frame, with the
 * headline, line and buttons over the sky on the start side. Scrolling pins the stage: the copy
 * lifts away, the camera pushes on across the farm, the product hotspots pop up on the models,
 * and the closing dictionary entry for the name holds so it can be read.
 */
const PHOTO = "/media/img/hero-background.webp";
/** Farm flight positions: resting (landed, the machines and the pivot in view) → end of the push-in. */
const K0 = 0.4;
const K1 = 0.95;

const SPOTS = [
  { id: "tractors", cat: "tractors-machinery" },
  { id: "irrigation", cat: "irrigation" },
  { id: "bales", cat: "bale-handling" },
  { id: "seeds", cat: "seeds-fertilizers" },
  { id: "parts", cat: null },
] as const;

export function HeroReveal() {
  const { d, lang, lite } = useSite();
  const root = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spotsRef = useRef<HTMLDivElement>(null);
  /** Scroll-driven state shared with the render loop. `shift`: 1 while the copy is up (view nudged to the end side so the
   *  machines clear the text), easing to 0 as the copy leaves. */
  const flight = useRef({ k: K0, spots: 0, shift: 1 });

  /* 3D farm: mounted once, rendered only while the hero is on screen */
  useEffect(() => {
    if (lite || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current!;
    let farm: ReturnType<typeof mountFarm>;
    try {
      farm = mountFarm(canvas);
    } catch {
      return; // WebGL unavailable: the poster photo stays
    }
    let raf = 0,
      visible = true,
      alive = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(root.current!);
    const spotEls = Array.from(spotsRef.current!.children) as HTMLElement[];
    const loop = (now: number) => {
      if (!alive) return;
      if (visible) {
        const { k, spots, shift } = flight.current;
        const desktop = window.innerWidth >= 768;
        const rtl = document.documentElement.dir === "rtl";
        // on desktop the scene sits a little toward the end side while the headline is up
        const cx = desktop ? 0.5 + (rtl ? -0.24 : 0.24) * shift : 0.5;
        const pins = farm.update(k, now / 1000, 0, 0, { cx, tilt: desktop ? 0 : 0.6 * shift, back: 10 * shift });
        canvas.dataset.ready = "1";
        spotEls.forEach((el, i) => {
          const pin = pins.find((p) => p.id === el.dataset.id);
          if (!pin) return;
          const s = Math.min(1, Math.max(0, spots * 1.6 - i * 0.12)) * (pin.on ? 1 : 0);
          el.style.transform = `translate3d(${pin.x - 11}px, ${pin.y - 11}px, 0) scale(${s})`;
          el.style.visibility = s > 0 ? "visible" : "hidden";
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      farm.dispose();
      delete canvas.dataset.ready;
    };
  }, [lite]);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const rtl = document.documentElement.dir === "rtl";
      const mm = gsap.matchMedia();

      // entrance
      gsap.from(q("[data-rise]"), { y: 40, opacity: 0, duration: 1.1, stagger: 0.12, delay: 0.2 });
      gsap.from(q("[data-scene]"), { scale: 1.08, duration: 1.8, ease: "expo.out", delay: 0.1 });

      mm.add({ desktop: "(min-width: 768px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
        const { desktop, reduce } = ctx.conditions as { desktop: boolean; reduce: boolean };
        if (reduce || document.documentElement.classList.contains("lite")) return;
        const clamp = (v: number) => Math.min(1, Math.max(0, v));
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=240%",
            pin: q("[data-stage]")[0],
            scrub: 0.6,
            onUpdate: (st) => {
              const p = st.progress;
              // the camera keeps flying on across the farm (the same flight as before, now full screen from the start)
              flight.current.k = K0 + (K1 - K0) * gsap.parseEase("power1.inOut")(clamp((p - 0.02) / 0.85));
              flight.current.shift = 1 - gsap.parseEase("power2.inOut")(clamp(p / 0.3));
              flight.current.spots = clamp((p - 0.3) / 0.15);
            },
          },
        });
        tl.to(q("[data-copy]"), { autoAlpha: 0, x: desktop ? (rtl ? 60 : -60) : 0, y: desktop ? 0 : -40, filter: "blur(6px)", duration: 0.25 }, 0)
          .to(q("[data-shade]"), { opacity: 1, duration: 0.3 }, 0.5)
          .fromTo(q("[data-outro]"), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.25 }, 0.62)
          // (autoAlpha also sets visibility, so buttons that are faded out can't be reached with Tab)
          // hold so the products and the closing entry can be read before the page moves on
          .to({}, { duration: 0.5 });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative">
      <div data-stage className="relative h-svh w-full overflow-hidden bg-[#dfe3e0]">
        {/* the 3D farm, full screen */}
        <div data-scene className="absolute inset-0">
          {/* poster: shown until the first 3D frame (and as the lite / reduced-motion fallback) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PHOTO} alt="Green irrigated field" className="absolute inset-0 size-full object-cover" fetchPriority="high" />
          <canvas
            ref={canvasRef}
            aria-label="3D farm with Ghargrow machinery, irrigation, bales, seed and spare parts"
            className="absolute inset-0 size-full opacity-0 transition-opacity duration-700 data-[ready]:opacity-100"
          />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-ink-900/45 to-transparent" />
        <div data-shade className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/65 via-ink-900/5 to-transparent opacity-0" />

        {/* headline over the scene, on the start side. On phones it sits above the floating WhatsApp / call pill;
            on desktop its last line is level with the pill */}
        <div
          data-copy
          className="relative z-10 flex h-full flex-col justify-end px-[var(--gutter)] pb-24 text-sand-50 [text-shadow:0_2px_28px_rgba(20,30,10,.45)] md:w-[56%] md:pb-6"
        >
          <h1 data-rise className="display-xl max-w-[10ch] text-sand-50!">
            {lang === "ar" ? "ازرع بثقة" : "Grow with Trust"}
          </h1>
          <p data-rise className="lead mt-5 max-w-md text-sand-50/90">
            {d.home.heroLine}
          </p>
          <div data-rise className="mt-7 flex flex-wrap gap-3 [text-shadow:none]">
            <Btn href={href("/products", lang)} variant="primary">
              {d.cta.explore}
            </Btn>
            <ContactButton variant="light">{d.nav.talk}</ContactButton>
          </div>
        </div>

        {/* product hotspots, pinned to the 3D models */}
        <div ref={spotsRef} className="pointer-events-none absolute inset-0 z-20 [&>a]:pointer-events-auto">
          {SPOTS.map((s) => {
            const cat = s.cat ? categories.find((c) => c.slug === s.cat)! : null;
            const label = cat ? cat.title[lang] : d.nav.parts;
            const to = cat ? `/products/${cat.slug}` : "/spare-parts";
            return (
              <a
                key={s.id}
                data-id={s.id}
                href={href(to, lang)}
                className="group invisible absolute top-0 left-0 flex origin-[11px_11px] items-start gap-2 will-change-transform"
              >
                <span className="relative grid size-[22px] shrink-0 place-items-center rounded-full bg-green-700 text-sand-50 shadow-[0_0_0_8px_rgba(67,120,14,.28)] ring-2 ring-sand-50 transition group-hover:scale-110">
                  <span className="text-[15px] leading-none">+</span>
                </span>
                <span className="rounded bg-sand-50/90 px-2.5 py-1.5 font-mono text-[10.5px] tracking-[0.14em] whitespace-nowrap text-ink-900 uppercase backdrop-blur-md">
                  {label}
                </span>
              </a>
            );
          })}
        </div>

        {/* the dictionary entry for the name */}
        <div data-outro className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-[var(--gutter)] pb-[10vh] text-white opacity-0 invisible">
          <div className="pointer-events-auto mx-auto grid max-w-[1440px] gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-6">
              <p className="display text-white!">{lang === "ar" ? "غرغار" : "Ghargrow"}</p>
            </div>
            <div className="md:col-span-6">
              <p className="text-[clamp(20px,1.9vw,28px)] leading-snug font-light text-white/90">{d.home.nameDef}</p>
              {/* different next steps from the headline's buttons, so the hero doesn't repeat itself */}
              <div className="mt-8 flex flex-wrap gap-3">
                <Btn href={href("/find-your-machine", lang)} variant="primary">
                  {d.nav.quiz}
                </Btn>
                <Btn href={href("/spare-parts", lang)} variant="light">
                  {d.nav.parts}
                </Btn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
