import { locales } from "@/lib/i18n";
import { html } from "./mossline";

/*
 * /en/3d and /ar/3d — the Mossline floating-island scroll story.
 * Served as a standalone HTML document (own nav, fonts and styles), outside the site layout.
 */
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export function GET() {
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
