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
 * Home hero — text on the start side, and on the end side a framed window into the
 * 3D farm from the 3D page, held on the moment the camera skims the moss.
 * Scrolling grows the frame to full screen while the camera flies in and lands on the
 * farm; the product hotspots and the closing dictionary entry then hold so they can be read.
 */
const PHOTO = "/media/img/hero-background.webp";
/** Farm flight position of the resting frame: just landed, the machines and the pivot in view. */
const K0 = 0.22;
const K1 = 0.8;

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
  /** Scroll-driven state shared with the render loop. */
  // frame: 1 while the 3D sits in the small window (view centred on it, gaze lowered), 0 once full screen
  const flight = useRef({ k: K0, spots: 0, frame: 1 });

  /* 3D farm: mounted once, rendered only while the hero is on screen */
  useEffect(() => {
    if (lite || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current!;
    const farm = mountFarm(canvas);
    let raf = 0,
      visible = true,
      alive = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(root.current!);
    const spotEls = Array.from(spotsRef.current!.children) as HTMLElement[];
    const loop = (now: number) => {
      if (!alive) return;
      if (visible) {
        const { k, spots, frame } = flight.current;
        const desktop = window.innerWidth >= 768;
        const rtl = document.documentElement.dir === "rtl";
        const cx = desktop ? (rtl ? 0.2525 : 0.7475) : 0.5;
        const pins = farm.update(k, now / 1000, 0, 0, { cx: 0.5 + (cx - 0.5) * frame, tilt: (desktop ? 2 : 1) * frame });
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
      gsap.from(q("[data-photo-inner]"), { scale: 1.15, duration: 1.8, ease: "expo.out", delay: 0.1 });

      mm.add(
        {
          desktop: "(min-width: 768px)",
          mobile: "(max-width: 767px)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { desktop, reduce } = ctx.conditions as { desktop: boolean; reduce: boolean };
          // framed panel: end side on desktop, lower half on mobile
          const framed = desktop
            ? rtl
              ? "inset(14% 52% 10% 2.5% round 12px)"
              : "inset(14% 2.5% 10% 52% round 12px)"
            : "inset(67% 4% 4% 4% round 12px)";
          gsap.set(q("[data-photo]"), { clipPath: framed });
          if (reduce || document.documentElement.classList.contains("lite")) return;

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "+=260%",
              pin: q("[data-stage]")[0],
              scrub: 0.6,
              onUpdate: (st) => {
                const p = st.progress;
                // the camera flies in and lands while the frame grows, then drifts on slowly
                flight.current.k = K0 + (K1 - K0) * gsap.parseEase("power1.out")(Math.min(1, Math.max(0, (p - 0.02) / 0.8)));
                flight.current.spots = Math.min(1, Math.max(0, (p - 0.5) / 0.15));
                // the window finishes growing at ~42% of the pinned scroll
                flight.current.frame = 1 - gsap.parseEase("power2.inOut")(Math.min(1, Math.max(0, (p - 0.03) / 0.39)));
              },
            },
          });
          tl.to(q("[data-copy]"), { opacity: 0, x: desktop ? (rtl ? 60 : -60) : 0, y: desktop ? 0 : -40, duration: 0.3 }, 0)
            .to(q("[data-photo]"), { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 0.6, ease: "power2.inOut" }, 0.05)
            .to(q("[data-photo-inner]"), { scale: 1.03, duration: 0.6 }, 0.05)
            .to(q("[data-shade]"), { opacity: 1, duration: 0.3 }, 0.55)
            .fromTo(q("[data-outro]"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.25 }, 0.7)
            // hold so the products and the closing entry can be read before the page moves on
            .to({}, { duration: 0.6 });
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative">
      <div data-stage className="relative h-svh w-full overflow-hidden bg-sand-50">
        {/* text on the start side */}
        <div data-copy className="relative z-0 flex h-full flex-col px-[var(--gutter)] pt-28 md:w-1/2 md:justify-center md:pt-0">
          <h1 data-rise className="display-xl max-w-[10ch]">
            {lang === "ar" ? "ازرع بثقة" : "Grow with Trust"}
          </h1>
          <p data-rise className="lead mt-6 max-w-md text-ink-700">
            {d.home.heroLine}
          </p>
          <div data-rise className="mt-8 flex flex-wrap gap-3">
            <Btn href={href("/products", lang)} variant="primary">
              {d.cta.explore}
            </Btn>
            <ContactButton variant="outline">{d.nav.talk}</ContactButton>
          </div>
        </div>

        {/* the 3D farm: framed on the end side, grows to full screen */}
        <div data-photo className="absolute inset-0 z-10 overflow-hidden bg-[#dfe3e0]" style={{ clipPath: "inset(14% 2.5% 10% 52% round 12px)" }}>
          <div data-photo-inner className="absolute inset-0">
            {/* poster: shown until the first 3D frame (and as the lite / reduced-motion fallback) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PHOTO} alt="Green irrigated field" className="absolute inset-0 size-full object-cover" fetchPriority="high" />
            <canvas
              ref={canvasRef}
              aria-label="3D farm with Ghargrow machinery, irrigation, bales, seed and spare parts"
              className="absolute inset-0 size-full opacity-0 transition-opacity duration-700 data-[ready]:opacity-100"
            />
          </div>
          <div data-shade className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/65 via-ink-900/5 to-transparent opacity-0" />

          {/* product hotspots, pinned to the 3D models */}
          <div ref={spotsRef} className="absolute inset-0">
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
                  <span className="relative grid size-[22px] shrink-0 place-items-center rounded-full bg-[#c6f35c] text-ink-900 shadow-[0_0_0_6px_rgba(198,243,92,.25)] transition group-hover:scale-110">
                    <span className="text-[15px] leading-none">+</span>
                  </span>
                  <span className="rounded bg-[rgba(246,248,245,.78)] px-2.5 py-1.5 font-mono text-[10.5px] tracking-[0.14em] whitespace-nowrap text-ink-900 uppercase backdrop-blur-md">
                    {label}
                  </span>
                </a>
              );
            })}
          </div>

          {/* once the frame is full screen: the dictionary entry for the name */}
          <div data-outro className="pointer-events-none absolute inset-x-0 bottom-0 px-[var(--gutter)] pb-[10vh] text-white opacity-0">
            <div className="pointer-events-auto mx-auto grid max-w-[1440px] gap-8 md:grid-cols-12 md:items-end">
              <div className="md:col-span-6">
                <p className="display text-white!">{lang === "ar" ? "غرغار" : "Ghargrow"}</p>
                <p className="mt-3 flex items-baseline gap-4 font-mono text-sm text-white/70">
                  <span dir="ltr">{d.home.namePron}</span>
                  <em className="not-italic">{d.home.nameNoun}</em>
                </p>
              </div>
              <div className="md:col-span-6">
                <p className="text-[clamp(20px,1.9vw,28px)] leading-snug font-light text-white/90">{d.home.nameDef}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Btn href={href("/products", lang)} variant="primary">
                    {d.cta.explore}
                  </Btn>
                  <ContactButton variant="light">{d.nav.talk}</ContactButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
