import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const LOVABLE_AI = "https://ai.gateway.lovable.dev/v1/chat/completions";

const InputSchema = z.object({
  discipline: z.string().min(1).max(80),
  level: z.string().min(1).max(40).default("ambitioniert"),
  goal: z.string().min(1).max(200).default("Saisonpeak verbessern"),
  daysAvailable: z.number().int().min(3).max(7).default(6),
});

const PlanSchema = z.object({
  weekly_load_tss: z.number().int().min(100).max(1200),
  focus: z.string().min(2).max(80),
  days: z
    .array(
      z.object({
        day: z.enum(["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]),
        label: z.string().min(2).max(60),
        focus: z.string().min(2).max(40),
        load: z.number().int().min(0).max(100),
        duration_min: z.number().int().min(0).max(240),
        rest: z.boolean().default(false),
        blocks: z
          .array(
            z.object({
              name: z.string().min(1).max(40),
              detail: z.string().min(1).max(160),
              zone: z.enum(["Z1", "Z2", "Z3", "Z4", "Z5"]),
              duration_min: z.number().int().min(1).max(120),
            }),
          )
          .min(2)
          .max(8),
      }),
    )
    .length(7),
  coach_note: z.string().min(10).max(400),
});

export type TrainingPlan = z.infer<typeof PlanSchema>;

export const generateTrainingPlan = createServerFn({ method: "POST" })
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const res = await fetch(LOVABLE_AI, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "Du bist ein Elite-Athletik-Coach für Leichtathletik. Du erstellst periodisierte Mikrozyklen (Mo–So) für einzelne Athletinnen und Athleten. Antworte ausschließlich über das Tool create_training_plan. Schreibe Inhalte auf Deutsch, klar und prägnant.",
          },
          {
            role: "user",
            content: `Erstelle einen 7-Tage Trainingsplan.
- Disziplin / Schwerpunkt: ${data.discipline}
- Leistungsniveau: ${data.level}
- Ziel: ${data.goal}
- Verfügbare Trainingstage pro Woche: ${data.daysAvailable} (Rest-Tage als rest=true markieren, load=0, blocks dürfen Regeneration enthalten).
Balance zwischen Speed, Kraft, Technik, Ausdauer und Regeneration. Variiere Intensitäten sinnvoll (Hard/Easy). Jeder Tag braucht Warm-Up, Hauptsatz und Cool-Down mindestens.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_training_plan",
              description: "Erstellt einen strukturierten 7-Tage-Trainingsplan.",
              parameters: {
                type: "object",
                properties: {
                  weekly_load_tss: { type: "integer", description: "Geschätzter Wochenload in TSS." },
                  focus: { type: "string", description: "Wochenschwerpunkt, z.B. 'Speed-Endurance Block'." },
                  coach_note: { type: "string", description: "Kurze persönliche Coach-Notiz an den Athleten." },
                  days: {
                    type: "array",
                    minItems: 7,
                    maxItems: 7,
                    items: {
                      type: "object",
                      properties: {
                        day: { type: "string", enum: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"] },
                        label: { type: "string" },
                        focus: { type: "string" },
                        load: { type: "integer", minimum: 0, maximum: 100 },
                        duration_min: { type: "integer", minimum: 0, maximum: 240 },
                        rest: { type: "boolean" },
                        blocks: {
                          type: "array",
                          minItems: 2,
                          maxItems: 8,
                          items: {
                            type: "object",
                            properties: {
                              name: { type: "string" },
                              detail: { type: "string" },
                              zone: { type: "string", enum: ["Z1", "Z2", "Z3", "Z4", "Z5"] },
                              duration_min: { type: "integer", minimum: 1, maximum: 120 },
                            },
                            required: ["name", "detail", "zone", "duration_min"],
                          },
                        },
                      },
                      required: ["day", "label", "focus", "load", "duration_min", "rest", "blocks"],
                    },
                  },
                },
                required: ["weekly_load_tss", "focus", "coach_note", "days"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_training_plan" } },
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`AI Gateway ${res.status}: ${txt.slice(0, 200)}`);
    }
    const json = (await res.json()) as {
      choices?: Array<{ message?: { tool_calls?: Array<{ function?: { arguments?: string } }> } }>;
    };
    const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("Kein Plan vom Modell zurückgegeben");
    const parsed = PlanSchema.parse(JSON.parse(args));
    return parsed;
  });
