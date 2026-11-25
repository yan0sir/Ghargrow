import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale, href, locales, type L } from "@/lib/i18n";
import { getDict } from "@/content/dict";
import { brands, findCategory, findProduct, products, productsIn } from "@/content/catalog";
import { parts } from "@/content/more";
import { branches } from "@/content/site";
import { SplitHeading, Reveal } from "@/components/motion/Reveal";
import { FrameScrub } from "@/components/scenes/FrameScrub";
import { HighlightTabs, Hotspots, StickyBuyBar } from "@/components/interactive/ProductBits";
import { ProductCard } from "@/components/ui/ProductCard";
import { AddToCart } from "@/components/cart/Cart";
import { ContactButton, WhatsAppButton } from "@/components/contact/ContactButton";
import { Btn } from "@/components/ui/Btn";
import { IconPhone } from "@/components/ui/Icons";

export function generateStaticParams() {
  return locales.flatMap((lang) => products.map((p) => ({ lang, category: p.category, slug: p.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/products/[category]/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = findProduct(slug);
  if (!p || !hasLocale(lang)) return {};
  return { title: `${p.name} — ${p.type[lang]}`, description: p.summary[lang], openGraph: { images: [p.image] } };
}

const val = (v: string | L, lang: "en" | "ar") => (typeof v === "string" ? v : v[lang]);

export default async function ProductPage({ params }: PageProps<"/[lang]/products/[category]/[slug]">) {
  const { lang, category, slug } = await params;
  const p = findProduct(slug);
  if (!hasLocale(lang) || !p || p.category !== category) notFound();
  const d = getDict(lang);
  const c = findCategory(p.category)!;
  const brand = brands[p.brand];
  const related = productsIn(p.category)
    .filter((x) => x.slug !== p.slug)
    .slice(0, 3);
  const fits = parts.filter((x) => x.fits?.toUpperCase().includes(p.name.split(" ")[0].toUpperCase()) || (p.category === "irrigation" && x.system === "pivot")).slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="sky-gradient relative overflow-hidden">
        <div className="wrap relative pt-32 pb-12 md:pt-40">
          <nav className="eyebrow flex flex-wrap gap-2 text-ink-400" aria-label="Breadcrumb">
            <Link href={href("/products", lang)} className="hover:text-ink-900">
              {d.products.title}
            </Link>
            /
            <Link href={href(`/products/${c.slug}`, lang)} className="hover:text-ink-900">
              {c.title[lang]}
            </Link>
          </nav>
          <SplitHeading as="h1" immediate className="display-xl relative z-0 mt-3">
            {p.name}
          </SplitHeading>
          {p.cutout ? (
            <div className="pointer-events-none relative z-10 mt-6 ms-auto w-[88%] md:-mt-[10vw] md:w-[64%]">
              <Image src={p.cutout} alt={p.name} width={1600} height={1289} priority sizes="(max-width:768px) 90vw, 64vw" className="h-auto w-full drop-shadow-[0_40px_40px_rgba(20,20,15,0.25)]" />
            </div>
          ) : (
            <div className="relative z-10 mt-10 aspect-[16/9] overflow-hidden bg-sand-200 md:aspect-[21/9]">
              <Image src={p.image} alt={p.name} fill priority sizes="100vw" className="object-cover" />
            </div>
          )}
          <div className="relative z-10 mt-10 grid gap-8 md:grid-cols-12">
            <div className="md:col-span-6">
              <p className="lead">{p.summary[lang]}</p>
              <AddToCart slug={p.slug} className="mt-8" />
            </div>
            <div className="flex flex-wrap items-start gap-3 md:col-span-6 md:justify-end">
              <WhatsAppButton label={p.name} />
              <a href={`tel:${branches[0].phone}`} className="group inline-flex h-12 items-center gap-3 bg-ink-900 px-6 text-white hover:bg-green-700">
                <IconPhone /> {d.cta.call}
              </a>
              <ContactButton variant="outline" topic={{ label: p.name, kind: "product" }}>
                {d.cta.inquire}
              </ContactButton>
            </div>
          </div>
          {p.keySpec && <p className="mt-8 font-mono text-sm text-green-700">{p.keySpec[lang]}</p>}
        </div>
      </section>

      {/* Scroll showcase */}
      {p.sequence ? (
        <FrameScrub name={p.sequence.name} frames={p.sequence.frames} poster={`/media/seq/${p.sequence.name}/d/0001.webp`} length="+=220%">
          {(p.highlights ?? []).map((h) => (
            <div key={h.key} data-callout className="wrap invisible absolute inset-x-0 bottom-0 pb-[12vh] text-white">
              <p className="display mt-3 text-white!">{h.title[lang]}</p>
              <p className="lead mt-4 max-w-lg text-white/85">{h.body[lang]}</p>
            </div>
          ))}
        </FrameScrub>
      ) : p.video ? (
        <section data-tone="dark" className="relative h-[80svh] overflow-hidden bg-ink-900" data-immersive>
          <video className="absolute inset-0 size-full object-cover" src={p.video} poster={p.image} autoPlay muted loop playsInline preload="none" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 to-transparent" />
          <div className="wrap absolute inset-x-0 bottom-0 pb-14 text-white">
            <p className="display mt-3 max-w-4xl text-white!">{p.name}</p>
          </div>
        </section>
      ) : null}

      {/* Highlights */}
      {p.highlights && (
        <section className="section-y">
          <div className="wrap">
            <div className="mt-10">
              <HighlightTabs items={p.highlights} />
            </div>
          </div>
        </section>
      )}

      {/* Hotspots */}
      {p.hotspots && p.cutout && (
        <section className="section-y bg-sand-100">
          <div className="wrap grid gap-10 md:grid-cols-12 md:items-center">
            <div className="md:col-span-4">
              <SplitHeading className="h1">{d.products.explore}</SplitHeading>
            </div>
            <div className="md:col-span-8">
              <Hotspots image={p.cutout} points={p.hotspots} />
            </div>
          </div>
        </section>
      )}

      {/* Specs */}
      <section className="section-y">
        <div className="wrap">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SplitHeading className="h1">{d.products.specs}</SplitHeading>
          </div>
          <Reveal stagger={0.06} className="mt-10 grid gap-px bg-ink-900/10 sm:grid-cols-2 lg:grid-cols-3">
            {p.specs.map((s, i) => (
              <div key={i} className="bg-sand-50 p-6 md:p-8">
                <p className="eyebrow text-ink-400">{s.label[lang]}</p>
                <p className="mt-4 font-display text-2xl font-light text-ink-900 md:text-3xl">{val(s.value, lang)}</p>
              </div>
            ))}
          </Reveal>
          <p className="mt-6 max-w-2xl text-sm text-ink-400">{p.specsSource ? p.specsSource[lang] : d.products.noSpecs}</p>
        </div>
      </section>

      {/* Gallery */}
      {p.gallery.length > 1 && (
        <section className="pb-24">
          <div className="wrap">
            <Reveal stagger={0.1} className="grid grid-cols-2 gap-4 md:grid-cols-12">
              {p.gallery.slice(0, 4).map((g, i) => (
                <div
                  key={g}
                  className={`relative overflow-hidden bg-sand-200 ${
                    i === 0 ? "col-span-2 aspect-[16/10] md:col-span-8" : i === 1 ? "aspect-[4/5] md:col-span-4" : "aspect-[4/3] md:col-span-6"
                  }`}
                >
                  <Image src={g} alt="" fill sizes="(max-width:768px) 50vw, 60vw" className="object-cover" />
                </div>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* Service & parts */}
      <section data-tone="dark" className="bg-green-900 text-white/80">
        <div className="wrap section-y grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <h2 className="h1 text-white!">{d.products.serviceTitle}</h2>
            <p className="lead mt-5">{d.products.serviceLead}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Btn href={href("/services", lang)} variant="light">
                {d.nav.services}
              </Btn>
              <Btn href={href("/spare-parts", lang)} variant="ghost" className="text-white! hover:text-green-300!">
                {d.nav.parts}
              </Btn>
            </div>
          </div>
          {fits.length > 0 && (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:col-span-7">
              {fits.map((x) => (
                <li key={x.id} className="bg-white/5 p-3">
                  {x.image && (
                    <div className="relative aspect-square overflow-hidden">
                      <Image src={x.image} alt="" fill sizes="20vw" className="object-cover" />
                    </div>
                  )}
                  <p className="mt-3 text-sm text-white">{x.name[lang]}</p>
                  {x.fits && <p className="font-mono text-xs text-white/70">{x.fits}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="section-y">
          <div className="wrap">
            <SplitHeading className="h1">{d.products.related}</SplitHeading>
            <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <ProductCard key={r.slug} p={r} lang={lang} />
              ))}
            </div>
          </div>
        </section>
      )}

      <StickyBuyBar name={p.name} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: p.name,
            brand: { "@type": "Brand", name: brand.name },
            description: p.summary[lang],
            image: `https://www.ghargrow.com${p.image}`,
          }),
        }}
      />
    </>
  );
}
