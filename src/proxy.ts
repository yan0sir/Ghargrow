import { NextResponse, type NextRequest } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n";

/** Redirect locale-less URLs to /en or /ar based on Accept-Language. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const has = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (has) return;

  const accept = request.headers.get("accept-language") ?? "";
  const locale = /\bar\b/i.test(accept.split(",")[0] ?? "") ? "ar" : defaultLocale;
  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Skip Next internals, API routes and any file with an extension (media, favicon…)
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
