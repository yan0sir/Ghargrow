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
      // A card deck: every card is sticky, each one sticking a little lower than the one before
      // (so the covered cards' top edges peek out). Card i lands on the deck once the column has
      // scrolled i·step, where step = card height + gap − the extra sticky offset per card.
      const step = () => {
        const c0 = getComputedStyle(cards[0]);
        const delta = cards[1]
          ? parseFloat(getComputedStyle(cards[1]).top) - parseFloat(c0.top)
          : 0;
        return (
          cards[0].offsetHeight + parseFloat(c0.marginBottom) - delta ||
          window.innerHeight
        );
      };
      ScrollTrigger.create({
        trigger: col,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        // the photo follows the card that is landing / on top
        onUpdate: (self) =>
          setActive(
            Math.min(
              n - 1,
              Math.max(
                0,
                Math.floor((self.scroll() - self.start) / step() + 0.5),
              ),
            ),
          ),
      });
      if (!document.documentElement.classList.contains("lite")) {
        cards.slice(0, -1).forEach((card, i) => {
          // while the next card slides up over it, a card shrinks back into the deck and darkens
          const sc = () => ({
            trigger: col,
            start: () => `top+=${i * step()} top`,
            end: () => `top+=${(i + 1) * step()} top`,
            scrub: true,
            invalidateOnRefresh: true,
          });
          gsap.to(card, { scale: 0.94, ease: "none", scrollTrigger: sc() });
          gsap.to(card.querySelector("[data-shade]"), {
            opacity: 0.55,
            ease: "none",
            scrollTrigger: sc(),
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
        <div className="sticky top-0 z-0 h-[40svh] md:relative md:h-auto">
          <div className="sticky top-0 h-[40svh] overflow-hidden md:h-svh">
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
        <div
          data-cards
          className="relative px-[clamp(14px,2.4vw,40px)] pt-3 md:pt-[12svh]"
        >
          {steps.map(({ cat, prod, photo }, i) => (
            <article
              key={cat.slug}
              data-card
              style={{ zIndex: i + 1, ["--i" as string]: i }}
              className="sticky top-[calc(40svh+12px+var(--i)*12px)] mb-[14svh] flex h-[52svh] origin-top flex-col justify-between overflow-hidden rounded-xl border border-white/12 bg-[#151814] px-[clamp(18px,2.8vw,44px)] py-[clamp(16px,4vh,40px)] shadow-[0_-24px_48px_rgba(0,0,0,0.55)] will-change-transform last:mb-0 md:top-[calc(12svh+var(--i)*28px)] md:mb-[22svh] md:h-[min(74svh,720px)]"
            >
              <div>
                <p className="flex items-baseline justify-between gap-6 border-b border-white/20 pb-3 text-[13px] tracking-[0.14em] text-white/60 uppercase">
                  <span className="text-[20px] tracking-normal text-white tabular-nums">
                    {cat.num}
                  </span>
                  <span>{cat.short[lang]}</span>
                </p>
                <h4 className="mt-3 text-[clamp(28px,3.2vw,52px)] leading-[1] font-medium tracking-[-0.03em] md:mt-5">
                  {prod.name}
                </h4>
                <p className="mt-2 hidden text-[15px] text-white/55 md:block">
                  {prod.type[lang]}
                </p>
                <p className="mt-2 line-clamp-3 max-w-[46ch] text-[14px] leading-[1.5] text-pretty text-white/85 md:mt-4 md:text-[16px]">
                  {prod.summary[lang]}
                </p>
              </div>
              <Link
                href={href(`/products/${prod.category}/${prod.slug}`, lang)}
                className="group mt-4 flex min-h-0 flex-1 flex-col md:mt-6"
                aria-label={prod.name}
              >
                <div className="relative min-h-0 w-full flex-1 overflow-hidden rounded-md bg-white/5">
                  <Image
                    src={photo}
                    alt={prod.name}
                    fill
                    sizes="(max-width:768px) 100vw, 45vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <span className="mt-3 inline-flex items-center gap-2 text-[14px] text-white transition group-hover:gap-3 md:mt-4">
                  {d.cta.learnMore} <IconArrow className="size-4" />
                </span>
              </Link>
              <div
                data-shade
                className="pointer-events-none absolute inset-0 bg-black opacity-0"
              />
            </article>
          ))}
          {/* hold: sticky cards are bounded by the column's content box, so this keeps the full deck
              on screen for a beat after the last card lands */}
          <div aria-hidden className="h-[24svh] md:h-[46svh]" />
        </div>
      </div>
    </section>
  );
}
