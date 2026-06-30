# Vercel deployment — environment variables

Paste these into Vercel → Project → Settings → Environment Variables,
ticking **Production** AND **Preview** for each. Then **Deployments → ⋯ → Redeploy**.

## Required

| Variable | Where to get it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase Project Settings → API → Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase Project Settings → API → Project API keys → `anon` / publishable |
| `SUPABASE_URL` | Same value as `VITE_SUPABASE_URL` |
| `SUPABASE_PUBLISHABLE_KEY` | Same value as `VITE_SUPABASE_PUBLISHABLE_KEY` |
| `APP_SUPABASE_SERVICE_ROLE_KEY` | Supabase Project Settings → API → `service_role` key (secret) |
| `GROQ_API_KEY` | https://console.groq.com/keys |
| `GEMINI_API_KEY` | https://aistudio.google.com/app/apikey |
| `GOOGLE_CLIENT_ID` | Google Cloud Console → Credentials → OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console → Credentials → OAuth client ID |
| `GOOGLE_REFRESH_TOKEN` | Visit `https://<your-vercel-domain>/api/oauth/google/start` once after deploying, copy the token shown on the callback page |
| `TELEGRAM_BOT_TOKEN` | @BotFather → `/newbot` or `/token` |
| `TELEGRAM_WEBHOOK_SECRET` | Generate any random 32+ char string (e.g. `openssl rand -hex 32`) |

## Optional

| Variable | Default |
|---|---|
| `GOOGLE_DRIVE_ROOT_FOLDER_ID` | Auto-creates a `UPSC-Genius-AI` folder in My Drive |

## Removed (no longer needed)

The app no longer depends on the Lovable runtime, so these are **NOT** required:

- ~~`LOVABLE_API_KEY`~~
- ~~`GOOGLE_DRIVE_API_KEY`~~
- ~~`TELEGRAM_API_KEY`~~

If they're already set in Vercel you can leave them — they're just ignored.

## Register the Telegram webhook (once, after first successful deploy)

Replace `<TOKEN>`, `<SECRET>`, `<URL>`:

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=<URL>/api/public/telegram/webhook" \
  -d "secret_token=<SECRET>" \
  -d 'allowed_updates=["message","channel_post","edited_message","edited_channel_post"]'
```

Verify:

```bash
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

Expected: `"url": "<URL>/api/public/telegram/webhook"` and `"pending_update_count": 0`.

## Smoke tests after redeploy

```bash
# 1. Site is up
curl -I https://YOUR-VERCEL-URL/

# 2. Mentor API is configured (should be 401/400 if you don't auth, NOT 503)
curl -X POST https://YOUR-VERCEL-URL/api/mentor -H "Content-Type: application/json" -d '{}'

# 3. Telegram webhook is live (should be 401 — that means signature check is working)
curl -X POST https://YOUR-VERCEL-URL/api/public/telegram/webhook -d '{}'
```