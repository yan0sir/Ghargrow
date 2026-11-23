/**
 * Works out whether what is visible behind a point on screen is dark or light, so fixed UI (the header)
 * can pick light or dark text. It reads the real layers under the point, top-most first:
 *   - an element with data-tone="dark" | "light" (a hint for things that can't be read)
 *   - a WebGL canvas that publishes data-line="r,g,b;r,g,b;…" (colours across its width at the header line)
 *   - an image, video or 2D canvas: samples its pixels around the point (looks further down where see-through)
 *   - background colours and gradients
 * See-through layers on top (a tint over a video, a gradient over a photo) are blended over whatever
 * solid thing is found below them, so the result is what the eye actually sees.
 * Returns null when nothing could be read.
 */

type Tone = "dark" | "light";
type RGB = [number, number, number];
type RGBA = [number, number, number, number];

let probeCanvas: HTMLCanvasElement | null = null;
const ctx = () => {
  probeCanvas ??= document.createElement("canvas");
  probeCanvas.width = probeCanvas.height = 8;
  return probeCanvas.getContext("2d", { willReadFrequently: true });
};

/** WCAG relative luminance of an sRGB colour (0–255 channels). */
const luminance = ([r, g, b]: RGB) => {
  const f = (c: number) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

/** Dark when white text contrasts better than the ink colour (#14140f, luminance ≈ 0.0069). */
const toneOf = (c: RGB): Tone => {
  const L = luminance(c);
  return 1.05 / (L + 0.05) > (L + 0.05) / 0.0569 ? "dark" : "light";
};

const num = (v: string) => (v.endsWith("%") ? parseFloat(v) / 100 : parseFloat(v));

/** oklab → sRGB (0–255). */
function oklabToRgb(L: number, a: number, b: number): RGB {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return lin.map((c) => {
    c = Math.min(1, Math.max(0, c));
    return 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
  }) as RGB;
}

/** One CSS colour as computed by the browser: rgb()/rgba(), oklab() or transparent. */
function parseColor(c: string): RGBA | null {
  c = c.trim();
  if (c === "transparent") return [0, 0, 0, 0];
  let m = c.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/);
  if (m) return [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : num(m[4])];
  m = c.match(/^oklab\(\s*([-\d.]+%?)\s+([-\d.e]+)\s+([-\d.e]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/);
  if (m) return [...oklabToRgb(num(m[1]), +m[2], +m[3]), m[4] === undefined ? 1 : num(m[4])];
  return null;
}

/** Split a CSS list on top-level commas (not the ones inside rgb(…)). */
function splitTop(s: string) {
  const out: string[] = [];
  let depth = 0,
    cur = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/** Colour of a vertical linear-gradient at (x, y) over element rect r. Other gradient shapes use their first stop. */
function gradientAt(bg: string, r: DOMRect, y: number): RGBA | null {
  const m = bg.match(/linear-gradient\((.*)\)\s*$/);
  if (!m) return null;
  const parts = splitTop(m[1]);
  let dir = "to bottom";
  if (/^(to |[-\d.]+deg)/.test(parts[0])) dir = parts.shift()!.replace(/\s+in\s+\w+$/, "");
  else if (/^in /.test(parts[0])) parts.shift();
  const stops = parts
    .map((p) => {
      const sm = p.match(/^(.*?\))\s*([\d.]+%)?$/) ?? p.match(/^(transparent)\s*([\d.]+%)?$/);
      const col = sm ? parseColor(sm[1]) : null;
      return col ? { col, at: sm?.[2] ? num(sm[2]) : NaN } : null;
    })
    .filter(Boolean) as { col: RGBA; at: number }[];
  if (!stops.length) return null;
  stops.forEach((s, i) => Number.isNaN(s.at) && (s.at = stops.length === 1 ? 0 : i / (stops.length - 1)));
  let t = Math.min(1, Math.max(0, (y - r.top) / (r.height || 1)));
  if (dir === "to top" || dir === "0deg") t = 1 - t;
  else if (dir !== "to bottom" && dir !== "180deg") return stops[0].col;
  let i = 0;
  while (i < stops.length - 1 && stops[i + 1].at < t) i++;
  const a = stops[i],
    b = stops[Math.min(i + 1, stops.length - 1)];
  const f = b.at === a.at ? 0 : Math.min(1, Math.max(0, (t - a.at) / (b.at - a.at)));
  return [0, 1, 2, 3].map((k) => a.col[k] + (b.col[k] - a.col[k]) * f) as RGBA;
}

/** Average colour of an image/video/canvas around (x, y), honouring object-fit. null if unreadable or see-through. */
function sampleMedia(el: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement, x: number, y: number): RGB | null {
  const r = el.getBoundingClientRect();
  const nw = el instanceof HTMLImageElement ? el.naturalWidth : el instanceof HTMLVideoElement ? el.videoWidth : el.width;
  const nh = el instanceof HTMLImageElement ? el.naturalHeight : el instanceof HTMLVideoElement ? el.videoHeight : el.height;
  if (!nw || !nh || !r.width || !r.height) return null;
  const fit = el instanceof HTMLCanvasElement ? "fill" : getComputedStyle(el).objectFit;
  const sx = fit === "contain" ? Math.min(r.width / nw, r.height / nh) : fit === "fill" ? r.width / nw : Math.max(r.width / nw, r.height / nh);
  const sy = fit === "fill" ? r.height / nh : sx;
  const ox = (r.width - nw * sx) / 2;
  const oy = (r.height - nh * sy) / 2;
  // a 48 × 24 px patch around the point, in the media's own pixels
  const px = (x - r.left - ox) / sx;
  const py = (y - r.top - oy) / sy;
  const w = 48 / sx;
  const h = 24 / sy;
  const c = ctx();
  if (!c) return null;
  try {
    c.clearRect(0, 0, 8, 8);
    c.drawImage(el, Math.max(0, px - w / 2), Math.max(0, py - h / 2), w, h, 0, 0, 8, 8);
    const d = c.getImageData(0, 0, 8, 8).data;
    let R = 0,
      G = 0,
      B = 0,
      A = 0;
    for (let i = 0; i < d.length; i += 4) {
      const a = d[i + 3] / 255;
      R += d[i] * a;
      G += d[i + 1] * a;
      B += d[i + 2] * a;
      A += a;
    }
    if (A < 64 * 0.5) return null; // mostly transparent: look at what is behind it
    return [R / A, G / A, B / A];
  } catch {
    return null; // cross-origin or not decoded yet
  }
}

export function toneAt(x: number, y: number, ignore: (el: Element) => boolean): Tone | null {
  const tints: RGBA[] = []; // see-through layers above the solid one, top-most first
  const finish = (base: RGB): Tone => {
    let c = base;
    for (let i = tints.length - 1; i >= 0; i--) {
      const [r, g, b, a] = tints[i];
      c = [r * a + c[0] * (1 - a), g * a + c[1] * (1 - a), b * a + c[2] * (1 - a)];
    }
    return toneOf(c);
  };
  const DARK: RGB = [20, 20, 15];
  const LIGHT: RGB = [241, 238, 233];

  for (const el of document.elementsFromPoint(x, y)) {
    if (ignore(el)) continue;
    const hint = el.getAttribute("data-tone");
    if (hint === "dark" || hint === "light") return finish(hint === "dark" ? DARK : LIGHT);
    const cs = getComputedStyle(el);
    if (+cs.opacity < 0.05 || cs.visibility === "hidden") continue;

    if (el instanceof HTMLCanvasElement && el.dataset.line) {
      const cols = el.dataset.line.split(";");
      const r = el.getBoundingClientRect();
      const i = Math.min(cols.length - 1, Math.max(0, Math.floor(((x - r.left) / r.width) * cols.length)));
      return finish(cols[i].split(",").map(Number) as RGB);
    }
    if (el instanceof HTMLImageElement || el instanceof HTMLVideoElement || el instanceof HTMLCanvasElement) {
      const c = sampleMedia(el, x, y);
      if (c) return finish(c);
      continue;
    }

    // a gradient paints above the element's own background colour
    if (cs.backgroundImage.includes("gradient")) {
      const g = gradientAt(cs.backgroundImage, el.getBoundingClientRect(), y);
      if (g && g[3] > 0.02) {
        if (g[3] >= 0.98) return finish([g[0], g[1], g[2]]);
        tints.push(g);
      }
    }
    const bg = parseColor(cs.backgroundColor);
    if (bg && bg[3] > 0.02) {
      if (bg[3] >= 0.98) return finish([bg[0], bg[1], bg[2]]);
      tints.push(bg);
    }
  }
  // nothing solid found: the page background
  const body = parseColor(getComputedStyle(document.body).backgroundColor);
  return body && body[3] > 0.5 ? finish([body[0], body[1], body[2]]) : tints.length ? finish(LIGHT) : null;
}
