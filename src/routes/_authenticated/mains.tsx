import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ChevronDown, ChevronUp, Loader2, PenSquare, RefreshCw } from "lucide-react";
import { useFastApiMains, toList, type FastApiMainsQ } from "@/lib/fastapi";

export const Route = createFileRoute("/_authenticated/mains")({
  head: () => ({
    meta: [
      { title: "Mains Prep — UPSC Mitra" },
      { name: "description", content: "Daily UPSC Mains questions with hints and model answers, served live from the FastAPI backend." },
    ],
  }),
  component: MainsPage,
});

function MainsPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useFastApiMains();
  const questions = toList<FastApiMainsQ>(data);
  const [open, setOpen] = useState<Record<number, boolean>>({});

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        <header className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-md">
            <PenSquare className="h-5 w-5" />
          </span>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-2xl font-bold">Mains Prep</h1>
            <p className="text-sm text-muted-foreground">Live questions from FastAPI · /mains</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-1.5 h-3.5 w-3.5" />}
            Refresh
          </Button>
        </header>

        {isLoading && (
          <div className="grid gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-4">
                <div className="h-4 w-2/3 rounded bg-muted mb-2" />
                <div className="h-3 w-full rounded bg-muted/60" />
              </div>
            ))}
          </div>
        )}

        {isError && !isLoading && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm dark:bg-rose-950/30">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-rose-600" />
            <div className="flex-1">
              <p className="font-semibold">Backend offline</p>
              <p className="text-xs text-muted-foreground">{(error as Error)?.message ?? "Unknown error"}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              <RefreshCw className="mr-1 h-3.5 w-3.5" /> Retry
            </Button>
          </div>
        )}

        {!isLoading && !isError && questions.length === 0 && (
          <p className="text-sm text-muted-foreground">No Mains questions returned by the backend.</p>
        )}

        <ol className="grid gap-3">
          {questions.map((q, i) => {
            const text = q.question ?? q.q ?? "";
            const hints = Array.isArray(q.hints) ? q.hints : q.hints ? [q.hints] : [];
            const isOpen = open[i];
            return (
              <li key={i} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif font-semibold text-sm leading-6">Q{i + 1}. {text}</h3>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {(q.gs || q.paper) && <Badge variant="outline" className="text-[10px]">{q.gs ?? q.paper}</Badge>}
                    {(q.marks || q.word_limit) && (
                      <span className="text-[10px] text-muted-foreground">
                        {q.marks ? `${q.marks} marks` : ""}{q.marks && q.word_limit ? " · " : ""}{q.word_limit ? `${q.word_limit} words` : ""}
                      </span>
                    )}
                  </div>
                </div>
                {hints.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-xs text-muted-foreground space-y-0.5">
                    {hints.map((h, hi) => (<li key={hi}>{String(h)}</li>))}
                  </ul>
                )}
                {q.model_answer && (
                  <div className="mt-2">
                    <Button variant="ghost" size="sm" onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))}>
                      {isOpen ? <ChevronUp className="mr-1 h-3.5 w-3.5" /> : <ChevronDown className="mr-1 h-3.5 w-3.5" />}
                      {isOpen ? "Hide model answer" : "Show model answer"}
                    </Button>
                    {isOpen && (
                      <p className="mt-2 whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-xs leading-5">{q.model_answer}</p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </main>
    </AppShell>
  );
}