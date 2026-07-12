import{r as e}from"./rolldown-runtime-QTnfLwEv.js";import{t}from"./react-CZI7_Jkm.js";import{t as n}from"./link-BE1H1eWK.js";import{r}from"./useRouter-kgXmxZME.js";import{H as i,t as a}from"./app-shell-DbSLfusI.js";import{t as o}from"./preview-pdf-Df2pxOi9.js";import{t as s}from"./arrow-left-oFzk3cWk.js";import{t as c}from"./external-link-CwcjISCk.js";import{t as l}from"./landmark-CFdVXUfI.js";import{t as u}from"./loader-circle-BOZgUyIu.js";import{n as d,t as f}from"./x-DaKGH4H-.js";import{n as p,t as m}from"./odisha-news.functions-C3neiIb8.js";var h=e(t()),g={emerald:{from:`#059669`,to:`#0d9488`,ring:`#10b981`},rose:{from:`#e11d48`,to:`#f59e0b`,ring:`#fb7185`},indigo:{from:`#4f46e5`,to:`#d946ef`,ring:`#818cf8`}};function _(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}function v(e){let t=e.replace(/\r\n/g,`
`).split(`
`),n=[],r=null,i=()=>{r&&=(n.push(`</${r}>`),null)},a=e=>_(e).replace(/\*\*(.+?)\*\*/g,`<strong>$1</strong>`).replace(/\*(.+?)\*/g,`<em>$1</em>`).replace(/`([^`]+)`/g,`<code>$1</code>`);for(let e of t){let t=e.trimEnd();if(!t.trim()){i();continue}let o;if(o=t.match(/^###\s+(.*)$/)){i(),n.push(`<h3>${a(o[1])}</h3>`);continue}if(o=t.match(/^##\s+(.*)$/)){i(),n.push(`<h2>${a(o[1])}</h2>`);continue}if(o=t.match(/^#\s+(.*)$/)){i(),n.push(`<h1>${a(o[1])}</h1>`);continue}if(o=t.match(/^\s*[-*•]\s+(.*)$/)){r!==`ul`&&(i(),n.push(`<ul>`),r=`ul`),n.push(`<li>${a(o[1])}</li>`);continue}if(o=t.match(/^\s*\d+[.)]\s+(.*)$/)){r!==`ol`&&(i(),n.push(`<ol>`),r=`ol`),n.push(`<li>${a(o[1])}</li>`);continue}i(),n.push(`<p>${a(t)}</p>`)}return i(),n.join(`
`)}async function y(e){let t=g[e.accent??`emerald`],n=e.html??(e.markdown?v(e.markdown):``),r=new Date().toLocaleDateString(void 0,{year:`numeric`,month:`long`,day:`numeric`}),i=document.createElement(`div`);i.setAttribute(`data-stylish-article-pdf`,`true`),i.style.cssText=`
    position: fixed; left: 0; top: 100vh; width: 794px;
    background: #ffffff; color: #0f172a;
    font-family: 'Fraunces', 'Georgia', serif;
    padding: 56px 60px 72px; box-sizing: border-box;
    line-height: 1.6;
    opacity: 1; pointer-events: none; z-index: 0;
  `,i.innerHTML=`
    <style>
      [data-stylish-article-pdf] .hero { position: relative; padding: 28px 30px; border-radius: 22px;
        background: linear-gradient(135deg, ${t.from}, ${t.to});
        color: #fff; box-shadow: 0 24px 60px -28px ${t.ring};
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
        background: linear-gradient(90deg, ${t.from}, ${t.to}, transparent);
      }
      [data-stylish-article-pdf] .body { font-size: 16px; color:#0f172a; }
      [data-stylish-article-pdf] .body h1 { font-size:26px; margin: 26px 0 10px; color:${t.from}; font-weight:800; }
      [data-stylish-article-pdf] .body h2 { font-size:22px; margin: 22px 0 8px; color:${t.from}; font-weight:700;
        border-left: 4px solid ${t.to}; padding-left: 10px;
      }
      [data-stylish-article-pdf] .body h3 { font-size:18px; margin: 18px 0 6px; color:#0f172a; font-weight:700; }
      [data-stylish-article-pdf] .body p { margin: 8px 0 12px; }
      [data-stylish-article-pdf] .body ul, [data-stylish-article-pdf] .body ol { padding-left: 22px; margin: 6px 0 14px; }
      [data-stylish-article-pdf] .body li { margin: 4px 0; }
      [data-stylish-article-pdf] .body strong { color:${t.from}; }
      [data-stylish-article-pdf] .body code { background:#f1f5f9; padding: 1px 6px; border-radius:6px; font-size: 13px; }
      [data-stylish-article-pdf] .foot { margin-top: 36px; padding-top: 14px;
        border-top: 1px dashed #cbd5e1; font-size: 11px; color:#64748b;
        font-family: 'Inter', system-ui, sans-serif; display:flex; justify-content:space-between; gap:12px;
      }
    </style>
    <div class="hero">
      <div class="chips">
        ${e.category?`<span class="chip">${_(e.category)}</span>`:``}
        ${e.source?`<span class="chip">${_(e.source)}</span>`:``}
        <span class="chip">UPSC Genius AI</span>
      </div>
      <h1 class="title">${_(e.title)}</h1>
      <div class="meta">
        <span>${r}</span>
        <span class="dot"></span>
        <span>Syllabus-mapped notes</span>
      </div>
    </div>
    <div class="rule"></div>
    <div class="body">${n||`<p><em>No content available.</em></p>`}</div>
    <div class="foot">
      <span>Generated by UPSC Genius AI</span>
      ${e.url?`<span>${_(e.url)}</span>`:``}
    </div>
  `,document.body.appendChild(i);try{await o(i,(e.filename||e.title||`article`).slice(0,80),{verifyBefore:!1})}finally{i.remove()}}var b=r();function x(e){let t=Date.parse(e);if(!t)return``;let n=Date.now()-t,r=Math.floor(n/6e4);if(r<60)return`${r}m ago`;let i=Math.floor(r/60);return i<24?`${i}h ago`:`${Math.floor(i/24)}d ago`}function S(){let[e,t]=(0,h.useState)([]),[r,o]=(0,h.useState)(!0),[g,_]=(0,h.useState)(null),[v,S]=(0,h.useState)(null),[C,w]=(0,h.useState)(``),[T,E]=(0,h.useState)(!1),[D,O]=(0,h.useState)(null),[k,A]=(0,h.useState)(!1),[j,M]=(0,h.useState)(`All`);(0,h.useEffect)(()=>{let e=!0;return(async()=>{try{let n=await p();e&&t(n.items)}catch(t){e&&_(t instanceof Error?t.message:`Failed to load`)}finally{e&&o(!1)}})(),()=>{e=!1}},[]);async function N(e){S(e),w(``),O(null),E(!0);try{let t=await m({data:{url:e.link,title:e.title}});w(t.markdown)}catch(e){O(e instanceof Error?e.message:`Extraction failed`)}finally{E(!1)}}async function P(){if(!(!v||!C)){A(!0);try{await y({title:v.title,source:v.source,category:v.category,url:v.link,markdown:C,accent:`emerald`,filename:`pcs-${v.title}`})}finally{A(!1)}}}return(0,b.jsx)(a,{children:(0,b.jsxs)(`main`,{className:`mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12`,children:[(0,b.jsxs)(n,{to:`/`,className:`mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground`,children:[(0,b.jsx)(s,{className:`h-4 w-4`}),` Back to home`]}),(0,b.jsxs)(`div`,{className:`mb-6`,children:[(0,b.jsxs)(`h1`,{className:`flex items-center gap-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl`,children:[(0,b.jsx)(l,{className:`h-7 w-7 text-emerald-500`}),`National News · PCS Digest`]}),(0,b.jsxs)(`p`,{className:`mt-2 text-sm text-muted-foreground`,children:[`Live headlines mapped to the OPSC / State PCS syllabus. Click `,(0,b.jsx)(`span`,{className:`font-semibold text-emerald-600`,children:`Extract PCS Points`}),` for exam-ready notes.`]})]}),r&&(0,b.jsx)(`div`,{className:`grid grid-cols-1 gap-3 sm:grid-cols-2`,children:Array.from({length:6}).map((e,t)=>(0,b.jsx)(`div`,{className:`h-28 animate-pulse rounded-2xl bg-white/40 backdrop-blur dark:bg-white/5`},t))}),g&&!r&&(0,b.jsxs)(`div`,{className:`rounded-2xl border border-rose-300/40 bg-rose-50/60 p-4 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200`,children:[`Couldn't load news. `,g]}),!r&&!g&&e.length>0&&(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(`div`,{className:`mb-4 flex flex-wrap gap-2`,children:[`All`,...Array.from(new Set(e.map(e=>e.category)))].map(t=>{let n=t===`All`?e.length:e.filter(e=>e.category===t).length;return(0,b.jsxs)(`button`,{type:`button`,onClick:()=>M(t),className:`rounded-full px-3 py-1 text-xs font-semibold transition ${j===t?`bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow`:`border border-border/60 bg-background/60 text-muted-foreground hover:text-foreground`}`,children:[t,` `,(0,b.jsxs)(`span`,{className:`opacity-70`,children:[`· `,n]})]},t)})}),(0,b.jsx)(`div`,{className:`grid grid-cols-1 gap-3 sm:grid-cols-2`,children:e.filter(e=>j===`All`||e.category===j).map(e=>(0,b.jsxs)(`div`,{className:`group relative rounded-2xl border border-white/40 bg-white/60 p-4 shadow-[0_8px_30px_-12px_rgba(31,38,135,0.18)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-18px_rgba(16,185,129,0.45)] dark:border-white/10 dark:bg-white/5`,children:[(0,b.jsxs)(`div`,{className:`flex items-start justify-between gap-2`,children:[(0,b.jsxs)(`div`,{className:`flex flex-wrap items-center gap-1.5`,children:[(0,b.jsx)(`span`,{className:`inline-flex items-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white`,children:e.category}),(0,b.jsx)(`span`,{className:`inline-flex items-center rounded-full border border-border/60 bg-background/70 px-2 py-0.5 text-[10px] font-medium text-muted-foreground`,children:e.source})]}),(0,b.jsx)(`a`,{href:e.link,target:`_blank`,rel:`noopener noreferrer`,className:`text-muted-foreground hover:text-foreground`,children:(0,b.jsx)(c,{className:`h-3.5 w-3.5`})})]}),(0,b.jsx)(`h3`,{className:`mt-2 font-serif text-[15px] font-semibold leading-snug text-foreground line-clamp-3`,children:e.title}),e.pubDate&&(0,b.jsx)(`div`,{className:`mt-1 text-[11px] text-muted-foreground`,children:x(e.pubDate)}),(0,b.jsxs)(`button`,{type:`button`,onClick:()=>N(e),className:`mt-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-all hover:brightness-110 active:scale-95`,children:[(0,b.jsx)(d,{className:`h-3.5 w-3.5`}),` Extract PCS Points`]})]},e.link))})]}),v&&(0,b.jsx)(`div`,{className:`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm`,onClick:()=>S(null),children:(0,b.jsxs)(`div`,{className:`relative max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl dark:bg-neutral-900`,onClick:e=>e.stopPropagation(),children:[(0,b.jsxs)(`div`,{className:`flex items-start justify-between gap-3 border-b border-border/50 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-4`,children:[(0,b.jsxs)(`div`,{className:`min-w-0`,children:[(0,b.jsxs)(`div`,{className:`text-[10px] font-semibold uppercase tracking-wider text-emerald-600`,children:[`PCS Digest · `,v.source]}),(0,b.jsx)(`h4`,{className:`mt-1 font-serif text-base font-semibold leading-snug line-clamp-2`,children:v.title})]}),(0,b.jsx)(`button`,{type:`button`,onClick:()=>S(null),className:`rounded-full p-1 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10`,children:(0,b.jsx)(f,{className:`h-4 w-4`})})]}),(0,b.jsxs)(`div`,{className:`max-h-[65vh] overflow-y-auto p-5 text-sm`,children:[T&&(0,b.jsxs)(`div`,{className:`flex items-center gap-2 text-muted-foreground`,children:[(0,b.jsx)(u,{className:`h-4 w-4 animate-spin`}),` Extracting exam-ready points…`]}),D&&!T&&(0,b.jsx)(`div`,{className:`rounded-lg border border-rose-300/40 bg-rose-50 p-3 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200`,children:D}),!T&&C&&(0,b.jsx)(`pre`,{className:`whitespace-pre-wrap font-sans leading-relaxed text-foreground`,children:C})]}),(0,b.jsxs)(`div`,{className:`flex items-center justify-between border-t border-border/50 p-3`,children:[(0,b.jsx)(`a`,{href:v.link,target:`_blank`,rel:`noopener noreferrer`,className:`text-xs font-semibold text-emerald-600 hover:underline`,children:`Open original article →`}),(0,b.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,b.jsxs)(`button`,{type:`button`,onClick:P,disabled:!C||T||k,className:`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/40 ring-1 ring-emerald-300/60 transition-all hover:brightness-110 hover:shadow-emerald-500/60 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse`,children:[k?(0,b.jsx)(u,{className:`h-3.5 w-3.5 animate-spin`}):(0,b.jsx)(i,{className:`h-3.5 w-3.5`}),k?`Preparing…`:`Download PDF`]}),(0,b.jsx)(`button`,{type:`button`,onClick:()=>S(null),className:`rounded-full bg-foreground/90 px-3 py-1.5 text-xs font-semibold text-background hover:bg-foreground`,children:`Close`})]})]})]})})]})})}export{S as component};