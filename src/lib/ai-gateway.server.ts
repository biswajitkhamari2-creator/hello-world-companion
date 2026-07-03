import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

// Direct Groq / Google Gemini via OpenAI-compatible endpoints.
// No Lovable AI Gateway dependency.
const RUN_ID_HEADER = "X-AI-Run-ID";

export type AiProviderName = "openrouter" | "nvidia" | "groq" | "gemini";

// ---------------------------------------------------------------------------
// AI analytics (in-memory)
// ---------------------------------------------------------------------------
// Records every AI provider request made through createGateway. Data is kept
// per serverless instance only (resets on cold start) — good enough for a
// live admin dashboard without adding a new database table.

export interface AiRequestRecord {
  ts: number;
  provider: AiProviderName;
  model?: string;
  status: number;
  ok: boolean;
  durationMs: number;
  errorMessage?: string;
}

const AI_LOG_LIMIT = 500;
const aiRequestLog: AiRequestRecord[] = [];

function recordAiRequest(record: AiRequestRecord) {
  aiRequestLog.push(record);
  if (aiRequestLog.length > AI_LOG_LIMIT) {
    aiRequestLog.splice(0, aiRequestLog.length - AI_LOG_LIMIT);
  }
  if (!record.ok) {
    // eslint-disable-next-line no-console
    console.warn(`[ai] ${record.provider} ${record.model ?? ""} ${record.status} ${record.durationMs}ms ${record.errorMessage ?? ""}`);
  }
}

export function getAiRequestLog(): AiRequestRecord[] {
  return aiRequestLog.slice();
}

function cleanSecretValue(value: string | undefined): string | undefined {
  if (!value) return undefined;
  let cleaned = value.trim().replace(/^['"]|['"]$/g, "");
  const assignment = cleaned.match(/^[A-Z0-9_]+\s*=\s*(.+)$/i);
  if (assignment?.[1]) cleaned = assignment[1].trim().replace(/^['"]|['"]$/g, "");
  return cleaned || undefined;
}

function getAiApiKey(provider: AiProviderName): string | undefined {
  if (provider === "openrouter") return cleanSecretValue(process.env.OPENROUTER_API_KEY);
  if (provider === "nvidia") return cleanSecretValue(process.env.NVIDIA_API_KEY);
  if (provider === "groq") return cleanSecretValue(process.env.GROQ_API_KEY);
  if (provider === "gemini") return cleanSecretValue(process.env.GEMINI_API_KEY);
  return undefined;
}

function providerBaseUrl(provider: AiProviderName) {
  if (provider === "openrouter") return "https://openrouter.ai/api/v1";
  if (provider === "nvidia") return "https://integrate.api.nvidia.com/v1";
  if (provider === "groq") return "https://api.groq.com/openai/v1";
  return "https://generativelanguage.googleapis.com/v1beta/openai";
}

export function getConfiguredAiProviders(): AiProviderName[] {
  const list: AiProviderName[] = [];
  if (getAiApiKey("openrouter")) list.push("openrouter");
  if (getAiApiKey("groq")) list.push("groq");
  if (getAiApiKey("nvidia")) list.push("nvidia");
  if (getAiApiKey("gemini")) list.push("gemini");
  return list;
}

export function getDefaultModel(provider?: AiProviderName) {
  if (provider === "openrouter") return "openai/gpt-4o-mini";
  if (provider === "groq") return "llama-3.1-8b-instant";
  if (provider === "nvidia") return "meta/llama-3.1-8b-instruct";
  return "gemini-2.5-flash";
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
  const order: AiProviderName[] = [];
  if (preferredProvider) order.push(preferredProvider);
  for (const p of ["openrouter", "gemini", "groq", "nvidia"] as AiProviderName[]) {
    if (!order.includes(p)) order.push(p);
  }
  let lastError = "No AI key configured. Set OPENROUTER_API_KEY or GEMINI_API_KEY.";
  for (const p of order) {
    const key = getAiApiKey(p);
    if (!key) continue;
    if (await isProviderAuthorized(p, key)) return p;
    lastError = `${p.toUpperCase()}_API_KEY was rejected.`;
  }
  throw new Error(lastError);
}

export function createGateway(initialRunId?: string, preferredProvider?: AiProviderName) {
  const order: AiProviderName[] = [];
  if (preferredProvider) order.push(preferredProvider);
  for (const p of ["openrouter", "gemini", "groq", "nvidia"] as AiProviderName[]) {
    if (!order.includes(p)) order.push(p);
  }
  let providerName: AiProviderName | undefined;
  let apiKey: string | undefined;
  for (const p of order) {
    const k = getAiApiKey(p);
    if (k) { providerName = p; apiKey = k; break; }
  }
  if (!providerName || !apiKey) {
    throw new Error("No AI key configured. Set OPENROUTER_API_KEY or GEMINI_API_KEY in project secrets.");
  }
  const resolvedProvider = providerName;

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
    name: resolvedProvider,
    baseURL: providerBaseUrl(resolvedProvider),
    apiKey,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...(resolvedProvider === "openrouter"
        ? {
            "HTTP-Referer": "https://upsc-genius.lovable.app",
            "X-Title": "UPSC Genius AI",
          }
        : {}),
    },
    fetch: async (input, init) => {
      const started = Date.now();
      const hdrs = new Headers(init?.headers);
      console.log("[ai-fetch]", resolvedProvider, "keyLen:", apiKey?.length, "keyStart:", apiKey?.slice(0,10), "keyEnd:", apiKey?.slice(-4), "hasNewline:", /[\r\n\s]/.test(apiKey ?? ""));
      let modelHint: string | undefined;
      try {
        if (init?.body && typeof init.body === "string") {
          const parsed = JSON.parse(init.body);
          if (parsed && typeof parsed.model === "string") modelHint = parsed.model;
        }
      } catch {
        // ignore body parse errors
      }
      try {
        const response = await fetch(input, init);
        const durationMs = Date.now() - started;
        let errorMessage: string | undefined;
        if (!response.ok) {
          try {
            const clone = response.clone();
            const text = await clone.text();
            errorMessage = text.slice(0, 400);
          } catch {
            errorMessage = response.statusText;
          }
        }
        recordAiRequest({
          ts: started,
          provider: resolvedProvider,
          model: modelHint,
          status: response.status,
          ok: response.ok,
          durationMs,
          errorMessage,
        });
        return response;
      } catch (error) {
        recordAiRequest({
          ts: started,
          provider: resolvedProvider,
          model: modelHint,
          status: 0,
          ok: false,
          durationMs: Date.now() - started,
          errorMessage: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
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
  // Prefer OpenRouter (ChatGPT) when available — cheaper than direct Gemini for
  // chat/analysis. Falls back to Gemini for vision-heavy tasks if no OpenRouter key.
  const hasOpenRouter = !!getAiApiKey("openrouter");
  const hasGemini = !!getAiApiKey("gemini");

  // Newspaper / editorial need vision (PDF pages) — Gemini is required for those.
  const needsVision = task === "newspaper" || task === "editorial" || task === "ocr";
  const useOpenRouter = hasOpenRouter && !needsVision;
  const provider: AiProviderName = useOpenRouter ? "openrouter" : (hasGemini ? "gemini" : "openrouter");
  const model = useOpenRouter ? "openai/gpt-4o-mini" : "gemini-2.5-flash";
  return {
    provider,
    model,
    chunkSize:
      task === "infographics" ? 60_000 :
      task === "handwritten_notes" ? 28_000 :
      task === "newspaper" ? 60_000 :
      80_000,
    recommendedConcurrency: task === "newspaper" ? 2 : 4,
    minGapMs: task === "newspaper" ? 750 : 250,
    maxOutputTokens:
      task === "infographics" ? 3_500 :
      task === "handwritten_notes" ? 7_000 :
      task === "newspaper" ? 3_800 :
      4_000,
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
