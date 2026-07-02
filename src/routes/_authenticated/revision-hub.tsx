import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Sparkles, Search, Bookmark, BookmarkCheck, Check, ChevronDown, ChevronRight,
  Layers, Brain, Zap, NotebookPen, CalendarDays, CalendarRange, CalendarClock,
  HelpCircle, Lightbulb, BarChart3, Printer, Download, RotateCcw, Loader2, Star,
  Flame, ChevronLeft,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { runRevisionAi } from "@/lib/revision-hub.functions";

export const Route = createFileRoute("/_authenticated/revision-hub")({
  head: () => ({
    meta: [
      { title: "AI Revision Hub — UPSC Genius AI" },
      { name: "description", content: "12-in-one AI revision engine: one-liners, PYQs, mind maps, flashcards, notes, planners, quizzes, mnemonics and analytics for UPSC." },
    ],
  }),
  component: RevisionHubPage,
});

type TabKey =
  | "one_liner" | "pyq" | "static" | "mindmap" | "flashcards" | "notes"
  | "planner" | "weekly" | "monthly" | "quiz" | "mnemonics" | "analytics";

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }>; hint: string }[] = [
  { key: "one_liner",  label: "One-Liners",   icon: Zap,            hint: "Ultra-short facts" },
  { key: "pyq",        label: "PYQ Revision", icon: Layers,         hint: "Repeated themes" },
  { key: "static",     label: "Static ↔ CA",  icon: Brain,          hint: "News → book → PYQ" },
  { key: "mindmap",    label: "Mind Maps",    icon: Sparkles,       hint: "Expandable" },
  { key: "flashcards", label: "Flashcards",   icon: BookmarkCheck,  hint: "Swipe + flip" },
  { key: "notes",      label: "Notes",        icon: NotebookPen,    hint: "Handwritten style" },
  { key: "planner",    label: "Today",        icon: CalendarDays,   hint: "Daily plan" },
  { key: "weekly",     label: "Weekly",       icon: CalendarRange,  hint: "Week digest" },
  { key: "monthly",    label: "Monthly",      icon: CalendarClock,  hint: "Month compile" },
  { key: "quiz",       label: "AI Quiz",      icon: HelpCircle,     hint: "MCQ + Mains" },
  { key: "mnemonics",  label: "Memory",       icon: Lightbulb,      hint: "Tricks & stories" },
  { key: "analytics",  label: "Analytics",    icon: BarChart3,      hint: "Progress" },
];

// -------- storage helpers --------
const LS = {
  bookmarks: "rh_bookmarks_v1",
  read: "rh_read_v1",
  streak: "rh_streak_v1",
  timeLog: "rh_time_v1",
  topicScore: "rh_topicScore_v1",
};
function lsGet<T>(k: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(localStorage.getItem(k) || "") as T; } catch { return fallback; }
}
function lsSet<T>(k: string, v: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(k, JSON.stringify(v));
}

function bumpStreak() {
  const today = new Date().toISOString().slice(0, 10);
  const s = lsGet<{ last: string; count: number }>(LS.streak, { last: "", count: 0 });
  if (s.last === today) return s;
  const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const next = { last: today, count: s.last === y ? s.count + 1 : 1 };
  lsSet(LS.streak, next);
  return next;
}

function logTime(tab: TabKey, ms: number) {
  const t = lsGet<Record<string, number>>(LS.timeLog, {});
  t[tab] = (t[tab] || 0) + ms;
  lsSet(LS.timeLog, t);
}

// -------- shared UI --------
function GlassCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn(
      "relative rounded-2xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/[0.04]",
      "backdrop-blur-xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)]",
      className,
    )}>{children}</div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle, right }: {
  icon: React.ComponentType<{ className?: string }>; title: string; subtitle?: string; right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-semibold tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
      <Sparkles className="mb-2 h-6 w-6 text-muted-foreground" />
      <div className="font-medium">{title}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}

function LoadingSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-xl" />
      ))}
    </div>
  );
}

// ============================= PAGE =============================
function RevisionHubPage() {
  const [tab, setTab] = useState<TabKey>("one_liner");
  const [streak, setStreak] = useState<{ last: string; count: number }>({ last: "", count: 0 });
  const startedAt = useRef<number>(Date.now());

  useEffect(() => { setStreak(bumpStreak()); }, []);
  useEffect(() => {
    startedAt.current = Date.now();
    return () => logTime(tab, Date.now() - startedAt.current);
  }, [tab]);

  return (
    <AppShell>
      <main className="relative min-h-[calc(100vh-4rem)] px-4 py-6 md:px-8 md:py-10">
        {/* aurora backdrop */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl" />
          <div className="absolute top-40 -right-16 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
        </div>

        <header className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Badge className="mb-2 border-white/20 bg-white/40 text-foreground backdrop-blur dark:bg-white/10">
                <Sparkles className="mr-1 h-3 w-3" /> Premium
              </Badge>
              <h1 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight">
                AI Revision <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">Hub</span>
              </h1>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Twelve revision engines, one glass surface — from one-liners to PYQ chains, mind maps, quizzes and analytics.
              </p>
            </div>
            <GlassCard className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                  <Flame className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Revision streak</div>
                  <div className="text-lg font-semibold leading-tight tabular-nums">{streak.count} day{streak.count === 1 ? "" : "s"}</div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Tab pills */}
          <div className="mt-6 -mx-2 overflow-x-auto pb-2">
            <div className="flex min-w-max gap-2 px-2">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={cn(
                      "group flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all",
                      active
                        ? "border-transparent bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30"
                        : "border-white/40 bg-white/50 text-foreground hover:bg-white/80 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]",
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5", active ? "" : "text-violet-500")} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        <section className="mx-auto mt-6 max-w-6xl animate-fade-in">
          {tab === "one_liner" && <OneLinerTab />}
          {tab === "pyq" && <PyqTab />}
          {tab === "static" && <StaticLinkTab />}
          {tab === "mindmap" && <MindMapTab />}
          {tab === "flashcards" && <FlashcardsTab />}
          {tab === "notes" && <NotesTab />}
          {tab === "planner" && <PlannerTab />}
          {tab === "weekly" && <WeeklyTab />}
          {tab === "monthly" && <MonthlyTab />}
          {tab === "quiz" && <QuizTab />}
          {tab === "mnemonics" && <MnemonicsTab />}
          {tab === "analytics" && <AnalyticsTab />}
        </section>
      </main>
    </AppShell>
  );
}

// ============================= TAB: ONE-LINER =============================
type OneLiner = { id: string; text: string; gs?: string; tag?: string };

function OneLinerTab() {
  const call = useServerFn(runRevisionAi);
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [gs, setGs] = useState<"all" | "GS1" | "GS2" | "GS3" | "GS4">("all");
  const [topic, setTopic] = useState("");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<OneLiner[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(20);
  const [bookmarks, setBookmarks] = useState<Record<string, OneLiner>>(() => lsGet(LS.bookmarks + ":oneliner", {}));
  const [read, setRead] = useState<Record<string, true>>(() => lsGet(LS.read + ":oneliner", {}));

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((it) => {
      if (gs !== "all" && it.gs && it.gs !== gs) return false;
      if (!needle) return true;
      return it.text.toLowerCase().includes(needle) || (it.tag || "").toLowerCase().includes(needle);
    });
  }, [items, q, gs]);

  useEffect(() => { lsSet(LS.bookmarks + ":oneliner", bookmarks); }, [bookmarks]);
  useEffect(() => { lsSet(LS.read + ":oneliner", read); }, [read]);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await call({ data: { kind: "one_liners", period, gs, topic: topic || undefined } });
      const list = ((res as any)?.data?.items as OneLiner[] | undefined) ?? [];
      setItems(list.map((it, i) => ({ ...it, id: it.id || String(i + 1) })));
      setVisible(20);
    } catch (e: any) {
      toast.error(e?.message || "Failed to generate one-liners");
    } finally {
      setLoading(false);
    }
  };

  const readPct = items.length ? Math.round((Object.keys(read).filter((id) => items.some((it) => it.id === id)).length / items.length) * 100) : 0;

  return (
    <GlassCard className="p-5 md:p-6">
      <SectionHeader
        icon={Zap}
        title="One-Liner Revision"
        subtitle="Ultra-short, exam-hitting facts. Filter, search, bookmark, and track what you've read."
        right={<Button onClick={generate} disabled={loading} className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white hover:opacity-90">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Generate
        </Button>}
      />

      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search facts, tags…" className="pl-9" />
        </div>
        <PillGroup value={period} onChange={(v) => setPeriod(v as any)} options={[["daily","Daily"],["weekly","Weekly"],["monthly","Monthly"]]} />
        <PillGroup value={gs} onChange={(v) => setGs(v as any)} options={[["all","All"],["GS1","GS1"],["GS2","GS2"],["GS3","GS3"],["GS4","GS4"]]} />
      </div>

      <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Optional topic focus (e.g. Constitutional bodies)" className="mt-3" />

      {items.length > 0 && (
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Read progress</span>
          <Progress value={readPct} className="h-1.5 flex-1" />
          <span className="tabular-nums">{readPct}%</span>
        </div>
      )}

      <div className="mt-5">
        {loading ? <LoadingSkeleton /> : filtered.length === 0 ? (
          <Empty title="No one-liners yet" hint="Pick a period, GS filter, then hit Generate." />
        ) : (
          <ul className="space-y-2">
            {filtered.slice(0, visible).map((it) => {
              const isRead = !!read[it.id];
              const isBm = !!bookmarks[it.id];
              return (
                <li key={it.id} className={cn(
                  "group flex items-start gap-3 rounded-xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] p-3 transition-all hover:scale-[1.005] hover:shadow-md",
                  isRead && "opacity-70",
                )}>
                  <button
                    onClick={() => setRead((r) => ({ ...r, [it.id]: true } as any))}
                    className={cn("mt-0.5 grid h-5 w-5 place-items-center rounded-md border", isRead ? "border-emerald-500 bg-emerald-500 text-white" : "border-border")}
                    aria-label="Mark read"
                  >
                    {isRead && <Check className="h-3 w-3" />}
                  </button>
                  <div className="flex-1 text-sm leading-snug">{it.text}</div>
                  <div className="flex flex-col items-end gap-1">
                    {it.gs && <Badge variant="secondary" className="text-[10px]">{it.gs}</Badge>}
                    <button onClick={() => setBookmarks((b) => {
                      const next = { ...b };
                      if (isBm) delete next[it.id]; else next[it.id] = it;
                      return next;
                    })} className="text-muted-foreground hover:text-amber-500">
                      {isBm ? <BookmarkCheck className="h-4 w-4 text-amber-500" /> : <Bookmark className="h-4 w-4" />}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {visible < filtered.length && (
          <div className="mt-4 grid place-items-center">
            <Button variant="outline" onClick={() => setVisible((v) => v + 20)}>Load more</Button>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

function PillGroup<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <div className="inline-flex rounded-xl border border-white/40 bg-white/60 p-1 dark:border-white/10 dark:bg-white/[0.04]">
      {options.map(([val, label]) => (
        <button
          key={val}
          onClick={() => onChange(val)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
            value === val ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow" : "text-muted-foreground hover:text-foreground",
          )}
        >{label}</button>
      ))}
    </div>
  );
}

// ============================= TAB: PYQ =============================
function PyqTab() {
  const call = useServerFn(runRevisionAi);
  const [topic, setTopic] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const generate = async () => {
    if (!topic.trim()) return toast.info("Enter a topic to analyse");
    setLoading(true);
    try {
      const res = await call({ data: { kind: "pyq", topic } });
      setItems((res as any)?.data?.items ?? []);
    } catch (e: any) { toast.error(e?.message || "Failed"); } finally { setLoading(false); }
  };
  return (
    <GlassCard className="p-5 md:p-6">
      <SectionHeader icon={Layers} title="PYQ-Based Revision" subtitle="Repeated themes with importance & current-affairs links." />
      <div className="flex flex-wrap gap-2">
        <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic (e.g. Fundamental Rights, Monsoon)" className="flex-1 min-w-[220px]" />
        <Button onClick={generate} disabled={loading} className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />} Analyse
        </Button>
      </div>
      <div className="mt-5">
        {loading ? <LoadingSkeleton /> : items.length === 0 ? <Empty title="No PYQ analysis yet" hint="Enter a topic to get repeated themes." /> : (
          <ul className="grid gap-3 md:grid-cols-2">
            {items.map((it, i) => (
              <li key={i} className="rounded-xl border border-white/40 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="secondary">{it.year}</Badge>
                  <Badge className="bg-violet-500/10 text-violet-600 dark:text-violet-300">{it.paper}</Badge>
                </div>
                <div className="mt-2 text-sm font-medium leading-snug">{it.question}</div>
                {it.why_important && <div className="mt-2 text-xs text-muted-foreground"><span className="font-semibold text-foreground">Why: </span>{it.why_important}</div>}
                {it.current_link && <div className="mt-1 text-xs text-muted-foreground"><span className="font-semibold text-foreground">Current link: </span>{it.current_link}</div>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </GlassCard>
  );
}

// ============================= TAB: STATIC ↔ CA =============================
function StaticLinkTab() {
  const call = useServerFn(runRevisionAi);
  const [topic, setTopic] = useState("");
  const [chain, setChain] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const generate = async () => {
    if (!topic.trim()) return toast.info("Enter a current news / topic");
    setLoading(true);
    try {
      const res = await call({ data: { kind: "static_link", topic } });
      setChain((res as any)?.data ?? null);
    } catch (e: any) { toast.error(e?.message || "Failed"); } finally { setLoading(false); }
  };
  const stages = chain ? [
    { label: "Current News", value: chain.news },
    { label: "Static Topic", value: chain.static_topic },
    { label: "Reference", value: chain.reference_book },
    { label: "PYQ", value: chain.pyq },
    { label: "Expected Q", value: chain.expected_question },
  ] : [];
  return (
    <GlassCard className="p-5 md:p-6">
      <SectionHeader icon={Brain} title="Static ↔ Current Affairs" subtitle="Chain a news item to syllabus, book, PYQ and expected question." />
      <div className="flex flex-wrap gap-2">
        <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Current news headline or topic" className="flex-1 min-w-[220px]" />
        <Button onClick={generate} disabled={loading} className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />} Build chain
        </Button>
      </div>
      <div className="mt-5">
        {loading ? <LoadingSkeleton rows={3} /> : !chain ? <Empty title="No chain yet" hint="Type a headline to see the static + PYQ linkage." /> : (
          <ol className="relative space-y-3 border-l-2 border-violet-500/30 pl-6">
            {stages.map((s, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[30px] top-1 grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-[11px] font-bold text-white shadow">{i + 1}</span>
                <div className="rounded-xl border border-white/40 bg-white/60 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-violet-500">{s.label}</div>
                  <div className="mt-1 text-sm">{s.value}</div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </GlassCard>
  );
}

// ============================= TAB: MIND MAP =============================
type MindNode = { name: string; children?: MindNode[] };

function MindMapTab() {
  const call = useServerFn(runRevisionAi);
  const [topic, setTopic] = useState("");
  const [tree, setTree] = useState<MindNode | null>(null);
  const [loading, setLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const generate = async () => {
    if (!topic.trim()) return toast.info("Enter a mind-map root");
    setLoading(true);
    try {
      const res = await call({ data: { kind: "mind_map", topic } });
      const d = (res as any)?.data;
      if (d?.root) setTree({ name: d.root, children: d.children || [] });
    } catch (e: any) { toast.error(e?.message || "Failed"); } finally { setLoading(false); }
  };

  const doPrint = () => window.print();
  const doPdf = async () => {
    if (!printRef.current) return;
    try {
      const { downloadPreviewAsPdf } = await import("@/lib/preview-pdf");
      await downloadPreviewAsPdf(printRef.current, `mindmap-${topic || "upsc"}`, { verifyBefore: false });
    } catch { toast.info("Use Print → Save as PDF"); window.print(); }
  };

  return (
    <GlassCard className="p-5 md:p-6">
      <SectionHeader
        icon={Sparkles}
        title="Mind Maps"
        subtitle="Interactive, expandable branches. Print or export to PDF."
        right={<div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={doPrint}><Printer className="mr-2 h-4 w-4" />Print</Button>
          <Button variant="outline" size="sm" onClick={doPdf}><Download className="mr-2 h-4 w-4" />PDF</Button>
        </div>}
      />
      <div className="flex flex-wrap gap-2">
        <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Root topic (e.g. Indian Federalism)" className="flex-1 min-w-[220px]" />
        <Button onClick={generate} disabled={loading} className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />} Generate
        </Button>
      </div>
      <div ref={printRef} className="mt-5 pdf-light-scope rounded-xl bg-white/70 p-4 dark:bg-white/[0.03]">
        {loading ? <LoadingSkeleton rows={4} /> : !tree ? <Empty title="No mind map yet" hint="Enter a topic to grow the tree." /> : (
          <MindNodeView node={tree} level={0} defaultOpen />
        )}
      </div>
    </GlassCard>
  );
}
function MindNodeView({ node, level, defaultOpen }: { node: MindNode; level: number; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const has = !!(node.children && node.children.length);
  const colors = ["from-indigo-500 to-violet-500", "from-violet-500 to-fuchsia-500", "from-fuchsia-500 to-pink-500", "from-pink-500 to-rose-500"];
  return (
    <div className={cn("relative", level > 0 && "ml-4 border-l border-dashed border-violet-400/40 pl-4")}>
      <button onClick={() => setOpen((o) => !o)} className={cn(
        "my-1 inline-flex items-center gap-2 rounded-lg px-2.5 py-1 text-sm text-white shadow",
        "bg-gradient-to-r", colors[level % colors.length],
      )}>
        {has ? (open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />) : <span className="h-1.5 w-1.5 rounded-full bg-white" />}
        {node.name}
      </button>
      {has && open && (
        <div className="animate-fade-in">
          {node.children!.map((c, i) => <MindNodeView key={i} node={c} level={level + 1} defaultOpen={level < 1} />)}
        </div>
      )}
    </div>
  );
}

// ============================= TAB: FLASHCARDS =============================
type Card = { id: string; front: string; back: string; tag?: string };
function FlashcardsTab() {
  const call = useServerFn(runRevisionAi);
  const [topic, setTopic] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bm, setBm] = useState<Record<string, Card>>(() => lsGet(LS.bookmarks + ":cards", {}));
  useEffect(() => { lsSet(LS.bookmarks + ":cards", bm); }, [bm]);

  const generate = async () => {
    if (!topic.trim()) return toast.info("Enter a topic");
    setLoading(true);
    try {
      const res = await call({ data: { kind: "flashcards", topic } });
      const list = ((res as any)?.data?.cards as Card[] | undefined) ?? [];
      setCards(list.map((c, i) => ({ ...c, id: c.id || String(i + 1) })));
      setIdx(0); setFlipped(false);
    } catch (e: any) { toast.error(e?.message || "Failed"); } finally { setLoading(false); }
  };

  const card = cards[idx];
  const swipe = (dir: 1 | -1) => {
    if (!cards.length) return;
    setFlipped(false);
    setIdx((i) => (i + dir + cards.length) % cards.length);
  };

  return (
    <GlassCard className="p-5 md:p-6">
      <SectionHeader icon={BookmarkCheck} title="Flashcards" subtitle="Swipe, flip, bookmark — build daily streaks." />
      <div className="flex flex-wrap gap-2">
        <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic" className="flex-1 min-w-[220px]" />
        <Button onClick={generate} disabled={loading} className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />} Generate
        </Button>
      </div>
      <div className="mt-6 grid place-items-center">
        {loading ? <Skeleton className="h-56 w-full max-w-md rounded-2xl" /> : !card ? <Empty title="No cards yet" hint="Generate a deck to start." /> : (
          <div className="w-full max-w-md">
            <div className="[perspective:1200px]" onClick={() => setFlipped((f) => !f)}>
              <div className={cn(
                "relative h-56 w-full rounded-2xl transition-transform duration-500 [transform-style:preserve-3d] cursor-pointer",
                flipped && "[transform:rotateY(180deg)]",
              )}>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 p-6 text-white shadow-xl [backface-visibility:hidden]">
                  {card.tag && <Badge className="bg-white/20 text-white">{card.tag}</Badge>}
                  <div className="text-center text-lg font-semibold">{card.front}</div>
                  <div className="text-xs opacity-70">Tap to flip</div>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-6 text-foreground shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <div className="text-center text-sm">{card.back}</div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Button variant="outline" onClick={() => swipe(-1)}><ChevronLeft className="mr-1 h-4 w-4" />Prev</Button>
              <div className="text-xs text-muted-foreground tabular-nums">{idx + 1} / {cards.length}</div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setBm((b) => {
                  const isBm = !!b[card.id]; const next = { ...b };
                  if (isBm) delete next[card.id]; else next[card.id] = card;
                  return next;
                })}>
                  {bm[card.id] ? <BookmarkCheck className="h-4 w-4 text-amber-500" /> : <Bookmark className="h-4 w-4" />}
                </Button>
                <Button onClick={() => swipe(1)} className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white">Next<ChevronRight className="ml-1 h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

// ============================= TAB: NOTES =============================
function NotesTab() {
  const call = useServerFn(runRevisionAi);
  const [topic, setTopic] = useState("");
  const [md, setMd] = useState("");
  const [loading, setLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const generate = async () => {
    if (!topic.trim()) return toast.info("Enter a topic");
    setLoading(true);
    try {
      const res = await call({ data: { kind: "notes", topic } });
      setMd((res as any)?.markdown || "");
    } catch (e: any) { toast.error(e?.message || "Failed"); } finally { setLoading(false); }
  };
  const doPdf = async () => {
    if (!printRef.current) return;
    try {
      const { downloadPreviewAsPdf } = await import("@/lib/preview-pdf");
      await downloadPreviewAsPdf(printRef.current, `notes-${topic || "upsc"}`, { verifyBefore: false });
    } catch { window.print(); }
  };
  return (
    <GlassCard className="p-5 md:p-6">
      <SectionHeader icon={NotebookPen} title="Revision Notes" subtitle="Handwritten-style, bullet-first, UPSC-focused."
        right={<Button variant="outline" size="sm" onClick={doPdf} disabled={!md}><Download className="mr-2 h-4 w-4" />PDF</Button>} />
      <div className="flex flex-wrap gap-2">
        <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic (e.g. Directive Principles)" className="flex-1 min-w-[220px]" />
        <Button onClick={generate} disabled={loading} className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />} Generate
        </Button>
      </div>
      <div ref={printRef} className="pdf-light-scope mt-5 rounded-xl bg-[#fffdf3] p-5 shadow-inner">
        {loading ? <LoadingSkeleton rows={5} /> : !md ? <Empty title="No notes yet" hint="Enter a topic and generate." /> : (
          <article className="prose prose-sm max-w-none font-serif prose-headings:font-serif prose-p:leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
          </article>
        )}
      </div>
    </GlassCard>
  );
}

// ============================= TAB: PLANNER =============================
function PlannerTab() {
  const call = useServerFn(runRevisionAi);
  const [topic, setTopic] = useState("");
  const [blocks, setBlocks] = useState<any[]>([]);
  const [done, setDone] = useState<Record<string, boolean>>(() => lsGet(LS.read + ":planner", {}));
  const [loading, setLoading] = useState(false);
  useEffect(() => { lsSet(LS.read + ":planner", done); }, [done]);
  const generate = async () => {
    setLoading(true);
    try {
      const res = await call({ data: { kind: "planner", topic: topic || undefined } });
      setBlocks(((res as any)?.data?.blocks as any[]) || []);
    } catch (e: any) { toast.error(e?.message || "Failed"); } finally { setLoading(false); }
  };
  const total = blocks.length;
  const doneCount = blocks.filter((b) => done[b.id]).length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  return (
    <GlassCard className="p-5 md:p-6">
      <SectionHeader icon={CalendarDays} title="Daily Revision Planner" subtitle="AI schedules your day. Tick as you go." />
      <div className="flex flex-wrap gap-2">
        <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Focus (optional, e.g. Polity + Environment)" className="flex-1 min-w-[220px]" />
        <Button onClick={generate} disabled={loading} className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />} Plan today
        </Button>
      </div>
      {total > 0 && (
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Today's progress</span><Progress value={pct} className="h-1.5 flex-1" /><span className="tabular-nums">{pct}%</span>
        </div>
      )}
      <div className="mt-4">
        {loading ? <LoadingSkeleton rows={5} /> : total === 0 ? <Empty title="No plan yet" hint="Generate today's schedule." /> : (
          <ul className="space-y-2">
            {blocks.map((b) => (
              <li key={b.id} className={cn("flex items-start gap-3 rounded-xl border border-white/40 bg-white/60 p-3 dark:border-white/10 dark:bg-white/[0.03]", done[b.id] && "opacity-60")}>
                <button onClick={() => setDone((d) => ({ ...d, [b.id]: !d[b.id] }))} className={cn("mt-0.5 grid h-5 w-5 place-items-center rounded-md border", done[b.id] ? "border-emerald-500 bg-emerald-500 text-white" : "border-border")}>
                  {done[b.id] && <Check className="h-3 w-3" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="secondary">{b.time}</Badge>
                    {b.gs && <Badge className="bg-violet-500/10 text-violet-600 dark:text-violet-300">{b.gs}</Badge>}
                  </div>
                  <div className="mt-1 text-sm font-medium">{b.topic}</div>
                  {b.goal && <div className="text-xs text-muted-foreground">{b.goal}</div>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </GlassCard>
  );
}

// ============================= TAB: WEEKLY =============================
function WeeklyTab() {
  const call = useServerFn(runRevisionAi);
  const [topic, setTopic] = useState("");
  const [payload, setPayload] = useState<{ summary_md?: string; quiz?: any[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const generate = async () => {
    setLoading(true);
    try {
      const res = await call({ data: { kind: "weekly", topic: topic || undefined } });
      setPayload((res as any)?.data ?? null); setAnswers({});
    } catch (e: any) { toast.error(e?.message || "Failed"); } finally { setLoading(false); }
  };
  return (
    <GlassCard className="p-5 md:p-6">
      <SectionHeader icon={CalendarRange} title="Weekly Revision" subtitle="Summary + quick quiz for the week." />
      <div className="flex flex-wrap gap-2">
        <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Focus (optional)" className="flex-1 min-w-[220px]" />
        <Button onClick={generate} disabled={loading} className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />} Summarise week
        </Button>
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="rounded-xl border border-white/40 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-500">Summary</div>
          {loading ? <LoadingSkeleton rows={4} /> : !payload?.summary_md ? <Empty title="No summary yet" /> : (
            <article className="prose prose-sm max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]}>{payload.summary_md}</ReactMarkdown></article>
          )}
        </div>
        <div className="rounded-xl border border-white/40 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-500">Quiz</div>
          {loading ? <LoadingSkeleton rows={4} /> : !payload?.quiz?.length ? <Empty title="No quiz yet" /> : (
            <QuizList items={payload.quiz} answers={answers} setAnswers={setAnswers} />
          )}
        </div>
      </div>
    </GlassCard>
  );
}
function QuizList({ items, answers, setAnswers }: { items: any[]; answers: Record<number, number>; setAnswers: (v: Record<number, number>) => void }) {
  return (
    <ol className="space-y-4">
      {items.map((qq, i) => {
        const picked = answers[i];
        const correct = qq.answer;
        return (
          <li key={i}>
            <div className="text-sm font-medium">{i + 1}. {qq.q}</div>
            <div className="mt-2 grid gap-1.5">
              {(qq.options || []).map((opt: string, k: number) => {
                const isPicked = picked === k;
                const isCorrect = picked !== undefined && k === correct;
                const isWrong = isPicked && k !== correct;
                return (
                  <button key={k} onClick={() => setAnswers({ ...answers, [i]: k })} disabled={picked !== undefined}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-left text-sm transition-all",
                      picked === undefined && "hover:bg-muted",
                      isCorrect && "border-emerald-500 bg-emerald-500/10",
                      isWrong && "border-rose-500 bg-rose-500/10",
                    )}>
                    <span className="mr-2 text-xs font-bold text-muted-foreground">{String.fromCharCode(65 + k)}.</span>{opt}
                  </button>
                );
              })}
            </div>
            {picked !== undefined && qq.explain && (
              <div className="mt-2 rounded-md bg-muted/40 p-2 text-xs text-muted-foreground">💡 {qq.explain}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

// ============================= TAB: MONTHLY =============================
function MonthlyTab() {
  const call = useServerFn(runRevisionAi);
  const [topic, setTopic] = useState("");
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const generate = async () => {
    setLoading(true);
    try {
      const res = await call({ data: { kind: "monthly", topic: topic || undefined } });
      setSections(((res as any)?.data?.sections as any[]) || []);
    } catch (e: any) { toast.error(e?.message || "Failed"); } finally { setLoading(false); }
  };
  return (
    <GlassCard className="p-5 md:p-6">
      <SectionHeader icon={CalendarClock} title="Monthly Revision" subtitle="Compiled current affairs across GS domains." />
      <div className="flex flex-wrap gap-2">
        <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Focus (optional)" className="flex-1 min-w-[220px]" />
        <Button onClick={generate} disabled={loading} className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />} Compile month
        </Button>
      </div>
      <div className="mt-5">
        {loading ? <LoadingSkeleton rows={6} /> : sections.length === 0 ? <Empty title="No compilation yet" /> : (
          <div className="grid gap-3 md:grid-cols-2">
            {sections.map((s, i) => (
              <div key={i} className="rounded-xl border border-white/40 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="mb-2 flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  <div className="font-semibold">{s.title}</div>
                </div>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {(s.points || []).map((p: string, k: number) => <li key={k}>{p}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

// ============================= TAB: QUIZ =============================
function QuizTab() {
  const call = useServerFn(runRevisionAi);
  const [mode, setMode] = useState<"prelims" | "mains" | "evaluate">("prelims");
  const [topic, setTopic] = useState("");
  const [prelims, setPrelims] = useState<any[]>([]);
  const [mains, setMains] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [evalQ, setEvalQ] = useState("");
  const [evalA, setEvalA] = useState("");
  const [evalRes, setEvalRes] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      if (mode === "prelims") {
        if (!topic.trim()) return toast.info("Enter a topic");
        const res = await call({ data: { kind: "quiz_prelims", topic } });
        setPrelims(((res as any)?.data?.items as any[]) || []); setAnswers({});
      } else if (mode === "mains") {
        if (!topic.trim()) return toast.info("Enter a topic");
        const res = await call({ data: { kind: "quiz_mains", topic } });
        setMains(((res as any)?.data?.items as any[]) || []);
      } else {
        if (!evalQ.trim() || !evalA.trim()) return toast.info("Enter question and your answer");
        const res = await call({ data: { kind: "evaluate_answer", question: evalQ, answer: evalA } });
        setEvalRes((res as any)?.data ?? null);
      }
    } catch (e: any) { toast.error(e?.message || "Failed"); } finally { setLoading(false); }
  };

  return (
    <GlassCard className="p-5 md:p-6">
      <SectionHeader icon={HelpCircle} title="AI Quiz" subtitle="Unlimited Prelims MCQs, Mains questions, and answer evaluation." />
      <div className="flex flex-wrap items-center gap-2">
        <PillGroup value={mode} onChange={(v) => setMode(v as any)} options={[["prelims","Prelims MCQ"],["mains","Mains Q"],["evaluate","Evaluate Answer"]]} />
        {mode !== "evaluate" ? (
          <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic" className="flex-1 min-w-[220px]" />
        ) : null}
        <Button onClick={run} disabled={loading} className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />} {mode === "evaluate" ? "Evaluate" : "Generate"}
        </Button>
      </div>

      <div className="mt-5">
        {loading ? <LoadingSkeleton rows={5} /> : (
          <>
            {mode === "prelims" && (prelims.length === 0 ? <Empty title="No MCQs yet" /> : <QuizList items={prelims} answers={answers} setAnswers={setAnswers} />)}
            {mode === "mains" && (mains.length === 0 ? <Empty title="No Mains questions yet" /> : (
              <ol className="space-y-3">
                {mains.map((q, i) => (
                  <li key={i} className="rounded-xl border border-white/40 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                    <div className="flex items-center gap-2 text-xs">
                      <Badge className="bg-violet-500/10 text-violet-600 dark:text-violet-300">{q.paper}</Badge>
                      <Badge variant="secondary">{q.words} words</Badge>
                    </div>
                    <div className="mt-2 text-sm font-medium">{i + 1}. {q.question}</div>
                    {q.hint && <div className="mt-1 text-xs text-muted-foreground">Hint: {q.hint}</div>}
                  </li>
                ))}
              </ol>
            ))}
            {mode === "evaluate" && (
              <div className="grid gap-3">
                <Input value={evalQ} onChange={(e) => setEvalQ(e.target.value)} placeholder="Mains question" />
                <Textarea value={evalA} onChange={(e) => setEvalA(e.target.value)} placeholder="Paste your answer…" rows={8} />
                {evalRes && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold text-emerald-600">{evalRes.score}<span className="text-sm text-muted-foreground">/{evalRes.max}</span></div>
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      <div><div className="text-xs font-semibold text-emerald-600">Strengths</div><ul className="mt-1 list-disc pl-4 text-xs">{(evalRes.strengths||[]).map((s:string,i:number)=><li key={i}>{s}</li>)}</ul></div>
                      <div><div className="text-xs font-semibold text-rose-600">Gaps</div><ul className="mt-1 list-disc pl-4 text-xs">{(evalRes.gaps||[]).map((s:string,i:number)=><li key={i}>{s}</li>)}</ul></div>
                    </div>
                    {evalRes.model_answer_md && (
                      <div className="mt-3">
                        <div className="text-xs font-semibold text-violet-600">Model answer</div>
                        <article className="prose prose-sm max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]}>{evalRes.model_answer_md}</ReactMarkdown></article>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </GlassCard>
  );
}

// ============================= TAB: MNEMONICS =============================
function MnemonicsTab() {
  const call = useServerFn(runRevisionAi);
  const [topic, setTopic] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const generate = async () => {
    if (!topic.trim()) return toast.info("Enter a topic");
    setLoading(true);
    try {
      const res = await call({ data: { kind: "mnemonics", topic } });
      setItems(((res as any)?.data?.items as any[]) || []);
    } catch (e: any) { toast.error(e?.message || "Failed"); } finally { setLoading(false); }
  };
  const styles: Record<string, string> = {
    acronym: "from-indigo-500 to-violet-500",
    mnemonic: "from-violet-500 to-fuchsia-500",
    visual: "from-fuchsia-500 to-pink-500",
    story: "from-amber-500 to-orange-500",
  };
  return (
    <GlassCard className="p-5 md:p-6">
      <SectionHeader icon={Lightbulb} title="Memory Tricks" subtitle="Mnemonics, acronyms, visuals, story-based learning." />
      <div className="flex flex-wrap gap-2">
        <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic (e.g. Fundamental Duties)" className="flex-1 min-w-[220px]" />
        <Button onClick={generate} disabled={loading} className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />} Generate
        </Button>
      </div>
      <div className="mt-5">
        {loading ? <LoadingSkeleton rows={4} /> : items.length === 0 ? <Empty title="No memory tricks yet" /> : (
          <div className="grid gap-3 md:grid-cols-2">
            {items.map((it, i) => (
              <div key={i} className="rounded-xl border border-white/40 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <div className={cn("inline-block rounded-md bg-gradient-to-r px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white", styles[it.kind] || "from-slate-500 to-slate-700")}>{it.kind}</div>
                <div className="mt-2 text-lg font-bold">{it.trigger}</div>
                {it.expansion && <div className="text-sm text-muted-foreground">{it.expansion}</div>}
                {it.story && <div className="mt-2 text-xs italic text-muted-foreground">"{it.story}"</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

// ============================= TAB: ANALYTICS =============================
function AnalyticsTab() {
  const [time, setTime] = useState<Record<string, number>>({});
  const [streak, setStreak] = useState<{ last: string; count: number }>({ last: "", count: 0 });
  const [bmCount, setBmCount] = useState(0);
  const [readCount, setReadCount] = useState(0);

  useEffect(() => {
    setTime(lsGet(LS.timeLog, {} as Record<string, number>));
    setStreak(lsGet(LS.streak, { last: "", count: 0 }));
    const bm1 = Object.keys(lsGet(LS.bookmarks + ":oneliner", {} as any)).length;
    const bm2 = Object.keys(lsGet(LS.bookmarks + ":cards", {} as any)).length;
    setBmCount(bm1 + bm2);
    setReadCount(Object.keys(lsGet(LS.read + ":oneliner", {} as any)).length);
  }, []);

  const total = Object.values(time).reduce((a, b) => a + b, 0);
  const sorted = Object.entries(time).sort((a, b) => b[1] - a[1]);
  const strong = sorted.slice(0, 3).map(([k]) => k);
  const weak = TABS.map((t) => t.key).filter((k) => !time[k] || time[k] < 60_000).slice(0, 3);

  const fmt = (ms: number) => {
    const m = Math.floor(ms / 60000); const s = Math.floor((ms % 60000) / 1000);
    return m ? `${m}m ${s}s` : `${s}s`;
  };

  const reset = () => {
    ["timeLog","streak","read","bookmarks"].forEach((_) => {});
    localStorage.removeItem(LS.timeLog);
    localStorage.removeItem(LS.streak);
    localStorage.removeItem(LS.read + ":oneliner");
    localStorage.removeItem(LS.read + ":planner");
    localStorage.removeItem(LS.bookmarks + ":oneliner");
    localStorage.removeItem(LS.bookmarks + ":cards");
    setTime({}); setStreak({ last: "", count: 0 }); setBmCount(0); setReadCount(0);
    toast.success("Reset analytics");
  };

  return (
    <GlassCard className="p-5 md:p-6">
      <SectionHeader icon={BarChart3} title="Revision Analytics" subtitle="Time, strong & weak areas, AI recommendations."
        right={<Button variant="outline" size="sm" onClick={reset}><RotateCcw className="mr-2 h-4 w-4" />Reset</Button>} />

      <div className="grid gap-3 md:grid-cols-4">
        <StatCard label="Total time" value={fmt(total)} accent="from-indigo-500 to-violet-500" />
        <StatCard label="Streak" value={`${streak.count}d`} accent="from-amber-500 to-orange-500" />
        <StatCard label="Bookmarks" value={String(bmCount)} accent="from-fuchsia-500 to-pink-500" />
        <StatCard label="Facts read" value={String(readCount)} accent="from-emerald-500 to-teal-500" />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/40 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-violet-500">Time by module</div>
          {sorted.length === 0 ? <Empty title="No activity yet" hint="Use any tab to start tracking." /> : (
            <ul className="space-y-2">
              {sorted.map(([k, v]) => {
                const label = TABS.find((t) => t.key === k)?.label || k;
                const pct = total ? Math.round((v / total) * 100) : 0;
                return (
                  <li key={k}>
                    <div className="flex items-center justify-between text-xs"><span>{label}</span><span className="tabular-nums text-muted-foreground">{fmt(v)}</span></div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" style={{ width: `${pct}%` }} /></div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="rounded-xl border border-white/40 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-violet-500">AI recommendations</div>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-xs font-semibold text-emerald-600">Strong</div>
              <div className="mt-1 flex flex-wrap gap-1">{strong.length ? strong.map((k) => <Badge key={k} className="bg-emerald-500/10 text-emerald-600">{TABS.find((t)=>t.key===k)?.label||k}</Badge>) : <span className="text-xs text-muted-foreground">Not enough data</span>}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-rose-600">Needs work</div>
              <div className="mt-1 flex flex-wrap gap-1">{weak.map((k) => <Badge key={k} className="bg-rose-500/10 text-rose-600">{TABS.find((t)=>t.key===k)?.label||k}</Badge>)}</div>
            </div>
            <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
              Tip: revise weak modules for 15 minutes today to keep your streak growing.
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/40 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <div className={cn("absolute -right-6 -top-6 h-16 w-16 rounded-full bg-gradient-to-br opacity-70 blur-xl", accent)} />
      <div className="relative">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
      </div>
    </div>
  );
}