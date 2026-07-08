import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Building2, CalendarIcon, ExternalLink, Flame, Loader2, MapPin, Newspaper, RadioTower, RefreshCcw, RotateCcw, Sparkles } from "lucide-react";
import { addDays, format } from "date-fns";
import {
  searchNewsArchive,
  listArchiveDates,
  extractPendingInboxNews,
  countPendingInbox,
  hardResetNewsAnalysis,
  type NewsItem,
} from "@/lib/news-items.functions";
import { getUpscNews } from "@/lib/news.functions";
import { getOdishaNews } from "@/lib/odisha-news.functions";
import { getInstitutionNews } from "@/lib/institution-news.functions";
import { getGkTodayNews, type GkTodayNewsItem } from "@/lib/gktoday-news.functions";
import { getPibNews, type PibNewsItem } from "@/lib/pib-news.functions";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
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

const ODISHA_REGEX =
  /odisha|odia|ଓଡ|opsc|bhubanes|cuttack|puri\b|balasore|sambalpur|rourkela|jagannath|koraput|kalinga|jajpur|jharsuguda|kendrapara|mayurbhanj|angul|dhenkanal|ganjam|nabarangpur|nayagarh|rayagada|sundargarh|kandhamal|malkangiri|boudh|deogarh|khordha|nuapada|subarnapur|bargarh|bolangir/i;

function isOdishaItem(it: NewsItem): boolean {
  const hay = `${it.title} ${it.summary ?? ""} ${it.subject ?? ""}`;
  return ODISHA_REGEX.test(hay);
}

type Tab = "national" | "odisha" | "gktoday" | "pib";

type DisplayItem = NewsItem & { live?: boolean; sourceLabel?: string };

function mkLiveId(prefix: string, link: string, i: number) {
  return `${prefix}-${i}-${link.slice(-30)}`;
}

function classifyGsFromText(text: string): NewsItem["gs_paper"] {
  const t = text.toLowerCase();
  if (/ethic|integrity|moral|corrupt|probity/.test(t)) return "GS4";
  if (/econom|budget|gdp|inflation|climate|environment|science|technolog|isro|drdo|defence|cyber|disaster|energy|agricultur|infrastructur/.test(t)) return "GS3";
  if (/polit|constitution|parliament|court|governance|scheme|policy|bilateral|foreign|treaty|election|bill|amendment|judiciary/.test(t)) return "GS2";
  if (/history|heritage|culture|geograph|society|women|caste|tribal|urbanis|festival/.test(t)) return "GS1";
  return "General";
}

function ArchivePage() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [tab, setTab] = useState<Tab>("national");
  const [items, setItems] = useState<NewsItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [dates, setDates] = useState<Set<string>>(new Set());
  const [syncing, setSyncing] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [pending, setPending] = useState(0);
  const [live, setLive] = useState<DisplayItem[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [gkItems, setGkItems] = useState<GkTodayNewsItem[]>([]);
  const [gkLoading, setGkLoading] = useState(false);
  const [pibItems, setPibItems] = useState<PibNewsItem[]>([]);
  const [pibLoading, setPibLoading] = useState(false);

  async function refreshGkToday() {
    setGkLoading(true);
    try {
      const res = await getGkTodayNews();
      setGkItems(res.items);
    } catch (e) {
      // Don't toast — silently degrade; the tab shows "no items" instead.
      console.warn("gktoday fetch failed", e);
    } finally {
      setGkLoading(false);
    }
  }

  async function refreshPib() {
    setPibLoading(true);
    try {
      const res = await getPibNews();
      setPibItems(res.items);
    } catch (e) {
      console.warn("pib fetch failed", e);
    } finally {
      setPibLoading(false);
    }
  }

  async function refreshLive() {
    setLiveLoading(true);
    try {
      const [upsc, odisha, inst] = await Promise.allSettled([
        getUpscNews(),
        getOdishaNews(),
        getInstitutionNews(),
      ]);
      const merged: DisplayItem[] = [];
      if (upsc.status === "fulfilled") {
        upsc.value.items.forEach((it, i) => {
          merged.push({
            id: mkLiveId("u", it.link, i),
            inbox_id: "live",
            gs_paper: (it.gs as NewsItem["gs_paper"]) ?? "General",
            subject: it.source,
            title: it.title,
            summary: null,
            importance: 3,
            posted_at: it.pubDate || new Date().toISOString(),
            link: it.link,
            live: true,
            sourceLabel: it.source,
          });
        });
      }
      if (odisha.status === "fulfilled") {
        odisha.value.items.forEach((it, i) => {
          merged.push({
            id: mkLiveId("o", it.link, i),
            inbox_id: "live",
            gs_paper: classifyGsFromText(it.title + " " + (it.description ?? "")),
            subject: it.category,
            title: it.title,
            summary: it.description ?? null,
            importance: 3,
            posted_at: it.pubDate || new Date().toISOString(),
            link: it.link,
            live: true,
            sourceLabel: it.source,
          });
        });
      }
      if (inst.status === "fulfilled") {
        const instItems = [...(inst.value.daily ?? []), ...(inst.value.weekly ?? [])];
        instItems.forEach((it, i) => {
          merged.push({
            id: mkLiveId("i", it.link, i),
            inbox_id: "live",
            gs_paper: classifyGsFromText(it.title + " " + it.category),
            subject: it.category,
            title: it.title,
            summary: null,
            importance: 4,
            posted_at: it.date ? `${it.date}T00:00:00` : new Date().toISOString(),
            link: it.link,
            live: true,
            sourceLabel: it.source,
          });
        });
      }
      // Dedupe by title
      const seen = new Set<string>();
      const unique = merged.filter((it) => {
        const k = it.title.toLowerCase().slice(0, 90);
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      setLive(unique);
    } finally {
      setLiveLoading(false);
    }
  }

  async function refreshDates() {
    try {
      const d = await listArchiveDates();
      setDates(new Set(d));
      return d;
    } catch {
      return [];
    }
  }

  async function refreshPendingCount() {
    try {
      const { pending } = await countPendingInbox();
      setPending(pending);
      return pending;
    } catch {
      return 0;
    }
  }

  async function runSync(silent = false) {
    if (syncing) return;
    setSyncing(true);
    try {
      let processedAny = false;
      // Batch through pending PDFs — server processes ~1 per call.
      // Loop until inbox is empty (cap at 60 to avoid runaway on huge backlogs).
      for (let i = 0; i < 60; i++) {
        const res = await extractPendingInboxNews();
        if (res.processed) processedAny = true;
        if (!res.remaining) break;
        await refreshPendingCount();
      }
      await Promise.all([refreshDates(), refreshPendingCount()]);
      if (!silent) {
        toast.success(processedAny ? "Sync complete — new headlines added." : "Sab kuch already synced hai.");
      }
      return processedAny;
    } catch (e) {
      if (!silent) toast.error(`Sync failed: ${(e as Error).message}`);
      return false;
    } finally {
      setSyncing(false);
    }
  }

  async function runHardReset() {
    if (resetting || syncing) return;
    const ok = window.confirm("Hard reset news archive? This will delete extracted headlines and re-extract all ready Telegram newspaper PDFs using direct Gemini.");
    if (!ok) return;
    setResetting(true);
    try {
      const res = await hardResetNewsAnalysis();
      setPending(res.pending);
      toast.success(`Reset done — ${res.deleted} old headlines removed. Re-extracting with Gemini…`);
      await runSync(false);
      await refreshDates();
      if (date) setDate(new Date(date));
    } catch (e) {
      toast.error(`Hard reset failed: ${(e as Error).message}`);
    } finally {
      setResetting(false);
    }
  }

  useEffect(() => {
    (async () => {
      const d = await refreshDates();
      if (!date && d.length) {
        const latest = [...d].sort().pop();
        if (latest) setDate(new Date(`${latest}T00:00:00`));
      } else if (!date) {
        setDate(new Date());
      }
      // Kick off live sync alongside archive
      void refreshLive();
      void refreshGkToday();
      void refreshPib();
      // Auto-sync in the background so kal ka newspaper appear ho jaaye
      // agar Telegram inbox mein pending pada hai.
      const p = await refreshPendingCount();
      if (p > 0) {
        const added = await runSync(true);
        if (added) {
          const d2 = await refreshDates();
          if (d2.length) {
            const latest = [...d2].sort().pop();
            if (latest) setDate(new Date(`${latest}T00:00:00`));
          }
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!date) {
      setItems(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setErr(null);
    // Expand the server-side window by ±1 day so IST-vs-UTC boundary
    // doesn't hide items whose posted_at slid into the next/prev UTC day,
    // then filter to the user's local calendar day on the client.
    const ymdLocal = format(date, "yyyy-MM-dd");
    const from = format(addDays(date, -1), "yyyy-MM-dd");
    const to = format(addDays(date, 1), "yyyy-MM-dd");
    searchNewsArchive({ data: { from, to, limit: 1000 } })
      .then((res) => {
        if (cancelled) return;
        const filtered = res.filter((it) => {
          const d = new Date(it.posted_at);
          return format(d, "yyyy-MM-dd") === ymdLocal;
        });
        setItems(filtered);
      })
      .catch((e) => {
        if (!cancelled) setErr((e as Error).message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [date]);

  const { odisha, national } = useMemo(() => {
    const combined: DisplayItem[] = [...(items ?? [])];
    // Add live items that match the currently selected date; if archive is empty
    // for this date, we still want live headlines to appear (so no "no results").
    const ymd = date ? format(date, "yyyy-MM-dd") : null;
    const liveForDate = ymd
      ? live.filter((it) => {
          const d = new Date(it.posted_at);
          return format(d, "yyyy-MM-dd") === ymd;
        })
      : [];
    // Merge, dedupe by title
    const seen = new Set(combined.map((c) => c.title.toLowerCase().slice(0, 90)));
    for (const l of liveForDate) {
      const k = l.title.toLowerCase().slice(0, 90);
      if (!seen.has(k)) { combined.push(l); seen.add(k); }
    }
    // If STILL nothing on this date, fall back to ALL live headlines
    // (Google + institutes + UPSC sites) so screen never says "no results".
    if (combined.length === 0 && live.length > 0) {
      combined.push(...live);
    }
    const o: DisplayItem[] = [];
    const n: DisplayItem[] = [];
    for (const it of combined) (isOdishaItem(it) ? o : n).push(it);
    return { odisha: o, national: n };
  }, [items, live, date]);

  const list = tab === "odisha" ? odisha : national;
  const dateLabel = date ? format(date, "d MMM yyyy") : "Pick a date";

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-4xl px-4 py-6">
        <header className="mb-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-400/10 px-3 py-1 text-xs font-medium text-indigo-300">
            <Sparkles className="h-3 w-3" /> Daily headlines archive
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">News Archive</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ek date choose karo — us din ke Odisha aur National headlines seedhe source PDF ke link ke saath.
          </p>
        </header>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5" />
                {dateLabel}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
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

          <div className="inline-flex rounded-full border border-border bg-background/60 p-1">
            <button
              onClick={() => setTab("national")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition",
                tab === "national"
                  ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Newspaper className="h-3 w-3" /> National
              <span className="ml-1 rounded-full bg-black/20 px-1.5 text-[10px]">{national.length}</span>
            </button>
            <button
              onClick={() => setTab("odisha")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition",
                tab === "odisha"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <MapPin className="h-3 w-3" /> Odisha
              <span className="ml-1 rounded-full bg-black/20 px-1.5 text-[10px]">{odisha.length}</span>
            </button>
            <button
              onClick={() => setTab("gktoday")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition",
                tab === "gktoday"
                  ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <BookOpen className="h-3 w-3" /> GK Today 24
              <span className="ml-1 rounded-full bg-black/20 px-1.5 text-[10px]">{gkItems.length}</span>
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="ml-auto gap-1.5"
            onClick={async () => {
              void refreshLive();
              const added = await runSync(false);
              if (added && date) {
                // Re-run the current date's query to pick up new items.
                setDate(new Date(date));
              }
            }}
            disabled={syncing}
          >
            {syncing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCcw className="h-3.5 w-3.5" />
            )}
            Sync {pending > 0 ? `(${pending})` : ""}
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 border-rose-400/40 text-rose-300 hover:bg-rose-500/10"
            onClick={runHardReset}
            disabled={syncing || resetting}
          >
            {resetting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
            Hard reset
          </Button>
        </div>

        {err && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {err}
          </div>
        )}

        {(loading || liveLoading) && list.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading {dateLabel}…
          </div>
        )}

        {tab === "gktoday" ? (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Latest current-affairs items pulled from gktoday.in (last ~14 days).
              </p>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={refreshGkToday}
                disabled={gkLoading}
              >
                {gkLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
                Refresh
              </Button>
            </div>
            {gkLoading && gkItems.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading GKToday…
              </div>
            ) : gkItems.length === 0 ? (
              <div className="rounded-xl border border-border bg-background/60 p-6 text-center text-sm text-muted-foreground">
                No GKToday items right now. Try Refresh in a minute.
              </div>
            ) : (
              <ol className="space-y-2">
                {gkItems.map((it, idx) => (
                  <li
                    key={it.link}
                    className="group rounded-xl border border-border bg-background/60 p-3 transition hover:border-amber-400/50"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 w-6 shrink-0 text-right text-xs font-semibold text-muted-foreground">
                        {idx + 1}.
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-1.5 text-[10px] font-medium">
                          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-300">
                            {it.category}
                          </span>
                          <span className="rounded-full border border-border px-2 py-0.5 text-muted-foreground">
                            GKToday
                          </span>
                          {it.pubDate && (
                            <span className="text-muted-foreground">
                              {format(new Date(it.pubDate), "d MMM")}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold leading-snug">{it.title}</h3>
                        {it.description && (
                          <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">
                            {it.description}
                          </p>
                        )}
                      </div>
                      <a
                        href={it.link}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-background/70 px-2.5 py-1 text-[10px] font-medium text-foreground/80 hover:text-foreground"
                      >
                        <ExternalLink className="h-3 w-3" /> Open
                      </a>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        ) : !loading && list.length > 0 ? (
          <ol className="space-y-2">
            {list
              .slice()
              .sort((a, b) => b.importance - a.importance)
              .map((it, idx) => {
                const hot = it.importance >= 4;
                const isLive = (it as DisplayItem).live === true;
                const liveLabel = (it as DisplayItem).sourceLabel;
                return (
                  <li
                    key={it.id}
                    className={cn(
                      "group rounded-xl border p-3 transition hover:border-indigo-400/50",
                      hot
                        ? "border-amber-400/30 bg-gradient-to-r from-amber-500/5 via-rose-500/5 to-fuchsia-500/5"
                        : "border-border bg-background/60",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 w-6 shrink-0 text-right text-xs font-semibold text-muted-foreground">
                        {idx + 1}.
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-1.5 text-[10px] font-medium">
                          <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-indigo-300">
                            {it.gs_paper}
                          </span>
                          {it.subject && (
                            <span className="rounded-full border border-border px-2 py-0.5 text-muted-foreground">
                              {it.subject}
                            </span>
                          )}
                          {isLive && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-300">
                              <RadioTower className="h-3 w-3" /> Live · {liveLabel ?? "web"}
                            </span>
                          )}
                          {hot && (
                            <span className="inline-flex items-center gap-0.5 text-rose-400">
                              <Flame className="h-3 w-3" /> Must read
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold leading-snug">{it.title}</h3>
                        {it.summary && (
                          <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">
                            {it.summary}
                          </p>
                        )}
                      </div>
                      {it.link ? (
                        <a
                          href={it.link}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-background/70 px-2.5 py-1 text-[10px] font-medium text-foreground/80 hover:text-foreground"
                        >
                          <ExternalLink className="h-3 w-3" /> Open
                        </a>
                      ) : (
                        <span className="inline-flex shrink-0 items-center rounded-full border border-dashed border-border px-2.5 py-1 text-[10px] text-muted-foreground">
                          no link
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
          </ol>
        ) : null}
      </main>
    </AppShell>
  );
}