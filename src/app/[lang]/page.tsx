import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale, href } from "@/lib/i18n";
import { getDict } from "@/content/dict";
import { brands, products } from "@/content/catalog";
import { services, projects, posts } from "@/content/more";
import { HeroReveal } from "@/components/scenes/HeroReveal";
import { FarmStory } from "@/components/farm/FarmStory";
import { PivotSimulator } from "@/components/interactive/PivotSimulator";
import { LibyaMap } from "@/components/interactive/LibyaMap";
import { Reveal, SplitHeading } from "@/components/motion/Reveal";
import { GrowingCrops } from "@/components/motion/GrowingCrops";
import { ProductCard } from "@/components/ui/ProductCard";
import { Rail } from "@/components/ui/Rail";
import { ContactButton, WhatsAppButton } from "@/components/contact/ContactButton";
import { IconArrow } from "@/components/ui/Icons";

/** ZettaJoule-style small outlined pill link. */
function Pill({ href: to, children, light = false }: { href: string; children: React.ReactNode; light?: boolean }) {
  return (
    <Link
      href={to}
      className={`inline-flex h-9 items-center gap-2 rounded-md border px-4 text-[13px] tracking-wide transition ${
        light ? "border-white/30 text-white hover:bg-white hover:text-ink-900" : "border-ink-900/20 text-ink-900 hover:bg-ink-900 hover:text-white"
      }`}
    >
      {children}
      <IconArrow className="size-3.5" />
    </Link>
  );
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDict(lang);
  const featured = products.filter((p) => p.flagship);

  return (
    <>
      <HeroReveal />

      {/* Partners */}
      <section className="border-b border-ink-900/10 bg-sand-50">
        <div className="wrap flex flex-wrap items-center gap-x-14 gap-y-6 py-10">
          {(["claas", "western"] as const).map((b) => (
            <Link
              key={b}
              href={href(`/products/${b === "claas" ? "tractors-machinery" : "irrigation"}`, lang)}
              className="group flex items-center gap-4 grayscale transition hover:grayscale-0"
            >
              <Image src={brands[b].logo!} alt={brands[b].name} width={600} height={120} className="h-7 w-auto opacity-70 transition group-hover:opacity-100 md:h-9" />
            </Link>
          ))}
          <Link href={href("/products/bale-handling", lang)} className="font-display text-2xl font-medium tracking-[0.2em] text-ink-400 hover:text-ink-900 md:text-3xl">
            ARCUSIN
          </Link>
        </div>
      </section>

      {/* ZettaJoule split: short paragraph left, large rounded image right */}
      <section className="section-y bg-sand-50">
        <div className="wrap grid gap-10 md:grid-cols-12">
          <div className="md:col-span-3">
            <p className="text-[15px] leading-relaxed text-ink-700">{d.about.story}</p>
          </div>
          <Reveal className="relative aspect-[16/9] overflow-hidden rounded-lg bg-sand-200 md:col-span-8 md:col-start-5">
            <Image src="/media/img/pivot-circles.webp" alt="" fill sizes="(max-width:768px) 100vw, 66vw" className="object-cover" />
          </Reveal>
        </div>
      </section>

      {/* The 3D journey: from sand to harvest */}
      <FarmStory />

      {/* Irrigation: ZettaJoule statement layout + simulator */}
      <section className="relative overflow-hidden bg-green-900 text-white">
        <div className="relative h-[70svh] min-h-[420px]">
          <video
            className="absolute inset-0 size-full object-cover"
            src="/media/video/pivot-sunset.mp4"
            poster="/media/video/pivot-sunset.webp"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-green-900/10 via-green-900/20 to-green-900" />
          <div className="wrap absolute inset-x-0 bottom-0 pb-12">
            <SplitHeading className="display mt-4 max-w-5xl text-white!">{d.home.irrigationTitle}</SplitHeading>
          </div>
        </div>
        <div className="wrap grid gap-10 pt-10 pb-28 md:grid-cols-12">
          <p className="text-[15px] leading-relaxed text-white/70 md:col-span-3">{d.home.irrigationLead}</p>
          <div className="md:col-span-9">
            <PivotSimulator dark />
          </div>
        </div>
      </section>

      {/* Featured machines */}
      <section className="section-y bg-sand-50">
        <div className="wrap">
          <div className="grid gap-8 md:grid-cols-12 md:items-end">
            <SplitHeading className="h1 md:col-span-8">{d.home.featured}</SplitHeading>
            <div className="md:col-span-4 md:text-end">
              <Pill href={href("/products", lang)}>{d.nav.allProducts}</Pill>
            </div>
          </div>
          <div className="mt-10">
            <Rail label={d.home.featured}>
              {featured.map((p) => (
                <div key={p.slug} className="w-[78vw] shrink-0 snap-start overflow-hidden sm:w-[44vw] lg:w-[28vw] [&_.relative]:rounded-lg">
                  <ProductCard p={p} lang={lang} size="lg" />
                </div>
              ))}
            </Rail>
          </div>
        </div>
      </section>

      {/* Services — ZettaJoule industry cards: image + dark panel, in a horizontal rail */}
      <section className="bg-[#1d211c] text-white">
        <div className="wrap section-y">
          <div className="grid gap-8 md:grid-cols-12 md:items-end">
            <SplitHeading className="h1 text-white! md:col-span-8">{d.home.servicesTitle}</SplitHeading>
            <div className="md:col-span-4 md:text-end">
              <Pill href={href("/services", lang)} light>
                {d.nav.services}
              </Pill>
            </div>
          </div>
          <div className="mt-14 [&_button]:border-white/25 [&_button]:text-white">
            <Rail label={d.nav.services}>
              {services.map((s) => (
                <Link
                  key={s.id}
                  href={href(`/services#${s.id}`, lang)}
                  className="group grid w-[86vw] shrink-0 snap-start overflow-hidden rounded-lg md:w-[min(920px,72vw)] md:grid-cols-2"
                >
                  <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[420px]">
                    <Image src={s.image} alt="" fill sizes="(max-width:768px) 86vw, 460px" className="object-cover transition duration-700 group-hover:scale-105" />
                  </div>
                  <div className="flex flex-col bg-[#3a3d38] p-7 md:p-9">
                    <p className="flex items-center gap-2 text-[13px] text-white/80">
                      <span className="size-2 rounded-full bg-green-300" />
                      {s.num}
                    </p>
                    <p className="h3 mt-6 text-white! md:text-[34px]!">{s.title[lang]}</p>
                    <p className="mt-4 text-[15px] leading-relaxed text-white/70">{s.body[lang]}</p>
                    <span className="mt-auto inline-flex w-fit items-center gap-2 rounded-md border border-white/25 px-4 py-2 pt-2 text-[13px] text-white transition group-hover:bg-white group-hover:text-ink-900">
                      {d.cta.learnMore} <IconArrow className="size-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </Rail>
          </div>
        </div>
      </section>

      {/* Projects — compact grid */}
      <section className="section-y bg-sand-50">
        <div className="wrap">
          <div className="grid gap-8 md:grid-cols-12 md:items-end">
            <SplitHeading className="h1 md:col-span-8">{d.home.projectsTitle}</SplitHeading>
            <div className="md:col-span-4 md:text-end">
              <Pill href={href("/projects", lang)}>{d.projects.all}</Pill>
            </div>
          </div>
          <Reveal stagger={0.08} className="mt-12 grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-4">
            {projects.map((p) => (
              <Link key={p.slug} href={href(`/projects/${p.slug}`, lang)} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-sand-200">
                  <Image src={p.cover} alt="" fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <p className="mt-3 text-[13px] text-ink-400">
                  {p.type[lang]} · {p.place[lang]}
                </p>
                <p className="mt-1 text-[17px] leading-snug text-ink-900 group-hover:text-green-700">{p.title[lang]}</p>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Map */}
      <section className="section-y border-t border-ink-900/10 bg-sand-100">
        <div className="wrap">
          <SplitHeading className="h1 mb-14 max-w-3xl">{d.home.mapTitle}</SplitHeading>
          <LibyaMap />
        </div>
      </section>

      {/* Quiz prompt */}
      <section className="bg-wheat-400/30">
        <Link href={href("/find-your-machine", lang)} className="wrap group flex flex-col justify-between gap-6 py-14 md:flex-row md:items-center">
          <p className="h1">{d.home.quizTitle}</p>
          <span className="inline-flex items-center gap-4 text-lg text-ink-900">
            {d.cta.takeQuiz}
            <span className="grid size-14 place-items-center rounded-lg bg-ink-900 text-white transition group-hover:bg-green-700">
              <IconArrow className="size-5" />
            </span>
          </span>
        </Link>
      </section>

      {/* News */}
      <section className="section-y bg-sand-50">
        <div className="wrap">
          <div className="grid gap-8 md:grid-cols-12 md:items-end">
            <SplitHeading className="h1 md:col-span-8">{d.home.newsTitle}</SplitHeading>
            <div className="md:col-span-4 md:text-end">
              <Pill href={href("/news", lang)}>{d.cta.viewAll}</Pill>
            </div>
          </div>
          <Reveal stagger={0.1} className="mt-12 grid gap-6 md:grid-cols-3">
            {posts.map((p) => (
              <Link key={p.slug} href={href(`/news/${p.slug}`, lang)} className="group block">
                <div className="relative aspect-[3/2] overflow-hidden rounded-lg bg-sand-200">
                  <Image src={p.cover} alt="" fill sizes="(max-width:768px) 90vw, 30vw" className="object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <p className="mt-3 text-[13px] text-ink-400">{p.date}</p>
                <p className="h3 mt-1 group-hover:text-green-700">{p.title[lang]}</p>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="sky-gradient relative overflow-hidden">
        <div className="wrap relative z-10 pt-36 pb-56 text-center md:pb-72">
          <SplitHeading className="display-xl mx-auto max-w-6xl">{d.home.closingTitle}</SplitHeading>
          <p className="lead mx-auto mt-8 max-w-xl text-ink-700">{d.home.closingLead}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <WhatsAppButton />
            <ContactButton variant="dark">{d.cta.inquire}</ContactButton>
          </div>
        </div>
        <GrowingCrops className="absolute inset-x-0 bottom-0 h-48 w-full md:h-64" density={90} seed={21} />
      </section>
    </>
  );
}
