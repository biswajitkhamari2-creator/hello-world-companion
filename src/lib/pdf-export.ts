import { PDFDocument, StandardFonts, rgb, degrees, type PDFFont, type PDFPage, type Color } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { toast } from "sonner";
import { OUTPUT_LABELS, type OutputType } from "@/lib/generations.functions";
import type { WatermarkImage } from "@/lib/pdf-watermark";

type PdfState = {
  pdf: PDFDocument;
  page: PDFPage;
  watermark: WatermarkImage;
  drawWatermark: (page: PDFPage, img: WatermarkImage) => void;
  fonts: {
    regular: PDFFont;
    bold: PDFFont;
    italic: PDFFont;
  };
  y: number;
};

const PAGE = {
  width: 595.28,
  height: 841.89,
  margin: 48,
};

const COLORS = {
  ink: rgb(0.11, 0.12, 0.22),
  muted: rgb(0.35, 0.38, 0.48),
  indigo: rgb(0.1, 0.12, 0.26),
  gold: rgb(0.68, 0.47, 0.18),
  line: rgb(0.83, 0.78, 0.68),
  paper: rgb(1, 0.99, 0.96),
  softGold: rgb(0.96, 0.9, 0.76),
};

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function text(value: unknown, fallback = ""): string {
  if (typeof value === "string") return normalizePdfText(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

function normalizePdfText(value: string) {
  return value
    .replace(/\r/g, "")
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014\u2015]/g, "-")
    .replace(/[\u2022\u25CF\u25E6\u2043]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[\u2192\u27A1]/g, "->")
    .replace(/\u2190/g, "<-")
    .replace(/\u2194/g, "<->")
    .replace(/\u2264/g, "<=")
    .replace(/\u2265/g, ">=")
    .replace(/\u00D7/g, "x")
    .replace(/[\u00A0\u2009\u200A\u202F]/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "");
}

function splitLongWord(word: string, maxWidth: number, font: PDFFont, size: number) {
  const parts: string[] = [];
  let current = "";
  for (const char of word) {
    const next = `${current}${char}`;
    if (font.widthOfTextAtSize(next, size) > maxWidth && current) {
      parts.push(current);
      current = char;
    } else {
      current = next;
    }
  }
  if (current) parts.push(current);
  return parts;
}

function wrapLine(line: string, maxWidth: number, font: PDFFont, size: number) {
  const words = line.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
      continue;
    }

    if (current) lines.push(current);

    if (font.widthOfTextAtSize(word, size) > maxWidth) {
      const chunks = splitLongWord(word, maxWidth, font, size);
      lines.push(...chunks.slice(0, -1));
      current = chunks.at(-1) ?? "";
    } else {
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function wrapText(input: string, maxWidth: number, font: PDFFont, size: number) {
  return input
    .replace(/\r/g, "")
    .split("\n")
    .flatMap((line) => wrapLine(line.trim(), maxWidth, font, size));
}

function addPage(state: PdfState) {
  state.page = state.pdf.addPage([PAGE.width, PAGE.height]);
  state.page.drawRectangle({ x: 0, y: 0, width: PAGE.width, height: PAGE.height, color: COLORS.paper });
  state.drawWatermark(state.page, state.watermark);
  state.page.drawText("UPSC Mitra", {
    x: PAGE.margin,
    y: PAGE.height - 28,
    size: 9,
    font: state.fonts.bold,
    color: COLORS.gold,
  });
  state.page.drawLine({
    start: { x: PAGE.margin, y: PAGE.height - 38 },
    end: { x: PAGE.width - PAGE.margin, y: PAGE.height - 38 },
    thickness: 0.7,
    color: COLORS.line,
  });
  state.y = PAGE.height - PAGE.margin - 20;
}

function ensureSpace(state: PdfState, needed = 48) {
  if (state.y < PAGE.margin + needed) addPage(state);
}

function drawParagraph(
  state: PdfState,
  value: string,
  options: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; gap?: number; indent?: number } = {},
) {
  const size = options.size ?? 11;
  const font = options.font ?? state.fonts.regular;
  const gap = options.gap ?? 5;
  const indent = options.indent ?? 0;
  const maxWidth = PAGE.width - PAGE.margin * 2 - indent;
  const lines = wrapText(value, maxWidth, font, size);

  for (const line of lines) {
    ensureSpace(state, size + 8);
    state.page.drawText(line, {
      x: PAGE.margin + indent,
      y: state.y,
      size,
      font,
      color: options.color ?? COLORS.ink,
    });
    state.y -= size + gap;
  }
}

function drawHeading(state: PdfState, value: string, level: 1 | 2 | 3 = 2) {
  const size = level === 1 ? 21 : level === 2 ? 15 : 12;
  ensureSpace(state, size + 22);
  if (level !== 1) state.y -= 4;
  drawParagraph(state, value, { size, font: state.fonts.bold, color: level === 1 ? COLORS.indigo : COLORS.gold, gap: 7 });
  if (level === 1) {
    state.page.drawLine({
      start: { x: PAGE.margin, y: state.y + 2 },
      end: { x: PAGE.width - PAGE.margin, y: state.y + 2 },
      thickness: 1,
      color: COLORS.line,
    });
    state.y -= 12;
  }
}

function drawList(state: PdfState, items: unknown[], prefix = "•") {
  for (const item of items) {
    const value = text(item);
    if (!value) continue;
    drawParagraph(state, `${prefix} ${value}`, { size: 10.5, indent: 12 });
  }
}

function drawKeyValue(state: PdfState, label: string, value: unknown) {
  const clean = text(value);
  if (!clean) return;
  drawParagraph(state, `${label}: ${clean}`, { size: 10.5, font: state.fonts.bold, color: COLORS.indigo });
}

function drawShortNotes(state: PdfState, content: any) {
  drawKeyValue(state, "Definition", content.definition);
  drawHeading(state, "Key Facts", 2);
  drawList(state, asArray(content.key_facts));
  drawHeading(state, "PYQ Relevance", 2);
  drawParagraph(state, text(content.pyq_relevance));
  drawHeading(state, "UPSC Relevance", 2);
  drawParagraph(state, text(content.upsc_relevance));
  if (asArray(content.keywords).length) {
    drawKeyValue(state, "Keywords", asArray(content.keywords).map((item) => text(item)).join(", "));
  }
  if (asArray(content.examples).length) {
    drawHeading(state, "Examples", 2);
    drawList(state, asArray(content.examples));
  }
  if (asArray(content.revision_tips).length) {
    drawHeading(state, "Revision Tips", 2);
    drawList(state, asArray(content.revision_tips));
  }
}

function drawPrelimsMcqs(state: PdfState, content: any) {
  asArray(content.questions).forEach((question, index) => {
    const record = question as Record<string, unknown>;
    drawHeading(state, `Q${index + 1}. ${text(record.stem, "Question")}`, 2);
    asArray(record.options).forEach((option, optionIndex) => {
      drawParagraph(state, `${String.fromCharCode(65 + optionIndex)}. ${text(option)}`, { size: 10.5, indent: 14 });
    });
    drawKeyValue(state, "Answer", String.fromCharCode(65 + Number(record.answer_index ?? 0)));
    drawKeyValue(state, "Difficulty", text(record.difficulty, "medium"));
    drawParagraph(state, `Explanation: ${text(record.explanation)}`, { size: 10.5, color: COLORS.muted });
  });
}

function drawMainsQuestions(state: PdfState, content: any) {
  asArray(content.questions).forEach((question, index) => {
    const record = question as Record<string, unknown>;
    drawHeading(state, `Q${index + 1}. ${text(record.question, "Discuss this topic.")}`, 2);
    drawKeyValue(state, "Paper", record.gs_paper);
    drawKeyValue(state, "Marks", record.marks);
    drawKeyValue(state, "Word Limit", record.word_limit);
    drawHeading(state, "Intro", 3);
    drawList(state, asArray(record.intro_points));
    drawHeading(state, "Body", 3);
    drawList(state, asArray(record.body_points));
    drawHeading(state, "Conclusion", 3);
    drawList(state, asArray(record.conclusion_points));
    if (asArray(record.keywords).length) drawKeyValue(state, "Keywords", asArray(record.keywords).map((item) => text(item)).join(", "));
    if (asArray(record.value_add).length) {
      drawHeading(state, "Value Add", 3);
      drawList(state, asArray(record.value_add));
    }
  });
}

function safeFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80) || "upsc-notes";
}

/* ============================================================
   HANDWRITTEN NOTEBOOK MODE — "Topper Notebook"
   ============================================================ */

type NotebookFonts = {
  hand: PDFFont;       // Patrick Hand — regular handwriting
  handBold: PDFFont;   // Kalam Bold — heading/bold accents
  script: PDFFont;     // Caveat — title / signature style
};

type NotebookState = {
  pdf: PDFDocument;
  page: PDFPage;
  watermark: WatermarkImage;
  drawWatermark: (page: PDFPage, img: WatermarkImage) => void;
  fonts: NotebookFonts;
  y: number;
  pageIndex: number;
  documentTitle: string;
};

const NB = {
  width: 595.28,           // A4
  height: 841.89,
  marginLeft: 82,          // text starts right of red margin line (at x=66)
  marginRight: 44,
  marginTop: 78,
  marginBottom: 60,
  lineHeight: 28,          // ruled line spacing — matches base font comfortably
  baseFont: 15,            // handwriting size (was 14, bumped for readability)
  headingFont: 22,
  redMarginX: 68,
};

const INK = {
  blueInk: rgb(0.10, 0.18, 0.55),     // royal blue pen
  blackInk: rgb(0.08, 0.09, 0.16),
  redInk: rgb(0.78, 0.13, 0.18),
  greenInk: rgb(0.06, 0.42, 0.24),
  pencil: rgb(0.40, 0.42, 0.50),
  rule: rgb(0.72, 0.82, 0.93),
  redMargin: rgb(0.88, 0.45, 0.50),
  paper: rgb(0.998, 0.995, 0.978),
  highlightYellow: rgb(1.0, 0.93, 0.45),
  highlightPink: rgb(1.0, 0.78, 0.85),
  highlightGreen: rgb(0.80, 0.95, 0.72),
  stickyYellow: rgb(1.0, 0.94, 0.58),
  stickyPink: rgb(1.0, 0.84, 0.86),
  stickyBlue: rgb(0.78, 0.90, 1.0),
  stickyBorder: rgb(0.78, 0.70, 0.30),
};


async function fetchFontBytes(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load font: ${url}`);
  return new Uint8Array(await res.arrayBuffer());
}

async function loadNotebookFonts(pdf: PDFDocument): Promise<NotebookFonts> {
  pdf.registerFontkit(fontkit);
  const [handBytes, boldBytes, scriptBytes] = await Promise.all([
    fetchFontBytes("https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/patrickhand/PatrickHand-Regular.ttf"),
    fetchFontBytes("https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/kalam/Kalam-Bold.ttf"),
    fetchFontBytes("https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/kalam/Kalam-Regular.ttf"),
  ]);
  return {
    hand: await pdf.embedFont(handBytes, { subset: true }),
    handBold: await pdf.embedFont(boldBytes, { subset: true }),
    script: await pdf.embedFont(scriptBytes, { subset: true }),
  };
}

// Seedable jitter — deterministic per page but feels natural
function jitter(amp: number) {
  return (Math.random() - 0.5) * 2 * amp;
}

function drawRuledPage(state: NotebookState) {
  const p = state.page;
  // paper fill
  p.drawRectangle({ x: 0, y: 0, width: NB.width, height: NB.height, color: INK.paper });
  state.drawWatermark(p, state.watermark);

  // subtle paper grain (very light flecks)
  for (let i = 0; i < 14; i++) {
    p.drawRectangle({
      x: Math.random() * NB.width,
      y: Math.random() * NB.height,
      width: 0.6,
      height: 0.6,
      color: rgb(0.93, 0.91, 0.86),
      opacity: 0.3,
    });
  }


  // horizontal ruled lines
  let ly = NB.height - NB.marginTop;
  while (ly > NB.marginBottom) {
    p.drawLine({
      start: { x: NB.marginLeft - 6, y: ly },
      end: { x: NB.width - NB.marginRight, y: ly },
      thickness: 0.4,
      color: INK.rule,
      opacity: 0.85,
    });
    ly -= NB.lineHeight;
  }

  // red vertical margin line
  p.drawLine({
    start: { x: NB.redMarginX, y: NB.marginBottom - 10 },
    end: { x: NB.redMarginX, y: NB.height - 30 },
    thickness: 1,
    color: INK.redMargin,
    opacity: 0.85,
  });

  // top header: course + date area, handwritten
  p.drawText("UPSC Mitra  •  Topper Notebook", {
    x: NB.marginLeft,
    y: NB.height - 42,
    size: 11,
    font: state.fonts.script,
    color: INK.pencil,
  });
  p.drawText(state.documentTitle.slice(0, 70), {
    x: NB.marginLeft,
    y: NB.height - 56,
    size: 10,
    font: state.fonts.script,
    color: INK.pencil,
  });

  // top-right page number in margin
  p.drawText(`pg. ${state.pageIndex}`, {
    x: NB.width - NB.marginRight - 36,
    y: NB.height - 48,
    size: 11,
    font: state.fonts.script,
    color: INK.redInk,
    rotate: degrees(-4),
  });

  // bottom-right small flourish
  p.drawLine({
    start: { x: NB.width - NB.marginRight - 60, y: NB.marginBottom - 18 },
    end: { x: NB.width - NB.marginRight, y: NB.marginBottom - 22 },
    thickness: 0.7,
    color: INK.pencil,
    opacity: 0.5,
  });

  state.y = NB.height - NB.marginTop;
}

function nbAddPage(state: NotebookState) {
  state.page = state.pdf.addPage([NB.width, NB.height]);
  state.pageIndex += 1;
  drawRuledPage(state);
}

function nbEnsureSpace(state: NotebookState, needed: number) {
  if (state.y - needed < NB.marginBottom + 10) nbAddPage(state);
}

function nbSnapToLine(state: NotebookState) {
  // snap y down to the nearest rule line so writing sits ON the ruled line
  const fromTop = NB.height - NB.marginTop - state.y;
  const lines = Math.round(fromTop / NB.lineHeight);
  state.y = NB.height - NB.marginTop - lines * NB.lineHeight;
}

// Wrap text with font metrics, no markup awareness yet
function nbWrap(value: string, maxWidth: number, font: PDFFont, size: number): string[] {
  return wrapText(value.replace(/\*\*/g, "").replace(/__/g, "").replace(/==/g, ""), maxWidth, font, size);
}

// Parse simple inline markup:
//   **bold** -> bold ink
//   __underline__ -> underline keyword
//   ==highlight== -> yellow highlighter strip
type Span = { text: string; bold?: boolean; underline?: boolean; highlight?: "yellow" | "pink" | "green" };

function parseSpans(input: string): Span[] {
  const src = normalizePdfText(input);
  const spans: Span[] = [];
  const re = /(\*\*[^*]+\*\*|__[^_]+__|==[^=]+==|::[^:]+::|~~[^~]+~~)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (m.index > last) spans.push({ text: src.slice(last, m.index) });
    const tok = m[0];
    if (tok.startsWith("**")) spans.push({ text: tok.slice(2, -2), bold: true });
    else if (tok.startsWith("__")) spans.push({ text: tok.slice(2, -2), underline: true });
    else if (tok.startsWith("==")) spans.push({ text: tok.slice(2, -2), highlight: "yellow" });
    else if (tok.startsWith("::")) spans.push({ text: tok.slice(2, -2), highlight: "pink" });
    else if (tok.startsWith("~~")) spans.push({ text: tok.slice(2, -2), highlight: "green" });
    last = m.index + tok.length;
  }
  if (last < src.length) spans.push({ text: src.slice(last) });
  return spans.length ? spans : [{ text: src }];
}

function spansToPlain(spans: Span[]): string {
  return spans.map((s) => s.text).join("");
}

// Layout a span list into lines respecting maxWidth.
// We measure with regular font (bold is close enough in width for Kalam/PatrickHand).
function layoutSpanLines(spans: Span[], maxWidth: number, font: PDFFont, size: number): Span[][] {
  // Tokenize each span into words while preserving span style. Long words that
  // exceed maxWidth get char-split so they never overflow the right margin
  // (which is what was causing letters to look "missing" near page edges).
  const tokens: Span[] = [];
  for (const sp of spans) {
    const parts = sp.text.split(/(\s+)/);
    for (const part of parts) {
      if (!part) continue;
      if (!/^\s+$/.test(part) && font.widthOfTextAtSize(part, size) > maxWidth) {
        for (const chunk of splitLongWord(part, maxWidth, font, size)) {
          tokens.push({ ...sp, text: chunk });
        }
      } else {
        tokens.push({ ...sp, text: part });
      }
    }
  }
  const lines: Span[][] = [];
  let cur: Span[] = [];
  let curWidth = 0;
  for (const t of tokens) {
    if (t.text === "\n") {
      lines.push(cur);
      cur = [];
      curWidth = 0;
      continue;
    }
    const w = font.widthOfTextAtSize(t.text, size);
    if (curWidth + w > maxWidth && cur.length) {
      lines.push(cur);
      cur = [];
      curWidth = 0;
      if (/^\s+$/.test(t.text)) continue;
    }
    cur.push(t);
    curWidth += w;
  }
  if (cur.length) lines.push(cur);
  return lines;
}

function drawSpanLine(
  state: NotebookState,
  spans: Span[],
  opts: { x: number; y: number; size: number; color: Color; bold?: boolean },
) {
  const font = state.fonts.hand;
  const boldFont = state.fonts.handBold;
  let cursorX = opts.x;
  const baseY = opts.y;

  // First pass: draw all highlight strips behind text (so text sits cleanly on top)
  let measureX = cursorX;
  for (const span of spans) {
    if (!span.text) continue;
    const useFont = span.bold || opts.bold ? boldFont : font;
    const w = useFont.widthOfTextAtSize(span.text, opts.size);
    if (span.highlight) {
      const hc =
        span.highlight === "pink" ? INK.highlightPink : span.highlight === "green" ? INK.highlightGreen : INK.highlightYellow;
      state.page.drawRectangle({
        x: measureX - 1,
        y: baseY - 2,
        width: w + 2,
        height: opts.size + 3,
        color: hc,
        opacity: 0.5,
      });
    }
    measureX += w;
  }

  // Second pass: draw the actual ink, no per-word rotation/jitter
  for (const span of spans) {
    if (!span.text) continue;
    const useFont = span.bold || opts.bold ? boldFont : font;
    const w = useFont.widthOfTextAtSize(span.text, opts.size);

    state.page.drawText(span.text, {
      x: cursorX,
      y: baseY,
      size: opts.size,
      font: useFont,
      color: span.bold ? INK.blackInk : opts.color,
    });

    if (span.underline) {
      state.page.drawLine({
        start: { x: cursorX, y: baseY - 2 },
        end: { x: cursorX + w, y: baseY - 2 },
        thickness: 0.9,
        color: INK.redInk,
      });
    }

    cursorX += w;
  }
}

function nbWriteRich(
  state: NotebookState,
  raw: string,
  opts: { indent?: number; size?: number; color?: Color; bold?: boolean; gap?: number } = {},
) {
  if (!raw || !raw.trim()) return;
  const size = opts.size ?? NB.baseFont;
  const indent = opts.indent ?? 0;
  const color = opts.color ?? INK.blueInk;
  const gap = opts.gap ?? 0;
  const maxWidth = NB.width - NB.marginRight - (NB.marginLeft + indent);
  const spans = parseSpans(raw);
  const lines = layoutSpanLines(spans, maxWidth, state.fonts.hand, size);

  for (const line of lines) {
    nbEnsureSpace(state, NB.lineHeight + 4);
    nbSnapToLine(state);
    if (state.y > NB.height - NB.marginTop) state.y = NB.height - NB.marginTop;
    drawSpanLine(state, line, {
      x: NB.marginLeft + indent,
      y: state.y - size + 5,
      size,
      color,
      bold: opts.bold,
    });
    state.y -= NB.lineHeight;
  }
  if (gap) state.y -= gap;
}


function nbHeading(state: NotebookState, value: string, level: 1 | 2 | 3 = 2) {
  if (!value) return;
  const size = level === 1 ? NB.headingFont : level === 2 ? 18 : 16;
  nbEnsureSpace(state, NB.lineHeight * 2);
  state.y -= 6;
  nbSnapToLine(state);
  const yLine = state.y - size + 5;

  const useFont = state.fonts.handBold;
  const heading = value.slice(0, 110);
  const width = useFont.widthOfTextAtSize(heading, size);

  // soft highlighter strip behind heading (only for L2, subtle)
  if (level === 2) {
    state.page.drawRectangle({
      x: NB.marginLeft - 2,
      y: yLine - 2,
      width: Math.min(width + 6, NB.width - NB.marginRight - NB.marginLeft),
      height: size + 2,
      color: INK.highlightYellow,
      opacity: 0.45,
    });
  }

  state.page.drawText(heading, {
    x: NB.marginLeft,
    y: yLine,
    size,
    font: useFont,
    color: level === 1 ? INK.redInk : level === 2 ? INK.blackInk : INK.greenInk,
  });

  // double underline for level 1 chapter title; single wavy-ish for level 3
  if (level === 1) {
    const uy = yLine - 4;
    state.page.drawLine({ start: { x: NB.marginLeft, y: uy }, end: { x: NB.marginLeft + width + 6, y: uy }, thickness: 1.4, color: INK.redInk });
    state.page.drawLine({ start: { x: NB.marginLeft, y: uy - 3 }, end: { x: NB.marginLeft + width + 6, y: uy - 3 }, thickness: 0.8, color: INK.redInk });
  } else if (level === 3) {
    state.page.drawLine({
      start: { x: NB.marginLeft, y: yLine - 3 },
      end: { x: NB.marginLeft + width + 4, y: yLine - 3 },
      thickness: 0.7,
      color: INK.greenInk,
    });
  }

  state.y -= NB.lineHeight + (level === 1 ? 12 : 4);
}

function nbBullets(state: NotebookState, items: unknown[], marker: "star" | "arrow" | "dot" = "dot") {
  const symbol = marker === "star" ? "*" : marker === "arrow" ? ">" : "•";
  for (const it of items) {
    const value = typeof it === "string" ? it : String(it ?? "");
    if (!value.trim()) continue;
    nbEnsureSpace(state, NB.lineHeight + 4);
    nbSnapToLine(state);
    const markerY = state.y - NB.baseFont + 5;
    state.page.drawText(symbol, {
      x: NB.marginLeft + 4,
      y: markerY,
      size: NB.baseFont + 1,
      font: state.fonts.handBold,
      color: INK.redInk,
    });
    const indent = 20;
    const maxWidth = NB.width - NB.marginRight - (NB.marginLeft + indent);
    const spans = parseSpans(value);
    const lines = layoutSpanLines(spans, maxWidth, state.fonts.hand, NB.baseFont);
    lines.forEach((line, i) => {
      if (i > 0) {
        nbEnsureSpace(state, NB.lineHeight);
        nbSnapToLine(state);
      }
      drawSpanLine(state, line, {
        x: NB.marginLeft + indent,
        y: state.y - NB.baseFont + 5,
        size: NB.baseFont,
        color: INK.blueInk,
      });
      state.y -= NB.lineHeight;
    });
  }
}


function nbStickyNote(
  state: NotebookState,
  label: string,
  body: string,
  variant: "yellow" | "pink" | "blue" = "yellow",
) {
  if (!body || !body.trim()) return;
  const fill = variant === "pink" ? INK.stickyPink : variant === "blue" ? INK.stickyBlue : INK.stickyYellow;
  const innerWidth = NB.width - NB.marginRight - NB.marginLeft - 36;
  const lines = nbWrap(body, innerWidth, state.fonts.hand, 12);
  const height = Math.max(60, lines.length * 18 + 36);

  nbEnsureSpace(state, height + 14);
  nbSnapToLine(state);
  const x = NB.marginLeft + 8;
  const top = state.y + 2;
  const rotateDeg = jitter(1.8);

  // shadow
  state.page.drawRectangle({
    x: x + 4,
    y: top - height - 4,
    width: innerWidth + 28,
    height,
    color: rgb(0.85, 0.82, 0.7),
    opacity: 0.5,
    rotate: degrees(rotateDeg),
  });
  // sticky body
  state.page.drawRectangle({
    x,
    y: top - height,
    width: innerWidth + 28,
    height,
    color: fill,
    rotate: degrees(rotateDeg),
  });
  // tape on top
  state.page.drawRectangle({
    x: x + innerWidth / 2 - 10,
    y: top - 4,
    width: 36,
    height: 12,
    color: rgb(0.95, 0.93, 0.82),
    opacity: 0.85,
    rotate: degrees(rotateDeg + 8),
  });

  // label
  state.page.drawText(label.toUpperCase(), {
    x: x + 14,
    y: top - 22,
    size: 11,
    font: state.fonts.handBold,
    color: INK.redInk,
    rotate: degrees(rotateDeg),
  });

  // body lines
  let ly = top - 40;
  for (const line of lines) {
    state.page.drawText(line, {
      x: x + 14 + jitter(0.4),
      y: ly + jitter(0.4),
      size: 12,
      font: state.fonts.hand,
      color: INK.blackInk,
      rotate: degrees(rotateDeg),
    });
    ly -= 18;
  }

  state.y -= height + 12;
}

function nbMarginNote(state: NotebookState, value: string) {
  if (!value || !value.trim()) return;
  // small note tucked in the left margin between redMarginX and page edge
  nbEnsureSpace(state, NB.lineHeight * 2);
  nbSnapToLine(state);
  const x = 8;
  const maxW = NB.redMarginX - 12;
  const lines = nbWrap(value, maxW, state.fonts.hand, 9);
  const yStart = state.y - 4;
  lines.forEach((line, i) => {
    state.page.drawText(line, {
      x,
      y: yStart - i * 11,
      size: 9,
      font: state.fonts.hand,
      color: INK.pencil,
      rotate: degrees(-2 + jitter(1)),
    });
  });
  // arrow pointing to body
  state.page.drawText(">", {
    x: NB.redMarginX - 8,
    y: yStart - 1,
    size: 9,
    font: state.fonts.handBold,
    color: INK.redInk,
  });
}

// Tiny hand-drawn diagram: concept tree, used when no diagram fields present
function nbConceptCircle(state: NotebookState, center: string, leaves: string[]) {
  if (!leaves.length) return;
  const boxW = 130;
  const boxH = 36;
  const totalH = 180;
  nbEnsureSpace(state, totalH + 10);
  const cx = (NB.marginLeft + NB.width - NB.marginRight) / 2;
  const topY = state.y - 6;
  // central node
  state.page.drawEllipse({
    x: cx,
    y: topY - 30,
    xScale: boxW / 2,
    yScale: boxH / 2,
    borderColor: INK.blueInk,
    borderWidth: 1.4,
    color: INK.highlightYellow,
    opacity: 0.85,
  });
  const centerLabel = center.slice(0, 28);
  const cw = state.fonts.handBold.widthOfTextAtSize(centerLabel, 13);
  state.page.drawText(centerLabel, {
    x: cx - cw / 2,
    y: topY - 36,
    size: 13,
    font: state.fonts.handBold,
    color: INK.blackInk,
  });
  // leaves
  const n = Math.min(leaves.length, 5);
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + (Math.PI / (n - 1 || 1)) * i - Math.PI / 4;
    const lx = cx + Math.cos(angle) * 150;
    const ly = topY - 30 + Math.sin(angle) * 80;
    state.page.drawLine({
      start: { x: cx + Math.cos(angle) * (boxW / 2), y: topY - 30 + Math.sin(angle) * (boxH / 2) },
      end: { x: lx, y: ly },
      thickness: 0.9,
      color: INK.pencil,
    });
    const label = leaves[i].slice(0, 22);
    const lw = state.fonts.hand.widthOfTextAtSize(label, 11);
    state.page.drawRectangle({
      x: lx - lw / 2 - 6,
      y: ly - 8,
      width: lw + 12,
      height: 18,
      color: INK.highlightGreen,
      opacity: 0.7,
      borderColor: INK.greenInk,
      borderWidth: 0.6,
    });
    state.page.drawText(label, {
      x: lx - lw / 2,
      y: ly - 4,
      size: 11,
      font: state.fonts.hand,
      color: INK.blackInk,
    });
  }
  state.y -= totalH;
}

function autoEnrichRich(text: string): string {
  // Auto-highlight some UPSC-flavored keywords if not already marked
  if (/[*_=~]/.test(text)) return text;
  return text.replace(
    /\b(Article\s+\d+[A-Z]?|Schedule\s+[IVX]+|Section\s+\d+|Section\s+\d+\([a-z0-9]+\)|\d{4}\b|Committee|Commission|Act,\s+\d{4})/g,
    "==$1==",
  );
}

async function drawHandwrittenNotebook(
  pdf: PDFDocument,
  content: any,
  documentTitle: string,
  watermark: WatermarkImage,
  drawWatermark: (page: PDFPage, img: WatermarkImage) => void,
): Promise<void> {
  const fonts = await loadNotebookFonts(pdf);
  const firstPage = pdf.addPage([NB.width, NB.height]);
  const state: NotebookState = {
    pdf,
    page: firstPage,
    watermark,
    drawWatermark,
    fonts,
    y: NB.height - NB.marginTop,
    pageIndex: 1,
    documentTitle,
  };
  drawRuledPage(state);

  // Cover-style title block
  const title = (content?.title || "Topper Notes").toString().slice(0, 80);
  nbSnapToLine(state);
  state.page.drawText(title, {
    x: NB.marginLeft,
    y: state.y - 26,
    size: 28,
    font: fonts.script,
    color: INK.redInk,
    rotate: degrees(-1.5),
  });
  // double underline
  const tw = fonts.script.widthOfTextAtSize(title, 28);
  state.page.drawLine({
    start: { x: NB.marginLeft, y: state.y - 32 },
    end: { x: NB.marginLeft + tw + 8, y: state.y - 34 },
    thickness: 1.4,
    color: INK.redInk,
  });
  state.page.drawLine({
    start: { x: NB.marginLeft, y: state.y - 38 },
    end: { x: NB.marginLeft + tw + 8, y: state.y - 40 },
    thickness: 0.8,
    color: INK.redInk,
  });
  state.y -= NB.lineHeight * 3;

  // Intro paragraph
  if (content?.intro) {
    nbWriteRich(state, autoEnrichRich(text(content.intro)), { color: INK.blueInk });
    state.y -= 6;
  }

  // Sections
  const sections = asArray(content?.sections);
  sections.forEach((rawSection, sIdx) => {
    const section = rawSection as Record<string, unknown>;
    const heading = text(section.heading, `Topic ${sIdx + 1}`);
    nbHeading(state, heading, 2);

    const body = text(section.body);
    if (body) {
      nbWriteRich(state, autoEnrichRich(body), { color: INK.blueInk });
    }

    const subPoints = asArray((section as any).key_points || (section as any).points);
    if (subPoints.length) {
      nbBullets(state, subPoints.map((p) => autoEnrichRich(text(p))), "arrow");
    }

    // Callouts -> sticky notes
    for (const callout of asArray(section.callouts)) {
      const c = callout as Record<string, unknown>;
      const kind = text(c.kind, "key").toLowerCase();
      const variant: "yellow" | "pink" | "blue" =
        kind.includes("warn") || kind.includes("mistake")
          ? "pink"
          : kind.includes("pyq") || kind.includes("fact")
          ? "blue"
          : "yellow";
      nbStickyNote(state, kind, text(c.text), variant);
    }

    // Mnemonics
    const mnemonics = asArray(section.mnemonics);
    if (mnemonics.length) {
      nbHeading(state, "Memory Hack", 3);
      mnemonics.forEach((m) => nbWriteRich(state, `:: ${text(m)} ::`, { color: INK.greenInk }));
    }

    // Value add -> margin notes when short, bullets when long
    const valueAdd = asArray(section.value_add);
    if (valueAdd.length) {
      nbHeading(state, "Value Add", 3);
      valueAdd.forEach((v) => {
        const s = text(v);
        if (!s) return;
        if (s.length < 60) nbMarginNote(state, s);
        else nbBullets(state, [autoEnrichRich(s)], "star");
      });

    }

    // Auto concept tree from key points if 3+ leaves and we have space
    if (subPoints.length >= 3 && sIdx % 2 === 0) {
      nbConceptCircle(state, heading, subPoints.slice(0, 5).map((p) => text(p)));
    }
  });

  // Conclusion
  if (content?.conclusion) {
    nbHeading(state, "Conclusion", 2);
    nbWriteRich(state, autoEnrichRich(text(content.conclusion)), { color: INK.blueInk });
  }

  // Final flourish: signature
  nbEnsureSpace(state, 60);
  state.y -= 10;
  state.page.drawText("— end of notes —", {
    x: NB.marginLeft + 60,
    y: state.y - 10,
    size: 14,
    font: fonts.script,
    color: INK.pencil,
    rotate: degrees(-2),
  });
}

/* ============================================================
   PUBLIC API
   ============================================================ */

export async function downloadGeneratedPdf(outputType: OutputType, content: any, documentTitle: string) {
  const exportStartedAt = Date.now();
  const wmCtx = `pdf-export:${outputType}`;
  console.info(`[watermark:${wmCtx}] export starting`, { documentTitle });
  const pdf = await PDFDocument.create();
  const { loadWatermarkImage, drawWatermarkOnPage } = await import("./pdf-watermark");
  let watermark: Awaited<ReturnType<typeof loadWatermarkImage>>;
  let watermarkLoaded = false;
  try {
    watermark = await loadWatermarkImage(pdf);
    watermarkLoaded = true;
    console.info(`[watermark:${wmCtx}] logo loaded & embedded`);
  } catch (err) {
    const msg = (err as Error)?.message || "Watermark logo missing.";
    console.error(`[watermark:${wmCtx}] watermark unavailable — aborting export`, { error: msg });
    toast.error("SIDHESWAR watermark missing", {
      description: `${msg} PDF export aborted (${outputType}).`,
    });
    throw err;
  }



  if (outputType === "infographics") {
    const { drawInfographics } = await import("./infographics-pdf");
    await drawInfographics(pdf, content, documentTitle, watermark);
  } else if (outputType === "handwritten_notes") {
    try {
      await drawHandwrittenNotebook(pdf, content, documentTitle, watermark, drawWatermarkOnPage);
    } catch (err) {
      console.error("Notebook render failed, falling back to standard", err);
      const fonts = {
        regular: await pdf.embedFont(StandardFonts.TimesRoman),
        bold: await pdf.embedFont(StandardFonts.TimesRomanBold),
        italic: await pdf.embedFont(StandardFonts.TimesRomanItalic),
      };
      const state: PdfState = { pdf, page: pdf.addPage([PAGE.width, PAGE.height]), watermark, drawWatermark: drawWatermarkOnPage, fonts, y: PAGE.height - PAGE.margin };
      state.page.drawRectangle({ x: 0, y: 0, width: PAGE.width, height: PAGE.height, color: COLORS.paper });
      drawWatermarkOnPage(state.page, watermark);
      drawHeading(state, text(content?.title, OUTPUT_LABELS[outputType].label), 1);
      drawParagraph(state, `Source: ${documentTitle}`, { size: 9.5, color: COLORS.muted });
      for (const section of asArray(content?.sections)) {
        const r = section as Record<string, unknown>;
        drawHeading(state, text(r.heading, "Notes"), 2);
        drawParagraph(state, text(r.body));
      }
    }
  } else {
    const fonts = {
      regular: await pdf.embedFont(StandardFonts.TimesRoman),
      bold: await pdf.embedFont(StandardFonts.TimesRomanBold),
      italic: await pdf.embedFont(StandardFonts.TimesRomanItalic),
    };
    const state: PdfState = { pdf, page: pdf.addPage([PAGE.width, PAGE.height]), watermark, drawWatermark: drawWatermarkOnPage, fonts, y: PAGE.height - PAGE.margin };
    state.page.drawRectangle({ x: 0, y: 0, width: PAGE.width, height: PAGE.height, color: COLORS.paper });
    drawWatermarkOnPage(state.page, watermark);

    drawHeading(state, text(content?.title, OUTPUT_LABELS[outputType].label), 1);
    drawParagraph(state, `Source: ${documentTitle}`, { size: 9.5, color: COLORS.muted });
    state.y -= 6;

    if (outputType === "short_notes") drawShortNotes(state, content);
    if (outputType === "prelims_mcqs") drawPrelimsMcqs(state, content);
    if (outputType === "mains_questions") drawMainsQuestions(state, content);

    const pages = pdf.getPages();
    pages.forEach((page, index) => {
      page.drawText(`${index + 1} / ${pages.length}`, {
        x: PAGE.width - PAGE.margin - 28,
        y: 24,
        size: 9,
        font: fonts.regular,
        color: COLORS.muted,
      });
    });
  }

  const finalPageCount = pdf.getPages().length;
  console.info(`[watermark:${wmCtx}] export complete`, {
    documentTitle,
    pageCount: finalPageCount,
    durationMs: Date.now() - exportStartedAt,
  });
  const { getWatermarkSettings, getUserLogoDataUrl } = await import("@/lib/user-logo");
  const usingUser = getWatermarkSettings().enabled && !!getUserLogoDataUrl();
  toast.success(usingUser ? "Your logo stamped" : "SIDHESWAR watermark applied", {
    description: `Logo ✓ applied to all ${finalPageCount} page${finalPageCount === 1 ? "" : "s"} (${OUTPUT_LABELS[outputType]?.label ?? outputType}).`,
  });
  void watermarkLoaded;

  const bytes = await pdf.save();
  const blob = new Blob([bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer], {
    type: "application/pdf",
  });
  const filename = `${safeFileName(documentTitle)}-${outputType}.pdf`;
  const { saveAndDownload } = await import("@/lib/downloads-store");
  await saveAndDownload(blob, filename, {
    kind: "pdf",
    source: "pdf-export",
    meta: { documentTitle, outputType },
  });
}

