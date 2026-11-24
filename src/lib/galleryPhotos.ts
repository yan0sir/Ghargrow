import { readdirSync } from "node:fs";
import path from "node:path";

/**
 * Photos and videos for the homepage "Proven Machinery" strip: files named 01–10 (.jpg/.jpeg/.png/.webp/
 * .avif, or .mp4/.webm for a silent looping video) in public/media/gallery/. A video can have a still
 * NN-poster.webp shown until it plays. Returns 10 entries in slot order; null where no file has that number.
 * Read on the server when the page is built, so adding photos only needs the files + a push.
 */
export function galleryPhotos(slots = 10): (string | null)[] {
  let files: string[] = [];
  try {
    files = readdirSync(path.join(process.cwd(), "public", "media", "gallery"));
  } catch {
    // folder not there yet: all slots stay empty
  }
  return Array.from({ length: slots }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    const f = files.find((x) => new RegExp(`^${n}\\.(jpe?g|png|webp|avif|mp4|webm)$`, "i").test(x));
    return f ? `/media/gallery/${f}` : null;
  });
}
