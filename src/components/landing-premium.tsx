import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  BookOpen,
  Brain,
  PenLine,
  BarChart3,
  Target,
  Sparkles,
  MessageSquare,
  FileText,
  Layers,
  Network,
  Mic,
  Globe2,
  Landmark,
  Leaf,
  Atom,
  Coins,
  ScrollText,
  ListChecks,
  Bot,
  User,
  Star,
  Check,
  ChevronDown,
  Play,
  ArrowRight,
  Rocket,
  ShieldCheck,
  Zap,
  Newspaper,
  Send,
  Youtube,
  Instagram,
  Linkedin,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------- Aurora Backdrop ----------------

export function AuroraBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 left-1/2 h-[700px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.35),transparent_60%)] blur-3xl" />
      <div className="absolute top-1/3 -left-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.30),transparent_60%)] blur-3xl animate-[auroraA_14s_ease-in-out_infinite]" />
      <div className="absolute top-1/2 -right-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.28),transparent_60%)] blur-3xl animate-[auroraB_16s_ease-in-out_infinite]" />
      <div className="absolute bottom-0 left-1/3 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.25),transparent_60%)] blur-3xl animate-[auroraC_18s_ease-in-out_infinite]" />
      <div
        className="absolute inset-0 opacity-[0.08] dark:opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.35) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      {Array.from({ length: 22 }).map((_, i) => (
        <span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-white/80 shadow-[0_0_12px_2px_rgba(147,197,253,0.7)]"
          style={{
            top: `${(i * 41) % 100}%`,
            left: `${(i * 67) % 100}%`,
            animation: `particleFloat ${8 + (i % 6)}s ease-in-out ${i * 0.25}s infinite alternate`,
            opacity: 0.5,
          }}
        />
      ))}
      <style>{`
        @keyframes auroraA { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,-30px) scale(1.1)} }
        @keyframes auroraB { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-50px,20px) scale(1.15)} }
        @keyframes auroraC { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-40px) scale(1.1)} }
        @keyframes particleFloat { from{transform:translateY(0);opacity:.3} to{transform:translateY(-30px);opacity:.9} }
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes floatYRev { 0%,100%{transform:translateY(0)} 50%{transform:translateY(14px)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes spinSlow { to{transform:rotate(360deg)} }
        @keyframes typing { from{width:0} to{width:100%} }
        @keyframes blink { 50%{opacity:0} }
        @keyframes glowPulse { 0%,100%{box-shadow:0 0 30px rgba(37,99,235,.35),0 0 60px rgba(124,58,237,.25)} 50%{box-shadow:0 0 45px rgba(37,99,235,.6),0 0 90px rgba(124,58,237,.4)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .fade-up { animation: fadeUp .8s ease-out both; }
      `}</style>
    </div>
  );
}

// ---------------- Rotating placeholder input ----------------

const PLACEHOLDERS = [
  "Ask about Indian Polity…",
  "Explain Fundamental Rights…",
  "Prepare today's Current Affairs…",
  "Generate an Ethics answer…",
  "Solve CSAT questions…",
  "Summarise The Hindu editorial…",
];

export function useRotatingPlaceholder() {
  const [text, setText] = useState("");
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">("typing");

  useEffect(() => {
    const current = PLACEHOLDERS[i % PLACEHOLDERS.length];
    let t: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      if (text.length < current.length) {
        t = setTimeout(() => setText(current.slice(0, text.length + 1)), 55);
      } else {
        t = setTimeout(() => setPhase("pausing"), 1400);
      }
    } else if (phase === "pausing") {
      t = setTimeout(() => setPhase("deleting"), 400);
    } else {
      if (text.length > 0) {
        t = setTimeout(() => setText(current.slice(0, text.length - 1)), 25);
      } else {
        setI((v) => v + 1);
        setPhase("typing");
      }
    }
    return () => clearTimeout(t);
  }, [text, phase, i]);

  return text;
}

// ---------------- Hero Right: AI mentor + floating cards ----------------

export function AiMentorArt() {
  const cards = [
    { icon: BookOpen, label: "Current Affairs", top: "6%", left: "-4%", d: 0 },
    { icon: Brain, label: "AI Mentor", top: "0%", right: "-6%", d: 1 },
    { icon: PenLine, label: "Answer Writing", top: "58%", left: "-8%", d: 2 },
    { icon: BarChart3, label: "Performance", top: "62%", right: "-10%", d: 3 },
    { icon: Target, label: "Daily Planner", top: "30%", right: "-14%", d: 1.5 },
  ] as const;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      {/* Orbits */}
      <div className="absolute inset-4 rounded-full border border-white/10" style={{ animation: "spinSlow 40s linear infinite" }} />
      <div className="absolute inset-10 rounded-full border border-white/5" style={{ animation: "spinSlow 60s linear infinite reverse" }} />

      {/* Core glow orb */}
      <div
        className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#2563EB] via-[#7C3AED] to-[#F97316] p-[2px]"
        style={{ animation: "glowPulse 4s ease-in-out infinite" }}
      >
        <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950/90 backdrop-blur-xl">
          <div className="text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <div className="mt-2 bg-gradient-to-r from-blue-300 via-fuchsia-300 to-amber-300 bg-clip-text text-sm font-bold tracking-wide text-transparent">
              GENIUS AI
            </div>
            <div className="mt-0.5 text-[10px] uppercase tracking-widest text-white/50">Mentor Online</div>
          </div>
        </div>
      </div>

      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className="absolute rounded-2xl border border-white/15 bg-white/10 px-3 py-2 shadow-[0_10px_40px_-10px_rgba(37,99,235,0.6)] backdrop-blur-xl"
            style={{
              top: c.top,
              left: (c as any).left,
              right: (c as any).right,
              animation: `${idx % 2 ? "floatYRev" : "floatY"} ${5 + idx}s ease-in-out ${c.d}s infinite`,
            }}
          >
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-xs font-semibold text-white/90 whitespace-nowrap">{c.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------- Section title ----------------

function SectionTitle({ eyebrow, title, sub }: { eyebrow: string; title: ReactNode; sub?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-300 backdrop-blur">
        <Sparkles className="h-3 w-3" /> {eyebrow}
      </span>
      <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {sub && <p className="mx-auto mt-3 max-w-xl text-sm text-white/60 sm:text-base">{sub}</p>}
    </div>
  );
}

// ---------------- Features grid ----------------

const FEATURES = [
  { icon: Brain, title: "AI Tutor", desc: "24×7 personalised mentor for every UPSC subject." },
  { icon: PenLine, title: "AI Answer Evaluator", desc: "Model-grade evaluation with structure & content feedback." },
  { icon: Newspaper, title: "AI Current Affairs", desc: "Daily briefings mapped to GS-I to GS-IV syllabus." },
  { icon: FileText, title: "AI Notes Generator", desc: "Convert any PDF or editorial into crisp syllabus notes." },
  { icon: BarChart3, title: "AI PYQ Analyzer", desc: "10+ years of PYQs decoded, topic-wise & trend-wise." },
  { icon: ListChecks, title: "AI Test Series", desc: "Auto-generated MCQs and mocks with instant analysis." },
  { icon: Layers, title: "AI Flashcards", desc: "Spaced-repetition cards from your own material." },
  { icon: Network, title: "AI Mind Maps", desc: "Visualise interlinkages across GS papers instantly." },
];

export function FeaturesGrid() {
  return (
    <section className="relative mt-24">
      <SectionTitle
        eyebrow="Features"
        title={<>Everything you need to <span className="blast-word">Susu</span> UPSC</>}
        sub="Premium AI-native tools designed by aspirants, for aspirants."
      />
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:shadow-[0_20px_60px_-20px_rgba(124,58,237,0.6)]"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-[#2563EB]/30 to-[#7C3AED]/20 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] via-[#7C3AED] to-[#F97316] text-white shadow-lg">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-white">{f.title}</h3>
                <p className="mt-1.5 text-sm text-white/60">{f.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ---------------- AI Chat Demo + Dashboard ----------------

function TypedLine({ text, delay = 0, speed = 22 }: { text: string; delay?: number; speed?: number }) {
  const [out, setOut] = useState("");
  useEffect(() => {
    let i = 0;
    const start = setTimeout(() => {
      const t = setInterval(() => {
        i++;
        setOut(text.slice(0, i));
        if (i >= text.length) clearInterval(t);
      }, speed);
    }, delay);
    return () => clearTimeout(start);
  }, [text, delay, speed]);
  return <>{out}</>;
}

export function ChatDemoSection() {
  return (
    <section className="relative mt-24">
      <SectionTitle
        eyebrow="Live AI Demo"
        title="Talk to your AI Mentor"
        sub="See how Genius AI explains, evaluates and plans — in real time."
      />
      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_1fr]">
        {/* Chat */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 backdrop-blur-xl sm:p-6">
          <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-xs font-medium text-white/60">Genius AI · Mentor</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white">
                <User className="h-4 w-4" />
              </span>
              <div className="max-w-md rounded-2xl rounded-tl-sm bg-white/[0.06] px-4 py-2.5 text-sm text-white/90">
                Explain Directive Principles.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white">
                <Bot className="h-4 w-4" />
              </span>
              <div className="max-w-md rounded-2xl rounded-tl-sm bg-gradient-to-br from-[#2563EB]/20 to-[#7C3AED]/10 px-4 py-3 text-sm leading-relaxed text-white/90 backdrop-blur">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-blue-300">GS-II · Polity</div>
                <div>
                  <TypedLine text="Directive Principles (Part IV, Arts 36–51) are non-justiciable guidelines for the State to secure socio-economic justice — inspired by the Irish Constitution." />
                </div>
                <ul className="mt-2 list-inside list-disc space-y-1 text-white/70">
                  <li>Classification: Socialistic · Gandhian · Liberal-Intellectual</li>
                  <li>Key Articles: 39, 39A, 40, 41, 43, 44, 45, 48A, 51</li>
                  <li>DPSP vs FR: Minerva Mills (1980) established harmony</li>
                </ul>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white">
                <User className="h-4 w-4" />
              </span>
              <div className="max-w-md rounded-2xl rounded-tl-sm bg-white/[0.06] px-4 py-2.5 text-sm text-white/90">
                Give me a PYQ on this.
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white">
                <Bot className="h-4 w-4" />
              </span>
              <div className="flex gap-1 rounded-2xl bg-white/[0.06] px-4 py-3">
                <span className="h-2 w-2 animate-bounce rounded-full bg-white/70" style={{ animationDelay: "0s" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-white/70" style={{ animationDelay: "0.15s" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-white/70" style={{ animationDelay: "0.3s" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-semibold text-white">Today's Snapshot</div>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">On Track</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-1 rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
              <ProgressRing value={78} />
              <div className="mt-2 text-xs text-white/60">Syllabus</div>
            </div>
            <div className="col-span-1 space-y-2">
              {[
                { s: "Polity", v: 92, c: "from-blue-500 to-indigo-500" },
                { s: "Economy", v: 71, c: "from-fuchsia-500 to-pink-500" },
                { s: "Environ.", v: 64, c: "from-emerald-500 to-teal-500" },
                { s: "Ethics", v: 55, c: "from-amber-500 to-orange-500" },
              ].map((r) => (
                <div key={r.s}>
                  <div className="mb-1 flex justify-between text-[11px] text-white/70">
                    <span>{r.s}</span><span>{r.v}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className={`h-full rounded-full bg-gradient-to-r ${r.c}`} style={{ width: `${r.v}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center justify-between text-xs text-white/70">
                <span>Today's Tasks</span><span className="text-emerald-300">3 / 5 done</span>
              </div>
              <ul className="space-y-1.5 text-xs text-white/80">
                {[
                  ["The Hindu Editorial · Notes", true],
                  ["Polity · 20 MCQs", true],
                  ["Answer Writing · Ethics case", true],
                  ["Revision · Modern History", false],
                  ["Mock Test · GS-1 Sectional", false],
                ].map(([t, done]) => (
                  <li key={t as string} className="flex items-center gap-2">
                    <span className={cn(
                      "grid h-4 w-4 place-items-center rounded-md border",
                      done ? "border-emerald-400 bg-emerald-500/30 text-emerald-200" : "border-white/20"
                    )}>{done ? <Check className="h-2.5 w-2.5" /> : null}</span>
                    <span className={cn(done && "line-through opacity-60")}>{t as string}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 text-xs text-white/70">Performance · last 7 mocks</div>
              <MiniBars values={[42, 55, 61, 58, 72, 78, 84]} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProgressRing({ value }: { value: number }) {
  const r = 32;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <div className="relative mx-auto h-20 w-20">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle cx="40" cy="40" r={r} stroke="rgba(255,255,255,0.12)" strokeWidth="8" fill="none" />
        <circle cx="40" cy="40" r={r} stroke="url(#pg)" strokeWidth="8" fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" />
        <defs>
          <linearGradient id="pg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center text-sm font-bold text-white">{value}%</div>
    </div>
  );
}

function MiniBars({ values }: { values: number[] }) {
  const max = Math.max(...values);
  return (
    <div className="flex h-16 items-end gap-1.5">
      {values.map((v, i) => (
        <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-[#2563EB] via-[#7C3AED] to-[#F97316]"
          style={{ height: `${(v / max) * 100}%` }} />
      ))}
    </div>
  );
}

// ---------------- Learning Roadmap ----------------

const ROADMAP = ["Foundation", "NCERT", "Standard Books", "Prelims", "Mains", "Interview"];

export function RoadmapSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)));
      setActive(Math.min(ROADMAP.length - 1, Math.floor(progress * ROADMAP.length)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <section className="relative mt-24" ref={ref}>
      <SectionTitle eyebrow="Roadmap" title="Your journey, mapped by AI" sub="A guided path from Day 1 to Interview — powered by AI planning." />
      <div className="relative mt-12 overflow-x-auto pb-4">
        <div className="relative mx-auto flex min-w-[720px] max-w-5xl items-center justify-between px-4">
          <div className="absolute left-6 right-6 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/10" />
          <div
            className="absolute left-6 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#F97316] transition-all duration-500"
            style={{ width: `calc((100% - 3rem) * ${active / (ROADMAP.length - 1)})` }}
          />
          {ROADMAP.map((step, i) => {
            const on = i <= active;
            return (
              <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "grid h-12 w-12 place-items-center rounded-full border-2 text-sm font-bold transition-all",
                    on
                      ? "border-transparent bg-gradient-to-br from-[#2563EB] via-[#7C3AED] to-[#F97316] text-white shadow-[0_0_25px_rgba(124,58,237,0.6)]"
                      : "border-white/20 bg-slate-900/60 text-white/50 backdrop-blur"
                  )}
                >
                  {i + 1}
                </div>
                <div className={cn("text-xs font-semibold", on ? "text-white" : "text-white/50")}>{step}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ---------------- AI Tools Grid ----------------

const TOOLS = [
  { icon: Newspaper, name: "Current Affairs AI" },
  { icon: PenLine, name: "Essay AI" },
  { icon: ShieldCheck, name: "Ethics AI" },
  { icon: Globe2, name: "Geography AI" },
  { icon: Coins, name: "Economy AI" },
  { icon: Landmark, name: "History AI" },
  { icon: Atom, name: "Science AI" },
  { icon: Leaf, name: "Environment AI" },
  { icon: ScrollText, name: "Optional AI" },
  { icon: BarChart3, name: "PYQ AI" },
  { icon: Target, name: "Revision Planner" },
  { icon: Layers, name: "Flashcards" },
  { icon: Network, name: "Mind Maps" },
  { icon: Mic, name: "Voice Mentor" },
];

export function ToolsGrid() {
  return (
    <section className="relative mt-24">
      <SectionTitle eyebrow="AI Tools" title="A studio full of AI, built for UPSC" />
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        {TOOLS.map((t) => {
          const Icon = t.icon;
          return (
            <div
              key={t.name}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-white/25 hover:shadow-[0_15px_40px_-15px_rgba(37,99,235,0.6)]"
            >
              <span className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB]/80 to-[#7C3AED]/80 text-white transition-transform group-hover:scale-110">
                <Icon className="h-5 w-5" />
              </span>
              <div className="mt-2 text-[11px] font-semibold text-white/85">{t.name}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ---------------- Counters ----------------

function useCountUp(target: number, active: boolean, duration = 1500) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return v;
}

export function CountersSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setSeen(true)), { threshold: 0.3 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const a = useCountUp(100, seen);
  const b = useCountUp(10, seen);
  const c = useCountUp(500, seen);
  const d = useCountUp(99, seen);
  const stats = [
    { v: `${a}K+`, l: "Students" },
    { v: `${b}M+`, l: "Questions Solved" },
    { v: `${c}K+`, l: "Answers Evaluated" },
    { v: `${d}%`, l: "Student Satisfaction" },
  ];
  return (
    <section ref={ref} className="relative mt-24">
      <div className="grid grid-cols-2 gap-4 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-xl sm:p-8 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="text-center">
            <div className="bg-gradient-to-br from-blue-300 via-fuchsia-300 to-amber-300 bg-clip-text font-serif text-3xl font-black text-transparent sm:text-4xl md:text-5xl">
              {s.v}
            </div>
            <div className="mt-1 text-xs font-medium uppercase tracking-widest text-white/60">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------- Testimonials ----------------

const TESTIMONIALS = [
  { n: "Ananya S.", r: "AIR 87 · CSE 2024", q: "Genius AI turned my scattered notes into a syllabus-mapped structure. The PYQ analysis was a game-changer for prelims." },
  { n: "Rohan V.", r: "Mains 2024 qualified", q: "The AI evaluator gave me the exact kind of feedback my mentor would — but instantly, at 2 AM." },
  { n: "Priya M.", r: "OPSC Aspirant", q: "The Odisha PCS digest saves me two hours every day. Points are exam-ready." },
  { n: "Kabir D.", r: "GS Optional · PSIR", q: "Mind maps + flashcards helped me connect Polity with IR seamlessly." },
  { n: "Meera R.", r: "Interview 2023", q: "Mock interview simulations were shockingly close to the real board." },
];

export function Testimonials() {
  return (
    <section className="relative mt-24">
      <SectionTitle eyebrow="Success Stories" title="Loved by aspirants across India" />
      <div className="mt-10 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max gap-4" style={{ animation: "marquee 40s linear infinite" }}>
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
            <div key={i} className="w-[320px] shrink-0 rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-sm font-bold text-white">
                  {t.n.split(" ").map((x) => x[0]).join("")}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{t.n}</div>
                  <div className="text-[11px] text-white/60">{t.r}</div>
                </div>
              </div>
              <div className="mt-3 flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, k) => <Star key={k} className="h-3.5 w-3.5 fill-amber-400" />)}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-white/80">"{t.q}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------- Pricing ----------------

const PLANS = [
  { name: "Free", price: "₹0", tag: "Start exploring", features: ["AI Mentor · 30 msg/day", "Daily Current Affairs", "5 AI Notes per week", "Community access"], cta: "Start Free", highlight: false },
  { name: "Pro", price: "₹499", tag: "Most Popular", features: ["Unlimited AI Mentor", "PYQ + Mock Analysis", "Unlimited AI Notes", "Answer Evaluation", "GS + Optional AI"], cta: "Go Pro", highlight: true },
  { name: "Ultimate", price: "₹999", tag: "Full arsenal", features: ["Everything in Pro", "Voice Mentor + Mock Interview", "Priority AI queue", "1-on-1 Strategy Sessions", "Early access to new AI tools"], cta: "Get Ultimate", highlight: false },
];

export function Pricing() {
  return (
    <section className="relative mt-24">
      <SectionTitle eyebrow="Pricing" title="Simple, premium, aspirant-friendly" />
      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {PLANS.map((p) => (
          <div
            key={p.name}
            className={cn(
              "relative overflow-hidden rounded-3xl border p-6 backdrop-blur-xl transition-all",
              p.highlight
                ? "border-transparent bg-gradient-to-br from-[#2563EB]/25 via-[#7C3AED]/20 to-[#F97316]/20 shadow-[0_0_60px_-10px_rgba(124,58,237,0.55)] md:scale-105"
                : "border-white/10 bg-white/[0.04] hover:border-white/25"
            )}
          >
            {p.highlight && (
              <div className="pointer-events-none absolute inset-0 rounded-3xl p-[1.5px]">
                <div className="h-full w-full rounded-3xl bg-gradient-to-br from-[#2563EB] via-[#7C3AED] to-[#F97316] opacity-70" />
              </div>
            )}
            <div className="relative rounded-3xl">
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-white">{p.name}</div>
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  p.highlight ? "bg-white text-slate-900" : "bg-white/10 text-white/70"
                )}>{p.tag}</span>
              </div>
              <div className="mt-4 flex items-end gap-1">
                <span className="font-serif text-4xl font-black text-white">{p.price}</span>
                <span className="pb-1 text-xs text-white/60">/ month</span>
              </div>
              <ul className="mt-5 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/80">
                    <span className="mt-0.5 grid h-4 w-4 place-items-center rounded-full bg-emerald-500/25 text-emerald-300">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="/mentor"
                className={cn(
                  "mt-6 flex w-full items-center justify-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all",
                  p.highlight
                    ? "bg-white text-slate-900 hover:scale-[1.02]"
                    : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
                )}
              >
                {p.cta} <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------- FAQ ----------------

const FAQS = [
  { q: "Is Genius AI aligned with the UPSC syllabus?", a: "Yes. Every note, MCQ and answer is mapped to GS-I to GS-IV plus CSAT, Essay and Optionals, following the latest UPSC syllabus and PYQ trends." },
  { q: "Can I upload my own study material?", a: "Absolutely. Upload PDFs, editorials, coaching notes or newspaper images and the AI will convert them into structured, syllabus-tagged notes." },
  { q: "Does it support Odia and other regional languages?", a: "Yes. The Odisha PCS digest and mentor answers can be generated in pure Odia. Hindi and other languages are supported for mentor chats." },
  { q: "Which AI models power Genius AI?", a: "A hybrid stack: Gemini Pro for premium notes, plus NVIDIA and Groq for lightning-fast mentor chats — with automatic fallback." },
  { q: "Can I cancel my plan anytime?", a: "Yes. Plans are monthly. You can upgrade, downgrade or cancel at any time from your account." },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="relative mt-24">
      <SectionTitle eyebrow="FAQ" title="Questions? We have answers." />
      <div className="mx-auto mt-10 max-w-3xl space-y-3">
        {FAQS.map((f, i) => {
          const on = open === i;
          return (
            <div key={f.q} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
              <button
                type="button"
                onClick={() => setOpen(on ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-white"
              >
                {f.q}
                <ChevronDown className={cn("h-4 w-4 shrink-0 text-white/60 transition-transform", on && "rotate-180")} />
              </button>
              <div className={cn("grid transition-all duration-300 ease-out", on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                <div className="overflow-hidden">
                  <p className="px-5 pb-4 text-sm leading-relaxed text-white/70">{f.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ---------------- Final CTA ----------------

export function FinalCta() {
  return (
    <section className="relative mt-24">
      <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#2563EB]/30 via-[#7C3AED]/25 to-[#F97316]/25 p-10 text-center backdrop-blur-xl sm:p-16">
        <div aria-hidden className="absolute inset-0 opacity-40" style={{
          backgroundImage: "radial-gradient(circle at 20% 20%, rgba(37,99,235,0.5), transparent 40%), radial-gradient(circle at 80% 30%, rgba(124,58,237,0.5), transparent 45%), radial-gradient(circle at 50% 90%, rgba(249,115,22,0.4), transparent 45%)"
        }} />
        <div className="relative">
          <h2 className="mx-auto max-w-3xl font-serif text-3xl font-black tracking-tight text-white sm:text-5xl">
            Start Your UPSC Journey with AI Today
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-white/80 sm:text-base">
            Master UPSC smarter with your personal AI mentor.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="/auth" className="group inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-xl transition-transform hover:scale-[1.03]">
              <Rocket className="h-4 w-4" /> Start Free
            </a>
            <a href="#demo" className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition-all hover:bg-white/20">
              <Play className="h-4 w-4" /> Watch Demo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------- Premium Footer ----------------

export function PremiumFooter() {
  const cols = [
    { h: "Product", links: [["Features", "#features"], ["AI Tools", "#tools"], ["Pricing", "#pricing"], ["Roadmap", "#roadmap"]] },
    { h: "Company", links: [["About", "#"], ["Contact", "#"], ["Blog", "#"], ["Careers", "#"]] },
    { h: "Legal", links: [["Privacy Policy", "#"], ["Terms", "#"], ["Refund", "#"], ["Cookies", "#"]] },
  ];
  return (
    <footer className="relative mt-24 border-t border-white/10 bg-gradient-to-b from-transparent to-black/40 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-5">
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-[#2563EB] via-[#7C3AED] to-[#F97316] text-white shadow-lg">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <div className="text-sm font-black text-white">UPSC Genius AI</div>
              <div className="text-[10px] uppercase tracking-widest text-white/50">by Sidheswar Enterprises</div>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm text-white/60">
            Your premium AI mentor for UPSC — notes, MCQs, answer writing and current affairs, all in one intelligent workspace.
          </p>
          <div className="mt-4 flex gap-2">
            {[Send, Youtube, Instagram, Linkedin].map((I, i) => (
              <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/80 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/10">
                <I className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <div className="mb-3 text-xs font-bold uppercase tracking-widest text-white/80">{c.h}</div>
            <ul className="space-y-2 text-sm text-white/60">
              {c.links.map(([l, h]) => (
                <li key={l}><a href={h} className="hover:text-white">{l}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5 py-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} UPSC Genius AI · by Sidheswar Enterprises · Built with Zap <Zap className="inline h-3 w-3 -mt-0.5" /> and AI.
      </div>
    </footer>
  );
}

// ---------------- Hero right container helper ----------------

export function HeroStatChips() {
  const stats = [
    { k: "50,000+", v: "Questions" },
    { k: "AI", v: "Powered" },
    { k: "24×7", v: "Mentor" },
    { k: "UPSC", v: "Ready" },
  ];
  return (
    <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.v} className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-center backdrop-blur-xl">
          <div className="bg-gradient-to-r from-blue-300 via-fuchsia-300 to-amber-300 bg-clip-text text-sm font-black text-transparent">{s.k}</div>
          <div className="text-[10px] uppercase tracking-widest text-white/60">{s.v}</div>
        </div>
      ))}
    </div>
  );
}

export const __unused = useMemo;