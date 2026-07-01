import { createServerFn } from "@tanstack/react-start";

export interface NewsItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  gs: "GS1" | "GS2" | "GS3" | "GS4";
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

// GS syllabus classifiers (order matters — GS4 first as it's most specific)
const GS_RULES: { gs: NewsItem["gs"]; re: RegExp }[] = [
  {
    gs: "GS4",
    re: /\b(ethic|integrity|moral|corrupt|probity|conduct|accountab|transparen|whistleblow|conflict of interest)\b/i,
  },
  {
    gs: "GS3",
    re: /\b(econom|budget|gdp|inflation|rbi|fiscal|tax|gst|agricultur|farmer|msp|environment|climate|biodivers|pollut|forest|wildlife|disaster|flood|earthquake|cyclone|science|technolog|isro|drdo|defence|defense|security|cyber|terror|naxal|infrastructur|energy|renewable|space|semiconductor|ai\b|artificial intelligence)\b/i,
  },
  {
    gs: "GS2",
    re: /\b(polit|constitution|parliament|supreme court|high court|governance|ministry|cabinet|niti aayog|scheme|policy|welfare|education|health|bilateral|diplomacy|foreign|treaty|un\b|united nations|g20|brics|sco|quad|saarc|neighbour|china|pakistan|usa|russia|election|bill\b|act\b|amendment|judiciary|federal|panchayat|rti|cag)\b/i,
  },
  {
    gs: "GS1",
    re: /\b(history|heritage|culture|art\b|monument|archaeolog|geograph|society|women|gender|caste|tribal|population|urbanis|migration|festival|dance|music|architectur|ancient|medieval|freedom struggle)\b/i,
  },
];

function classifyGs(title: string): NewsItem["gs"] | null {
  for (const r of GS_RULES) if (r.re.test(title)) return r.gs;
  return null;
}

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

  // Filter to UPSC-relevant AND classifiable into GS1–GS4
  const filtered: NewsItem[] = [];
  for (const it of all) {
    if (it.source !== "Google News" && !UPSC_KEYWORDS.test(it.title)) continue;
    const gs = classifyGs(it.title);
    if (!gs) continue;
    filtered.push({ ...it, gs });
  }

  // Dedupe by title
  const seen = new Set<string>();
  const unique = filtered.filter((it) => {
    const k = it.title.toLowerCase().slice(0, 80);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  unique.sort((a: NewsItem, b: NewsItem) => {
    const ta = Date.parse(a.pubDate) || 0;
    const tb = Date.parse(b.pubDate) || 0;
    return tb - ta;
  });

  return { items: unique.slice(0, 40), fetchedAt: new Date().toISOString() };
});