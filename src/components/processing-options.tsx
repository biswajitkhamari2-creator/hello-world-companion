import { useEffect, useState } from "react";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  DEFAULT_PREFS,
  getProcessingPrefs,
  setProcessingPrefs,
  subscribeProcessingPrefs,
  type ProcessingPrefs,
} from "@/lib/processing-prefs";

export function useProcessingPrefs(): ProcessingPrefs {
  const [p, setP] = useState<ProcessingPrefs>(() => getProcessingPrefs());
  useEffect(() => subscribeProcessingPrefs(() => setP(getProcessingPrefs())), []);
  return p;
}

function Row({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md border border-border/60 bg-paper/40 p-3">
      <div className="min-w-0">
        <Label className="text-sm font-medium">{title}</Label>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function ProcessingOptionsButton() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ProcessingPrefs>(getProcessingPrefs());

  useEffect(() => {
    if (open) setDraft(getProcessingPrefs());
  }, [open]);

  const set = <K extends keyof ProcessingPrefs>(k: K, v: ProcessingPrefs[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  function save() {
    setProcessingPrefs(draft);
    toast.success("Processing options saved");
    setOpen(false);
  }

  function reset() {
    setDraft(DEFAULT_PREFS);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" aria-label="Processing options" className="min-h-9">
          <Settings2 className="h-4 w-4 sm:mr-2" aria-hidden="true" />
          <span className="hidden sm:inline">Processing options</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Processing options</DialogTitle>
          <DialogDescription>
            Control how uploaded material is processed. The app always preserves and organises your
            source content — these toggles only enable the optional UPSC-specific layers.
          </DialogDescription>
        </DialogHeader>

        <section className="mt-2 space-y-2">
          <h3 className="font-serif text-sm font-semibold text-muted-foreground">
            UPSC layers (optional)
          </h3>
          <Row
            title="UPSC Syllabus Tagging"
            desc="Map every concept to Prelims / GS-I / GS-II / GS-III / GS-IV / Essay / Optional. When OFF, no GS Paper labels are added."
            checked={draft.syllabusTagging}
            onChange={(v) => set("syllabusTagging", v)}
          />
          <Row
            title="PYQ Mapping"
            desc="Link concepts to actual UPSC Previous Year Questions. AI-generated practice questions are kept separate."
            checked={draft.pyqMapping}
            onChange={(v) => set("pyqMapping", v)}
          />
        </section>

        <section className="mt-4 space-y-2">
          <h3 className="font-serif text-sm font-semibold text-muted-foreground">
            Question generation
          </h3>
          <Row
            title="Generate Questions"
            desc="Master toggle. When OFF, no question banks are generated."
            checked={draft.generateQuestions}
            onChange={(v) => set("generateQuestions", v)}
          />
          {draft.generateQuestions && (
            <div className="ml-2 space-y-2 border-l-2 border-accent/30 pl-3">
              <Row
                title="Prelims MCQs"
                desc="Objective questions with 4 options and explanations."
                checked={draft.questionPrelimsMcqs}
                onChange={(v) => set("questionPrelimsMcqs", v)}
              />
              <Row
                title="Mains Questions"
                desc="Long-answer questions with introduction, body, conclusion outlines."
                checked={draft.questionMains}
                onChange={(v) => set("questionMains", v)}
              />
              <Row
                title="Essay Questions"
                desc="Adds broad essay-style prompts inside the Mains output."
                checked={draft.questionEssay}
                onChange={(v) => set("questionEssay", v)}
              />
              <Row
                title="Ethics Case Studies"
                desc="Adds GS-4 style case studies inside the Mains output."
                checked={draft.questionEthicsCases}
                onChange={(v) => set("questionEthicsCases", v)}
              />
              <Row
                title="Interview Questions"
                desc="Adds Personality-Test style opinion/probing questions."
                checked={draft.questionInterview}
                onChange={(v) => set("questionInterview", v)}
              />
            </div>
          )}
        </section>

        <section className="mt-4 space-y-2">
          <h3 className="font-serif text-sm font-semibold text-muted-foreground">Other outputs</h3>
          <Row
            title="Short Notes"
            desc="1–2 page revision sheets per topic."
            checked={draft.generateShortNotes}
            onChange={(v) => set("generateShortNotes", v)}
          />
          <Row
            title="Handwritten Notes"
            desc="Notebook-style pages — unlimited length to cover the full document."
            checked={draft.generateHandwritten}
            onChange={(v) => set("generateHandwritten", v)}
          />
          <Row
            title="Infographics"
            desc="One infographic page per detected topic. No upper limit."
            checked={draft.generateInfographics}
            onChange={(v) => set("generateInfographics", v)}
          />
          <Row
            title="Final Checker"
            desc="Audit generated outputs for coverage of the source. Shows syllabus mapping only if Syllabus Tagging is ON."
            checked={draft.runFinalChecker}
            onChange={(v) => set("runFinalChecker", v)}
          />
        </section>

        <DialogFooter className="mt-4 flex-row justify-between gap-2 sm:justify-between">
          <Button variant="ghost" size="sm" onClick={reset}>
            Reset to defaults
          </Button>
          <Button size="sm" onClick={save}>
            Save options
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
