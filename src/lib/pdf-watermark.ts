import { degrees, type PDFDocument, type PDFImage, type PDFPage } from "pdf-lib";
import logoUrl from "@/assets/sidheswar-logo.png";
import {
  blurPxFor,
  dataUrlToBytes,
  getUserLogoDataUrl,
  getWatermarkSettings,
  sizeFactorFor,
  type Placement,
  type WatermarkSettings,
} from "@/lib/user-logo";

let cachedDefaultBytes: Uint8Array | null = null;

export const WATERMARK_MISSING_MESSAGE =
  "Watermark logo missing. Please upload the official SIDHESWAR PUBLICATION logo.";

async function loadDefaultLogoBytes(): Promise<Uint8Array> {
  if (cachedDefaultBytes) return cachedDefaultBytes;
  const res = await fetch(logoUrl);
  if (!res.ok) throw new Error(WATERMARK_MISSING_MESSAGE);
  const buf = await res.arrayBuffer();
  if (!buf.byteLength) throw new Error(WATERMARK_MISSING_MESSAGE);
  cachedDefaultBytes = new Uint8Array(buf);
  return cachedDefaultBytes;
}

export type WatermarkImage = PDFImage;

export interface DrawOptions {
  placement: Placement;
  opacity: number;
  sizeFactor: number;
  blurPx: number;
  rotationDeg: number;
  margin: number;
}

/* Module-level "active" options applied during the next watermark pass. */
let activeOpts: DrawOptions | null = null;

export function setActiveDrawOptions(opts: DrawOptions | null) {
  activeOpts = opts;
}

const DEFAULT_DRAW: DrawOptions = {
  placement: "center",
  opacity: 0.07,
  sizeFactor: 0.82,
  blurPx: 0,
  rotationDeg: 0,
  margin: 36,
};

export function buildDrawOptions(s: WatermarkSettings): DrawOptions {
  return {
    placement: s.placement,
    opacity: Math.max(0, Math.min(0.15, s.opacity)),
    sizeFactor: sizeFactorFor(s.size),
    blurPx: blurPxFor(s.blur),
    rotationDeg: s.rotation,
    margin: s.margin,
  };
}

/** Decide which logo (user vs default) to embed for this PDF. */
export async function loadActiveWatermarkImage(
  pdf: PDFDocument,
): Promise<{ img: WatermarkImage; isUserLogo: boolean; opts: DrawOptions }> {
  const settings = getWatermarkSettings();
  const userUrl = getUserLogoDataUrl();
  if (settings.enabled && userUrl) {
    try {
      const bytes = dataUrlToBytes(userUrl);
      const img = await pdf.embedPng(bytes);
      console.info("[watermark] embedded USER logo", { w: img.width, h: img.height });
      return { img, isUserLogo: true, opts: buildDrawOptions(settings) };
    } catch (err) {
      console.warn("[watermark] user logo embed failed, falling back to default", err);
    }
  }
  const bytes = await loadDefaultLogoBytes();
  const img = await pdf.embedPng(bytes);
  return { img, isUserLogo: false, opts: DEFAULT_DRAW };
}

/** Backwards-compatible: returns default SIDHESWAR-or-user image without opts. */
export async function loadWatermarkImage(pdf: PDFDocument): Promise<WatermarkImage> {
  const { img, opts } = await loadActiveWatermarkImage(pdf);
  setActiveDrawOptions(opts);
  return img;
}

/* ---------------- placement geometry ---------------- */

function placeBox(
  pw: number,
  ph: number,
  iw: number,
  ih: number,
  placement: Placement,
  sizeFactor: number,
  margin: number,
): { x: number; y: number; w: number; h: number } {
  let maxW = pw * sizeFactor;
  let maxH = ph * sizeFactor;
  if (placement !== "center") {
    // corners / header / footer get smaller bounds
    maxW = Math.min(pw * 0.3, maxW);
    maxH = Math.min(ph * 0.22, maxH);
  }
  const scale = Math.min(maxW / iw, maxH / ih, 1);
  const w = iw * scale;
  const h = ih * scale;
  let x = (pw - w) / 2;
  let y = (ph - h) / 2;
  switch (placement) {
    case "top-left": x = margin; y = ph - h - margin; break;
    case "top-right": x = pw - w - margin; y = ph - h - margin; break;
    case "bottom-left": x = margin; y = margin; break;
    case "bottom-right": x = pw - w - margin; y = margin; break;
    case "header-center": x = (pw - w) / 2; y = ph - h - margin; break;
    case "footer-center": x = (pw - w) / 2; y = margin; break;
    case "center":
    default: break;
  }
  return { x, y, w, h };
}

export function drawWatermarkOnPage(page: PDFPage, img: WatermarkImage): void {
  const opts = activeOpts ?? DEFAULT_DRAW;
  const { width: pw, height: ph } = page.getSize();
  const { x, y, w, h } = placeBox(pw, ph, img.width, img.height, opts.placement, opts.sizeFactor, opts.margin);

  const rotate = degrees(opts.rotationDeg);
  // Blur halo: a couple of offset low-opacity passes around the main image.
  if (opts.blurPx > 0) {
    const haloOp = Math.max(0.005, opts.opacity * 0.12);
    page.drawImage(img, { x: x - opts.blurPx, y, width: w, height: h, rotate, opacity: haloOp });
    page.drawImage(img, { x: x + opts.blurPx, y, width: w, height: h, rotate, opacity: haloOp });
    page.drawImage(img, { x, y: y - opts.blurPx, width: w, height: h, rotate, opacity: haloOp });
    page.drawImage(img, { x, y: y + opts.blurPx, width: w, height: h, rotate, opacity: haloOp });
  }
  page.drawImage(img, { x, y, width: w, height: h, rotate, opacity: opts.opacity });
}

export async function applyWatermarkToAllPages(
  pdf: PDFDocument,
  context: string = "pdf-export",
): Promise<void> {
  const startedAt = Date.now();
  const { img, opts } = await loadActiveWatermarkImage(pdf);
  setActiveDrawOptions(opts);
  const pages = pdf.getPages();
  for (const page of pages) drawWatermarkOnPage(page, img);
  console.info(`[watermark:${context}] applied`, {
    pageCount: pages.length,
    durationMs: Date.now() - startedAt,
  });
}
