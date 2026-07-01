import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ClipboardCheck, CheckCircle2, XCircle, RotateCcw, Trophy } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/mocks")({
  head: () => ({ meta: [{ title: "Mock Tests — UPSC Genius AI" }] }),
  component: MocksPage,
});

type MCQ = { q: string; opts: [string, string, string, string]; ans: 0 | 1 | 2 | 3; expl: string; topic: string };

// Free-tier curated UPSC-style questions (Polity / Economy / Geography / Env / History / S&T)
const BANK: MCQ[] = [
  { q: "Who is the ex-officio Chairman of the Rajya Sabha?", opts: ["President of India", "Prime Minister", "Vice-President of India", "Speaker of Lok Sabha"], ans: 2, expl: "Article 89(1): Vice-President is the ex-officio Chairman of the Rajya Sabha.", topic: "Polity" },
  { q: "The Fundamental Duties were added to the Constitution by which Amendment?", opts: ["42nd", "44th", "73rd", "86th"], ans: 0, expl: "42nd Amendment Act, 1976 inserted Part IV-A (Article 51A).", topic: "Polity" },
  { q: "Which article of the Constitution guarantees the Right to Constitutional Remedies?", opts: ["Article 14", "Article 19", "Article 21", "Article 32"], ans: 3, expl: "Dr. Ambedkar called Article 32 the 'heart and soul' of the Constitution.", topic: "Polity" },
  { q: "The concept of a 'Welfare State' is included in the Constitution under:", opts: ["Preamble", "Fundamental Rights", "Directive Principles of State Policy", "Fundamental Duties"], ans: 2, expl: "DPSPs (Part IV) aim to establish a welfare state.", topic: "Polity" },

  { q: "The 'Repo Rate' is the rate at which:", opts: ["Commercial banks lend to RBI", "RBI lends to commercial banks", "Government borrows from RBI", "RBI buys foreign currency"], ans: 1, expl: "Repo rate = rate at which RBI lends short-term funds to commercial banks against government securities.", topic: "Economy" },
  { q: "GST (Goods and Services Tax) in India came into effect on:", opts: ["1 April 2016", "1 July 2017", "1 January 2018", "1 April 2017"], ans: 1, expl: "GST was launched on 1 July 2017 via the 101st Amendment.", topic: "Economy" },
  { q: "The 'Gini Coefficient' measures:", opts: ["Inflation", "Poverty line", "Income inequality", "GDP growth"], ans: 2, expl: "Gini = 0 means perfect equality, 1 means perfect inequality.", topic: "Economy" },

  { q: "Which of the following is the longest river in India?", opts: ["Brahmaputra", "Godavari", "Ganga", "Krishna"], ans: 2, expl: "Ganga (~2525 km within India) is the longest river in India.", topic: "Geography" },
  { q: "The Tropic of Cancer does NOT pass through which Indian state?", opts: ["Gujarat", "Odisha", "Tripura", "Mizoram"], ans: 1, expl: "Tropic of Cancer passes through 8 states; Odisha is not one.", topic: "Geography" },
  { q: "The 'Doldrums' are located near:", opts: ["Poles", "Tropic of Cancer", "Equator", "Arctic Circle"], ans: 2, expl: "Doldrums = equatorial low-pressure belt with calm winds.", topic: "Geography" },

  { q: "Which of the following is a Ramsar site in India?", opts: ["Chilika Lake", "Sambhar Lake", "Loktak Lake", "All of the above"], ans: 3, expl: "All three are notified Ramsar wetlands of international importance.", topic: "Environment" },
  { q: "The 'Kyoto Protocol' is related to:", opts: ["Ozone depletion", "Greenhouse gas emissions", "Biodiversity", "Wetlands"], ans: 1, expl: "Kyoto Protocol (1997) under UNFCCC targets GHG emission reduction.", topic: "Environment" },
  { q: "Project Tiger was launched in India in the year:", opts: ["1972", "1973", "1982", "1991"], ans: 1, expl: "Project Tiger was launched on 1 April 1973 from Jim Corbett NP.", topic: "Environment" },

  { q: "The Battle of Plassey was fought in:", opts: ["1757", "1764", "1857", "1761"], ans: 0, expl: "23 June 1757 — Robert Clive defeated Siraj-ud-Daulah.", topic: "History" },
  { q: "The Non-Cooperation Movement was launched by Gandhi in:", opts: ["1919", "1920", "1930", "1942"], ans: 1, expl: "Non-Cooperation Movement was launched in September 1920.", topic: "History" },
  { q: "The Dandi March started from Sabarmati Ashram on:", opts: ["12 March 1930", "6 April 1930", "26 January 1930", "15 August 1947"], ans: 0, expl: "Dandi March began 12 March 1930; salt was made 6 April 1930.", topic: "History" },

  { q: "ISRO's Chandrayaan-3 successfully landed on the Moon on:", opts: ["23 Aug 2023", "14 Jul 2023", "15 Aug 2023", "2 Sep 2023"], ans: 0, expl: "Vikram lander touched down near the lunar south pole on 23 Aug 2023.", topic: "Sci & Tech" },
  { q: "'CRISPR-Cas9' is a technology used for:", opts: ["Nuclear fusion", "Gene editing", "Quantum computing", "Solar energy"], ans: 1, expl: "CRISPR-Cas9 is a precise gene-editing technology.", topic: "Sci & Tech" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function MocksPage() {
  const [seed, setSeed] = useState(0);
  const questions = useMemo(() => shuffle(BANK).slice(0, 10), [seed]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.ans ? 1 : 0), 0);

  function reset() {
    setAnswers({}); setSubmitted(false); setSeed((x) => x + 1);
  }

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        <header className="mb-6 flex items-center gap-3 animate-fade-in">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md">
            <ClipboardCheck className="h-5 w-5" />
          </span>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-2xl font-bold">Mock Test</h1>
            <p className="text-sm text-muted-foreground">Free-tier UPSC MCQs — 10 questions, 4 options each. Submit karo aur explanation dekho.</p>
          </div>
          <Button variant="outline" size="sm" onClick={reset}><RotateCcw className="mr-1.5 h-3.5 w-3.5" /> New Set</Button>
        </header>

        {submitted && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border-2 border-amber-300 bg-amber-50 p-4 dark:bg-amber-950/30 animate-scale-in">
            <Trophy className="h-6 w-6 text-amber-600" />
            <div>
              <p className="font-bold text-lg">Score: {score} / {questions.length}</p>
              <p className="text-xs text-muted-foreground">{score >= 8 ? "Excellent!" : score >= 5 ? "Good — keep practising." : "Revise the basics and try again."}</p>
            </div>
          </div>
        )}

        <ol className="grid gap-4">
          {questions.map((qn, i) => (
            <li
              key={i}
              className="rounded-xl border border-border bg-card p-4 shadow-sm animate-fade-in"
              style={{ animationDelay: `${i * 30}ms`, animationFillMode: "both" }}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-serif font-semibold text-sm leading-6">Q{i + 1}. {qn.q}</h3>
                <Badge variant="outline" className="shrink-0 text-[10px]">{qn.topic}</Badge>
              </div>
              <div className="mt-3 grid gap-2">
                {qn.opts.map((opt, oi) => {
                  const picked = answers[i] === oi;
                  const isCorrect = submitted && oi === qn.ans;
                  const isWrong = submitted && picked && oi !== qn.ans;
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={submitted}
                      onClick={() => setAnswers((a) => ({ ...a, [i]: oi }))}
                      className={[
                        "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-all",
                        "hover:translate-x-0.5 hover:shadow-sm",
                        isCorrect ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30" :
                        isWrong ? "border-rose-400 bg-rose-50 dark:bg-rose-950/30" :
                        picked ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30" :
                        "border-border bg-background hover:bg-accent/40",
                      ].join(" ")}
                    >
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-current text-[11px] font-semibold">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                      {isWrong && <XCircle className="h-4 w-4 text-rose-600" />}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <p className="mt-3 rounded-md bg-muted/50 p-2 text-xs leading-5 text-muted-foreground animate-fade-in">
                  <strong className="text-foreground">Explanation:</strong> {qn.expl}
                </p>
              )}
            </li>
          ))}
        </ol>

        <div className="sticky bottom-4 mt-6 flex justify-center">
          {!submitted ? (
            <Button size="lg" onClick={() => setSubmitted(true)} className="shadow-lg">
              Submit Test
            </Button>
          ) : (
            <Button size="lg" variant="outline" onClick={reset} className="shadow-lg">
              <RotateCcw className="mr-1.5 h-4 w-4" /> Try Another Set
            </Button>
          )}
        </div>
      </main>
    </AppShell>
  );
}