import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- Types ----------
export type GsPaper = "GS1" | "GS2" | "GS3" | "GS4" | "General";

export interface NewsItem {
  id: string;
  inbox_id: string;
  gs_paper: GsPaper;
  subject: string | null;
  title: string;
  summary: string | null;
  importance: number; // 1..5
  posted_at: string;
}

function getAdmin() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    "https://ffkyjnswyfeghmfmlapu.supabase.co";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.APP_SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Supabase service key missing");
  return createClient(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

// ---------- List ----------
export const listNewsItems = createServerFn({ method: "GET" })
  .inputValidator(
    (input: { gs?: string; limit?: number } | undefined) =>
      z
        .object({
          gs: z.enum(["GS1", "GS2", "GS3", "GS4", "General", "all"]).optional(),
          limit: z.number().int().min(1).max(300).optional(),
        })
        .optional()
        .parse(input),
  )
  .handler(async ({ data }) => {
    const limit = data?.limit ?? 60;
    const supabase = getAdmin();
    let q = supabase
      .from("telegram_news_items")
      .select("id, inbox_id, gs_paper, subject, title, summary, importance, posted_at")
      .order("posted_at", { ascending: false })
      .order("importance", { ascending: false })
      .limit(limit);
    if (data?.gs && data.gs !== "all") q = q.eq("gs_paper", data.gs);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as NewsItem[];
  });

export const countPendingInbox = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getAdmin();
  const { count, error } = await supabase
    .from("telegram_inbox")
    .select("id", { count: "exact", head: true })
    .eq("kind", "pdf")
    .eq("status", "ready")
    .is("analysed_at", null);
  if (error) throw new Error(error.message);
  return { pending: count ?? 0 };
});

// ---------- Archive: search by date range + keyword ----------
export const searchNewsArchive = createServerFn({ method: "GET" })
  .inputValidator(
    (input: { from?: string; to?: string; gs?: string; q?: string; limit?: number } | undefined) =>
      z
        .object({
          from: z.string().optional(), // ISO date "YYYY-MM-DD"
          to: z.string().optional(),
          gs: z.enum(["GS1", "GS2", "GS3", "GS4", "General", "all"]).optional(),
          q: z.string().max(200).optional(),
          limit: z.number().int().min(1).max(500).optional(),
        })
        .optional()
        .parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = getAdmin();
    let q = supabase
      .from("telegram_news_items")
      .select("id, inbox_id, gs_paper, subject, title, summary, importance, posted_at")
      .order("posted_at", { ascending: false })
      .order("importance", { ascending: false })
      .limit(data?.limit ?? 200);
    if (data?.from) q = q.gte("posted_at", `${data.from}T00:00:00Z`);
    if (data?.to) q = q.lte("posted_at", `${data.to}T23:59:59Z`);
    if (data?.gs && data.gs !== "all") q = q.eq("gs_paper", data.gs);
    if (data?.q && data.q.trim()) {
      const term = data.q.trim().replace(/[%,]/g, " ");
      q = q.or(`title.ilike.%${term}%,summary.ilike.%${term}%,subject.ilike.%${term}%`);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as NewsItem[];
  });

export const listArchiveDates = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getAdmin();
  const { data, error } = await supabase
    .from("telegram_news_items")
    .select("posted_at")
    .order("posted_at", { ascending: false })
    .limit(2000);
  if (error) throw new Error(error.message);
  const set = new Set<string>();
  for (const r of (data ?? []) as Array<{ posted_at: string }>) {
    set.add(r.posted_at.slice(0, 10));
  }
  return Array.from(set);
});

// ---------- Extract (one PDF per call) ----------

function bufferToBase64(buf: ArrayBuffer): string {
  return Buffer.from(buf).toString("base64");
}

async function geminiExtractStructured(pdfBytes: ArrayBuffer): Promise<Array<{
  gs_paper: GsPaper;
  subject: string | null;
  title: string;
  summary: string;
  importance: number;
}>> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const schema = {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            gs_paper: { type: "string", enum: ["GS1", "GS2", "GS3", "GS4", "General"] },
            subject: { type: "string" },
            title: { type: "string" },
            summary: { type: "string" },
            importance: { type: "integer", minimum: 1, maximum: 5 },
          },
          required: ["gs_paper", "title", "summary", "importance"],
        },
      },
    },
    required: ["items"],
  } as const;

  const prompt = `You are a senior UPSC / OPSC mentor scanning a full newspaper PDF.
The newspaper may be in English, Hindi, or Odia (ଓଡ଼ିଆ) — read all scripts.
Extract ONLY articles that are directly relevant to the UPSC / OPSC syllabus.
SKIP crime blotter, local city notices, sports scores, horoscope, advertisements, obituaries, movie reviews, film/celebrity gossip, share-market ticker.

For every relevant article return:
 - gs_paper: one of GS1 (History, Geography, Society, Art & Culture), GS2 (Polity, Governance, IR, Social Justice), GS3 (Economy, Environment, S&T, Security, Disaster), GS4 (Ethics), General (only if truly cross-cutting).
 - subject: fine-grained tag (e.g. "Indian Polity", "Environment", "International Relations", "Economy").
 - title: crisp English headline in your own words, max 110 chars, no clickbait. Translate Odia/Hindi headlines to English.
 - summary: 2 to 4 sentence crisp brief in ENGLISH with WHAT / WHY it matters for UPSC — no fluff, no "according to article". Always translate source content to English regardless of original language.
 - importance: 1..5 where 5 = must-read for prelims/mains, 4 = high, 3 = useful, 2 = optional, 1 = skip.

Return at most 20 items. Prefer quality over quantity. Give special attention to Odisha state, OPSC-relevant governance, and regional angles when present. Return valid JSON only.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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
          temperature: 0.2,
        },
      }),
    },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini extract failed: ${res.status} ${body.slice(0, 200)}`);
  }
  const json: any = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text ?? "").join("") ?? "";
  let parsed: any = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Gemini did not return valid JSON");
  }
  const items = Array.isArray(parsed?.items) ? parsed.items : [];
  return items
    .filter((it: any) => it && typeof it.title === "string" && it.title.trim().length)
    .map((it: any) => ({
      gs_paper: (["GS1", "GS2", "GS3", "GS4", "General"].includes(it.gs_paper) ? it.gs_paper : "General") as GsPaper,
      subject: it.subject ? String(it.subject).slice(0, 80) : null,
      title: String(it.title).slice(0, 200),
      summary: String(it.summary || "").slice(0, 900),
      importance: Math.max(1, Math.min(5, Number(it.importance) || 3)),
    }));
}

export const extractPendingInboxNews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const supabase = getAdmin();
    // Pick the newest un-analysed PDF.
    const { data: rows, error } = await supabase
      .from("telegram_inbox")
      .select("id, drive_file_id, posted_at")
      .eq("kind", "pdf")
      .eq("status", "ready")
      .is("analysed_at", null)
      .not("drive_file_id", "is", null)
      .order("posted_at", { ascending: false })
      .limit(1);
    if (error) throw new Error(error.message);
    const inbox = rows?.[0];
    if (!inbox) return { processed: 0, remaining: 0 };

    try {
      const { downloadDriveFile } = await import("./gdrive.server");
      const { buffer } = await downloadDriveFile(inbox.drive_file_id as string);
      const items = await geminiExtractStructured(buffer);
      if (items.length) {
        const rowsToInsert = items.map((it) => ({
          inbox_id: inbox.id,
          gs_paper: it.gs_paper,
          subject: it.subject,
          title: it.title,
          summary: it.summary,
          importance: it.importance,
          posted_at: inbox.posted_at,
        }));
        const { error: insErr } = await supabase.from("telegram_news_items").insert(rowsToInsert);
        if (insErr) throw new Error(insErr.message);
      }
      await supabase
        .from("telegram_inbox")
        .update({ analysed_at: new Date().toISOString() })
        .eq("id", inbox.id);

      const { count } = await supabase
        .from("telegram_inbox")
        .select("id", { count: "exact", head: true })
        .eq("kind", "pdf")
        .eq("status", "ready")
        .is("analysed_at", null);
      return { processed: 1, extracted: items.length, remaining: count ?? 0 };
    } catch (e) {
      // Mark it analysed anyway so we don't loop forever on a bad file.
      await supabase
        .from("telegram_inbox")
        .update({
          analysed_at: new Date().toISOString(),
          error_message: (e as Error).message?.slice(0, 300) ?? "extract failed",
        })
        .eq("id", inbox.id);
      throw e;
    }
  });