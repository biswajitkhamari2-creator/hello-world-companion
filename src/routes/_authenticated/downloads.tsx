import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Download, FileText, Loader2, Sparkles, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listDocuments, deleteDocument } from "@/lib/documents.functions";

export const Route = createFileRoute("/_authenticated/downloads")({
  head: () => ({ meta: [{ title: "Downloads — UPSC Genius AI" }] }),
  component: DownloadsPage,
});

function DownloadsPage() {
  const list = useServerFn(listDocuments);
  const del = useServerFn(deleteDocument);
  const qc = useQueryClient();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const q = useQuery({ queryKey: ["downloads-docs"], queryFn: () => list() });

  const mDelete = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("Document deleted");
      setConfirmId(null);
      qc.invalidateQueries({ queryKey: ["downloads-docs"] });
      qc.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (e: any) => toast.error(e?.message || "Delete failed"),
  });

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
                className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md animate-fade-in sm:flex-row sm:items-center"
                style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
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
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
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
                {confirmId === d.id ? (
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={mDelete.isPending}
                      onClick={() => mDelete.mutate(d.id)}
                    >
                      {mDelete.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Confirm"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmId(null)} disabled={mDelete.isPending}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    onClick={() => setConfirmId(d.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5 sm:mr-0 mr-1.5" />
                    <span className="sm:hidden">Delete</span>
                  </Button>
                )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </AppShell>
  );
}