import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale, href, locales } from "@/lib/i18n";
import { getDict } from "@/content/dict";
import { services } from "@/content/more";
import { branches } from "@/content/site";
import { ChapterHead } from "@/components/ui/ChapterHead";
import { LeafMark } from "@/components/motion/LeafMark";
import { LibyaMap } from "@/components/interactive/LibyaMap";
import { ContactButton, WhatsAppButton } from "@/components/contact/ContactButton";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/services">): Promise<Metadata> {
  const { lang } = await params;
  return { title: hasLocale(lang) ? getDict(lang).services.title : "Services" };
}

/*
 * Services in the same editorial layout as About: photo hero, then one numbered chapter per service
 * (green split, cream split flipped, blurred photo with a glass card), a round-photo chapter for the
 * branches, then the map and a closing call to action. Each service keeps its #id for deep links.
 */
const C = {
  en: {
    eyebrow: "Services",
    branchesT: "A team near every farm",
    branchesP: "Three branches, each with engineers, parts and a direct line.",
    ctaT: "Need a hand in the field?",
    ctaP: "Call your nearest branch or message us on WhatsApp. Tell us the machine and the problem and we'll get someone out to you.",
    planner: "Plan my farm",
  },
  ar: {
    eyebrow: "الخدمات",
    branchesT: "فريق قريب من كل مزرعة",
    branchesP: "ثلاثة فروع، لكلٍّ منها مهندسون وقطع غيار وخط مباشر.",
    ctaT: "تحتاج مساعدة في الحقل؟",
    ctaP: "اتصل بأقرب فرع أو راسلنا عبر واتساب. أخبرنا بالآلة والمشكلة وسنرسل من يساعدك.",
    planner: "خطّط لمزرعتي",
  },
};

export default async function ServicesPage({ params }: PageProps<"/[lang]/services">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDict(lang);
  const t = C[lang];
  const [s1, s2, s3] = services;

  const Points = ({ s, light }: { s: (typeof services)[number]; light?: boolean }) => (
    <ul className={`mt-8 divide-y border-y ${light ? "divide-sand-50/15 border-sand-50/15" : "divide-ink-900/10 border-ink-900/10"}`}>
      {s.points.map((pt, k) => (
        <li key={k} className="flex items-center gap-4 py-3.5 text-[16px]">
          <span aria-hidden className={`size-2 shrink-0 ${light ? "bg-green-300" : "bg-green-700"}`} />
          {pt[lang]}
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Hero */}
      <section data-tone="dark" className="relative isolate min-h-svh overflow-hidden bg-ink-900 text-sand-50">
        <Image src="/media/img/team-line.webp" alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-black/55 via-black/15 to-black/65" />
        <div className="wrap flex min-h-svh flex-col justify-between pt-32 pb-12 md:pt-40 md:pb-16">
          <div>
            <h1 className="max-w-[16ch] text-[clamp(40px,5.6vw,80px)] leading-[1.02] font-medium tracking-[-0.035em] text-balance">{d.services.title}</h1>
          </div>
          <p className="max-w-[460px] self-end text-[17px] leading-[1.5] text-pretty text-sand-50/90">{d.services.lead}</p>
        </div>
      </section>

      {/* 01: photo left, green panel right */}
      <section id={s1.id} data-tone="dark" className="grid scroll-mt-20 bg-green-900 text-sand-50 md:min-h-svh md:grid-cols-2">
        <div className="relative aspect-[4/3] md:aspect-auto">
          <Image src={s1.image} alt="" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
        </div>
        <div className="flex flex-col justify-between gap-16 px-[var(--gutter)] py-14 md:px-14 md:py-20">
          <ChapterHead n={1} title={s1.title[lang]} light />
          <div className="max-w-[520px]">
            <p className="text-[17px] leading-[1.55] text-sand-50/90">{s1.body[lang]}</p>
            <Points s={s1} light />
            <div className="mt-8">
              <ContactButton variant="light" topic={{ label: s1.title[lang], kind: "service" }}>{d.cta.inquire}</ContactButton>
            </div>
          </div>
        </div>
      </section>

      {/* 02: cream panel left, photo right */}
      <section id={s2.id} className="grid scroll-mt-20 bg-sand-50 md:min-h-svh md:grid-cols-2">
        <div className="relative aspect-[4/3] md:order-2 md:aspect-auto">
          <Image src={s2.image} alt="" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
        </div>
        <div className="flex flex-col justify-between gap-16 px-[var(--gutter)] py-14 md:px-14 md:py-20">
          <ChapterHead n={2} title={s2.title[lang]} />
          <div className="max-w-[520px]">
            <p className="text-[17px] leading-[1.55] text-ink-900/80">{s2.body[lang]}</p>
            <Points s={s2} />
            <div className="mt-8">
              <ContactButton topic={{ label: s2.title[lang], kind: "service" }}>{d.cta.inquire}</ContactButton>
            </div>
          </div>
        </div>
      </section>

      {/* 03: blurred photo, glass card, points */}
      <section id={s3.id} data-tone="dark" className="relative isolate scroll-mt-20 overflow-hidden bg-green-900 text-sand-50">
        <Image src={s3.image} alt="" fill sizes="100vw" className="-z-10 scale-110 object-cover blur-2xl" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-green-900/60" />
        <div className="wrap section-y md:min-h-svh md:content-center">
          <ChapterHead n={3} title={s3.title[lang]} light />
          <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-12 md:items-center">
            <div className="relative aspect-square w-[min(100%,320px)] overflow-hidden rounded-[28px] border border-sand-50/25 shadow-[inset_0_1px_0_rgba(255,255,255,.25)] md:col-span-4">
              <Image src={s3.image} alt="" fill sizes="320px" className="object-cover" />
              <div className="absolute inset-x-3 bottom-3 grid place-items-center rounded-[18px] border border-sand-50/25 bg-sand-50/15 py-4 backdrop-blur-md">
                <LeafMark light className="w-10" />
              </div>
            </div>
            <div className="max-w-[560px] md:col-span-7 md:col-start-6">
              <p className="text-[clamp(20px,1.8vw,26px)] leading-[1.4] font-light text-pretty">{s3.body[lang]}</p>
              <Points s={s3} light />
              <div className="mt-8">
                <ContactButton variant="light" topic={{ label: s3.title[lang], kind: "service" }}>{d.cta.inquire}</ContactButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 04: branches, round photos */}
      <section className="bg-sand-50">
        <div className="wrap section-y">
          <ChapterHead n={4} title={t.branchesT} />
          <p className="mt-6 max-w-[520px] text-[17px] leading-[1.55] text-ink-900/75">{t.branchesP}</p>
          <ul className="mt-14 grid gap-12 sm:grid-cols-3 md:mt-20 md:gap-10">
            {branches.map((b, i) => (
              <li key={b.id}>
                <div className="relative mx-auto aspect-square w-[min(100%,340px)] overflow-hidden rounded-full bg-sand-200">
                  <Image src={`/media/img/${["expo-team", "agronomist", "team-duo"][i]}.webp`} alt="" fill sizes="(max-width:640px) 80vw, 30vw" className="object-cover" />
                </div>
                <p className="mt-8 text-[20px] leading-tight font-medium text-green-900">{b.city[lang]}</p>
                <a dir="ltr" href={`tel:${b.phone}`} className="mt-2 inline-block py-1 font-mono text-[15px] text-ink-900/75 hover:text-green-700">
                  {b.phoneDisplay}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Map */}
      <section className="section-y border-t border-ink-900/10 bg-sand-100">
        <div className="wrap">
          <h2 className="h1 mb-14">{d.home.mapTitle}</h2>
          <LibyaMap />
        </div>
      </section>

      {/* Closing call to action */}
      <section data-tone="dark" className="bg-green-900 text-sand-50">
        <div className="wrap section-y grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <h2 className="text-[clamp(36px,4.6vw,72px)] leading-[1.02] font-medium tracking-[-0.03em] text-balance">{t.ctaT}</h2>
            <p className="mt-6 max-w-[520px] text-[17px] leading-[1.55] text-sand-50/85">{t.ctaP}</p>
          </div>
          <div className="flex flex-wrap gap-3 md:col-span-5 md:justify-end">
            <WhatsAppButton />
            <ContactButton variant="light">{d.cta.inquire}</ContactButton>
            <Link href={href("/find-your-machine", lang)} className="inline-flex h-12 items-center border border-sand-50/40 px-6 text-sand-50 transition hover:bg-sand-50 hover:text-ink-900">
              {t.planner} →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
