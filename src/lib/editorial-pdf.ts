import { jsPDF } from "jspdf";
import type { EditorialRow, EditorialItem } from "@/lib/editorial-lab.functions";
import { PDFDocument } from "pdf-lib";
import { applyWatermarkToAllPages } from "@/lib/pdf-watermark";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 42;
const MAX_W = PAGE_W - MARGIN * 2;
const USABLE_H = PAGE_H - MARGIN * 2;

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
  color?: [number, number, number];
  gap?: number;
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
  startY: number,
  scale: number,
  draw: boolean,
): number {
  let y = startY;

  const line = (txt: string, opts: LineOpts = {}) => {
    const size = (opts.size ?? 11) * scale;
    if (draw) {
      doc.setFont("helvetica", opts.bold ? "bold" : "normal");
      doc.setFontSize(size);
      doc.setTextColor(...(opts.color ?? [30, 30, 40]));
    } else {
      doc.setFontSize(size);
    }
    const wrapped = doc.splitTextToSize(sanitize(txt), MAX_W) as string[];
    for (const w of wrapped) {
      if (draw) doc.text(w, MARGIN, y);
      y += size + 3 * scale;
    }
    y += (opts.gap ?? 2) * scale;
  };

  const heading = (txt: string, size = 13) => {
    y += 5 * scale;
    line(txt, { size, bold: true, color: [60, 40, 120] });
  };

  const bullets = (items: string[]) => {
    for (const it of items) line(`- ${it}`, { size: 10.5 });
  };

  // Title + syllabus
  line(`${index + 1}. ${it.title}`, { size: 15, bold: true, color: [30, 30, 60] });
  line(
    `${it.syllabus.stage} • ${it.syllabus.paper} • ${it.syllabus.subject} • ${it.syllabus.topic}${it.syllabus.subTopic ? " • " + it.syllabus.subTopic : ""}`,
    { size: 9.5, color: [110, 110, 130] },
  );
  line(`Importance: ${it.importance}`, { size: 9.5, color: [180, 90, 40] });

  if (it.crispNotes?.length) {
    heading("Crisp Notes");
    bullets(it.crispNotes);
  }
  if (it.comprehensiveNotes) {
    heading("Comprehensive Notes");
    line(it.comprehensiveNotes, { size: 10.5 });
  }
  if (it.argumentsFor?.length) {
    heading("Arguments — For");
    bullets(it.argumentsFor);
  }
  if (it.argumentsAgainst?.length) {
    heading("Arguments — Against");
    bullets(it.argumentsAgainst);
  }
  if (it.keyFacts?.length) {
    heading("Key Facts");
    bullets(it.keyFacts);
  }
  if (it.vocabulary?.length) {
    heading("Vocabulary");
    it.vocabulary.forEach((v) => line(`• ${v.word} — ${v.meaning}`, { size: 10.5 }));
  }
  if (it.wayForward?.length) {
    heading("Way Forward");
    bullets(it.wayForward);
  }
  if (it.pyqLinks?.length) {
    heading("PYQ Links");
    it.pyqLinks.forEach((p) =>
      line(`${p.year ? p.year + " " : ""}${p.paper ? "(" + p.paper + ") " : ""}${p.question}`, {
        size: 10.5,
      }),
    );
  }
  if (it.probablePrelimsMCQ) {
    heading("Probable Prelims MCQ");
    line(it.probablePrelimsMCQ.q, { size: 10.5, bold: true });
    it.probablePrelimsMCQ.options.forEach((o, j) =>
      line(
        `${String.fromCharCode(65 + j)}. ${o}${j === it.probablePrelimsMCQ!.answer ? "  (correct)" : ""}`,
        { size: 10.5 },
      ),
    );
    line(`Explanation: ${it.probablePrelimsMCQ.explanation}`, { size: 9.5, color: [90, 90, 110] });
  }
  if (it.probableMainsQuestion) {
    heading("Probable Mains Question");
    line(
      `${it.probableMainsQuestion.paper} • ${it.probableMainsQuestion.marks} marks`,
      { size: 9.5, color: [110, 110, 130] },
    );
    line(it.probableMainsQuestion.q, { size: 10.5, bold: true });
    line(`Approach: ${it.probableMainsQuestion.approach}`, { size: 9.5 });
  }
  if (it.diagramMermaid) {
    heading("Diagram (Mermaid source)");
    line(it.diagramMermaid, { size: 8.5, color: [90, 90, 110] });
  }

  return y;
}

export async function editorialsToPdf(row: EditorialRow): Promise<Blob> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  // ---- Cover page ----
  let y = MARGIN;
  const drawCoverLine = (txt: string, size: number, color: [number, number, number], bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const wrapped = doc.splitTextToSize(sanitize(txt), MAX_W) as string[];
    for (const w of wrapped) {
      doc.text(w, MARGIN, y);
      y += size + 4;
    }
    y += 4;
  };
  drawCoverLine(row.newspaper || "Newspaper", 22, [40, 30, 100], true);
  drawCoverLine(
    `${row.edition_date || row.created_at?.slice(0, 10) || ""}  •  UPSC Genius AI — Editorial Notes`,
    11,
    [100, 100, 120],
  );
  if (row.source_label) drawCoverLine(row.source_label, 10, [120, 120, 140]);
  doc.setDrawColor(200, 200, 210);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);

  // ---- One editorial per page (auto-shrink to fit) ----
  const items = row.analysis?.editorials ?? [];
  const scaleSteps = [1, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5];

  items.forEach((it, i) => {
    doc.addPage();
    // Find the largest scale that keeps the editorial within one page.
    let fitScale = scaleSteps[scaleSteps.length - 1];
    for (const s of scaleSteps) {
      const endY = paintEditorial(doc, it, i, MARGIN, s, false);
      if (endY - MARGIN <= USABLE_H) {
        fitScale = s;
        break;
      }
    }
    paintEditorial(doc, it, i, MARGIN, fitScale, true);
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