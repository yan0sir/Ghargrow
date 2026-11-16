import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale, href, locales } from "@/lib/i18n";
import { getDict } from "@/content/dict";
import { brands } from "@/content/catalog";
import { SplitHeading, Reveal } from "@/components/motion/Reveal";
import { GrowingCrops } from "@/components/motion/GrowingCrops";
import { LeafMark } from "@/components/motion/LeafMark";
import { LibyaMap } from "@/components/interactive/LibyaMap";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  return { title: hasLocale(lang) ? getDict(lang).nav.about : "About" };
}

/** Inline photo inside a sentence (Noho device). */
const Pic = ({ src }: { src: string }) => (
  <span className="relative mx-[0.15em] inline-block h-[0.8em] w-[1.6em] translate-y-[0.08em] overflow-hidden align-baseline">
    <Image src={src} alt="" fill sizes="120px" className="object-cover" />
  </span>
);

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDict(lang);
  const ar = lang === "ar";
  return (
    <>
      <section className="sky-gradient">
        <div className="wrap pt-36 pb-24 md:pt-44">
          <p className="eyebrow text-green-700">{d.nav.about}</p>
          <h1 className="display mt-6 max-w-6xl">
            {ar ? (
              <>
                نزرع <Pic src="/media/img/pivot-circles.webp" /> من أجل النجاح، بمعدات <Pic src="/media/img/axion-road.webp" /> موثوقة وري
                <Pic src="/media/img/pivot-spray.webp" /> ذكي وفريق <Pic src="/media/img/team-line.webp" /> يبقى في الحقل.
              </>
            ) : (
              <>
                We grow <Pic src="/media/img/pivot-circles.webp" /> for success — with reliable machines <Pic src="/media/img/axion-road.webp" />, smart
                irrigation <Pic src="/media/img/pivot-spray.webp" /> and a team <Pic src="/media/img/team-line.webp" /> that stays in the field.
              </>
            )}
          </h1>
        </div>
      </section>

      <section className="section-y">
        <div className="wrap grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="relative aspect-[9/16] max-h-[80svh] overflow-hidden bg-sand-200">
              <video className="absolute inset-0 size-full object-cover" src="/media/video/hq-drone.mp4" poster="/media/video/hq-drone.webp" autoPlay muted loop playsInline />
            </div>
          </div>
          <div className="flex flex-col justify-center md:col-span-6 md:col-start-7">
            <p className="eyebrow text-green-700">{site_name(lang)}</p>
            <SplitHeading className="h1 mt-4">{d.about.lead}</SplitHeading>
            <p className="lead mt-8">{d.about.story}</p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-green-900 text-white">
        <div className="wrap section-y grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <LeafMark light className="w-24" />
            <p className="eyebrow mt-8 text-green-300">{d.about.missionEyebrow}</p>
          </div>
          <SplitHeading as="p" className="h1 text-white! md:col-span-8">
            {d.about.mission}
          </SplitHeading>
        </div>
        <GrowingCrops className="h-40 w-full text-green-700" tone="dark" density={80} seed={3} />
      </section>

      <section className="section-y">
        <div className="wrap">
          <h2 className="h1">{d.about.values}</h2>
          <Reveal stagger={0.1} className="mt-12 grid gap-px bg-ink-900/10 md:grid-cols-3">
            {d.values.map((v, i) => (
              <div key={v.t} className="bg-sand-50 p-8 md:p-10">
                <p className="font-mono text-sm text-green-700">0{i + 1}</p>
                <p className="h2 mt-6">{v.t}</p>
                <p className="mt-4">{v.d}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section-y border-t border-ink-900/10 bg-sand-100">
        <div className="wrap">
          <h2 className="h1">{d.about.brandsTitle}</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {(["claas", "western", "arcusin"] as const).map((b) => (
              <Link
                key={b}
                href={href(`/products/${b === "claas" ? "tractors-machinery" : b === "western" ? "irrigation" : "bale-handling"}`, lang)}
                className="group flex min-h-64 flex-col justify-between bg-sand-50 p-8 transition hover:bg-white"
              >
                {brands[b].logo ? (
                  <Image src={brands[b].logo!} alt={brands[b].name} width={600} height={120} className="h-9 w-auto self-start" />
                ) : (
                  <span className="font-display text-3xl font-medium tracking-[0.2em] text-ink-900">ARCUSIN</span>
                )}
                <div>
                  <p className="eyebrow text-green-700">{brands[b].role[lang]}</p>
                  <p className="mt-2">{brands[b].blurb[lang]}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="wrap">
          <h2 className="h1 mb-12">{d.about.teamTitle}</h2>
          <Reveal stagger={0.08} className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {["team-line", "team-field", "team-duo", "agronomist", "expo-team", "expo-team-2", "signing-2", "expo-film"].map((n, i) => (
              <div key={n} className={`relative overflow-hidden bg-sand-200 ${i === 0 ? "col-span-2 aspect-[16/9]" : "aspect-[4/5]"}`}>
                <Image src={`/media/img/${n}.webp`} alt="" fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover" />
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section-y border-t border-ink-900/10 bg-sand-100">
        <div className="wrap">
          <p className="eyebrow text-green-700">{d.home.mapEyebrow}</p>
          <h2 className="h1 mt-4 mb-14">{d.home.mapTitle}</h2>
          <LibyaMap />
        </div>
      </section>
    </>
  );
}

function site_name(lang: "en" | "ar") {
  return lang === "ar" ? "غرغار للاستثمار الزراعي" : "Ghargrow Agro-Industries";
}
