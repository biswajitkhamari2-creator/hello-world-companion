import type { CapacitorConfig } from "@capacitor/cli";

// Lovable published URL — the live production deployment.
// The `project--<id>.lovable.app` stable URL currently returns 403 for this
// project (visibility/setup), which surfaced as "Forbidden" inside Android
// WebView. Point the wrapper at the actual published hostname instead.
const PUBLISHED_URL = "https://upsc-genius-alchemy.lovable.app";

const config: CapacitorConfig = {
  appId: "com.biswajit.geniusai",
  appName: "UPSC Genius AI",
  webDir: "www",
  // Remote WebView wrapper — points the native shell at the live deployed app.
  server: {
    url: PUBLISHED_URL,
    androidScheme: "https",
    cleartext: false,
    // Allow the WebView to navigate to these domains in-app (Supabase auth,
    // Google OAuth, Gemini, Telegram media). Anything else opens in browser.
    allowNavigation: [
      "*.lovable.app",
      "*.supabase.co",
      "*.googleapis.com",
      "accounts.google.com",
      "*.google.com",
      "*.gstatic.com",
      "api.telegram.org",
      "*.telegram.org",
    ],
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    // Use the modern WebView storage scheme.
    appendUserAgent: "UPSCGeniusAI-Android",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: "#1a1f3a",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      spinnerColor: "#d4a857",
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#1a1f3a",
      overlaysWebView: false,
    },
  },
};

export default config;
