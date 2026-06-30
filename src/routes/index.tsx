import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Sparkles,
  Search,
  Newspaper,
  FileEdit,
  Target,
  History,
  Upload,
  Inbox,
  PenLine,
  ImageIcon,
  Library,
  CalendarRange,
  ArrowRight,
  Flame,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sushama UPSC — AI Notes, MCQs & Current Affairs for UPSC" },
      { name: "description", content: "Premium AI mentor for UPSC aspirants. Upload any PDF or editorial and get syllabus-mapped notes, MCQs, infographics, handwritten notes and Mains answers — PYQ-aligned." },
      { property: "og:title", content: "Sushama UPSC — AI Notes, MCQs & Current Affairs for UPSC" },
      { property: "og:description", content: "Premium AI mentor for UPSC aspirants. Syllabus-mapped notes, MCQs, infographics and Mains answers from any study material." },
      { property: "og:url", content: "https://open-hello-bloom.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://open-hello-bloom.lovable.app/" }],
  }),
  component: Landing,
});

// ---------------- Decorative Background ----------------

function FloatingBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-indigo-500/30 via-fuchsia-400/20 to-transparent blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="absolute top-40 -right-32 h-[460px] w-[460px] rounded-full bg-gradient-to-br from-amber-300/30 via-rose-300/20 to-transparent blur-3xl animate-[pulse_10s_ease-in-out_infinite]" />
      <div className="absolute bottom-0 left-1/3 h-[380px] w-[380px] rounded-full bg-gradient-to-br from-emerald-300/20 via-sky-400/20 to-transparent blur-3xl animate-[pulse_12s_ease-in-out_infinite]" />

      {/* Light streak */}
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Particles */}
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-amber-300/60 shadow-[0_0_8px_2px_rgba(251,191,36,0.45)]"
          style={{
            top: `${(i * 37) % 100}%`,
            left: `${(i * 53) % 100}%`,
            animation: `float ${6 + (i % 5)}s ease-in-out ${i * 0.3}s infinite alternate`,
          }}
        />
      ))}

      {/* Floating UPSC ghost letters */}
      <div className="absolute inset-0">
        {[
          { ch: "U", top: "6%",  left: "4%",  size: "clamp(90px,15vw,220px)", delay: "0s",   rot: "-8deg",  hue: "from-indigo-500/30 to-fuchsia-500/10" },
          { ch: "P", top: "18%", left: "78%", size: "clamp(80px,13vw,200px)", delay: "1.2s", rot: "10deg",  hue: "from-amber-500/35 to-rose-500/10" },
          { ch: "S", top: "58%", left: "2%",  size: "clamp(80px,13vw,200px)", delay: "2.4s", rot: "-12deg", hue: "from-emerald-500/30 to-sky-500/10" },
          { ch: "C", top: "70%", left: "76%", size: "clamp(90px,15vw,220px)", delay: "3.6s", rot: "14deg",  hue: "from-fuchsia-500/30 to-indigo-500/10" },
        ].map((l) => (
          <span
            key={l.ch}
            className={cn(
              "absolute select-none bg-gradient-to-br bg-clip-text font-serif font-black leading-none text-transparent",
              l.hue,
            )}
            style={{
              top: l.top,
              left: l.left,
              fontSize: l.size,
              transform: `rotate(${l.rot})`,
              animation: `upscFloat 9s ease-in-out ${l.delay} infinite alternate`,
              letterSpacing: "-0.04em",
              filter: "drop-shadow(0 10px 30px rgba(99,102,241,0.18))",
            }}
          >
            {l.ch}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes float {
          from { transform: translateY(0) translateX(0); opacity: .35; }
          to   { transform: translateY(-22px) translateX(10px); opacity: .9; }
        }
        @keyframes upscFloat {
          0%   { transform: translateY(0)    translateX(0)   rotate(0deg); }
          50%  { transform: translateY(-22px) translateX(10px) rotate(2deg); }
          100% { transform: translateY(10px) translateX(-8px) rotate(-2deg); }
        }
      `}</style>
    </div>
  );
}

// ---------------- Glass primitives ----------------

function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-white/40 bg-white/60 p-5 shadow-[0_8px_30px_-12px_rgba(31,38,135,0.18)] backdrop-blur-xl",
        "dark:border-white/10 dark:bg-white/5",
        "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-18px_rgba(99,102,241,0.45)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ---------------- Page ----------------

function Landing() {
  return (
    <AppShell>
      <div className="relative isolate">
        <FloatingBackdrop />
        <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:py-14">
          <Hero />
          <QuickAccess />
          <BottomCTA />
        </main>
        <footer className="relative border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} <span className="font-semibold text-foreground/80">Sushama UPSC</span> · by Sidheswar Enterprises
        </footer>
      </div>
    </AppShell>
  );
}

// ---------------- Hero ----------------

function Hero() {
  const [q, setQ] = useState("");
  return (
    <section className="relative">
      <div className="flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/50 bg-gradient-to-r from-amber-100/80 via-white/60 to-amber-100/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-800 shadow-sm backdrop-blur dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-200">
          <Sparkles className="h-3 w-3" />
          AI · Syllabus aligned · PYQ mapped
        </span>

        <h1 className="mt-5 max-w-3xl font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          Welcome back to{" "}
          <span className="animate-upsc-flip bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-amber-500 bg-clip-text text-transparent">
            SushamaUPSC Genius&nbsp;AInbsp;UPSC
          </span>
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          Your personal AI mentor — turn any material into syllabus-mapped notes, MCQs, infographics & mains answers.
        </p>

        {/* AI Search bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const t = q.trim();
            window.location.href = t ? `/mentor?q=${encodeURIComponent(t)}` : "/mentor";
          }}
          className="mt-7 w-full max-w-2xl"
        >
          <div className="group relative flex items-center rounded-2xl border border-white/60 bg-white/80 p-1.5 shadow-[0_12px_40px_-18px_rgba(99,102,241,0.5)] backdrop-blur-xl transition-all focus-within:border-indigo-400/70 focus-within:shadow-[0_18px_50px_-18px_rgba(99,102,241,0.7)] dark:border-white/10 dark:bg-white/5">
            <Search className="ml-3 h-4.5 w-4.5 shrink-0 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ask AI Mentor anything — “Explain Article 370 for GS-II”"
              className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              Ask
            </button>
          </div>
        </form>
      </div>

      {/* Today strip */}
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TodayCard
          icon={FileEdit}
          tint="from-indigo-500 to-violet-500"
          eyebrow="Today's Editorial"
          title="Decoding the Editorial"
          body="AI summary, GS mapping & probable questions."
          to="/editorial"
        />
        <TodayCard
          icon={Newspaper}
          tint="from-rose-500 to-amber-500"
          eyebrow="Latest Newspaper"
          title="The Hindu · Today"
          body="Article-wise UPSC analysis ready in one click."
          to="/inbox"
        />
        <TodayCard
          icon={Flame}
          tint="from-amber-500 to-orange-500"
          eyebrow="Current Affairs"
          title="Top 10 of the Day"
          body="Prelims-focused crisp facts & MCQs."
          to="/dashboard?tab=current-affairs"
        />
        <TodayCard
          icon={Target}
          tint="from-emerald-500 to-teal-500"
          eyebrow="Daily Target"
          title="Continue learning"
          body="Pick up where you left off."
          to="/dashboard"
          cta="Resume"
          ctaIcon={History}
        />
      </div>
    </section>
  );
}

function TodayCard({
  icon: Icon,
  tint,
  eyebrow,
  title,
  body,
  to,
  cta = "Open",
  ctaIcon: CtaIcon = ArrowRight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
  eyebrow: string;
  title: string;
  body: string;
  to: string;
  cta?: string;
  ctaIcon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <a href={to} className="block">
      <GlassCard className="h-full">
        <div className="flex items-start gap-3">
          <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-md", tint)}>
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{eyebrow}</div>
            <div className="mt-0.5 truncate font-serif text-[17px] font-semibold text-foreground">{title}</div>
          </div>
        </div>
        <p className="mt-3 text-[13.5px] leading-relaxed text-foreground/75">{body}</p>
        <div className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-indigo-600 dark:text-indigo-300">
          {cta} <CtaIcon className="h-3.5 w-3.5" />
        </div>
      </GlassCard>
    </a>
  );
}

// ---------------- Quick Access ----------------

const QUICK = [
  { title: "AI Mentor", desc: "Text + voice tutor, context-aware.", icon: Sparkles, to: "/mentor", tint: "from-indigo-500 to-fuchsia-500" },
  { title: "AI Newspaper", desc: "Auto UPSC analysis per article.", icon: Newspaper, to: "/dashboard?mode=newspaper", tint: "from-rose-500 to-amber-500" },
  { title: "PDF Upload", desc: "Drop any material, get UPSC outputs.", icon: Upload, to: "/dashboard", tint: "from-sky-500 to-indigo-500" },
  { title: "Telegram Inbox", desc: "Imported newspapers & PDFs.", icon: Inbox, to: "/inbox", tint: "from-cyan-500 to-blue-500" },
  { title: "Handwritten Notes", desc: "Topper notebook style PDF.", icon: PenLine, to: "/dashboard?gen=handwritten", tint: "from-violet-500 to-purple-500" },
  { title: "Infographics", desc: "One-click visual concept packs.", icon: ImageIcon, to: "/dashboard?gen=infographics", tint: "from-emerald-500 to-teal-500" },
  { title: "PYQ Search", desc: "Find & map previous-year trends.", icon: Library, to: "/dashboard?gen=pyq", tint: "from-amber-500 to-orange-500" },
  { title: "Study Planner", desc: "Daily targets & revision loop.", icon: CalendarRange, to: "/dashboard?tab=planner", tint: "from-fuchsia-500 to-pink-500" },
];

function QuickAccess() {
  return (
    <section className="mt-14">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">Quick access</h2>
          <p className="mt-1 text-sm text-muted-foreground">Jump into your most-used tools.</p>
        </div>
        <Link to="/dashboard" className="hidden text-sm font-semibold text-indigo-600 hover:underline sm:inline-flex">
          Open dashboard →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {QUICK.map((q, idx) => (
          <a
            key={q.title}
            href={q.to}
            className="group relative block"
            style={{ animation: `floatY 6s ease-in-out ${idx * 0.2}s infinite alternate` }}
          >
            <GlassCard className="h-full">
              <span className={cn("grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform group-hover:scale-110", q.tint)}>
                <q.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3.5 font-serif text-[17px] font-semibold leading-tight text-foreground">{q.title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-foreground/70">{q.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-indigo-300">
                Open <ArrowRight className="h-3 w-3" />
              </span>
            </GlassCard>
          </a>
        ))}
      </div>
      <style>{`
        @keyframes floatY {
          from { transform: translateY(0); }
          to   { transform: translateY(-4px); }
        }
      `}</style>
    </section>
  );
}

function BottomCTA() {
  return (
    <section className="mt-14">
      <GlassCard className="overflow-hidden p-0">
        <div className="relative grid items-center gap-6 p-7 sm:p-10 md:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300">
              Final Checker
            </div>
            <h3 className="mt-2 font-serif text-2xl font-semibold leading-tight sm:text-3xl">
              Audit your prep across the full UPSC syllabus.
            </h3>
            <p className="mt-2 max-w-lg text-sm text-foreground/75 sm:text-[15px]">
              Run a 9-phase quality check — syllabus matching, PYQ coverage, weak areas — and auto-fix gaps in one click.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.03] active:scale-95"
            >
              <Sparkles className="h-4 w-4" /> Open Dashboard
            </a>
            <Link
              to="/mentor"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-paper/80 px-5 py-2.5 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:bg-paper"
            >
              Chat with Mentor
            </Link>
          </div>
        </div>
      </GlassCard>
    </section>
  );
}
