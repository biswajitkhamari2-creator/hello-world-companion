import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Image as ImageIcon, Link as LinkIcon, Inbox, Loader2, Download, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { listInbox, importInboxItem, type InboxItem } from "@/lib/telegram-inbox.functions";
import { extractDocument } from "@/lib/documents.functions";

export function TelegramInbox({ onImported }: { onImported?: (documentId: string) => void }) {
  const list = useServerFn(listInbox);
  const importer = useServerFn(importInboxItem);
  const extract = useServerFn(extractDocument);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["telegram-inbox"], queryFn: () => list() as Promise<InboxItem[]>, refetchInterval: 20_000 });

  const m = useMutation({
    mutationFn: (itemId: string) => importer({ data: { itemId } }),
    onSuccess: (r, itemId) => {
      const item = q.data?.find((x) => x.id === itemId);
      const isPdf = item?.kind === "pdf";
      if (typeof window !== "undefined") {
        sessionStorage.setItem("active_doc_id", r.documentId);
        if (isPdf) sessionStorage.setItem("auto_run_newspaper", r.documentId);
      }
      toast.success(isPdf ? "Imported — extracting & analysing as newspaper…" : "Imported to your dashboard");
      qc.invalidateQueries({ queryKey: ["documents"] });
      onImported?.(r.documentId);
      // Kick off extraction so the document becomes ready; DocCard will then auto-run "newspaper".
      extract({ data: { documentId: r.documentId } })
        .then(() => qc.invalidateQueries({ queryKey: ["documents"] }))
        .catch((e) => toast.error((e as Error).message || "Extraction failed"));
    },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <section className="rounded-xl border border-indigo-100 bg-white/70 p-4 shadow-sm">
      <header className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Inbox className="h-5 w-5 text-indigo-700" />
          <h2 className="font-serif text-lg text-indigo-900">Telegram Inbox</h2>
          <Badge variant="secondary" className="ml-1">Sidheswar Civil Mentor</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={() => q.refetch()} disabled={q.isFetching}>
          <RefreshCw className={`h-4 w-4 ${q.isFetching ? "animate-spin" : ""}`} />
        </Button>
      </header>

      {q.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
      ) : !q.data?.length ? (
        <p className="text-sm text-muted-foreground">No posts yet. Add the bot as an admin to your channel and post a PDF, image, or link — items will appear here automatically.</p>
      ) : (
        <ul className="divide-y divide-indigo-50">
          {q.data.map((it) => (
            <li key={it.id} className="py-3 flex items-start gap-3">
              <div className="shrink-0 mt-1">
                {it.kind === "pdf" ? <FileText className="h-5 w-5 text-rose-600" /> :
                 it.kind === "image" ? <ImageIcon className="h-5 w-5 text-emerald-600" /> :
                 <LinkIcon className="h-5 w-5 text-sky-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm truncate">{it.file_name || it.source_url || it.caption?.slice(0, 60) || "Untitled"}</span>
                  <Badge variant="outline" className="uppercase text-[10px]">{it.kind}</Badge>
                </div>
                {it.caption && it.file_name && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{it.caption}</p>}
                <p className="text-[11px] text-muted-foreground mt-1">{new Date(it.posted_at).toLocaleString()}</p>
              </div>
              <div className="shrink-0 flex gap-1">
                {it.kind === "link" && it.source_url ? (
                  <Button asChild size="sm" variant="outline">
                    <a href={it.source_url} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5 mr-1" />Open</a>
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => m.mutate(it.id)} disabled={m.isPending}>
                    <Download className="h-3.5 w-3.5 mr-1" />Import
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
