import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `Du bist der Athleticiq KI-Coach — ein persönlicher Performance-Assistent für Leichtathletinnen und Leichtathleten.

Antworte immer auf Deutsch, knapp, motivierend und konkret. Gib praxisnahe Tipps zu Training, Regeneration, Ernährung, Technik (Sprint, Sprung, Wurf, Lauf), Wettkampfvorbereitung und HRV/Schlaf. Wenn der Athlet Beschwerden beschreibt, empfiehl bei ernsten Symptomen einen Arzt. Nutze Markdown (Listen, Fettdruck) für Übersichtlichkeit.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: UIMessage[] };
        if (!Array.isArray(messages)) {
          return new Response("messages required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages),
        });
        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});
