import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale, href, locales } from "@/lib/i18n";
import { getDict } from "@/content/dict";
import { brands } from "@/content/catalog";
import { ChapterHead } from "@/components/ui/ChapterHead";
import { LeafMark } from "@/components/motion/LeafMark";
import { LibyaMap } from "@/components/interactive/LibyaMap";
import { ContactButton, WhatsAppButton } from "@/components/contact/ContactButton";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  return { title: hasLocale(lang) ? getDict(lang).nav.about : "About" };
}

/*
 * About, laid out as an editorial story (Farm Minerals "Approach" structure): a full-bleed photo hero,
 * then numbered chapters that alternate photo half / colour half, a row of round photos, a blurred-photo
 * chapter with a glass card, a photo with figures over it, and the branch map to close.
 * Every chapter reads top-to-bottom in DOM order, so it works without any scroll effects.
 */
const C = {
  en: {
    eyebrow: "About us",
    ch: [
      {
        t: "We started in the field",
        p: [
          "Ghargrow began with Libyan farmers and the problems they face every season: sand, heat, scarce water and machines that are hard to service far from the city.",
          "So we built the company around the field, not the showroom. Every machine we sell, we deliver, set up and stand behind.",
        ],
      },
      {
        t: "Where proven machines meet local land",
        p: [
          "We partner with manufacturers who have proven themselves over decades: CLAAS for tractors and harvesters, Western for centre pivot irrigation, Arcusin for bale handling.",
          "Then we adapt them to Libyan conditions, with the right setup, the right parts on the shelf and operators trained on site.",
        ],
      },
      {
        t: "What we stand for",
      },
      {
        t: "We stay after the sale",
        p: [
          "Training, scheduled maintenance, genuine parts and engineers on call from Benghazi, Sabha and Jalu.",
          "A machine is only as good as the support behind it, so our work starts when the delivery truck leaves.",
        ],
      },
      { t: "Building trust, one farm at a time" },
    ],
    stats: [
      ["3", "branches across Libya"],
      ["3", "global partner brands"],
      ["4", "product ranges"],
    ],
    brandsLead: "The brands we represent, with full after-sales support in Libya.",
    mapTitle: "Three branches. One call away.",
    ctaT: "Let's talk about your land",
    ctaP: "Tell us what you grow and how big your farm is. We'll suggest the right equipment and visit your site.",
    planner: "Plan my farm",
  },
  ar: {
    eyebrow: "من نحن",
    ch: [
      {
        t: "بدأنا من الحقل",
        p: [
          "بدأت غرغار مع المزارعين الليبيين ومع ما يواجهونه كل موسم: الرمال والحرارة وندرة المياه، ومعدات يصعب صيانتها بعيداً عن المدن.",
          "لذلك بنينا الشركة حول الحقل لا حول صالة العرض. كل آلة نبيعها، نسلّمها ونركّبها ونقف خلفها.",
        ],
      },
      {
        t: "حيث تلتقي المعدات المجرّبة بالأرض المحلية",
        p: [
          "نتعاون مع مصنّعين أثبتوا جدارتهم لعقود: CLAAS للجرارات والحصادات، وWestern لأنظمة الري المحوري، وArcusin لمناولة البالات.",
          "ثم نهيّئها لظروف ليبيا، بالإعداد الصحيح وقطع الغيار المتوفرة ومشغّلين مدرَّبين في الموقع.",
        ],
      },
      { t: "ما نؤمن به" },
      {
        t: "نبقى بعد البيع",
        p: [
          "تدريب وصيانة دورية وقطع غيار أصلية ومهندسون جاهزون من بنغازي وسبها وجالو.",
          "قيمة الآلة بقدر الدعم الذي خلفها، لذلك يبدأ عملنا حين تغادر شاحنة التسليم.",
        ],
      },
      { t: "نبني الثقة، مزرعة بعد مزرعة" },
    ],
    stats: [
      ["3", "فروع في ليبيا"],
      ["3", "علامات عالمية شريكة"],
      ["4", "فئات منتجات"],
    ],
    brandsLead: "العلامات التي نمثّلها، مع دعم كامل لما بعد البيع في ليبيا.",
    mapTitle: "ثلاثة فروع. اتصال واحد.",
    ctaT: "لنتحدث عن أرضك",
    ctaP: "أخبرنا بما تزرعه وبمساحة مزرعتك، وسنقترح المعدات المناسبة ونزور موقعك.",
    planner: "خطّط لمزرعتي",
  },
};

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDict(lang);
  const t = C[lang];

  return (
    <>
      {/* Hero: full-bleed field photo, statement top-left, story bottom-right */}
      <section data-tone="dark" className="relative isolate min-h-svh overflow-hidden bg-ink-900 text-sand-50">
        <Image src="/media/img/field-aerial.webp" alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-black/55 via-black/15 to-black/60" />
        <div className="wrap flex min-h-svh flex-col justify-between pt-32 pb-12 md:pt-40 md:pb-16">
          <div>
            <h1 className="max-w-[16ch] text-[clamp(40px,5.6vw,80px)] leading-[1.02] font-medium tracking-[-0.035em] text-balance">{d.about.lead}</h1>
          </div>
          <p className="max-w-[460px] self-end text-[17px] leading-[1.5] text-pretty text-sand-50/90">{d.about.story}</p>
        </div>
      </section>

      {/* 01: photo left, green panel right */}
      <section data-tone="dark" className="grid bg-green-900 text-sand-50 md:min-h-svh md:grid-cols-2">
        <div className="relative aspect-[4/3] md:aspect-auto">
          <Image src="/media/img/team-field.webp" alt="Ghargrow team in a farm field" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
        </div>
        <div className="flex flex-col justify-between gap-16 px-[var(--gutter)] py-14 md:px-14 md:py-20">
          <ChapterHead n={1} title={t.ch[0].t} light />
          <div className="max-w-[520px] space-y-4 text-[17px] leading-[1.55] text-sand-50/90">
            {t.ch[0].p!.map((x) => (
              <p key={x}>{x}</p>
            ))}
          </div>
        </div>
      </section>

      {/* 02: cream panel left, photo right */}
      <section className="grid bg-sand-50 md:min-h-svh md:grid-cols-2">
        <div className="relative aspect-[4/3] md:order-2 md:aspect-auto">
          <Image src="/media/img/pivot-spray.webp" alt="Western centre pivot irrigating a field" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
        </div>
        <div className="flex flex-col justify-between gap-16 px-[var(--gutter)] py-14 md:px-14 md:py-20">
          <ChapterHead n={2} title={t.ch[1].t} />
          <div className="max-w-[520px] space-y-4 text-[17px] leading-[1.55] text-ink-900/80">
            {t.ch[1].p!.map((x) => (
              <p key={x}>{x}</p>
            ))}
          </div>
        </div>
      </section>

      {/* 03: values, three round photos with captions */}
      <section className="border-t border-ink-900/10 bg-sand-50">
        <div className="wrap section-y">
          <ChapterHead n={3} title={t.ch[2].t} />
          <ul className="mt-14 grid gap-12 sm:grid-cols-3 md:mt-20 md:gap-10">
            {d.values.map((v, i) => (
              <li key={v.t}>
                <div className="relative mx-auto aspect-square w-[min(100%,340px)] overflow-hidden rounded-full bg-sand-200">
                  <Image src={`/media/img/${["agronomist", "team-duo", "icontrol-field"][i]}.webp`} alt="" fill sizes="(max-width:640px) 80vw, 30vw" className="object-cover" />
                </div>
                <p className="mt-8 text-[20px] leading-tight font-medium text-green-900">{v.t}</p>
                <p className="mt-3 max-w-[360px] text-[16px] leading-[1.55] text-ink-900/75">{v.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 04: blurred field photo, glass card with the leaf mark, mission */}
      <section data-tone="dark" className="relative isolate overflow-hidden bg-green-900 text-sand-50">
        <Image src="/media/img/claas-field.webp" alt="" fill sizes="100vw" className="-z-10 scale-110 object-cover blur-2xl" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-green-900/55" />
        <div className="wrap section-y md:min-h-svh md:content-center">
          <ChapterHead n={4} title={t.ch[3].t} light />
          <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-12 md:items-center">
            <div className="grid aspect-square w-[min(100%,300px)] place-items-center rounded-[28px] border border-sand-50/25 bg-sand-50/10 shadow-[inset_0_1px_0_rgba(255,255,255,.25)] backdrop-blur-md md:col-span-4">
              <LeafMark light className="w-24" />
            </div>
            <div className="grid gap-8 text-[17px] leading-[1.55] text-sand-50/90 sm:grid-cols-2 md:col-span-7 md:col-start-6">
              {t.ch[3].p!.map((x) => (
                <p key={x}>{x}</p>
              ))}
            </div>
          </div>
          <p className="mt-16 max-w-[900px] text-[clamp(22px,2.2vw,32px)] leading-[1.3] font-light text-pretty md:mt-24">{d.about.mission}</p>
        </div>
      </section>

      {/* 05: photo with figures over it, brands on the cream side */}
      <section className="grid bg-sand-50 md:min-h-svh md:grid-cols-2">
        <div data-tone="dark" className="relative isolate min-h-[70svh] overflow-hidden text-sand-50 md:min-h-0">
          <Image src="/media/img/combine-field.webp" alt="CLAAS combine harvesting" fill sizes="(max-width:768px) 100vw, 50vw" className="-z-10 object-cover" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <dl className="absolute inset-x-0 bottom-0 grid grid-cols-3 gap-4 p-[var(--gutter)] md:p-12">
            {t.stats.map(([n, l]) => (
              <div key={l}>
                <dt className="sr-only">{l}</dt>
                <dd className="font-display text-[clamp(44px,5vw,72px)] leading-none font-medium">{n}</dd>
                <dd className="mt-2 text-[14px] leading-snug text-sand-50/85">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex flex-col justify-between gap-14 px-[var(--gutter)] py-14 md:px-14 md:py-20">
          <ChapterHead n={5} title={t.ch[4].t} />
          <div>
            <p className="max-w-[460px] text-[17px] leading-[1.55] text-ink-900/80">{t.brandsLead}</p>
            <ul className="mt-8 divide-y divide-ink-900/10 border-y border-ink-900/10">
              {(["claas", "western", "arcusin"] as const).map((b) => (
                <li key={b}>
                  <Link
                    href={href(`/products/${b === "claas" ? "tractors-machinery" : b === "western" ? "irrigation" : "bale-handling"}`, lang)}
                    className="group flex min-h-24 items-center justify-between gap-6 py-4"
                  >
                    <Image src={brands[b].logo!} alt={brands[b].name} width={600} height={120} className={`${b === "arcusin" ? "h-14" : "h-7"} w-auto`} />
                    <span className="text-end text-[14px] text-ink-900/65 transition-colors group-hover:text-green-700">{brands[b].role[lang]} →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Branches */}
      <section className="section-y border-t border-ink-900/10 bg-sand-100">
        <div className="wrap">
          <h2 className="h1 mb-14">{t.mapTitle}</h2>
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
            <Link href={href("/find-your-machine", lang)} className="inline-flex h-12 items-center bg-green-300 px-6 text-ink-900 transition hover:bg-sand-50">
              {t.planner} →
            </Link>
            <WhatsAppButton />
            <ContactButton variant="light">{d.cta.inquire}</ContactButton>
          </div>
        </div>
      </section>
    </>
  );
}
