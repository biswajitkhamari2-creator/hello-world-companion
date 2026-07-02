import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, RefreshCw, Sparkles, Flame, ArrowLeft, Radio, Newspaper } from "lucide-react";
import {
  listNewsItems,
  extractPendingInboxNews,
  countPendingInbox,
  type NewsItem,
  type GsPaper,
} from "@/lib/news-items.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/news-analyser")({
  head: () => ({
    meta: [
      { title: "News Analyser — UPSC Genius AI" },
      {
        name: "description",
        content:
          "Auto-pushed news from your Telegram inbox, analysed and shown as UPSC-mapped headlines in real time.",
      },
    ],
  }),
  component: NewsAnalyserPage,
});

const GS_STYLE: Record<GsPaper, { chip: string; dot: string }> = {
  GS1: { chip: "from-amber-500 to-rose-500", dot: "bg-amber-400" },
  GS2: { chip: "from-sky-500 to-indigo-500", dot: "bg-sky-400" },
  GS3: { chip: "from-emerald-500 to-teal-500", dot: "bg-emerald-400" },
  GS4: { chip: "from-fuchsia-500 to-purple-500", dot: "bg-fuchsia-400" },
  General: { chip: "from-slate-500 to-slate-600", dot: "bg-slate-400" },
};

const GS_KEYS: Array<GsPaper | "all"> = ["all", "GS1", "GS2", "GS3", "GS4"];

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function NewsAnalyserPage() {
  const router = useRouter();
  const [items, setItems] = useState<NewsItem[] | null>(null);
  const [filter, setFilter] = useState<GsPaper | "all">("all");
  const [err, setErr] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [pending, setPending] = useState<number | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const draining = useRef(false);

  useEffect(() => {
    let alive = true;
    setErr(null);
    listNewsItems({ data: { limit: 200 } })
      .then((r) => alive && setItems(r))
      .catch((e) => alive && setErr((e as Error).message));
    countPendingInbox()
      .then((r) => alive && setPending(r.pending))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  // Refresh every 90 s so newly-forwarded Telegram items show up quickly.
  useEffect(() => {
    const id = setInterval(() => setReloadKey((k) => k + 1), 90_000);
    return () => clearInterval(id);
  }, []);

  // Auto-analyse pending PDFs from Telegram (max 2 per visit).
  useEffect(() => {
    if (!pending || draining.current) return;
    draining.current = true;
    setAnalysing(true);
    (async () => {
      try {
        for (let i = 0; i < 2; i++) {
          const r = await extractPendingInboxNews();
          const fresh = await listNewsItems({ data: { limit: 200 } });
          setItems(fresh);
          setPending(r.remaining);
          if (!r.remaining || r.processed === 0) break;
        }
      } catch (e) {
        setErr((e as Error).message);
      } finally {
        draining.current = false;
        setAnalysing(false);
      }
    })();
  }, [pending]);

  const filtered = useMemo(() => {
    if (!items) return null;
    if (filter === "all") return items;
    return items.filter((i) => i.gs_paper === filter);
  }, [items, filter]);

  const buckets = useMemo(() => {
    if (!items) return null;
    const m: Record<string, number> = { all: items.length, GS1: 0, GS2: 0, GS3: 0, GS4: 0 };
    for (const it of items) if (m[it.gs_paper] !== undefined) m[it.gs_paper]++;
    return m;
  }, [items]);

  const tickerItems = (items ?? []).slice(0, 20);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4">
        <button
          onClick={() => {
            if (window.history.length > 1) router.history.back();
            else router.navigate({ to: "/" });
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs font-medium hover:bg-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
      </div>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <Radio className="h-3 w-3 animate-pulse" />
            {analysing
              ? `Analysing Telegram inbox… ${pending ?? ""} left`
              : `Auto-pushed from Telegram · live`}
          </div>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            <Newspaper className="h-6 w-6 text-emerald-400" />
            News Analyser
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every PDF forwarded to your Telegram bot is auto-imported, read by AI, and
            surfaced here as ranked UPSC headlines.
          </p>
        </div>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          disabled={analysing}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs font-medium hover:bg-accent disabled:opacity-60"
        >
          {analysing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          {analysing ? "Analysing…" : "Refresh"}
        </button>
      </div>

      {/* Live headline ticker */}
      {tickerItems.length > 0 && (
        <div className="mb-6 overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-r from-emerald-500/10 via-background/60 to-sky-500/10 py-2">
          <div className="flex animate-[ticker_60s_linear_infinite] gap-8 whitespace-nowrap px-4 text-sm">
            {[...tickerItems, ...tickerItems].map((it, i) => {
              const s = GS_STYLE[it.gs_paper];
              return (
                <span key={i} className="inline-flex items-center gap-2">
                  <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
                  <span className="font-semibold text-foreground/80">{it.gs_paper}</span>
                  <span className="text-muted-foreground">·</span>
                  <span>{it.title}</span>
                </span>
              );
            })}
          </div>
          <style>{`@keyframes ticker { from { transform: translateX(0);} to { transform: translateX(-50%);} }`}</style>
        </div>
      )}

      {/* GS filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {GS_KEYS.map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition",
              filter === k
                ? "border-transparent bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow"
                : "border-border bg-background/60 hover:bg-accent",
            )}
          >
            {k === "all" ? "All" : k}
            {buckets ? (
              <span className="ml-1.5 text-[10px] opacity-70">{buckets[k] ?? 0}</span>
            ) : null}
          </button>
        ))}
      </div>

      {err && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {err}
        </div>
      )}

      {!filtered && !err && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading headlines…
        </div>
      )}

      {filtered && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          {analysing ? (
            <>AI is analysing forwarded newspapers — headlines will appear here in seconds.</>
          ) : (
            <>
              No news yet. Forward a newspaper PDF to your Telegram bot and headlines
              will auto-appear here.
            </>
          )}
        </div>
      )}

      {/* Headline list */}
      {filtered && filtered.length > 0 && (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-background/60 backdrop-blur">
          {filtered.map((it) => {
            const s = GS_STYLE[it.gs_paper];
            const hot = it.importance >= 4;
            return (
              <li
                key={it.id}
                className={cn(
                  "flex gap-3 p-4 transition hover:bg-accent/40",
                  hot && "bg-gradient-to-r from-amber-500/5 via-rose-500/5 to-transparent",
                )}
              >
                <div className="flex flex-col items-center gap-1 pt-1">
                  <span
                    className={cn(
                      "rounded-full bg-gradient-to-r px-2 py-0.5 text-[10px] font-bold text-white shadow",
                      s.chip,
                    )}
                  >
                    {it.gs_paper}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={cn(
                          "h-1 w-4 rounded-full",
                          i < it.importance ? "bg-gradient-to-r from-amber-400 to-rose-500" : "bg-border",
                        )}
                      />
                    ))}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                    {it.subject && (
                      <span className="rounded-full border border-border bg-background/60 px-2 py-0.5 font-medium">
                        {it.subject}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      {hot && <Flame className="h-3 w-3 text-rose-400" />}
                      {timeAgo(it.posted_at)}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold leading-snug sm:text-base">
                    {it.title}
                  </h3>
                  {it.summary && (
                    <p className="mt-1 line-clamp-3 text-xs text-muted-foreground sm:text-sm">
                      {it.summary}
                    </p>
                  )}
                </div>
                <Sparkles className="mt-1 h-4 w-4 shrink-0 text-emerald-400/70" />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}