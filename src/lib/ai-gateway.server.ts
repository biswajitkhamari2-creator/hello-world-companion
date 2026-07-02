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
  // Gemini-only: OpenRouter / NVIDIA / Groq are disabled by request. Even if
  // their env vars are set, we ignore them so all traffic routes to Gemini.
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
  return getAiApiKey("gemini") ? ["gemini"] : [];
}

export function getDefaultModel(provider?: AiProviderName) {
  void provider;
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
  void preferredProvider;
  const apiKey = getAiApiKey("gemini");
  if (!apiKey) throw new Error("No AI key configured. Set GEMINI_API_KEY in project secrets.");
  if (!(await isProviderAuthorized("gemini", apiKey))) throw new Error("GEMINI_API_KEY was rejected by Google.");
  return "gemini";
}

export function createGateway(initialRunId?: string, preferredProvider?: AiProviderName) {
  void preferredProvider;
  const apiKey = getAiApiKey("gemini");
  if (!apiKey) throw new Error("No AI key configured. Set GEMINI_API_KEY in project secrets.");
  const providerName: AiProviderName = "gemini";

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
    fetch: async (input, init) => {
      const started = Date.now();
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
          provider: providerName,
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
          provider: providerName,
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
  const hasOpenRouter = Boolean(getAiApiKey("openrouter"));
  const hasNvidia = Boolean(getAiApiKey("nvidia"));
  const hasGroq = Boolean(getAiApiKey("groq"));
  const hasGemini = Boolean(getAiApiKey("gemini"));

  // Hybrid routing:
  //  - Premium generation tasks (handwritten notes, infographics, long/structured
  //    notes, mind maps, essays, answer writing, PDFs) prefer Gemini for quality.
  //  - Chat / analysis / summarisation tasks (mentor, news, editorial, Q&A,
  //    MCQ explanations, quick summaries) prefer OpenRouter for cost + speed.
  // Whichever primary is missing, we fall back to the other configured provider.
  const premiumTasks = new Set([
    "handwritten_notes",
    "infographics",
    "mindmap",
    "mind_map",
    "long_notes",
    "comprehensive_notes",
    "structured_notes",
    "answer_writing",
    "essay",
    "pdf",
  ]);
  const isPremium = task ? premiumTasks.has(task) : false;

  // Premium → Gemini preferred
  if (isPremium && hasGemini) {
    return {
      provider: "gemini",
      model: "gemini-2.5-flash",
      chunkSize: task === "infographics" ? 60_000 : task === "handwritten_notes" ? 28_000 : 80_000,
      recommendedConcurrency: 4,
      minGapMs: 250,
      maxOutputTokens: task === "infographics" ? 3_500 : task === "handwritten_notes" ? 7_000 : 4_000,
    };
  }

  // Newspaper analysis needs the strongest OCR/layout handling. Keep it on
  // direct Gemini when available; OpenRouter remains for chat and light analysis.
  if (task === "newspaper") {
    if (hasGemini) {
      return {
        provider: "gemini",
        model: "gemini-2.5-flash",
        chunkSize: 60_000,
        recommendedConcurrency: 2,
        minGapMs: 750,
        maxOutputTokens: 3_800,
      };
    }
    if (hasOpenRouter) {
      return {
        provider: "openrouter",
        model: "google/gemini-2.5-flash",
        chunkSize: 60_000,
        recommendedConcurrency: 2,
        minGapMs: 750,
        maxOutputTokens: 3_500,
      };
    }
    if (hasNvidia) {
      return {
        provider: "nvidia",
        model: "meta/llama-3.3-70b-instruct",
        chunkSize: 32_000,
        recommendedConcurrency: 3,
        minGapMs: 500,
        maxOutputTokens: 2_500,
      };
    }
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
  }

  // Chat / analysis → OpenRouter preferred (cheap + fast)
  if (!isPremium && hasOpenRouter) {
    return {
      provider: "openrouter",
      model: "google/gemini-2.5-flash-lite",
      chunkSize: 60_000,
      recommendedConcurrency: 4,
      minGapMs: 250,
      maxOutputTokens: task === "newspaper" ? 3_500 : 3_000,
    };
  }

  // Fallbacks when the preferred provider for the category is missing.
  if (isPremium && hasOpenRouter) {
    return {
      provider: "openrouter",
      model: "google/gemini-2.5-flash",
      chunkSize: task === "infographics" ? 60_000 : task === "handwritten_notes" ? 28_000 : 60_000,
      recommendedConcurrency: 4,
      minGapMs: 250,
      maxOutputTokens: task === "infographics" ? 3_500 : task === "handwritten_notes" ? 6_000 : 3_000,
    };
  }
  if (!isPremium && hasGemini) {
    return {
      provider: "gemini",
      model: "gemini-2.5-flash",
      chunkSize: 60_000,
      recommendedConcurrency: 4,
      minGapMs: 250,
      maxOutputTokens: 3_000,
    };
  }

  if (hasGemini) {
    return {
      provider: "gemini",
      model: "gemini-2.5-flash",
      chunkSize: task === "infographics" ? 60_000 : task === "handwritten_notes" ? 28_000 : 80_000,
      recommendedConcurrency: 4,
      minGapMs: 250,
      maxOutputTokens: task === "infographics" ? 3_500 : task === "handwritten_notes" ? 7_000 : 3_000,
    };
  }

  if (hasNvidia) {
    return {
      provider: "nvidia",
      model: "meta/llama-3.3-70b-instruct",
      chunkSize: task === "infographics" ? 32_000 : task === "handwritten_notes" ? 18_000 : 40_000,
      recommendedConcurrency: 3,
      minGapMs: 500,
      maxOutputTokens: task === "infographics" ? 2_500 : task === "handwritten_notes" ? 5_000 : 2_200,
    };
  }

  if (hasGroq) {
    return {
      provider: "groq",
      model: "llama-3.1-8b-instant",
      chunkSize: task === "infographics" ? 12_000 : task === "handwritten_notes" ? 8_000 : 14_000,
      recommendedConcurrency: 1,
      minGapMs: 65_000,
      maxOutputTokens: task === "infographics" ? 1_800 : task === "handwritten_notes" ? 4_000 : 1_600,
    };
  }

  return {
    provider: "gemini",
    model: "gemini-2.5-flash",
    chunkSize: task === "infographics" ? 32_000 : 40_000,
    recommendedConcurrency: 2,
    minGapMs: 4_000,
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
