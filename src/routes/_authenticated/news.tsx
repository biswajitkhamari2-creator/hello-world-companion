import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, RefreshCw, Sparkles, Flame, ArrowLeft } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import {
  listNewsItems,
  extractPendingInboxNews,
  countPendingInbox,
  type NewsItem,
  type GsPaper,
} from "@/lib/news-items.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/news")({
  head: () => ({
    meta: [
      { title: "News Highlights — UPSC Genius AI" },
      { name: "description", content: "All important news forwarded through your Telegram bot, auto-imported and organised." },
    ],
  }),
  component: NewsPage,
});

const FILTERS: Array<{ key: GsPaper | "all"; label: string; hint: string }> = [
  { key: "all", label: "All", hint: "Everything the bot analysed" },
  { key: "GS1", label: "GS1", hint: "History • Geography • Society • Culture" },
  { key: "GS2", label: "GS2", hint: "Polity • Governance • IR • Social Justice" },
  { key: "GS3", label: "GS3", hint: "Economy • Environment • S&T • Security" },
  { key: "GS4", label: "GS4", hint: "Ethics" },
];

const GS_STYLE: Record<GsPaper, { chip: string; ring: string }> = {
  GS1: { chip: "from-amber-500 to-rose-500", ring: "ring-amber-400/40" },
  GS2: { chip: "from-sky-500 to-indigo-500", ring: "ring-sky-400/40" },
  GS3: { chip: "from-emerald-500 to-teal-500", ring: "ring-emerald-400/40" },
  GS4: { chip: "from-fuchsia-500 to-purple-500", ring: "ring-fuchsia-400/40" },
  General: { chip: "from-slate-500 to-slate-600", ring: "ring-slate-400/30" },
};

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

function NewsPage() {
  const router = useRouter();
  const [items, setItems] = useState<NewsItem[] | null>(null);
  const [filter, setFilter] = useState<GsPaper | "all">("all");
  const [err, setErr] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [pending, setPending] = useState<number | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const draining = useRef(false);

  // Load current items + pending count.
  useEffect(() => {
    let alive = true;
    setItems(null);
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

  // Auto-refresh every 5 minutes (credit-friendly).
  useEffect(() => {
    const id = setInterval(() => setReloadKey((k) => k + 1), 5 * 60_000);
    return () => clearInterval(id);
  }, []);

  // Auto-drain pending PDFs one at a time (each call ~ 15–40 s).
  useEffect(() => {
    if (!pending || draining.current) return;
    draining.current = true;
    setAnalysing(true);
    (async () => {
      try {
        // Cap at 2 per visit so we don't hammer credits.
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
    const map: Record<string, number> = { all: items.length, GS1: 0, GS2: 0, GS3: 0, GS4: 0 };
    for (const it of items) if (map[it.gs_paper] !== undefined) map[it.gs_paper]++;
    return map;
  }, [items]);

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
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {analysing
              ? `AI analysing newspaper… ${pending ?? ""} left`
              : `Auto-analysed from @e7895tris_bot`}
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Important News — Syllabus-mapped
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Forward newspapers to the bot; AI reads the PDF and shows only the
            UPSC-relevant items here — tagged GS1 / GS2 / GS3 / GS4.
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

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            title={f.hint}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition",
              filter === f.key
                ? "border-transparent bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow"
                : "border-border bg-background/60 hover:bg-accent",
            )}
          >
            {f.label}
            {buckets ? (
              <span className="ml-1.5 text-[10px] opacity-70">{buckets[f.key] ?? 0}</span>
            ) : null}
          </button>
        ))}
      </div>

      {err && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          Could not load news: {err}
        </div>
      )}

      {!filtered && !err && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}

      {filtered && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          {analysing ? (
            <>AI is reading the forwarded newspaper — GS-tagged headlines will appear here in a few seconds.</>
          ) : (
            <>
              No important news yet. Forward a newspaper PDF to{" "}
              <span className="font-semibold text-foreground">@e7895tris_bot</span>{" "}
              and AI will surface only the UPSC-relevant items.
            </>
          )}
        </div>
      )}

      {filtered && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((it) => {
            const style = GS_STYLE[it.gs_paper];
            const hot = it.importance >= 4;
            return (
              <div
                key={it.id}
                className={cn(
                  "group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border p-4 backdrop-blur transition",
                  hot
                    ? "border-transparent bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-fuchsia-500/10 ring-2 ring-inset " + style.ring
                    : "border-border bg-background/60 hover:-translate-y-0.5 hover:border-foreground/30 hover:bg-background/80",
                )}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full bg-gradient-to-r px-2 py-0.5 text-[10px] font-bold text-white shadow",
                      style.chip,
                    )}
                  >
                    <Sparkles className="h-3 w-3" />
                    {it.gs_paper}
                  </span>
                  {it.subject && (
                    <span className="rounded-full border border-border bg-background/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {it.subject}
                    </span>
                  )}
                  <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
                    {hot && <Flame className="h-3 w-3 text-rose-400" />}
                    {timeAgo(it.posted_at)}
                  </span>
                </div>
                <h3 className={cn("line-clamp-3 text-sm font-semibold", hot && "text-foreground")}>
                  {it.title}
                </h3>
                {it.summary && (
                  <p className="mt-2 line-clamp-5 text-xs text-muted-foreground">
                    {it.summary}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-1 flex-1 rounded-full",
                        i < it.importance
                          ? "bg-gradient-to-r from-amber-400 to-rose-500"
                          : "bg-border",
                      )}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}