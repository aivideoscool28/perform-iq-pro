import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callAi } from "@/lib/ai-gateway.server";
import { FOOD_ANALYSIS_PROMPT } from "@/prompts/food-analysis.prompt";

/* ------------------------ FOOD SCANNER (AI VISION) ------------------------ */
export const analyzeFoodImage = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      image: z.string().min(50).max(8_000_000), // data:image/...;base64,...
      note: z.string().max(500).optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const ai = await callAi({
      model: "google/gemini-3.5-flash",
      messages: [
        {
          role: "system",
          content: FOOD_ANALYSIS_PROMPT,
        },
        {
          role: "user",
          content: [
            { type: "text", text: data.note ? `Notiz: ${data.note}` : "Was ist auf dem Foto? Schätze Portionen, Kalorien und Makros." },
            { type: "image_url", image_url: { url: data.image } },
          ],
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "report_food",
            description: "Return the recognised food items and a coaching summary.",
            parameters: {
              type: "object",
              properties: {
                meal_name: { type: "string", description: "Short label for the meal, e.g. 'Hähnchen-Bowl'" },
                items: {
                  type: "array",
                  minItems: 1,
                  maxItems: 8,
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      portion_g: { type: "number" },
                      kcal: { type: "number" },
                      protein_g: { type: "number" },
                      carbs_g: { type: "number" },
                      fat_g: { type: "number" },
                      confidence: { type: "number", description: "0..1" },
                    },
                    required: ["name", "portion_g", "kcal", "protein_g", "carbs_g", "fat_g", "confidence"],
                    additionalProperties: false,
                  },
                },
                total_kcal: { type: "number" },
                total_protein_g: { type: "number" },
                total_carbs_g: { type: "number" },
                total_fat_g: { type: "number" },
                quality_score: { type: "number", description: "0..100 nutritional quality for an athlete" },
                tips: {
                  type: "array",
                  minItems: 2,
                  maxItems: 4,
                  items: { type: "string", description: "Short, specific coaching tip" },
                },
              },
              required: [
                "meal_name", "items", "total_kcal", "total_protein_g",
                "total_carbs_g", "total_fat_g", "quality_score", "tips",
              ],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "report_food" } },
    });

    const call = ai?.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) throw new Error("AI returned no structured output");
    return JSON.parse(call.function.arguments);
  });



