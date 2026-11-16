"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import Image from "next/image";
import { useSite } from "@/components/providers/SiteProvider";
import { branches, site } from "@/content/site";
import { categories } from "@/content/catalog";
import { href } from "@/lib/i18n";
import { LeafMark } from "@/components/motion/LeafMark";
import { GrowingCrops } from "@/components/motion/GrowingCrops";

export function Footer() {
  const { d, lang, lite, setLite } = useSite();
  const year = useSyncExternalStore(
    () => () => {},
    () => new Date().getFullYear(),
    () => 2026,
  );
  return (
    <footer className="relative overflow-hidden bg-green-900 text-white/80">
      <GrowingCrops className="absolute inset-x-0 top-0 h-28 text-green-700/60" tone="dark" density={70} />
      <div className="wrap relative pt-40 pb-10">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <LeafMark light className="w-20" />
            <p className="display mt-8 text-white">{site.tagline[lang]}</p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm md:col-span-7 md:grid-cols-3">
            <div>
              <p className="eyebrow mb-4 text-white/50">{d.footer.explore}</p>
              <ul className="space-y-2">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link className="hover:text-white" href={href(`/products/${c.slug}`, lang)}>
                      {c.title[lang]}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link className="hover:text-white" href={href("/spare-parts", lang)}>
                    {d.nav.parts}
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white" href={href("/find-your-machine", lang)}>
                    {d.nav.quiz}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-4 text-white/50">{d.footer.company}</p>
              <ul className="space-y-2">
                {[
                  [d.nav.about, "/about"],
                  [d.nav.services, "/services"],
                  [d.nav.projects, "/projects"],
                  [d.nav.news, "/news"],
                  [d.nav.careers, "/careers"],
                  [d.nav.contact, "/contact"],
                ].map(([l, p]) => (
                  <li key={p}>
                    <Link className="hover:text-white" href={href(p, lang)}>
                      {l}
                    </Link>
                  </li>
                ))}
                <li>
                  <a className="hover:text-white" href={href("/3d", lang)}>
                    3D
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="eyebrow mb-4 text-white/50">{d.footer.branches}</p>
              <ul className="space-y-3">
                {branches.map((b) => (
                  <li key={b.id}>
                    <span className="block text-white">{b.city[lang]}</span>
                    <a dir="ltr" href={`tel:${b.phone}`} className="font-mono text-xs hover:text-white">
                      {b.phoneDisplay}
                    </a>
                  </li>
                ))}
                <li>
                  <a href={`mailto:${site.email}`} className="hover:text-white">
                    {site.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-6 border-t border-white/15 pt-6 text-xs md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Image src="/media/logo/lockup-light.png" alt="Ghargrow" width={900} height={224} className="h-8 w-auto opacity-90" />
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={lite} onChange={(e) => setLite(e.target.checked)} className="peer sr-only" />
              <span className="relative h-5 w-9 bg-white/20 transition peer-checked:bg-green-500 after:absolute after:top-0.5 after:start-0.5 after:size-4 after:bg-white after:transition peer-checked:after:translate-x-4 rtl:peer-checked:after:-translate-x-4" />
              {d.footer.lighter}
            </label>
            <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white">
              Facebook
            </a>
            <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white">
              Instagram
            </a>
            <a href={site.social.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white">
              LinkedIn
            </a>
            <span>
              © {year} {site.name[lang]}. {d.footer.rights}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
