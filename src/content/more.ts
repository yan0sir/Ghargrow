import type { L } from "@/lib/i18n";
import type { CategorySlug } from "./catalog";

const m = (p: string) => `/media/${p}`;

/* ───────────── Spare parts (from the current ghargrow.com list) ───────────── */
export type PartSystem = "pivot" | "tractor" | "baler" | "general";
export type Part = { id: string; name: L; system: PartSystem; fits?: string; image?: string };

export const partSystems: { id: PartSystem; label: L }[] = [
  { id: "pivot", label: { en: "Pivot irrigation", ar: "الري المحوري" } },
  { id: "tractor", label: { en: "CLAAS tractors", ar: "جرارات CLAAS" } },
  { id: "baler", label: { en: "Balers", ar: "المكابس" } },
  { id: "general", label: { en: "General", ar: "عام" } },
];

const p = (id: string, en: string, ar: string, system: PartSystem, image?: string, fits?: string): Part => ({
  id,
  name: { en, ar },
  system,
  image: image ? m(`img/part-${image}.webp`) : undefined,
  fits,
});

export const parts: Part[] = [
  p("center-drive-motor", "Center Drive Motor", "محرك الدفع المركزي", "pivot", "center-drive"),
  p("gearbox", "Gearbox", "علبة التروس", "pivot", "gearbox"),
  p("coupler", "Coupler", "وصلة القارنة", "pivot", "coupler"),
  p("bkt-tire", "BKT Tire", "إطار BKT", "pivot", "tire"),
  p("sprinkler-iwob2", "Sprinklers I-Wob2", "رشاشات I-Wob2", "pivot", "sprinkler"),
  p("icontrol-standard", "iControl Standard", "لوحة iControl Standard", "pivot", "icontrol-panel"),
  p("tower-box", "Tower Box", "صندوق البرج", "pivot", "tower-box"),
  p("collector-ring", "Collector Ring", "الحلقة المجمعة", "pivot", "collector-ring"),
  p("up3-nozzle", "UP3 Nozzle", "فوهة UP3", "pivot", "nozzles"),
  p("microswitch", "Microswitch", "مفتاح دقيق", "pivot", "microswitch"),
  p("pressure-regulator", "Pressure Regulator", "منظم الضغط", "pivot", "pressure-regulator"),
  p("contactor", "Contactor", "قاطع كهربائي (كونتاكتور)", "pivot", "contactor"),
  p("worm-gear", "Worm Gear & Shaft", "ترس دودي وعمود", "pivot", "worm-gear"),
  p("bevel-gear", "Bevel Gear", "ترس مخروطي", "pivot", "bevel-gear"),
  p("air-vacuum-valve", "Air-Vacuum Valve", "صمام الهواء والتفريغ", "pivot", "air-valve"),
  p("percentage-timer", "Percentage Timer", "مؤقت النسبة المئوية", "pivot", "timer"),
  p("cabin-air-filter", "Primary Cabin Air Filter", "فلتر هواء الكابينة الرئيسي", "tractor", "cabin-filter"),
  p("primary-hydraulic-filter", "Primary Hydraulic Filter", "فلتر الهيدروليك الرئيسي", "tractor", "hydraulic-filter"),
  p("diesel-filter-axion930", "Secondary Diesel Fuel Filter", "فلتر الديزل الثانوي", "tractor", "fuel-filter", "CLAAS AXION 930"),
  p("main-hydraulic-filter-arion620", "Main Hydraulic Filter", "فلتر الهيدروليك الأساسي", "tractor", "main-filter", "CLAAS ARION 620"),
  p("isosys-filter-axion930", "ISOSYS Hydraulic Circuit Filter", "فلتر دائرة الهيدروليك ISOSYS", "tractor", undefined, "CLAAS AXION 930"),
  p("pickup-sprocket-markant", "Pickup Chain Sprocket with Gearbox", "ترس سلسلة اللاقط مع علبة التروس", "baler", "sprocket", "CLAAS MARKANT 650"),
  p("pickup-cylinder-markant", "Pickup Cylinder (Piston Rod)", "اسطوانة اللاقط (ذراع المكبس)", "baler", "pickup-cylinder", "CLAAS MARKANT 55 & 650"),
  p("rubber-coupling-markant", "Rubber Coupling", "وصلة مطاطية", "baler", "rubber-coupling", "CLAAS MARKANT 55 & 650"),
  p("pulley", "Pulley", "بكرة", "baler", "pulley"),
  p("bearing", "Bearing", "رولمان (محمل)", "general", "bearing"),
  p("thermal-grease-ep2", "Thermal Grease EP2", "شحم حراري EP2", "general", "grease", "All agricultural machinery"),
];

/* ───────────── Services ───────────── */
export type Service = { id: string; num: string; title: L; short: L; body: L; points: L[]; image: string };

export const services: Service[] = [
  {
    id: "after-sales",
    num: "01",
    title: { en: "After-sales service", ar: "خدمة ما بعد البيع" },
    short: { en: "Ongoing support to ensure your equipment performs at its best.", ar: "دعم مستمر لضمان أفضل أداء لمعداتك." },
    body: {
      en: "Support doesn't end at delivery. Our technicians come to your farm, diagnose quickly and keep your machines and pivots running through the season.",
      ar: "الدعم لا ينتهي عند التسليم. فنيونا يصلون إلى مزرعتك، يشخّصون بسرعة ويحافظون على عمل معداتك وأنظمة الري طوال الموسم.",
    },
    points: [
      { en: "On-site support across our three branches", ar: "دعم ميداني عبر فروعنا الثلاثة" },
      { en: "Technical advice by phone and WhatsApp", ar: "استشارة فنية عبر الهاتف وواتساب" },
      { en: "Genuine spare parts in stock", ar: "قطع غيار أصلية متوفرة" },
    ],
    image: m("img/og-s-after-sales.webp"),
  },
  {
    id: "training",
    num: "02",
    title: { en: "Product training", ar: "التدريب على المنتجات" },
    short: { en: "Practical training to help farmers operate with confidence.", ar: "تدريب عملي يساعد المزارعين على التشغيل بثقة." },
    body: {
      en: "Certified engineers and product specialists train your operators on installation, operation and daily maintenance — so every machine performs from day one.",
      ar: "مهندسون معتمدون وأخصائيو منتجات يدربون مشغليك على التركيب والتشغيل والصيانة اليومية — ليعمل كل جهاز بكفاءة من اليوم الأول.",
    },
    points: [
      { en: "Operator training at handover", ar: "تدريب المشغلين عند التسليم" },
      { en: "Pivot panel and iControl training", ar: "تدريب على لوحات الري وiControl" },
      { en: "Safe operation and daily checks", ar: "التشغيل الآمن والفحوصات اليومية" },
    ],
    image: m("img/og-s-training.webp"),
  },
  {
    id: "maintenance",
    num: "03",
    title: { en: "Maintenance", ar: "الصيانة" },
    short: { en: "Reliable care to maximize efficiency and minimize downtime.", ar: "عناية موثوقة لرفع الكفاءة وتقليل التوقف." },
    body: {
      en: "Scheduled inspections, preventive maintenance and complete overhauls that protect your investment and avoid downtime at harvest.",
      ar: "فحوصات مجدولة وصيانة وقائية وإصلاحات شاملة تحمي استثمارك وتمنع التوقف في موسم الحصاد.",
    },
    points: [
      { en: "Pre-season inspections", ar: "فحوصات ما قبل الموسم" },
      { en: "Preventive maintenance plans", ar: "خطط صيانة وقائية" },
      { en: "Full system overhauls", ar: "إصلاح شامل للأنظمة" },
    ],
    image: m("img/og-s-maintenance.webp"),
  },
];

/* ───────────── Projects (Ghargrow's own field work, from the media library) ───────────── */
export type Project = {
  slug: string;
  title: L;
  place: L;
  type: L;
  summary: L;
  story: L[];
  cover: string;
  gallery: string[];
  products: string[];
  coords?: { lon: number; lat: number };
};

/* TODO(client): confirm farm names, exact locations, areas and dates before publishing. */
export const projects: Project[] = [
  {
    slug: "alfalfa-baling-under-pivots",
    title: { en: "Alfalfa baling under pivots", ar: "كبس البرسيم تحت أنظمة الري المحوري" },
    place: { en: "Libya", ar: "ليبيا" },
    type: { en: "Machinery · Forage", ar: "معدات · أعلاف" },
    summary: {
      en: "CLAAS MARKANT balers working alfalfa cut between Western pivots — from swath to stacked bale.",
      ar: "مكابس CLAAS MARKANT تعمل في البرسيم المحشوش بين أنظمة Western المحورية — من الصف إلى البالة المرصوصة.",
    },
    story: [
      {
        en: "Alfalfa grown under centre pivots gives several cuts a year. Each cut has to be baled at the right moisture, quickly, before the next irrigation pass.",
        ar: "يعطي البرسيم المزروع تحت الري المحوري عدة حشّات في السنة، ويجب كبس كل حشّة بالرطوبة المناسبة وبسرعة قبل دورة الري التالية.",
      },
      {
        en: "Our team supplied and serviced the balers, trained the operators and keeps the wear parts — pick-up cylinders, sprockets, couplings — in stock for the season.",
        ar: "قام فريقنا بتوريد المكابس وصيانتها وتدريب المشغلين، ويوفر قطع الغيار المستهلكة — اسطوانات اللاقط والتروس والوصلات — طوال الموسم.",
      },
    ],
    cover: m("img/baler-pivot.webp"),
    gallery: [m("img/aerial-baler.webp"), m("img/baler-pivot-2.webp"), m("img/bale-stack.webp"), m("img/team-line.webp"), m("img/markant-close.webp"), m("img/aerial-field.webp")],
    products: ["claas-markant-650", "western-center-pivot", "arcusin-autostack-xp"],
    coords: { lon: 21.0, lat: 29.6 },
  },
  {
    slug: "green-circles",
    title: { en: "Green circles in the desert", ar: "دوائر خضراء في الصحراء" },
    place: { en: "Southern Libya", ar: "جنوب ليبيا" },
    type: { en: "Irrigation", ar: "ري" },
    summary: {
      en: "Centre pivots turning sand into productive forage and grain fields.",
      ar: "أنظمة ري محورية تحوّل الرمال إلى حقول أعلاف وحبوب منتجة.",
    },
    story: [
      {
        en: "From the air, each pivot is a perfect green circle. On the ground, it is a carefully designed system: spans, sprinkler package and pressure matched to the soil and the well.",
        ar: "من الجو تبدو كل منظومة دائرة خضراء مثالية. وعلى الأرض هي نظام مصمم بعناية: امتدادات وحزمة رشاشات وضغط يناسب التربة والبئر.",
      },
      {
        en: "Ghargrow designs the layout, installs the pivots and keeps them running with local spare parts and maintenance.",
        ar: "تصمم غرغار المخطط وتركّب الأنظمة وتحافظ على تشغيلها بقطع غيار وصيانة محلية.",
      },
    ],
    cover: m("img/pivot-circles.webp"),
    gallery: [m("img/pivot-circles.webp"), m("img/pivot-spray.webp"), m("img/pivot-sunrise.webp"), m("img/icontrol-field.webp")],
    products: ["western-center-pivot", "western-icontrol-remote", "alfalfa-seeds"],
    coords: { lon: 14.9, lat: 26.7 },
  },
  {
    slug: "expo-libya-2024",
    title: { en: "Expo Libya & MENA Food and Agro Expo", ar: "معرض ليبيا ومعرض مينا للأغذية والزراعة" },
    place: { en: "Libya", ar: "ليبيا" },
    type: { en: "Events", ar: "فعاليات" },
    summary: {
      en: "Our pavilion, live pivot display and partnership signing with farmers and investors.",
      ar: "جناحنا وعرض الري المحوري الحي وتوقيع الشراكات مع المزارعين والمستثمرين.",
    },
    story: [
      {
        en: "We brought the field to the exhibition: a working pivot outside, parts and panels inside, and our engineers on hand to answer every question.",
        ar: "أحضرنا الحقل إلى المعرض: نظام ري يعمل في الخارج، وقطع غيار ولوحات في الداخل، ومهندسونا حاضرون للإجابة عن كل سؤال.",
      },
    ],
    cover: m("img/expo-booth.webp"),
    gallery: [m("img/expo-booth.webp"), m("img/expo-pivot.webp"), m("img/signing-1.webp"), m("img/expo-team.webp"), m("img/expo-film.webp")],
    products: ["western-center-pivot"],
    coords: { lon: 20.07, lat: 32.12 },
  },
];

/* ───────────── News ───────────── */
export type Post = { slug: string; date: string; title: L; excerpt: L; body: L[]; cover: string; gallery?: string[] };

/* TODO(client): confirm dates and copy. */
export const posts: Post[] = [
  {
    slug: "mena-food-agro-expo-signing",
    date: "2024",
    title: { en: "Signing ceremony at MENA Food & Agro Expo", ar: "حفل توقيع في معرض مينا للأغذية والزراعة" },
    excerpt: {
      en: "Ghargrow signed new partnership agreements on the expo stage.",
      ar: "وقّعت غرغار اتفاقيات شراكة جديدة على منصة المعرض.",
    },
    body: [
      {
        en: "At the MENA Food & Agro Expo, Ghargrow's leadership signed agreements that strengthen our ability to supply and support farmers across Libya.",
        ar: "خلال معرض مينا للأغذية والزراعة، وقّعت إدارة غرغار اتفاقيات تعزز قدرتنا على توريد ودعم المزارعين في جميع أنحاء ليبيا.",
      },
    ],
    cover: m("img/signing-2.webp"),
    gallery: [m("img/signing-1.webp"), m("img/signing-3.webp")],
  },
  {
    slug: "expo-libya-pavilion",
    date: "2024",
    title: { en: "Our pavilion at Expo Libya", ar: "جناحنا في معرض ليبيا" },
    excerpt: {
      en: "A living green pavilion, a working pivot and four days of conversations with farmers.",
      ar: "جناح أخضر حيّ ونظام ري يعمل وأربعة أيام من الحوار مع المزارعين.",
    },
    body: [
      {
        en: "Visitors explored CLAAS and Western solutions, spare parts and the iControl panel, and met our engineers face to face.",
        ar: "استكشف الزوار حلول CLAAS وWestern وقطع الغيار ولوحة iControl، والتقوا بمهندسينا وجهاً لوجه.",
      },
    ],
    cover: m("img/expo-booth-2.webp"),
    gallery: [m("img/expo-team-2.webp"), m("img/expo-outdoor.webp"), m("img/expo-meeting.webp")],
  },
  {
    slug: "new-pivot-shipment",
    date: "2024",
    title: { en: "New pivot shipment arrives", ar: "وصول شحنة أنظمة ري جديدة" },
    excerpt: {
      en: "Our installation team unloaded a new shipment of Western pivot spans and towers.",
      ar: "أفرغ فريق التركيب شحنة جديدة من امتدادات وأبراج Western.",
    },
    body: [
      {
        en: "Spans, towers and drive trains are now in our warehouse and ready for installation this season. Talk to us to reserve your system.",
        ar: "الامتدادات والأبراج ووحدات الدفع أصبحت في مستودعنا وجاهزة للتركيب هذا الموسم. تواصل معنا لحجز نظامك.",
      },
    ],
    cover: m("img/pivot-long.webp"),
  },
];

/* ───────────── Careers ───────────── */
export type Job = { slug: string; title: L; team: L; place: L; type: L; summary: L; duties: L[] };

/* TODO(client): only the Accountant role appears in the "We are hiring" post; confirm team, location and duties. */
export const jobs: Job[] = [
  {
    slug: "accountant",
    title: { en: "Accountant", ar: "محاسب" },
    team: { en: "Finance", ar: "المالية" },
    place: { en: "Benghazi", ar: "بنغازي" },
    type: { en: "Full-time", ar: "دوام كامل" },
    summary: {
      en: "Keep our books accurate as we grow across three branches.",
      ar: "حافظ على دقة حساباتنا مع توسعنا عبر ثلاثة فروع.",
    },
    duties: [
      { en: "Day-to-day bookkeeping and reconciliations", ar: "مسك الدفاتر اليومي والمطابقات" },
      { en: "Supplier and customer accounts", ar: "حسابات الموردين والعملاء" },
      { en: "Monthly reporting", ar: "التقارير الشهرية" },
    ],
  },
];

/* ───────────── Find-your-machine quiz ───────────── */
export type QuizOption = { id: string; label: L; scores: Record<string, number> };
export type QuizQuestion = { id: string; q: L; options: QuizOption[] };

export const quiz: QuizQuestion[] = [
  {
    id: "task",
    q: { en: "What do you need to do?", ar: "ما الذي تحتاج إلى إنجازه؟" },
    options: [
      { id: "irrigate", label: { en: "Irrigate my land", ar: "ري أرضي" }, scores: { "western-center-pivot": 5, "western-linear-pivot": 3, "western-small-field-pivot": 3, "western-icontrol-remote": 2 } },
      { id: "till", label: { en: "Till, sow & haul", ar: "الحراثة والزراعة والنقل" }, scores: { "claas-axion-820": 5, "claas-arion-640c": 4 } },
      { id: "forage", label: { en: "Cut & bale forage", ar: "حشّ وكبس الأعلاف" }, scores: { "claas-markant-650": 4, "claas-quadrant-5200-evo": 3, "claas-disco-9300": 3, "claas-liner-2800": 3, "arcusin-autostack-xp": 2 } },
      { id: "grain", label: { en: "Harvest grain", ar: "حصاد الحبوب" }, scores: { "claas-dominator-260": 6 } },
    ],
  },
  {
    id: "crop",
    q: { en: "What do you grow?", ar: "ماذا تزرع؟" },
    options: [
      { id: "alfalfa", label: { en: "Alfalfa / forage", ar: "برسيم / أعلاف" }, scores: { "claas-markant-650": 2, "claas-disco-9300": 2, "arcusin-autostack-xp": 2, "alfalfa-seeds": 3, "western-center-pivot": 1 } },
      { id: "wheat", label: { en: "Wheat / barley", ar: "قمح / شعير" }, scores: { "claas-dominator-260": 3, "claas-axion-820": 1 } },
      { id: "veg", label: { en: "Vegetables / potatoes", ar: "خضروات / بطاطا" }, scores: { "western-small-field-pivot": 2, "claas-arion-640c": 2 } },
      { id: "mixed", label: { en: "Mixed", ar: "مختلط" }, scores: { "claas-axion-820": 1, "western-center-pivot": 1 } },
    ],
  },
  {
    id: "size",
    q: { en: "How big is your farm?", ar: "ما حجم مزرعتك؟" },
    options: [
      { id: "s", label: { en: "Under 50 ha", ar: "أقل من 50 هكتار" }, scores: { "western-small-field-pivot": 3, "claas-arion-640c": 2, "claas-disco-3600": 2, "claas-markant-650": 1 } },
      { id: "m", label: { en: "50 – 300 ha", ar: "50 – 300 هكتار" }, scores: { "western-center-pivot": 2, "claas-axion-820": 2, "claas-markant-650": 2, "claas-liner-2800": 1 } },
      { id: "l", label: { en: "Over 300 ha", ar: "أكثر من 300 هكتار" }, scores: { "western-center-pivot": 2, "western-linear-pivot": 2, "claas-quadrant-5200-evo": 3, "claas-disco-9300": 2, "arcusin-autostack-xp": 2, "western-icontrol-remote": 2 } },
    ],
  },
  {
    id: "region",
    q: { en: "Where is your farm?", ar: "أين تقع مزرعتك؟" },
    options: [
      { id: "benghazi", label: { en: "East (Benghazi)", ar: "الشرق (بنغازي)" }, scores: {} },
      { id: "jalu", label: { en: "Oases (Jalu)", ar: "الواحات (جالو)" }, scores: {} },
      { id: "sabha", label: { en: "South (Sabha)", ar: "الجنوب (سبها)" }, scores: {} },
    ],
  },
];

export const categoryOfFeature = (c: CategorySlug) => c;
