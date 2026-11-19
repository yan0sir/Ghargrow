"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useSite } from "@/components/providers/SiteProvider";
import { categories, products, type Category, type Product } from "@/content/catalog";
import { href } from "@/lib/i18n";
import { IconArrow } from "@/components/ui/Icons";

/**
 * Machine showcase in the style of KERN's "technology" section: a pinned, full-bleed stage where
 * each step is a product category (its photo fills the stage, its name sits huge bottom-left with
 * the intro beside it), and a frosted panel slides in from the right with one numbered card per
 * category — the active card opens to show a product from that category.
 */

/** The category's flagship (or first) product, with a photo that differs from the category photo. */
function pick(cat: Category): { prod: Product; photo: string } {
  const inCat = products.filter((p) => p.category === cat.slug);
  const prod = inCat.find((p) => p.flagship) ?? inCat[0];
  const photo = prod.image !== cat.image ? prod.image : (prod.gallery.find((g) => g !== cat.image) ?? prod.image);
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
      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px)", () => {
        const setActive = (i: number) => {
          if (el.dataset.active === String(i)) return;
          el.dataset.active = String(i);
          q("[data-step]").forEach((s) => s.toggleAttribute("data-on", s.getAttribute("data-step") === String(i)));
        };
        setActive(0);
        // the panel slides in from the right as the stage pins, then each step takes an equal share of the scroll
        gsap.fromTo(
          q("[data-panel]"),
          { xPercent: 100 },
          { xPercent: 0, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 60%", end: "top top", scrub: 0.6 } },
        );
        gsap.fromTo(
          q("[data-items]"),
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 30%", end: "top top", scrub: 0.6 } },
        );
        // the stage is CSS-sticky inside an n-viewport-tall track; this only reads the progress
        const st = ScrollTrigger.create({
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => setActive(Math.min(n - 1, Math.floor(self.progress * n * 0.999))),
        });
        return () => st.kill();
      });
      mm.add("(max-width: 899px)", () => {
        el.removeAttribute("data-active");
        q("[data-step]").forEach((s) => s.setAttribute("data-on", ""));
      });
    },
    { scope: root },
  );

  const jump = (i: number) => {
    const el = root.current!;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + span * ((i + 0.5) / n), behavior: "smooth" });
  };

  return (
    <section ref={root} className="msx relative bg-black text-white" style={{ ["--n" as string]: n }} aria-label={d.home.featured}>
      {/* desktop: pinned stage, one viewport of scroll per category */}
      <div className="hidden min-[900px]:block" style={{ height: `${n * 100}svh` }}>
        <div data-stage className="sticky top-0 h-svh w-full overflow-hidden">
          {/* category photos, crossfading */}
          {steps.map(({ cat }, i) => (
            <div key={cat.slug} data-step={i} data-on={i === 0 ? "" : undefined} className="msx-fade absolute inset-0">
              <Image src={cat.image} alt="" fill sizes="100vw" className="msx-zoom object-cover" priority={i === 0} />
            </div>
          ))}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/35" />

          {/* left: caption + huge category title, intro beside it */}
          <div className="absolute inset-y-0 start-0 end-[min(600px,42vw)] px-[var(--gutter)] pb-[clamp(32px,5vh,56px)]">
            {steps.map(({ cat }, i) => (
              <div key={cat.slug} data-step={i} data-on={i === 0 ? "" : undefined} className="msx-copy absolute inset-x-[var(--gutter)] bottom-[clamp(32px,5vh,56px)] grid items-end gap-8 lg:grid-cols-[1fr_minmax(220px,320px)]">
                <div className="overflow-hidden">
                  <p className="msx-rise flex items-center gap-2.5 text-[15px] text-white/80">
                    <span className="size-1.5 rounded-full bg-[#c6f35c]" />
                    {cat.num} — {lang === "ar" ? "الفئة" : "Category"}
                  </p>
                  <h3 className="msx-rise mt-3 text-[clamp(48px,6.25vw,80px)] leading-[0.95] font-medium tracking-[-0.04em] text-white" style={{ transitionDelay: "60ms" }}>
                    {cat.title[lang]}
                  </h3>
                </div>
                <div className="overflow-hidden">
                  <p className="msx-rise text-[15px] leading-[1.45] text-pretty text-white/90" style={{ transitionDelay: "140ms" }}>
                    {cat.intro[lang]}
                  </p>
                  <Link
                    href={href(`/products/${cat.slug}`, lang)}
                    className="msx-rise mt-5 inline-flex items-center gap-2 border-b border-white/40 pb-1 text-[13px] tracking-wide text-white hover:border-white"
                    style={{ transitionDelay: "200ms" }}
                  >
                    {lang === "ar" ? "تصفّح الفئة" : "View the range"} <IconArrow className="size-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* right: frosted panel of numbered cards, the active one open */}
          <div data-panel className="absolute inset-y-0 end-0 w-[min(600px,42vw)] bg-[rgba(192,192,192,0.1)] px-5 backdrop-blur-xl">
            <div data-items className="flex h-full flex-col justify-center py-12">
              {steps.map(({ cat, prod, photo }, i) => (
                <div key={cat.slug} data-step={i} data-on={i === 0 ? "" : undefined} className="msx-item border-t border-white/90 pt-4 last:border-b last:pb-1">
                  <button type="button" onClick={() => jump(i)} className="flex w-full items-baseline gap-5 pb-2.5 text-start text-[20px] text-white">
                    <span className="tabular-nums">{cat.num}</span>
                    <span>{prod.name}</span>
                    <span className="ms-auto text-[11px] tracking-[0.14em] text-white/55 uppercase">{cat.short[lang]}</span>
                  </button>
                  <div className="msx-open grid">
                    <div className="overflow-hidden">
                      <div className="ps-[30px] pt-3.5 pb-6">
                        <p className="text-[15px] leading-[1.45] text-white/90">{prod.summary[lang]}</p>
                        <Link
                          href={href(`/products/${prod.category}/${prod.slug}`, lang)}
                          className="group relative mt-5 block aspect-[502/280] overflow-hidden bg-white/5"
                          aria-label={prod.name}
                        >
                          <Image src={photo} alt={prod.name} fill sizes="(max-width:1400px) 40vw, 560px" className="object-cover transition duration-700 group-hover:scale-105" />
                          <span className="absolute end-3 bottom-3 inline-flex items-center gap-2 bg-black/70 px-3 py-1.5 text-[12px] tracking-wide text-white backdrop-blur">
                            {d.cta.learnMore} <IconArrow className="size-3" />
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* mobile: stacked category blocks, each with its product card */}
      <div className="min-[900px]:hidden">
        {steps.map(({ cat, prod, photo }) => (
          <article key={cat.slug} className="relative">
            <div className="relative h-[70svh] min-h-[420px]">
              <Image src={cat.image} alt="" fill sizes="100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />
              <div className="absolute inset-x-[var(--gutter)] bottom-8">
                <p className="flex items-center gap-2.5 text-[14px] text-white/80">
                  <span className="size-1.5 rounded-full bg-[#c6f35c]" />
                  {cat.num}
                </p>
                <h3 className="mt-2 text-[44px] leading-[0.95] font-medium tracking-[-0.04em]">{cat.title[lang]}</h3>
                <p className="mt-3 max-w-md text-[15px] leading-[1.45] text-white/85">{cat.intro[lang]}</p>
              </div>
            </div>
            <Link href={href(`/products/${prod.category}/${prod.slug}`, lang)} className="block border-t border-white/20 bg-[#111] px-[var(--gutter)] py-6">
              <p className="text-[19px]">{prod.name}</p>
              <p className="mt-2 text-[15px] leading-[1.45] text-white/75">{prod.summary[lang]}</p>
              <div className="relative mt-4 aspect-[502/280] overflow-hidden">
                <Image src={photo} alt={prod.name} fill sizes="100vw" className="object-cover" />
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
