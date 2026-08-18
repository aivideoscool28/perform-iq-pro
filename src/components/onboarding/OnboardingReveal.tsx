import { ArrowRight, Flame, Target, Users } from "lucide-react";

type Props = {
  name: string;
  discipline: string;
  experience: string;
  goal: string;
  focus: string[];
  trainingDays: number;
  trainingSetup: string;
  favouriteAthlete?: string | null;
  isSaving: boolean;
  errorMessage?: string | null;
  onFinish: () => void;
};

export function OnboardingReveal({
  name,
  discipline,
  experience,
  goal,
  focus,
  trainingDays,
  trainingSetup,
  favouriteAthlete,
  isSaving,
  errorMessage,
  onFinish,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">

        <div className="text-sm font-bold uppercase tracking-[0.18em] text-accent">
          Dein Athletic IQ
        </div>

        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          Bereit, {name}.
        </h1>

        <p className="mt-3 text-muted-foreground">
          Athletic IQ startet jetzt mit deinem persönlichen Athletenprofil.
        </p>

        <div className="mt-6 rounded-2xl border border-border bg-background/60 p-5">
          <div className="text-lg font-bold">
            {discipline} · {experience}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">

            <div className="rounded-2xl bg-accent/5 p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-accent">
                <Target className="h-4 w-4" />
                Dein Ziel
              </div>

              <p className="mt-2 text-sm font-semibold leading-relaxed">
                {goal}
              </p>
            </div>

            <div className="rounded-2xl bg-orange-500/5 p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-orange-500">
                <Flame className="h-4 w-4" />
                Dein Fokus
              </div>

              <p className="mt-2 text-sm font-semibold leading-relaxed">
                {focus.join(" · ")}
              </p>
            </div>

            <div className="rounded-2xl bg-muted/40 p-4 sm:col-span-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                <Users className="h-4 w-4" />
                Dein Training
              </div>

              <p className="mt-2 text-sm font-semibold">
                {trainingDays}× pro Woche · {trainingSetup}
              </p>
            </div>

            {favouriteAthlete && (
              <div className="rounded-2xl bg-muted/40 p-4 sm:col-span-2">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Deine Inspiration
                </div>

                <p className="mt-2 text-sm font-semibold">
                  {favouriteAthlete}
                </p>
              </div>
            )}

          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Mit jedem Training lernen wir mehr über dich.
        </p>

        {errorMessage && (
          <p className="mt-4 text-center text-sm text-destructive">
            {errorMessage}
          </p>
        )}

        <button
          type="button"
          onClick={onFinish}
          disabled={isSaving}
          className="
            mt-6 flex w-full items-center justify-center gap-2
            rounded-2xl bg-accent px-5 py-3.5
            text-sm font-bold text-accent-foreground
            transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60
          "
        >
          {isSaving ? "Profil wird gespeichert..." : "Mein Dashboard öffnen"}
          {!isSaving && <ArrowRight className="h-4 w-4" />}
        </button>

        <div className="mt-4 text-center text-xs font-semibold text-muted-foreground">
          Athletics meets you.
        </div>

      </div>
    </div>
  );
}

