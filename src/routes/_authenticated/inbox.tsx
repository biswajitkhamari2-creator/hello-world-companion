import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Inbox as InboxIcon,
  Loader2,
  Download,
  ExternalLink,
  RefreshCw,
  Trash2,
  Archive,
  ArchiveRestore,
  Newspaper,
  BookOpen,
  PenLine,
  Sparkles,
  Calendar as CalendarIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import {
  listInbox,
  importInboxItem,
  archiveInboxItem,
  deleteInboxItem,
  type InboxItem,
} from "@/lib/telegram-inbox.functions";
import { extractDocument } from "@/lib/documents.functions";
import type { OutputType } from "@/lib/generations.functions";
import runningKid from "@/assets/running-kid.png";

export const Route = createFileRoute("/_authenticated/inbox")({
  head: () => ({
    meta: [{ title: "Telegram Inbox — UPSC Mitra" }],
  }),
  component: InboxPage,
});

function InboxPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const todayIso = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  };
  const [selectedDate, setSelectedDate] = useState<string>(todayIso());
  const [dateFilterOn, setDateFilterOn] = useState(true);

  useEffect(() => {
    setReady(true);
  }, []);

  const list = useServerFn(listInbox);
  const importer = useServerFn(importInboxItem);
  const archiver = useServerFn(archiveInboxItem);
  const deleter = useServerFn(deleteInboxItem);
  const extract = useServerFn(extractDocument);
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["telegram-inbox", showArchived ? "archived" : "active"],
    queryFn: () => list({ data: { archived: showArchived } }) as Promise<InboxItem[]>,
    enabled: ready,
    refetchInterval: 20_000,
  });

  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  function setActiveDoc(documentId: string) {
    try {
      sessionStorage.setItem("active_doc_id", documentId);
    } catch {}
  }

  async function doImport(item: InboxItem, autoRun: OutputType | null) {
    setBusyId(item.id);
    setBusyAction(autoRun ?? "import");
    try {
      const r = await importer({ data: { itemId: item.id } });
      setActiveDoc(r.documentId);
      if (autoRun) {
        try {
          sessionStorage.setItem("auto_run_type", autoRun);
          sessionStorage.setItem("auto_run_doc", r.documentId);
        } catch {}
      }
      // Kick off extraction so the dashboard auto-runner can take over.
      extract({ data: { documentId: r.documentId } }).catch(() => {});
      toast.success(autoRun ? `Imported — starting ${autoRun.replace("_", " ")}…` : "Imported to your library");
      qc.invalidateQueries({ queryKey: ["documents"] });
      navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error((e as Error).message || "Import failed");
    } finally {
      setBusyId(null);
      setBusyAction(null);
    }
  }

  const archiveMut = useMutation({
    mutationFn: ({ itemId, archived }: { itemId: string; archived: boolean }) =>
      archiver({ data: { itemId, archived } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["telegram-inbox"] });
      toast.success("Updated");
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const deleteMut = useMutation({
    mutationFn: (itemId: string) => deleter({ data: { itemId } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["telegram-inbox"] });
      toast.success("Deleted");
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const allItems = q.data ?? [];
  const sameLocalDay = (iso: string, ymd: string) => {
    const d = new Date(iso);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
    return local === ymd;
  };
  const filteredItems = dateFilterOn
    ? allItems.filter((it) => sameLocalDay(it.posted_at, selectedDate))
    : allItems;
  const pdfsForDay = filteredItems.filter((it) => it.kind === "pdf" && !it.archived_at);

  async function fetchDayMaterial() {
    if (!pdfsForDay.length) {
      toast.info(`No newspaper PDF posted on ${selectedDate}. Post it in the channel and retry.`);
      return;
    }
    // Auto-analyse the first (largest/main) PDF as a newspaper.
    const main = [...pdfsForDay].sort(
      (a, b) => (b.size_bytes ?? 0) - (a.size_bytes ?? 0),
    )[0];
    toast.success(`Found ${pdfsForDay.length} PDF${pdfsForDay.length > 1 ? "s" : ""} for ${selectedDate}. Starting newspaper analysis…`);
    await doImport(main, "newspaper");
  }

  function shiftDay(delta: number) {
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().slice(0, 10));
  }

  return (
    <AppShell>
      <div className="relative min-h-[calc(100vh-3rem)] overflow-hidden bg-gradient-to-br from-indigo-200 via-sky-200 to-amber-100">
        {/* Running kid animation */}
        <img
          src={runningKid}
          alt=""
          aria-hidden="true"
          loading="lazy"
          width={140}
          height={140}
          className="pointer-events-none absolute bottom-24 left-0 z-0 h-28 w-28 sm:h-36 sm:w-36 animate-kid-run drop-shadow-xl"
        />
        {/* Animated wave background */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-0 opacity-70">
          <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" className="w-full h-64 sm:h-80">
            <path fill="#6366f1" fillOpacity="0.18">
              <animate attributeName="d" dur="9s" repeatCount="indefinite"
                values="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,165.3C960,149,1056,139,1152,154.7C1248,171,1344,213,1392,234.7L1440,256L1440,320L0,320Z;
                        M0,192L48,202.7C96,213,192,235,288,224C384,213,480,171,576,165.3C672,160,768,192,864,213.3C960,235,1056,245,1152,229.3C1248,213,1344,171,1392,149.3L1440,128L1440,320L0,320Z;
                        M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,165.3C960,149,1056,139,1152,154.7C1248,171,1344,213,1392,234.7L1440,256L1440,320L0,320Z" />
            </path>
          </svg>
          <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" className="w-full h-56 sm:h-72 -mt-48 sm:-mt-56">
            <path fill="#0ea5e9" fillOpacity="0.16">
              <animate attributeName="d" dur="12s" repeatCount="indefinite"
                values="M0,160L48,176C96,192,192,224,288,229.3C384,235,480,213,576,186.7C672,160,768,128,864,138.7C960,149,1056,203,1152,213.3C1248,224,1344,192,1392,176L1440,160L1440,320L0,320Z;
                        M0,256L48,234.7C96,213,192,171,288,165.3C384,160,480,192,576,202.7C672,213,768,203,864,186.7C960,171,1056,149,1152,154.7C1248,160,1344,192,1392,208L1440,224L1440,320L0,320Z;
                        M0,160L48,176C96,192,192,224,288,229.3C384,235,480,213,576,186.7C672,160,768,128,864,138.7C960,149,1056,203,1152,213.3C1248,224,1344,192,1392,176L1440,160L1440,320L0,320Z" />
            </path>
          </svg>
          <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" className="w-full h-48 sm:h-64 -mt-40 sm:-mt-52">
            <path fill="#f59e0b" fillOpacity="0.14">
              <animate attributeName="d" dur="15s" repeatCount="indefinite"
                values="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L0,320Z;
                        M0,224L48,240C96,256,192,288,288,282.7C384,277,480,235,576,224C672,213,768,235,864,234.7C960,235,1056,213,1152,213.3C1248,213,1344,235,1392,245.3L1440,256L1440,320L0,320Z;
                        M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L0,320Z" />
            </path>
          </svg>
        </div>

        <main className="relative z-10 mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <header className="flex flex-wrap items-end justify-between gap-3 mb-5">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-indigo-900 flex items-center gap-2">
              <InboxIcon className="h-6 w-6" /> Telegram Inbox
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Auto-syncs every PDF, image, and link posted in your Sidheswar Civil Mentor channel.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showArchived ? "default" : "outline"}
              size="sm"
              onClick={() => setShowArchived((v) => !v)}
            >
              <Archive className="h-4 w-4 mr-1.5" />
              {showArchived ? "Showing archived" : "Show archived"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => q.refetch()} disabled={q.isFetching}>
              <RefreshCw className={`h-4 w-4 ${q.isFetching ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </header>

        <section className="mb-5 rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-amber-50/40 p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-indigo-900">
              <CalendarIcon className="h-5 w-5" />
              <span className="font-serif font-semibold">Pick a date</span>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" onClick={() => shiftDay(-1)}>
                ‹
              </Button>
              <input
                type="date"
                value={selectedDate}
                max={todayIso()}
                onChange={(e) => {
                  setSelectedDate(e.target.value || todayIso());
                  setDateFilterOn(true);
                }}
                className="h-9 rounded-md border border-indigo-300 bg-indigo-50/80 backdrop-blur px-2 text-sm text-indigo-900"
              />
              <Button size="sm" variant="outline" onClick={() => shiftDay(1)} disabled={selectedDate >= todayIso()}>
                ›
              </Button>
            </div>
            <Button
              size="sm"
              variant={dateFilterOn ? "default" : "outline"}
              onClick={() => setDateFilterOn((v) => !v)}
            >
              {dateFilterOn ? "Date filter ON" : "Date filter OFF"}
            </Button>
            <Button
              size="sm"
              onClick={() => { setSelectedDate(todayIso()); setDateFilterOn(true); }}
              variant="ghost"
            >
              Today
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="secondary" className="text-[11px]">
                {filteredItems.length} item{filteredItems.length === 1 ? "" : "s"}
              </Badge>
              <Button
                size="sm"
                onClick={fetchDayMaterial}
                disabled={busyId !== null}
                className="bg-indigo-700 hover:bg-indigo-800"
              >
                {busyId ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                )}
                Fetch & analyse {selectedDate}
              </Button>
            </div>
          </div>
          <p className="mt-2 text-xs text-indigo-900/70">
            AI will pull the newspaper PDF posted on the selected day from your Telegram channel and start the full UPSC analysis.
          </p>
        </section>

        {q.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading inbox…
          </div>
        ) : !filteredItems.length ? (
          <div className="rounded-xl border border-dashed border-indigo-300 bg-indigo-50/60 backdrop-blur-md p-10 text-center shadow-sm">
            <InboxIcon className="mx-auto h-8 w-8 text-muted-foreground" />
            <h3 className="mt-3 font-serif text-lg">
              {showArchived
                ? "No archived items"
                : dateFilterOn
                ? `Nothing posted on ${selectedDate}`
                : "No incoming posts yet"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {dateFilterOn
                ? "Try another date, or turn off the date filter to see everything."
                : "Post a PDF, image, or link in the channel — it appears here within seconds."}
            </p>
          </div>
        ) : (
          <ul className="grid gap-3">
            {filteredItems.map((it) => (
              <li
                key={it.id}
                className="rounded-xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50/80 via-sky-50/70 to-amber-50/60 backdrop-blur-md p-4 shadow-sm hover:from-indigo-100/80 hover:via-sky-100/70 hover:to-amber-100/60 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    {it.kind === "pdf" ? (
                      <FileText className="h-6 w-6 text-rose-600" />
                    ) : it.kind === "image" ? (
                      <ImageIcon className="h-6 w-6 text-emerald-600" />
                    ) : (
                      <LinkIcon className="h-6 w-6 text-sky-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium truncate">
                        {it.file_name || it.source_url || it.caption?.slice(0, 80) || "Untitled"}
                      </span>
                      <Badge variant="outline" className="uppercase text-[10px]">
                        {it.kind}
                      </Badge>
                      {it.archived_at && (
                        <Badge variant="secondary" className="text-[10px]">archived</Badge>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="ml-auto h-7 w-7 text-rose-600 hover:bg-rose-100 hover:text-rose-700"
                        onClick={() => {
                          if (confirm("Delete this inbox item permanently?")) deleteMut.mutate(it.id);
                        }}
                        disabled={deleteMut.isPending}
                        aria-label="Delete"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {it.caption && it.file_name && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {it.caption}
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {new Date(it.posted_at).toLocaleString()}
                      {it.size_bytes ? ` · ${Math.round(it.size_bytes / 1024).toLocaleString()} KB` : ""}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {it.kind === "link" && it.source_url ? (
                    <Button asChild size="sm" variant="outline">
                      <a href={it.source_url} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Open link
                      </a>
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        onClick={() => doImport(it, null)}
                        disabled={busyId === it.id}
                      >
                        {busyId === it.id && busyAction === "import" ? (
                          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5 mr-1.5" />
                        )}
                        Import
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-rose-300 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                        onClick={() => {
                          if (confirm("Delete this inbox item permanently?")) deleteMut.mutate(it.id);
                        }}
                        disabled={deleteMut.isPending}
                        aria-label="Delete"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                      </Button>
                      {it.kind === "pdf" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => doImport(it, "newspaper")}
                            disabled={busyId === it.id}
                            className="border-green-400 text-green-700 hover:bg-green-50 animate-pulse"
                          >
                            <Newspaper className="h-3.5 w-3.5 mr-1.5" /> Analyse as Newspaper
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => doImport(it, "short_notes")}
                            disabled={busyId === it.id}
                          >
                            <BookOpen className="h-3.5 w-3.5 mr-1.5" /> Generate Notes
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => doImport(it, "handwritten_notes")}
                            disabled={busyId === it.id}
                          >
                            <PenLine className="h-3.5 w-3.5 mr-1.5" /> Handwritten Notes
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => doImport(it, "infographics")}
                            disabled={busyId === it.id}
                          >
                            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Generate Infographic
                          </Button>
                        </>
                      )}
                    </>
                  )}

                  <div className="ml-auto flex gap-2">
                    {it.archived_at ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => archiveMut.mutate({ itemId: it.id, archived: false })}
                        disabled={archiveMut.isPending}
                      >
                        <ArchiveRestore className="h-3.5 w-3.5 mr-1.5" /> Unarchive
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => archiveMut.mutate({ itemId: it.id, archived: true })}
                        disabled={archiveMut.isPending}
                      >
                        <Archive className="h-3.5 w-3.5 mr-1.5" /> Archive
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                      onClick={() => {
                        if (confirm("Delete this inbox item permanently?")) deleteMut.mutate(it.id);
                      }}
                      disabled={deleteMut.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        </main>
      </div>
    </AppShell>
  );
}
