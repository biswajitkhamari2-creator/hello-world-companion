import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Download, FileText, Loader2, Sparkles, ExternalLink, Trash2, HardDrive, Cloud, CloudUpload } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listDocuments, deleteDocument } from "@/lib/documents.functions";
import {
  listDownloads,
  deleteDownload,
  clearDownloads,
  getDownloadBlob,
  redownload,
  onDownloadsUpdated,
  formatSize,
  updateDownloadMeta,
  type StoredDownloadRecord,
} from "@/lib/downloads-store";
import { deleteDriveDownload, listDriveDownloads, saveGeneratedDownloadToDrive } from "@/lib/downloads.functions";

export const Route = createFileRoute("/_authenticated/downloads")({
  head: () => ({ meta: [{ title: "Downloads — UPSC Genius AI" }] }),
  component: DownloadsPage,
});

function useLocalDownloads() {
  const [rows, setRows] = useState<StoredDownloadRecord[] | null>(null);
  useEffect(() => {
    let alive = true;
    const load = () => listDownloads().then((r) => alive && setRows(r));
    load();
    const off = onDownloadsUpdated(load);
    return () => {
      alive = false;
      off();
    };
  }, []);
  return { rows, reload: () => listDownloads().then(setRows) };
}

function KindBadge({ kind }: { kind: StoredDownloadRecord["kind"] }) {
  const map: Record<string, string> = {
    pdf: "from-rose-500 to-orange-500",
    notes: "from-sky-500 to-indigo-500",
    editorial: "from-amber-500 to-fuchsia-500",
    report: "from-emerald-500 to-teal-500",
    data: "from-slate-500 to-slate-700",
    image: "from-pink-500 to-purple-500",
    other: "from-slate-400 to-slate-600",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white ${map[kind] ?? map.other}`}>
      {kind}
    </span>
  );
}

function DownloadsPage() {
  const list = useServerFn(listDocuments);
  const del = useServerFn(deleteDocument);
  const listDrive = useServerFn(listDriveDownloads);
  const delDrive = useServerFn(deleteDriveDownload);
  const saveDrive = useServerFn(saveGeneratedDownloadToDrive);
  const qc = useQueryClient();
  const [confirmDocId, setConfirmDocId] = useState<string | null>(null);
  const [confirmDriveId, setConfirmDriveId] = useState<string | null>(null);
  const [confirmLocalId, setConfirmLocalId] = useState<string | null>(null);
  const [savingDriveId, setSavingDriveId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  const local = useLocalDownloads();
  const q = useQuery({ queryKey: ["downloads-docs"], queryFn: () => list() });
  const driveQ = useQuery({ queryKey: ["drive-downloads"], queryFn: () => listDrive() });

  const mDelete = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("Document deleted");
      setConfirmDocId(null);
      qc.invalidateQueries({ queryKey: ["downloads-docs"] });
      qc.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (e: any) => toast.error(e?.message || "Delete failed"),
  });

  const mDeleteDrive = useMutation({
    mutationFn: (id: string) => delDrive({ data: { id } }),
    onSuccess: () => {
      toast.success("Drive download deleted");
      setConfirmDriveId(null);
      qc.invalidateQueries({ queryKey: ["drive-downloads"] });
    },
    onError: (e: any) => toast.error(e?.message || "Delete failed"),
  });

  const saveLocalToDrive = async (r: StoredDownloadRecord) => {
    try {
      setSavingDriveId(r.id);
      const blob = await getDownloadBlob(r.id);
      if (!blob) throw new Error("Local file not found. Please download it again once.");
      const fd = new FormData();
      fd.set("file", blob, r.name || "download");
      fd.set("source", r.source || "downloads-page");
      fd.set("kind", r.kind || "other");
      const saved = await saveDrive({ data: fd } as any);
      await updateDownloadMeta(r.id, {
        driveDocumentId: saved.documentId,
        driveFileId: saved.driveFileId,
        driveViewLink: saved.driveViewLink,
        driveSavedAt: Date.now(),
      });
      await local.reload();
      qc.invalidateQueries({ queryKey: ["drive-downloads"] });
      toast.success("Saved directly to Google Drive");
    } catch (e: any) {
      toast.error(e?.message || "Drive save failed");
    } finally {
      setSavingDriveId(null);
    }
  };

  const totalSize = (local.rows ?? []).reduce((n, r) => n + r.size, 0);

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
              <p className="text-sm text-muted-foreground">
                Every PDF / notes / report is saved to this page and copied to your Google Drive.
              </p>
            </div>
          </div>
        </header>

        {/* Google Drive saved downloads */}
        <section className="mb-10">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4 text-sky-600" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Saved to Google Drive
              </h2>
              {driveQ.data && (
                <Badge variant="outline" className="text-[10px]">
                  {driveQ.data.length} file{driveQ.data.length === 1 ? "" : "s"}
                </Badge>
              )}
            </div>
          </div>

          {driveQ.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading Drive downloads…
            </div>
          ) : !driveQ.data?.length ? (
            <div className="rounded-xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
              New downloads are now copied to Google Drive automatically. For old local files, use “Save to Drive” below.
            </div>
          ) : (
            <ul className="grid gap-2.5">
              {driveQ.data.map((d: any, i: number) => (
                <li
                  key={d.id}
                  className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md animate-fade-in sm:flex-row sm:items-center"
                  style={{ animationDelay: `${i * 30}ms`, animationFillMode: "both" }}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500 text-white">
                      <Cloud className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{d.file_name || d.title || "Download"}</p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Badge variant="outline" className="text-[10px]">Drive</Badge>
                        <span>{new Date(d.created_at).toLocaleString()}</span>
                        {d.size_bytes ? <span>· {formatSize(Number(d.size_bytes))}</span> : null}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {d.drive_view_link ? (
                      <Button size="sm" asChild>
                        <a href={d.drive_view_link} target="_blank" rel="noreferrer">
                          <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Open Drive
                        </a>
                      </Button>
                    ) : null}
                    {confirmDriveId === d.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={mDeleteDrive.isPending}
                          onClick={() => mDeleteDrive.mutate(d.id)}
                        >
                          {mDeleteDrive.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Confirm"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setConfirmDriveId(null)} disabled={mDeleteDrive.isPending}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        onClick={() => setConfirmDriveId(d.id)}
                        title="Delete from Drive downloads"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Saved downloads (local, persistent) */}
        <section className="mb-10">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Local browser cache
              </h2>
              {local.rows && (
                <Badge variant="outline" className="text-[10px]">
                  {local.rows.length} file{local.rows.length === 1 ? "" : "s"} · {formatSize(totalSize)}
                </Badge>
              )}
            </div>
            {local.rows && local.rows.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                disabled={clearing}
                onClick={async () => {
                  if (!confirm("Delete ALL saved downloads?")) return;
                  setClearing(true);
                  await clearDownloads();
                  setClearing(false);
                  toast.success("All downloads cleared");
                }}
              >
                {clearing ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Trash2 className="mr-1.5 h-3.5 w-3.5" />}
                Clear all
              </Button>
            )}
          </div>

          {local.rows === null ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : local.rows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No local downloads yet. Anything you download from the app — PDFs, notes, editorial extracts — will appear here.
            </div>
          ) : (
            <ul className="grid gap-2.5">
              {local.rows.map((r, i) => (
                <li
                  key={r.id}
                  className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md animate-fade-in sm:flex-row sm:items-center"
                  style={{ animationDelay: `${i * 30}ms`, animationFillMode: "both" }}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{r.name}</p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                        <KindBadge kind={r.kind} />
                        {r.source && <Badge variant="outline" className="text-[10px]">{r.source}</Badge>}
                        <span>{new Date(r.created_at).toLocaleString()}</span>
                        <span>· {formatSize(r.size)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {(r.meta as any)?.driveViewLink ? (
                      <Button size="sm" variant="outline" asChild>
                        <a href={(r.meta as any).driveViewLink} target="_blank" rel="noreferrer">
                          <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Drive
                        </a>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={savingDriveId === r.id}
                        onClick={() => saveLocalToDrive(r)}
                      >
                        {savingDriveId === r.id ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <CloudUpload className="mr-1.5 h-3.5 w-3.5" />}
                        Save to Drive
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => redownload(r.id).catch((e) => toast.error(e?.message || "Failed"))}
                    >
                      <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                    </Button>
                    {confirmLocalId === r.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            await deleteDownload(r.id);
                            setConfirmLocalId(null);
                            toast.success("Removed");
                          }}
                        >
                          Confirm
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setConfirmLocalId(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        onClick={() => setConfirmLocalId(r.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Imported documents (server) */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-teal-600" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Imported documents
            </h2>
          </div>

          {q.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : !q.data?.length ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center animate-scale-in">
              <Sparkles className="mx-auto mb-3 h-8 w-8 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">
                No documents imported yet. Upload a PDF from the Dashboard.
              </p>
              <Button className="mt-4" asChild>
                <Link to="/dashboard">Open Dashboard</Link>
              </Button>
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
                    {confirmDocId === d.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={mDelete.isPending}
                          onClick={() => mDelete.mutate(d.id)}
                        >
                          {mDelete.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Confirm"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setConfirmDocId(null)} disabled={mDelete.isPending}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        onClick={() => setConfirmDocId(d.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </AppShell>
  );
}
