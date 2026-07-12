// Client for local Python FastAPI backend.
// Priority: localStorage("fastapi_base_url") > VITE_FASTAPI_URL > http://localhost:8000
import { useQuery } from "@tanstack/react-query";

const LS_KEY = "fastapi_base_url";
const ENV_URL =
  (typeof import.meta !== "undefined" && (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_FASTAPI_URL) ||
  "";
const DEFAULT_URL = "https://python-backend-ivory-two.vercel.app";

export function getFastApiBase(): string {
  if (typeof window !== "undefined") {
    try {
      const saved = window.localStorage.getItem(LS_KEY);
      if (saved && saved.trim()) return saved.trim().replace(/\/+$/, "");
    } catch {
      // Storage can be blocked in embedded previews/private modes; use the configured default.
    }
  }
  return (ENV_URL || DEFAULT_URL).replace(/\/+$/, "");
}

export function setFastApiBase(url: string): void {
  if (typeof window === "undefined") return;
  const clean = url.trim().replace(/\/+$/, "");
  try {
    if (clean) window.localStorage.setItem(LS_KEY, clean);
    else window.localStorage.removeItem(LS_KEY);
    window.dispatchEvent(new CustomEvent("fastapi-base:updated"));
  } catch {
    // Ignore storage failures so the mentor page keeps loading.
  }
}

/** @deprecated use getFastApiBase() — kept for callers that already imported it */
export const FASTAPI_BASE = ENV_URL || DEFAULT_URL;

export function isMixedContentBlocked(url: string): boolean {
  if (typeof window === "undefined") return false;
  return window.location.protocol === "https:" && url.startsWith("http://");
}

async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const base = getFastApiBase();
  if (isMixedContentBlocked(base)) {
    throw new Error(
      `Browser is on HTTPS but backend URL is ${base} (HTTP). Use an HTTPS tunnel (e.g. ngrok) and set it in the Backend URL setting.`,
    );
  }
  const res = await fetch(`${base}${path}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  });
  if (!res.ok) {
    throw new Error(`FastAPI ${path} failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

// ---- Types (loose — backend response is trusted to be JSON) ----
export type FastApiNewsItem = {
  title?: string;
  url?: string;
  link?: string;
  source?: string;
  published?: string;
  pubDate?: string;
  summary?: string;
  description?: string;
  category?: string;
  gs?: string;
  [k: string]: unknown;
};

export type FastApiSummary = {
  executive_summary?: string;
  top_10_current_affairs?: Array<string | { title?: string; summary?: string }>;
  upsc_gs_mapping?: Record<string, string[] | string> | Array<{ gs?: string; topics?: string[] | string }>;
  prelims_facts?: string[];
  editorial_analysis?: string | Array<{ title?: string; analysis?: string }>;
  important_data?: Array<string | { label?: string; value?: string }>;
  keywords?: string[];
  revision_notes?: string | string[];
  [k: string]: unknown;
};

export type FastApiMCQ = {
  question?: string;
  q?: string;
  options?: string[];
  opts?: string[];
  answer?: number | string;
  ans?: number | string;
  explanation?: string;
  expl?: string;
  topic?: string;
  [k: string]: unknown;
};

export type FastApiMainsQ = {
  question?: string;
  q?: string;
  gs?: string;
  paper?: string;
  marks?: number;
  word_limit?: number;
  hints?: string[] | string;
  model_answer?: string;
  [k: string]: unknown;
};

export type FastApiInterviewQ = {
  question?: string;
  q?: string;
  category?: string;
  hints?: string[] | string;
  sample_answer?: string;
  [k: string]: unknown;
};

// ---- Hooks ----
const commonOpts = {
  staleTime: 60_000,
  gcTime: 5 * 60_000,
  retry: 1,
};

export function useFastApiNews() {
  return useQuery({
    queryKey: ["fastapi", "news"],
    queryFn: ({ signal }) =>
      apiGet<FastApiNewsItem[] | { items?: FastApiNewsItem[] }>("/news", signal),
    ...commonOpts,
  });
}

export function useFastApiSummary() {
  return useQuery({
    queryKey: ["fastapi", "summary"],
    queryFn: ({ signal }) => apiGet<FastApiSummary>("/summary", signal),
    ...commonOpts,
  });
}

export function useFastApiMcqs() {
  return useQuery({
    queryKey: ["fastapi", "mcqs"],
    queryFn: ({ signal }) =>
      apiGet<FastApiMCQ[] | { items?: FastApiMCQ[] }>("/mcqs", signal),
    ...commonOpts,
  });
}

export function useFastApiMains() {
  return useQuery({
    queryKey: ["fastapi", "mains"],
    queryFn: ({ signal }) =>
      apiGet<FastApiMainsQ[] | { items?: FastApiMainsQ[] }>("/mains", signal),
    ...commonOpts,
  });
}

export function useFastApiInterview() {
  return useQuery({
    queryKey: ["fastapi", "interview"],
    queryFn: ({ signal }) =>
      apiGet<FastApiInterviewQ[] | { items?: FastApiInterviewQ[] }>("/interview", signal),
    ...commonOpts,
  });
}

// Normalize a list response that could be an array or { items: [] }
export function toList<T>(data: T[] | { items?: T[] } | undefined | null): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return Array.isArray(data.items) ? data.items : [];
}