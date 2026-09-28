/**
 * Client-side image downscaling.
 *
 * Profile photos and payment screenshots were previously stored as base64 data
 * URLs directly in Postgres text columns (`profiles.avatar_url`,
 * `certificate_payments.payment_screenshot_url`). A 600KB photo became ~820KB
 * of base64 text and a 2MB screenshot became ~2.7MB, and every Admin list
 * query re-downloaded all of them.
 *
 * Downscaling before the base64 encode keeps those columns small without
 * changing any authorization or storage rules.
 */

/** Avatars are rendered at 32-80px and printed at ~30x36mm on ID cards. */
export const AVATAR_MAX_DIM = 320;

/** Payment screenshots must stay legible for amount verification. */
export const SCREENSHOT_MAX_DIM = 1280;

const JPEG_QUALITY = 0.8;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to decode image"));
    img.src = src;
  });
}

/**
 * Encodes an image as a bounded-size JPEG data URL.
 * Falls back to the original data URL if canvas processing is unavailable.
 */
export async function fileToResizedDataUrl(
  file: File,
  maxDim: number,
  quality: number = JPEG_QUALITY,
): Promise<string> {
  const original = await readAsDataUrl(file);
  if (!original.startsWith("data:image/")) return original;

  let img: HTMLImageElement;
  try {
    img = await loadImage(original);
  } catch {
    return original;
  }

  const w = img.naturalWidth;
  const h = img.naturalHeight;
  if (!w || !h) return original;

  const scale = Math.min(1, maxDim / Math.max(w, h));
  const targetW = Math.max(1, Math.round(w * scale));
  const targetH = Math.max(1, Math.round(h * scale));

  try {
    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return original;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetW, targetH);
    ctx.drawImage(img, 0, 0, targetW, targetH);
    const out = canvas.toDataURL("image/jpeg", quality);
    // Never make the payload bigger than what we were given.
    return out.length < original.length ? out : original;
  } catch {
    return original;
  }
}
