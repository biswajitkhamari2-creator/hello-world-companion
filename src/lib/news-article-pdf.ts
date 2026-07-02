// Stylish, eye-catching PDF for a news / PCS-digest article. Builds an
// off-screen A4-width node with premium typography, then reuses the shared
// preview → PDF pipeline (watermark + block-aware pagination included).

import { downloadPreviewAsPdf } from "@/lib/preview-pdf";

export interface StylishArticleInput {
  title: string;
  source?: string;
  category?: string;
  url?: string;
  /** Either raw markdown-ish text or ready HTML. */
  markdown?: string;
  html?: string;
  accent?: "emerald" | "rose" | "indigo";
  filename?: string;
}

const ACCENTS: Record<NonNullable<StylishArticleInput["accent"]>, { from: string; to: string; ring: string }> = {
  emerald: { from: "#059669", to: "#0d9488", ring: "#10b981" },
  rose:    { from: "#e11d48", to: "#f59e0b", ring: "#fb7185" },
  indigo:  { from: "#4f46e5", to: "#d946ef", ring: "#818cf8" },
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Minimal markdown → HTML for headings, bold, italics, lists, paragraphs. */
function mdToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let inList: "ul" | "ol" | null = null;
  const closeList = () => { if (inList) { out.push(`</${inList}>`); inList = null; } };
  const inline = (s: string) =>
    escapeHtml(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { closeList(); continue; }
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^###\s+(.*)$/))) { closeList(); out.push(`<h3>${inline(m[1])}</h3>`); continue; }
    if ((m = line.match(/^##\s+(.*)$/)))  { closeList(); out.push(`<h2>${inline(m[1])}</h2>`); continue; }
    if ((m = line.match(/^#\s+(.*)$/)))   { closeList(); out.push(`<h1>${inline(m[1])}</h1>`); continue; }
    if ((m = line.match(/^\s*[-*•]\s+(.*)$/))) {
      if (inList !== "ul") { closeList(); out.push('<ul>'); inList = "ul"; }
      out.push(`<li>${inline(m[1])}</li>`); continue;
    }
    if ((m = line.match(/^\s*\d+[.)]\s+(.*)$/))) {
      if (inList !== "ol") { closeList(); out.push('<ol>'); inList = "ol"; }
      out.push(`<li>${inline(m[1])}</li>`); continue;
    }
    closeList();
    out.push(`<p>${inline(line)}</p>`);
  }
  closeList();
  return out.join("\n");
}

export async function downloadStylishArticlePdf(input: StylishArticleInput): Promise<void> {
  const accent = ACCENTS[input.accent ?? "emerald"];
  const bodyHtml = input.html ?? (input.markdown ? mdToHtml(input.markdown) : "");
  const dateStr = new Date().toLocaleDateString(undefined, {
    year: "numeric", month: "long", day: "numeric",
  });

  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-stylish-article-pdf", "true");
  // Off-screen but rendered so html2canvas can capture it.
  wrapper.style.cssText = `
    position: fixed; left: 0; top: 0; width: 794px;
    background: #ffffff; color: #0f172a;
    font-family: 'Fraunces', 'Georgia', serif;
    padding: 56px 60px 72px; box-sizing: border-box;
    line-height: 1.6;
    opacity: 0.01; pointer-events: none; z-index: -1;
  `;

  wrapper.innerHTML = `
    <style>
      [data-stylish-article-pdf] .hero { position: relative; padding: 28px 30px; border-radius: 22px;
        background: linear-gradient(135deg, ${accent.from}, ${accent.to});
        color: #fff; box-shadow: 0 24px 60px -28px ${accent.ring};
        overflow: hidden;
      }
      [data-stylish-article-pdf] .hero::after { content:""; position:absolute; inset:0;
        background: radial-gradient(1200px 200px at 100% 0%, rgba(255,255,255,0.28), transparent 60%);
        pointer-events:none;
      }
      [data-stylish-article-pdf] .chips { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px; position:relative; z-index:1; }
      [data-stylish-article-pdf] .chip { display:inline-flex; align-items:center; gap:6px;
        padding:5px 12px; border-radius:999px; font-size:11px; font-weight:700; letter-spacing:0.08em;
        text-transform:uppercase; background:rgba(255,255,255,0.22); color:#fff;
        backdrop-filter: blur(6px); border:1px solid rgba(255,255,255,0.35);
        font-family: 'Inter', system-ui, sans-serif;
      }
      [data-stylish-article-pdf] h1.title { position:relative; z-index:1;
        font-family: 'Fraunces', 'Georgia', serif; font-weight: 800;
        font-size: 40px; line-height: 1.1; margin: 0;
        letter-spacing: -0.02em;
      }
      [data-stylish-article-pdf] .meta { position:relative; z-index:1; margin-top:14px;
        display:flex; gap:18px; align-items:center; font-size:12px;
        font-family: 'Inter', system-ui, sans-serif; color: rgba(255,255,255,0.9);
      }
      [data-stylish-article-pdf] .meta .dot { width:4px; height:4px; border-radius:50%; background:rgba(255,255,255,0.7); }
      [data-stylish-article-pdf] .rule { height:6px; margin: 22px 0 26px; border-radius:999px;
        background: linear-gradient(90deg, ${accent.from}, ${accent.to}, transparent);
      }
      [data-stylish-article-pdf] .body { font-size: 16px; color:#0f172a; }
      [data-stylish-article-pdf] .body h1 { font-size:26px; margin: 26px 0 10px; color:${accent.from}; font-weight:800; }
      [data-stylish-article-pdf] .body h2 { font-size:22px; margin: 22px 0 8px; color:${accent.from}; font-weight:700;
        border-left: 4px solid ${accent.to}; padding-left: 10px;
      }
      [data-stylish-article-pdf] .body h3 { font-size:18px; margin: 18px 0 6px; color:#0f172a; font-weight:700; }
      [data-stylish-article-pdf] .body p { margin: 8px 0 12px; }
      [data-stylish-article-pdf] .body ul, [data-stylish-article-pdf] .body ol { padding-left: 22px; margin: 6px 0 14px; }
      [data-stylish-article-pdf] .body li { margin: 4px 0; }
      [data-stylish-article-pdf] .body strong { color:${accent.from}; }
      [data-stylish-article-pdf] .body code { background:#f1f5f9; padding: 1px 6px; border-radius:6px; font-size: 13px; }
      [data-stylish-article-pdf] .foot { margin-top: 36px; padding-top: 14px;
        border-top: 1px dashed #cbd5e1; font-size: 11px; color:#64748b;
        font-family: 'Inter', system-ui, sans-serif; display:flex; justify-content:space-between; gap:12px;
      }
    </style>
    <div class="hero">
      <div class="chips">
        ${input.category ? `<span class="chip">${escapeHtml(input.category)}</span>` : ""}
        ${input.source ? `<span class="chip">${escapeHtml(input.source)}</span>` : ""}
        <span class="chip">UPSC Genius AI</span>
      </div>
      <h1 class="title">${escapeHtml(input.title)}</h1>
      <div class="meta">
        <span>${dateStr}</span>
        <span class="dot"></span>
        <span>Syllabus-mapped notes</span>
      </div>
    </div>
    <div class="rule"></div>
    <div class="body">${bodyHtml || "<p><em>No content available.</em></p>"}</div>
    <div class="foot">
      <span>Generated by UPSC Genius AI</span>
      ${input.url ? `<span>${escapeHtml(input.url)}</span>` : ""}
    </div>
  `;

  document.body.appendChild(wrapper);
  try {
    const safe = (input.filename || input.title || "article").slice(0, 80);
    await downloadPreviewAsPdf(wrapper, safe, { verifyBefore: false });
  } finally {
    wrapper.remove();
  }
}