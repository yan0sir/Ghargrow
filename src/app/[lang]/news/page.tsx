import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale, href, locales } from "@/lib/i18n";
import { getDict } from "@/content/dict";
import { posts } from "@/content/more";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/motion/Reveal";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/news">): Promise<Metadata> {
  const { lang } = await params;
  return { title: hasLocale(lang) ? getDict(lang).news.title : "News" };
}

export default async function NewsPage({ params }: PageProps<"/[lang]/news">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDict(lang);
  const [first, ...rest] = posts;
  return (
    <>
      <PageHero eyebrow="Ghargrow" title={d.news.title} lead={d.news.lead} />
      <section className="wrap pb-28">
        <Link href={href(`/news/${first.slug}`, lang)} className="group grid gap-8 md:grid-cols-12 md:items-end">
          <div className="relative aspect-[16/10] overflow-hidden bg-sand-200 md:col-span-8">
            <Image src={first.cover} alt="" fill sizes="(max-width:768px) 100vw, 66vw" className="object-cover transition duration-1000 group-hover:scale-105" />
          </div>
          <div className="md:col-span-4">
            <p className="eyebrow text-ink-400">{first.date}</p>
            <p className="h1 mt-3 group-hover:text-green-700">{first.title[lang]}</p>
            <p className="mt-4">{first.excerpt[lang]}</p>
          </div>
        </Link>
        <Reveal stagger={0.1} className="mt-20 grid gap-10 md:grid-cols-2">
          {rest.map((p) => (
            <Link key={p.slug} href={href(`/news/${p.slug}`, lang)} className="group block">
              <div className="relative aspect-[3/2] overflow-hidden bg-sand-200">
                <Image src={p.cover} alt="" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <p className="eyebrow mt-5 text-ink-400">{p.date}</p>
              <p className="h2 mt-2 group-hover:text-green-700">{p.title[lang]}</p>
              <p className="mt-3">{p.excerpt[lang]}</p>
            </Link>
          ))}
        </Reveal>
      </section>
    </>
  );
}
