import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText, Loader2, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listGenerations, OUTPUT_LABELS, type OutputType } from "@/lib/generations.functions";
import { downloadPreviewAsPdf } from "@/lib/preview-pdf";

export const Route = createFileRoute("/_authenticated/downloads")({
  head: () => ({ meta: [{ title: "Downloads — UPSC Genius AI" }] }),
  component: DownloadsPage,
});

function DownloadsPage() {
  const list = useServerFn(listGenerations);
  const q = useQuery({ queryKey: ["downloads-all"], queryFn: () => list({ data: {} }) });

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        <header className="mb-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-md">
              <Download className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-serif text-2xl font-bold">Downloads</h1>
              <p className="text-sm text-muted-foreground">Sab imported / generated notes ek jagah — click karke PDF download karo.</p>
            </div>
          </div>
        </header>

        {q.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
        ) : !q.data?.length ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center animate-scale-in">
            <Sparkles className="mx-auto mb-3 h-8 w-8 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">Abhi tak koi generated note nahi hai. Dashboard se PDF upload karke notes generate karo.</p>
          </div>
        ) : (
          <ul className="grid gap-3">
            {q.data.map((g: any, i: number) => (
              <li
                key={g.id}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md animate-fade-in"
                style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                  <FileText className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{g.title || "Untitled"}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Badge variant="outline" className="border-indigo-300 bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40">
                      {OUTPUT_LABELS[g.output_type as OutputType] || g.output_type}
                    </Badge>
                    <span>{new Date(g.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="opacity-90 group-hover:opacity-100"
                  onClick={() => downloadPreviewAsPdf({
                    generationId: g.id,
                    title: g.title || "note",
                    outputType: g.output_type as OutputType,
                    content: g.content,
                  })}
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                </Button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </AppShell>
  );
}