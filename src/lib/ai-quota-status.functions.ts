import { createServerFn } from "@tanstack/react-start";

export type ProviderStatus = {
  name: "nvidia" | "groq" | "gemini";
  label: string;
  configured: boolean;
  authorized: boolean;
  rateLimited: boolean;
};

export type AiQuotaStatus = {
  providers: ProviderStatus[];
  active: ProviderStatus["name"] | null;
  message: string;
  level: "ok" | "warn" | "critical" | "down";
};

const LABELS: Record<ProviderStatus["name"], string> = {
  nvidia: "NVIDIA",
  groq: "Groq",
  gemini: "Gemini",
};

function cleanKey(v: string | undefined) {
  if (!v) return undefined;
  let c = v.trim().replace(/^['"]|['"]$/g, "");
  const m = c.match(/^[A-Z0-9_]+\s*=\s*(.+)$/i);
  if (m?.[1]) c = m[1].trim().replace(/^['"]|['"]$/g, "");
  return c || undefined;
}

function urlFor(p: ProviderStatus["name"]) {
  if (p === "nvidia") return "https://integrate.api.nvidia.com/v1/models";
  if (p === "groq") return "https://api.groq.com/openai/v1/models";
  return "https://generativelanguage.googleapis.com/v1beta/openai/models";
}

async function checkProvider(p: ProviderStatus["name"], key: string): Promise<{ authorized: boolean; rateLimited: boolean }> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 4000);
  try {
    const r = await fetch(urlFor(p), {
      headers: { Authorization: `Bearer ${key}` },
      signal: ac.signal,
    });
    return { authorized: r.status !== 401 && r.status !== 403, rateLimited: r.status === 429 };
  } catch {
    return { authorized: true, rateLimited: false };
  } finally {
    clearTimeout(t);
  }
}

export const getAiQuotaStatus = createServerFn({ method: "GET" }).handler(async (): Promise<AiQuotaStatus> => {
  const keys: Record<ProviderStatus["name"], string | undefined> = {
    nvidia: cleanKey(process.env.NVIDIA_API_KEY),
    groq: cleanKey(process.env.GROQ_API_KEY),
    gemini: cleanKey(process.env.GEMINI_API_KEY),
  };
  const order: ProviderStatus["name"][] = ["nvidia", "groq", "gemini"];
  const results = await Promise.all(
    order.map(async (name) => {
      const key = keys[name];
      if (!key) return { name, label: LABELS[name], configured: false, authorized: false, rateLimited: false };
      const { authorized, rateLimited } = await checkProvider(name, key);
      return { name, label: LABELS[name], configured: true, authorized, rateLimited };
    }),
  );

  const healthy = results.filter((r) => r.configured && r.authorized && !r.rateLimited);
  const active = healthy[0]?.name ?? null;
  let level: AiQuotaStatus["level"] = "ok";
  let message = "";

  if (!active) {
    level = "down";
    message = "All AI providers exhausted or unauthorized. AI features paused.";
  } else if (healthy.length === 1) {
    level = "critical";
    message = `Only ${LABELS[active]} is available. Other AI providers exhausted.`;
  } else if (active !== "nvidia" && results.find((r) => r.name === "nvidia")?.configured) {
    level = "warn";
    message = `NVIDIA quota exhausted — switched to ${LABELS[active]}.`;
  } else {
    message = `AI running on ${LABELS[active]}. ${healthy.length} providers healthy.`;
  }

  return { providers: results, active, message, level };
});