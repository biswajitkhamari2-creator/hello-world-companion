import { createServerFn } from "@tanstack/react-start";

export interface OdishaNewsItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  description?: string;
  category: OpscCategory;
}

export type OpscCategory =
  | "Polity & Governance"
  | "Economy & Agriculture"
  | "Geography & Environment"
  | "History & Culture"
  | "Schemes & Social Justice"
  | "Science & Tech"
  | "Security & Disaster";

const FEEDS: { url: string; source: string }[] = [
  { url: "https://sambadenglish.com/rss", source: "Sambad" },
  {
    url: "https://news.google.com/rss/search?q=Odisha+government+OR+OPSC+OR+%22Odisha+cabinet%22+OR+%22Odisha+assembly%22+OR+%22Odisha+budget%22&hl=en-IN&gl=IN&ceid=IN:en",
    source: "Google News",
  },
  {
    url: "https://news.google.com/rss/search?q=Odisha+scheme+OR+Odisha+policy+OR+%22Mission+Shakti%22+OR+KALIA+OR+%22Biju+Swasthya%22+OR+%22Ama+Odisha%22&hl=en-IN&gl=IN&ceid=IN:en",
    source: "Google News",
  },
  {
    url: "https://news.google.com/rss/search?q=Mahanadi+OR+%22Chilika%22+OR+%22Similipal%22+OR+%22Bhitarkanika%22+OR+%22Odisha+cyclone%22+OR+%22Odisha+mining%22+OR+%22Odisha+tribal%22&hl=en-IN&gl=IN&ceid=IN:en",
    source: "Google News",
  },
  {
    url: "https://news.google.com/rss/search?q=Jagannath+OR+Konark+OR+%22Odia+language%22+OR+%22Odisha+heritage%22+OR+%22Kalinga%22+OR+%22Paik%22&hl=en-IN&gl=IN&ceid=IN:en",
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
    if (title && link) {
      const desc = stripHtml(descRaw).slice(0, 400);
      items.push({ title, link, source, pubDate, description: desc, category: "Polity & Governance" });
    }
  }
  return items;
}

// Off-syllabus noise (astrology, entertainment, cricket, celebrity, lifestyle, crime blotter)
const NOISE_RE = /\b(horoscope|zodiac|astrolog|rashifal|numerolog|tarot|vastu|bollywood|hollywood|tollywood|ollywood|celebrity|actor|actress|singer|film|movie|trailer|box office|ott|web series|netflix|recipe|fashion|lifestyle|beauty|makeup|skincare|weight loss|diet plan|sex|dating|breakup|gossip|cricket|ipl|fifa|football|tennis|olympics|match|wicket|goal\b|viral video|trending|meme|photo gallery|photos:|watch:|birthday|wedding|kohli|dhoni|shah rukh|salman|deepika)\b/i;

// Must mention Odisha or a clearly Odisha-specific keyword
const ODISHA_RE = /\b(odisha|orissa|bhubaneswar|cuttack|puri|konark|jagannath|mahanadi|brahmani|baitarani|chilika|similipal|bhitarkanika|opsc|kalinga|paik|kharavela|gajapati|somavamasi|bhauma|jajpur|balasore|sambalpur|rourkela|berhampur|koraput|kandhamal|mayurbhanj|dhamra|paradip|hirakud)\b/i;

// Map to Odisha PCS syllabus buckets
const CATEGORY_RULES: { cat: OpscCategory; re: RegExp }[] = [
  { cat: "Security & Disaster", re: /\b(cyclone|flood|earthquake|tsunami|landslide|disaster|maoist|naxal|left wing|extremism|terror|cyber|money launder|border|security force)\b/i },
  { cat: "Geography & Environment", re: /\b(mahanadi|brahmani|baitarani|chilika|similipal|bhitarkanika|forest|wildlife|elephant|tiger|olive ridley|biodivers|pollut|climate|ecolog|environment|mining|mineral|coal|bauxite|iron ore|hirakud|dam|river)\b/i },
  { cat: "Economy & Agriculture", re: /\b(econom|budget|gdp|inflation|rbi|fiscal|tax|gst|kalia|farmer|agricultur|paddy|msp|crop|irrigat|industry|industrial|msme|shg|self.help|export|invest|make in odisha|utkarsh|posco|jindal|tata steel|vedanta)\b/i },
  { cat: "History & Culture", re: /\b(jagannath|konark|puri|rath yatra|kharavela|kalinga|paik|surendra sai|gajapati|somavamasi|bhauma|ganga|temple|heritage|odia language|odissi|pattachitra|festival|carnival|bali yatra|literature|monument|archaeolog)\b/i },
  { cat: "Schemes & Social Justice", re: /\b(scheme|yojana|mission shakti|biju swasthya|bsky|ama odisha|nabin odisha|welfare|tribal|adivasi|dalit|sc\/st|women|child|health|education|scholarship|pension|ration|pds|poverty|inclusion|shg|anganwadi)\b/i },
  { cat: "Science & Tech", re: /\b(isro|drdo|space|satellite|technolog|ai\b|artificial intelligence|semiconductor|biotech|nanotech|start.?up|innovation|research)\b/i },
  { cat: "Polity & Governance", re: /\b(cabinet|assembly|opsc|lokayukta|right to public services|panchayat|zilla parishad|governor|chief minister|cm\b|mla|mp\b|bill\b|act\b|amendment|court|verdict|policy|governance|e-governance|rti|accountab|transparen)\b/i },
];

function categorize(text: string): OpscCategory | null {
  for (const r of CATEGORY_RULES) if (r.re.test(text)) return r.cat;
  return null;
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

  // Filter: block noise, require Odisha context, must map to a syllabus bucket
  const filtered: OdishaNewsItem[] = [];
  for (const it of all) {
    const hay = `${it.title} ${it.description ?? ""}`;
    if (NOISE_RE.test(hay)) continue;
    if (!ODISHA_RE.test(hay)) continue;
    const cat = categorize(hay);
    if (!cat) continue;
    filtered.push({ ...it, category: cat });
  }

  const seen = new Set<string>();
  const unique = filtered.filter((it) => {
    const k = it.title.toLowerCase().slice(0, 80);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  unique.sort((a, b) => (Date.parse(b.pubDate) || 0) - (Date.parse(a.pubDate) || 0));
  return { items: unique.slice(0, 40), fetchedAt: new Date().toISOString() };
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

    const prompt = `You are a mentor for the Odisha Public Service Commission (OPSC) Civil Services Exam.
Extract exam-relevant points from the news below, mapped to the official OPSC syllabus.

OPSC SYLLABUS ANCHORS (map the story to whichever apply):
- Prelims Paper I: Current events; Indian & Odisha history (Kalinga, Kharavela, Bhauma-Karas, Somavamasis, Gangas, Gajapatis, Paik Rebellion, Vir Surendra Sai, Praja Mandal, creation of Odisha Province); Indian & Odisha geography (physiography, Mahanadi/Brahmani/Baitarani, Chilika, Similipal, Bhitarkanika, minerals, forests); Polity & Governance (Constitution, PRIs, Odisha Lokayukta, Odisha Right to Public Services Act); Economy & Social Development; Environment & Climate Change; General Science.
- Mains GS-I: Indian & Odisha heritage & culture (Jagannath, Konark, Odissi, Pattachitra, Odia language & literature, Bhakti Movement in Odisha, festivals like Bali Yatra, Rath Yatra); society, tribes, women, urbanisation in Odisha.
- Mains GS-II: Constitution, Union-State relations, PRIs in Odisha, welfare schemes (KALIA, Mission Shakti, BSKY, Ama Odisha Nabin Odisha), Odisha & neighbourhood relations, social justice.
- Mains GS-III: Economy, agriculture, irrigation (Hirakud), industrialisation of Odisha, MSMEs & SHGs, science & tech, biodiversity, disaster management (cyclones like Fani/Yaas), left-wing extremism in Odisha, internal security, cyber security.
- Mains GS-IV: Ethics angle only if the story clearly involves probity, corruption, or public-service values.

Return clean Markdown with these sections and NOTHING else:
## Summary (2-3 lines)
## Syllabus Mapping (bullet list — e.g. "Prelims Paper I → Odisha Geography", "Mains GS-III → Disaster Management"; only list buckets the story actually touches)
## Key Facts (bullets — names, numbers, dates, places, schemes, articles/sections of law, rivers, dynasties, tribes)
## OPSC Angle (why an OPSC aspirant should remember this — link to Odisha specifically)
## Prelims MCQ (1 question, 4 options, mark the correct answer with **bold**)
## Mains Question (1 short answer-writing question, 150 words, tag the GS paper)

Rules: Stay strictly on the OPSC syllabus. Do not add horoscope, entertainment, cricket, or celebrity content. Do not invent numbers — if a detail is not in the source, write "not stated".

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