import { createServerFn } from "@tanstack/react-start";

export interface OdishaNewsItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  description?: string;
}

const FEEDS: { url: string; source: string }[] = [
  { url: "https://sambadenglish.com/rss", source: "Sambad" },
  {
    url: "https://news.google.com/rss/search?q=Odisha+government+OR+%22Odisha+PSC%22+OR+%22OPSC%22+OR+Sambad+OR+Samaja&hl=en-IN&gl=IN&ceid=IN:en",
    source: "Google News",
  },
  {
    url: "https://news.google.com/rss/search?q=Odisha+scheme+OR+Odisha+policy+OR+Bhubaneswar+OR+Naveen+Patnaik+OR+Odisha+cabinet&hl=en-IN&gl=IN&ceid=IN:en",
    source: "Google News",
  },
];

function pick(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  if (!m) return "";
  return m[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim();
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

function parseRss(xml: string, source: string): OdishaNewsItem[] {
  const items: OdishaNewsItem[] = [];
  const matches = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  for (const raw of matches) {
    const title = pick(raw, "title");
    let link = pick(raw, "link");
    const pubDate = pick(raw, "pubDate") || pick(raw, "dc:date");
    const descRaw = pick(raw, "description");
    if (source === "Google News") {
      const hrefMatch = descRaw.match(/<a[^>]+href=["']([^"']+)["']/i);
      if (hrefMatch && !/news\.google\.com/i.test(hrefMatch[1])) link = hrefMatch[1];
    }
    if (title && link) items.push({ title, link, source, pubDate, description: stripHtml(descRaw).slice(0, 400) });
  }
  return items;
}

export const getOdishaNews = createServerFn({ method: "GET" }).handler(async () => {
  const results = await Promise.allSettled(
    FEEDS.map(async (f) => {
      const res = await fetch(f.url, {
        headers: { "User-Agent": "Mozilla/5.0 UPSC-News-Bot" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return [];
      return parseRss(await res.text(), f.source);
    }),
  );
  const all: OdishaNewsItem[] = [];
  for (const r of results) if (r.status === "fulfilled") all.push(...r.value);

  const seen = new Set<string>();
  const unique = all.filter((it) => {
    const k = it.title.toLowerCase().slice(0, 80);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  unique.sort((a, b) => (Date.parse(b.pubDate) || 0) - (Date.parse(a.pubDate) || 0));
  return { items: unique.slice(0, 30), fetchedAt: new Date().toISOString() };
});

// AI extract: pull the article text, then ask Gemini for OPSC/PCS-focused key points.
async function fetchArticleText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; UPSC-Genius-Bot)" },
    signal: AbortSignal.timeout(12000),
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const html = await res.text();
  // Strip scripts/styles and tags, take up to 12k chars of body text
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.slice(0, 12000);
}

export const extractPcsPoints = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => {
    const o = d as { url?: string; title?: string };
    if (!o?.url) throw new Error("Missing url");
    return { url: o.url, title: o.title || "" };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

    let articleText = "";
    try {
      articleText = await fetchArticleText(data.url);
    } catch {
      articleText = "";
    }
    // If we couldn't scrape (JS-heavy site), fall back to just title
    const context = articleText.length > 400 ? articleText : `Headline: ${data.title}\n(No body text available.)`;

    const prompt = `You are an exam mentor for the Odisha Public Service Commission (OPSC) and other State PCS exams.
From the news content below, extract the most exam-relevant points a State PCS aspirant should remember.

Return clean Markdown with these sections:
## Summary (2-3 lines)
## Key Facts (bullet points — names, numbers, dates, places, schemes, articles/sections of law)
## OPSC / State PCS Angle (why this matters — Odisha polity, geography, economy, culture, environment, current affairs)
## Possible Prelims MCQ (1 question with 4 options and the correct answer marked)
## Possible Mains Question (1 short answer-writing question)

Keep it factual. Do not invent numbers. If a detail is not in the source, say "not stated".

SOURCE:
"""
${context}
"""`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      },
    );
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Gemini failed: ${res.status} ${body.slice(0, 200)}`);
    }
    const json: unknown = await res.json();
    const parts = (json as { candidates?: { content?: { parts?: { text?: string }[] } }[] })?.candidates?.[0]?.content?.parts ?? [];
    const text = parts.map((p) => p?.text || "").join("\n").trim();
    return { markdown: text || "No output.", source: data.url };
  });