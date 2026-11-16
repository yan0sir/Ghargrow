# Ghargrow Website — Implementation Plan

> Companion to `website-brief.md`. Ideation v1 · 2026-11-13
> Stack: **Next.js (App Router, TypeScript) · Tailwind CSS · GSAP (ScrollTrigger, SplitText) · Lenis · Lottie · Sanity (headless CMS) · Vercel**

Each phase ends in something that can be deployed and reviewed. Build order: **foundation → content model → core pages → signature motion → interactives → polish → launch.**

---

## Phase 0 — Asset preparation (runs alongside Phase 1)

| Task | Detail |
|---|---|
| 0.1 Logo kit | Pick the final variants from `ALL GHARGROW LOGOS SVG/1–10.svg`: horizontal and stacked versions in green, black and white, and the mark alone. Optimize with SVGO (the files are about 150KB each and should drop to under 15KB). Split the two leaves into separate paths so the loader and footer can animate the bloom. |
| 0.2 Footage selection | Shortlist clips: the hero drone pass (`CLAAS CONTENT/wetransfer_claas-dji-1…/DJI_*.mov`), pivot drone (`NEW PIVOT ARRIVAL.mov`, `PIVOTS/`) and baler drone (`صور كباسة درون`). Confirm the licence for AdobeStock and YouTube clips. |
| 0.3 Frame sequences | Use ffmpeg to export the hero and flagship-product scrub sequences. Desktop gets about 150 frames at 1920w AVIF/WebP and mobile about 60 frames at 828w, named `hero/0001.avif…`. Target a total under 6MB on desktop and 2MB on mobile. |
| 0.4 Cutouts | Remove backgrounds on machine photos (AXION, DOMINATOR, QUADRANT, DISCO, LINER, MARKANT, AutoStack, pivot tower) and export transparent AVIF/WebP at two sizes. |
| 0.5 Layered tractor art | Commission or produce the layered tractor for the Attachment Swap: body, front wheel, rear wheel and 3 implements (DISCO, LINER, MARKANT) as separate aligned PNG/SVG. |
| 0.6 Illustration | Produce the Field Journey illustration: a tall SVG field, a track path and 5 station vignettes, plus the Lottie JSON for the driving tractor (After Effects with Bodymovin). Draw the crop-growth stems (wheat, alfalfa, corn) as SVG paths for draw-on and grow. |
| 0.7 Content capture | Collect specs from the CLAAS PDFs. Get the EN/AR copy from the Profile PDFs. Get answers to the brief §7 open questions. |

---

## Phase 1 — Scaffolding and foundation

1. **Repo and tooling:** `create-next-app` (TS, App Router, ESLint), Prettier, Tailwind, path aliases, Husky with lint-staged. Deploy to Vercel with preview deploys per PR.
2. **i18n routing:** `/[locale]` segment with `en` and `ar`, using middleware for locale detection and `next-intl` (or a small custom dictionary) for UI strings. Set `<html lang dir>` per locale.
3. **Design tokens:** colors, type scale, spacing and grid from brief §2 as CSS variables with a Tailwind theme mapping. Use **logical properties only**, and add a Tailwind RTL check in lint.
4. **Fonts:** `next/font` for Geist, Geist Mono, Inter and IBM Plex Sans Arabic, subset and preloaded per locale.
5. **Motion infrastructure:**
   - A `SmoothScroll` provider (Lenis) synced to the GSAP ticker and ScrollTrigger.
   - A `useGsap` hook with context cleanup on route change.
   - A global `reducedMotion` store fed by `prefers-reduced-motion` plus the footer "Lighter mode" toggle, persisted in localStorage.
   - A shared `<ScrollSequence>` component: canvas frame-sequence player with chunked preloading, DPR-aware sizing, mobile and desktop sets, and a poster fallback.
6. **Layout shell:** Header (transparent to solid, mega-menu, mobile overlay, EN/AR toggle), Footer, floating contact pill, page transitions (a simple fade or wipe in green).
7. **Base components:** Button (with text-roll hover), Link, Section, Container, Eyebrow/Label (mono), DisplayHeading (SplitText reveal), SpecCard, Tabs (segmented), ProductCard, BrandBadge, Hotspot, Toast.
8. **Contact Sheet:** a global context `openContact({ product?, part?, service?, source })` that renders the sheet or panel (WhatsApp deep link builder with locale-aware pre-filled text, branch call list, inquiry form). Analytics events fire on every action.

**Done when:** an empty bilingual shell deploys with header, footer, tokens, smooth scroll and a working Contact Sheet.

---

## Phase 2 — CMS and content model (Sanity)

Schemas, all with **EN/AR field-level localization**:
- `brand` (name, logo, distributor label, description)
- `category` (title, slug, hero media, intro, interactive type enum)
- `product` (title, slug, brand, category, cutout, gallery, scroll-sequence ref, highlights[tabs], hotspots[], specs[], brochure PDF, related parts, related products, flagship flag)
- `sparePart` (name, system, compatible models[], image, SKU optional)
- `service` (title, steps, includes, media)
- `project` (title, slug, location with coordinates, region, type, crop, area, products used, gallery, story)
- `branch` (city, phone, WhatsApp, coordinates, address, hours)
- `newsPost`, `job`, `quiz` (questions, options, scoring → products), `siteSettings` (WhatsApp default number, social links, SEO defaults)
- `inquiry` (written by the form API: name, phone, branch, product, message, source page, locale, timestamp)

Tasks:
1. Set up Sanity Studio (embedded at `/studio` or as a separate deploy) with EN/AR editor roles.
2. Write GROQ queries with typed results (via `sanity-typegen`) and ISR revalidation through a webhook.
3. **Seed content** from the old site: 5 categories, 7 machinery items, 4 irrigation items, 3 Arcusin items, 2 seed and fertilizer items, 26 spare parts, 3 services and 3 branches. Apply the content fixes in brief §6.
4. Build the inquiry API route (`/api/inquiry`): validation (zod), rate limiting, a honeypot, an email to the configured inbox (Resend), and a write to Sanity.

---

## Phase 3 — Core pages (static layout first, motion later)

Build each page with real CMS data and responsive EN/AR layouts **before** adding the heavy motion.

| # | Page | Key work |
|---|---|---|
| 3.1 | **Home (structure)** | All 15 sections from brief §4.1 with static placeholders where the signature scenes will go |
| 3.2 | **Products hub** | Category tabs, brand filter, card grids |
| 3.3 | **Category template** | Hero, badge, grid and a slot for the interactive feature |
| 3.4 | **Product detail template** | Hero, highlights tabs, hotspots, spec grid with full table, gallery, downloads, related products, mobile sticky CTA bar |
| 3.5 | **Spare parts** | Client-side instant search (Fuse.js), filters, rows with WhatsApp action, "send a photo" band |
| 3.6 | **Services** | Sticky image with scrolling copy, steps, training request |
| 3.7 | **Projects** | Index with filters and the editorial grid, plus the detail page |
| 3.8 | **About** | Story with inline photos, mission, brands, branches |
| 3.9 | **News** | Index and article pages |
| 3.10 | **Careers** | List, role page and application form (CV upload to Sanity assets or email) |
| 3.11 | **Contact** | Branch cards, form, map slot |
| 3.12 | **Legal** | Privacy, terms and accessibility pages |

**Done when:** the whole site is navigable in EN and AR with real content and works end to end with WhatsApp, Call and the form.

---

## Phase 4 — Signature motion

Build in this order, so the highest impact lands first.

1. **Hero tractor scrub (Home):** a pinned section that uses `<ScrollSequence>` with the drone frames. "Grow with Trust" uses SplitText, and the words part around the tractor using an overlapping cutout and z-layering (ZettaJoule). Subline and CTAs fade in at about 70% progress. Mobile gets the short sequence. In reduced motion, show a poster and static headline.
2. **Line motif and section reveals (global):** SVG furrow lines draw on scroll (`DrawSVG`-style via stroke-dashoffset), and headings reveal line by line.
3. **Leaf-bloom loader and footer bloom:** the logo leaves scale and rotate from the stem, then the wordmark fades in. The loader shows once per session and never blocks LCP.
4. **Crop growth (POLA-style):** SVG stems grow (path draw combined with scaleY from the base) and leaves unfurl in stagger. A reusable `<GrowingCrops variant="wheat|alfalfa|corn">` is used as section transitions and in the About mission block.
5. **Attachment Swap (Home and the Tractors category):** a sticky container with layered tractor parts. Wheel rotation is tied to scroll progress (`rotation = progress * N * 360`), with a slight body bob. Implements cross-fade and slide in per step, with the copy and CTA for each step. It has 3 steps (DISCO → LINER → MARKANT/QUADRANT), and in RTL the direction is mirrored.
6. **Field Journey (Home):** the tall SVG background and the Lottie tractor scrubbed via `lottie.goToAndStop(progress * totalFrames, true)`, with the tractor following the track (MotionPath plugin or baked into the Lottie). Station hotspots open the category previews. On mobile the illustration is narrower and taller.
7. **Product scroll showcases (flagships):** a pinned frame sequence or video scrub with timed feature callouts, for 5 flagship products.
8. **Micro-interactions:** button text-roll, product card hover angle swap, partner logo hover from monochrome to color, magnetic CTA on desktop.

**Performance guardrails for every scene:** lazy-init on approach (IntersectionObserver), a single rAF loop via the GSAP ticker, `will-change` only while active, kill the ScrollTrigger on unmount, and a test on a mid-range Android over throttled 4G.

---

## Phase 5 — Interactive tools

1. **Pivot Coverage Simulator (Irrigation category and Home teaser)**
   - SVG top-down view: field, a pivot center, spans and a sweeping arm (GSAP rotation loop).
   - Controls: pivot type (Center / Small-field / Linear) and a span count or length slider. The end gun toggle is optional.
   - Live math: radius gives area as π·r² in hectares (and m × length for a linear system). Readouts tick in the mono style.
   - CTA opens the Contact Sheet pre-filled with the configuration ("Center pivot, 6 spans, ≈ 52 ha").
   - The formulas and span lengths must be confirmed with Ghargrow's Western specs. Use placeholder constants until then.
2. **Find-Your-Machine Quiz**
   - Questions are CMS-driven, and each option has weights mapped to products. Steps: crop → farm size → task → region.
   - Full-screen dark green flow with keyboard and touch support, ending in a results page with 1–3 product cards, the nearest branch and WhatsApp/Call.
   - Answers are passed into the inquiry (`source: quiz`).
3. **Libya Map**
   - A stylized SVG of Libya (simplified outline) with branch and project pins from the CMS coordinates, with no third-party map tiles, so it stays light. Pins open a card with phone, WhatsApp and nearby projects, and a "nearest branch" option uses opt-in geolocation.
   - It is reused on Home, About and Contact.
4. **Hotspots on product pages:** CMS-defined x/y percentage positions, with an accessible button and panel.

---

## Phase 6 — SEO, analytics and accessibility

- **SEO:** per-page metadata from the CMS, `hreflang` en/ar, sitemap.xml, robots, canonical URLs, OpenGraph images (dynamic `next/og` with the cutout and model name), and JSON-LD (`Organization`, `LocalBusiness` per branch, `Product`, `BreadcrumbList`, `JobPosting`, `NewsArticle`). Set up 301 redirects from the old Wix URLs (`/projects-1` → `/en/products/irrigation`, etc.).
- **Analytics:** GA4 or Plausible with events for `whatsapp_click`, `call_click`, `inquiry_submit`, `quiz_complete`, `simulator_quote` and `brochure_download`, each carrying product, branch and locale.
- **Accessibility:** WCAG 2.2 AA. Check color contrast (green on sand needs to be verified for small text), keyboard paths through the sheet, quiz, simulator and hotspots, and focus traps. Every pinned scene needs a text equivalent, and reduced motion must disable all scrubs.
- **Performance:** Lighthouse mobile score of at least 85 and CWV passing. Images go through `next/image` as AVIF, video is self-hosted as HLS or MP4 with posters, and fonts are subset.

---

## Phase 7 — QA and launch

1. Cross-browser and device matrix: iOS Safari, Android Chrome (mid-range), desktop Chrome, Safari and Edge, with an **RTL pass** on every page.
2. Content QA in Arabic with a native reviewer, plus spec verification against the brochures.
3. Test that the form and WhatsApp deliver to the real numbers and inbox.
4. Do a soft launch on a staging domain and get stakeholder review.
5. DNS cutover from Wix, verify redirects, submit to Search Console and set up uptime monitoring.
6. Hand over a CMS editor guide (EN/AR) to the Ghargrow team.

---

## Suggested milestone order

| Milestone | Contents | Reviewable output |
|---|---|---|
| M1 | Phase 0 (assets started) and Phase 1 | Bilingual shell, tokens, Contact Sheet |
| M2 | Phase 2 and Phases 3.1–3.4 | Home structure, products and product pages with real data |
| M3 | Phases 3.5–3.12 | Full site navigable and converting (static) |
| M4 | Phases 4.1–4.4 | Hero scrub, loader, growth, line motif |
| M5 | Phases 4.5–4.8 | Attachment Swap, Field Journey, flagship showcases |
| M6 | Phase 5 | Simulator, quiz, map |
| M7 | Phases 6–7 | SEO, analytics, accessibility, QA and launch |

---

## Proposed project structure

```
ghargrow-web/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx                      # Home
│   │   ├── products/[category]/[slug]/   # Product detail
│   │   ├── spare-parts/ services/ projects/ about/ news/ careers/ contact/ find-your-machine/
│   │   └── layout.tsx                    # Header, footer, providers
│   ├── api/inquiry/route.ts
│   └── studio/[[...tool]]/               # Sanity Studio
├── components/
│   ├── ui/                               # Button, Tabs, SpecCard, ProductCard…
│   ├── motion/                           # ScrollSequence, SplitReveal, GrowingCrops, LineDraw, LeafBloom
│   ├── scenes/                           # HeroTractor, FieldJourney, AttachmentSwap
│   ├── interactive/                      # PivotSimulator, Quiz, LibyaMap, Hotspots
│   └── contact/                          # ContactSheet, ContactPill, InquiryForm
├── lib/ (gsap.ts, lenis.ts, whatsapp.ts, i18n/, sanity/)
├── sanity/schemas/
├── public/sequences/ public/lottie/ public/cutouts/
└── styles/tokens.css
```

---

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Heavy scroll sequences on mobile data | Mobile frame sets, chunked loading, Lighter mode, poster fallbacks |
| Custom illustration and Lottie are the long lead items | Start Phase 0.5–0.6 on day one, and ship the Field Journey with a simplified SVG tractor if the art runs late |
| Edge cases in RTL with pinned or horizontal scenes | Use logical properties, mirror direction flags in every scene, and run an RTL QA pass at each milestone |
| Brand asset licensing (CLAAS, Adobe Stock, YouTube rips) | Confirm the licences in Phase 0 and replace anything unlicensed with Ghargrow's own drone footage |
| Arabic content readiness | Make translation a tracked deliverable, so EN can't block AR (or the reverse) |
