import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
import { ct as objectType, lt as stringType } from "../_libs/@ai-sdk/gateway+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/institution-news.functions-MEYDmgfR.js
function slugToTitle(slug) {
	return slug.replace(/-\d+$/, "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim();
}
function prettyCategory(cat) {
	return cat.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
async function fetchHtml(url) {
	const res = await fetch(url, {
		headers: {
			"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
			Accept: "text/html,application/xhtml+xml"
		},
		signal: AbortSignal.timeout(12e3)
	});
	if (!res.ok) throw new Error(`${url} → ${res.status}`);
	return res.text();
}
function extractArticles(html, kind, base, source) {
	const re = new RegExp(`href=["'](?:https?://visionias\\.in)?(/current-affairs/${base}/(\\d{4}-\\d{2}-\\d{2})/([a-z0-9-]+)/([a-z0-9-]+))["']`, "gi");
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	let m;
	while (m = re.exec(html)) {
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
			kind
		});
	}
	return out;
}
function pickTag(xml, tag) {
	const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
	if (!m) return "";
	return m[1].replace(/<!\[CDATA\[|\]\]>/g, "").replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16))).replace(/&amp;/g, "&").trim();
}
function parseDrishtiRss(xml) {
	const items = [];
	const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
	for (const raw of blocks) {
		const title = pickTag(raw, "title");
		const link = pickTag(raw, "link");
		const pubDate = pickTag(raw, "pubDate");
		if (!title || !link) continue;
		if (!/\/(daily-updates\/(daily-news-analysis|daily-news-editorials|prelims-facts)|to-the-points)\//i.test(link)) continue;
		if (/\.pdf$/i.test(link)) continue;
		const d = new Date(pubDate);
		const date = isNaN(d.getTime()) ? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) : d.toISOString().slice(0, 10);
		const isWeekly = /to-the-points/i.test(link);
		items.push({
			title,
			link,
			category: isWeekly ? "To The Points" : /editorial/i.test(link) ? "Editorial" : "Daily News",
			date,
			source: isWeekly ? "Drishti IAS · To The Points" : "Drishti IAS · Daily",
			kind: isWeekly ? "weekly" : "daily"
		});
	}
	return items;
}
function scrapeDrishtiListing(html, pattern, category, source, kind) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	let m;
	while (m = pattern.exec(html)) {
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
			kind
		});
	}
	return out;
}
var getInstitutionNews_createServerFn_handler = createServerRpc({
	id: "a87a3facca26de65f390ca02626843a3d367b4cc18ac8bd9bc6b6a1dad9c9a37",
	name: "getInstitutionNews",
	filename: "src/lib/institution-news.functions.ts"
}, (opts) => getInstitutionNews.__executeServer(opts));
var getInstitutionNews = createServerFn({ method: "GET" }).handler(getInstitutionNews_createServerFn_handler, async () => {
	const targets = [
		{
			url: "https://visionias.in/current-affairs/news-today",
			kind: "daily",
			base: "news-today",
			source: "Vision IAS · Daily"
		},
		{
			url: "https://visionias.in/current-affairs/news-today/archive",
			kind: "daily",
			base: "news-today",
			source: "Vision IAS · Daily"
		},
		{
			url: "https://visionias.in/current-affairs/weekly-focus",
			kind: "weekly",
			base: "weekly-focus",
			source: "Vision IAS · Weekly Focus"
		},
		{
			url: "https://visionias.in/current-affairs/weekly-focus/archive",
			kind: "weekly",
			base: "weekly-focus",
			source: "Vision IAS · Weekly Focus"
		},
		...(() => {
			const out = [];
			const istMs = Date.now() + 5.5 * 60 * 60 * 1e3;
			for (let i = 0; i < 7; i++) {
				const d = /* @__PURE__ */ new Date(istMs - i * 24 * 60 * 60 * 1e3);
				const y = d.getUTCFullYear();
				const m = String(d.getUTCMonth() + 1).padStart(2, "0");
				const day = String(d.getUTCDate()).padStart(2, "0");
				out.push(`${y}-${m}-${day}`);
			}
			return out;
		})().map((d) => ({
			url: `https://visionias.in/current-affairs/news-today/${d}`,
			kind: "daily",
			base: "news-today",
			source: "Vision IAS · Daily"
		}))
	];
	const results = await Promise.allSettled(targets.map(async (t) => {
		return extractArticles(await fetchHtml(t.url), t.kind, t.base, t.source);
	}));
	const daily = [];
	const weekly = [];
	for (const r of results) {
		if (r.status !== "fulfilled") continue;
		for (const it of r.value) (it.kind === "daily" ? daily : weekly).push(it);
	}
	const drishtiResults = await Promise.allSettled([
		{
			url: "https://www.drishtiias.com/daily-updates/daily-news-analysis",
			pattern: /href="(https:\/\/www\.drishtiias\.com\/daily-updates\/daily-news-analysis\/[a-z0-9-]+)"/gi,
			category: "Daily News",
			source: "Drishti IAS · Daily",
			kind: "daily"
		},
		{
			url: "https://www.drishtiias.com/daily-updates/daily-news-editorials",
			pattern: /href="(https:\/\/www\.drishtiias\.com\/daily-updates\/daily-news-editorials\/[a-z0-9-]+)"/gi,
			category: "Editorial",
			source: "Drishti IAS · Editorial",
			kind: "daily"
		},
		{
			url: "https://www.drishtiias.com/to-the-points/paper1",
			pattern: /href="(https:\/\/www\.drishtiias\.com\/to-the-points\/paper1\/[a-z0-9-]+)"/gi,
			category: "GS Paper 1",
			source: "Drishti IAS · To The Points",
			kind: "weekly"
		},
		{
			url: "https://www.drishtiias.com/to-the-points/paper2",
			pattern: /href="(https:\/\/www\.drishtiias\.com\/to-the-points\/paper2\/[a-z0-9-]+)"/gi,
			category: "GS Paper 2",
			source: "Drishti IAS · To The Points",
			kind: "weekly"
		},
		{
			url: "https://www.drishtiias.com/to-the-points/paper3",
			pattern: /href="(https:\/\/www\.drishtiias\.com\/to-the-points\/paper3\/[a-z0-9-]+)"/gi,
			category: "GS Paper 3",
			source: "Drishti IAS · To The Points",
			kind: "weekly"
		},
		{
			url: "https://www.drishtiias.com/to-the-points/paper4",
			pattern: /href="(https:\/\/www\.drishtiias\.com\/to-the-points\/paper4\/[a-z0-9-]+)"/gi,
			category: "GS Paper 4",
			source: "Drishti IAS · To The Points",
			kind: "weekly"
		}
	].map(async (t) => {
		return scrapeDrishtiListing(await fetchHtml(t.url), t.pattern, t.category, t.source, t.kind);
	}));
	for (const r of drishtiResults) {
		if (r.status !== "fulfilled") continue;
		for (const it of r.value) (it.kind === "daily" ? daily : weekly).push(it);
	}
	try {
		const dr = await fetchHtml("https://www.drishtiias.com/rss.rss");
		for (const it of parseDrishtiRss(dr)) (it.kind === "daily" ? daily : weekly).push(it);
	} catch {}
	const dedupe = (arr) => {
		const seen = /* @__PURE__ */ new Set();
		return arr.filter((it) => {
			if (seen.has(it.link)) return false;
			seen.add(it.link);
			return true;
		});
	};
	const sort = (arr) => arr.sort((a, b) => a.date < b.date ? 1 : a.date > b.date ? -1 : 0);
	return {
		daily: sort(dedupe(daily)).slice(0, 60),
		weekly: sort(dedupe(weekly)).slice(0, 40),
		fetchedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
});
var getInstitutionArticle_createServerFn_handler = createServerRpc({
	id: "988112bba6f2932c59fd2b9d26ca234b336b5e71d7b2e41de1c79db36da99ce2",
	name: "getInstitutionArticle",
	filename: "src/lib/institution-news.functions.ts"
}, (opts) => getInstitutionArticle.__executeServer(opts));
var getInstitutionArticle = createServerFn({ method: "POST" }).inputValidator((data) => {
	if (!/^https:\/\/(visionias\.in|www\.drishtiias\.com)\//.test(data.url)) throw new Error("Only Vision IAS or Drishti IAS URLs are allowed");
	return data;
}).handler(getInstitutionArticle_createServerFn_handler, async ({ data }) => {
	const html = await fetchHtml(data.url);
	const isDrishti = /drishtiias\.com/i.test(data.url);
	let body = html.replace(/<head[\s\S]*?<\/head>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<noscript[\s\S]*?<\/noscript>/gi, "").replace(/<nav[\s\S]*?<\/nav>/gi, "").replace(/<footer[\s\S]*?<\/footer>/gi, "").replace(/<header[\s\S]*?<\/header>/gi, "");
	const articleMatch = body.match(/<article[\s\S]*?<\/article>/i) || body.match(/<main[\s\S]*?<\/main>/i) || body.match(/<div[^>]+class=["'][^"']*(?:article|content|post|entry)[^"']*["'][\s\S]*?<\/div>/i);
	if (articleMatch) body = articleMatch[0];
	const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
	return {
		title: titleMatch ? titleMatch[1].trim() : "",
		html: body.replace(/\s+(class|id|style|data-[a-z-]+)="[^"]*"/gi, "").replace(/<img([^>]*)>/gi, (_m, attrs) => {
			const src = attrs.match(/src="([^"]+)"/i)?.[1];
			if (!src) return "";
			const host = isDrishti ? "https://www.drishtiias.com" : "https://visionias.in";
			return `<img src="${src.startsWith("http") ? src : `${host}${src.startsWith("/") ? src : "/" + src}`}" style="max-width:100%;height:auto;" />`;
		}).replace(/<a\s+href="\/([^"]+)"/gi, `<a href="${isDrishti ? "https://www.drishtiias.com" : "https://visionias.in"}/$1"`).replace(/<a /gi, "<a target=\"_blank\" rel=\"noopener\" ")
	};
});
function htmlToPlain(html) {
	return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&#39;/gi, "'").replace(/&quot;/gi, "\"").replace(/\s+/g, " ").trim();
}
var getInstitutionCrispNotes_createServerFn_handler = createServerRpc({
	id: "d6d3c0725e82a405def7902e792bee26dda466982288f7d816aeb32f45d33897",
	name: "getInstitutionCrispNotes",
	filename: "src/lib/institution-news.functions.ts"
}, (opts) => getInstitutionCrispNotes.__executeServer(opts));
var getInstitutionCrispNotes = createServerFn({ method: "POST" }).inputValidator((data) => {
	return objectType({ url: stringType().regex(/^https:\/\/(visionias\.in|www\.drishtiias\.com)\//, "Only Vision IAS or Drishti IAS URLs are allowed") }).parse(data);
}).handler(getInstitutionCrispNotes_createServerFn_handler, async ({ data }) => {
	const html = await fetchHtml(data.url);
	const isDrishti = /drishtiias\.com/i.test(data.url);
	const stripped = html.replace(/<head[\s\S]*?<\/head>/gi, "").replace(/<nav[\s\S]*?<\/nav>/gi, "").replace(/<footer[\s\S]*?<\/footer>/gi, "").replace(/<header[\s\S]*?<\/header>/gi, "");
	const mainMatch = stripped.match(/<article[\s\S]*?<\/article>/i) || stripped.match(/<main[\s\S]*?<\/main>/i) || stripped.match(/<div[^>]+class=["'][^"']*(?:article|content|post|entry)[^"']*["'][\s\S]*?<\/div>/i);
	const text = htmlToPlain(mainMatch ? mainMatch[0] : stripped).slice(0, 18e3);
	const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
	const rawTitle = titleMatch ? titleMatch[1].trim() : "";
	const { createGateway, getAiTaskProfile, UPSC_SYSTEM_PROMPT } = await import("./ai-gateway.server-BQYhT5NC.mjs").then((n) => n.n);
	const { generateText } = await import("../_libs/@ai-sdk/react+[...].mjs").then((n) => n.i);
	const profile = getAiTaskProfile("crisp_notes");
	const gw = createGateway(void 0, profile.provider);
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
		model: gw(profile.model),
		system: UPSC_SYSTEM_PROMPT,
		prompt,
		maxRetries: 1
	});
	const cleaned = out.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
	let parsed;
	try {
		parsed = JSON.parse(cleaned);
	} catch {
		const m = cleaned.match(/\{[\s\S]*\}/);
		if (!m) throw new Error("AI returned non-JSON response");
		parsed = JSON.parse(m[0]);
	}
	return {
		...parsed,
		sourceUrl: data.url
	};
});
var GenericUrl = objectType({
	url: stringType().url().refine((u) => /^https?:\/\//i.test(u), "Only http(s) URLs allowed"),
	sourceLabel: stringType().max(80).optional()
});
function pickHost(u) {
	try {
		return new URL(u).host.replace(/^www\./, "");
	} catch {
		return "";
	}
}
async function fetchArticleText(url) {
	const html = await fetchHtml(url);
	const stripped = html.replace(/<head[\s\S]*?<\/head>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<nav[\s\S]*?<\/nav>/gi, "").replace(/<footer[\s\S]*?<\/footer>/gi, "").replace(/<header[\s\S]*?<\/header>/gi, "").replace(/<aside[\s\S]*?<\/aside>/gi, "");
	const mainMatch = stripped.match(/<article[\s\S]*?<\/article>/i) || stripped.match(/<main[\s\S]*?<\/main>/i) || stripped.match(/<div[^>]+class=["'][^"']*(?:article|content|post|entry|story)[^"']*["'][\s\S]*?<\/div>/i);
	const text = htmlToPlain(mainMatch ? mainMatch[0] : stripped);
	const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
	return {
		text,
		rawTitle: titleMatch ? titleMatch[1].trim() : ""
	};
}
var getArticleCrispNotes_createServerFn_handler = createServerRpc({
	id: "8db36deca9b9c33e247941a3ca4f47df75bf985da91826ae664ccb996a7f5d95",
	name: "getArticleCrispNotes",
	filename: "src/lib/institution-news.functions.ts"
}, (opts) => getArticleCrispNotes.__executeServer(opts));
var getArticleCrispNotes = createServerFn({ method: "POST" }).inputValidator((data) => GenericUrl.parse(data)).handler(getArticleCrispNotes_createServerFn_handler, async ({ data }) => {
	const { text, rawTitle } = await fetchArticleText(data.url);
	const trimmed = text.slice(0, 18e3);
	const source = data.sourceLabel || pickHost(data.url) || "News";
	const { createGateway, getAiTaskProfile, UPSC_SYSTEM_PROMPT } = await import("./ai-gateway.server-BQYhT5NC.mjs").then((n) => n.n);
	const { generateText } = await import("../_libs/@ai-sdk/react+[...].mjs").then((n) => n.i);
	const profile = getAiTaskProfile("crisp_notes");
	const gw = createGateway(void 0, profile.provider);
	const prompt = `You are preparing CRISP UPSC/State-PCS notes from a news article. DO NOT copy sentences verbatim. Rewrite tightly. Every note MUST be tagged with the correct UPSC GS Paper + Subject + Topic per the official UPSC Civil Services syllabus.

UPSC syllabus mapping (mandatory):
- GS-1 → History, Art & Culture, Indian Society, Geography (Physical/Human/Economic)
- GS-2 → Polity, Constitution, Governance, Social Justice, International Relations
- GS-3 → Economy, Agriculture, Science & Tech, Environment/Ecology/Biodiversity, Internal Security, Disaster Management
- GS-4 → Ethics, Integrity & Aptitude, Case Studies
- Prelims → factual current-affairs item with no Mains hook
- Essay → philosophical/abstract themes

Return STRICT JSON only, no markdown fences, matching:
{"title":string,"gsPaper":"GS-1"|"GS-2"|"GS-3"|"GS-4"|"Prelims"|"Essay","subject":string,"topic":string,"syllabusAnchor":string,"oneLine":string,"whyInNews":string[],"keyPoints":string[],"facts":string[],"keyTerms":Array<{term:string,meaning:string}>,"prelimsAngle":string[],"mainsAngle":string[],"probableQuestion":string}

Hard rules: no verbatim copy, no fabricated facts, each bullet ≤25 words, gsPaper/subject/topic/syllabusAnchor MANDATORY, JSON ONLY.

Source: ${source}
Site title: ${rawTitle}
URL: ${data.url}

ARTICLE:
"""
${trimmed}
"""`;
	const { text: out } = await generateText({
		model: gw(profile.model),
		system: UPSC_SYSTEM_PROMPT,
		prompt,
		maxRetries: 1
	});
	const cleaned = out.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
	let parsed;
	try {
		parsed = JSON.parse(cleaned);
	} catch {
		const m = cleaned.match(/\{[\s\S]*\}/);
		if (!m) throw new Error("AI returned non-JSON response");
		parsed = JSON.parse(m[0]);
	}
	return {
		...parsed,
		sourceUrl: data.url
	};
});
var getArticleComprehensiveNotes_createServerFn_handler = createServerRpc({
	id: "f515e22b7db9fc0360117baafeb65ee3b1b3661326bff3276e03a17114e0f615",
	name: "getArticleComprehensiveNotes",
	filename: "src/lib/institution-news.functions.ts"
}, (opts) => getArticleComprehensiveNotes.__executeServer(opts));
var getArticleComprehensiveNotes = createServerFn({ method: "POST" }).inputValidator((data) => GenericUrl.parse(data)).handler(getArticleComprehensiveNotes_createServerFn_handler, async ({ data }) => {
	const { text, rawTitle } = await fetchArticleText(data.url);
	const trimmed = text.slice(0, 24e3);
	const source = data.sourceLabel || pickHost(data.url) || "News";
	const { createGateway, getAiTaskProfile, UPSC_SYSTEM_PROMPT } = await import("./ai-gateway.server-BQYhT5NC.mjs").then((n) => n.n);
	const { generateText } = await import("../_libs/@ai-sdk/react+[...].mjs").then((n) => n.i);
	const profile = getAiTaskProfile("comprehensive_notes");
	const gw = createGateway(void 0, profile.provider);
	const prompt = `You are preparing COMPREHENSIVE UPSC/State-PCS notes from a news article. Full 360° exam-ready: background → status → stakeholders → challenges → way forward → global angle. Rewrite in tight bullets. Every note MUST be tagged with the correct UPSC GS Paper + Subject + Topic.

UPSC syllabus mapping (mandatory):
- GS-1 → History, Art & Culture, Society, Geography
- GS-2 → Polity, Constitution, Governance, Social Justice, IR
- GS-3 → Economy, Agriculture, S&T, Environment, Internal Security, Disaster Mgmt
- GS-4 → Ethics, Integrity, Aptitude, Case Studies
- Prelims → factual current-affairs with no Mains hook
- Essay → philosophical/abstract themes

Return STRICT JSON only, no markdown fences, matching:
{"title":string,"gsPaper":"GS-1"|"GS-2"|"GS-3"|"GS-4"|"Prelims"|"Essay","subject":string,"topic":string,"syllabusAnchor":string,"oneLine":string,"whyInNews":string[],"keyPoints":string[],"facts":string[],"keyTerms":Array<{term:string,meaning:string}>,"background":string[],"currentStatus":string[],"stakeholders":string[],"challenges":string[],"wayForward":string[],"relatedSchemes":string[],"internationalAngle":string[],"quotes":string[],"mindMap":string,"prelimsAngle":string[],"mainsAngle":string[],"probableQuestion":string}

Hard rules: no verbatim copy, no fabricated facts/cases/schemes, each bullet ≤30 words, tags MANDATORY, JSON ONLY.

Source: ${source}
Site title: ${rawTitle}
URL: ${data.url}

ARTICLE:
"""
${trimmed}
"""`;
	const { text: out } = await generateText({
		model: gw(profile.model),
		system: UPSC_SYSTEM_PROMPT,
		prompt,
		maxRetries: 1
	});
	const cleaned = out.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
	let parsed;
	try {
		parsed = JSON.parse(cleaned);
	} catch {
		const m = cleaned.match(/\{[\s\S]*\}/);
		if (!m) throw new Error("AI returned non-JSON response");
		parsed = JSON.parse(m[0]);
	}
	return {
		...parsed,
		sourceUrl: data.url
	};
});
var getInstitutionComprehensiveNotes_createServerFn_handler = createServerRpc({
	id: "ae63e4cc3f3d27eb98353f672a20675f201cfd2a9b4139554fc1e9edee42b785",
	name: "getInstitutionComprehensiveNotes",
	filename: "src/lib/institution-news.functions.ts"
}, (opts) => getInstitutionComprehensiveNotes.__executeServer(opts));
var getInstitutionComprehensiveNotes = createServerFn({ method: "POST" }).inputValidator((data) => {
	return objectType({ url: stringType().regex(/^https:\/\/(visionias\.in|www\.drishtiias\.com)\//, "Only Vision IAS or Drishti IAS URLs are allowed") }).parse(data);
}).handler(getInstitutionComprehensiveNotes_createServerFn_handler, async ({ data }) => {
	const html = await fetchHtml(data.url);
	const isDrishti = /drishtiias\.com/i.test(data.url);
	const stripped = html.replace(/<head[\s\S]*?<\/head>/gi, "").replace(/<nav[\s\S]*?<\/nav>/gi, "").replace(/<footer[\s\S]*?<\/footer>/gi, "").replace(/<header[\s\S]*?<\/header>/gi, "");
	const mainMatch = stripped.match(/<article[\s\S]*?<\/article>/i) || stripped.match(/<main[\s\S]*?<\/main>/i) || stripped.match(/<div[^>]+class=["'][^"']*(?:article|content|post|entry)[^"']*["'][\s\S]*?<\/div>/i);
	const text = htmlToPlain(mainMatch ? mainMatch[0] : stripped).slice(0, 24e3);
	const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
	const rawTitle = titleMatch ? titleMatch[1].trim() : "";
	const { createGateway, getAiTaskProfile, UPSC_SYSTEM_PROMPT } = await import("./ai-gateway.server-BQYhT5NC.mjs").then((n) => n.n);
	const { generateText } = await import("../_libs/@ai-sdk/react+[...].mjs").then((n) => n.i);
	const profile = getAiTaskProfile("comprehensive_notes");
	const gw = createGateway(void 0, profile.provider);
	const prompt = `You are preparing COMPREHENSIVE UPSC/State-PCS notes from a coaching-institute article. Aim for a full 360° exam-ready note: background → status → stakeholders → challenges → way forward → global angle. Rewrite everything in tight bullets — never paste source sentences. Every note MUST be tagged with the correct UPSC GS Paper + Subject + Topic per the official UPSC Civil Services syllabus.

UPSC syllabus mapping (mandatory):
- GS-1 → History, Art & Culture, Indian Society, Geography
- GS-2 → Polity, Constitution, Governance, Social Justice, IR
- GS-3 → Economy, Agriculture, S&T, Environment, Internal Security, Disaster Mgmt
- GS-4 → Ethics, Integrity, Aptitude, Case Studies
- Prelims → factual/current-affairs items with no Mains hook
- Essay → philosophical/abstract themes

Return STRICT JSON only, no markdown fences, matching this TypeScript type:
{
  "title": string,
  "gsPaper": "GS-1"|"GS-2"|"GS-3"|"GS-4"|"Prelims"|"Essay",
  "subject": string,
  "topic": string,
  "syllabusAnchor": string,
  "oneLine": string,                       // ≤30 words
  "whyInNews": string[],                   // 3-5 bullets
  "keyPoints": string[],                   // 10-15 bullets — the core content
  "facts": string[],                       // hard data, dates, articles, cases, numbers
  "keyTerms": Array<{term:string, meaning:string}>, // 5-8 exam terms
  "background": string[],                  // 4-6 bullets — historical / constitutional / evolution
  "currentStatus": string[],               // 4-6 bullets — present position
  "stakeholders": string[],                // 3-5 bullets — who is involved & how
  "challenges": string[],                  // 4-6 bullets
  "wayForward": string[],                  // 4-6 bullets — reforms, recommendations
  "relatedSchemes": string[],              // schemes/acts/committees/reports/judgements
  "internationalAngle": string[],          // 2-4 bullets — global comparison
  "quotes": string[],                      // 2-3 crisp quotable lines usable in Mains
  "mindMap": string,                       // 1 short paragraph tying everything
  "prelimsAngle": string[],                // 3-4 factual hooks
  "mainsAngle": string[],                  // 3-4 analytical hooks
  "probableQuestion": string               // 1 Mains-style question
}

Hard rules:
- Do NOT paste paragraphs from the source.
- Do NOT fabricate facts, articles, cases, judgements, schemes. If unsure, omit.
- Each bullet ≤ 30 words.
- gsPaper/subject/topic/syllabusAnchor are MANDATORY.
- Output JSON ONLY.

Source: ${isDrishti ? "Drishti IAS" : "Vision IAS"}
Site title: ${rawTitle}
URL: ${data.url}

ARTICLE:
"""
${text}
"""`;
	const { text: out } = await generateText({
		model: gw(profile.model),
		system: UPSC_SYSTEM_PROMPT,
		prompt,
		maxRetries: 1
	});
	const cleaned = out.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
	let parsed;
	try {
		parsed = JSON.parse(cleaned);
	} catch {
		const m = cleaned.match(/\{[\s\S]*\}/);
		if (!m) throw new Error("AI returned non-JSON response");
		parsed = JSON.parse(m[0]);
	}
	return {
		...parsed,
		sourceUrl: data.url
	};
});
//#endregion
export { getArticleComprehensiveNotes_createServerFn_handler, getArticleCrispNotes_createServerFn_handler, getInstitutionArticle_createServerFn_handler, getInstitutionComprehensiveNotes_createServerFn_handler, getInstitutionCrispNotes_createServerFn_handler, getInstitutionNews_createServerFn_handler };
