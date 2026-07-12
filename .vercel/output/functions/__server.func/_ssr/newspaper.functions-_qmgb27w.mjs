import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
import { ct as objectType, it as arrayType, lt as stringType } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-B6mQfmFS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/newspaper.functions-_qmgb27w.js
var InputSchema = objectType({ images: arrayType(stringType().min(20)).min(1).max(8) });
var analyseNewspaper_createServerFn_handler = createServerRpc({
	id: "9820c5dec79ab9a518a05a3104e4233dc1709d9a8f0b34bbc10b547ea490d000",
	name: "analyseNewspaper",
	filename: "src/lib/newspaper.functions.ts"
}, (opts) => analyseNewspaper.__executeServer(opts));
var analyseNewspaper = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data) => InputSchema.parse(data)).handler(analyseNewspaper_createServerFn_handler, async ({ data }) => {
	const { createGateway, getAiTaskProfile, UPSC_SYSTEM_PROMPT } = await import("./ai-gateway.server-BQYhT5NC.mjs").then((n) => n.n);
	const { generateText } = await import("../_libs/@ai-sdk/react+[...].mjs").then((n) => n.i);
	const profile = getAiTaskProfile("newspaper");
	const gw = createGateway(void 0, profile.provider);
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
	const { text } = await generateText({
		model: gw(profile.model),
		system: UPSC_SYSTEM_PROMPT,
		messages: [{
			role: "user",
			content: [...data.images.map((img) => ({
				type: "image",
				image: img
			})), {
				type: "text",
				text: prompt
			}]
		}],
		maxRetries: 1
	});
	const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
	try {
		return JSON.parse(cleaned);
	} catch {
		const m = cleaned.match(/\{[\s\S]*\}/);
		if (!m) throw new Error("AI returned non-JSON response");
		return JSON.parse(m[0]);
	}
});
//#endregion
export { analyseNewspaper_createServerFn_handler };
