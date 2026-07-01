import { jsPDF } from "jspdf";
import type { EditorialRow, EditorialItem } from "@/lib/editorial-lab.functions";
import { PDFDocument } from "pdf-lib";
import { applyWatermarkToAllPages } from "@/lib/pdf-watermark";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 48;
const MAX_W = PAGE_W - MARGIN * 2;

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

export async function editorialsToPdf(row: EditorialRow): Promise<Blob> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  let y = MARGIN;

  const ensureRoom = (needed: number) => {
    if (y + needed > PAGE_H - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const line = (
    txt: string,
    opts: { size?: number; bold?: boolean; color?: [number, number, number]; gap?: number } = {},
  ) => {
    const size = opts.size ?? 11;
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...(opts.color ?? [30, 30, 40]));
    const wrapped = doc.splitTextToSize(sanitize(txt), MAX_W) as string[];
    for (const w of wrapped) {
      ensureRoom(size + 4);
      doc.text(w, MARGIN, y);
      y += size + 4;
    }
    y += opts.gap ?? 2;
  };

  const heading = (txt: string, size = 14) => {
    y += 6;
    // Keep heading with its first line of content — jump to a new page if
    // there's no room for the heading plus at least one wrapped line beneath.
    ensureRoom(size + 8 + 18);
    line(txt, { size, bold: true, color: [60, 40, 120] });
  };

  const bullets = (items: string[]) => {
    for (const it of items) line(`- ${it}`, { size: 11 });
  };

  const divider = () => {
    ensureRoom(20);
    doc.setDrawColor(200, 200, 210);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 14;
  };

  // Cover
  line(row.newspaper || "Newspaper", { size: 22, bold: true, color: [40, 30, 100] });
  line(
    `${row.edition_date || row.created_at?.slice(0, 10) || ""}  •  UPSC Genius AI — Editorial Notes`,
    { size: 11, color: [100, 100, 120] },
  );
  if (row.source_label) line(row.source_label, { size: 10, color: [120, 120, 140] });
  divider();

  const items = row.analysis?.editorials ?? [];
  items.forEach((it: EditorialItem, i: number) => {
    // Every editorial starts on a fresh page (except the first, which
    // continues right after the cover) so sections never split awkwardly
    // across pages.
    if (i > 0) {
      doc.addPage();
      y = MARGIN;
    }
    line(`${i + 1}. ${it.title}`, { size: 16, bold: true, color: [30, 30, 60] });
    line(
      `${it.syllabus.stage} • ${it.syllabus.paper} • ${it.syllabus.subject} • ${it.syllabus.topic}${it.syllabus.subTopic ? " • " + it.syllabus.subTopic : ""}`,
      { size: 10, color: [110, 110, 130] },
    );
    line(`Importance: ${it.importance}`, { size: 10, color: [180, 90, 40] });

    if (it.crispNotes?.length) {
      heading("Crisp Notes");
      bullets(it.crispNotes);
    }
    if (it.comprehensiveNotes) {
      heading("Comprehensive Notes");
      line(it.comprehensiveNotes, { size: 11 });
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
      it.vocabulary.forEach((v) => line(`• ${v.word} — ${v.meaning}`, { size: 11 }));
    }
    if (it.wayForward?.length) {
      heading("Way Forward");
      bullets(it.wayForward);
    }
    if (it.pyqLinks?.length) {
      heading("PYQ Links");
      it.pyqLinks.forEach((p) =>
        line(`${p.year ? p.year + " " : ""}${p.paper ? "(" + p.paper + ") " : ""}${p.question}`, {
          size: 11,
        }),
      );
    }
    if (it.probablePrelimsMCQ) {
      heading("Probable Prelims MCQ");
      line(it.probablePrelimsMCQ.q, { size: 11, bold: true });
      it.probablePrelimsMCQ.options.forEach((o, j) =>
        line(
          `${String.fromCharCode(65 + j)}. ${o}${j === it.probablePrelimsMCQ!.answer ? "  (correct)" : ""}`,
          { size: 11 },
        ),
      );
      line(`Explanation: ${it.probablePrelimsMCQ.explanation}`, { size: 10, color: [90, 90, 110] });
    }
    if (it.probableMainsQuestion) {
      heading("Probable Mains Question");
      line(
        `${it.probableMainsQuestion.paper} • ${it.probableMainsQuestion.marks} marks`,
        { size: 10, color: [110, 110, 130] },
      );
      line(it.probableMainsQuestion.q, { size: 11, bold: true });
      line(`Approach: ${it.probableMainsQuestion.approach}`, { size: 10 });
    }
    if (it.diagramMermaid) {
      heading("Diagram (Mermaid source)");
      line(it.diagramMermaid, { size: 9, color: [90, 90, 110] });
    }
    divider();
  });

  const rawBlob = doc.output("blob");
  // Stamp the user's logo (or the default SIDHESWAR watermark) onto every
  // page so Editorial Lab exports match the rest of the app.
  try {
    const bytes = new Uint8Array(await rawBlob.arrayBuffer());
    const pdfDoc = await PDFDocument.load(bytes);
    await applyWatermarkToAllPages(pdfDoc, "editorial-lab");
    const stamped = await pdfDoc.save();
    return new Blob([stamped.buffer.slice(stamped.byteOffset, stamped.byteOffset + stamped.byteLength) as ArrayBuffer], { type: "application/pdf" });
  } catch (err) {
    console.warn("[editorial-pdf] watermark failed, returning unstamped PDF", err);
    return rawBlob;
  }
}