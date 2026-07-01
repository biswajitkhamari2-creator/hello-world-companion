import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { GraduationCap, CalendarDays, CalendarRange, Download, ExternalLink, Loader2, RefreshCcw, X, Sparkles, BookOpen } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getInstitutionNews, getInstitutionArticle, getInstitutionCrispNotes, type InstitutionItem, type InstitutionCrispNotes } from "@/lib/institution-news.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/institution")({
  head: () => ({ meta: [{ title: "Institution Engine — Vision IAS" }] }),
  component: InstitutionPage,
});

function gsColor(gs: string): string {
  switch (gs) {
    case "GS-1": return "from-amber-500 to-orange-500";
    case "GS-2": return "from-sky-500 to-blue-600";
    case "GS-3": return "from-emerald-500 to-teal-600";
    case "GS-4": return "from-fuchsia-500 to-pink-600";
    case "Essay": return "from-violet-500 to-indigo-600";
    default: return "from-slate-500 to-slate-700";
  }
}

function CrispNotesView({ notes }: { notes: InstitutionCrispNotes }) {
  return (
    <div className="space-y-5">
      <div className={`rounded-2xl bg-gradient-to-br ${gsColor(notes.gsPaper)} p-[1px] shadow-sm`}>
        <div className="rounded-2xl bg-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full bg-gradient-to-r ${gsColor(notes.gsPaper)} px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white shadow`}>{notes.gsPaper}</span>
            <Badge variant="secondary" className="text-[10px]">{notes.subject}</Badge>
            <Badge variant="outline" className="text-[10px]">{notes.topic}</Badge>
          </div>
          <h2 className="mt-2 font-serif text-lg font-bold leading-snug">{notes.title}</h2>
          <p className="mt-1 text-xs italic text-muted-foreground">Syllabus anchor: {notes.syllabusAnchor}</p>
          <p className="mt-3 text-sm leading-relaxed">{notes.oneLine}</p>
        </div>
      </div>

      {notes.whyInNews?.length > 0 && (
        <Section title="Why in News">
          {notes.whyInNews.map((b, i) => <Bullet key={i}>{b}</Bullet>)}
        </Section>
      )}

      {notes.keyPoints?.length > 0 && (
        <Section title="Key Points">
          {notes.keyPoints.map((b, i) => <Bullet key={i}>{b}</Bullet>)}
        </Section>
      )}

      {notes.facts?.length > 0 && (
        <Section title="Facts & Figures">
          {notes.facts.map((b, i) => <Bullet key={i} accent="amber">{b}</Bullet>)}
        </Section>
      )}

      {notes.keyTerms?.length > 0 && (
        <Section title="Key Terms">
          <div className="grid gap-2 sm:grid-cols-2">
            {notes.keyTerms.map((t, i) => (
              <div key={i} className="rounded-lg border border-border bg-muted/30 p-2.5">
                <p className="text-xs font-semibold">{t.term}</p>
                <p className="text-xs text-muted-foreground">{t.meaning}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {notes.prelimsAngle?.length > 0 && (
          <Section title="Prelims Angle" tone="sky">
            {notes.prelimsAngle.map((b, i) => <Bullet key={i}>{b}</Bullet>)}
          </Section>
        )}
        {notes.mainsAngle?.length > 0 && (
          <Section title="Mains Angle" tone="emerald">
            {notes.mainsAngle.map((b, i) => <Bullet key={i}>{b}</Bullet>)}
          </Section>
        )}
      </div>

      {notes.probableQuestion && (
        <div className="rounded-xl border-l-4 border-fuchsia-500 bg-fuchsia-50 p-3.5 text-sm dark:bg-fuchsia-950/30">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-fuchsia-700 dark:text-fuchsia-300">Probable Question</p>
          <p className="italic">{notes.probableQuestion}</p>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        Source: <a className="underline" href={notes.sourceUrl} target="_blank" rel="noreferrer">{notes.sourceUrl}</a>
      </p>
    </div>
  );
}

function Section({ title, tone, children }: { title: string; tone?: "sky" | "emerald"; children: React.ReactNode }) {
  const ring =
    tone === "sky" ? "border-sky-200 dark:border-sky-900/50" :
    tone === "emerald" ? "border-emerald-200 dark:border-emerald-900/50" :
    "border-border";
  return (
    <div className={`rounded-xl border ${ring} bg-card p-3.5`}>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Bullet({ children, accent }: { children: React.ReactNode; accent?: "amber" }) {
  const dot = accent === "amber" ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="flex gap-2 text-sm leading-snug">
      <span className={`mt-1.5 h-1.5 w-1.5 flex-none rounded-full ${dot}`} />
      <span>{children}</span>
    </div>
  );
}

type Tab = "daily" | "weekly";

function InstitutionPage() {
  const fetchNews = useServerFn(getInstitutionNews);
  const fetchArticle = useServerFn(getInstitutionArticle);
  const fetchCrisp = useServerFn(getInstitutionCrispNotes);
  const [tab, setTab] = useState<Tab>("daily");
  const [open, setOpen] = useState<InstitutionItem | null>(null);
  const [articleHtml, setArticleHtml] = useState<string>("");
  const [articleTitle, setArticleTitle] = useState<string>("");
  const [crisp, setCrisp] = useState<InstitutionCrispNotes | null>(null);
  const [showFull, setShowFull] = useState(false);

  const q = useQuery({
    queryKey: ["institution-news"],
    queryFn: () => fetchNews(),
    staleTime: 5 * 60 * 1000,
  });

  const articleMut = useMutation({
    mutationFn: (url: string) => fetchArticle({ data: { url } }),
    onSuccess: (res) => {
      setArticleHtml(res.html);
      setArticleTitle(res.title);
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : "Could not load article");
    },
  });

  const crispMut = useMutation({
    mutationFn: (url: string) => fetchCrisp({ data: { url } }),
    onSuccess: (res) => setCrisp(res),
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : "Could not generate crisp notes");
    },
  });

  const items = useMemo(() => {
    if (!q.data) return [] as InstitutionItem[];
    return tab === "daily" ? q.data.daily : q.data.weekly;
  }, [q.data, tab]);

  const grouped = useMemo(() => {
    const map = new Map<string, InstitutionItem[]>();
    for (const it of items) {
      const list = map.get(it.date) ?? [];
      list.push(it);
      map.set(it.date, list);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [items]);

  function openArticle(it: InstitutionItem) {
    setOpen(it);
    setArticleHtml("");
    setArticleTitle(it.title);
    setCrisp(null);
    setShowFull(false);
    crispMut.mutate(it.link);
  }

  function loadFullArticle() {
    setShowFull(true);
    if (!articleHtml && !articleMut.isPending) articleMut.mutate(open!.link);
  }

  function saveAsPdf() {
    if (typeof window === "undefined") return;
    window.print();
  }

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 print:hidden">
        <header className="mb-6 flex flex-wrap items-center gap-3 animate-fade-in">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-md">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-2xl font-bold">Institution Engine</h1>
            <p className="text-sm text-muted-foreground">
              Curated exclusively from <span className="font-semibold">Vision IAS</span>. No Google, no third-party feeds.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => q.refetch()} disabled={q.isFetching}>
            <RefreshCcw className={`h-3.5 w-3.5 mr-1.5 ${q.isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </header>

        <div className="mb-5 inline-flex rounded-full border border-border bg-card p-1 shadow-sm">
          <button
            onClick={() => setTab("daily")}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              tab === "daily" ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CalendarDays className="h-3.5 w-3.5" /> Daily News Blast
          </button>
          <button
            onClick={() => setTab("weekly")}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              tab === "weekly" ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CalendarRange className="h-3.5 w-3.5" /> Weekly Focus
          </button>
        </div>

        {q.isLoading && (
          <div className="grid gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl border border-border bg-muted/30 animate-pulse" />
            ))}
          </div>
        )}

        {q.error && (
          <div className="rounded-xl border border-rose-300/50 bg-rose-50 p-4 text-sm text-rose-800 dark:bg-rose-950/30 dark:text-rose-200">
            Could not reach Vision IAS. Try refreshing in a moment.
          </div>
        )}

        {!q.isLoading && !items.length && !q.error && (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Nothing published in this section right now.
          </div>
        )}

        <div className="space-y-6">
          {grouped.map(([date, list], gi) => (
            <section key={date} className="animate-fade-in" style={{ animationDelay: `${gi * 60}ms`, animationFillMode: "both" }}>
              <div className="mb-2 flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <span className="rounded-full border border-border bg-card px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {new Date(date).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {list.map((it, i) => (
                  <li
                    key={it.link}
                    className="group flex flex-col rounded-xl border border-border bg-card p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-400/60 hover:shadow-md animate-fade-in"
                    style={{ animationDelay: `${i * 30}ms`, animationFillMode: "both" }}
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px]">{it.category}</Badge>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{it.source}</span>
                    </div>
                    <p className="mb-3 line-clamp-3 text-sm font-medium leading-snug">{it.title}</p>
                    <div className="mt-auto flex items-center gap-1.5">
                      <Button size="sm" className="h-7 gap-1 text-xs" onClick={() => openArticle(it)}>
                        <Download className="h-3 w-3" /> Read & Save PDF
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" asChild>
                        <a href={it.link} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-3 w-3" /> Open
                        </a>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm print:static print:block print:overflow-visible print:bg-white print:p-0">
          <div className="relative w-full max-w-3xl rounded-2xl border border-border bg-card shadow-2xl print:max-w-none print:rounded-none print:border-0 print:shadow-none">
            <div className="sticky top-0 z-10 flex items-center gap-2 rounded-t-2xl border-b border-border bg-card/95 px-4 py-2.5 backdrop-blur print:hidden">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs uppercase tracking-wider text-muted-foreground">{open.source}</p>
                <p className="truncate text-sm font-semibold">{articleTitle || open.title}</p>
              </div>
              <Button size="sm" onClick={saveAsPdf} disabled={!articleHtml}>
                <Download className="mr-1.5 h-3.5 w-3.5" /> Save as PDF
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setOpen(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div id="institution-print-area" className="max-h-[75vh] overflow-y-auto px-6 py-5 print:max-h-none print:overflow-visible">
              <div className="mb-4 hidden print:block">
                <h1 className="text-2xl font-bold">{articleTitle || open.title}</h1>
                <p className="mt-1 text-xs text-muted-foreground">
                  {open.source} · {new Date(open.date).toLocaleDateString()} · {open.link}
                </p>
                <hr className="my-3" />
              </div>
              {crispMut.isPending && (
                <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Crisping notes & tagging GS paper…
                </div>
              )}
              {crisp && (
                <CrispNotesView notes={crisp} />
              )}
              {crisp && !showFull && (
                <div className="mt-6 flex justify-center print:hidden">
                  <Button size="sm" variant="outline" onClick={loadFullArticle}>
                    <BookOpen className="mr-1.5 h-3.5 w-3.5" /> Load full article (optional)
                  </Button>
                </div>
              )}
              {showFull && articleMut.isPending && (
                <div className="mt-6 flex items-center gap-2 py-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Fetching full article…
                </div>
              )}
              {showFull && articleHtml && (
                <article
                  className="prose prose-sm mt-6 max-w-none border-t border-border pt-6 dark:prose-invert prose-headings:font-serif prose-a:text-primary"
                  dangerouslySetInnerHTML={{ __html: articleHtml }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Print styles: only show the article area when printing */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #institution-print-area, #institution-print-area * { visibility: visible !important; }
          #institution-print-area { position: absolute; inset: 0; padding: 24px !important; }
        }
      `}</style>
    </AppShell>
  );
}
