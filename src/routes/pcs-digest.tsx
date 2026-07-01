import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Landmark, ExternalLink, Sparkles, Loader2, X, ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getOdishaNews, extractPcsPoints, type OdishaNewsItem } from "@/lib/odisha-news.functions";

export const Route = createFileRoute("/pcs-digest")({
  head: () => ({
    meta: [
      { title: "National News · PCS Digest" },
      { name: "description", content: "Full National News feed from PCS Digest — syllabus-mapped headlines with AI extraction for OPSC / State PCS aspirants." },
    ],
  }),
  component: PcsDigestPage,
});

function timeAgo(iso: string): string {
  const t = Date.parse(iso);
  if (!t) return "";
  const diff = Date.now() - t;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function PcsDigestPage() {
  const [items, setItems] = useState<OdishaNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [active, setActive] = useState<OdishaNewsItem | null>(null);
  const [extract, setExtract] = useState<string>("");
  const [extracting, setExtracting] = useState(false);
  const [extractErr, setExtractErr] = useState<string | null>(null);
  const [tab, setTab] = useState<string>("All");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await getOdishaNews();
        if (alive) setItems(res.items);
      } catch (e) {
        if (alive) setErr(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  async function runExtract(item: OdishaNewsItem) {
    setActive(item); setExtract(""); setExtractErr(null); setExtracting(true);
    try {
      const res = await extractPcsPoints({ data: { url: item.link, title: item.title } });
      setExtract(res.markdown);
    } catch (e) {
      setExtractErr(e instanceof Error ? e.message : "Extraction failed");
    } finally {
      setExtracting(false);
    }
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <div className="mb-6">
          <h1 className="flex items-center gap-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            <Landmark className="h-7 w-7 text-emerald-500" />
            National News · PCS Digest
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Live headlines mapped to the OPSC / State PCS syllabus. Click <span className="font-semibold text-emerald-600">Extract PCS Points</span> for exam-ready notes.</p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/40 backdrop-blur dark:bg-white/5" />
            ))}
          </div>
        )}

        {err && !loading && (
          <div className="rounded-2xl border border-rose-300/40 bg-rose-50/60 p-4 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
            Couldn't load news. {err}
          </div>
        )}

        {!loading && !err && items.length > 0 && (
          <>
            <div className="mb-4 flex flex-wrap gap-2">
              {(["All", ...Array.from(new Set(items.map((i) => i.category)))]).map((c) => {
                const count = c === "All" ? items.length : items.filter((i) => i.category === c).length;
                return (
                  <button key={c} type="button" onClick={() => setTab(c)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${tab === c ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow" : "border border-border/60 bg-background/60 text-muted-foreground hover:text-foreground"}`}>
                    {c} <span className="opacity-70">· {count}</span>
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {items.filter((n) => tab === "All" || n.category === tab).map((n) => (
                <div key={n.link}
                  className="group relative rounded-2xl border border-white/40 bg-white/60 p-4 shadow-[0_8px_30px_-12px_rgba(31,38,135,0.18)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-18px_rgba(16,185,129,0.45)] dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">{n.category}</span>
                      <span className="inline-flex items-center rounded-full border border-border/60 bg-background/70 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{n.source}</span>
                    </div>
                    <a href={n.link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground"><ExternalLink className="h-3.5 w-3.5" /></a>
                  </div>
                  <h3 className="mt-2 font-serif text-[15px] font-semibold leading-snug text-foreground line-clamp-3">{n.title}</h3>
                  {n.pubDate && <div className="mt-1 text-[11px] text-muted-foreground">{timeAgo(n.pubDate)}</div>}
                  <button type="button" onClick={() => runExtract(n)}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-all hover:brightness-110 active:scale-95">
                    <Sparkles className="h-3.5 w-3.5" /> Extract PCS Points
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {active && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setActive(null)}>
            <div className="relative max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl dark:bg-neutral-900" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between gap-3 border-b border-border/50 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-4">
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">PCS Digest · {active.source}</div>
                  <h4 className="mt-1 font-serif text-base font-semibold leading-snug line-clamp-2">{active.title}</h4>
                </div>
                <button type="button" onClick={() => setActive(null)} className="rounded-full p-1 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10"><X className="h-4 w-4" /></button>
              </div>
              <div className="max-h-[65vh] overflow-y-auto p-5 text-sm">
                {extracting && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Extracting exam-ready points…</div>}
                {extractErr && !extracting && <div className="rounded-lg border border-rose-300/40 bg-rose-50 p-3 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">{extractErr}</div>}
                {!extracting && extract && <pre className="whitespace-pre-wrap font-sans leading-relaxed text-foreground">{extract}</pre>}
              </div>
              <div className="flex items-center justify-between border-t border-border/50 p-3">
                <a href={active.link} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-emerald-600 hover:underline">Open original article →</a>
                <button type="button" onClick={() => setActive(null)} className="rounded-full bg-foreground/90 px-3 py-1.5 text-xs font-semibold text-background hover:bg-foreground">Close</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </AppShell>
  );
}