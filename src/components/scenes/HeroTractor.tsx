"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useSite } from "@/components/providers/SiteProvider";
import { useFrameSequence } from "@/components/motion/useFrameSequence";
import { Btn } from "@/components/ui/Btn";
import { ContactButton } from "@/components/contact/ContactButton";
import { href } from "@/lib/i18n";

/**
 * Home hero. Field background + headline. A window into the field opens as you scroll,
 * the Ghargrow intro clip plays with the scroll (frame sequence), the headline parts around it,
 * then the closing line and CTAs hold on screen before the page moves on.
 */
const FRAMES_END = 0.62; // share of the pinned scroll used by the footage; the rest is the reading hold
export function HeroTractor() {
  const { d, lang } = useSite();
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const render = useFrameSequence(canvas, { name: "intro", frames: 118 });

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const lite = document.documentElement.classList.contains("lite");
      // entrance
      gsap.from(q("[data-word]"), { yPercent: 105, duration: 1.4, stagger: 0.08, ease: "power4.out", delay: 0.2 });
      const mobile = window.matchMedia("(max-width: 767px)").matches;
      const startClip = mobile ? "inset(34% 6% 20% 6%)" : "inset(22% 30% 16% 30%)";
      gsap.set(q("[data-window]"), { clipPath: startClip });
      gsap.from(q("[data-media]"), { scale: 1.25, opacity: 0, duration: 1.8, ease: "expo.out", delay: 0.3 });
      gsap.from(q("[data-fade]"), { opacity: 0, y: 20, duration: 1, delay: 1, stagger: 0.1 });
      if (lite) {
        render(0.5);
        return;
      }
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "+=280%",
          pin: q("[data-stage]")[0],
          scrub: 0.6,
          onUpdate: (self) => render(Math.min(1, self.progress / FRAMES_END)),
        },
      });
      tl.fromTo(q("[data-window]"), { clipPath: startClip }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.55 }, 0)
        .to(q("[data-left]"), { xPercent: mobile ? -40 : -55, opacity: 0, duration: 0.5 }, 0.1)
        .to(q("[data-right]"), { xPercent: mobile ? 40 : 55, opacity: 0, duration: 0.5 }, 0.1)
        .to(q("[data-intro]"), { opacity: 0, y: -30, duration: 0.25 }, 0)
        .to(q("[data-shade]"), { opacity: 1, duration: 0.3 }, 0.55)
        .fromTo(q("[data-outro]"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.25 }, 0.62)
        // hold: the closing line stays pinned so it can be read
        .to({}, { duration: 0.75 });
      render(0);
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative" data-immersive>
      <div data-stage className="relative h-svh w-full overflow-hidden bg-green-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/img/hero-background.webp" alt="" className="absolute inset-0 size-full object-cover" fetchPriority="high" />
        {/* field window */}
        <div data-window className="absolute inset-0" style={{ clipPath: "inset(22% 30% 16% 30%)" }}>
          <div data-media className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/media/seq/intro/d/0001.webp" alt="" className="absolute inset-0 size-full object-cover" />
            <canvas ref={canvas} className="absolute inset-0 size-full" aria-label="Combine harvester crossing a green field in Libya" role="img" />
          </div>
          <div data-shade className="absolute inset-0 bg-gradient-to-t from-ink-900/75 via-ink-900/20 to-transparent opacity-0" />
        </div>

        {/* headline */}
        <h1 className="pointer-events-none absolute inset-x-0 top-[13%] z-10 flex flex-wrap justify-center gap-x-[0.25em] px-4 text-center display-xl text-white! md:top-[38%] md:justify-between md:px-[3vw]">
          <span data-left className="block overflow-hidden pt-[0.1em] pb-[0.18em]">
            <span data-word className="block">
              {lang === "ar" ? "ازرع" : "Grow"}
            </span>
          </span>
          <span data-right className="block overflow-hidden pt-[0.1em] pb-[0.18em]">
            <span data-word className="block">
              {lang === "ar" ? "بثقة" : "with Trust"}
            </span>
          </span>
        </h1>

        <div data-intro className="absolute inset-x-0 bottom-24 z-10 flex items-end justify-between px-[var(--gutter)] md:bottom-8">
          <p data-fade className="max-w-[320px] text-white/90">
            {d.home.heroLine}
          </p>
          <span data-fade className="eyebrow hidden items-center gap-3 text-white/80 md:flex">
            <span className="block h-10 w-px animate-pulse bg-white" />
            {d.home.scroll}
          </span>
        </div>

        <div data-outro className="absolute inset-x-0 bottom-0 z-10 px-[var(--gutter)] pb-[12vh] text-white opacity-0">
          <div className="mx-auto max-w-[1440px]">
            <p className="h1 mt-4 max-w-4xl text-white!">{d.home.heroLine}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Btn href={href("/products", lang)} variant="primary">
                {d.cta.explore}
              </Btn>
              <ContactButton variant="light">{d.nav.talk}</ContactButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
