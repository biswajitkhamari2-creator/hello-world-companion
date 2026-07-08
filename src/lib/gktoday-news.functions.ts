import { createServerFn } from "@tanstack/react-start";

export interface GkTodayNewsItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  description?: string;
  category: string;
}

// GKToday RSS is disabled by the publisher, so we scrape the public HTML pages.
// Combine paginated current-affairs feed with date-based archives so we can pull
// items across the last several days rather than only the latest 10.
function buildPages(): { url: string; label: string }[] {
  const pages: { url: string; label: string }[] = [];
  // Paginated current-affairs feed (10 items each).
  for (let p = 1; p <= 6; p++) {
    pages.push({
      url: p === 1
        ? "https://www.gktoday.in/current-affairs/"
        : `https://www.gktoday.in/current-affairs/page/${p}/`,
      label: "GKToday Current Affairs",
    });
  }
  // Date-based archives for the last 7 days (WordPress /YYYY/MM/DD/).
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setUTCDate(now.getUTCDate() - i);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    pages.push({ url: `https://www.gktoday.in/${y}/${m}/${day}/`, label: "GKToday" });
  }
  return pages;
}
const PAGES = buildPages();

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
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

function parseHtml(html: string, source: string): GkTodayNewsItem[] {
  const items: GkTodayNewsItem[] = [];
  // Each post: <h3><a href="...">Title</a></h3> then excerpt text and a
  // <p class="home-post-data-meta"> block containing the date.
  const re = /<h3[^>]*>\s*<a[^>]+href="(https:\/\/www\.gktoday\.in\/[a-z0-9-]+\/)"[^>]*>([\s\S]{5,300}?)<\/a>\s*<\/h3>([\s\S]{0,2000}?)<p[^>]*class="home-post-data-meta"[^>]*>([\s\S]{0,1500}?)<\/p>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const link = m[1];
    if (/\/(current-affairs|category|gk-questions|ebooks|hindi|about-us|privacy-policy|my-account|cart|index-of-topics)\/?$/i.test(link)) continue;
    const title = decodeEntities(stripHtml(m[2]));
    if (!title || title.length < 5) continue;
    const desc = stripHtml(m[3]).slice(0, 320);
    const metaText = stripHtml(m[4]);
    // e.g. "July 8, 2026    Awards, Honours..."
    const dateMatch = metaText.match(/([A-Z][a-z]+ \d{1,2},\s*\d{4})/);
    const pubDate = dateMatch ? new Date(dateMatch[1]).toISOString() : "";
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
    PAGES.map(async (f) => {
      const res = await fetch(f.url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        signal: AbortSignal.timeout(12_000),
      });
      if (!res.ok) return [];
      return parseHtml(await res.text(), f.label);
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
