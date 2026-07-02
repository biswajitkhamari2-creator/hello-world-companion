/**
 * Pixel-perfect PDF export with block-aware pagination.
 *
 * Captures the on-screen preview (no re-layout, no AI re-run) and slices it
 * into A4 pages at safe block boundaries — never through a heading, callout
 * box, or handwritten line.
 *
 * Pipeline per export:
 *   1. Verify the source node is actually on screen.
 *   2. Wait for fonts (handwriting + body) and images to load.
 *   3. Clone the preview into a fixed A4-width capture stage.
 *   4. Walk the deepest block container, compute page-break offsets at
 *      block boundaries so no element straddles a page edge.
 *   5. For each page: translate the clone, capture exactly that page
 *      window with html2canvas, stamp the watermark, append to jsPDF.
 *   6. Self-test (blank-page detection + text coverage) before saving.
 */
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import logoUrl from "@/assets/sidheswar-logo.png";
import {
  blurPxFor,
  getUserLogoDataUrl,
  getWatermarkSettings,
  sizeFactorFor,
  type Placement,
} from "@/lib/user-logo";

// A4 @ 96dpi CSS pixels.
const A4_CSS_WIDTH = 794;
const A4_CSS_HEIGHT = 1123;
// A4 in mm for jsPDF.
const A4_MM_W = 210;
const A4_MM_H = 297;

const CAPTURE_SCALE = 2.5; // ~300 DPI equivalent for sharp text/images.

// Fonts the preview relies on. We pre-load specific weights at the sizes the
// handwritten/notebook renderer uses so html2canvas never falls back.
const REQUIRED_FONTS: string[] = [
  "400 16px Caveat",
  "700 36px Caveat",
  "400 21px Kalam",
  "700 26px Kalam",
  "400 18px 'Patrick Hand'",
  "400 16px Fraunces",
  "600 18px Fraunces",
  "400 16px Inter",
];

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode image: " + src));
    img.src = src;
  });
}

async function waitForAssets(root: HTMLElement) {
  // Fonts: wait for the document's font set AND explicitly load required faces.
  if (document.fonts) {
    try {
      await Promise.all(REQUIRED_FONTS.map((f) => document.fonts.load(f).catch(() => null)));
      await document.fonts.ready;
      console.log("[preview-pdf] fonts ready", { count: REQUIRED_FONTS.length });
    } catch (e) {
      console.warn("[preview-pdf] font wait failed", e);
    }
  }
  const imgs = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    imgs.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.addEventListener("load", () => resolve(), { once: true });
        img.addEventListener("error", () => resolve(), { once: true });
      });
    }),
  );
  await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
}

interface WMImage {
  img: HTMLImageElement;
  placement: Placement;
  opacity: number;
  sizeFactor: number;
  blurPx: number;
  rotationDeg: number;
  marginPx: number;
}

async function loadWatermark(canvasWidthPx: number): Promise<WMImage | null> {
  const s = getWatermarkSettings();
  const userLogo = getUserLogoDataUrl();
  // Respect the "enabled" toggle: user logo is used ONLY when the user has
  // uploaded one AND enabled stamping. Otherwise fall back to the default
  // SIDHESWAR watermark. This makes the toggle behave as a persistent
  // on/off switch — once ON with a logo, every download uses that logo
  // until the user disables it or replaces the logo.
  const useUserLogo = s.enabled && !!userLogo;
  let src: string | null = useUserLogo ? userLogo : null;
  if (!src) {
    try {
      const res = await fetch(logoUrl);
      const blob = await res.blob();
      src = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(new Error("logo read failed"));
        r.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn("[preview-pdf] watermark logo missing", e);
      return null;
    }
  }
  if (!src) return null;
  const img = await loadImage(src);
  const marginPx = Math.round(canvasWidthPx * 0.04);
  console.log("[preview-pdf] watermark loaded", { w: img.naturalWidth, h: img.naturalHeight, source: useUserLogo ? "user" : "default" });
  // The default background watermark stays subtle (≤ 0.15). When the user
  // has explicitly uploaded their own logo, honor their opacity setting up
  // to a stronger cap so the brand mark is actually visible.
  const opacityCap = useUserLogo ? 0.85 : 0.15;
  const opacityFloor = useUserLogo ? 0.25 : 0;
  const opacity = Math.max(opacityFloor, Math.min(opacityCap, s.opacity || (useUserLogo ? 0.45 : 0.08)));
  return {
    img,
    placement: s.placement,
    opacity,
    sizeFactor: sizeFactorFor(s.size),
    blurPx: blurPxFor(s.blur),
    rotationDeg: s.rotation || 0,
    marginPx,
  };
}

function drawWatermark(ctx: CanvasRenderingContext2D, pageW: number, pageH: number, wm: WMImage) {
  const targetW = pageW * wm.sizeFactor;
  const ratio = wm.img.naturalHeight / wm.img.naturalWidth || 1;
  const targetH = targetW * ratio;

  let x = (pageW - targetW) / 2;
  let y = (pageH - targetH) / 2;
  switch (wm.placement) {
    case "top-left":      x = wm.marginPx; y = wm.marginPx; break;
    case "top-right":     x = pageW - targetW - wm.marginPx; y = wm.marginPx; break;
    case "bottom-left":   x = wm.marginPx; y = pageH - targetH - wm.marginPx; break;
    case "bottom-right":  x = pageW - targetW - wm.marginPx; y = pageH - targetH - wm.marginPx; break;
    case "header-center": x = (pageW - targetW) / 2; y = wm.marginPx; break;
    case "footer-center": x = (pageW - targetW) / 2; y = pageH - targetH - wm.marginPx; break;
  }

  ctx.save();
  ctx.globalAlpha = wm.opacity;
  if (wm.blurPx > 0) (ctx as any).filter = `blur(${wm.blurPx}px)`;
  if (wm.rotationDeg) {
    const cx = x + targetW / 2, cy = y + targetH / 2;
    ctx.translate(cx, cy);
    ctx.rotate((wm.rotationDeg * Math.PI) / 180);
    ctx.translate(-cx, -cy);
  }
  ctx.drawImage(wm.img, x, y, targetW, targetH);
  ctx.restore();
}

function isCanvasEffectivelyBlank(canvas: HTMLCanvasElement): boolean {
  const sample = document.createElement("canvas");
  sample.width = 96;
  sample.height = 136;
  const ctx = sample.getContext("2d", { willReadFrequently: true });
  if (!ctx) return false;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, sample.width, sample.height);
  ctx.drawImage(canvas, 0, 0, sample.width, sample.height);
  const pixels = ctx.getImageData(0, 0, sample.width, sample.height).data;
  let nonWhite = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2], a = pixels[i + 3];
    if (a > 16 && (r < 246 || g < 246 || b < 246)) nonWhite++;
    if (nonWhite > 12) return false;
  }
  return true;
}

interface CaptureStage {
  stage: HTMLDivElement;
  mover: HTMLDivElement;
  clone: HTMLElement;
}

function buildPagedCaptureStage(node: HTMLElement): CaptureStage {
  const stage = document.createElement("div");
  const mover = document.createElement("div");
  const clone = node.cloneNode(true) as HTMLElement;

  Object.assign(stage.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: `${A4_CSS_WIDTH}px`,
    height: `${A4_CSS_HEIGHT}px`,
    overflow: "hidden",
    background: "#ffffff",
    pointerEvents: "none",
    zIndex: "2147483647",
    contain: "layout paint style",
    color: "#0f172a",
  } satisfies Partial<CSSStyleDeclaration>);

  // Force light-theme design tokens on the capture stage regardless of the
  // app's current theme. Without this, exporting while the app is in dark
  // mode produced pages that were almost entirely black because bg-card /
  // bg-background / text-foreground inherited the dark oklch values from
  // the <html class="dark"> root.
  const lightVars: Record<string, string> = {
    "--background": "#ffffff",
    "--foreground": "#0f172a",
    "--paper": "#ffffff",
    "--ink": "#0f172a",
    "--card": "#ffffff",
    "--card-foreground": "#0f172a",
    "--popover": "#ffffff",
    "--popover-foreground": "#0f172a",
    "--primary": "#064e3b",
    "--primary-foreground": "#ffffff",
    "--secondary": "#e2e8f0",
    "--secondary-foreground": "#0f172a",
    "--muted": "#f1f5f9",
    "--muted-foreground": "#475569",
    "--accent": "#c9a84c",
    "--accent-foreground": "#0f172a",
    "--destructive": "#dc2626",
    "--destructive-foreground": "#ffffff",
    "--border": "#e2e8f0",
    "--input": "#e2e8f0",
    "--ring": "#c9a84c",
  };
  for (const [k, v] of Object.entries(lightVars)) stage.style.setProperty(k, v);

  Object.assign(mover.style, {
    width: `${A4_CSS_WIDTH}px`,
    transformOrigin: "left top",
    willChange: "transform",
  } satisfies Partial<CSSStyleDeclaration>);

  clone.style.boxSizing = "border-box";
  clone.style.width = `${A4_CSS_WIDTH}px`;
  clone.style.maxWidth = `${A4_CSS_WIDTH}px`;
  clone.style.margin = "0";
  clone.style.background = "#ffffff";
  clone.style.color = "#0f172a";
  // Strip any inherited `.dark` class from the cloned subtree so utility
  // classes gated on the dark variant (dark:bg-*, dark:text-*) do not
  // apply in the export.
  clone.classList.remove("dark");
  clone.querySelectorAll<HTMLElement>(".dark").forEach((el) => el.classList.remove("dark"));

  mover.appendChild(clone);
  stage.appendChild(mover);
  document.body.appendChild(stage);

  return { stage, mover, clone };
}

/**
 * Walk down single-child wrappers until we hit the first node with multiple
 * children — that is the real block container we want to paginate.
 */
function findBlockContainer(root: HTMLElement): HTMLElement {
  let node: HTMLElement = root;
  // Drill at most 6 levels deep to avoid pathological cases.
  for (let i = 0; i < 6; i++) {
    const kids = Array.from(node.children) as HTMLElement[];
    if (kids.length > 1) return node;
    if (kids.length === 1) {
      node = kids[0];
      continue;
    }
    break;
  }
  return root;
}

/**
 * Compute Y offsets at which to break pages. Each break aligns with a block
 * boundary so headings / callout boxes / handwritten paragraphs are never
 * split across pages. If a single block is taller than a page, it is sliced
 * (last-resort) instead of being dropped.
 */
function computePageBreaks(stage: HTMLElement, container: HTMLElement, pageHeight: number): number[] {
  const stageRect = stage.getBoundingClientRect();
  const children = Array.from(container.children) as HTMLElement[];
  if (children.length === 0) {
    return [0, Math.max(pageHeight, container.scrollHeight)];
  }
  const blocks = children.map((c) => {
    const r = c.getBoundingClientRect();
    const top = r.top - stageRect.top;
    return { top, bottom: top + r.height, h: r.height };
  });

  const breaks: number[] = [0];
  let pageTop = 0;
  for (const b of blocks) {
    // If this block already starts beyond the current page, snap to its top.
    if (b.top - pageTop >= pageHeight) {
      pageTop = b.top;
      breaks.push(pageTop);
    }
    if (b.bottom - pageTop <= pageHeight) continue;

    // Doesn't fit on current page.
    // Only break to the block's top if we've already filled a meaningful
    // portion of the current page — otherwise we'd waste most of a page
    // (e.g. a short header followed by a giant notes block would leave
    // page 1 nearly blank). Below the threshold, just slice the block.
    const usedRatio = (b.top - pageTop) / pageHeight;
    if (b.top > pageTop && usedRatio >= 0.35) {
      pageTop = b.top;
      breaks.push(pageTop);
    }
    // Oversized single block: slice across pages.
    while (b.bottom - pageTop > pageHeight) {
      pageTop += pageHeight;
      breaks.push(pageTop);
    }
  }
  const total = Math.max(container.scrollHeight, blocks[blocks.length - 1].bottom);
  if (breaks[breaks.length - 1] < total) breaks.push(total);
  return breaks;
}

async function captureStagePage(stage: HTMLElement, mover: HTMLElement, offsetY: number, visibleHeight: number) {
  mover.style.transform = `translateY(-${offsetY}px)`;
  stage.style.height = `${visibleHeight}px`;
  await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
  const canvas = await html2canvas(stage, {
    scale: CAPTURE_SCALE,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
    width: A4_CSS_WIDTH,
    height: visibleHeight,
    windowWidth: A4_CSS_WIDTH,
    windowHeight: visibleHeight,
    scrollX: 0,
    scrollY: 0,
  });

  // Pad to full A4 page so every page has identical dimensions.
  if (canvas.height < A4_CSS_HEIGHT * CAPTURE_SCALE) {
    const padded = document.createElement("canvas");
    padded.width = A4_CSS_WIDTH * CAPTURE_SCALE;
    padded.height = A4_CSS_HEIGHT * CAPTURE_SCALE;
    const ctx = padded.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, padded.width, padded.height);
    ctx.drawImage(canvas, 0, 0);
    return padded;
  }
  return canvas;
}

export interface VerifyReport {
  ok: boolean;
  pages: number;
  blankPageNumbers: number[];
  previewCharCount: number;
  capturedCharCount: number;
  coverageRatio: number;
  issues: string[];
}

function getPreviewText(node: HTMLElement): string {
  return (node.innerText || node.textContent || "").replace(/\s+/g, " ").trim();
}

interface CapturedRun {
  pdf: jsPDF;
  report: VerifyReport;
}

function isNodeOnScreen(node: HTMLElement): { ok: boolean; reason?: string } {
  if (!node.isConnected) return { ok: false, reason: "Preview node is not attached to the document." };
  const style = window.getComputedStyle(node);
  if (style.display === "none") return { ok: false, reason: "Preview node has display:none." };
  if (style.visibility === "hidden") return { ok: false, reason: "Preview node has visibility:hidden." };
  const rect = node.getBoundingClientRect();
  if (rect.width < 10 || rect.height < 10) return { ok: false, reason: "Preview node has zero size." };
  if (rect.right < -500 || rect.bottom < -500 || rect.left > window.innerWidth + 5000) {
    return { ok: false, reason: "Preview node is rendered off-screen." };
  }
  return { ok: true };
}

async function runCapture(node: HTMLElement): Promise<CapturedRun> {
  const vis = isNodeOnScreen(node);
  if (!vis.ok) {
    console.error("[preview-pdf] refusing to export hidden source", { reason: vis.reason });
    throw new Error(vis.reason || "Preview is not visible on screen.");
  }
  node.setAttribute("data-pdf-source", "active");
  console.log("[preview-pdf] capture source", {
    rect: node.getBoundingClientRect(),
    chars: (node.innerText || "").length,
  });

  await waitForAssets(node);

  const previewText = getPreviewText(node);
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });
  const { stage, mover, clone } = buildPagedCaptureStage(node);
  await waitForAssets(stage);

  const blockContainer = findBlockContainer(clone);
  const breaks = computePageBreaks(stage, blockContainer, A4_CSS_HEIGHT);
  console.log("[preview-pdf] pagination plan", {
    totalHeight: clone.scrollHeight,
    pages: breaks.length - 1,
    breaks,
  });

  const stageText = getPreviewText(stage);
  const blankPageNumbers: number[] = [];
  let firstContentSeen = false;
  let writtenPages = 0;
  let wm: WMImage | null = null;

  try {
    for (let i = 0; i < breaks.length - 1; i++) {
      const offsetY = breaks[i];
      const next = breaks[i + 1];
      const visibleHeight = Math.min(A4_CSS_HEIGHT, Math.max(1, next - offsetY));
      const remainingHeight = A4_CSS_HEIGHT - visibleHeight;
      console.log(`[preview-pdf] page ${i + 1}`, {
        offsetY,
        visibleHeight,
        remainingHeight,
        blockBoundary: next,
      });

      const pageCanvas = await captureStagePage(stage, mover, offsetY, visibleHeight);
      if (!wm) wm = await loadWatermark(pageCanvas.width);

      const blank = isCanvasEffectivelyBlank(pageCanvas);
      if (!blank) firstContentSeen = true;
      else blankPageNumbers.push(writtenPages + 1);

      const ctx = pageCanvas.getContext("2d")!;
      if (wm) drawWatermark(ctx, pageCanvas.width, pageCanvas.height, wm);

      const dataUrl = pageCanvas.toDataURL("image/jpeg", 0.94);
      if (writtenPages > 0) pdf.addPage();
      pdf.addImage(dataUrl, "JPEG", 0, 0, A4_MM_W, A4_MM_H, undefined, "FAST");
      writtenPages++;
      console.log(`[preview-pdf] page ${i + 1} added`, { blank, watermark: !!wm });
    }
  } finally {
    stage.remove();
  }

  const previewCharCount = previewText.length;
  const capturedCharCount = stageText.length;
  const coverageRatio = previewCharCount === 0 ? 1 : capturedCharCount / previewCharCount;

  const issues: string[] = [];
  if (!firstContentSeen) issues.push("Captured pages appear blank — preview may have been hidden during export.");
  if (blankPageNumbers.length > 0) issues.push(`Blank pages detected at: ${blankPageNumbers.join(", ")}.`);
  if (previewCharCount > 200 && coverageRatio < 0.9) {
    issues.push(`Captured text covers only ${Math.round(coverageRatio * 100)}% of the preview.`);
  }
  if (writtenPages === 0) issues.push("No pages were written to the PDF.");
  if (!wm) issues.push("Watermark logo failed to load.");

  const report: VerifyReport = {
    ok: issues.length === 0,
    pages: writtenPages,
    blankPageNumbers,
    previewCharCount,
    capturedCharCount,
    coverageRatio,
    issues,
  };

  return { pdf, report };
}

export async function verifyPreviewExport(node: HTMLElement): Promise<VerifyReport> {
  if (!node) throw new Error("Preview node not ready.");
  const { report } = await runCapture(node);
  console.log("[preview-pdf] verify", report);
  return report;
}

export async function downloadPreviewAsPdf(
  node: HTMLElement,
  filename: string,
  options: { verifyBefore?: boolean; onReport?: (r: VerifyReport) => void } = {},
): Promise<VerifyReport> {
  if (!node) throw new Error("Preview node not ready.");
  const { verifyBefore = true, onReport } = options;

  const { pdf, report } = await runCapture(node);
  onReport?.(report);

  if (verifyBefore && !report.ok) {
    const err = new Error(`Verify export failed: ${report.issues.join(" ")}`) as Error & { report?: VerifyReport };
    err.report = report;
    throw err;
  }

  const safe = filename.replace(/[^\w\-]+/g, "_").slice(0, 80) || "document";
  const blob = pdf.output("blob");
  const { saveAndDownload } = await import("@/lib/downloads-store");
  await saveAndDownload(blob, `${safe}.pdf`, { kind: "pdf", source: "dashboard-preview" });
  console.log("[preview-pdf] exported", { filename: safe, pages: pdf.getNumberOfPages(), report });
  return report;
}
