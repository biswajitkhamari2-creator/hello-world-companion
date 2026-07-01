import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  MessageSquare,
  ArrowRight,
  Loader2,
} from "lucide-react";
import {
  listNewsHighlights,
  type NewsHighlight,
} from "@/lib/news-highlights.functions";

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

export function HomeHighlights() {
  const [items, setItems] = useState<NewsHighlight[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    listNewsHighlights({ data: { limit: 6 } })
      .then((r) => alive && setItems(r))
      .catch((e) => alive && setErr((e as Error).message));
    return () => {
      alive = false;
    };
  }, []);

  if (err) return null;
  if (items && items.length === 0) return null;

  return (
    <section className="mt-14">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Bot Highlights
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Important news forwarded to your bot
          </h2>
          <p className="mt-1 text-sm text-white/60">
            Everything you forward to <span className="text-emerald-300">@e7895tris_bot</span> shows up here automatically.
          </p>
        </div>
        <Link
          to="/news"
          className="hidden sm:inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur hover:border-white/25 hover:bg-white/10"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {!items ? (
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => {
            const Icon = kindIcon(it.kind);
            const href =
              it.source_url || it.drive_view_link || `/news`;
            const external = Boolean(it.source_url || it.drive_view_link);
            const cardCls =
              "group relative flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10";
            const body = (
              <>
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/30 to-fuchsia-500/30 text-white">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-white/50">
                    {it.kind}
                  </span>
                  <span className="ml-auto text-[10px] text-white/40">
                    {timeAgo(it.posted_at)}
                  </span>
                </div>
                <h3 className="line-clamp-3 text-sm font-semibold text-white">
                  {it.title}
                </h3>
                {it.summary && (
                  <p className="mt-2 line-clamp-3 text-xs text-white/60">
                    {it.summary}
                  </p>
                )}
                <div className="mt-3 text-[11px] font-medium text-emerald-300 opacity-0 transition group-hover:opacity-100">
                  Open →
                </div>
              </>
            );
            return external ? (
              <a
                key={it.id}
                href={href}
                target="_blank"
                rel="noreferrer"
                className={cardCls}
              >
                {body}
              </a>
            ) : (
              <Link key={it.id} to="/news" className={cardCls}>
                {body}
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-4 sm:hidden">
        <Link
          to="/news"
          className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur hover:border-white/25 hover:bg-white/10"
        >
          View all news <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}