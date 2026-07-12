import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
import { at as booleanType, ct as objectType, it as arrayType, lt as stringType, ot as enumType, st as numberType } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-B6mQfmFS.mjs";
import { n as OUTPUT_TYPES } from "./generations.functions-BY61jt9l.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/final-checker.functions-BBXhSJfn.js
var UPSC_SYLLABUS = [
	{
		key: "prelims",
		label: "Prelims (GS + CSAT)",
		micro_topics: [
			"History of India & Indian National Movement",
			"Indian & World Geography",
			"Indian Polity & Governance",
			"Economic & Social Development",
			"Environment, Ecology, Biodiversity, Climate Change",
			"General Science",
			"Current Affairs (national & international)",
			"CSAT — Comprehension, Reasoning, Quantitative Aptitude"
		]
	},
	{
		key: "gs1",
		label: "GS Paper I",
		micro_topics: [
			"Indian Heritage & Culture",
			"Modern Indian History (1750–present)",
			"Post-independence Consolidation",
			"World History (Industrial Revolution, World Wars, Decolonisation)",
			"Indian Society & Diversity",
			"Role of Women, Population, Poverty, Urbanisation",
			"Physical Geography",
			"Resource Distribution & Industrial Location",
			"Geophysical Phenomena (earthquakes, cyclones)"
		]
	},
	{
		key: "gs2",
		label: "GS Paper II",
		micro_topics: [
			"Indian Constitution — features, amendments, basic structure",
			"Union & State Executive, Parliament, Judiciary",
			"Federalism & Centre–State Relations",
			"Constitutional & Statutory Bodies",
			"Governance, Transparency, RTI, e-Governance",
			"Welfare Schemes & Vulnerable Sections",
			"Health, Education, Human Resources",
			"International Relations — India & Neighbourhood, Bilateral, Global Groupings"
		]
	},
	{
		key: "gs3",
		label: "GS Paper III",
		micro_topics: [
			"Indian Economy — growth, development, employment",
			"Agriculture, Food Security, PDS",
			"Infrastructure — energy, transport, ports",
			"Science & Technology, IT, Space, Biotech",
			"Environment, Conservation, EIA",
			"Disaster Management",
			"Internal Security — extremism, cyber, borders",
			"Money laundering & Organised Crime"
		]
	},
	{
		key: "gs4",
		label: "GS Paper IV (Ethics)",
		micro_topics: [
			"Ethics & Human Interface",
			"Attitude, Aptitude, Emotional Intelligence",
			"Moral Thinkers — Indian & Western",
			"Public/Civil Service Values",
			"Probity in Governance",
			"Case Studies application"
		]
	},
	{
		key: "essay",
		label: "Essay",
		micro_topics: [
			"Philosophical themes",
			"Socio-economic themes",
			"Polity & governance themes",
			"Science, technology & society",
			"Environment & sustainability",
			"International affairs & India's role"
		]
	},
	{
		key: "current_affairs",
		label: "Current Affairs Integration",
		micro_topics: [
			"Government schemes & programmes",
			"Recent Supreme Court judgements",
			"Reports & indices (NITI Aayog, UN, World Bank)",
			"Bilateral & multilateral developments",
			"Economic survey & budget highlights",
			"Major committees & their recommendations"
		]
	}
];
var SYLLABUS_PROMPT_DIGEST = UPSC_SYLLABUS.map((s) => `${s.key} | ${s.label}: ${s.micro_topics.join("; ")}`).join("\n");
var DOCUMENT_TYPES = [
	"UPSC Magazine",
	"Current Affairs Magazine",
	"Newspaper",
	"NCERT",
	"Standard Reference Book",
	"Government Report",
	"Committee Report",
	"Economic Survey",
	"Budget",
	"Subject Notes",
	"Optional Subject Material",
	"Chapter",
	"Full Subject Book",
	"Handwritten Notes",
	"Complete UPSC Notes",
	"Complete Subject Notes",
	"Complete GS Notes",
	"Full UPSC Course",
	"Complete Optional Subject",
	"Other"
];
var FULL_SYLLABUS_TYPES = /* @__PURE__ */ new Set([
	"Complete UPSC Notes",
	"Complete Subject Notes",
	"Complete GS Notes",
	"Full UPSC Course",
	"Complete Optional Subject"
]);
var reportSchema = objectType({
	document_type: stringType(),
	document_type_reason: stringType().default(""),
	overall_score: numberType().min(0).max(100),
	scores: objectType({
		content_coverage: numberType(),
		structural_fidelity: numberType(),
		visual_assets: numberType(),
		keyword_retention: numberType(),
		examples_and_cases: numberType(),
		consistency: numberType()
	}),
	chapters: arrayType(objectType({
		chapter: stringType(),
		coverage_pct: numberType(),
		status: enumType([
			"covered",
			"partial",
			"missing"
		]),
		subtopics: arrayType(objectType({
			topic: stringType(),
			status: enumType([
				"covered",
				"partial",
				"missing"
			]),
			note: stringType().optional()
		})).default([]),
		missing_items: arrayType(objectType({
			kind: enumType([
				"paragraph",
				"heading",
				"table",
				"diagram",
				"image_caption",
				"box",
				"example",
				"fact",
				"committee",
				"report",
				"article",
				"definition",
				"map",
				"case_study",
				"keyword",
				"other"
			]),
			text: stringType()
		})).default([]),
		preserved_assets: objectType({
			tables: booleanType(),
			diagrams: booleanType(),
			maps: booleanType(),
			case_studies: booleanType(),
			examples: booleanType(),
			keywords: booleanType()
		}).default({
			tables: false,
			diagrams: false,
			maps: false,
			case_studies: false,
			examples: false,
			keywords: false
		})
	})).default([]),
	integrity: objectType({
		pages_skipped: arrayType(stringType()).default([]),
		sequence_preserved: booleanType().default(true),
		notes: stringType().default("")
	}).default({
		pages_skipped: [],
		sequence_preserved: true,
		notes: ""
	}),
	weak_areas: arrayType(stringType()).default([]),
	recommendations: arrayType(stringType()).default([])
});
var syllabusReportSchema = objectType({
	document_type: stringType(),
	document_type_reason: stringType().default(""),
	overall_score: numberType().min(0).max(100),
	scores: objectType({
		syllabus_coverage: numberType(),
		pyq_alignment: numberType(),
		question_bank: numberType(),
		revision_material: numberType(),
		current_affairs: numberType(),
		answer_writing: numberType(),
		visual_learning: numberType(),
		consistency: numberType()
	}),
	syllabus: arrayType(objectType({
		key: stringType(),
		label: stringType(),
		coverage_pct: numberType(),
		micro_topics: arrayType(objectType({
			topic: stringType(),
			status: enumType([
				"covered",
				"partial",
				"missing"
			]),
			note: stringType().optional()
		}))
	})),
	pyq: objectType({
		covered_themes: arrayType(stringType()).default([]),
		frequently_tested: arrayType(stringType()).default([]),
		gaps: arrayType(stringType()).default([]),
		note: stringType().default("")
	}),
	question_types: arrayType(objectType({
		type: stringType(),
		present: booleanType(),
		note: stringType().optional()
	})),
	revision_assets: arrayType(objectType({
		asset: stringType(),
		present: booleanType(),
		note: stringType().optional()
	})),
	weak_areas: arrayType(stringType()).default([]),
	recommendations: arrayType(stringType()).default([])
});
function extractJson(text) {
	const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
	try {
		return JSON.parse(cleaned);
	} catch {}
	const start = cleaned.indexOf("{");
	const end = cleaned.lastIndexOf("}");
	if (start >= 0 && end > start) {
		const slice = cleaned.slice(start, end + 1);
		try {
			return JSON.parse(slice);
		} catch {
			return JSON.parse(slice.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]").replace(/[\x00-\x1F\x7F]/g, ""));
		}
	}
	throw new Error("No JSON in audit response");
}
function summarizeGeneration(outputType, content) {
	if (!content) return "";
	if (outputType === "handwritten_notes") {
		const sections = (content.sections || []).map((s) => `### ${s.heading}\n${(s.body || "").slice(0, 1200)}\nCallouts: ${(s.callouts || []).map((c) => c.text).join(" | ")}\nValue-add: ${(s.value_add || []).join(" | ")}`).join("\n\n");
		return `HANDWRITTEN NOTES — ${content.title || ""}\nIntro: ${content.intro || ""}\n${sections}`;
	}
	if (outputType === "short_notes") return `SHORT NOTES — ${content.title || ""}\nDefinition: ${content.definition || ""}\nKey facts: ${(content.key_facts || []).join(" | ")}\nKeywords: ${(content.keywords || []).join(", ")}\nExamples: ${(content.examples || []).join(" | ")}`;
	if (outputType === "prelims_mcqs") {
		const qs = (content.questions || []).map((q) => q.stem).slice(0, 12).join(" | ");
		return `PRELIMS MCQs (${(content.questions || []).length}): ${qs}`;
	}
	if (outputType === "mains_questions") {
		const qs = (content.questions || []).map((q) => `${q.gs_paper}: ${q.question}`).slice(0, 10).join(" | ");
		return `MAINS (${(content.questions || []).length}): ${qs}`;
	}
	return "";
}
async function detectDocumentType(source, title, autoSubject) {
	const { createGateway, DEFAULT_MODEL, UPSC_SYSTEM_PROMPT } = await import("./ai-gateway.server-BQYhT5NC.mjs").then((n) => n.n);
	const { generateText } = await import("../_libs/@ai-sdk/react+[...].mjs").then((n) => n.i);
	const gw = createGateway();
	const snippet = source.slice(0, 12e3);
	const prompt = `Classify this uploaded study material into EXACTLY ONE of these types (return the exact label):
${DOCUMENT_TYPES.join(" | ")}

Rules:
- Use "Complete UPSC Notes" / "Complete Subject Notes" / "Complete GS Notes" / "Full UPSC Course" / "Complete Optional Subject" ONLY if the material is clearly an attempt to cover an entire subject or the full UPSC syllabus end-to-end.
- A monthly magazine, current-affairs compilation, newspaper, single report, NCERT chapter, single committee/budget/economic-survey doc, or a single chapter is NOT a "Complete" type.
- Choose "Other" only if nothing else fits.

Title: ${title}
Auto-detected subject: ${autoSubject || "unknown"}

Source excerpt:
"""
${snippet}
"""

Return ONLY a JSON object: {"type":"<one label>","reason":"<one short sentence>"}`;
	try {
		const { text } = await generateText({
			model: gw(DEFAULT_MODEL),
			system: `${UPSC_SYSTEM_PROMPT}\nReturn only valid JSON. No markdown.`,
			prompt,
			temperature: 0
		});
		const parsed = extractJson(text);
		return {
			type: DOCUMENT_TYPES.includes(parsed.type || "") ? parsed.type : "Other",
			reason: parsed.reason || ""
		};
	} catch {
		return {
			type: "Other",
			reason: "Auto-detection failed; defaulted to Other."
		};
	}
}
var runFinalCheck_createServerFn_handler = createServerRpc({
	id: "8e0ab9589ee0a7502584f7c321343cba5cb52c4bf63c618a95075f1c3cf838b3",
	name: "runFinalCheck",
	filename: "src/lib/final-checker.functions.ts"
}, (opts) => runFinalCheck.__executeServer(opts));
var runFinalCheck = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ documentId: stringType().uuid() }).parse(d)).handler(runFinalCheck_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: doc, error: docErr } = await supabase.from("documents").select("*").eq("id", data.documentId).eq("user_id", userId).single();
	if (docErr || !doc) throw new Error("Document not found");
	const { data: gens } = await supabase.from("generations").select("output_type,content").eq("document_id", doc.id).eq("user_id", userId);
	const presentTypes = new Set((gens || []).map((g) => g.output_type));
	const missingTypes = OUTPUT_TYPES.filter((t) => !presentTypes.has(t));
	const summaries = (gens || []).map((g) => summarizeGeneration(g.output_type, g.content)).join("\n\n");
	const sourceFull = doc.extracted_text || "";
	const sourceSnippet = sourceFull.slice(0, 9e4);
	const detected = await detectDocumentType(sourceFull, doc.title, doc.subject ?? void 0);
	const isFullSyllabus = FULL_SYLLABUS_TYPES.has(detected.type);
	const { createGateway, DEFAULT_MODEL, UPSC_SYSTEM_PROMPT } = await import("./ai-gateway.server-BQYhT5NC.mjs").then((n) => n.n);
	const { generateText } = await import("../_libs/@ai-sdk/react+[...].mjs").then((n) => n.i);
	const gw = createGateway();
	if (isFullSyllabus) {
		const prompt = `You are the UPSC Final Checker (Syllabus Mode). The uploaded material is "${detected.type}", so audit it against the official UPSC syllabus taxonomy.

UPSC Syllabus Taxonomy (use these exact keys/labels/micro_topics — do NOT add new ones):
${SYLLABUS_PROMPT_DIGEST}

Document title: ${doc.title}
Generated outputs present: ${[...presentTypes].join(", ") || "none"}
${summaries || "(no generations yet)"}

Source excerpt:
"""
${sourceSnippet}
"""

Return ONLY one JSON object:
{
  "document_type": "${detected.type}",
  "document_type_reason": "${detected.reason.replace(/"/g, "'")}",
  "overall_score": 0,
  "scores": {"syllabus_coverage":0,"pyq_alignment":0,"question_bank":0,"revision_material":0,"current_affairs":0,"answer_writing":0,"visual_learning":0,"consistency":0},
  "syllabus": [{"key":"prelims","label":"…","coverage_pct":0,"micro_topics":[{"topic":"…","status":"covered|partial|missing","note":"optional"}]}],
  "pyq": {"covered_themes":[],"frequently_tested":[],"gaps":[],"note":""},
  "question_types": [{"type":"Prelims MCQs","present":true},{"type":"Mains Questions","present":false},{"type":"Essay Topics","present":false}],
  "revision_assets": [{"asset":"Handwritten Notes","present":false},{"asset":"Short Notes","present":false},{"asset":"Flashcards","present":false},{"asset":"Mind Maps","present":false}],
  "weak_areas": [],
  "recommendations": []
}

Syllabus sections MUST include all of: ${UPSC_SYLLABUS.map((s) => s.key).join(", ")}. List every micro_topic from the taxonomy.`;
		let parsed;
		try {
			const { text } = await generateText({
				model: gw(DEFAULT_MODEL),
				system: `${UPSC_SYSTEM_PROMPT}\nReturn only valid JSON. No markdown.`,
				prompt,
				temperature: .1
			});
			const raw = extractJson(text);
			const r = syllabusReportSchema.safeParse(raw);
			parsed = r.success ? r.data : syllabusReportSchema.parse(syllabusFallback(detected));
		} catch {
			parsed = syllabusReportSchema.parse(syllabusFallback(detected));
		}
		const bySection = new Map(parsed.syllabus.map((s) => [s.key, s]));
		const syllabusComplete = UPSC_SYLLABUS.map((s) => {
			const found = bySection.get(s.key);
			const microMap = new Map((found?.micro_topics || []).map((m) => [m.topic, m]));
			const micros = s.micro_topics.map((topic) => microMap.get(topic) || {
				topic,
				status: "missing"
			});
			const score = Math.round(micros.reduce((acc, m) => acc + (m.status === "covered" ? 1 : m.status === "partial" ? .5 : 0), 0) / Math.max(1, micros.length) * 100);
			return {
				key: s.key,
				label: s.label,
				coverage_pct: found?.coverage_pct ?? score,
				micro_topics: micros
			};
		});
		const qtMap = new Map(parsed.question_types.map((q) => [q.type, q]));
		if (qtMap.has("Prelims MCQs")) qtMap.get("Prelims MCQs").present = presentTypes.has("prelims_mcqs");
		if (qtMap.has("Mains Questions")) qtMap.get("Mains Questions").present = presentTypes.has("mains_questions");
		const raMap = new Map(parsed.revision_assets.map((r) => [r.asset, r]));
		if (raMap.has("Handwritten Notes")) raMap.get("Handwritten Notes").present = presentTypes.has("handwritten_notes");
		if (raMap.has("Short Notes")) raMap.get("Short Notes").present = presentTypes.has("short_notes");
		return {
			document_id: doc.id,
			document_title: doc.title,
			generated_at: (/* @__PURE__ */ new Date()).toISOString(),
			mode: "syllabus",
			document_type: detected.type,
			document_type_reason: detected.reason,
			overall_score: parsed.overall_score,
			scores: {
				content_coverage: parsed.scores.syllabus_coverage,
				structural_fidelity: parsed.scores.consistency,
				visual_assets: parsed.scores.visual_learning,
				keyword_retention: parsed.scores.revision_material,
				examples_and_cases: parsed.scores.current_affairs,
				consistency: parsed.scores.consistency
			},
			chapters: [],
			integrity: {
				pages_skipped: [],
				sequence_preserved: true,
				notes: ""
			},
			syllabus: syllabusComplete,
			pyq: parsed.pyq,
			question_types: Array.from(qtMap.values()),
			revision_assets: Array.from(raMap.values()),
			weak_areas: parsed.weak_areas,
			recommendations: parsed.recommendations,
			missing_output_types: missingTypes
		};
	}
	const prompt = `You are the UPSC Final Checker (Source Coverage Mode). The uploaded material is "${detected.type}". DO NOT compare it against the full UPSC syllabus — only verify that every educational concept present in the SOURCE has been faithfully represented in the GENERATED notes.

Strict rules:
- NEVER flag CSAT, Ethics, GS-II/GS-III, History, Geography or any other syllabus area as "missing" unless the source itself contains it.
- Walk through the source chapter-by-chapter / section-by-section. Use the source's actual headings/chapter titles. If unstructured (newspaper/magazine), group by article or thematic section.
- For each chapter/section, list its key subtopics and mark each "covered" / "partial" / "missing" based on the generated notes.
- List every important item from the source that is missing in the generated notes: paragraphs, headings, tables, diagrams, image captions, boxes, examples, facts, committees, reports, articles, definitions, maps, case studies, keywords.
- Verify integrity: no page skipped, original sequence preserved, tables/diagrams/maps accurately reconstructed, keywords retained.
- Score 0–100 honestly. overall_score = how completely the source has been converted into the generated study material.

Document title: ${doc.title}
Detected type: ${detected.type} (${detected.reason})

Generated outputs present (${[...presentTypes].join(", ") || "none"}):
${summaries || "(no generations yet — score the source as 0% covered and list everything as missing)"}

Source material (truncated):
"""
${sourceSnippet}
"""

Return ONLY one JSON object in this exact shape:
{
  "document_type": "${detected.type}",
  "document_type_reason": "${detected.reason.replace(/"/g, "'")}",
  "overall_score": 0,
  "scores": {"content_coverage":0,"structural_fidelity":0,"visual_assets":0,"keyword_retention":0,"examples_and_cases":0,"consistency":0},
  "chapters": [
    {
      "chapter": "Chapter / section title from source",
      "coverage_pct": 0,
      "status": "covered|partial|missing",
      "subtopics": [{"topic":"…","status":"covered|partial|missing","note":"what's missing if any"}],
      "missing_items": [{"kind":"table|diagram|paragraph|example|fact|committee|report|article|definition|map|case_study|keyword|image_caption|box|heading|other","text":"short description of the missing item from the source"}],
      "preserved_assets": {"tables":true,"diagrams":true,"maps":true,"case_studies":true,"examples":true,"keywords":true}
    }
  ],
  "integrity": {"pages_skipped":[],"sequence_preserved":true,"notes":""},
  "weak_areas": ["concrete things missing or weakly covered"],
  "recommendations": ["regenerate Handwritten Notes for Chapter X to capture the missing table on Y", "…"]
}`;
	let parsed;
	try {
		const { text } = await generateText({
			model: gw(DEFAULT_MODEL),
			system: `${UPSC_SYSTEM_PROMPT}\nReturn only valid JSON. No markdown.`,
			prompt,
			temperature: .1
		});
		const raw = extractJson(text);
		const r = reportSchema.safeParse(raw);
		if (!r.success) {
			console.warn("FinalChecker source-mode parse warning", r.error.flatten());
			parsed = reportSchema.parse(sourceFallback(detected));
		} else parsed = r.data;
	} catch (e) {
		console.error("FinalChecker source-mode AI failed", e);
		parsed = reportSchema.parse(sourceFallback(detected));
	}
	const question_types = [{
		type: "Prelims MCQs",
		present: presentTypes.has("prelims_mcqs")
	}, {
		type: "Mains Questions",
		present: presentTypes.has("mains_questions")
	}];
	const revision_assets = [{
		asset: "Handwritten Notes",
		present: presentTypes.has("handwritten_notes")
	}, {
		asset: "Short Notes",
		present: presentTypes.has("short_notes")
	}];
	return {
		document_id: doc.id,
		document_title: doc.title,
		generated_at: (/* @__PURE__ */ new Date()).toISOString(),
		mode: "source_coverage",
		document_type: detected.type,
		document_type_reason: detected.reason,
		overall_score: parsed.overall_score,
		scores: parsed.scores,
		chapters: parsed.chapters.map((c) => ({
			...c,
			subtopics: c.subtopics,
			missing_items: c.missing_items,
			preserved_assets: c.preserved_assets
		})),
		integrity: parsed.integrity,
		question_types,
		revision_assets,
		weak_areas: parsed.weak_areas,
		recommendations: parsed.recommendations,
		missing_output_types: missingTypes
	};
});
function sourceFallback(detected) {
	return {
		document_type: detected.type,
		document_type_reason: detected.reason,
		overall_score: 0,
		scores: {
			content_coverage: 0,
			structural_fidelity: 0,
			visual_assets: 0,
			keyword_retention: 0,
			examples_and_cases: 0,
			consistency: 0
		},
		chapters: [],
		integrity: {
			pages_skipped: [],
			sequence_preserved: true,
			notes: "Audit could not run — please retry."
		},
		weak_areas: ["Audit could not run — retry once the AI gateway responds."],
		recommendations: ["Re-run the Final Checker after generating notes for this document."]
	};
}
function syllabusFallback(detected) {
	return {
		document_type: detected.type,
		document_type_reason: detected.reason,
		overall_score: 0,
		scores: {
			syllabus_coverage: 0,
			pyq_alignment: 0,
			question_bank: 0,
			revision_material: 0,
			current_affairs: 0,
			answer_writing: 0,
			visual_learning: 0,
			consistency: 0
		},
		syllabus: UPSC_SYLLABUS.map((s) => ({
			key: s.key,
			label: s.label,
			coverage_pct: 0,
			micro_topics: s.micro_topics.map((t) => ({
				topic: t,
				status: "missing"
			}))
		})),
		pyq: {
			covered_themes: [],
			frequently_tested: [],
			gaps: [],
			note: "AI audit unavailable — please retry."
		},
		question_types: [
			"Prelims MCQs",
			"Mains Questions",
			"Essay Topics"
		].map((t) => ({
			type: t,
			present: false
		})),
		revision_assets: [
			"Handwritten Notes",
			"Short Notes",
			"Mind Maps",
			"Flashcards"
		].map((a) => ({
			asset: a,
			present: false
		})),
		weak_areas: ["Audit could not run — retry once the AI gateway responds."],
		recommendations: ["Re-run the Final Checker after generating notes/MCQs/mains."]
	};
}
//#endregion
export { runFinalCheck_createServerFn_handler };
