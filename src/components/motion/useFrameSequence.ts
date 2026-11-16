"use client";
/* eslint-disable react-hooks/immutability, react-hooks/preserve-manual-memoization -- imperative canvas drawing via refs */

import { useCallback, useEffect, useRef } from "react";

/**
 * Apple-style image-sequence player. Frames live in /media/seq/{name}/{d|m}/0001.webp.
 * Loads frame 1 first, the rest progressively; draws with object-fit: cover onto a canvas.
 * Returns render(progress 0..1).
 */
export function useFrameSequence(
  canvas: React.RefObject<HTMLCanvasElement | null>,
  { name, frames, step = 1, mobileStep = 1, focusX = 0.5 }: { name: string; frames: number; step?: number; mobileStep?: number; focusX?: number },
) {
  const imgs = useRef<HTMLImageElement[]>([]);
  const current = useRef(0);
  const want = useRef(0);

  const draw = useCallback(
    (index: number) => {
      const c = canvas.current;
      if (!c) return;
      // nearest loaded frame at or before index
      let i = index;
      while (i > 0 && !imgs.current[i]?.complete) i--;
      const img = imgs.current[i];
      if (!img || !img.complete || !img.naturalWidth) return;
      const ctx = c.getContext("2d")!;
      const cw = c.width,
        ch = c.height;
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * s,
        h = img.naturalHeight * s;
      ctx.drawImage(img, (cw - w) * focusX, (ch - h) / 2, w, h);
      current.current = i;
    },
    [canvas, focusX],
  );

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const tag = mobile ? "m" : "d";
    const st = mobile ? mobileStep : step;
    const list: HTMLImageElement[] = [];
    const indices: number[] = [];
    for (let f = 1; f <= frames; f += st) indices.push(f);
    indices.forEach((f, i) => {
      const img = new Image();
      img.decoding = "async";
      list[i] = img;
      const load = () => {
        img.src = `/media/seq/${name}/${tag}/${String(f).padStart(4, "0")}.webp`;
      };
      img.onload = () => {
        if (i === want.current || i === 0) draw(want.current);
      };
      if (i === 0) load();
      else setTimeout(load, 120 + i * 12);
    });
    imgs.current = list;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = c.getBoundingClientRect();
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
      draw(want.current);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    return () => {
      ro.disconnect();
      list.forEach((img) => (img.onload = null));
    };
  }, [canvas, name, frames, step, mobileStep, draw]);

  return useCallback(
    (progress: number) => {
      const n = imgs.current.length;
      if (!n) return;
      const i = Math.min(n - 1, Math.max(0, Math.round(progress * (n - 1))));
      want.current = i;
      if (i !== current.current) draw(i);
    },
    [draw],
  );
}
