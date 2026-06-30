import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { toast } from "sonner";
import type { FinalCheckerReport } from "@/lib/final-checker.functions";

const PAGE = { width: 595.28, height: 841.89, margin: 48 };

function sanitize(s: string) {
  return (s || "")
    .replace(/\r/g, "")
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014\u2015]/g, "-")
    .replace(/[\u2022\u25CF\u25E6\u2043]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[\u2192\u27A1]/g, "->").replace(/\u2190/g, "<-").replace(/\u2194/g, "<->")
    .replace(/\u2264/g, "<=").replace(/\u2265/g, ">=").replace(/\u00D7/g, "x")
    .replace(/[\u00A0\u2009\u200A\u202F]/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "");
}

function splitLong(word: string, font: PDFFont, size: number, maxW: number): string[] {
  const out: string[] = [];
  let cur = "";
  for (const ch of word) {
    const next = cur + ch;
    if (font.widthOfTextAtSize(next, size) > maxW && cur) { out.push(cur); cur = ch; }
    else cur = next;
  }
  if (cur) out.push(cur);
  return out;
}

function wrap(text: string, font: PDFFont, size: number, maxW: number): string[] {
  const out: string[] = [];
  for (const para of sanitize(text).split("\n")) {
    const words = para.split(/\s+/);
    let line = "";
    for (const w of words) {
      if (!w) continue;
      if (font.widthOfTextAtSize(w, size) > maxW) {
        if (line) { out.push(line); line = ""; }
        const chunks = splitLong(w, font, size, maxW);
        for (let i = 0; i < chunks.length - 1; i++) out.push(chunks[i]);
        line = chunks[chunks.length - 1] ?? "";
        continue;
      }
      const next = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(next, size) > maxW && line) { out.push(line); line = w; }
      else line = next;
    }
    if (line) out.push(line);
  }
  return out;
}

export async function downloadFinalCheckerPdf(report: FinalCheckerReport) {
  const wmCtx = "final-checker-pdf";
  const startedAt = Date.now();
  console.info(`[watermark:${wmCtx}] export starting`, { documentTitle: report.document_title });
  const pdf = await PDFDocument.create();
  const { loadWatermarkImage, drawWatermarkOnPage } = await import("./pdf-watermark");
  let watermark: Awaited<ReturnType<typeof loadWatermarkImage>>;
  try {
    watermark = await loadWatermarkImage(pdf);
    console.info(`[watermark:${wmCtx}] logo loaded & embedded`);
  } catch (err) {
    const msg = (err as Error)?.message || "Watermark logo missing.";
    console.error(`[watermark:${wmCtx}] watermark unavailable — aborting export`, { error: msg });
    toast.error("SIDHESWAR watermark missing", {
      description: `${msg} Final Checker PDF export aborted.`,
    });
    throw err;
  }


  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page: PDFPage = pdf.addPage([PAGE.width, PAGE.height]);
  drawWatermarkOnPage(page, watermark);
  let y = PAGE.height - PAGE.margin;
  const maxW = PAGE.width - PAGE.margin * 2;

  const indigo = rgb(0.1, 0.12, 0.26);
  const gold = rgb(0.68, 0.47, 0.18);
  const ink = rgb(0.15, 0.16, 0.22);
  const muted = rgb(0.4, 0.42, 0.5);

  function newPage() { page = pdf.addPage([PAGE.width, PAGE.height]); drawWatermarkOnPage(page, watermark); y = PAGE.height - PAGE.margin; }
  function ensure(h: number) { if (y - h < PAGE.margin) newPage(); }
  function draw(text: string, opts: { font?: PDFFont; size?: number; color?: any; gap?: number } = {}) {
    const font = opts.font ?? regular;
    const size = opts.size ?? 10;
    const color = opts.color ?? ink;
    for (const line of wrap(text, font, size, maxW)) {
      ensure(size + 2);
      page.drawText(line, { x: PAGE.margin, y: y - size, size, font, color });
      y -= size + 3;
    }
    y -= opts.gap ?? 4;
  }

  draw("UPSC Mitra — Final Checker Report", { font: bold, size: 18, color: indigo, gap: 6 });
  draw(`Document: ${report.document_title}`, { font: bold, size: 11, gap: 2 });
  draw(`Detected type: ${report.document_type} (${report.mode === "source_coverage" ? "Source-coverage mode" : "Syllabus mode"})`, { size: 10, gap: 2 });
  if (report.document_type_reason) draw(report.document_type_reason, { size: 9, color: muted, gap: 2 });
  draw(`Generated: ${new Date(report.generated_at).toLocaleString()}`, { size: 9, color: muted, gap: 10 });

  draw(`Overall Completeness: ${report.overall_score}%`, { font: bold, size: 14, color: gold, gap: 6 });
  for (const [k, v] of Object.entries(report.scores)) draw(`- ${k.replace(/_/g, " ")}: ${v}%`, { size: 10 });
  y -= 6;

  if (report.mode === "source_coverage") {
    draw("Chapter-by-Chapter Coverage", { font: bold, size: 13, color: indigo, gap: 4 });
    if (report.chapters.length === 0) draw("(no chapters detected — generate notes first)", { size: 10, color: muted });
    for (const c of report.chapters) {
      const mark = c.status === "covered" ? "[X]" : c.status === "partial" ? "[~]" : "[ ]";
      draw(`${mark} ${c.chapter} — ${c.coverage_pct}%`, { font: bold, size: 11, gap: 2 });
      for (const s of c.subtopics) {
        const sm = s.status === "covered" ? "[X]" : s.status === "partial" ? "[~]" : "[ ]";
        draw(`  ${sm} ${s.topic}${s.note ? ` — ${s.note}` : ""}`, { size: 9 });
      }
      if (c.missing_items.length) {
        draw("  Missing items:", { font: bold, size: 9, color: gold });
        for (const m of c.missing_items) draw(`    • [${m.kind}] ${m.text}`, { size: 9 });
      }
      y -= 4;
    }

    draw("Content Integrity", { font: bold, size: 13, color: indigo, gap: 4 });
    draw(`Sequence preserved: ${report.integrity.sequence_preserved ? "yes" : "no"}`, { size: 10 });
    draw(`Pages skipped: ${report.integrity.pages_skipped.length ? report.integrity.pages_skipped.join(", ") : "none"}`, { size: 10 });
    if (report.integrity.notes) draw(report.integrity.notes, { size: 9, color: muted });
    y -= 6;
  } else if (report.syllabus) {
    draw("UPSC Syllabus Coverage", { font: bold, size: 13, color: indigo, gap: 4 });
    for (const s of report.syllabus) {
      draw(`${s.label} — ${s.coverage_pct}%`, { font: bold, size: 11, gap: 2 });
      for (const m of s.micro_topics) {
        const mark = m.status === "covered" ? "[X]" : m.status === "partial" ? "[~]" : "[ ]";
        draw(`  ${mark} ${m.topic}${m.note ? ` — ${m.note}` : ""}`, { size: 9 });
      }
      y -= 4;
    }
    if (report.pyq) {
      draw("PYQ Coverage", { font: bold, size: 13, color: indigo, gap: 4 });
      if (report.pyq.note) draw(report.pyq.note, { size: 10 });
      if (report.pyq.covered_themes.length) draw("Covered themes: " + report.pyq.covered_themes.join(", "), { size: 10 });
      if (report.pyq.frequently_tested.length) draw("Frequently tested: " + report.pyq.frequently_tested.join(", "), { size: 10 });
      if (report.pyq.gaps.length) draw("Gaps: " + report.pyq.gaps.join(", "), { size: 10 });
      y -= 6;
    }
  }

  draw("Question Bank Status", { font: bold, size: 13, color: indigo, gap: 4 });
  for (const q of report.question_types) draw(`${q.present ? "[X]" : "[ ]"} ${q.type}${q.note ? ` — ${q.note}` : ""}`, { size: 10 });
  y -= 6;

  draw("Revision Material Status", { font: bold, size: 13, color: indigo, gap: 4 });
  for (const r of report.revision_assets) draw(`${r.present ? "[X]" : "[ ]"} ${r.asset}${r.note ? ` — ${r.note}` : ""}`, { size: 10 });
  y -= 6;

  if (report.weak_areas.length) {
    draw("Weak Areas", { font: bold, size: 13, color: indigo, gap: 4 });
    for (const w of report.weak_areas) draw("- " + w, { size: 10 });
    y -= 6;
  }
  if (report.recommendations.length) {
    draw("Recommendations", { font: bold, size: 13, color: indigo, gap: 4 });
    for (const r of report.recommendations) draw("- " + r, { size: 10 });
  }

  draw(report.mode === "source_coverage"
    ? "\nNote: Source-coverage mode evaluates only what appears in your uploaded material. Unrelated UPSC areas are intentionally not flagged."
    : "\nNote: Syllabus mode audits against the official UPSC taxonomy because this document was detected as full-syllabus material.", { size: 8, color: muted });

  const bytes = await pdf.save();
  const pageCount = pdf.getPages().length;
  console.info(`[watermark:${wmCtx}] export complete`, {
    documentTitle: report.document_title,
    pageCount,
    durationMs: Date.now() - startedAt,
  });
  const { getWatermarkSettings, getUserLogoDataUrl } = await import("@/lib/user-logo");
  const usingUser = getWatermarkSettings().enabled && !!getUserLogoDataUrl();
  toast.success(usingUser ? "Your logo stamped" : "SIDHESWAR watermark applied", {
    description: `Logo ✓ applied to all ${pageCount} page${pageCount === 1 ? "" : "s"} (Final Checker report).`,
  });
  const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `final-checker-${report.document_title.replace(/[^a-z0-9-_]+/gi, "-").slice(0, 60)}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

