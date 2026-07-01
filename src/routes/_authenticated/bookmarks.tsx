import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bookmark, Trash2, ExternalLink, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/bookmarks")({
  head: () => ({ meta: [{ title: "Bookmarks — UPSC Genius AI" }] }),
  component: BookmarksPage,
});

type Bm = { id: string; title: string; url?: string; source?: string; note?: string; savedAt: number };

const KEY = "upsc_bookmarks_v1";

function loadAll(): Bm[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function saveAll(items: Bm[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
}

function BookmarksPage() {
  const [items, setItems] = useState<Bm[]>([]);
  useEffect(() => { setItems(loadAll()); }, []);

  function remove(id: string) {
    const next = items.filter((x) => x.id !== id);
    setItems(next); saveAll(next);
    toast.success("Bookmark removed");
  }

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        <header className="mb-6 flex items-center gap-3 animate-fade-in">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 text-white shadow-md">
            <Bookmark className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-serif text-2xl font-bold">Bookmarks</h1>
            <p className="text-sm text-muted-foreground">Important news / notes jo aap save karte ho — sab yahan saved rahega.</p>
          </div>
        </header>

        {!items.length ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center animate-scale-in">
            <Sparkles className="mx-auto mb-3 h-8 w-8 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">Koi bookmark nahi. News / articles pe "Bookmark" click karke yahan add karo.</p>
          </div>
        ) : (
          <ul className="grid gap-3">
            {items.map((b, i) => (
              <li
                key={b.id}
                className="rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md animate-fade-in"
                style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/40">
                    <Bookmark className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm">{b.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                      {b.source && <Badge variant="outline">{b.source}</Badge>}
                      <span>{new Date(b.savedAt).toLocaleString()}</span>
                    </div>
                    {b.note && <p className="mt-2 text-xs text-muted-foreground">{b.note}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    {b.url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={b.url} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a>
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-rose-600 hover:bg-rose-50" onClick={() => remove(b.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </AppShell>
  );
}

// Helper for other components to add a bookmark
export function addBookmark(b: Omit<Bm, "id" | "savedAt">) {
  if (typeof window === "undefined") return;
  const all = loadAll();
  const id = crypto.randomUUID();
  all.unshift({ ...b, id, savedAt: Date.now() });
  saveAll(all.slice(0, 200));
}