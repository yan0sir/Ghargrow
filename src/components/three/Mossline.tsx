"use client";

import { useEffect, useRef } from "react";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import { mosslineCss, mosslineHtml } from "./mosslineContent";

const sans = Inter_Tight({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-ml-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-ml-mono" });

/** Mossline floating-island scroll story, mounted inside the site layout. */
export function Mossline() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => mountMossline(root.current!), []);
  return (
    <div id="ml" ref={root} className={`${sans.variable} ${mono.variable}`}>
      <style>{mosslineCss}</style>
      <div dangerouslySetInnerHTML={{ __html: mosslineHtml }} />
    </div>
  );
}

function mountMossline(rootEl: HTMLElement): () => void {
  const $ = <T extends Element = HTMLElement>(s: string) => rootEl.querySelector(s) as T;
  const $$ = <T extends Element = HTMLElement>(s: string) => Array.from(rootEl.querySelectorAll(s)) as T[];
  const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const vis = (el: HTMLElement | SVGElement, on: boolean) => (el.style.visibility = on ? "visible" : "hidden");
  let alive = true;
  const off: Array<() => void> = [];
  const on = (t: EventTarget, ev: string, fn: EventListener) => {
    t.addEventListener(ev, fn);
    off.push(() => t.removeEventListener(ev, fn));
  };

  /* ---------- video frame cache + canvas scrub ---------- */
  const FPS = 24;
  const video = $<HTMLVideoElement>("#push");
  // cleanup strips the src to free the decoder; restore it on (re)mount
  const src = video.dataset.src || video.getAttribute("src") || "";
  video.dataset.src = src;
  if (!video.getAttribute("src")) {
    video.src = src;
    video.load();
  }
  const cv = $<HTMLCanvasElement>("#cv");
  const ctx = cv.getContext("2d")!;
  let NF = 0,
    frames: (Blob | undefined)[] = [],
    want = 0,
    shown = -1,
    busy = false,
    inited = false;
  let grab: HTMLCanvasElement | null = null,
    gctx: CanvasRenderingContext2D | null = null;

  const nearest = (t: number) => {
    if (!NF) return -1;
    for (let k = 0; k < NF; k++) {
      if (t - k >= 0 && frames[t - k]) return t - k;
      if (t + k < NF && frames[t + k]) return t + k;
    }
    return -1;
  };
  const drawWant = () => {
    if (busy || !NF || !alive) return;
    const n = nearest(want);
    if (n < 0 || n === shown) return;
    busy = true;
    createImageBitmap(frames[n]!)
      .then((bm) => {
        if (!alive) return;
        const cw = cv.width,
          ch = cv.height,
          s = Math.max(cw / bm.width, ch / bm.height),
          w = bm.width * s,
          h = bm.height * s;
        ctx.drawImage(bm, (cw - w) / 2, (ch - h) / 2, w, h);
        bm.close();
        shown = n;
        busy = false;
        if (nearest(want) !== shown) drawWant();
      })
      .catch(() => (busy = false));
  };
  const store = (i: number, q: number) => {
    if (frames[i] || !gctx || !grab) return;
    try {
      gctx.drawImage(video, 0, 0, 1600, 900);
      grab.toBlob(
        (b) => {
          if (b && !frames[i]) {
            frames[i] = b;
            drawWant();
          }
        },
        "image/jpeg",
        q,
      );
    } catch {
      /* tainted canvas — the high-res still stays up */
    }
  };
  const sizeCanvas = () => {
    const d = Math.min(window.devicePixelRatio || 1, 1.5);
    cv.width = Math.round(cv.clientWidth * d);
    cv.height = Math.round(cv.clientHeight * d);
    shown = -1;
    drawWant();
  };
  const fallback = () => {
    let i = 1;
    const onSeek = () => {
      store(i, 0.86);
      i++;
      if (i < NF) video.currentTime = Math.min(i / FPS, video.duration - 0.01);
      else video.removeEventListener("seeked", onSeek);
    };
    on(video, "seeked", onSeek);
    video.currentTime = Math.min(1 / FPS, video.duration - 0.01);
  };
  const init = () => {
    if (inited) return;
    inited = true;
    NF = Math.max(2, Math.round(video.duration * FPS));
    frames = new Array(NF);
    grab = document.createElement("canvas");
    grab.width = 1600;
    grab.height = 900;
    gctx = grab.getContext("2d");
    store(0, 0.9);
    if ("requestVideoFrameCallback" in video) {
      const cb = (_now: number, meta: VideoFrameCallbackMetadata) => {
        if (!alive) return;
        const i = Math.min(NF - 1, Math.round(meta.mediaTime * FPS));
        if (i > 0) store(i, 0.86);
        if (!video.ended) video.requestVideoFrameCallback(cb);
      };
      video.requestVideoFrameCallback(cb);
      video.play().catch(fallback);
    } else fallback();
  };
  if (video.readyState >= 2) init();
  else on(video, "loadeddata", init);
  on(window, "resize", sizeCanvas);
  sizeCanvas();

  /* ---------- hero placement ---------- */
  const heroCopy = $("#heroCopy"),
    heroH1 = $("#heroCopy h1"),
    heroLine = $("#heroLine");
  const layoutHero = () => {
    const W = window.innerWidth,
      H = window.innerHeight;
    if (W < 821) {
      heroCopy.style.top = "";
      heroH1.style.fontSize = "";
      heroCopy.classList.add("wrapit");
      return;
    }
    heroCopy.classList.remove("wrapit");
    const bw = W * 1.06,
      bh = H * 1.12,
      k = Math.max(bw / 1600, bh / 900);
    const fernTop = -0.09 * H + (bh - 900 * k) / 2 + 245 * k + 0.06 * H;
    let fs = Math.min(104, 72 * k);
    heroH1.style.fontSize = fs + "px";
    const lw = heroLine.offsetWidth;
    if (lw > W * 0.86) {
      fs = (fs * (W * 0.86)) / lw;
      heroH1.style.fontSize = fs + "px";
    }
    heroCopy.style.top = fernTop + 0.5 * fs - heroCopy.offsetHeight + "px";
  };
  layoutHero();
  on(window, "resize", layoutHero);
  document.fonts?.ready.then(() => alive && layoutHero());

  /* ---------- word splitting ---------- */
  const vWords = $$("#vH span");
  const acct = $("#acct");
  acct.innerHTML = (acct.textContent || "")
    .split(" ")
    .map((w) => "<span>" + w + "</span>")
    .join(" ");
  const aWords = $$("#acct span");

  /* ---------- interactions ---------- */
  const hs = $$(".hs");
  hs.forEach((h) =>
    on(h.querySelector(".dot")!, "click", () => {
      const was = h.classList.contains("on");
      hs.forEach((o) => o.classList.remove("on"));
      if (!was) h.classList.add("on");
    }),
  );
  const rows = $$("#feats a");
  rows.forEach((r) =>
    on(r, "click", () => {
      const was = r.classList.contains("on");
      rows.forEach((o) => o.classList.remove("on"));
      if (!was) r.classList.add("on");
    }),
  );
  $$(".sc").forEach((c) => {
    on(c, "pointermove", ((e: PointerEvent) => {
      const b = c.getBoundingClientRect(),
        x = (e.clientX - b.left) / b.width - 0.5,
        y = (e.clientY - b.top) / b.height - 0.5;
      c.style.transform = "perspective(1000px) rotateY(" + x * 6 + "deg) rotateX(" + -y * 6 + "deg)";
    }) as EventListener);
    on(c, "pointerleave", () => (c.style.transform = ""));
  });
  let mx = 0,
    my = 0,
    sx = 0,
    sy = 0;
  on(window, "pointermove", ((e: PointerEvent) => {
    mx = e.clientX / window.innerWidth - 0.5;
    my = e.clientY / window.innerHeight - 0.5;
  }) as EventListener);

  /* ---------- solutions count-up ---------- */
  const stats = $$("#stats b"),
    sol = $("#sol");
  let counted = false;
  const fmt = (v: number, el: HTMLElement) =>
    el.getAttribute("data-comma") ? Math.round(v).toLocaleString("en-US") : v.toFixed(+(el.getAttribute("data-dec") || 0));
  const countUp = () => {
    counted = true;
    const t0 = performance.now();
    const step = (now: number) => {
      if (!alive) return;
      const t = Math.min(1, (now - t0) / 1600),
        e = ease(t);
      stats.forEach((el) => (el.textContent = fmt(+el.getAttribute("data-to")! * e, el)));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* ---------- per-frame controller ---------- */
  const story = $("#story"),
    cam = $("#cam"),
    camF = $("#camF"),
    plate = $("#plate"),
    fog = $("#fog");
  const L0 = $("#L0"),
    L1 = $("#L1"),
    L2 = $("#L2"),
    L3 = $("#L3"),
    L4 = $("#L4");
  const hud = $("#hud"),
    caption = $("#caption"),
    hint = $("#hint"),
    vChip = $("#vChip"),
    vP = $("#vP");
  const cred = $("#cred"),
    card = $("#card"),
    num = $("#num"),
    prog = $("#prog");
  const spark = $<SVGPolylineElement>("#spark");
  const rocks = $$(".rock");
  const sparkLen = spark.getTotalLength();
  spark.style.strokeDasharray = String(sparkLen);
  spark.style.strokeDashoffset = String(sparkLen);
  let sp = 0,
    last = performance.now(),
    raf = 0;

  const frame = (now: number) => {
    if (!alive) return;
    const dt = Math.min(64, now - last);
    last = now;
    const r = story.getBoundingClientRect();
    const p = clamp(-r.top / (story.offsetHeight - window.innerHeight));
    sp += (p - sp) * (1 - Math.pow(0.86, dt / 16.7));
    if (Math.abs(p - sp) < 0.0002) sp = p;
    sx += (mx - sx) * 0.06;
    sy += (my - sy) * 0.06;
    const H = window.innerHeight;

    const vp = ease(seg(sp, 0.05, 0.7));
    if (NF) {
      want = Math.round(vp * (NF - 1));
      drawWant();
    }
    const camT = "translate3d(" + -sx * 18 + "px," + (-sy * 12 + (1 - vp) * H * 0.06) + "px,0) scale(" + (1 + 0.02 * (1 - vp)) + ")";
    cam.style.transform = camT;
    camF.style.transform = camT;

    const ho = shown < 0 ? 0 : shown === 0 ? seg(sp, 0.06, 0.105) : 1;
    plate.style.opacity = String(1 - ho);
    vis(plate, ho < 1);
    camF.style.opacity = String(1 - ho);
    vis(camF, ho < 1);

    const h = seg(sp, 0.02, 0.1);
    heroCopy.style.transform = "translate3d(" + -sx * 10 + "px," + (-h * 80 - sy * 6) + "px,0) scale(" + (1 + h * 0.12) + ")";
    heroCopy.style.filter = "blur(" + h * 14 + "px)";
    heroCopy.style.opacity = String(1 - h);
    hud.style.transform = "translate3d(" + sx * 26 + "px," + (sy * 18 - h * 40) + "px,0)";
    hud.style.opacity = String(1 - seg(sp, 0.02, 0.08));
    const ch = String(1 - seg(sp, 0.01, 0.05));
    caption.style.opacity = ch;
    hint.style.opacity = ch;
    vis(L0, h < 1);
    vis(L1, h < 1);

    const fp = seg(sp, 0.02, 0.2),
      fe = fp * fp;
    rocks.forEach((rk) => {
      const x = +rk.getAttribute("data-x")!,
        y = +rk.getAttribute("data-y")!,
        d = +rk.getAttribute("data-d")!;
      rk.style.transform = "translate3d(" + (x * fp * 70 + sx * -24 * d) + "vw," + (y * fp * 60 + sy * -16 * d) + "vh,0) scale(" + (1 + fe * 1.6 * d) + ")";
      rk.style.filter = "blur(" + fe * 5 * d + "px)";
      vis(rk, fp < 1);
    });

    const fg = ease(seg(sp, 0.38, 0.47));
    fog.style.opacity = String(fg);
    vis(fog, fg > 0);
    fog.style.transform = "translate3d(" + ((fg - 1) * 18 + sx * -10) + "vw," + sy * -6 + "px,0)";

    const vIn = seg(sp, 0.16, 0.27),
      vOut = seg(sp, 0.34, 0.42);
    vWords.forEach((w, i) => {
      const k = clamp(vIn * 1.6 - i * 0.08);
      w.style.transform = "translate3d(0," + ((1 - k) * 30 - vOut * 60) + "px,0)";
      w.style.filter = "blur(" + ((1 - k) * 12 + vOut * 14) + "px)";
      w.style.opacity = String(k * (1 - vOut));
    });
    const vo = String(clamp(vIn * 2 - 0.6) * (1 - vOut));
    vChip.style.opacity = vo;
    vP.style.opacity = vo;
    vChip.style.transform = vP.style.transform = "translateY(" + -vOut * 50 + "px)";
    vis(L2, vIn > 0 && vOut < 1);

    const aIn = seg(sp, 0.45, 0.55),
      aOut = seg(sp, 0.63, 0.68),
      n = aWords.length;
    aWords.forEach((w, i) => {
      const k = clamp(aIn * 2.2 - (i / n) * 1.2);
      w.style.opacity = String((0.15 + 0.85 * k) * (1 - aOut));
      w.style.filter = "blur(" + ((1 - k) * 6 + aOut * 10) + "px)";
    });
    hs.forEach((el, i) => {
      const k = seg(sp, 0.49 + i * 0.02, 0.53 + i * 0.02);
      el.style.transform = "translate3d(" + sx * -30 + "px," + sy * -20 + "px,0) scale(" + k * (1 - aOut) + ")";
    });
    vis(L3, aIn > 0 && aOut < 1);

    const sIn = seg(sp, 0.72, 0.82),
      cIn = ease(seg(sp, 0.74, 0.86));
    cred.style.opacity = String(sIn);
    cred.style.transform = "translateY(" + (1 - sIn) * 30 + "px)";
    cred.style.filter = "blur(" + (1 - sIn) * 8 + "px)";
    card.style.opacity = String(cIn);
    card.style.transform =
      "translate3d(" + sx * -14 + "px," + ((1 - cIn) * 60 + sy * -10) + "px,0) rotateY(" + sx * 8 + "deg) rotateX(" + -sy * 8 + "deg)";
    num.textContent = String(Math.round(24 * seg(sp, 0.76, 0.9)));
    spark.style.strokeDashoffset = String(sparkLen * (1 - seg(sp, 0.77, 0.92)));
    rows.forEach((rw, i) => {
      const k = ease(seg(sp, 0.76 + i * 0.025, 0.82 + i * 0.025));
      rw.style.opacity = String(k);
      rw.style.transform = "translateX(" + (1 - k) * 40 + "px)";
    });
    vis(L4, sIn > 0 || cIn > 0);
    prog.style.transform = "scaleX(" + sp + ")";

    if (!counted && sol.getBoundingClientRect().top < H * 0.6) countUp();
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    off.forEach((f) => f());
    video.pause();
    video.removeAttribute("src");
    video.load();
  };
}
