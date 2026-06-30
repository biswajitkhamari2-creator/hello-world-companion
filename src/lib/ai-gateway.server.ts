import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

// Direct Groq / Google Gemini via OpenAI-compatible endpoints.
// No Lovable AI Gateway dependency.
const RUN_ID_HEADER = "X-AI-Run-ID";

export type AiProviderName = "nvidia" | "groq" | "gemini";

function cleanSecretValue(value: string | undefined): string | undefined {
  if (!value) return undefined;
  let cleaned = value.trim().replace(/^['"]|['"]$/g, "");
  const assignment = cleaned.match(/^[A-Z0-9_]+\s*=\s*(.+)$/i);
  if (assignment?.[1]) cleaned = assignment[1].trim().replace(/^['"]|['"]$/g, "");
  return cleaned || undefined;
}

function getAiApiKey(provider: AiProviderName): string | undefined {
  if (provider === "nvidia") return cleanSecretValue(process.env.NVIDIA_API_KEY);
  if (provider === "groq") return cleanSecretValue(process.env.GROQ_API_KEY);
  return cleanSecretValue(process.env.GEMINI_API_KEY);
}

function providerBaseUrl(provider: AiProviderName) {
  if (provider === "nvidia") return "https://integrate.api.nvidia.com/v1";
  if (provider === "groq") return "https://api.groq.com/openai/v1";
  return "https://generativelanguage.googleapis.com/v1beta/openai";
}

export function getConfiguredAiProviders(): AiProviderName[] {
  const providers: AiProviderName[] = [];
  if (getAiApiKey("nvidia")) providers.push("nvidia");
  if (getAiApiKey("groq")) providers.push("groq");
  if (getAiApiKey("gemini")) providers.push("gemini");
  return providers;
}

export function getDefaultModel(provider?: AiProviderName) {
  const resolved =
    provider ?? (getAiApiKey("nvidia") ? "nvidia" : getAiApiKey("groq") ? "groq" : "gemini");
  if (resolved === "nvidia") return "meta/llama-3.3-70b-instruct";
  if (resolved === "groq") return "llama-3.1-8b-instant";
  return "gemini-2.0-flash";
}

async function isProviderAuthorized(provider: AiProviderName, apiKey: string): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);
  try {
    const response = await fetch(`${providerBaseUrl(provider)}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
    });
    return response.status !== 401 && response.status !== 403;
  } catch {
    // If the lightweight check is blocked by the provider/network, still try the real request.
    return true;
  } finally {
    clearTimeout(timeout);
  }
}

export async function resolveAvailableAiProvider(preferredProvider?: AiProviderName): Promise<AiProviderName> {
  const configured = getConfiguredAiProviders();
  if (!configured.length) {
    throw new Error("No AI key configured. Set GROQ_API_KEY (preferred) or GEMINI_API_KEY in project secrets.");
  }

  const order: AiProviderName[] = preferredProvider
    ? [preferredProvider, ...configured.filter((provider) => provider !== preferredProvider)]
    : (["nvidia", "groq", "gemini"] as AiProviderName[]).filter((provider) => configured.includes(provider));

  const rejected: AiProviderName[] = [];
  for (const provider of order) {
    const apiKey = getAiApiKey(provider);
    if (!apiKey) continue;
    if (await isProviderAuthorized(provider, apiKey)) return provider;
    rejected.push(provider);
  }

  throw new Error(`AI provider key rejected: ${rejected.join(", ") || "configured provider"}`);
}

export function createGateway(initialRunId?: string, preferredProvider?: AiProviderName) {
  const configured = getConfiguredAiProviders();
  if (!configured.length) {
    throw new Error("No AI key configured. Set NVIDIA_API_KEY, GROQ_API_KEY, or GEMINI_API_KEY in project secrets.");
  }
  const providerName: AiProviderName =
    preferredProvider && configured.includes(preferredProvider) ? preferredProvider : configured[0];
  const apiKey = getAiApiKey(providerName)!;

  let runId = initialRunId?.trim() || undefined;
  let resolveRunId: (value: string | undefined) => void = () => {};
  let runIdResolved = false;
  const runIdReady = new Promise<string | undefined>((resolve) => {
    resolveRunId = resolve;
  });
  const publishRunId = (value?: string) => {
    const next = value?.trim() || undefined;
    if (!runId && next) runId = next;
    if (!runIdResolved) {
      runIdResolved = true;
      resolveRunId(runId);
    }
  };
  if (runId) publishRunId(runId);

  const provider = createOpenAICompatible({
    name: providerName,
    baseURL: providerBaseUrl(providerName),
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return Object.assign(provider, {
    getRunId: () => runId,
    waitForRunId: () => (runId ? Promise.resolve(runId) : runIdReady),
  });
}

export function getLovableAiGatewayRunId(request: Request) {
  return request.headers.get(RUN_ID_HEADER)?.trim() || undefined;
}

export function getLovableAiGatewayResponseHeaders(_providerHeaders: HeadersInit | undefined, init?: HeadersInit) {
  return new Headers(init);
}

export async function withLovableAiGatewayRunIdHeader(
  response: Response,
  _gateway: { getRunId: () => string | undefined; waitForRunId: () => Promise<string | undefined> },
  init?: HeadersInit,
) {
  const headers = new Headers(response.headers);
  new Headers(init).forEach((value, name) => headers.set(name, value));
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

// Backwards-compatible fallback; request handlers should prefer getDefaultModel(provider).
export const DEFAULT_MODEL = "llama-3.1-8b-instant";

export interface AiTaskProfile {
  provider: AiProviderName;
  model: string;
  chunkSize: number;
  recommendedConcurrency: number;
  minGapMs: number;
  maxOutputTokens: number;
}

export function getAiTaskProfile(task?: string): AiTaskProfile {
  const hasGroq = Boolean(getAiApiKey("groq"));
  const hasGemini = Boolean(getAiApiKey("gemini"));

  // Newspaper analysis is prompt + output heavy. With Groq free TPM, the
  // generation layer uses a deterministic local parser instead of sending a
  // huge prompt; keep Groq preferred because the user chose it over Gemini.
  if (task === "newspaper") {
    if (hasGroq) {
      return {
        provider: "groq",
        model: "llama-3.1-8b-instant",
        chunkSize: 10_000,
        recommendedConcurrency: 1,
        minGapMs: 1_500,
        maxOutputTokens: 1_400,
      };
    }
    return {
      provider: "gemini",
      model: "gemini-2.0-flash",
      chunkSize: 18_000,
      recommendedConcurrency: 1,
      minGapMs: hasGemini ? 8_000 : 65_000,
      maxOutputTokens: 3_000,
    };
  }

  if (hasGroq) {
    return {
      provider: "groq",
      model: "llama-3.1-8b-instant",
      chunkSize: task === "infographics" ? 12_000 : 14_000,
      recommendedConcurrency: 1,
      minGapMs: 65_000,
      maxOutputTokens: task === "infographics" ? 1_800 : 1_600,
    };
  }

  return {
    provider: "gemini",
    model: "gemini-2.0-flash",
    chunkSize: task === "infographics" ? 24_000 : 30_000,
    recommendedConcurrency: 1,
    minGapMs: 8_000,
    maxOutputTokens: task === "infographics" ? 3_000 : 2_500,
  };
}



export const UPSC_SYSTEM_PROMPT = `You are UPSC Genius, an expert mentor for India's UPSC Civil Services Examination.

Strict rules:
- Stick to the latest UPSC syllabus (Prelims GS, CSAT, Mains GS1–GS4, Essay).
- Prioritise concepts that have appeared in previous-year questions (PYQs) or are repeated themes.
- Integrate relevant current affairs with the static syllabus where appropriate.
- Be precise, factual, and well-structured. Use Indian conventions and exam-relevant terminology.
- Never invent facts, statistics, articles, judgements, schemes, or quotations. If something is uncertain, omit it.
- If the source material is insufficient for a requested output, return an explanatory note in the appropriate field rather than fabricating content.
- Use neutral, formal language suitable for civil services aspirants.`;
