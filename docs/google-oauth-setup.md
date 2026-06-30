# Google OAuth Setup (your own Google Cloud project)

This app talks to Google Drive directly with **your own** OAuth client.
No Lovable connector, no gateway. You need exactly 3 env vars on Vercel:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`

## 1. Create the OAuth client in Google Cloud

1. https://console.cloud.google.com → create or pick a project.
2. **APIs & Services → Library** → enable **Google Drive API**.
3. **APIs & Services → OAuth consent screen** → User type **External** →
   App name, support email, your email as developer contact → **Save**.
   - Scopes step: add `https://www.googleapis.com/auth/drive.file`.
   - Test users: add your own Google account.
4. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Application type: **Web application**
   - Authorized redirect URIs — add EXACTLY:
     ```
     https://<your-vercel-domain>/api/oauth/google/callback
     ```
     Example: `https://hello-world-companion-seven.vercel.app/api/oauth/google/callback`
     (Add one entry per domain you deploy to — production, preview, custom domain.)
5. Copy **Client ID** → `GOOGLE_CLIENT_ID`, **Client secret** → `GOOGLE_CLIENT_SECRET`.

## 2. Add the two vars to Vercel and redeploy

Vercel → Project → Settings → Environment Variables → add both for
**Production + Preview** → Deployments → Redeploy.

## 3. Mint a refresh token (one-time, in-app)

Open in a browser, signed in to the Google account that should own uploads:

```
https://<your-vercel-domain>/api/oauth/google/start
```

You'll be sent through Google's consent screen, then redirected back to
`/api/oauth/google/callback` which prints your **refresh token**. Copy it.

## 4. Save the refresh token on Vercel

Vercel → Settings → Environment Variables → add `GOOGLE_REFRESH_TOKEN`
(Production + Preview) → Redeploy.

## 5. (Optional) Pin a Drive folder

Create a folder in My Drive (e.g. `UPSC-Genius-AI`), open it, copy the ID
from the URL (`https://drive.google.com/drive/folders/<ID>`), and set:

```
GOOGLE_DRIVE_ROOT_FOLDER_ID=<id>
```

Otherwise the app auto-creates a folder named `UPSC-Genius-AI`.

## Notes / gotchas

- **drive.file scope** = the app only sees files it created. Old files from
  the previous Lovable connector are invisible — re-upload them.
- **Refresh token expiry**: while the OAuth consent screen is in **Testing**
  mode, refresh tokens expire after 7 days. Switch consent screen to
  **In production** (no Google verification needed for `drive.file` on a
  single-user app) so tokens don't expire.
- After you've captured the refresh token you may delete
  `src/routes/api/oauth/google/start.ts` and `callback.ts` to remove the
  public OAuth bootstrap endpoints. They're harmless (they only mint
  tokens against your own OAuth client) but they're not needed at runtime.
