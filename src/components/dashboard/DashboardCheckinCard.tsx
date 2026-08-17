import { CheckCircle2, RotateCcw, Sparkles } from "lucide-react";

type DashboardCheckinCardProps = {
  doneToday: boolean;
  onStart: () => void;
  onReset: () => void;
  resetPending: boolean;
};

export function DashboardCheckinCard({
  doneToday,
  onStart,
  onReset,
  resetPending,
}: DashboardCheckinCardProps) {
  if (!doneToday) {
    return (
      <button
        data-tour="checkin"
        onClick={onStart}
        className="
          group relative min-h-[155px] overflow-hidden
          rounded-2xl border border-accent/20
          bg-gradient-to-br from-accent/10 via-card to-accent/5
          p-6 text-left shadow-sm
          transition-all duration-200
          hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md
        "
      >
        <div className="
          pointer-events-none absolute
          -left-12 -top-16 h-40 w-40
          rounded-full bg-accent/15 blur-3xl
        " />

        <div className="relative flex h-full items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="
              grid h-14 w-14 shrink-0 place-items-center
              rounded-2xl bg-accent/15
            ">
              <Sparkles className="h-6 w-6 text-accent" />
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
                Heute
              </div>

              <h2 className="mt-1 text-xl font-bold tracking-tight">
                Daily Check-In
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Training beendet? Kurzes Feedback geben.
              </p>
            </div>
          </div>

          <div className="
            shrink-0 rounded-xl
            bg-accent px-4 py-2
            text-sm font-bold text-accent-foreground
          ">
            Starten →
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="
      relative min-h-[155px] overflow-hidden
      rounded-2xl border border-accent/20
      bg-gradient-to-br from-accent/10 via-card to-accent/5
      p-6 shadow-sm
    ">
      <div className="
        pointer-events-none absolute
        -left-12 -top-16 h-40 w-40
        rounded-full bg-accent/15 blur-3xl
      " />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="
            grid h-14 w-14 shrink-0 place-items-center
            rounded-2xl bg-accent/15
          ">
            <CheckCircle2 className="h-6 w-6 text-accent" />
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
              Heute
            </div>

            <h2 className="mt-1 text-xl font-bold tracking-tight">
              Check-In abgeschlossen
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Dein heutiger Check-In wurde gespeichert.
            </p>
          </div>
        </div>

        <div className="
          shrink-0 rounded-xl
          bg-accent/10 px-3 py-1.5
          text-xs font-bold text-accent
        ">
          ✓ Heute
        </div>
      </div>

      <div className="relative mt-5">
        <button
          onClick={onReset}
          disabled={resetPending}
          className="
            inline-flex items-center gap-2
            text-xs font-medium text-muted-foreground
            transition hover:text-foreground
          "
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Dev: Check-in zurücksetzen
        </button>
      </div>
    </div>
  );
}
