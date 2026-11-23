import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { hasLocale, href, locales } from "@/lib/i18n";
import { getDict } from "@/content/dict";
import { categories, productsIn } from "@/content/catalog";
import { PageHero } from "@/components/ui/PageHero";
import { ProductCard } from "@/components/ui/ProductCard";
import { Reveal, SplitHeading } from "@/components/motion/Reveal";
import { IconArrow } from "@/components/ui/Icons";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/products">): Promise<Metadata> {
  const { lang } = await params;
  return { title: hasLocale(lang) ? getDict(lang).products.title : "Products" };
}

export default async function ProductsPage({ params }: PageProps<"/[lang]/products">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDict(lang);
  return (
    <>
      <PageHero eyebrow="CLAAS · Western · Arcusin" title={d.products.title} lead={d.products.lead} cutout="/media/cutout/axion.webp">
        <nav className="relative z-10 mt-10 flex flex-wrap gap-2">
          {categories.map((c) => (
            <a key={c.slug} href={`#${c.slug}`} className="border border-ink-900/20 bg-sand-50/60 px-4 py-2 text-sm text-ink-900 backdrop-blur hover:bg-ink-900 hover:text-white">
              {c.num} {c.title[lang]}
            </a>
          ))}
        </nav>
      </PageHero>

      {categories.map((c) => {
        const list = productsIn(c.slug);
        return (
          <section key={c.slug} id={c.slug} className="section-y scroll-mt-20 border-t border-ink-900/10">
            <div className="wrap">
              <div className="grid gap-8 md:grid-cols-12">
                <div className="md:col-span-4">
                  <SplitHeading className="h1 mt-3">{c.title[lang]}</SplitHeading>
                  <p className="mt-5 max-w-sm">{c.intro[lang]}</p>
                  <Link href={href(`/products/${c.slug}`, lang)} className="group mt-8 inline-flex items-center gap-3 text-ink-900 underline decoration-ink-900/40 underline-offset-[6px] hover:text-green-700 hover:decoration-green-700">
                    {d.cta.viewCategory} <IconArrow />
                  </Link>
                  <p className="mt-2 font-mono text-xs text-ink-400">
                    {list.length} {d.products.count}
                  </p>
                </div>
                <Reveal stagger={0.08} className="grid gap-x-6 gap-y-12 sm:grid-cols-2 md:col-span-8">
                  {list.map((p) => (
                    <ProductCard key={p.slug} p={p} lang={lang} />
                  ))}
                </Reveal>
              </div>
            </div>
          </section>
        );
      })}

      <section data-tone="dark" className="bg-green-900 text-white">
        <Link href={href("/find-your-machine", lang)} className="wrap group grid items-center gap-8 py-20 md:grid-cols-2">
          <p className="display text-white!">{d.home.quizTitle}</p>
          <div className="flex items-center justify-between gap-6 md:justify-end">
            <span className="lead">{d.cta.takeQuiz}</span>
            <span className="relative grid size-20 shrink-0 place-items-center overflow-hidden bg-white text-ink-900 transition group-hover:bg-green-500">
              <Image src="/media/logo/mark.png" alt="" width={40} height={37} className="opacity-0" />
              <IconArrow className="absolute size-6" />
            </span>
          </div>
        </Link>
      </section>
    </>
  );
}
