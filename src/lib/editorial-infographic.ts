import { PDFDocument } from "pdf-lib";
import type { EditorialRow, EditorialItem } from "@/lib/editorial-lab.functions";
import { drawInfographics } from "@/lib/infographics-pdf";
import { applyWatermarkToAllPages, loadActiveWatermarkImage } from "@/lib/pdf-watermark";

const PALETTE = ["indigo", "gold", "rose", "emerald", "amber", "teal", "violet"];

function pickLayout(it: EditorialItem): string {
  if (it.diagramMermaid && /flowchart|graph/i.test(it.diagramMermaid)) return "flowchart";
  if (it.diagramMermaid && /mindmap/i.test(it.diagramMermaid)) return "mindmap";
  if ((it.argumentsFor?.length || 0) + (it.argumentsAgainst?.length || 0) >= 3) return "comparison";
  if ((it.wayForward?.length || 0) >= 3) return "process";
  return "summary";
}

function itemToPage(it: EditorialItem, i: number) {
  const sections: { heading: string; points: string[] }[] = [];
  if (it.crispNotes?.length) sections.push({ heading: "Crisp Notes", points: it.crispNotes.slice(0, 6) });
  if (it.argumentsFor?.length) sections.push({ heading: "Arguments — For", points: it.argumentsFor.slice(0, 5) });
  if (it.argumentsAgainst?.length) sections.push({ heading: "Arguments — Against", points: it.argumentsAgainst.slice(0, 5) });
  if (it.wayForward?.length) sections.push({ heading: "Way Forward", points: it.wayForward.slice(0, 5) });
  if (!sections.length && it.comprehensiveNotes) {
    sections.push({ heading: "Overview", points: it.comprehensiveNotes.split(/\n+/).filter(Boolean).slice(0, 5) });
  }
  return {
    topic: it.title,
    subtitle: `${it.syllabus.paper} • ${it.syllabus.subject} • ${it.syllabus.topic}`,
    layout: pickLayout(it),
    color: PALETTE[i % PALETTE.length],
    sections,
    key_facts: (it.keyFacts || []).slice(0, 4),
    takeaway: it.wayForward?.[0] || it.crispNotes?.[0] || "",
    mnemonic: (it.vocabulary || []).slice(0, 3).map((v) => v.word).join(" • "),
    pyq_link: it.pyqLinks?.[0]
      ? `${it.pyqLinks[0].year ? it.pyqLinks[0].year + " " : ""}${it.pyqLinks[0].paper ? "(" + it.pyqLinks[0].paper + ") " : ""}${it.pyqLinks[0].question}`
      : "",
    current_affairs: it.probableMainsQuestion?.q || "",
    part: 1,
    total_parts: 1,
  };
}

export async function editorialsToInfographicPdf(row: EditorialRow): Promise<Blob> {
  const items = row.analysis?.editorials ?? [];
  const pdf = await PDFDocument.create();
  const { img } = await loadActiveWatermarkImage(pdf);
  const content = {
    title: `${row.newspaper || "Editorial"} — ${row.edition_date || row.created_at?.slice(0, 10) || ""}`,
    pages: items.map(itemToPage),
  };
  await drawInfographics(pdf, content, content.title, img);
  await applyWatermarkToAllPages(pdf, "editorial-infographic");
  const bytes = await pdf.save();
  const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  return new Blob([buf], { type: "application/pdf" });
}