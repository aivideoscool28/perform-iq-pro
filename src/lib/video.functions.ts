import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const LOVABLE_AI = "https://ai.gateway.lovable.dev/v1/chat/completions";

const FrameSchema = z.object({
  t: z.number().min(0),
  image: z.string().min(50).max(4_000_000), // data URL
});

const InputSchema = z.object({
  discipline: z.string().min(1).max(64).default("Sprint"),
  durationSec: z.number().min(0).max(3600).optional(),
  frames: z.array(FrameSchema).min(2).max(10),
});

export const analyzeVideoFrames = createServerFn({ method: "POST" })
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const content: Array<Record<string, unknown>> = [
      {
        type: "text",
        text: `Analysiere die folgenden ${data.frames.length} Frames aus einem Trainingsvideo (Disziplin: ${data.discipline}${
          data.durationSec ? `, Dauer ${data.durationSec.toFixed(1)} s` : ""
        }). Identifiziere die Bewegung, schätze biomechanische Marker (Gelenkwinkel, Haltung, Bodenkontakt, Symmetrie), berechne einen Gesamtscore von 0–10 und gib präzise, athletengerechte Empfehlungen. Antworte auf Deutsch. Rufe IMMER das Tool report_video_analysis auf.`,
      },
      ...data.frames.map((f) => ({
        type: "image_url" as const,
        image_url: { url: f.image },
      })),
    ];

    const body = {
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content:
            "Du bist ein Elite-Biomechanik-Coach mit Spezialisierung auf Leichtathletik. Du analysierst Bewegungsabläufe aus Videoframes und lieferst präzise, athletengerechte Diagnosen mit konkreten Trainingsempfehlungen. Sei spezifisch und vermeide Floskeln.",
        },
        { role: "user", content },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "report_video_analysis",
            description: "Strukturierte Videoanalyse mit Score, Findings und KPIs.",
            parameters: {
              type: "object",
              properties: {
                detected_movement: {
                  type: "string",
                  description: "Erkannte Bewegung, z.B. 'Sprintstart aus dem Block'",
                },
                overall_score: { type: "number", minimum: 0, maximum: 10 },
                overall_reasoning: { type: "string" },
                overall_recommendation: { type: "string" },
                score_breakdown: {
                  type: "array",
                  minItems: 3,
                  maxItems: 8,
                  items: {
                    type: "object",
                    properties: {
                      label: { type: "string" },
                      value: { type: "string" },
                    },
                    required: ["label", "value"],
                    additionalProperties: false,
                  },
                },
                findings: {
                  type: "array",
                  minItems: 3,
                  maxItems: 6,
                  items: {
                    type: "object",
                    properties: {
                      joint: { type: "string" },
                      val: { type: "number" },
                      unit: { type: "string" },
                      ideal: { type: "string" },
                      status: { type: "string", enum: ["ok", "warn"] },
                      reasoning: { type: "string" },
                      recommendation: { type: "string" },
                      data: {
                        type: "array",
                        minItems: 2,
                        maxItems: 6,
                        items: {
                          type: "object",
                          properties: {
                            label: { type: "string" },
                            value: { type: "string" },
                          },
                          required: ["label", "value"],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: [
                      "joint",
                      "val",
                      "unit",
                      "ideal",
                      "status",
                      "reasoning",
                      "recommendation",
                      "data",
                    ],
                    additionalProperties: false,
                  },
                },
                kpis: {
                  type: "array",
                  minItems: 3,
                  maxItems: 3,
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      val: { type: "string" },
                      note: { type: "string" },
                    },
                    required: ["title", "val", "note"],
                    additionalProperties: false,
                  },
                },
              },
              required: [
                "detected_movement",
                "overall_score",
                "overall_reasoning",
                "overall_recommendation",
                "score_breakdown",
                "findings",
                "kpis",
              ],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "report_video_analysis" } },
    };

    const res = await fetch(LOVABLE_AI, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.status === 429) throw new Error("Rate-Limit erreicht. Bitte kurz warten und erneut versuchen.");
    if (res.status === 402) throw new Error("KI-Guthaben aufgebraucht. Bitte im Workspace Credits aufladen.");
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`KI-Fehler ${res.status}: ${t.slice(0, 200)}`);
    }
    const json = await res.json();
    const call = json?.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) throw new Error("Keine strukturierte Antwort vom Modell.");
    return JSON.parse(call.function.arguments) as {
      detected_movement: string;
      overall_score: number;
      overall_reasoning: string;
      overall_recommendation: string;
      score_breakdown: { label: string; value: string }[];
      findings: {
        joint: string;
        val: number;
        unit: string;
        ideal: string;
        status: "ok" | "warn";
        reasoning: string;
        recommendation: string;
        data: { label: string; value: string }[];
      }[];
      kpis: { title: string; val: string; note: string }[];
    };
  });
