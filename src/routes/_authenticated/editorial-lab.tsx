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
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-amber-400 text-white shadow-lg">
            <FileEdit className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-serif text-2xl font-semibold sm:text-3xl">Editorial Lab</h1>
            <p className="text-sm text-muted-foreground">
              Forward The Hindu / Indian Express PDFs to the Telegram bot. Editorial Lab isolates
              only the editorial pages and produces crisp + comprehensive notes with diagrams —
              powered by paid Gemini 2.5 Pro.
            </p>
          </div>
        </div>

        {/* Newspaper PDFs from inbox */}
        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-indigo-500" />
            <h2 className="font-serif text-lg font-semibold">Newspapers in Telegram Inbox</h2>
          </div>
          {pdfsQ.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : (pdfsQ.data ?? []).length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No PDF newspapers in the Telegram inbox yet. Forward the day's edition to the bot,
              then refresh.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {(pdfsQ.data ?? []).map((p: any) => {
                const busy = analyseMut.isPending && analyseMut.variables === p.id;
                return (
                  <div key={p.id} className="rounded-xl border bg-card p-3">
                    <div className="truncate text-sm font-medium">
                      {p.file_name || p.caption || "Newspaper"}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      {new Date(p.posted_at).toLocaleString()} ·{" "}
                      {p.size_bytes ? (p.size_bytes / 1024 / 1024).toFixed(1) + " MB" : ""}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => analyseMut.mutate(p.id)}
                        disabled={busy}
                        className="bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-amber-500 text-white hover:opacity-95"
                      >
                        {busy ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Extract Editorial
                      </Button>
                      {p.drive_view_link && (
                        <a
                          href={p.drive_view_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs underline text-muted-foreground self-center"
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
                        className="ml-auto rounded-full p-1.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 disabled:opacity-50"
                        aria-label="Delete newspaper"
                        title="Delete newspaper"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Saved editorial notes */}
        <div className="mt-8 space-y-4">
          <h2 className="font-serif text-xl font-semibold">Editorial Notes Library</h2>
          {notesQ.isLoading && (
            <div className="text-sm text-muted-foreground">Loading notes…</div>
          )}
          {(notesQ.data ?? []).length === 0 && !notesQ.isLoading && (
            <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
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
  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 bg-gradient-to-r from-indigo-500/10 via-fuchsia-500/10 to-amber-500/10 p-4 text-left"
      >
        <div className="min-w-0">
          <div className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {row.newspaper || "Newspaper"} · {row.edition_date || row.created_at?.slice(0, 10)}
          </div>
          <div className="truncate font-serif text-lg font-semibold">
            {row.source_label || "Editorial batch"} · {items.length} pieces
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-background hover:text-rose-500"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>
      {open && (
        <div className="space-y-5 border-t p-5">
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