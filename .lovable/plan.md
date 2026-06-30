# SEO Creation & Optimization Plan — UPSC Genius AI

## Goal
Make UPSC Genius AI discoverable on Google for high-intent UPSC aspirant queries (notes, MCQs, current affairs, editorial analysis, PYQs) and produce rich social previews when shared on WhatsApp, Telegram, X, and LinkedIn — where UPSC aspirants actually circulate links.

## Current state (audited)
- Only `/` (index) has custom `head()`. Every other route inherits the root title "UPSC Mitra — by Sidheswar Enterprises" — mismatched with the brand "UPSC Genius AI" shown in the UI.
- No `canonical`, no `og:url`, no JSON-LD anywhere.
- No `public/robots.txt`, no `sitemap.xml` route.
- OG image points to an old Lovable preview screenshot on R2 — stale.
- Authenticated routes (`/dashboard`, `/mentor`, `/inbox`, `/editorial`) are correctly gated and should be `noindex` (private app surfaces, not landing pages).
- Public indexable routes today: `/` and `/auth` only.

## Plan

### 1. Fix sitewide defaults in `src/routes/__root.tsx`
- Brand consistency: change root title/description/OG to "UPSC Genius AI".
- Replace the stale R2 og:image with a new branded 1200×630 share card generated via imagegen (premium tier — text legibility matters).
- Add `og:site_name`, `og:locale=en_IN`, `theme-color`.
- Add sitewide Organization + WebSite JSON-LD (with SearchAction pointing at `/mentor?q=`).
- Remove leaf-specific tags from root (no root-level canonical — leaf-only per house rules).

### 2. Per-route metadata (leaf overrides)
For every public route, add unique `title` (<60 chars, keyword-first), `description` (<160 chars), `og:title`, `og:description`, `og:url`, and `<link rel="canonical">`:
- `/` — "UPSC Genius AI — AI Notes, MCQs & Current Affairs for UPSC"
- `/auth` — "Sign in — UPSC Genius AI" + `noindex` (utility page)

For authenticated routes (`/_authenticated/*`), add `robots: noindex, nofollow` so the app surfaces don't compete with the landing page or leak into search.

### 3. Discoverability files
- `public/robots.txt` — allow all, disallow `/auth` and `/api/`, point to sitemap.
- `src/routes/sitemap[.]xml.ts` — server route emitting only public routes (`/`). Cached 1h.

### 4. Semantic HTML & a11y on `/`
- Audit `src/routes/index.tsx`: confirm single `<h1>` (currently fine), add descriptive `alt` on any decorative SVGs (currently aria-hidden — good), ensure quick-access cards use semantic `<a>` with descriptive text.

### 5. Performance signals (Core Web Vitals)
- Lazy-load below-the-fold sections on `/`.
- Preload the new OG/hero image.
- Ensure font subsets aren't blocking (Fraunces/Inter/Caveat/Kalam/Patrick Hand are all loaded — keep but verify `font-display: swap` from fontsource defaults).

### 6. Trigger an SEO scan
After the code changes land, run an SEO review so the Lovable scanner re-evaluates and the findings panel reflects the new state.

## Files touched
```text
src/routes/__root.tsx              # brand fix, JSON-LD, OG defaults
src/routes/index.tsx               # head() canonical + og:url
src/routes/auth.tsx                # head() with noindex
src/routes/_authenticated/route.tsx# head() with noindex on all app routes
src/routes/sitemap[.]xml.ts        # NEW — dynamic sitemap
public/robots.txt                  # NEW
src/assets/og-cover.jpg            # NEW — generated 1200×630 share card
```

## Out of scope (ask separately if you want these)
- Blog/content marketing routes (e.g. `/blog/upsc-current-affairs-jan-2026`) — biggest organic-traffic lever but requires content strategy + writing.
- Google Search Console verification & sitemap submission — needs your GSC account.
- Backlink outreach to UPSC coaching directories.
- Hindi-language route variants (`hreflang`) — large undertaking.

After you approve, I'll implement steps 1–6 in one pass and trigger the SEO scan.
