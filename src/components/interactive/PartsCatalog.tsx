"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useSite } from "@/components/providers/SiteProvider";
import { parts, partSystems, type PartSystem } from "@/content/more";
import { site } from "@/content/site";
import { waLink } from "@/lib/whatsapp";
import { IconSearch, IconWhatsApp } from "@/components/ui/Icons";

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[ً-ٟ]/g, "");

export function PartsCatalog() {
  const { d, lang } = useSite();
  const [q, setQ] = useState("");
  const [sys, setSys] = useState<PartSystem | "all">("all");

  const list = useMemo(() => {
    const n = norm(q.trim());
    return parts.filter(
      (p) => (sys === "all" || p.system === sys) && (!n || norm(`${p.name.en} ${p.name.ar} ${p.fits ?? ""}`).includes(n)),
    );
  }, [q, sys]);

  return (
    <div>
      <div className="sticky top-16 z-20 -mx-[var(--gutter)] flex flex-col gap-3 border-b border-ink-900/10 bg-sand-50/95 px-[var(--gutter)] py-4 backdrop-blur md:top-20 md:flex-row md:items-center">
        <label className="relative flex-1">
          <IconSearch className="absolute start-4 top-1/2 size-5 -translate-y-1/2 text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={d.parts.search}
            className="h-12 w-full border border-ink-900/20 bg-white ps-12 pe-4 text-ink-900 focus:border-green-700 focus:outline-none"
            type="search"
          />
        </label>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {[{ id: "all" as const, label: { en: d.parts.all, ar: d.parts.all } }, ...partSystems].map((s) => (
            <button
              key={s.id}
              onClick={() => setSys(s.id)}
              className={`h-12 shrink-0 border px-4 text-sm transition ${sys === s.id ? "border-ink-900 bg-ink-900 text-white" : "border-ink-900/20 hover:border-ink-900"}`}
            >
              {s.label[lang]}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <p className="py-20 text-center text-ink-400">{d.parts.none}</p>
      ) : (
        <ul className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((p) => (
            <li key={p.id} className="group flex flex-col">
              <div className="relative aspect-square overflow-hidden bg-sand-200">
                {p.image ? (
                  <Image src={p.image} alt={p.name[lang]} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition duration-700 group-hover:scale-105" />
                ) : (
                  <div className="grid size-full place-items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/media/logo/mark.png" alt="" className="w-16 opacity-20" />
                  </div>
                )}
                <span className="eyebrow absolute start-2 top-2 bg-sand-50/90 px-2 py-1 text-[10px] text-ink-700">
                  {partSystems.find((s) => s.id === p.system)!.label[lang]}
                </span>
              </div>
              <p className="h3 mt-4 text-xl!">{p.name[lang]}</p>
              {p.fits && (
                <p className="mt-1 font-mono text-xs text-ink-400">
                  {d.parts.fits}: {p.fits}
                </p>
              )}
              <a
                href={waLink(site.defaultWhatsapp, `${d.contact.waMessage} ${p.name[lang]}${p.fits ? ` (${p.fits})` : ""}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex h-10 w-fit items-center gap-2 border border-ink-900/20 px-4 text-sm text-ink-900 transition hover:border-whatsapp hover:bg-whatsapp"
              >
                <IconWhatsApp className="size-4" /> {d.parts.ask}
              </a>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-24 grid items-center gap-6 bg-green-900 p-8 text-white md:grid-cols-2 md:p-14">
        <div>
          <p className="h1 text-white!">{d.parts.photoTitle}</p>
          <p className="lead mt-4 text-white/75">{d.parts.photoLead}</p>
        </div>
        <div className="md:text-end">
          <a
            href={waLink(site.defaultWhatsapp, d.parts.photoMsg)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-14 items-center gap-3 bg-whatsapp px-8 text-ink-900 hover:brightness-95"
          >
            <IconWhatsApp /> {d.cta.askWhatsapp}
          </a>
        </div>
      </div>
    </div>
  );
}
