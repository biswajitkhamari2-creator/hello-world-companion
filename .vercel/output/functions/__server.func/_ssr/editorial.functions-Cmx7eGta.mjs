import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
import { ct as objectType, lt as stringType } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-B6mQfmFS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/editorial.functions-Cmx7eGta.js
var InputSchema = objectType({
	text: stringType().min(50, "Editorial too short").max(6e4),
	source: stringType().optional()
});
var analyseEditorial_createServerFn_handler = createServerRpc({
	id: "77ffa6cdc1f81929823c7c3e4031250af9c364e2ef136cfec4c887aa4477d7fc",
	name: "analyseEditorial",
	filename: "src/lib/editorial.functions.ts"
}, (opts) => analyseEditorial.__executeServer(opts));
var analyseEditorial = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => InputSchema.parse(data)).handler(analyseEditorial_createServerFn_handler, async ({ data }) => {
	const { createGateway, DEFAULT_MODEL, UPSC_SYSTEM_PROMPT } = await import("./ai-gateway.server-BQYhT5NC.mjs").then((n) => n.n);
	const { generateText } = await import("../_libs/@ai-sdk/react+[...].mjs").then((n) => n.i);
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
		maxRetries: 1
	});
	const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
	let parsed;
	try {
		parsed = JSON.parse(cleaned);
	} catch {
		const m = cleaned.match(/\{[\s\S]*\}/);
		if (!m) throw new Error("AI returned non-JSON response");
		parsed = JSON.parse(m[0]);
	}
	return parsed;
});
//#endregion
export { analyseEditorial_createServerFn_handler };
