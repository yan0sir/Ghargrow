import type { L } from "@/lib/i18n";

/*
 * Product catalogue. Shaped so it can move into a headless CMS (Sanity) later
 * without changing the components: every document has a slug, bilingual fields and media paths.
 *
 * Specs marked as coming from CLAAS were taken from the CLAAS 2024 product portfolio and
 * DOMINATOR 260 flyer in the Ghargrow media library. Values are "approximate" per CLAAS's own
 * disclaimer. Western / Arcusin products have no spec sheet in the library yet, so they show
 * features only. TODO(client): confirm local specification of each machine sold in Libya.
 */

const m = (p: string) => `/media/${p}`;

export type BrandId = "claas" | "western" | "arcusin" | "ghargrow";
export type Brand = { id: BrandId; name: string; logo?: string; role: L; blurb: L };

export const brands: Record<BrandId, Brand> = {
  claas: {
    id: "claas",
    name: "CLAAS",
    logo: m("logo/claas.png"),
    role: { en: "Authorized distributor in Libya", ar: "الموزع المعتمد في ليبيا" },
    blurb: {
      en: "German engineering for tractors, combines, mowers, swathers and balers.",
      ar: "هندسة ألمانية للجرارات والحصادات والمحشات والمجمّعات والمكابس.",
    },
  },
  western: {
    id: "western",
    name: "Western",
    logo: m("logo/western.png"),
    role: { en: "Authorized distributor in Libya", ar: "الموزع المعتمد في ليبيا" },
    blurb: {
      en: "Centre, linear and small-field pivots with iControl panels and remote management.",
      ar: "أنظمة ري محورية وخطية وللحقول الصغيرة مع لوحات iControl والتحكم عن بُعد.",
    },
  },
  arcusin: {
    id: "arcusin",
    name: "Arcusin",
    role: { en: "Bale handling partner", ar: "شريك معدات مناولة البالات" },
    blurb: {
      en: "Bale collecting and stacking equipment that clears fields faster.",
      ar: "معدات جمع ورصّ البالات لتفريغ الحقول بسرعة أكبر.",
    },
  },
  ghargrow: {
    id: "ghargrow",
    name: "Ghargrow",
    logo: m("logo/mark.png"),
    role: { en: "Ghargrow supply", ar: "توريد غرغار" },
    blurb: { en: "Seeds and fertilizers selected for Libyan farms.", ar: "بذور وأسمدة مختارة للمزارع الليبية." },
  },
};

export type CategorySlug = "tractors-machinery" | "irrigation" | "bale-handling" | "seeds-fertilizers";

export type Category = {
  slug: CategorySlug;
  num: string;
  title: L;
  short: L;
  intro: L;
  image: string;
  video?: string;
  brand: BrandId;
  feature?: "attachment-swap" | "pivot-simulator" | "bale-flow";
};

export const categories: Category[] = [
  {
    slug: "tractors-machinery",
    num: "01",
    title: { en: "Tractors & Machinery", ar: "الجرارات والمعدات" },
    short: { en: "Tractors & harvest", ar: "الجرارات والحصاد" },
    intro: {
      en: "CLAAS tractors, combines, mowers, swathers and balers — the full chain from soil to bale, backed by Ghargrow service.",
      ar: "جرارات وحصادات ومحشات ومجمّعات ومكابس CLAAS — السلسلة الكاملة من التربة إلى البالة، مع خدمة غرغار.",
    },
    image: m("img/axion-road.webp"),
    video: m("video/axion-field.mp4"),
    brand: "claas",
    feature: "attachment-swap",
  },
  {
    slug: "irrigation",
    num: "02",
    title: { en: "Irrigation Pivots", ar: "أنظمة الري المحوري" },
    short: { en: "Irrigation", ar: "الري" },
    intro: {
      en: "Western centre, linear and small-field pivots that turn desert into green circles — designed, installed and maintained by our engineers.",
      ar: "أنظمة Western المحورية والخطية وللحقول الصغيرة التي تحوّل الصحراء إلى دوائر خضراء — تصميم وتركيب وصيانة بأيدي مهندسينا.",
    },
    image: m("img/pivot-sunrise.webp"),
    video: m("video/pivot-sunset.mp4"),
    brand: "western",
    feature: "pivot-simulator",
  },
  {
    slug: "bale-handling",
    num: "03",
    title: { en: "Bale Handling", ar: "مناولة البالات" },
    short: { en: "Bale handling", ar: "البالات" },
    intro: {
      en: "Arcusin collectors and stackers that pick, pack and stack bales so your field is clear before the next cut.",
      ar: "جامعات ورافعات Arcusin التي تلتقط البالات وتحزمها وترصّها ليصبح الحقل جاهزاً قبل الحشّة التالية.",
    },
    image: m("img/bale-stack.webp"),
    brand: "arcusin",
    feature: "bale-flow",
  },
  {
    slug: "seeds-fertilizers",
    num: "04",
    title: { en: "Seeds & Fertilizers", ar: "البذور والأسمدة" },
    short: { en: "Seeds & inputs", ar: "البذور والأسمدة" },
    intro: {
      en: "High-yield alfalfa seed and soil-improving fertilizers to get the most from every irrigated hectare.",
      ar: "بذور برسيم عالية الإنتاجية وأسمدة محسّنة للتربة لتحقيق أقصى استفادة من كل هكتار مروي.",
    },
    image: m("img/seeds-alfalfa.webp"),
    brand: "ghargrow",
  },
];

export type Spec = { label: L; value: string | L };
export type Highlight = { key: string; title: L; body: L; image: string };
export type Hotspot = { x: number; y: number; title: L; body: L };

export type Product = {
  slug: string;
  category: CategorySlug;
  brand: BrandId;
  name: string; // model name, same in both languages
  type: L;
  summary: L;
  image: string;
  cutout?: string;
  gallery: string[];
  video?: string;
  sequence?: { name: string; frames: number };
  flagship?: boolean;
  keySpec?: L;
  specs: Spec[];
  highlights?: Highlight[];
  hotspots?: Hotspot[];
  specsSource?: L;
};

const claasSource: L = {
  en: "Source: CLAAS product portfolio 2024. Figures are approximate; local specification may vary.",
  ar: "المصدر: كتالوج منتجات CLAAS لعام 2024. القيم تقريبية وقد تختلف المواصفات المحلية.",
};

export const products: Product[] = [
  /* ───────────── CLAAS ───────────── */
  {
    slug: "claas-axion-820",
    category: "tractors-machinery",
    brand: "claas",
    name: "AXION 820",
    type: { en: "Tractor", ar: "جرار" },
    summary: {
      en: "A six-cylinder all-rounder for heavy tillage, transport and PTO work — comfortable on long days, frugal on fuel.",
      ar: "جرار سداسي الأسطوانات متعدد المهام للحراثة الثقيلة والنقل وأعمال عمود الإدارة — مريح في الأيام الطويلة واقتصادي في الوقود.",
    },
    image: m("img/axion-road.webp"),
    cutout: m("cutout/axion.webp"),
    gallery: [m("img/axion-road.webp"), m("img/axion-cab.webp"), m("img/disco-field.webp"), m("img/field-aerial.webp")],
    video: m("video/axion-field.mp4"),
    sequence: { name: "axion", frames: 67 },
    flagship: true,
    keySpec: { en: "189 hp · HEXASHIFT 24/24", ar: "189 حصان · HEXASHIFT 24/24" },
    specs: [
      { label: { en: "Engine", ar: "المحرك" }, value: { en: "6-cylinder, 6.8 l", ar: "6 أسطوانات، 6.8 لتر" } },
      { label: { en: "Rated power (ECE R120)", ar: "القدرة المقننة (ECE R120)" }, value: "139 kW / 189 hp" },
      { label: { en: "Rated power (ECE R24)", ar: "القدرة المقننة (ECE R24)" }, value: "135 kW / 183 hp" },
      { label: { en: "Transmission", ar: "ناقل الحركة" }, value: "HEXASHIFT 24/24" },
      { label: { en: "Hydraulics", ar: "الهيدروليك" }, value: "150 l/min" },
    ],
    highlights: [
      {
        key: "power",
        title: { en: "Power", ar: "القوة" },
        body: {
          en: "A 6.8-litre six-cylinder engine delivers 189 hp for ploughing, cultivating and pulling heavy trailers.",
          ar: "محرك سداسي الأسطوانات سعة 6.8 لتر بقوة 189 حصاناً للحراثة والتجهيز وسحب المقطورات الثقيلة.",
        },
        image: m("img/axion-road.webp"),
      },
      {
        key: "comfort",
        title: { en: "Comfort", ar: "الراحة" },
        body: {
          en: "A quiet, spacious cab with intuitive controls keeps operators focused through long Libyan harvest days.",
          ar: "كابينة هادئة وواسعة بأدوات تحكم سهلة تُبقي السائق مركزاً طوال أيام الحصاد الطويلة.",
        },
        image: m("img/axion-cab.webp"),
      },
      {
        key: "versatility",
        title: { en: "Versatility", ar: "تعدد الاستخدامات" },
        body: {
          en: "Front and rear linkage plus 150 l/min hydraulics run mowers, balers and seed drills from the same tractor.",
          ar: "وصلات أمامية وخلفية وهيدروليك بتدفق 150 لتر/دقيقة لتشغيل المحشات والمكابس والبذارات بنفس الجرار.",
        },
        image: m("img/disco-field.webp"),
      },
    ],
    hotspots: [
      { x: 62, y: 28, title: { en: "Cab", ar: "الكابينة" }, body: { en: "Panoramic visibility and climate control.", ar: "رؤية بانورامية وتحكم بالمناخ." } },
      { x: 24, y: 55, title: { en: "Engine", ar: "المحرك" }, body: { en: "6-cylinder, 6.8 l, 189 hp rated.", ar: "6 أسطوانات، 6.8 لتر، 189 حصاناً." } },
      { x: 75, y: 72, title: { en: "Rear axle & linkage", ar: "المحور والوصلة الخلفية" }, body: { en: "Built to carry heavy mounted implements.", ar: "مصممة لحمل المعدات الثقيلة المعلقة." } },
    ],
    specsSource: claasSource,
  },
  {
    slug: "claas-arion-640c",
    category: "tractors-machinery",
    brand: "claas",
    name: "ARION 640 C",
    type: { en: "Tractor", ar: "جرار" },
    summary: {
      en: "The mid-size workhorse: enough power for the field, compact enough for the yard and front-loader work.",
      ar: "جرار متوسط الحجم: قوة كافية للحقل وحجم مناسب للساحة وأعمال اللودر الأمامي.",
    },
    image: m("img/disco-front.webp"),
    gallery: [m("img/disco-front.webp"), m("img/liner-aerial.webp")],
    keySpec: { en: "155 hp · QUADRISHIFT 16/16", ar: "155 حصان · QUADRISHIFT 16/16" },
    specs: [
      { label: { en: "Engine", ar: "المحرك" }, value: { en: "6-cylinder, 6.8 l", ar: "6 أسطوانات، 6.8 لتر" } },
      { label: { en: "Rated power (ECE R120)", ar: "القدرة المقننة (ECE R120)" }, value: "114 kW / 155 hp" },
      { label: { en: "Transmission", ar: "ناقل الحركة" }, value: "QUADRISHIFT 16/16" },
      { label: { en: "Hydraulics", ar: "الهيدروليك" }, value: "98 l/min" },
    ],
    specsSource: claasSource,
  },
  {
    slug: "claas-dominator-260",
    category: "tractors-machinery",
    brand: "claas",
    name: "DOMINATOR 260",
    type: { en: "Combine harvester", ar: "حصادة دراسة" },
    summary: {
      en: "A five-walker combine with a bigger threshing system, more grain tank and more power — built for wheat and barley campaigns.",
      ar: "حصادة بخمسة هزازات بنظام دراس أكبر وخزان حبوب أكبر وقوة أعلى — مصممة لمواسم القمح والشعير.",
    },
    image: m("img/dominator-wheat.webp"),
    gallery: [m("img/dominator-wheat.webp"), m("img/combine-field.webp"), m("img/combine-dust.webp"), m("img/field-coast.webp")],
    video: m("video/dominator.mp4"),
    flagship: true,
    keySpec: { en: "205 hp · 5,800 l grain tank", ar: "205 حصان · خزان 5,800 لتر" },
    specs: [
      { label: { en: "Engine", ar: "المحرك" }, value: { en: "Perkins, 151 kW / 205 hp", ar: "بيركنز، 151 كيلوواط / 205 حصان" } },
      { label: { en: "Threshing drum", ar: "اسطوانة الدراس" }, value: "1,420 × 600 mm · 0.96 m²" },
      { label: { en: "Cleaning area", ar: "مساحة التنظيف" }, value: "4.80 m²" },
      { label: { en: "Separation", ar: "الفصل" }, value: { en: "5 straw walkers · 5.35 m²", ar: "5 هزازات قش · 5.35 م²" } },
      { label: { en: "Grain tank", ar: "خزان الحبوب" }, value: "5,800 l" },
      { label: { en: "Terminal", ar: "الشاشة" }, value: "CEMIS 700" },
    ],
    highlights: [
      {
        key: "thresh",
        title: { en: "Threshing", ar: "الدراس" },
        body: {
          en: "A 1,420 mm threshing drum and bigger concave area handle high yields without losses.",
          ar: "اسطوانة دراس بعرض 1,420 مم ومساحة أكبر للتعامل مع المحاصيل العالية دون فاقد.",
        },
        image: m("img/dominator-wheat.webp"),
      },
      {
        key: "clean",
        title: { en: "Clean grain", ar: "حبوب نظيفة" },
        body: {
          en: "4.80 m² of cleaning area for high grain quality straight from the field.",
          ar: "مساحة تنظيف 4.80 م² لحبوب عالية الجودة مباشرة من الحقل.",
        },
        image: m("img/combine-field.webp"),
      },
      {
        key: "cab",
        title: { en: "Comfort cab", ar: "كابينة مريحة" },
        body: {
          en: "CLAAS comfort cab with the CEMIS 700 terminal and multi-function lever.",
          ar: "كابينة CLAAS المريحة مع شاشة CEMIS 700 وذراع تحكم متعدد الوظائف.",
        },
        image: m("img/combine-dust.webp"),
      },
    ],
    specsSource: {
      en: "Source: CLAAS DOMINATOR 260 flyer and 2024 portfolio. Figures are approximate.",
      ar: "المصدر: نشرة CLAAS DOMINATOR 260 وكتالوج 2024. القيم تقريبية.",
    },
  },
  {
    slug: "claas-disco-9300",
    category: "tractors-machinery",
    brand: "claas",
    name: "DISCO 9300",
    type: { en: "Butterfly mower combination", ar: "محشة مزدوجة (فراشة)" },
    summary: {
      en: "Front-and-rear mowing at over nine metres for large alfalfa areas under pivots.",
      ar: "حشّ أمامي وخلفي بعرض يتجاوز تسعة أمتار لمساحات البرسيم الكبيرة تحت أنظمة الري المحوري.",
    },
    image: m("img/disco-field.webp"),
    gallery: [m("img/disco-field.webp"), m("img/disco-studio.webp"), m("img/disco-front.webp")],
    video: m("video/disco.mp4"),
    keySpec: { en: "9.10 / 8.90 m working width", ar: "عرض عمل 9.10 / 8.90 م" },
    specs: [
      { label: { en: "Working width", ar: "عرض العمل" }, value: "9.10 / 8.90 m" },
      { label: { en: "Discs", ar: "الأقراص" }, value: "2 × 8" },
      { label: { en: "Collision protection", ar: "الحماية من الاصطدام" }, value: { en: "Mechanical", ar: "ميكانيكية" } },
    ],
    specsSource: claasSource,
  },
  {
    slug: "claas-disco-3600",
    category: "tractors-machinery",
    brand: "claas",
    name: "DISCO 3600",
    type: { en: "Trailed mower", ar: "محشة مقطورة" },
    summary: {
      en: "A trailed mower with central drawbar for clean, even cuts on mid-size fields.",
      ar: "محشة مقطورة بذراع جر مركزي لقصّ نظيف ومتساوٍ في الحقول المتوسطة.",
    },
    image: m("img/disco-studio.webp"),
    gallery: [m("img/disco-studio.webp"), m("img/disco-field.webp")],
    keySpec: { en: "3.40 m · 8 discs", ar: "3.40 م · 8 أقراص" },
    specs: [
      { label: { en: "Working width", ar: "عرض العمل" }, value: "3.40 m" },
      { label: { en: "Discs", ar: "الأقراص" }, value: "8" },
      { label: { en: "Hitch", ar: "التوصيل" }, value: { en: "Trailed, central drawbar", ar: "مقطورة، ذراع جر مركزي" } },
    ],
    specsSource: claasSource,
  },
  {
    slug: "claas-liner-2800",
    category: "tractors-machinery",
    brand: "claas",
    name: "LINER 2800",
    type: { en: "Twin-rotor swather", ar: "مجمّعة دوارة مزدوجة" },
    summary: {
      en: "Gentle, clean windrows for better forage quality and faster baling.",
      ar: "صفوف نظيفة ولطيفة على العلف لجودة أفضل وكبس أسرع.",
    },
    image: m("img/liner-aerial.webp"),
    gallery: [m("img/liner-aerial.webp"), m("img/liner-detail.webp")],
    keySpec: { en: "7.40 – 8.20 m · 2 rotors", ar: "7.40 – 8.20 م · دواران" },
    specs: [
      { label: { en: "Working width", ar: "عرض العمل" }, value: "7.40 – 8.20 m" },
      { label: { en: "Rotors", ar: "الدوّارات" }, value: { en: "2 × 3.50 m diameter", ar: "2 × قطر 3.50 م" } },
      { label: { en: "Tine arms", ar: "أذرع الأسنان" }, value: { en: "12 per rotor, 4 × 9.5 mm tines", ar: "12 لكل دوار، 4 أسنان 9.5 مم" } },
    ],
    specsSource: claasSource,
  },
  {
    slug: "claas-markant-650",
    category: "tractors-machinery",
    brand: "claas",
    name: "MARKANT 650",
    type: { en: "Small square baler", ar: "مكبس بالات صغيرة" },
    summary: {
      en: "Our most-seen machine in Libyan alfalfa fields: dependable small square bales, easy to handle and sell.",
      ar: "الأكثر انتشاراً في حقول البرسيم الليبية: بالات مربعة صغيرة موثوقة وسهلة المناولة والبيع.",
    },
    image: m("img/markant-side.webp"),
    gallery: [m("img/markant-side.webp"), m("img/markant-close.webp"), m("img/baler-pivot.webp"), m("img/aerial-baler.webp")],
    keySpec: { en: "Small square bales", ar: "بالات مربعة صغيرة" },
    specs: [
      { label: { en: "Bale type", ar: "نوع البالة" }, value: { en: "Small square", ar: "مربعة صغيرة" } },
      { label: { en: "Spare parts", ar: "قطع الغيار" }, value: { en: "Stocked by Ghargrow", ar: "متوفرة لدى غرغار" } },
    ],
  },
  {
    slug: "claas-quadrant-5200-evo",
    category: "tractors-machinery",
    brand: "claas",
    name: "QUADRANT 5200 EVO",
    type: { en: "Large square baler", ar: "مكبس بالات كبيرة" },
    summary: {
      en: "High-density large square bales with automatic pressure control — for contractors and large forage operations.",
      ar: "بالات مربعة كبيرة عالية الكثافة مع تحكم آلي بالضغط — للمقاولين ومشاريع الأعلاف الكبيرة.",
    },
    image: m("img/baler-pivot-3.webp"),
    gallery: [m("img/baler-pivot-3.webp"), m("img/bale-stack-2.webp"), m("img/aerial-baler-2.webp")],
    video: m("video/quadrant.mp4"),
    flagship: true,
    keySpec: { en: "1.20 × 0.70 m chamber", ar: "غرفة كبس 1.20 × 0.70 م" },
    specs: [
      { label: { en: "Bale chamber", ar: "غرفة الكبس" }, value: "1.20 × 0.70 m" },
      { label: { en: "Pick-up", ar: "الالتقاط" }, value: { en: "5-row HD pick-up", ar: "لاقط HD بخمسة صفوف" } },
      { label: { en: "Pressure control", ar: "التحكم بالضغط" }, value: { en: "Automatic", ar: "آلي" } },
      { label: { en: "Cutting (RC)", ar: "القص (RC)" }, value: { en: "ROTO CUT, 25 knives", ar: "ROTO CUT، 25 سكيناً" } },
      { label: { en: "Pre-chamber", ar: "الغرفة الأولية" }, value: { en: "Hydraulically selected", ar: "اختيار هيدروليكي" } },
    ],
    highlights: [
      {
        key: "density",
        title: { en: "Density", ar: "الكثافة" },
        body: {
          en: "Automatic baling pressure control keeps every bale dense and uniform for transport and storage.",
          ar: "التحكم الآلي بضغط الكبس يجعل كل بالة كثيفة ومتجانسة للنقل والتخزين.",
        },
        image: m("img/bale-stack-2.webp"),
      },
      {
        key: "intake",
        title: { en: "Intake", ar: "التغذية" },
        body: {
          en: "A 5-row heavy-duty pick-up clears wide windrows at speed.",
          ar: "لاقط شديد التحمل بخمسة صفوف يلتقط الصفوف العريضة بسرعة.",
        },
        image: m("img/baler-pivot-3.webp"),
      },
      {
        key: "cut",
        title: { en: "Cut quality", ar: "جودة القص" },
        body: {
          en: "ROTO CUT with 25 knives for shorter chop and better feed value.",
          ar: "نظام ROTO CUT بـ 25 سكيناً لتقطيع أقصر وقيمة غذائية أفضل.",
        },
        image: m("img/aerial-baler-2.webp"),
      },
    ],
    specsSource: claasSource,
  },
  /* ───────────── Western ───────────── */
  {
    slug: "western-center-pivot",
    category: "irrigation",
    brand: "western",
    name: "Western Center Pivot",
    type: { en: "Centre pivot", ar: "ري محوري مركزي" },
    summary: {
      en: "A self-propelled irrigation system that waters a full circle with even, efficient application — the green circles you see from the air.",
      ar: "نظام ري ذاتي الحركة يروي دائرة كاملة بتوزيع متساوٍ وكفاءة عالية — الدوائر الخضراء التي تراها من الجو.",
    },
    image: m("img/pivot-sunrise.webp"),
    gallery: [m("img/pivot-sunrise.webp"), m("img/pivot-spray.webp"), m("img/pivot-wheel.webp"), m("img/pivot-circles.webp")],
    video: m("video/pivot-sunset.mp4"),
    flagship: true,
    keySpec: { en: "Full-circle irrigation", ar: "ري دائري كامل" },
    specs: [
      { label: { en: "Coverage", ar: "التغطية" }, value: { en: "Full or part circle", ar: "دائرة كاملة أو جزئية" } },
      { label: { en: "Control", ar: "التحكم" }, value: "iControl / iControl Remote" },
      { label: { en: "Structure", ar: "الهيكل" }, value: { en: "Galvanised steel spans and towers", ar: "أبراج وامتدادات من الفولاذ المجلفن" } },
      { label: { en: "Options", ar: "الخيارات" }, value: { en: "End gun, sprinkler packages, pressure regulators", ar: "مدفع طرفي، حزم رشاشات، منظمات ضغط" } },
      { label: { en: "Service", ar: "الخدمة" }, value: { en: "Design, installation and maintenance by Ghargrow", ar: "التصميم والتركيب والصيانة من غرغار" } },
    ],
    highlights: [
      {
        key: "even",
        title: { en: "Even water", ar: "ري متساوٍ" },
        body: {
          en: "Sprinkler packages and pressure regulators matched to your soil and crop deliver the same depth of water across the whole circle.",
          ar: "حزم رشاشات ومنظمات ضغط مناسبة لتربتك ومحصولك توزّع نفس كمية المياه على كامل الدائرة.",
        },
        image: m("img/pivot-spray.webp"),
      },
      {
        key: "control",
        title: { en: "iControl", ar: "iControl" },
        body: {
          en: "Start, stop, reverse and set application depth from the panel — or from your phone with iControl Remote.",
          ar: "شغّل وأوقف واعكس الاتجاه وحدد عمق الري من اللوحة — أو من هاتفك عبر iControl Remote.",
        },
        image: m("img/icontrol-sunset.webp"),
      },
      {
        key: "built",
        title: { en: "Built for sand", ar: "مصمم للرمال" },
        body: {
          en: "Galvanised steel and high-flotation tyres made for long seasons in sandy Libyan soils.",
          ar: "فولاذ مجلفن وإطارات عالية الطفو صُممت لمواسم طويلة في التربة الرملية الليبية.",
        },
        image: m("img/pivot-wheel.webp"),
      },
    ],
  },
  {
    slug: "western-linear-pivot",
    category: "irrigation",
    brand: "western",
    name: "Western Linear",
    type: { en: "Linear move system", ar: "نظام ري خطي" },
    summary: {
      en: "Irrigates rectangular fields edge to edge — no dry corners.",
      ar: "يروي الحقول المستطيلة من الطرف إلى الطرف — بلا زوايا جافة.",
    },
    image: m("img/linear-pivot.webp"),
    gallery: [m("img/linear-pivot.webp"), m("img/pivot-long.webp")],
    keySpec: { en: "Rectangular fields", ar: "للحقول المستطيلة" },
    specs: [
      { label: { en: "Coverage", ar: "التغطية" }, value: { en: "Rectangular, edge to edge", ar: "مستطيلة من الطرف إلى الطرف" } },
      { label: { en: "Control", ar: "التحكم" }, value: "iControl" },
    ],
  },
  {
    slug: "western-small-field-pivot",
    category: "irrigation",
    brand: "western",
    name: "Western Small Field Pivot",
    type: { en: "Small-field pivot", ar: "ري محوري للحقول الصغيرة" },
    summary: {
      en: "Pivot efficiency for smaller farms, with a lower entry cost and simple operation.",
      ar: "كفاءة الري المحوري للمزارع الصغيرة بتكلفة أقل وتشغيل بسيط.",
    },
    image: m("img/pivot-small.webp"),
    gallery: [m("img/pivot-small.webp"), m("img/pivot-pink.webp")],
    keySpec: { en: "For smaller farms", ar: "للمزارع الصغيرة" },
    specs: [
      { label: { en: "Coverage", ar: "التغطية" }, value: { en: "Small circles", ar: "دوائر صغيرة" } },
      { label: { en: "Control", ar: "التحكم" }, value: "iControl" },
    ],
  },
  {
    slug: "western-icontrol-remote",
    category: "irrigation",
    brand: "western",
    name: "iControl Remote",
    type: { en: "Pivot control & monitoring", ar: "التحكم والمراقبة عن بُعد" },
    summary: {
      en: "Monitor and run your pivots from your phone — status, alarms and start/stop without driving to the field.",
      ar: "راقب وشغّل أنظمة الري من هاتفك — الحالة والتنبيهات والتشغيل والإيقاف دون الذهاب إلى الحقل.",
    },
    image: m("img/icontrol-sunset.webp"),
    gallery: [m("img/icontrol-sunset.webp"), m("img/icontrol-field.webp"), m("img/icontrol-open.webp")],
    keySpec: { en: "Remote monitoring", ar: "مراقبة عن بُعد" },
    specs: [
      { label: { en: "Function", ar: "الوظيفة" }, value: { en: "Remote start/stop, status, alarms", ar: "تشغيل وإيقاف عن بُعد، الحالة، التنبيهات" } },
      { label: { en: "Panels", ar: "اللوحات" }, value: "iControl Standard" },
    ],
  },
  /* ───────────── Arcusin ───────────── */
  {
    slug: "arcusin-autostack-xp",
    category: "bale-handling",
    brand: "arcusin",
    name: "AutoStack XP",
    type: { en: "Bale collector-stacker", ar: "جامع ورافع بالات" },
    summary: {
      en: "Collects small square bales and builds tight stacks automatically — one operator clears the field.",
      ar: "يجمع البالات المربعة الصغيرة ويرصّها آلياً في كتل محكمة — سائق واحد يفرغ الحقل.",
    },
    image: m("img/bale-stack.webp"),
    gallery: [m("img/bale-stack.webp"), m("img/bale-stack-2.webp")],
    flagship: true,
    keySpec: { en: "Collect · pack · stack", ar: "جمع · حزم · رصّ" },
    specs: [
      { label: { en: "Bales", ar: "البالات" }, value: { en: "Small square", ar: "مربعة صغيرة" } },
      { label: { en: "Operation", ar: "التشغيل" }, value: { en: "Tractor-drawn, one operator", ar: "مقطور بجرار، سائق واحد" } },
    ],
  },
  {
    slug: "arcusin-grabpack",
    category: "bale-handling",
    brand: "arcusin",
    name: "GrabPack",
    type: { en: "Bale grab", ar: "ماسك بالات" },
    summary: { en: "Loads packs of bales onto trucks fast and safely.", ar: "تحميل حزم البالات على الشاحنات بسرعة وأمان." },
    image: m("img/bale-stack-2.webp"),
    gallery: [m("img/bale-stack-2.webp")],
    keySpec: { en: "Loader attachment", ar: "ملحق للودر" },
    specs: [{ label: { en: "Use", ar: "الاستخدام" }, value: { en: "Loading bale packs", ar: "تحميل حزم البالات" } }],
  },
  {
    slug: "arcusin-forstack",
    category: "bale-handling",
    brand: "arcusin",
    name: "ForStack",
    type: { en: "Bale stacking fork", ar: "شوكة رصّ البالات" },
    summary: { en: "Stacks and moves bale blocks in the yard or field.", ar: "رصّ ونقل كتل البالات في الساحة أو الحقل." },
    image: m("img/baler-pivot-2.webp"),
    gallery: [m("img/baler-pivot-2.webp")],
    keySpec: { en: "Yard & field stacking", ar: "رصّ في الساحة والحقل" },
    specs: [{ label: { en: "Use", ar: "الاستخدام" }, value: { en: "Stacking bale blocks", ar: "رصّ كتل البالات" } }],
  },
  /* ───────────── Seeds & fertilizers ───────────── */
  {
    slug: "alfalfa-seeds",
    category: "seeds-fertilizers",
    brand: "ghargrow",
    name: "Alfalfa Seeds",
    type: { en: "Forage seed", ar: "بذور أعلاف" },
    summary: {
      en: "Alfalfa seed for multi-cut, high-protein forage under pivot irrigation.",
      ar: "بذور برسيم لأعلاف عالية البروتين متعددة الحشّات تحت الري المحوري.",
    },
    image: m("img/seeds-alfalfa.webp"),
    gallery: [m("img/seeds-alfalfa.webp"), m("img/pivot-circles.webp")],
    keySpec: { en: "Multi-cut forage", ar: "علف متعدد الحشّات" },
    specs: [{ label: { en: "Crop", ar: "المحصول" }, value: { en: "Alfalfa (lucerne)", ar: "برسيم حجازي" } }],
  },
  {
    slug: "sulphur-bentonite-90",
    category: "seeds-fertilizers",
    brand: "ghargrow",
    name: "Sulphur Bentonite 90",
    type: { en: "Fertilizer", ar: "سماد" },
    summary: {
      en: "90% elemental sulphur granules that lower soil pH and unlock nutrients in alkaline soils.",
      ar: "حبيبات كبريت عنصري بنسبة 90% تخفض حموضة التربة وتحرر العناصر الغذائية في الترب القلوية.",
    },
    image: m("img/fertilizer.webp"),
    gallery: [m("img/fertilizer.webp"), m("img/fertilizer-2.webp")],
    keySpec: { en: "90% sulphur", ar: "90% كبريت" },
    specs: [{ label: { en: "Sulphur content", ar: "نسبة الكبريت" }, value: "90%" }],
  },
];

export const productsIn = (c: CategorySlug) => products.filter((p) => p.category === c);
export const findProduct = (slug: string) => products.find((p) => p.slug === slug);
export const findCategory = (slug: string) => categories.find((c) => c.slug === slug);
export const productHref = (p: Product) => `/products/${p.category}/${p.slug}`;
