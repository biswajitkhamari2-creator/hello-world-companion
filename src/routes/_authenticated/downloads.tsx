import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText, Loader2, Sparkles, ExternalLink } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listDocuments } from "@/lib/documents.functions";

export const Route = createFileRoute("/_authenticated/downloads")({
  head: () => ({ meta: [{ title: "Downloads — UPSC Genius AI" }] }),
  component: DownloadsPage,
});

function DownloadsPage() {
  const list = useServerFn(listDocuments);
  const q = useQuery({ queryKey: ["downloads-docs"], queryFn: () => list() });

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
              <p className="text-sm text-muted-foreground">Aapke imported / uploaded documents. Dashboard mein khol ke notes generate ya PDF download karo.</p>
            </div>
          </div>
        </header>

        {q.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
        ) : !q.data?.length ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center animate-scale-in">
            <Sparkles className="mx-auto mb-3 h-8 w-8 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">Abhi tak koi document import nahi hua. Dashboard se PDF upload karo.</p>
            <Button className="mt-4" asChild><Link to="/dashboard">Open Dashboard</Link></Button>
          </div>
        ) : (
          <ul className="grid gap-3">
            {q.data.map((d: any, i: number) => (
              <li
                key={d.id}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md animate-fade-in"
                style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                  <FileText className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{d.title || "Untitled"}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                    {d.subject && <Badge variant="outline">{d.subject}</Badge>}
                    <span>{new Date(d.created_at).toLocaleString()}</span>
                    {d.size_bytes ? <span>· {Math.round(d.size_bytes / 1024).toLocaleString()} KB</span> : null}
                  </div>
                </div>
                {d.drive_view_link ? (
                  <Button size="sm" variant="outline" asChild>
                    <a href={d.drive_view_link} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Drive
                    </a>
                  </Button>
                ) : null}
                <Button size="sm" asChild>
                  <Link to="/dashboard" search={{ doc: d.id } as any}>
                    Open
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </AppShell>
  );
}