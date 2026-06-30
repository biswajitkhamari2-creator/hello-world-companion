# Goal

Make the app run on Vercel with zero dependency on Lovable runtime (no `connector-gateway.lovable.dev`, no `LOVABLE_API_KEY`). All external services called directly with your own credentials.

## What stays the same

- Supabase (already direct — `SUPABASE_URL` + service role)
- Groq + Gemini (already direct — `GROQ_API_KEY`, `GEMINI_API_KEY`)
- All UI, routes, DB schema, RLS policies — untouched
- All product features (upload, OCR, mentor chat, Telegram inbox, sync from Drive)

## What changes

### 1. Google Drive — replace connector with your own OAuth app

`src/lib/gdrive.server.ts` currently posts to `connector-gateway.lovable.dev/google_drive/...` using `LOVABLE_API_KEY` + `GOOGLE_DRIVE_API_KEY`.

Rewrite to call `https://www.googleapis.com/drive/v3/...` directly using a Google **service account** OR an **OAuth refresh token** that you own. Recommended: refresh token (works with personal Gmail, no Google Workspace required).

New env vars (you create these in Google Cloud Console — full step list below):
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REFRESH_TOKEN`
- `GOOGLE_DRIVE_ROOT_FOLDER_ID` *(optional — the `UPSC-Genius-AI` folder)*

Access-token caching: refresh on demand, cache in memory for ~50 min (Google tokens live 1 hr).

Resumable upload session creation, metadata, download, list, delete — all rewritten against `googleapis.com` endpoints. The browser-side resumable PUT loop in `src/lib/drive-upload.ts` stays exactly as-is (it already talks straight to Google).

### 2. Telegram — replace connector with direct Bot API

`src/lib/telegram.server.ts` currently posts to `connector-gateway.lovable.dev/telegram/...`.

Rewrite to call `https://api.telegram.org/bot<TOKEN>/...` directly.

New env vars:
- `TELEGRAM_BOT_TOKEN` (from @BotFather)
- `TELEGRAM_WEBHOOK_SECRET` (random string you generate — used to verify webhook authenticity)

Update `src/routes/api/public/telegram/webhook.ts` signature check to compare against `TELEGRAM_WEBHOOK_SECRET` instead of deriving it from `TELEGRAM_API_KEY`.

### 3. Remove LOVABLE_API_KEY everywhere

Search/replace and delete all references. Update `.env.example` accordingly.

## Files I'll modify

| File | Change |
|---|---|
| `src/lib/gdrive.server.ts` | Full rewrite — direct Drive v3 API with OAuth refresh token |
| `src/lib/telegram.server.ts` | Full rewrite — direct `api.telegram.org` calls |
| `src/routes/api/public/telegram/webhook.ts` | Use `TELEGRAM_WEBHOOK_SECRET` env directly |
| `.env.example` | Drop Lovable vars, add Google OAuth + Telegram vars |
| `docs/vercel-setup.md` *(new)* | Step-by-step env var setup for Vercel |

`src/lib/drive-upload.ts`, all `*.functions.ts`, all routes, all React components → **no changes**. They already call our server functions, which keep the same signatures.

## Google Cloud credentials you need to create

I'll write `docs/google-oauth-setup.md` with screenshots-style steps, but the credential list is:

1. **Google Cloud Project** (any name — e.g. "upsc-genius-ai")
2. **Enable Google Drive API** — APIs & Services → Library → "Google Drive API" → Enable
3. **OAuth consent screen** — External, app name, your email as support, add scope `https://www.googleapis.com/auth/drive.file` (recommended) or `.../auth/drive` (full Drive access). Add yourself as a test user.
4. **OAuth 2.0 Client ID** — Credentials → Create Credentials → OAuth client ID → **Web application**
   - Authorized redirect URI: `https://developers.google.com/oauthplayground`
   - Copy **Client ID** + **Client Secret**
5. **Generate refresh token** via OAuth Playground:
   - https://developers.google.com/oauthplayground/
   - Gear icon → tick "Use your own OAuth credentials" → paste Client ID/Secret
   - Step 1: select scope `https://www.googleapis.com/auth/drive.file`
   - Authorize → exchange code → copy **Refresh token**
6. *(Optional)* Create a folder in your Drive named `UPSC-Genius-AI`, copy its folder ID from the URL → set as `GOOGLE_DRIVE_ROOT_FOLDER_ID`

## Telegram credentials

1. Open @BotFather → `/newbot` (or `/token` for existing) → copy **Bot Token** → `TELEGRAM_BOT_TOKEN`
2. Generate any 32+ char random string → `TELEGRAM_WEBHOOK_SECRET`
3. After deploying, register webhook:
   ```
   curl "https://api.telegram.org/bot$TOKEN/setWebhook?url=https://YOUR-VERCEL-URL/api/public/telegram/webhook&secret_token=$SECRET"
   ```

## Final Vercel env var list

```
# Supabase
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
APP_SUPABASE_SERVICE_ROLE_KEY
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY

# AI
GROQ_API_KEY
GEMINI_API_KEY

# Google Drive (your own OAuth app)
GOOGLE_OAUTH_CLIENT_ID
GOOGLE_OAUTH_CLIENT_SECRET
GOOGLE_OAUTH_REFRESH_TOKEN
GOOGLE_DRIVE_ROOT_FOLDER_ID   # optional

# Telegram (your own bot)
TELEGRAM_BOT_TOKEN
TELEGRAM_WEBHOOK_SECRET
```

No `LOVABLE_API_KEY`. No `GOOGLE_DRIVE_API_KEY`. No `TELEGRAM_API_KEY`.

## Risks / things to know

- **drive.file scope** = the app only sees files it created itself. Same behaviour you have today. If you want it to see ALL Drive files, use scope `.../auth/drive` instead in step 3+5 above.
- **Existing files** uploaded via the Lovable connector live under that connector's grant — your new OAuth app won't see them. Solution: move them into your `UPSC-Genius-AI` folder manually once, or re-upload. I'll add a clear error message in the UI.
- **Refresh token expiry**: refresh tokens issued from OAuth Playground for an app in "Testing" mode expire after 7 days. After your OAuth consent screen is "In production" (no Google verification needed for drive.file scope on a single-user app), they don't expire. I'll document this.

## Order of work

1. Write `docs/google-oauth-setup.md` + `docs/vercel-setup.md`
2. Rewrite `src/lib/gdrive.server.ts`
3. Rewrite `src/lib/telegram.server.ts` + webhook route
4. Update `.env.example`
5. Typecheck — confirm zero references to gateway / LOVABLE_API_KEY remain in `src/`

After you approve, I'll do all five in one pass. You then create the Google + Telegram credentials, paste into Vercel, redeploy.
