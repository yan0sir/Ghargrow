"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "@/lib/gsap";
import { useSite } from "@/components/providers/SiteProvider";
import { findProduct, productHref } from "@/content/catalog";
import { branches } from "@/content/site";
import { href } from "@/lib/i18n";
import { Stepper, useCart } from "@/components/cart/Cart";
import { IconArrow, IconPhone } from "@/components/ui/Icons";

/*
 * Farm planner: a few questions about the land (what they want to do, crop, size in hectares, water,
 * region), then a list of products with suggested quantities. Every line can be adjusted and the
 * whole list goes into the enquiry cart, which is sent to sales on WhatsApp.
 * The sizing rules below are rough planning figures, not quotes; the result says so.
 */
type Lang = "en" | "ar";
type Answers = { goals: string[]; crop?: string; ha: number; water?: string; region?: string };
type Line = { slug: string; qty: number; why: { en: string; ar: string } };

const GOALS = [
  { id: "irrigate", en: "Irrigate my land", ar: "ري أرضي" },
  { id: "till", en: "Till, sow & haul", ar: "الحراثة والزراعة والنقل" },
  { id: "forage", en: "Cut & bale forage", ar: "حشّ وكبس الأعلاف" },
  { id: "grain", en: "Harvest grain", ar: "حصاد الحبوب" },
  { id: "inputs", en: "Seed & fertilizer", ar: "البذور والأسمدة" },
];
const CROPS = [
  { id: "alfalfa", en: "Alfalfa / forage", ar: "برسيم / أعلاف" },
  { id: "wheat", en: "Wheat / barley", ar: "قمح / شعير" },
  { id: "veg", en: "Vegetables / potatoes", ar: "خضروات / بطاطا" },
  { id: "mixed", en: "Mixed", ar: "مختلط" },
];
const WATER = [
  { id: "none", en: "No, I need irrigation", ar: "لا، أحتاج إلى نظام ري" },
  { id: "some", en: "Some, I want to expand it", ar: "جزئياً، وأريد التوسعة" },
  { id: "full", en: "Yes, it is fully irrigated", ar: "نعم، الأرض مروية بالكامل" },
];
const REGIONS = [
  { id: "benghazi", en: "East (Benghazi)", ar: "الشرق (بنغازي)" },
  { id: "jalu", en: "Oases (Jalu)", ar: "الواحات (جالو)" },
  { id: "sabha", en: "South (Sabha)", ar: "الجنوب (سبها)" },
];

const T = {
  en: {
    step: "Step",
    of: "of",
    back: "Back",
    next: "Next",
    q: ["What do you want to do on your land?", "What do you grow, or plan to grow?", "How big is the land?", "Is the land already irrigated?", "Where is your farm?"],
    multi: "Choose all that apply",
    ha: "hectares",
    haHint: "1 hectare = 10,000 m² (about 2.5 acres)",
    title: "Your farm plan",
    lead: "A starting list sized to your land. Adjust the quantities, then send it to our team on WhatsApp for prices and a proper site survey.",
    estimate: "Quantities are planning estimates. Our engineers confirm the final numbers after a field visit.",
    addAll: "Add all to enquiry",
    added: "Added to your enquiry",
    nearest: "Your nearest branch",
    call: "Call",
    restart: "Start again",
    nothing: "Pick at least one goal to see a plan.",
  },
  ar: {
    step: "الخطوة",
    of: "من",
    back: "رجوع",
    next: "التالي",
    q: ["ماذا تريد أن تفعل في أرضك؟", "ماذا تزرع أو تخطط لزراعته؟", "ما مساحة الأرض؟", "هل الأرض مروية حالياً؟", "أين تقع مزرعتك؟"],
    multi: "اختر كل ما ينطبق",
    ha: "هكتار",
    haHint: "الهكتار = 10,000 م² (حوالي 2.5 فدان)",
    title: "خطة مزرعتك",
    lead: "قائمة أولية تناسب مساحة أرضك. عدّل الكميات ثم أرسلها لفريقنا عبر واتساب للحصول على الأسعار وزيارة ميدانية.",
    estimate: "الكميات تقديرية للتخطيط. يؤكد مهندسونا الأعداد النهائية بعد زيارة الحقل.",
    addAll: "أضف الكل إلى الطلب",
    added: "أضيف إلى طلبك",
    nearest: "أقرب فرع إليك",
    call: "اتصل",
    restart: "ابدأ من جديد",
    nothing: "اختر هدفاً واحداً على الأقل لعرض الخطة.",
  },
};

const up = (n: number) => Math.max(1, Math.ceil(n));

/** The sizing rules: land size + goals → products and how many. */
export function planFarm(a: Answers): Line[] {
  const ha = Math.max(1, a.ha);
  const g = new Set(a.goals);
  const out: Line[] = [];
  const push = (slug: string, qty: number, en: string, ar: string) => out.push({ slug, qty: up(qty), why: { en, ar } });

  // irrigation: a centre pivot covers a circle of about 50 ha; small fields get the towable small-field pivot
  if (g.has("irrigate") && a.water !== "full") {
    const area = a.water === "some" ? ha / 2 : ha;
    if (area <= 25) push("western-small-field-pivot", area / 12, `About 12 ha per small-field pivot for ${Math.round(area)} ha`, `حوالي 12 هكتار لكل محور صغير لمساحة ${Math.round(area)} هكتار`);
    else {
      const n = up(area / 50);
      push("western-center-pivot", n, `One pivot circle per ~50 ha for ${Math.round(area)} ha`, `دائرة محورية لكل ~50 هكتار لمساحة ${Math.round(area)} هكتار`);
      if (n >= 3) push("western-icontrol-remote", n, "Remote control for each pivot, so you run them from your phone", "تحكم عن بُعد لكل محور من هاتفك");
    }
  }

  // tractors
  if (g.has("till") || g.has("forage")) {
    if (ha < 80) push("claas-arion-640c", ha / 80, "A mid-size tractor handles up to ~80 ha", "جرار متوسط يكفي حتى ~80 هكتار");
    else push("claas-axion-820", ha / 250, "One high-horsepower tractor per ~250 ha", "جرار عالي القدرة لكل ~250 هكتار");
  }

  // forage chain: mow → rake → bale → stack
  if (g.has("forage")) {
    if (ha < 120) push("claas-disco-3600", 1, "Mower sized for smaller fields", "محشة تناسب الحقول الأصغر");
    else push("claas-disco-9300", ha / 500, "Wide triple mower, ~500 ha per unit", "محشة ثلاثية عريضة، ~500 هكتار لكل وحدة");
    push("claas-liner-2800", ha / 400, "Rake to row up the cut crop, ~400 ha per unit", "مكبس لجمع المحصول في صفوف، ~400 هكتار لكل وحدة");
    if (ha < 200) push("claas-markant-650", ha / 150, "Small square baler, ~150 ha per unit", "مكبس بالات صغيرة، ~150 هكتار لكل وحدة");
    else push("claas-quadrant-5200-evo", ha / 600, "Large square baler, ~600 ha per unit", "مكبس بالات كبيرة، ~600 هكتار لكل وحدة");
    if (ha >= 100) push("arcusin-autostack-xp", ha / 600, "Collects and stacks bales straight from the field", "يجمع البالات ويرصّها مباشرة من الحقل");
  }

  // grain
  if (g.has("grain")) push("claas-dominator-260", ha / 300, "One combine per ~300 ha of grain", "حصادة لكل ~300 هكتار من الحبوب");

  // inputs: 25 kg bags
  if (g.has("inputs") || (g.has("forage") && a.crop === "alfalfa")) {
    if (a.crop === "alfalfa" || a.crop === "mixed") push("alfalfa-seeds", (ha * 25) / 25, "Sown at ~25 kg/ha, in 25 kg bags", "يُزرع بمعدل ~25 كغ/هكتار، أكياس 25 كغ");
    push("sulphur-bentonite-90", (ha * 150) / 25, "~150 kg/ha to lower soil pH, in 25 kg bags", "~150 كغ/هكتار لخفض حموضة التربة، أكياس 25 كغ");
  }
  return out.filter((l) => findProduct(l.slug));
}

export function Quiz() {
  const { lang } = useSite();
  const t = T[lang as Lang];
  const { add, setOpen } = useCart();
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>({ goals: [], ha: 50 });
  const [qty, setQty] = useState<Record<string, number>>({});
  const [added, setAdded] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const STEPS = 5;
  const done = step >= STEPS;

  useEffect(() => {
    if (!panel.current) return;
    gsap.fromTo(panel.current.querySelectorAll("[data-in]"), { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.6 });
  }, [step]);

  const plan = useMemo(() => (done ? planFarm(a) : []), [done, a]);

  const next = () => setTimeout(() => setStep((s) => s + 1), 160);
  const opt = (on: boolean) =>
    `group flex min-h-20 items-center justify-between border px-6 py-5 text-start text-xl transition ${
      on ? "border-green-300 bg-green-300 text-ink-900" : "border-white/25 text-white hover:border-white hover:bg-white/5"
    }`;
  const branch = branches.find((b) => b.id === a.region) ?? branches[0];

  return (
    <div ref={panel} className="min-h-[70svh]">
      {!done ? (
        <div>
          <div className="flex items-center justify-between">
            <p data-in className="eyebrow text-green-300">
              {t.step} {step + 1} {t.of} {STEPS}
            </p>
            {step > 0 && (
              <button onClick={() => setStep((s) => s - 1)} className="eyebrow text-white/60 hover:text-white">
                ← {t.back}
              </button>
            )}
          </div>
          <div className="mt-4 h-px w-full bg-white/15">
            <div className="h-px bg-green-300 transition-all duration-700" style={{ width: `${((step + 1) / STEPS) * 100}%` }} />
          </div>
          <p data-in className="display mt-12 max-w-4xl text-white!">
            {t.q[step]}
          </p>

          {step === 0 && (
            <>
              <p data-in className="mt-4 text-white/60">{t.multi}</p>
              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {GOALS.map((o) => {
                  const on = a.goals.includes(o.id);
                  return (
                    <button
                      data-in
                      key={o.id}
                      aria-pressed={on}
                      onClick={() => setA((x) => ({ ...x, goals: on ? x.goals.filter((g) => g !== o.id) : [...x.goals, o.id] }))}
                      className={opt(on)}
                    >
                      {o[lang as Lang]}
                      <span className={`grid size-6 place-items-center border text-sm ${on ? "border-ink-900" : "border-white/40"}`}>{on ? "✓" : ""}</span>
                    </button>
                  );
                })}
              </div>
              <button
                data-in
                disabled={!a.goals.length}
                onClick={() => setStep(1)}
                className="mt-8 inline-flex h-14 items-center gap-3 bg-green-300 px-8 text-ink-900 transition hover:bg-white disabled:opacity-40"
              >
                {t.next} <IconArrow className="size-5" />
              </button>
            </>
          )}

          {step === 1 && (
            <div className="mt-12 grid gap-3 sm:grid-cols-2">
              {CROPS.map((o) => (
                <button data-in key={o.id} onClick={() => (setA((x) => ({ ...x, crop: o.id })), next())} className={opt(a.crop === o.id)}>
                  {o[lang as Lang]}
                  <IconArrow className="size-5 opacity-50 transition group-hover:translate-x-1 group-hover:opacity-100 rtl:group-hover:-translate-x-1" />
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div data-in className="mt-12 max-w-2xl">
              <div className="flex items-end gap-4">
                <input
                  type="number"
                  min={1}
                  max={20000}
                  value={a.ha}
                  onChange={(e) => setA((x) => ({ ...x, ha: Math.max(1, Math.min(20000, Number(e.target.value) || 1)) }))}
                  className="w-48 border-b border-white/40 bg-transparent pb-2 font-display text-[64px] leading-none text-white outline-none focus:border-green-300"
                  aria-label={t.ha}
                />
                <span className="pb-3 text-xl text-white/70">{t.ha}</span>
              </div>
              <input
                type="range"
                min={5}
                max={2000}
                step={5}
                value={Math.min(2000, a.ha)}
                onChange={(e) => setA((x) => ({ ...x, ha: Number(e.target.value) }))}
                className="mt-8 w-full accent-[#a9d36b]"
                aria-label={t.ha}
              />
              <p className="mt-3 text-sm text-white/55">{t.haHint}</p>
              <button onClick={() => setStep(3)} className="mt-10 inline-flex h-14 items-center gap-3 bg-green-300 px-8 text-ink-900 transition hover:bg-white">
                {t.next} <IconArrow className="size-5" />
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="mt-12 grid gap-3 sm:grid-cols-2">
              {WATER.map((o) => (
                <button data-in key={o.id} onClick={() => (setA((x) => ({ ...x, water: o.id })), next())} className={opt(a.water === o.id)}>
                  {o[lang as Lang]}
                  <IconArrow className="size-5 opacity-50" />
                </button>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="mt-12 grid gap-3 sm:grid-cols-2">
              {REGIONS.map((o) => (
                <button data-in key={o.id} onClick={() => (setA((x) => ({ ...x, region: o.id })), next())} className={opt(a.region === o.id)}>
                  {o[lang as Lang]}
                  <IconArrow className="size-5 opacity-50" />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <p data-in className="display mt-4 text-white!">{t.title}</p>
          <p data-in className="lead mt-6 max-w-2xl text-white/75">{t.lead}</p>
          <p data-in className="mt-3 font-mono text-[12px] tracking-[0.12em] text-green-300 uppercase">
            {a.ha} {t.ha} · {a.goals.map((id) => GOALS.find((g) => g.id === id)?.[lang as Lang]).join(" · ")}
          </p>

          {plan.length === 0 ? (
            <p data-in className="mt-10 text-white/70">{t.nothing}</p>
          ) : (
            <ul data-in className="mt-10 divide-y divide-white/10 border-y border-white/10">
              {plan.map((l) => {
                const p = findProduct(l.slug)!;
                return (
                  <li key={l.slug} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
                    <Link href={href(productHref(p), lang)} className="relative size-20 shrink-0 overflow-hidden bg-white/5">
                      <Image src={p.card ?? p.image} alt="" fill sizes="80px" className="object-cover" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="text-xl text-white">{p.name}</p>
                      <p className="mt-1 text-[15px] text-white/60">{l.why[lang as Lang]}</p>
                    </div>
                    <div className="text-white">
                      <Stepper dark value={qty[l.slug] ?? l.qty} onChange={(n) => setQty((q) => ({ ...q, [l.slug]: n }))} label={p.name} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <p data-in className="mt-4 text-sm text-white/50">{t.estimate}</p>

          <div data-in className="mt-10 flex flex-col gap-6 border-t border-white/15 pt-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="eyebrow text-white/60">{t.nearest}</p>
              <p className="h2 mt-2 text-white!">{branch.city[lang]}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {plan.length > 0 && (
                <button
                  onClick={() => {
                    plan.forEach((l) => add(l.slug, qty[l.slug] ?? l.qty, `${a.ha} ${t.ha}`));
                    setAdded(true);
                    setOpen(true);
                  }}
                  className="inline-flex h-12 items-center gap-2 bg-green-300 px-6 text-ink-900 transition hover:bg-white"
                >
                  {added ? `✓ ${t.added}` : t.addAll}
                </button>
              )}
              <a href={`tel:${branch.phone}`} className="inline-flex h-12 items-center gap-3 bg-white px-6 text-ink-900 hover:bg-green-300">
                <IconPhone /> {t.call}
              </a>
            </div>
          </div>
          <button
            onClick={() => {
              setA({ goals: [], ha: 50 });
              setQty({});
              setAdded(false);
              setStep(0);
            }}
            className="eyebrow mt-10 text-white/60 hover:text-white"
          >
            ↺ {t.restart}
          </button>
        </div>
      )}
    </div>
  );
}
