import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, locales } from "@/lib/i18n";
import { getDict } from "@/content/dict";
import { Quiz } from "@/components/interactive/Quiz";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/find-your-machine">): Promise<Metadata> {
  const { lang } = await params;
  return { title: hasLocale(lang) ? getDict(lang).quiz.title : "Find your machine" };
}

export default async function QuizPage({ params }: PageProps<"/[lang]/find-your-machine">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDict(lang);
  return (
    <section className="min-h-svh bg-green-900 text-white">
      <div className="wrap pt-32 pb-24 md:pt-40">
        <p className="lead mt-3 max-w-xl text-white/70">{d.quiz.lead}</p>
        <div className="mt-14">
          <Quiz />
        </div>
      </div>
    </section>
  );
}
