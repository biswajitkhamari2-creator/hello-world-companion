// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Build target selection:
//   DEPLOY_TARGET=node    → Node VPS (HostingStar / Hostinger / any Ubuntu VPS)
//   DEPLOY_TARGET=vercel  → Vercel serverless (default outside Lovable)
// Inside Lovable's sandbox the preset is force-pinned to Cloudflare; this is ignored.
const preset =
  process.env.DEPLOY_TARGET === "node"
    ? "node-server"
    : process.env.DEPLOY_TARGET === "vercel"
      ? "vercel"
      : "vercel";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset,
    externals: {
      inline: ["tslib"]
    }
  },
});
