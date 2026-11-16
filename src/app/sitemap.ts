import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { categories, products, productHref } from "@/content/catalog";
import { projects, posts } from "@/content/more";

const BASE = "https://www.ghargrow.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/products",
    "/spare-parts",
    "/services",
    "/projects",
    "/about",
    "/news",
    "/careers",
    "/contact",
    "/find-your-machine",
    ...categories.map((c) => `/products/${c.slug}`),
    ...products.map(productHref),
    ...projects.map((p) => `/projects/${p.slug}`),
    ...posts.map((p) => `/news/${p.slug}`),
  ];
  return paths.flatMap((p) =>
    locales.map((l) => ({
      url: `${BASE}/${l}${p === "/" ? "" : p}`,
      alternates: { languages: Object.fromEntries(locales.map((x) => [x, `${BASE}/${x}${p === "/" ? "" : p}`])) },
    })),
  );
}
