import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ImagePlus, Loader2, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  DEFAULT_SETTINGS,
  getUserLogoDataUrl,
  getWatermarkSettings,
  normaliseLogoToPng,
  setUserLogoDataUrl,
  setWatermarkSettings,
  type Placement,
  type WatermarkSettings,
} from "@/lib/user-logo";
import { downloadGeneratedPdf } from "@/lib/pdf-export";
import { listDocuments } from "@/lib/documents.functions";
import { listGenerations, type OutputType } from "@/lib/generations.functions";

export function StampLogoButton() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" aria-label="Stamp your logo" className="min-h-9 gap-2">
          <span className="text-base leading-none" aria-hidden="true">🖼️</span>
          <span className="hidden sm:inline">Stamp Your Logo</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Stamp Your Logo</DialogTitle>
          <DialogDescription>
            Upload your brand logo and apply it automatically to every PDF, infographic, and exported document.
          </DialogDescription>
        </DialogHeader>
        <StampLogoEditor onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function StampLogoEditor({ onDone }: { onDone: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [settings, setSettings] = useState<WatermarkSettings>(DEFAULT_SETTINGS);
  const [busy, setBusy] = useState(false);
  const [applyingExisting, setApplyingExisting] = useState(false);

  const listDocs = useServerFn(listDocuments);
  const listGens = useServerFn(listGenerations);

  useEffect(() => {
    setLogo(getUserLogoDataUrl());
    setSettings(getWatermarkSettings());
  }, []);

  function patch(p: Partial<WatermarkSettings>) {
    const next = { ...settings, ...p };
    setSettings(next);
    setWatermarkSettings(next);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setBusy(true);
    try {
      const pngUrl = await normaliseLogoToPng(f);
      setUserLogoDataUrl(pngUrl);
      setLogo(pngUrl);
      // Auto-enable on first upload so the user sees it apply immediately.
      patch({ enabled: true });
      toast.success("Logo uploaded", { description: "It will stamp onto every generated PDF." });
    } catch (err: any) {
      toast.error(err?.message || "Could not load logo.");
    } finally {
      setBusy(false);
    }
  }

  function clearLogo() {
    setUserLogoDataUrl(null);
    setLogo(null);
    patch({ enabled: false });
    toast("Logo removed");
  }

  async function applyToExisting() {
    if (!logo || !settings.enabled) {
      toast.error("Enable your logo first.");
      return;
    }
    setApplyingExisting(true);
    try {
      const docs = (await listDocs()) as any[];
      let total = 0;
      for (const d of docs) {
        const gens = (await listGens({ data: { document_id: d.id } })) as any[];
        for (const g of gens) {
          try {
            await downloadGeneratedPdf(g.output_type as OutputType, g.content, d.title);
            total += 1;
            // Small pause so browsers don't choke on stacked downloads.
            await new Promise((r) => setTimeout(r, 350));
          } catch (err) {
            console.warn("[stamp-logo] re-export failed", { docId: d.id, type: g.output_type, err });
          }
        }
      }
      toast.success(`Re-stamped ${total} existing document${total === 1 ? "" : "s"}.`);
    } catch (err: any) {
      toast.error(err?.message || "Could not re-stamp existing files.");
    } finally {
      setApplyingExisting(false);
    }
  }

  const previewStyle = useMemo(() => {
    const sizePct = settings.size === "small" ? 25 : settings.size === "medium" ? 50 : 78;
    const blurPx = settings.blur === "off" ? 0 : settings.blur === "low" ? 1 : 2.5;
    return {
      maxWidth: `${sizePct}%`,
      maxHeight: `${sizePct}%`,
      opacity: settings.opacity,
      transform: `rotate(${settings.rotation}deg)`,
      filter: `blur(${blurPx}px)`,
    } as React.CSSProperties;
  }, [settings]);

  const placementClass: Record<Placement, string> = {
    center: "items-center justify-center",
    "top-left": "items-start justify-start",
    "top-right": "items-start justify-end",
    "bottom-left": "items-end justify-start",
    "bottom-right": "items-end justify-end",
    "header-center": "items-start justify-center",
    "footer-center": "items-end justify-center",
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* LEFT — controls */}
      <div className="space-y-4">
        <div className="rounded-md border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-md border border-border bg-background">
              {logo ? (
                <img src={logo} alt="Your logo" className="h-full w-full object-contain" />
              ) : (
                <ImagePlus className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{logo ? "Logo uploaded" : "No logo yet"}</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, SVG, or WebP — up to 6 MB.</p>
            </div>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden" onChange={handleFile} />
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={busy}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : logo ? "Replace" : "Upload"}
            </Button>
            {logo && (
              <Button size="icon" variant="ghost" onClick={clearLogo} aria-label="Remove logo">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border border-border p-3">
          <div>
            <p className="text-sm font-medium">✓ Apply My Logo to All Generated Content</p>
            <p className="text-xs text-muted-foreground">Stamps onto every page of every export.</p>
          </div>
          <Switch checked={settings.enabled} onCheckedChange={(v) => patch({ enabled: v })} disabled={!logo} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Placement</Label>
            <Select value={settings.placement} onValueChange={(v) => patch({ placement: v as Placement })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="center">Center watermark</SelectItem>
                <SelectItem value="top-left">Top left</SelectItem>
                <SelectItem value="top-right">Top right</SelectItem>
                <SelectItem value="bottom-left">Bottom left</SelectItem>
                <SelectItem value="bottom-right">Bottom right</SelectItem>
                <SelectItem value="header-center">Header center</SelectItem>
                <SelectItem value="footer-center">Footer center</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Size</Label>
            <Select value={settings.size} onValueChange={(v) => patch({ size: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Blur</Label>
            <Select value={settings.blur} onValueChange={(v) => patch({ blur: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="off">Off</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Rotation</Label>
            <Select value={String(settings.rotation)} onValueChange={(v) => patch({ rotation: Number(v) as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0°</SelectItem>
                <SelectItem value="45">45°</SelectItem>
                <SelectItem value="-45">Diagonal (-45°)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Opacity</Label>
            <span className="text-xs tabular-nums text-muted-foreground">{Math.round(settings.opacity * 100)}%</span>
          </div>
          <Slider
            min={1}
            max={15}
            step={1}
            value={[Math.round(settings.opacity * 100)]}
            onValueChange={([v]) => patch({ opacity: v / 100 })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Margin</Label>
            <span className="text-xs tabular-nums text-muted-foreground">{settings.margin}pt</span>
          </div>
          <Slider
            min={0}
            max={96}
            step={4}
            value={[settings.margin]}
            onValueChange={([v]) => patch({ margin: v })}
          />
        </div>
      </div>

      {/* RIGHT — preview */}
      <div className="space-y-3">
        <Label className="text-xs">Live preview</Label>
        <div className="relative mx-auto aspect-[1/1.414] w-full max-w-[280px] overflow-hidden rounded-md border border-border bg-[#fdfcf7] shadow-inner">
          <div className="absolute inset-x-6 top-6 space-y-1.5">
            <div className="h-2 w-1/2 rounded bg-slate-300/80" />
            <div className="h-1.5 w-full rounded bg-slate-200/80" />
            <div className="h-1.5 w-5/6 rounded bg-slate-200/80" />
            <div className="h-1.5 w-2/3 rounded bg-slate-200/80" />
          </div>
          <div className={`absolute inset-0 flex p-3 ${placementClass[settings.placement]}`}>
            {logo ? (
              <img src={logo} alt="" style={previewStyle} className="object-contain" />
            ) : (
              <span className="text-xs text-muted-foreground">Upload a logo to preview</span>
            )}
          </div>
        </div>
        <p className="text-center text-[11px] text-muted-foreground">
          Preview is indicative — exports embed the logo at full PDF quality.
        </p>
      </div>

      <DialogFooter className="md:col-span-2">
        <Button variant="outline" onClick={applyToExisting} disabled={applyingExisting || !logo || !settings.enabled}>
          {applyingExisting ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Wand2 className="mr-2 h-3.5 w-3.5" />}
          Apply Logo to Existing Files
        </Button>
        <Button onClick={onDone}>Done</Button>
      </DialogFooter>
    </div>
  );
}
