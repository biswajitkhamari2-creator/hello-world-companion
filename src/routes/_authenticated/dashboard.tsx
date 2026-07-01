import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { BookOpen, Download, FileText, Loader2, Newspaper, Sparkles, Trash2, Upload, LayoutDashboard, History, ChevronDown, ChevronUp, Eye, FileCheck2, X, RefreshCw, FolderSync, Info } from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  listDocuments,
  createUploadSession,
  finalizeUpload,
  completeUploadFinalChunk,
  extractDocument,
  deleteDocument,
  uploadDocument,
  syncFromDrive,
} from "@/lib/documents.functions";
import { uploadFileResumable } from "@/lib/drive-upload";
import {
  generateOutput,
  planGeneration,
  processChunk,
  finalizeGeneration,
  listGenerations,
  deleteGeneration,
  OUTPUT_LABELS,
  OUTPUT_TYPES,
  type OutputType,
} from "@/lib/generations.functions";

import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { FinalChecker } from "@/components/final-checker";
import { StampLogoButton } from "@/components/stamp-logo";
import { ProcessingOptionsButton, useProcessingPrefs } from "@/components/processing-options";
import { prefsToOptions } from "@/lib/processing-prefs";
import { BrandMark } from "@/components/brand-mark";
import { NewspaperIssue } from "@/components/newspaper-issue";
import { TelegramInbox } from "@/components/telegram-inbox";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — UPSC Mitra" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setUserEmail(data.session?.user.email ?? null);
      setCheckedAuth(true);
    })();
  }, [navigate]);

  const list = useServerFn(listDocuments);
  const [activeDocId, setActiveDocId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("active_doc_id");
  });
  const docsQ = useQuery({
    queryKey: ["documents", activeDocId],
    queryFn: async () => {
      const all = (await list()) as any[];
      if (!activeDocId) return [];
      return (all || []).filter((d) => d.id === activeDocId);
    },
    enabled: checkedAuth && Boolean(activeDocId),
    refetchInterval: (q) => {
      const rows = (q.state.data as any[]) || [];
      return rows.some((d) => d.status === "processing" || d.status === "uploaded") ? 3000 : false;
    },
  });


  const startUploadSession = useServerFn(createUploadSession);
  const finalize = useServerFn(finalizeUpload);
  const completeFinalChunk = useServerFn(completeUploadFinalChunk);
  const syncDrive = useServerFn(syncFromDrive);
  const [syncing, setSyncing] = useState(false);
  const [showDriveAccessInfo, setShowDriveAccessInfo] = useState(false);

  async function onSyncFromDrive() {
    if (syncing) return;
    setSyncing(true);
    try {
      const res = (await syncDrive()) as { imported: number; alreadyPresent: number; scanned: number };
      if (res.imported > 0) {
        toast.success(`Imported ${res.imported} file${res.imported === 1 ? "" : "s"} from Drive`);
        await qc.invalidateQueries({ queryKey: ["documents"] });
        await qc.invalidateQueries({ queryKey: ["all-documents"] });
      } else {
        toast.message(`No new files. ${res.scanned} already in your library.`);
      }
    } catch (e: any) {
      toast.error(e?.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  }
  const uploadSmall = useServerFn(uploadDocument);
  const extract = useServerFn(extractDocument);
  const del = useServerFn(deleteDocument);

  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // 0..100

  async function clearActive(opts: { silent?: boolean } = {}) {
    const prevId = typeof window !== "undefined" ? sessionStorage.getItem("active_doc_id") : null;
    console.log("[ActivePDF] Clearing previous document", { previousDocumentId: prevId });

    // Optimistic: drop session + caches IMMEDIATELY so the UI clears on click,
    // even if the backend delete is slow or fails.
    try {
      sessionStorage.removeItem("active_doc_id");
      sessionStorage.removeItem("session_doc_ids");
    } catch {}
    setActiveDocId(null);
    qc.removeQueries({ queryKey: ["documents"] });
    qc.removeQueries({ queryKey: ["generations"] });
    qc.setQueryData(["documents", prevId], []);
    if (!opts.silent) toast.success("Cleared current PDF — releasing storage…");

    // Best-effort backend delete in the background.
    if (prevId) {
      del({ data: { id: prevId } })
        .then(() => console.log("[ActivePDF] Backend cache + storage released", { previousDocumentId: prevId }))
        .catch((e) => console.warn("[ActivePDF] Failed to delete previous doc (ignored)", e));
    }
    console.log("[ActivePDF] Cache cleared. No active document.");
  }


  async function onPick(file: File) {
    setUploading(true);
    setUploadProgress(0);
    try {
      const prevId = typeof window !== "undefined" ? sessionStorage.getItem("active_doc_id") : null;
      console.log("[ActivePDF] New upload starting", { previousDocumentId: prevId, fileName: file.name });

      // Deactivate + release previous document fully before loading the new one.
      if (prevId) {
        try {
          await del({ data: { id: prevId } });
          console.log("[ActivePDF] Previous document deleted from backend", { previousDocumentId: prevId });
        } catch (e) {
          console.warn("[ActivePDF] Could not delete previous doc", e);
        }
      }
      try {
        sessionStorage.removeItem("active_doc_id");
        sessionStorage.removeItem("session_doc_ids");
      } catch {}
      setActiveDocId(null);
      qc.removeQueries({ queryKey: ["documents"] });
      qc.removeQueries({ queryKey: ["generations"] });

      const { data: sess } = await supabase.auth.getSession();
      const userId = sess.session?.user.id;
      if (!userId) throw new Error("Not signed in");

      // Small files (≤90 MB) go through the server in a single request — avoids
      // browser→googleapis.com CORS issues seen with direct resumable PUTs.
      // Larger files use direct-to-Drive resumable upload to bypass body-size limits.
      const mime = file.type || "application/pdf";
      // Vercel serverless functions cap request bodies at ~4.5 MB.
      // Anything above ~4 MB must go through the direct-to-Drive resumable path.
      const SMALL_MAX = 4 * 1024 * 1024;
      let row: any;
      if (file.size <= SMALL_MAX) {
        const fd = new FormData();
        fd.set("file", file);
        fd.set("title", file.name);
        setUploadProgress(10);
        row = await uploadSmall({ data: fd });
        setUploadProgress(100);
        console.log("[Drive] Server-side upload complete", { id: row?.id });
      } else {
        const session = await startUploadSession({
          data: { fileName: file.name, mime, size: file.size, title: file.name },
        });
        console.log("[Drive] Resumable session created", { documentId: session.documentId });
        let completedRow: any = null;
        const { driveFileId } = await uploadFileResumable({
          file,
          uploadUrl: session.uploadUrl,
          onProgress: (loaded, total) => {
            setUploadProgress(total ? Math.round((loaded / total) * 100) : 0);
          },
          uploadFinalChunk: async ({ blob, start, end, total }) => {
            const fd = new FormData();
            fd.set("documentId", session.documentId);
            fd.set("uploadUrl", session.uploadUrl);
            fd.set("start", String(start));
            fd.set("end", String(end));
            fd.set("total", String(total));
            fd.set("chunk", new File([blob], file.name, { type: mime }));
            completedRow = await completeFinalChunk({ data: fd });
            setUploadProgress(100);
            return { driveFileId: completedRow?.drive_file_id ?? null };
          },
        });
        console.log("[Drive] Upload complete", { driveFileId, recoveredByServer: !driveFileId });
        row = completedRow ?? await finalize({ data: { documentId: session.documentId, driveFileId } });
        console.log("[Drive] Finalised", { driveFileId: row?.drive_file_id, viewLink: row?.drive_view_link });
      }
      try {
        sessionStorage.setItem("active_doc_id", row.id);
      } catch {}
      setActiveDocId(row.id);
      console.log("[ActivePDF] New active document loaded", {
        previousDocumentId: prevId,
        newDocumentId: row.id,
        fileName: file.name,
        cacheCleared: true,
        embeddingsRebuilt: true,
      });
      toast.success("New PDF active — extracting…");
      qc.invalidateQueries({ queryKey: ["documents", row.id] });

      extract({ data: { documentId: row.id } })
        .then((res: any) => {
          console.log("[ActivePDF] Extraction complete", { activeDocumentId: row.id });
          if (res?.ok === false) {
            toast.error(res?.message || "Extraction failed. Please re-upload the document.");
          }
          qc.invalidateQueries({ queryKey: ["documents", row.id] });
        })
        .catch((e) => toast.error(e?.message || "Extraction failed"));
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const deleteMut = useMutation({
    mutationFn: async (id: string) => del({ data: { id } }),
    onSuccess: () => {
      try { sessionStorage.removeItem("active_doc_id"); } catch {}
      setActiveDocId(null);
      qc.removeQueries({ queryKey: ["generations"] });
      toast.success("Deleted");
      qc.removeQueries({ queryKey: ["documents"] });
    },
    onError: (e: any) => toast.error(e?.message || "Delete failed"),
  });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  const docs = (docsQ.data as any[]) || [];
  const activeDoc = docs[0] ?? null;

  return (
    <AppShell><div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-paper/80 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
          <Link to="/" aria-label="UPSC Mitra — home" className="min-w-0">
            <BrandMark />
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-1.5 sm:gap-2 text-sm">
            <Button asChild size="sm" variant="outline" className="gap-1.5">
              <Link to="/mentor" aria-label="AI Mentor chat">
                <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
                <span className="hidden sm:inline">AI Mentor</span>
              </Link>
            </Button>
            <ProcessingOptionsButton />
            <StampLogoButton />
            <Link to="/" className="hidden rounded-md px-2 py-1 text-muted-foreground hover:text-foreground sm:inline">Home</Link>
          </nav>
        </div>
      </header>

      {activeDoc && (
        <div className="border-b border-accent/30 bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5">
          <div className="mx-auto grid max-w-6xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-4 py-2 text-sm sm:px-6">
            <FileCheck2 className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            <div className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 font-semibold">Active:</span>
              <span className="truncate font-serif">{activeDoc.title}</span>
            </div>
            <Badge variant="outline" className="capitalize">{activeDoc.status}</Badge>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="min-w-0 w-full sm:w-auto">
            <h1 className="truncate font-serif text-2xl font-semibold sm:text-3xl">Your study library</h1>
            <p className="text-sm text-muted-foreground">One active PDF at a time. Uploading a new file replaces the previous one.</p>
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onPick(f);
              }}
            />
            <Button asChild variant="outline" className="min-h-11 shrink-0 border-rose-300 text-rose-700 hover:bg-rose-50">
              <Link to="/inbox">📅 Pick newspaper date</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onSyncFromDrive}
              disabled={syncing || uploading}
              className="min-h-11 shrink-0"
              title="Scan your Google Drive folder for files not yet in your library"
            >
              {syncing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <FolderSync className="mr-2 h-4 w-4" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">{syncing ? "Syncing…" : "Sync from Drive"}</span>
              <span className="sm:hidden">{syncing ? "…" : "Sync"}</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowDriveAccessInfo(true)}
              className="min-h-11 shrink-0"
              title="Why don't I see my manually-uploaded Drive files?"
              aria-label="Drive access info"
            >
              <Info className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="min-h-11 shrink-0">
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <Upload className="mr-2 h-4 w-4" aria-hidden="true" />}
              <span className="hidden sm:inline">
                {uploading ? `Uploading… ${uploadProgress}%` : activeDoc ? "Replace PDF" : "Upload material"}
              </span>
              <span className="sm:hidden">
                {uploading ? `${uploadProgress}%` : activeDoc ? "Replace" : "Upload"}
              </span>
            </Button>
          </div>
          {uploading && (
            <div className="mt-3">
              <Progress value={uploadProgress} className="h-2" />
              <p className="mt-1 text-xs text-muted-foreground">
                Uploading directly to Google Drive — {uploadProgress}% complete. Resumes automatically on network drops.
              </p>
            </div>
          )}

        </div>


        <div className="mt-6">
          <TelegramInbox onImported={(id) => setActiveDocId(id)} />
        </div>



        {activeDoc && (
          <ActivePdfPanel doc={activeDoc} onClear={() => clearActive()} />
        )}

        <div className="mt-6 grid gap-4">
          {docsQ.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!docsQ.isLoading && !activeDoc && (
            <div className="rounded-xl border border-dashed border-border bg-paper p-10 text-center">
              <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
              <h3 className="mt-3 font-serif text-lg">No active document</h3>
              <p className="text-sm text-muted-foreground">Upload a PDF, DOCX, or text file to begin.</p>
            </div>
          )}
          {activeDoc && (
            <DocCard key={activeDoc.id} doc={activeDoc} onDelete={() => deleteMut.mutate(activeDoc.id)} />
          )}
        </div>
      </main>
    </div>
    <Dialog open={showDriveAccessInfo} onOpenChange={setShowDriveAccessInfo}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>About "Sync from Drive"</DialogTitle>
          <DialogDescription>
            Why some Drive files don't appear, and how to expand access.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Current access:</strong> the app uses Google's
            <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">drive.file</code>
            scope — it can only see files the app itself created (uploads through this
            dashboard or the Telegram bot).
          </p>
          <p>
            <strong className="text-foreground">What "Sync from Drive" does:</strong> scans
            your <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">UPSC-Genius-AI/&lt;your-id&gt;/</code>
            folder and imports any app-created files that aren't yet in your library.
          </p>
          <p>
            <strong className="text-foreground">PDFs you dropped manually</strong> into Drive
            via drive.google.com will <em>not</em> appear — Google blocks the app from seeing
            them at the OAuth level.
          </p>
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900">
            <p className="font-medium">Want full Drive read access?</p>
            <p className="mt-1 text-xs">
              Open <strong>Lovable → Connectors → Google Drive</strong>, disconnect, and
              reconnect choosing the <code>drive.readonly</code> scope. After that, "Sync
              from Drive" can pull in PDFs you uploaded manually anywhere in your Drive.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDriveAccessInfo(false)}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </AppShell>
  );
}

function ActivePdfPanel({ doc, onClear }: { doc: any; onClear: () => void }) {
  const uploaded = new Date(doc.created_at).toLocaleString();
  const sizeKb = doc.size_bytes ? Math.round(doc.size_bytes / 1024) : null;
  const charCount = typeof doc.extracted_text === "string" ? doc.extracted_text.length : null;
  return (
    <section className="mt-6 rounded-xl border-2 border-accent/40 bg-gradient-to-br from-accent/5 to-primary/5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileCheck2 className="h-5 w-5 text-accent" />
          <h2 className="font-serif text-lg font-semibold">Current Active PDF</h2>
          <Badge className="capitalize">{doc.status}</Badge>
        </div>
        <Button size="sm" variant="outline" onClick={onClear}>
          <X className="mr-1.5 h-3.5 w-3.5" /> Clear Current PDF
        </Button>
      </div>
      <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <Field label="File Name" value={doc.title} />
        <Field label="Upload Time" value={uploaded} />
        <Field label="Document ID" value={doc.id} mono />
        <Field label="Status" value={doc.status} />
        {sizeKb !== null && <Field label="Size" value={`${sizeKb.toLocaleString()} KB`} />}
        {charCount !== null && <Field label="Extracted Chars" value={charCount.toLocaleString()} />}
      </dl>
    </section>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className={`truncate ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}

function ReprocessButton({
  docId,
  variant = "outline",
  label = "Reprocess (OCR)",
}: {
  docId: string;
  variant?: "outline" | "ghost" | "default" | "secondary";
  label?: string;
}) {
  const qc = useQueryClient();
  const extract = useServerFn(extractDocument);
  const [busy, setBusy] = useState(false);
  return (
    <Button
      size="sm"
      variant={variant}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        // Optimistically flip to processing so the spinner shows immediately.
        qc.setQueryData(["documents", docId], (rows: any) =>
          Array.isArray(rows) ? rows.map((r: any) => (r.id === docId ? { ...r, status: "processing", error_message: null } : r)) : rows,
        );
        try {
          const res: any = await extract({ data: { documentId: docId } });
          if (res?.ok === false) {
            toast.error(res?.message || "Still no readable text found in this file.");
          } else {
            toast.success("Reprocessed — extraction complete.");
          }
        } catch (e: any) {
          toast.error(e?.message || "Reprocess failed");
        } finally {
          setBusy(false);
          qc.invalidateQueries({ queryKey: ["documents"] });
        }
      }}
    >
      {busy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-1.5 h-3.5 w-3.5" />}
      {busy ? "Reprocessing…" : label}
    </Button>
  );
}


function DocCard({ doc, onDelete }: { doc: any; onDelete: () => void }) {
  const qc = useQueryClient();
  const prefs = useProcessingPrefs();
  const gen = useServerFn(generateOutput);
  const planFn = useServerFn(planGeneration);
  const chunkFn = useServerFn(processChunk);
  const finalizeFn = useServerFn(finalizeGeneration);
  const [pending, setPending] = useState<OutputType | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});
  const [progress, setProgress] = useState<{ done: number; total: number; failed: number; retrying: number } | null>(null);
  const autoRanRef = useRef<string | null>(null);

  // Auto-run a requested output (set by Telegram Inbox import) once the doc is ready.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const legacy = sessionStorage.getItem("auto_run_newspaper");
    const typed = sessionStorage.getItem("auto_run_type");
    const docFlag = sessionStorage.getItem("auto_run_doc");
    let requested: OutputType | null = null;
    if (legacy && legacy === doc.id) requested = "newspaper";
    else if (typed && docFlag === doc.id && (OUTPUT_TYPES as readonly string[]).includes(typed)) requested = typed as OutputType;
    if (!requested) return;
    if (doc.status !== "ready") return;
    if (pending !== null) return;
    if (autoRanRef.current === doc.id + ":" + requested) return;
    autoRanRef.current = doc.id + ":" + requested;
    sessionStorage.removeItem("auto_run_newspaper");
    sessionStorage.removeItem("auto_run_type");
    sessionStorage.removeItem("auto_run_doc");
    toast.info(`Starting ${OUTPUT_LABELS[requested].label}…`);
    void run(requested);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc.id, doc.status, pending]);

  function handleStaleDocError(e: unknown): boolean {
    const msg = String((e as any)?.message || e || "");
    if (/Document not found|not ready/i.test(msg)) {
      try { sessionStorage.removeItem("active_doc_id"); } catch {}
      qc.removeQueries({ queryKey: ["documents"] });
      qc.removeQueries({ queryKey: ["generations"] });
      qc.invalidateQueries({ queryKey: ["documents"] });
      toast.error("That PDF is no longer available. Please upload it again.");
      console.warn("[ActivePDF] Stale document cleared after generation error", { msg });
      return true;
    }
    return false;
  }

  async function runChunked(type: OutputType) {
    // Any ready doc from the library can be (re)generated. Promote it to
    // "active" so downstream helpers that read active_doc_id keep working.
    try { sessionStorage.setItem("active_doc_id", doc.id); } catch {}
    console.log("[ActivePDF] AI query starting", { activeDocumentId: doc.id, outputType: type });

    setPending(type);
    setProgress({ done: 0, total: 0, failed: 0, retrying: 0 });
    try {
      const options = prefsToOptions(prefs);
      const { totalChunks, recommendedConcurrency, minGapMs, chunkSize } = await planFn({ data: { documentId: doc.id, outputType: type } } as any);

      setProgress({ done: 0, total: totalChunks, failed: 0, retrying: 0 });
      const parts: any[] = new Array(totalChunks).fill(null);
      const MAX_RETRIES = 5;
      // Server returns AI-provider-safe pacing. Groq free TPM needs serialized calls.
      const CONCURRENCY = Math.max(1, Number(recommendedConcurrency || 1));
      // Respect the server's pacing but don't floor it — NVIDIA/Gemini support sub-second gaps.
      const MIN_GAP_MS = Math.max(0, Number(minGapMs || 0));
      let lastStartedAt = 0;

      let aborted: string | null = null;

      async function attempt(i: number): Promise<void> {
        for (let retry = 0; retry <= MAX_RETRIES; retry++) {
          if (aborted) {
            setProgress((p) => p && { ...p, failed: p.failed + 1, retrying: Math.max(0, p.retrying - 1) });
            return;
          }
          try {
            // Pace requests to stay under Gemini free-tier RPM cap.
            const gap = Date.now() - lastStartedAt;
            if (gap < MIN_GAP_MS) await new Promise((r) => setTimeout(r, MIN_GAP_MS - gap));
            lastStartedAt = Date.now();
            const chunkResult = await chunkFn({ data: { documentId: doc.id, outputType: type, chunkIndex: i, chunkSize, options } } as any);
            if (chunkResult?.retryable) {
              throw new Error(`${chunkResult.reason || "AI is busy. Retrying…"} __retry_after_ms=${chunkResult.retryAfterMs || 65000}`);
            }
            const { part } = chunkResult;
            parts[i] = part;
            setProgress((p) => p && { ...p, done: p.done + 1, retrying: retry > 0 ? Math.max(0, p.retrying - 1) : p.retrying });
            return;
          } catch (e: any) {
            const msg = String(e?.message || e);
            // Hard, non-retriable failures → abort the whole run immediately.
            if (/Payment Required|402|insufficient|credits|unauthorized|401|forbidden|403/i.test(msg)) {
              aborted = /Payment Required|402|insufficient|credits/i.test(msg)
                ? "AI credits are exhausted for this workspace. Add credits or retry after credits are available."
                : "AI runtime authorization failed. Please retry after the server refreshes.";
              setProgress((p) => p && { ...p, failed: p.failed + 1, retrying: Math.max(0, p.retrying - 1) });
              return;
            }
            if (retry === MAX_RETRIES) {
              console.warn(`chunk ${i} permanently failed`, msg.slice(0, 200));
              setProgress((p) => p && { ...p, failed: p.failed + 1, retrying: Math.max(0, p.retrying - 1) });
              return;
            }
            // Longer back-off on 429 since Gemini free is 10 RPM: 15s, 30s, 60s, 60s.
            const isRate = /429|Too Many Requests|rate limit|quota/i.test(msg);
            const base = isRate ? 15000 : 2000;
            const serverRetryAfter = Number(msg.match(/__retry_after_ms=(\d+)/)?.[1] || 0);
            const delay = serverRetryAfter || Math.min(base * Math.pow(2, retry), 60000) + Math.floor(Math.random() * 1500);
            if (retry === 0) setProgress((p) => p && { ...p, retrying: p.retrying + 1 });
            if (isRate) toast.info(`AI is busy — waiting ${Math.ceil(delay / 1000)}s, then continuing automatically.`);
            await new Promise((r) => setTimeout(r, delay));
          }
        }
      }

      // Parallel pool — Lovable AI Gateway handles small concurrency without 429s.
      let next = 0;
      const workers = Array.from({ length: Math.min(CONCURRENCY, totalChunks) }, async () => {
        while (true) {
          if (aborted) return;
          const i = next++;
          if (i >= totalChunks) return;
          await attempt(i);
        }
      });
      await Promise.all(workers);

      if (aborted) throw new Error(aborted);
      const valid = parts.filter(Boolean);
      if (!valid.length) throw new Error("All chunks failed. Please wait ~60s and try again.");

      const row: any = await finalizeFn({ data: { documentId: doc.id, outputType: type, parts: valid } });
      setResults((r) => ({ ...r, [type]: row.content }));
      const failedCount = totalChunks - valid.length;
      if (failedCount > 0) toast.warning(`${OUTPUT_LABELS[type].label} ready — ${failedCount}/${totalChunks} chunks skipped after retries`);
      else toast.success(`${OUTPUT_LABELS[type].label} ready`);
      qc.invalidateQueries({ queryKey: ["documents"] });
      qc.invalidateQueries({ queryKey: ["generations", doc.id] });

    } catch (e: any) {
      if (!handleStaleDocError(e)) toast.error(e?.message || "Generation failed");
    } finally {
      setPending(null);
      setProgress(null);
    }
  }


  async function run(type: OutputType) {
    // Everything goes through the chunked pipeline. Single-shot generation
    // hits the Cloudflare Worker CPU limit on large docs and shows up in the
    // browser as "Failed to fetch". The chunked path plans → processes each
    // chunk in its own request → finalizes, and shows live progress.
    return runChunked(type);
  }



  const statusBadge = () => {
    const s = doc.status as string;
    const map: Record<string, string> = {
      ready: "bg-emerald-100 text-emerald-900",
      processing: "bg-amber-100 text-amber-900",
      uploaded: "bg-slate-100 text-slate-700",
      failed: "bg-rose-100 text-rose-900",
    };
    return <Badge className={map[s] ?? ""}>{s}</Badge>;
  };

  return (
    <div className="rounded-xl border border-border bg-paper p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-serif text-lg font-semibold">{doc.title}</h3>
            {statusBadge()}
            {doc.subject && <Badge variant="outline">{doc.subject}</Badge>}
            {doc.priority && <Badge variant="outline" className="capitalize">{doc.priority} priority</Badge>}
          </div>
          {doc.summary && <p className="mt-2 text-sm text-muted-foreground">{doc.summary}</p>}
        </div>
        <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Delete">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {doc.status === "ready" && (() => {
        const enabledOutputs: OutputType[] = [];
        if (prefs.generateShortNotes) enabledOutputs.push("short_notes");
        if (prefs.generateHandwritten) enabledOutputs.push("handwritten_notes");
        if (prefs.generateQuestions && prefs.questionPrelimsMcqs) enabledOutputs.push("prelims_mcqs");
        if (prefs.generateQuestions && (prefs.questionMains || prefs.questionEssay || prefs.questionEthicsCases || prefs.questionInterview)) enabledOutputs.push("mains_questions");
        const nonInfo = enabledOutputs.filter((t) => t !== "infographics");
        return (
        <>
          {prefs.generateInfographics && (
            <div className="mt-4 rounded-lg border border-accent/40 bg-gradient-to-r from-primary/5 to-accent/10 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 font-serif font-semibold">
                    <LayoutDashboard className="h-4 w-4 text-accent" /> One-Click Infographic Pack
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">Auto-detects every topic in this document and produces unlimited A4 infographic pages with flowcharts, timelines, mind maps and key takeaways.</p>
                </div>
                <Button size="sm" onClick={() => run("infographics")} disabled={pending !== null}>
                  {pending === "infographics" ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-2 h-3.5 w-3.5" />}
                  Generate Infographics
                </Button>
              </div>
              {pending === "infographics" && progress && (
                <div className="mt-3 space-y-1.5">
                  <Progress value={progress.total ? (progress.done / progress.total) * 100 : 0} className="h-2" />
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>
                      {progress.total === 0
                        ? "Planning chunks…"
                        : `Processing ${progress.done}/${progress.total} chunks`}
                    </span>
                    <span className="flex items-center gap-2">
                      {progress.retrying > 0 && (
                        <span className="text-amber-700">↻ retrying {progress.retrying}</span>
                      )}
                      {progress.failed > 0 && (
                        <span className="text-rose-700">{progress.failed} skipped</span>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-3 rounded-lg border border-rose-300/60 bg-gradient-to-r from-rose-50 to-amber-50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 font-serif font-semibold">
                  <Newspaper className="h-4 w-4 text-rose-700" /> Newspaper Intelligence
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Auto-detects source (The Hindu, Indian Express, PIB, PRS, Yojana…), splits the issue into articles, and classifies each with GS Paper, syllabus path, PYQs, importance & related links.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline" className="border-rose-300 text-rose-700 hover:bg-rose-50">
                  <a href="/inbox">📅 Pick date from Telegram</a>
                </Button>
                <Button size="sm" onClick={() => run("newspaper")} disabled={pending !== null} className="bg-green-600 hover:bg-green-700 text-white animate-pulse">
                  {pending === "newspaper" ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Newspaper className="mr-2 h-3.5 w-3.5" />}
                  Analyse as Newspaper
                </Button>
              </div>
            </div>
            {pending === "newspaper" && progress && (
              <div className="mt-3 space-y-1.5">
                <Progress value={progress.total ? (progress.done / progress.total) * 100 : 0} className="h-2" />
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>{progress.total === 0 ? "Planning chunks…" : `Processing ${progress.done}/${progress.total} chunks`}</span>
                  <span className="flex items-center gap-2">
                    {progress.retrying > 0 && <span className="text-amber-700">↻ retrying {progress.retrying}</span>}
                    {progress.failed > 0 && <span className="text-rose-700">{progress.failed} skipped</span>}
                  </span>
                </div>
              </div>
            )}
          </div>

          {nonInfo.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {nonInfo.map((t) => (
                <Button key={t} size="sm" variant="outline" onClick={() => run(t)} disabled={pending !== null}>
                  {pending === t ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-2 h-3.5 w-3.5" />}
                  {OUTPUT_LABELS[t].label}
                </Button>
              ))}
            </div>
          )}
          {nonInfo.length === 0 && !prefs.generateInfographics && (
            <p className="mt-3 text-xs text-muted-foreground">All outputs are disabled in Processing options.</p>
          )}
          {Object.entries(results).map(([type, content]) => (
            <GeneratedResult key={type} type={type as OutputType} content={content} docTitle={doc.title} />
          ))}
          {prefs.runFinalChecker && <FinalChecker documentId={doc.id} documentTitle={doc.title} />}
          <HistoryPanel
            documentId={doc.id}
            docTitle={doc.title}
            onOpen={(type, content) => setResults((r) => ({ ...r, [type]: content }))}
          />
        </>
        );
      })()}


      {(doc.status === "processing" || doc.status === "uploaded") && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-amber-700" />
            <div>
              <div className="font-medium text-amber-900">Extracting your document…</div>
              <p className="text-xs text-amber-800/80">Generation options will appear here as soon as extraction is complete. This usually takes 10–60 seconds.</p>
            </div>
          </div>
        </div>
      )}

      {doc.status === "failed" && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <p className="text-sm text-rose-700">
            Extraction failed{doc.error_message ? `: ${doc.error_message}` : "."} {doc.error_message?.includes("Google Drive file is no longer accessible") ? "Please delete and upload it again." : "You can retry with OCR."}
          </p>
          <ReprocessButton docId={doc.id} />
        </div>
      )}

      {doc.status === "ready" && (
        <div className="mt-3">
          <ReprocessButton docId={doc.id} variant="ghost" label="Re-run extraction (OCR)" />
        </div>
      )}

    </div>
  );
}

function GeneratedResult({ type, content, docTitle }: { type: OutputType; content: any; docTitle: string }) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    if (!previewRef.current) return;
    setVerifying(true);
    try {
      const { verifyPreviewExport } = await import("@/lib/preview-pdf");
      const report = await verifyPreviewExport(previewRef.current);
      const { toast } = await import("sonner");
      if (report.ok) {
        toast.success(`Verified ✓ ${report.pages} page${report.pages === 1 ? "" : "s"}, ${Math.round(report.coverageRatio * 100)}% content coverage.`);
      } else {
        toast.error(`Verify export found ${report.issues.length} issue(s)`, { description: report.issues.join(" ") });
      }
    } catch (e) {
      const { toast } = await import("sonner");
      toast.error(e instanceof Error ? e.message : "Verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  const handleDownload = async () => {
    if (!previewRef.current) return;
    setExporting(true);
    try {
      const { downloadPreviewAsPdf } = await import("@/lib/preview-pdf");
      const report = await downloadPreviewAsPdf(previewRef.current, `${docTitle}-${OUTPUT_LABELS[type].label}`, { verifyBefore: true });
      const { toast } = await import("sonner");
      toast.success(`Saved ${report.pages} page${report.pages === 1 ? "" : "s"} (verified ${Math.round(report.coverageRatio * 100)}%).`);
    } catch (e) {
      console.error("[download] failed", e);
      const { toast } = await import("sonner");
      toast.error(e instanceof Error ? e.message : "Could not export PDF.", {
        description: "Open the preview, scroll to top, and try again. The verifier blocks blank or partial PDFs.",
      });
    } finally {
      setExporting(false);
    }
  };
  return (
    <section className="mt-4 rounded-lg border border-border bg-background p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="font-serif text-base font-semibold">{OUTPUT_LABELS[type].label}</h4>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleVerify} disabled={verifying || exporting}>
            {verifying ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
            {verifying ? "Verifying…" : "Verify export"}
          </Button>
          <Button size="sm" onClick={handleDownload} disabled={exporting || verifying}>
            <Download className="mr-2 h-3.5 w-3.5" />
            {exporting ? "Exporting…" : "Download PDF"}
          </Button>
        </div>
      </div>
      <div ref={previewRef} className={`mt-4 rounded-md border border-border ${type === "handwritten_notes" ? "" : "bg-paper p-5"}`}>
        <FormattedOutput type={type} content={content} />
      </div>
    </section>
  );
}


function HistoryPdfButton({ type, content, docTitle }: { type: OutputType; content: any; docTitle: string }) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  async function handleDownload() {
    // Render the preview visibly first so the exporter captures the
    // already-rendered output (no hidden offscreen fallback).
    setShowPreview(true);
    setExporting(true);
    try {
      // Wait two frames for React commit + layout, then scroll into view.
      await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
      const node = previewRef.current;
      if (!node) throw new Error("Preview not ready.");
      node.scrollIntoView({ block: "center", behavior: "auto" });
      await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
      const { downloadPreviewAsPdf } = await import("@/lib/preview-pdf");
      await downloadPreviewAsPdf(node, `${docTitle}-${OUTPUT_LABELS[type].label}`);
    } catch (e) {
      console.error("[history-download] failed", e);
      toast.error(e instanceof Error ? e.message : "Could not export PDF.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={handleDownload} disabled={exporting}>
        {exporting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />}
        {exporting ? "PDF…" : "PDF"}
      </Button>
      {showPreview && (
        <div className="mt-3 w-full">
          <div className="mb-2 text-xs text-muted-foreground">Rendering preview for export…</div>
          <div ref={previewRef} className={`rounded-md border border-border ${type === "handwritten_notes" ? "" : "bg-paper p-5"}`}>
            <FormattedOutput type={type} content={content} />
          </div>
        </div>
      )}
    </>
  );
}


function HandwrittenNotebook({ content }: { content: any }) {
  const inkStyle: React.CSSProperties = {
    fontFamily: 'Caveat, "Comic Sans MS", cursive',
    color: '#1a2a6c',
    backgroundImage:
      'linear-gradient(to bottom, transparent 0, transparent 30px, #a9c7e8 30px, #a9c7e8 31px, transparent 31px), linear-gradient(to right, transparent 0, transparent 56px, #e89393 56px, #e89393 57px, transparent 57px)',
    backgroundSize: '100% 32px, 100% 100%',
    backgroundColor: '#fdfcf7',
  };
  return (
    <div className="overflow-hidden rounded-md shadow-inner" style={inkStyle}>
      <div className="px-16 py-8" style={{ paddingLeft: 72 }}>
        <h5 style={{ fontFamily: 'Caveat, cursive', fontSize: 36, fontWeight: 700, color: '#b8860b', lineHeight: '32px', margin: 0, transform: 'rotate(-1deg)' }}>
          {content.title}
        </h5>
        <p style={{ fontSize: 22, lineHeight: '32px', marginTop: 8 }}>{content.intro}</p>
        {(content.sections || []).map((section: any, index: number) => (
          <div key={index} style={{ marginTop: 24 }}>
            <h6 style={{ fontFamily: 'Kalam, Caveat, cursive', fontSize: 26, fontWeight: 700, color: '#7a1e1e', lineHeight: '32px', margin: 0, textDecoration: 'underline', textDecorationColor: '#d4a857', textUnderlineOffset: 4 }}>
              {index + 1}. {section.heading}
            </h6>
            <p style={{ fontSize: 21, lineHeight: '32px', margin: 0, whiteSpace: 'pre-wrap' }}>{section.body}</p>
            {!!section.callouts?.length && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
                {section.callouts.map((c: any, ci: number) => {
                  const tints: Record<string, string> = { warning: '#ffd1d1', tip: '#d6f5d6', fact: '#fff3a3', insight: '#cfe5ff' };
                  const bg = tints[String(c.kind).toLowerCase()] || '#fff3a3';
                  const rot = ci % 2 === 0 ? -1.5 : 1.5;
                  return (
                    <div key={ci} style={{ background: bg, padding: '10px 14px', maxWidth: 280, fontSize: 19, lineHeight: '26px', boxShadow: '2px 3px 0 rgba(0,0,0,0.08)', transform: `rotate(${rot}deg)` }}>
                      <strong style={{ textTransform: 'uppercase', fontSize: 14, letterSpacing: 1 }}>{c.kind}: </strong>{c.text}
                    </div>
                  );
                })}
              </div>
            )}
            {!!section.mnemonics?.length && (
              <div style={{ marginTop: 10, fontSize: 20, lineHeight: '32px' }}>
                <span style={{ background: 'linear-gradient(transparent 55%, #fff59d 55%)', fontWeight: 700 }}>★ Mnemonics:</span>
                <ul style={{ margin: '4px 0 0 24px', padding: 0 }}>
                  {section.mnemonics.map((m: string, mi: number) => <li key={mi}>{m}</li>)}
                </ul>
              </div>
            )}
            {!!section.value_add?.length && (
              <div style={{ marginTop: 10, fontSize: 20, lineHeight: '32px' }}>
                <span style={{ background: 'linear-gradient(transparent 55%, #b9f6ca 55%)', fontWeight: 700 }}>➤ UPSC Value Add:</span>
                <ul style={{ margin: '4px 0 0 24px', padding: 0 }}>
                  {section.value_add.map((v: string, vi: number) => <li key={vi}>{v}</li>)}
                </ul>
              </div>
            )}
          </div>
        ))}
        {content.conclusion && (
          <p style={{ marginTop: 24, fontSize: 22, lineHeight: '32px', borderTop: '2px dashed #b8860b', paddingTop: 12 }}>
            <strong style={{ color: '#7a1e1e' }}>Conclusion ~ </strong>{content.conclusion}
          </p>
        )}
      </div>
    </div>
  );
}

function FormattedOutput({ type, content }: { type: OutputType; content: any }) {
  if (type === "handwritten_notes") {
    return <HandwrittenNotebook content={content} />;
  }

  if (type === "infographics") {
    return <InfographicsViewer content={content} />;
  }

  if (type === "newspaper") {
    return <NewspaperIssue content={content} />;
  }

  if (type === "short_notes") {
    return (
      <article className="space-y-4">
        <h5 className="font-serif text-xl font-semibold">{content.title}</h5>
        <KeyBlock label="Definition" value={content.definition} />
        <BulletList title="Key Facts" items={content.key_facts} />
        <KeyBlock label="PYQ Relevance" value={content.pyq_relevance} />
        <KeyBlock label="UPSC Relevance" value={content.upsc_relevance} />
        <BulletList title="Keywords" items={content.keywords} compact />
        <BulletList title="Examples" items={content.examples} />
        <BulletList title="Revision Tips" items={content.revision_tips} />
      </article>
    );
  }

  if (type === "prelims_mcqs") {
    return (
      <article className="space-y-4">
        <h5 className="font-serif text-xl font-semibold">{content.title}</h5>
        {(content.questions || []).map((question: any, index: number) => (
          <section key={index} className="rounded-md border border-border p-4">
            <h6 className="font-serif font-semibold">Q{index + 1}. {question.stem}</h6>
            <ol className="mt-3 grid gap-2 text-sm" type="A">
              {(question.options || []).map((option: string, optionIndex: number) => (
                <li key={optionIndex} className="ml-5 pl-1">{option}</li>
              ))}
            </ol>
            <p className="mt-3 text-sm font-semibold">Answer: {String.fromCharCode(65 + Number(question.answer_index || 0))}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{question.explanation}</p>
          </section>
        ))}
      </article>
    );
  }

  return (
    <article className="space-y-4">
      <h5 className="font-serif text-xl font-semibold">{content.title}</h5>
      {(content.questions || []).map((question: any, index: number) => (
        <section key={index} className="rounded-md border border-border p-4">
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>{question.gs_paper}</span>
            <span>{question.marks} marks</span>
            <span>{question.word_limit} words</span>
          </div>
          <h6 className="mt-2 font-serif font-semibold">Q{index + 1}. {question.question}</h6>
          <BulletList title="Intro" items={question.intro_points} />
          <BulletList title="Body" items={question.body_points} />
          <BulletList title="Conclusion" items={question.conclusion_points} />
          <BulletList title="Keywords" items={question.keywords} compact />
          <BulletList title="Value Add" items={question.value_add} />
        </section>
      ))}
    </article>
  );
}

function KeyBlock({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <section>
      <h6 className="font-serif font-semibold text-primary">{label}</h6>
      <p className="mt-1 text-sm leading-6">{value}</p>
    </section>
  );
}

function BulletList({ title, items, compact = false }: { title: string; items?: string[]; compact?: boolean }) {
  if (!items?.length) return null;
  return (
    <section className="mt-3">
      <h6 className="font-serif font-semibold text-primary">{title}</h6>
      <ul className={compact ? "mt-2 flex flex-wrap gap-2" : "mt-2 list-disc space-y-1 pl-5 text-sm leading-6"}>
        {items.map((item, index) => (
          <li key={index} className={compact ? "rounded-md border border-border px-2 py-1 text-xs" : undefined}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

const THEME_BG: Record<string, { bar: string; soft: string; text: string; accent: string }> = {
  indigo: { bar: "#1a1f3a", soft: "#eef0fa", text: "#1a1f3a", accent: "#d4a857" },
  gold: { bar: "#8c6212", soft: "#fdf6e3", text: "#5c3f06", accent: "#1a1f3a" },
  rose: { bar: "#9d2b4d", soft: "#fdeaf0", text: "#5c1024", accent: "#d4a857" },
  emerald: { bar: "#1a6e51", soft: "#e3f7ed", text: "#0d3a2a", accent: "#d4a857" },
  amber: { bar: "#a5750f", soft: "#fff4d6", text: "#3d2a04", accent: "#1a6e51" },
  teal: { bar: "#0f6671", soft: "#dff3f5", text: "#08323a", accent: "#d4a857" },
  violet: { bar: "#612b8c", soft: "#f3eafa", text: "#2f0f4a", accent: "#d4a857" },
};

function InfographicsViewer({ content }: { content: any }) {
  const pages: any[] = Array.isArray(content?.pages) ? content.pages : [];
  if (!pages.length) return <p className="p-4 text-sm text-muted-foreground">No infographic pages generated.</p>;
  return (
    <div className="p-3">
      <div className="mb-3 flex items-center justify-between">
        <h5 className="font-serif text-xl font-semibold">{content.title}</h5>
        <Badge variant="outline">{pages.length} infographic{pages.length === 1 ? "" : "s"}</Badge>
      </div>
      <div className="grid gap-4">
        {pages.map((p, i) => <InfographicCard key={i} page={p} index={i + 1} total={pages.length} />)}
      </div>
    </div>
  );
}

function InfographicCard({ page, index, total }: { page: any; index: number; total: number }) {
  const theme = THEME_BG[page.color] || THEME_BG.indigo;
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
      <header style={{ background: theme.bar, color: "white" }} className="px-5 py-3">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider opacity-90">
          <span>{(page.layout || "summary").toUpperCase()}</span>
          <span>{index} / {total}</span>
        </div>
        <h6 className="mt-1 font-serif text-lg font-bold">
          {page.topic}{page.total_parts > 1 ? <span className="ml-2 text-sm opacity-80">(Part {page.part}/{page.total_parts})</span> : null}
        </h6>
        {page.subtitle && <p className="text-xs italic opacity-90">{page.subtitle}</p>}
      </header>
      <div className="px-5 py-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {(page.sections || []).map((s: any, si: number) => (
            <div key={si} className="rounded-md border-l-4 bg-white p-3" style={{ borderColor: theme.bar, background: theme.soft }}>
              <div className="font-serif font-semibold" style={{ color: theme.text }}>{s.heading}</div>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs leading-5" style={{ color: theme.text }}>
                {(s.points || []).map((pt: string, pi: number) => <li key={pi}>{pt}</li>)}
              </ul>
            </div>
          ))}
        </div>
        {(page.key_facts || []).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {page.key_facts.map((f: string, i: number) => (
              <span key={i} className="rounded border px-2 py-0.5 text-[11px]" style={{ borderColor: theme.bar, color: theme.text, background: theme.soft }}>{f}</span>
            ))}
          </div>
        )}
        {page.mnemonic && (
          <div className="mt-3 rounded-md px-3 py-2 text-sm font-semibold" style={{ background: theme.accent, color: "white" }}>
            <span className="text-[10px] uppercase tracking-wider opacity-90">Mnemonic · </span>{page.mnemonic}
          </div>
        )}
        {page.takeaway && (
          <div className="mt-3 rounded-md border-l-4 bg-paper px-3 py-2 text-sm" style={{ borderColor: theme.accent, color: theme.text }}>
            <span className="text-[10px] font-bold uppercase tracking-wider">Key Takeaway · </span>{page.takeaway}
          </div>
        )}
        {(page.pyq_link || page.current_affairs) && (
          <div className="mt-2 flex flex-wrap gap-3 text-[11px] italic text-muted-foreground">
            {page.pyq_link && <span>PYQ: {page.pyq_link}</span>}
            {page.current_affairs && <span>CA: {page.current_affairs}</span>}
          </div>
        )}
      </div>
    </article>
  );
}

function HistoryPanel({
  documentId,
  docTitle,
  onOpen,
}: {
  documentId: string;
  docTitle: string;
  onOpen: (type: OutputType, content: any) => void;
}) {
  const qc = useQueryClient();
  const listFn = useServerFn(listGenerations);
  const delFn = useServerFn(deleteGeneration);
  const [open, setOpen] = useState(false);

  const histQ = useQuery({
    queryKey: ["generations", documentId],
    queryFn: () => listFn({ data: { documentId } }),
    enabled: open,
  });

  const rows = ((histQ.data as any[]) || []).filter((r) => OUTPUT_TYPES.includes(r.output_type));

  async function remove(id: string) {
    try {
      await delFn({ data: { id } });
      toast.success("Deleted from history");
      qc.invalidateQueries({ queryKey: ["generations", documentId] });
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    }
  }

  return (
    <section className="mt-4 rounded-lg border border-border bg-background">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 font-serif text-base font-semibold">
          <History className="h-4 w-4 text-accent" />
          History
          {rows.length > 0 && (
            <Badge variant="outline" className="ml-1">{rows.length}</Badge>
          )}
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <div className="border-t border-border p-4">
          {histQ.isLoading && <p className="text-sm text-muted-foreground">Loading history…</p>}
          {!histQ.isLoading && rows.length === 0 && (
            <p className="text-sm text-muted-foreground">No past generations for this document yet.</p>
          )}
          {rows.length > 0 && (
            <ul className="divide-y divide-border">
              {rows.map((r: any) => {
                const label = OUTPUT_LABELS[r.output_type as OutputType]?.label ?? r.output_type;
                const when = new Date(r.created_at).toLocaleString();
                return (
                  <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{label}</Badge>
                        <span className="truncate text-sm">{r.title || docTitle}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{when}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => onOpen(r.output_type as OutputType, r.content)}>
                        <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                      </Button>
                      <HistoryPdfButton type={r.output_type as OutputType} content={r.content} docTitle={docTitle} />
                      <Button size="sm" variant="ghost" onClick={() => remove(r.id)} aria-label="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

