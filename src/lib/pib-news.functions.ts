import { createServerFn } from "@tanstack/react-start";

export interface PibNewsItem {
  title: string;
  link: string;
  ministry: string;
  prid: string;
  pubDate: string; // ISO
  category: string;
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

function stripTags(s: string): string {
  return decodeEntities(s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function classify(text: string, ministry: string): string {
  const t = `${text} ${ministry}`.toLowerCase();
  if (/finance|economy|gdp|gst|budget|tax|revenue|banking|rbi|inflation|msme|trade|export|import/.test(t)) return "Economy";
  if (/defence|army|navy|air force|drdo|border|security|missile|paramilitary/.test(t)) return "Defence";
  if (/external affairs|mea|bilateral|treaty|foreign|diplomat|summit|g20|brics|quad|un\b|unesco/.test(t)) return "International";
  if (/environment|climate|forest|wildlife|pollut|ganga|renewable|solar|biodivers/.test(t)) return "Environment";
  if (/science|technolog|isro|space|satellite|ai\b|semiconductor|biotech|research|innovation|dst|nuclear|atomic/.test(t)) return "Science & Tech";
  if (/health|ayush|medic|vaccine|hospital|icmr|pharma|nutrition/.test(t)) return "Health";
  if (/education|skill|literacy|school|university|ugc|aicte|nep\b|research/.test(t)) return "Education";
  if (/agricultur|farmer|crop|fertiliz|kisan|apeda|horticultur|animal|fisher|dairy/.test(t)) return "Agriculture";
  if (/women|child|tribal|welfare|scheduled|minorit|rural|urban housing|awaas|jal jeevan|swachh/.test(t)) return "Social Welfare";
  if (/court|law|justice|constitution|parliament|cabinet|bill\b|amendment|election|governance|policy/.test(t)) return "Polity";
  if (/culture|heritage|monument|temple|festival|art|literature|archaeolog|sanskrit|tourism/.test(t)) return "Art & Culture";
  if (/railway|road|highway|shipping|port|aviation|airport|infrastructur|metro|logistic|power|energy|coal|petroleum|renewable/.test(t)) return "Infrastructure";
  return "Governance";
}

// PIB "All Releases" listing (English). reg=3 = English, lang=1 = English UI.
// The page groups items by ministry heading (h3.font104) followed by ul.num of releases.
function parseAllRel(html: string, dateISO: string): PibNewsItem[] {
  const items: PibNewsItem[] = [];
  const groupRe = /<h3[^>]*class=['"][^'"]*font104[^'"]*['"][^>]*>([\s\S]*?)<\/h3>\s*<ul[^>]*class=['"][^'"]*num[^'"]*['"][^>]*>([\s\S]*?)<\/ul>/gi;
  let g: RegExpExecArray | null;
  while ((g = groupRe.exec(html)) !== null) {
    const ministry = stripTags(g[1]);
    const body = g[2];
    const linkRe = /<a[^>]+href=['"](\/PressReleasePage\.aspx\?PRID=(\d+))['"][^>]*>([\s\S]*?)<\/a>/gi;
    let m: RegExpExecArray | null;
    while ((m = linkRe.exec(body)) !== null) {
      const href = m[1];
      const prid = m[2];
      const title = stripTags(m[3]);
      if (!title || title.length < 6) continue;
      items.push({
        title,
        link: `https://pib.gov.in${href}`,
        ministry,
        prid,
        pubDate: dateISO,
        category: classify(title, ministry),
      });
    }
  }
  return items;
}

function ymd(d: Date) {
  return {
    y: d.getUTCFullYear(),
    m: String(d.getUTCMonth() + 1).padStart(2, "0"),
    d: String(d.getUTCDate()).padStart(2, "0"),
  };
}

export const getPibNews = createServerFn({ method: "GET" }).handler(async () => {
  // PIB allRel.aspx defaults to today's releases; day/mon/yr query pins to a
  // specific date. Pull last 3 days so the tab always has fresh items even
  // late at night after IST/UTC boundary.
  const now = new Date();
  const targets: { url: string; iso: string }[] = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(now);
    d.setUTCDate(now.getUTCDate() - i);
    const p = ymd(d);
    targets.push({
      url: `https://pib.gov.in/allRel.aspx?reg=3&lang=1&day=${p.d}&mon=${p.m}&yr=${p.y}`,
      iso: d.toISOString(),
    });
  }

  const results = await Promise.allSettled(
    targets.map(async (t) => {
      const res = await fetch(t.url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        signal: AbortSignal.timeout(12_000),
      });
      if (!res.ok) return [];
      return parseAllRel(await res.text(), t.iso);
    }),
  );

  const all: PibNewsItem[] = [];
  for (const r of results) if (r.status === "fulfilled") all.push(...r.value);

  const seen = new Set<string>();
  const unique = all.filter((it) => {
    if (seen.has(it.prid)) return false;
    seen.add(it.prid);
    return true;
  });
  // Newest PRID first (PIB PRID is monotonically increasing per release).
  unique.sort((a, b) => Number(b.prid) - Number(a.prid));
  return { items: unique.slice(0, 150), fetchedAt: new Date().toISOString() };
});