import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Bookmark,
  Brain,
  ChevronDown,
  ChevronUp,
  FileText,
  Flame,
  Gavel,
  Hash,
  Landmark,
  Link as LinkIcon,
  Newspaper,
  Quote,
  Sparkles,
  Star,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type PYQ = { year: string; paper: string; question: string; repeat_count: number; state_pcs?: string };
type Related = Partial<Record<
  | "articles"
  | "current_affairs"
  | "constitution"
  | "sc_cases"
  | "committees"
  | "reports"
  | "schemes"
  | "intl_orgs"
  | "static_topic"
  | "ncert"
  | "laxmikanth"
  | "spectrum",
  string[]
>>;
type Article = {
  title: string;
  source_page?: string;
  gs_papers: string[];
  subject: string;
  syllabus_path: string[];
  prelims_priority: "high" | "medium" | "low";
  mains_priority: "high" | "medium" | "low";
  importance: number;
  tags: string[];
  summary_30s: string;
  summary_2min: string;
  keywords: string[];
  facts: string[];
  stats: string[];
  quotes: string[];
  constitutional_articles: string[];
  pyqs: PYQ[];
  short_notes: string[];
  one_pager: string;
  handwritten_outline: { heading: string; body: string }[];
  mind_map: { branch: string; leaves: string[] }[];
  flashcards: { q: string; a: string }[];
  prelims_mcqs: { stem: string; options: string[]; answer_index: number; explanation: string }[];
  mains_questions: { gs_paper: string; marks: number; question: string; outline: string[] }[];
  interview_questions: string[];
  related: Related;
};
type Issue = { title?: string; source: string; date: string; edition?: string; articles: Article[] };

const SOURCE_STYLE: Record<string, string> = {
  "The Hindu": "bg-rose-100 text-rose-900 border-rose-300",
  "The Indian Express": "bg-amber-100 text-amber-900 border-amber-300",
  PIB: "bg-indigo-100 text-indigo-900 border-indigo-300",
  PRS: "bg-emerald-100 text-emerald-900 border-emerald-300",
  Yojana: "bg-violet-100 text-violet-900 border-violet-300",
  Kurukshetra: "bg-teal-100 text-teal-900 border-teal-300",
  Other: "bg-slate-100 text-slate-900 border-slate-300",
};

const GS_STYLE: Record<string, string> = {
  GS1: "bg-amber-50 text-amber-900 border-amber-300",
  GS2: "bg-indigo-50 text-indigo-900 border-indigo-300",
  GS3: "bg-emerald-50 text-emerald-900 border-emerald-300",
  GS4: "bg-rose-50 text-rose-900 border-rose-300",
  Essay: "bg-violet-50 text-violet-900 border-violet-300",
};

const PRIORITY_STYLE: Record<string, string> = {
  high: "bg-rose-600 text-white border-rose-700",
  medium: "bg-amber-500 text-white border-amber-600",
  low: "bg-slate-400 text-white border-slate-500",
};

function Importance({ value }: { value: number }) {
  const stars = Array.from({ length: 5 }, (_, i) => i < value);
  const label = value >= 5 ? "Must Read" : value === 4 ? "Important" : value === 3 ? "Moderate" : value === 2 ? "Low Priority" : "Skip";
  return (
    <span className="inline-flex items-center gap-1" title={`${label} (${value}/5)`}>
      <span aria-hidden="true" className="text-amber-500">
        {stars.map((on, i) => <Star key={i} className={`inline h-3.5 w-3.5 ${on ? "fill-amber-400 text-amber-500" : "text-muted-foreground/40"}`} />)}
      </span>
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
    </span>
  );
}

function SyllabusPath({ path }: { path: string[] }) {
  if (!path?.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1 text-[12px]">
      {path.map((p, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          <span className={`rounded px-1.5 py-0.5 ${i === 0 ? "bg-primary/10 font-semibold text-primary" : "bg-muted text-foreground"}`}>{p}</span>
          {i < path.length - 1 && <span className="text-muted-foreground">›</span>}
        </span>
      ))}
    </div>
  );
}

function ArticleBadges({ a }: { a: Article }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {a.gs_papers.map((g) => (
        <Badge key={g} variant="outline" className={GS_STYLE[g] ?? ""}>
          <BookOpen className="mr-1 h-3 w-3" />{g}
        </Badge>
      ))}
      {a.subject && (
        <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
          <Tag className="mr-1 h-3 w-3" />{a.subject}
        </Badge>
      )}
      <Badge className={PRIORITY_STYLE[a.prelims_priority]}>
        <Flame className="mr-1 h-3 w-3" />Prelims · {a.prelims_priority}
      </Badge>
      <Badge className={PRIORITY_STYLE[a.mains_priority]}>
        <Flame className="mr-1 h-3 w-3" />Mains · {a.mains_priority}
      </Badge>
      {a.pyqs.length > 0 && (
        <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-900">
          <Hash className="mr-1 h-3 w-3" />{a.pyqs.length} PYQ{a.pyqs.length === 1 ? "" : "s"}
        </Badge>
      )}
      {a.handwritten_outline.length > 0 && (
        <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-900">
          <Sparkles className="mr-1 h-3 w-3" />Notes Ready
        </Badge>
      )}
      {a.mind_map.length > 0 && (
        <Badge variant="outline" className="border-violet-300 bg-violet-50 text-violet-900">
          <Brain className="mr-1 h-3 w-3" />Mind Map
        </Badge>
      )}
      {a.tags.slice(0, 4).map((t) => (
        <Badge key={t} variant="outline" className="text-[10px]">
          {t}
        </Badge>
      ))}
    </div>
  );
}

const RELATED_LABELS: Record<keyof Required<Related>, string> = {
  articles: "Articles",
  current_affairs: "Current Affairs",
  constitution: "Constitution Articles",
  sc_cases: "Supreme Court Cases",
  committees: "Committees",
  reports: "Reports",
  schemes: "Government Schemes",
  intl_orgs: "International Orgs",
  static_topic: "Static Topic",
  ncert: "NCERT",
  laxmikanth: "Laxmikanth",
  spectrum: "Spectrum",
};

function RelatedLinks({ article, openInMentor }: { article: Article; openInMentor: (topic: string) => void }) {
  const entries = Object.entries(article.related).filter(([, v]) => Array.isArray(v) && v.length > 0) as [keyof Required<Related>, string[]][];
  if (!entries.length) return null;
  return (
    <section className="mt-4 rounded-md border border-border bg-paper p-3">
      <h6 className="mb-2 flex items-center gap-1.5 font-serif text-sm font-semibold">
        <LinkIcon className="h-4 w-4 text-accent" /> Smart Related Links
      </h6>
      <div className="grid gap-2 sm:grid-cols-2">
        {entries.map(([key, items]) => (
          <div key={key}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{RELATED_LABELS[key]}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {items.map((it, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => openInMentor(`${RELATED_LABELS[key]}: ${it}`)}
                  className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] transition-colors hover:border-accent hover:bg-accent/10"
                >
                  {it}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ArticleCard({ a, openInMentor }: { a: Article; openInMentor: (topic: string, context?: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="rounded-xl border border-border bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-neutral-100">
      <header className="border-b border-border p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="font-serif text-2xl font-bold leading-snug text-neutral-900 dark:text-neutral-50">{a.title}</h4>
            {a.source_page && <p className="mt-1 text-sm font-medium text-neutral-600 dark:text-neutral-400">Page {a.source_page}</p>}
          </div>
          <Importance value={a.importance} />
        </div>
        <div className="mt-3"><SyllabusPath path={a.syllabus_path} /></div>
        <div className="mt-3"><ArticleBadges a={a} /></div>
        {a.summary_30s && (
          <p className="mt-4 rounded-md bg-neutral-100 px-4 py-3 text-[17px] font-medium leading-7 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50">
            <span className="mr-2 text-xs font-bold uppercase tracking-wider text-primary">30s</span>
            {a.summary_30s}
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setOpen((o) => !o)}>
            {open ? <ChevronUp className="mr-1 h-3.5 w-3.5" /> : <ChevronDown className="mr-1 h-3.5 w-3.5" />}
            {open ? "Collapse" : "Open full briefing"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openInMentor(a.title, `Source: ${a.subject}. ${a.summary_2min || a.summary_30s}`)}
            className="text-primary"
          >
            <Sparkles className="mr-1 h-3.5 w-3.5" /> Ask Mentor
          </Button>
        </div>
      </header>

      {open && (
        <div className="space-y-5 p-5 text-[17px] leading-7 text-neutral-900 dark:text-neutral-100">
          {a.summary_2min && (
            <Block title="2-Minute Revision" icon={<Bookmark className="h-4 w-4" />}>
              <p className="text-[17px] leading-8">{a.summary_2min}</p>
            </Block>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            {a.keywords.length > 0 && (
              <Block title="Keywords" icon={<Hash className="h-4 w-4" />}>
                <div className="flex flex-wrap gap-1.5">
                  {a.keywords.map((k, i) => <Badge key={i} variant="outline" className="text-sm">{k}</Badge>)}
                </div>
              </Block>
            )}
            {a.facts.length > 0 && (
              <Block title="Important Facts" icon={<FileText className="h-4 w-4" />}>
                <ul className="list-disc space-y-1.5 pl-5 text-[16px] leading-7">{a.facts.map((f, i) => <li key={i}>{f}</li>)}</ul>
              </Block>
            )}
            {a.stats.length > 0 && (
              <Block title="Data & Statistics" icon={<Hash className="h-4 w-4" />}>
                <ul className="space-y-1 text-[16px] leading-7">{a.stats.map((s, i) => <li key={i} className="rounded bg-emerald-50 px-2 py-1 text-emerald-900">{s}</li>)}</ul>
              </Block>
            )}
            {a.constitutional_articles.length > 0 && (
              <Block title="Constitutional Articles" icon={<Landmark className="h-4 w-4" />}>
                <div className="flex flex-wrap gap-1.5">{a.constitutional_articles.map((c, i) => <Badge key={i} className="bg-indigo-600 text-white">{c}</Badge>)}</div>
              </Block>
            )}
            {a.quotes.length > 0 && (
              <Block title="Quotes" icon={<Quote className="h-4 w-4" />}>
                <ul className="space-y-2 text-[16px] italic leading-7">{a.quotes.map((q, i) => <li key={i} className="border-l-4 border-accent pl-3">“{q}”</li>)}</ul>
              </Block>
            )}
          </div>

          {a.pyqs.length > 0 && (
            <Block title="PYQ Mapping" icon={<Gavel className="h-4 w-4" />}>
              <div className="overflow-x-auto">
                <table className="w-full text-[15px] leading-6">
                  <thead className="bg-neutral-100 text-left text-xs font-bold uppercase text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                    <tr><th className="px-3 py-2">Year</th><th className="px-3 py-2">Paper</th><th className="px-3 py-2">Question</th><th className="px-3 py-2">×</th><th className="px-3 py-2">State PCS</th></tr>
                  </thead>
                  <tbody>
                    {a.pyqs.map((p, i) => (
                      <tr key={i} className="border-t border-border align-top">
                        <td className="px-3 py-2 font-mono text-sm">{p.year}</td>
                        <td className="px-3 py-2 text-sm">{p.paper}</td>
                        <td className="px-3 py-2">{p.question}</td>
                        <td className="px-3 py-2 text-center font-semibold">{p.repeat_count}</td>
                        <td className="px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300">{p.state_pcs || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Block>
          )}

          {a.short_notes.length > 0 && (
            <Block title="Short Notes" icon={<FileText className="h-4 w-4" />}>
              <ul className="list-disc space-y-1.5 pl-5 text-[16px] leading-7">{a.short_notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
            </Block>
          )}

          {a.one_pager && (
            <Block title="One-Page Revision" icon={<Bookmark className="h-4 w-4" />}>
              <p className="text-[17px] leading-8">{a.one_pager}</p>
            </Block>
          )}

          {a.handwritten_outline.length > 0 && (
            <Block title="Handwritten Outline" icon={<FileText className="h-4 w-4" />}>
              <div className="space-y-2">
                {a.handwritten_outline.map((h, i) => (
                  <div key={i} className="rounded-md border-l-4 border-amber-400 bg-amber-50 px-4 py-3">
                    <p className="font-serif text-lg font-bold text-amber-950">{h.heading}</p>
                    <p className="mt-1 text-[16px] leading-7 text-neutral-900">{h.body}</p>
                  </div>
                ))}
              </div>
            </Block>
          )}

          {a.mind_map.length > 0 && (
            <Block title="Mind Map" icon={<Brain className="h-4 w-4" />}>
              <div className="grid gap-2 sm:grid-cols-2">
                {a.mind_map.map((m, i) => (
                  <div key={i} className="rounded-md border border-violet-200 bg-violet-50 p-3">
                    <p className="font-bold text-violet-950">{m.branch}</p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-[15px] leading-6 text-neutral-900">{m.leaves.map((l, j) => <li key={j}>{l}</li>)}</ul>
                  </div>
                ))}
              </div>
            </Block>
          )}

          {a.flashcards.length > 0 && (
            <Block title="Flashcards" icon={<Bookmark className="h-4 w-4" />}>
              <div className="grid gap-2 sm:grid-cols-2">
                {a.flashcards.map((f, i) => (
                  <details key={i} className="rounded-md border border-border bg-neutral-50 p-3 text-[15px] dark:bg-neutral-800">
                    <summary className="cursor-pointer font-semibold text-neutral-900 dark:text-neutral-100">{f.q}</summary>
                    <p className="mt-2 leading-7 text-neutral-800 dark:text-neutral-200">{f.a}</p>
                  </details>
                ))}
              </div>
            </Block>
          )}

          {a.prelims_mcqs.length > 0 && (
            <Block title="Prelims MCQs" icon={<BookOpen className="h-4 w-4" />}>
              <ol className="space-y-3">
                {a.prelims_mcqs.map((q, i) => (
                  <li key={i} className="rounded-md border border-border p-4 text-[16px] leading-7">
                    <p className="font-bold">Q{i + 1}. {q.stem}</p>
                    <ol className="mt-2 grid gap-1.5" type="A">
                      {q.options.map((o, j) => (
                        <li key={j} className={`ml-5 pl-1 ${j === q.answer_index ? "font-bold text-emerald-800" : ""}`}>{o}</li>
                      ))}
                    </ol>
                    <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300"><span className="font-bold">Answer:</span> {String.fromCharCode(65 + q.answer_index)} — {q.explanation}</p>
                  </li>
                ))}
              </ol>
            </Block>
          )}

          {a.mains_questions.length > 0 && (
            <Block title="Mains Questions" icon={<FileText className="h-4 w-4" />}>
              <ol className="space-y-2">
                {a.mains_questions.map((m, i) => (
                  <li key={i} className="rounded-md border border-border p-4 text-[16px] leading-7">
                    <div className="mb-1 flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      <Badge variant="outline">{m.gs_paper}</Badge>
                      <span>{m.marks} marks</span>
                    </div>
                    <p className="font-bold">{m.question}</p>
                    {m.outline.length > 0 && <ul className="mt-1 list-disc space-y-1 pl-5">{m.outline.map((o, j) => <li key={j}>{o}</li>)}</ul>}
                  </li>
                ))}
              </ol>
            </Block>
          )}

          {a.interview_questions.length > 0 && (
            <Block title="Interview Questions" icon={<Gavel className="h-4 w-4" />}>
              <ul className="list-decimal space-y-1.5 pl-6 text-[16px] leading-7">{a.interview_questions.map((q, i) => <li key={i}>{q}</li>)}</ul>
            </Block>
          )}

          <RelatedLinks article={a} openInMentor={(topic) => openInMentor(topic, `Parent article: ${a.title}\nSubject: ${a.subject}\nSummary: ${a.summary_2min || a.summary_30s}`)} />
        </div>
      )}
    </article>
  );
}

function Block({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <h6 className="mb-2 flex items-center gap-2 font-serif text-base font-bold text-primary">
        {icon}{title}
      </h6>
      {children}
    </section>
  );
}


export function NewspaperIssue({ content, onRetry }: { content: Issue; onRetry?: () => void }) {
  const navigate = useNavigate();
  const issue: Issue = {
    title: content?.title ?? "Newspaper Analysis",
    source: content?.source ?? "Other",
    date: content?.date ?? "",
    edition: content?.edition ?? "",
    articles: Array.isArray(content?.articles) ? content.articles : [],
  };
  const [fGs, setFGs] = useState<string>("");
  const [fSubject, setFSubject] = useState<string>("");
  const [fPriority, setFPriority] = useState<string>("");
  const [fImportance, setFImportance] = useState<number>(0);

  const allSubjects = useMemo(() => Array.from(new Set(issue.articles.map((a) => a.subject).filter(Boolean))).sort(), [issue.articles]);
  const allGs = useMemo(() => Array.from(new Set(issue.articles.flatMap((a) => a.gs_papers))).sort(), [issue.articles]);

  const visible = issue.articles.filter((a) => {
    if (fGs && !a.gs_papers.includes(fGs)) return false;
    if (fSubject && a.subject !== fSubject) return false;
    if (fPriority && a.prelims_priority !== fPriority && a.mains_priority !== fPriority) return false;
    if (fImportance && a.importance < fImportance) return false;
    return true;
  });

  function openInMentor(topic: string, context?: string) {
    try {
      if (context) sessionStorage.setItem("mentor_seed_context", context);
      else sessionStorage.removeItem("mentor_seed_context");
    } catch {}
    navigate({ to: "/mentor", search: { seed: topic } as any });
  }

  return (
    <div className="space-y-4">
      <header className="rounded-xl border-2 border-accent/40 bg-gradient-to-br from-primary/5 via-accent/10 to-primary/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-accent" />
            <div>
              <h3 className="font-serif text-lg font-semibold leading-tight">{issue.title}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                <Badge variant="outline" className={SOURCE_STYLE[issue.source] ?? SOURCE_STYLE.Other}>
                  📖 {issue.source}
                </Badge>
                {issue.date && <Badge variant="outline">📅 {issue.date}</Badge>}
                {issue.edition && <Badge variant="outline">{issue.edition}</Badge>}
                <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-900">
                  {issue.articles.length} article{issue.articles.length === 1 ? "" : "s"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Select label="GS Paper" value={fGs} onChange={setFGs} options={["", ...allGs]} />
          <Select label="Subject" value={fSubject} onChange={setFSubject} options={["", ...allSubjects]} />
          <Select label="Priority" value={fPriority} onChange={setFPriority} options={["", "high", "medium", "low"]} />
          <Select
            label="Min ★"
            value={String(fImportance)}
            onChange={(v) => setFImportance(Number(v))}
            options={["0", "1", "2", "3", "4", "5"]}
          />
          {(fGs || fSubject || fPriority || fImportance) && (
            <Button size="sm" variant="ghost" className="h-7" onClick={() => { setFGs(""); setFSubject(""); setFPriority(""); setFImportance(0); }}>Clear</Button>
          )}
        </div>
      </header>

      {issue.articles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-8 text-center dark:bg-neutral-900">
          <h4 className="font-serif text-xl font-bold text-neutral-900 dark:text-neutral-50">We couldn't read this newspaper clearly</h4>
          <p className="mx-auto mt-2 max-w-xl text-[16px] leading-7 text-neutral-700 dark:text-neutral-300">
            The text in this PDF was too blurry or low quality for us to extract complete articles. Please try a sharper scan or the publisher's original PDF, then run the analysis again.
          </p>
          {onRetry && (
            <div className="mt-4 flex justify-center">
              <Button onClick={onRetry} className="bg-primary text-primary-foreground">Retry Analysis</Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {visible.length === 0 && (
            <p className="rounded-md border border-dashed border-border bg-white p-6 text-center text-[15px] text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
              No articles match these filters.
            </p>
          )}
          {visible.map((a, i) => <ArticleCard key={i} a={a} openInMentor={openInMentor} />)}
        </div>
      )}
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-xs outline-none"
      >
        {options.map((o) => <option key={o} value={o}>{o === "" ? "All" : o === "0" ? "Any" : o}</option>)}
      </select>
    </label>
  );
}
