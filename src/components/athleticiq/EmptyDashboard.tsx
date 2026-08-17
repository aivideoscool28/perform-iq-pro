import { motion } from "framer-motion";
import {
  Battery, HeartPulse, Flame, Moon, Dumbbell, Timer, Zap, Gauge,
  Sparkles, Plus, FlaskConical, TrendingUp, Activity,
} from "lucide-react";
import { toast } from "sonner";
import { Sparkline } from "./Sparkline";
import { PerformanceRadar } from "./PerformanceRadar";

interface Profile {
  display_name?: string | null;
  disciplines?: string[] | null;
  training_days_per_week?: number | null;
}

/* Discipline-aware onboarding tip + suggested first test */
const DISCIPLINE_INFO: Record<string, { tip: string; test: string; testDesc: string }> = {
  Sprint: {
    tip: "Für Sprinter zählt explosive Kraft. Logge deine ersten Sprints, damit die KI deine Antrittsgeschwindigkeit erkennt.",
    test: "30m fliegender Sprint",
    testDesc: "Misst deine maximale Geschwindigkeit & Antritt.",
  },
  Mittelstrecke: {
    tip: "Mittelstreckler brauchen Tempohärte. Tracke deine Intervalle, um deine Laktatschwelle zu kalibrieren.",
    test: "Cooper-Test (12 min)",
    testDesc: "Schätzt deine aerobe Ausdauer & VO₂max.",
  },
  Langstrecke: {
    tip: "Ausdauer wird über Konstanz aufgebaut. Logge deine Läufe für ein präzises Belastungsprofil.",
    test: "5km Zeitfahren",
    testDesc: "Referenzwert für deine Ausdauerentwicklung.",
  },
  Hürden: {
    tip: "Hürden verlangen Rhythmus & Mobilität. Logge Technik-Einheiten für gezieltes Feedback.",
    test: "Beweglichkeits-Screening",
    testDesc: "Prüft Hüftmobilität & Sprungbein-Symmetrie.",
  },
  Weitsprung: {
    tip: "Sprünge leben von Reaktivität. Tracke deine Anläufe, um Absprungkraft zu analysieren.",
    test: "Countermovement Jump (CMJ)",
    testDesc: "Misst deine reaktive Sprungkraft.",
  },
  Hochsprung: {
    tip: "Vertikale Power ist entscheidend. Logge deine Sprungeinheiten für Reaktivitäts-Tracking.",
    test: "Countermovement Jump (CMJ)",
    testDesc: "Misst deine reaktive Sprungkraft.",
  },
  Kraft: {
    tip: "Kraft ist die Basis für alles. Logge deine Gewichte, damit die KI deine 1RM-Entwicklung verfolgt.",
    test: "1RM Kniebeuge",
    testDesc: "Referenzwert für deine Maximalkraft.",
  },
};

const DEFAULT_INFO = {
  tip: "Willkommen! Logge dein erstes Workout, damit die KI dein persönliches Profil aufbauen kann.",
  test: "Leistungs-Basistest",
  testDesc: "Erfasst deine Ausgangswerte für alle Disziplinen.",
};

function StatCard({
  label, value, unit, hint, icon: Icon, sparkline,
}: {
  label: string;
  value: string;
  unit?: string;
  hint: string;
  icon: typeof Battery;
  sparkline?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-semibold tabular-nums text-muted-foreground/60">{value}</span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
          <div className="mt-1 text-xs text-muted-foreground/80">{hint}</div>
        </div>
        <div className="h-10 w-10 shrink-0 rounded-xl border border-border bg-secondary grid place-items-center">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      {sparkline && (
        <div className="mt-4 opacity-40">
          <Sparkline data={[0, 0, 0, 0, 0, 0, 0]} color="var(--muted-foreground)" />
        </div>
      )}
    </motion.div>
  );
}

function MeasurementTile({ label, unit }: { label: string; unit: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col">
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold tabular-nums text-muted-foreground/50">—</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
      <button
        onClick={() => toast("Bald verfügbar — Messwerte kannst du nach deinem ersten Test eintragen.")}
        className="mt-3 inline-flex items-center gap-1 self-start rounded-lg border border-border bg-secondary px-2.5 py-1 text-[11px] font-medium text-foreground hover:border-accent/50 transition"
      >
        <Plus className="h-3 w-3" /> Wert hinzufügen
      </button>
    </div>
  );
}

export function EmptyDashboard({ profile }: { profile?: Profile | null }) {
  const goal = profile?.training_days_per_week ?? 4;
  const primary = profile?.disciplines?.[0];
  const info = (primary && DISCIPLINE_INFO[primary]) || DEFAULT_INFO;

  return (
    <>
      {/* TODAY'S TRAINING — temporary sample until Training calendar is connected */}
      <section className="mb-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.22em] text-accent font-semibold">
                Heute
              </div>

              <h2 className="mt-2 text-xl font-bold tracking-tight">
                Beschleunigung
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Sprint · ca. 60 Minuten
              </p>
            </div>

            <div className="h-11 w-11 shrink-0 rounded-xl border border-border bg-secondary grid place-items-center">
              <Zap className="h-5 w-5 text-accent" />
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-border bg-background p-4">
            <div className="space-y-2 text-sm">
              <div>4 × 20 m Blockstarts</div>
              <div>4 × 30 m Beschleunigung</div>
              <div>3 × Flying 30 m</div>
            </div>
          </div>

          <button
            onClick={() =>
              toast("Training wird später mit dem Trainingskalender verbunden.")
            }
            className="mt-4 inline-flex items-center justify-center rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm font-semibold text-foreground hover:border-accent/50 transition"
          >
            Training ansehen
          </button>
        </motion.div>
      </section>
      {/* TODAY'S TRAINING — temporary sample until Training calendar is connected */}
      <section className="mb-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.22em] text-accent font-semibold">
                Heute
              </div>

              <h2 className="mt-2 text-xl font-bold tracking-tight">
                Beschleunigung
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Sprint · ca. 60 Minuten
              </p>
            </div>

            <div className="h-11 w-11 shrink-0 rounded-xl border border-border bg-secondary grid place-items-center">
              <Zap className="h-5 w-5 text-accent" />
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-border bg-background p-4">
            <div className="space-y-2 text-sm">
              <div>4 × 20 m Blockstarts</div>
              <div>4 × 30 m Beschleunigung</div>
              <div>3 × Flying 30 m</div>
            </div>
          </div>

          <button
            onClick={() =>
              toast("Training wird später mit dem Trainingskalender verbunden.")
            }
            className="mt-4 inline-flex items-center justify-center rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm font-semibold text-foreground hover:border-accent/50 transition"
          >
            Training ansehen
          </button>
        </motion.div>
      </section>
      {/* ROW 1 — Stats */}
      <section data-tour="performance" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Trainings diese Woche" value="0" unit={`/ ${goal}`} hint="Dein Wochenziel" icon={Dumbbell} sparkline />
        <StatCard label="Wochen-Belastung" value="—" unit="TSS" hint="Fang an zu loggen!" icon={Flame} sparkline />
        <StatCard label="Aktive Zeit" value="0h 0m" hint="Noch keine Session" icon={Timer} sparkline />
        <StatCard label="Power Index" value="—" hint="Schaltet nach 3 Sessions frei" icon={Zap} sparkline />
      </section>

      {/* ROW 2 — Athlete data */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Energielevel" value="—" unit="%" hint="Braucht Check-in-Daten" icon={Battery} />
        <StatCard label="HRV" value="—" unit="ms" hint="Wearable oder manuell" icon={HeartPulse} />
        <StatCard label="Belastung" value="—" unit="TSS" hint="Braucht Trainingslog" icon={Gauge} />
        <StatCard label="Schlaf" value="—" unit="h" hint="Braucht Check-in-Daten" icon={Moon} />
      </section>

      {/* ROW 3 — Charts */}
      <section className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold">Performance · 7 Tage</h3>
            <p className="text-xs text-muted-foreground">Form, Belastung & HRV</p>
          </div>
          <div className="h-64 rounded-xl border border-dashed border-border grid place-items-center text-center px-6">
            <div>
              <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">
                Logge dein erstes Workout, um Trends zu sehen.
              </p>
            </div>
          </div>
        </div>

        {/* Onboarding AI tip */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="h-8 w-8 rounded-lg bg-foreground grid place-items-center">
              <Sparkles className="h-4 w-4 text-background" />
            </div>
            <div>
              <div className="font-semibold text-sm">KI-Insights</div>
              <div className="text-[11px] text-muted-foreground">Dein erster Tipp</div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="flex gap-3">
              <Activity className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium text-sm">{primary ?? "Willkommen"}</h4>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground border border-border rounded px-1.5 py-0.5">
                    Onboarding
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{info.tip}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROW 4 — Athlete profile */}
      <section className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-2">
            <h3 className="font-semibold">Performance Radar</h3>
            <p className="text-xs text-muted-foreground">
              Füllt sich automatisch, sobald du Daten sammelst.
            </p>
          </div>
          <PerformanceRadar />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="h-9 w-9 rounded-xl border border-border bg-secondary grid place-items-center">
              <FlaskConical className="h-4 w-4 text-accent" />
            </div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Nächster Test
            </div>
          </div>
          <h4 className="text-lg font-semibold tracking-tight">{info.test}</h4>
          <p className="text-sm text-muted-foreground mt-1 flex-1">{info.testDesc}</p>
          <button
            onClick={() => toast("Tests planst du bald direkt aus dem Dashboard.")}
            className="mt-4 h-10 rounded-xl bg-foreground text-background font-semibold text-sm hover:opacity-90 transition"
          >
            Test planen
          </button>
        </div>
      </section>

      {/* ROW 5 — Last measurements */}
      <section className="mb-6">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight">Letzte Messwerte</h2>
          <span className="text-xs text-muted-foreground">Noch keine Werte</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <MeasurementTile label="VO₂MAX" unit="ml/kg/min" />
          <MeasurementTile label="Laktatschwelle" unit="mmol/L" />
          <MeasurementTile label="1RM Squat" unit="kg" />
          <MeasurementTile label="CMJ Sprung" unit="cm" />
          <MeasurementTile label="Ferritin" unit="ng/mL" />
          <MeasurementTile label="Vitamin D" unit="ng/mL" />
        </div>
      </section>
    </>
  );
}




