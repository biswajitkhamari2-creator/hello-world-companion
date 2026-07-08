import {
  createGateway,
  UPSC_SYSTEM_PROMPT,
  getDefaultModel,
  getLovableAiGatewayResponseHeaders,
  getLovableAiGatewayRunId,
  resolveAvailableAiProvider,
  withLovableAiGatewayRunIdHeader,
} from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

type Body = { messages?: unknown; mode?: "simple" | "advanced"; language?: string };

const MODE_NOTES: Record<NonNullable<Body["mode"]>, string> = {
  simple:
    "Explain in simple, clear language. Use short sentences, everyday analogies, and step-by-step structure. Avoid jargon unless you define it.",
  advanced:
    "Explain at an advanced aspirant level. Use precise terminology, cite Articles / Sections / Committees / Reports / judgements where relevant, and surface PYQ linkages and inter-topic connections.",
};

function jsonError(message: string, status = 400, code = "MENTOR_ERROR") {
  return Response.json(
    { ok: false, error: { code, message } },
    { status, headers: { "cache-control": "no-store" } },
  );
}

function mentorErrorMessage(error: unknown): string {
  const err = error as { message?: string; statusCode?: number; responseBody?: string; cause?: unknown };
  const message = `${err?.message ?? ""} ${err?.responseBody ?? ""}`.toLowerCase();
  const causeMessage = err?.cause instanceof Error ? err.cause.message.toLowerCase() : "";

  if (err?.statusCode === 401 || err?.statusCode === 403 || message.includes("api key")) {
    return "AI Mentor is not authorised right now. Please retry after the server refreshes.";
  }
  if (err?.statusCode === 429 || message.includes("quota") || message.includes("rate") || causeMessage.includes("too many requests")) {
    return "AI Mentor limit reached for the moment. Please wait about one minute and retry.";
  }
  if (message.includes("missing gemini_api_key")) {
    return "AI Mentor is not configured yet. Please retry after the server refreshes.";
  }
  return "AI Mentor could not answer right now. Please retry.";
}

export const Route = createFileRoute("/api/mentor")({
  server: {
    handlers: {
      GET: async () => jsonError("Use POST to chat with the AI Mentor.", 405, "METHOD_NOT_ALLOWED"),
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            allow: "POST, OPTIONS",
            "cache-control": "no-store",
          },
        }),
      POST: async ({ request }) => {
        let body: Body;
        try {
          body = (await request.json()) as Body;
        } catch {
          return jsonError("Invalid request body. Please retry.", 400, "BAD_JSON");
        }

        const { messages, mode, language } = body;
        if (!Array.isArray(messages)) {
          return jsonError("Please send a message before asking the mentor.", 400, "MESSAGES_REQUIRED");
        }
        if (mode && mode !== "simple" && mode !== "advanced") {
          return jsonError("Invalid mentor mode.", 400, "INVALID_MODE");
        }

        const languageDirective =
          language === "or"
            ? "\n\nLANGUAGE MODE: PURE ODIA (ଓଡ଼ିଆ). You MUST respond ENTIRELY in the Odia script (ଓଡ଼ିଆ ଲିପି). Absolutely NO English words, NO Roman letters, NO Hindi/Devanagari, NO transliteration, NO code-mixing. Translate every technical term (Constitution → ସମ୍ବିଧାନ, Article → ଅନୁଚ୍ଛେଦ, Fundamental Rights → ମୌଳିକ ଅଧିକାର, etc.) into pure Odia. Use standard Odia punctuation (।). Numbers may be written in Odia numerals (୦-୯) or Arabic numerals. If you cannot express something in pure Odia, describe it in Odia rather than inserting English. Every single sentence — headings, bullets, examples, takeaways — must be in Odia script only."
            : language === "hi"
              ? "\n\nLanguage: Respond in Hindi (हिन्दी). Use Devanagari script. UPSC terminology may retain standard English/Sanskrit-origin terms when natural."
              : language === "hinglish"
                ? "\n\nLanguage: Respond in Hinglish — natural mix of Hindi and English as UPSC aspirants speak."
                : "";

        try {
          const initialRunId = getLovableAiGatewayRunId(request);
          if (!process.env.GEMINI_API_KEY?.trim()) {
            return jsonError(
              "AI Mentor is not configured: set GEMINI_API_KEY.",
              503,
              "AI_KEY_MISSING",
            );
          }
          // User preference: always Gemini 2.5.
          const availableProvider = await resolveAvailableAiProvider("gemini");
          const gateway = createGateway(initialRunId, availableProvider);
          const model = gateway(getDefaultModel(availableProvider));
          const result = streamText({
            model,
            maxRetries: 0,
            system: `${UPSC_SYSTEM_PROMPT}\n\nMentor mode: ${MODE_NOTES[mode ?? "simple"]}\n\nTeach like an experienced UPSC mentor: anchor concepts in the syllabus, link to PYQs and current affairs, and end with a one-line takeaway whenever useful.${languageDirective}`,
            messages: await convertToModelMessages(messages as UIMessage[]),
            onError: ({ error }) => {
              console.error("[mentor stream]", error);
            },
          });
          const response = result.toUIMessageStreamResponse({
            originalMessages: messages as UIMessage[],
            headers: getLovableAiGatewayResponseHeaders(undefined, {
              "cache-control": "no-store",
              ...(initialRunId ? { "X-Lovable-AIG-Run-ID": initialRunId } : {}),
            }),
            onError: mentorErrorMessage,
          });
          return withLovableAiGatewayRunIdHeader(response, gateway, { "cache-control": "no-store" });
        } catch (error) {
          console.error("[mentor api]", error);
          return jsonError(mentorErrorMessage(error), 500);
        }
      },
    },
  },
});
