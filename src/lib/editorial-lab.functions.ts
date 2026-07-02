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

const TELEGRAM_SHARED_OWNER = "telegram-inbox";

function extractUrls(text: string): string[] {
  const re = /https?:\/\/[^\s)]+/gi;
  return Array.from(new Set(text.match(re) ?? []));
}

function extractDriveFileId(url: string): string | null {
  try {
    const u = new URL(url);
    if (!/(^|\.)google\.com$/.test(u.hostname) && !/(^|\.)googleusercontent\.com$/.test(u.hostname)) return null;
    const m = u.pathname.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]{20,})/);
    if (m) return m[1];
    const idParam = u.searchParams.get("id");
    return idParam && /^[a-zA-Z0-9_-]{20,}$/.test(idParam) ? idParam : null;
  } catch {
    return null;
  }
}

function getDriveUrlFromInboxRow(row: any): string | null {
  const candidates = [row?.source_url, row?.caption, row?.file_name, JSON.stringify(row?.raw ?? {})]
    .filter(Boolean)
    .flatMap((v) => extractUrls(String(v)));
  return candidates.find((url) => Boolean(extractDriveFileId(url))) ?? null;
}

async function fetchPublicDrivePdf(fileId: string): Promise<{ bytes: ArrayBuffer; mime: string; name: string | null }> {
  const primary = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(fileId)}&export=download&confirm=t`;
  let res = await fetch(primary, { redirect: "follow" });
  let contentType = res.headers.get("content-type") || "";
  if (res.ok && /text\/html/i.test(contentType)) {
    const html = await res.text();
    const uuid = html.match(/name="uuid"\s+value="([^"]+)"/i)?.[1];
    const confirm = html.match(/name="confirm"\s+value="([^"]+)"/i)?.[1] || "t";
    if (uuid) {
      const retry = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(fileId)}&export=download&confirm=${encodeURIComponent(confirm)}&uuid=${encodeURIComponent(uuid)}`;
      res = await fetch(retry, { redirect: "follow" });
      contentType = res.headers.get("content-type") || "";
    }
  }
  if (!res.ok) throw new Error(`Drive public download failed (${res.status}). Share it as "Anyone with the link — Viewer" and resend.`);
  if (/text\/html/i.test(contentType)) throw new Error("Drive returned a web page instead of PDF. Make the file public: Anyone with the link — Viewer.");
  const cd = res.headers.get("content-disposition") || "";
  const nameMatch = cd.match(/filename\*=UTF-8''([^;]+)/i) || cd.match(/filename="?([^";]+)"?/i);
  const name = nameMatch ? decodeURIComponent(nameMatch[1]) : null;
  const bytes = await res.arrayBuffer();
  const mime = contentType.split(";")[0].trim() || "application/pdf";
  const looksPdf = mime.includes("pdf") || (name || "").toLowerCase().endsWith(".pdf");
  if (!looksPdf) throw new Error("This Drive link is not a PDF file.");
  return { bytes, mime, name };
}

function getTelegramFileIdFromRaw(raw: any, kind: string): string | null {
  const msg = raw?.message || raw?.channel_post || raw?.edited_message || raw?.edited_channel_post || {};
  if (kind === "pdf") return msg?.document?.file_id || null;
  if (Array.isArray(msg?.photo)) return msg.photo.at(-1)?.file_id || null;
  return null;
}

function getAdmin() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    "https://ffkyjnswyfeghmfmlapu.supabase.co";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.APP_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.APP_SUPABASE_SECRET_KEY;
  if (!key) throw new Error("Supabase service key missing");
  return createClient(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

// ---------- List newspaper PDFs from the Telegram inbox ----------
export const listInboxNewspapers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = getAdmin();
    const { data: inboxRows, error: inboxError } = await supabase
      .from("telegram_inbox")
      .select("id,kind,file_name,caption,posted_at,size_bytes,drive_file_id,drive_view_link,source_url,status,error_message,raw")
      .in("kind", ["pdf", "link"])
      .is("archived_at", null)
      .order("posted_at", { ascending: false })
      .limit(100);
    if (inboxError) throw new Error(inboxError.message);

    const usableInboxRows = (inboxRows ?? []).filter((r: any) => {
      if (r.kind === "pdf") return true;
      return Boolean(getDriveUrlFromInboxRow(r));
    });

    const { data: docRows, error: docError } = await supabase
      .from("documents")
      .select("id,title,file_name,created_at,size_bytes,drive_file_id,drive_view_link,mime,source_type,status,error_message")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (docError) throw new Error(docError.message);

    const inboxIds = new Set(usableInboxRows.map((r: any) => r.drive_file_id).filter(Boolean));
    const documentPdfs = (docRows ?? [])
      .filter((r: any) => {
        const name = String(r.file_name || r.title || "").toLowerCase();
        const mime = String(r.mime || "").toLowerCase();
        return mime.includes("pdf") || name.endsWith(".pdf") || r.source_type === "telegram";
      })
      .filter((r: any) => !inboxIds.has(r.drive_file_id))
      // Hide rows whose Drive upload never completed — they have nothing to
      // extract. Showing them creates the confusing
      // "Newspaper PDF is visible but has no downloadable file yet." error.
      .filter((r: any) => Boolean(r.drive_file_id))
      .map((r: any) => ({
        id: r.id,
        file_name: r.file_name || r.title || "Uploaded newspaper PDF",
        caption: r.title || null,
        posted_at: r.created_at,
        size_bytes: r.size_bytes,
        drive_file_id: r.drive_file_id,
        drive_view_link: r.drive_view_link,
        status: r.status,
        error_message: r.error_message,
        source: "documents",
      }));

    return [
      ...((usableInboxRows ?? []) as any[]).map((r) => ({
        ...r,
        file_name: r.file_name || (r.kind === "link" ? "Google Drive newspaper PDF" : r.file_name),
        status: r.kind === "link" && !r.drive_file_id ? "drive_link_ready" : r.status,
        source: "telegram_inbox",
      })),
      ...documentPdfs,
    ].sort((a: any, b: any) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime());
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
    const supabase = getAdmin();
    const { error } = await supabase
      .from("editorials")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Remove a single editorial piece from a row's analysis JSON. If it was the
// last remaining piece, the entire row is deleted so it disappears from
// history as the user expects.
export const removeEditorialPiece = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; index: number }) =>
    z.object({ id: z.string().uuid(), index: z.number().int().min(0) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const supabase = getAdmin();
    const { data: row, error: readErr } = await supabase
      .from("editorials")
      .select("id,user_id,analysis")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (readErr) throw new Error(readErr.message);
    if (!row) throw new Error("Editorial not found");
    const analysis = (row.analysis as EditorialAnalysisFull) || { editorials: [] as EditorialItem[], detectedNewspaper: "" };
    const items = Array.isArray(analysis.editorials) ? analysis.editorials : [];
    if (data.index < 0 || data.index >= items.length) throw new Error("Piece index out of range");
    const nextItems = items.filter((_, i) => i !== data.index);
    if (nextItems.length === 0) {
      const { error } = await supabase.from("editorials").delete().eq("id", data.id).eq("user_id", context.userId);
      if (error) throw new Error(error.message);
      return { ok: true, rowDeleted: true };
    }
    const { error } = await supabase
      .from("editorials")
      .update({ analysis: { ...analysis, editorials: nextItems } })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true, rowDeleted: false };
  });

// ---------- Analyse editorial from an inbox PDF (paid Gemini) ----------
function bufferToBase64(buf: ArrayBuffer): string {
  return Buffer.from(buf).toString("base64");
}

const GEMINI_MODEL = "gemini-2.5-pro"; // paid tier — highest quality for editorial mining

function extractJsonCandidate(raw: string): string {
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  if (cleaned.startsWith("{") || cleaned.startsWith("[")) return cleaned;

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end > start) return cleaned.slice(start, end + 1);

  throw new Error("Gemini returned invalid JSON");
}

function parseEditorialJson(raw: string): EditorialAnalysisFull {
  const candidate = extractJsonCandidate(raw);
  try {
    return JSON.parse(candidate) as EditorialAnalysisFull;
  } catch {
    const cleaned = candidate
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
    try {
      return JSON.parse(cleaned) as EditorialAnalysisFull;
    } catch {
      return salvageEditorialJson(cleaned);
    }
  }
}

// Local salvage: recover as many complete editorial objects as possible from a
// truncated / malformed JSON blob, WITHOUT making another paid Gemini call.
function salvageEditorialJson(raw: string): EditorialAnalysisFull {
  const newspaperMatch = raw.match(/"detectedNewspaper"\s*:\s*"([^"]*)"/);
  const dateMatch = raw.match(/"editionDate"\s*:\s*"([^"]*)"/);
  const arrStart = raw.indexOf('"editorials"');
  const editorials: EditorialItem[] = [];
  if (arrStart !== -1) {
    const bracket = raw.indexOf("[", arrStart);
    if (bracket !== -1) {
      let i = bracket + 1;
      const n = raw.length;
      while (i < n) {
        while (i < n && raw[i] !== "{") i++;
        if (i >= n) break;
        const objStart = i;
        let depth = 0;
        let inStr = false;
        let esc = false;
        let objEnd = -1;
        for (; i < n; i++) {
          const c = raw[i];
          if (inStr) {
            if (esc) esc = false;
            else if (c === "\\") esc = true;
            else if (c === '"') inStr = false;
          } else {
            if (c === '"') inStr = true;
            else if (c === "{") depth++;
            else if (c === "}") {
              depth--;
              if (depth === 0) {
                objEnd = i;
                break;
              }
            }
          }
        }
        if (objEnd === -1) break; // truncated object — stop
        const slice = raw.slice(objStart, objEnd + 1);
        try {
          editorials.push(JSON.parse(slice) as EditorialItem);
        } catch {
          // skip malformed single entry, keep going
        }
        i = objEnd + 1;
      }
    }
  }
  return {
    detectedNewspaper: newspaperMatch?.[1] || "Unknown",
    editionDate: dateMatch?.[1],
    editorials,
  };
}

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

  const prompt = `You are UPSC Genius. The attached PDF is a full newspaper.
STRICT SCOPE — READ THIS TWICE:
- Process ONLY the EDITORIAL and OP-ED pages (headers labelled "EDITORIAL", "COMMENT", "OPINION", "OP-ED", "Ideas", "Leaders").
- Completely IGNORE: front page, news, city, sports, business, markets, advertisements, obituaries, letters to the editor, cartoons, weather, TV listings, classifieds.
- Do NOT summarise a news article even if it looks analytical. Only pieces printed under the editorial/op-ed masthead qualify.
- Cover EVERY distinct editorial / op-ed piece present on those pages (typically 3-6 per issue). Do not skip any.

For each qualifying piece, output:
- title: exact headline.
- newspaper: detected name.
- pageHint: page label if visible.
- syllabus: Prelims/Mains stage + GS paper + subject + topic (+ subTopic if useful).
- crispNotes: 5-7 tight bullets.
- comprehensiveNotes: 160-220 words in Markdown with ## Context / ## Core Argument / ## Analysis / ## Way Forward.
- keyFacts, vocabulary (3-5 items), argumentsFor, argumentsAgainst, wayForward (3 items).
- diagramMermaid: short valid mermaid (flowchart TD or mindmap), quoted labels, only when it truly aids understanding.
- pyqLinks: real PYQ themes only — omit year if unsure. No fabrication.
- probablePrelimsMCQ + probableMainsQuestion grounded in the piece.
- importance.

Hard rules:
- Never invent facts, schemes, judgements or statistics.
- English only (translate if source is Hindi/Odia).
- Return valid JSON ONLY matching the schema. No prose outside JSON.
- Keep every string tight — no padding — to stay within the token budget.
- If the PDF has NO editorial/op-ed pages, return { "detectedNewspaper": "...", "editorials": [] }.`;

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
      temperature: 0.15,
      maxOutputTokens: 16384,
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
  const finishReason = j?.candidates?.[0]?.finishReason;
  const text = j?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text ?? "").join("") ?? "";
  // Always attempt parse first — salvage will recover complete editorials even on MAX_TOKENS,
  // so we never waste a second paid Gemini call.
  let parsed: EditorialAnalysisFull;
  try {
    parsed = parseEditorialJson(text);
  } catch (parseError) {
    throw new Error(
      `Gemini returned unrecoverable JSON (finishReason=${finishReason ?? "unknown"}): ${(parseError as Error).message.slice(0, 200)}`,
    );
  }
  if (!Array.isArray(parsed.editorials)) parsed.editorials = [];
  return parsed;
}

export const analyseEditorialFromInbox = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { inboxId: string }) => z.object({ inboxId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const supabase = getAdmin();

    // Credit-saver: if this PDF was already analysed, return the cached result.
    const { data: cached } = await supabase
      .from("editorials")
      .select("id,analysis")
      .eq("user_id", context.userId)
      .eq("inbox_id", data.inboxId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (cached?.id) {
      const a = (cached.analysis ?? {}) as EditorialAnalysisFull;
      return {
        id: cached.id as string,
        editorialCount: Array.isArray(a?.editorials) ? a.editorials.length : 0,
        cached: true,
      };
    }

    const { data: inbox, error } = await supabase
      .from("telegram_inbox")
      .select("id,kind,file_name,caption,posted_at,drive_file_id,drive_view_link,source_url,mime,size_bytes,status,raw")
      .eq("id", data.inboxId)
      .maybeSingle();
    if (error) throw new Error(error.message);

    let source: {
      id: string;
      inboxId: string | null;
      fileName: string | null;
      caption: string | null;
      postedAt: string;
      driveFileId: string | null;
      mime: string | null;
      sizeBytes: number | null;
      raw?: unknown;
    } | null = inbox
      ? {
          id: inbox.id as string,
          inboxId: inbox.id as string,
          fileName: inbox.file_name as string | null,
          caption: inbox.caption as string | null,
          postedAt: inbox.posted_at as string,
          driveFileId: inbox.drive_file_id as string | null,
          mime: inbox.mime as string | null,
          sizeBytes: inbox.size_bytes as number | null,
          raw: inbox.raw,
        }
      : null;

    if (source && !source.driveFileId) {
      const driveUrl = getDriveUrlFromInboxRow(inbox);
      const driveId = driveUrl ? extractDriveFileId(driveUrl) : null;
      if (driveId) {
        try {
          const { uploadBufferToDrive } = await import("./gdrive.server");
          const dl = await fetchPublicDrivePdf(driveId);
          const uploaded = await uploadBufferToDrive({
            userId: TELEGRAM_SHARED_OWNER,
            fileName: dl.name || source.fileName || `drive-${driveId}.pdf`,
            mime: dl.mime || "application/pdf",
            data: dl.bytes,
          });
          await supabase
            .from("telegram_inbox")
            .update({
              kind: "pdf",
              file_name: dl.name || source.fileName || `drive-${driveId}.pdf`,
              drive_file_id: uploaded.fileId,
              drive_view_link: uploaded.webViewLink,
              mime: uploaded.mimeType,
              size_bytes: uploaded.size,
              status: "ready",
              error_message: null,
              source_url: driveUrl,
            })
            .eq("id", source.id);
          source.driveFileId = uploaded.fileId;
          source.fileName = dl.name || source.fileName || `drive-${driveId}.pdf`;
          source.mime = uploaded.mimeType;
          source.sizeBytes = uploaded.size;
        } catch (e: any) {
          throw new Error(`Could not import the Drive PDF for Editorial Lab. ${String(e?.message || e)}`);
        }
      }
    }

    if (source && !source.driveFileId && inbox?.raw) {
      const telegramFileId = getTelegramFileIdFromRaw(inbox.raw, "pdf");
      if (telegramFileId) {
        try {
          const [{ tgDownload }, { uploadBufferToDrive }] = await Promise.all([
            import("./telegram.server"),
            import("./gdrive.server"),
          ]);
          const { bytes } = await tgDownload(telegramFileId);
          const uploaded = await uploadBufferToDrive({
            userId: TELEGRAM_SHARED_OWNER,
            fileName: source.fileName || `telegram-${source.id}.pdf`,
            mime: source.mime || "application/pdf",
            data: bytes,
          });
          await supabase
            .from("telegram_inbox")
            .update({
              drive_file_id: uploaded.fileId,
              drive_view_link: uploaded.webViewLink,
              mime: uploaded.mimeType,
              size_bytes: uploaded.size,
              status: "ready",
              error_message: null,
            })
            .eq("id", source.id);
          source.driveFileId = uploaded.fileId;
          source.mime = uploaded.mimeType;
          source.sizeBytes = uploaded.size;
        } catch (e: any) {
          const msg = String(e?.message || e || "");
          if (/file is too big/i.test(msg)) {
            throw new Error("Telegram bots cannot download PDFs larger than 20 MB. Upload this newspaper manually or send a Drive link.");
          }
          throw new Error(`Could not fetch this Telegram PDF. Please resend it to the bot, then refresh. Details: ${msg}`);
        }
      }
    }

    if (!source?.driveFileId) {
      const { data: doc, error: docError } = await supabase
        .from("documents")
        .select("id,title,file_name,created_at,drive_file_id,mime,source_type,size_bytes")
        .eq("id", data.inboxId)
        .eq("user_id", context.userId)
        .maybeSingle();
      if (docError) throw new Error(docError.message);
      if (doc?.drive_file_id) {
        source = {
          id: doc.id as string,
          inboxId: null,
          fileName: doc.file_name as string | null,
          caption: doc.title as string | null,
          postedAt: doc.created_at as string,
          driveFileId: doc.drive_file_id as string,
          mime: doc.mime as string | null,
          sizeBytes: doc.size_bytes as number | null,
        };
      }
    }

    if (!source?.driveFileId) throw new Error("Newspaper PDF is visible but has no downloadable file yet. Resend it to Telegram or upload it manually, then press Refresh.");

    const { downloadDriveFile } = await import("./gdrive.server");
    const { buffer } = await downloadDriveFile(source.driveFileId);
    const analysis = await callGeminiOnPdf(buffer);

    const sourceLabel =
      source.fileName || source.caption || analysis.detectedNewspaper || "Newspaper";
    const editionDate = analysis.editionDate?.match(/^\d{4}-\d{2}-\d{2}$/)
      ? analysis.editionDate
      : String(source.postedAt).slice(0, 10);

    // Guard against FK violation: only keep inbox_id if the row still exists
    // in telegram_inbox (it may have been deleted, or the id may point to a
    // documents row that isn't in telegram_inbox).
    let safeInboxId: string | null = source.inboxId;
    if (safeInboxId) {
      const { data: existsRow } = await supabase
        .from("telegram_inbox")
        .select("id")
        .eq("id", safeInboxId)
        .maybeSingle();
      if (!existsRow) safeInboxId = null;
    }

    const insertPayload = {
      user_id: context.userId,
      inbox_id: safeInboxId,
      source_label: sourceLabel,
      newspaper: analysis.detectedNewspaper || "Unknown",
      edition_date: editionDate,
      analysis,
      model: GEMINI_MODEL,
    };
    let { data: inserted, error: insErr } = await supabase
      .from("editorials")
      .insert(insertPayload)
      .select("id")
      .single();
    if (insErr && /foreign key|editorials_inbox_id_fkey/i.test(insErr.message)) {
      // Retry once without the inbox link.
      const retry = await supabase
        .from("editorials")
        .insert({ ...insertPayload, inbox_id: null })
        .select("id")
        .single();
      inserted = retry.data;
      insErr = retry.error;
    }
    if (insErr) throw new Error(insErr.message);
    if (!inserted) throw new Error("Failed to save editorial analysis.");
    return { id: inserted.id as string, editorialCount: analysis.editorials.length };
  });