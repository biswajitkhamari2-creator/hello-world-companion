import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { UPSC_SYLLABUS, SYLLABUS_PROMPT_DIGEST } from "./syllabus";
import { OUTPUT_TYPES, OUTPUT_LABELS, type OutputType } from "./generations.functions";

export type CoverageStatus = "covered" | "partial" | "missing";

export const DOCUMENT_TYPES = [
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
  "Other",
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

const FULL_SYLLABUS_TYPES: ReadonlySet<string> = new Set([
  "Complete UPSC Notes",
  "Complete Subject Notes",
  "Complete GS Notes",
  "Full UPSC Course",
  "Complete Optional Subject",
]);

export type ChapterCoverage = {
  chapter: string;
  coverage_pct: number;
  status: CoverageStatus;
  subtopics: Array<{ topic: string; status: CoverageStatus; note?: string }>;
  missing_items: Array<{
    kind: "paragraph" | "heading" | "table" | "diagram" | "image_caption" | "box" | "example" | "fact" | "committee" | "report" | "article" | "definition" | "map" | "case_study" | "keyword" | "other";
    text: string;
  }>;
  preserved_assets: { tables: boolean; diagrams: boolean; maps: boolean; case_studies: boolean; examples: boolean; keywords: boolean };
};

export type FinalCheckerReport = {
  document_id: string;
  document_title: string;
  generated_at: string;
  mode: "source_coverage" | "syllabus";
  document_type: DocumentType;
  document_type_reason: string;
  overall_score: number;
  scores: {
    content_coverage: number;
    structural_fidelity: number; // headings/sequence preserved
    visual_assets: number; // tables/diagrams/maps
    keyword_retention: number;
    examples_and_cases: number;
    consistency: number;
  };
  chapters: ChapterCoverage[];
  integrity: {
    pages_skipped: string[];
    sequence_preserved: boolean;
    notes: string;
  };
  // Only populated when mode === "syllabus"
  syllabus?: Array<{
    key: string;
    label: string;
    coverage_pct: number;
    micro_topics: Array<{ topic: string; status: CoverageStatus; note?: string }>;
  }>;
  // Only populated for syllabus mode — kept optional for other docs.
  pyq?: { covered_themes: string[]; frequently_tested: string[]; gaps: string[]; note: string };
  question_types: Array<{ type: string; present: boolean; note?: string }>;
  revision_assets: Array<{ asset: string; present: boolean; note?: string }>;
  weak_areas: string[];
  recommendations: string[];
  missing_output_types: OutputType[];
};

const reportSchema = z.object({
  document_type: z.string(),
  document_type_reason: z.string().default(""),
  overall_score: z.number().min(0).max(100),
  scores: z.object({
    content_coverage: z.number(),
    structural_fidelity: z.number(),
    visual_assets: z.number(),
    keyword_retention: z.number(),
    examples_and_cases: z.number(),
    consistency: z.number(),
  }),
  chapters: z.array(z.object({
    chapter: z.string(),
    coverage_pct: z.number(),
    status: z.enum(["covered", "partial", "missing"]),
    subtopics: z.array(z.object({
      topic: z.string(),
      status: z.enum(["covered", "partial", "missing"]),
      note: z.string().optional(),
    })).default([]),
    missing_items: z.array(z.object({
      kind: z.enum(["paragraph", "heading", "table", "diagram", "image_caption", "box", "example", "fact", "committee", "report", "article", "definition", "map", "case_study", "keyword", "other"]),
      text: z.string(),
    })).default([]),
    preserved_assets: z.object({
      tables: z.boolean(), diagrams: z.boolean(), maps: z.boolean(),
      case_studies: z.boolean(), examples: z.boolean(), keywords: z.boolean(),
    }).default({ tables: false, diagrams: false, maps: false, case_studies: false, examples: false, keywords: false }),
  })).default([]),
  integrity: z.object({
    pages_skipped: z.array(z.string()).default([]),
    sequence_preserved: z.boolean().default(true),
    notes: z.string().default(""),
  }).default({ pages_skipped: [], sequence_preserved: true, notes: "" }),
  weak_areas: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
});

// Syllabus-mode schema (only used when full-syllabus document type)
const syllabusReportSchema = z.object({
  document_type: z.string(),
  document_type_reason: z.string().default(""),
  overall_score: z.number().min(0).max(100),
  scores: z.object({
    syllabus_coverage: z.number(),
    pyq_alignment: z.number(),
    question_bank: z.number(),
    revision_material: z.number(),
    current_affairs: z.number(),
    answer_writing: z.number(),
    visual_learning: z.number(),
    consistency: z.number(),
  }),
  syllabus: z.array(z.object({
    key: z.string(),
    label: z.string(),
    coverage_pct: z.number(),
    micro_topics: z.array(z.object({
      topic: z.string(),
      status: z.enum(["covered", "partial", "missing"]),
      note: z.string().optional(),
    })),
  })),
  pyq: z.object({
    covered_themes: z.array(z.string()).default([]),
    frequently_tested: z.array(z.string()).default([]),
    gaps: z.array(z.string()).default([]),
    note: z.string().default(""),
  }),
  question_types: z.array(z.object({ type: z.string(), present: z.boolean(), note: z.string().optional() })),
  revision_assets: z.array(z.object({ asset: z.string(), present: z.boolean(), note: z.string().optional() })),
  weak_areas: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
});

function extractJson(text: string): unknown {
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  try { return JSON.parse(cleaned); } catch {}
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start >= 0 && end > start) {
    const slice = cleaned.slice(start, end + 1);
    try { return JSON.parse(slice); }
    catch { return JSON.parse(slice.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]").replace(/[\x00-\x1F\x7F]/g, "")); }
  }
  throw new Error("No JSON in audit response");
}

function summarizeGeneration(outputType: OutputType, content: any): string {
  if (!content) return "";
  if (outputType === "handwritten_notes") {
    const sections = (content.sections || []).map((s: any) =>
      `### ${s.heading}\n${(s.body || "").slice(0, 1200)}\nCallouts: ${(s.callouts || []).map((c: any) => c.text).join(" | ")}\nValue-add: ${(s.value_add || []).join(" | ")}`
    ).join("\n\n");
    return `HANDWRITTEN NOTES — ${content.title || ""}\nIntro: ${content.intro || ""}\n${sections}`;
  }
  if (outputType === "short_notes") {
    return `SHORT NOTES — ${content.title || ""}\nDefinition: ${content.definition || ""}\nKey facts: ${(content.key_facts || []).join(" | ")}\nKeywords: ${(content.keywords || []).join(", ")}\nExamples: ${(content.examples || []).join(" | ")}`;
  }
  if (outputType === "prelims_mcqs") {
    const qs = (content.questions || []).map((q: any) => q.stem).slice(0, 12).join(" | ");
    return `PRELIMS MCQs (${(content.questions || []).length}): ${qs}`;
  }
  if (outputType === "mains_questions") {
    const qs = (content.questions || []).map((q: any) => `${q.gs_paper}: ${q.question}`).slice(0, 10).join(" | ");
    return `MAINS (${(content.questions || []).length}): ${qs}`;
  }
  return "";
}

async function detectDocumentType(source: string, title: string, autoSubject?: string): Promise<{ type: DocumentType; reason: string }> {
  const { createGateway, DEFAULT_MODEL, UPSC_SYSTEM_PROMPT } = await import("./ai-gateway.server");
  const { generateText } = await import("ai");
  const gw = createGateway();
  const snippet = source.slice(0, 12_000);
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
      temperature: 0,
    });
    const parsed = extractJson(text) as { type?: string; reason?: string };
    const t = (DOCUMENT_TYPES as readonly string[]).includes(parsed.type || "") ? (parsed.type as DocumentType) : "Other";
    return { type: t, reason: parsed.reason || "" };
  } catch {
    return { type: "Other", reason: "Auto-detection failed; defaulted to Other." };
  }
}

export const runFinalCheck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ documentId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }): Promise<FinalCheckerReport> => {
    const { supabase, userId } = context;

    const { data: doc, error: docErr } = await supabase
      .from("documents").select("*").eq("id", data.documentId).eq("user_id", userId).single();
    if (docErr || !doc) throw new Error("Document not found");

    const { data: gens } = await supabase
      .from("generations").select("output_type,content")
      .eq("document_id", doc.id).eq("user_id", userId);

    const presentTypes = new Set<OutputType>((gens || []).map((g: any) => g.output_type));
    const missingTypes = OUTPUT_TYPES.filter((t) => !presentTypes.has(t));

    const summaries = (gens || []).map((g: any) => summarizeGeneration(g.output_type as OutputType, g.content)).join("\n\n");
    const sourceFull = doc.extracted_text || "";
    const sourceSnippet = sourceFull.slice(0, 90_000);

    // 1) Detect document type FIRST.
    const detected = await detectDocumentType(sourceFull, doc.title, doc.subject ?? undefined);
    const isFullSyllabus = FULL_SYLLABUS_TYPES.has(detected.type);

    const { createGateway, DEFAULT_MODEL, UPSC_SYSTEM_PROMPT } = await import("./ai-gateway.server");
    const { generateText } = await import("ai");
    const gw = createGateway();

    if (isFullSyllabus) {
      // ---- SYLLABUS MODE (legacy behaviour for full-syllabus uploads) ----
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

      let parsed: z.infer<typeof syllabusReportSchema>;
      try {
        const { text } = await generateText({
          model: gw(DEFAULT_MODEL),
          system: `${UPSC_SYSTEM_PROMPT}\nReturn only valid JSON. No markdown.`,
          prompt,
          temperature: 0.1,
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
        const micros = s.micro_topics.map((topic) => microMap.get(topic) || { topic, status: "missing" as const });
        const score = Math.round(
          (micros.reduce((acc, m) => acc + (m.status === "covered" ? 1 : m.status === "partial" ? 0.5 : 0), 0) /
            Math.max(1, micros.length)) * 100,
        );
        return { key: s.key, label: s.label, coverage_pct: found?.coverage_pct ?? score, micro_topics: micros };
      });

      const qtMap = new Map(parsed.question_types.map((q) => [q.type, q]));
      if (qtMap.has("Prelims MCQs")) qtMap.get("Prelims MCQs")!.present = presentTypes.has("prelims_mcqs");
      if (qtMap.has("Mains Questions")) qtMap.get("Mains Questions")!.present = presentTypes.has("mains_questions");
      const raMap = new Map(parsed.revision_assets.map((r) => [r.asset, r]));
      if (raMap.has("Handwritten Notes")) raMap.get("Handwritten Notes")!.present = presentTypes.has("handwritten_notes");
      if (raMap.has("Short Notes")) raMap.get("Short Notes")!.present = presentTypes.has("short_notes");

      return {
        document_id: doc.id,
        document_title: doc.title,
        generated_at: new Date().toISOString(),
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
          consistency: parsed.scores.consistency,
        },
        chapters: [],
        integrity: { pages_skipped: [], sequence_preserved: true, notes: "" },
        syllabus: syllabusComplete,
        pyq: parsed.pyq,
        question_types: Array.from(qtMap.values()),
        revision_assets: Array.from(raMap.values()),
        weak_areas: parsed.weak_areas,
        recommendations: parsed.recommendations,
        missing_output_types: missingTypes,
      };
    }

    // ---- SOURCE-COVERAGE MODE (default for magazines, reports, chapters, etc.) ----
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

    let parsed: z.infer<typeof reportSchema>;
    try {
      const { text } = await generateText({
        model: gw(DEFAULT_MODEL),
        system: `${UPSC_SYSTEM_PROMPT}\nReturn only valid JSON. No markdown.`,
        prompt,
        temperature: 0.1,
      });
      const raw = extractJson(text);
      const r = reportSchema.safeParse(raw);
      if (!r.success) {
        console.warn("FinalChecker source-mode parse warning", r.error.flatten());
        parsed = reportSchema.parse(sourceFallback(detected));
      } else {
        parsed = r.data;
      }
    } catch (e: any) {
      console.error("FinalChecker source-mode AI failed", e);
      parsed = reportSchema.parse(sourceFallback(detected));
    }

    // Question types & revision assets: reflect what was actually generated.
    const question_types = [
      { type: "Prelims MCQs", present: presentTypes.has("prelims_mcqs") },
      { type: "Mains Questions", present: presentTypes.has("mains_questions") },
    ];
    const revision_assets = [
      { asset: "Handwritten Notes", present: presentTypes.has("handwritten_notes") },
      { asset: "Short Notes", present: presentTypes.has("short_notes") },
    ];

    return {
      document_id: doc.id,
      document_title: doc.title,
      generated_at: new Date().toISOString(),
      mode: "source_coverage",
      document_type: detected.type,
      document_type_reason: detected.reason,
      overall_score: parsed.overall_score,
      scores: parsed.scores,
      chapters: parsed.chapters.map((c) => ({
        ...c,
        subtopics: c.subtopics,
        missing_items: c.missing_items,
        preserved_assets: c.preserved_assets,
      })),
      integrity: parsed.integrity,
      question_types,
      revision_assets,
      weak_areas: parsed.weak_areas,
      recommendations: parsed.recommendations,
      missing_output_types: missingTypes,
    };
  });

function sourceFallback(detected: { type: DocumentType; reason: string }) {
  return {
    document_type: detected.type,
    document_type_reason: detected.reason,
    overall_score: 0,
    scores: { content_coverage: 0, structural_fidelity: 0, visual_assets: 0, keyword_retention: 0, examples_and_cases: 0, consistency: 0 },
    chapters: [],
    integrity: { pages_skipped: [], sequence_preserved: true, notes: "Audit could not run — please retry." },
    weak_areas: ["Audit could not run — retry once the AI gateway responds."],
    recommendations: ["Re-run the Final Checker after generating notes for this document."],
  };
}

function syllabusFallback(detected: { type: DocumentType; reason: string }) {
  return {
    document_type: detected.type,
    document_type_reason: detected.reason,
    overall_score: 0,
    scores: {
      syllabus_coverage: 0, pyq_alignment: 0, question_bank: 0, revision_material: 0,
      current_affairs: 0, answer_writing: 0, visual_learning: 0, consistency: 0,
    },
    syllabus: UPSC_SYLLABUS.map((s) => ({
      key: s.key, label: s.label, coverage_pct: 0,
      micro_topics: s.micro_topics.map((t) => ({ topic: t, status: "missing" as const })),
    })),
    pyq: { covered_themes: [], frequently_tested: [], gaps: [], note: "AI audit unavailable — please retry." },
    question_types: [
      "Prelims MCQs", "Mains Questions", "Essay Topics",
    ].map((t) => ({ type: t, present: false })),
    revision_assets: [
      "Handwritten Notes", "Short Notes", "Mind Maps", "Flashcards",
    ].map((a) => ({ asset: a, present: false })),
    weak_areas: ["Audit could not run — retry once the AI gateway responds."],
    recommendations: ["Re-run the Final Checker after generating notes/MCQs/mains."],
  };
}

export const QUESTION_TYPE_LABEL_TO_OUTPUT: Record<string, OutputType> = {
  "Prelims MCQs": "prelims_mcqs",
  "Mains Questions": "mains_questions",
};

export const ASSET_LABEL_TO_OUTPUT: Record<string, OutputType> = {
  "Handwritten Notes": "handwritten_notes",
  "Short Notes": "short_notes",
};

export { OUTPUT_LABELS };
