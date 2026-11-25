"use client";

import { useMemo, useState } from "react";
import { useSite } from "@/components/providers/SiteProvider";
import { findProduct } from "@/content/catalog";
import { useCart } from "@/components/cart/Cart";
import { planFarm } from "./Quiz";

/** Homepage mini planner: pick goals + crop, slide the land size, the list and quantities update live. */
const GOALS = [
  { id: "irrigate", en: "Irrigate", ar: "الري" },
  { id: "till", en: "Till & sow", ar: "الحراثة" },
  { id: "forage", en: "Forage", ar: "الأعلاف" },
  { id: "grain", en: "Grain", ar: "الحبوب" },
  { id: "inputs", en: "Seed & fertilizer", ar: "بذور وأسمدة" },
];
const CROPS = [
  { id: "alfalfa", en: "Alfalfa", ar: "برسيم" },
  { id: "wheat", en: "Wheat", ar: "قمح" },
  { id: "veg", en: "Vegetables", ar: "خضروات" },
];

export function MiniPlanner() {
  const { lang } = useSite();
  const l = lang as "en" | "ar";
  const { add, setOpen } = useCart();
  const [goals, setGoals] = useState<string[]>(["irrigate", "forage"]);
  const [crop, setCrop] = useState("alfalfa");
  const [ha, setHa] = useState(100);
  const plan = useMemo(() => planFarm({ goals, crop, ha, water: "none" }), [goals, crop, ha]);
  const chip = (on: boolean) =>
    `h-10 border px-4 text-[14px] transition ${on ? "border-green-300 bg-green-300 text-ink-900" : "border-sand-50/30 text-sand-50 hover:border-sand-50"}`;

  return (
    <div className="border border-sand-50/15 p-5 md:p-7">
      <p className="font-mono text-[11px] tracking-[0.16em] text-green-300 uppercase">{l === "ar" ? "ماذا تريد؟" : "What do you need?"}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {GOALS.map((g) => {
          const on = goals.includes(g.id);
          return (
            <button key={g.id} type="button" aria-pressed={on} className={chip(on)} onClick={() => setGoals((x) => (on ? x.filter((y) => y !== g.id) : [...x, g.id]))}>
              {g[l]}
            </button>
          );
        })}
      </div>
      <p className="mt-6 font-mono text-[11px] tracking-[0.16em] text-green-300 uppercase">{l === "ar" ? "المحصول" : "Crop"}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {CROPS.map((c) => (
          <button key={c.id} type="button" aria-pressed={crop === c.id} className={chip(crop === c.id)} onClick={() => setCrop(c.id)}>
            {c[l]}
          </button>
        ))}
      </div>
      <div className="mt-6 flex items-baseline justify-between">
        <p className="font-mono text-[11px] tracking-[0.16em] text-green-300 uppercase">{l === "ar" ? "المساحة" : "Land size"}</p>
        <p className="text-[22px]">
          {ha} <span className="text-[14px] text-sand-50/60">{l === "ar" ? "هكتار" : "ha"}</span>
        </p>
      </div>
      <input type="range" min={5} max={1500} step={5} value={ha} onChange={(e) => setHa(Number(e.target.value))} className="mt-2 w-full accent-[#a9c98a]" aria-label={l === "ar" ? "المساحة بالهكتار" : "Land size in hectares"} />

      <ul className="mt-6 divide-y divide-sand-50/10 border-t border-sand-50/15" aria-live="polite">
        {plan.length === 0 ? (
          <li className="py-4 text-[15px] text-sand-50/60">{l === "ar" ? "اختر هدفاً واحداً على الأقل." : "Pick at least one goal."}</li>
        ) : (
          plan.map((x) => (
            <li key={x.slug} className="flex items-center justify-between gap-4 py-3 text-[15px]">
              <span>{findProduct(x.slug)!.name}</span>
              <span className="font-mono text-green-300">× {x.qty}</span>
            </li>
          ))
        )}
      </ul>
      {plan.length > 0 && (
        <button
          type="button"
          onClick={() => {
            plan.forEach((x) => add(x.slug, x.qty, `${ha} ${l === "ar" ? "هكتار" : "hectares"}`));
            setOpen(true);
          }}
          className="mt-5 h-12 w-full bg-green-300 text-[15px] text-ink-900 transition hover:bg-sand-50"
        >
          {l === "ar" ? "أضف القائمة إلى الطلب" : "Add this list to my enquiry"}
        </button>
      )}
    </div>
  );
}
