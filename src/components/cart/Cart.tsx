"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSite } from "@/components/providers/SiteProvider";
import { findProduct, productHref } from "@/content/catalog";
import { site } from "@/content/site";
import { waLink } from "@/lib/whatsapp";
import { href } from "@/lib/i18n";

/*
 * Enquiry cart: not a checkout. Visitors collect products and quantities, then send the whole list to the
 * sales team as one WhatsApp message. Kept in localStorage so it survives page changes and reloads.
 */
export type CartItem = { slug: string; qty: number; note?: string };

type Ctx = {
  items: CartItem[];
  count: number;
  add: (slug: string, qty?: number, note?: string) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const CartCtx = createContext<Ctx | null>(null);
const KEY = "gg-cart";

export const useCart = () => {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
};

const T = {
  en: {
    title: "Your enquiry",
    empty: "Nothing here yet. Add products from any product page, or let the farm planner suggest a list.",
    planner: "Open the farm planner",
    send: "Send enquiry on WhatsApp",
    clear: "Clear list",
    close: "Close",
    note: "This is not an order. Our sales team replies on WhatsApp with prices, availability and delivery.",
    remove: "Remove",
    hello: "Hello Ghargrow, I would like a quote for:",
    added: "Added to enquiry",
    add: "Add to enquiry",
    qty: "Quantity",
  },
  ar: {
    title: "طلب الاستفسار",
    empty: "القائمة فارغة. أضف منتجات من صفحات المنتجات، أو دع مخطط المزرعة يقترح قائمة.",
    planner: "افتح مخطط المزرعة",
    send: "أرسل الطلب عبر واتساب",
    clear: "مسح القائمة",
    close: "إغلاق",
    note: "هذا ليس طلب شراء. يرد فريق المبيعات عبر واتساب بالأسعار والتوفر والتوصيل.",
    remove: "حذف",
    hello: "مرحباً غرغار، أرغب في عرض سعر لـ:",
    added: "أضيف إلى الطلب",
    add: "أضف إلى الطلب",
    qty: "الكمية",
  },
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      // read once after mount (localStorage isn't available during server render)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems((JSON.parse(raw) as CartItem[]).filter((i) => findProduct(i.slug)));
    } catch {}
  }, []);
  const save = (next: CartItem[]) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
    return next;
  };

  const add = useCallback((slug: string, qty = 1, note?: string) => {
    setItems((cur) => {
      const has = cur.find((i) => i.slug === slug);
      return save(has ? cur.map((i) => (i.slug === slug ? { ...i, qty: i.qty + qty, note: note ?? i.note } : i)) : [...cur, { slug, qty, note }]);
    });
  }, []);
  const setQty = useCallback((slug: string, qty: number) => setItems((cur) => save(cur.map((i) => (i.slug === slug ? { ...i, qty: Math.max(1, Math.min(9999, qty)) } : i)))), []);
  const remove = useCallback((slug: string) => setItems((cur) => save(cur.filter((i) => i.slug !== slug))), []);
  const clear = useCallback(() => setItems(save([])), []);
  const count = items.reduce((n, i) => n + i.qty, 0);

  const value = useMemo(() => ({ items, count, add, setQty, remove, clear, open, setOpen }), [items, count, add, setQty, remove, clear, open]);
  return (
    <CartCtx.Provider value={value}>
      {children}
      <CartDrawer />
    </CartCtx.Provider>
  );
}

function CartIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden>
      <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20.5 8H6.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9.5" cy="19.5" r="1.3" />
      <circle cx="17" cy="19.5" r="1.3" />
    </svg>
  );
}

/** Header button: opens the drawer, shows how many items are in the list. */
export function CartButton() {
  const { count, setOpen } = useCart();
  const { lang } = useSite();
  return (
    <button type="button" onClick={() => setOpen(true)} className="relative grid size-10 place-items-center" aria-label={`${T[lang].title} (${count})`}>
      <CartIcon />
      {count > 0 && (
        <span className="absolute -end-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full bg-green-700 px-1 text-[10px] leading-[18px] font-medium text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

/** Quantity stepper + "Add to enquiry" for product pages. */
export function AddToCart({ slug, className = "" }: { slug: string; className?: string }) {
  const { add, setOpen } = useCart();
  const { lang } = useSite();
  const [qty, setQ] = useState(1);
  const [done, setDone] = useState(false);
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <Stepper value={qty} onChange={setQ} label={T[lang].qty} />
      <button
        type="button"
        onClick={() => {
          add(slug, qty);
          setDone(true);
          setOpen(true);
          setTimeout(() => setDone(false), 1800);
        }}
        className="inline-flex h-12 items-center gap-2 bg-ink-900 px-6 text-[15px] text-white transition hover:bg-green-700"
      >
        <CartIcon className="size-4" />
        {done ? T[lang].added : T[lang].add}
      </button>
    </div>
  );
}

export function Stepper({ value, onChange, label, dark = false }: { value: number; onChange: (n: number) => void; label: string; dark?: boolean }) {
  const b = `grid size-10 place-items-center transition ${dark ? "hover:bg-white/10" : "hover:bg-ink-900/5"}`;
  return (
    <div className={`inline-flex h-12 items-center border ${dark ? "border-white/25" : "border-ink-900/20"}`} role="group" aria-label={label}>
      <button type="button" className={b} onClick={() => onChange(Math.max(1, value - 1))} aria-label="−">
        −
      </button>
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(Math.max(1, Math.min(9999, Number(e.target.value) || 1)))}
        aria-label={label}
        className="w-14 [appearance:textfield] bg-transparent text-center font-mono text-[15px] outline-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button type="button" className={b} onClick={() => onChange(Math.min(9999, value + 1))} aria-label="+">
        +
      </button>
    </div>
  );
}

function CartDrawer() {
  const { items, setQty, remove, clear, open, setOpen } = useCart();
  const { lang } = useSite();
  const t = T[lang];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const message = [
    t.hello,
    "",
    ...items.map((i, n) => {
      const p = findProduct(i.slug)!;
      return `${n + 1}. ${p.name} × ${i.qty}${i.note ? ` (${i.note})` : ""}`;
    }),
  ].join("\n");

  return (
    <div className={`fixed inset-0 z-[80] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-ink-900/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} onClick={() => setOpen(false)} />
      <aside
        role="dialog"
        aria-label={t.title}
        className={`absolute inset-y-0 end-0 flex w-full max-w-[460px] flex-col bg-sand-50 shadow-2xl transition-transform duration-500 ${
          open ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink-900/10 px-6 py-5">
          <p className="h3">{t.title}</p>
          <button type="button" onClick={() => setOpen(false)} className="p-2 text-[14px] text-ink-700 hover:text-ink-900">
            {t.close} ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4" data-lenis-prevent>
          {items.length === 0 ? (
            <div className="py-10">
              <p className="text-[16px] leading-relaxed text-ink-900/70">{t.empty}</p>
              <Link href={href("/find-your-machine", lang)} onClick={() => setOpen(false)} className="mt-6 inline-flex h-12 items-center bg-green-700 px-6 text-white hover:bg-green-900">
                {t.planner} →
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-ink-900/10">
              {items.map((i) => {
                const p = findProduct(i.slug)!;
                return (
                  <li key={i.slug} className="flex gap-4 py-5">
                    <Link href={href(productHref(p), lang)} onClick={() => setOpen(false)} className="relative size-20 shrink-0 overflow-hidden bg-sand-200">
                      <Image src={p.card ?? p.image} alt="" fill sizes="80px" className="object-cover" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="text-[16px] leading-tight font-medium">{p.name}</p>
                      <p className="mt-0.5 text-[13px] text-ink-900/60">{i.note ?? p.type[lang]}</p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <Stepper value={i.qty} onChange={(n) => setQty(i.slug, n)} label={t.qty} />
                        <button type="button" onClick={() => remove(i.slug)} className="text-[13px] text-ink-900/60 underline-offset-2 hover:text-ink-900 hover:underline">
                          {t.remove}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-ink-900/10 px-6 py-5">
            <p className="text-[13px] leading-relaxed text-ink-900/60">{t.note}</p>
            <a
              href={waLink(site.defaultWhatsapp, message)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex h-14 w-full items-center justify-center gap-2 bg-[#25d366] text-[16px] font-medium text-ink-900 transition hover:brightness-95"
            >
              {t.send}
            </a>
            <button type="button" onClick={clear} className="mt-3 w-full text-center text-[13px] text-ink-900/60 hover:text-ink-900">
              {t.clear}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
