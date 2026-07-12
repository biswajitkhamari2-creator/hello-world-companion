import { createServerFn } from "@tanstack/react-start";

type SearchResult = { title?: string; url?: string; description?: string; markdown?: string };

export const webSearch = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const obj = (input ?? {}) as { query?: unknown; limit?: unknown };
    const query = typeof obj.query === "string" ? obj.query.trim() : "";
    const limit = typeof obj.limit === "number" ? Math.min(Math.max(obj.limit, 1), 5) : 3;
    if (!query) throw new Error("query is required");
    return { query, limit };
  })
  .handler(async ({ data }): Promise<{ results: SearchResult[]; error?: string }> => {
    const key = process.env.FIRECRAWL_API_KEY || process.env.FIRECRAWAL_API_KEY;
    if (!key) return { results: [], error: "FIRECRAWL_API_KEY or FIRECRAWAL_API_KEY not configured" };
    try {
      const res = await fetch("https://api.firecrawl.dev/v2/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          query: data.query,
          limit: data.limit,
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        return { results: [], error: `Firecrawl ${res.status}: ${body.slice(0, 200)}` };
      }
      const json = (await res.json()) as {
        data?: { web?: SearchResult[] } | SearchResult[];
      };
      const raw = Array.isArray(json.data)
        ? json.data
        : (json.data?.web ?? []);
      const results: SearchResult[] = raw.slice(0, data.limit).map((r) => ({
        title: r.title,
        url: r.url,
        description: r.description,
      }));
      return { results };
    } catch (e) {
      return { results: [], error: e instanceof Error ? e.message : String(e) };
    }
  });