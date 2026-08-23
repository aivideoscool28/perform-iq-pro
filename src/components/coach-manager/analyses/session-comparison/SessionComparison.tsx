import {
  ArrowRightLeft,
  ChevronRight,
  CircleHelp,
  Sparkles,
  Users,
} from "lucide-react";

import {
  comparisonSections,
  sessionContext,
} from "@/components/coach-manager/analyses/session-comparison/sessionComparison.data";

type Distribution = {
  improved: number;
  similar: number;
  declined: number;
} | null;

function AthleteDistribution({
  distribution,
}: {
  distribution: Distribution;
}) {
  if (!distribution) {
    return (
      <span className="text-[8px] text-muted-foreground">
        —
      </span>
    );
  }

  return (
    <button
      type="button"
      className="flex items-center gap-2 text-[8px] font-semibold"
    >
      <span className="text-green-600">
        {distribution.improved}
      </span>

      <span className="text-muted-foreground">/</span>

      <span className="text-orange-600">
        {distribution.similar}
      </span>

      <span className="text-muted-foreground">/</span>

      <span className="text-red-500">
        {distribution.declined}
      </span>

      <ChevronRight className="h-3 w-3 text-muted-foreground" />
    </button>
  );
}

function SessionCard({
  date,
  tone,
}: {
  date: string;
  tone: "violet" | "green";
}) {
  const toneClasses =
    tone === "violet"
      ? "border-violet-100 bg-violet-50/35 text-violet-700"
      : "border-green-100 bg-green-50/35 text-green-700";

  return (
    <section
      className={`rounded-2xl border p-4 ${toneClasses}`}
    >
      <p className="text-sm font-bold">
        {date}
      </p>

      <p className="mt-2 text-[11px] font-bold text-foreground">
        Speed Endurance
      </p>

      <p className="mt-1 text-[9px] text-muted-foreground">
        Sprint / Hurdles U18 · Track Session
      </p>

      <p className="mt-2 text-[8px] text-muted-foreground">
        3 × 150 m · 90–95% · 8 min recovery
      </p>
    </section>
  );
}

export function SessionComparison() {
  return (
    <div className="space-y-3">
      <section className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-semibold text-muted-foreground">
            Comparing
          </span>

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-[9px] font-semibold shadow-sm"
          >
            <Users className="h-3.5 w-3.5 text-violet-600" />
            U18 Sprint Group
            <span className="text-muted-foreground">⌄</span>
          </button>

          <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[8px] font-semibold text-violet-700">
            27 athletes with data
          </span>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-3 py-2 text-[9px] font-semibold text-violet-700"
        >
          <ArrowRightLeft className="h-3.5 w-3.5" />
          Swap sessions
        </button>
      </section>

      <div className="grid grid-cols-[1fr_0.32fr] gap-3">
        <main className="min-w-0 space-y-3">
          <section className="rounded-2xl border border-violet-100 bg-violet-50/35 px-3 py-2.5">
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />

              <div>
                <p className="text-[9px] font-bold text-violet-700">
                  AI-selected similar sessions
                </p>

                <p className="mt-0.5 text-[8px] text-muted-foreground">
                  Selected using training type, phase, workout structure,
                  intended intensity, recovery and available conditions.
                </p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-[1fr_42px_1fr] items-center gap-3">
            <SessionCard date="May 12, 2025" tone="violet" />

            <div className="grid h-10 w-10 place-items-center rounded-full border border-border bg-white text-xs font-bold shadow-sm">
              VS
            </div>

            <SessionCard date="May 19, 2025" tone="green" />
          </div>

          <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            <div className="grid grid-cols-[1.35fr_0.8fr_0.8fr_0.62fr_0.82fr] gap-3 border-b border-border bg-muted/10 px-4 py-2.5 text-[8px] font-semibold text-muted-foreground">
              <span>Metric</span>
              <span>May 12</span>
              <span>May 19</span>
              <span>Change</span>

              <div>
                <p>Athlete distribution</p>
                <p className="mt-0.5 text-[6px] font-normal">
                  improved / similar / declined
                </p>
              </div>
            </div>

            {comparisonSections.map((section) => (
              <div key={section.title}>
                <div className="border-b border-border/60 bg-slate-50/50 px-4 py-2">
                  <div className="flex items-center gap-2">
                    <p
                      className={[
                        "text-[8px] font-bold",
                        section.tone === "orange"
                          ? "text-orange-600"
                          : section.tone === "green"
                            ? "text-green-600"
                            : "text-violet-600",
                      ].join(" ")}
                    >
                      {section.title}
                    </p>

                    <p className="text-[8px] text-muted-foreground">
                      {section.subtitle}
                    </p>
                  </div>
                </div>

                {section.rows.map((row) => (
                  <button
                    key={row.metric}
                    type="button"
                    className="grid w-full grid-cols-[1.35fr_0.8fr_0.8fr_0.62fr_0.82fr] items-center gap-3 border-b border-border/60 px-4 py-3 text-left transition last:border-b-0 hover:bg-muted/15"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-semibold">
                        {row.metric}
                      </span>

                      <CircleHelp className="h-3 w-3 text-muted-foreground" />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-violet-700">
                        {row.sessionA}
                      </p>

                      {row.sessionADetail && (
                        <p className="mt-0.5 text-[8px] text-muted-foreground">
                          {row.sessionADetail}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-green-700">
                        {row.sessionB}
                      </p>

                      {row.sessionBDetail && (
                        <p className="mt-0.5 text-[8px] text-muted-foreground">
                          {row.sessionBDetail}
                        </p>
                      )}
                    </div>

                    <span
                      className={`text-[8px] font-semibold ${row.changeStyle}`}
                    >
                      {row.change}
                    </span>

                    <AthleteDistribution
                      distribution={row.distribution}
                    />
                  </button>
                ))}
              </div>
            ))}

            <div className="flex items-start gap-2 bg-violet-50/30 px-4 py-2">
              <CircleHelp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-600" />

              <p className="text-[7px] leading-relaxed text-muted-foreground">
                Session-RPE load is calculated for each athlete as actual
                session duration × session RPE. Group values above represent
                the median of individual athlete loads. Higher load is not
                automatically better or worse.
              </p>
            </div>
          </section>

          <section className="flex items-start gap-3 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50/80 via-white to-orange-50/30 p-3 shadow-sm">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-100">
              <Sparkles className="h-4 w-4 text-violet-600" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-violet-700">
                Athletic IQ Insight
              </p>

              <p className="mt-1 text-[8px] leading-relaxed text-muted-foreground">
                Goal achievement was higher in the second session while
                median session-RPE load increased by 21% and reported effort
                increased by 1 RPE point. Athletes also reported better sleep
                and energy before the second session, while soreness was
                unchanged.
              </p>

              <p className="mt-1 text-[8px] font-medium text-slate-700">
                Worth reviewing: whether the outcome change was consistent
                across athletes and whether the additional training demand
                was intended.
              </p>
            </div>

            <button
              type="button"
              className="shrink-0 rounded-xl border border-violet-200 bg-white px-3 py-2 text-[8px] font-semibold text-violet-700"
            >
              View evidence →
            </button>
          </section>
        </main>

        <aside className="space-y-3">
          <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-violet-700">
                Session Context
              </h3>

              <span className="rounded-full bg-green-50 px-2 py-1 text-[7px] font-semibold text-green-700">
                Highly comparable
              </span>
            </div>

            <div className="mt-3 space-y-2.5">
              {sessionContext.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 text-[9px] font-bold text-green-600">
                      ✓
                    </span>

                    <span className="text-[8px] font-medium">
                      {label}
                    </span>
                  </div>

                  <span className="max-w-[110px] text-right text-[8px] text-muted-foreground">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="mt-3 text-[8px] font-semibold text-violet-600"
            >
              View comparison details →
            </button>
          </section>

          <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <h3 className="text-xs font-bold">
              Comparison Summary
            </h3>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-3">
                <p className="text-[9px] font-bold text-violet-700">
                  Outcome
                </p>

                <p className="mt-1 text-[8px] text-muted-foreground">
                  Goal achievement increased and performance responses were
                  more positive.
                </p>
              </div>

              <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-3">
                <p className="text-[9px] font-bold text-orange-700">
                  Training demand
                </p>

                <p className="mt-1 text-[8px] text-muted-foreground">
                  RPE +1 · Duration +4 min · Median session-RPE load +21%.
                </p>
              </div>

              <div className="rounded-xl border border-green-100 bg-green-50/40 p-3">
                <p className="text-[9px] font-bold text-green-700">
                  Recovery context
                </p>

                <p className="mt-1 text-[8px] text-muted-foreground">
                  Sleep and energy were higher. Soreness was unchanged.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-violet-100 bg-violet-50/25 p-3 shadow-sm">
            <p className="text-[9px] font-bold text-violet-700">
              Need more detail?
            </p>

            <p className="mt-1 text-[8px] leading-relaxed text-muted-foreground">
              Click any metric to inspect athlete-by-athlete changes and
              identify the largest differences.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}






