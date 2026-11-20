"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useSite } from "@/components/providers/SiteProvider";
import { branches, site } from "@/content/site";
import { categories } from "@/content/catalog";
import { href } from "@/lib/i18n";
import { LeafMark } from "@/components/motion/LeafMark";

export function Footer() {
  const { d, lang } = useSite();
  const year = useSyncExternalStore(
    () => () => {},
    () => new Date().getFullYear(),
    () => 2026,
  );
  return (
    <footer data-tone="dark" className="relative overflow-hidden bg-green-900 text-white/80">
      <div className="wrap relative pt-20 pb-10">
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

        <div className="mt-20 flex flex-col gap-6 border-t border-white/15 pt-6 text-xs md:flex-row md:items-center md:justify-end">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
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
