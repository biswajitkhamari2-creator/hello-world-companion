import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- Types ----------
export interface EditorialItem {
  title: string;
  newspaper: string;
  pageHint?: string;
  syllabus: {
    stage: "Prelims" | "Mains" | "Both";
    paper: "GS-I" | "GS-II" | "GS-III" | "GS-IV" | "Essay" | "Prelims";
    subject: string;
    topic: string;
    subTopic?: string;
  };
  crispNotes: string[];                    // 6-10 bullets
  comprehensiveNotes: string;              // ~300-500 word structured markdown
  keyFacts: string[];
  vocabulary: Array<{ word: string; meaning: string }>;
  argumentsFor: string[];
  argumentsAgainst: string[];
  wayForward: string[];
  diagramMermaid?: string;                 // valid mermaid code (flowchart/mindmap)
  pyqLinks: Array<{ year?: number; paper?: string; question: string }>;
  probablePrelimsMCQ?: {
    q: string;
    options: string[];
    answer: number;
    explanation: string;
  };
  probableMainsQuestion?: { q: string; paper: string; marks: number; approach: string };
  importance: "Low" | "Medium" | "High" | "Very High";
}

export interface EditorialAnalysisFull {
  detectedNewspaper: string;
  editionDate?: string;
  editorials: EditorialItem[];
}

export interface EditorialRow {
  id: string;
  inbox_id: string | null;
  source_label: string | null;
  newspaper: string | null;
  edition_date: string | null;
  analysis: EditorialAnalysisFull;
  model: string | null;
  created_at: string;
}

function getAdmin() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    "https://ffkyjnswyfeghmfmlapu.supabase.co";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.APP_SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Supabase service key missing");
  return createClient(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

// ---------- List newspaper PDFs from the Telegram inbox ----------
export const listInboxNewspapers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const supabase = getAdmin();
    const { data, error } = await supabase
      .from("telegram_inbox")
      .select("id,file_name,caption,posted_at,size_bytes,drive_file_id,drive_view_link")
      .eq("kind", "pdf")
      .eq("status", "ready")
      .not("drive_file_id", "is", null)
      .order("posted_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// ---------- List / get / delete editorials ----------
export const listEditorials = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const supabase = getAdmin();
    const { data, error } = await supabase
      .from("editorials")
      .select("id,inbox_id,source_label,newspaper,edition_date,analysis,model,created_at")
      .order("created_at", { ascending: false })
      .limit(80);
    if (error) throw new Error(error.message);
    return (data ?? []) as EditorialRow[];
  });

export const getEditorial = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const supabase = getAdmin();
    const { data: row, error } = await supabase
      .from("editorials")
      .select("id,inbox_id,source_label,newspaper,edition_date,analysis,model,created_at")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Editorial not found");
    return row as EditorialRow;
  });

export const deleteEditorial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("editorials").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Analyse editorial from an inbox PDF (paid Gemini) ----------
function bufferToBase64(buf: ArrayBuffer): string {
  return Buffer.from(buf).toString("base64");
}

const GEMINI_MODEL = "gemini-2.5-pro"; // paid tier — highest quality for editorial mining

async function callGeminiOnPdf(pdfBytes: ArrayBuffer): Promise<EditorialAnalysisFull> {
  const key = (process.env.GEMINI_API_KEY || "").trim();
  if (!key) throw new Error("GEMINI_API_KEY not configured");

  const schema = {
    type: "object",
    properties: {
      detectedNewspaper: { type: "string" },
      editionDate: { type: "string" },
      editorials: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            newspaper: { type: "string" },
            pageHint: { type: "string" },
            syllabus: {
              type: "object",
              properties: {
                stage: { type: "string", enum: ["Prelims", "Mains", "Both"] },
                paper: {
                  type: "string",
                  enum: ["GS-I", "GS-II", "GS-III", "GS-IV", "Essay", "Prelims"],
                },
                subject: { type: "string" },
                topic: { type: "string" },
                subTopic: { type: "string" },
              },
              required: ["stage", "paper", "subject", "topic"],
            },
            crispNotes: { type: "array", items: { type: "string" } },
            comprehensiveNotes: { type: "string" },
            keyFacts: { type: "array", items: { type: "string" } },
            vocabulary: {
              type: "array",
              items: {
                type: "object",
                properties: { word: { type: "string" }, meaning: { type: "string" } },
                required: ["word", "meaning"],
              },
            },
            argumentsFor: { type: "array", items: { type: "string" } },
            argumentsAgainst: { type: "array", items: { type: "string" } },
            wayForward: { type: "array", items: { type: "string" } },
            diagramMermaid: { type: "string" },
            pyqLinks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  year: { type: "integer" },
                  paper: { type: "string" },
                  question: { type: "string" },
                },
                required: ["question"],
              },
            },
            probablePrelimsMCQ: {
              type: "object",
              properties: {
                q: { type: "string" },
                options: { type: "array", items: { type: "string" } },
                answer: { type: "integer" },
                explanation: { type: "string" },
              },
              required: ["q", "options", "answer", "explanation"],
            },
            probableMainsQuestion: {
              type: "object",
              properties: {
                q: { type: "string" },
                paper: { type: "string" },
                marks: { type: "integer" },
                approach: { type: "string" },
              },
              required: ["q", "paper", "marks", "approach"],
            },
            importance: { type: "string", enum: ["Low", "Medium", "High", "Very High"] },
          },
          required: [
            "title",
            "newspaper",
            "syllabus",
            "crispNotes",
            "comprehensiveNotes",
            "importance",
          ],
        },
      },
    },
    required: ["detectedNewspaper", "editorials"],
  } as const;

  const prompt = `You are UPSC Genius. The attached PDF is a full newspaper (e.g. The Hindu, Indian Express).
STRICT TASK: Locate ONLY the EDITORIAL / OP-ED pages (usually labelled "EDITORIAL", "COMMENT", "OPINION", "OP-ED", "Ideas"). Ignore news, sports, advertisements, business tickers, obituaries and city briefs entirely.

For EACH distinct editorial / op-ed piece you find, produce a rich UPSC-oriented note:

- title: exact headline of the editorial.
- newspaper: detected newspaper name (e.g. "The Hindu").
- pageHint: page label if visible ("Page 8", "Editorial page").
- syllabus: Prelims/Mains stage + GS paper mapping + fine subject + specific syllabus topic (and sub-topic if meaningful). MUST be tagged for every editorial.
- crispNotes: 6-10 sharp bullet points — the fastest possible read of the piece.
- comprehensiveNotes: 300-500 words in Markdown with clear headings (## Context, ## Core Argument, ## Analysis, ## Way Forward). Use only material grounded in the editorial itself.
- keyFacts: hard data / dates / articles / schemes / court cases mentioned.
- vocabulary: 5-8 exam-useful terms with crisp meanings.
- argumentsFor / argumentsAgainst: balanced sides of the debate.
- wayForward: 3-5 actionable ideas.
- diagramMermaid: a VALID mermaid diagram (prefer 'flowchart TD' or 'mindmap') that visualises the argument or cause-effect chain. Keep node labels short, no special characters that break mermaid. Wrap labels with quotes if they contain spaces. This field is REQUIRED whenever a diagram meaningfully aids understanding.
- pyqLinks: link to *actual* UPSC/State PSC PYQ themes if the topic has genuinely appeared before. Do NOT fabricate years or exact wordings — if unsure, omit the year and describe the theme only.
- probablePrelimsMCQ + probableMainsQuestion: exam-ready questions grounded in the editorial.
- importance: Low | Medium | High | Very High.

Rules:
- Do NOT invent facts, schemes, judgements or statistics.
- Everything must be in English (translate if source is Hindi/Odia).
- Return valid JSON ONLY that matches the provided schema.
- If the PDF has NO editorial pages, return { "detectedNewspaper": "...", "editorials": [] }.`;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          { inline_data: { mime_type: "application/pdf", data: bufferToBase64(pdfBytes) } },
        ],
      },
    ],
    generationConfig: {
      response_mime_type: "application/json",
      response_schema: schema,
      temperature: 0.3,
      maxOutputTokens: 8192,
    },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`Gemini editorial extract failed: ${r.status} ${txt.slice(0, 240)}`);
  }
  const j: any = await r.json();
  const text = j?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text ?? "").join("") ?? "";
  let parsed: EditorialAnalysisFull;
  try {
    parsed = JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) throw new Error("Gemini returned invalid JSON");
    parsed = JSON.parse(m[0]);
  }
  if (!Array.isArray(parsed.editorials)) parsed.editorials = [];
  return parsed;
}

export const analyseEditorialFromInbox = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { inboxId: string }) => z.object({ inboxId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const supabase = getAdmin();
    const { data: inbox, error } = await supabase
      .from("telegram_inbox")
      .select("id,file_name,caption,posted_at,drive_file_id")
      .eq("id", data.inboxId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!inbox?.drive_file_id) throw new Error("Newspaper PDF has no Drive file id");

    const { downloadDriveFile } = await import("./gdrive.server");
    const { buffer } = await downloadDriveFile(inbox.drive_file_id as string);
    const analysis = await callGeminiOnPdf(buffer);

    const sourceLabel =
      inbox.file_name || inbox.caption || analysis.detectedNewspaper || "Newspaper";
    const editionDate = analysis.editionDate?.match(/^\d{4}-\d{2}-\d{2}$/)
      ? analysis.editionDate
      : String(inbox.posted_at).slice(0, 10);

    const { data: inserted, error: insErr } = await supabase
      .from("editorials")
      .insert({
        user_id: context.userId,
        inbox_id: inbox.id,
        source_label: sourceLabel,
        newspaper: analysis.detectedNewspaper || "Unknown",
        edition_date: editionDate,
        analysis,
        model: GEMINI_MODEL,
      })
      .select("id")
      .single();
    if (insErr) throw new Error(insErr.message);
    return { id: inserted.id as string, editorialCount: analysis.editorials.length };
  });