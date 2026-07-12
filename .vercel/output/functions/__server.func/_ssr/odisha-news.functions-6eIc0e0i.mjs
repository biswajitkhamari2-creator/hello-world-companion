import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/odisha-news.functions-6eIc0e0i.js
var FEEDS = [
	{
		url: "https://sambadenglish.com/rss",
		source: "Sambad"
	},
	{
		url: "https://news.google.com/rss/search?q=Odisha+government+OR+OPSC+OR+%22Odisha+cabinet%22+OR+%22Odisha+assembly%22+OR+%22Odisha+budget%22&hl=en-IN&gl=IN&ceid=IN:en",
		source: "Google News"
	},
	{
		url: "https://news.google.com/rss/search?q=Odisha+scheme+OR+Odisha+policy+OR+%22Mission+Shakti%22+OR+KALIA+OR+%22Biju+Swasthya%22+OR+%22Ama+Odisha%22&hl=en-IN&gl=IN&ceid=IN:en",
		source: "Google News"
	},
	{
		url: "https://news.google.com/rss/search?q=Mahanadi+OR+%22Chilika%22+OR+%22Similipal%22+OR+%22Bhitarkanika%22+OR+%22Odisha+cyclone%22+OR+%22Odisha+mining%22+OR+%22Odisha+tribal%22&hl=en-IN&gl=IN&ceid=IN:en",
		source: "Google News"
	},
	{
		url: "https://news.google.com/rss/search?q=Jagannath+OR+Konark+OR+%22Odia+language%22+OR+%22Odisha+heritage%22+OR+%22Kalinga%22+OR+%22Paik%22&hl=en-IN&gl=IN&ceid=IN:en",
		source: "Google News"
	}
];
function pick(xml, tag) {
	const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
	if (!m) return "";
	return m[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim();
}
function stripHtml(s) {
	return s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}
function parseRss(xml, source) {
	const items = [];
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
			items.push({
				title,
				link,
				source,
				pubDate,
				description: desc,
				category: "Polity & Governance"
			});
		}
	}
	return items;
}
var NOISE_RE = /\b(horoscope|zodiac|astrolog|rashifal|numerolog|tarot|vastu|bollywood|hollywood|tollywood|ollywood|ollywood|celebrity|actor|actress|singer|film|movie|trailer|box office|ott|web series|netflix|recipe|fashion|lifestyle|beauty|makeup|skincare|weight loss|diet plan|sex|dating|breakup|gossip|cricket|ipl|fifa|football|tennis|olympics|match|wicket|goal\b|viral video|trending|meme|photo gallery|photos:|watch:|birthday|wedding|kohli|dhoni|shah rukh|salman|deepika|murder|rape|robbery|loot|dacoity|assault|arrested|nabbed|held for|kidnap|snatch|molest|suicide|elope|accident|road mishap|hit.and.run|bike rally|obituary|condolence|passes away|passed away|no more|died at|dead body|hospitalised|hospitalized|injured in|killed in|clash|scuffle|thrash|beaten|absconding|jailed|remand|chargesheet|fir lodged|fake note|liquor seiz|ganja seiz|brown sugar|contraband)\b/i;
var ODISHA_RE = /\b(odisha|orissa|bhubaneswar|cuttack|puri|konark|jagannath|mahanadi|brahmani|baitarani|chilika|similipal|bhitarkanika|opsc|kalinga|paik|kharavela|gajapati|somavamasi|bhauma|jajpur|balasore|sambalpur|rourkela|berhampur|koraput|kandhamal|mayurbhanj|dhamra|paradip|hirakud|ganjam|nabarangpur|rayagada|malkangiri|nuapada|kalahandi|bolangir|sundargarh|keonjhar|dhenkanal|angul|jharsuguda|nayagarh|khordha|boudh)\b/i;
var CATEGORY_RULES = [
	{
		cat: "Security & Disaster",
		re: /\b(cyclone|flood|earthquake|tsunami|landslide|disaster|maoist|naxal|left wing|extremism|terror|cyber|money launder|border|security force)\b/i
	},
	{
		cat: "Geography & Environment",
		re: /\b(mahanadi|brahmani|baitarani|chilika|similipal|bhitarkanika|forest|wildlife|elephant|tiger|olive ridley|biodivers|pollut|climate|ecolog|environment|mining|mineral|coal|bauxite|iron ore|hirakud|dam|river)\b/i
	},
	{
		cat: "Economy & Agriculture",
		re: /\b(econom|budget|gdp|inflation|rbi|fiscal|tax|gst|kalia|farmer|agricultur|paddy|msp|crop|irrigat|industry|industrial|msme|shg|self.help|export|invest|make in odisha|utkarsh|posco|jindal|tata steel|vedanta)\b/i
	},
	{
		cat: "History & Culture",
		re: /\b(jagannath|konark|puri|rath yatra|kharavela|kalinga|paik|surendra sai|gajapati|somavamasi|bhauma|ganga|temple|heritage|odia language|odissi|pattachitra|festival|carnival|bali yatra|literature|monument|archaeolog)\b/i
	},
	{
		cat: "Schemes & Social Justice",
		re: /\b(scheme|yojana|mission shakti|biju swasthya|bsky|ama odisha|nabin odisha|welfare|tribal|adivasi|dalit|sc\/st|women|child|health|education|scholarship|pension|ration|pds|poverty|inclusion|shg|anganwadi)\b/i
	},
	{
		cat: "Science & Tech",
		re: /\b(isro|drdo|space|satellite|technolog|ai\b|artificial intelligence|semiconductor|biotech|nanotech|start.?up|innovation|research)\b/i
	},
	{
		cat: "Polity & Governance",
		re: /\b(cabinet|assembly|opsc|lokayukta|right to public services|panchayat|zilla parishad|governor|chief minister|mla|mp\b|bill\b|amendment|policy|governance|e.governance|rti|manifesto|election commission|by.?poll|constitution|supreme court|high court|verdict on|ordinance|notification|gazette)\b/i
	}
];
var SYLLABUS_SIGNAL_RE = /\b(opsc|cabinet|assembly|policy|scheme|yojana|budget|mission shakti|biju swasthya|bsky|kalia|ama odisha|nabin odisha|panchayat|lokayukta|right to public services|constitution|governor|chief minister|bill\b|amendment|ordinance|gazette|manifesto|verdict on|supreme court|high court|economy|gdp|inflation|fiscal|gst|export|invest|industrial|msme|shg|agricultur|farmer|paddy|msp|irrigat|hirakud|mahanadi|brahmani|baitarani|chilika|similipal|bhitarkanika|forest|wildlife|elephant|tiger|olive ridley|biodivers|pollut|climate|ecolog|environment|mining|mineral|coal|bauxite|iron ore|jagannath|konark|rath yatra|kharavela|kalinga|paik|surendra sai|gajapati|somavamasi|bhauma|temple|heritage|odia language|odissi|pattachitra|bali yatra|monument|archaeolog|welfare|tribal|adivasi|scholarship|pension|ration|anganwadi|isro|drdo|space|satellite|technolog|artificial intelligence|semiconductor|biotech|start.?up|research|cyclone|flood|disaster|maoist|naxal|left wing|extremism|cyber|border security|foreign|bilateral|treaty|summit|un\b|unesco|world bank|imf|niti aayog)\b/i;
function categorize(text) {
	for (const r of CATEGORY_RULES) if (r.re.test(text)) return r.cat;
	return null;
}
var getOdishaNews_createServerFn_handler = createServerRpc({
	id: "af21a84db81c25cdd63f03c12409cd34e677557546d046036a663dbb20ae1158",
	name: "getOdishaNews",
	filename: "src/lib/odisha-news.functions.ts"
}, (opts) => getOdishaNews.__executeServer(opts));
var getOdishaNews = createServerFn({ method: "GET" }).handler(getOdishaNews_createServerFn_handler, async () => {
	const results = await Promise.allSettled(FEEDS.map(async (f) => {
		const res = await fetch(f.url, {
			headers: { "User-Agent": "Mozilla/5.0 UPSC-News-Bot" },
			signal: AbortSignal.timeout(8e3)
		});
		if (!res.ok) return [];
		return parseRss(await res.text(), f.source);
	}));
	const all = [];
	for (const r of results) if (r.status === "fulfilled") all.push(...r.value);
	const filtered = [];
	for (const it of all) {
		const hay = `${it.title} ${it.description ?? ""}`;
		if (NOISE_RE.test(hay)) continue;
		if (!ODISHA_RE.test(hay)) continue;
		if (!SYLLABUS_SIGNAL_RE.test(hay)) continue;
		const cat = categorize(hay);
		if (!cat) continue;
		filtered.push({
			...it,
			category: cat
		});
	}
	const seen = /* @__PURE__ */ new Set();
	const unique = filtered.filter((it) => {
		const k = it.title.toLowerCase().slice(0, 80);
		if (seen.has(k)) return false;
		seen.add(k);
		return true;
	});
	unique.sort((a, b) => (Date.parse(b.pubDate) || 0) - (Date.parse(a.pubDate) || 0));
	return {
		items: unique.slice(0, 40),
		fetchedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
});
async function fetchArticleText(url) {
	const res = await fetch(url, {
		headers: { "User-Agent": "Mozilla/5.0 (compatible; UPSC-Genius-Bot)" },
		signal: AbortSignal.timeout(12e3),
		redirect: "follow"
	});
	if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
	return (await res.text()).replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim().slice(0, 12e3);
}
var extractPcsPoints_createServerFn_handler = createServerRpc({
	id: "866d6b0cba3f7eb0bae89ec01e03dec15eb896691edb17a751bea6f05a106c95",
	name: "extractPcsPoints",
	filename: "src/lib/odisha-news.functions.ts"
}, (opts) => extractPcsPoints.__executeServer(opts));
var extractPcsPoints = createServerFn({ method: "POST" }).inputValidator((d) => {
	const o = d;
	if (!o?.url) throw new Error("Missing url");
	return {
		url: o.url,
		title: o.title || ""
	};
}).handler(extractPcsPoints_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.GEMINI_API_KEY?.trim();
	if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
	let articleText = "";
	try {
		articleText = await fetchArticleText(data.url);
	} catch {
		articleText = "";
	}
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
${articleText.length > 400 ? articleText : `Headline: ${data.title}\n(No body text available.)`}
"""`;
	const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
	});
	if (!res.ok) {
		const body = await res.text().catch(() => "");
		throw new Error(`Gemini failed: ${res.status} ${body.slice(0, 200)}`);
	}
	return {
		markdown: ((await res.json())?.candidates?.[0]?.content?.parts ?? []).map((p) => p?.text || "").join("\n").trim() || "No output.",
		source: data.url
	};
});
//#endregion
export { extractPcsPoints_createServerFn_handler, getOdishaNews_createServerFn_handler };
