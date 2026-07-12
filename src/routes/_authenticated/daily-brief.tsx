import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ExternalLink, Loader2, Radio, RefreshCw, Sparkles } from "lucide-react";
import {
  useFastApiNews,
  useFastApiSummary,
  toList,
  type FastApiNewsItem,
} from "@/lib/fastapi";

export const Route = createFileRoute("/_authenticated/daily-brief")({
  head: () => ({
    meta: [
      { title: "Daily Brief — UPSC Mitra" },
      { name: "description", content: "Live daily current-affairs brief, AI summary and revision notes from the FastAPI backend." },
    ],
  }),
  component: DailyBriefPage,
});

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <h2 className="font-serif text-lg font-semibold mb-2">{title}</h2>
      <div className="text-sm text-foreground/90 leading-relaxed">{children}</div>
    </section>
  );
}

function ListOrText({ value }: { value: unknown }) {
  if (!value) return <p className="text-muted-foreground italic">Not available.</p>;
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc pl-5 space-y-1">
        {value.map((v, i) => (
          <li key={i}>
            {typeof v === "string" ? v : JSON.stringify(v)}
          </li>
        ))}
      </ul>
    );
  }
  if (typeof value === "string") return <p className="whitespace-pre-wrap">{value}</p>;
  return <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(value, null, 2)}</pre>;
}

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm dark:bg-rose-950/30">
      <AlertTriangle className="mt-0.5 h-4 w-4 text-rose-600" />
      <div className="flex-1">
        <p className="font-semibold">Backend offline</p>
        <p className="text-xs text-muted-foreground">{message}</p>
      </div>
      <Button size="sm" variant="outline" onClick={onRetry}>
        <RefreshCw className="mr-1 h-3.5 w-3.5" /> Retry
      </Button>
    </div>
  );
}

function Skeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 rounded bg-muted" style={{ width: `${60 + (i * 7) % 40}%` }} />
      ))}
    </div>
  );
}

function newsLink(n: FastApiNewsItem): string | undefined {
  return n.url ?? n.link;
}

function DailyBriefPage() {
  const news = useFastApiNews();
  const summary = useFastApiSummary();

  const newsItems = toList<FastApiNewsItem>(news.data);
  const s = summary.data;

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-5xl px-4 py-6 space-y-6">
        <header className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-md">
            <Radio className="h-5 w-5" />
          </span>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-2xl font-bold">Daily Brief</h1>
            <p className="text-sm text-muted-foreground">Live from your FastAPI backend at localhost:8000.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { news.refetch(); summary.refetch(); }}
            disabled={news.isFetching || summary.isFetching}
          >
            {(news.isFetching || summary.isFetching) ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-1.5 h-3.5 w-3.5" />}
            Refresh
          </Button>
        </header>

        {/* Summary */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 font-serif text-xl font-semibold">
            <Sparkles className="h-4 w-4 text-indigo-500" /> AI UPSC Summary
          </h2>
          {summary.isLoading && (
            <div className="rounded-xl border border-border bg-card p-4"><Skeleton lines={5} /></div>
          )}
          {summary.isError && !summary.isLoading && (
            <ErrorBanner message={(summary.error as Error)?.message ?? "Unknown"} onRetry={() => summary.refetch()} />
          )}
          {s && (
            <div className="grid gap-4 md:grid-cols-2">
              <SectionCard title="Executive Summary">
                <ListOrText value={s.executive_summary} />
              </SectionCard>
              <SectionCard title="Top 10 Current Affairs">
                <ListOrText value={s.top_10_current_affairs} />
              </SectionCard>
              <SectionCard title="UPSC GS Mapping">
                <ListOrText value={s.upsc_gs_mapping} />
              </SectionCard>
              <SectionCard title="Prelims Facts">
                <ListOrText value={s.prelims_facts} />
              </SectionCard>
              <SectionCard title="Editorial Analysis">
                <ListOrText value={s.editorial_analysis} />
              </SectionCard>
              <SectionCard title="Important Data">
                <ListOrText value={s.important_data} />
              </SectionCard>
              <SectionCard title="Keywords">
                {Array.isArray(s.keywords) && s.keywords.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {s.keywords.map((k, i) => (
                      <Badge key={i} variant="secondary">{k}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No keywords.</p>
                )}
              </SectionCard>
              <SectionCard title="Revision Notes">
                <ListOrText value={s.revision_notes} />
              </SectionCard>
            </div>
          )}
        </section>

        {/* News */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-semibold">Today's News</h2>
          {news.isLoading && (
            <div className="grid gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-3"><Skeleton lines={2} /></div>
              ))}
            </div>
          )}
          {news.isError && !news.isLoading && (
            <ErrorBanner message={(news.error as Error)?.message ?? "Unknown"} onRetry={() => news.refetch()} />
          )}
          {!news.isLoading && !news.isError && newsItems.length === 0 && (
            <p className="text-sm text-muted-foreground">No news items returned.</p>
          )}
          <ul className="grid gap-2">
            {newsItems.map((n, i) => {
              const href = newsLink(n);
              return (
                <li key={i} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm leading-5">{n.title ?? "Untitled"}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        {n.source && <Badge variant="outline" className="text-[10px]">{n.source}</Badge>}
                        {n.category && <Badge variant="secondary" className="text-[10px]">{n.category}</Badge>}
                        {n.gs && <Badge className="text-[10px]">{n.gs}</Badge>}
                        {(n.published || n.pubDate) && <span>{n.published ?? n.pubDate}</span>}
                      </div>
                      {(n.summary || n.description) && (
                        <p className="mt-1.5 text-xs text-muted-foreground line-clamp-3">{n.summary ?? n.description}</p>
                      )}
                    </div>
                    {href && (
                      <a href={href} target="_blank" rel="noreferrer" className="shrink-0 text-indigo-600 hover:underline">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </AppShell>
  );
}