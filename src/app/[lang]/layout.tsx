import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono, Inter, IBM_Plex_Sans_Arabic } from "next/font/google";
import "../globals.css";
import { dirOf, hasLocale, locales } from "@/lib/i18n";
import { site } from "@/content/site";
import { SiteProvider } from "@/components/providers/SiteProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Loader } from "@/components/layout/Loader";
import { ContactSheet } from "@/components/contact/ContactSheet";
import { ContactPill } from "@/components/contact/ContactPill";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"], weight: ["200", "300", "400", "500"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], weight: ["400", "500"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const plex = IBM_Plex_Sans_Arabic({ variable: "--font-plex-arabic", subsets: ["arabic"], weight: ["200", "300", "400", "500", "600"] });

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const l = hasLocale(lang) ? lang : "en";
  const description =
    l === "ar"
      ? "غرغار للاستثمار الزراعي — الموزع المعتمد لجرارات CLAAS وأنظمة الري Western في ليبيا. معدات وري وقطع غيار وخدمة ما بعد البيع."
      : "Ghargrow Agro-Industries — authorized distributor of CLAAS tractors and Western irrigation pivots in Libya. Machinery, irrigation, spare parts and after-sales service.";
  return {
    metadataBase: new URL("https://www.ghargrow.com"),
    title: { default: `${site.name[l]} — ${site.tagline[l]}`, template: `%s · ${site.short[l]}` },
    description,
    icons: { icon: "/media/logo/mark.png" },
    alternates: { languages: { en: "/en", ar: "/ar" } },
    openGraph: { siteName: site.name[l], images: ["/media/img/pivot-sunrise.webp"], locale: l === "ar" ? "ar_LY" : "en_US" },
  };
}

export const viewport: Viewport = { themeColor: "#f1eee9", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    <html lang={lang} dir={dirOf(lang)} className={`${geist.variable} ${geistMono.variable} ${inter.variable} ${plex.variable}`}>
      <body>
        <SiteProvider lang={lang}>
          <Loader />
          <Header />
          <main id="main" tabIndex={-1} className="outline-none">{children}</main>
          <Footer />
          <ContactPill />
          <ContactSheet />
        </SiteProvider>
        <script
          type="application/ld+json"
            dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Ghargrow Agro-Industries",
              url: "https://www.ghargrow.com",
              email: site.email,
              logo: "https://www.ghargrow.com/media/logo/mark.png",
              sameAs: Object.values(site.social),
            }),
          }}
        />
      </body>
    </html>
  );
}
