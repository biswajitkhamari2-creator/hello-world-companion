import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import {
  FileEdit,
  Sparkles,
  Loader2,
  Newspaper,
  Target,
  ListChecks,
  Lightbulb,
  BookOpen,
  AlertTriangle,
  Trash2,
  ChevronDown,
  ChevronUp,
  Download,
  CheckSquare,
  Square,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  listInboxNewspapers,
  listEditorials,
  analyseEditorialFromInbox,
  deleteEditorial,
  removeEditorialPiece,
  type EditorialRow,
  type EditorialItem,
} from "@/lib/editorial-lab.functions";
import { deleteInboxItem } from "@/lib/telegram-inbox.functions";
import { deleteDocument } from "@/lib/documents.functions";
import { Brain, PenLine, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/editorial-lab")({
  head: () => ({
    meta: [
      { title: "Editorial Lab — UPSC Genius AI" },
      {
        name: "description",
        content:
          "Auto-detect editorial pages from any newspaper PDF forwarded via Telegram. Crisp + comprehensive notes, mermaid diagrams, PYQ links — paid Gemini quality.",
      },
    ],
  }),
  component: EditorialLabPage,
});

function EditorialLabPage() {
  const listPdfs = useServerFn(listInboxNewspapers);
  const listNotes = useServerFn(listEditorials);
  const analyse = useServerFn(analyseEditorialFromInbox);
  const remove = useServerFn(deleteEditorial);
  const removePdf = useServerFn(deleteInboxItem);
  const removeDoc = useServerFn(deleteDocument);
  const qc = useQueryClient();

  const pdfsQ = useQuery({
    queryKey: ["editorial-lab", "pdfs"],
    queryFn: () => listPdfs(),
    refetchInterval: 120_000,
  });
  const notesQ = useQuery({
    queryKey: ["editorial-lab", "notes"],
    queryFn: () => listNotes() as Promise<EditorialRow[]>,
  });

  const analyseMut = useMutation({
    mutationFn: (inboxId: string) => analyse({ data: { inboxId } }),
    onSuccess: (r) => {
      toast.success(`Editorial extracted — ${r.editorialCount} pieces saved`);
      qc.invalidateQueries({ queryKey: ["editorial-lab"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to analyse editorial"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["editorial-lab", "notes"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Delete failed"),
  });

  const deletePdfMut = useMutation({
    mutationFn: ({ id, source }: { id: string; source?: string }) =>
      source === "documents"
        ? removeDoc({ data: { id } })
        : removePdf({ data: { itemId: id } }),
    onSuccess: () => {
      toast.success("Newspaper removed from inbox");
      qc.invalidateQueries({ queryKey: ["editorial-lab", "pdfs"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Delete failed"),
  });

  const notes = (notesQ.data ?? []) as EditorialRow[];
  const now = Date.now();
  const recent = notes.filter((r) => {
    const t = new Date(r.created_at || 0).getTime();
    return now - t < 3 * 24 * 60 * 60 * 1000; // last 3 days
  });
  const history = notes.filter((r) => !recent.includes(r));

  // --- Multi-select state ---
  const [pdfSel, setPdfSel] = useState<Set<string>>(new Set());
  const [noteSel, setNoteSel] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  const togglePdf = (id: string) =>
    setPdfSel((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleNote = (id: string) =>
    setNoteSel((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const bulkDeletePdfs = async () => {
    if (pdfSel.size === 0) return;
    if (!confirm(`Delete ${pdfSel.size} newspaper(s) from the Telegram inbox?`)) return;
    setBulkBusy(true);
    try {
      const pdfs = (pdfsQ.data ?? []) as any[];
      await Promise.all(
        Array.from(pdfSel).map((id) => {
          const row = pdfs.find((p) => p.id === id);
          return row?.source === "documents"
            ? removeDoc({ data: { id } })
            : removePdf({ data: { itemId: id } });
        }),
      );
      toast.success(`${pdfSel.size} newspaper(s) deleted`);
      setPdfSel(new Set());
      qc.invalidateQueries({ queryKey: ["editorial-lab", "pdfs"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Bulk delete failed");
    } finally {
      setBulkBusy(false);
    }
  };

  const bulkDeleteNotes = async () => {
    if (noteSel.size === 0) return;
    if (!confirm(`Delete ${noteSel.size} editorial(s)? This cannot be undone.`)) return;
    setBulkBusy(true);
    try {
      await Promise.all(Array.from(noteSel).map((id) => remove({ data: { id } })));
      toast.success(`${noteSel.size} editorial(s) deleted`);
      setNoteSel(new Set());
      qc.invalidateQueries({ queryKey: ["editorial-lab", "notes"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Bulk delete failed");
    } finally {
      setBulkBusy(false);
    }
  };

  const now2 = new Date();
  const vol = `Vol. ${String(now2.getMonth() + 1).padStart(2, "0")} / ${now2.getFullYear()}`;
  const totalPdfs = (pdfsQ.data ?? []).length;

  return (
    <AppShell>
      <main
        className="mx-auto max-w-6xl bg-[#faf7f2] text-stone-800 dark:bg-[#1a1815] dark:text-stone-200 sm:border-x sm:border-stone-200/70 sm:dark:border-stone-800/70"
        style={{ fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif' }}
      >
        {/* NEWSROOM MASTHEAD */}
        <header className="border-b-2 border-stone-700/80 px-5 pt-7 pb-5 dark:border-stone-300/70 sm:px-8 sm:pt-10">
          <div className="mb-1 flex items-end justify-between gap-3">
            <h1
              className="text-[34px] font-bold italic leading-none tracking-tight text-stone-900 dark:text-stone-100 sm:text-5xl"
              style={{ fontFamily: '"Playfair Display", ui-serif, Georgia, serif' }}
            >
              Editorial <span className="not-italic">Lab</span>
            </h1>
            <span
              className="pb-1 text-[10px] uppercase tracking-widest opacity-60"
              style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace' }}
            >
              {vol}
            </span>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-800/80 dark:text-amber-200/70">
            Automated Research &amp; Synthesis · Gemini 2.5 Pro
          </p>
        </header>

        {/* MAIN */}
        <div className="pb-32">
          {/* TELEGRAM INBOX */}
          <section className="pt-6">
            <div className="mb-3 flex items-center justify-between px-5 sm:px-8">
              <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
                Telegram Inbox
              </h2>
              <div className="flex items-center gap-2">
                <span
                  className="border border-stone-300/70 bg-white/70 px-2 py-0.5 text-[10px] uppercase tracking-widest text-stone-600 dark:border-stone-700 dark:bg-stone-900/60 dark:text-stone-300"
                  style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace' }}
                >
                  {totalPdfs} {totalPdfs === 1 ? "Pdf" : "Pdfs"}
                </span>
                {totalPdfs > 0 && (
                  <button
                    onClick={() => {
                      const all = (pdfsQ.data ?? []).map((p: any) => p.id as string);
                      setPdfSel((prev) => (prev.size === all.length ? new Set() : new Set(all)));
                    }}
                    className="text-[10px] font-bold uppercase tracking-widest underline underline-offset-4 opacity-70 hover:opacity-100"
                  >
                    {pdfSel.size === totalPdfs ? "Clear" : "Select all"}
                  </button>
                )}
              </div>
            </div>

            {pdfsQ.isLoading ? (
              <div className="mx-5 flex items-center gap-2 border border-stone-200 bg-white p-3 text-[13px] text-stone-500 dark:border-stone-800 dark:bg-[#22201d] sm:mx-8">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : totalPdfs === 0 ? (
              <div className="mx-5 border border-dashed border-stone-300 bg-white/60 p-6 text-center text-[13px] text-stone-500 dark:border-stone-700 dark:bg-[#22201d]/60 sm:mx-8">
                No newspapers yet. Forward today&apos;s edition to the bot.
              </div>
            ) : (
              <div className="space-y-px border-y border-stone-200 bg-stone-200/80 dark:border-stone-800 dark:bg-stone-800/70">
                {(pdfsQ.data ?? []).map((p: any) => {
                  const busy = analyseMut.isPending && analyseMut.variables === p.id;
                          const delBusy = deletePdfMut.isPending && (deletePdfMut.variables as any)?.id === p.id;
                  const selected = pdfSel.has(p.id);
                  return (
                    <div
                      key={p.id}
                      className={
                        "flex gap-4 px-5 py-4 sm:px-8 " +
                        (selected
                          ? "bg-amber-50/70 ring-1 ring-inset ring-amber-700/60 dark:bg-stone-800/60 dark:ring-amber-200/40"
                          : "bg-white dark:bg-[#22201d]")
                      }
                    >
                      {/* stamp / select */}
                      <button
                        onClick={() => togglePdf(p.id)}
                        className={
                          "relative grid h-10 w-10 shrink-0 place-items-center border transition-colors " +
                          (selected
                            ? "border-amber-700 bg-amber-700 text-white dark:border-amber-300 dark:bg-amber-300 dark:text-stone-900"
                            : "border-stone-400 text-stone-600 bg-transparent dark:border-stone-500 dark:text-stone-300")
                        }
                        aria-label={selected ? "Unselect" : "Select"}
                        title={selected ? "Unselect" : "Select"}
                      >
                        {selected ? (
                          <CheckSquare className="h-5 w-5" strokeWidth={2.5} />
                        ) : (
                          <Newspaper className="h-5 w-5" strokeWidth={1.5} />
                        )}
                        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border border-white bg-amber-700 dark:border-[#22201d] dark:bg-amber-300" />
                      </button>

                      {/* body */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="min-w-0 flex-1 truncate pr-2 text-sm font-semibold">
                            {p.file_name || p.caption || "Newspaper"}
                          </h3>
                          <button
                             onClick={() => {
                              if (confirm("Delete this newspaper?")) {
                                deletePdfMut.mutate({ id: p.id, source: p.source });
                              }
                            }}
                            disabled={delBusy}
                            className="shrink-0 text-stone-300 hover:text-rose-600 disabled:opacity-40 dark:text-stone-700 dark:hover:text-rose-400"
                            aria-label="Delete newspaper"
                            title="Delete"
                          >
                            <X className="h-4 w-4" strokeWidth={2} />
                          </button>
                        </div>
                        <div
                          className="mt-1 flex items-center gap-2 text-[10px] uppercase text-stone-500 dark:text-stone-400"
                          style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace' }}
                        >
                          <span>{formatShortDate(p.posted_at)}</span>
                          <span className="opacity-30">|</span>
                          <span>
                            {p.size_bytes ? (p.size_bytes / 1024 / 1024).toFixed(1) + " MB" : "—"}
                          </span>
                          {p.drive_view_link && (
                            <>
                              <span className="opacity-30">|</span>
                              <a
                                href={p.drive_view_link}
                                target="_blank"
                                rel="noreferrer"
                                className="underline text-amber-800 dark:text-amber-200"
                              >
                                Open
                              </a>
                            </>
                          )}
                        </div>
                        <div className="mt-3">
                          <button
                            onClick={() => analyseMut.mutate(p.id)}
                            disabled={busy}
                            className="inline-flex items-center gap-1.5 rounded-sm bg-gradient-to-r from-amber-700 via-orange-600 to-rose-600 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-white shadow-sm hover:opacity-95 disabled:opacity-60"
                          >
                            {busy ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Sparkles className="h-3 w-3" />
                            )}
                            {busy ? "Extracting…" : "Extract Content"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* RECENT EXTRACTS */}
          <section className="mt-8">
            <div className="mb-3 flex items-baseline justify-between px-5 sm:px-8">
              <h2 className="text-[11px] font-bold uppercase tracking-widest">Recent Extracts</h2>
              <div className="flex items-center gap-3">
                <span
                  className="text-[10px] uppercase tracking-widest opacity-60"
                  style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace' }}
                >
                  3d · {recent.length}
                </span>
                {recent.length > 0 && (
                  <button
                    onClick={() => {
                      const ids = recent.map((r) => r.id);
                      const allSelected = ids.every((id) => noteSel.has(id));
                      setNoteSel((prev) => {
                        const n = new Set(prev);
                        if (allSelected) ids.forEach((id) => n.delete(id));
                        else ids.forEach((id) => n.add(id));
                        return n;
                      });
                    }}
                    className="text-[10px] font-bold uppercase tracking-widest underline underline-offset-4 opacity-70 hover:opacity-100"
                  >
                    {recent.every((r) => noteSel.has(r.id)) ? "Clear" : "Select all"}
                  </button>
                )}
              </div>
            </div>
            {notesQ.isLoading && (
              <div className="px-5 text-[13px] text-stone-500 sm:px-8">Loading…</div>
            )}
            {!notesQ.isLoading && recent.length === 0 && (
              <div className="mx-5 border border-dashed border-stone-300 bg-white/50 p-6 text-center text-[13px] text-stone-500 dark:border-stone-700 dark:bg-[#121212]/50 sm:mx-8">
                No recent editorials. Hit <span className="font-bold">Extract</span> on any inbox
                PDF above.
              </div>
            )}
            <div className="space-y-3 px-5 sm:px-8">
              {recent.map((row) => (
                <EditorialCard
                  key={row.id}
                  row={row}
                  onDelete={() => deleteMut.mutate(row.id)}
                  selected={noteSel.has(row.id)}
                  onToggleSelect={() => toggleNote(row.id)}
                />
              ))}
            </div>
          </section>

          {/* HISTORY */}
          {history.length > 0 && (
            <div className="mt-8 px-5 sm:px-8">
              <HistorySection
                items={history}
                onDelete={(id) => deleteMut.mutate(id)}
                selected={noteSel}
                onToggleSelect={toggleNote}
              />
            </div>
          )}
        </div>

        {/* FLOATING PRESS TRAY */}
        {(pdfSel.size > 0 || noteSel.size > 0) && (
          <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-3 sm:bottom-6">
            <div className="flex w-full max-w-[380px] items-center justify-between gap-3 rounded-md border border-stone-800/40 bg-stone-800 px-5 py-3 text-stone-50 shadow-2xl dark:border-stone-100/30 dark:bg-stone-100 dark:text-stone-900">
              <div className="flex flex-col">
                <span
                  className="text-[10px] uppercase tracking-widest opacity-60"
                  style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace' }}
                >
                  Selected
                </span>
                <span className="text-sm font-bold">
                  {pdfSel.size + noteSel.size} {pdfSel.size + noteSel.size === 1 ? "Item" : "Items"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setPdfSel(new Set());
                    setNoteSel(new Set());
                  }}
                  className="grid h-9 w-9 place-items-center border border-white/20 text-white/70 hover:text-white dark:border-black/20 dark:text-black/60 dark:hover:text-black"
                  aria-label="Clear selection"
                  title="Clear"
                >
                  <X className="h-4 w-4" />
                </button>
                <button
                  onClick={async () => {
                    if (pdfSel.size > 0) await bulkDeletePdfs();
                    if (noteSel.size > 0) await bulkDeleteNotes();
                  }}
                  disabled={bulkBusy}
                  className="inline-flex items-center gap-1.5 bg-red-600 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {bulkBusy ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Delete Bulk
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </AppShell>
  );
}

function formatShortDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "2-digit" }).toUpperCase();
  } catch {
    return "—";
  }
}

function HistorySection({
  items,
  onDelete,
  selected,
  onToggleSelect,
}: {
  items: EditorialRow[];
  onDelete: (id: string) => void;
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  // Group by YYYY-MM
  const groups = items.reduce<Record<string, EditorialRow[]>>((acc, r) => {
    const key = (r.edition_date || r.created_at || "").slice(0, 7) || "older";
    (acc[key] ||= []).push(r);
    return acc;
  }, {});
  const keys = Object.keys(groups).sort().reverse();

  return (
    <section className="mt-8">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-2xl border bg-card/60 px-3 py-2.5 text-left shadow-sm backdrop-blur hover:bg-card"
      >
        <BookOpen className="h-4 w-4 text-indigo-500" />
        <span className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
          History
        </span>
        <span className="text-[11px] text-muted-foreground">· {items.length} archived</span>
        <span className="ml-auto text-muted-foreground">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>
      {open && (
        <div className="mt-3 space-y-6">
          {keys.map((k) => (
            <div key={k} className="space-y-2">
              <div className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {formatMonth(k)}
              </div>
              {groups[k].map((row) => (
                <EditorialCard
                  key={row.id}
                  row={row}
                  onDelete={() => onDelete(row.id)}
                  selected={selected.has(row.id)}
                  onToggleSelect={() => onToggleSelect(row.id)}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function formatMonth(k: string): string {
  if (!/^\d{4}-\d{2}$/.test(k)) return "Older";
  const [y, m] = k.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function EditorialCard({
  row,
  onDelete,
  selected,
  onToggleSelect,
}: {
  row: EditorialRow;
  onDelete: () => void;
  selected?: boolean;
  onToggleSelect?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const items = row.analysis?.editorials ?? [];
  const [dlBusy, setDlBusy] = useState<"md" | "pdf" | null>(null);
  const removePiece = useServerFn(removeEditorialPiece);
  const qc = useQueryClient();
  const pieceDeleteMut = useMutation({
    mutationFn: (index: number) => removePiece({ data: { id: row.id, index } }),
    onSuccess: () => {
      toast.success("Editorial removed");
      qc.invalidateQueries({ queryKey: ["editorial-lab", "notes"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Delete failed"),
  });

  const baseName = `${(row.newspaper || "Editorial").replace(/[^\w-]+/g, "_")}_${row.edition_date || row.created_at?.slice(0, 10) || "notes"}`;

  const downloadMd = () => {
    const md = buildEditorialMarkdown(row);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    triggerDownload(blob, `${baseName}.md`);
  };

  const downloadPdf = async () => {
    try {
      setDlBusy("pdf");
      const { editorialsToPdf } = await import("@/lib/editorial-pdf");
      const blob = await editorialsToPdf(row);
      triggerDownload(blob, `${baseName}.pdf`);
    } catch (e: any) {
      toast.error(e?.message ?? "PDF export failed");
    } finally {
      setDlBusy(null);
    }
  };

  return (
    <Card
      className={
        "overflow-hidden transition " +
        (selected ? "ring-2 ring-indigo-400" : "")
      }
    >
      <div className="bg-gradient-to-r from-indigo-500/10 via-fuchsia-500/10 to-amber-500/10 p-4 sm:p-4">
        <div className="flex w-full items-start gap-2 text-left">
          {onToggleSelect && (
            <button
              onClick={onToggleSelect}
              className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border bg-background/60 text-muted-foreground hover:text-indigo-500"
              aria-label={selected ? "Unselect" : "Select"}
              title={selected ? "Unselect" : "Select"}
            >
              {selected ? <CheckSquare className="h-4 w-4 text-indigo-500" /> : <Square className="h-4 w-4" />}
            </button>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex min-w-0 flex-1 items-start justify-between gap-3 text-left"
          >
            <div className="min-w-0 flex-1">
            <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:truncate sm:text-[11px]">
              {row.newspaper || "Newspaper"} · {row.edition_date || row.created_at?.slice(0, 10)}
            </div>
            <div className="mt-1 break-words font-serif text-[20px] font-bold leading-tight sm:mt-0 sm:truncate sm:text-lg sm:font-semibold">
              {row.source_label || "Editorial batch"} · {items.length} pieces
            </div>
            </div>
            <div className="shrink-0 rounded-full border bg-background/60 p-2 text-muted-foreground">
              {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-3 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
          <button
            onClick={downloadMd}
            className="inline-flex h-12 min-h-[48px] items-center justify-center gap-2 rounded-md border bg-background/60 px-3 text-[15px] font-semibold text-muted-foreground hover:text-indigo-500 sm:h-auto sm:min-h-0 sm:py-1.5 sm:text-xs"
            aria-label="Download markdown"
            title="Download as Markdown (.md)"
          >
            <Download className="h-5 w-5 sm:h-4 sm:w-4" />
            <span>Markdown</span>
          </button>
          <button
            onClick={() => {
              if (dlBusy) return;
              downloadPdf();
            }}
            className="inline-flex h-12 min-h-[48px] items-center justify-center gap-2 rounded-md border bg-background/60 px-3 text-[15px] font-semibold text-muted-foreground hover:text-indigo-500 sm:h-auto sm:min-h-0 sm:py-1.5 sm:text-xs"
            aria-label="Download PDF"
            title="Download as PDF"
          >
            <Download className="h-5 w-5 sm:h-4 sm:w-4" />
            <span>{dlBusy === "pdf" ? "Working…" : "PDF"}</span>
          </button>
          <button
            onClick={onDelete}
            className="col-span-2 inline-flex h-12 min-h-[48px] items-center justify-center gap-2 rounded-md border bg-background/60 px-3 text-[15px] font-semibold text-muted-foreground hover:text-rose-500 sm:col-span-1 sm:h-auto sm:min-h-0 sm:py-1.5 sm:text-xs"
            aria-label="Delete"
          >
            <Trash2 className="h-5 w-5 sm:h-4 sm:w-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>
      {open && (
        <div className="space-y-6 border-t p-4 sm:space-y-5 sm:p-5">
          {items.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No editorial pages were detected in this PDF.
            </div>
          )}
          {items.map((it, i) => (
            <EditorialPiece
              key={i}
              item={it}
              idx={i}
              rowId={row.id}
              rowMeta={{ newspaper: row.newspaper, edition_date: row.edition_date, created_at: row.created_at }}
              onDeletePiece={() => {
                if (confirm("Delete this editorial from history?")) pieceDeleteMut.mutate(i);
              }}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function buildEditorialMarkdown(row: EditorialRow): string {
  const items = row.analysis?.editorials ?? [];
  const lines: string[] = [];
  lines.push(`# ${row.newspaper || "Newspaper"} — Editorial Notes`);
  lines.push(`*${row.edition_date || row.created_at?.slice(0, 10) || ""} · ${items.length} editorials · UPSC Genius AI*`);
  lines.push("");
  items.forEach((it, i) => {
    lines.push(`## ${i + 1}. ${it.title}`);
    lines.push(
      `**Syllabus:** ${it.syllabus.stage} · ${it.syllabus.paper} · ${it.syllabus.subject} · ${it.syllabus.topic}${it.syllabus.subTopic ? ` · ${it.syllabus.subTopic}` : ""}  `,
    );
    lines.push(`**Importance:** ${it.importance}`);
    lines.push("");
    if (it.crispNotes?.length) {
      lines.push(`### Crisp Notes`);
      it.crispNotes.forEach((c) => lines.push(`- ${c}`));
      lines.push("");
    }
    if (it.comprehensiveNotes) {
      lines.push(`### Comprehensive Notes`);
      lines.push(it.comprehensiveNotes);
      lines.push("");
    }
    if (it.diagramMermaid) {
      lines.push(`### Diagram`);
      lines.push("```mermaid");
      lines.push(it.diagramMermaid);
      lines.push("```");
      lines.push("");
    }
    if (it.argumentsFor?.length) {
      lines.push(`### Arguments — For`);
      it.argumentsFor.forEach((x) => lines.push(`- ${x}`));
      lines.push("");
    }
    if (it.argumentsAgainst?.length) {
      lines.push(`### Arguments — Against`);
      it.argumentsAgainst.forEach((x) => lines.push(`- ${x}`));
      lines.push("");
    }
    if (it.keyFacts?.length) {
      lines.push(`### Key Facts`);
      it.keyFacts.forEach((f) => lines.push(`- ${f}`));
      lines.push("");
    }
    if (it.vocabulary?.length) {
      lines.push(`### Vocabulary`);
      it.vocabulary.forEach((v) => lines.push(`- **${v.word}** — ${v.meaning}`));
      lines.push("");
    }
    if (it.wayForward?.length) {
      lines.push(`### Way Forward`);
      it.wayForward.forEach((w) => lines.push(`- ${w}`));
      lines.push("");
    }
    if (it.pyqLinks?.length) {
      lines.push(`### PYQ Links`);
      it.pyqLinks.forEach((p) =>
        lines.push(`- ${p.year ? `**${p.year}** ` : ""}${p.paper ? `(${p.paper}) ` : ""}${p.question}`),
      );
      lines.push("");
    }
    if (it.probablePrelimsMCQ) {
      lines.push(`### Probable Prelims MCQ`);
      lines.push(it.probablePrelimsMCQ.q);
      it.probablePrelimsMCQ.options.forEach((o, j) =>
        lines.push(`${j === it.probablePrelimsMCQ!.answer ? "**✓** " : ""}${String.fromCharCode(65 + j)}. ${o}`),
      );
      lines.push(`> ${it.probablePrelimsMCQ.explanation}`);
      lines.push("");
    }
    if (it.probableMainsQuestion) {
      lines.push(`### Probable Mains Question`);
      lines.push(
        `*${it.probableMainsQuestion.paper} · ${it.probableMainsQuestion.marks} marks*`,
      );
      lines.push(it.probableMainsQuestion.q);
      lines.push(`> **Approach:** ${it.probableMainsQuestion.approach}`);
      lines.push("");
    }
    lines.push("---");
    lines.push("");
  });
  return lines.join("\n");
}

function EditorialPiece({
  item,
  idx,
  rowId,
  rowMeta,
  onDeletePiece,
}: {
  item: EditorialItem;
  idx: number;
  rowId: string;
  rowMeta?: { newspaper: string | null; edition_date: string | null; created_at: string };
  onDeletePiece?: () => void;
}) {
  const importanceTint =
    item.importance === "Very High"
      ? "bg-rose-500 text-white"
      : item.importance === "High"
        ? "bg-amber-500 text-white"
        : item.importance === "Medium"
          ? "bg-indigo-500 text-white"
          : "bg-muted text-foreground";

  const baseName = `${(item.title || "editorial").replace(/[^\w-]+/g, "_").slice(0, 60)}`;

  const downloadMindMap = async () => {
    if (!item.diagramMermaid) {
      toast.error("No mind map available for this editorial");
      return;
    }
    try {
      mermaid.initialize({ startOnLoad: false, theme: "default", securityLevel: "loose" });
      const { svg } = await mermaid.render(`mm-dl-${rowId}-${idx}`, item.diagramMermaid);
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      triggerDownload(blob, `${baseName}_mindmap.svg`);
    } catch (e: any) {
      toast.error(e?.message ?? "Mind map export failed");
    }
  };

  const downloadPyq = () => {
    const lines: string[] = [];
    lines.push(`# ${item.title} — PYQ & Probable Questions`);
    lines.push("");
    if (item.pyqLinks?.length) {
      lines.push(`## Previous Year Questions`);
      item.pyqLinks.forEach((p) =>
        lines.push(`- ${p.year ? `**${p.year}** ` : ""}${p.paper ? `(${p.paper}) ` : ""}${p.question}`),
      );
      lines.push("");
    }
    if (item.probablePrelimsMCQ) {
      lines.push(`## Probable Prelims MCQ`);
      lines.push(item.probablePrelimsMCQ.q);
      item.probablePrelimsMCQ.options.forEach((o, j) =>
        lines.push(`${j === item.probablePrelimsMCQ!.answer ? "**✓** " : ""}${String.fromCharCode(65 + j)}. ${o}`),
      );
      lines.push(`> ${item.probablePrelimsMCQ.explanation}`);
      lines.push("");
    }
    if (item.probableMainsQuestion) {
      lines.push(`## Probable Mains Question`);
      lines.push(`*${item.probableMainsQuestion.paper} · ${item.probableMainsQuestion.marks} marks*`);
      lines.push(item.probableMainsQuestion.q);
      lines.push(`> **Approach:** ${item.probableMainsQuestion.approach}`);
    }
    if (!item.pyqLinks?.length && !item.probablePrelimsMCQ && !item.probableMainsQuestion) {
      toast.error("No PYQ / probable questions available");
      return;
    }
    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    triggerDownload(blob, `${baseName}_pyq.md`);
  };

  const downloadHandwritten = () => {
    const html = buildHandwrittenHtml(item, rowMeta);
    const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=1000");
    if (!w) {
      toast.error("Popup blocked — allow popups to save handwritten notes");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  return (
    <div className="rounded-2xl border bg-card/60 p-4 sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="break-words font-serif text-[19px] font-bold leading-snug sm:text-lg sm:font-semibold">
            {item.title}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[12px] sm:mt-1 sm:text-[11px]">
            <Badge variant="secondary">{item.syllabus.stage}</Badge>
            <Badge>{item.syllabus.paper}</Badge>
            <span className="text-muted-foreground">
              {item.syllabus.subject} · {item.syllabus.topic}
              {item.syllabus.subTopic ? ` · ${item.syllabus.subTopic}` : ""}
            </span>
          </div>
        </div>
        <Badge className={importanceTint}>{item.importance}</Badge>
      </div>

      {/* Per-piece action toolbar — everything for this editorial on one screen */}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <button
          onClick={downloadMindMap}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-md border bg-background/60 px-3 text-[13px] font-semibold text-muted-foreground hover:text-indigo-500"
          title="Download Mind Map (SVG)"
        >
          <Brain className="h-4 w-4" />
          <span>Mind Map</span>
        </button>
        <button
          onClick={downloadPyq}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-md border bg-background/60 px-3 text-[13px] font-semibold text-muted-foreground hover:text-amber-600"
          title="Download PYQ + probable questions (Markdown)"
        >
          <HelpCircle className="h-4 w-4" />
          <span>PYQ</span>
        </button>
        <button
          onClick={downloadHandwritten}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-md border bg-background/60 px-3 text-[13px] font-semibold text-muted-foreground hover:text-fuchsia-600"
          title="Open handwritten notes — use browser Print > Save as PDF"
        >
          <PenLine className="h-4 w-4" />
          <span>Handwritten</span>
        </button>
        {onDeletePiece && (
          <button
            onClick={onDeletePiece}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-md border bg-background/60 px-3 text-[13px] font-semibold text-muted-foreground hover:text-rose-600"
            title="Delete this editorial from history"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        )}
      </div>

      {item.crispNotes?.length > 0 && (
        <Section title="Crisp Notes" icon={ListChecks}>
          <ul className="space-y-1.5 text-[15px] leading-relaxed sm:text-sm">
            {item.crispNotes.map((c, i) => (
              <li key={i}>• {c}</li>
            ))}
          </ul>
        </Section>
      )}

      {item.comprehensiveNotes && (
        <Section title="Comprehensive Notes" icon={BookOpen}>
          <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/85 sm:text-sm">
            {item.comprehensiveNotes}
          </div>
        </Section>
      )}

      {item.diagramMermaid && (
        <Section title="Diagram" icon={Sparkles}>
          <MermaidBlock code={item.diagramMermaid} id={`mmd-${rowId}-${idx}`} />
        </Section>
      )}

      {(item.argumentsFor?.length || item.argumentsAgainst?.length) ? (
        <Section title="Arguments — For vs Against" icon={Target}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/60 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                For
              </div>
              <ul className="space-y-1 text-sm">
                {item.argumentsFor?.map((x, i) => <li key={i}>• {x}</li>)}
              </ul>
            </div>
            <div className="rounded-xl border border-rose-200/60 bg-rose-50/60 p-3 dark:border-rose-900/40 dark:bg-rose-950/20">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">
                Against
              </div>
              <ul className="space-y-1 text-sm">
                {item.argumentsAgainst?.map((x, i) => <li key={i}>• {x}</li>)}
              </ul>
            </div>
          </div>
        </Section>
      ) : null}

      {item.keyFacts?.length > 0 && (
        <Section title="Key Facts" icon={AlertTriangle}>
          <ul className="space-y-1 text-sm">
            {item.keyFacts.map((f, i) => <li key={i}>• {f}</li>)}
          </ul>
        </Section>
      )}

      {item.vocabulary?.length > 0 && (
        <Section title="Vocabulary" icon={Lightbulb}>
          <ul className="grid gap-1 text-sm sm:grid-cols-2">
            {item.vocabulary.map((v, i) => (
              <li key={i}>
                <strong className="text-indigo-700 dark:text-indigo-300">{v.word}</strong> —{" "}
                {v.meaning}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {item.wayForward?.length > 0 && (
        <Section title="Way Forward" icon={Sparkles}>
          <ul className="space-y-1 text-sm">
            {item.wayForward.map((w, i) => <li key={i}>→ {w}</li>)}
          </ul>
        </Section>
      )}

      {item.pyqLinks?.length > 0 && (
        <Section title="PYQ Links" icon={BookOpen}>
          <ul className="space-y-1 text-sm">
            {item.pyqLinks.map((p, i) => (
              <li key={i}>
                {p.year ? <strong>{p.year}</strong> : null} {p.paper ? `· ${p.paper}` : ""} — {p.question}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {item.probablePrelimsMCQ && (
        <Section title="Probable Prelims MCQ" icon={Target}>
          <div className="rounded-xl border bg-background p-3">
            <div className="font-medium">{item.probablePrelimsMCQ.q}</div>
            <ol className="mt-2 space-y-1 text-sm">
              {item.probablePrelimsMCQ.options.map((o, j) => (
                <li
                  key={j}
                  className={
                    j === item.probablePrelimsMCQ!.answer
                      ? "font-semibold text-emerald-700 dark:text-emerald-300"
                      : ""
                  }
                >
                  {String.fromCharCode(65 + j)}. {o}
                  {j === item.probablePrelimsMCQ!.answer && " ✓"}
                </li>
              ))}
            </ol>
            <div className="mt-2 text-xs text-muted-foreground">
              <strong>Explanation:</strong> {item.probablePrelimsMCQ.explanation}
            </div>
          </div>
        </Section>
      )}

      {item.probableMainsQuestion && (
        <Section title="Probable Mains Question" icon={FileEdit}>
          <div className="rounded-xl border bg-background p-3">
            <div className="mb-1 flex items-center gap-2 text-[11px]">
              <Badge variant="secondary">{item.probableMainsQuestion.paper}</Badge>
              <span className="text-muted-foreground">{item.probableMainsQuestion.marks} marks</span>
            </div>
            <div className="font-medium">{item.probableMainsQuestion.q}</div>
            <div className="mt-2 text-sm text-foreground/80">
              <strong>Approach:</strong> {item.probableMainsQuestion.approach}
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-indigo-500" />
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {title}
        </div>
      </div>
      {children}
    </div>
  );
}

function MermaidBlock({ code, id }: { code: string; id: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: "default", securityLevel: "loose" });
    let cancelled = false;
    (async () => {
      try {
        const { svg } = await mermaid.render(id.replace(/[^a-zA-Z0-9_-]/g, "_"), code);
        if (!cancelled && ref.current) ref.current.innerHTML = svg;
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Diagram render failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, id]);

  if (err) {
    return (
      <pre className="overflow-auto rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground">
        {code}
      </pre>
    );
  }
  return (
    <div className="overflow-auto rounded-xl border bg-background p-3" ref={ref} />
  );
}
function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildHandwrittenHtml(
  item: EditorialItem,
  meta?: { newspaper: string | null; edition_date: string | null; created_at: string },
): string {
  const date = meta?.edition_date || meta?.created_at?.slice(0, 10) || "";
  const paper = meta?.newspaper || "Editorial";
  const bullets = (arr?: string[]) =>
    arr && arr.length
      ? `<ul>${arr.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`
      : "";
  return `<!doctype html><html><head><meta charset="utf-8" />
<title>${esc(item.title)} — Handwritten Notes</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Patrick+Hand&display=swap" />
<style>
  @page { size: A4; margin: 18mm 16mm; }
  html, body { background: #fdfbf3; margin: 0; }
  body {
    font-family: "Kalam", "Patrick Hand", cursive;
    color: #1a1a1a; line-height: 1.55; font-size: 16pt;
    background-image: repeating-linear-gradient(#fdfbf3 0 30px, #e6dcc4 30px 31px);
    padding: 20px 28px;
  }
  h1 { font-size: 26pt; margin: 0 0 4px; color: #12306a; }
  .meta { font-size: 11pt; color: #6a5a3a; margin-bottom: 14px; }
  h2 { font-size: 17pt; margin: 18px 0 4px; color: #b0341f; border-bottom: 1px dashed #b0341f; padding-bottom: 2px; }
  ul { margin: 4px 0 8px 22px; padding: 0; }
  li { margin: 2px 0; }
  .box { border: 1.5px solid #12306a; border-radius: 6px; padding: 8px 12px; margin: 6px 0; background: rgba(255,255,255,0.5); }
  .toolbar { position: fixed; top: 8px; right: 8px; font-family: system-ui, sans-serif; font-size: 11pt; }
  .toolbar button { background: #12306a; color: #fff; border: 0; padding: 8px 14px; border-radius: 6px; cursor: pointer; }
  @media print { .toolbar { display: none; } body { background: #fff; background-image: repeating-linear-gradient(#fff 0 30px, #d9d0b8 30px 31px); } }
</style></head><body>
<div class="toolbar"><button onclick="window.print()">Save as PDF</button></div>
<h1>${esc(item.title)}</h1>
<div class="meta">${esc(paper)} · ${esc(date)} · ${esc(item.syllabus.paper)} · ${esc(item.syllabus.subject)} — ${esc(item.syllabus.topic)}</div>
${item.crispNotes?.length ? `<h2>Crisp Notes</h2>${bullets(item.crispNotes)}` : ""}
${item.comprehensiveNotes ? `<h2>Comprehensive</h2><div>${esc(item.comprehensiveNotes).replace(/\n/g, "<br/>")}</div>` : ""}
${item.keyFacts?.length ? `<h2>Key Facts</h2>${bullets(item.keyFacts)}` : ""}
${item.argumentsFor?.length ? `<h2>Arguments — For</h2>${bullets(item.argumentsFor)}` : ""}
${item.argumentsAgainst?.length ? `<h2>Arguments — Against</h2>${bullets(item.argumentsAgainst)}` : ""}
${item.wayForward?.length ? `<h2>Way Forward</h2>${bullets(item.wayForward)}` : ""}
${item.vocabulary?.length ? `<h2>Vocabulary</h2><ul>${item.vocabulary.map((v) => `<li><b>${esc(v.word)}</b> — ${esc(v.meaning)}</li>`).join("")}</ul>` : ""}
${item.pyqLinks?.length ? `<h2>PYQ Links</h2><ul>${item.pyqLinks.map((p) => `<li>${p.year ? `<b>${p.year}</b> ` : ""}${p.paper ? `(${esc(p.paper)}) ` : ""}${esc(p.question)}</li>`).join("")}</ul>` : ""}
${item.probablePrelimsMCQ ? `<h2>Probable Prelims MCQ</h2><div class="box"><div>${esc(item.probablePrelimsMCQ.q)}</div><ol>${item.probablePrelimsMCQ.options.map((o, j) => `<li${j === item.probablePrelimsMCQ!.answer ? ' style="color:#0a7a2a;font-weight:700"' : ""}>${esc(o)}${j === item.probablePrelimsMCQ!.answer ? " ✓" : ""}</li>`).join("")}</ol><div style="font-size:12pt;color:#555">${esc(item.probablePrelimsMCQ.explanation)}</div></div>` : ""}
${item.probableMainsQuestion ? `<h2>Probable Mains</h2><div class="box"><div style="font-size:12pt;color:#555">${esc(item.probableMainsQuestion.paper)} · ${item.probableMainsQuestion.marks} marks</div><div>${esc(item.probableMainsQuestion.q)}</div><div style="margin-top:6px"><b>Approach:</b> ${esc(item.probableMainsQuestion.approach)}</div></div>` : ""}
</body></html>`;
}
