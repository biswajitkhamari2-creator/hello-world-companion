import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  Globe,
  Moon,
  Sun,
  Bell,
  Type,
  Sparkles,
  Save,
  RotateCcw,
  Download,
  Shield,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — UPSC Genius AI" }] }),
  component: SettingsPage,
});

type Prefs = {
  language: "en" | "hi" | "hinglish" | "or";
  theme: "light" | "dark" | "system";
  fontSize: "sm" | "md" | "lg";
  notifications: boolean;
  emailDigest: boolean;
  autoStamp: boolean;
  aiProvider: "auto" | "gemini" | "groq" | "nvidia";
  aiTone: "concise" | "balanced" | "detailed";
  autoOcr: boolean;
  saveHistory: boolean;
  telegramImport: boolean;
  defaultSubject: string;
};

const DEFAULTS: Prefs = {
  language: "en",
  theme: "system",
  fontSize: "md",
  notifications: true,
  emailDigest: false,
  autoStamp: false,
  aiProvider: "auto",
  aiTone: "balanced",
  autoOcr: true,
  saveHistory: true,
  telegramImport: true,
  defaultSubject: "General Studies",
};

const KEY = "upsc_settings_v1";

function load(): Prefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function applyTheme(theme: Prefs["theme"]) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const resolved = theme === "system"
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : theme;
  root.classList.toggle("dark", resolved === "dark");
}

function applyFontSize(size: Prefs["fontSize"]) {
  if (typeof document === "undefined") return;
  const px = size === "sm" ? "15px" : size === "lg" ? "18px" : "16px";
  document.documentElement.style.fontSize = px;
}

function SettingsPage() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const p = load();
    setPrefs(p);
    applyTheme(p.theme);
    applyFontSize(p.fontSize);
  }, []);

  function update<K extends keyof Prefs>(k: K, v: Prefs[K]) {
    setPrefs((p) => ({ ...p, [k]: v }));
    setDirty(true);
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify(prefs));
    applyTheme(prefs.theme);
    applyFontSize(prefs.fontSize);
    setDirty(false);
    toast.success("Settings saved");
  }

  function reset() {
    setPrefs(DEFAULTS);
    localStorage.removeItem(KEY);
    applyTheme(DEFAULTS.theme);
    applyFontSize(DEFAULTS.fontSize);
    setDirty(false);
    toast.success("Reset to defaults");
  }

  function exportData() {
    const blob = new Blob([JSON.stringify({
      settings: prefs,
      bookmarks: JSON.parse(localStorage.getItem("upsc_bookmarks_v1") || "[]"),
    }, null, 2)], { type: "application/json" });
    void import("@/lib/downloads-store").then(({ saveAndDownload }) =>
      saveAndDownload(blob, "upsc-genius-data.json", { kind: "data", source: "settings-export" }),
    );
    toast.success("Data exported");
  }

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        <header className="mb-6 flex items-center gap-3 animate-fade-in">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 text-white shadow-md">
            <SettingsIcon className="h-5 w-5" />
          </span>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-2xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">Language, theme, notifications aur AI preferences — sab yahan customize karo.</p>
          </div>
        </header>

        <div className="grid gap-4">
          <Section icon={Globe} title="Language & Region" delay={0}>
            <Select
              label="App Language"
              value={prefs.language}
              onChange={(v) => update("language", v as Prefs["language"])}
              options={[
                { v: "en", l: "English" },
                { v: "hi", l: "हिन्दी (Hindi)" },
                { v: "hinglish", l: "Hinglish (Mixed)" },
                { v: "or", l: "ଓଡ଼ିଆ (Odia)" },
              ]}
            />
            <TextField
              label="Default Subject"
              value={prefs.defaultSubject}
              onChange={(v) => update("defaultSubject", v)}
              placeholder="e.g. Polity, Economy, GS-I"
            />
          </Section>

          <Section icon={prefs.theme === "dark" ? Moon : Sun} title="Appearance" delay={40}>
            <Select
              label="Theme"
              value={prefs.theme}
              onChange={(v) => update("theme", v as Prefs["theme"])}
              options={[
                { v: "light", l: "Light" },
                { v: "dark", l: "Dark" },
                { v: "system", l: "Match system" },
              ]}
            />
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><Type className="h-3 w-3" /> Font Size</p>
              <div className="flex gap-2">
                {(["sm", "md", "lg"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => update("fontSize", s)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-all hover:-translate-y-0.5 ${
                      prefs.fontSize === s
                        ? "border-indigo-500 bg-indigo-500/10 font-semibold shadow-sm"
                        : "border-border bg-background hover:bg-accent/40"
                    }`}
                  >
                    {s === "sm" ? "Small" : s === "md" ? "Medium" : "Large"}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          <Section icon={Bell} title="Notifications" delay={80}>
            <Toggle
              label="In-app notifications"
              hint="Generation complete, Telegram inbox updates, AI quota alerts"
              checked={prefs.notifications}
              onChange={(v) => update("notifications", v)}
            />
            <Toggle
              label="Weekly email digest"
              hint="Summary of what you studied last week"
              checked={prefs.emailDigest}
              onChange={(v) => update("emailDigest", v)}
            />
          </Section>

          <Section icon={Sparkles} title="AI & Generation" delay={120}>
            <Select
              label="Preferred AI Provider"
              value={prefs.aiProvider}
              onChange={(v) => update("aiProvider", v as Prefs["aiProvider"])}
              options={[
                { v: "auto", l: "Auto (recommended)" },
                { v: "gemini", l: "Google Gemini 2.5 Flash" },
                { v: "groq", l: "Groq Llama 3.3" },
                { v: "nvidia", l: "NVIDIA NIM" },
              ]}
            />
            <Select
              label="Response Style"
              value={prefs.aiTone}
              onChange={(v) => update("aiTone", v as Prefs["aiTone"])}
              options={[
                { v: "concise", l: "Concise — bullet points only" },
                { v: "balanced", l: "Balanced — default" },
                { v: "detailed", l: "Detailed — exam-ready notes" },
              ]}
            />
            <Toggle
              label="Auto OCR fallback"
              hint="Scanned PDFs pe automatically Vision OCR chalao"
              checked={prefs.autoOcr}
              onChange={(v) => update("autoOcr", v)}
            />
          </Section>

          <Section icon={Shield} title="Documents & Privacy" delay={160}>
            <Toggle
              label="Auto-stamp exported PDFs"
              hint="Har download pe watermark/logo automatically lagao"
              checked={prefs.autoStamp}
              onChange={(v) => update("autoStamp", v)}
            />
            <Toggle
              label="Save generation history"
              hint="Notes aur verifications ko history mein rakho"
              checked={prefs.saveHistory}
              onChange={(v) => update("saveHistory", v)}
            />
            <Toggle
              label="Telegram inbox import"
              hint="Forwarded messages ko auto-import karo"
              checked={prefs.telegramImport}
              onChange={(v) => update("telegramImport", v)}
            />
          </Section>

          <Section icon={Zap} title="Data" delay={200}>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="mr-1.5 h-3.5 w-3.5" /> Export my data (JSON)
              </Button>
              <Button variant="outline" size="sm" onClick={reset} className="text-rose-700 hover:bg-rose-50">
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset all settings
              </Button>
            </div>
          </Section>
        </div>

        <div className="sticky bottom-4 mt-6 flex justify-center">
          <Button
            size="lg"
            onClick={save}
            disabled={!dirty}
            className="shadow-lg transition-all disabled:opacity-40"
          >
            <Save className="mr-1.5 h-4 w-4" />
            {dirty ? "Save changes" : "Saved"}
            {dirty && <Badge variant="outline" className="ml-2 border-white/40 bg-white/10 text-white">Unsaved</Badge>}
          </Button>
        </div>
      </main>
    </AppShell>
  );
}

function Section({ icon: Icon, title, children, delay = 0 }: { icon: any; title: string; children: React.ReactNode; delay?: number }) {
  return (
    <section
      className="rounded-xl border border-border bg-card p-5 shadow-sm animate-fade-in"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      <h2 className="mb-4 flex items-center gap-2 font-serif text-sm font-bold uppercase tracking-wide text-foreground/80">
        <Icon className="h-4 w-4 text-indigo-500" /> {title}
      </h2>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
      >
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </label>
  );
}

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
      />
    </label>
  );
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-background/60 p-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-all ${
          checked ? "border-indigo-500 bg-indigo-500" : "border-border bg-muted"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4.5 w-4.5 h-[18px] w-[18px] rounded-full bg-white shadow transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}