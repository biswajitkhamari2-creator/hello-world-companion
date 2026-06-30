import { createFileRoute } from "@tanstack/react-router";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function cleanEnvValue(value: string | undefined): string {
  const cleaned = (value ?? "").trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    return cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

function getClientId(): string {
  return cleanEnvValue(process.env.GOOGLE_CLIENT_ID) || cleanEnvValue(process.env.GOOGLE_OAUTH_CLIENT_ID);
}

function getClientSecret(): string {
  return cleanEnvValue(process.env.GOOGLE_CLIENT_SECRET) || cleanEnvValue(process.env.GOOGLE_OAUTH_CLIENT_SECRET);
}

export const Route = createFileRoute("/api/oauth/google/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");
        if (error) return new Response(`Google OAuth error: ${error}`, { status: 400 });
        if (!code) return new Response("Missing ?code in callback", { status: 400 });

        const clientId = getClientId();
        const clientSecret = getClientSecret();
        if (!clientId || !clientSecret) {
          return new Response(
            "GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not configured on this deployment.",
            { status: 500 },
          );
        }
        const redirectUri = `${url.origin}/api/oauth/google/callback`;

        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
          }),
        });
        const tokenJson = (await tokenRes.json()) as {
          refresh_token?: string;
          access_token?: string;
          error?: string;
          error_description?: string;
        };
        if (!tokenRes.ok) {
          const hint = tokenJson.error === "invalid_client"
            ? " The OAuth client secret in Vercel is present but invalid/mismatched for this GOOGLE_CLIENT_ID. Re-copy the secret from Google Cloud → Credentials → same OAuth Web client."
            : "";
          return new Response(
            `Token exchange failed (${tokenRes.status}): ${tokenJson.error ?? ""} ${tokenJson.error_description ?? ""}.${hint}`,
            { status: 500 },
          );
        }
        if (!tokenJson.refresh_token) {
          return new Response(
            "Google did not return a refresh_token. This usually means you've already authorized this app — revoke access at https://myaccount.google.com/permissions and try again.",
            { status: 400 },
          );
        }

        const rt = escapeHtml(tokenJson.refresh_token);
        const html = `<!doctype html><html><head><meta charset="utf-8"><title>Google Refresh Token</title>
<style>body{font-family:system-ui;max-width:720px;margin:40px auto;padding:0 20px;line-height:1.5}code{background:#f4f4f5;padding:2px 6px;border-radius:4px}pre{background:#0f172a;color:#e2e8f0;padding:16px;border-radius:8px;overflow-x:auto;word-break:break-all;white-space:pre-wrap}</style>
</head><body>
<h1>✅ Refresh token generated</h1>
<p>Copy this value and paste it into Vercel → Settings → Environment Variables as <code>GOOGLE_REFRESH_TOKEN</code> (Production + Preview), then redeploy.</p>
<pre id="t">${rt}</pre>
<p><b>Important:</b> Do not share this token. After saving it in Vercel, you can delete this tab.</p>
<p>Then delete the route files <code>src/routes/api/oauth/google/start.ts</code> and <code>src/routes/api/oauth/google/callback.ts</code> if you don't want anyone else hitting these endpoints.</p>
</body></html>`;
        return new Response(html, {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
        });
      },
    },
  },
});