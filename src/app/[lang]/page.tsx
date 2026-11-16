import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale, href } from "@/lib/i18n";
import { getDict } from "@/content/dict";
import { brands, products } from "@/content/catalog";
import { services, projects, posts } from "@/content/more";
import { HeroTractor } from "@/components/scenes/HeroTractor";
import { FieldJourney } from "@/components/scenes/FieldJourney";
import { AttachmentSwap } from "@/components/scenes/AttachmentSwap";
import { FrameScrub } from "@/components/scenes/FrameScrub";
import { PivotSimulator } from "@/components/interactive/PivotSimulator";
import { LibyaMap } from "@/components/interactive/LibyaMap";
import { Reveal, SplitHeading } from "@/components/motion/Reveal";
import { GrowingCrops } from "@/components/motion/GrowingCrops";
import { ProductCard } from "@/components/ui/ProductCard";
import { Rail } from "@/components/ui/Rail";
import { Btn } from "@/components/ui/Btn";
import { ContactButton, WhatsAppButton } from "@/components/contact/ContactButton";
import { IconArrow } from "@/components/ui/Icons";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDict(lang);
  const featured = products.filter((p) => p.flagship);

  return (
    <>
      <HeroTractor />

      {/* Name / mission — ZettaJoule dictionary device */}
      <section className="relative overflow-hidden bg-sand-50">
        <div className="wrap section-y grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
          </div>
          <div className="md:col-span-7">
            <p className="display">{lang === "ar" ? "غرغار" : "Ghargrow"}</p>
            <p className="mt-4 flex items-baseline gap-4 font-mono text-sm text-ink-400">
              <span dir="ltr">{d.home.namePron}</span>
              <em className="not-italic">{d.home.nameNoun}</em>
            </p>
            <SplitHeading as="p" className="h2 mt-10 max-w-3xl text-ink-700!">
              {d.home.nameDef}
            </SplitHeading>
          </div>
        </div>
        <GrowingCrops className="h-32 w-full text-green-700 md:h-44" density={64} />
      </section>

      {/* Partners */}
      <section className="border-y border-ink-900/10 bg-sand-50">
        <div className="wrap flex flex-col items-start gap-8 py-10 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-14 gap-y-6">
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
        </div>
      </section>

      <FieldJourney />

      <AttachmentSwap />

      <FrameScrub name="pass" frames={70} step={2} poster="/media/seq/pass/d/0001.webp" length="+=140%">
        <div className="absolute inset-x-0 bottom-0 wrap pb-[10vh] text-white">
          <p className="display mt-4 max-w-4xl text-white!">{d.home.driveTitle}</p>
        </div>
      </FrameScrub>

      {/* Irrigation spotlight + simulator */}
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
        <div className="wrap pt-10 pb-28">
          <p className="lead mb-12 max-w-xl text-white/75">{d.home.irrigationLead}</p>
          <PivotSimulator dark />
        </div>
      </section>

      {/* Featured machines */}
      <section className="section-y bg-sand-50">
        <div className="wrap">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SplitHeading className="h1">{d.home.featured}</SplitHeading>
            <Btn href={href("/products", lang)} variant="ghost">
              {d.nav.allProducts}
            </Btn>
          </div>
          <div className="mt-10">
            <Rail label={d.home.featured}>
              {featured.map((p) => (
                <div key={p.slug} className="w-[82vw] shrink-0 snap-start sm:w-[46vw] lg:w-[31vw]">
                  <ProductCard p={p} lang={lang} size="lg" />
                </div>
              ))}
            </Rail>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-green-900 text-white/80">
        <div className="wrap section-y">
          <div className="grid gap-8 md:grid-cols-12">
            <SplitHeading className="h1 text-white! md:col-span-8">{d.home.servicesTitle}</SplitHeading>
          </div>
          <div className="mt-20 divide-y divide-white/15 border-y border-white/15">
            {services.map((s) => (
              <Link key={s.id} href={href(`/services#${s.id}`, lang)} className="group grid items-center gap-6 py-8 md:grid-cols-12">
                <span className="font-mono text-sm text-green-300 md:col-span-1">{s.num}</span>
                <span className="h2 text-white! transition group-hover:translate-x-2 md:col-span-5 rtl:group-hover:-translate-x-2">{s.title[lang]}</span>
                <span className="text-white/70 md:col-span-4">{s.body[lang]}</span>
                <span className="relative hidden aspect-[4/3] overflow-hidden md:col-span-2 md:block">
                  <Image src={s.image} alt="" fill sizes="16vw" className="object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Projects — Noho-style editorial grid */}
      <section className="section-y bg-sand-50">
        <div className="wrap">
          <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
            <SplitHeading className="h1 max-w-3xl">{d.home.projectsTitle}</SplitHeading>
            <Btn href={href("/projects", lang)} variant="ghost">
              {d.projects.all}
            </Btn>
          </div>
          <Reveal stagger={0.12} className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-12 md:gap-6">
            {projects.map((p, i) => (
              <Link
                key={p.slug}
                href={href(`/projects/${p.slug}`, lang)}
                className={`group block ${i === 0 ? "col-span-2 md:col-span-5 md:col-start-2 md:row-span-2" : i === 1 ? "md:col-span-3 md:col-start-8 md:mt-24" : "md:col-span-3 md:col-start-8"}`}
              >
                <div className={`relative overflow-hidden bg-sand-200 ${i === 0 ? "aspect-[4/3] md:aspect-[5/6]" : "aspect-[4/5]"}`}>
                  <Image src={p.cover} alt="" fill sizes="(max-width:768px) 50vw, 40vw" className="object-cover transition duration-1000 group-hover:scale-105" />
                </div>
                <p className="eyebrow mt-4 text-ink-400">
                  {p.type[lang]} · {p.place[lang]}
                </p>
                <p className="h3 mt-1 group-hover:text-green-700">{p.title[lang]}</p>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Map */}
      <section className="section-y border-t border-ink-900/10 bg-sand-100">
        <div className="wrap">
          <SplitHeading className="h1 mt-4 mb-14 max-w-3xl">{d.home.mapTitle}</SplitHeading>
          <LibyaMap />
        </div>
      </section>

      {/* Quiz prompt */}
      <section className="bg-wheat-400/30">
        <Link href={href("/find-your-machine", lang)} className="wrap group flex flex-col justify-between gap-6 py-14 md:flex-row md:items-center">
          <p className="h1">{d.home.quizTitle}</p>
          <span className="inline-flex items-center gap-4 text-lg text-ink-900">
            {d.cta.takeQuiz}
            <span className="grid size-14 place-items-center bg-ink-900 text-white transition group-hover:bg-green-700">
              <IconArrow className="size-5" />
            </span>
          </span>
        </Link>
      </section>

      {/* News */}
      <section className="section-y bg-sand-50">
        <div className="wrap">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SplitHeading className="h1">{d.home.newsTitle}</SplitHeading>
            <Btn href={href("/news", lang)} variant="ghost">
              {d.cta.viewAll}
            </Btn>
          </div>
          <Reveal stagger={0.1} className="mt-12 grid gap-8 md:grid-cols-3">
            {posts.map((p) => (
              <Link key={p.slug} href={href(`/news/${p.slug}`, lang)} className="group block">
                <div className="relative aspect-[3/2] overflow-hidden bg-sand-200">
                  <Image src={p.cover} alt="" fill sizes="(max-width:768px) 90vw, 30vw" className="object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <p className="eyebrow mt-4 text-ink-400">{p.date}</p>
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
