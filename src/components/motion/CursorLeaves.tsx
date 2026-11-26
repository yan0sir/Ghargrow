"use client";

import { useEffect } from "react";

/*
 * Cursor trail: as the mouse moves, a single green leaf drops from the pointer every so often,
 * drifting and turning as it falls, then fading out. Mouse only (no touch), off for reduced motion.
 */
const GREENS = ["#43780e", "#5c8f2a", "#7aa83f", "#a9c98a"];
const LEAF =
  '<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 2C6 6 4 12 6 18c1 2 3 4 6 4 0-6 1-11 6-16-2-2-4-4-6-4z" fill="currentColor"/><path d="M12 22c0-6 1-11 6-16" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="1" stroke-linecap="round"/></svg>';

export function CursorLeaves() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const layer = document.createElement("div");
    layer.setAttribute("aria-hidden", "true");
    layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:90;overflow:hidden";
    document.body.appendChild(layer);

    let lastX = 0,
      lastY = 0,
      travelled = 0,
      alive = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      travelled += Math.hypot(e.clientX - lastX, e.clientY - lastY);
      lastX = e.clientX;
      lastY = e.clientY;
      // one leaf at a time: about every 90px of movement, and never more than a handful on screen
      if (travelled < 90 || alive > 6) return;
      travelled = 0;
      const size = 14 + Math.random() * 10;
      const leaf = document.createElement("span");
      leaf.innerHTML = LEAF;
      leaf.style.cssText = `position:absolute;left:${e.clientX - size / 2}px;top:${e.clientY - size / 2}px;width:${size}px;height:${size}px;color:${GREENS[(Math.random() * GREENS.length) | 0]};will-change:transform,opacity`;
      layer.appendChild(leaf);
      alive++;
      const drift = (Math.random() - 0.5) * 120;
      const spin = (Math.random() < 0.5 ? -1 : 1) * (120 + Math.random() * 200);
      const fall = 140 + Math.random() * 120;
      const start = Math.random() * 360;
      const anim = leaf.animate(
        [
          { transform: `translate(0,0) rotate(${start}deg)`, opacity: 0 },
          { transform: `translate(${drift * 0.4}px,${fall * 0.25}px) rotate(${start + spin * 0.3}deg)`, opacity: 1, offset: 0.15 },
          { transform: `translate(${-drift * 0.3}px,${fall * 0.6}px) rotate(${start + spin * 0.7}deg)`, opacity: 0.9, offset: 0.6 },
          { transform: `translate(${drift}px,${fall}px) rotate(${start + spin}deg)`, opacity: 0 },
        ],
        { duration: 1800 + Math.random() * 900, easing: "cubic-bezier(.3,.1,.4,1)" },
      );
      anim.onfinish = () => {
        leaf.remove();
        alive--;
      };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      layer.remove();
    };
  }, []);
  return null;
}
