# Ghargrow website

The bilingual (EN / AR, RTL) site for Ghargrow Agro-Industries. Built from `../website-brief.md` and `../implementation-plan.md`.

**Stack:** Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS 4 · GSAP 3.13 (ScrollTrigger, SplitText, MotionPath) · Lenis smooth scroll.

## Run

```bash
npm install
npm run dev        # http://localhost:3000 → redirects to /en or /ar
npm run build      # static prerender of every EN/AR route
```

## What's where

| Path | What |
|---|---|
| `src/app/[lang]/…` | All pages (home, products hub, category, product detail, spare parts, services, projects, about, news, careers, contact, find-your-machine) |
| `src/proxy.ts` | Locale redirect (`/` → `/en` or `/ar` from Accept-Language) |
| `src/content/` | **All content** — `catalog.ts` (brands, categories, products + specs), `more.ts` (parts, services, projects, news, jobs, quiz), `site.ts` (branches, phones, socials), `dict.ts` (UI strings EN/AR). Shaped to move into a headless CMS (Sanity) later. |
| `src/components/scenes/` | Signature scroll scenes: `HeroTractor` (scroll-scrubbed AXION frames), `FieldJourney` (illustrated farm, tractor drives the track), `AttachmentSwap` (layered tractor, implements swap), `FrameScrub` (generic pinned frame sequence) |
| `src/components/interactive/` | Pivot coverage simulator, find-your-machine quiz, Libya map, parts catalog, product highlights/hotspots, bale flow |
| `src/components/motion/` | Frame-sequence engine, split-text reveals, growing crops (POLA-style), leaf-bloom logo |
| `src/components/contact/` | Shared contact sheet (WhatsApp with pre-filled product, call a branch, inquiry form), floating pill |
| `src/app/api/inquiry/route.ts` | Inquiry endpoint — emails via Resend when `RESEND_API_KEY` + `INQUIRY_TO` are set, otherwise logs |
| `scripts/process-media.py`, `scripts/process-logos.py` | Rebuild `public/media/` from the brand media library (photos → WebP, cutouts, frame sequences, video loops) |

## Lighter mode

The footer toggle (and `prefers-reduced-motion`) turns off smooth scroll, pinned scenes and frame sequences, showing posters instead — saves mobile data.

## Before launch — needs the client

- **WhatsApp number(s)** — all WhatsApp links use the Benghazi number (`src/content/site.ts`). Confirm which numbers take WhatsApp.
- **Arabic copy review** by a native speaker (`src/content/dict.ts`, `catalog.ts`, `more.ts`).
- **Model names** — old site mixes AXION/ARION 640C, ARION/AXION 620; this build uses ARION 640 C and ARION 620 per the CLAAS portfolio.
- **Specs** — CLAAS figures come from the CLAAS 2024 portfolio / DOMINATOR 260 flyer in the media library. Western and Arcusin have no spec sheets yet (features only). Pivot simulator span lengths and end-gun throw are indicative placeholders.
- **Arcusin** — no Arcusin photos or logo in the library; bale-handling pages use Ghargrow bale photos and a text wordmark.
- **Projects / news** — built from Ghargrow's own photos; confirm locations, dates, farm names. Careers lists only the Accountant role from the "We are hiring" post.
- **Inquiry destination** — set `RESEND_API_KEY`, `INQUIRY_TO` (and optionally `INQUIRY_FROM`) env vars, or swap for the CRM.
- **Footage licences** — hero/drive/AXION sequences and the DOMINATOR, QUADRANT, DISCO loops are cut from CLAAS dealer films; pivot loops from Western's Ukraine film. Confirm dealer usage rights.
- **CMS** — content is in typed files today; move to Sanity per the implementation plan Phase 2 when the team is ready to edit.
