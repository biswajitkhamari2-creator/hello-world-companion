import { Badge } from "@/components/ui/badge";
import type { InstitutionCrispNotes, InstitutionComprehensiveNotes } from "@/lib/institution-news.functions";

function gsColor(gs: string): string {
  switch (gs) {
    case "GS-1": return "from-amber-500 to-orange-500";
    case "GS-2": return "from-sky-500 to-blue-600";
    case "GS-3": return "from-emerald-500 to-teal-600";
    case "GS-4": return "from-fuchsia-500 to-pink-600";
    case "Essay": return "from-violet-500 to-indigo-600";
    default: return "from-slate-500 to-slate-700";
  }
}

function Section({ title, tone, children }: { title: string; tone?: "sky" | "emerald"; children: React.ReactNode }) {
  const ring =
    tone === "sky" ? "border-sky-200 dark:border-sky-900/50" :
    tone === "emerald" ? "border-emerald-200 dark:border-emerald-900/50" :
    "border-border";
  return (
    <div className={`rounded-xl border ${ring} bg-card p-3.5`}>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Bullet({ children, accent }: { children: React.ReactNode; accent?: "amber" }) {
  const dot = accent === "amber" ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="flex gap-2 text-sm leading-snug">
      <span className={`mt-1.5 h-1.5 w-1.5 flex-none rounded-full ${dot}`} />
      <span>{children}</span>
    </div>
  );
}

export function CrispNotesView({ notes }: { notes: InstitutionCrispNotes }) {
  return (
    <div className="space-y-5">
      <div className={`rounded-2xl bg-gradient-to-br ${gsColor(notes.gsPaper)} p-[1px] shadow-sm`}>
        <div className="rounded-2xl bg-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full bg-gradient-to-r ${gsColor(notes.gsPaper)} px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white shadow`}>{notes.gsPaper}</span>
            <Badge variant="secondary" className="text-[10px]">{notes.subject}</Badge>
            <Badge variant="outline" className="text-[10px]">{notes.topic}</Badge>
          </div>
          <h2 className="mt-2 font-serif text-lg font-bold leading-snug">{notes.title}</h2>
          <p className="mt-1 text-xs italic text-muted-foreground">Syllabus anchor: {notes.syllabusAnchor}</p>
          <p className="mt-3 text-sm leading-relaxed">{notes.oneLine}</p>
        </div>
      </div>

      {notes.whyInNews?.length > 0 && (
        <Section title="Why in News">{notes.whyInNews.map((b, i) => <Bullet key={i}>{b}</Bullet>)}</Section>
      )}
      {notes.keyPoints?.length > 0 && (
        <Section title="Key Points">{notes.keyPoints.map((b, i) => <Bullet key={i}>{b}</Bullet>)}</Section>
      )}
      {notes.facts?.length > 0 && (
        <Section title="Facts & Figures">{notes.facts.map((b, i) => <Bullet key={i} accent="amber">{b}</Bullet>)}</Section>
      )}
      {notes.keyTerms?.length > 0 && (
        <Section title="Key Terms">
          <div className="grid gap-2 sm:grid-cols-2">
            {notes.keyTerms.map((t, i) => (
              <div key={i} className="rounded-lg border border-border bg-muted/30 p-2.5">
                <p className="text-xs font-semibold">{t.term}</p>
                <p className="text-xs text-muted-foreground">{t.meaning}</p>
              </div>
            ))}
          </div>
        </Section>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {notes.prelimsAngle?.length > 0 && (
          <Section title="Prelims Angle" tone="sky">{notes.prelimsAngle.map((b, i) => <Bullet key={i}>{b}</Bullet>)}</Section>
        )}
        {notes.mainsAngle?.length > 0 && (
          <Section title="Mains Angle" tone="emerald">{notes.mainsAngle.map((b, i) => <Bullet key={i}>{b}</Bullet>)}</Section>
        )}
      </div>
      {notes.probableQuestion && (
        <div className="rounded-xl border-l-4 border-fuchsia-500 bg-fuchsia-50 p-3.5 text-sm dark:bg-fuchsia-950/30">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-fuchsia-700 dark:text-fuchsia-300">Probable Question</p>
          <p className="italic">{notes.probableQuestion}</p>
        </div>
      )}
      <p className="text-[11px] text-muted-foreground">
        Source: <a className="underline" href={notes.sourceUrl} target="_blank" rel="noreferrer">{notes.sourceUrl}</a>
      </p>
    </div>
  );
}

export function ComprehensiveNotesView({ notes }: { notes: InstitutionComprehensiveNotes }) {
  return (
    <div className="space-y-5">
      <CrispNotesView notes={notes} />
      {notes.background?.length > 0 && <Section title="Background & Evolution">{notes.background.map((b, i) => <Bullet key={i}>{b}</Bullet>)}</Section>}
      {notes.currentStatus?.length > 0 && <Section title="Current Status">{notes.currentStatus.map((b, i) => <Bullet key={i}>{b}</Bullet>)}</Section>}
      {notes.stakeholders?.length > 0 && <Section title="Stakeholders">{notes.stakeholders.map((b, i) => <Bullet key={i}>{b}</Bullet>)}</Section>}
      {notes.challenges?.length > 0 && <Section title="Challenges" tone="sky">{notes.challenges.map((b, i) => <Bullet key={i}>{b}</Bullet>)}</Section>}
      {notes.wayForward?.length > 0 && <Section title="Way Forward" tone="emerald">{notes.wayForward.map((b, i) => <Bullet key={i}>{b}</Bullet>)}</Section>}
      {notes.relatedSchemes?.length > 0 && <Section title="Related Schemes / Acts / Reports">{notes.relatedSchemes.map((b, i) => <Bullet key={i} accent="amber">{b}</Bullet>)}</Section>}
      {notes.internationalAngle?.length > 0 && <Section title="International / Global Angle">{notes.internationalAngle.map((b, i) => <Bullet key={i}>{b}</Bullet>)}</Section>}
      {notes.quotes?.length > 0 && (
        <div className="rounded-xl border-l-4 border-indigo-500 bg-indigo-50 p-3.5 text-sm dark:bg-indigo-950/30">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">Quotable Lines for Mains</p>
          <ul className="space-y-1.5">
            {notes.quotes.map((q, i) => <li key={i} className="italic">“{q}”</li>)}
          </ul>
        </div>
      )}
      {notes.mindMap && <Section title="Mind Map (One-shot Recap)"><p className="text-sm leading-relaxed">{notes.mindMap}</p></Section>}
    </div>
  );
}