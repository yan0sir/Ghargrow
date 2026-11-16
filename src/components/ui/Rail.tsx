"use client";

import { useRef } from "react";
import { IconArrow } from "./Icons";

/** Horizontal snap rail with prev/next buttons (drag/swipe natively on touch). */
export function Rail({ children, label }: { children: React.ReactNode; label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const go = (dir: number) => {
    const el = ref.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    el.scrollBy({ left: dir * (rtl ? -1 : 1) * el.clientWidth * 0.8, behavior: "smooth" });
  };
  return (
    <div>
      <div className="mb-6 flex justify-end gap-2">
        <button onClick={() => go(-1)} className="grid size-11 place-items-center border border-ink-900/20 hover:bg-ink-900 hover:text-white" aria-label="Previous">
          <IconArrow className="size-4 rotate-180" />
        </button>
        <button onClick={() => go(1)} className="grid size-11 place-items-center border border-ink-900/20 hover:bg-ink-900 hover:text-white" aria-label="Next">
          <IconArrow className="size-4" />
        </button>
      </div>
      <div
        ref={ref}
        aria-label={label}
        className="no-scrollbar -mx-[var(--gutter)] flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-px-[var(--gutter)] px-[var(--gutter)] pb-2"
      >
        {children}
      </div>
    </div>
  );
}
