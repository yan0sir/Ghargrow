"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
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
 * stack — as you scroll, each next card slides up over the previous one (which eases back slightly),
 * and the photo on the left switches to that card's category. Light sand cards on the brand green.
 */

/** The category's flagship (or first) product, with a photo that differs from the category photo. */
function pick(cat: Category): { prod: Product; photo: string } {
  const inCat = products.filter((p) => p.category === cat.slug);
  const prod = inCat.find((p) => p.flagship) ?? inCat[0];
  // wide photos here: the square ghargrow.com tiles (product/category `card`) crop badly at these sizes
  const photo = prod.image !== cat.image ? prod.image : (prod.gallery.find((g) => g !== cat.image) ?? prod.image);
  return { prod, photo };
}

export function MachineShowcase() {
  const { lang, d } = useSite();
  const root = useRef<HTMLElement>(null);
  const steps = categories.map((c) => ({ cat: c, ...pick(c) }));
  const n = steps.length;

  useEffect(() => {
    const el = root.current!;
    const photos = Array.from(el.querySelectorAll<HTMLElement>("[data-photo]"));
    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-card]"));
    const col = el.querySelector<HTMLElement>("[data-cards]")!;
    const calm = document.documentElement.classList.contains("lite");
    let active = -1,
      raf = 0;
    const setActive = (i: number) => {
      if (i === active) return;
      active = i;
      el.dataset.active = String(i);
      photos.forEach((p, k) => p.toggleAttribute("data-on", k === i));
    };
    // Cards are sticky siblings in one tall column: card i+1 slides up over card i while the column
    // scrolls from i·step to (i+1)·step past the top of the stage (step = one card height).
    const update = () => {
      raf = 0;
      const step = cards[0].offsetHeight || window.innerHeight;
      const stickTop = parseFloat(getComputedStyle(cards[0]).top) || 0;
      const x = stickTop - col.getBoundingClientRect().top; // how far the column has scrolled under the stage
      // the photo switches when the next card is half way up
      setActive(Math.min(n - 1, Math.max(0, Math.round(x / step))));
      if (calm) return;
      cards.forEach((card, i) => {
        const k =
          i < n - 1 ? Math.min(1, Math.max(0, (x - i * step) / step)) : 0;
        // a covered card eases back a touch; it never fades, so the card on top always reads clearly
        card.style.transform = k > 0 ? `scale(${1 - 0.05 * k})` : "";
        const shade = card.querySelector<HTMLElement>("[data-shade]");
        if (shade) shade.style.opacity = String(0.12 * k);
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [n]);

  return (
    <section
      ref={root}
      data-active="0"
      data-tone="dark"
      className="relative bg-green-900 text-ink-900"
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
                  <p className="flex items-center gap-2.5 text-[14px] font-medium text-white/85">
                    <span className="size-1.5 rounded-full bg-green-300" />
                    {cat.num} / {String(n).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 text-[clamp(40px,5.6vw,80px)] font-display leading-[0.95] font-semibold tracking-[-0.04em] text-sand-50 drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)]">
                    {cat.title[lang]}
                  </h3>
                  <Link
                    href={href(`/products/${cat.slug}`, lang)}
                    className="mt-4 inline-flex items-center gap-2 border-b border-white/50 pb-1 text-[13px] font-medium tracking-wide text-sand-50 hover:border-white"
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
              className="sticky top-[46svh] flex h-[54svh] origin-top flex-col justify-between overflow-hidden border-t border-ink-900/10 bg-sand-50 px-[clamp(20px,3.4vw,56px)] py-[clamp(18px,6vh,64px)] shadow-[0_-18px_40px_rgba(31,58,7,0.18)] will-change-transform md:top-0 md:h-svh"
            >
              <div>
                <p className="flex items-baseline justify-between gap-6 border-b border-ink-900/15 pb-3 text-[13px] tracking-[0.14em] text-ink-400 uppercase">
                  <span className="flex items-center gap-2 text-[20px] tracking-normal text-green-700 tabular-nums">
                    <span className="size-2 rounded-full bg-green-700" />
                    {cat.num}
                  </span>
                  <span>{cat.short[lang]}</span>
                </p>
                <h4 className="mt-4 text-[clamp(32px,3.6vw,56px)] font-display leading-[1] font-normal tracking-[-0.03em] text-ink-900 md:mt-6">
                  {prod.name}
                </h4>
                <p className="mt-2 hidden text-[15px] text-green-700 md:block">
                  {prod.type[lang]}
                </p>
                <p className="mt-3 max-w-[46ch] text-[15px] leading-[1.5] text-pretty text-ink-700 md:mt-5 md:text-[16px]">
                  {prod.summary[lang]}
                </p>
              </div>
              <Link
                href={href(`/products/${prod.category}/${prod.slug}`, lang)}
                className="group mt-6 block"
                aria-label={prod.name}
              >
                <div className="relative aspect-[502/280] w-full overflow-hidden rounded-md bg-sand-200">
                  <Image
                    src={photo}
                    alt={prod.name}
                    fill
                    sizes="(max-width:768px) 100vw, 45vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <span className="mt-4 inline-flex items-center gap-2 text-[14px] font-medium text-green-700 transition group-hover:gap-3">
                  {d.cta.learnMore} <IconArrow className="size-4" />
                </span>
              </Link>
              <div
                data-shade
                className="pointer-events-none absolute inset-0 bg-green-900 opacity-0"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
