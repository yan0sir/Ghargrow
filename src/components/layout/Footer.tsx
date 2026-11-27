"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { waLink } from "@/lib/whatsapp";
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
  const [email, setEmail] = useState("");
  const ar = lang === "ar";
  // no mailing backend: the signup opens WhatsApp with the address, so sales can add it to their list
  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const msg = ar ? `مرحباً، أرجو إضافتي إلى نشرة غرغار الإخبارية: ${email.trim()}` : `Hello, please add me to the Ghargrow newsletter: ${email.trim()}`;
    window.open(waLink(site.defaultWhatsapp, msg), "_blank", "noopener,noreferrer");
    setEmail("");
  };
  return (
    // sticky reveal: the page content (z-10, opaque) scrolls up off the footer, which stays pinned to the bottom
    <footer data-tone="dark" className="sticky bottom-0 z-0 overflow-hidden border-t border-white/10 bg-green-900 text-white/80">
      <div className="wrap relative pt-16 pb-8 md:pt-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <LeafMark light className="w-14" />
            <p className="mt-6 text-[clamp(26px,2.4vw,36px)] leading-[1.1] font-medium tracking-[-0.02em] text-white">
              {ar ? "أخبار الحقل في بريدك" : "Field news, in your inbox"}
            </p>
            <p className="mt-3 max-w-[400px] text-[15px] leading-[1.5] text-white/70">
              {ar ? "معدات جديدة ومعارض ونصائح موسمية. مرة في الشهر، دون إزعاج." : "New machines, expos and seasonal tips. Once a month, no spam."}
            </p>
            <form onSubmit={subscribe} className="mt-6 flex max-w-[440px] border-b border-white/40 focus-within:border-green-300">
              <label htmlFor="ft-email" className="sr-only">{ar ? "بريدك الإلكتروني" : "Your email"}</label>
              <input
                id="ft-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={ar ? "بريدك الإلكتروني" : "Your email"}
                className="h-12 min-w-0 flex-1 bg-transparent text-[16px] text-white outline-none placeholder:text-white/50"
              />
              <button type="submit" className="h-12 px-2 text-[14px] font-medium text-green-300 hover:text-white">
                {ar ? "اشترك ←" : "Subscribe →"}
              </button>
            </form>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm md:col-span-7 md:grid-cols-3">
            <div>
              <p className="eyebrow mb-4 text-white/70">{d.footer.explore}</p>
              <ul className="space-y-0.5">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link className="inline-block py-1.5 hover:text-white" href={href(`/products/${c.slug}`, lang)}>
                      {c.title[lang]}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link className="inline-block py-1.5 hover:text-white" href={href("/spare-parts", lang)}>
                    {d.nav.parts}
                  </Link>
                </li>
                <li>
                  <Link className="inline-block py-1.5 hover:text-white" href={href("/find-your-machine", lang)}>
                    {d.nav.quiz}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-4 text-white/70">{d.footer.company}</p>
              <ul className="space-y-0.5">
                {[
                  [d.nav.about, "/about"],
                  [d.nav.services, "/services"],
                  [d.nav.projects, "/projects"],
                  [d.nav.news, "/news"],
                  [d.nav.careers, "/careers"],
                  [d.nav.contact, "/contact"],
                ].map(([l, p]) => (
                  <li key={p}>
                    <Link className="inline-block py-1.5 hover:text-white" href={href(p, lang)}>
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="eyebrow mb-4 text-white/70">{d.footer.branches}</p>
              <ul className="space-y-2">
                {branches.map((b) => (
                  <li key={b.id}>
                    <span className="block text-white">{b.city[lang]}</span>
                    <a dir="ltr" href={`tel:${b.phone}`} className="inline-block py-1.5 font-mono text-xs hover:text-white">
                      {b.phoneDisplay}
                    </a>
                  </li>
                ))}
                <li>
                  <a href={`mailto:${site.email}`} className="inline-block py-1.5 hover:text-white">
                    {site.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-white/15 pt-6 pb-20 text-xs md:flex-row md:items-center md:justify-start md:pb-0">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" className="inline-block py-1.5 hover:text-white">
              Facebook
            </a>
            <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="inline-block py-1.5 hover:text-white">
              Instagram
            </a>
            <a href={site.social.linkedin} target="_blank" rel="noopener noreferrer" className="inline-block py-1.5 hover:text-white">
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
