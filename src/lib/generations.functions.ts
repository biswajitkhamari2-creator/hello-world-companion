import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const OUTPUT_TYPES = [
  "handwritten_notes",
  "short_notes",
  "prelims_mcqs",
  "mains_questions",
  "infographics",
  "newspaper",
] as const;
export type OutputType = (typeof OUTPUT_TYPES)[number];

export const OUTPUT_LABELS: Record<OutputType, { label: string; description: string }> = {
  handwritten_notes: { label: "Handwritten Notes", description: "Beautiful A4-style notes with color headings, callouts, mnemonics, and UPSC value-adds." },
  short_notes: { label: "Short Notes", description: "1–2 page revision sheet: definition, key facts, PYQ relevance, keywords." },
  prelims_mcqs: { label: "Prelims MCQs", description: "Exam-style MCQs with explanations and difficulty levels." },
  mains_questions: { label: "Mains Questions", description: "GS-paper Mains questions with model answer outlines (intro/body/conclusion)." },
  infographics: { label: "Infographics", description: "Unlimited A4 infographic pages — one per detected topic, with flowcharts, timelines, mind maps, comparisons, and key takeaways." },
  newspaper: { label: "Newspaper Analysis", description: "Detect source, classify every article, map syllabus + PYQs, and produce premium UPSC briefing cards." },
};

const handwrittenSchema = z.object({
  title: z.string(),
  intro: z.string(),
  sections: z.array(z.object({
    heading: z.string(),
    color: z.enum(["indigo", "gold", "rose", "emerald", "amber"]).default("indigo"),
    body: z.string(),
    callouts: z.array(z.object({ kind: z.enum(["key", "fact", "example", "judgement", "scheme"]), text: z.string() })).default([]),
    mnemonics: z.array(z.string()).default([]),
    value_add: z.array(z.string()).default([]),
  })).min(1),
  conclusion: z.string().optional(),
});

const shortNotesSchema = z.object({
  title: z.string(),
  definition: z.string(),
  key_facts: z.array(z.string()).min(1),
  pyq_relevance: z.string(),
  upsc_relevance: z.string(),
  keywords: z.array(z.string()),
  examples: z.array(z.string()).default([]),
  revision_tips: z.array(z.string()).default([]),
});

const prelimsSchema = z.object({
  title: z.string(),
  questions: z.array(z.object({
    stem: z.string(),
    options: z.array(z.string()).length(4),
    answer_index: z.number().int().min(0).max(3),
    difficulty: z.enum(["easy", "medium", "hard"]),
    type: z.enum(["direct", "statement", "assertion_reason", "match", "chronology"]),
    explanation: z.string(),
    pyq_link: z.string().optional(),
  })).min(1),
});

const mainsSchema = z.object({
  title: z.string(),
  questions: z.array(z.object({
    gs_paper: z.enum(["GS1", "GS2", "GS3", "GS4", "Essay"]),
    marks: z.number().int(),
    word_limit: z.number().int(),
    question: z.string(),
    intro_points: z.array(z.string()),
    body_points: z.array(z.string()),
    conclusion_points: z.array(z.string()),
    keywords: z.array(z.string()),
    value_add: z.array(z.string()).default([]),
  })).min(1),
});

const INFOGRAPHIC_LAYOUTS = ["flowchart", "timeline", "mindmap", "comparison", "cycle", "hierarchy", "process", "tree", "summary", "table"] as const;
const INFOGRAPHIC_COLORS = ["indigo", "gold", "rose", "emerald", "amber", "teal", "violet"] as const;

const infographicsSchema = z.object({
  title: z.string(),
  pages: z.array(z.object({
    topic: z.string(),
    part: z.number().int().min(1).default(1),
    total_parts: z.number().int().min(1).default(1),
    layout: z.enum(INFOGRAPHIC_LAYOUTS).default("summary"),
    color: z.enum(INFOGRAPHIC_COLORS).default("indigo"),
    subtitle: z.string().optional(),
    sections: z.array(z.object({
      heading: z.string(),
      points: z.array(z.string()).default([]),
    })).default([]),
    key_facts: z.array(z.string()).default([]),
    mnemonic: z.string().optional(),
    pyq_link: z.string().optional(),
    current_affairs: z.string().optional(),
    takeaway: z.string().optional(),
  })).min(1),
});

const newspaperArticleSchema = z.object({
  title: z.string(),
  source_page: z.string().optional(),
  gs_papers: z.array(z.enum(["GS1", "GS2", "GS3", "GS4", "Essay"])).default([]),
  subject: z.string().default(""),
  syllabus_path: z.array(z.string()).default([]),
  prelims_priority: z.enum(["high", "medium", "low"]).default("medium"),
  mains_priority: z.enum(["high", "medium", "low"]).default("medium"),
  importance: z.number().int().min(1).max(5).default(3),
  tags: z.array(z.string()).default([]),
  summary_30s: z.string().default(""),
  summary_2min: z.string().default(""),
  keywords: z.array(z.string()).default([]),
  facts: z.array(z.string()).default([]),
  stats: z.array(z.string()).default([]),
  quotes: z.array(z.string()).default([]),
  constitutional_articles: z.array(z.string()).default([]),
  pyqs: z.array(z.object({
    year: z.string().default(""),
    paper: z.string().default(""),
    question: z.string().default(""),
    repeat_count: z.number().int().min(1).default(1),
    state_pcs: z.string().optional(),
  })).default([]),
  short_notes: z.array(z.string()).default([]),
  one_pager: z.string().default(""),
  handwritten_outline: z.array(z.object({ heading: z.string(), body: z.string() })).default([]),
  mind_map: z.array(z.object({ branch: z.string(), leaves: z.array(z.string()).default([]) })).default([]),
  flashcards: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  prelims_mcqs: z.array(z.object({
    stem: z.string(),
    options: z.array(z.string()).length(4),
    answer_index: z.number().int().min(0).max(3),
    explanation: z.string().default(""),
  })).default([]),
  mains_questions: z.array(z.object({
    gs_paper: z.enum(["GS1", "GS2", "GS3", "GS4", "Essay"]).default("GS2"),
    marks: z.number().int().default(10),
    question: z.string(),
    outline: z.array(z.string()).default([]),
  })).default([]),
  interview_questions: z.array(z.string()).default([]),
  related: z.object({
    articles: z.array(z.string()).default([]),
    current_affairs: z.array(z.string()).default([]),
    constitution: z.array(z.string()).default([]),
    sc_cases: z.array(z.string()).default([]),
    committees: z.array(z.string()).default([]),
    reports: z.array(z.string()).default([]),
    schemes: z.array(z.string()).default([]),
    intl_orgs: z.array(z.string()).default([]),
    static_topic: z.array(z.string()).default([]),
    ncert: z.array(z.string()).default([]),
    laxmikanth: z.array(z.string()).default([]),
    spectrum: z.array(z.string()).default([]),
  }).default({} as any),
});

const newspaperSchema = z.object({
  title: z.string().default("Newspaper Analysis"),
  source: z.string().default("Other"),
  date: z.string().default(""),
  edition: z.string().default(""),
  articles: z.array(newspaperArticleSchema).default([]),
});

const SCHEMAS = {
  handwritten_notes: handwrittenSchema,
  short_notes: shortNotesSchema,
  prelims_mcqs: prelimsSchema,
  mains_questions: mainsSchema,
  infographics: infographicsSchema,
  newspaper: newspaperSchema,
} as const;

type GeneratedRecord = Record<string, any>;

const HANDWRITTEN_COLORS = ["indigo", "gold", "rose", "emerald", "amber"] as const;
const CALLOUT_KINDS = ["key", "fact", "example", "judgement", "scheme"] as const;
const MCQ_DIFFICULTIES = ["easy", "medium", "hard"] as const;
const MCQ_TYPES = ["direct", "statement", "assertion_reason", "match", "chronology"] as const;
const GS_PAPERS = ["GS1", "GS2", "GS3", "GS4", "Essay"] as const;

function asRecord(value: unknown): GeneratedRecord {
  if (Array.isArray(value)) return asRecord(value[0]);
  if (value && typeof value === "object") return value as GeneratedRecord;
  return {};
}

function unwrapGenerated(value: unknown): GeneratedRecord {
  const base = asRecord(value);
  const content = asRecord(base.content);
  if (Object.keys(content).length === 0) return base;
  return { ...content, title: base.title ?? content.title };
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value && typeof value === "object") {
    const record = value as GeneratedRecord;
    return asString(record.text ?? record.phrase ?? record.point ?? record.title, fallback);
  }
  return fallback;
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => asString(item)).filter(Boolean);
  }
  if (value && typeof value === "object") {
    return Object.entries(value as GeneratedRecord).flatMap(([label, items]) => {
      const values = asStringArray(items);
      return values.length ? values.map((item) => `${label}: ${item}`) : [];
    });
  }
  const text = asString(value);
  return text ? [text] : [];
}

function asEnum<T extends readonly string[]>(value: unknown, allowed: T, fallback: T[number]): T[number] {
  const raw = asString(value).toLowerCase().replace(/[\s-]+/g, "_");
  const match = allowed.find((item) => item.toLowerCase() === raw);
  return (match ?? fallback) as T[number];
}

function parseInteger(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  const match = asString(value).match(/\d+/);
  return match ? Number(match[0]) : fallback;
}

function normalizeCallouts(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        const record = asRecord(item);
        const text = asString(record.text ?? record.value ?? item);
        if (!text) return null;
        return { kind: asEnum(record.kind ?? record.type, CALLOUT_KINDS, "key"), text };
      })
      .filter((callout): callout is { kind: (typeof CALLOUT_KINDS)[number]; text: string } => Boolean(callout));
  }
  if (value && typeof value === "object") {
    return Object.entries(value as GeneratedRecord).flatMap(([kind, items]) =>
      asStringArray(items).map((text) => ({ kind: asEnum(kind, CALLOUT_KINDS, "key"), text })),
    );
  }
  const text = asString(value);
  return text ? [{ kind: "key" as const, text }] : [];
}

function normalizeOptions(value: unknown): string[] {
  const options = Array.isArray(value)
    ? value.map((item) => asString(item)).filter(Boolean)
    : Object.values(asRecord(value)).map((item) => asString(item)).filter(Boolean);
  return [...options, "All of the above", "None of the above", "Only the given statement is correct", "Cannot be determined"].slice(0, 4);
}

function normalizeAnswerIndex(value: unknown): number {
  if (typeof value === "number") return Math.min(3, Math.max(0, value > 3 ? value - 1 : value));
  const text = asString(value).trim().toUpperCase();
  const letterIndex = ["A", "B", "C", "D"].indexOf(text[0]);
  if (letterIndex >= 0) return letterIndex;
  return Math.min(3, Math.max(0, parseInteger(value, 1) - 1));
}

function questionArray(source: GeneratedRecord): unknown[] {
  const direct = source.questions ?? source.mcqs ?? source.items ?? source.content;
  return Array.isArray(direct) ? direct : [];
}

function normalizeOutput(outputType: OutputType, value: unknown) {
  const source = unwrapGenerated(value);

  if (outputType === "handwritten_notes") {
    const sectionsSource = Array.isArray(source.sections) ? source.sections : [];
    const sections = sectionsSource.map((section, index) => {
      const record = asRecord(section);
      return {
        heading: asString(record.heading ?? record.title, `Section ${index + 1}`),
        color: asEnum(record.color, HANDWRITTEN_COLORS, "indigo"),
        body: asString(record.body ?? record.content ?? record.summary, "Review the uploaded source for this topic."),
        callouts: normalizeCallouts(record.callouts),
        mnemonics: asStringArray(record.mnemonics),
        value_add: asStringArray(record.value_add ?? record.valueAdd ?? record.value_additions),
      };
    });

    if (sections.length === 0) {
      sections.push({
        heading: "Core Notes",
        color: "indigo" as const,
        body: asString(source.body ?? source.summary ?? source.definition, "Review the uploaded source for this topic."),
        callouts: normalizeCallouts(source.callouts),
        mnemonics: asStringArray(source.mnemonics),
        value_add: asStringArray(source.value_add ?? source.valueAdd ?? source.value_additions),
      });
    } else if (source.callouts) {
      sections[0].callouts = [...sections[0].callouts, ...normalizeCallouts(source.callouts)];
    }

    if (source.mnemonics) sections[0].mnemonics = [...sections[0].mnemonics, ...asStringArray(source.mnemonics)];
    if (source.value_add ?? source.valueAdd ?? source.value_additions) {
      sections[0].value_add = [
        ...sections[0].value_add,
        ...asStringArray(source.value_add ?? source.valueAdd ?? source.value_additions),
      ];
    }

    return {
      title: asString(source.title, OUTPUT_LABELS[outputType].label),
      intro: asString(source.intro ?? source.introduction ?? source.summary, "UPSC-oriented notes generated from the uploaded source."),
      sections,
      conclusion: asString(source.conclusion, "Revise this topic with PYQ themes, keywords, and current-affairs linkages."),
    };
  }

  if (outputType === "short_notes") {
    const keyFacts = asStringArray(source.key_facts ?? source.keyFacts ?? source.facts ?? source.points);
    return {
      title: asString(source.title, OUTPUT_LABELS[outputType].label),
      definition: asString(source.definition ?? source.intro ?? source.summary, "Concise UPSC revision note based on the uploaded source."),
      key_facts: keyFacts.length ? keyFacts : ["Review the source material and revise the core concepts."],
      pyq_relevance: asString(source.pyq_relevance ?? source.pyqRelevance, "Relevant to recurring UPSC themes and previous-year question patterns."),
      upsc_relevance: asString(source.upsc_relevance ?? source.upscRelevance, "Useful for connecting static concepts with current affairs and answer-writing."),
      keywords: asStringArray(source.keywords),
      examples: asStringArray(source.examples),
      revision_tips: asStringArray(source.revision_tips ?? source.revisionTips),
    };
  }

  if (outputType === "prelims_mcqs") {
    const questions = questionArray(source).map((question, index) => {
      const record = asRecord(question);
      return {
        stem: asString(record.stem ?? record.question, `Question ${index + 1}`),
        options: normalizeOptions(record.options ?? record.choices),
        answer_index: normalizeAnswerIndex(record.answer_index ?? record.answerIndex ?? record.correct_answer ?? record.correctAnswer ?? record.answer),
        difficulty: asEnum(record.difficulty, MCQ_DIFFICULTIES, "medium"),
        type: asEnum(record.type ?? record.question_type ?? record.questionType, MCQ_TYPES, "direct"),
        explanation: asString(record.explanation ?? record.rationale, "Explanation based on the uploaded source."),
        pyq_link: asString(record.pyq_link ?? record.pyqLink) || undefined,
      };
    });

    return {
      title: asString(source.title, OUTPUT_LABELS[outputType].label),
      questions: questions.length ? questions : [{
        stem: "Which of the following statements best reflects the central theme of the uploaded material?",
        options: ["Only statement 1 is correct", "Only statement 2 is correct", "Both statements are correct", "Neither statement is correct"],
        answer_index: 0,
        difficulty: "medium" as const,
        type: "direct" as const,
        explanation: asString(source.summary ?? source.body ?? source.definition, "The answer should be revised directly from the uploaded source material."),
      }],
    };
  }

  if (outputType === "infographics") {
    const pagesSrc = Array.isArray(source.pages) ? source.pages : Array.isArray(source.infographics) ? source.infographics : [];
    const pages = pagesSrc.map((p: any, idx: number) => {
      const r = asRecord(p);
      const sections = (Array.isArray(r.sections) ? r.sections : []).map((s: any) => {
        const sr = asRecord(s);
        return {
          heading: asString(sr.heading ?? sr.title, "Key Points"),
          points: asStringArray(sr.points ?? sr.items ?? sr.bullets),
        };
      });
      return {
        topic: asString(r.topic ?? r.title ?? r.heading, `Topic ${idx + 1}`),
        part: parseInteger(r.part, 1),
        total_parts: parseInteger(r.total_parts ?? r.totalParts, 1),
        layout: asEnum(r.layout ?? r.type, INFOGRAPHIC_LAYOUTS, "summary"),
        color: asEnum(r.color ?? r.theme, INFOGRAPHIC_COLORS, "indigo"),
        subtitle: asString(r.subtitle ?? r.context) || undefined,
        sections: sections.length ? sections : [{ heading: "Overview", points: asStringArray(r.points ?? r.body ?? r.summary) }],
        key_facts: asStringArray(r.key_facts ?? r.keyFacts ?? r.facts),
        mnemonic: asString(r.mnemonic) || undefined,
        pyq_link: asString(r.pyq_link ?? r.pyqLink) || undefined,
        current_affairs: asString(r.current_affairs ?? r.currentAffairs) || undefined,
        takeaway: asString(r.takeaway ?? r.summary ?? r.conclusion) || undefined,
      };
    });
    return {
      title: asString(source.title, OUTPUT_LABELS[outputType].label),
      pages: pages.length ? pages : [{
        topic: asString(source.title, "Overview"),
        part: 1, total_parts: 1, layout: "summary" as const, color: "indigo" as const,
        sections: [{ heading: "Key Points", points: asStringArray(source.summary ?? source.body) || ["Review the uploaded source for this topic."] }],
        key_facts: [], takeaway: "Revise this topic from the source material.",
      }],
    };
  }

  if (outputType === "newspaper") {
    const articlesSrc = Array.isArray(source.articles) ? source.articles : [];
    const articles = articlesSrc.map((a: any, idx: number) => {
      const r = asRecord(a);
      const related = asRecord(r.related);
      const pyqsSrc = Array.isArray(r.pyqs) ? r.pyqs : [];
      const importanceRaw = parseInteger(r.importance ?? r.importance_meter, 3);
      const importance = Math.min(5, Math.max(1, importanceRaw));
      const gsRaw = r.gs_papers ?? r.gsPapers ?? r.gs_paper ?? r.paper;
      const gsList = (Array.isArray(gsRaw) ? gsRaw : [gsRaw])
        .map((g: any) => asEnum(g, GS_PAPERS, "GS2"))
        .filter((g: string, i: number, arr: string[]) => g && arr.indexOf(g) === i);
      return {
        title: asString(r.title ?? r.headline, `Article ${idx + 1}`),
        source_page: asString(r.source_page ?? r.page ?? r.sourcePage) || undefined,
        gs_papers: gsList.length ? gsList : ["GS2"],
        subject: asString(r.subject ?? r.theme),
        syllabus_path: asStringArray(r.syllabus_path ?? r.syllabusPath ?? r.syllabus),
        prelims_priority: asEnum(r.prelims_priority ?? r.prelimsPriority, ["high", "medium", "low"] as const, "medium"),
        mains_priority: asEnum(r.mains_priority ?? r.mainsPriority, ["high", "medium", "low"] as const, "medium"),
        importance,
        tags: asStringArray(r.tags ?? r.current_affairs_tags),
        summary_30s: asString(r.summary_30s ?? r.summary30s ?? r.thirty_second_summary),
        summary_2min: asString(r.summary_2min ?? r.summary2min ?? r.two_minute_summary),
        keywords: asStringArray(r.keywords),
        facts: asStringArray(r.facts ?? r.important_facts),
        stats: asStringArray(r.stats ?? r.statistics ?? r.data),
        quotes: asStringArray(r.quotes),
        constitutional_articles: asStringArray(r.constitutional_articles ?? r.constitutionalArticles ?? r.articles_cited),
        pyqs: pyqsSrc.map((p: any) => {
          const pr = asRecord(p);
          return {
            year: asString(pr.year),
            paper: asString(pr.paper),
            question: asString(pr.question ?? pr.q),
            repeat_count: Math.max(1, parseInteger(pr.repeat_count ?? pr.repeatCount ?? pr.times, 1)),
            state_pcs: asString(pr.state_pcs ?? pr.statePcs) || undefined,
          };
        }),
        short_notes: asStringArray(r.short_notes ?? r.shortNotes),
        one_pager: asString(r.one_pager ?? r.onePager ?? r.one_page_revision),
        handwritten_outline: (Array.isArray(r.handwritten_outline) ? r.handwritten_outline : []).map((h: any) => {
          const hr = asRecord(h);
          return { heading: asString(hr.heading ?? hr.title, "Section"), body: asString(hr.body ?? hr.text) };
        }),
        mind_map: (Array.isArray(r.mind_map) ? r.mind_map : []).map((m: any) => {
          const mr = asRecord(m);
          return { branch: asString(mr.branch ?? mr.title, "Branch"), leaves: asStringArray(mr.leaves ?? mr.points) };
        }),
        flashcards: (Array.isArray(r.flashcards) ? r.flashcards : []).map((f: any) => {
          const fr = asRecord(f);
          return { q: asString(fr.q ?? fr.question), a: asString(fr.a ?? fr.answer) };
        }).filter((f: any) => f.q && f.a),
        prelims_mcqs: (Array.isArray(r.prelims_mcqs) ? r.prelims_mcqs : []).map((q: any) => {
          const qr = asRecord(q);
          return {
            stem: asString(qr.stem ?? qr.question, "Question"),
            options: normalizeOptions(qr.options ?? qr.choices),
            answer_index: normalizeAnswerIndex(qr.answer_index ?? qr.correct_answer ?? qr.answer),
            explanation: asString(qr.explanation),
          };
        }),
        mains_questions: (Array.isArray(r.mains_questions) ? r.mains_questions : []).map((q: any) => {
          const qr = asRecord(q);
          return {
            gs_paper: asEnum(qr.gs_paper ?? qr.paper, GS_PAPERS, "GS2"),
            marks: parseInteger(qr.marks, 10),
            question: asString(qr.question ?? qr.stem, "Discuss the UPSC relevance of this issue."),
            outline: asStringArray(qr.outline ?? qr.body_points ?? qr.points),
          };
        }),
        interview_questions: asStringArray(r.interview_questions ?? r.interviewQuestions),
        related: {
          articles: asStringArray(related.articles),
          current_affairs: asStringArray(related.current_affairs ?? related.currentAffairs),
          constitution: asStringArray(related.constitution),
          sc_cases: asStringArray(related.sc_cases ?? related.scCases ?? related.supreme_court),
          committees: asStringArray(related.committees),
          reports: asStringArray(related.reports),
          schemes: asStringArray(related.schemes ?? related.government_schemes),
          intl_orgs: asStringArray(related.intl_orgs ?? related.international_organizations ?? related.intlOrgs),
          static_topic: asStringArray(related.static_topic ?? related.staticTopic ?? related.static),
          ncert: asStringArray(related.ncert ?? related.ncert_chapter),
          laxmikanth: asStringArray(related.laxmikanth ?? related.laxmikanth_chapter),
          spectrum: asStringArray(related.spectrum ?? related.spectrum_chapter),
        },
      };
    });
    return {
      title: asString(source.title, "Newspaper Analysis"),
      source: asString(source.source ?? source.publication, "Other"),
      date: asString(source.date ?? source.publication_date ?? source.published_on),
      edition: asString(source.edition),
      articles,
    };
  }





  const mainsQuestions = questionArray(source).map((question, index) => {
    const record = asRecord(question);
    return {
      gs_paper: asEnum(record.gs_paper ?? record.gsPaper ?? record.paper, GS_PAPERS, "GS2"),
      marks: parseInteger(record.marks, index % 2 === 0 ? 10 : 15),
      word_limit: parseInteger(record.word_limit ?? record.wordLimit, parseInteger(record.marks, 10) >= 15 ? 250 : 150),
      question: asString(record.question ?? record.stem, `Discuss the UPSC relevance of this topic.`),
      intro_points: asStringArray(record.intro_points ?? record.introPoints ?? record.introduction),
      body_points: asStringArray(record.body_points ?? record.bodyPoints ?? record.body),
      conclusion_points: asStringArray(record.conclusion_points ?? record.conclusionPoints ?? record.conclusion),
      keywords: asStringArray(record.keywords),
      value_add: asStringArray(record.value_add ?? record.valueAdd ?? record.value_additions),
    };
  });

  return {
    title: asString(source.title, OUTPUT_LABELS[outputType].label),
    questions: mainsQuestions.length ? mainsQuestions : [{
      gs_paper: "GS2" as const,
      marks: 10,
      word_limit: 150,
      question: "Discuss the UPSC relevance of the uploaded material.",
      intro_points: ["Introduce the core issue from the source material."],
      body_points: asStringArray(source.summary ?? source.body ?? source.definition).length
        ? asStringArray(source.summary ?? source.body ?? source.definition)
        : ["Use the uploaded source to identify key dimensions, examples, and implications."],
      conclusion_points: ["Conclude with a balanced, exam-oriented way forward."],
      keywords: asStringArray(source.keywords),
      value_add: asStringArray(source.value_add ?? source.valueAdd ?? source.value_additions),
    }],
  };
}

function extractJsonCandidate(text: string): unknown {
  let stripped = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
  try {
    return JSON.parse(stripped);
  } catch {
    const start = Math.min(...[stripped.indexOf("{"), stripped.indexOf("[")].filter((i) => i >= 0));
    const end = Math.max(stripped.lastIndexOf("}"), stripped.lastIndexOf("]"));
    if (Number.isFinite(start) && end > start) {
      stripped = stripped.slice(start, end + 1);
      try {
        return JSON.parse(stripped);
      } catch {
        return JSON.parse(stripped.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]").replace(/[\x00-\x1F\x7F]/g, ""));
      }
    }
    throw new Error("No JSON object found in AI response");
  }
}

function jsonShapeFor(outputType: OutputType): string {
  switch (outputType) {
    case "handwritten_notes":
      return `{"title":"string","intro":"string","sections":[{"heading":"string","color":"indigo|gold|rose|emerald|amber","body":"string","callouts":[{"kind":"key|fact|example|judgement|scheme","text":"string"}],"mnemonics":["string"],"value_add":["string"]}],"conclusion":"string"}`;
    case "short_notes":
      return `{"title":"string","definition":"string","key_facts":["string"],"pyq_relevance":"string","upsc_relevance":"string","keywords":["string"],"examples":["string"],"revision_tips":["string"]}`;
    case "prelims_mcqs":
      return `{"title":"string","questions":[{"stem":"string","options":["A","B","C","D"],"answer_index":0,"difficulty":"easy|medium|hard","type":"direct|statement|assertion_reason|match|chronology","explanation":"string","pyq_link":"string"}]}`;
    case "mains_questions":
      return `{"title":"string","questions":[{"gs_paper":"GS1|GS2|GS3|GS4|Essay","marks":10,"word_limit":150,"question":"string","intro_points":["string"],"body_points":["string"],"conclusion_points":["string"],"keywords":["string"],"value_add":["string"]}]}`;
    case "infographics":
      return `{"title":"string","pages":[{"topic":"string","part":1,"total_parts":1,"layout":"flowchart|timeline|mindmap|comparison|cycle|hierarchy|process|tree|summary|table","color":"indigo|gold|rose|emerald|amber|teal|violet","subtitle":"string","sections":[{"heading":"string","points":["string"]}],"key_facts":["string"],"mnemonic":"string","pyq_link":"string","current_affairs":"string","takeaway":"string"}]}`;
    case "newspaper":
      return `{"title":"string","source":"The Hindu|The Indian Express|PIB|PRS|Yojana|Kurukshetra|Other","date":"DD-MM-YYYY","edition":"string","articles":[{"title":"string","source_page":"string","gs_papers":["GS1|GS2|GS3|GS4|Essay"],"subject":"Polity|Economy|Environment|IR|Governance|History|Geography|S&T|Security|Ethics|Society|Disaster|Agriculture|Culture","syllabus_path":["GS-II","Polity & Governance","Parliament","Parliamentary Committees"],"prelims_priority":"high|medium|low","mains_priority":"high|medium|low","importance":3,"tags":["National","International","Economy","Environment","S&T","Government Scheme","Supreme Court","Parliament","Reports & Indices","International Organization"],"summary_30s":"string","summary_2min":"string","keywords":["string"],"facts":["string"],"stats":["string"],"quotes":["string"],"constitutional_articles":["Article 14","Article 21"],"pyqs":[{"year":"2019","paper":"GS-2","question":"string","repeat_count":2,"state_pcs":"string"}],"short_notes":["string"],"one_pager":"string","handwritten_outline":[{"heading":"string","body":"string"}],"mind_map":[{"branch":"string","leaves":["string"]}],"flashcards":[{"q":"string","a":"string"}],"prelims_mcqs":[{"stem":"string","options":["A","B","C","D"],"answer_index":0,"explanation":"string"}],"mains_questions":[{"gs_paper":"GS2","marks":10,"question":"string","outline":["string"]}],"interview_questions":["string"],"related":{"articles":["string"],"current_affairs":["string"],"constitution":["Article X"],"sc_cases":["Case Name"],"committees":["Committee"],"reports":["Report"],"schemes":["Scheme"],"intl_orgs":["UNDP"],"static_topic":["Topic"],"ncert":["Class XI Polity Ch.3"],"laxmikanth":["Ch.22 Parliament"],"spectrum":["Ch.5 Revolt of 1857"]}}]}`;
  }
}

export interface PromptOptions {
  syllabusTagging?: boolean;
  pyqMapping?: boolean;
  mainsCategories?: { essay?: boolean; ethics?: boolean; interview?: boolean };
}

function promptFor(outputType: OutputType, subject: string | null, sourceText: string, opts: PromptOptions = {}): string {
  const subj = subject ? `Subject: ${subject}. ` : "";

  const syllabusOn = opts.syllabusTagging === true;
  const pyqOn = opts.pyqMapping === true;

  const tagRule = syllabusOn
    ? `\n\nMANDATORY UPSC TAGGING RULE (apply to EVERY concept, section, question, page, callout, mnemonic, fact, infographic):\nBefore the actual content of each item, prepend an inline tag on its own line:\n[UPSC: <Stage> | <Paper> | <Subject> | <Main Topic> | <Sub-topic> | <Micro-topic>]\nwhere Stage = "Prelims" | "Mains" | "Prelims + Mains"; Paper = "GS Paper 1" | "GS Paper 2" | "GS Paper 3" | "GS Paper 4" | "Essay" | "CSAT" | "Optional"; Subject/Topic/Sub-topic/Micro-topic come from the official UPSC syllabus wording. If the item does not map to UPSC syllabus, write [UPSC: Not in syllabus — general awareness]. Never omit the tag. Never use a vague tag like "General Studies" alone.`
    : `\n\nDO NOT add any UPSC syllabus labels, GS Paper tags, or [UPSC: ...] prefixes. Do NOT classify topics by Prelims/Mains/GS-I..IV/Essay/CSAT. The user has disabled UPSC syllabus tagging. Preserve and faithfully transform the source content into the requested output; keep the original chapter/heading/topic structure of the source intact.`;

  const pyqRule = pyqOn
    ? `\n\nPYQ MAPPING: where a real UPSC Previous Year Question matches a concept, populate pyq_link / pyq_relevance with the exact year and paper. Clearly distinguish a real PYQ ("PYQ 2019, GS-2") from AI-generated practice questions.`
    : `\n\nPYQ MAPPING IS DISABLED: leave all pyq_link / pyq_relevance fields empty strings. Do not mention or fabricate Previous Year Questions.`;

  const head = `${subj}Use the following source material to produce the requested output. Treat it as the primary input. Return exactly one JSON object matching the requested schema. Do not return an array, markdown, or a wrapper such as { content: ... }.${tagRule}${pyqRule}\n\nSource:\n"""\n${sourceText}\n"""\n\n`;

  const tagInline = syllabusOn ? "MUST begin with the [UPSC: ...] tag on its own first line, then a newline, then" : "contains";

  switch (outputType) {
    case "handwritten_notes":
      return head + `Produce richly structured handwritten-style notes (will be rendered in A4 format). Include:
- 4–7 clearly titled sections with concise paragraphs. The "heading" field ${tagInline} the actual heading text.
- The "body" field ${tagInline} the paragraph text.
- Callouts for key terms, facts, examples, Supreme Court judgements, and government schemes where relevant.
- 1–3 mnemonics where they aid recall.
- "UPSC value-add" bullets for each section${syllabusOn ? " (constitutional articles, committees, reports, statistics, quotations)" : " (extra facts, definitions, statistics, examples relevant to the source)"}.
- A short conclusion linking the topic to current affairs if applicable.`;
    case "short_notes":
      return head + `Produce a tight one-page revision sheet. The "title" ${tagInline} the title text. Cover definition, key facts (5–10 bullets), why this matters, ${pyqOn ? "PYQ relevance" : "(leave pyq_relevance empty)"}, keywords, examples, and quick revision tips.`;
    case "prelims_mcqs":
      return head + `Generate 8 high-quality ${syllabusOn ? "UPSC Prelims-style" : "objective"} MCQs based on this material. Mix difficulty (easy/medium/hard) and types (direct, statement-based, assertion-reason, match-the-following, chronology). The "stem" ${tagInline} the actual question text. Each must include 4 plausible options, correct answer index, and a crisp explanation. ${pyqOn ? "Where a similar real PYQ exists, mention it in pyq_link." : "Leave pyq_link empty."}`;
    case "mains_questions": {
      const cats = opts.mainsCategories ?? {};
      const extra: string[] = [];
      if (cats.essay) extra.push("• Include at least 1 broad Essay-style prompt (1000–1200 words, philosophical or analytical) and set gs_paper to \"Essay\".");
      if (cats.ethics) extra.push("• Include at least 1 GS-4 style Ethics case study (situation + 2–3 ethical dilemmas + expected response).");
      if (cats.interview) extra.push("• Include at least 1 UPSC Personality Test (Interview) style opinion/probing question.");
      const extraBlock = extra.length ? `\n\nIn addition:\n${extra.join("\n")}` : "";
      return head + `Generate 4 ${syllabusOn ? "UPSC Mains" : "long-answer"} questions of varying marks (10/15) based on this material. The "question" field ${tagInline} the question text. For each, give an introduction outline, 4–6 body points, conclusion outline, important keywords, and value additions (data, reports, quotations${syllabusOn ? ", articles" : ""}).${extraBlock}`;
    }
    case "infographics":
      return head + `Detect EVERY distinct concept, chapter, heading, subheading, table, diagram, map, committee, ${syllabusOn ? "constitutional article, report, " : ""}case study, definition, important fact, and example present in the source. Produce ONE infographic page per detected topic — there is NO upper limit. If a topic is too dense for one page, split into "part" 1, 2, 3… preserving every important educational point (set total_parts accordingly).

For each page choose the BEST layout for the content (timeline, hierarchy, flowchart, comparison, table, cycle, tree, summary, mindmap, process).

Each page MUST include:
- topic (clear short title) — ${tagInline} the topic title.
- subtitle (one-line context).
- 3–6 sections, each with a short heading and 2–6 punchy points.
- 2–6 key_facts (numbers, dates${syllabusOn ? ", articles" : ""}).
- a short mnemonic if useful.
- ${pyqOn ? "pyq_link (year + paper) if a similar PYQ exists, else omit" : "leave pyq_link empty"}.
- current_affairs link if relevant.
- a 1–2 sentence takeaway for quick revision.

Use the color field to colour-code by theme (indigo/gold/emerald/teal/rose/amber/violet). Order pages in the same logical sequence as the source.`;
    case "newspaper":
      return head + `You are analysing a NEWSPAPER / CURRENT-AFFAIRS source for UPSC and OPSC aspirants. Treat the source as one issue (or part of one issue) of a newspaper or magazine.

STEP 1 — Detect the publication from headers/footers/masthead/filename hints in the source text. Set "source" to one of: "The Hindu", "The Indian Express", "PIB", "PRS", "Yojana", "Kurukshetra", or "Other". Set "date" in DD-MM-YYYY if visible (else ""). Set "edition" if visible.

STEP 2 — Split the source into INDIVIDUAL ARTICLES. Treat each headline + body block as one article. Skip ads, weather boxes, sports scores, classifieds, and stock tickers.

STEP 3 — For EACH article, produce the full briefing object exactly as in the schema. Be UPSC-rigorous:
- gs_papers: 1–3 of GS1/GS2/GS3/GS4/Essay (most-relevant first).
- subject: one of Polity, Economy, Environment, International Relations, Governance, History, Geography, Science & Technology, Security, Ethics, Society, Disaster Management, Agriculture, Culture.
- syllabus_path: full breadcrumb of the official UPSC syllabus, 3–5 elements deep (e.g. ["GS-II","Polity & Governance","Parliament","Parliamentary Committees"]). NEVER just ["GS-II"].
- prelims_priority + mains_priority: high / medium / low based on UPSC-trend relevance.
- importance: integer 1–5 where 5 = must-read for UPSC, 1 = skip.
- tags: pick from National, International, Economy, Environment, Science & Tech, Government Scheme, Supreme Court, Parliament, Reports & Indices, International Organization.
- summary_30s: ≤ 60 words snapshot. summary_2min: 150–220 words.
- keywords: 5–10 UPSC keywords. facts: 4–8 crisp bullets. stats: numbers/percentages/years. quotes: only if the article quotes a person/court/report. constitutional_articles: cite Article/Section numbers if applicable.
- pyqs: 1–5 REAL UPSC PYQs that link to this article — give year, paper (GS-2/Prelims etc.), the question text, repeat_count (1+ if asked multiple times), and state_pcs if a similar state-PCS question exists. If you are not sure a PYQ exists, omit it rather than fabricate one.
- short_notes: 5–8 bullet revision points. one_pager: 120–180 word condensed revision paragraph.
- handwritten_outline: 3–5 {heading, body} sections suitable for handwritten-style notes.
- mind_map: 3–5 branches, each with 2–5 leaves.
- flashcards: 4–8 Q/A pairs for spaced revision.
- prelims_mcqs: 2–4 exam-style MCQs (4 options, answer_index, explanation).
- mains_questions: 2 Mains questions with a 4–6 point outline each.
- interview_questions: 2–3 probing UPSC personality-test style questions.
- related: cross-links to other articles, current affairs, constitutional articles, Supreme Court cases, committees, reports, schemes, international organizations, the closest static UPSC topic, and the matching NCERT / Laxmikanth / Spectrum chapter where applicable. Keep each list short (2–6 items) and concrete.

Be exhaustive on classification + summary; you do NOT need to repeat the full article text. Return strictly the JSON object — no markdown.

HARD RULES (never violate):
- If this chunk does NOT contain readable newspaper article text, return {"articles": []}. Never invent placeholder articles, never write "Source unreadable", "Cannot identify articles", "Placeholder", "N/A", "content-dependent", or similar status text inside any field.
- Never describe extraction problems, OCR limits, JSON schema, or your own reasoning anywhere in the output. Every string the user sees must be real UPSC content drawn from the source.
- Skip rather than fabricate: if you are unsure about a PYQ, omit it; if a section has no content, leave that array empty.`;
  }
}




function chunkText(text: string, chunkSize: number): string[] {
  if (text.length <= chunkSize) return [text];
  const chunks: string[] = [];
  // Split on paragraph boundaries when possible.
  const paragraphs = text.split(/\n\s*\n/);
  let current = "";
  for (const p of paragraphs) {
    if ((current + "\n\n" + p).length > chunkSize && current) {
      chunks.push(current);
      current = p;
    } else {
      current = current ? current + "\n\n" + p : p;
    }
    // Hard split if a single paragraph is huge.
    while (current.length > chunkSize) {
      chunks.push(current.slice(0, chunkSize));
      current = current.slice(chunkSize);
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

function mergeOutputs(outputType: OutputType, parts: any[]): any {
  const first = parts[0] ?? {};
  if (outputType === "handwritten_notes") {
    return {
      title: first.title,
      intro: first.intro,
      sections: parts.flatMap((p, i) =>
        (p.sections ?? []).map((s: any) => ({ ...s, heading: parts.length > 1 ? `Part ${i + 1} · ${s.heading}` : s.heading })),
      ),
      conclusion: parts[parts.length - 1]?.conclusion ?? first.conclusion,
    };
  }
  if (outputType === "short_notes") {
    return {
      title: first.title,
      definition: first.definition,
      key_facts: parts.flatMap((p) => p.key_facts ?? []),
      pyq_relevance: parts.map((p) => p.pyq_relevance).filter(Boolean).join(" "),
      upsc_relevance: parts.map((p) => p.upsc_relevance).filter(Boolean).join(" "),
      keywords: Array.from(new Set(parts.flatMap((p) => p.keywords ?? []))),
      examples: parts.flatMap((p) => p.examples ?? []),
      revision_tips: parts.flatMap((p) => p.revision_tips ?? []),
    };
  }
  if (outputType === "newspaper") {
    const allArticles = parts.flatMap((p) => Array.isArray(p?.articles) ? p.articles : []);
    // Filter out AI placeholder/error articles — never surface raw model error text.
    const PLACEHOLDER_RE = /(unreadable|cannot\s+identify|placeholder|content[- ]dependent|left\s+empty|no\s+article|not\s+identifiable|insufficient\s+(text|content)|ocr\s+(failed|error)|json|schema|validation|n\/?a)/i;
    const isPlaceholder = (a: any) => {
      const title = String(a?.title || "").trim();
      if (!title || title.length < 4) return true;
      if (PLACEHOLDER_RE.test(title)) return true;
      const blob = `${a?.summary_30s || ""} ${a?.summary_2min || ""} ${a?.one_pager || ""}`.trim();
      if (!blob && !(a?.facts?.length) && !(a?.short_notes?.length)) return true;
      if (blob && PLACEHOLDER_RE.test(blob) && blob.length < 240) return true;
      return false;
    };
    const seen = new Map<string, any>();
    for (const a of allArticles) {
      if (isPlaceholder(a)) continue;
      const key = String(a?.title || "").trim().toLowerCase().replace(/\s+/g, " ").slice(0, 120);
      if (!key) continue;
      if (!seen.has(key)) seen.set(key, a);
    }
    const sourceVal = parts.map((p) => p?.source).find((s) => s && s !== "Other") || first.source || "Other";
    const dateVal = parts.map((p) => p?.date).find(Boolean) || first.date || "";
    const editionVal = parts.map((p) => p?.edition).find(Boolean) || first.edition || "";
    return {
      title: first.title || "Newspaper Analysis",
      source: sourceVal,
      date: dateVal,
      edition: editionVal,
      articles: Array.from(seen.values()),
    };
  }
  if (outputType === "infographics") {
    // Concat pages across chunks; renumber parts within each topic so split pages stay coherent.
    const allPages = parts.flatMap((p) => Array.isArray(p?.pages) ? p.pages : []);
    const byTopic = new Map<string, any[]>();
    for (const pg of allPages) {
      const key = String(pg.topic || "Untitled").trim().toLowerCase();
      if (!byTopic.has(key)) byTopic.set(key, []);
      byTopic.get(key)!.push(pg);
    }
    const pages: any[] = [];
    for (const group of byTopic.values()) {
      const total = group.length;
      group.forEach((pg, i) => pages.push({ ...pg, part: i + 1, total_parts: total }));
    }
    return { title: first.title, pages };
  }
  // prelims_mcqs + mains_questions: merge question arrays
  return {
    title: first.title,
    questions: parts.flatMap((p) => p.questions ?? []),
  };
}

async function runOne(
  gw: any,
  model: string,
  system: string,
  outputType: OutputType,
  subject: string | null,
  chunk: string,
  generateText: any,
  options: PromptOptions = {},
  retryTuning: { maxAttempts?: number; initialRateDelayMs?: number } = {},
): Promise<any> {
  const prompt = `${promptFor(outputType, subject, chunk, options)}\n\nReturn JSON only in this exact shape (no markdown, no explanation):\n${jsonShapeFor(outputType)}`;
  // Retry on 429 / transient 5xx. Longer waits on rate limits since Gemini free tier is ~10 RPM.
  const MAX_ATTEMPTS = retryTuning.maxAttempts ?? 4;
  const RATE_DELAY_MS = retryTuning.initialRateDelayMs ?? 15000;
  let lastErr: any = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const { text } = await generateText({
        model: gw(model),
        system: `${system}\nReturn only valid JSON for the requested output. Do not wrap it in markdown, code fences, arrays, or a content object.`,
        prompt,
        temperature: 0.2,
        maxRetries: 0, // we own backoff — let outer layer handle 429s
      });
      return normalizeOutput(outputType, extractJsonCandidate(text));
    } catch (err: any) {
      lastErr = err;
      const msg = String(err?.message || err);
      const status = err?.statusCode ?? err?.status ?? (msg.match(/\b(4\d\d|5\d\d)\b/)?.[1] ? Number(msg.match(/\b(4\d\d|5\d\d)\b/)![1]) : 0);
      const retriable = status === 429 || (status >= 500 && status < 600);
      if (!retriable || attempt === MAX_ATTEMPTS - 1) throw err;
      const isRate = status === 429 || /rate.?limit|too many requests|quota/i.test(msg);
      const base = isRate ? RATE_DELAY_MS : 1500;
      const delay = Math.min(base * Math.pow(2, attempt), 60000) + Math.floor(Math.random() * 800);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

function retryableAiFailure(err: unknown): { retryable: boolean; retryAfterMs: number; reason: string } {
  const anyErr = err as { message?: string; status?: number; statusCode?: number; responseBody?: string };
  const message = String(anyErr?.message || err || "");
  const detail = `${message} ${anyErr?.responseBody || ""}`;
  const status = anyErr?.statusCode ?? anyErr?.status ?? (detail.match(/\b(4\d\d|5\d\d)\b/)?.[1] ? Number(detail.match(/\b(4\d\d|5\d\d)\b/)![1]) : 0);
  if (status === 402 || /payment required|credits|insufficient/i.test(detail)) {
    return { retryable: false, retryAfterMs: 0, reason: friendlyAiError(err) };
  }
  if (status === 429 || /rate.?limit|too many requests|quota/i.test(detail)) {
    return { retryable: true, retryAfterMs: 65_000 + Math.floor(Math.random() * 5_000), reason: friendlyAiError(err) };
  }
  if (status >= 500 && status < 600) {
    return { retryable: true, retryAfterMs: 8_000 + Math.floor(Math.random() * 2_000), reason: "AI service is temporarily busy. Retrying…" };
  }
  return { retryable: false, retryAfterMs: 0, reason: friendlyAiError(err) };
}

function friendlyAiError(err: unknown): string {
  const anyErr = err as { message?: string; status?: number; statusCode?: number; responseBody?: string };
  const message = String(anyErr?.message || err || "");
  const detail = `${message} ${anyErr?.responseBody || ""}`;
  const status = anyErr?.statusCode ?? anyErr?.status ?? (detail.match(/\b(4\d\d|5\d\d)\b/)?.[1] ? Number(detail.match(/\b(4\d\d|5\d\d)\b/)![1]) : 0);
  if (status === 402 || /payment required|credits|insufficient/i.test(detail)) {
    return "AI credits are exhausted for this workspace. Add credits or retry after credits are available.";
  }
  if (status === 429 || /rate.?limit|too many requests|quota/i.test(detail)) {
    return "AI is rate-limited. Please wait ~60s and retry, or try a smaller document.";
  }
  if (status === 401 || status === 403 || /unauthori[sz]ed|forbidden/i.test(detail)) {
    return "AI runtime authorization failed. Please retry after the server refreshes.";
  }
  return `Generation failed: ${message.slice(0, 240)}`;
}



const OPTIONS_SCHEMA = z.object({
  syllabusTagging: z.boolean().optional(),
  pyqMapping: z.boolean().optional(),
  mainsCategories: z.object({
    essay: z.boolean().optional(),
    ethics: z.boolean().optional(),
    interview: z.boolean().optional(),
  }).partial().optional(),
}).optional();

export const generateOutput = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    documentId: z.string().uuid(),
    outputType: z.enum(OUTPUT_TYPES),
    options: OPTIONS_SCHEMA,
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: doc, error: docErr } = await supabase
      .from("documents").select("*").eq("id", data.documentId).eq("user_id", userId).single();
    if (docErr || !doc) throw new Error("Document not found");
    if (!doc.extracted_text || doc.status !== "ready") throw new Error("Document is not ready yet");

    const { createGateway, DEFAULT_MODEL, UPSC_SYSTEM_PROMPT } = await import("./ai-gateway.server");
    const { generateText } = await import("ai");
    const gw = createGateway();

    const schema = SCHEMAS[data.outputType];
    const fullText: string = doc.extracted_text;
    const docSubject: string | null = doc.subject ?? null;
    const opts: PromptOptions = (data.options as PromptOptions) ?? {};


    // No artificial page limit — chunk through the entire document.
    // ~40k chars/chunk ≈ 10–12 pages of source. Hard cap is a safety ceiling only.
    const CHUNK_SIZE = 40_000;
    const MAX_CHUNKS = 500; // ~5,000+ source pages
    const rawChunks = chunkText(fullText, CHUNK_SIZE).slice(0, MAX_CHUNKS);
    const chunks = rawChunks.length ? rawChunks : [fullText.slice(0, CHUNK_SIZE)];

    try {
      const results: any[] = new Array(chunks.length);
      let rateLimitedCount = 0;
      let terminalError: string | null = null;
      for (let i = 0; i < chunks.length; i++) {
        try {
          results[i] = await runOne(gw, DEFAULT_MODEL, UPSC_SYSTEM_PROMPT, data.outputType, docSubject, chunks[i], generateText, opts);
        } catch (err: any) {
          const msg = String(err?.message || err);
          if (/429|rate.?limit/i.test(msg)) rateLimitedCount++;
          if (/402|Payment Required|credits|insufficient|401|403|unauthori[sz]ed|forbidden/i.test(`${msg} ${err?.responseBody || ""}`)) {
            terminalError = friendlyAiError(err);
          }
          console.warn(`chunk ${i} failed`, msg.slice(0, 200));
          results[i] = null;
          if (terminalError) break;
        }
      }

      const valid = results.filter(Boolean);
      if (valid.length === 0) {
        if (terminalError) throw new Error(terminalError);
        if (rateLimitedCount > 0) {
          throw new Error("AI is rate-limited right now. Please wait ~60 seconds and try again, or upload a smaller document.");
        }
        throw new Error("All chunks failed to generate");
      }

      const output: any = mergeOutputs(data.outputType, valid);
      // Re-run normalization on the merged shape to fill defaults.
      const finalOutput = normalizeOutput(data.outputType, output);
      const parsed = schema.safeParse(finalOutput);
      if (!parsed.success) {
        console.warn("AI output normalized with schema warnings", parsed.error.flatten());
      }
      const title = (finalOutput as any).title || OUTPUT_LABELS[data.outputType].label;
      const { data: row, error } = await supabase.from("generations").insert({
        document_id: doc.id,
        user_id: userId,
        output_type: data.outputType,
        title,
        content: finalOutput,
        model: DEFAULT_MODEL,
        status: "ready",
      }).select().single();
      if (error) throw error;
      return row;
    } catch (e: any) {
      console.error("generateOutput failed", e);
      throw new Error(friendlyAiError(e));
    }

  });


// ---------- Chunked generation with client-driven progress ----------

const CHUNK_SIZE = 40_000;
function maxChunksFor(_t: OutputType) { return 500; } // no artificial cap (~5,000+ source pages)

async function loadDocForUser(supabase: any, userId: string, documentId: string) {
  const { data: doc, error } = await supabase
    .from("documents").select("*").eq("id", documentId).eq("user_id", userId).single();
  if (error || !doc) throw new Error("Document not found");
  if (!doc.extracted_text || doc.status !== "ready") throw new Error("Document is not ready yet");
  return doc;
}

export const planGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    documentId: z.string().uuid(),
    outputType: z.enum(OUTPUT_TYPES),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const doc = await loadDocForUser(context.supabase, context.userId, data.documentId);
    const raw = chunkText(doc.extracted_text, CHUNK_SIZE).slice(0, maxChunksFor(data.outputType));
    const totalChunks = raw.length || 1;
    return { totalChunks, subject: doc.subject ?? null, title: doc.title ?? null };
  });

export const processChunk = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    documentId: z.string().uuid(),
    outputType: z.enum(OUTPUT_TYPES),
    chunkIndex: z.number().int().min(0),
    options: OPTIONS_SCHEMA,
  }).parse(d))
  .handler(async ({ data, context }) => {
    const doc = await loadDocForUser(context.supabase, context.userId, data.documentId);
    const raw = chunkText(doc.extracted_text, CHUNK_SIZE).slice(0, maxChunksFor(data.outputType));
    const chunks = raw.length ? raw : [doc.extracted_text.slice(0, CHUNK_SIZE)];
    if (data.chunkIndex >= chunks.length) throw new Error("Chunk index out of range");
    const { createGateway, DEFAULT_MODEL, UPSC_SYSTEM_PROMPT } = await import("./ai-gateway.server");
    const { generateText } = await import("ai");
    const gw = createGateway();
    const opts: PromptOptions = (data.options as PromptOptions) ?? {};
    try {
      const part = await runOne(gw, DEFAULT_MODEL, UPSC_SYSTEM_PROMPT, data.outputType, doc.subject ?? null, chunks[data.chunkIndex], generateText, opts, { maxAttempts: 1 });
      return { part, retryable: false, retryAfterMs: 0, reason: null };
    } catch (e) {
      console.error("processChunk failed", e);
      const retry = retryableAiFailure(e);
      if (retry.retryable) {
        return { part: null, ...retry };
      }
      throw new Error(retry.reason);
    }
  });

export const finalizeGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    documentId: z.string().uuid(),
    outputType: z.enum(OUTPUT_TYPES),
    parts: z.array(z.any()).min(1),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const doc = await loadDocForUser(context.supabase, context.userId, data.documentId);
    const { DEFAULT_MODEL } = await import("./ai-gateway.server");
    const merged = mergeOutputs(data.outputType, data.parts);
    const finalOutput = normalizeOutput(data.outputType, merged);
    const schema = SCHEMAS[data.outputType];
    const parsed = schema.safeParse(finalOutput);
    if (!parsed.success) console.warn("finalize: schema warnings", parsed.error.flatten());
    const title = (finalOutput as any).title || OUTPUT_LABELS[data.outputType].label;
    const { data: row, error } = await context.supabase.from("generations").insert({
      document_id: doc.id,
      user_id: context.userId,
      output_type: data.outputType,
      title,
      content: finalOutput,
      model: DEFAULT_MODEL,
      status: "ready",
    }).select().single();
    if (error) throw error;
    return row;
  });




export const deleteGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("generations").delete().eq("id", data.id).eq("user_id", userId);
    if (error) throw error;
    return { ok: true };
  });

export const searchLibrary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ q: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const q = `%${data.q}%`;
    const { data: docs } = await supabase
      .from("documents")
      .select("id,title,subject,priority,summary,created_at")
      .eq("user_id", userId)
      .or(`title.ilike.${q},summary.ilike.${q},subject.ilike.${q}`)
      .limit(20);
    const { data: gens } = await supabase
      .from("generations")
      .select("id,document_id,output_type,title,created_at")
      .eq("user_id", userId)
      .ilike("title", q)
      .limit(20);
    return { documents: docs ?? [], generations: gens ?? [] };
  });

export const listGenerations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ documentId: z.string().uuid().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    let q = supabase
      .from("generations")
      .select("id,document_id,output_type,title,status,created_at,content")
      .eq("user_id", userId)
      .eq("status", "ready")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data.documentId) q = q.eq("document_id", data.documentId);
    const { data: rows, error } = await q;
    if (error) throw error;
    return rows ?? [];
  });

