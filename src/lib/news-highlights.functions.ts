import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

export interface NewsHighlight {
  id: string;
  kind: "pdf" | "image" | "link" | "text";
  title: string;
  summary: string | null;
  source_url: string | null;
  drive_view_link: string | null;
  posted_at: string;
}

function getReadClient() {
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

export const listNewsHighlights = createServerFn({ method: "GET" })
  .inputValidator((input: { limit?: number; kind?: string } | undefined) =>
    z
      .object({
        limit: z.number().int().min(1).max(200).optional(),
        kind: z.string().optional(),
      })
      .optional()
      .parse(input),
  )
  .handler(async ({ data }) => {
    const limit = data?.limit ?? 24;
    const supabase = getReadClient();
    let q = supabase
      .from("telegram_inbox")
      .select(
        "id, kind, file_name, caption, source_url, drive_view_link, posted_at, status",
      )
      .eq("status", "ready")
      .order("posted_at", { ascending: false })
      .limit(limit);
    if (data?.kind) q = q.eq("kind", data.kind);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const items: NewsHighlight[] = (rows ?? []).map((r: any) => {
      const rawTitle: string =
        (r.caption && String(r.caption).trim()) ||
        (r.file_name && String(r.file_name).trim()) ||
        (r.source_url && String(r.source_url).trim()) ||
        "Untitled";
      const title = rawTitle.length > 140 ? rawTitle.slice(0, 137) + "…" : rawTitle;
      const summary =
        r.caption && r.caption !== rawTitle
          ? String(r.caption).slice(0, 300)
          : null;
      return {
        id: String(r.id),
        kind: (r.kind || "text") as NewsHighlight["kind"],
        title,
        summary,
        source_url: r.source_url ?? null,
        drive_view_link: r.drive_view_link ?? null,
        posted_at: r.posted_at,
      };
    });
    return items;
  });