import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as createSsrRpc } from "./createSsrRpc-SzzIHo0A.mjs";
import { at as booleanType, ct as objectType, it as arrayType, lt as stringType, ot as enumType, rt as anyType, st as numberType } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-B6mQfmFS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/generations.functions-BY61jt9l.js
var OUTPUT_TYPES = [
	"handwritten_notes",
	"short_notes",
	"prelims_mcqs",
	"mains_questions",
	"infographics",
	"newspaper"
];
var OUTPUT_LABELS = {
	handwritten_notes: {
		label: "Handwritten Notes",
		description: "Beautiful A4-style notes with color headings, callouts, mnemonics, and UPSC value-adds."
	},
	short_notes: {
		label: "Short Notes",
		description: "1–2 page revision sheet: definition, key facts, PYQ relevance, keywords."
	},
	prelims_mcqs: {
		label: "Prelims MCQs",
		description: "Exam-style MCQs with explanations and difficulty levels."
	},
	mains_questions: {
		label: "Mains Questions",
		description: "GS-paper Mains questions with model answer outlines (intro/body/conclusion)."
	},
	infographics: {
		label: "Infographics",
		description: "Unlimited A4 infographic pages — one per detected topic, with flowcharts, timelines, mind maps, comparisons, and key takeaways."
	},
	newspaper: {
		label: "Newspaper Analysis",
		description: "Detect source, classify every article, map syllabus + PYQs, and produce premium UPSC briefing cards."
	}
};
var OPTIONS_SCHEMA = objectType({
	syllabusTagging: booleanType().optional(),
	pyqMapping: booleanType().optional(),
	mainsCategories: objectType({
		essay: booleanType().optional(),
		ethics: booleanType().optional(),
		interview: booleanType().optional()
	}).partial().optional()
}).optional();
var generateOutput = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
	documentId: stringType().uuid(),
	outputType: enumType(OUTPUT_TYPES),
	options: OPTIONS_SCHEMA
}).parse(d)).handler(createSsrRpc("2ec32bd10007f15df6f9b21cd151adb05830823bac6481adaa023c37ef7ab8de"));
var planGeneration = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
	documentId: stringType().uuid(),
	outputType: enumType(OUTPUT_TYPES)
}).parse(d)).handler(createSsrRpc("5533ba06151ef539b07a845184ae86ef34558a83d23e0c2291d7028cd6c3be2e"));
var processChunk = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
	documentId: stringType().uuid(),
	outputType: enumType(OUTPUT_TYPES),
	chunkIndex: numberType().int().min(0),
	chunkSize: numberType().int().min(2e3).max(1e5).optional(),
	options: OPTIONS_SCHEMA
}).parse(d)).handler(createSsrRpc("4b003a59377ab7643fce5aea686061afd2f276cc569f495ce5f8d61759b8f84b"));
var finalizeGeneration = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
	documentId: stringType().uuid(),
	outputType: enumType(OUTPUT_TYPES),
	parts: arrayType(anyType()).min(1)
}).parse(d)).handler(createSsrRpc("12821f884c4738f855a663c422a47de927b0b9bc0e7d3833a8d290701d522ceb"));
var deleteGeneration = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ id: stringType().uuid() }).parse(d)).handler(createSsrRpc("5b33004a178dfcad6dc5568e304646fb36039da11f5152da9916feed5192a4d1"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ q: stringType().min(1).max(200) }).parse(d)).handler(createSsrRpc("e7a4fe18f2908ada8496ce3472dbed5d4d9de66782376ba4050b2cab66e672ec"));
var listGenerations = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ documentId: stringType().uuid().optional() }).parse(d)).handler(createSsrRpc("7e505d595ae9897c935bb47bcbf7af63b52d44c570d4857423f3a0016ad5c866"));
//#endregion
export { generateOutput as a, processChunk as c, finalizeGeneration as i, OUTPUT_TYPES as n, listGenerations as o, deleteGeneration as r, planGeneration as s, OUTPUT_LABELS as t };
