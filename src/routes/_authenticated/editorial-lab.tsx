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
  type EditorialRow,
  type EditorialItem,
} from "@/lib/editorial-lab.functions";
import { deleteInboxItem } from "@/lib/telegram-inbox.functions";

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
    mutationFn: (itemId: string) => removePdf({ data: { itemId } }),
    onSuccess: () => {
      toast.success("Newspaper removed from inbox");
      qc.invalidateQueries({ queryKey: ["editorial-lab", "pdfs"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Delete failed"),
  });

  return (
    <AppShell>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Header */}
        <div className="mb-6 flex flex-col items-start gap-3 sm:mb-8 sm:flex-row sm:items-center">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-amber-400 text-white shadow-lg sm:h-12 sm:w-12">
            <FileEdit className="h-7 w-7 sm:h-6 sm:w-6" />
          </span>
          <div className="min-w-0">
            <h1 className="font-serif text-[32px] font-extrabold leading-tight sm:text-3xl">
              Editorial Lab
            </h1>
            <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground sm:text-sm">
              Forward The Hindu / Indian Express PDFs to the Telegram bot. Editorial Lab isolates
              only the editorial pages and produces crisp + comprehensive notes with diagrams —
              powered by paid Gemini 2.5 Pro.
            </p>
          </div>
        </div>

        {/* Newspaper PDFs from inbox */}
        <Card className="p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2 sm:mb-3">
            <Newspaper className="h-6 w-6 text-indigo-500 sm:h-4 sm:w-4" />
            <h2 className="font-serif text-xl font-bold sm:text-lg sm:font-semibold">
              Newspapers in Telegram Inbox
            </h2>
          </div>
          {pdfsQ.isLoading ? (
            <div className="flex items-center gap-2 text-[15px] text-muted-foreground sm:text-sm">
              <Loader2 className="h-5 w-5 animate-spin sm:h-4 sm:w-4" /> Loading…
            </div>
          ) : (pdfsQ.data ?? []).length === 0 ? (
            <div className="text-[15px] leading-relaxed text-muted-foreground sm:text-sm">
              No PDF newspapers in the Telegram inbox yet. Forward the day's edition to the bot,
              then refresh.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-3">
              {(pdfsQ.data ?? []).map((p: any) => {
                const busy = analyseMut.isPending && analyseMut.variables === p.id;
                return (
                  <div key={p.id} className="rounded-2xl border bg-card p-4 sm:rounded-xl sm:p-3">
                    <div className="break-words text-[17px] font-bold leading-snug sm:text-sm sm:font-medium">
                      {p.file_name || p.caption || "Newspaper"}
                    </div>
                    <div className="mt-1 text-[13px] text-muted-foreground sm:mt-0.5 sm:text-[11px]">
                      {new Date(p.posted_at).toLocaleString()}
                      {p.size_bytes ? " · " + (p.size_bytes / 1024 / 1024).toFixed(1) + " MB" : ""}
                    </div>
                    <div className="mt-3 grid grid-cols-2 items-center gap-2 sm:mt-2 sm:flex">
                      <Button
                        onClick={() => analyseMut.mutate(p.id)}
                        disabled={busy}
                        className="col-span-2 h-12 min-h-[48px] w-full justify-center bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-amber-500 text-[16px] font-semibold text-white hover:opacity-95 sm:col-span-1 sm:h-9 sm:w-auto sm:text-sm"
                      >
                        {busy ? (
                          <Loader2 className="mr-2 h-5 w-5 animate-spin sm:h-4 sm:w-4" />
                        ) : (
                          <Sparkles className="mr-2 h-5 w-5 sm:h-4 sm:w-4" />
                        )}
                        Extract Editorial
                      </Button>
                      {p.drive_view_link && (
                        <a
                          href={p.drive_view_link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-12 min-h-[48px] items-center justify-center rounded-md border text-[15px] font-medium text-muted-foreground underline-offset-4 hover:underline sm:h-auto sm:min-h-0 sm:border-0 sm:text-xs sm:font-normal sm:underline"
                        >
                          Open PDF
                        </a>
                      )}
                      <button
                        onClick={() => {
                          if (confirm("Delete this newspaper from the Telegram inbox?")) {
                            deletePdfMut.mutate(p.id);
                          }
                        }}
                        disabled={deletePdfMut.isPending && deletePdfMut.variables === p.id}
                        className="inline-flex h-12 min-h-[48px] w-full items-center justify-center gap-2 rounded-md border text-[15px] font-medium text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 disabled:opacity-50 sm:ml-auto sm:h-auto sm:min-h-0 sm:w-auto sm:rounded-full sm:border-0 sm:p-1.5"
                        aria-label="Delete newspaper"
                        title="Delete newspaper"
                      >
                        <Trash2 className="h-5 w-5 sm:h-4 sm:w-4" />
                        <span className="sm:hidden">Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Saved editorial notes */}
        <div className="mt-10 space-y-4 sm:mt-8">
          <h2 className="font-serif text-[24px] font-bold sm:text-xl sm:font-semibold">
            Editorial Notes Library
          </h2>
          {notesQ.isLoading && (
            <div className="text-[15px] text-muted-foreground sm:text-sm">Loading notes…</div>
          )}
          {(notesQ.data ?? []).length === 0 && !notesQ.isLoading && (
            <div className="rounded-2xl border border-dashed p-8 text-center text-[15px] text-muted-foreground sm:text-sm">
              No editorials extracted yet.
            </div>
          )}
          {(notesQ.data ?? []).map((row) => (
            <EditorialCard
              key={row.id}
              row={row}
              onDelete={() => deleteMut.mutate(row.id)}
            />
          ))}
        </div>
      </main>
    </AppShell>
  );
}

function EditorialCard({ row, onDelete }: { row: EditorialRow; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const items = row.analysis?.editorials ?? [];
  const [dlBusy, setDlBusy] = useState<"md" | "pdf" | null>(null);

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
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500/10 via-fuchsia-500/10 to-amber-500/10 p-4 sm:p-4">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-start justify-between gap-3 text-left"
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
            <EditorialPiece key={i} item={it} idx={i} rowId={row.id} />
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

function EditorialPiece({ item, idx, rowId }: { item: EditorialItem; idx: number; rowId: string }) {
  const importanceTint =
    item.importance === "Very High"
      ? "bg-rose-500 text-white"
      : item.importance === "High"
        ? "bg-amber-500 text-white"
        : item.importance === "Medium"
          ? "bg-indigo-500 text-white"
          : "bg-muted text-foreground";

  return (
    <div className="rounded-2xl border bg-card/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-serif text-lg font-semibold">{item.title}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
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

      {item.crispNotes?.length > 0 && (
        <Section title="Crisp Notes" icon={ListChecks}>
          <ul className="space-y-1 text-sm">
            {item.crispNotes.map((c, i) => (
              <li key={i}>• {c}</li>
            ))}
          </ul>
        </Section>
      )}

      {item.comprehensiveNotes && (
        <Section title="Comprehensive Notes" icon={BookOpen}>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
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