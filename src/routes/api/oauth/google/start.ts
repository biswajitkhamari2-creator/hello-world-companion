import { createFileRoute } from "@tanstack/react-router";

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

// One-time helper to mint a Google OAuth refresh token for this app's own
// Google Cloud OAuth client. Visit this URL on your deployed Vercel site
// (e.g. https://your-app.vercel.app/api/oauth/google/start), sign in with
// the Google account whose Drive should host uploaded files, then paste
// the printed refresh token into Vercel as GOOGLE_REFRESH_TOKEN.
export const Route = createFileRoute("/api/oauth/google/start")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const clientId = getClientId();
        if (!clientId) {
          return new Response(
            "GOOGLE_CLIENT_ID is not set in this deployment's environment variables.",
            { status: 500 },
          );
        }
        const origin = new URL(request.url).origin;
        const redirectUri = `${origin}/api/oauth/google/callback`;
        const scope = "https://www.googleapis.com/auth/drive.file";
        const authUrl =
          "https://accounts.google.com/o/oauth2/v2/auth?" +
          new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            response_type: "code",
            scope,
            access_type: "offline",
            prompt: "consent",
            include_granted_scopes: "true",
          }).toString();
        return Response.redirect(authUrl, 302);
      },
    },
  },
});