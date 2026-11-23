"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSite } from "@/components/providers/SiteProvider";
import { IconWhatsApp, IconPhone } from "@/components/ui/Icons";
import { site, branches } from "@/content/site";
import { waLink } from "@/lib/whatsapp";

/** Floating WhatsApp / call pill. Hides while an immersive scene is pinned (data-immersive in view). */
export function ContactPill() {
  const { d, openContact, contact } = useSite();
  const [hidden, setHidden] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const els = Array.from(document.querySelectorAll("[data-immersive]"));
    if (!els.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only state read after hydration
      setHidden(false);
      return;
    }
    const visible = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting && e.intersectionRatio > 0.6 ? visible.add(e.target) : visible.delete(e.target)));
        setHidden(visible.size > 0);
      },
      { threshold: [0, 0.6, 1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  if (contact) return null;
  return (
    <div
      data-tone-ignore
      className={`fixed bottom-4 end-4 z-50 flex items-stretch shadow-[0_10px_30px_-10px_rgba(20,20,15,0.45)] transition-all duration-500 md:bottom-6 md:end-6 ${
        hidden ? "pointer-events-none translate-y-24 opacity-0" : ""
      }`}
    >
      <a
        href={waLink(site.defaultWhatsapp, d.contact.waGeneral)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-whatsapp px-4 py-3 text-ink-900 hover:brightness-95"
        aria-label={d.cta.whatsapp}
      >
        <IconWhatsApp className="size-6" />
        <span className="hidden text-sm font-medium sm:inline">{d.cta.whatsapp}</span>
      </a>
      <a href={`tel:${branches[0].phone}`} className="flex items-center bg-ink-900 px-4 text-white md:hidden" aria-label={d.cta.call}>
        <IconPhone />
      </a>
      <button onClick={() => openContact()} className="hidden items-center bg-ink-900 px-4 text-sm text-white hover:bg-green-900 md:flex">
        {d.nav.talk}
      </button>
    </div>
  );
}
