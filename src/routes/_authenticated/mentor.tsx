import { createFileRoute, Link } from "@tanstack/react-router";
import type { UIMessage } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Check, Copy, FileText, ImageIcon, Mic, MicOff, Paperclip, RefreshCw, Send, Server, Sparkles, Square, Volume2, VolumeX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BrandMark } from "@/components/brand-mark";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getFastApiBase, setFastApiBase, isMixedContentBlocked } from "@/lib/fastapi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/mentor")({
  validateSearch: (s: Record<string, unknown>) => ({ seed: typeof s.seed === "string" ? s.seed : undefined }),
  head: () => ({
    meta: [
      { title: "AI Mentor — UPSC Mitra" },
      {
        name: "description",
        content:
          "Chat with an AI UPSC mentor. Ask any syllabus topic, get exam-grade explanations, and use voice input/output.",
      },
    ],
  }),
  component: MentorPage,
});

type Mode = "simple" | "advanced";

// Minimal types for Web Speech (avoids dom-lib version variance)
type SR = {
  start: () => void;
  stop: () => void;
  abort: () => void;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> & { length: number } }) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

function getSpeechRecognition(): (new () => SR) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function messageText(m: UIMessage): string {
  return (m.parts ?? [])
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("");
}

function friendlyMentorError(message?: string): string {
  const raw = message?.trim();
  if (!raw) return "AI Mentor could not answer right now. Please retry.";
  const lower = raw.toLowerCase();

  if (lower.includes("mixed content") || lower.includes("browser is on https")) {
    return raw;
  }
  if (lower.includes("failed to fetch") || lower.includes("networkerror") || lower.includes("load failed")) {
    const base = getFastApiBase();
    if (typeof window !== "undefined" && window.location.protocol === "https:" && base.startsWith("http://")) {
      return `The preview runs on HTTPS but your backend URL (${base}) is HTTP. Browsers block that. Expose your backend via an HTTPS tunnel (e.g. ngrok) and paste the HTTPS URL in the Backend URL setting.`;
    }
    return `AI Mentor could not reach the backend at ${base}. Make sure the Python FastAPI server is running and CORS is enabled.`;
  }
  if (lower.includes("<!doctype") || lower.includes("<html") || lower.includes("this page didn't load")) {
    return "AI Mentor service did not load correctly. Please retry.";
  }
  if (lower.includes("quota") || lower.includes("rate") || lower.includes("too many requests") || lower.includes("limit reached")) {
    return "AI Mentor limit reached for the moment. Please wait about one minute and retry.";
  }
  if (lower.includes("api key") || lower.includes("unauthorised") || lower.includes("unauthorized") || lower.includes("forbidden")) {
    return "AI Mentor is not authorised right now. Please check the AI key configuration.";
  }
  return raw.length > 180 ? "AI Mentor could not answer right now. Please retry." : raw;
}

type Attachment = { id: string; name: string; mediaType: string; url: string; size: number };

const ACCEPTED_TYPES = "application/pdf,image/png,image/jpeg,image/webp,image/gif";
const MAX_FILE_BYTES = 100 * 1024 * 1024; // 100MB per file (Cloudflare Workers request body limit)
const MAX_FILES = 4;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(r.error);
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(file);
  });
}

const STARTERS = [
  "Explain Fundamental Rights vs Directive Principles with PYQ links.",
  "Walk me through the Indian monsoon mechanism for Prelims & Mains.",
  "Summarise the Doctrine of Basic Structure with landmark judgements.",
  "What current affairs themes are likely in GS2 this year?",
];

type ChatStatus = "ready" | "submitted" | "streaming" | "error";
type SendPart = { type: "text"; text: string } | { type: "file"; mediaType: string; url: string; filename?: string };
type SendPayload = { role: "user"; parts: SendPart[] };

function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function partsToText(parts: SendPart[]): string {
  return parts.filter((p): p is Extract<SendPart, { type: "text" }> => p.type === "text").map((p) => p.text).join("\n");
}

function extractReply(payload: unknown): string {
  if (payload == null) return "";
  if (typeof payload === "string") return payload;
  if (typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    for (const key of ["reply", "response", "answer", "message", "text", "content", "output"]) {
      const v = obj[key];
      if (typeof v === "string" && v.trim()) return v;
    }
    if (Array.isArray(obj.choices) && obj.choices.length > 0) {
      const c = obj.choices[0] as { message?: { content?: unknown }; text?: unknown };
      if (typeof c?.message?.content === "string") return c.message.content;
      if (typeof c?.text === "string") return c.text;
    }
  }
  return "";
}

function useLocalMentorChat({ mode, onError }: { mode: Mode; onError?: (e: Error) => void }) {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("ready");
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastUserRef = useRef<SendPayload | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus("ready");
  }, []);

  const runRequest = useCallback(async (userMsg: UIMessage, historyForBody: UIMessage[]) => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setStatus("submitted");
    setError(null);
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    let language: string | undefined;
    try {
      const raw = localStorage.getItem("upsc_settings_v1");
      if (raw) language = JSON.parse(raw)?.language;
    } catch {}

    const flatHistory = historyForBody.map((m) => ({
      role: m.role,
      content: partsToText((m.parts ?? []) as SendPart[]),
    }));

    const base = getFastApiBase();
    if (isMixedContentBlocked(base)) {
      const err = new Error(
        `Browser is on HTTPS but backend URL is ${base} (HTTP). Use an HTTPS tunnel (e.g. ngrok) and set it via the Backend URL button in the header.`,
      );
      setError(err);
      setStatus("error");
      onError?.(err);
      abortRef.current = null;
      return;
    }
    try {
      const res = await fetch(`${base}/mentor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ctrl.signal,
        body: JSON.stringify({
          mode,
          language,
          message: partsToText((userMsg.parts ?? []) as SendPart[]),
          messages: flatHistory,
        }),
      });
      if (!res.ok) {
        const raw = await res.text();
        throw new Error(raw || `HTTP ${res.status}`);
      }
      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not readable");
      }
      const decoder = new TextDecoder();
      const assistantId = makeId();
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          parts: [{ type: "text", text: "" }],
        } as unknown as UIMessage,
      ]);
      setStatus("streaming");
      let reply = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        reply += chunk;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? ({ ...m, parts: [{ type: "text", text: reply }] } as unknown as UIMessage)
              : m
          )
        );
      }
      setStatus("ready");
    } catch (e) {
      if ((e as { name?: string }).name === "AbortError") {
        setStatus("ready");
        return;
      }
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err);
      setStatus("error");
      onError?.(err);
    } finally {
      if (abortRef.current === ctrl) {
        abortRef.current = null;
      }
    }
  }, [mode, onError]);

  const sendMessage = useCallback(async (payload: SendPayload) => {
    lastUserRef.current = payload;
    const userMsg: UIMessage = {
      id: makeId(),
      role: "user",
      parts: payload.parts,
    } as unknown as UIMessage;
    const history = [...messages];
    setMessages((prev) => [...prev, userMsg]);
    await runRequest(userMsg, history);
  }, [runRequest, messages]);

  const regenerate = useCallback(async () => {
    const last = lastUserRef.current;
    if (!last) return;
    const userMsg: UIMessage = { id: makeId(), role: "user", parts: last.parts } as unknown as UIMessage;
    const trimmed = messages[messages.length - 1]?.role === "assistant" ? messages.slice(0, -1) : messages;
    const history = trimmed.slice(0, -1);
    setMessages([...trimmed, userMsg]);
    await runRequest(userMsg, history);
  }, [runRequest, messages]);

  return { messages, sendMessage, status, stop, error, regenerate };
}

function MentorPage() {
  const [mode, setMode] = useState<Mode>("simple");
  const [input, setInput] = useState("");
  const [voiceOut, setVoiceOut] = useState(false);
  const [listening, setListening] = useState(false);
  const [backendOpen, setBackendOpen] = useState(false);
  const [backendDraft, setBackendDraft] = useState<string>(() =>
    typeof window === "undefined" ? "" : getFastApiBase(),
  );
  const recognitionRef = useRef<SR | null>(null);
  const spokenIdsRef = useRef<Set<string>>(new Set());
  const scrollerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const addFiles = useCallback(async (files: FileList | File[] | null) => {
    if (!files) return;
    const list = Array.from(files);
    if (!list.length) return;
    const accepted: Attachment[] = [];
    for (const f of list) {
      const isImg = f.type.startsWith("image/");
      const isPdf = f.type === "application/pdf";
      if (!isImg && !isPdf) {
        toast.error(`Unsupported file: ${f.name}`, { description: "Attach PDFs or images only." });
        continue;
      }
      if (f.size > MAX_FILE_BYTES) {
        toast.error(`${f.name} is too large`, { description: "Max 15 MB per file." });
        continue;
      }
      try {
        const url = await readFileAsDataUrl(f);
        accepted.push({ id: crypto.randomUUID(), name: f.name, mediaType: f.type, url, size: f.size });
      } catch {
        toast.error(`Could not read ${f.name}`);
      }
    }
    setAttachments((prev) => {
      const merged = [...prev, ...accepted];
      if (merged.length > MAX_FILES) {
        toast.error(`Max ${MAX_FILES} attachments`, { description: "Extra files were dropped." });
        return merged.slice(0, MAX_FILES);
      }
      return merged;
    });
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const { messages, sendMessage, status, stop, error, regenerate } = useLocalMentorChat({
    mode,
    onError: (e) => {
      console.error("[mentor]", e);
      toast.error("Mentor error", { description: friendlyMentorError(e.message) });
    },
  });

  // Auto-seed from /mentor?seed=... (used by Newspaper "Ask Mentor" and Related links)
  const seed = Route.useSearch().seed;
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current || !seed) return;
    seededRef.current = true;
    let context = "";
    try {
      context = sessionStorage.getItem("mentor_seed_context") || "";
      sessionStorage.removeItem("mentor_seed_context");
    } catch {}
    const text = context
      ? `${seed}\n\nContext from my current study material:\n${context}`
      : seed;
    void sendMessage({ role: "user", parts: [{ type: "text", text }] });
  }, [seed, sendMessage]);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copy = useCallback(async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1500);
    } catch {
      toast.error("Copy failed");
    }
  }, []);

  const isLoading = status === "submitted" || status === "streaming";

  // Auto-scroll
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  // Focus textarea
  useEffect(() => {
    if (!isLoading) textareaRef.current?.focus();
  }, [isLoading]);

  // Speak completed assistant messages
  useEffect(() => {
    if (!voiceOut || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isLoading) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return;
    if (spokenIdsRef.current.has(last.id)) return;
    spokenIdsRef.current.add(last.id);
    const text = messageText(last).replace(/[#*_`>]/g, "").slice(0, 1200);
    if (!text.trim()) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-IN";
    u.rate = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }, [messages, isLoading, voiceOut]);

  // Cleanup speech on unmount
  useEffect(() => () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    recognitionRef.current?.abort();
  }, []);

  const toggleMic = useCallback(() => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) {
      toast.error("Voice input not supported", {
        description: "Use Chrome or Edge for built-in speech recognition.",
      });
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const rec = new Ctor();
    rec.lang = "en-IN";
    rec.continuous = false;
    rec.interimResults = true;
    let finalText = "";
    rec.onresult = (e) => {
      let interim = "";
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i] as ArrayLike<{ transcript: string }> & { isFinal?: boolean };
        const t = r[0].transcript;
        if ((r as { isFinal?: boolean }).isFinal) finalText += t;
        else interim += t;
      }
      setInput((finalText + interim).trim());
    };
    rec.onerror = (e) => {
      console.warn("[mentor:mic]", e.error);
      if (e.error && e.error !== "no-speech") toast.error(`Mic: ${e.error}`);
    };
    rec.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  }, [listening]);

  const submit = useCallback(
    (text: string) => {
      const t = text.trim();
      if ((!t && attachments.length === 0) || isLoading) return;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      const fileParts = attachments.map((a) => ({
        type: "file" as const,
        mediaType: a.mediaType,
        url: a.url,
        filename: a.name,
      }));
      const textPart = t
        ? [{ type: "text" as const, text: t }]
        : [{ type: "text" as const, text: "Please analyse the attached material in UPSC context." }];
      void sendMessage({ role: "user", parts: [...fileParts, ...textPart] });
      setInput("");
      setAttachments([]);
    },
    [attachments, isLoading, sendMessage],
  );

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3 sm:px-6">
          <Button asChild variant="ghost" size="icon" aria-label="Back">
            <Link to="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <BrandMark size="sm" />
          </div>
          <div className="hidden items-center gap-1 rounded-full border border-border bg-background p-1 sm:flex">
            {(["simple", "advanced"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m === "simple" ? "Simple" : "Advanced"}
              </button>
            ))}
          </div>
          <Button
            variant={voiceOut ? "default" : "outline"}
            size="icon"
            onClick={() => {
              if (voiceOut && typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
              setVoiceOut((v) => !v);
            }}
            aria-label={voiceOut ? "Mute voice replies" : "Enable voice replies"}
            title={voiceOut ? "Voice replies on" : "Voice replies off"}
          >
            {voiceOut ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => { setBackendDraft(getFastApiBase()); setBackendOpen(true); }}
            aria-label="Backend URL"
            title="Set backend URL"
          >
            <Server className="h-4 w-4" />
          </Button>
        </div>
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-4 pb-2 sm:hidden">
          <div className="flex items-center gap-1 rounded-full border border-border bg-background p-1">
            {(["simple", "advanced"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )}
              >
                {m === "simple" ? "Simple" : "Advanced"}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground">{voiceOut ? "Voice replies on" : "Voice replies off"}</span>
        </div>
      </header>

      <main ref={scrollerRef} className="mx-auto w-full max-w-4xl flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        {messages.length === 0 ? (
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-paper px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> Your AI UPSC mentor
            </div>
            <h1 className="mt-5 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Ask anything across the <span className="text-accent">UPSC syllabus</span>.
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
              Text or voice. Switch between Simple and Advanced explanations. The mentor anchors every reply in the syllabus and PYQ trends.
            </p>
            <div className="mt-8 grid gap-2 text-left sm:grid-cols-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => submit(s)}
                  className="rounded-xl border border-border bg-paper p-4 text-sm transition-colors hover:border-accent hover:bg-paper/80"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {messages.map((m) => {
              const text = messageText(m);
              const isUser = m.role === "user";
              const fileParts = (m.parts ?? []).filter(
                (p): p is Extract<typeof p, { type: "file" }> => p.type === "file",
              );
              return (
                <div key={m.id} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm sm:max-w-[78%]",
                      isUser
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-paper text-foreground",
                    )}
                  >
                    {fileParts.length > 0 && (
                      <div className={cn("mb-2 flex flex-wrap gap-2", isUser ? "justify-end" : "justify-start")}>
                        {fileParts.map((p, i) => {
                          const isImg = (p.mediaType ?? "").startsWith("image/");
                          return isImg ? (
                            <a
                              key={i}
                              href={p.url}
                              target="_blank"
                              rel="noreferrer"
                              className="block overflow-hidden rounded-lg border border-border/40"
                            >
                              <img src={p.url} alt={p.filename ?? "image"} className="max-h-40 max-w-[180px] object-cover" />
                            </a>
                          ) : (
                            <a
                              key={i}
                              href={p.url}
                              target="_blank"
                              rel="noreferrer"
                              className={cn(
                                "inline-flex items-center gap-2 rounded-lg border px-2 py-1.5 text-xs",
                                isUser
                                  ? "border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground"
                                  : "border-border bg-background text-foreground",
                              )}
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span className="max-w-[160px] truncate">{p.filename ?? "document.pdf"}</span>
                            </a>
                          );
                        })}
                      </div>
                    )}
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{text}</p>
                    ) : (
                      <>
                        <div className="prose prose-sm max-w-none prose-headings:font-serif prose-p:my-2 prose-li:my-0.5 prose-pre:bg-muted prose-pre:text-foreground prose-code:before:hidden prose-code:after:hidden">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text || "…"}</ReactMarkdown>
                        </div>
                        {text && (
                          <div className="mt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => copy(m.id, text)}
                              className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-background px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                              aria-label="Copy reply"
                            >
                              {copiedId === m.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                              {copiedId === m.id ? "Copied" : "Copy"}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            {status === "submitted" && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-border bg-paper px-4 py-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    Thinking
                    <span className="ml-1 inline-flex gap-0.5">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:-0.2s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:-0.1s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent" />
                    </span>
                  </span>
                </div>
              </div>
            )}
            {error && (
              <div className="flex flex-col items-center gap-2 text-center">
                <p className="max-w-md text-xs text-destructive">{friendlyMentorError(error.message)}</p>
                <Button size="sm" variant="outline" onClick={() => regenerate()} className="gap-1">
                  <RefreshCw className="h-3.5 w-3.5" /> Retry
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="sticky bottom-0 z-20 border-t border-border/60 bg-paper/90 backdrop-blur">
        <div
          className="mx-auto w-full max-w-4xl px-4 pt-3 sm:px-6"
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            e.preventDefault();
            void addFiles(e.dataTransfer.files);
          }}
        >
          {attachments.length > 0 && (
            <ul className="mb-2 flex flex-wrap gap-2">
              {attachments.map((a) => {
                const isImg = a.mediaType.startsWith("image/");
                return (
                  <li
                    key={a.id}
                    className="group relative flex items-center gap-2 rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                  >
                    {isImg ? (
                      <img src={a.url} alt={a.name} className="h-8 w-8 rounded object-cover" />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded bg-muted text-muted-foreground">
                        <FileText className="h-4 w-4" />
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="max-w-[160px] truncate font-medium text-foreground">{a.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {isImg ? <ImageIcon className="mr-1 inline h-3 w-3" /> : null}
                        {(a.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(a.id)}
                      aria-label={`Remove ${a.name}`}
                      className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <form
          className="mx-auto flex max-w-4xl items-end gap-2 px-4 py-3 sm:px-6"
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            multiple
            className="hidden"
            onChange={(e) => {
              void addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach PDF or image"
            title="Attach PDF or image"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={listening ? "default" : "outline"}
            size="icon"
            onClick={toggleMic}
            aria-label={listening ? "Stop listening" : "Voice input"}
            title={listening ? "Stop" : "Voice input"}
            className={cn(listening && "animate-pulse")}
          >
            {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
            onPaste={(e) => {
              const files = Array.from(e.clipboardData.files ?? []);
              if (files.length) {
                e.preventDefault();
                void addFiles(files);
              }
            }}
            rows={1}
            placeholder={listening ? "Listening…" : "Ask the mentor anything (Shift+Enter for new line)"}
            className="max-h-40 min-h-[44px] flex-1 resize-none bg-background"
          />
          {isLoading ? (
            <Button type="button" variant="destructive" size="icon" onClick={stop} aria-label="Stop generating">
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() && attachments.length === 0}
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </form>
      </footer>

      <Dialog open={backendOpen} onOpenChange={setBackendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Backend URL</DialogTitle>
            <DialogDescription>
              The AI Mentor calls your local Python FastAPI server. The Lovable preview runs on
              HTTPS, so <strong>http://localhost:8000</strong> is blocked by the browser (mixed
              content). Expose your backend via an HTTPS tunnel (e.g. <code>ngrok http 8000</code>)
              and paste the HTTPS URL below. Leave blank to reset to <code>http://localhost:8000</code>
              (only works when you run the frontend locally too).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              value={backendDraft}
              onChange={(e) => setBackendDraft(e.target.value)}
              placeholder="https://your-tunnel.ngrok-free.app"
              autoFocus
            />
            {typeof window !== "undefined" && window.location.protocol === "https:" && backendDraft.startsWith("http://") && (
              <p className="text-xs text-amber-600">
                Warning: this is an HTTP URL. The browser will block requests from an HTTPS preview.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBackendOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                setFastApiBase(backendDraft);
                setBackendOpen(false);
                toast.success("Backend URL saved", { description: getFastApiBase() });
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
