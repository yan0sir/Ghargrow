"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useSite } from "@/components/providers/SiteProvider";
import { Btn } from "@/components/ui/Btn";
import { ContactButton } from "@/components/contact/ContactButton";
import { href } from "@/lib/i18n";

/**
 * Home hero — the reverse of the Valley Steel reveal:
 * starts as text on the start side with the field photo framed on the end side,
 * then the photo grows to full screen as you scroll, the closing line and CTAs
 * appear over it and hold so they can be read.
 */
const PHOTO = "/media/img/hero-background.webp";

export function HeroReveal() {
  const { d, lang } = useSite();
  const root = useRef<HTMLElement>(null);

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
              end: "+=220%",
              pin: q("[data-stage]")[0],
              scrub: 0.6,
            },
          });
          tl.to(q("[data-copy]"), { opacity: 0, x: desktop ? (rtl ? 60 : -60) : 0, y: desktop ? 0 : -40, duration: 0.3 }, 0)
            .to(q("[data-photo]"), { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 0.6, ease: "power2.inOut" }, 0.05)
            .to(q("[data-photo-inner]"), { scale: 1.06, duration: 0.6 }, 0.05)
            .to(q("[data-shade]"), { opacity: 1, duration: 0.3 }, 0.45)
            .fromTo(q("[data-outro]"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.25 }, 0.6)
            // hold so the closing line can be read before the page moves on
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

        {/* photo: framed on the end side, grows to full screen */}
        <div data-photo className="absolute inset-0 z-10 overflow-hidden" style={{ clipPath: "inset(14% 2.5% 10% 52% round 12px)" }}>
          <div data-photo-inner className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PHOTO} alt="Green irrigated field at sunrise" className="absolute inset-0 size-full object-cover" fetchPriority="high" />
          </div>
          <div data-shade className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-ink-900/20 to-ink-900/10 opacity-0" />

          <div data-outro className="absolute inset-x-0 bottom-0 px-[var(--gutter)] pb-[12vh] text-white opacity-0">
            <div className="mx-auto max-w-[1440px]">
              <p className="h1 max-w-4xl text-white!">{d.home.heroLine}</p>
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
    </section>
  );
}
