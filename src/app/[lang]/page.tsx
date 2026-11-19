import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale, href } from "@/lib/i18n";
import { getDict } from "@/content/dict";
import { brands } from "@/content/catalog";
import { services, posts } from "@/content/more";
import { HeroReveal } from "@/components/scenes/HeroReveal";
import { MachineShowcase } from "@/components/scenes/MachineShowcase";
import { FarmStory } from "@/components/farm/FarmStory";
import { LibyaMap } from "@/components/interactive/LibyaMap";
import { Reveal, SplitHeading } from "@/components/motion/Reveal";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
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

      {/* ZettaJoule "duck egg" section: light heading left, copy + icon button right, wide parallax image with a dark info card */}
      <section className="section-y bg-[#f1f5f8]">
        <div className="wrap">
          <div className="grid gap-8 md:grid-cols-12">
            <SplitHeading className="text-[clamp(34px,4.2vw,60px)]! leading-none! font-[250]! tracking-[-0.03em] whitespace-pre-line text-black md:col-span-5">
              {lang === "ar" ? "آلات مجرّبة،\nودعم محلي" : "Proven Machinery,\nLocal Support"}
            </SplitHeading>
            <div className="md:col-span-4 md:col-start-9">
              <p className="text-[clamp(15px,1.25vw,18px)] leading-[1.3] text-pretty text-[#524f4b]">{d.about.story}</p>
              <Link
                href={href("/about", lang)}
                className="group mt-7 inline-flex h-12 items-stretch overflow-hidden rounded-[3px] text-[15px] font-medium text-black"
              >
                <span className="grid w-12 place-items-center bg-[#d7ecb4] transition-colors group-hover:bg-green-700 group-hover:text-white">
                  <IconArrow className="size-4" />
                </span>
                <span className="flex items-center border border-s-0 border-black/15 px-4 transition-colors group-hover:border-black/40">
                  {d.cta.learnMore}
                </span>
              </Link>
            </div>
          </div>

          <div className="relative mx-auto mt-12 aspect-[4/5] overflow-hidden rounded-[3px] bg-[#dfe6ea] md:aspect-[952/623] md:w-[80%]">
            <ParallaxImage src="/media/img/claas-field.webp" alt="CLAAS AXION tractor with front and side mowers cutting alfalfa" sizes="(max-width:768px) 100vw, 92vw" />
            <div className="absolute inset-x-4 bottom-4 md:inset-x-auto md:start-6 md:bottom-6 md:w-[min(440px,34%)]">
              <div className="rounded-[3px] bg-black p-5 text-[#cfcdc9] md:p-6">
                <p className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.14em] text-white uppercase">
                  <span className="size-2 rounded-full bg-[#c6f35c]" />
                  {lang === "ar" ? "في الحقل، معك" : "In the field, with you"}
                </p>
                <p className="mt-4 text-[15px] leading-[1.35] text-pretty">
                  {lang === "ar"
                    ? "من الحشّ إلى الري، تُسلَّم كل آلة وتُجهَّز وتُصان على أيدي فرقنا في بنغازي وسبها وجالو."
                    : "From mowing to irrigation, every machine is delivered, set up and serviced by our own teams in Benghazi, Sabha and Jalu."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 3D journey: from sand to harvest */}
      <FarmStory />

      {/* Machines — KERN-style pinned showcase: category photo left, product cards sliding in on the right */}
      <MachineShowcase />

      {/* Aftersales — title left, description right, ZettaJoule industry cards below */}
      <section className="bg-[#1d211c] text-white">
        <div className="wrap section-y">
          <div className="grid gap-8 md:grid-cols-12 md:items-start">
            <SplitHeading className="h1 text-white! md:col-span-5">{lang === "ar" ? "خدمة ما بعد البيع" : "Aftersales"}</SplitHeading>
            <div className="md:col-span-5 md:col-start-8">
              <p className="text-[clamp(16px,1.3vw,19px)] leading-[1.4] text-pretty text-white/75">
                {lang === "ar"
                  ? "نبقى في الحقل بعد البيع: تدريب على المعدات، وصيانة دورية، وقطع غيار أصلية، ومهندسون جاهزون للاستجابة في كل فروعنا في ليبيا."
                  : "We stay in the field after the sale: operator training, scheduled maintenance, genuine parts and engineers on call from every one of our branches across Libya."}
              </p>
              <div className="mt-6">
                <Pill href={href("/services", lang)} light>
                  {d.nav.services}
                </Pill>
              </div>
            </div>
          </div>
          <div className="mt-12 [&_button]:border-white/25 [&_button]:text-white">
            <Rail label={d.nav.services}>
              {services.map((s) => (
                <Link
                  key={s.id}
                  href={href(`/services#${s.id}`, lang)}
                  className="group flex w-[82vw] shrink-0 snap-start flex-col bg-green-900 p-3.5 sm:w-[420px] md:min-h-[600px]"
                >
                  {/* photo inset in the card, ZettaJoule news-card style */}
                  <div className="relative aspect-[61/38] w-full overflow-hidden">
                    <Image src={s.image} alt="" fill sizes="(max-width:640px) 82vw, 400px" className="object-cover transition duration-700 group-hover:scale-105" />
                  </div>
                  <div className="flex flex-1 flex-col justify-end px-4 pt-16 pb-4 md:px-5">
                    <p className="flex items-center gap-6 text-[13px] font-medium tracking-[0.12em] uppercase">
                      <span className="text-sand-50">{lang === "ar" ? "خدمة" : "Service"}</span>
                      <span className="text-green-300">{s.num}</span>
                    </p>
                    <div className="mt-5 flex items-end justify-between gap-6">
                      <p className="text-[clamp(24px,2.1vw,30px)] leading-[1.12] font-semibold tracking-[-0.02em] text-sand-50">{s.title[lang]}</p>
                      <span className="grid size-[60px] shrink-0 place-items-center bg-green-300 text-green-900 transition-colors group-hover:bg-sand-50">
                        <IconArrow className="size-6 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </Rail>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="section-y border-t border-ink-900/10 bg-sand-100">
        <div className="wrap">
          <SplitHeading className="h1 mb-12 max-w-3xl">{d.home.mapTitle}</SplitHeading>
          <LibyaMap />
        </div>
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

      {/* Closing CTA over a CLAAS JAGUAR harvest clip */}
      <section className="relative overflow-hidden bg-ink-900 text-white">
        <video
          className="absolute inset-0 size-full object-cover"
          src="/media/video/jaguar-harvest.mp4"
          poster="/media/video/jaguar-harvest.webp"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/45 via-ink-900/35 to-ink-900/70" />
        <div className="wrap section-y relative z-10 text-center">
          <SplitHeading className="display-xl mx-auto max-w-6xl text-white!">{d.home.closingTitle}</SplitHeading>
          <p className="lead mx-auto mt-8 max-w-xl text-white/85">{d.home.closingLead}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <WhatsAppButton />
            <ContactButton variant="light">{d.cta.inquire}</ContactButton>
          </div>
        </div>
      </section>
    </>
  );
}
