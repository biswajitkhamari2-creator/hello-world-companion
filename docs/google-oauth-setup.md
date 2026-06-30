# Google Drive OAuth setup

You'll create your own Google Cloud OAuth app and generate a long-lived
refresh token. The app uses this to upload, list, download, and delete files
on your Google Drive directly — no Lovable runtime involved.

Time required: ~10 minutes.

## 1. Create / pick a Google Cloud project

1. Go to https://console.cloud.google.com/
2. Top bar → project picker → **New Project** → name it e.g. `upsc-genius-ai` → Create.

## 2. Enable the Google Drive API

1. APIs & Services → **Library**
2. Search "Google Drive API" → click → **Enable**

## 3. Configure the OAuth consent screen

1. APIs & Services → **OAuth consent screen**
2. User type: **External** → Create
3. Fill in:
   - App name: `UPSC Genius AI`
   - User support email: your email
   - Developer contact: your email
4. **Scopes** step → Add or Remove Scopes →
   add `https://www.googleapis.com/auth/drive.file`
   *(this scope lets the app only see files it created — recommended)*
   If you want the app to see your entire Drive instead, use
   `https://www.googleapis.com/auth/drive` here AND in step 5.
5. **Test users** step → add your own Google account.
6. Save. Leave the app in "Testing" mode for now.

> Note on refresh-token expiry: in Testing mode, refresh tokens expire after
> 7 days. To make them permanent, click **PUBLISH APP** on the consent
> screen (no Google verification is needed for the `drive.file` scope on a
> personal-use app — you'll get an "unverified" warning during step 5 of
> token generation, which is fine).

## 4. Create OAuth Client ID

1. APIs & Services → **Credentials** → Create Credentials → **OAuth client ID**
2. Application type: **Web application**
3. Name: `upsc-genius-vercel`
4. Authorized redirect URIs → Add URI: `https://developers.google.com/oauthplayground`
5. Create → **copy the Client ID and Client Secret** somewhere safe.

These map to:
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`

## 5. Generate the refresh token

1. Open https://developers.google.com/oauthplayground/
2. Top-right ⚙️ → tick **Use your own OAuth credentials** → paste Client ID + Secret → close.
3. Left panel → "Step 1 Select & authorize APIs" → paste
   `https://www.googleapis.com/auth/drive.file` into the input → **Authorize APIs**
4. Sign in with the same Google account you added as a test user. Accept the warning if shown.
5. You land on "Step 2 Exchange authorization code for tokens" → click **Exchange authorization code for tokens**
6. Copy the **Refresh token** value.

This maps to `GOOGLE_OAUTH_REFRESH_TOKEN`.

## 6. (Optional) Pin a Drive folder

The app stores uploads under `My Drive/UPSC-Genius-AI/<userId>/` automatically.
If you want it to use a specific existing folder:

1. In Drive, create or open the folder.
2. Copy the folder ID from the URL: `https://drive.google.com/drive/folders/<THIS_PART>`
3. Set `GOOGLE_DRIVE_ROOT_FOLDER_ID` to that ID.

## 7. Paste into Vercel

Vercel → Project → Settings → Environment Variables (Production + Preview):

```
GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
GOOGLE_OAUTH_REFRESH_TOKEN=...
GOOGLE_DRIVE_ROOT_FOLDER_ID=  # optional
```

Then **Deployments → ⋯ → Redeploy**.

## Troubleshooting

- **`invalid_grant`** — refresh token expired (7-day Testing-mode limit). Publish the consent screen in step 3, then regenerate the token via step 5.
- **`insufficient authentication scopes`** — you authorized a different scope than the one used by the app. Re-run step 5 with `drive.file`.
- **404 on download** — the file was uploaded under a previous credential; `drive.file` scope only sees files this app created itself. Re-upload, or switch the consent screen scope to full `drive`.