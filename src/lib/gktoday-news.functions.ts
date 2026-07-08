import { createServerFn } from "@tanstack/react-start";

export interface GkTodayNewsItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  description?: string;
  category: string;
}

const FEEDS: { url: string; label: string }[] = [
  { url: "https://www.gktoday.in/feed/", label: "GKToday" },
  { url: "https://www.gktoday.in/category/current-affairs/feed/", label: "GKToday Current Affairs" },
  { url: "https://www.gktoday.in/category/current-affairs/current-affairs-national/feed/", label: "GKToday National" },
  { url: "https://www.gktoday.in/category/current-affairs/current-affairs-international/feed/", label: "GKToday International" },
];

function pick(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  if (!m) return "";
  return m[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim();
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function unwrapGoogleLink(descRaw: string, fallback: string): string {
  const hrefMatch = descRaw.match(/<a[^>]+href=["']([^"']+)["']/i);
  if (hrefMatch && /gktoday\.in/i.test(hrefMatch[1])) return hrefMatch[1];
  return fallback;
}

function cleanTitle(t: string): string {
  return t.replace(/\s*-\s*GK\s*Today\s*$/i, "").trim();
}

function classify(text: string): string {
  const t = text.toLowerCase();
  if (/economy|gdp|inflation|rbi|budget|fiscal|gst|trade|export|import|market|sensex|nifty|msme/.test(t)) return "Economy";
  if (/isro|drdo|satellite|space|ai\b|artificial intelligence|semiconductor|biotech|research|technolog|quantum|chip/.test(t)) return "Science & Tech";
  if (/environment|climate|pollut|forest|wildlife|tiger|elephant|biodivers|ecolog|river|cyclone|mangrove/.test(t)) return "Environment";
  if (/defence|missile|army|navy|air force|border|security|terror|cyber|drone|exercise/.test(t)) return "Defence & Security";
  if (/bilateral|treaty|summit|un\b|unesco|world bank|imf|foreign|diplomat|g20|g7|brics|quad|asean|saarc/.test(t)) return "International";
  if (/scheme|yojana|mission|welfare|tribal|women|child|health|education|scholarship|pension|ration|pds/.test(t)) return "Schemes";
  if (/constitution|parliament|cabinet|assembly|governor|chief minister|bill\b|amendment|policy|governance|court|verdict|election/.test(t)) return "Polity";
  if (/history|heritage|culture|monument|temple|festival|art|literature|archaeolog/.test(t)) return "Art & Culture";
  return "General Studies";
}

function parseRss(xml: string, source: string): GkTodayNewsItem[] {
  const items: GkTodayNewsItem[] = [];
  const matches = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  for (const raw of matches) {
    const titleRaw = pick(raw, "title");
    const linkRaw = pick(raw, "link");
    const pubDate = pick(raw, "pubDate") || pick(raw, "dc:date");
    const descRaw = pick(raw, "description");
    const link = unwrapGoogleLink(descRaw, linkRaw);
    if (!titleRaw || !link) continue;
    if (!/gktoday\.in/i.test(link)) continue;
    const title = cleanTitle(titleRaw);
    const desc = stripHtml(descRaw).slice(0, 400);
    items.push({
      title,
      link,
      source,
      pubDate,
      description: desc,
      category: classify(`${title} ${desc}`),
    });
  }
  return items;
}

export const getGkTodayNews = createServerFn({ method: "GET" }).handler(async () => {
  const results = await Promise.allSettled(
    FEEDS.map(async (f) => {
      const res = await fetch(f.url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
          Accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
        },
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) return [];
      return parseRss(await res.text(), f.label);
    }),
  );
  const all: GkTodayNewsItem[] = [];
  for (const r of results) if (r.status === "fulfilled") all.push(...r.value);

  const seen = new Set<string>();
  const unique = all.filter((it) => {
    const k = it.link.split("?")[0].toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  unique.sort((a, b) => (Date.parse(b.pubDate) || 0) - (Date.parse(a.pubDate) || 0));
  return { items: unique.slice(0, 60), fetchedAt: new Date().toISOString() };
});
