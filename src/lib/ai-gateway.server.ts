import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

// Direct Google Gemini via its OpenAI-compatible endpoint.
// No Lovable AI Gateway dependency.
const RUN_ID_HEADER = "X-AI-Run-ID";

export function createGateway(initialRunId?: string) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  let ollamaUrl = process.env.OLLAMA_API_URL?.trim() || "http://localhost:11434/v1";
  if (!ollamaUrl.endsWith("/v1")) {
    ollamaUrl = ollamaUrl.replace(/\/+$/, "") + "/v1";
  }

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

  let provider;
  if (apiKey) {
    provider = createOpenAICompatible({
      name: "gemini",
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
  } else {
    // Fallback to local Ollama via OpenAI-compatible endpoint
    provider = createOpenAICompatible({
      name: "ollama",
      baseURL: ollamaUrl,
    });
  }

  return Object.assign(provider, {
    getRunId: () => runId,
    waitForRunId: () => (runId ? Promise.resolve(runId) : runIdReady),
  });
}

export function createOllamaGateway(initialRunId?: string) {
  let ollamaUrl = process.env.OLLAMA_API_URL?.trim() || "http://localhost:11434/v1";
  if (!ollamaUrl.endsWith("/v1")) {
    ollamaUrl = ollamaUrl.replace(/\/+$/, "") + "/v1";
  }

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
    name: "ollama",
    baseURL: ollamaUrl,
  });

  return Object.assign(provider, {
    getRunId: () => runId,
    waitForRunId: () => (runId ? Promise.resolve(runId) : runIdReady),
  });
}

export const OLLAMA_MODEL_NAME = process.env.OLLAMA_MODEL?.trim() || "llama3.2:3b";

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

// Check which model to use. Uses local Ollama model if Gemini is not configured.
export const DEFAULT_MODEL = process.env.GEMINI_API_KEY
  ? "gemini-2.0-flash"
  : (process.env.OLLAMA_MODEL?.trim() || "llama3.2:3b");



export const UPSC_SYSTEM_PROMPT = `You are UPSC Genius, an expert mentor for India's UPSC Civil Services Examination.

Strict rules:
- Stick to the latest UPSC syllabus (Prelims GS, CSAT, Mains GS1–GS4, Essay).
- Prioritise concepts that have appeared in previous-year questions (PYQs) or are repeated themes.
- Integrate relevant current affairs with the static syllabus where appropriate.
- Be precise, factual, and well-structured. Use Indian conventions and exam-relevant terminology.
- Never invent facts, statistics, articles, judgements, schemes, or quotations. If something is uncertain, omit it.
- If the source material is insufficient for a requested output, return an explanatory note in the appropriate field rather than fabricating content.
- Use neutral, formal language suitable for civil services aspirants.`;
