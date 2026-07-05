import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import { Loader2, Upload, Download, Stamp, FileCheck2, Trash2, FileText, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  saveDownload,
  listDownloads,
  deleteDownload,
  getDownloadBlob,
  onDownloadsUpdated,
  formatSize,
  type StoredDownloadRecord,
} from "@/lib/downloads-store";

const STAMP_SOURCE = "pdf-stamp";
const BRAND_IMAGE_KEY = "stamp:brand-image";
const BRAND_OPACITY_KEY = "stamp:brand-opacity";
const BRAND_SIZE_KEY = "stamp:brand-size";

export const Route = createFileRoute("/_authenticated/stamp")({
  head: () => ({
    meta: [
      { title: "PDF Stamp — Sidheswar Publication" },
      { name: "description", content: "Upload any PDF and instantly stamp 'Sidheswar Publication' on every page, then download." },
    ],
  }),
  component: StampPage,
});

type Status = "idle" | "working" | "done" | "error";

function StampPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const brandInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [tookMs, setTookMs] = useState<number>(0);
  const [stampText, setStampText] = useState<string>("SIDHESWAR PUBLICATION");
  const [brandImage, setBrandImage] = useState<string | null>(null);
  const [brandOpacity, setBrandOpacity] = useState<number>(20); // 0-100
  const [brandSize, setBrandSize] = useState<number>(55); // % of page diagonal

  // Load persisted brand image on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    setBrandImage(window.localStorage.getItem(BRAND_IMAGE_KEY));
    const op = window.localStorage.getItem(BRAND_OPACITY_KEY);
    const sz = window.localStorage.getItem(BRAND_SIZE_KEY);
    if (op) setBrandOpacity(Number(op));
    if (sz) setBrandSize(Number(sz));
  }, []);

  const handleBrandImage = useCallback(async (file: File) => {
    if (!/^image\//.test(file.type)) {
      toast.error("Please choose a PNG or JPG image.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Brand image too large (max 4 MB). Please resize it.");
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(r.error);
      r.readAsDataURL(file);
    });
    try {
      window.localStorage.setItem(BRAND_IMAGE_KEY, dataUrl);
    } catch {
      toast.error("Image is too large to save locally. Try a smaller file.");
      return;
    }
    setBrandImage(dataUrl);
    toast.success("Brand image saved");
  }, []);

  const clearBrandImage = useCallback(() => {
    window.localStorage.removeItem(BRAND_IMAGE_KEY);
    setBrandImage(null);
    toast.success("Brand image removed");
  }, []);

  const updateBrandOpacity = useCallback((v: number) => {
    setBrandOpacity(v);
    window.localStorage.setItem(BRAND_OPACITY_KEY, String(v));
  }, []);

  const updateBrandSize = useCallback((v: number) => {
    setBrandSize(v);
    window.localStorage.setItem(BRAND_SIZE_KEY, String(v));
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file) return;
      if (!/\.pdf$/i.test(file.name) && file.type !== "application/pdf") {
        toast.error("Please upload a PDF file.");
        return;
      }
      setStatus("working");
      setFileName(file.name);
      const t0 = performance.now();
      try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const font = await pdf.embedFont(StandardFonts.HelveticaBold);
        const text = (stampText || "SIDHESWAR PUBLICATION").trim().toUpperCase();

        // Embed brand image once, reuse across pages
        let brandImg: Awaited<ReturnType<PDFDocument["embedPng"]>> | null = null;
        if (brandImage) {
          try {
            const [, mime, b64] = brandImage.match(/^data:(image\/[^;]+);base64,(.+)$/) ?? [];
            if (mime && b64) {
              const raw = atob(b64);
              const buf = new Uint8Array(raw.length);
              for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
              brandImg = mime === "image/jpeg" ? await pdf.embedJpg(buf) : await pdf.embedPng(buf);
            }
          } catch (e) {
            console.warn("[stamp] brand image embed failed", e);
          }
        }

        const pages = pdf.getPages();
        for (const page of pages) {
          const { width: pw, height: ph } = page.getSize();
          const diag = Math.sqrt(pw * pw + ph * ph);

          // Draw brand image (if any) centered, rotated along diagonal, semi-transparent
          if (brandImg) {
            const maxDim = diag * (brandSize / 100);
            const scale = Math.min(maxDim / brandImg.width, maxDim / brandImg.height);
            const iw = brandImg.width * scale;
            const ih = brandImg.height * scale;
            const angle = Math.atan2(ph, pw);
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            // rotate around center: shift origin
            const cx = pw / 2;
            const cy = ph / 2;
            const x = cx - (iw / 2) * cos + (ih / 2) * sin;
            const y = cy - (iw / 2) * sin - (ih / 2) * cos;
            page.drawImage(brandImg, {
              x,
              y,
              width: iw,
              height: ih,
              rotate: degrees((angle * 180) / Math.PI),
              opacity: Math.max(0.05, Math.min(1, brandOpacity / 100)),
            });
          }

          // Diagonal watermark size ~ 8% of diagonal
          const size = Math.max(24, diag * 0.045);
          const textWidth = font.widthOfTextAtSize(text, size);
          // center-anchor rotated text
          const cx = pw / 2;
          const cy = ph / 2;
          const angle = Math.atan2(ph, pw); // rotate along the diagonal
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          const x = cx - (textWidth / 2) * cos + (size / 2) * sin;
          const y = cy - (textWidth / 2) * sin - (size / 2) * cos;
          if (text) {
            page.drawText(text, {
              x,
              y,
              size,
              font,
              color: rgb(0.85, 0.15, 0.15),
              opacity: brandImg ? 0.12 : 0.18,
              rotate: degrees((angle * 180) / Math.PI),
            });
          }
          // Footer stamp
          if (text) {
            const footerSize = Math.max(9, Math.min(14, pw * 0.014));
            const footerText = `© ${text}`;
            const fw = font.widthOfTextAtSize(footerText, footerSize);
            page.drawText(footerText, {
              x: (pw - fw) / 2,
              y: 14,
              size: footerSize,
              font,
              color: rgb(0.1, 0.1, 0.1),
              opacity: 0.55,
            });
          }
        }

        const out = await pdf.save({ useObjectStreams: true });
        const blob = new Blob([out.buffer as ArrayBuffer], { type: "application/pdf" });
        const base = file.name.replace(/\.pdf$/i, "");
        const stampedName = `${base}-stamped.pdf`;
        // Persist to IndexedDB so it survives reloads until user deletes it
        await saveDownload(blob, stampedName, {
          kind: "pdf",
          source: STAMP_SOURCE,
          meta: { pages: pages.length, stampText: text, original: file.name },
        });
        triggerBrowserDownload(blob, stampedName);

        setPageCount(pages.length);
        setTookMs(Math.round(performance.now() - t0));
        setStatus("done");
        toast.success(`Stamped ${pages.length} page${pages.length === 1 ? "" : "s"} — download started`);
      } catch (err) {
        console.error("[stamp] failed", err);
        setStatus("error");
        toast.error(err instanceof Error ? err.message : "Failed to stamp PDF");
      }
    },
    [stampText, brandImage, brandOpacity, brandSize],
  );

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-lg">
            <Stamp className="h-7 w-7" />
          </div>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-foreground">
            PDF Stamping
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            Upload any PDF — every page instantly stamped with your publication mark, then downloaded.
          </p>
        </div>

        <div className="rounded-3xl border border-border/60 bg-card/60 p-5 sm:p-8 backdrop-blur-md shadow-sm">
          {/* Brand image */}
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Brand image (logo) — optional
          </label>
          <div className="mb-6 rounded-2xl border border-dashed border-border/70 bg-background/40 p-4">
            <input
              ref={brandInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleBrandImage(f);
                e.target.value = "";
              }}
            />
            {brandImage ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-white p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={brandImage} alt="Brand logo preview" className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Opacity</span>
                      <span className="tabular-nums">{brandOpacity}%</span>
                    </div>
                    <Slider
                      value={[brandOpacity]}
                      onValueChange={(v) => updateBrandOpacity(v[0] ?? 20)}
                      min={5}
                      max={100}
                      step={5}
                    />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Size</span>
                      <span className="tabular-nums">{brandSize}%</span>
                    </div>
                    <Slider
                      value={[brandSize]}
                      onValueChange={(v) => updateBrandSize(v[0] ?? 55)}
                      min={20}
                      max={100}
                      step={5}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => brandInputRef.current?.click()} className="gap-1.5">
                      <Upload className="h-3.5 w-3.5" /> Replace
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={clearBrandImage} className="gap-1.5 text-red-600 hover:text-red-700">
                      <X className="h-3.5 w-3.5" /> Remove
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-foreground">Upload your brand logo</p>
                <p className="text-xs text-muted-foreground">PNG, JPG or WebP · saved on this device</p>
                <Button type="button" variant="outline" size="sm" onClick={() => brandInputRef.current?.click()} className="gap-1.5">
                  <Upload className="h-4 w-4" /> Choose image
                </Button>
              </div>
            )}
          </div>

          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Stamp text
          </label>
          <Input
            value={stampText}
            onChange={(e) => setStampText(e.target.value)}
            placeholder="SIDHESWAR PUBLICATION"
            className="mb-6"
            maxLength={64}
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const f = e.dataTransfer.files?.[0];
              if (f) handleFile(f);
            }}
            className="relative rounded-2xl border-2 border-dashed border-border/70 bg-background/40 p-8 sm:p-12 text-center transition-colors hover:border-primary/60 hover:bg-primary/5"
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />
            {status === "working" ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Stamping {fileName}…</p>
              </div>
            ) : (
              <>
                <Upload className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="mb-1 text-base font-semibold text-foreground">
                  Drop your PDF here
                </p>
                <p className="mb-5 text-xs text-muted-foreground">
                  Fully processed on your device — nothing uploaded to a server.
                </p>
                <Button
                  type="button"
                  size="lg"
                  onClick={() => inputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Choose PDF
                </Button>
              </>
            )}
          </div>

          {status === "done" && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
              <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div className="flex-1 text-sm">
                <p className="font-semibold text-foreground">Done — download started</p>
                <p className="mt-0.5 text-muted-foreground">
                  Stamped <b>{pageCount}</b> page{pageCount === 1 ? "" : "s"} of <b>{fileName}</b> in{" "}
                  <b>{tookMs} ms</b>.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 gap-2"
                  onClick={() => inputRef.current?.click()}
                >
                  <Download className="h-4 w-4" />
                  Stamp another PDF
                </Button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-600">
              Something went wrong. The PDF may be encrypted or corrupt — try another file.
            </div>
          )}
        </div>

        <ul className="mt-6 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
          <li className="rounded-lg border border-border/50 bg-card/40 p-3">⚡ Instant — runs in your browser</li>
          <li className="rounded-lg border border-border/50 bg-card/40 p-3">🔒 Private — file never leaves your device</li>
          <li className="rounded-lg border border-border/50 bg-card/40 p-3">📄 Every page stamped diagonally + footer</li>
        </ul>

        <StampedHistory />
      </div>
    </AppShell>
  );
}

function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function StampedHistory() {
  const [rows, setRows] = useState<StoredDownloadRecord[] | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      listDownloads().then((all) => {
        if (!alive) return;
        setRows(all.filter((r) => r.source === STAMP_SOURCE));
      });
    load();
    const off = onDownloadsUpdated(load);
    return () => {
      alive = false;
      off();
    };
  }, []);

  const redownload = useCallback(async (row: StoredDownloadRecord) => {
    const blob = await getDownloadBlob(row.id);
    if (!blob) {
      toast.error("File data missing — please stamp again.");
      return;
    }
    triggerBrowserDownload(blob, row.name);
  }, []);

  const remove = useCallback(async (row: StoredDownloadRecord) => {
    await deleteDownload(row.id);
    toast.success(`Removed ${row.name}`);
  }, []);

  if (!rows || rows.length === 0) return null;

  return (
    <div className="mt-8 rounded-3xl border border-border/60 bg-card/60 p-5 sm:p-6 backdrop-blur-md shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif-display text-lg font-semibold text-foreground">
          Stamped files ({rows.length})
        </h2>
        <span className="text-xs text-muted-foreground">Kept until you remove them</span>
      </div>
      <ul className="space-y-2">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/40 p-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{row.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatSize(row.size)}
                {typeof row.meta?.pages === "number" ? ` · ${row.meta.pages} pages` : ""}
                {" · "}
                {new Date(row.created_at).toLocaleString()}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => redownload(row)}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-red-600"
              onClick={() => remove(row)}
              aria-label={`Remove ${row.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
