import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, locales } from "@/lib/i18n";
import { Mossline } from "@/components/three/Mossline";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const metadata: Metadata = { title: "3D" };

export default async function ThreeDPage({ params }: PageProps<"/[lang]/3d">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return <Mossline />;
}
