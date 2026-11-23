import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { hasLocale, locales } from "@/lib/i18n";
import { getDict } from "@/content/dict";
import { projects } from "@/content/more";
import { findProduct } from "@/content/catalog";
import { SplitHeading, Reveal } from "@/components/motion/Reveal";
import { ProductCard } from "@/components/ui/ProductCard";
import { ContactButton } from "@/components/contact/ContactButton";

export function generateStaticParams() {
  return locales.flatMap((lang) => projects.map((p) => ({ lang, slug: p.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/projects/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!p || !hasLocale(lang)) return {};
  return { title: p.title[lang], description: p.summary[lang], openGraph: { images: [p.cover] } };
}

export default async function ProjectPage({ params }: PageProps<"/[lang]/projects/[slug]">) {
  const { lang, slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!hasLocale(lang) || !p) notFound();
  const d = getDict(lang);
  const used = p.products.map(findProduct).filter((x) => !!x);
  return (
    <>
      <section data-tone="dark" className="relative h-[88svh] min-h-[520px] overflow-hidden bg-ink-900">
        <Image src={p.cover} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-transparent to-ink-900/20" />
        <div className="wrap absolute inset-x-0 bottom-0 pb-14 text-white">
          <SplitHeading as="h1" immediate className="display mt-4 max-w-5xl text-white!">
            {p.title[lang]}
          </SplitHeading>
        </div>
      </section>
      <section className="section-y">
        <div className="wrap grid gap-10 md:grid-cols-12">
          <p className="lead md:col-span-4">{p.summary[lang]}</p>
          <div className="space-y-6 text-lg md:col-span-7 md:col-start-6">
            {p.story.map((s, i) => (
              <p key={i}>{s[lang]}</p>
            ))}
          </div>
        </div>
      </section>
      <section className="pb-24">
        <Reveal stagger={0.08} className="wrap grid grid-cols-2 gap-4 md:grid-cols-3">
          {p.gallery.map((g, i) => (
            <div key={g} className={`relative overflow-hidden bg-sand-200 ${i % 4 === 0 ? "col-span-2 aspect-[16/9]" : "aspect-[4/5]"}`}>
              <Image src={g} alt="" fill sizes="(max-width:768px) 50vw, 33vw" className="object-cover" />
            </div>
          ))}
        </Reveal>
      </section>
      <section className="section-y border-t border-ink-900/10 bg-sand-100">
        <div className="wrap">
          <h2 className="h1">{d.projects.productsUsed}</h2>
          <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {used.map((u) => (
              <ProductCard key={u!.slug} p={u!} lang={lang} />
            ))}
          </div>
          <div className="mt-14">
            <ContactButton topic={{ label: p.title[lang], kind: "general" }}>{d.nav.talk}</ContactButton>
          </div>
        </div>
      </section>
    </>
  );
}
