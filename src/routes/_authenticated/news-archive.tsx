import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarIcon, Loader2, Search, Sparkles, X, Flame } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  searchNewsArchive,
  listArchiveDates,
  type NewsItem,
  type GsPaper,
} from "@/lib/news-items.functions";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/news-archive")({
  head: () => ({
    meta: [
      { title: "News Archive — UPSC Genius AI" },
      { name: "description", content: "Search every important UPSC/OPSC news item AI has extracted from your forwarded newspapers — by date and keyword." },
    ],
  }),
  component: ArchivePage,
});

const GS_STYLE: Record<GsPaper, string> = {
  GS1: "from-amber-500 to-rose-500",
  GS2: "from-sky-500 to-indigo-500",
  GS3: "from-emerald-500 to-teal-500",
  GS4: "from-fuchsia-500 to-purple-500",
  General: "from-slate-500 to-slate-600",
};

const FILTERS: Array<GsPaper | "all"> = ["all", "GS1", "GS2", "GS3", "GS4"];

function ArchivePage() {
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [gs, setGs] = useState<GsPaper | "all">("all");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<NewsItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [dates, setDates] = useState<Set<string>>(new Set());
  const [visible, setVisible] = useState(24);
  const PAGE = 24;
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    listArchiveDates()
      .then((d) => setDates(new Set(d)))
      .catch(() => {});
  }, []);

  async function runSearch() {
    setLoading(true);
    setErr(null);
    try {
      const res = await searchNewsArchive({
        data: {
          from: range?.from ? format(range.from, "yyyy-MM-dd") : undefined,
          to: range?.to
            ? format(range.to, "yyyy-MM-dd")
            : range?.from
              ? format(range.from, "yyyy-MM-dd")
              : undefined,
          gs: gs === "all" ? undefined : gs,
          q: q.trim() || undefined,
          limit: 1000,
        },
      });
      setItems(res);
      setVisible(PAGE);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // Initial load
  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-search when filters change
  useEffect(() => {
    const t = setTimeout(runSearch, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range?.from, range?.to, gs]);

  // Infinite scroll: reveal more when sentinel enters viewport
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !items) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible((v) => Math.min(v + PAGE, items.length));
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [items]);

  const label = useMemo(() => {
    if (!range?.from) return "All dates";
    if (range.to && range.to.getTime() !== range.from.getTime()) {
      return `${format(range.from, "d MMM yyyy")} → ${format(range.to, "d MMM yyyy")}`;
    }
    return format(range.from, "d MMM yyyy");
  }, [range]);

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        <header className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-400/10 px-3 py-1 text-xs font-medium text-indigo-300">
            <Sparkles className="h-3 w-3" /> Archive of every AI-analysed headline
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">News Archive</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Har newspaper jo aapne Telegram pe forward kiya — uske sabhi UPSC/OPSC relevant items yahan permanently save hain. Date ya keyword se search karo.
          </p>
        </header>

        <div className="mb-5 flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5" />
                {label}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={range}
                onSelect={setRange}
                numberOfMonths={1}
                initialFocus
                modifiers={{ hasNews: (d) => dates.has(format(d, "yyyy-MM-dd")) }}
                modifiersClassNames={{
                  hasNews:
                    "font-bold text-emerald-600 dark:text-emerald-400 underline underline-offset-2",
                }}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          {range?.from && (
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => setRange(undefined)}>
              <X className="h-3.5 w-3.5" /> Clear date
            </Button>
          )}

          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setGs(f)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition",
                  gs === f
                    ? "border-transparent bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow"
                    : "border-border bg-background/60 hover:bg-accent",
                )}
              >
                {f === "all" ? "All" : f}
              </button>
            ))}
          </div>

          <form
            className="ml-auto flex flex-1 sm:flex-none items-center gap-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              runSearch();
            }}
          >
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search title / summary…"
                className="h-9 pl-7 text-sm"
              />
            </div>
            <Button size="sm" type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Search"}
            </Button>
          </form>
        </div>

        {err && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {err}
          </div>
        )}

        {loading && !items && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Searching archive…
          </div>
        )}

        {items && items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Is filter par kuch nahi mila. Date range ya keyword badalke try karo.
          </div>
        )}

        {items && items.length > 0 && (
          <>
            <p className="mb-3 text-xs text-muted-foreground">
              Showing {Math.min(visible, items.length)} of {items.length} result{items.length === 1 ? "" : "s"}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.slice(0, visible).map((it) => {
                const hot = it.importance >= 4;
                return (
                  <div
                    key={it.id}
                    className={cn(
                      "flex h-full flex-col rounded-2xl border p-4 backdrop-blur transition",
                      hot
                        ? "border-transparent bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-fuchsia-500/10 ring-1 ring-inset ring-amber-400/30"
                        : "border-border bg-background/60",
                    )}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full bg-gradient-to-r px-2 py-0.5 text-[10px] font-bold text-white shadow",
                          GS_STYLE[it.gs_paper],
                        )}
                      >
                        {it.gs_paper}
                      </span>
                      {it.subject && (
                        <span className="rounded-full border border-border bg-background/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                          {it.subject}
                        </span>
                      )}
                      <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
                        {hot && <Flame className="h-3 w-3 text-rose-400" />}
                        {format(new Date(it.posted_at), "d MMM yyyy")}
                      </span>
                    </div>
                    <h3 className="line-clamp-3 text-sm font-semibold">{it.title}</h3>
                    {it.summary && (
                      <p className="mt-2 line-clamp-5 text-xs text-muted-foreground">{it.summary}</p>
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
            {visible < items.length && (
              <div ref={sentinelRef} className="mt-6 flex items-center justify-center py-6">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setVisible((v) => Math.min(v + PAGE, items.length))}
                >
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading more…
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </AppShell>
  );
}