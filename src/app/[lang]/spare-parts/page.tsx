import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, locales } from "@/lib/i18n";
import { getDict } from "@/content/dict";
import { PageHero } from "@/components/ui/PageHero";
import { PartsCatalog } from "@/components/interactive/PartsCatalog";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/spare-parts">): Promise<Metadata> {
  const { lang } = await params;
  return { title: hasLocale(lang) ? getDict(lang).parts.title : "Spare parts" };
}

export default async function PartsPage({ params }: PageProps<"/[lang]/spare-parts">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDict(lang);
  return (
    <>
      <PageHero eyebrow={lang === "ar" ? "قطع أصلية" : "Genuine parts"} title={d.parts.title} lead={d.parts.lead} />
      <section className="wrap pb-28">
        <PartsCatalog />
      </section>
    </>
  );
}
