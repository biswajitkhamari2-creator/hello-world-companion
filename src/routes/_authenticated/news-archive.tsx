import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CalendarIcon, ExternalLink, Flame, Loader2, MapPin, Newspaper, RefreshCcw, Sparkles } from "lucide-react";
import { addDays, format } from "date-fns";
import {
  searchNewsArchive,
  listArchiveDates,
  extractPendingInboxNews,
  countPendingInbox,
  type NewsItem,
} from "@/lib/news-items.functions";
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

type Tab = "national" | "odisha";

function ArchivePage() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [tab, setTab] = useState<Tab>("national");
  const [items, setItems] = useState<NewsItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [dates, setDates] = useState<Set<string>>(new Set());
  const [syncing, setSyncing] = useState(false);
  const [pending, setPending] = useState(0);

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

  useEffect(() => {
    (async () => {
      const d = await refreshDates();
      if (!date && d.length) {
        const latest = [...d].sort().pop();
        if (latest) setDate(new Date(`${latest}T00:00:00`));
      }
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
    const o: NewsItem[] = [];
    const n: NewsItem[] = [];
    for (const it of items ?? []) (isOdishaItem(it) ? o : n).push(it);
    return { odisha: o, national: n };
  }, [items]);

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
          </div>

          <Button
            size="sm"
            variant="outline"
            className="ml-auto gap-1.5"
            onClick={async () => {
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
        </div>

        {err && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {err}
          </div>
        )}

        {!date && !loading && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Date select karo — us din ke sabhi headlines yahan aa jayenge.
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading {dateLabel}…
          </div>
        )}

        {!loading && items && list.length === 0 && (
          <div className="space-y-3 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            <p>
              {dateLabel} ke liye {tab === "odisha" ? "Odisha" : "National"} headlines nahi mile.
            </p>
            {pending > 0 ? (
              <p className="text-xs">
                <span className="text-amber-400">{pending}</span> newspaper Telegram inbox mein
                pending hai — <b>Sync</b> dabao, us din ka bhi analyse ho jayega.
              </p>
            ) : items.length === 0 ? (
              <p className="text-xs">
                Is date ka newspaper Telegram bot pe forward nahi hua. Bhejo, phir <b>Sync</b> click karo.
              </p>
            ) : null}
            <Button size="sm" variant="outline" className="gap-1.5" disabled={syncing} onClick={() => runSync(false)}>
              {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
              Sync now
            </Button>
          </div>
        )}

        {!loading && list.length > 0 && (
          <ol className="space-y-2">
            {list
              .slice()
              .sort((a, b) => b.importance - a.importance)
              .map((it, idx) => {
                const hot = it.importance >= 4;
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
        )}
      </main>
    </AppShell>
  );
}