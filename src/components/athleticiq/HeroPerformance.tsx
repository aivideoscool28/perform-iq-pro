import { Activity, Bolt, Flame, Wind, ChevronRight } from "lucide-react";

interface Props {
  name: string;
}

export function HeroPerformance({ name }: Props) {
  const score = 92;
  const circ = 2 * Math.PI * 92;
  const offset = circ - (score / 100) * circ;

  const ecg =
    "M0,40 L20,40 L26,40 L32,18 L38,62 L44,30 L50,40 L70,40 L90,40 L96,40 L102,22 L108,58 L114,32 L120,40 L160,40 L170,40 L176,40 L182,16 L188,64 L194,32 L200,40 L260,40";

  const chips: { icon: typeof Bolt; label: string; val: string }[] = [
    { icon: Bolt, label: "Power", val: "1142W" },
    { icon: Wind, label: "VO₂ Max", val: "62.4" },
    { icon: Flame, label: "Kalorien", val: "1 850" },
  ];

  return (
    <section className="relative rounded-3xl overflow-hidden mb-6 border border-border bg-card shadow-sm">
      <div className="absolute inset-0 pointer-events-none grid-bg opacity-50" />

      <div className="relative grid md:grid-cols-[260px_1fr] gap-6 md:gap-10 p-6 md:p-10">
        {/* Ring + score */}
        <div className="relative mx-auto md:mx-0 h-[260px] w-[260px]">
          <svg viewBox="0 0 220 220" className="absolute inset-0">
            {Array.from({ length: 48 }).map((_, i) => {
              const a = (i / 48) * Math.PI * 2 - Math.PI / 2;
              const r1 = 104;
              const r2 = i % 4 === 0 ? 96 : 100;
              return (
                <line
                  key={i}
                  x1={110 + Math.cos(a) * r1}
                  y1={110 + Math.sin(a) * r1}
                  x2={110 + Math.cos(a) * r2}
                  y2={110 + Math.sin(a) * r2}
                  stroke="var(--border)"
                  strokeWidth={i % 4 === 0 ? 1.4 : 0.8}
                />
              );
            })}
            <circle
              cx="110"
              cy="110"
              r="92"
              fill="none"
              stroke="var(--border)"
              strokeWidth="10"
            />
            <circle
              cx="110"
              cy="110"
              r="92"
              fill="none"
              stroke="var(--foreground)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              transform="rotate(-90 110 110)"
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                Readiness
              </div>
              <div className="text-6xl font-semibold tabular-nums leading-none mt-1 text-foreground">
                {score}
              </div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground mt-2">
                Peak Window · 17:30
              </div>
            </div>
          </div>
        </div>

        {/* Right content */}
        <div className="flex flex-col justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-accent mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-accent pulse-dot" />
              Live · Performance Command Center
            </div>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight leading-[1.05] text-foreground">
              {name}, du bist im <span className="text-accent">Elite-Korridor</span>.
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl text-sm md:text-base leading-relaxed">
              HRV +9% über Baseline · Schlaf 7h 48m · Bodenkontakt 91 ms. KI-Coach empfiehlt
              <span className="text-foreground font-medium"> 6×60 m Maximalsprint</span> mit voller Pause.
            </p>
          </div>

          {/* Live HR strip */}
          <div className="rounded-2xl border border-border bg-background p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-destructive">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive pulse-dot-red" />
                Live Heart Rate
              </div>
              <div className="text-xs text-muted-foreground tabular-nums">Zone 2 · Aerob</div>
            </div>
            <div className="flex items-end gap-4">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-semibold tabular-nums text-foreground leading-none">142</span>
                  <span className="text-xs text-muted-foreground">bpm</span>
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
                  Max 188 · Rest 48
                </div>
              </div>
              <svg viewBox="0 0 260 80" className="flex-1 h-14">
                <path
                  d={ecg}
                  fill="none"
                  stroke="var(--destructive)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Stat chips */}
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {chips.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-border bg-background px-3 py-3 flex items-center gap-3 hover:border-foreground/40 transition"
              >
                <div className="h-9 w-9 rounded-xl bg-secondary border border-border grid place-items-center text-foreground">
                  <s.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground truncate">
                    {s.label}
                  </div>
                  <div className="font-semibold tabular-nums leading-tight">{s.val}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button className="btn-light-sweep flex-1 h-12 rounded-2xl bg-foreground text-background font-semibold tracking-wide grid place-items-center hover:opacity-90 transition">
              <span className="flex items-center gap-2">
                <Activity className="h-4 w-4" /> Session starten
              </span>
            </button>
            <button className="h-12 px-5 rounded-2xl bg-card border border-border hover:border-foreground/40 text-sm font-semibold flex items-center gap-1 transition">
              Plan ansehen <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
