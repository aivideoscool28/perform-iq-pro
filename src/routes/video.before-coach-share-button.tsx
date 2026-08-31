import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { analyzeVideoFrames } from "@/lib/video.functions";
import { extractFrames } from "@/lib/video-frame-extraction";
import type { Finding, Kpi, OverallScore, AnalysisResult } from "@/components/video-analysis/types";
import { ResultsPanel, KpiPanel } from "@/components/video-analysis/ResultsPanel";
import { AnalysisDetails } from "@/components/video-analysis/AnalysisDetails";
import { UploadPanel } from "@/components/video-analysis/UploadPanel";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AppShell } from "@/components/athleticiq/AppShell";
import { EditableShell } from "@/components/athleticiq/EditableShell";
export const Route = createFileRoute("/video/before-coach-share-button")({ component: Page });

const defaultFindings: Finding[] = [
  {
    joint: "Hüftstreckung",
    val: 168,
    unit: "°",
    ideal: "172–178°",
    status: "warn",
    reasoning:
      "Die maximale Hüftstreckung im Abdruckmoment liegt 4–10° unter dem Idealbereich. Dies reduziert die horizontale Impulsabgabe und verkürzt die effektive Schrittweite um ca. 6 cm pro Schritt.",
    data: [
      { label: "Gemessen (Frame 142)", value: "168°" },
      { label: "Ideal (Elite-Sprinter)", value: "172–178°" },
      { label: "Abweichung", value: "−4 bis −10°" },
      { label: "Vergleich Vorwoche", value: "166° (+2°)" },
      { label: "Konfidenz Pose-Modell", value: "94%" },
    ],
    recommendation:
      "Mobility: Hüftbeuger-Dehnung 2× täglich (Couch Stretch 90 s/Seite). Kraft: Single-Leg Hip Thrusts 3×8 mit Pause am höchsten Punkt.",
  },
  {
    joint: "Kniewinkel Abdruck",
    val: 142,
    unit: "°",
    ideal: "138–145°",
    status: "ok",
    reasoning:
      "Der Kniewinkel im Abdruck liegt im optimalen Korridor. Stabile Triple-Extension Mechanik erkannt.",
    data: [
      { label: "Gemessen", value: "142°" },
      { label: "Ideal", value: "138–145°" },
      { label: "Symmetrie L/R", value: "141° / 143°" },
      { label: "Konfidenz", value: "97%" },
    ],
    recommendation:
      "Beibehalten. Weiter mit aktuellen Plyo-Drills (Box Jumps, Bounds).",
  },
  {
    joint: "Rumpfneigung",
    val: 12,
    unit: "°",
    ideal: "8–14°",
    status: "ok",
    reasoning:
      "Vorwärtsneigung des Oberkörpers im Zielfenster für die Beschleunigungsphase. Kein Hyperextension-Pattern in der Hüfte erkennbar.",
    data: [
      { label: "Gemessen (Avg 0–15 m)", value: "12°" },
      { label: "Ideal", value: "8–14°" },
      { label: "Stabilität (σ)", value: "1.4°" },
      { label: "Konfidenz", value: "96%" },
    ],
    recommendation:
      "Pattern halten. Core-Anti-Extension-Übungen (Dead Bug, Pallof Press) 2×/Woche zur Stabilisierung.",
  },
  {
    joint: "Armschwung",
    val: 88,
    unit: "°",
    ideal: "85–95°",
    status: "ok",
    reasoning:
      "Ellbogenwinkel und Schwungamplitude entsprechen Elite-Norm. Hände bewegen sich kontrolliert von Hüfte bis Wangenhöhe.",
    data: [
      { label: "Ellbogenwinkel", value: "88°" },
      { label: "Schwungamplitude", value: "112°" },
      { label: "Symmetrie L/R", value: "98%" },
      { label: "Konfidenz", value: "95%" },
    ],
    recommendation:
      "Beibehalten. Arm-Action-Drills weiterhin als Warm-up integrieren.",
  },
  {
    joint: "Bodenkontakt",
    val: 96,
    unit: " ms",
    ideal: "<90 ms",
    status: "warn",
    reasoning:
      "Die Bodenkontaktzeit liegt 6–10 ms über dem Elite-Schwellenwert. Längerer Kontakt deutet auf reduzierte reaktive Steifigkeit der Wadenmuskulatur und ineffiziente Stretch-Shortening-Cycle-Nutzung hin.",
    data: [
      { label: "Gemessen (Avg)", value: "96 ms" },
      { label: "Ziel", value: "< 90 ms" },
      { label: "Bestwert Saison", value: "91 ms" },
      { label: "Reactive Strength Index", value: "1.8 (Ziel: > 2.2)" },
      { label: "Konfidenz", value: "92%" },
    ],
    recommendation:
      "Plyometrie: Pogo Hops 3×20, Ankle Stiffness Drills, Depth Drops aus 30 cm. Schuh-Check: ggf. steifere Sohle für Sprint-Sessions.",
  },
];

const defaultOverall: OverallScore = {
  score: 8.4,
  reasoning:
    "Bewertung basiert auf gewichteter Kombination aus 5 biomechanischen Markern. Hüftstreckung und Bodenkontaktzeit ziehen die Wertung nach unten, ansonsten Elite-Profil.",
  data: [
    { label: "Hüftstreckung", value: "7.2 / 10 (Gewicht 25%)" },
    { label: "Kniewinkel", value: "9.1 / 10 (Gewicht 15%)" },
    { label: "Rumpfneigung", value: "9.0 / 10 (Gewicht 15%)" },
    { label: "Armschwung", value: "8.8 / 10 (Gewicht 15%)" },
    { label: "Bodenkontakt", value: "7.5 / 10 (Gewicht 30%)" },
    { label: "Gewichteter Mittelwert", value: "8.4 / 10" },
  ],
  recommendation:
    "Fokus der nächsten 4 Wochen: Hüftbeweglichkeit + reaktive Wadenkraft. Erwarteter Score-Anstieg: +0.6.",
};

const defaultKpis: Kpi[] = [
  { title: "Schrittfrequenz", val: "4.6 Hz", note: "Peak Sprint" },
  { title: "Vertikale Schwingung", val: "7.2 cm", note: "im Zielbereich" },
  { title: "Symmetrie L/R", val: "97%", note: "exzellent" },
];

function Page() {
  const [open, setOpen] = useState<Finding | null>(null);
  const [scoreOpen, setScoreOpen] = useState(false);

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string | null>(null);

  const [analysisState, setAnalysisState] = useState<
    "idle" | "extracting" | "analyzing" | "done" | "error"
  >("idle");

  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState("");
  const [analysisError, setAnalysisError] = useState<string | null>(
    null,
  );

  const [result, setResult] = useState<AnalysisResult | null>(null);

  const [discipline, setDiscipline] = useState("Sprint");
const runAnalysis = useServerFn(analyzeVideoFrames);

  const currentFindings =
    result?.findings ?? defaultFindings;

  const currentOverall =
    result?.overall ?? defaultOverall;

  const currentKpis =
    result?.kpis ?? defaultKpis;

  const handleVideoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];

    e.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Bitte wähle eine gültige Videodatei.");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error("Das Video darf maximal 100 MB groß sein.");
      return;
    }

    const { data: sessionData } =
      await supabase.auth.getSession();

    const user = sessionData.session?.user;

    if (!user) {
      toast.error("Du musst angemeldet sein.");
      return;
    }

    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }

    const safeFileName = file.name.replace(
      /[^a-zA-Z0-9._-]/g,
      "_",
    );

    const storagePath =
      `${user.id}/${crypto.randomUUID()}-${safeFileName}`;

    setVideoUrl(URL.createObjectURL(file));
    setVideoName(file.name);

    setResult(null);
    setAnalysisError(null);

    setAnalysisProgress(5);
    setAnalysisStage("Video wird gespeichert…");
    setAnalysisState("extracting");

    try {
      const { error: uploadError } =
        await supabase.storage
          .from("athlete-videos")
          .upload(storagePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

      if (uploadError) {
        throw new Error(
          `Video konnte nicht gespeichert werden: ${uploadError.message}`,
        );
      }

      setAnalysisProgress(15);
      setAnalysisStage("Frames extrahieren…");

      const { frames, duration } =
        await extractFrames(file, 6);

      setAnalysisProgress(45);
      setAnalysisStage("KI analysiert Bewegung…");
      setAnalysisState("analyzing");

      const data = await runAnalysis({
        data: {
          discipline,
          durationSec: duration,
          frames,
        },
      });

      const overall: OverallScore = {
        score:
          Math.round(data.overall_score * 10) / 10,

        reasoning:
          data.overall_reasoning,

        data:
          data.score_breakdown,

        recommendation:
          data.overall_recommendation,
      };

      const findings: Finding[] =
        data.findings.map((f) => ({
          joint: f.joint,
          val: f.val,
          unit: f.unit,
          ideal: f.ideal,
          status: f.status,
          reasoning: f.reasoning,
          recommendation: f.recommendation,
          data: f.data,
        }));

      const analysisResult: AnalysisResult = {
        detectedMovement:
          data.detected_movement,

        findings,

        overall,

        kpis:
          data.kpis,
      };

      setResult(analysisResult);

      const { error: saveAnalysisError } =
        await supabase
          .from("video_analyses")
          .insert({
            user_id: user.id,
            storage_path: storagePath,
            discipline,
            detected_movement: data.detected_movement,
            overall_rating: data.overall_score,
            overall_reasoning: data.overall_reasoning,
            overall_recommendation: data.overall_recommendation,
            findings: data.findings,
            kpis: data.kpis,
            score_breakdown: data.score_breakdown,
            ai_analysis: data,
          });

      if (saveAnalysisError) {
        console.error(
          "Video analysis save failed:",
          saveAnalysisError,
        );

        toast.error(
          "Analyse erstellt, aber Speichern fehlgeschlagen.",
        );
      }

      setAnalysisProgress(100);
      setAnalysisStage("Analyse abgeschlossen");
      setAnalysisState("done");

      toast.success(
        `Analyse fertig · ${data.detected_movement}`,
      );
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Analyse fehlgeschlagen";

      console.error(
        "Video analysis failed:",
        err,
      );

      setAnalysisError(msg);
      setAnalysisState("error");

      toast.error(msg);
    }
  };

  useEffect(() => {
    if (analysisState !== "analyzing") return;

    const id = setInterval(() => {
      setAnalysisProgress((p) =>
        p < 92 ? p + 1.2 : p,
      );
    }, 180);

    return () => clearInterval(id);
  }, [analysisState]);

  return (
    <AppShell
      title="Videoanalyse"
      subtitle="Pose Estimation · KI-Bewegungsdiagnostik"
      breadcrumbs={[
        {
          label: "Dashboard",
          to: "/",
        },
        {
          label: "Videoanalyse",
        },
      ]}
    >
      <EditableShell storageKey="athleticiq.edit.video.v1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <UploadPanel
            videoUrl={videoUrl}
            videoName={videoName}
            analysisState={analysisState}
            analysisStage={analysisStage}
            analysisProgress={analysisProgress}
            analysisError={analysisError}
            detectedMovement={result?.detectedMovement}
            discipline={discipline}
            onDisciplineChange={setDiscipline}
            onVideoChange={handleVideoUpload}
          />

          <ResultsPanel
            overall={currentOverall}
            findings={currentFindings}
            onOpenScore={() => setScoreOpen(true)}
            onOpenFinding={setOpen}
          />
        </div>

        <KpiPanel kpis={currentKpis} />
        <AnalysisDetails
          finding={open}
          scoreOpen={scoreOpen}
          overall={currentOverall}
          onFindingClose={() => setOpen(null)}
          onScoreOpenChange={setScoreOpen}
        />

      </EditableShell>
    </AppShell>
  );
}














