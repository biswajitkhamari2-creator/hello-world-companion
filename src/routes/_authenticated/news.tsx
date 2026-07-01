import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  MessageSquare,
  Loader2,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import {
  listNewsHighlights,
  type NewsHighlight,
} from "@/lib/news-highlights.functions";
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

const FILTERS: Array<{ key: string; label: string }> = [
  { key: "all", label: "All" },
  { key: "pdf", label: "PDFs" },
  { key: "image", label: "Images" },
  { key: "link", label: "Links" },
  { key: "text", label: "Text" },
];

function kindIcon(k: NewsHighlight["kind"]) {
  switch (k) {
    case "pdf":
      return FileText;
    case "image":
      return ImageIcon;
    case "link":
      return LinkIcon;
    default:
      return MessageSquare;
  }
}

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
  const [items, setItems] = useState<NewsHighlight[] | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [err, setErr] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    setItems(null);
    setErr(null);
    listNewsHighlights({ data: { limit: 120 } })
      .then((r) => alive && setItems(r))
      .catch((e) => alive && setErr((e as Error).message));
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  const filtered = useMemo(() => {
    if (!items) return null;
    if (filter === "all") return items;
    return items.filter((i) => i.kind === filter);
  }, [items, filter]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live from @e7895tris_bot
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            News Highlights
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Anything you forward to your Telegram bot appears here automatically.
          </p>
        </div>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs font-medium hover:bg-accent"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition",
              filter === f.key
                ? "border-transparent bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow"
                : "border-border bg-background/60 hover:bg-accent",
            )}
          >
            {f.label}
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
          Nothing forwarded yet. Send any PDF, photo, link or text to{" "}
          <span className="font-semibold text-foreground">@e7895tris_bot</span>{" "}
          and it will appear here in seconds.
        </div>
      )}

      {filtered && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((it) => {
            const Icon = kindIcon(it.kind);
            const href = it.source_url || it.drive_view_link || undefined;
            return (
              <div
                key={it.id}
                className="group relative flex h-full flex-col justify-between rounded-2xl border border-border bg-background/60 p-4 backdrop-blur transition hover:-translate-y-0.5 hover:border-foreground/30 hover:bg-background/80"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/25 to-fuchsia-500/25">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {it.kind}
                  </span>
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    {timeAgo(it.posted_at)}
                  </span>
                </div>
                <h3 className="line-clamp-3 text-sm font-semibold">
                  {it.title}
                </h3>
                {it.summary && (
                  <p className="mt-2 line-clamp-4 text-xs text-muted-foreground">
                    {it.summary}
                  </p>
                )}
                {href && (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-indigo-400 hover:text-indigo-300"
                  >
                    Open <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}