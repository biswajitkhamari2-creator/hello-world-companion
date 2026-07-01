import { createServerFn } from "@tanstack/react-start";

export interface InstitutionItem {
  title: string;
  link: string;
  category: string;
  date: string;
  source: string;
  kind: "daily" | "weekly";
}

function slugToTitle(slug: string): string {
  return slug
    .replace(/-\d+$/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function prettyCategory(cat: string): string {
  return cat.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.text();
}

function extractArticles(
  html: string,
  kind: "daily" | "weekly",
  base: "news-today" | "weekly-focus",
  source: string,
): InstitutionItem[] {
  const re = new RegExp(
    `href=["'](?:https?://visionias\\.in)?(/current-affairs/${base}/(\\d{4}-\\d{2}-\\d{2})/([a-z0-9-]+)/([a-z0-9-]+))["']`,
    "gi",
  );
  const seen = new Set<string>();
  const out: InstitutionItem[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const [, path, date, category, slug] = m;
    const key = path;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      title: slugToTitle(slug),
      link: `https://visionias.in${path}`,
      category: prettyCategory(category),
      date,
      source,
      kind,
    });
  }
  return out;
}

export const getInstitutionNews = createServerFn({ method: "GET" }).handler(
  async () => {
    const targets = [
      {
        url: "https://visionias.in/current-affairs/news-today",
        kind: "daily" as const,
        base: "news-today" as const,
        source: "Vision IAS · Daily",
      },
      {
        url: "https://visionias.in/current-affairs/news-today/archive",
        kind: "daily" as const,
        base: "news-today" as const,
        source: "Vision IAS · Daily",
      },
      {
        url: "https://visionias.in/current-affairs/weekly-focus",
        kind: "weekly" as const,
        base: "weekly-focus" as const,
        source: "Vision IAS · Weekly Focus",
      },
      {
        url: "https://visionias.in/current-affairs/weekly-focus/archive",
        kind: "weekly" as const,
        base: "weekly-focus" as const,
        source: "Vision IAS · Weekly Focus",
      },
    ];

    const results = await Promise.allSettled(
      targets.map(async (t) => {
        const html = await fetchHtml(t.url);
        return extractArticles(html, t.kind, t.base, t.source);
      }),
    );

    const daily: InstitutionItem[] = [];
    const weekly: InstitutionItem[] = [];
    for (const r of results) {
      if (r.status !== "fulfilled") continue;
      for (const it of r.value) (it.kind === "daily" ? daily : weekly).push(it);
    }

    const dedupe = (arr: InstitutionItem[]) => {
      const seen = new Set<string>();
      return arr.filter((it) => {
        if (seen.has(it.link)) return false;
        seen.add(it.link);
        return true;
      });
    };

    const sort = (arr: InstitutionItem[]) =>
      arr.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

    return {
      daily: sort(dedupe(daily)).slice(0, 60),
      weekly: sort(dedupe(weekly)).slice(0, 40),
      fetchedAt: new Date().toISOString(),
    };
  },
);

// Fetch full article content for PDF export / reading
export const getInstitutionArticle = createServerFn({ method: "POST" })
  .inputValidator((data: { url: string }) => {
    if (!/^https:\/\/visionias\.in\/current-affairs\//.test(data.url)) {
      throw new Error("Only visionias.in URLs are allowed");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const html = await fetchHtml(data.url);
    // Try to extract main content: strip head, scripts, styles, nav, footer.
    let body = html
      .replace(/<head[\s\S]*?<\/head>/gi, "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[\s\S]*?<\/header>/gi, "");

    // Prefer the main article container Vision IAS uses.
    const articleMatch =
      body.match(/<article[\s\S]*?<\/article>/i) ||
      body.match(/<main[\s\S]*?<\/main>/i) ||
      body.match(/<div[^>]+class=["'][^"']*(?:article|content|post|entry)[^"']*["'][\s\S]*?<\/div>/i);
    if (articleMatch) body = articleMatch[0];

    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "";

    // Convert to lightweight HTML the client can render + print.
    const cleaned = body
      .replace(/\s+(class|id|style|data-[a-z-]+)="[^"]*"/gi, "")
      .replace(/<img([^>]*)>/gi, (_m, attrs: string) => {
        const src = attrs.match(/src="([^"]+)"/i)?.[1];
        if (!src) return "";
        const abs = src.startsWith("http") ? src : `https://visionias.in${src.startsWith("/") ? src : "/" + src}`;
        return `<img src="${abs}" style="max-width:100%;height:auto;" />`;
      })
      .replace(/<a\s+href="\/([^"]+)"/gi, '<a href="https://visionias.in/$1"')
      .replace(/<a /gi, '<a target="_blank" rel="noopener" ');

    return { title, html: cleaned };
  });