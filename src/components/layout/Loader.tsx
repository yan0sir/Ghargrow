"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { LeafMark } from "@/components/motion/LeafMark";

/** First-visit leaf-bloom intro (once per session, ~1.6s, skippable by click). */
export function Loader() {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("gg-intro")) return;
      sessionStorage.setItem("gg-intro", "1");
    } catch {}
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only state read after hydration
    setShow(true);
  }, []);

  const exit = () => {
    if (!ref.current) return;
    gsap.to(ref.current, {
      clipPath: "inset(0 0 100% 0)",
      duration: 0.9,
      ease: "expo.inOut",
      delay: 0.15,
      onComplete: () => setShow(false),
    });
  };

  if (!show) return null;
  return (
    <div ref={ref} onClick={exit} className="fixed inset-0 z-[200] grid place-items-center bg-sand-50" style={{ clipPath: "inset(0 0 0% 0)" }}>
      <LeafMark mode="once" className="w-24 md:w-32" onDone={exit} />
    </div>
  );
}
