"use client";

import { useEffect } from "react";

/*
 * Cursor trail: as the mouse moves, a single green leaf drops from the pointer every so often,
 * drifting and turning as it falls, then fading out. Mouse only (no touch), off for reduced motion.
 */
// the leaf from the reference: rounded blade with a pointed tip, short curved stem, dark → lime gradient
const SHADES = [
  ["#3f7a05", "#62c800"],
  ["#467f0c", "#76c41a"],
  ["#356a06", "#55b000"],
];
const leafSvg = ([a, b]: string[], id: number) =>
  `<svg viewBox="0 0 600 600" width="100%" height="100%"><defs><linearGradient id="gl${id}" x1="0.15" y1="0.25" x2="0.75" y2="0.7"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><path fill="url(#gl${id})" d="M468 62c-12 60-70 100-140 125-90 32-150 70-170 140-6 22-6 48 2 76l26-22-70 147h28c2-40 16-80 32-102 30 10 64 12 104 4 80-16 134-90 166-190 22-70 26-130 22-178z"/></svg>`;

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
      alive = 0,
      uid = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      travelled += Math.hypot(e.clientX - lastX, e.clientY - lastY);
      lastX = e.clientX;
      lastY = e.clientY;
      // a leaf about every 38px of movement, up to 18 on screen
      if (travelled < 38 || alive > 18) return;
      travelled = 0;
      const size = 18 + Math.random() * 14;
      const leaf = document.createElement("span");
      leaf.innerHTML = leafSvg(SHADES[(Math.random() * SHADES.length) | 0], ++uid);
      leaf.style.cssText = `position:absolute;left:${e.clientX - size / 2}px;top:${e.clientY - size / 2}px;width:${size}px;height:${size}px;will-change:transform,opacity`;
      layer.appendChild(leaf);
      alive++;
      const drift = (Math.random() - 0.5) * 180;
      const spin = (Math.random() < 0.5 ? -1 : 1) * (120 + Math.random() * 200);
      const fall = 220 + Math.random() * 200;
      const start = Math.random() * 360;
      const anim = leaf.animate(
        [
          { transform: `translate(0,0) rotate(${start}deg)`, opacity: 0 },
          { transform: `translate(${drift * 0.4}px,${fall * 0.25}px) rotate(${start + spin * 0.3}deg)`, opacity: 1, offset: 0.15 },
          { transform: `translate(${-drift * 0.3}px,${fall * 0.6}px) rotate(${start + spin * 0.7}deg)`, opacity: 0.9, offset: 0.6 },
          { transform: `translate(${drift}px,${fall}px) rotate(${start + spin}deg)`, opacity: 0 },
        ],
        { duration: 2200 + Math.random() * 1200, easing: "cubic-bezier(.3,.1,.4,1)" },
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
