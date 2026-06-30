/**
 * User-uploaded brand logo + watermark settings.
 * Stored in localStorage so it persists per browser/profile.
 *
 * All uploads are normalised to a PNG data URL via <canvas> so pdf-lib
 * (which only embeds PNG/JPG) can stamp them regardless of source format
 * (PNG, SVG, JPG, WebP).
 */

export type Placement =
  | "center"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "header-center"
  | "footer-center";

export type SizeOption = "small" | "medium" | "large";
export type BlurOption = "off" | "low" | "medium";
export type RotationOption = 0 | 45 | -45; // -45 = "Diagonal"

export interface WatermarkSettings {
  enabled: boolean;
  placement: Placement;
  opacity: number; // 0..0.15
  size: SizeOption;
  blur: BlurOption;
  rotation: RotationOption;
  margin: number; // in PDF points
}

export const DEFAULT_SETTINGS: WatermarkSettings = {
  enabled: false,
  placement: "center",
  opacity: 0.08,
  size: "large",
  blur: "off",
  rotation: 0,
  margin: 36,
};

const LOGO_KEY = "stamp_logo_data_url_v1";
const SETTINGS_KEY = "stamp_logo_settings_v1";

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function getUserLogoDataUrl(): string | null {
  if (!isBrowser()) return null;
  try {
    return localStorage.getItem(LOGO_KEY);
  } catch {
    return null;
  }
}

export function setUserLogoDataUrl(url: string | null): void {
  if (!isBrowser()) return;
  try {
    if (url) localStorage.setItem(LOGO_KEY, url);
    else localStorage.removeItem(LOGO_KEY);
  } catch (e) {
    console.warn("[stamp-logo] storage write failed", e);
  }
}

export function getWatermarkSettings(): WatermarkSettings {
  if (!isBrowser()) return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } as WatermarkSettings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function setWatermarkSettings(s: WatermarkSettings): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch (e) {
    console.warn("[stamp-logo] settings write failed", e);
  }
}

/** Convert any uploaded logo file (PNG/JPG/SVG/WebP) to a PNG data URL. */
export async function normaliseLogoToPng(file: File): Promise<string> {
  const ALLOWED = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"];
  if (file.size > 6 * 1024 * 1024) throw new Error("Logo must be under 6 MB.");
  if (!ALLOWED.includes(file.type) && !/\.(png|jpe?g|svg|webp)$/i.test(file.name)) {
    throw new Error("Logo must be PNG, JPG, SVG, or WebP.");
  }

  const dataUrl = await readAsDataUrl(file);
  const img = await loadImage(dataUrl);

  // Cap rendered size for sane embed dimensions.
  const MAX = 1024;
  let { width: w, height: h } = img;
  if (w > MAX || h > MAX) {
    const s = Math.min(MAX / w, MAX / h);
    w = Math.round(w * s);
    h = Math.round(h * s);
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, w);
  canvas.height = Math.max(1, h);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported.");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Could not read file."));
    r.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode image."));
    img.src = src;
  });
}

/** Decode a data URL into raw bytes for pdf-lib. */
export function dataUrlToBytes(dataUrl: string): Uint8Array {
  const comma = dataUrl.indexOf(",");
  const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function sizeFactorFor(size: SizeOption): number {
  if (size === "small") return 0.22;
  if (size === "medium") return 0.45;
  return 0.78;
}

export function blurPxFor(blur: BlurOption): number {
  if (blur === "off") return 0;
  if (blur === "low") return 0.3;
  return 0.8;
}
