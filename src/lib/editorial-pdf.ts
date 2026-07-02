import { jsPDF } from "jspdf";
import type { EditorialRow, EditorialItem } from "@/lib/editorial-lab.functions";
import { PDFDocument } from "pdf-lib";
import { applyWatermarkToAllPages } from "@/lib/pdf-watermark";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 48;
const MAX_W = PAGE_W - MARGIN * 2;
const USABLE_H = PAGE_H - MARGIN * 2;

// Palette — richer, editorial magazine feel.
const INK: [number, number, number] = [22, 22, 34];
const ACCENT: [number, number, number] = [79, 46, 168];      // deep violet
const ACCENT_SOFT: [number, number, number] = [246, 242, 255];
const MUTED: [number, number, number] = [110, 110, 130];
const RULE: [number, number, number] = [220, 216, 232];
const WARN: [number, number, number] = [190, 90, 40];
const GOOD: [number, number, number] = [30, 120, 80];
const BAD: [number, number, number] = [175, 45, 60];

function sanitize(s: unknown): string {
  if (s == null) return "";
  return String(s)
    .replace(/\r/g, "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2022]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u2192/g, "->");
}

type LineOpts = {
  size?: number;
  bold?: boolean;
  italic?: boolean;
  color?: [number, number, number];
  gap?: number;
  lineGap?: number;
};

/**
 * Render a single editorial onto `doc` starting at `startY` using the given
 * scale (1 = base sizes). When `draw` is false we only measure, so we can
 * find the largest scale (<=1) that keeps the whole editorial on one page.
 * Returns the final Y coordinate.
 */
function paintEditorial(
  doc: jsPDF,
  it: EditorialItem,
  index: number,
  totalCount: number,
  startY: number,
): number {
  let y = startY;

  const ensureRoom = (need: number) => {
    if (y + need > PAGE_H - MARGIN) {
      doc.addPage();
      y = MARGIN;
      drawPageChrome(doc, `${index + 1} / ${totalCount}  •  ${sanitize(it.title)}`);
      y += 8;
    }
  };

  const line = (txt: string, opts: LineOpts = {}) => {
    const size = opts.size ?? 12;
    const font = opts.italic ? "times" : "helvetica";
    const style = opts.italic ? (opts.bold ? "bolditalic" : "italic") : opts.bold ? "bold" : "normal";
    doc.setFont(font, style);
    doc.setFontSize(size);
    doc.setTextColor(...(opts.color ?? INK));
    const wrapped = doc.splitTextToSize(sanitize(txt), MAX_W) as string[];
    for (const w of wrapped) {
      ensureRoom(size + (opts.lineGap ?? 4));
      doc.text(w, MARGIN, y);
      y += size + (opts.lineGap ?? 4);
    }
    y += opts.gap ?? 3;
  };

  const heading = (txt: string) => {
    ensureRoom(34);
    y += 8;
    // Accent bar
    doc.setFillColor(...ACCENT);
    doc.rect(MARGIN, y - 10, 4, 16, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...ACCENT);
    doc.text(sanitize(txt).toUpperCase(), MARGIN + 12, y + 2);
    y += 14;
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 10;
  };

  const bullets = (items: string[], opts: { color?: [number, number, number] } = {}) => {
    for (const b of items) {
      const size = 12;
      const wrapped = doc.splitTextToSize(sanitize(b), MAX_W - 16) as string[];
      doc.setFont("helvetica", "bold");
      doc.setFontSize(size);
      doc.setTextColor(...(opts.color ?? ACCENT));
      ensureRoom(size + 5);
      doc.text("•", MARGIN + 2, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...INK);
      for (let i = 0; i < wrapped.length; i++) {
        if (i > 0) ensureRoom(size + 5);
        doc.text(wrapped[i], MARGIN + 16, y);
        y += size + 5;
      }
      y += 2;
    }
  };

  // ---------- Title block ----------
  // Small eyebrow: index / importance chip row.
  doc.setFillColor(...ACCENT_SOFT);
  doc.roundedRect(MARGIN, y - 4, 62, 20, 4, 4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...ACCENT);
  doc.text(`EDITORIAL ${String(index + 1).padStart(2, "0")}`, MARGIN + 8, y + 10);

  const impColor: [number, number, number] =
    it.importance?.toLowerCase() === "high"
      ? BAD
      : it.importance?.toLowerCase() === "medium"
        ? WARN
        : GOOD;
  const impLabel = `Importance: ${it.importance || "—"}`;
  doc.setFontSize(9.5);
  doc.setTextColor(...impColor);
  const impW = doc.getTextWidth(impLabel) + 16;
  doc.setDrawColor(...impColor);
  doc.setLineWidth(0.8);
  doc.roundedRect(MARGIN + 72, y - 4, impW, 20, 4, 4, "S");
  doc.text(impLabel, MARGIN + 80, y + 10);
  y += 30;

  // Big serif title.
  doc.setFont("times", "bold");
  doc.setFontSize(26);
  doc.setTextColor(...INK);
  const titleLines = doc.splitTextToSize(sanitize(it.title), MAX_W) as string[];
  for (const t of titleLines) {
    ensureRoom(30);
    doc.text(t, MARGIN, y);
    y += 30;
  }
  y += 2;

  // Syllabus tag row.
  const syll = `${it.syllabus.stage}  ›  ${it.syllabus.paper}  ›  ${it.syllabus.subject}  ›  ${it.syllabus.topic}${it.syllabus.subTopic ? "  ›  " + it.syllabus.subTopic : ""}`;
  line(syll, { size: 10, color: MUTED, italic: true, gap: 6 });

  // Divider.
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(1.2);
  doc.line(MARGIN, y, MARGIN + 60, y);
  y += 14;

  // ---------- Sections ----------
  if (it.crispNotes?.length) {
    heading("Crisp Notes");
    bullets(it.crispNotes);
  }
  if (it.comprehensiveNotes) {
    heading("Comprehensive Analysis");
    line(it.comprehensiveNotes, { size: 12, lineGap: 5 });
  }
  if (it.argumentsFor?.length) {
    heading("Arguments — For");
    bullets(it.argumentsFor, { color: GOOD });
  }
  if (it.argumentsAgainst?.length) {
    heading("Arguments — Against");
    bullets(it.argumentsAgainst, { color: BAD });
  }
  if (it.keyFacts?.length) {
    heading("Key Facts & Data");
    bullets(it.keyFacts);
  }
  if (it.vocabulary?.length) {
    heading("Vocabulary");
    it.vocabulary.forEach((v) => {
      ensureRoom(20);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...ACCENT);
      doc.text(sanitize(v.word), MARGIN, y);
      const wW = doc.getTextWidth(sanitize(v.word));
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...INK);
      const meaning = doc.splitTextToSize(sanitize(" — " + v.meaning), MAX_W - wW) as string[];
      doc.text(meaning[0] ?? "", MARGIN + wW, y);
      y += 17;
      for (let i = 1; i < meaning.length; i++) {
        ensureRoom(17);
        doc.text(meaning[i], MARGIN, y);
        y += 17;
      }
      y += 2;
    });
  }
  if (it.wayForward?.length) {
    heading("Way Forward");
    bullets(it.wayForward, { color: GOOD });
  }
  if (it.pyqLinks?.length) {
    heading("PYQ Links");
    it.pyqLinks.forEach((p) => {
      const tag = `${p.year ? p.year + " " : ""}${p.paper ? "(" + p.paper + ")" : ""}`.trim();
      if (tag) line(tag, { size: 10, bold: true, color: ACCENT, gap: 1 });
      line(p.question, { size: 12, lineGap: 5 });
    });
  }
  if (it.probablePrelimsMCQ) {
    heading("Probable Prelims MCQ");
    line(it.probablePrelimsMCQ.q, { size: 12.5, bold: true, lineGap: 5 });
    it.probablePrelimsMCQ.options.forEach((o, j) => {
      const correct = j === it.probablePrelimsMCQ!.answer;
      line(`${String.fromCharCode(65 + j)}.  ${o}${correct ? "   ✓" : ""}`, {
        size: 12,
        bold: correct,
        color: correct ? GOOD : INK,
      });
    });
    line(`Why: ${it.probablePrelimsMCQ.explanation}`, {
      size: 10.5,
      italic: true,
      color: MUTED,
    });
  }
  if (it.probableMainsQuestion) {
    heading("Probable Mains Question");
    line(
      `${it.probableMainsQuestion.paper}  •  ${it.probableMainsQuestion.marks} marks`,
      { size: 10, bold: true, color: ACCENT },
    );
    line(it.probableMainsQuestion.q, { size: 13, bold: true, lineGap: 5 });
    line(`Approach: ${it.probableMainsQuestion.approach}`, { size: 11, italic: true, color: MUTED });
  }
  if (it.diagramMermaid) {
    heading("Diagram (Mermaid Source)");
    line(it.diagramMermaid, { size: 9.5, color: MUTED, lineGap: 3 });
  }

  return y;
}

function drawPageChrome(doc: jsPDF, header: string) {
  // Top header rule.
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, MARGIN - 18, PAGE_W - MARGIN, MARGIN - 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text(sanitize(header), MARGIN, MARGIN - 24);
  doc.text("UPSC Genius AI · Editorial Lab", PAGE_W - MARGIN, MARGIN - 24, { align: "right" });
  // Bottom footer.
  const page = doc.getNumberOfPages();
  doc.text(`Page ${page}`, PAGE_W - MARGIN, PAGE_H - 20, { align: "right" });
}

export async function editorialsToPdf(row: EditorialRow): Promise<Blob> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const items = row.analysis?.editorials ?? [];

  // ---- Cover page (magazine style) ----
  // Solid accent band on the left.
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, 14, PAGE_H, "F");
  // Soft header wash.
  doc.setFillColor(...ACCENT_SOFT);
  doc.rect(0, 0, PAGE_W, 220, "F");

  let y = 120;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...ACCENT);
  doc.text("UPSC GENIUS AI  ·  EDITORIAL LAB", MARGIN, y);
  y += 40;

  doc.setFont("times", "bold");
  doc.setFontSize(46);
  doc.setTextColor(...INK);
  const titleWrap = doc.splitTextToSize(sanitize(row.newspaper || "Newspaper"), MAX_W) as string[];
  for (const t of titleWrap) {
    doc.text(t, MARGIN, y);
    y += 48;
  }
  y += 6;
  doc.setFont("times", "italic");
  doc.setFontSize(16);
  doc.setTextColor(...MUTED);
  doc.text(
    sanitize(row.edition_date || row.created_at?.slice(0, 10) || ""),
    MARGIN,
    y,
  );
  y += 30;
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(2);
  doc.line(MARGIN, y, MARGIN + 80, y);
  y += 40;

  // Table of contents.
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...ACCENT);
  doc.text("IN THIS ISSUE", MARGIN, y);
  y += 18;
  doc.setDrawColor(...RULE);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 14;

  items.forEach((it, i) => {
    if (y > PAGE_H - MARGIN - 40) return;
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...INK);
    const num = `${String(i + 1).padStart(2, "0")}`;
    doc.text(num, MARGIN, y);
    const wrap = doc.splitTextToSize(sanitize(it.title), MAX_W - 40) as string[];
    doc.text(wrap[0] ?? "", MARGIN + 32, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...MUTED);
    doc.text(
      sanitize(`${it.syllabus.paper}  ›  ${it.syllabus.subject}  ›  ${it.syllabus.topic}`),
      MARGIN + 32,
      y,
    );
    y += 16;
  });

  if (row.source_label) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(sanitize(row.source_label), MARGIN, PAGE_H - 30);
  }

  // ---- One (or more) pages per editorial ----
  items.forEach((it, i) => {
    doc.addPage();
    drawPageChrome(doc, `${i + 1} / ${items.length}  •  ${sanitize(it.title)}`);
    paintEditorial(doc, it, i, items.length, MARGIN + 8);
  });

  const rawBlob = doc.output("blob");
  // Stamp the user's logo (or the default SIDHESWAR watermark) onto every page.
  try {
    const bytes = new Uint8Array(await rawBlob.arrayBuffer());
    const pdfDoc = await PDFDocument.load(bytes);
    await applyWatermarkToAllPages(pdfDoc, "editorial-lab");
    const stamped = await pdfDoc.save();
    const buf = stamped.buffer.slice(
      stamped.byteOffset,
      stamped.byteOffset + stamped.byteLength,
    ) as ArrayBuffer;
    return new Blob([buf], { type: "application/pdf" });
  } catch (err) {
    console.warn("[editorial-pdf] watermark failed, returning unstamped PDF", err);
    return rawBlob;
  }
}