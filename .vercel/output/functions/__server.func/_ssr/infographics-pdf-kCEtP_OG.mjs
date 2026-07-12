import { i as rgb, r as StandardFonts } from "../_libs/pdf-lib.mjs";
import { drawWatermarkOnPage } from "./pdf-watermark-Dyl5UKws.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/infographics-pdf-kCEtP_OG.js
var PAGE = {
	width: 595.28,
	height: 841.89,
	margin: 36
};
var THEMES = {
	indigo: {
		primary: rgb(.1, .12, .36),
		soft: rgb(.92, .93, .99),
		accent: rgb(.85, .59, .16),
		ink: rgb(.1, .12, .22)
	},
	gold: {
		primary: rgb(.55, .38, .1),
		soft: rgb(.99, .96, .88),
		accent: rgb(.1, .12, .36),
		ink: rgb(.18, .14, .08)
	},
	rose: {
		primary: rgb(.62, .18, .3),
		soft: rgb(.99, .92, .94),
		accent: rgb(.85, .59, .16),
		ink: rgb(.2, .1, .14)
	},
	emerald: {
		primary: rgb(.1, .45, .32),
		soft: rgb(.9, .97, .93),
		accent: rgb(.85, .59, .16),
		ink: rgb(.08, .18, .14)
	},
	amber: {
		primary: rgb(.65, .45, .06),
		soft: rgb(1, .96, .85),
		accent: rgb(.1, .45, .32),
		ink: rgb(.22, .16, .06)
	},
	teal: {
		primary: rgb(.06, .4, .45),
		soft: rgb(.88, .96, .97),
		accent: rgb(.85, .59, .16),
		ink: rgb(.06, .18, .2)
	},
	violet: {
		primary: rgb(.38, .18, .55),
		soft: rgb(.95, .92, .99),
		accent: rgb(.85, .59, .16),
		ink: rgb(.18, .1, .26)
	}
};
var MUTED = rgb(.42, .45, .52);
var WHITE = rgb(1, 1, 1);
var PAPER = rgb(.995, .99, .97);
function sanitize(s) {
	return String(s ?? "").replace(/\r/g, "").replace(/[\u2018\u2019\u201A\u201B]/g, "'").replace(/[\u201C\u201D\u201E\u201F]/g, "\"").replace(/[\u2013\u2014\u2015]/g, "-").replace(/[\u2022\u25CF\u25E6\u2043]/g, "-").replace(/\u2026/g, "...").replace(/[\u2192\u27A1]/g, "->").replace(/\u2190/g, "<-").replace(/\u2194/g, "<->").replace(/\u2264/g, "<=").replace(/\u2265/g, ">=").replace(/\u00D7/g, "x").replace(/[\u00A0\u2009\u200A\u202F]/g, " ").replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "");
}
function splitLong(word, font, size, maxW) {
	const out = [];
	let cur = "";
	for (const ch of word) {
		const next = cur + ch;
		if (font.widthOfTextAtSize(next, size) > maxW && cur) {
			out.push(cur);
			cur = ch;
		} else cur = next;
	}
	if (cur) out.push(cur);
	return out;
}
function wrap(text, font, size, maxW) {
	const out = [];
	for (const para of sanitize(text).split("\n")) {
		const words = para.split(/\s+/).filter(Boolean);
		let line = "";
		for (const w of words) {
			if (font.widthOfTextAtSize(w, size) > maxW) {
				if (line) {
					out.push(line);
					line = "";
				}
				const chunks = splitLong(w, font, size, maxW);
				for (let i = 0; i < chunks.length - 1; i++) out.push(chunks[i]);
				line = chunks[chunks.length - 1] ?? "";
				continue;
			}
			const next = line ? `${line} ${w}` : w;
			if (font.widthOfTextAtSize(next, size) > maxW && line) {
				out.push(line);
				line = w;
			} else line = next;
		}
		if (line) out.push(line);
	}
	return out;
}
function drawText(page, str, opts) {
	const lines = opts.maxW ? wrap(str, opts.font, opts.size, opts.maxW) : [sanitize(str)];
	let cy = opts.y;
	for (const ln of lines) {
		page.drawText(ln, {
			x: opts.x,
			y: cy,
			size: opts.size,
			font: opts.font,
			color: opts.color
		});
		cy -= opts.size + 3;
	}
	return cy;
}
function textHeight(str, font, size, maxW) {
	return (wrap(str, font, size, maxW).length || 1) * (size + 3);
}
function drawHeader(page, fonts, theme, page_no, total, docTitle, topic, subtitle, part, totalParts, layout) {
	page.drawRectangle({
		x: 0,
		y: PAGE.height - 80,
		width: PAGE.width,
		height: 80,
		color: theme.primary
	});
	page.drawRectangle({
		x: 0,
		y: PAGE.height - 86,
		width: PAGE.width,
		height: 6,
		color: theme.accent
	});
	page.drawText(sanitize(docTitle).slice(0, 70), {
		x: PAGE.margin,
		y: PAGE.height - 26,
		size: 9,
		font: fonts.italic,
		color: rgb(1, 1, 1)
	});
	page.drawText(`${layout.toUpperCase()}  ·  ${page_no}/${total}`, {
		x: PAGE.width - PAGE.margin - 110,
		y: PAGE.height - 26,
		size: 9,
		font: fonts.bold,
		color: rgb(1, .96, .85)
	});
	drawText(page, totalParts > 1 ? `${topic}  (Part ${part}/${totalParts})` : topic, {
		x: PAGE.margin,
		y: PAGE.height - 50,
		size: 18,
		font: fonts.bold,
		color: WHITE,
		maxW: PAGE.width - PAGE.margin * 2
	});
	if (subtitle) drawText(page, subtitle, {
		x: PAGE.margin,
		y: PAGE.height - 70,
		size: 10,
		font: fonts.italic,
		color: rgb(.96, .95, .88),
		maxW: PAGE.width - PAGE.margin * 2
	});
}
function drawFooter(page, fonts, theme, pyq, ca, takeaway) {
	let y = 28;
	if (takeaway) {
		const h = textHeight(takeaway, fonts.bold, 10, PAGE.width - PAGE.margin * 2 - 16) + 18;
		page.drawRectangle({
			x: PAGE.margin,
			y,
			width: PAGE.width - PAGE.margin * 2,
			height: h,
			color: theme.soft,
			borderColor: theme.primary,
			borderWidth: 1
		});
		page.drawRectangle({
			x: PAGE.margin,
			y,
			width: 6,
			height: h,
			color: theme.accent
		});
		drawText(page, "KEY TAKEAWAY", {
			x: PAGE.margin + 14,
			y: y + h - 12,
			size: 8,
			font: fonts.bold,
			color: theme.primary
		});
		drawText(page, takeaway, {
			x: PAGE.margin + 14,
			y: y + h - 26,
			size: 10,
			font: fonts.bold,
			color: theme.ink,
			maxW: PAGE.width - PAGE.margin * 2 - 22
		});
		y += h + 6;
	}
	const meta = [];
	if (pyq) meta.push(`PYQ: ${pyq}`);
	if (ca) meta.push(`CA: ${ca}`);
	if (meta.length) page.drawText(sanitize(meta.join("   ·   ")).slice(0, 110), {
		x: PAGE.margin,
		y: 10,
		size: 8,
		font: fonts.italic,
		color: MUTED
	});
}
function drawMnemonic(page, fonts, theme, y, mnemonic) {
	const w = PAGE.width - PAGE.margin * 2;
	const h = 26;
	page.drawRectangle({
		x: PAGE.margin,
		y,
		width: w,
		height: h,
		color: theme.accent
	});
	page.drawText("MNEMONIC", {
		x: PAGE.margin + 10,
		y: y + h - 11,
		size: 8,
		font: fonts.bold,
		color: WHITE
	});
	drawText(page, mnemonic, {
		x: PAGE.margin + 78,
		y: y + h - 11,
		size: 10,
		font: fonts.bold,
		color: rgb(1, .99, .92),
		maxW: w - 90
	});
	return y - 8;
}
function drawKeyFacts(page, fonts, theme, y, facts) {
	if (!facts?.length) return y;
	const w = PAGE.width - PAGE.margin * 2;
	const each = Math.floor(w / Math.min(facts.length, 4)) - 8;
	const cols = Math.min(facts.length, 4);
	const rows = Math.ceil(facts.length / cols);
	const cellH = 36;
	const blockH = rows * cellH + 22;
	page.drawText("KEY FACTS", {
		x: PAGE.margin,
		y,
		size: 9,
		font: fonts.bold,
		color: theme.primary
	});
	let cy = y - 14;
	for (let i = 0; i < facts.length; i++) {
		const r = Math.floor(i / cols), c = i % cols;
		const x = PAGE.margin + c * (each + 8);
		const yy = cy - r * 40;
		page.drawRectangle({
			x,
			y: yy - cellH,
			width: each,
			height: cellH,
			color: theme.soft,
			borderColor: theme.primary,
			borderWidth: .6
		});
		drawText(page, facts[i], {
			x: x + 8,
			y: yy - 14,
			size: 9,
			font: fonts.regular,
			color: theme.ink,
			maxW: each - 16
		});
	}
	return y - blockH;
}
function layoutFlowchart(page, fonts, theme, top, bottom, sections) {
	const w = PAGE.width - PAGE.margin * 2;
	const boxes = sections.slice(0, 6);
	const each = Math.max(54, Math.min(90, (top - bottom - 20) / Math.max(1, boxes.length)));
	let y = top;
	boxes.forEach((s, i) => {
		const boxY = y - each;
		page.drawRectangle({
			x: PAGE.margin,
			y: boxY,
			width: w,
			height: each - 8,
			color: WHITE,
			borderColor: theme.primary,
			borderWidth: 1.2
		});
		page.drawRectangle({
			x: PAGE.margin,
			y: boxY,
			width: 8,
			height: each - 8,
			color: theme.primary
		});
		drawText(page, `${i + 1}. ${s.heading}`, {
			x: PAGE.margin + 18,
			y: boxY + each - 22,
			size: 11,
			font: fonts.bold,
			color: theme.primary,
			maxW: w - 28
		});
		drawText(page, s.points.slice(0, 3).map((p) => "• " + p).join("\n"), {
			x: PAGE.margin + 18,
			y: boxY + each - 38,
			size: 9,
			font: fonts.regular,
			color: theme.ink,
			maxW: w - 28
		});
		if (i < boxes.length - 1) page.drawLine({
			start: {
				x: PAGE.width / 2,
				y: boxY
			},
			end: {
				x: PAGE.width / 2,
				y: boxY - 8
			},
			color: theme.accent,
			thickness: 2
		});
		y -= each;
	});
}
function layoutTimeline(page, fonts, theme, top, bottom, sections) {
	const items = sections.slice(0, 8);
	const lineX = PAGE.margin + 14;
	page.drawLine({
		start: {
			x: lineX,
			y: top
		},
		end: {
			x: lineX,
			y: bottom + 10
		},
		color: theme.primary,
		thickness: 2
	});
	const step = Math.max(60, (top - bottom - 10) / Math.max(1, items.length));
	items.forEach((s, i) => {
		const y = top - i * step - 14;
		page.drawCircle({
			x: lineX,
			y,
			size: 6,
			color: theme.accent,
			borderColor: theme.primary,
			borderWidth: 1
		});
		drawText(page, s.heading, {
			x: lineX + 16,
			y,
			size: 11,
			font: fonts.bold,
			color: theme.primary,
			maxW: PAGE.width - lineX - 50
		});
		drawText(page, s.points.slice(0, 4).map((p) => "• " + p).join("\n"), {
			x: lineX + 16,
			y: y - 14,
			size: 9,
			font: fonts.regular,
			color: theme.ink,
			maxW: PAGE.width - lineX - 50
		});
	});
}
function layoutMindmap(page, fonts, theme, top, bottom, sections, centerLabel) {
	const cx = PAGE.width / 2;
	const cy = (top + bottom) / 2;
	page.drawCircle({
		x: cx,
		y: cy,
		size: 44,
		color: theme.primary
	});
	drawText(page, centerLabel, {
		x: cx - 38,
		y: cy + 4,
		size: 10,
		font: fonts.bold,
		color: WHITE,
		maxW: 76
	});
	const items = sections.slice(0, 6);
	const R = Math.min(220, (top - bottom) / 2 - 30);
	items.forEach((s, i) => {
		const a = i / Math.max(1, items.length) * Math.PI * 2 - Math.PI / 2;
		const x = cx + Math.cos(a) * R;
		const y = cy + Math.sin(a) * R;
		page.drawLine({
			start: {
				x: cx,
				y: cy
			},
			end: {
				x,
				y
			},
			color: theme.accent,
			thickness: 1.2
		});
		const bw = 130, bh = 44;
		page.drawRectangle({
			x: x - bw / 2,
			y: y - bh / 2,
			width: bw,
			height: bh,
			color: theme.soft,
			borderColor: theme.primary,
			borderWidth: 1
		});
		drawText(page, s.heading, {
			x: x - bw / 2 + 6,
			y: y + 12,
			size: 9,
			font: fonts.bold,
			color: theme.primary,
			maxW: bw - 12
		});
		drawText(page, s.points.slice(0, 2).map((p) => "• " + p).join("\n"), {
			x: x - bw / 2 + 6,
			y: y - 2,
			size: 8,
			font: fonts.regular,
			color: theme.ink,
			maxW: bw - 12
		});
	});
}
function layoutComparison(page, fonts, theme, top, bottom, sections) {
	const cols = sections.slice(0, 3);
	const w = (PAGE.width - PAGE.margin * 2 - (cols.length - 1) * 10) / cols.length;
	cols.forEach((s, i) => {
		const x = PAGE.margin + i * (w + 10);
		page.drawRectangle({
			x,
			y: top - 28,
			width: w,
			height: 28,
			color: theme.primary
		});
		drawText(page, s.heading, {
			x: x + 8,
			y: top - 18,
			size: 11,
			font: fonts.bold,
			color: WHITE,
			maxW: w - 16
		});
		page.drawRectangle({
			x,
			y: bottom + 8,
			width: w,
			height: top - 28 - bottom - 8,
			color: theme.soft,
			borderColor: theme.primary,
			borderWidth: .8
		});
		let cy = top - 44;
		for (const p of s.points.slice(0, 10)) {
			cy = drawText(page, "• " + p, {
				x: x + 8,
				y: cy,
				size: 9,
				font: fonts.regular,
				color: theme.ink,
				maxW: w - 16
			});
			cy -= 4;
			if (cy < bottom + 14) break;
		}
	});
}
function layoutCycle(page, fonts, theme, top, bottom, sections) {
	const cx = PAGE.width / 2;
	const cy = (top + bottom) / 2;
	const R = Math.min(180, (top - bottom) / 2 - 20);
	page.drawCircle({
		x: cx,
		y: cy,
		size: R,
		borderColor: theme.accent,
		borderWidth: 1.5,
		color: void 0
	});
	const items = sections.slice(0, 6);
	items.forEach((s, i) => {
		const a = i / items.length * Math.PI * 2 - Math.PI / 2;
		const x = cx + Math.cos(a) * R;
		const y = cy + Math.sin(a) * R;
		page.drawCircle({
			x,
			y,
			size: 28,
			color: theme.primary
		});
		drawText(page, `${i + 1}`, {
			x: x - 4,
			y: y - 4,
			size: 12,
			font: fonts.bold,
			color: WHITE
		});
		const lx = x + (Math.cos(a) > 0 ? 32 : -132);
		drawText(page, s.heading, {
			x: lx,
			y: y + 6,
			size: 10,
			font: fonts.bold,
			color: theme.primary,
			maxW: 100
		});
		drawText(page, s.points.slice(0, 2).join(" · "), {
			x: lx,
			y: y - 6,
			size: 8,
			font: fonts.regular,
			color: theme.ink,
			maxW: 100
		});
	});
}
function layoutHierarchy(page, fonts, theme, top, bottom, sections, rootLabel) {
	const cx = PAGE.width / 2;
	const rw = 180, rh = 36;
	page.drawRectangle({
		x: cx - rw / 2,
		y: top - rh,
		width: rw,
		height: rh,
		color: theme.primary
	});
	drawText(page, rootLabel, {
		x: cx - rw / 2 + 8,
		y: top - rh / 2 - 4,
		size: 11,
		font: fonts.bold,
		color: WHITE,
		maxW: rw - 16
	});
	const items = sections.slice(0, 4);
	const colW = (PAGE.width - PAGE.margin * 2 - (items.length - 1) * 10) / Math.max(1, items.length);
	items.forEach((s, i) => {
		const x = PAGE.margin + i * (colW + 10);
		const y = top - rh - 50;
		page.drawLine({
			start: {
				x: cx,
				y: top - rh
			},
			end: {
				x: x + colW / 2,
				y: y + 28
			},
			color: theme.accent,
			thickness: 1
		});
		page.drawRectangle({
			x,
			y,
			width: colW,
			height: 28,
			color: theme.soft,
			borderColor: theme.primary,
			borderWidth: 1
		});
		drawText(page, s.heading, {
			x: x + 6,
			y: y + 10,
			size: 10,
			font: fonts.bold,
			color: theme.primary,
			maxW: colW - 12
		});
		let cy = y - 4;
		for (const p of s.points.slice(0, 6)) {
			cy = drawText(page, "• " + p, {
				x: x + 6,
				y: cy,
				size: 9,
				font: fonts.regular,
				color: theme.ink,
				maxW: colW - 12
			});
			cy -= 3;
			if (cy < bottom + 10) break;
		}
	});
}
function layoutTable(page, fonts, theme, top, bottom, sections) {
	const rows = sections.slice(0, 10);
	const w = PAGE.width - PAGE.margin * 2;
	const headW = 150, dataW = w - headW;
	let y = top;
	page.drawRectangle({
		x: PAGE.margin,
		y: y - 24,
		width: w,
		height: 24,
		color: theme.primary
	});
	drawText(page, "Topic", {
		x: PAGE.margin + 10,
		y: y - 16,
		size: 10,
		font: fonts.bold,
		color: WHITE
	});
	drawText(page, "Details", {
		x: PAGE.margin + headW + 10,
		y: y - 16,
		size: 10,
		font: fonts.bold,
		color: WHITE
	});
	y -= 26;
	rows.forEach((s, i) => {
		const body = s.points.slice(0, 4).map((p) => "• " + p).join("\n");
		const h = Math.max(28, textHeight(body, fonts.regular, 9, dataW - 16) + 8);
		if (y - h < bottom) return;
		page.drawRectangle({
			x: PAGE.margin,
			y: y - h,
			width: w,
			height: h,
			color: i % 2 ? theme.soft : WHITE,
			borderColor: theme.primary,
			borderWidth: .4
		});
		page.drawRectangle({
			x: PAGE.margin + headW,
			y: y - h,
			width: .5,
			height: h,
			color: theme.primary
		});
		drawText(page, s.heading, {
			x: PAGE.margin + 10,
			y: y - 14,
			size: 10,
			font: fonts.bold,
			color: theme.primary,
			maxW: headW - 16
		});
		drawText(page, body, {
			x: PAGE.margin + headW + 10,
			y: y - 14,
			size: 9,
			font: fonts.regular,
			color: theme.ink,
			maxW: dataW - 16
		});
		y -= h;
	});
}
function layoutSummary(page, fonts, theme, top, bottom, sections) {
	const w = PAGE.width - PAGE.margin * 2;
	const cols = 2;
	const colW = (w - 10) / cols;
	let cy = top;
	sections.slice(0, 8).forEach((s, i) => {
		const c = i % cols;
		const x = PAGE.margin + c * (colW + 10);
		const body = s.points.slice(0, 6).map((p) => "• " + p).join("\n");
		const h = Math.max(70, textHeight(body, fonts.regular, 9, colW - 16) + 30);
		if (c === 0 && cy - h < bottom) return;
		c === 0 ? cy - h : cy + h - h;
		const rowY = c === 0 ? cy - h : cy - h;
		page.drawRectangle({
			x,
			y: rowY,
			width: colW,
			height: h,
			color: theme.soft,
			borderColor: theme.primary,
			borderWidth: .6
		});
		page.drawRectangle({
			x,
			y: rowY + h - 4,
			width: colW,
			height: 4,
			color: theme.accent
		});
		drawText(page, s.heading, {
			x: x + 10,
			y: rowY + h - 18,
			size: 10,
			font: fonts.bold,
			color: theme.primary,
			maxW: colW - 20
		});
		drawText(page, body, {
			x: x + 10,
			y: rowY + h - 34,
			size: 9,
			font: fonts.regular,
			color: theme.ink,
			maxW: colW - 20
		});
		if (c === cols - 1) cy -= h + 8;
	});
}
async function drawInfographics(pdf, content, documentTitle, watermark) {
	const wmCtx = "infographics-pdf";
	const startedAt = Date.now();
	console.info(`[watermark:${wmCtx}] drawInfographics start`, { documentTitle });
	const fonts = {
		regular: await pdf.embedFont(StandardFonts.Helvetica),
		bold: await pdf.embedFont(StandardFonts.HelveticaBold),
		italic: await pdf.embedFont(StandardFonts.HelveticaOblique)
	};
	const pages = Array.isArray(content?.pages) ? content.pages : [];
	if (!pages.length) {
		const page = pdf.addPage([PAGE.width, PAGE.height]);
		page.drawRectangle({
			x: 0,
			y: 0,
			width: PAGE.width,
			height: PAGE.height,
			color: PAPER
		});
		drawWatermarkOnPage(page, watermark);
		page.drawText("No infographics generated yet.", {
			x: PAGE.margin,
			y: PAGE.height / 2,
			size: 14,
			font: fonts.bold,
			color: rgb(.2, .2, .2)
		});
		return;
	}
	const coverTheme = THEMES.indigo;
	const cover = pdf.addPage([PAGE.width, PAGE.height]);
	cover.drawRectangle({
		x: 0,
		y: 0,
		width: PAGE.width,
		height: PAGE.height,
		color: PAPER
	});
	drawWatermarkOnPage(cover, watermark);
	cover.drawRectangle({
		x: 0,
		y: PAGE.height - 280,
		width: PAGE.width,
		height: 280,
		color: coverTheme.primary
	});
	cover.drawRectangle({
		x: 0,
		y: PAGE.height - 292,
		width: PAGE.width,
		height: 12,
		color: coverTheme.accent
	});
	cover.drawText("UPSC GENIUS AI", {
		x: PAGE.margin,
		y: PAGE.height - 60,
		size: 12,
		font: fonts.bold,
		color: rgb(1, .95, .8)
	});
	drawText(cover, "Infographic Pack", {
		x: PAGE.margin,
		y: PAGE.height - 110,
		size: 32,
		font: fonts.bold,
		color: WHITE,
		maxW: PAGE.width - PAGE.margin * 2
	});
	drawText(cover, sanitize(content?.title || documentTitle), {
		x: PAGE.margin,
		y: PAGE.height - 160,
		size: 16,
		font: fonts.italic,
		color: rgb(1, .97, .88),
		maxW: PAGE.width - PAGE.margin * 2
	});
	cover.drawText(`${pages.length} infographic page(s)`, {
		x: PAGE.margin,
		y: PAGE.height - 220,
		size: 12,
		font: fonts.bold,
		color: rgb(1, .95, .8)
	});
	cover.drawText(`Generated ${(/* @__PURE__ */ new Date()).toLocaleString()}`, {
		x: PAGE.margin,
		y: PAGE.height - 240,
		size: 10,
		font: fonts.italic,
		color: rgb(1, .94, .78)
	});
	let tocY = PAGE.height - 320;
	cover.drawText("CONTENTS", {
		x: PAGE.margin,
		y: tocY,
		size: 12,
		font: fonts.bold,
		color: coverTheme.primary
	});
	tocY -= 18;
	for (let i = 0; i < Math.min(pages.length, 30); i++) {
		const p = pages[i];
		const label = p.total_parts > 1 ? `${p.topic} (Part ${p.part}/${p.total_parts})` : p.topic;
		cover.drawText(`${String(i + 1).padStart(2, "0")}.  ${sanitize(label).slice(0, 70)}`, {
			x: PAGE.margin,
			y: tocY,
			size: 10,
			font: fonts.regular,
			color: coverTheme.ink
		});
		tocY -= 14;
		if (tocY < 60) break;
	}
	if (pages.length > 30) cover.drawText(`…and ${pages.length - 30} more.`, {
		x: PAGE.margin,
		y: tocY,
		size: 10,
		font: fonts.italic,
		color: MUTED
	});
	pages.forEach((p, idx) => {
		const theme = THEMES[p.color] || THEMES.indigo;
		const page = pdf.addPage([PAGE.width, PAGE.height]);
		page.drawRectangle({
			x: 0,
			y: 0,
			width: PAGE.width,
			height: PAGE.height,
			color: PAPER
		});
		drawWatermarkOnPage(page, watermark);
		drawHeader(page, fonts, theme, idx + 1, pages.length, documentTitle, p.topic, p.subtitle, p.part || 1, p.total_parts || 1, p.layout || "summary");
		const top = PAGE.height - 100;
		let bottom = 60;
		const reserveTakeaway = p.takeaway ? 60 : 0;
		const reserveFacts = (p.key_facts || []).length ? 70 : 0;
		const reserveMnemonic = p.mnemonic ? 36 : 0;
		bottom = 28 + reserveTakeaway + reserveFacts + reserveMnemonic;
		const sections = (p.sections || []).map((s) => ({
			heading: sanitize(s.heading || "Key Points"),
			points: (s.points || []).map(sanitize).filter(Boolean)
		})).filter((s) => s.heading || s.points.length);
		switch (p.layout || "summary") {
			case "flowchart":
			case "process":
				layoutFlowchart(page, fonts, theme, top, bottom, sections);
				break;
			case "timeline":
				layoutTimeline(page, fonts, theme, top, bottom, sections);
				break;
			case "mindmap":
				layoutMindmap(page, fonts, theme, top, bottom, sections, p.topic);
				break;
			case "comparison":
				layoutComparison(page, fonts, theme, top, bottom, sections);
				break;
			case "cycle":
				layoutCycle(page, fonts, theme, top, bottom, sections);
				break;
			case "hierarchy":
			case "tree":
				layoutHierarchy(page, fonts, theme, top, bottom, sections, p.topic);
				break;
			case "table":
				layoutTable(page, fonts, theme, top, bottom, sections);
				break;
			default: layoutSummary(page, fonts, theme, top, bottom, sections);
		}
		let by = bottom + reserveTakeaway;
		if (p.mnemonic) by = drawMnemonic(page, fonts, theme, by, p.mnemonic);
		if ((p.key_facts || []).length) drawKeyFacts(page, fonts, theme, by + reserveFacts - 14, p.key_facts.map(sanitize));
		drawFooter(page, fonts, theme, p.pyq_link, p.current_affairs, p.takeaway);
	});
	console.info(`[watermark:${wmCtx}] drawInfographics complete`, {
		documentTitle,
		pageCount: pdf.getPages().length,
		infographicCount: pages.length,
		durationMs: Date.now() - startedAt
	});
}
//#endregion
export { drawInfographics };
