import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Scan, X, Loader2, Sparkles, Flame, Apple, Beef, Wheat, Droplet, RefreshCcw, Upload, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { analyzeFoodImage } from "@/lib/features/nutrition.functions";
import { toast } from "sonner";

type FoodItem = {
  name: string;
  portion_g: number;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  confidence: number;
};

type Result = {
  meal_name: string;
  items: FoodItem[];
  total_kcal: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  quality_score: number;
  tips: string[];
};

type Stage = "camera" | "scanning" | "result";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function FoodScanner({ open, onOpenChange }: Props) {
  const [stage, setStage] = useState<Stage>("camera");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [boxes, setBoxes] = useState<{ x: number; y: number; w: number; h: number; label: string }[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const analyze = useServerFn(analyzeFoodImage);

  // Init / cleanup camera
  useEffect(() => {
    if (!open) return;
    let active = true;
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (!active) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          await videoRef.current.play().catch(() => {});
        }
      } catch {
        // No camera permission — user can still upload
      }
    })();
    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  const reset = () => {
    setStage("camera");
    setSnapshot(null);
    setResult(null);
    setBoxes([]);
  };

  const close = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    reset();
    onOpenChange(false);
  };

  const captureFromVideo = (): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return null;
    const maxW = 768;
    const scale = Math.min(1, maxW / video.videoWidth);
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.82);
  };

  const runAnalysis = async (dataUrl: string) => {
    setSnapshot(dataUrl);
    setStage("scanning");
    // Fake bounding boxes for that AI vibe while we wait
    setBoxes([
      { x: 12, y: 18, w: 38, h: 42, label: "Detecting…" },
      { x: 55, y: 30, w: 32, h: 36, label: "Detecting…" },
      { x: 22, y: 62, w: 48, h: 28, label: "Detecting…" },
    ]);
    try {
      const r = (await analyze({ data: { image: dataUrl } })) as Result;
      setResult(r);
      // Replace placeholder boxes with real food labels
      setBoxes((b) =>
        b.map((box, i) => ({ ...box, label: r.items[i]?.name ?? r.items[0]?.name ?? "Item" })),
      );
      setStage("result");
    } catch (e) {
      toast.error("Analyse fehlgeschlagen. Versuch es nochmal.");
      console.error(e);
      setStage("camera");
    }
  };

  const onCapture = () => {
    const dataUrl = captureFromVideo();
    if (!dataUrl) {
      toast.error("Kamera nicht bereit");
      return;
    }
    void runAnalysis(dataUrl);
  };

  const onUpload = (file: File) => {
    if (file.size > 6_000_000) {
      toast.error("Bild zu groß (max 6 MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") void runAnalysis(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(true) : close())}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border-border/60 bg-background/95 backdrop-blur-2xl">
        <DialogTitle className="sr-only">AI Food Scanner</DialogTitle>
        <canvas ref={canvasRef} className="hidden" />

        <div className="flex items-center justify-between px-5 py-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-violet grid place-items-center">
              <Sparkles className="h-4 w-4 text-background" />
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight">AI Food Scanner</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {stage === "camera" && "Kamera ausrichten"}
                {stage === "scanning" && "Analysiere · Portionen erkennen"}
                {stage === "result" && (result?.meal_name ?? "Ergebnis")}
              </div>
            </div>
          </div>
          <button onClick={close} className="text-muted-foreground hover:text-foreground transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {(stage === "camera" || stage === "scanning") && (
            <motion.div
              key="cam"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <div className="relative aspect-[4/3] bg-black/70 overflow-hidden">
                {snapshot ? (
                  <img src={snapshot} alt="snapshot" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}

                {/* Frame brackets */}
                <div className="absolute inset-6 pointer-events-none">
                  {[
                    "top-0 left-0 border-t-2 border-l-2 rounded-tl-lg",
                    "top-0 right-0 border-t-2 border-r-2 rounded-tr-lg",
                    "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg",
                    "bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg",
                  ].map((c, i) => (
                    <span key={i} className={`absolute h-8 w-8 border-neon-cyan ${c}`} />
                  ))}
                </div>

                {/* Scan line */}
                {stage === "scanning" && (
                  <div className="absolute inset-x-0 top-0 h-full pointer-events-none overflow-hidden">
                    <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-neon-cyan to-transparent shadow-[0_0_24px_8px_rgba(125,232,255,0.8)] scan-line" />
                  </div>
                )}

                {/* Bounding boxes */}
                {stage === "scanning" &&
                  boxes.map((b, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.15 }}
                      className="absolute border-2 border-neon-cyan/80 rounded-md bg-neon-cyan/5"
                      style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }}
                    >
                      <div className="absolute -top-6 left-0 text-[10px] px-1.5 py-0.5 bg-neon-cyan text-background font-semibold rounded">
                        {b.label}
                      </div>
                    </motion.div>
                  ))}

                {/* No-camera fallback */}
                {!stream && stage === "camera" && (
                  <div className="absolute inset-0 grid place-items-center text-center px-6">
                    <div>
                      <Camera className="h-10 w-10 mx-auto text-neon-cyan mb-2" />
                      <div className="text-sm font-semibold">Keine Kamera verfügbar</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Lade ein Foto hoch — die KI analysiert es trotzdem.
                      </div>
                    </div>
                  </div>
                )}

                {stage === "scanning" && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur border border-neon-cyan/40 text-xs">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-neon-cyan" />
                    KI erkennt Lebensmittel & Portionen…
                  </div>
                )}
              </div>

              {stage === "camera" && (
                <div className="flex items-center justify-between gap-3 p-4 bg-background/70">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onUpload(f);
                      e.target.value = "";
                    }}
                  />
                  <Button
                    variant="outline"
                    className="border-border/60"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" /> Foto hochladen
                  </Button>
                  <Button
                    onClick={onCapture}
                    disabled={!stream}
                    className="bg-gradient-to-r from-neon-cyan to-neon-violet text-background font-semibold hover:opacity-90 h-12 px-6"
                  >
                    <Scan className="h-5 w-5 mr-2" /> Scannen
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {stage === "result" && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-h-[78vh] overflow-y-auto"
            >
              {snapshot && (
                <div className="relative h-40 overflow-hidden">
                  <img src={snapshot} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                  <div className="absolute bottom-3 left-5 right-5 flex items-end justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-neon-cyan">Erkannt</div>
                      <div className="text-xl font-bold">{result.meal_name}</div>
                    </div>
                    <Badge className="bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan">
                      <Trophy className="h-3 w-3 mr-1" /> Score {Math.round(result.quality_score)}
                    </Badge>
                  </div>
                </div>
              )}

              <div className="p-5 grid md:grid-cols-[1fr_1.2fr] gap-5">
                {/* Macros */}
                <div className="glass rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Makros</div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Flame className="h-4 w-4 text-neon-amber" />
                      <span className="font-bold tabular-nums">{Math.round(result.total_kcal)}</span>
                      <span className="text-muted-foreground text-xs">kcal</span>
                    </div>
                  </div>
                  <div className="flex justify-around">
                    <MacroRing label="Protein" value={result.total_protein_g} target={45} color="oklch(0.85 0.18 200)" />
                    <MacroRing label="Carbs" value={result.total_carbs_g} target={90} color="oklch(0.68 0.24 295)" />
                    <MacroRing label="Fett" value={result.total_fat_g} target={30} color="oklch(0.82 0.18 75)" />
                  </div>
                  <div className="mt-5 space-y-1.5">
                    {result.items.map((it, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs rounded-lg border border-border/50 bg-white/[0.02] px-3 py-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Apple className="h-3.5 w-3.5 text-neon-cyan shrink-0" />
                          <span className="truncate font-medium">{it.name}</span>
                          <span className="text-muted-foreground shrink-0">· {Math.round(it.portion_g)} g</span>
                        </div>
                        <div className="flex items-center gap-3 tabular-nums text-muted-foreground shrink-0">
                          <span className="text-foreground font-semibold">{Math.round(it.kcal)}</span>
                          <span className="text-neon-cyan">P{Math.round(it.protein_g)}</span>
                          <span className="text-neon-amber">C{Math.round(it.carbs_g)}</span>
                          <span className="text-neon-magenta">F{Math.round(it.fat_g)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coaching */}
                <div className="glass rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-neon-violet/20 blur-3xl" />
                  <div className="relative">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-neon-violet">
                      <Sparkles className="h-3.5 w-3.5" /> KI-Coaching
                    </div>
                    <h3 className="text-lg font-bold mt-1 mb-4">Empfehlungen</h3>
                    <div className="space-y-2.5">
                      {result.tips.map((t, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="flex gap-2.5 text-sm rounded-xl border border-border/50 bg-white/[0.02] p-3"
                        >
                          <div className="h-6 w-6 rounded-md bg-neon-violet/20 text-neon-violet grid place-items-center text-[11px] font-bold shrink-0">
                            {i + 1}
                          </div>
                          <p className="leading-snug">{t}</p>
                        </motion.div>
                      ))}
                    </div>

                    <div className="grid grid-cols-4 gap-2 mt-5">
                      {[
                        { i: Beef, l: "Protein", v: `${Math.round(result.total_protein_g)}g` },
                        { i: Wheat, l: "Carbs", v: `${Math.round(result.total_carbs_g)}g` },
                        { i: Droplet, l: "Fett", v: `${Math.round(result.total_fat_g)}g` },
                        { i: Flame, l: "Energie", v: `${Math.round(result.total_kcal)}` },
                      ].map((x) => (
                        <div key={x.l} className="rounded-lg border border-border/50 bg-white/[0.02] p-2 text-center">
                          <x.i className="h-3.5 w-3.5 mx-auto text-neon-cyan" />
                          <div className="text-sm font-bold tabular-nums mt-1">{x.v}</div>
                          <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{x.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 px-5 pb-5">
                <Button variant="outline" className="border-border/60" onClick={reset}>
                  <RefreshCcw className="h-4 w-4 mr-2" /> Nochmal scannen
                </Button>
                <Button
                  className="bg-gradient-to-r from-neon-cyan to-neon-violet text-background font-semibold"
                  onClick={() => {
                    toast.success("Mahlzeit gespeichert");
                    close();
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-2" /> Zum Tagesplan hinzufügen
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

function MacroRing({
  label,
  value,
  target,
  color,
}: {
  label: string;
  value: number;
  target: number;
  color: string;
}) {
  const size = 78;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, value / target);
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} stroke="oklch(0.3 0.03 265)" strokeWidth={stroke} fill="none" />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c - pct * c }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="text-sm font-bold tabular-nums">{Math.round(value)}</div>
            <div className="text-[9px] text-muted-foreground">g</div>
          </div>
        </div>
      </div>
      <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">{label}</div>
    </div>
  );
}

