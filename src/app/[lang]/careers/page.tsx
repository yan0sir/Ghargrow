import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, locales } from "@/lib/i18n";
import { getDict } from "@/content/dict";
import { jobs } from "@/content/more";
import { site } from "@/content/site";
import { waLink } from "@/lib/whatsapp";
import { PageHero } from "@/components/ui/PageHero";
import { IconMail, IconWhatsApp } from "@/components/ui/Icons";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/careers">): Promise<Metadata> {
  const { lang } = await params;
  return { title: hasLocale(lang) ? getDict(lang).careers.title : "Careers" };
}

export default async function CareersPage({ params }: PageProps<"/[lang]/careers">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDict(lang);
  return (
    <>
      <PageHero eyebrow="Ghargrow" title={d.careers.title} lead={d.careers.lead} image="/media/img/team-field.webp" />
      <section className="section-y">
        <div className="wrap">
          <h2 className="h1">{d.careers.open}</h2>
          <ul className="mt-10 divide-y divide-ink-900/10 border-y border-ink-900/10">
            {jobs.map((j) => (
              <li key={j.slug}>
                <details className="group py-8">
                  <summary className="grid cursor-pointer list-none gap-3 md:grid-cols-12 md:items-center">
                    <span className="h2 md:col-span-6">{j.title[lang]}</span>
                    <span className="text-ink-700 md:col-span-2">{j.team[lang]}</span>
                    <span className="text-ink-700 md:col-span-2">{j.place[lang]}</span>
                    <span className="eyebrow text-green-700 md:col-span-2 md:text-end">{j.type[lang]}</span>
                  </summary>
                  <div className="mt-8 grid gap-8 md:grid-cols-12">
                    <div className="md:col-span-6 md:col-start-1">
                      <p className="lead">{j.summary[lang]}</p>
                      <p className="eyebrow mt-8 text-ink-400">{d.careers.duties}</p>
                      <ul className="mt-3 space-y-2">
                        {j.duties.map((x, i) => (
                          <li key={i} className="flex gap-3">
                            <span className="mt-2.5 size-1.5 shrink-0 bg-green-700" />
                            {x[lang]}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="md:col-span-5 md:col-start-8">
                      <p className="text-sm text-ink-700">{d.careers.applyHow}</p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <a
                          href={`mailto:${site.email}?subject=${encodeURIComponent(`${d.cta.apply}: ${j.title.en}`)}`}
                          className="inline-flex h-12 items-center gap-3 bg-ink-900 px-6 text-white hover:bg-green-700"
                        >
                          <IconMail /> {d.cta.apply}
                        </a>
                        <a
                          href={waLink(site.defaultWhatsapp, `${d.cta.apply}: ${j.title[lang]}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-12 items-center gap-3 bg-whatsapp px-6 text-ink-900"
                        >
                          <IconWhatsApp /> {d.cta.whatsapp}
                        </a>
                      </div>
                    </div>
                  </div>
                </details>
              </li>
            ))}
          </ul>
          <div className="mt-16 flex flex-col items-start gap-4 bg-sand-100 p-8 md:flex-row md:items-center md:justify-between md:p-12">
            <p className="h2">{d.careers.general}</p>
            <a href={`mailto:${site.email}?subject=CV`} className="inline-flex h-12 items-center gap-3 bg-green-700 px-6 text-white hover:bg-green-800">
              <IconMail /> {site.email}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
