import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, locales } from "@/lib/i18n";
import { FarmStory } from "@/components/farm/FarmStory";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const metadata: Metadata = { title: "3D — From Sand to Harvest" };

export default async function ThreeDPage({ params }: PageProps<"/[lang]/3d">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return <FarmStory />;
}
