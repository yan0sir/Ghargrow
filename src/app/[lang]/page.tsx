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
import { SplitHeading } from "@/components/motion/Reveal";
import { ProvenGallery } from "@/components/scenes/ProvenGallery";
import { MiniPlanner } from "@/components/interactive/MiniPlanner";
import { galleryPhotos } from "@/lib/galleryPhotos";
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
              className="group flex items-center gap-4"
            >
              <Image src={brands[b].logo!} alt={brands[b].name} width={600} height={120} className="h-7 w-auto md:h-9" />
            </Link>
          ))}
          <Link href={href("/products/bale-handling", lang)} className="flex items-center">
            <Image src="/media/logo/arcusin.png" alt="Arcusin" width={948} height={384} className="h-14 w-auto md:h-20" />
          </Link>
        </div>
      </section>

      {/* Proven machinery: heading stays at the top while the copy and a strip of photos scroll sideways */}
      <ProvenGallery
        title={lang === "ar" ? "آلات مجرّبة،\nودعم محلي" : "Proven Machinery,\nLocal Support"}
        title2={lang === "ar" ? "نسلّم ونركّب ونصون، بفرقنا نحن." : "Delivered, set up and serviced by our own teams."}
        photos={galleryPhotos()}
        body={d.about.story}
        cta={d.cta.learnMore}
        ctaHref={href("/about", lang)}
      />

      {/* The 3D journey: from sand to harvest */}
      <FarmStory />

      {/* Machines — KERN-style pinned showcase: category photo left, product cards sliding in on the right */}
      <MachineShowcase />

      {/* Aftersales: label left, heading + lead offset, three tall photo cards split by thin rules */}
      <section className="bg-sand-50">
        <div className="wrap section-y">
          <div>
              <SplitHeading className="h2 font-light!">
                {lang === "ar" ? "نبقى في الحقل بعد البيع" : "We Stay in the Field After the Sale"}
              </SplitHeading>
              <p className="mt-6 max-w-[660px] text-[17px] leading-[1.4] text-pretty text-ink-900/70">
                {lang === "ar"
                  ? "تدريب على المعدات، وصيانة دورية، وقطع غيار أصلية، ومهندسون جاهزون للاستجابة في كل فروعنا في ليبيا."
                  : "Operator training, scheduled maintenance, genuine parts and engineers on call from every one of our branches across Libya."}
              </p>
          </div>
          <div className="mt-14 grid border-b border-ink-900/15 md:mt-20 md:grid-cols-3">
            {services.map((s, i) => (
              <Link
                key={s.id}
                href={href(`/services#${s.id}`, lang)}
                className={`group block pb-12 md:pb-14 ${i ? "mt-10 md:mt-0 md:border-s md:border-ink-900/15 md:ps-7" : ""} ${i < services.length - 1 ? "md:pe-7" : ""}`}
              >
                <div className="relative aspect-[426/479] overflow-hidden rounded-[3px] md:aspect-auto md:h-[min(34vw,600px)]">
                  <Image src={s.image} alt="" fill sizes="(max-width:768px) 90vw, 30vw" className="object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <p className="mt-8 text-[20px] leading-tight text-ink-900 group-hover:text-green-700">{s.title[lang]}</p>
                <p className="mt-4 max-w-[400px] text-[17px] leading-[1.4] text-pretty text-ink-900/70">{s.short[lang]}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Farm planner teaser: answer a few questions, get a product list with quantities, send it on WhatsApp */}
      <section data-tone="dark" className="bg-green-900 text-sand-50">
        <div className="wrap section-y grid gap-12 md:grid-cols-12 md:items-center">
          <div className="md:col-span-6">
            <SplitHeading className="h2 text-sand-50!">
              {lang === "ar" ? "لست متأكداً مما تحتاجه أرضك؟" : "Not Sure What Your Land Needs?"}
            </SplitHeading>
            <p className="mt-6 max-w-[520px] text-[17px] leading-[1.45] text-pretty text-sand-50/75">
              {lang === "ar"
                ? "أجب عن خمسة أسئلة عن أرضك، واحصل على قائمة بالمعدات والكميات المقترحة، ثم أرسلها لفريقنا عبر واتساب."
                : "Answer five questions about your land and get a list of the equipment and quantities you need, then send it to our team on WhatsApp."}
            </p>
            <Link
              href={href("/find-your-machine", lang)}
              className="mt-10 inline-flex h-14 items-center gap-3 bg-green-300 px-8 text-[16px] text-ink-900 transition hover:bg-sand-50"
            >
              {lang === "ar" ? "المخطط الكامل" : "Open the full planner"} <IconArrow className="size-5" />
            </Link>
          </div>
          <div className="md:col-span-6">
            <MiniPlanner />
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
          {/* same card style as Aftersales: photo, title, short text, split by thin rules */}
          <div className="mt-14 grid border-b border-ink-900/15 md:mt-20 md:grid-cols-3">
            {posts.slice(0, 3).map((p, i) => (
              <Link
                key={p.slug}
                href={href(`/news/${p.slug}`, lang)}
                className={`group block pb-12 md:pb-14 ${i ? "mt-10 md:mt-0 md:border-s md:border-ink-900/15 md:ps-7" : ""} ${i < 2 ? "md:pe-7" : ""}`}
              >
                <div className="relative aspect-[426/479] overflow-hidden rounded-[3px] md:aspect-auto md:h-[min(34vw,600px)]">
                  <Image src={p.cover} alt="" fill sizes="(max-width:768px) 90vw, 30vw" className="object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <p className="mt-8 font-mono text-[12px] tracking-[0.12em] text-ink-900/50">{p.date}</p>
                <p className="mt-2 text-[20px] leading-tight text-ink-900 group-hover:text-green-700">{p.title[lang]}</p>
                <p className="mt-4 max-w-[400px] text-[17px] leading-[1.4] text-pretty text-ink-900/70">{p.excerpt[lang]}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA over a CLAAS JAGUAR harvest clip */}
      <section data-tone="dark" className="relative overflow-hidden bg-ink-900 text-white">
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
