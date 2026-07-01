import { createServerFn } from "@tanstack/react-start";

export interface NewsItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
}

const FEEDS: { url: string; source: string }[] = [
  { url: "https://news.google.com/rss/search?q=UPSC+OR+%22civil+services%22+OR+%22current+affairs+India%22&hl=en-IN&gl=IN&ceid=IN:en", source: "Google News" },
  { url: "https://www.thehindu.com/news/national/feeder/default.rss", source: "The Hindu" },
  { url: "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3", source: "PIB" },
];

function pick(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  if (!m) return "";
  return m[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim();
}

function parseRss(xml: string, source: string): NewsItem[] {
  const items: NewsItem[] = [];
  const matches = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  for (const raw of matches) {
    const title = pick(raw, "title");
    const link = pick(raw, "link");
    const pubDate = pick(raw, "pubDate") || pick(raw, "dc:date");
    if (title && link) items.push({ title, link, source, pubDate });
  }
  return items;
}

const UPSC_KEYWORDS = /\b(upsc|ias|civil services|prelims|mains|gs[- ]?[i1-4]|parliament|supreme court|constitution|policy|scheme|sc\/st|governance|economy|budget|monsoon|isro|drdo|defence|geopolitic|un[a-z]*|g20|brics|climate|biodiversity|environment|ministry|cabinet|niti aayog|rbi|inflation|gdp|census)\b/i;

export const getUpscNews = createServerFn({ method: "GET" }).handler(async () => {
  const results = await Promise.allSettled(
    FEEDS.map(async (f) => {
      const res = await fetch(f.url, {
        headers: { "User-Agent": "Mozilla/5.0 UPSC-News-Bot" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return [];
      const xml = await res.text();
      return parseRss(xml, f.source);
    }),
  );
  const all: NewsItem[] = [];
  for (const r of results) if (r.status === "fulfilled") all.push(...r.value);

  // Filter The Hindu / PIB to UPSC-relevant only (Google News query already scoped)
  const filtered = all.filter((it) =>
    it.source === "Google News" ? true : UPSC_KEYWORDS.test(it.title),
  );

  // Dedupe by title
  const seen = new Set<string>();
  const unique = filtered.filter((it) => {
    const k = it.title.toLowerCase().slice(0, 80);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  unique.sort((a, b) => {
    const ta = Date.parse(a.pubDate) || 0;
    const tb = Date.parse(b.pubDate) || 0;
    return tb - ta;
  });

  return { items: unique.slice(0, 15), fetchedAt: new Date().toISOString() };
});