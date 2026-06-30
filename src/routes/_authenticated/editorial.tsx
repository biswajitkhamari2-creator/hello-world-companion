import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { FileEdit, Sparkles, Loader2, Upload, ListChecks, Lightbulb, Target, BookOpen, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { analyseEditorial, type EditorialAnalysis } from "@/lib/editorial.functions";
import { createUploadSession, finalizeUpload, extractDocument, getDocument } from "@/lib/documents.functions";
import { uploadFileResumable } from "@/lib/drive-upload";

export const Route = createFileRoute("/_authenticated/editorial")({
  head: () => ({
    meta: [
      { title: "Editorial Analyser — UPSC Genius AI" },
      { name: "description", content: "Paste or upload any newspaper editorial. AI returns 3-line summary, GS mapping, key concepts, vocabulary, prelims MCQs and mains questions." },
    ],
  }),
  component: EditorialPage,
});

function EditorialPage() {
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [result, setResult] = useState<EditorialAnalysis | null>(null);
  const analyseFn = useServerFn(analyseEditorial);
  const startUploadSession = useServerFn(createUploadSession);
  const finalize = useServerFn(finalizeUpload);
  const extractFn = useServerFn(extractDocument);
  const getDocFn = useServerFn(getDocument);

  // Auth gate guarantees a session exists.

  const analyse = useMutation({
    mutationFn: async () => analyseFn({ data: { text: text.trim(), source: source.trim() || undefined } }),
    onSuccess: (r) => { setResult(r); toast.success("Editorial analysed"); },
    onError: (e: any) => toast.error(e?.message ?? "Failed to analyse"),
  });

  const onFile = async (file: File) => {
    try {
      toast.loading("Uploading editorial to Drive…", { id: "ext" });
      const mime = file.type || "application/pdf";
      const session = await startUploadSession({
        data: { fileName: file.name, mime, size: file.size, title: file.name },
      });
      const { driveFileId } = await uploadFileResumable({
        file,
        uploadUrl: session.uploadUrl,
        onProgress: (loaded, total) => {
          const pct = total ? Math.round((loaded / total) * 100) : 0;
          toast.loading(`Uploading editorial… ${pct}%`, { id: "ext" });
        },
      });
      const uploaded = await finalize({ data: { documentId: session.documentId, driveFileId } });
      toast.loading("Extracting editorial from PDF…", { id: "ext" });
      const ext = await extractFn({ data: { documentId: uploaded.id } });
      if (!ext.ok) throw new Error("Could not extract text from this PDF");
      const doc = await getDocFn({ data: { id: uploaded.id } });
      setText(((doc.document.extracted_text as string | null) || "").slice(0, 60000));
      if (!source) setSource(file.name.replace(/\.pdf$/i, ""));
      toast.success("Editorial loaded — click Analyse", { id: "ext" });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to extract", { id: "ext" });
    }
  };

  return (
    <AppShell>
      <div className="relative min-h-[calc(100vh-3rem)] bg-gradient-to-b from-background via-background to-indigo-50/30 dark:to-indigo-950/10">
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          {/* Header */}
          <div className="mb-8 flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg">
              <FileEdit className="h-6 w-6" />
            </span>
            <div>
              <h1 className="font-serif text-2xl font-semibold sm:text-3xl">Editorial Analyser</h1>
              <p className="text-sm text-muted-foreground">3-line summary, GS mapping, MCQs & mains in one click.</p>
            </div>
          </div>

          {/* Input card */}
          <Card className="p-5 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Input
                placeholder="Source (e.g., The Hindu — 'Decoding the new SC verdict')"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-muted">
                <Upload className="h-4 w-4" /> Upload PDF
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
                />
              </label>
            </div>
            <Textarea
              className="mt-3 min-h-[220px] resize-y font-serif text-[15px] leading-relaxed"
              placeholder="Paste the full editorial text here…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{text.length.toLocaleString()} characters</span>
              <Button
                onClick={() => analyse.mutate()}
                disabled={analyse.isPending || text.trim().length < 50}
                className="bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-amber-500 text-white hover:opacity-95"
              >
                {analyse.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Analyse Editorial
              </Button>
            </div>
          </Card>

          {/* Result */}
          {result && <ResultView r={result} />}
          {!result && !analyse.isPending && (
            <div className="mt-10 rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              Paste an editorial above (or upload a PDF) and hit <strong>Analyse Editorial</strong>.
            </div>
          )}
        </main>
      </div>
    </AppShell>
  );
}

function ResultView({ r }: { r: EditorialAnalysis }) {
  const importanceTint =
    r.importance === "Very High" ? "bg-rose-500 text-white"
    : r.importance === "High" ? "bg-amber-500 text-white"
    : r.importance === "Medium" ? "bg-indigo-500 text-white"
    : "bg-muted text-foreground";

  return (
    <div className="mt-8 space-y-6">
      {/* Title + importance */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500/10 via-fuchsia-500/10 to-amber-500/10 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{r.source}</div>
              <h2 className="mt-1 font-serif text-xl font-semibold sm:text-2xl">{r.title}</h2>
            </div>
            <Badge className={importanceTint}>Importance: {r.importance}</Badge>
          </div>
        </div>
        <div className="space-y-2 p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">3-line summary</div>
          <ol className="space-y-1.5 text-[15px] leading-relaxed text-foreground">
            {r.threeLineSummary?.map((l, i) => (
              <li key={i} className="flex gap-2"><span className="font-semibold text-indigo-600">{i + 1}.</span>{l}</li>
            ))}
          </ol>
          {r.abstract && <p className="mt-3 text-sm leading-relaxed text-foreground/80">{r.abstract}</p>}
        </div>
      </Card>

      {/* GS Mapping */}
      <Section title="UPSC Syllabus Mapping" icon={Target}>
        <div className="grid gap-3 sm:grid-cols-2">
          {r.gsMapping?.map((g, i) => (
            <div key={i} className="rounded-xl border bg-card p-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{g.paper}</Badge>
                <span className="text-xs font-medium text-muted-foreground">{g.subject}</span>
              </div>
              <div className="mt-1.5 font-medium">{g.topic}</div>
              <div className="text-sm text-foreground/75">{g.relevance}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Key concepts */}
      {r.keyConcepts?.length > 0 && (
        <Section title="Key Concepts" icon={Lightbulb}>
          <div className="grid gap-3 sm:grid-cols-2">
            {r.keyConcepts.map((k, i) => (
              <div key={i} className="rounded-xl border bg-card p-3">
                <div className="font-semibold text-indigo-700 dark:text-indigo-300">{k.term}</div>
                <div className="mt-0.5 text-sm text-foreground/80">{k.explanation}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Arguments */}
      {(r.arguments?.for?.length || r.arguments?.against?.length) ? (
        <Section title="Arguments — For vs Against" icon={ListChecks}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">For</div>
              <ul className="space-y-1 text-sm">{r.arguments.for?.map((x, i) => <li key={i}>• {x}</li>)}</ul>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3 dark:border-rose-900/40 dark:bg-rose-950/20">
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">Against</div>
              <ul className="space-y-1 text-sm">{r.arguments.against?.map((x, i) => <li key={i}>• {x}</li>)}</ul>
            </div>
          </div>
        </Section>
      ) : null}

      {/* Facts & vocab */}
      <div className="grid gap-6 lg:grid-cols-2">
        {r.facts?.length > 0 && (
          <Section title="Key Facts & Data" icon={AlertTriangle}>
            <ul className="space-y-1.5 text-sm">{r.facts.map((f, i) => <li key={i}>• {f}</li>)}</ul>
          </Section>
        )}
        {r.vocabulary?.length > 0 && (
          <Section title="Exam-useful Vocabulary" icon={BookOpen}>
            <ul className="space-y-1.5 text-sm">
              {r.vocabulary.map((v, i) => (
                <li key={i}><strong className="text-indigo-700 dark:text-indigo-300">{v.word}</strong> — {v.meaning}</li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      {/* Way forward */}
      {r.wayForward?.length > 0 && (
        <Section title="Way Forward" icon={Sparkles}>
          <ul className="space-y-1.5 text-sm">{r.wayForward.map((w, i) => <li key={i}>→ {w}</li>)}</ul>
        </Section>
      )}

      {/* Prelims MCQs */}
      {r.prelimsMCQs?.length > 0 && (
        <Section title="Prelims MCQs" icon={Target}>
          <div className="space-y-4">
            {r.prelimsMCQs.map((m, i) => (
              <div key={i} className="rounded-xl border bg-card p-4">
                <div className="font-semibold">Q{i + 1}. {m.q}</div>
                <ol className="mt-2 space-y-1 text-sm">
                  {m.options?.map((o, j) => (
                    <li key={j} className={j === m.answer ? "font-semibold text-emerald-700 dark:text-emerald-300" : ""}>
                      {String.fromCharCode(65 + j)}. {o} {j === m.answer && "✓"}
                    </li>
                  ))}
                </ol>
                <div className="mt-2 text-xs text-muted-foreground"><strong>Explanation:</strong> {m.explanation}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Mains */}
      {r.mainsQuestions?.length > 0 && (
        <Section title="Mains Questions" icon={FileEdit}>
          <div className="space-y-3">
            {r.mainsQuestions.map((m, i) => (
              <div key={i} className="rounded-xl border bg-card p-4">
                <div className="mb-1 flex items-center gap-2 text-xs">
                  <Badge variant="secondary">{m.paper}</Badge>
                  <span className="text-muted-foreground">{m.marks} marks</span>
                </div>
                <div className="font-medium">{m.q}</div>
                <div className="mt-2 text-sm text-foreground/80"><strong>Approach:</strong> {m.approach}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* PYQ */}
      {r.pyqLinks?.length > 0 && (
        <Section title="Related PYQ Themes" icon={BookOpen}>
          <ul className="space-y-1 text-sm">{r.pyqLinks.map((p, i) => <li key={i}>• {p}</li>)}</ul>
        </Section>
      )}
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-indigo-600" />
        <h3 className="font-serif text-lg font-semibold">{title}</h3>
      </div>
      {children}
    </Card>
  );
}
