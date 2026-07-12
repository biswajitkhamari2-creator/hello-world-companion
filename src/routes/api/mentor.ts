import {
  createGateway,
  DEFAULT_MODEL,
  createOllamaGateway,
  OLLAMA_MODEL_NAME,
  UPSC_SYSTEM_PROMPT,
  getLovableAiGatewayResponseHeaders,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

type Body = { messages?: unknown; mode?: "simple" | "advanced" };

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
        const requestId = crypto.randomUUID();
        let body: Body;
        try {
          body = (await request.json()) as Body;
        } catch {
          return jsonError("Invalid request body. Please retry.", 400, "BAD_JSON");
        }

        const { messages, mode } = body;
        if (!Array.isArray(messages)) {
          return jsonError("Please send a message before asking the mentor.", 400, "MESSAGES_REQUIRED");
        }
        if (mode && mode !== "simple" && mode !== "advanced") {
          return jsonError("Invalid mentor mode.", 400, "INVALID_MODE");
        }

        console.log(`[Request ID: ${requestId}] Prompt received from frontend:`, JSON.stringify(messages));

        try {
          const initialRunId = getLovableAiGatewayRunId(request);
          
          // Force local Ollama for AI Mentor
          const gateway = createOllamaGateway(initialRunId);
          const model = gateway(OLLAMA_MODEL_NAME);

          // Get the last user query to verify via Google search
          const userMessages = messages.filter((m: any) => m.role === "user");
          const lastQuery = userMessages[userMessages.length - 1]?.content || "";
          let searchVerificationContext = "";
          if (lastQuery) {
            try {
              const { searchWeb } = await import("@/lib/search.server");
              searchVerificationContext = await searchWeb(lastQuery, 2);
              console.log(`[Request ID: ${requestId}] Web search context for '${lastQuery}':`, searchVerificationContext);
            } catch (err) {
              console.error(`[Request ID: ${requestId}] Search verification failed:`, err);
            }
          }

          const systemPrompt = `${UPSC_SYSTEM_PROMPT}\n\nMentor mode: ${MODE_NOTES[mode ?? "simple"]}\n\nTeach like an experienced UPSC mentor: anchor concepts in the syllabus, link to PYQs and current affairs, and end with a one-line takeaway whenever useful.\n\n${
            searchVerificationContext 
              ? `[Google Search Verification Context]\n${searchVerificationContext}\n\nStrict Rule: Use the verified facts/data from the search context above to ensure your answer is fully accurate and up-to-date. Keep the answer concise and highly educational.`
              : ""
          }`;

          console.log(`[Request ID: ${requestId}] System prompt sent to Ollama:`, systemPrompt);
          const normalizedMessages = messages.map((m: any) => {
            if (!m.parts) {
              return {
                role: m.role || "user",
                content: m.content || "",
                parts: [{ type: "text", text: m.content || "" }]
              };
            }
            return m;
          });
          const formattedMessages = await convertToModelMessages(normalizedMessages as UIMessage[]);
          console.log(`[Request ID: ${requestId}] Messages sent to Ollama:`, JSON.stringify(formattedMessages));

          const result = streamText({
            model,
            maxRetries: 0,
            system: systemPrompt,
            messages: formattedMessages,
            onError: ({ error }) => {
              console.error(`[Request ID: ${requestId}] [mentor stream error]`, error);
            },
            onChunk: (event) => {
              if (event && event.chunk) {
                console.log(`[Request ID: ${requestId}] Raw Ollama chunk:`, JSON.stringify(event.chunk));
              }
            }
          });
          const response = result.toUIMessageStreamResponse({
            originalMessages: messages as UIMessage[],
            headers: getLovableAiGatewayResponseHeaders(undefined, {
              "cache-control": "no-store, no-cache, must-revalidate, proxy-revalidate",
              "pragma": "no-cache",
              "expires": "0",
              "X-Request-ID": requestId,
              ...(initialRunId ? { "X-Lovable-AIG-Run-ID": initialRunId } : {}),
            }),
            onError: mentorErrorMessage,
          });
          return withLovableAiGatewayRunIdHeader(response, gateway, { 
            "cache-control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            "pragma": "no-cache",
            "expires": "0",
            "X-Request-ID": requestId
          });
        } catch (error) {
          console.error(`[Request ID: ${requestId}] [mentor api error]`, error);
          return jsonError(mentorErrorMessage(error), 500);
        }
      },
    },
  },
});
