import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale, href, locales } from "@/lib/i18n";
import { getDict } from "@/content/dict";
import { projects } from "@/content/more";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/motion/Reveal";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/projects">): Promise<Metadata> {
  const { lang } = await params;
  return { title: hasLocale(lang) ? getDict(lang).projects.title : "Projects" };
}

export default async function ProjectsPage({ params }: PageProps<"/[lang]/projects">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDict(lang);
  return (
    <>
      <PageHero eyebrow={d.home.projectsEyebrow} title={d.projects.title} lead={d.projects.lead} />
      <section className="wrap pb-28">
        <Reveal stagger={0.12} className="grid gap-x-6 gap-y-16 md:grid-cols-12">
          {projects.map((p, i) => (
            <Link
              key={p.slug}
              href={href(`/projects/${p.slug}`, lang)}
              className={`group block ${i % 3 === 0 ? "md:col-span-6 md:col-start-2" : i % 3 === 1 ? "md:col-span-3 md:col-start-9 md:mt-40" : "md:col-span-4 md:col-start-4"}`}
            >
              <div className={`relative overflow-hidden bg-sand-200 ${i % 3 === 1 ? "aspect-[3/4]" : "aspect-[16/10]"}`}>
                <Image src={p.cover} alt="" fill sizes="(max-width:768px) 100vw, 66vw" className="object-cover transition duration-1000 group-hover:scale-105" />
              </div>
              <p className="eyebrow mt-5 text-ink-400">
                {p.type[lang]} · {p.place[lang]}
              </p>
              <p className="h3 mt-2 group-hover:text-green-700">{p.title[lang]}</p>
              <p className="mt-3 max-w-lg">{p.summary[lang]}</p>
            </Link>
          ))}
        </Reveal>
      </section>
    </>
  );
}
