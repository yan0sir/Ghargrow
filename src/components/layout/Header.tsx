"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSite } from "@/components/providers/SiteProvider";
import { categories, productsIn } from "@/content/catalog";
import { href, otherLocale } from "@/lib/i18n";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { toneAt } from "@/lib/backdropTone";
import { gsap } from "@/lib/gsap";
import { Roll } from "@/components/ui/Btn";
import { IconArrow, IconClose } from "@/components/ui/Icons";

export function Header() {
  const { d, lang, openContact } = useSite();
  const pathname = usePathname();
  const [hiddenBar, setHiddenBar] = useState(false);
  const [menu, setMenu] = useState(false);
  const [mega, setMega] = useState(false);
  const overlay = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);

  useEffect(() => {
    let last = 0,
      raf = 0;
    // every item in the bar (logo, each link, the language switch, the menu button) reads what is actually
    // right behind it (photo, video, 3D sky, section colour) and turns light on dark, dark on light.
    // Set as data-on="dark|light" straight on the element; the colours live in globals.css.
    const ignore = (el: Element) => !!el.closest("header, [data-tone-ignore]");
    const probe = () => {
      raf = 0;
      const items = bar.current?.querySelectorAll<HTMLElement>("[data-tone-item]") ?? [];
      items.forEach((el) => {
        if (mega) return void (el.dataset.on = "light"); // the open mega menu has its own sand panel
        const r = el.getBoundingClientRect();
        if (!r.width) return;
        const t = toneAt(r.left + r.width / 2, r.top + r.height / 2, ignore);
        if (t) el.dataset.on = t;
      });
    };
    const onScroll = () => {
      const y = window.scrollY;
      setHiddenBar(y > 400 && y > last);
      last = y;
      if (!raf) raf = requestAnimationFrame(probe);
    };
    onScroll();
    probe();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // videos, the farm's day/night sky and late-loading photos change without a scroll
    const tick = window.setInterval(() => {
      if (!document.hidden && !raf) raf = requestAnimationFrame(probe);
    }, 400);
    return () => {
      window.clearInterval(tick);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname, mega]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close menus on navigation
    setMenu(false);
    setMega(false);
  }, [pathname]);

  useEffect(() => {
    if (!menu || !overlay.current) return;
    gsap.fromTo(overlay.current, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.8, ease: "expo.out" });
    gsap.from(overlay.current.querySelectorAll("[data-item]"), { yPercent: 100, opacity: 0, stagger: 0.05, duration: 0.8, delay: 0.15 });
  }, [menu]);

  // the mobile menu: Escape closes it, Tab stays inside, focus goes back to the Menu button
  useFocusTrap(menu, overlay, () => setMenu(false));

  const switchHref = pathname.replace(/^\/(en|ar)/, `/${otherLocale(lang)}`);
  const nav = [
    { label: d.nav.services, path: "/services" },
    { label: d.nav.projects, path: "/projects" },
    { label: d.nav.about, path: "/about" },
  ];
  const isActive = (p: string) => pathname.startsWith(href(p, lang));

  return (
    <>
      {/* first Tab stop on every page: jumps keyboard users past the navigation */}
      <a
        href="#main"
        className="fixed start-4 top-4 z-[200] -translate-y-[200%] bg-green-900 px-5 py-3 text-sm whitespace-nowrap text-sand-50 transition focus:translate-y-0"
      >
        {d.nav.skip}
      </a>
      <header
        ref={bar}
        className={`fixed inset-x-0 top-0 z-60 transition-[transform,background-color,color] duration-500 ${hiddenBar && !mega ? "-translate-y-full" : ""} ${
          mega ? "bg-sand-50/95 backdrop-blur-md" : ""
        }`}
        onMouseLeave={() => setMega(false)}
      >
        <div className="wrap flex h-16 items-center justify-between gap-6 md:h-20">
          <Link href={href("/", lang)} data-tone-item className="relative z-10 flex shrink-0 items-center" aria-label="Ghargrow — home">
            {/* both logos are in the page; data-on picks which one shows */}
            <Image src="/media/logo/lockup.png" alt="Ghargrow Agro-Industries" width={900} height={224} priority className="logo-on-light h-9 w-auto md:h-11" />
            <Image src="/media/logo/lockup-light.png" alt="" width={900} height={224} priority className="logo-on-dark h-9 w-auto md:h-11" />
          </Link>

          <nav className="hidden items-center gap-8 text-[15px] lg:flex">
            <button
              onMouseEnter={() => setMega(true)}
              onFocus={() => setMega(true)}
              onClick={() => setMega((v) => !v)}
              data-tone-item
              data-active={isActive("/products") || undefined}
              className="group"
              aria-expanded={mega}
            >
              <Roll>{d.nav.products}</Roll>
            </button>
            {nav.map((n) => (
              <Link
                key={n.path}
                href={href(n.path, lang)}
                data-tone-item
                data-active={isActive(n.path) || undefined}
                aria-current={isActive(n.path) ? "page" : undefined}
                className="group"
                onMouseEnter={() => setMega(false)}
              >
                <Roll>{n.label}</Roll>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <Link
              href={switchHref}
              data-tone-item
              className="flex h-10 items-center px-2 text-sm font-medium"
              hrefLang={otherLocale(lang)}
              lang={otherLocale(lang)}
            >
              {lang === "en" ? "العربية" : "English"}
            </Link>
            <button
              onClick={() => setMenu(true)}
              data-tone-item
              className="flex h-11 items-center gap-2 px-2 text-sm lg:hidden"
              aria-label={d.nav.menu}
              aria-expanded={menu}
              aria-controls="mobile-menu"
            >
              <span className="flex flex-col gap-[5px]">
                <span className="block h-px w-6 bg-current" />
                <span className="block h-px w-6 bg-current" />
              </span>
            </button>
          </div>
        </div>

        {/* Products mega menu */}
        <div className={`hidden overflow-hidden transition-[max-height] duration-500 lg:block ${mega ? "max-h-[640px]" : "max-h-0"}`}>
          <div className="wrap grid grid-cols-5 gap-6 border-t border-ink-900/10 pt-8 pb-16">
            {categories.map((c) => (
              <div key={c.slug}>
                <Link href={href(`/products/${c.slug}`, lang)} className="group block">
                  <div className="relative aspect-square overflow-hidden bg-sand-200">
                    <Image src={c.card ?? c.image} alt="" fill sizes="25vw" className="object-cover transition duration-700 group-hover:scale-105" />
                  </div>
                  <p className="eyebrow mt-4 text-ink-400">{c.num}</p>
                  <p className="h3 mt-1 group-hover:text-green-700">{c.title[lang]}</p>
                </Link>
                <ul className="mt-3 space-y-1 text-sm">
                  {productsIn(c.slug)
                    .slice(0, 4)
                    .map((p) => (
                      <li key={p.slug}>
                        <Link href={href(`/products/${c.slug}/${p.slug}`, lang)} className="text-ink-700 hover:text-green-700">
                          {p.name}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
            {/* spare parts lives under Products */}
            <div>
              <Link href={href("/spare-parts", lang)} className="group block">
                <div className="relative aspect-square overflow-hidden bg-sand-200">
                  <Image src="/media/img/og-c-parts.webp" alt="" fill sizes="20vw" className="object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <p className="eyebrow mt-4 text-ink-400">05</p>
                <p className="h3 mt-1 group-hover:text-green-700">{d.nav.parts}</p>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile overlay menu */}
      {menu && (
        <div
          ref={overlay}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label={d.nav.menu}
          data-tone="dark"
          className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-green-900 text-white"
          data-lenis-prevent
        >
          <div className="wrap flex h-16 items-center justify-between">
            <Image src="/media/logo/lockup-light.png" alt="Ghargrow" width={900} height={224} className="h-9 w-auto" />
            <button onClick={() => setMenu(false)} className="p-2" aria-label={d.nav.close}>
              <IconClose className="size-6" />
            </button>
          </div>
          <nav className="wrap mt-8 flex-1">
            <ul className="space-y-1">
              {[{ label: d.nav.products, path: "/products" }, ...nav, { label: d.nav.news, path: "/news" }, { label: d.nav.careers, path: "/careers" }, { label: d.nav.contact, path: "/contact" }].map(
                (n) => (
                  <li key={n.path} className="overflow-hidden">
                    <Link data-item href={href(n.path, lang)} className="flex items-center justify-between py-2 font-display text-[44px] leading-tight font-light">
                      {n.label}
                      <IconArrow className="size-6 opacity-50" />
                    </Link>
                  </li>
                ),
              )}
            </ul>
            <Link data-item href={href("/find-your-machine", lang)} className="mt-8 inline-block border border-white/40 px-5 py-3 text-sm">
              {d.nav.quiz}
            </Link>
          </nav>
          <div className="wrap py-8">
            <button onClick={() => openContact()} className="h-12 w-full bg-white text-ink-900">
              {d.nav.talk}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
