"use client";

import { useEffect, useRef, useState } from "react";
import { useSite } from "@/components/providers/SiteProvider";
import { branches, site } from "@/content/site";
import { waLink } from "@/lib/whatsapp";
import { IconClose, IconPhone, IconWhatsApp, IconArrow } from "@/components/ui/Icons";
import { gsap } from "@/lib/gsap";

/** One shared sheet for every "Ask about this" action: WhatsApp, call a branch, or a short inquiry form. */
export function ContactSheet() {
  const { contact, closeContact, d, lang } = useSite();
  const panel = useRef<HTMLDivElement>(null);
  const shade = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState("");
  const open = !!contact;

  useEffect(() => {
    if (!open) return;
  // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only state read after hydration
    setState("idle");
    setErr("");
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const rtl = document.documentElement.dir === "rtl";
    gsap.fromTo(shade.current, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    gsap.fromTo(
      panel.current,
      mobile ? { yPercent: 100 } : { xPercent: rtl ? -100 : 100 },
      { yPercent: 0, xPercent: 0, duration: 0.7, ease: "expo.out" },
    );
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeContact();
    window.addEventListener("keydown", onKey);
    panel.current?.querySelector<HTMLElement>("a,button")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeContact]);

  if (!contact) return null;

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const msg =
    contact.kind === "general" || !contact.kind
      ? d.contact.waGeneral
      : `${d.contact.waMessage} ${contact.label}${contact.detail ? ` (${contact.detail})` : ""}. ${pageUrl}`;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!String(fd.get("name") || "").trim() || !String(fd.get("phone") || "").trim()) {
      setErr(d.contact.required);
      return;
    }
    setErr("");
    setState("sending");
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...Object.fromEntries(fd.entries()),
          topic: contact?.label,
          detail: contact?.detail,
          kind: contact?.kind,
          page: pageUrl,
          locale: lang,
        }),
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-labelledby="contact-title">
      <div ref={shade} className="absolute inset-0 bg-ink-900/50 backdrop-blur-[2px]" onClick={closeContact} />
      <div
        ref={panel}
        data-lenis-prevent
        className="absolute inset-x-0 bottom-0 max-h-[92svh] overflow-y-auto bg-sand-50 md:inset-y-0 md:inset-x-auto md:end-0 md:max-h-none md:w-[520px]"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-900/10 bg-sand-50/95 px-6 py-4 backdrop-blur">
          <span className="eyebrow text-green-700">
            {d.contact.about}: {contact.label}
          </span>
          <button onClick={closeContact} className="-me-2 p-2 text-ink-900 hover:text-green-700" aria-label={d.nav.close}>
            <IconClose />
          </button>
        </div>
        <div className="space-y-10 px-6 pt-8 pb-12">
          <div>
            <h2 id="contact-title" className="h2">
              {d.contact.title}
            </h2>
            <p className="mt-3 text-ink-700">{d.contact.subtitle}</p>
          </div>

          <a
            href={waLink(site.defaultWhatsapp, msg)}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between bg-whatsapp px-5 py-5 text-ink-900 transition hover:brightness-95"
          >
            <span className="flex items-center gap-3">
              <IconWhatsApp className="size-7" />
              <span>
                <span className="block text-lg font-medium">{d.cta.askWhatsapp}</span>
                <span className="block text-sm opacity-75">{d.contact.whatsappIntro}</span>
              </span>
            </span>
            <IconArrow className="size-5 transition group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
          </a>

          <div>
            <p className="eyebrow mb-3 text-ink-400">{d.contact.callIntro}</p>
            <ul className="divide-y divide-ink-900/10 border-y border-ink-900/10">
              {branches.map((b) => (
                <li key={b.id}>
                  <a href={`tel:${b.phone}`} className="group flex items-center justify-between py-4 hover:text-green-700">
                    <span className="flex items-center gap-3 text-ink-900 group-hover:text-green-700">
                      <IconPhone className="size-5" />
                      <span className="text-lg">{b.city[lang]}</span>
                      {b.hq && <span className="eyebrow hidden text-ink-400 sm:inline">{d.contact.hq}</span>}
                    </span>
                    <span dir="ltr" className="font-mono text-sm text-ink-700">
                      {b.phoneDisplay}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4 text-ink-400">{d.contact.formIntro}</p>
            {state === "sent" ? (
              <div className="bg-green-100 p-6">
                <p className="h3">{d.contact.sent}</p>
                <p className="mt-2 text-sm">{d.contact.sentNote}</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4" noValidate>
                <Field label={d.contact.name} name="name" autoComplete="name" required />
                <Field label={d.contact.phone} name="phone" type="tel" autoComplete="tel" defaultValue="+218 " required dir="ltr" />
                <label className="block">
                  <span className="mb-1 block text-sm text-ink-700">{d.contact.branch}</span>
                  <select name="branch" className="h-12 w-full border border-ink-900/20 bg-white px-3 text-ink-900 focus:border-green-700 focus:outline-none">
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.city[lang]}
                      </option>
                    ))}
                  </select>
                </label>
                <Field label={d.contact.farm} name="farm" />
                <label className="block">
                  <span className="mb-1 block text-sm text-ink-700">{d.contact.message}</span>
                  <textarea name="message" rows={3} className="w-full border border-ink-900/20 bg-white p-3 text-ink-900 focus:border-green-700 focus:outline-none" />
                </label>
                <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
                {err && <p className="text-sm text-red-700">{err}</p>}
                {state === "error" && <p className="text-sm text-red-700">{d.contact.error}</p>}
                <button
                  type="submit"
                  disabled={state === "sending"}
                  className="group inline-flex h-12 w-full items-center justify-center gap-3 bg-green-700 px-6 text-white transition hover:bg-green-800 disabled:opacity-60"
                >
                  {state === "sending" ? d.contact.sending : d.contact.send}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-ink-700">
        {label}
        {rest.required && " *"}
      </span>
      <input {...rest} className="h-12 w-full border border-ink-900/20 bg-white px-3 text-ink-900 focus:border-green-700 focus:outline-none" />
    </label>
  );
}
