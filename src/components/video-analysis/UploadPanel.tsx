import { useRef, type ChangeEvent } from "react";
import {
  AlertTriangle,
  Sparkles,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type AnalysisState =
  | "idle"
  | "extracting"
  | "analyzing"
  | "done"
  | "error";

type UploadPanelProps = {
  videoUrl: string | null;
  videoName: string | null;

  analysisState: AnalysisState;
  analysisStage: string;
  analysisProgress: number;
  analysisError: string | null;

  detectedMovement?: string | null;

  discipline: string;
  onDisciplineChange: (value: string) => void;

  onVideoChange: (
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
};

const disciplines = [
  "Sprint",
  "Sprintstart aus dem Block",
  "Hürdenlauf",
  "Mittel-/Langstrecke",
  "Weitsprung",
  "Hochsprung",
  "Dreisprung",
  "Stabhochsprung",
  "Kugelstoßen",
  "Speerwurf",
  "Diskuswurf",
  "Kraftraum / Kniebeuge",
  "Kraftraum / Kreuzheben",
  "Sonstige Bewegung",
];

export function UploadPanel({
  videoUrl,
  videoName,
  analysisState,
  analysisStage,
  analysisProgress,
  analysisError,
  detectedMovement,
  discipline,
  onDisciplineChange,
  onVideoChange,
}: UploadPanelProps) {
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const isAnalyzing =
    analysisState === "extracting" ||
    analysisState === "analyzing";

  return (
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

            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 400 225"
            >
              <g
                stroke="oklch(0.85 0.18 200)"
                strokeWidth="1.5"
                fill="none"
                opacity="0.85"
              >
                <line x1="200" y1="60" x2="200" y2="120" />
                <line x1="200" y1="120" x2="170" y2="170" />
                <line x1="200" y1="120" x2="235" y2="170" />
                <line x1="200" y1="80" x2="165" y2="115" />
                <line x1="200" y1="80" x2="240" y2="105" />
                <line x1="170" y1="170" x2="155" y2="210" />
                <line x1="235" y1="170" x2="248" y2="210" />
              </g>

              {[
                [200, 55],
                [200, 80],
                [200, 120],
                [165, 115],
                [240, 105],
                [170, 170],
                [235, 170],
                [155, 210],
                [248, 210],
              ].map(([x, y], index) => (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill="oklch(0.68 0.24 295)"
                  stroke="oklch(0.85 0.18 200)"
                  strokeWidth="1"
                />
              ))}
            </svg>

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="absolute inset-0 m-auto h-fit w-fit flex flex-col items-center gap-2 px-6 py-4 rounded-2xl bg-black/40 border border-dashed border-neon-cyan/40 text-neon-cyan hover:bg-black/60 transition"
            >
              <Upload className="h-6 w-6" />

              <span className="text-sm font-semibold">
                Video hochladen für Analyse
              </span>

              <span className="text-[11px] text-muted-foreground">
                MP4, MOV, WebM · max. 100 MB
              </span>
            </button>
          </>
        )}

        <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/50 border border-neon-cyan/40 text-[11px] text-neon-cyan">
          <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan pulse-dot" />

          {isAnalyzing
            ? analysisStage || "KI analysiert…"
            : analysisState === "done"
              ? `Analyse abgeschlossen${
                  detectedMovement
                    ? ` · ${detectedMovement}`
                    : ""
                }`
              : analysisState === "error"
                ? "Analyse fehlgeschlagen"
                : "60 fps · 33 Keypoints"}
        </div>

        {isAnalyzing && (
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
                {analysisStage ||
                  "Frames extrahieren · Vision-Modell · Biomechanik-Marker"}
              </div>

              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-neon-cyan to-neon-violet transition-all"
                  style={{
                    width: `${analysisProgress}%`,
                  }}
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
              <AlertTriangle className="h-3.5 w-3.5" />
              Analyse fehlgeschlagen
            </div>

            <div className="text-muted-foreground mt-0.5">
              {analysisError}
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={onVideoChange}
      />

      <div className="flex flex-wrap items-end justify-between gap-3 mt-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Aktuelle Analyse
          </div>

          <h3 className="text-lg font-bold mt-1">
            {videoName ??
              "Sprintstart · Block 3"}
          </h3>
        </div>

        <div className="flex items-end gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Disziplin
            </span>

            <select
              value={discipline}
              onChange={(event) =>
                onDisciplineChange(
                  event.target.value,
                )
              }
              disabled={isAnalyzing}
              className="h-9 rounded-lg bg-black/40 border border-neon-cyan/30 text-sm px-2.5 text-foreground focus:outline-none focus:border-neon-cyan disabled:opacity-50"
            >
              {disciplines.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </label>

          <Button
            variant="outline"
            className="border-neon-cyan/40 text-neon-cyan"
            onClick={() =>
              fileInputRef.current?.click()
            }
          >
            <Upload className="h-4 w-4 mr-1.5" />

            {videoUrl
              ? "Anderes Video"
              : "Video hochladen"}
          </Button>
        </div>
      </div>
    </div>
  );
}
