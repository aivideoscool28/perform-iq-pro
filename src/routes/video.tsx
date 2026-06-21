import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { analyzeVideoFrames } from "@/lib/video.functions";
import { toast } from "sonner";
import { AppShell } from "@/components/athleticiq/AppShell";
import { EditableShell } from "@/components/athleticiq/EditableShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Upload,
  Play,
  Activity,
  Gauge,
  Sparkles,
  Crosshair,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ChevronRight,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/video")({ component: Page });

type Finding = {
  joint: string;
  val: number;
  unit: string;
  ideal: string;
  status: "ok" | "warn";
  reasoning: string;
  data: { label: string; value: string }[];
  recommendation: string;
};

type Kpi = { title: string; val: string; note: string };

type OverallScore = {
  score: number;
  reasoning: string;
  data: { label: string; value: string }[];
  recommendation: string;
};

type AnalysisResult = {
  detectedMovement: string;
  findings: Finding[];
  overall: OverallScore;
  kpis: Kpi[];
};

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

async function extractFrames(file: File, count = 6): Promise<{ frames: { t: number; image: string }[]; duration: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    video.src = url;

    const cleanup = () => URL.revokeObjectURL(url);

    video.onloadedmetadata = async () => {
      const duration = isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
      if (!duration) {
        cleanup();
        return reject(new Error("Videodauer konnte nicht ermittelt werden."));
      }
      const canvas = document.createElement("canvas");
      const maxW = 640;
      const scale = Math.min(1, maxW / (video.videoWidth || maxW));
      canvas.width = Math.round((video.videoWidth || maxW) * scale);
      canvas.height = Math.round((video.videoHeight || 360) * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        cleanup();
        return reject(new Error("Canvas nicht verfügbar."));
      }

      const frames: { t: number; image: string }[] = [];
      const times = Array.from({ length: count }, (_, i) =>
        Math.min(duration - 0.05, (duration * (i + 0.5)) / count),
      );

      for (const t of times) {
        await new Promise<void>((res, rej) => {
          const onSeeked = () => {
            video.removeEventListener("seeked", onSeeked);
            try {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              frames.push({ t, image: canvas.toDataURL("image/jpeg", 0.72) });
              res();
            } catch (e) {
              rej(e);
            }
          };
          video.addEventListener("seeked", onSeeked, { once: true });
          video.currentTime = t;
        });
      }

      cleanup();
      resolve({ frames, duration });
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("Video konnte nicht geladen werden."));
    };
  });
}

function Page() {
  const [open, setOpen] = useState<Finding | null>(null);
  const [scoreOpen, setScoreOpen] = useState(false);

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string | null>(null);
  const [analysisState, setAnalysisState] = useState<"idle" | "extracting" | "analyzing" | "done" | "error">("idle");
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState<string>("");
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showInsights, setShowInsights] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const runAnalysis = useServerFn(analyzeVideoFrames);

  const currentFindings = result?.findings ?? defaultFindings;
  const currentOverall = result?.overall ?? defaultOverall;
  const currentKpis = result?.kpis ?? defaultKpis;
  const topInsights = currentFindings.filter((f) => f.status === "warn").slice(0, 2);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("video/")) return;
    if (videoUrl) URL.revokeObjectURL(videoUrl);

    setVideoUrl(URL.createObjectURL(file));
    setVideoName(file.name);
    setResult(null);
    setAnalysisError(null);
    setShowInsights(true);
    setAnalysisProgress(8);
    setAnalysisStage("Frames extrahieren…");
    setAnalysisState("extracting");

    try {
      const { frames, duration } = await extractFrames(file, 6);
      setAnalysisProgress(45);
      setAnalysisStage("KI analysiert Bewegung…");
      setAnalysisState("analyzing");

      const data = await runAnalysis({
        data: { discipline: "Sprint", durationSec: duration, frames },
      });

      const overall: OverallScore = {
        score: Math.round(data.overall_score * 10) / 10,
        reasoning: data.overall_reasoning,
        data: data.score_breakdown,
        recommendation: data.overall_recommendation,
      };
      const findings: Finding[] = data.findings.map((f) => ({
        joint: f.joint,
        val: f.val,
        unit: f.unit,
        ideal: f.ideal,
        status: f.status,
        reasoning: f.reasoning,
        recommendation: f.recommendation,
        data: f.data,
      }));
      setResult({
        detectedMovement: data.detected_movement,
        findings,
        overall,
        kpis: data.kpis,
      });
      setAnalysisProgress(100);
      setAnalysisState("done");
      toast.success(`Analyse fertig · ${data.detected_movement}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Analyse fehlgeschlagen";
      setAnalysisError(msg);
      setAnalysisState("error");
      toast.error(msg);
    }
  };

  useEffect(() => {
    if (analysisState !== "analyzing") return;
    const id = setInterval(() => {
      setAnalysisProgress((p) => (p < 92 ? p + 1.2 : p));
    }, 180);
    return () => clearInterval(id);
  }, [analysisState]);


  return (
    <AppShell
      title="Videoanalyse"
      subtitle="Pose Estimation · KI-Bewegungsdiagnostik"
      breadcrumbs={[{ label: "Dashboard", to: "/" }, { label: "Videoanalyse" }]}
    >

      <EditableShell storageKey="athleticiq.edit.video.v1">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-strong rounded-3xl p-4 relative overflow-hidden">
          <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-black via-[oklch(0.18_0.04_265)] to-black overflow-hidden">
            {videoUrl ? (
              <video
                key={videoUrl}
                src={videoUrl}
                controls
                className="absolute inset-0 w-full h-full object-contain bg-black"
              />
            ) : (
              <>
                <div className="absolute inset-0 grid-bg pointer-events-none" />
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 225">
                  <g stroke="oklch(0.85 0.18 200)" strokeWidth="1.5" fill="none" opacity="0.85">
                    <line x1="200" y1="60" x2="200" y2="120" />
                    <line x1="200" y1="120" x2="170" y2="170" />
                    <line x1="200" y1="120" x2="235" y2="170" />
                    <line x1="200" y1="80" x2="165" y2="115" />
                    <line x1="200" y1="80" x2="240" y2="105" />
                    <line x1="170" y1="170" x2="155" y2="210" />
                    <line x1="235" y1="170" x2="248" y2="210" />
                  </g>
                  {[
                    [200, 55], [200, 80], [200, 120], [165, 115], [240, 105],
                    [170, 170], [235, 170], [155, 210], [248, 210],
                  ].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="3.5" fill="oklch(0.68 0.24 295)" stroke="oklch(0.85 0.18 200)" strokeWidth="1" />
                  ))}
                </svg>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 m-auto h-fit w-fit flex flex-col items-center gap-2 px-6 py-4 rounded-2xl bg-black/40 border border-dashed border-neon-cyan/40 text-neon-cyan hover:bg-black/60 transition"
                >
                  <Upload className="h-6 w-6" />
                  <span className="text-sm font-semibold">Video hochladen für Analyse</span>
                  <span className="text-[11px] text-muted-foreground">MP4, MOV, WebM · max. 100 MB</span>
                </button>
              </>
            )}
            <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/50 border border-neon-cyan/40 text-[11px] text-neon-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan pulse-dot" />
              {analysisState === "extracting" || analysisState === "analyzing"
                ? analysisStage || "KI analysiert…"
                : analysisState === "done"
                ? `Analyse abgeschlossen${result?.detectedMovement ? ` · ${result.detectedMovement}` : ""}`
                : analysisState === "error"
                ? "Analyse fehlgeschlagen"
                : "60 fps · 33 Keypoints"}
            </div>

            {(analysisState === "extracting" || analysisState === "analyzing") && (
              <div className="absolute inset-0 bg-black/55 backdrop-blur-sm grid place-items-center text-center px-6">
                <div className="flex flex-col items-center gap-3 max-w-xs">
                  <div className="relative h-14 w-14 grid place-items-center">
                    <div className="absolute inset-0 rounded-full border-2 border-neon-cyan/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-neon-cyan animate-spin" />
                    <Sparkles className="h-5 w-5 text-neon-violet" />
                  </div>
                  <div className="text-sm font-semibold text-neon-cyan">
                    KI-Bewegungsanalyse läuft
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {analysisStage || "Frames extrahieren · Vision-Modell · Biomechanik-Marker"}
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-neon-cyan to-neon-violet transition-all"
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground tabular-nums">
                    {Math.round(analysisProgress)}%
                  </div>
                </div>
              </div>
            )}

            {analysisState === "error" && (
              <div className="absolute inset-x-3 bottom-14 rounded-xl bg-black/70 border border-neon-amber/50 px-3 py-2 text-[11px] text-neon-amber">
                <div className="flex items-center gap-1.5 font-semibold">
                  <AlertTriangle className="h-3.5 w-3.5" /> Analyse fehlgeschlagen
                </div>
                <div className="text-muted-foreground mt-0.5">{analysisError}</div>
              </div>
            )}

            {analysisState === "done" && videoUrl && showInsights && (
              <div className="absolute left-3 right-3 bottom-14 flex flex-col gap-1.5 pointer-events-none">
                <div className="flex items-center justify-between pointer-events-auto">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 border border-neon-violet/40 text-[10px] uppercase tracking-[0.2em] text-neon-violet">
                    <Sparkles className="h-3 w-3" /> Top Erkenntnisse
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowInsights(false)}
                    className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-0.5 rounded-full bg-black/50 border border-border/50"
                  >
                    ausblenden
                  </button>
                </div>
                {topInsights.map((f) => (
                  <button
                    key={f.joint}
                    type="button"
                    onClick={() => setOpen(f)}
                    className="pointer-events-auto flex items-center justify-between gap-3 rounded-xl bg-black/65 backdrop-blur border border-neon-amber/40 px-3 py-2 text-left hover:border-neon-amber transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertTriangle className="h-4 w-4 text-neon-amber shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate">{f.joint}</div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          Soll {f.ideal} · gemessen {f.val}{f.unit}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-neon-amber shrink-0" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setScoreOpen(true)}
                  className="pointer-events-auto flex items-center justify-between gap-3 rounded-xl bg-black/65 backdrop-blur border border-neon-violet/40 px-3 py-2 text-left hover:border-neon-violet transition"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-neon-violet" />
                    <div className="text-xs font-semibold">
                      KI-Score{" "}
                      <span className="gradient-text">{currentOverall.score}</span>
                      <span className="text-muted-foreground"> / 10</span>
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-neon-violet" />
                </button>
              </div>
            )}

            {analysisState === "done" && videoUrl && !showInsights && (
              <button
                type="button"
                onClick={() => setShowInsights(true)}
                className="absolute right-3 bottom-14 pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 border border-neon-violet/40 text-[10px] uppercase tracking-[0.2em] text-neon-violet hover:bg-black/80"
              >
                <Sparkles className="h-3 w-3" /> Erkenntnisse zeigen
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleVideoUpload}
          />


          <div className="flex items-center justify-between mt-4">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Aktuelle Analyse</div>
              <h3 className="text-lg font-bold mt-1">{videoName ?? "Sprintstart · Block 3"}</h3>
            </div>
            <Button
              variant="outline"
              className="border-neon-cyan/40 text-neon-cyan"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-1.5" /> {videoUrl ? "Anderes Video" : "Video hochladen"}
            </Button>
          </div>
        </div>

        <div className="glass-strong rounded-3xl p-6">
          <button
            type="button"
            onClick={() => setScoreOpen(true)}
            className="w-full text-left group rounded-2xl -m-2 p-2 hover:bg-white/[0.03] transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-neon-violet">
                <Sparkles className="h-3.5 w-3.5" /> KI Bewertung
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-neon-violet transition" />
            </div>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-5xl font-bold gradient-text tabular-nums">{currentOverall.score}</span>
              <span className="text-sm text-muted-foreground mb-1">/ 10</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
              {currentOverall.reasoning}
            </p>
            <div className="text-[10px] text-neon-violet/80 mt-2 group-hover:text-neon-violet">
              Details & Begründung →
            </div>
          </button>

          <div className="mt-5 space-y-2.5">
            {currentFindings.map((f) => (
              <button
                type="button"
                key={f.joint}
                onClick={() => setOpen(f)}
                className="w-full flex items-center justify-between rounded-xl border border-border/50 bg-white/[0.02] px-3 py-2.5 hover:bg-white/[0.05] hover:border-neon-cyan/40 transition text-left group"
              >
                <div className="flex items-center gap-2.5">
                  {f.status === "warn" ? (
                    <AlertTriangle className="h-4 w-4 text-neon-amber shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-neon-lime shrink-0" />
                  )}
                  <div>
                    <div className="text-sm font-semibold">{f.joint}</div>
                    <div className="text-[10px] text-muted-foreground">Soll: {f.ideal}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge
                    className={
                      f.status === "ok"
                        ? "bg-neon-lime/15 text-neon-lime border-neon-lime/30"
                        : "bg-neon-amber/15 text-neon-amber border-neon-amber/30"
                    }
                  >
                    {f.val}{f.unit}
                  </Badge>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-neon-cyan transition" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {currentKpis.map((s, i) => {
          const Icon = [Gauge, Activity, Sparkles][i % 3];
          return (
            <div key={s.title} className="glass rounded-3xl p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-violet/20 grid place-items-center">
                <Icon className="h-5 w-5 text-neon-cyan" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{s.title}</div>
                <div className="text-xl font-bold tabular-nums">{s.val}</div>
                <div className="text-[11px] text-muted-foreground">{s.note}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Finding Detail Dialog */}
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="glass-strong border-border/60 max-w-lg">
          {open && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  {open.status === "warn" ? (
                    <AlertTriangle className="h-5 w-5 text-neon-amber" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-neon-lime" />
                  )}
                  <DialogTitle className="text-xl">{open.joint}</DialogTitle>
                  <Badge
                    className={
                      open.status === "ok"
                        ? "bg-neon-lime/15 text-neon-lime border-neon-lime/30 ml-auto"
                        : "bg-neon-amber/15 text-neon-amber border-neon-amber/30 ml-auto"
                    }
                  >
                    {open.val}{open.unit}
                  </Badge>
                </div>
                <DialogDescription className="text-left pt-2">
                  {open.reasoning}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-2">
                <div className="text-[11px] uppercase tracking-[0.2em] text-neon-cyan mb-2">
                  Zugrunde liegende Daten
                </div>
                <div className="rounded-xl border border-border/50 divide-y divide-border/40">
                  {open.data.map((d) => (
                    <div key={d.label} className="flex justify-between px-3 py-2 text-sm">
                      <span className="text-muted-foreground">{d.label}</span>
                      <span className="font-semibold tabular-nums">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-2 rounded-xl border border-neon-violet/30 bg-neon-violet/5 p-3">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-neon-violet mb-1">
                  <TrendingUp className="h-3.5 w-3.5" /> KI-Empfehlung
                </div>
                <p className="text-sm">{open.recommendation}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Score Detail Dialog */}
      <Dialog open={scoreOpen} onOpenChange={setScoreOpen}>
        <DialogContent className="glass-strong border-border/60 max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-neon-violet" />
              <DialogTitle className="text-xl">KI Gesamtbewertung</DialogTitle>
              <span className="ml-auto text-3xl font-bold gradient-text tabular-nums">
                {currentOverall.score}
              </span>
            </div>
            <DialogDescription className="text-left pt-2">
              {currentOverall.reasoning}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2">
            <div className="text-[11px] uppercase tracking-[0.2em] text-neon-cyan mb-2">
              Score-Zusammensetzung
            </div>
            <div className="rounded-xl border border-border/50 divide-y divide-border/40">
              {currentOverall.data.map((d) => (
                <div key={d.label} className="flex justify-between px-3 py-2 text-sm">
                  <span className="text-muted-foreground">{d.label}</span>
                  <span className="font-semibold tabular-nums">{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2 rounded-xl border border-neon-violet/30 bg-neon-violet/5 p-3">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-neon-violet mb-1">
              <TrendingUp className="h-3.5 w-3.5" /> Nächste Schritte
            </div>
            <p className="text-sm">{currentOverall.recommendation}</p>
          </div>
        </DialogContent>
      </Dialog>
    </EditableShell>
    </AppShell>
  );
}
