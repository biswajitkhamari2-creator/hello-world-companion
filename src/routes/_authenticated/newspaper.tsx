import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Loader2, Newspaper, Upload, X, Sparkles, ImagePlus } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { analyseNewspaper, type NewspaperAnalysis } from "@/lib/newspaper.functions";
import { saveExtractedHeadlines } from "@/lib/daily-headlines";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/newspaper")({
  head: () => ({
    meta: [
      { title: "Newspaper Analyser — UPSC Mitra" },
      { name: "description", content: "Upload a newspaper photo and get only the UPSC-relevant headlines with GS mapping, summaries and exam angle." },
    ],
  }),
  component: NewspaperPage,
});

const MAX_FILES = 6;
const MAX_MB = 8;

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => rej(r.error);
    r.readAsDataURL(file);
  });
}

const RELEVANCE_STYLES: Record<string, string> = {
  "Very High": "bg-emerald-600 text-white",
  High: "bg-emerald-500/90 text-white",
  Medium: "bg-amber-400 text-emerald-950",
  Low: "bg-muted text-muted-foreground",
};

function NewspaperPage() {
  const analyse = useServerFn(analyseNewspaper);
  const [files, setFiles] = useState<{ file: File; url: string }[]>([]);
  const [result, setResult] = useState<NewspaperAnalysis | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!files.length) throw new Error("Add at least one newspaper photo.");
      const images = await Promise.all(files.map((f) => fileToDataUrl(f.file)));
      return analyse({ data: { images } });
    },
    onSuccess: (r) => {
      setResult(r);
      if (!r.headlines?.length) {
        toast.info("No UPSC-relevant headlines detected on this page.");
      } else {
        saveExtractedHeadlines(r.headlines, r.source, r.date);
        toast.success(`Found ${r.headlines.length} UPSC-relevant items — added to Home headlines`);
      }
    },
    onError: (e: Error) => toast.error(e.message ?? "Analysis failed"),
  });

  function addFiles(list: FileList | File[]) {
    const arr = Array.from(list).filter((f) => f.type.startsWith("image/"));
    const rejected = Array.from(list).length - arr.length;
    if (rejected) toast.error("Only image files (JPG/PNG) are supported.");
    const good = arr.filter((f) => {
      if (f.size > MAX_MB * 1024 * 1024) { toast.error(`${f.name}: over ${MAX_MB}MB`); return false; }
      return true;
    });
    setFiles((prev) => [...prev, ...good.map((file) => ({ file, url: URL.createObjectURL(file) }))].slice(0, MAX_FILES));
  }

  // Auto-run analysis as soon as files are added / changed.
  useEffect(() => {
    if (files.length === 0) return;
    if (mutation.isPending) return;
    setResult(null);
    mutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  function removeAt(i: number) {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[i].url);
      return prev.filter((_, idx) => idx !== i);
    });
  }

  function reset() {
    files.forEach((f) => URL.revokeObjectURL(f.url));
    setFiles([]);
    setResult(null);
  }

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Newspaper Analyser
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl leading-tight text-foreground">
            Upload today's newspaper. Get only what <span className="text-gold-shimmer">UPSC</span> asks.
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Snap or scan any page (English or Hindi). AI reads it, discards sports/ads/gossip, and gives you the headlines that matter for Prelims &amp; Mains with GS mapping.
          </p>
        </header>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
          }}
          className={cn(
            "relative rounded-3xl border-2 border-dashed p-6 sm:p-8 transition-all backdrop-blur-xl",
            dragOver
              ? "border-amber-400 bg-amber-400/10 shadow-gold"
              : "border-emerald-700/30 dark:border-amber-400/30 bg-card/70",
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            className="hidden"
            onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.currentTarget.value = ""; }}
          />

          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-500 to-amber-400 text-white shadow-gold">
                <Newspaper className="h-8 w-8" />
              </div>
              <h2 className="font-serif text-xl">Drop a newspaper photo here</h2>
              <p className="text-sm text-muted-foreground">Auto-analyses as soon as you upload · up to {MAX_FILES} pages · {MAX_MB}MB each</p>
              <Button onClick={() => inputRef.current?.click()} className="mt-2 gap-2">
                <Upload className="h-4 w-4" /> Choose photos
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {files.map((f, i) => (
                  <div key={f.url} className="group relative aspect-[3/4] overflow-hidden rounded-xl border bg-muted">
                    <img src={f.url} alt={f.file.name} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeAt(i)}
                      className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      p{i + 1}
                    </span>
                  </div>
                ))}
                {files.length < MAX_FILES && (
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="grid aspect-[3/4] place-items-center rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-amber-400 hover:text-amber-500"
                  >
                    <div className="flex flex-col items-center gap-1 text-xs">
                      <ImagePlus className="h-6 w-6" /> Add more
                    </div>
                  </button>
                )}
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">{files.length} page{files.length > 1 ? "s" : ""} ready</p>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={reset} disabled={mutation.isPending}>Clear</Button>
                  <Button
                    onClick={() => mutation.mutate()}
                    disabled={mutation.isPending}
                    className="gap-2 bg-gradient-to-r from-emerald-700 via-emerald-600 to-amber-500 text-white shadow-gold hover:opacity-90"
                  >
                    {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {mutation.isPending ? "Reading newspaper…" : "Re-analyse"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {result && (
          <section className="mt-8">
            <div className="mb-4 flex flex-wrap items-baseline gap-3">
              <h2 className="font-serif text-2xl">UPSC-Relevant Headlines</h2>
              {result.source && <span className="text-sm text-muted-foreground">· {result.source}</span>}
              {result.date && <span className="text-sm text-muted-foreground">· {result.date}</span>}
              <Badge variant="secondary" className="ml-auto">{result.headlines.length} items</Badge>
            </div>

            {result.headlines.length === 0 ? (
              <div className="rounded-2xl border bg-card/70 p-8 text-center text-sm text-muted-foreground backdrop-blur">
                Nothing UPSC-relevant on this page. Try a page with editorial/national/international news.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {result.headlines.map((h, i) => (
                  <article
                    key={i}
                    className="group relative overflow-hidden rounded-2xl border bg-card/80 p-5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-gold"
                  >
                    <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", RELEVANCE_STYLES[h.relevance] ?? RELEVANCE_STYLES.Medium)}>
                        {h.relevance}
                      </span>
                      <span className="rounded-full border border-emerald-700/30 bg-emerald-700/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300">
                        {h.gsPaper}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{h.topic}</span>
                    </div>
                    <h3 className="font-serif text-lg leading-snug text-foreground">{h.headline}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{h.summary}</p>
                    {h.whyItMatters && (
                      <p className="mt-3 rounded-lg bg-amber-400/10 px-3 py-2 text-xs text-foreground">
                        <span className="font-semibold text-amber-700 dark:text-amber-300">Why it matters: </span>{h.whyItMatters}
                      </p>
                    )}
                    {h.keywords?.length ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {h.keywords.map((k) => (
                          <span key={k} className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">#{k}</span>
                        ))}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </AppShell>
  );
}
