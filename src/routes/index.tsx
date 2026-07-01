import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Sparkles,
  Search,
  Newspaper,
  ExternalLink,
  Sun,
  Moon,
  Landmark,
  Loader2,
  X,
  ArrowRight,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { cn } from "@/lib/utils";
import { getUpscNews, type NewsItem } from "@/lib/news.functions";
import { getOdishaNews, type OdishaNewsItem } from "@/lib/odisha-news.functions";
import {
  getArticleCrispNotes,
  getArticleComprehensiveNotes,
  type InstitutionCrispNotes,
  type InstitutionComprehensiveNotes,
} from "@/lib/institution-news.functions";
import { CrispNotesView, ComprehensiveNotesView } from "@/components/notes-view";
import { Wand2 } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import {
  AuroraBackdrop,
  AiMentorArt,
  HeroStatChips,
  PremiumFooter,
  useRotatingPlaceholder,
} from "@/components/landing-premium";

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
      <div className="relative isolate bg-[#020617] text-white">
        <AuroraBackdrop />
        <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:py-14">
          <Hero />
          <PcsDigestPreview />
          <UpscNews />
        </main>
        <PremiumFooter />
      </div>
    </AppShell>
  );
}

// ---------------- Hero ----------------

function Hero() {
  const [q, setQ] = useState("");
  const { theme, toggle } = useTheme();
  const placeholder = useRotatingPlaceholder();
  return (
    <section className="relative pt-6">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
        <div className="fade-up text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-300 backdrop-blur">
            <Sparkles className="h-3 w-3" /> AI · Syllabus aligned · PYQ mapped
          </span>

          <h1 className="mt-5 font-serif text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[64px]">
            Crack UPSC with the{" "}
            <span className="bg-gradient-to-r from-[#60A5FA] via-[#A78BFA] to-[#FB923C] bg-clip-text text-transparent">
              Power of AI
            </span>
            <button
              type="button"
              onClick={toggle}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="ml-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/10 align-middle text-white shadow-md backdrop-blur-xl transition-all hover:scale-110"
            >
              {theme === "dark" ? <Sun className="h-4 w-4 text-amber-300" /> : <Moon className="h-4 w-4 text-blue-200" />}
            </button>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/70 lg:mx-0 sm:text-lg">
            Your personal AI mentor for Prelims, Mains, Optional, Current Affairs, Answer Writing and Interview Preparation.
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
            <div className="group relative flex items-center rounded-2xl border border-white/15 bg-white/[0.06] p-1.5 shadow-[0_15px_50px_-18px_rgba(37,99,235,0.7)] backdrop-blur-xl transition-all focus-within:border-blue-400/60 focus-within:shadow-[0_20px_60px_-18px_rgba(124,58,237,0.8)]">
              <Search className="ml-3 h-4 w-4 shrink-0 text-white/60" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={placeholder || "Ask Genius AI anything…"}
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[15px] text-white placeholder:text-white/50 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#F97316] px-4 py-2 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-95"
              >
                <Sparkles className="h-4 w-4" /> Ask
              </button>
            </div>
          </form>

          <HeroStatChips />
        </div>

        <div className="fade-up relative">
          <AiMentorArt />
        </div>
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
  const [active, setActive] = useState<NewsItem | null>(null);
  const [mode, setMode] = useState<"crisp" | "comprehensive">("crisp");
  const [crisp, setCrisp] = useState<InstitutionCrispNotes | null>(null);
  const [comprehensive, setComprehensive] = useState<InstitutionComprehensiveNotes | null>(null);
  const [notesErr, setNotesErr] = useState<string | null>(null);
  const [notesLoading, setNotesLoading] = useState(false);

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

  async function openNotes(item: NewsItem, next: "crisp" | "comprehensive") {
    setActive(item);
    setMode(next);
    setCrisp(null);
    setComprehensive(null);
    setNotesErr(null);
    setNotesLoading(true);
    try {
      if (next === "crisp") {
        const res = await getArticleCrispNotes({ data: { url: item.link, sourceLabel: item.source } });
        setCrisp(res);
      } else {
        const res = await getArticleComprehensiveNotes({ data: { url: item.link, sourceLabel: item.source } });
        setComprehensive(res);
      }
    } catch (e) {
      setNotesErr(e instanceof Error ? e.message : "Could not generate notes");
    } finally {
      setNotesLoading(false);
    }
  }

  async function switchMode(next: "crisp" | "comprehensive") {
    if (!active || next === mode) return;
    setMode(next);
    if (next === "crisp" && crisp) return;
    if (next === "comprehensive" && comprehensive) return;
    setNotesErr(null);
    setNotesLoading(true);
    try {
      if (next === "crisp") {
        const res = await getArticleCrispNotes({ data: { url: active.link, sourceLabel: active.source } });
        setCrisp(res);
      } else {
        const res = await getArticleComprehensiveNotes({ data: { url: active.link, sourceLabel: active.source } });
        setComprehensive(res);
      }
    } catch (e) {
      setNotesErr(e instanceof Error ? e.message : "Could not generate notes");
    } finally {
      setNotesLoading(false);
    }
  }

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
            <div
              key={n.link}
              className="group relative flex flex-col rounded-2xl border border-white/40 bg-white/60 p-4 shadow-[0_8px_30px_-12px_rgba(31,38,135,0.18)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-18px_rgba(244,63,94,0.45)] dark:border-white/10 dark:bg-white/5"
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
                <a href={n.link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground" title="Open source article">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              <h3 className="mt-2 font-serif text-[15px] font-semibold leading-snug text-foreground line-clamp-3">
                {n.title}
              </h3>
              {n.pubDate && (
                <div className="mt-2 text-[11px] text-muted-foreground">{timeAgo(n.pubDate)}</div>
              )}
              <div className="mt-3 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => openNotes(n, "crisp")}
                  className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-95"
                >
                  <Sparkles className="h-3 w-3" /> Crisp Notes
                </button>
                <button
                  type="button"
                  onClick={() => openNotes(n, "comprehensive")}
                  className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-95"
                >
                  <Wand2 className="h-3 w-3" /> Comprehensive
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {active && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm" onClick={() => setActive(null)}>
          <div className="relative my-6 w-full max-w-3xl rounded-2xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 rounded-t-2xl border-b border-border bg-card/95 px-4 py-2.5 backdrop-blur">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs uppercase tracking-wider text-muted-foreground">{active.source}</p>
                <p className="truncate text-sm font-semibold">{active.title}</p>
              </div>
              <div className="inline-flex rounded-full border border-border p-0.5 text-xs">
                <button onClick={() => switchMode("crisp")} className={`rounded-full px-2.5 py-1 font-medium transition ${mode === "crisp" ? "bg-emerald-500 text-white" : "text-muted-foreground"}`}>Crisp</button>
                <button onClick={() => switchMode("comprehensive")} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium transition ${mode === "comprehensive" ? "bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white" : "text-muted-foreground"}`}>
                  <Wand2 className="h-3 w-3" /> Comprehensive
                </button>
              </div>
              <button type="button" onClick={() => setActive(null)} className="rounded-full p-1 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-y-auto px-6 py-5">
              {notesLoading && (
                <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating syllabus-tagged notes…
                </div>
              )}
              {notesErr && !notesLoading && (
                <div className="rounded-lg border border-rose-300/40 bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
                  {notesErr}
                </div>
              )}
              {!notesLoading && !notesErr && mode === "crisp" && crisp && <CrispNotesView notes={crisp} />}
              {!notesLoading && !notesErr && mode === "comprehensive" && comprehensive && <ComprehensiveNotesView notes={comprehensive} />}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ---------------- Odisha PCS Digest ----------------

function PcsDigestPreview() {
  const [items, setItems] = useState<OdishaNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await getOdishaNews();
        if (alive) setItems(res.items);
      } catch (e) {
        if (alive) setErr(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const el = document.getElementById("pcs-digest-preview");
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setVisible(true)),
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const top3 = items.slice(0, 3);

  return (
    <section
      id="pcs-digest-preview"
      className={`mt-10 transition-all duration-700 ease-out ${visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            <Landmark className="h-6 w-6 text-emerald-400" />
            National News · PCS Digest
          </h2>
          <p className="mt-1 text-sm text-white/60">Latest 3 syllabus-mapped headlines from across the country.</p>
        </div>
        <Link
          to="/pcs-digest"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white backdrop-blur transition-all hover:bg-white/10"
        >
          View All National News <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/5 backdrop-blur" />
          ))}
        </div>
      )}

      {err && !loading && (
        <div className="rounded-2xl border border-rose-300/40 bg-rose-500/10 p-4 text-sm text-rose-200">
          Couldn't load PCS Digest. {err}
        </div>
      )}

      {!loading && !err && top3.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {top3.map((n) => (
            <Link
              key={n.link}
              to="/pcs-digest"
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-white/[0.07] hover:shadow-[0_20px_50px_-18px_rgba(16,185,129,0.55)]"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                  {n.category}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-white/50">{n.source}</span>
              </div>
              <h3 className="mt-3 font-serif text-[15px] font-semibold leading-snug text-white line-clamp-3">
                {n.title}
              </h3>
              <div className="mt-auto flex items-center justify-between pt-3 text-[11px] text-white/50">
                <span>{n.pubDate ? timeAgo(n.pubDate) : ""}</span>
                <span className="inline-flex items-center gap-1 text-emerald-300 opacity-0 transition-opacity group-hover:opacity-100">
                  Read <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

