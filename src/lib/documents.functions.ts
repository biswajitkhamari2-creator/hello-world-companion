import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SUBJECTS = [
  "Polity", "History", "Geography", "Economy", "Environment",
  "Science & Technology", "International Relations", "Security",
  "Society", "Governance", "Ethics", "Current Affairs",
] as const;

async function extractTextFromBuffer(buf: ArrayBuffer, mime: string, filename: string): Promise<string> {
  const lower = (mime || "").toLowerCase();
  const name = filename.toLowerCase();

  if (lower.includes("pdf") || name.endsWith(".pdf")) {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(buf));
    const { text } = await extractText(pdf, { mergePages: true });
    return (text || "").trim();
  }
  if (lower.includes("officedocument.wordprocessingml") || name.endsWith(".docx")) {
    const mammoth: any = await import("mammoth");
    const out = await mammoth.extractRawText({ buffer: Buffer.from(buf) });
    return (out.value || "").trim();
  }
  if (lower.startsWith("text/") || name.endsWith(".txt") || name.endsWith(".md")) {
    return new TextDecoder().decode(buf).trim();
  }
  return "";
}

// New: Upload directly to Google Drive and create the document row in one server-side call.
// Accepts a multipart/form-data body with a `file` field.
export const uploadDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => {
    if (!(d instanceof FormData)) throw new Error("Expected FormData");
    const file = d.get("file");
    if (!(file instanceof File)) throw new Error("Missing file");
    const title = (d.get("title") as string | null) || file.name;
    return { file, title };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { uploadBufferToDrive } = await import("./gdrive.server");

    const buf = await data.file.arrayBuffer();
    const mime = data.file.type || "application/octet-stream";
    const upload = await uploadBufferToDrive({
      userId,
      fileName: data.file.name,
      mime,
      data: buf,
    });

    const { data: row, error } = await supabase
      .from("documents")
      .insert({
        user_id: userId,
        title: data.title,
        file_name: data.file.name,
        mime,
        size_bytes: upload.size,
        source_type: "upload",
        status: "uploaded",
        storage_provider: "google_drive",
        drive_file_id: upload.fileId,
        drive_view_link: upload.webViewLink,
      })
      .select()
      .single();
    if (error) {
      // best-effort rollback
      try {
        const { deleteDriveFile } = await import("./gdrive.server");
        await deleteDriveFile(upload.fileId);
      } catch {}
      throw error;
    }
    return row;
  });

export const extractDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ documentId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: doc, error: docErr } = await supabase
      .from("documents")
      .select("*")
      .eq("id", data.documentId)
      .eq("user_id", userId)
      .single();
    if (docErr || !doc) throw new Error("Document not found");
    if (!doc.drive_file_id) throw new Error("Document has no Drive file reference");

    await supabase.from("documents").update({ status: "processing", error_message: null }).eq("id", doc.id);

    try {
      const { downloadDriveFile } = await import("./gdrive.server");
      const { buffer } = await downloadDriveFile(doc.drive_file_id);
      let text = await extractTextFromBuffer(buffer, doc.mime || "", doc.title);
      const isImage = (doc.mime || "").startsWith("image/");

      if (!text && isImage) text = "";
      if (!text && !isImage) {
        await supabase.from("documents").update({
          status: "failed",
          error_message: "Could not extract any text from this file.",
        }).eq("id", doc.id);
        return { ok: false, reason: "no_text" };
      }

      const trimmed = text.slice(0, 1_500_000);

      const { createGateway, DEFAULT_MODEL, UPSC_SYSTEM_PROMPT } = await import("./ai-gateway.server");
      const { generateObject } = await import("ai");
      const gw = createGateway();
      const sample = trimmed.length > 16000 ? trimmed.slice(0, 8000) + "\n...\n" + trimmed.slice(-8000) : trimmed;

      let subject: string | null = null;
      let priority: "high" | "medium" | "low" | null = null;
      let summary: string | null = null;
      try {
        const { object } = await generateObject({
          model: gw(DEFAULT_MODEL),
          system: UPSC_SYSTEM_PROMPT,
          schema: z.object({
            subject: z.enum(SUBJECTS),
            priority: z.enum(["high", "medium", "low"]),
            summary: z.string().min(20).max(600),
          }),
          prompt: `Classify the following study material for UPSC preparation.

Pick the single best subject from this list: ${SUBJECTS.join(", ")}.
Assess UPSC priority (high / medium / low) based on how frequently this topic appears in PYQs and the current syllabus.
Write a crisp 2–3 sentence summary highlighting UPSC relevance.

Material (excerpt):
"""
${sample}
"""`,
        });
        subject = object.subject;
        priority = object.priority;
        summary = object.summary;
      } catch (e) {
        console.error("classify failed", e);
      }

      await supabase.from("documents").update({
        extracted_text: trimmed,
        subject,
        priority,
        summary,
        status: "ready",
      }).eq("id", doc.id);

      return { ok: true, subject, priority };
    } catch (e: any) {
      console.error("extract failed", e);
      await supabase.from("documents").update({
        status: "failed",
        error_message: e?.message || "Extraction failed",
      }).eq("id", doc.id);
      throw e;
    }
  });

export const listDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("documents")
      .select("id,title,source_type,subject,priority,summary,status,size_bytes,created_at,mime,drive_file_id,drive_view_link,storage_provider")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  });

export const getDocument = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: doc, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", data.id)
      .eq("user_id", userId)
      .single();
    if (error || !doc) throw new Error("Not found");

    const { data: gens } = await supabase
      .from("generations")
      .select("id,output_type,title,content,model,status,error_message,created_at")
      .eq("document_id", doc.id)
      .order("created_at", { ascending: false });

    return { document: doc, generations: gens ?? [] };
  });

export const deleteDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: doc } = await supabase
      .from("documents")
      .select("drive_file_id")
      .eq("id", data.id)
      .eq("user_id", userId)
      .single();
    if (doc?.drive_file_id) {
      try {
        const { deleteDriveFile } = await import("./gdrive.server");
        await deleteDriveFile(doc.drive_file_id);
      } catch (e) {
        console.warn("[gdrive] delete failed, removing DB row anyway", e);
      }
    }
    const { error } = await supabase.from("documents").delete().eq("id", data.id).eq("user_id", userId);
    if (error) throw error;
    return { ok: true };
  });

// Admin/dev helper — returns the current Drive storage quota.
export const getDriveQuota = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { getDriveStorageQuota } = await import("./gdrive.server");
    return getDriveStorageQuota();
  });
