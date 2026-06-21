import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { AppShell } from "@/components/athleticiq/AppShell";
import { EditableShell } from "@/components/athleticiq/EditableShell";
import { KpiCard } from "@/components/athleticiq/KpiCard";
import { Sparkline } from "@/components/athleticiq/Sparkline";
import { DisciplineLogger } from "@/components/athleticiq/DisciplineLogger";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dumbbell,
  Flame,
  Timer,
  Zap,
  Play,
  Pause,
  Square,
  CheckCircle2,
  Calendar as CalendarIcon,
  Sparkles,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { generateTrainingPlan, type TrainingPlan } from "@/lib/training.functions";

export const Route = createFileRoute("/training")({ component: Page });

const PLAN_KEY = "athleticiq.training.plan.v1";
const DONE_KEY = "athleticiq.training.done.v1";
const LOG_KEY = "athleticiq.training.disciplines.v1";

const FALLBACK_PLAN: TrainingPlan = {
  weekly_load_tss: 412,
  focus: "Speed & Power Block",
  coach_note: "Halte Hard-Tage scharf, Easy-Tage wirklich easy. Schlaf >8h priorisieren.",
  days: [
    { day: "Mo", label: "Sprint Intervals", focus: "Speed", load: 82, duration_min: 70, rest: false, blocks: [
      { name: "Warm-Up", detail: "Dynamic Mobility · Skipping", zone: "Z1", duration_min: 15 },
      { name: "Main Set", detail: "6 × 60 m Beschleunigung @ 95%", zone: "Z5", duration_min: 35 },
      { name: "Cool Down", detail: "Easy Jog · Stretching", zone: "Z1", duration_min: 15 },
    ] },
    { day: "Di", label: "Mobility + Core", focus: "Recovery", load: 38, duration_min: 45, rest: false, blocks: [
      { name: "Mobility", detail: "Hüft-/Schulter-Flow", zone: "Z1", duration_min: 20 },
      { name: "Core", detail: "Plank Circuit 3×", zone: "Z2", duration_min: 20 },
    ] },
    { day: "Mi", label: "Plyometrie", focus: "Power", load: 74, duration_min: 60, rest: false, blocks: [
      { name: "Warm-Up", detail: "A/B Skips · Wall Drills", zone: "Z2", duration_min: 15 },
      { name: "Plyos", detail: "Box Jumps 5×5 · Bounds 4×20m", zone: "Z4", duration_min: 30 },
      { name: "Cool Down", detail: "Foam Roll", zone: "Z1", duration_min: 10 },
    ] },
    { day: "Do", label: "Tempo Läufe", focus: "Endurance", load: 65, duration_min: 58, rest: false, blocks: [
      { name: "Warm-Up", detail: "Dynamic Mobility · 12 min", zone: "Z1", duration_min: 12 },
      { name: "Activation", detail: "A-Skips · B-Skips", zone: "Z2", duration_min: 8 },
      { name: "Main Set", detail: "6 × 400 m @ 75s · 90s Rest", zone: "Z4", duration_min: 28 },
      { name: "Cool Down", detail: "Easy Jog · Stretching", zone: "Z1", duration_min: 10 },
    ] },
    { day: "Fr", label: "Kraft Oberkörper", focus: "Strength", load: 70, duration_min: 65, rest: false, blocks: [
      { name: "Warm-Up", detail: "Band Work · Push-Ups", zone: "Z1", duration_min: 10 },
      { name: "Strength", detail: "Bench 4×5 · Pull-Ups 4×6 · Row 3×8", zone: "Z3", duration_min: 45 },
      { name: "Core", detail: "Hanging Leg Raises 3×10", zone: "Z2", duration_min: 10 },
    ] },
    { day: "Sa", label: "Track Session", focus: "Speed", load: 88, duration_min: 80, rest: false, blocks: [
      { name: "Warm-Up", detail: "Full Sprint Prep · 20 min", zone: "Z2", duration_min: 20 },
      { name: "Main Set", detail: "3 × 150 m @ 95% · volle Pause", zone: "Z5", duration_min: 40 },
      { name: "Cool Down", detail: "Easy Jog · Dehnen", zone: "Z1", duration_min: 20 },
    ] },
    { day: "So", label: "Rest / Yoga", focus: "Recovery", load: 20, duration_min: 30, rest: true, blocks: [
      { name: "Yoga", detail: "Mobility Flow · Atemarbeit", zone: "Z1", duration_min: 30 },
    ] },
  ],
};

function todayDay(): TrainingPlan["days"][number]["day"] {
  const map = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"] as const;
  return map[new Date().getDay()];
}

function loadPlan(): TrainingPlan {
  if (typeof window === "undefined") return FALLBACK_PLAN;
  try {
    const raw = localStorage.getItem(PLAN_KEY);
    return raw ? (JSON.parse(raw) as TrainingPlan) : FALLBACK_PLAN;
  } catch {
    return FALLBACK_PLAN;
  }
}

function loadDone(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(DONE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function saveDone(next: Record<string, boolean>) {
  localStorage.setItem(DONE_KEY, JSON.stringify(next));
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function Page() {
  const [plan, setPlan] = useState<TrainingPlan>(FALLBACK_PLAN);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [selectedDay, setSelectedDay] = useState<TrainingPlan["days"][number]["day"]>(todayDay());
  const [discipline, setDiscipline] = useState("Sprint 100m");

  // session timer
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [doneBlocks, setDoneBlocks] = useState<Set<string>>(new Set());

  const genFn = useServerFn(generateTrainingPlan);
  const generate = useMutation({
    mutationFn: () =>
      genFn({ data: { discipline, level: "ambitioniert", goal: "Saisonpeak verbessern", daysAvailable: 6 } }),
    onSuccess: (p) => {
      setPlan(p);
      localStorage.setItem(PLAN_KEY, JSON.stringify(p));
      toast.success("Neuer KI-Plan erstellt");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Plan-Generierung fehlgeschlagen"),
  });

  useEffect(() => {
    setPlan(loadPlan());
    setDone(loadDone());
    try {
      const profile = JSON.parse(localStorage.getItem("athleticiq.profile.v1") ?? "{}");
      const primary = (profile?.disciplines ?? []).find((d: { primary?: boolean }) => d.primary);
      if (primary?.name) setDiscipline(primary.name);
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const dayInfo = useMemo(
    () => plan.days.find((d) => d.day === selectedDay) ?? plan.days[0],
    [plan, selectedDay],
  );

  const finishSession = () => {
    setRunning(false);
    const log = (() => {
      try {
        return JSON.parse(localStorage.getItem(LOG_KEY) ?? "[]") as Array<Record<string, unknown>>;
      } catch {
        return [];
      }
    })();
    log.unshift({
      id: crypto.randomUUID(),
      discipline: dayInfo.label,
      date: new Date().toISOString().slice(0, 10),
      note: `${Math.round(elapsed / 60)} min · ${doneBlocks.size}/${dayInfo.blocks.length} Blöcke`,
    });
    localStorage.setItem(LOG_KEY, JSON.stringify(log));
    window.dispatchEvent(new Event("athleticiq:log-updated"));
    const nextDone = { ...done, [`${new Date().toISOString().slice(0, 10)}_${dayInfo.day}`]: true };
    setDone(nextDone);
    saveDone(nextDone);
    toast.success(`${dayInfo.label} abgeschlossen · ${Math.round(elapsed / 60)} min`);
    setElapsed(0);
    setDoneBlocks(new Set());
  };

  const totalLoad = plan.days.reduce((s, d) => s + d.load, 0);
  const completedThisWeek = plan.days.filter((d) => done[`${new Date().toISOString().slice(0, 10)}_${d.day}`]).length;
  const totalSessions = plan.days.filter((d) => !d.rest).length;

  return (
    <AppShell
      title="KI-Training"
      subtitle="Adaptiver Wochenplan · automatisch generiert"
      breadcrumbs={[{ label: "Dashboard", to: "/" }, { label: "KI-Training" }]}
    >
      <EditableShell storageKey="athleticiq.edit.training.v1">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <KpiCard label="Trainings diese Woche" value={`${completedThisWeek} / ${totalSessions}`} icon={Dumbbell} accent="cyan" delta="aktuelle Woche" trend="up">
            <Sparkline data={[2, 3, 2, 4, 3, 5, completedThisWeek]} />
          </KpiCard>
          <KpiCard label="Wochenload" value={String(plan.weekly_load_tss)} unit="TSS" icon={Flame} accent="magenta" delta="KI-optimiert" trend="flat">
            <Sparkline data={[280, 320, 340, 380, 360, 400, plan.weekly_load_tss]} color="oklch(0.7 0.27 340)" />
          </KpiCard>
          <KpiCard label="Aktive Zeit" value={`${Math.round(plan.days.reduce((s, d) => s + d.duration_min, 0) / 60)}h ${plan.days.reduce((s, d) => s + d.duration_min, 0) % 60}m`} icon={Timer} accent="violet" delta="diese Woche" trend="up">
            <Sparkline data={[210, 240, 260, 280, 310, 340, 384]} color="oklch(0.68 0.24 295)" />
          </KpiCard>
          <KpiCard label="Power Index" value={String(Math.min(99, Math.round(totalLoad / 5)))} icon={Zap} accent="lime" delta={plan.focus} trend="up">
            <Sparkline data={[78, 80, 84, 86, 88, 90, 92]} color="oklch(0.88 0.22 145)" />
          </KpiCard>
        </div>

        <div className="mt-4">
          <DisciplineLogger />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          <div className="lg:col-span-2 glass-strong rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <CalendarIcon className="h-3.5 w-3.5" /> Wochenplan
                </div>
                <h3 className="text-lg font-bold mt-1">{plan.focus}</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-md">{plan.coach_note}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30">KI optimiert</Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => generate.mutate()}
                  disabled={generate.isPending}
                  className="border-neon-violet/40 text-neon-violet hover:bg-neon-violet/10"
                >
                  {generate.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Neuer Plan
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {plan.days.map((d, i) => {
                const isToday = d.day === todayDay();
                const isSelected = d.day === selectedDay;
                const isDone = done[`${new Date().toISOString().slice(0, 10)}_${d.day}`];
                return (
                  <motion.button
                    key={d.day}
                    type="button"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedDay(d.day)}
                    className={[
                      "rounded-2xl p-3 border text-center relative overflow-hidden text-left transition",
                      isSelected
                        ? "border-neon-violet/60 bg-neon-violet/10 glow-violet"
                        : isToday
                          ? "border-neon-cyan/60 bg-neon-cyan/5 glow-cyan"
                          : "border-border/60 bg-white/[0.02] hover:border-neon-cyan/40",
                    ].join(" ")}
                  >
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground text-center">{d.day}</div>
                    <div className="mt-2 text-xs font-semibold leading-tight text-center">{d.label}</div>
                    <div className="mt-1 text-[10px] text-muted-foreground text-center">{d.focus}</div>
                    <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-neon-cyan to-neon-violet"
                        style={{ width: `${d.load}%` }}
                      />
                    </div>
                    {isDone && (
                      <CheckCircle2 className="absolute top-2 right-2 h-3.5 w-3.5 text-neon-lime" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="glass-strong rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-neon-violet/20 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-neon-violet">
                <Sparkles className="h-3.5 w-3.5" /> {dayInfo.day === todayDay() ? "Heute" : dayInfo.day}
              </div>
              <h3 className="text-xl font-bold mt-1">{dayInfo.label}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Dauer ca. {dayInfo.duration_min} min · Load {dayInfo.load} TSS
              </p>

              {running && (
                <div className="mt-4 rounded-2xl border border-neon-cyan/40 bg-neon-cyan/5 px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-neon-cyan">Live Timer</div>
                    <div className="text-2xl font-bold tabular-nums">{formatTime(elapsed)}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {doneBlocks.size}/{dayInfo.blocks.length} Blöcke
                  </div>
                </div>
              )}

              <div className="mt-5 space-y-2.5">
                <AnimatePresence initial={false}>
                  {dayInfo.blocks.map((b) => {
                    const id = `${dayInfo.day}_${b.name}_${b.detail}`;
                    const checked = doneBlocks.has(id);
                    return (
                      <motion.button
                        key={id}
                        type="button"
                        layout
                        onClick={() => {
                          if (!running) return;
                          setDoneBlocks((s) => {
                            const n = new Set(s);
                            if (n.has(id)) n.delete(id);
                            else n.add(id);
                            return n;
                          });
                        }}
                        className={[
                          "w-full flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition",
                          checked
                            ? "border-neon-lime/40 bg-neon-lime/5"
                            : "border-border/50 bg-white/[0.02] hover:border-neon-cyan/30",
                          !running && "cursor-default",
                        ].filter(Boolean).join(" ")}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {running && (
                            <div
                              className={[
                                "h-5 w-5 rounded-md border grid place-items-center shrink-0",
                                checked ? "bg-neon-lime/20 border-neon-lime/60" : "border-border/60",
                              ].join(" ")}
                            >
                              {checked && <CheckCircle2 className="h-3.5 w-3.5 text-neon-lime" />}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-sm font-semibold truncate">{b.name}</div>
                            <div className="text-[11px] text-muted-foreground truncate">{b.detail}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-muted-foreground tabular-nums">{b.duration_min}m</span>
                          <Badge variant="outline" className="text-[10px] border-neon-cyan/30 text-neon-cyan">
                            {b.zone}
                          </Badge>
                        </div>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>

              {!running ? (
                <Button
                  onClick={() => {
                    setRunning(true);
                    setElapsed(0);
                    setDoneBlocks(new Set());
                    toast.success(`${dayInfo.label} gestartet`);
                  }}
                  className="w-full mt-5 bg-gradient-to-r from-neon-cyan to-neon-violet text-background font-semibold hover:opacity-90"
                >
                  <Play className="h-4 w-4 mr-2" /> Session starten
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-2 mt-5">
                  <Button
                    onClick={() => setRunning(false)}
                    variant="outline"
                    className="border-neon-amber/40 text-neon-amber hover:bg-neon-amber/10"
                  >
                    <Pause className="h-4 w-4 mr-2" /> Pause
                  </Button>
                  <Button
                    onClick={finishSession}
                    className="bg-gradient-to-r from-neon-lime to-neon-cyan text-background font-semibold"
                  >
                    <Square className="h-4 w-4 mr-2" /> Beenden
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <div className="glass rounded-3xl p-6">
            <h3 className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">Belastung vs. Erholung</h3>
            {[
              { label: "Akute Belastung (7d)", val: plan.weekly_load_tss, max: 600, color: "from-neon-cyan to-neon-violet" },
              { label: "Chronische Belastung (28d)", val: Math.round(plan.weekly_load_tss * 0.92), max: 600, color: "from-neon-violet to-neon-magenta" },
              { label: "Form (CTL − ATL)", val: 78, max: 100, color: "from-neon-lime to-neon-cyan" },
            ].map((m) => (
              <div key={m.label} className="mb-4 last:mb-0">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">{m.label}</span>
                  <span className="font-semibold tabular-nums">{m.val}</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${m.color}`} style={{ width: `${(m.val / m.max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="glass rounded-3xl p-6">
            <h3 className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">Saisonziel · {discipline}</h3>
            <div className="flex items-end justify-between mb-2">
              <span className="text-4xl font-bold gradient-text tabular-nums">10.82s</span>
              <span className="text-xs text-muted-foreground">Ziel: 10.65s</span>
            </div>
            <Progress value={68} className="h-2" />
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { k: "Block", v: plan.focus },
                { k: "Woche", v: "5 / 12" },
                { k: "Peak", v: "12. Juli" },
              ].map((x) => (
                <div key={x.k} className="rounded-xl border border-border/50 bg-white/[0.02] p-3">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{x.k}</div>
                  <div className="text-sm font-semibold mt-1 truncate">{x.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </EditableShell>
    </AppShell>
  );
}
