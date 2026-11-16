import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale, href, locales } from "@/lib/i18n";
import { getDict } from "@/content/dict";
import { posts } from "@/content/more";
import { SplitHeading } from "@/components/motion/Reveal";

export function generateStaticParams() {
  return locales.flatMap((lang) => posts.map((p) => ({ lang, slug: p.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/news/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = posts.find((x) => x.slug === slug);
  if (!p || !hasLocale(lang)) return {};
  return { title: p.title[lang], description: p.excerpt[lang], openGraph: { images: [p.cover] } };
}

export default async function PostPage({ params }: PageProps<"/[lang]/news/[slug]">) {
  const { lang, slug } = await params;
  const p = posts.find((x) => x.slug === slug);
  if (!hasLocale(lang) || !p) notFound();
  const d = getDict(lang);
  return (
    <article>
      <header className="sky-gradient">
        <div className="wrap max-w-5xl! pt-36 pb-14 md:pt-44">
          <Link href={href("/news", lang)} className="eyebrow text-green-700 hover:text-ink-900">
            {d.news.title}
          </Link>
          <p className="eyebrow mt-6 text-ink-400">{p.date}</p>
          <SplitHeading as="h1" immediate className="h1 mt-3">
            {p.title[lang]}
          </SplitHeading>
          <p className="lead mt-6">{p.excerpt[lang]}</p>
        </div>
      </header>
      <div className="wrap max-w-5xl!">
        <div className="relative aspect-[16/9] overflow-hidden bg-sand-200">
          <Image src={p.cover} alt="" fill priority sizes="100vw" className="object-cover" />
        </div>
        <div className="mx-auto max-w-2xl space-y-6 py-16 text-lg">
          {p.body.map((b, i) => (
            <p key={i}>{b[lang]}</p>
          ))}
        </div>
        {p.gallery && (
          <div className="grid gap-4 pb-28 md:grid-cols-2">
            {p.gallery.map((g) => (
              <div key={g} className="relative aspect-[4/3] overflow-hidden bg-sand-200">
                <Image src={g} alt="" fill sizes="50vw" className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
