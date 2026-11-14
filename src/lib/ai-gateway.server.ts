import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, jsonSchema, type ModelMessage } from "ai";
import { authorizePaidAi } from "./security/ai-access.server";
type AiTool = {
  type: string;
  function: { name: string; description?: string; parameters: Record<string, unknown> };
};
type AiRequest = {
  model?: string;
  messages: { role: string; content: unknown }[];
  tools?: AiTool[];
  tool_choice?: { type: string; function: { name: string } };
};
type ContentPart =
  { type: "text"; text: string } | { type: "image"; image: string | URL; mediaType?: string };
export function createAiProvider(apiKey: string) {
  return createGoogleGenerativeAI({ apiKey });
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") throw new Error("Invalid AI content");
  return value as Record<string, unknown>;
}
function normalizeMessageContent(content: unknown): string | ContentPart[] {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) throw new Error("Invalid AI content");
  return content.map((value): ContentPart => {
    const part = record(value);
    if (part.type === "text" && typeof part.text === "string")
      return { type: "text", text: part.text };
    if (part.type === "image_url") {
      const imageUrl = record(part.image_url).url;
      if (typeof imageUrl !== "string") throw new Error("AI image missing");
      const match = imageUrl.match(
        /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/,
      );
      if (!match) throw new Error("Unsupported AI image");
      return { type: "image", image: match[2], mediaType: match[1] };
    }
    throw new Error("Unsupported AI content");
  });
}
/** Compatibility response shape for existing feature functions, with one paid-call gate. */
export async function callAi(body: AiRequest) {
  await authorizePaidAi();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("AI service is not configured");
  const tools = body.tools
    ? Object.fromEntries(
        body.tools.map((tool) => [
          tool.function.name,
          {
            description: tool.function.description,
            inputSchema: jsonSchema(tool.function.parameters as Parameters<typeof jsonSchema>[0]),
          },
        ]),
      )
    : undefined;
  const messages = body.messages.map((message): ModelMessage => {
    if (message.role !== "user" && message.role !== "assistant" && message.role !== "system")
      throw new Error("Invalid AI message role");
    const content = normalizeMessageContent(message.content);
    if (message.role === "system") {
      if (typeof content !== "string") throw new Error("Invalid system message");
      return { role: message.role, content };
    }
    if (message.role === "assistant") {
      if (typeof content === "string") return { role: "assistant", content };
      return {
        role: "assistant",
        content: content.map((part) => {
          if (part.type !== "text") throw new Error("Invalid assistant content");
          return part;
        }),
      };
    }
    return { role: "user", content };
  });
  const result = await generateText({
    model: createAiProvider(apiKey)((body.model ?? "gemini-3.5-flash").replace(/^google\//, "")),
    messages,
    tools,
    toolChoice: body.tool_choice
      ? { type: "tool", toolName: body.tool_choice.function.name }
      : undefined,
    maxOutputTokens: 4096,
    maxRetries: 1,
    abortSignal: AbortSignal.timeout(45_000),
  });
  return {
    choices: [
      {
        message: {
          content: result.text || null,
          tool_calls: result.toolCalls.map((toolCall) => ({
            id: toolCall.toolCallId,
            type: "function",
            function: { name: toolCall.toolName, arguments: JSON.stringify(toolCall.input) },
          })),
        },
      },
    ],
  };
}
