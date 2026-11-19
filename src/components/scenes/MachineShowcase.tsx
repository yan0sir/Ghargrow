"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useSite } from "@/components/providers/SiteProvider";
import {
  categories,
  products,
  type Category,
  type Product,
} from "@/content/catalog";
import { href } from "@/lib/i18n";
import { IconArrow } from "@/components/ui/Icons";

/**
 * Machine showcase (KERN "technology" style): a split stage where the category photo on the left and
 * the product card on the right read as one piece. The photo is sticky; the cards are sticky too and
 * stack — as you scroll, each next card slides up over the previous one (which sinks back slightly),
 * and the photo on the left switches to that card's category.
 */

/** The category's flagship (or first) product, with a photo that differs from the category photo. */
function pick(cat: Category): { prod: Product; photo: string } {
  const inCat = products.filter((p) => p.category === cat.slug);
  const prod = inCat.find((p) => p.flagship) ?? inCat[0];
  const photo =
    prod.image !== cat.image
      ? prod.image
      : (prod.gallery.find((g) => g !== cat.image) ?? prod.image);
  return { prod, photo };
}

export function MachineShowcase() {
  const { lang, d } = useSite();
  const root = useRef<HTMLElement>(null);
  const steps = categories.map((c) => ({ cat: c, ...pick(c) }));
  const n = steps.length;

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const setActive = (i: number) => {
        if (el.dataset.active === String(i)) return;
        el.dataset.active = String(i);
        q("[data-photo]").forEach((p) =>
          p.toggleAttribute(
            "data-on",
            p.getAttribute("data-photo") === String(i),
          ),
        );
      };
      const cards = q("[data-card]");
      const col = q("[data-cards]")[0];
      // cards are sticky siblings in one tall column, so card i+1 slides in over card i
      // between column-top + i·step and column-top + (i+1)·step (step = one card height)
      const step = () => cards[0].offsetHeight || window.innerHeight;
      ScrollTrigger.create({
        trigger: col,
        start: "top top",
        end: "bottom bottom",
        // the photo follows whichever card is on top (switching once the next card is half way in)
        onUpdate: (self) =>
          setActive(
            Math.min(
              n - 1,
              Math.max(0, Math.round((self.scroll() - self.start) / step())),
            ),
          ),
      });
      if (!document.documentElement.classList.contains("lite")) {
        cards.slice(0, -1).forEach((card, i) => {
          // a covered card sinks back as the next one slides over it
          const sc = {
            trigger: col,
            start: () => `top+=${i * step()} top`,
            end: () => `top+=${(i + 1) * step()} top`,
            scrub: true,
            invalidateOnRefresh: true,
          };
          // (the card stays opaque; an inner shade darkens it, so nothing shows through the card on top)
          gsap.to(card.querySelector("[data-shade]"), {
            opacity: 0.65,
            ease: "none",
            scrollTrigger: sc,
          });
          gsap.to(card, {
            scale: 0.92,
            ease: "none",
            scrollTrigger: { ...sc },
          });
        });
      }
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      data-active="0"
      className="relative bg-black text-white"
      aria-label={d.home.featured}
    >
      <div className="grid md:grid-cols-2">
        {/* left: sticky category photo, swaps with the card on top */}
        <div className="sticky top-0 z-0 h-[46svh] md:relative md:h-auto">
          <div className="sticky top-0 h-[46svh] overflow-hidden md:h-svh">
            {steps.map(({ cat }, i) => (
              <div
                key={cat.slug}
                data-photo={i}
                data-on={i === 0 ? "" : undefined}
                className="msx-fade absolute inset-0"
              >
                <Image
                  src={cat.image}
                  alt=""
                  fill
                  sizes="(max-width:768px) 100vw, 50vw"
                  className="msx-zoom object-cover"
                  priority={i === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/25" />
                <div className="absolute inset-x-[var(--gutter)] bottom-[clamp(24px,5vh,48px)]">
                  <p className="flex items-center gap-2.5 text-[14px] text-white/80">
                    <span className="size-1.5 rounded-full bg-[#c6f35c]" />
                    {cat.num} / {String(n).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 text-[clamp(40px,5.6vw,80px)] leading-[0.95] font-medium tracking-[-0.04em]">
                    {cat.title[lang]}
                  </h3>
                  <Link
                    href={href(`/products/${cat.slug}`, lang)}
                    className="mt-4 inline-flex items-center gap-2 border-b border-white/40 pb-1 text-[13px] tracking-wide hover:border-white"
                  >
                    {lang === "ar" ? "تصفّح الفئة" : "View the range"}{" "}
                    <IconArrow className="size-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* right: stacking sticky cards — each next card slides up over the last */}
        <div data-cards className="relative">
          {steps.map(({ cat, prod, photo }, i) => (
            <article
              key={cat.slug}
              data-card
              style={{ zIndex: i + 1 }}
              className="sticky top-[46svh] flex h-[54svh] origin-top flex-col justify-between overflow-hidden border-t border-white/12 bg-[#141613] px-[clamp(20px,3.4vw,56px)] py-[clamp(18px,6vh,64px)] will-change-transform md:top-0 md:h-svh md:border-s"
            >
              <div>
                <p className="flex items-baseline justify-between gap-6 border-b border-white/20 pb-3 text-[13px] tracking-[0.14em] text-white/60 uppercase">
                  <span className="text-[20px] tracking-normal text-white tabular-nums">
                    {cat.num}
                  </span>
                  <span>{cat.short[lang]}</span>
                </p>
                <h4 className="mt-4 md:mt-6 text-[clamp(32px,3.6vw,56px)] leading-[1] font-medium tracking-[-0.03em]">
                  {prod.name}
                </h4>
                <p className="mt-2 hidden text-[15px] text-white/55 md:block">
                  {prod.type[lang]}
                </p>
                <p className="mt-3 max-w-[46ch] text-[15px] md:mt-5 md:text-[16px] leading-[1.5] text-pretty text-white/85">
                  {prod.summary[lang]}
                </p>
              </div>
              <Link
                href={href(`/products/${prod.category}/${prod.slug}`, lang)}
                className="group mt-6 block"
                aria-label={prod.name}
              >
                <div className="relative aspect-[502/280] w-full overflow-hidden bg-white/5">
                  <Image
                    src={photo}
                    alt={prod.name}
                    fill
                    sizes="(max-width:768px) 100vw, 45vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <span className="mt-4 inline-flex items-center gap-2 text-[14px] text-white transition group-hover:gap-3">
                  {d.cta.learnMore} <IconArrow className="size-4" />
                </span>
              </Link>
              <div
                data-shade
                className="pointer-events-none absolute inset-0 bg-black opacity-0"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
