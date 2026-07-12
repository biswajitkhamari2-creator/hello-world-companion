import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
import { ct as objectType, lt as stringType, ot as enumType } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-B6mQfmFS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/revision-hub.functions-F8gOCNXs.js
var Input = objectType({
	kind: enumType([
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
		"mnemonics"
	]),
	topic: stringType().max(400).optional(),
	period: enumType([
		"daily",
		"weekly",
		"monthly"
	]).optional(),
	gs: enumType([
		"all",
		"GS1",
		"GS2",
		"GS3",
		"GS4"
	]).optional(),
	answer: stringType().max(6e3).optional(),
	question: stringType().max(1e3).optional()
});
function promptFor(input) {
	const topic = input.topic?.trim() || "current UPSC-relevant themes";
	const gs = input.gs && input.gs !== "all" ? input.gs : "any relevant GS paper";
	const period = input.period ?? "daily";
	switch (input.kind) {
		case "one_liners": return `Generate 12 ultra-short one-liner revision facts for UPSC (${period} scope) on: ${topic}.
Scope: ${gs}. Each line must be under 22 words, factual, exam-hitting.
Return JSON: {"items":[{"id":"1","text":"...","gs":"GS2","tag":"Polity"}]} — no prose, no markdown.`;
		case "pyq": return `For UPSC topic "${topic}", list 6 most-repeated PYQ themes.
Return JSON: {"items":[{"year":"2023","paper":"GS2","question":"...","why_important":"...","current_link":"..."}]}`;
		case "static_link": return `Build a static-current linkage chain for: "${topic}".
Return JSON: {"news":"...","static_topic":"...","reference_book":"...","pyq":"...","expected_question":"..."}`;
		case "mind_map": return `Create a UPSC mind map for "${topic}". Depth up to 3.
Return JSON: {"root":"${topic}","children":[{"name":"Branch","children":[{"name":"Node","children":[]}]}]}`;
		case "flashcards": return `Generate 10 UPSC flashcards for "${topic}" (${gs}).
Return JSON: {"cards":[{"id":"1","front":"Q","back":"A","tag":"GS2"}]}`;
		case "notes": return `Write concise UPSC-focused handwritten-style revision notes on "${topic}" (${gs}).
Format: markdown, bullet-first, bold keywords, include 2 PYQ references and 1 mains-worthy angle. Under 500 words.`;
		case "planner": return `Create today's UPSC revision planner focused on "${topic || "balanced GS mix"}".
Return JSON: {"date":"${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}","blocks":[{"id":"1","time":"06:30-07:30","topic":"...","gs":"GS1","goal":"..."}]}`;
		case "weekly": return `Summarise the past week's most important UPSC current affairs on "${topic || "all GS"}".
Return JSON: {"summary_md":"markdown summary","quiz":[{"q":"...","options":["A","B","C","D"],"answer":0,"explain":"..."}]}`;
		case "monthly": return `Compile the past month's UPSC current affairs on "${topic || "all GS"}".
Return JSON: {"sections":[{"title":"Polity","points":["..."]},{"title":"Economy","points":["..."]},{"title":"Environment","points":["..."]},{"title":"IR","points":["..."]},{"title":"S&T","points":["..."]},{"title":"Schemes","points":["..."]},{"title":"Reports & Indices","points":["..."]},{"title":"Committees","points":["..."]}]}`;
		case "quiz_prelims": return `Generate 5 UPSC Prelims MCQs on "${topic}". Difficulty: exam-grade.
Return JSON: {"items":[{"q":"...","options":["A","B","C","D"],"answer":0,"explain":"..."}]}`;
		case "quiz_mains": return `Generate 4 UPSC Mains questions on "${topic}" with word limits and directive verbs.
Return JSON: {"items":[{"paper":"GS2","question":"...","words":250,"hint":"..."}]}`;
		case "evaluate_answer": return `Evaluate this UPSC Mains answer to the question: "${input.question || topic}".
Answer:
"""
${input.answer || ""}
"""
Return JSON: {"score":7.5,"max":10,"strengths":["..."],"gaps":["..."],"model_answer_md":"markdown model answer","keywords":["..."]}`;
		case "mnemonics": return `Create 6 memory tricks (mnemonics, acronyms, visual/story) for "${topic}".
Return JSON: {"items":[{"kind":"acronym","trigger":"BRICS","expansion":"...","story":"..."}]}`;
	}
}
function extractJson(text) {
	const trimmed = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
	try {
		return JSON.parse(trimmed);
	} catch {
		const m = trimmed.match(/[\[{][\s\S]*[\]}]/);
		if (m) try {
			return JSON.parse(m[0]);
		} catch {}
		return null;
	}
}
var runRevisionAi_createServerFn_handler = createServerRpc({
	id: "398b5b9dc8312768021828d171a14a6443ccfb0a2d5ffa050954ebb35f383531",
	name: "runRevisionAi",
	filename: "src/lib/revision-hub.functions.ts"
}, (opts) => runRevisionAi.__executeServer(opts));
var runRevisionAi = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((raw) => Input.parse(raw)).handler(runRevisionAi_createServerFn_handler, async ({ data }) => {
	const { createGateway, getAiTaskProfile, UPSC_SYSTEM_PROMPT } = await import("./ai-gateway.server-BQYhT5NC.mjs").then((n) => n.n);
	const { generateText } = await import("../_libs/@ai-sdk/react+[...].mjs").then((n) => n.i);
	const profile = getAiTaskProfile();
	const gw = createGateway(void 0, profile.provider);
	const prompt = promptFor(data);
	const wantsJson = data.kind !== "notes";
	const { text } = await generateText({
		model: gw(profile.model),
		system: wantsJson ? `${UPSC_SYSTEM_PROMPT}\nReturn ONLY valid JSON. No markdown fences, no prose.` : UPSC_SYSTEM_PROMPT,
		prompt,
		temperature: .3
	});
	if (!wantsJson) return {
		kind: data.kind,
		markdown: text
	};
	const parsed = extractJson(text);
	if (!parsed) throw new Error("AI returned unparseable output. Please retry.");
	return {
		kind: data.kind,
		data: parsed
	};
});
//#endregion
export { runRevisionAi_createServerFn_handler };
