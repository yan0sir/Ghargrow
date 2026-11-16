"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useSite } from "@/components/providers/SiteProvider";
import { quiz } from "@/content/more";
import { findProduct } from "@/content/catalog";
import { branches } from "@/content/site";
import { ProductCard } from "@/components/ui/ProductCard";
import { ContactButton, WhatsAppButton } from "@/components/contact/ContactButton";
import { IconArrow, IconPhone } from "@/components/ui/Icons";

/** Noho-style find-your-machine quiz: one question per screen, weighted scores → 1–3 products + nearest branch. */
export function Quiz() {
  const { d, lang } = useSite();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const panel = useRef<HTMLDivElement>(null);
  const done = step >= quiz.length;

  useEffect(() => {
    if (!panel.current) return;
    gsap.fromTo(panel.current.querySelectorAll("[data-in]"), { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.7 });
  }, [step]);

  const pick = (qid: string, oid: string) => {
    setAnswers((a) => ({ ...a, [qid]: oid }));
    setTimeout(() => setStep((s) => s + 1), 180);
  };

  const scores: Record<string, number> = {};
  quiz.forEach((q) => {
    const o = q.options.find((x) => x.id === answers[q.id]);
    if (o) Object.entries(o.scores).forEach(([k, v]) => (scores[k] = (scores[k] ?? 0) + v));
  });
  const top = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([slug]) => findProduct(slug)!)
    .filter(Boolean);
  const branch = branches.find((b) => b.id === answers.region) ?? branches[0];
  const summary = quiz
    .map((q) => q.options.find((o) => o.id === answers[q.id])?.label[lang])
    .filter(Boolean)
    .join(" · ");

  return (
    <div ref={panel} className="min-h-[70svh]">
      {!done ? (
        <div>
          <div className="flex items-center justify-between">
            <p data-in className="eyebrow text-green-300">
              {d.quiz.step} {step + 1} {d.quiz.of} {quiz.length}
            </p>
            {step > 0 && (
              <button onClick={() => setStep((s) => s - 1)} className="eyebrow text-white/60 hover:text-white">
                ← {d.cta.back}
              </button>
            )}
          </div>
          <div className="mt-4 h-px w-full bg-white/15">
            <div className="h-px bg-green-300 transition-all duration-700" style={{ width: `${((step + 1) / quiz.length) * 100}%` }} />
          </div>
          <p data-in className="display mt-12 max-w-4xl text-white!">
            {quiz[step].q[lang]}
          </p>
          <div className="mt-12 grid gap-3 sm:grid-cols-2">
            {quiz[step].options.map((o) => (
              <button
                data-in
                key={o.id}
                onClick={() => pick(quiz[step].id, o.id)}
                className={`group flex min-h-20 items-center justify-between border px-6 py-5 text-start text-xl transition ${
                  answers[quiz[step].id] === o.id ? "border-green-300 bg-green-300 text-ink-900" : "border-white/25 text-white hover:border-white hover:bg-white/5"
                }`}
              >
                {o.label[lang]}
                <IconArrow className="size-5 opacity-50 transition group-hover:translate-x-1 group-hover:opacity-100 rtl:group-hover:-translate-x-1" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <p data-in className="display mt-4 text-white!">{summary}</p>
          <p data-in className="lead mt-6 max-w-xl text-white/75">
            {d.quiz.resultLead}
          </p>
          <div data-in className="mt-12 grid gap-6 rounded-none bg-sand-50 p-6 text-ink-700 sm:grid-cols-2 lg:grid-cols-3 md:p-8">
            {top.map((p) => (
              <ProductCard key={p.slug} p={p} lang={lang} />
            ))}
          </div>
          <div data-in className="mt-10 flex flex-col gap-6 border-t border-white/15 pt-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="eyebrow text-white/60">{d.quiz.nearest}</p>
              <p className="h2 mt-2 text-white!">{branch.city[lang]}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <WhatsAppButton label={`${top.map((p) => p.name).join(", ")} — ${summary}`} />
              <a href={`tel:${branch.phone}`} className="inline-flex h-12 items-center gap-3 bg-white px-6 text-ink-900 hover:bg-green-300">
                <IconPhone /> {d.cta.call}
              </a>
              <ContactButton variant="light" topic={{ label: top.map((p) => p.name).join(", "), detail: summary, kind: "quote" }}>
                {d.cta.inquire}
              </ContactButton>
            </div>
          </div>
          <button
            onClick={() => {
              setAnswers({});
              setStep(0);
            }}
            className="eyebrow mt-10 text-white/60 hover:text-white"
          >
            ↺ {d.cta.restart}
          </button>
        </div>
      )}
    </div>
  );
}
