import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Loader2, Sparkles, Flame } from "lucide-react";
import { listNewsItems, type NewsItem, type GsPaper } from "@/lib/news-items.functions";

const GS_CHIP: Record<GsPaper, string> = {
  GS1: "from-amber-500 to-rose-500",
  GS2: "from-sky-500 to-indigo-500",
  GS3: "from-emerald-500 to-teal-500",
  GS4: "from-fuchsia-500 to-purple-500",
  General: "from-slate-500 to-slate-600",
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

export function HomeHighlights() {
  const [items, setItems] = useState<NewsItem[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    listNewsItems({ data: { limit: 6 } })
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
            AI-analysed Headlines
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Today’s important news — tagged by GS paper
          </h2>
          <p className="mt-1 text-sm text-white/60">
            Forward newspapers to <span className="text-emerald-300">@e7895tris_bot</span>. AI reads the PDF and pushes only the UPSC-relevant items here.
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
            const hot = it.importance >= 4;
            return (
              <Link
                key={it.id}
                to="/news"
                className={
                  "group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border p-4 backdrop-blur transition " +
                  (hot
                    ? "border-transparent bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-fuchsia-500/15 ring-2 ring-inset ring-amber-400/40 animate-pulse"
                    : "border-white/10 bg-white/5 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10")
                }
              >
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={
                      "inline-flex items-center gap-1 rounded-full bg-gradient-to-r px-2 py-0.5 text-[10px] font-bold text-white shadow " +
                      GS_CHIP[it.gs_paper]
                    }
                  >
                    <Sparkles className="h-3 w-3" />
                    {it.gs_paper}
                  </span>
                  {it.subject && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/70">
                      {it.subject}
                    </span>
                  )}
                  <span className="ml-auto flex items-center gap-1 text-[10px] text-white/50">
                    {hot && <Flame className="h-3 w-3 text-rose-300 animate-pulse" />}
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
                <div className="mt-3 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={
                        "h-1 flex-1 rounded-full " +
                        (i < it.importance
                          ? "bg-gradient-to-r from-amber-400 to-rose-500"
                          : "bg-white/10")
                      }
                    />
                  ))}
                </div>
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