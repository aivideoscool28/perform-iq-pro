import { Sparkles, TrendingUp } from "lucide-react";

type KIInsightCardProps = {
  insight: string | null;
  discipline: string | null;
};

export function KIInsightCard({
  insight,
  discipline,
}: KIInsightCardProps) {
  return (
    <section className="mb-6">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">

        <div className="mb-4 flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-accent" />

          <div className="font-bold">
            Neuestes KI-Insight
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4">

          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-accent/15">
            <TrendingUp className="h-6 w-6 text-accent" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">

              <h3 className="font-bold">
                {insight
                  ? "Fokus aus deinem letzten Training"
                  : "Noch kein KI-Insight"}
              </h3>

              <span className="rounded-lg bg-accent/10 px-2 py-1 text-[10px] font-semibold text-accent">
                {discipline
                  ? discipline.toUpperCase()
                  : "ATHLETIC IQ"}
              </span>

            </div>

            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {insight ??
                "Absolviere ein Training und deinen Daily Check-In, damit Athletic IQ dir hier ein persönliches Insight zeigen kann."}
            </p>
          </div>

          <span className="shrink-0 text-xl text-muted-foreground">
            →
          </span>

        </div>
      </div>
    </section>
  );
}
