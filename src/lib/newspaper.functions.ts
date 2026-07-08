import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const InputSchema = z.object({
  images: z.array(z.string().min(20).max(1_200_000)).min(1).max(4),
});

export type NewsHeadline = {
  headline: string;
  summary: string;
  gsPaper: string;
  topic: string;
  relevance: "Low" | "Medium" | "High" | "Very High";
  whyItMatters: string;
  keywords: string[];
};

export type NewspaperAnalysis = {
  source: string;
  date: string;
  headlines: NewsHeadline[];
};

export const analyseNewspaper = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<NewspaperAnalysis> => {
    const geminiKey = process.env.GEMINI_API_KEY?.trim().replace(/^['"]|['"]$/g, "");
    if (!geminiKey) {
      throw new Error("Gemini key missing. Newspaper image analysis needs GEMINI_API_KEY.");
    }

    const today = new Date();
    const todayStr = today.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
    const prompt = `You are shown one or more photos/scans of a printed newspaper page. Today's real date is ${todayStr} (Asia/Kolkata). Extract every distinct news item that is RELEVANT to India's UPSC Civil Services Examination.

SKIP: cricket/sports scores, entertainment/celebrity gossip, advertisements, weather boxes, matrimonial, obituaries, classifieds, local crime blotter (unless it has policy angle), stock tables.

KEEP: policy, governance, judiciary rulings, economy, international relations, science & tech, environment, social issues, schemes, reports/indices, constitutional matters, history/culture angles.

DATE RULE (very important):
- Read the date ONLY from the newspaper masthead / dateline printed on the page.
- Copy it VERBATIM in the format printed (e.g. "8 July 2026" or "July 8, 2026").
- Do NOT guess, do NOT infer from context, do NOT use any date from your training data.
- If the date is not clearly visible in any image, return "date": "" (empty string). Never invent a date.

Return STRICT JSON ONLY (no markdown, no fences) matching:

{
  "source": string,   // newspaper name if visible, else ""
  "date": string,     // EXACT date printed on the masthead, else ""
  "headlines": Array<{
    "headline": string,
    "summary": string,           // 2-3 crisp neutral sentences from the article body
    "gsPaper": "GS-I"|"GS-II"|"GS-III"|"GS-IV"|"Prelims"|"Essay",
    "topic": string,             // exact syllabus topic
    "relevance": "Low"|"Medium"|"High"|"Very High",
    "whyItMatters": string,      // 1 line, exam lens
    "keywords": string[]         // 3-6 tags
  }>
}

Rules:
- Do NOT invent items not visible in the image.
- Order headlines by relevance (highest first).
- If nothing UPSC-relevant is visible, return "headlines": [].`;

    const schema = {
      type: "object",
      properties: {
        source: { type: "string" },
        date: { type: "string" },
        headlines: {
          type: "array",
          items: {
            type: "object",
            properties: {
              headline: { type: "string" },
              summary: { type: "string" },
              gsPaper: { type: "string", enum: ["GS-I", "GS-II", "GS-III", "GS-IV", "Prelims", "Essay"] },
              topic: { type: "string" },
              relevance: { type: "string", enum: ["Low", "Medium", "High", "Very High"] },
              whyItMatters: { type: "string" },
              keywords: { type: "array", items: { type: "string" } },
            },
            required: ["headline", "summary", "gsPaper", "topic", "relevance", "whyItMatters", "keywords"],
          },
        },
      },
      required: ["source", "date", "headlines"],
    } as const;

    const toInlinePart = (image: string) => {
      const match = image.match(/^data:([^;,]+);base64,(.+)$/);
      if (!match) throw new Error("Invalid image upload. Please upload JPG/PNG/PDF again.");
      return { inline_data: { mime_type: match[1], data: match[2] } };
    };

    const requestBody = {
      contents: [
        {
          role: "user" as const,
          parts: [
            {
              text: `You are UPSC Genius, an expert mentor for India's UPSC Civil Services Examination. Read the newspaper image carefully and return only valid JSON.\n\n${prompt}`,
            },
            ...data.images.map(toInlinePart),
          ],
        },
      ],
      generationConfig: {
        response_mime_type: "application/json",
        response_schema: schema,
        temperature: 0.1,
        maxOutputTokens: 16384,
      },
    };

    const callGemini = async (model: string) => {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(75_000),
      });
      if (!response.ok) {
        const body = await response.text().catch(() => "");
        const detail = body ? body.slice(0, 240) : response.statusText;
        throw new Error(`Gemini ${model} failed (${response.status}): ${detail}`);
      }
      return response.json();
    };

    let json: any;
    try {
      json = await callGemini("gemini-2.5-flash");
    } catch (firstError) {
      try {
        json = await callGemini("gemini-2.0-flash");
      } catch (secondError) {
        const msg = secondError instanceof Error ? secondError.message : firstError instanceof Error ? firstError.message : String(firstError);
        throw new Error(`Newspaper analysis failed: ${msg.slice(0, 200)}`);
      }
    }

    const candidate = json?.candidates?.[0];
    const finishReason = candidate?.finishReason ?? "";
    const blockReason = json?.promptFeedback?.blockReason ?? "";
    if (blockReason) {
      throw new Error(`Gemini blocked the image (${blockReason}). Try a clearer/cropped scan.`);
    }
    const text = candidate?.content?.parts?.map((p: any) => p?.text ?? "").join("") ?? "";
    if (!text.trim()) {
      throw new Error(`AI returned empty response${finishReason ? ` (${finishReason})` : ""}. Try fewer/smaller images.`);
    }
    let cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    // If response was truncated mid-JSON, try to salvage a complete object.
    const tryParse = (s: string): NewspaperAnalysis | null => {
      try { return JSON.parse(s) as NewspaperAnalysis; } catch { return null; }
    };
    let parsed = tryParse(cleaned);
    if (!parsed) {
      const start = cleaned.indexOf("{");
      if (start !== -1) {
        const slice = cleaned.slice(start);
        parsed = tryParse(slice);
        if (!parsed) {
          // Attempt to close truncated JSON: cut at last complete headline entry.
          const lastBrace = slice.lastIndexOf("}");
          if (lastBrace !== -1) {
            const trimmed = slice.slice(0, lastBrace + 1);
            // Close arrays/objects heuristically.
            for (const closer of ["", "]}", "]}", "}"]) {
              parsed = tryParse(trimmed + closer);
              if (parsed) break;
            }
          }
        }
      }
    }
    if (!parsed) {
      throw new Error(`AI returned invalid JSON${finishReason === "MAX_TOKENS" ? " (response too long — try fewer images)" : ""}.`);
    }

    const validGs = new Set(["GS-I", "GS-II", "GS-III", "GS-IV", "Prelims", "Essay"]);
    const validRelevance = new Set(["Low", "Medium", "High", "Very High"]);
    return {
      source: typeof parsed.source === "string" ? parsed.source.slice(0, 80) : "",
      date: typeof parsed.date === "string" ? parsed.date.slice(0, 40) : "",
      headlines: Array.isArray(parsed.headlines)
        ? parsed.headlines.slice(0, 25).map((h: any) => ({
            headline: String(h?.headline ?? "").trim().slice(0, 220),
            summary: String(h?.summary ?? "").trim().slice(0, 700),
            gsPaper: validGs.has(h?.gsPaper) ? h.gsPaper : "Prelims",
            topic: String(h?.topic ?? "Current Affairs").trim().slice(0, 120),
            relevance: validRelevance.has(h?.relevance) ? h.relevance : "Medium",
            whyItMatters: String(h?.whyItMatters ?? "").trim().slice(0, 300),
            keywords: Array.isArray(h?.keywords) ? h.keywords.map((k: any) => String(k).trim()).filter(Boolean).slice(0, 6) : [],
          })).filter((h) => h.headline.length > 4)
        : [],
    };
  });
