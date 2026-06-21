import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Flame, ChevronLeft, ChevronRight, Sparkles, CalendarDays, Moon, AlertCircle } from "lucide-react";

type LogEntry = { id: string; discipline: string; date: string; note?: string };
export type CheckinEntry = {
  checkin_date: string;
  is_rest_day: boolean | null;
  discipline?: string | null;
  ai_summary?: string | null;
};
type DayStatus = "training" | "rest" | "grace" | "broken" | "future" | "empty";
type WorkoutEntry = {
  id: string;
  workout_date: string;
  raw_input?: string | null;
  summary?: string | null;
  notes?: string | null;
  exercises?: unknown;
};

const LOG_KEY = "athleticiq.training.disciplines.v1";

function loadLog(): LogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? (JSON.parse(raw) as LogEntry[]) : [];
  } catch {
    return [];
  }
}

function exerciseLabel(workout: WorkoutEntry) {
  const raw = workout.raw_input?.trim();
  if (raw) return raw;
  const exercises = Array.isArray(workout.exercises) ? workout.exercises : [];
  const names = exercises
    .map((exercise) => {
      if (typeof exercise === "string") return exercise;
      if (exercise && typeof exercise === "object" && "name" in exercise) {
        const name = (exercise as { name?: unknown }).name;
        return typeof name === "string" ? name : null;
      }
      return null;
    })
    .filter(Boolean);
  return names.length > 0 ? names.join(", ") : workout.summary?.trim() || "Training";
}

function workoutsToLog(workouts: WorkoutEntry[]): LogEntry[] {
  return workouts.map((workout) => ({
    id: `workout-${workout.id}`,
    discipline: exerciseLabel(workout),
    date: workout.workout_date,
    note: workout.summary?.trim() || workout.notes?.trim() || undefined,
  }));
}

const toISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const daysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
// Monday = 0 … Sunday = 6
const mondayIndex = (d: Date) => (d.getDay() + 6) % 7;

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

// Empfehlungs-Rotation: nach Belastung wechseln
const RECOMMENDATIONS: Record<string, { next: string; reason: string }> = {
  Sprint: { next: "Mobility + Core", reason: "Aktive Erholung nach Speed-Belastung" },
  Speed: { next: "Mobility + Core", reason: "Aktive Erholung nach Speed-Belastung" },
  Sprung: { next: "Kraft Oberkörper", reason: "Beine schonen, Push-Muster trainieren" },
  Wurf: { next: "Tempo Läufe", reason: "Ausdauer-Basis nach Power-Tag" },
  Kraft: { next: "Tempo Läufe", reason: "Aerobe Kapazität gegen Krafttag balancieren" },
  Lauf: { next: "Plyometrie", reason: "Reaktivkraft nach aerober Einheit" },
  Tempo: { next: "Regeneration · Yoga", reason: "Recovery, um Form zu peaken" },
  Mobility: { next: "Sprint Intervals", reason: "Frische Beine für Speed-Block" },
};

function suggestNext(lastDiscipline?: string): { next: string; reason: string } {
  if (!lastDiscipline) return { next: "Sprint Intervals", reason: "Starte mit Speed-Fokus" };
  const lower = lastDiscipline.toLowerCase();
  for (const key of Object.keys(RECOMMENDATIONS)) {
    if (lower.includes(key.toLowerCase())) return RECOMMENDATIONS[key];
  }
  return { next: "Mobility + Core", reason: "Aktive Erholung empfohlen" };
}

export function StreakManager({
  workouts = [],
  checkins = [],
}: {
  workouts?: WorkoutEntry[];
  checkins?: CheckinEntry[];
}) {
  const [localLog, setLocalLog] = useState<LogEntry[]>([]);
  const [cursor, setCursor] = useState<Date | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setLocalLog(loadLog());
    setCursor(startOfMonth(new Date()));
    setSelected(toISO(new Date()));
    const refresh = () => setLocalLog(loadLog());
    window.addEventListener("storage", refresh);
    window.addEventListener("athleticiq:log-updated", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("athleticiq:log-updated", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const log = useMemo(() => {
    const backendLog = workoutsToLog(workouts);
    return [...backendLog, ...localLog].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [workouts, localLog]);

  const byDate = useMemo(() => {
    const m = new Map<string, LogEntry[]>();
    for (const e of log) {
      const list = m.get(e.date) ?? [];
      list.push(e);
      m.set(e.date, list);
    }
    return m;
  }, [log]);

  const checkinByDate = useMemo(() => {
    const m = new Map<string, CheckinEntry>();
    for (const c of checkins) m.set(c.checkin_date, c);
    return m;
  }, [checkins]);

  const { currentStreak, longestStreak, statusByDate } = useMemo(() => {
    const todayISO = toISO(new Date());
    const status = new Map<string, DayStatus>();
    // Determine earliest date to evaluate
    const dates = checkins.map((c) => c.checkin_date).sort();
    const earliest = dates[0] ?? todayISO;
    let cursorDate = new Date(earliest);
    const endDate = new Date(todayISO);
    let runStreak = 0;
    let longest = 0;
    let missedRun = 0;
    while (cursorDate <= endDate) {
      const iso = toISO(cursorDate);
      const ci = checkinByDate.get(iso);
      if (ci) {
        if (ci.is_rest_day) {
          status.set(iso, "rest");
          missedRun = 0;
        } else {
          status.set(iso, "training");
          runStreak += 1;
          longest = Math.max(longest, runStreak);
          missedRun = 0;
        }
      } else {
        missedRun += 1;
        if (missedRun <= 2) {
          status.set(iso, "grace");
        } else {
          status.set(iso, "broken");
          runStreak = 0;
        }
      }
      cursorDate.setDate(cursorDate.getDate() + 1);
    }
    // Recompute current streak walking back from today using same rules
    let cur = 0;
    let m = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      const iso = toISO(d);
      const ci = checkinByDate.get(iso);
      if (ci) {
        if (!ci.is_rest_day) cur += 1;
        m = 0;
      } else if (i > 0) {
        m += 1;
        if (m > 2) break;
      }
      d.setDate(d.getDate() - 1);
    }
    return { currentStreak: cur, longestStreak: longest, statusByDate: status };
  }, [checkins, checkinByDate]);

  if (!cursor || !selected) {
    return <div className="glass-strong rounded-3xl p-6 h-[520px]" aria-hidden />;
  }

  const total = daysInMonth(cursor);
  const offset = mondayIndex(startOfMonth(cursor));
  const cells: Array<{ iso?: string; day?: number }> = [];
  for (let i = 0; i < offset; i++) cells.push({});
  for (let d = 1; d <= total; d++) {
    const date = new Date(cursor.getFullYear(), cursor.getMonth(), d);
    cells.push({ iso: toISO(date), day: d });
  }

  const selectedEntries = byDate.get(selected) ?? [];
  const todayISO = toISO(new Date());
  const lastEntry = [...log].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
  const rec = suggestNext(lastEntry?.discipline);

  const shift = (delta: number) =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));

  return (
    <div className="glass-strong rounded-3xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <Flame className="h-3.5 w-3.5 text-neon-amber" /> Streak Management
          </div>
          <h2 className="text-xl font-bold mt-1">Dein Trainingsverlauf</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-neon-amber/30 bg-neon-amber/10 px-3 py-1.5 text-xs">
            <span className="text-muted-foreground">Aktuell</span>{" "}
            <span className="font-bold text-neon-amber tabular-nums">{currentStreak}</span>{" "}
            <span className="text-muted-foreground">Tage</span>
          </div>
          <div className="rounded-xl border border-border/60 bg-white/[0.02] px-3 py-1.5 text-xs">
            <span className="text-muted-foreground">Rekord</span>{" "}
            <span className="font-bold tabular-nums">{longestStreak}</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Kalender */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => shift(-1)}
              aria-label="Vorheriger Monat"
              className="h-8 w-8 grid place-items-center rounded-lg border border-border/60 hover:border-neon-cyan/40 hover:text-neon-cyan transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <CalendarDays className="h-4 w-4 text-neon-cyan" />
              {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
            </div>
            <button
              onClick={() => shift(1)}
              aria-label="Nächster Monat"
              className="h-8 w-8 grid place-items-center rounded-lg border border-border/60 hover:border-neon-cyan/40 hover:text-neon-cyan transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            {WEEKDAYS.map((w) => (
              <div key={w} className="text-center">{w}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((c, i) => {
              if (!c.iso) return <div key={i} className="aspect-square" />;
              const entries = byDate.get(c.iso);
              const ci = checkinByDate.get(c.iso);
              const dayStatus: DayStatus = statusByDate.get(c.iso) ?? (c.iso > todayISO ? "future" : "empty");
              const isToday = c.iso === todayISO;
              const isSelected = c.iso === selected;
              const cellClass =
                isSelected
                  ? "border-neon-cyan bg-neon-cyan/15 text-neon-cyan glow-cyan"
                  : dayStatus === "training"
                  ? "border-neon-amber/50 bg-neon-amber/15 hover:border-neon-amber"
                  : dayStatus === "rest"
                  ? "border-border/60 bg-muted/20 text-muted-foreground hover:border-border"
                  : dayStatus === "grace"
                  ? "border-amber-400/40 bg-amber-400/5 hover:border-amber-400/70"
                  : dayStatus === "broken"
                  ? "border-border/40 bg-transparent text-muted-foreground/60"
                  : "border-border/50 bg-white/[0.02] hover:border-border";
              return (
                <button
                  key={c.iso}
                  onClick={() => setSelected(c.iso!)}
                  className={[
                    "aspect-square rounded-lg border text-xs font-medium relative flex flex-col items-center justify-center gap-0.5 transition",
                    cellClass,
                    isToday && !isSelected ? "ring-1 ring-neon-violet/60" : "",
                  ].join(" ")}
                >
                  <span className="tabular-nums">{c.day}</span>
                  {dayStatus === "training" && (
                    <span
                      className="text-[8px] leading-none text-neon-amber truncate max-w-full px-0.5"
                      title={ci?.discipline ?? entries?.map((e) => e.discipline).join(", ")}
                    >
                      {(ci?.discipline ?? entries?.[0]?.discipline ?? "").split(" ")[0]}
                    </span>
                  )}
                  {dayStatus === "training" && (
                    <Flame className="absolute top-1 right-1 h-2.5 w-2.5 text-neon-amber" />
                  )}
                  {dayStatus === "rest" && (
                    <Moon className="absolute top-1 right-1 h-2.5 w-2.5 text-muted-foreground" />
                  )}
                  {dayStatus === "grace" && (
                    <AlertCircle className="absolute top-1 right-1 h-2.5 w-2.5 text-amber-400/80" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Flame className="h-3 w-3 text-neon-amber" /> Training</span>
            <span className="inline-flex items-center gap-1"><Moon className="h-3 w-3" /> Ruhetag</span>
            <span className="inline-flex items-center gap-1"><AlertCircle className="h-3 w-3 text-amber-400/80" /> Verpasst (Schonfrist)</span>
            <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm border border-border/40" /> Streak gebrochen</span>
          </div>

          {/* Details für gewählten Tag */}
          <div className="mt-4 rounded-2xl border border-border/50 bg-white/[0.02] p-4">
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {new Date(selected).toLocaleDateString("de-DE", {
                weekday: "long",
                day: "2-digit",
                month: "long",
              })}
            </div>
            {(() => {
              const ci = checkinByDate.get(selected);
              if (ci) {
                return (
                  <div className="mt-2 text-sm">
                    {ci.is_rest_day ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Moon className="h-4 w-4" /> Ruhetag eingetragen
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-neon-amber" />
                        <span className="font-semibold">{ci.discipline ?? "Training"}</span>
                      </div>
                    )}
                    {ci.ai_summary && (
                      <p className="text-xs text-muted-foreground mt-1.5">{ci.ai_summary}</p>
                    )}
                  </div>
                );
              }
              return selectedEntries.length === 0 ? (
              <div className="text-sm text-muted-foreground mt-2">
                Kein Training eingetragen. {selected === todayISO && "Logge eine Einheit, um deinen Streak zu halten."}
              </div>
            ) : (
              <div className="mt-2 space-y-1.5">
                {selectedEntries.map((e) => (
                  <div key={e.id} className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{e.discipline}</span>
                    {e.note && <span className="text-xs text-muted-foreground">{e.note}</span>}
                  </div>
                ))}
              </div>
              );
            })()}
          </div>
        </div>

        {/* Empfehlung */}
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl border border-neon-violet/30 bg-gradient-to-br from-neon-violet/10 to-neon-cyan/5 p-5 relative overflow-hidden h-fit"
        >
          <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-neon-violet/20 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-neon-violet">
              <Sparkles className="h-3.5 w-3.5" /> Empfehlung morgen
            </div>
            <div className="mt-2 text-2xl font-bold gradient-text leading-tight">{rec.next}</div>
            <p className="text-xs text-muted-foreground mt-2">{rec.reason}</p>
            {lastEntry && (
              <div className="mt-4 pt-4 border-t border-border/40 text-[11px] text-muted-foreground">
                Basiert auf deinem letzten Eintrag:{" "}
                <span className="text-foreground font-medium">{lastEntry.discipline}</span>
              </div>
            )}
            {!lastEntry && (
              <div className="mt-4 pt-4 border-t border-border/40 text-[11px] text-muted-foreground">
                Trage dein erstes Training ein, um personalisierte Vorschläge zu erhalten.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
