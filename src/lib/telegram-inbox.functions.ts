import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface InboxItem {
  id: string;
  kind: "pdf" | "image" | "link";
  caption: string | null;
  posted_at: string;
  file_name: string | null;
  mime: string | null;
  size_bytes: number | null;
  drive_file_id: string | null;
  drive_view_link: string | null;
  source_url: string | null;
  status: string;
  archived_at: string | null;
}

export const listInbox = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d?: { archived?: boolean }) => d ?? {})
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("telegram_inbox")
      .select("id,kind,caption,posted_at,file_name,mime,size_bytes,drive_file_id,drive_view_link,source_url,status,archived_at")
      .order("posted_at", { ascending: false })
      .limit(100);
    if (data.archived) q = q.not("archived_at", "is", null);
    else q = q.is("archived_at", null);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as InboxItem[];
  });

export const importInboxItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { itemId: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: item, error } = await supabase
      .from("telegram_inbox")
      .select("*")
      .eq("id", data.itemId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!item) throw new Error("Inbox item not found");
    if (item.kind === "link") throw new Error("Link items cannot be imported as documents — open the URL directly.");
    if (!item.drive_file_id) throw new Error("This item has no stored file.");

    const title = item.file_name || (item.caption?.slice(0, 80) ?? "Telegram import");
    const { data: doc, error: insertErr } = await supabase
      .from("documents")
      .insert({
        user_id: userId,
        title,
        file_name: item.file_name,
        source_type: item.kind === "pdf" ? "pdf" : "image",
        mime: item.mime,
        size_bytes: item.size_bytes,
        storage_provider: "google_drive",
        drive_file_id: item.drive_file_id,
        drive_view_link: item.drive_view_link,
        status: "uploaded",
      })
      .select("id")
      .single();
    if (insertErr) throw new Error(insertErr.message);
    return { documentId: doc.id };
  });

export const archiveInboxItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { itemId: string; archived: boolean }) => d)
  .handler(async ({ data }) => {
    // Writes go through the service role — RLS on telegram_inbox forbids
    // direct client writes so authenticated users cannot tamper with the
    // shared inbox. Server functions are the trusted boundary.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("telegram_inbox")
      .update({ archived_at: data.archived ? new Date().toISOString() : null })
      .eq("id", data.itemId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteInboxItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { itemId: string }) => d)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("telegram_inbox")
      .delete()
      .eq("id", data.itemId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
