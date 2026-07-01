import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Sparkles,
  Search,
  Newspaper,
  ExternalLink,
  Sun,
  Moon,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { cn } from "@/lib/utils";
import { getUpscNews, type NewsItem } from "@/lib/news.functions";
import { useTheme } from "@/components/theme-provider";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UPSC — AI Notes, MCQs & Current Affairs for UPSC" },
      { name: "description", content: "Premium AI mentor for UPSC aspirants. Upload any PDF or editorial and get syllabus-mapped notes, MCQs, infographics, handwritten notes and Mains answers — PYQ-aligned." },
      { property: "og:title", content: "UPSC — AI Notes, MCQs & Current Affairs for UPSC" },
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
          <UpscNews />
        </main>
        <footer className="relative border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} <span className="font-semibold text-foreground/80">UPSC</span> · by Sidheswar Enterprises
        </footer>
      </div>
    </AppShell>
  );
}

// ---------------- Hero ----------------

function Hero() {
  const [q, setQ] = useState("");
  const { theme, toggle } = useTheme();
  return (
    <section className="relative">
      <div className="flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/50 bg-gradient-to-r from-amber-100/80 via-white/60 to-amber-100/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-800 shadow-sm backdrop-blur dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-200">
          <Sparkles className="h-3 w-3" />
          AI · Syllabus aligned · PYQ mapped
        </span>

        <h1 className="mt-5 max-w-3xl font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          Welcome back to{" "}
          <span className="inline-flex items-center gap-2 align-middle">
            <span className="bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-amber-500 bg-clip-text text-transparent">
              Genius&nbsp;AI
            </span>
            <button
              type="button"
              onClick={toggle}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/50 bg-white/70 text-foreground shadow-sm backdrop-blur-xl transition-all hover:scale-110 hover:shadow-md dark:border-white/10 dark:bg-white/5 sm:h-8 sm:w-8"
            >
              {theme === "dark" ? (
                <Sun className="h-3.5 w-3.5 text-amber-400 sm:h-4 sm:w-4" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-indigo-500 sm:h-4 sm:w-4" />
              )}
            </button>
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
    </section>
  );
}

// ---------------- UPSC News ----------------

function timeAgo(iso: string): string {
  const t = Date.parse(iso);
  if (!t) return "";
  const diff = Date.now() - t;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function UpscNews() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<"GS1" | "GS2" | "GS3" | "GS4">("GS1");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await getUpscNews();
        if (!alive) return;
        setItems(res.items);
      } catch (e) {
        if (!alive) return;
        setErr(e instanceof Error ? e.message : "Failed to load news");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const tabs: { key: "GS1" | "GS2" | "GS3" | "GS4"; label: string }[] = [
    { key: "GS1", label: "GS-I · History & Society" },
    { key: "GS2", label: "GS-II · Polity & IR" },
    { key: "GS3", label: "GS-III · Economy, Env, S&T" },
    { key: "GS4", label: "GS-IV · Ethics" },
  ];
  const filtered = items.filter((n) => n.gs === tab);

  return (
    <section className="mt-14">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
            <Newspaper className="h-6 w-6 text-rose-500" />
            UPSC News · Today
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Live headlines mapped to GS papers.</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = tab === t.key;
          const count = items.filter((n) => n.gs === t.key).length;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                active
                  ? "border-transparent bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md"
                  : "border-white/40 bg-white/60 text-foreground/70 backdrop-blur hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              }`}
            >
              {t.label}
              <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${active ? "bg-white/20" : "bg-foreground/10"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/40 backdrop-blur dark:bg-white/5" />
          ))}
        </div>
      )}

      {err && !loading && (
        <div className="rounded-2xl border border-rose-300/40 bg-rose-50/60 p-4 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
          Couldn't load news right now. {err}
        </div>
      )}

      {!loading && !err && filtered.length === 0 && (
        <div className="rounded-2xl border border-white/40 bg-white/60 p-6 text-center text-sm text-muted-foreground backdrop-blur dark:border-white/10 dark:bg-white/5">
          No {tab} headlines right now. Try another paper.
        </div>
      )}

      {!loading && !err && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((n) => (
            <a
              key={n.link}
              href={n.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block rounded-2xl border border-white/40 bg-white/60 p-4 shadow-[0_8px_30px_-12px_rgba(31,38,135,0.18)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-18px_rgba(244,63,94,0.45)] dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                    {n.gs}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                    {n.source}
                  </span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <h3 className="mt-2 font-serif text-[15px] font-semibold leading-snug text-foreground line-clamp-3">
                {n.title}
              </h3>
              {n.pubDate && (
                <div className="mt-2 text-[11px] text-muted-foreground">{timeAgo(n.pubDate)}</div>
              )}
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

