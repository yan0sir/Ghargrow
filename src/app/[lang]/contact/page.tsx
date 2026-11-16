import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, locales } from "@/lib/i18n";
import { getDict } from "@/content/dict";
import { site, branches } from "@/content/site";
import { waLink } from "@/lib/whatsapp";
import { PageHero } from "@/components/ui/PageHero";
import { LibyaMap } from "@/components/interactive/LibyaMap";
import { ContactButton } from "@/components/contact/ContactButton";
import { IconMail, IconPhone, IconWhatsApp } from "@/components/ui/Icons";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  return { title: hasLocale(lang) ? getDict(lang).nav.contact : "Contact" };
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDict(lang);
  return (
    <>
      <PageHero eyebrow={d.nav.contact} title={d.contact.title} lead={d.contact.subtitle}>
        <div className="relative z-10 mt-10 flex flex-wrap gap-3">
          <a
            href={waLink(site.defaultWhatsapp, d.contact.waGeneral)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-14 items-center gap-3 bg-whatsapp px-8 text-lg text-ink-900 hover:brightness-95"
          >
            <IconWhatsApp className="size-6" /> {d.cta.askWhatsapp}
          </a>
          <ContactButton variant="dark" className="h-14!">
            {d.cta.inquire}
          </ContactButton>
        </div>
      </PageHero>

      <section className="section-y">
        <div className="wrap grid gap-px bg-ink-900/10 md:grid-cols-3">
          {branches.map((b) => (
            <div key={b.id} className="bg-sand-50 p-8 md:p-10">
              <p className="eyebrow text-ink-400">{b.hq ? d.contact.hq : d.footer.branches}</p>
              <p className="display mt-3">{b.city[lang]}</p>
              <p dir="ltr" className={`mt-6 font-mono text-ink-900 ${lang === "ar" ? "text-right" : ""}`}>
                {b.phoneDisplay}
              </p>
              <div className="mt-6 flex gap-2">
                <a href={`tel:${b.phone}`} className="inline-flex h-11 items-center gap-2 bg-ink-900 px-4 text-sm text-white hover:bg-green-700">
                  <IconPhone className="size-4" /> {d.cta.call}
                </a>
                <a
                  href={waLink(b.whatsapp, d.contact.waGeneral)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 bg-whatsapp px-4 text-sm text-ink-900"
                >
                  <IconWhatsApp className="size-4" /> {d.cta.whatsapp}
                </a>
              </div>
            </div>
          ))}
        </div>
        <div className="wrap mt-10 flex flex-wrap items-center gap-8 text-ink-900">
          <a href={`mailto:${site.email}`} className="inline-flex items-center gap-3 hover:text-green-700">
            <IconMail /> {site.email}
          </a>
          <span className="text-ink-400">{d.contact.follow}:</span>
          <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-green-700">
            Facebook
          </a>
          <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-green-700">
            Instagram
          </a>
          <a href={site.social.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-green-700">
            LinkedIn
          </a>
        </div>
      </section>

      <section className="section-y border-t border-ink-900/10 bg-sand-100">
        <div className="wrap">
          <LibyaMap />
        </div>
      </section>
    </>
  );
}
