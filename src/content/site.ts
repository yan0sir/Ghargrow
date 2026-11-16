import type { L } from "@/lib/i18n";

/**
 * Company-level facts. Phone numbers come from the current ghargrow.com contact page.
 * TODO(client): confirm which number(s) take WhatsApp, branch street addresses and opening hours.
 */
export type Branch = {
  id: string;
  city: L;
  phone: string; // E.164
  phoneDisplay: string;
  whatsapp: string; // digits only, for wa.me
  lon: number;
  lat: number;
  hq?: boolean;
};

export const branches: Branch[] = [
  {
    id: "benghazi",
    city: { en: "Benghazi", ar: "بنغازي" },
    phone: "+218926060194",
    phoneDisplay: "+218 92 606 0194",
    whatsapp: "218926060194",
    lon: 20.07,
    lat: 32.12,
    hq: true,
  },
  {
    id: "sabha",
    city: { en: "Sabha", ar: "سبها" },
    phone: "+218926060197",
    phoneDisplay: "+218 92 606 0197",
    whatsapp: "218926060197",
    lon: 14.43,
    lat: 27.04,
  },
  {
    id: "jalu",
    city: { en: "Jalu", ar: "جالو" },
    phone: "+218926060195",
    phoneDisplay: "+218 92 606 0195",
    whatsapp: "218926060195",
    lon: 21.57,
    lat: 29.03,
  },
];

export const site = {
  name: { en: "Ghargrow Agro-Industries", ar: "غرغار للاستثمار الزراعي" } as L,
  short: { en: "Ghargrow", ar: "غرغار" } as L,
  tagline: { en: "Grow with Trust", ar: "ازرع بثقة" } as L,
  email: "info@ghargrow.com",
  defaultWhatsapp: branches[0].whatsapp,
  social: {
    facebook: "https://www.facebook.com/profile.php?id=61550705035262",
    instagram: "https://www.instagram.com/ghargrow_official/",
    linkedin: "https://www.linkedin.com/company/ghargrow-agro-industries/",
  },
};
