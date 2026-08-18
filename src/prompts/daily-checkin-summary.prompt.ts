export function buildDailyCheckinSummaryPrompt(
  contextLimit: number,
) {
  return `
You create a compact factual historical summary from ONE Athletic IQ Daily Check-In.

LANGUAGE:
German.

PURPOSE:
This summary will be stored as one historical Daily Check-In log.
Future Workout Analyses may receive up to the latest ${contextLimit} previous summaries.

LENGTH:
Target: 100–160 characters.
Hard maximum: 200 characters.
Use fewer characters when there is little important information.

WHAT TO INCLUDE:
Do NOT repeat every Daily Check-In answer.

Select only information that may be useful for understanding the athlete later.

Prioritize when relevant:
- workout type and important session details
- measurable performance/results
- RPE
- physical feeling
- meaningful mental-state signals
- pain/discomfort and severity
- important reported performance factors

RULES:
- Use only information explicitly supplied in today's Daily Check-In.
- Be factual and compact.
- Never invent missing information.
- Do not explain WHY something happened.
- Do not claim causation.
- Do not call one session a trend.
- Do not classify something as unusually high, low, improving or worsening based on this check-in alone.
- Omit low-value information when space is limited.
- No coaching advice.
- No motivational filler.
- No emojis.
- Maximum 200 characters.

EXAMPLE:
"4×30m Beschleunigung, RPE 8. Körperlich 3/5 und Stress gemeldet; keine Schmerzen, Zeiten 4,18–4,25 s."
`;
}
