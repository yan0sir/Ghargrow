import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { hasLocale, locales } from "@/lib/i18n";
import { getDict } from "@/content/dict";
import { categories, findCategory, productsIn } from "@/content/catalog";
import { services } from "@/content/more";
import { ProductCard } from "@/components/ui/ProductCard";
import { Reveal, SplitHeading } from "@/components/motion/Reveal";
import { AttachmentSwap } from "@/components/scenes/AttachmentSwap";
import { PivotSimulator } from "@/components/interactive/PivotSimulator";
import { BaleFlow } from "@/components/interactive/BaleFlow";
import { ContactButton, WhatsAppButton } from "@/components/contact/ContactButton";
import { Btn } from "@/components/ui/Btn";
import { href } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.flatMap((lang) => categories.map((c) => ({ lang, category: c.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/products/[category]">): Promise<Metadata> {
  const { lang, category } = await params;
  const c = findCategory(category);
  if (!c || !hasLocale(lang)) return {};
  return { title: c.title[lang], description: c.intro[lang], openGraph: { images: [c.image] } };
}

export default async function CategoryPage({ params }: PageProps<"/[lang]/products/[category]">) {
  const { lang, category } = await params;
  const c = findCategory(category);
  if (!hasLocale(lang) || !c) notFound();
  const d = getDict(lang);
  const list = productsIn(c.slug);

  return (
    <>
      <section className="relative h-[92svh] min-h-[560px] overflow-hidden bg-ink-900 text-white">
        {c.video ? (
          <video className="absolute inset-0 size-full object-cover" src={c.video} poster={c.image} autoPlay muted loop playsInline />
        ) : (
          <Image src={c.image} alt="" fill priority sizes="100vw" className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/10 to-ink-900/30" />
        <div className="wrap absolute inset-x-0 bottom-0 pb-14">
          <SplitHeading as="h1" immediate className="display-xl mt-4 max-w-5xl text-white!">
            {c.title[lang]}
          </SplitHeading>
          <p className="lead mt-6 max-w-xl text-white/85">{c.intro[lang]}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <WhatsAppButton label={c.title[lang]} />
            <ContactButton variant="light" topic={{ label: c.title[lang], kind: "product" }}>
              {d.cta.inquire}
            </ContactButton>
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="wrap">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SplitHeading className="h1">{d.products.title}</SplitHeading>
            <p className="font-mono text-sm text-ink-400">
              {list.length} {d.products.count}
            </p>
          </div>
          <Reveal stagger={0.08} className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <ProductCard key={p.slug} p={p} lang={lang} />
            ))}
          </Reveal>
        </div>
      </section>

      {c.feature === "attachment-swap" && <AttachmentSwap />}
      {c.feature === "pivot-simulator" && (
        <section className="section-y bg-green-900 text-white">
          <div className="wrap">
            <SplitHeading className="h1 mt-3 mb-4 max-w-3xl text-white!">{d.home.irrigationTitle}</SplitHeading>
            <p className="lead mb-12 max-w-xl text-white/75">{d.home.irrigationLead}</p>
            <PivotSimulator dark />
          </div>
        </section>
      )}
      {c.feature === "bale-flow" && (
        <section className="section-y bg-sand-100">
          <div className="wrap">
            <BaleFlow />
          </div>
        </section>
      )}

      <section className="section-y border-t border-ink-900/10">
        <div className="wrap grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <h2 className="h1 mt-3">{d.home.servicesTitle}</h2>
            <div className="mt-8">
              <Btn href={href("/services", lang)} variant="outline">
                {d.nav.services}
              </Btn>
            </div>
          </div>
          <ul className="divide-y divide-ink-900/10 border-y border-ink-900/10 md:col-span-7">
            {services.map((s) => (
              <li key={s.id} className="flex gap-6 py-6">
                <span className="font-mono text-sm text-green-700">{s.num}</span>
                <div>
                  <p className="h3">{s.title[lang]}</p>
                  <p className="mt-2 text-ink-700">{s.body[lang]}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
