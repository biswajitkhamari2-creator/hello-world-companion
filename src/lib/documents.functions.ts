import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SUBJECTS = [
  "Polity", "History", "Geography", "Economy", "Environment",
  "Science & Technology", "International Relations", "Security",
  "Society", "Governance", "Ethics", "Current Affairs",
] as const;

const DRIVE_FILE_INACCESSIBLE_MESSAGE =
  "This Google Drive file is no longer accessible. Delete this document and upload/forward it again.";

function isDriveFileInaccessibleError(error: unknown): boolean {
  const message = String((error as any)?.message || error || "");
  return /no longer accessible in Google Drive|File not found|uploaded under a previous connector grant|drive\.file scope/i.test(
    message,
  );
}

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

function bufferToBase64(buf: ArrayBuffer): string {
  return Buffer.from(buf).toString("base64");
}

// OCR fallback via Gemini Vision for scanned PDFs / images / poor-text PDFs.
async function ocrWithGemini(buf: ArrayBuffer, mime: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  const sendMime = mime?.startsWith("image/") || mime === "application/pdf" ? mime : "application/pdf";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Extract ALL readable text from this document (newspaper / scanned pages). Return only the plain text, preserving paragraph order. Do not summarise." },
            { inline_data: { mime_type: sendMime, data: bufferToBase64(buf) } },
          ],
        }],
      }),
    },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini OCR failed: ${res.status} ${body.slice(0, 200)}`);
  }
  const json: any = await res.json();
  const parts = json?.candidates?.[0]?.content?.parts ?? [];
  return parts.map((p: any) => p?.text || "").join("\n").trim();
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

      // Newspaper / scanned PDFs often return little-to-no native text.
      // Fall back to Gemini Vision OCR for PDFs and images.
      const looksScanned = text.length < 200 || (text.match(/[a-zA-Z]/g) || []).length < 50;
      const isPdf = (doc.mime || "").includes("pdf") || (doc.title || "").toLowerCase().endsWith(".pdf");
      if (looksScanned && (isImage || isPdf)) {
        try {
          const ocr = await ocrWithGemini(buffer, doc.mime || (isPdf ? "application/pdf" : ""));
          if (ocr && ocr.length > text.length) text = ocr;
        } catch (e) {
          console.error("ocr fallback failed", e);
        }
      }

      if (!text) {
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
      if (isDriveFileInaccessibleError(e)) {
        await supabase.from("documents").update({
          status: "failed",
          error_message: DRIVE_FILE_INACCESSIBLE_MESSAGE,
        }).eq("id", doc.id);
        return {
          ok: false,
          reason: "drive_file_inaccessible",
          message: DRIVE_FILE_INACCESSIBLE_MESSAGE,
        };
      }
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
      .select("id,title,source_type,subject,priority,summary,status,error_message,size_bytes,created_at,mime,drive_file_id,drive_view_link,storage_provider")
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

// --- Direct-to-Drive resumable upload (supports very large files) ---

// Step 1: client asks for a resumable upload URL + creates a placeholder document row.
export const createUploadSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        fileName: z.string().min(1).max(255),
        mime: z.string().min(1).max(200),
        size: z.number().int().positive().max(5 * 1024 * 1024 * 1024),
        title: z.string().min(1).max(255).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { createResumableUploadSession } = await import("./gdrive.server");
    const { uploadUrl } = await createResumableUploadSession({
      userId,
      fileName: data.fileName,
      mime: data.mime,
      size: data.size,
    });
    const { data: row, error } = await supabase
      .from("documents")
      .insert({
        user_id: userId,
        title: data.title || data.fileName,
        file_name: data.fileName,
        mime: data.mime,
        size_bytes: data.size,
        source_type: "upload",
        status: "uploaded",
        storage_provider: "google_drive",
      })
      .select("id")
      .single();
    if (error) throw error;
    return { documentId: row.id, uploadUrl };
  });

// Step 2: after browser finishes the resumable PUTs, confirm and link the Drive file to the row.
export const finalizeUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        documentId: z.string().uuid(),
        driveFileId: z.string().min(1).max(200),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { getDriveFileMetadata } = await import("./gdrive.server");
    const meta = await getDriveFileMetadata(data.driveFileId);
    const { data: row, error } = await supabase
      .from("documents")
      .update({
        status: "uploaded",
        drive_file_id: meta.id,
        drive_view_link: meta.webViewLink,
        size_bytes: meta.size,
        mime: meta.mimeType,
      })
      .eq("id", data.documentId)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw error;
    return row;
  });
