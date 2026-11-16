# Ghargrow Agro-Industries — Website Brief

> Status: Ideation v1 · 2026-11-13
> Replaces: https://www.ghargrow.com/ (Wix)

---

## 1. Purpose of the website for the business

Ghargrow distributes CLAAS machinery, Western irrigation pivots and Arcusin bale-handling equipment in Libya. It also sells seeds, fertilizers and spare parts, and runs after-sales service from three branches: Benghazi, Sabha and Jalu.

The site **does not sell online**. Its job is to **turn interest into a conversation with a sales rep**.

| Goal | What the site must do | Success signal |
|---|---|---|
| 1. Showcase | Present each machine and pivot as a premium product with a scroll-driven story, real specs and real footage | Time on product pages, scroll depth |
| 2. Convert to contact | Put a WhatsApp, Call or Inquire action within one tap on every product, every part and every service | WhatsApp clicks, call clicks, form submissions (tagged per product and branch) |
| 3. Build trust | Show official brand partnerships, real installations, the service network, training and expo presence | Project page views, return visits |
| 4. Reach every farmer | Offer full Arabic and English with RTL support, keep it fast on mobile data, and make it work well on phones | Arabic sessions share, mobile Core Web Vitals |
| 5. Rank locally | Use descriptive bilingual URLs, structured data and per-product pages, for searches like "CLAAS tractor Libya" or "center pivot Libya" | Organic traffic |

**Brand line (kept from the old site):** *Grow with Trust.* Supporting line: "Reliable agricultural machinery, advanced irrigation systems, and sustainable solutions to empower every farmer."

### Audiences
- **Farmers and farm owners** across large and medium farms in the south and east. Mostly on mobile and Arabic-first, they think in terms of crop, farm size and task.
- **Agricultural investors and project companies.** They want large pivot projects, proof of installations and a professional partner.
- **Existing customers** looking for spare parts, maintenance and training.
- **Job seekers** (Careers).

### Primary conversion: the Contact Sheet
Every "Ask about this" CTA opens one shared **Contact Sheet**. It is a bottom sheet on mobile and a side panel on desktop. It offers:
1. **WhatsApp:** opens `wa.me/218XXXXXXXXX` with a pre-filled message in the active language, for example *"Hello Ghargrow, I'm interested in the CLAAS AXION 820. [page URL]"*.
2. **Call a branch:** tap-to-call for Benghazi, Sabha or Jalu in `+218` format, with the nearest branch first if the visitor allows geolocation.
3. **Send an inquiry:** a short form with name, phone (+218 default), branch, the product (pre-filled), and an optional message and farm size. It goes to email and the CMS, and the visitor sees a success state with a WhatsApp fallback.

A **persistent floating WhatsApp/Call pill** stays visible on every page and moves aside during the immersive scroll scenes.

---

## 2. Design system

### 2.1 Direction
**"ZettaJoule air + Noho warmth, rooted in the field."**
- From **ZettaJoule:** huge ultra-thin display type, machines shown as **cutouts that overlap the headline**, soft sky-gradient hero, sharp 0-radius UI, a technical spec-card style and a recurring thin-line motif.
- From **Noho:** a warm off-white base, an asymmetric editorial photo grid, words with inline photos in a sentence, hover image swaps and a calm, friendly tone.
- From **Ghargrow:** the logo green, the two-leaf mark and the G-link monogram. Real Libyan farm photography and drone footage.

### 2.2 Color tokens

| Token | Hex | Use |
|---|---|---|
| `--green-700` (brand) | `#43780E` | Logo green, primary CTAs, active states, links |
| `--green-900` | `#1F3A07` | Dark green sections, footer, text on light green |
| `--green-300` | `#A9C98A` | Leaf accents, chart fills, growth animations |
| `--green-100` | `#E6EFDA` | Tinted surfaces, tag backgrounds |
| `--sand-50` (base) | `#F1EEE9` | Page background (Noho warm off-white) |
| `--sand-200` | `#E3DCCF` | Cards, dividers, field illustration ground |
| `--wheat-400` | `#D9B26A` | Harvest accent, highlights, golden-hour gradient stop |
| `--sky-300` | `#9DB8E3` | Hero sky gradient top |
| `--sky-100` | `#DCE7F5` | Hero sky gradient mid |
| `--ink-900` | `#14140F` | Headings |
| `--ink-700` | `#524F4B` | Body text (ZettaJoule warm grey) |
| `--ink-400` | `#9A968F` | Captions, meta, disabled |
| `--white` | `#FFFFFF` | Text on imagery, spec cards |
| `--whatsapp` | `#25D366` | WhatsApp button only |

**Signature gradient (hero and section openers):** `linear-gradient(180deg, --sky-300 0%, --sky-100 45%, #F3E3CC 80%, --sand-50 100%)`. It reads as a morning sky fading into a field horizon.
**Dark mode:** not a full theme. Use `--green-900` sections for contrast moments such as Services, the footer and the quiz.

### 2.3 Typography

| Role | Latin | Arabic | Notes |
|---|---|---|---|
| Display (H1/H2) | **Geist**, weight 200–300 | **IBM Plex Sans Arabic**, weight 200–300 | Very large (clamp 56→180px), tight leading 0.95, slight negative tracking (Latin only) |
| Headings (H3–H5) | Geist 400–500 | IBM Plex Sans Arabic 500 | |
| Body | **Inter** 400 / 16–18px | IBM Plex Sans Arabic 400 / 17–19px | Arabic set about 1px larger with taller line-height (1.7) |
| Mono / labels | **Geist Mono** uppercase, 11–12px, +8% tracking | Plex Arabic 500 small | For spec labels, section numbers ("01 / Irrigation") and data readouts (Alethia style) |

Type scale (fluid): `display-xl 180 / display 120 / h1 72 / h2 48 / h3 32 / h4 24 / body-lg 20 / body 17 / small 14 / label 12`.

### 2.4 Layout and grid
- 12-column grid, max width 1440, 24px gutters on desktop and 16px on mobile. Use generous whitespace with section padding of 160px desktop and 96px mobile.
- **0px border radius** everywhere except circular icon buttons and the pivot simulator. This sharp, industrial edge comes from ZettaJoule.
- **Line motif:** thin 1px lines in `--green-700` or `--ink-400` that trace field furrows and pivot arcs. They run between sections and draw on scroll.
- Imagery: cutout machines (transparent AVIF/WebP) over gradients, full-bleed drone footage, and Noho-style editorial crops of farmers and crops.
- **RTL:** use logical CSS properties throughout (`margin-inline-start`, etc.). Mirror layouts, but keep tractors driving in the reading direction, so they drive right-to-left in Arabic.

### 2.5 Components
- **Buttons:** primary (solid green, white text), secondary (1px ink outline), ghost (text with an arrow), and a WhatsApp variant. Labels use a **hover text-roll** where the label slides up and a duplicate rolls in (ZettaJoule).
- **Nav:** transparent over the hero, then solid `--sand-50` with a blur after scroll. It holds the logo (horizontal lockup), Products mega-menu (with category thumbnails), Services, Projects, About, News, the EN/AR toggle and a "Talk to us" CTA. On mobile it opens a full-screen overlay menu with large display links.
- **Product card:** cutout on a sand background, brand label in mono, model name in display-light, a key spec line and an arrow. On hover, the machine shifts slightly and an alternate angle appears (Noho hover pair).
- **Spec card:** a white panel with mono labels and thin-weight values, for example `ENGINE POWER — 205 hp`.
- **Tabs / segmented control:** Apple aperture-style, where switching a tab swaps the image and copy together.
- **Contact Sheet** (see §1), **floating contact pill**, **brand badge** (official distributor badge for CLAAS, Western or Arcusin).
- **Data readout:** mono label with a ticking number, for pivot hectares and spec counters.
- **Hotspot tile:** Banorama-style, where tapping a part of a machine opens an info panel with a close control.
- **Toasts / form states:** inline success and error states in both languages.

### 2.6 Motion principles
- **Stack:** GSAP + ScrollTrigger + SplitText, plus Lenis smooth scroll and Lottie for illustrated scenes.
- **Easing:** `power3.out` for reveals and `none` (linear scrub) for scroll-linked machines. Durations are 0.6–1.2s.
- **Text:** headlines reveal line by line with SplitText (Noho per-line reveal). Large display words can be split around a machine cutout (ZettaJoule hero).
- **Scrub, don't autoplay:** machines move with the scroll so the user is "driving".
- **Reduce motion:** respect `prefers-reduced-motion`. Add a footer toggle labelled *"Lighter mode — saves data"* (Noho's eco toggle reframed for mobile-data users). It swaps scroll sequences for posters and the video for a single still.
- **Performance budget:** hero LCP under 2.5s on 4G. Image sequences are lazy-loaded in chunks, and mobile gets a reduced frame count (about 60 frames vs 150 on desktop).

### 2.7 Signature experiences
1. **Hero tractor (Apple-style scrub):** a scroll-scrubbed frame sequence cut from the CLAAS DJI drone footage. The tractor drives across the field as you scroll while the headline "Grow with Trust" splits around it.
2. **The Field Journey (Banorama-style):** a tall illustrated SVG field. A layered tractor (Lottie) drives along a dirt track as you scroll, and passes stations that are the product categories (Tractors → Harvest → Hay & Bale → Irrigation → Parts and Service). Each station has a hotspot.
3. **Attachment Swap (United Carriers-style):** a sticky section with a CLAAS tractor built from layers (body, front and rear wheels that rotate with scroll, implement). Scrolling swaps the implement to DISCO mower, then LINER swather, then MARKANT/QUADRANT baler, and the copy and CTA change to match.
4. **Crops grow (POLA-style):** wheat, alfalfa and corn stems sprout and grow as section transitions and in the About/mission block. A **leaf-bloom loader** unfurls the logo's two leaves on first visit and the bloom repeats in the footer.
5. **Pivot Coverage Simulator:** pick a pivot type and drag the span count or length. A top-down pivot sweeps its circle and live readouts show radius, irrigated hectares and towers. CTA: "Get a quote for this setup", which opens the Contact Sheet with the configuration pre-filled.
6. **Find-Your-Machine Quiz:** four steps covering crop, farm size, task (till/sow/irrigate/harvest/bale) and region. It returns 1–3 recommended products and the nearest branch, with WhatsApp and Call buttons.
7. **Libya Map:** a stylized map of Libya with branch pins (Benghazi, Sabha, Jalu) and installation pins. Each pin shows the branch phone, WhatsApp and the projects nearby.

---

## 3. Information architecture

```
/[en|ar]
├── /                         Home
├── /products                 All products (category hub)
│   ├── /tractors-machinery   CLAAS: tractors, combines, mowers, swathers, balers
│   ├── /irrigation           Western: center, linear, small-field pivots, iControl
│   ├── /bale-handling        Arcusin: AutoStack XP, GrabPack, ForStack
│   ├── /seeds-fertilizers    Alfalfa seeds, Sulphur Bentonite 90
│   └── /[category]/[slug]    Product detail page (e.g. /tractors-machinery/claas-axion-820)
├── /spare-parts              Searchable parts catalog
├── /services                 After-sales, training, maintenance
├── /projects                 Installations and case studies
│   └── /[slug]
├── /about                    Story, mission, brands, branches
├── /news                     News and expos
│   └── /[slug]
├── /careers                  Open roles
│   └── /[slug]
├── /find-your-machine        Quiz
├── /contact                  Branches, map, form
└── /privacy, /terms, /accessibility
```

---

## 4. Page-by-page sections

### 4.1 Home
1. **Leaf-bloom loader:** first visit only, under 1.5s, skippable.
2. **Hero (Apple and ZettaJoule):** sky-to-field gradient, with the display headline "Grow with Trust" split by a CLAAS tractor. On scroll, the drone frame sequence scrubs, the tractor crosses the field and the subline and two CTAs appear: *Explore products* and *Talk to us*.
3. **Name / mission block (ZettaJoule dictionary device):** **Ghargrow** /gar-grō/ — *noun.* A short definition that ties the name to the mission (meaning and pronunciation to be confirmed with Ghargrow). Crops grow up the edge as you read.
4. **Official partners strip:** CLAAS, Western and Arcusin logos (hover swap from monochrome to color), each with an "Authorized distributor in Libya" label.
5. **The Field Journey:** the illustrated scroll scene with category stations (§2.7-2). Each station links to its category.
6. **Attachment Swap:** sticky layered tractor (§2.7-3).
7. **Irrigation spotlight:** a full-bleed pivot drone video with a teaser for the Pivot Coverage Simulator ("How much land can one pivot water?").
8. **Featured products:** a horizontal drag carousel of 6–8 flagship product cards.
9. **Services:** dark green section with three numbered items (Alethia 01–03 style): After-sales, Product training, Maintenance. Each has an image and a CTA.
10. **Projects teaser:** Noho editorial asymmetric photo grid from real installations, linking to Projects.
11. **Libya Map:** branches and installs (§2.7-7).
12. **Find-your-machine prompt:** a short band with a "Not sure what you need? Take the 1-minute quiz" CTA.
13. **News and expos:** the latest three items.
14. **Closing CTA:** "Let's grow together", with WhatsApp, Call and Inquire.
15. **Footer:** dark green, with the leaf bloom, nav, branches with phone numbers, social links (Facebook, Instagram, LinkedIn), the EN/AR toggle, the Lighter-mode toggle and legal links.

### 4.2 Products hub
- Hero with the category tabs (segmented control) and a filter by brand.
- A category section for each category: intro line, product card grid and a "View category" link.
- A quiz prompt.

### 4.3 Category page (e.g. Irrigation)
- Category hero with a cutout or video and a one-line value proposition.
- Brand partner badge.
- Product grid.
- Category-specific interactive feature: the **Pivot Simulator** on Irrigation, the **Attachment Swap** on Tractors and Machinery, and an AutoStack loading sequence on Bale handling.
- Related services such as installation and maintenance.
- Contact CTA.

### 4.4 Product detail page (Apple-style story page)
1. **Hero:** model name in giant thin type, with the cutout overlapping it, plus the brand and category label. Primary CTA: *Ask about this machine* (WhatsApp). Secondary: *Call*.
2. **Scroll showcase:** a sticky scene where the machine rotates or moves via a frame sequence or video scrub, with 3–5 feature callouts appearing in sequence.
3. **Highlights tabs:** segmented control (for example Power / Comfort / Technology) that swaps image and copy.
4. **Hotspots:** tap parts of the machine to see detail panels.
5. **Key specs:** a spec-card grid and an expandable full spec table.
6. **Gallery and video:** real Ghargrow photos plus the brand film.
7. **Downloads:** brochure PDF (EN/AR when available).
8. **Service and parts for this model:** links to compatible spare parts and maintenance.
9. **Related products.**
10. **Sticky bottom bar (mobile):** model name, WhatsApp and Call.

Flagships that get the full immersive treatment in phase 1: CLAAS AXION 820, CLAAS DOMINATOR 260, CLAAS QUADRANT 5200 EVO, Western Center Pivot and Arcusin AutoStack XP. Every other product uses the same template with lighter motion.

### 4.5 Spare parts
- Search with instant filter, plus filters by system (Pivot / CLAAS tractor / Baler / General) and compatible model.
- Dense list or grid rows showing part name, compatible models and part image.
- Each row has a WhatsApp action with a message pre-filled with the part name.
- A "Can't find your part? Send us a photo on WhatsApp" band.

### 4.6 Services
- Hero, followed by three services in a sticky scroll layout: the image pins while the copy scrolls.
- Each service shows what's included, how it works (numbered steps) and its CTA.
- Training: who delivers it (certified engineers), topics and a request-training form option.
- The branch network map.

### 4.7 Projects
- Index: a filterable editorial grid by type (Pivot / Machinery) and region.
- Detail: location, crop, system installed, area, a story, a before/after or install gallery, the products used (linked) and a CTA.
- Seed content from the media folder: Wadi El Natroun install, Western installs, CLAAS deliveries and the drone shoots.

### 4.8 About
- Hero, then the story told with Noho-style inline photos between words.
- Mission ("Why we do what we do") alongside the crop-growth animation.
- Brands we represent, with deep links.
- Branches (map) and an optional team section later.
- Values: Reliability, Support, Sustainability.

### 4.9 News and expos
- Card grid, and article pages with a gallery and embedded video. Seed content: the MENA Food Expo days and the new pivot arrival.

### 4.10 Careers
- Intro (why Ghargrow), open roles list, and a role page with an application form (CV upload) or an email/WhatsApp route.

### 4.11 Find-your-machine
- Full-screen dark green quiz with progress, one question per screen and large tap targets, ending in the results and the Contact Sheet.

### 4.12 Contact
- Branch cards with tap-to-call and WhatsApp, the inquiry form, the map, email and social links.

---

## 5. Content inventory and sources

| Content | Source |
|---|---|
| Copy for the hero, about, mission and services | Old site (rewritten and expanded), Ghargrow Profile ENG/ARB PDFs |
| Logo | `Logo/logo/ALL GHARGROW LOGOS SVG/1–10.svg` (black and white, stacked and horizontal variants) |
| Tractor and harvest footage | `CLAAS CONTENT/` (DJI drone clips, product films, DOMINATOR walkaround, TRION and LINER films), `SnapSave.io-CLAAS …` films |
| Pivot imagery | `PIVOTS/`, `Ghargrow Pictures/` (Ukraine, Spain, Portugal installs, Linear System, iControl panel, End Gun, Sprinklers), `NEW PIVOT ARRIVAL.mov` |
| 3D | `3D Model/CP600 PIVOT 1 SPAN` (candidate for a later 3D pivot viewer) |
| Crops | `Ghargrow Pictures/CROPS/` (alfalfa, corn, cotton, rice, sunflower, wheat) |
| Bale equipment | `صور الكباسة …` folders (baler photos and drone) |
| Seeds and fertilizer | `صور سماد و بذور…` |
| Expo / news | `Expo Content/`, `صور معرض`, expo videos |
| Brand brochures | CLAAS PDFs in `CLAAS CONTENT/` (specs for the spec tables) |

**Licensing note:** clips from YouTube (`SnapSave.io-…`) and `AdobeStock_*.mov` need licence confirmation. CLAAS marketing assets should be used under the dealer brand guidelines.

---

## 6. Content fixes vs the old site
- Confirm model names: **AXION 640C or ARION 640C**? **ARION 620 or AXION 620**? **QUADRANT 5200 EVO** (use one spelling).
- The pivot brand is **Western**, not "Center Pivot – CLAAS".
- Fix the "Fertalizer" typo, confirm "Rubber Coupling (Croshiera)", and use consistent category names (Bale Handling, not "Arcusin Products" or "Pivots & Seeds").
- Write phone numbers in `+218` format and add a WhatsApp number (confirm which number or numbers).
- Back up or soften "Libya's largest distributor" until there's a source.
- Use descriptive URLs instead of `/projects-1-1-2`.
- **Stats:** none for now. The layout leaves room to add an animated stats band later.

---

## 7. Open questions
1. Which WhatsApp number(s) should be used: one central number or one per branch?
2. Are branch street addresses and opening hours available for the map and contact page?
3. Where should inquiry form submissions go: info@ghargrow.com, per-branch email, or a CRM?
4. Are Arabic product names and specs available, or do they need translation?
5. Does CLAAS/Western require brand-approved assets and logo-usage rules for the dealer site?
6. Which projects can be named publicly (client and farm names)?
7. Who owns content entry in the CMS, and do they need EN/AR editing roles?
8. Are there more references to add (the user mentioned sharing more later)?
