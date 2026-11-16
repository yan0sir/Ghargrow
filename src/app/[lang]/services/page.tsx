import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { hasLocale, locales } from "@/lib/i18n";
import { getDict } from "@/content/dict";
import { services } from "@/content/more";
import { PageHero } from "@/components/ui/PageHero";
import { SplitHeading } from "@/components/motion/Reveal";
import { LibyaMap } from "@/components/interactive/LibyaMap";
import { ContactButton } from "@/components/contact/ContactButton";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/services">): Promise<Metadata> {
  const { lang } = await params;
  return { title: hasLocale(lang) ? getDict(lang).services.title : "Services" };
}

export default async function ServicesPage({ params }: PageProps<"/[lang]/services">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDict(lang);
  return (
    <>
      <PageHero eyebrow={d.home.servicesEyebrow} title={d.services.title} lead={d.services.lead} image="/media/img/team-line.webp" />

      {services.map((s, i) => (
        <section key={s.id} id={s.id} className="scroll-mt-20 border-b border-ink-900/10">
          <div className="wrap grid gap-10 py-20 md:grid-cols-12 md:py-28">
            {/* sticky image while copy scrolls */}
            <div className={`md:col-span-6 ${i % 2 ? "md:order-2" : ""}`}>
              <div className="relative aspect-[4/5] overflow-hidden bg-sand-200 md:sticky md:top-28">
                <Image src={s.image} alt="" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
              </div>
            </div>
            <div className="flex flex-col justify-center md:col-span-5 md:col-start-8">
              <p className="font-mono text-sm text-green-700">{s.num}</p>
              <SplitHeading className="display mt-3">{s.title[lang]}</SplitHeading>
              <p className="lead mt-6">{s.body[lang]}</p>
              <ul className="mt-10 divide-y divide-ink-900/10 border-y border-ink-900/10">
                {s.points.map((pt, k) => (
                  <li key={k} className="flex items-center gap-4 py-4 text-ink-900">
                    <span className="size-2 bg-green-700" />
                    {pt[lang]}
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <ContactButton topic={{ label: s.title[lang], kind: "service" }}>{d.cta.inquire}</ContactButton>
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="section-y bg-sand-100">
        <div className="wrap">
          <SplitHeading className="h1 mt-4 mb-14">{d.home.mapTitle}</SplitHeading>
          <LibyaMap />
        </div>
      </section>
    </>
  );
}
