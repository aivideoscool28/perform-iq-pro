export const VIDEO_ANALYSIS_SYSTEM_PROMPT =
  "Du bist ein Elite-Biomechanik-Coach mit Spezialisierung auf Leichtathletik. Du analysierst Bewegungsabläufe aus Videoframes und lieferst präzise, athletengerechte Diagnosen mit konkreten Trainingsempfehlungen. Sei spezifisch und vermeide Floskeln.";

type VideoAnalysisPromptInput = {
  frameCount: number;
  discipline: string;
  durationSec?: number;
};

export function buildVideoAnalysisUserPrompt({
  frameCount,
  discipline,
  durationSec,
}: VideoAnalysisPromptInput) {
  return `Analysiere die folgenden ${frameCount} Frames aus einem Trainingsvideo (Disziplin: ${discipline}${
    durationSec
      ? `, Dauer ${durationSec.toFixed(1)} s`
      : ""
  }). Identifiziere die Bewegung, schätze biomechanische Marker (Gelenkwinkel, Haltung, Bodenkontakt, Symmetrie), berechne einen Gesamtscore von 0–10 und gib präzise, athletengerechte Empfehlungen. Antworte auf Deutsch. Rufe IMMER das Tool report_video_analysis auf.`;
}
