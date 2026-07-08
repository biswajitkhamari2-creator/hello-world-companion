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

    const prompt = `You are shown one or more photos/scans of a printed newspaper page. Extract every distinct news item that is RELEVANT to India's UPSC Civil Services Examination.

SKIP: cricket/sports scores, entertainment/celebrity gossip, advertisements, weather boxes, matrimonial, obituaries, classifieds, local crime blotter (unless it has policy angle), stock tables.

KEEP: policy, governance, judiciary rulings, economy, international relations, science & tech, environment, social issues, schemes, reports/indices, constitutional matters, history/culture angles.

Return STRICT JSON ONLY (no markdown, no fences) matching:

{
  "source": string,   // newspaper name if visible, else ""
  "date": string,     // date if visible, else ""
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
        maxOutputTokens: 4096,
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

    const text = json?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text ?? "").join("") ?? "";
    const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
    let parsed: NewspaperAnalysis;
    try {
      parsed = JSON.parse(cleaned) as NewspaperAnalysis;
    } catch {
      const m = cleaned.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("AI returned non-JSON response");
      parsed = JSON.parse(m[0]) as NewspaperAnalysis;
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
