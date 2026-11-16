export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/** A bilingual string. Content is authored in both languages side by side. */
export type L = { en: string; ar: string };

export const hasLocale = (v: string): v is Locale => (locales as readonly string[]).includes(v);
export const dirOf = (l: Locale) => (l === "ar" ? "rtl" : "ltr");
export const t = (s: L, l: Locale) => s[l];

/** Prefix a site path with the locale: href("/products", "ar") -> "/ar/products" */
export const href = (path: string, l: Locale) => `/${l}${path === "/" ? "" : path}`;

export const otherLocale = (l: Locale): Locale => (l === "en" ? "ar" : "en");
