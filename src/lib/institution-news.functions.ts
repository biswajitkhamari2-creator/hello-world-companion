import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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

function pickTag(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  if (!m) return "";
  return m[1].replace(/<!\[CDATA\[|\]\]>/g, "").replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16))).replace(/&amp;/g, "&").trim();
}

function parseDrishtiRss(xml: string): InstitutionItem[] {
  // Drishti's /rss.rss is dominated by quizzes/PDFs. Kept as a light fallback:
  // only include items that clearly link to real articles (news-analysis / editorials / to-the-points).
  const items: InstitutionItem[] = [];
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  for (const raw of blocks) {
    const title = pickTag(raw, "title");
    const link = pickTag(raw, "link");
    const pubDate = pickTag(raw, "pubDate");
    if (!title || !link) continue;
    if (!/\/(daily-updates\/(daily-news-analysis|daily-news-editorials|prelims-facts)|to-the-points)\//i.test(link)) continue;
    if (/\.pdf$/i.test(link)) continue;
    const d = new Date(pubDate);
    const date = isNaN(d.getTime()) ? new Date().toISOString().slice(0, 10) : d.toISOString().slice(0, 10);
    const isWeekly = /to-the-points/i.test(link);
    items.push({
      title,
      link,
      category: isWeekly ? "To The Points" : /editorial/i.test(link) ? "Editorial" : "Daily News",
      date,
      source: isWeekly ? "Drishti IAS · To The Points" : "Drishti IAS · Daily",
      kind: isWeekly ? "weekly" : "daily",
    });
  }
  return items;
}

function scrapeDrishtiListing(
  html: string,
  pattern: RegExp,
  category: string,
  source: string,
  kind: "daily" | "weekly",
): InstitutionItem[] {
  const out: InstitutionItem[] = [];
  const seen = new Set<string>();
  const today = new Date().toISOString().slice(0, 10);
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(html))) {
    const link = m[1];
    if (seen.has(link)) continue;
    seen.add(link);
    const slug = link.split("/").pop() || "";
    if (!slug) continue;
    out.push({
      title: slugToTitle(slug),
      link,
      category,
      date: today,
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

    // Drishti IAS — scrape listing pages (their /rss/* feeds return 404 HTML;
    // /rss.rss only contains quizzes). We hit the actual current-affairs pages.
    const drishtiTargets: Array<{
      url: string;
      pattern: RegExp;
      category: string;
      source: string;
      kind: "daily" | "weekly";
    }> = [
      {
        url: "https://www.drishtiias.com/daily-updates/daily-news-analysis",
        pattern: /href="(https:\/\/www\.drishtiias\.com\/daily-updates\/daily-news-analysis\/[a-z0-9-]+)"/gi,
        category: "Daily News",
        source: "Drishti IAS · Daily",
        kind: "daily",
      },
      {
        url: "https://www.drishtiias.com/daily-updates/daily-news-editorials",
        pattern: /href="(https:\/\/www\.drishtiias\.com\/daily-updates\/daily-news-editorials\/[a-z0-9-]+)"/gi,
        category: "Editorial",
        source: "Drishti IAS · Editorial",
        kind: "daily",
      },
      {
        url: "https://www.drishtiias.com/to-the-points/paper1",
        pattern: /href="(https:\/\/www\.drishtiias\.com\/to-the-points\/paper1\/[a-z0-9-]+)"/gi,
        category: "GS Paper 1",
        source: "Drishti IAS · To The Points",
        kind: "weekly",
      },
      {
        url: "https://www.drishtiias.com/to-the-points/paper2",
        pattern: /href="(https:\/\/www\.drishtiias\.com\/to-the-points\/paper2\/[a-z0-9-]+)"/gi,
        category: "GS Paper 2",
        source: "Drishti IAS · To The Points",
        kind: "weekly",
      },
      {
        url: "https://www.drishtiias.com/to-the-points/paper3",
        pattern: /href="(https:\/\/www\.drishtiias\.com\/to-the-points\/paper3\/[a-z0-9-]+)"/gi,
        category: "GS Paper 3",
        source: "Drishti IAS · To The Points",
        kind: "weekly",
      },
      {
        url: "https://www.drishtiias.com/to-the-points/paper4",
        pattern: /href="(https:\/\/www\.drishtiias\.com\/to-the-points\/paper4\/[a-z0-9-]+)"/gi,
        category: "GS Paper 4",
        source: "Drishti IAS · To The Points",
        kind: "weekly",
      },
    ];

    const drishtiResults = await Promise.allSettled(
      drishtiTargets.map(async (t) => {
        const html = await fetchHtml(t.url);
        return scrapeDrishtiListing(html, t.pattern, t.category, t.source, t.kind);
      }),
    );
    for (const r of drishtiResults) {
      if (r.status !== "fulfilled") continue;
      for (const it of r.value) (it.kind === "daily" ? daily : weekly).push(it);
    }

    // Also try the generic RSS as a lightweight supplement.
    try {
      const dr = await fetchHtml("https://www.drishtiias.com/rss.rss");
      for (const it of parseDrishtiRss(dr)) {
        (it.kind === "daily" ? daily : weekly).push(it);
      }
    } catch {
      // best-effort
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
    if (!/^https:\/\/(visionias\.in|www\.drishtiias\.com)\//.test(data.url)) {
      throw new Error("Only Vision IAS or Drishti IAS URLs are allowed");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const html = await fetchHtml(data.url);
    const isDrishti = /drishtiias\.com/i.test(data.url);
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
        const host = isDrishti ? "https://www.drishtiias.com" : "https://visionias.in";
        const abs = src.startsWith("http") ? src : `${host}${src.startsWith("/") ? src : "/" + src}`;
        return `<img src="${abs}" style="max-width:100%;height:auto;" />`;
      })
      .replace(/<a\s+href="\/([^"]+)"/gi, `<a href="${isDrishti ? "https://www.drishtiias.com" : "https://visionias.in"}/$1"`)
      .replace(/<a /gi, '<a target="_blank" rel="noopener" ');

    return { title, html: cleaned };
  });

// ------------------------------------------------------------------
// Crisp AI notes for an Institution article.
// Never dumps the raw article. Always tags GS paper + subject + topic.
// ------------------------------------------------------------------

export type InstitutionCrispNotes = {
  title: string;
  gsPaper: "GS-1" | "GS-2" | "GS-3" | "GS-4" | "Prelims" | "Essay";
  subject: string; // e.g. Polity, Economy, Geography, Ethics, IR
  topic: string;   // e.g. Governor, Fiscal Federalism, Chilika Lake
  syllabusAnchor: string; // exact syllabus phrase this maps to
  oneLine: string;         // ≤ 30 words, what happened
  whyInNews: string[];     // 2-3 bullets
  keyPoints: string[];     // 5-8 crisp bullets
  facts: string[];         // hard data / figures / dates
  keyTerms: Array<{ term: string; meaning: string }>;
  prelimsAngle: string[];  // 2-3 bullets
  mainsAngle: string[];    // 2-3 bullets, framed as Mains hooks
  probableQuestion: string; // 1 Mains-style question
  sourceUrl: string;
};

export type InstitutionComprehensiveNotes = InstitutionCrispNotes & {
  background: string[];        // 3-6 bullets — historical / constitutional context
  currentStatus: string[];     // 3-6 bullets — where things stand now
  stakeholders: string[];      // 3-5 bullets — actors involved
  challenges: string[];        // 4-6 bullets
  wayForward: string[];        // 4-6 bullets — recommendations / reforms
  relatedSchemes: string[];    // schemes, acts, cases, committees, reports
  internationalAngle: string[]; // 2-4 bullets — global comparison / conventions
  quotes: string[];            // 2-3 crisp quotable lines for Mains answers
  mindMap: string;             // 1 short paragraph tying everything together
};

function htmlToPlain(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export const getInstitutionCrispNotes = createServerFn({ method: "POST" })
  .inputValidator((data: { url: string }) => {
    return z
      .object({
        url: z
          .string()
          .regex(/^https:\/\/(visionias\.in|www\.drishtiias\.com)\//, "Only Vision IAS or Drishti IAS URLs are allowed"),
      })
      .parse(data);
  })
  .handler(async ({ data }): Promise<InstitutionCrispNotes> => {
    const html = await fetchHtml(data.url);
    const isDrishti = /drishtiias\.com/i.test(data.url);
    const stripped = html
      .replace(/<head[\s\S]*?<\/head>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[\s\S]*?<\/header>/gi, "");
    const mainMatch =
      stripped.match(/<article[\s\S]*?<\/article>/i) ||
      stripped.match(/<main[\s\S]*?<\/main>/i) ||
      stripped.match(/<div[^>]+class=["'][^"']*(?:article|content|post|entry)[^"']*["'][\s\S]*?<\/div>/i);
    const bodyHtml = mainMatch ? mainMatch[0] : stripped;
    const text = htmlToPlain(bodyHtml).slice(0, 18000);
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const rawTitle = titleMatch ? titleMatch[1].trim() : "";

    const { createGateway, DEFAULT_MODEL, UPSC_SYSTEM_PROMPT } = await import("./ai-gateway.server");
    const { generateText } = await import("ai");
    const gw = createGateway();

    const prompt = `You are preparing CRISP UPSC/State-PCS notes from a coaching-institute article. DO NOT copy sentences verbatim. Rewrite in tight, aspirant-friendly bullets. Every note MUST be tagged with the correct UPSC GS Paper + Subject + Topic per the official UPSC Civil Services syllabus.

UPSC syllabus mapping (mandatory):
- GS-1 → History, Art & Culture, Indian Society, Geography (Physical/Human/Economic)
- GS-2 → Polity, Constitution, Governance, Social Justice, International Relations
- GS-3 → Economy, Agriculture, Science & Tech, Environment/Ecology/Biodiversity, Internal Security, Disaster Management
- GS-4 → Ethics, Integrity & Aptitude, Case Studies
- Prelims → only when clearly a factual/current-affairs prelims item with no Mains hook
- Essay → philosophical/abstract themes

Return STRICT JSON only, no markdown fences, matching this TypeScript type:
{
  "title": string,                         // clean short title, not the site's <title>
  "gsPaper": "GS-1"|"GS-2"|"GS-3"|"GS-4"|"Prelims"|"Essay",
  "subject": string,                       // e.g. "Polity", "Economy", "Environment"
  "topic": string,                         // specific topic e.g. "Governor's Discretionary Powers"
  "syllabusAnchor": string,                // exact phrase from UPSC syllabus this hits
  "oneLine": string,                       // ≤30 words, what happened
  "whyInNews": string[],                   // 2-3 bullets, why it matters NOW
  "keyPoints": string[],                   // 5-8 crisp bullets, the core content in your own words
  "facts": string[],                       // hard data, dates, numbers, article numbers, case names
  "keyTerms": Array<{term:string, meaning:string}>, // 3-6 exam terms
  "prelimsAngle": string[],                // 2-3 factual hooks for Prelims
  "mainsAngle": string[],                  // 2-3 analytical hooks for Mains
  "probableQuestion": string               // 1 Mains-style question with directive verb (Discuss/Examine/Analyse)
}

Hard rules:
- Do NOT paste paragraphs from the source. Rewrite tightly.
- Do NOT fabricate facts, articles, judgements, or schemes. If unsure, omit.
- Every bullet ≤ 25 words.
- gsPaper/subject/topic/syllabusAnchor are MANDATORY — never leave blank.
- Output JSON ONLY.

Source: ${isDrishti ? "Drishti IAS" : "Vision IAS"}
Site title: ${rawTitle}
URL: ${data.url}

ARTICLE:
"""
${text}
"""`;

    const { text: out } = await generateText({
      model: gw(DEFAULT_MODEL),
      system: UPSC_SYSTEM_PROMPT,
      prompt,
      maxRetries: 1,
    });

    const cleaned = out.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
    let parsed: Omit<InstitutionCrispNotes, "sourceUrl">;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const m = cleaned.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("AI returned non-JSON response");
      parsed = JSON.parse(m[0]);
    }
    return { ...parsed, sourceUrl: data.url };
  });