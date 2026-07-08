import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const InputSchema = z.object({
  images: z.array(z.string().min(20)).min(1).max(8),
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
    const { createGateway, getAiTaskProfile, UPSC_SYSTEM_PROMPT } = await import("./ai-gateway.server");
    const { generateText } = await import("ai");

    const profile = getAiTaskProfile("newspaper");
    // Prefer Gemini (vision-capable). Fall back to whatever the profile picks.
    let gw: ReturnType<typeof createGateway>;
    let modelId = profile.model;
    try {
      gw = createGateway(undefined, "gemini");
      modelId = "gemini-2.5-flash";
    } catch {
      gw = createGateway(undefined, profile.provider);
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

    const runOnce = async (currentGw: ReturnType<typeof createGateway>, currentModel: string) =>
      generateText({
        model: currentGw(currentModel),
      system: UPSC_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            ...data.images.map((img) => ({ type: "image" as const, image: img })),
            { type: "text" as const, text: prompt },
          ],
        },
      ],
        maxRetries: 1,
        abortSignal: AbortSignal.timeout(90_000),
      });

    let text: string;
    try {
      ({ text } = await runOnce(gw, modelId));
    } catch (primaryError) {
      // Try Gemini directly as fallback if the first attempt failed.
      try {
        const fallbackGw = createGateway(undefined, "gemini");
        ({ text } = await runOnce(fallbackGw, "gemini-2.5-flash"));
      } catch {
        const msg = primaryError instanceof Error ? primaryError.message : String(primaryError);
        throw new Error(`Newspaper analysis failed: ${msg.slice(0, 200)}`);
      }
    }

    const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
    try {
      return JSON.parse(cleaned) as NewspaperAnalysis;
    } catch {
      const m = cleaned.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("AI returned non-JSON response");
      return JSON.parse(m[0]) as NewspaperAnalysis;
    }
  });
