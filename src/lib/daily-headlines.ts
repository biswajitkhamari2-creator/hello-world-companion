import type { NewsHeadline } from "@/lib/newspaper.functions";

const KEY = "upsc.daily.headlines.v1";
const MAX = 24;

export type StoredHeadline = NewsHeadline & {
  id: string;
  source: string;
  paperDate: string;
  addedAt: number;
};

export type DailyHeadlinesState = {
  updatedAt: number;
  items: StoredHeadline[];
};

function safeRead(): DailyHeadlinesState {
  if (typeof window === "undefined") return { updatedAt: 0, items: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { updatedAt: 0, items: [] };
    const parsed = JSON.parse(raw) as DailyHeadlinesState;
    if (!parsed || !Array.isArray(parsed.items)) return { updatedAt: 0, items: [] };
    return parsed;
  } catch {
    return { updatedAt: 0, items: [] };
  }
}

export function loadDailyHeadlines(): DailyHeadlinesState {
  return safeRead();
}

export function saveExtractedHeadlines(
  headlines: NewsHeadline[],
  source: string,
  paperDate: string,
): DailyHeadlinesState {
  if (typeof window === "undefined") return { updatedAt: 0, items: [] };
  const now = Date.now();
  const existing = safeRead();
  const incoming: StoredHeadline[] = headlines.map((h) => ({
    ...h,
    id: `${now}-${Math.random().toString(36).slice(2, 8)}-${h.headline.slice(0, 24)}`,
    source: source || "Newspaper",
    paperDate: paperDate || new Date().toISOString().slice(0, 10),
    addedAt: now,
  }));
  const dedupe = new Map<string, StoredHeadline>();
  for (const item of [...incoming, ...existing.items]) {
    const key = item.headline.trim().toLowerCase();
    if (!dedupe.has(key)) dedupe.set(key, item);
  }
  const rankOrder: Record<string, number> = { "Very High": 0, High: 1, Medium: 2, Low: 3 };
  const items = Array.from(dedupe.values())
    .sort((a, b) => {
      const ra = rankOrder[a.relevance] ?? 2;
      const rb = rankOrder[b.relevance] ?? 2;
      if (ra !== rb) return ra - rb;
      return b.addedAt - a.addedAt;
    })
    .slice(0, MAX);
  const next: DailyHeadlinesState = { updatedAt: now, items };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("daily-headlines:updated"));
  } catch {
    // storage full — ignore
  }
  return next;
}

export function clearDailyHeadlines(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("daily-headlines:updated"));
}