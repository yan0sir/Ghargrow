import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/content/catalog";
import { brands, productHref } from "@/content/catalog";
import { href, type Locale } from "@/lib/i18n";
import { IconArrow } from "./Icons";

export function ProductCard({ p, lang, size = "md" }: { p: Product; lang: Locale; size?: "md" | "lg" }) {
  const main = p.card ?? p.image;
  const alt = p.card ? p.image : (p.gallery[1] ?? p.image);
  return (
    <Link href={href(productHref(p), lang)} className="group block">
      <div className={`relative overflow-hidden bg-sand-200 ${size === "lg" ? "aspect-[4/5]" : p.card ? "aspect-square" : "aspect-[4/3]"}`}>
        <Image src={main} alt={p.name} fill sizes="(max-width:768px) 90vw, 33vw" className="object-cover transition duration-700 group-hover:scale-[1.04] group-hover:opacity-0" />
        <Image src={alt} alt="" fill sizes="(max-width:768px) 90vw, 33vw" className="scale-[1.04] object-cover opacity-0 transition duration-700 group-hover:scale-100 group-hover:opacity-100" />
        <span className="eyebrow absolute start-3 top-3 bg-sand-50/90 px-2 py-1 text-ink-900">{brands[p.brand].name}</span>
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-ink-400">{p.type[lang]}</p>
          <p className="h3 mt-1 transition-colors group-hover:text-green-700">{p.name}</p>
          {p.keySpec && <p className="mt-1 font-mono text-sm text-ink-700">{p.keySpec[lang]}</p>}
        </div>
        <span className="mt-1 grid size-10 shrink-0 place-items-center border border-ink-900/15 transition group-hover:border-green-700 group-hover:bg-green-700 group-hover:text-white">
          <IconArrow />
        </span>
      </div>
    </Link>
  );
}
