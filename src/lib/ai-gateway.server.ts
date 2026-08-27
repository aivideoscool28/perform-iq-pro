import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, jsonSchema } from "ai";

export function createAiProvider(apiKey: string) {
  return createGoogleGenerativeAI({
    apiKey,
  });
}

function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY missing");
  }

  return apiKey;
}

/**
 * Compatibility layer for the existing Athletic IQ AI functions.
 *
 * The old code used Lovable's OpenAI-compatible response format:
 *
 *   choices[0].message.content
 *   choices[0].message.tool_calls
 *
 * This function keeps that format so the existing workout,
 * food, check-in, training and video code does not need
 * to be rewritten all at once.
 */
export async function callAi(body: any) {
  const apiKey = getGeminiApiKey();
  const google = createAiProvider(apiKey);

  const modelName =
    typeof body.model === "string"
      ? body.model.replace(/^google\//, "")
      : "gemini-3.5-flash";

  const tools = Array.isArray(body.tools)
    ? Object.fromEntries(
        body.tools
          .filter(
            (t: any) =>
              t?.type === "function" &&
              t?.function?.name &&
              t?.function?.parameters,
          )
          .map((t: any) => [
            t.function.name,
            {
              description: t.function.description,
              inputSchema: jsonSchema(t.function.parameters),
            },
          ]),
      )
    : undefined;

  const messages = Array.isArray(body.messages)
    ? body.messages.map((message: any) => ({
        role: message.role,
        content: normalizeMessageContent(message.content),
      }))
    : [];

  const toolChoice = body.tool_choice?.function?.name
    ? {
        type: "tool" as const,
        toolName: body.tool_choice.function.name,
      }
    : undefined;

  const result = await generateText({
    model: google(modelName),
    messages,
    tools,
    toolChoice,
  });

  const toolCalls = (result.toolCalls ?? []).map((toolCall: any) => ({
    id: toolCall.toolCallId,
    type: "function",
    function: {
      name: toolCall.toolName,
      arguments: JSON.stringify(toolCall.input),
    },
  }));

  return {
    choices: [
      {
        message: {
          content: result.text || null,
          tool_calls: toolCalls,
        },
      },
    ],
  };
}

function normalizeMessageContent(content: any) {
  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return String(content ?? "");
  }

  return content.map((part: any) => {
    if (part?.type === "text") {
      return {
        type: "text",
        text: part.text ?? "",
      };
    }

    /*
     * Video Analysis sends extracted frames using the old
     * OpenAI-compatible image_url format:
     *
     * data:image/jpeg;base64,...
     *
     * The AI SDK should receive the actual base64 payload and
     * its media type separately rather than the complete data URL.
     */
    if (part?.type === "image_url") {
      const imageUrl = part.image_url?.url;

      if (typeof imageUrl !== "string" || !imageUrl.trim()) {
        throw new Error("AI image input is missing.");
      }

      const dataUrlMatch = imageUrl.match(
        /^data:([^;,]+);base64,(.+)$/s,
      );

      if (dataUrlMatch) {
        const [, mediaType, base64Data] =
          dataUrlMatch;

        return {
          type: "image",
          image: base64Data,
          mediaType,
        };
      }

      /*
       * Keep normal remote image URLs supported too.
       */
      return {
        type: "image",
        image: new URL(imageUrl),
      };
    }

    return part;
  });
}

