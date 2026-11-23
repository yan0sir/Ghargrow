"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([type="hidden"]):not([tabindex="-1"]),select,textarea,[tabindex]:not([tabindex="-1"])';

/**
 * Keyboard handling for an overlay (menu, dialog) while `active`:
 * focus moves into it, Tab / Shift+Tab cycle inside it, Escape calls `onClose`,
 * and focus goes back to whatever had it before (usually the button that opened it).
 */
export function useFocusTrap(active: boolean, container: RefObject<HTMLElement | null>, onClose: () => void) {
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });

  useEffect(() => {
    if (!active) return;
    const before = document.activeElement as HTMLElement | null;
    const items = () =>
      Array.from(container.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter((e) => e.getClientRects().length > 0);

    // the overlay renders in the same commit, so wait a frame for it to be in the DOM
    const t = window.setTimeout(() => {
      if (!container.current?.contains(document.activeElement)) items()[0]?.focus();
    }, 0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close.current();
        return;
      }
      if (e.key !== "Tab") return;
      const list = items();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      const inside = container.current?.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      if (before && document.contains(before)) before.focus();
    };
  }, [active, container]);
}
