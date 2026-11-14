import { z } from "zod";
export const imageSchema = z
  .string()
  .max(1_400_000)
  .regex(
    /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/,
    "Expected a JPEG, PNG or WebP data URL",
  );
export const videoInputSchema = z
  .object({
    discipline: z.string().trim().min(1).max(64).default("Sprint"),
    durationSec: z.number().min(0).max(3600).optional(),
    frames: z
      .array(z.object({ t: z.number().min(0).max(3600), image: imageSchema }))
      .min(2)
      .max(10),
  })
  .refine(
    (input) => input.frames.reduce((total, frame) => total + frame.image.length, 0) <= 8_000_000,
    "Video frames exceed total input limit",
  );
export const chatInputSchema = z
  .object({
    messages: z
      .array(
        z.object({
          id: z.string().max(128),
          role: z.enum(["user", "assistant"]),
          parts: z
            .array(z.object({ type: z.literal("text"), text: z.string().max(8_000) }))
            .min(1)
            .max(8),
        }),
      )
      .min(1)
      .max(40),
  })
  .refine((input) => JSON.stringify(input).length <= 64_000, "Conversation too large");
export async function readLimitedJson(request: Request, maxBytes = 64_000): Promise<unknown> {
  if (!request.body) throw new Error("Request body required");
  const reader = request.body.getReader();
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new Error("Request too large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}
/** Enforce before TanStack deserializes server function input, including chunked bodies. */
export async function enforceRequestSize(request: Request, maxBytes = 9_000_000) {
  if (!request.body) return;
  if (Number(request.headers.get("content-length")) > maxBytes)
    throw new Error("Request too large");
  const copy = request.clone();
  const reader = copy.body!.getReader();
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        void reader.cancel();
        void request.body.cancel();
        throw new Error("Request too large");
      }
    }
  } finally {
    reader.releaseLock();
  }
}
