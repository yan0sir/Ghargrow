"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import type { Locale } from "@/lib/i18n";
import { dicts, type Dict } from "@/content/dict";

export type ContactTopic = { label: string; kind?: "product" | "part" | "service" | "quote" | "general"; detail?: string };

type Ctx = {
  lang: Locale;
  d: Dict;
  lite: boolean;
  setLite: (v: boolean) => void;
  contact: ContactTopic | null;
  openContact: (topic?: ContactTopic) => void;
  closeContact: () => void;
  lenis: React.RefObject<Lenis | null>;
};

const SiteCtx = createContext<Ctx | null>(null);

export const useSite = () => {
  const c = useContext(SiteCtx);
  if (!c) throw new Error("useSite outside SiteProvider");
  return c;
};

const LITE_KEY = "gg-lite";

export function SiteProvider({ lang, children }: { lang: Locale; children: React.ReactNode }) {
  const d = dicts[lang];
  const [lite, setLiteState] = useState(false);
  const [contact, setContact] = useState<ContactTopic | null>(null);
  const lenis = useRef<Lenis | null>(null);
  const pathname = usePathname();

  // Lighter mode: stored preference, or the OS reduced-motion setting
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(LITE_KEY);
    } catch {}
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const v = stored ? stored === "1" : reduced;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only state read after hydration
    setLiteState(v);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("lite", lite);
  }, [lite]);

  const setLite = useCallback((v: boolean) => {
    setLiteState(v);
    try {
      localStorage.setItem(LITE_KEY, v ? "1" : "0");
    } catch {}
    // scenes rebuild on the next frame
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, []);

  // Smooth scroll (off in lighter mode)
  useEffect(() => {
    if (lite) return;
    const l = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.current = l;
    l.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => l.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      l.destroy();
      lenis.current = null;
    };
  }, [lite]);

  // Reset scroll on navigation
  useEffect(() => {
    lenis.current?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  // Pause scroll while the contact sheet is open
  useEffect(() => {
    if (contact) lenis.current?.stop();
    else lenis.current?.start();
  }, [contact]);

  const openContact = useCallback((topic?: ContactTopic) => setContact(topic ?? { label: d.contact.general, kind: "general" }), [d]);
  const closeContact = useCallback(() => setContact(null), []);

  const value = useMemo(
    () => ({ lang, d, lite, setLite, contact, openContact, closeContact, lenis }),
    [lang, d, lite, setLite, contact, openContact, closeContact],
  );
  return <SiteCtx.Provider value={value}>{children}</SiteCtx.Provider>;
}
