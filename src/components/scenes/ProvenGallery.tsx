"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconArrow } from "@/components/ui/Icons";
import { ScrollTrigger } from "@/lib/gsap";

/**
 * "Proven Machinery, Local Support": the heading sits at the top and stays put; below it the copy and a
 * strip of photos move sideways as the page scrolls (the stage is sticky while the strip travels).
 *   1. the copy slides off to the start side and the photos follow it across
 *   2. once the last photo reaches the start edge it grows into a large frame, the first heading fades
 *      away and a second heading appears beside the frame, level with it
 *   3. the frame then closes to a line (its height shrinks to 0 about the middle); the 3D journey that
 *      follows (FarmStory) overlaps this last screen and opens from that same line
 * On phones (and with reduced motion / lite mode) the photos are a normal swipeable row and the second
 * heading follows them.
 *
 * PHOTOS: drop files named 01.jpg … 10.jpg (or .webp / .png / .avif) into public/media/gallery/ and they
 * fill the slots in that order (the page reads the folder, see galleryPhotos.ts). A missing number shows an
 * empty placeholder of the same size. Slot 10 is the one that grows. GALLERY below sets each slot's size.
 */
const GALLERY: { src: string | null; alt?: string; h: number; ratio: number }[] = [
  // box sizes roughly follow each file's own shape (heights in % of the screen, ratio = width / height)
  { src: null, alt: "CLAAS baler in an alfalfa field from above", h: 30, ratio: 1.33 },
  { src: null, alt: "Western pivot irrigating ripe wheat", h: 26, ratio: 1.5 },
  { src: null, alt: "Western pivot watering a young crop", h: 29, ratio: 1.56 },
  { src: null, alt: "Arcusin AutoStack loading bale stacks", h: 24, ratio: 2.4 },
  { src: null, alt: "Sheep grazing, seen from above", h: 32, ratio: 1.78 },
  { src: null, alt: "CLAAS tractor mowing alfalfa", h: 27, ratio: 1.33 },
  { src: null, alt: "Western pivot over a green maize field", h: 23, ratio: 1.78 },
  { src: null, alt: "Sulphur Bentonite 90 fertilizer bag on soil", h: 31, ratio: 1.69 },
  { src: null, alt: "Camels on a farm", h: 25, ratio: 1.78 },
  { src: null, alt: "Engineer assembling a pivot tower", h: 30, ratio: 1.5 },
];

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function ProvenGallery({
  title,
  title2,
  photos = [],
  body,
  cta,
  ctaHref,
}: {
  title: string;
  /** the heading that appears beside the enlarged last photo */
  title2: string;
  /** image paths for slots 1–10 (null = empty), from the public/media/gallery folder */
  photos?: (string | null)[];
  body: string;
  cta: string;
  ctaHref: string;
}) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const head1 = useRef<HTMLHeadingElement>(null);
  const head2 = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const section = root.current!;
    const strip = track.current!;
    const text = copy.current!;
    const h1 = head1.current!;
    const h2 = head2.current!;
    const last = strip.querySelector<HTMLElement>("li:last-child")!;
    const mq = window.matchMedia("(min-width: 768px)");
    const still = () =>
      !mq.matches || document.documentElement.classList.contains("lite") || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // measured in measure(): how far the strip travels, and the last photo's start and end boxes
    let slide = 0,
      grow = 0,
      shrink = 0,
      raf = 0;
    const others = Array.from(strip.querySelectorAll<HTMLElement>("li")).filter((li) => li !== last);
    const box = { w0: 0, h0: 0, w1: 0, h1: 0, dy: 0 };

    const reset = () => {
      strip.style.transform = "";
      text.style.opacity = "";
      h1.style.opacity = h1.style.transform = "";
      h2.style.opacity = h2.style.transform = "";
      last.style.width = last.style.height = last.style.transform = "";
      others.forEach((li) => (li.style.opacity = ""));
    };

    const measure = () => {
      reset();
      if (still()) {
        if (section.style.height) requestAnimationFrame(() => ScrollTrigger.refresh());
        section.style.height = "";
        section.dataset.still = "";
        slide = 0;
        return;
      }
      delete section.dataset.still;
      const vw = window.innerWidth,
        vh = window.innerHeight;
      const rtl = document.documentElement.dir === "rtl";
      const gutter = parseFloat(getComputedStyle(text).paddingInlineStart) || 24;
      const r = last.getBoundingClientRect();
      // 1: until the last photo's start edge reaches the gutter
      slide = Math.max(0, rtl ? vw - gutter - r.right : r.left - gutter);
      // 2: it grows into a large frame, vertically centred on the screen
      box.w0 = r.width;
      box.h0 = r.height;
      box.h1 = Math.round(vh * 0.7);
      box.w1 = Math.round(Math.min(vw * 0.54, box.h1 * 1.55));
      // it grows upwards from the strip's bottom line; this lifts it so it ends centred on the screen
      const bottom = r.bottom - stage.current!.getBoundingClientRect().top;
      box.dy = vh / 2 + box.h1 / 2 - bottom;
      grow = vh * 1.1;
      shrink = vh * 0.8;
      // the second heading sits beside the final frame, centred on it
      const start = gutter + box.w1 + vw * 0.045;
      h2.style.setProperty("--x", `${start}px`);
      h2.style.setProperty("--w", `${vw - start - gutter}px`);
      const height = `${vh + slide + grow + shrink}px`;
      if (section.style.height !== height) {
        section.style.height = height;
        // the pinned 3D section below depends on where this one ends
        requestAnimationFrame(() => ScrollTrigger.refresh());
      }
      update();
    };

    const update = () => {
      raf = 0;
      if (!slide) return;
      const y = -section.getBoundingClientRect().top;
      const rtl = document.documentElement.dir === "rtl";
      // phase 1: the strip travels
      const shift = Math.min(slide, Math.max(0, y));
      strip.style.transform = `translate3d(${rtl ? shift : -shift}px, 0, 0)`;
      text.style.opacity = String(Math.max(0, 1 - shift / (text.offsetWidth * 0.9)));
      // phase 2: the last photo grows, heading one gives way to heading two
      const q = ease(clamp((y - slide) / (grow * 0.75)));
      // phase 3: the frame closes to a line about its middle
      const r = ease(clamp((y - slide - grow) / shrink));
      const H = r > 0 ? box.h1 * (1 - r) : lerp(box.h0, box.h1, q);
      last.style.width = `${lerp(box.w0, box.w1, q)}px`;
      last.style.height = `${H}px`;
      last.style.transform = `translate3d(0, ${r > 0 ? box.dy - (box.h1 - H) / 2 : box.dy * q}px, 0)`;
      others.forEach((li) => (li.style.opacity = String(1 - q)));
      h1.style.opacity = String(1 - clamp(q * 2.2));
      h1.style.transform = `translate3d(0, ${-30 * q}px, 0)`;
      const t2 = clamp((q - 0.45) / 0.55);
      h2.style.opacity = String(t2 * (1 - clamp(r * 2.5)));
      h2.style.transform = `translate3d(${(rtl ? -1 : 1) * 40 * (1 - t2)}px, -50%, 0)`;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const ro = new ResizeObserver(() => measure());
    ro.observe(text);
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    mq.addEventListener("change", measure);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      mq.removeEventListener("change", measure);
      reset();
    };
  }, []);

  return (
    <section ref={root} data-pg className="relative bg-[#f1f5f8]">
      <div
        ref={stage}
        className="relative py-16 md:sticky md:top-0 md:flex md:h-svh md:flex-col md:justify-between md:overflow-hidden md:py-0 md:pt-[15svh] md:pb-[11svh]"
      >
        <h2 ref={head1} className="wrap w-full text-[clamp(40px,5.6vw,80px)] leading-[0.98] font-medium tracking-[-0.035em] whitespace-pre-line text-black">
          {title}
        </h2>

        <div ref={track} data-pg-track className="mt-10 md:absolute md:start-0 md:bottom-[11svh] md:mt-0 md:flex md:w-max md:items-end md:will-change-transform">
          {/* copy: first in the strip, so it leaves first */}
          <div ref={copy} className="px-[var(--gutter)] md:w-[calc(min(400px,28vw)+var(--gutter))] md:shrink-0 md:pe-0">
            <p className="max-w-[400px] text-[clamp(15px,1.25vw,18px)] leading-[1.35] text-pretty text-[#524f4b]">{body}</p>
            <Link href={ctaHref} className="group mt-7 inline-flex h-12 items-stretch overflow-hidden rounded-[3px] text-[15px] font-medium text-black">
              <span className="grid w-12 place-items-center bg-[#d7ecb4] transition-colors group-hover:bg-green-700 group-hover:text-white">
                <IconArrow className="size-4 rtl:rotate-180" />
              </span>
              <span className="flex items-center border border-s-0 border-black/15 px-4 transition-colors group-hover:border-black/40">{cta}</span>
            </Link>
          </div>

          {/* gap so the photos start near the end side of the screen */}
          <div aria-hidden data-pg-gap className="hidden shrink-0 md:block md:w-[calc(78vw-min(400px,28vw)-2*var(--gutter))]" />

          {/* the photos */}
          <ul className="no-scrollbar mt-10 flex snap-x snap-mandatory items-end gap-3 overflow-x-auto px-[var(--gutter)] md:mt-0 md:snap-none md:overflow-visible md:ps-0 md:pe-[var(--gutter)]">
            {GALLERY.map((slot, i) => ({ ...slot, src: photos[i] ?? slot.src })).map((g, i) => (
              <li
                key={i}
                data-slot={i + 1}
                className="relative h-[200px] shrink-0 snap-start overflow-hidden rounded-[3px] bg-[#dfe6ea] md:h-[var(--h)] md:will-change-[width,height,transform]"
                style={{ "--h": `${g.h}svh`, aspectRatio: String(g.ratio) } as React.CSSProperties}
              >
                {g.src && /\.(mp4|webm)$/i.test(g.src) ? (
                  // silent looping clip; NN-poster.webp shows until it plays
                  <video
                    className="absolute inset-0 size-full object-cover"
                    src={g.src}
                    poster={g.src.replace(/\.(mp4|webm)$/i, "-poster.webp")}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label={g.alt}
                  />
                ) : g.src ? (
                  <Image src={g.src} alt={g.alt ?? ""} fill unoptimized sizes={i === GALLERY.length - 1 ? "(max-width:768px) 70vw, 55vw" : "(max-width:768px) 70vw, 30vw"} className="object-cover" />
                ) : (
                  <span className="absolute start-3 top-3 font-mono text-[11px] tracking-[0.14em] text-black/30">{String(i + 1).padStart(2, "0")}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* second heading: beside the enlarged last photo on desktop, after the row on phones */}
        <h2
          ref={head2}
          data-pg-h2
          className="wrap mt-10 text-[clamp(34px,4.6vw,72px)] leading-[1] font-medium tracking-[-0.035em] text-black md:absolute md:top-1/2 md:start-[var(--x)] md:mt-0 md:w-[var(--w)] md:max-w-none md:px-0 md:opacity-0"
        >
          {title2}
        </h2>
      </div>
    </section>
  );
}
