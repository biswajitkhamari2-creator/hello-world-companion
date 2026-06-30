import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const InputSchema = z.object({
  text: z.string().min(50, "Editorial too short").max(60000),
  source: z.string().optional(),
});

export type EditorialAnalysis = {
  title: string;
  source: string;
  threeLineSummary: string[];
  abstract: string;
  gsMapping: Array<{ paper: string; subject: string; topic: string; relevance: string }>;
  keyConcepts: Array<{ term: string; explanation: string }>;
  facts: string[];
  vocabulary: Array<{ word: string; meaning: string }>;
  arguments: { for: string[]; against: string[] };
  wayForward: string[];
  prelimsMCQs: Array<{ q: string; options: string[]; answer: number; explanation: string }>;
  mainsQuestions: Array<{ q: string; paper: string; marks: number; approach: string }>;
  pyqLinks: string[];
  importance: "Low" | "Medium" | "High" | "Very High";
};

export const analyseEditorial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<EditorialAnalysis> => {
    const { createGateway, DEFAULT_MODEL, UPSC_SYSTEM_PROMPT } = await import("./ai-gateway.server");
    const { generateText } = await import("ai");

    const gw = createGateway();
    const prompt = `Analyse the following editorial for an UPSC Civil Services aspirant. Return STRICT JSON only (no markdown, no commentary) matching this TypeScript type:

{
  "title": string,
  "source": string,
  "threeLineSummary": string[3],            // exactly 3 crisp lines capturing the editorial
  "abstract": string,                        // 4-6 sentence neutral abstract
  "gsMapping": Array<{paper:"GS-I"|"GS-II"|"GS-III"|"GS-IV"|"Essay"|"Prelims", subject:string, topic:string, relevance:string}>,
  "keyConcepts": Array<{term:string, explanation:string}>,  // 4-8 items
  "facts": string[],                         // hard facts/data/dates mentioned
  "vocabulary": Array<{word:string, meaning:string}>,       // 5-8 exam-useful words
  "arguments": {"for": string[], "against": string[]},
  "wayForward": string[],                    // 3-5 actionable points
  "prelimsMCQs": Array<{q:string, options:string[4], answer:number, explanation:string}>, // 2-3 MCQs
  "mainsQuestions": Array<{q:string, paper:string, marks:10|15, approach:string}>,        // 2 questions
  "pyqLinks": string[],                      // related PYQ themes (no fabricated years)
  "importance": "Low"|"Medium"|"High"|"Very High"
}

Rules:
- Do not invent facts, articles, judgements, schemes, or quotes.
- If something is not in the editorial, omit it rather than fabricate.
- Use Indian conventions and exam terminology.
- Output JSON ONLY. No \`\`\` fences.

Source label: ${data.source || "Unknown"}

EDITORIAL:
"""
${data.text}
"""`;

    const { text } = await generateText({
      model: gw(DEFAULT_MODEL),
      system: UPSC_SYSTEM_PROMPT,
      prompt,
      maxRetries: 1,
    });

    const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
    let parsed: EditorialAnalysis;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const m = cleaned.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("AI returned non-JSON response");
      parsed = JSON.parse(m[0]);
    }
    return parsed;
  });
