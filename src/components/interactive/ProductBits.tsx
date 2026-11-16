"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useSite } from "@/components/providers/SiteProvider";
import type { Highlight, Hotspot } from "@/content/catalog";
import { IconPlus, IconWhatsApp, IconPhone } from "@/components/ui/Icons";
import { site, branches } from "@/content/site";
import { waLink } from "@/lib/whatsapp";
import { usePageUrl } from "@/lib/usePageUrl";

/** Apple aperture-style segmented control: swaps image and copy together. */
export function HighlightTabs({ items }: { items: Highlight[] }) {
  const { lang } = useSite();
  const [i, setI] = useState(0);
  const img = useRef<HTMLDivElement>(null);
  const txt = useRef<HTMLDivElement>(null);
  useEffect(() => {
    gsap.fromTo(img.current, { clipPath: "inset(0 0 0 100%)" }, { clipPath: "inset(0 0 0 0%)", duration: 0.9, ease: "expo.out" });
    gsap.fromTo(txt.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 });
  }, [i]);
  const h = items[i];
  return (
    <div className="grid gap-10 md:grid-cols-12 md:items-center">
      <div className="relative aspect-[4/3] overflow-hidden bg-sand-200 md:col-span-8">
        <div ref={img} className="absolute inset-0">
          <Image src={h.image} alt="" fill sizes="(max-width:768px) 100vw, 66vw" className="object-cover" />
        </div>
      </div>
      <div className="md:col-span-4">
        <div role="tablist" className="inline-flex bg-sand-200 p-1">
          {items.map((it, k) => (
            <button
              key={it.key}
              role="tab"
              aria-selected={k === i}
              onClick={() => setI(k)}
              className={`h-10 px-4 text-sm transition ${k === i ? "bg-ink-900 text-white" : "text-ink-700 hover:text-ink-900"}`}
            >
              {it.title[lang]}
            </button>
          ))}
        </div>
        <div ref={txt} className="mt-8">
          <p className="h2">{h.title[lang]}</p>
          <p className="lead mt-4 text-ink-700">{h.body[lang]}</p>
        </div>
      </div>
    </div>
  );
}

/** Banorama-style hotspots on an image: tap a point, read the panel, close it. */
export function Hotspots({ image, points }: { image: string; points: Hotspot[] }) {
  const { lang, d } = useSite();
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      <p className="eyebrow mb-4 text-ink-400">{d.products.tapPoints}</p>
      <div className="relative">
        <Image src={image} alt="" width={1600} height={1289} sizes="(max-width:768px) 100vw, 70vw" className="h-auto w-full" />
        {points.map((p, k) => (
          <div key={k} className="absolute" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
            <button
              onClick={() => setOpen(open === k ? null : k)}
              className={`relative -translate-x-1/2 -translate-y-1/2 grid size-11 place-items-center text-white transition ${open === k ? "bg-ink-900" : "bg-green-700"}`}
              aria-expanded={open === k}
              aria-label={p.title[lang]}
            >
              <span className="absolute inset-0 animate-ping bg-green-700/40" />
              <IconPlus className={`relative size-4 transition ${open === k ? "rotate-45" : ""}`} />
            </button>
            {open === k && (
              <div className="absolute start-6 top-6 z-10 w-60 bg-sand-50 p-4 shadow-xl">
                <p className="h3">{p.title[lang]}</p>
                <p className="mt-2 text-sm">{p.body[lang]}</p>
                <button onClick={() => setOpen(null)} className="eyebrow mt-3 text-green-700">
                  {d.nav.close}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Mobile sticky bar: model name + WhatsApp + Call. */
export function StickyBuyBar({ name }: { name: string }) {
  const { d } = useSite();
  const url = usePageUrl();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > window.innerHeight * 0.8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const msg = `${d.contact.waMessage} ${name}. ${url}`;
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[55] flex items-stretch border-t border-ink-900/10 bg-sand-50/95 backdrop-blur transition-transform duration-500 md:hidden ${
        show ? "" : "translate-y-full"
      }`}
    >
      <p className="flex flex-1 items-center truncate px-4 font-display text-lg text-ink-900">{name}</p>
      <a href={`tel:${branches[0].phone}`} className="grid w-14 place-items-center bg-ink-900 text-white" aria-label={d.cta.call}>
        <IconPhone />
      </a>
      <a href={waLink(site.defaultWhatsapp, msg)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-whatsapp px-4 text-ink-900">
        <IconWhatsApp /> <span className="text-sm font-medium">{d.cta.whatsapp}</span>
      </a>
    </div>
  );
}
