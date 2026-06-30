import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ClipboardCheck, Download, Loader2, Wand2, XCircle, AlertTriangle, FileText, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  runFinalCheck,
  ASSET_LABEL_TO_OUTPUT,
  QUESTION_TYPE_LABEL_TO_OUTPUT,
  type FinalCheckerReport,
  type ChapterCoverage,
} from "@/lib/final-checker.functions";
import { generateOutput, OUTPUT_LABELS, type OutputType } from "@/lib/generations.functions";
import { downloadFinalCheckerPdf } from "@/lib/final-checker-pdf";

const STATUS_COLOR: Record<string, string> = {
  covered: "bg-emerald-100 text-emerald-900 border-emerald-200",
  partial: "bg-amber-100 text-amber-900 border-amber-200",
  missing: "bg-rose-100 text-rose-900 border-rose-200",
};
const STATUS_ICON: Record<string, string> = { covered: "✅", partial: "🟡", missing: "🔴" };

export function FinalChecker({ documentId, documentTitle }: { documentId: string; documentTitle: string }) {
  const run = useServerFn(runFinalCheck);
  const gen = useServerFn(generateOutput);
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [regenChapter, setRegenChapter] = useState<string | null>(null);
  const [report, setReport] = useState<FinalCheckerReport | null>(null);

  async function runAudit() {
    setLoading(true);
    try {
      const r = (await run({ data: { documentId } })) as FinalCheckerReport;
      setReport(r);
      toast.success(`Audit complete — ${r.overall_score}% (${r.document_type})`);
    } catch (e: any) {
      toast.error(e?.message || "Final Checker failed");
    } finally {
      setLoading(false);
    }
  }

  async function fixMissing() {
    if (!report) return;
    const toGenerate = new Set<OutputType>(report.missing_output_types);
    for (const q of report.question_types) {
      if (!q.present && QUESTION_TYPE_LABEL_TO_OUTPUT[q.type]) toGenerate.add(QUESTION_TYPE_LABEL_TO_OUTPUT[q.type]);
    }
    for (const a of report.revision_assets) {
      if (!a.present && ASSET_LABEL_TO_OUTPUT[a.asset]) toGenerate.add(ASSET_LABEL_TO_OUTPUT[a.asset]);
    }
    // In source-coverage mode, also regenerate handwritten notes if any chapter has missing items.
    if (report.mode === "source_coverage" && report.chapters.some((c) => c.status !== "covered" || c.missing_items.length)) {
      toGenerate.add("handwritten_notes");
    }
    if (toGenerate.size === 0) { toast.info("Nothing missing — every output already covers the source."); return; }
    setFixing(true);
    try {
      for (const t of toGenerate) {
        toast.message(`Generating ${OUTPUT_LABELS[t].label}…`);
        try { await gen({ data: { documentId, outputType: t } }); }
        catch (e: any) { toast.error(`${OUTPUT_LABELS[t].label}: ${e?.message || "failed"}`); }
      }
      qc.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Missing content regenerated — re-running audit");
      await runAudit();
    } finally {
      setFixing(false);
    }
  }

  async function regenerateForChapter(chapter: string) {
    setRegenChapter(chapter);
    try {
      toast.message(`Regenerating handwritten notes (focus: ${chapter})…`);
      await gen({ data: { documentId, outputType: "handwritten_notes" } });
      qc.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Regenerated — re-running audit");
      await runAudit();
    } catch (e: any) {
      toast.error(e?.message || "Regeneration failed");
    } finally {
      setRegenChapter(null);
    }
  }

  return (
    <section className="mt-4 rounded-lg border border-accent/40 bg-accent/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-accent" />
          <h4 className="font-serif text-base font-semibold">Final Checker</h4>
          <span className="text-xs text-muted-foreground">Context-aware coverage audit</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="default" onClick={runAudit} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <ClipboardCheck className="mr-2 h-3.5 w-3.5" />}
            {report ? "Re-run Final Checker" : "Final Checker"}
          </Button>
          {report && (
            <>
              <Button size="sm" variant="outline" onClick={() => downloadFinalCheckerPdf(report)}>
                <Download className="mr-2 h-3.5 w-3.5" /> Report PDF
              </Button>
              <Button size="sm" variant="secondary" onClick={fixMissing} disabled={fixing}>
                {fixing ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Wand2 className="mr-2 h-3.5 w-3.5" />}
                Fix Missing Content
              </Button>
            </>
          )}
        </div>
      </div>

      {!report && !loading && (
        <p className="mt-3 text-xs text-muted-foreground">
          First detects the document type, then verifies every concept from <span className="font-medium">{documentTitle}</span> has been converted into the generated notes. Magazines, reports and single books are checked source-to-notes only — never against the entire UPSC syllabus.
        </p>
      )}

      {report && (
        <div className="mt-4 grid gap-5">
          <DocTypeBanner report={report} />
          <ScoreDashboard report={report} />
          {report.mode === "source_coverage" ? (
            <>
              <ChaptersSection chapters={report.chapters} onRegenerate={regenerateForChapter} regenChapter={regenChapter} />
              <IntegritySection report={report} />
            </>
          ) : (
            <SyllabusSection report={report} />
          )}
          <ChecklistGrid title="Question Bank" items={report.question_types.map((q) => ({ label: q.type, present: q.present, note: q.note }))} />
          <ChecklistGrid title="Revision Material" items={report.revision_assets.map((r) => ({ label: r.asset, present: r.present, note: r.note }))} />
          {report.weak_areas.length > 0 && (
            <Bullet title="Weak Areas" items={report.weak_areas} icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-600" />} />
          )}
          {report.recommendations.length > 0 && (
            <Bullet title="Recommendations" items={report.recommendations} icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />} />
          )}
          <p className="text-[11px] leading-5 text-muted-foreground">
            {report.mode === "source_coverage"
              ? "Source-coverage mode: only items present in your uploaded material are evaluated. Unrelated UPSC areas are intentionally not flagged."
              : "Syllabus mode: this document was detected as full-syllabus material, so it was audited against the official UPSC taxonomy."}
          </p>
        </div>
      )}
    </section>
  );
}

function DocTypeBanner({ report }: { report: FinalCheckerReport }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-paper px-3 py-2">
      <div className="flex items-center gap-2 text-sm">
        <FileText className="h-4 w-4 text-primary" />
        <span className="font-medium">Detected type:</span>
        <Badge variant="default">{report.document_type}</Badge>
        <Badge variant="outline">{report.mode === "source_coverage" ? "Source-coverage mode" : "Syllabus mode"}</Badge>
      </div>
      {report.document_type_reason && (
        <span className="text-xs text-muted-foreground">{report.document_type_reason}</span>
      )}
    </div>
  );
}

function ScoreDashboard({ report }: { report: FinalCheckerReport }) {
  const items: Array<[string, number]> = Object.entries(report.scores).map(([k, v]) => [k.replace(/_/g, " "), v as number]);
  return (
    <div className="rounded-lg border border-border bg-paper p-4">
      <div className="flex items-baseline justify-between">
        <h5 className="font-serif text-lg font-semibold">{report.mode === "source_coverage" ? "Source-to-Notes Completeness" : "Quality Score"}</h5>
        <span className="font-serif text-3xl font-bold text-primary">{report.overall_score}%</span>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {items.map(([label, val]) => (
          <div key={label}>
            <div className="flex justify-between text-xs">
              <span className="capitalize text-muted-foreground">{label}</span>
              <span className="font-medium">{val}%</span>
            </div>
            <Progress value={val} className="mt-1 h-1.5" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ChaptersSection({ chapters, onRegenerate, regenChapter }: { chapters: ChapterCoverage[]; onRegenerate: (c: string) => void; regenChapter: string | null }) {
  if (chapters.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-background p-4 text-center text-sm text-muted-foreground">
        No chapters/sections detected yet. Generate handwritten notes first, then re-run the checker.
      </div>
    );
  }
  return (
    <div>
      <h5 className="font-serif text-lg font-semibold">Chapter-by-Chapter Coverage</h5>
      <p className="text-xs text-muted-foreground">✅ Fully covered · 🟡 Partially covered · 🔴 Not covered</p>
      <div className="mt-3 grid gap-3">
        {chapters.map((c, idx) => (
          <div key={`${c.chapter}-${idx}`} className="rounded-md border border-border bg-background p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base">{STATUS_ICON[c.status] || "🔴"}</span>
                <h6 className="font-serif font-semibold">{c.chapter}</h6>
                <Badge variant="outline">{c.coverage_pct}% covered</Badge>
              </div>
              {c.status !== "covered" && (
                <Button size="sm" variant="ghost" disabled={regenChapter === c.chapter} onClick={() => onRegenerate(c.chapter)}>
                  {regenChapter === c.chapter ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-1.5 h-3.5 w-3.5" />}
                  Regenerate missing parts
                </Button>
              )}
            </div>
            <Progress value={c.coverage_pct} className="mt-2 h-1.5" />

            {c.subtopics.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {c.subtopics.map((s, i) => (
                  <span key={i} title={s.note || s.status} className={`rounded border px-2 py-0.5 text-[11px] ${STATUS_COLOR[s.status]}`}>
                    {s.topic}
                  </span>
                ))}
              </div>
            )}

            {c.missing_items.length > 0 && (
              <div className="mt-3">
                <div className="text-xs font-semibold text-rose-700">Missing from generated notes</div>
                <ul className="mt-1 space-y-0.5 text-xs">
                  {c.missing_items.map((m, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="mt-0.5 inline-block rounded bg-rose-100 px-1.5 text-[10px] uppercase text-rose-800">{m.kind}</span>
                      <span>{m.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <AssetRow assets={c.preserved_assets} />
          </div>
        ))}
      </div>
    </div>
  );
}

function AssetRow({ assets }: { assets: ChapterCoverage["preserved_assets"] }) {
  const items: Array<[string, boolean]> = [
    ["Tables", assets.tables], ["Diagrams", assets.diagrams], ["Maps", assets.maps],
    ["Case studies", assets.case_studies], ["Examples", assets.examples], ["Keywords", assets.keywords],
  ];
  return (
    <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
      {items.map(([label, ok]) => (
        <span key={label} className={`rounded border px-2 py-0.5 ${ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}>
          {ok ? "✓" : "✗"} {label}
        </span>
      ))}
    </div>
  );
}

function IntegritySection({ report }: { report: FinalCheckerReport }) {
  const { integrity } = report;
  return (
    <div className="rounded-md border border-border bg-background p-3 text-sm">
      <h5 className="font-serif text-lg font-semibold">Content Integrity</h5>
      <ul className="mt-2 space-y-1 text-sm">
        <li>{integrity.sequence_preserved ? "✅" : "🔴"} Original sequence preserved</li>
        <li>{integrity.pages_skipped.length === 0 ? "✅ No pages skipped" : `🔴 Pages skipped: ${integrity.pages_skipped.join(", ")}`}</li>
        {integrity.notes && <li className="text-xs text-muted-foreground">{integrity.notes}</li>}
      </ul>
    </div>
  );
}

function SyllabusSection({ report }: { report: FinalCheckerReport }) {
  if (!report.syllabus) return null;
  return (
    <div>
      <h5 className="font-serif text-lg font-semibold">UPSC Syllabus Coverage</h5>
      <p className="text-xs text-muted-foreground">This document was detected as full-syllabus material.</p>
      <div className="mt-3 grid gap-3">
        {report.syllabus.map((s) => (
          <div key={s.key} className="rounded-md border border-border bg-background p-3">
            <div className="flex items-center justify-between gap-3">
              <h6 className="font-serif font-semibold">{s.label}</h6>
              <Badge variant="outline">{s.coverage_pct}%</Badge>
            </div>
            <Progress value={s.coverage_pct} className="mt-2 h-1.5" />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {s.micro_topics.map((m) => (
                <span key={m.topic} title={m.note || m.status} className={`rounded border px-2 py-0.5 text-[11px] ${STATUS_COLOR[m.status]}`}>
                  {m.topic}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChecklistGrid({ title, items }: { title: string; items: Array<{ label: string; present: boolean; note?: string }> }) {
  return (
    <div>
      <h5 className="font-serif text-lg font-semibold">{title}</h5>
      <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {items.map((i) => (
          <div key={i.label} className="flex items-start gap-2 rounded-md border border-border bg-background px-2 py-1.5 text-sm">
            {i.present ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" /> : <XCircle className="mt-0.5 h-4 w-4 text-rose-600" />}
            <div>
              <div className="font-medium">{i.label}</div>
              {i.note && <div className="text-xs text-muted-foreground">{i.note}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Bullet({ title, items, icon }: { title: string; items: string[]; icon: React.ReactNode }) {
  return (
    <div>
      <h5 className="font-serif text-lg font-semibold">{title}</h5>
      <ul className="mt-2 space-y-1 text-sm">
        {items.map((t, i) => <li key={i} className="flex items-start gap-2">{icon}<span>{t}</span></li>)}
      </ul>
    </div>
  );
}
