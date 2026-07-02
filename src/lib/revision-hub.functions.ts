import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const KINDS = [
  "one_liners",
  "pyq",
  "static_link",
  "mind_map",
  "flashcards",
  "notes",
  "planner",
  "weekly",
  "monthly",
  "quiz_prelims",
  "quiz_mains",
  "evaluate_answer",
  "mnemonics",
] as const;

const Input = z.object({
  kind: z.enum(KINDS),
  topic: z.string().max(400).optional(),
  period: z.enum(["daily", "weekly", "monthly"]).optional(),
  gs: z.enum(["all", "GS1", "GS2", "GS3", "GS4"]).optional(),
  answer: z.string().max(6000).optional(),
  question: z.string().max(1000).optional(),
});

function promptFor(input: z.infer<typeof Input>): string {
  const topic = input.topic?.trim() || "current UPSC-relevant themes";
  const gs = input.gs && input.gs !== "all" ? input.gs : "any relevant GS paper";
  const period = input.period ?? "daily";
  switch (input.kind) {
    case "one_liners":
      return `Generate 12 ultra-short one-liner revision facts for UPSC (${period} scope) on: ${topic}.
Scope: ${gs}. Each line must be under 22 words, factual, exam-hitting.
Return JSON: {"items":[{"id":"1","text":"...","gs":"GS2","tag":"Polity"}]} — no prose, no markdown.`;
    case "pyq":
      return `For UPSC topic "${topic}", list 6 most-repeated PYQ themes.
Return JSON: {"items":[{"year":"2023","paper":"GS2","question":"...","why_important":"...","current_link":"..."}]}`;
    case "static_link":
      return `Build a static-current linkage chain for: "${topic}".
Return JSON: {"news":"...","static_topic":"...","reference_book":"...","pyq":"...","expected_question":"..."}`;
    case "mind_map":
      return `Create a UPSC mind map for "${topic}". Depth up to 3.
Return JSON: {"root":"${topic}","children":[{"name":"Branch","children":[{"name":"Node","children":[]}]}]}`;
    case "flashcards":
      return `Generate 10 UPSC flashcards for "${topic}" (${gs}).
Return JSON: {"cards":[{"id":"1","front":"Q","back":"A","tag":"GS2"}]}`;
    case "notes":
      return `Write concise UPSC-focused handwritten-style revision notes on "${topic}" (${gs}).
Format: markdown, bullet-first, bold keywords, include 2 PYQ references and 1 mains-worthy angle. Under 500 words.`;
    case "planner":
      return `Create today's UPSC revision planner focused on "${topic || "balanced GS mix"}".
Return JSON: {"date":"${new Date().toISOString().slice(0, 10)}","blocks":[{"id":"1","time":"06:30-07:30","topic":"...","gs":"GS1","goal":"..."}]}`;
    case "weekly":
      return `Summarise the past week's most important UPSC current affairs on "${topic || "all GS"}".
Return JSON: {"summary_md":"markdown summary","quiz":[{"q":"...","options":["A","B","C","D"],"answer":0,"explain":"..."}]}`;
    case "monthly":
      return `Compile the past month's UPSC current affairs on "${topic || "all GS"}".
Return JSON: {"sections":[{"title":"Polity","points":["..."]},{"title":"Economy","points":["..."]},{"title":"Environment","points":["..."]},{"title":"IR","points":["..."]},{"title":"S&T","points":["..."]},{"title":"Schemes","points":["..."]},{"title":"Reports & Indices","points":["..."]},{"title":"Committees","points":["..."]}]}`;
    case "quiz_prelims":
      return `Generate 5 UPSC Prelims MCQs on "${topic}". Difficulty: exam-grade.
Return JSON: {"items":[{"q":"...","options":["A","B","C","D"],"answer":0,"explain":"..."}]}`;
    case "quiz_mains":
      return `Generate 4 UPSC Mains questions on "${topic}" with word limits and directive verbs.
Return JSON: {"items":[{"paper":"GS2","question":"...","words":250,"hint":"..."}]}`;
    case "evaluate_answer":
      return `Evaluate this UPSC Mains answer to the question: "${input.question || topic}".
Answer:
"""
${input.answer || ""}
"""
Return JSON: {"score":7.5,"max":10,"strengths":["..."],"gaps":["..."],"model_answer_md":"markdown model answer","keywords":["..."]}`;
    case "mnemonics":
      return `Create 6 memory tricks (mnemonics, acronyms, visual/story) for "${topic}".
Return JSON: {"items":[{"kind":"acronym","trigger":"BRICS","expansion":"...","story":"..."}]}`;
  }
}

function extractJson(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const m = trimmed.match(/[\[{][\s\S]*[\]}]/);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch {
        // fall through
      }
    }
    return null;
  }
}

export const runRevisionAi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => Input.parse(raw))
  .handler(async ({ data }) => {
    const { createGateway, getAiTaskProfile, UPSC_SYSTEM_PROMPT } = await import("./ai-gateway.server");
    const { generateText } = await import("ai");
    const profile = getAiTaskProfile();
    const gw = createGateway(undefined, profile.provider);
    const prompt = promptFor(data);
    const wantsJson = data.kind !== "notes";
    const { text } = await generateText({
      model: gw(profile.model),
      system: wantsJson
        ? `${UPSC_SYSTEM_PROMPT}\nReturn ONLY valid JSON. No markdown fences, no prose.`
        : UPSC_SYSTEM_PROMPT,
      prompt,
      temperature: 0.3,
    });
    if (!wantsJson) return { kind: data.kind, markdown: text };
    const parsed = extractJson(text);
    if (!parsed) throw new Error("AI returned unparseable output. Please retry.");
    return { kind: data.kind, data: parsed };
  });