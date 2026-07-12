// Client for local Python FastAPI backend.
// Base URL overridable via VITE_FASTAPI_URL; defaults to http://localhost:8000.
import { useQuery } from "@tanstack/react-query";

export const FASTAPI_BASE =
  (typeof import.meta !== "undefined" && (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_FASTAPI_URL) ||
  "http://localhost:8000";

async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${FASTAPI_BASE}${path}`, {
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