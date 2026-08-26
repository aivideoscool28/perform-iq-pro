import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRightLeft,
  ChevronRight,
  CircleHelp,
  Sparkles,
  Users,
} from "lucide-react";

import {
  getCoachCheckinData,
  type CoachCheckinData,
} from "../check-in/CheckinAnalysisData";

import {
  buildComparableSessions,
  compareSessionPair,
  selectBestComparablePair,
  type AthleteDistribution as Distribution,
  type ComparableSession,
} from "./SessionComparisonCalculations";


function AthleteDistribution({
  distribution,
}: {
  distribution:
    Distribution;
}) {
  if (
    !distribution
  ) {
    return (
      <span className="text-[8px] text-muted-foreground">
        —
      </span>
    );
  }

  return (
    <div
      className="flex items-center gap-2 text-[8px] font-semibold"
    >
      <span className="text-green-600">
        {
          distribution.improved
        }
      </span>

      <span className="text-muted-foreground">
        /
      </span>

      <span className="text-orange-600">
        {
          distribution.similar
        }
      </span>

      <span className="text-muted-foreground">
        /
      </span>

      <span className="text-red-500">
        {
          distribution.declined
        }
      </span>

      <ChevronRight className="h-3 w-3 text-muted-foreground" />
    </div>
  );
}


function formatDate(
  date: string,
) {
  return new Intl.DateTimeFormat(
    "en",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(
    new Date(
      `${date}T12:00:00`,
    ),
  );
}


function SessionCard({
  session,
  tone,
}: {
  session:
    ComparableSession;

  tone:
    | "violet"
    | "green";
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
        {formatDate(
          session.date,
        )}
      </p>

      <p className="mt-2 text-[11px] font-bold text-foreground">
        {
          session.workoutType
        }
      </p>

      <p className="mt-1 text-[9px] text-muted-foreground">
        {
          session.athletes
        }{" "}
        athlete response
        {session.athletes ===
        1
          ? ""
          : "s"}
      </p>

      <p className="mt-2 text-[8px] text-muted-foreground">
        Goal{" "}
        {session.goalAchievementPercentage !==
        null
          ? `${session.goalAchievementPercentage}%`
          : "—"}{" "}
        · Avg RPE{" "}
        {session.averageRpe !==
        null
          ? session.averageRpe.toFixed(
              1,
            )
          : "—"}
      </p>
    </section>
  );
}


export function SessionComparison() {
  const [
    data,
    setData,
  ] =
    useState<CoachCheckinData | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    swapped,
    setSwapped,
  ] =
    useState(false);

  useEffect(() => {
    let cancelled =
      false;

    async function load() {
      try {
        setLoading(
          true,
        );

        setError(
          null,
        );

        const result =
          await getCoachCheckinData();

        if (
          !cancelled
        ) {
          setData(
            result,
          );
        }
      } catch (
        loadError
      ) {
        console.error(
          "Could not load Session Comparison:",
          loadError,
        );

        if (
          !cancelled
        ) {
          setError(
            loadError instanceof
              Error
              ? loadError.message
              : "Could not load Session Comparison.",
          );
        }
      } finally {
        if (
          !cancelled
        ) {
          setLoading(
            false,
          );
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const sessions =
    useMemo(
      () =>
        buildComparableSessions(
          data?.checkins ??
            [],
        ),
      [data],
    );

  const selectedPair =
    useMemo(
      () =>
        selectBestComparablePair(
          sessions,
        ),
      [sessions],
    );

  const comparison =
    useMemo(
      () => {
        if (
          !selectedPair
        ) {
          return null;
        }

        return swapped
          ? compareSessionPair(
              selectedPair.sessionB,
              selectedPair.sessionA,
            )
          : compareSessionPair(
              selectedPair.sessionA,
              selectedPair.sessionB,
            );
      },
      [
        selectedPair,
        swapped,
      ],
    );

  if (
    loading
  ) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-semibold">
          Loading Session Comparison...
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Finding comparable sessions from athlete check-ins.
        </p>
      </div>
    );
  }

  if (
    error
  ) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-bold text-red-700">
          Session Comparison could not be loaded
        </p>

        <p className="mt-1 text-xs text-red-600">
          {error}
        </p>
      </div>
    );
  }

  if (
    !data ||
    data.athleteIds.length ===
      0
  ) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-bold">
          No athletes connected
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Connect athletes before comparing sessions.
        </p>
      </div>
    );
  }

  if (
    !comparison
  ) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-bold">
          No comparable session pair yet
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Session Comparison needs at least two completed dates with the same training type.
        </p>
      </div>
    );
  }

  const {
    sessionA,
    sessionB,
  } =
    comparison;

  return (
    <div className="space-y-3">
      <section className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-semibold text-muted-foreground">
            Comparing
          </span>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-[9px] font-semibold shadow-sm">
            <Users className="h-3.5 w-3.5 text-violet-600" />

            {
              sessionA.workoutType
            }
          </div>

          <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[8px] font-semibold text-violet-700">
            {
              comparison.athleteOverlap
            }{" "}
            athletes in both sessions
          </span>
        </div>

        <button
          type="button"
          onClick={() =>
            setSwapped(
              (
                current,
              ) =>
                !current,
            )
          }
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
                  Comparable sessions selected from real data
                </p>

                <p className="mt-0.5 text-[8px] text-muted-foreground">
                  Athletic IQ compares sessions with the same recorded training type and prefers pairs with overlapping athletes.
                </p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-[1fr_42px_1fr] items-center gap-3">
            <SessionCard
              session={
                sessionA
              }
              tone="violet"
            />

            <div className="grid h-10 w-10 place-items-center rounded-full border border-border bg-white text-xs font-bold shadow-sm">
              VS
            </div>

            <SessionCard
              session={
                sessionB
              }
              tone="green"
            />
          </div>

          <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            <div className="grid grid-cols-[1.35fr_0.8fr_0.8fr_0.62fr_0.82fr] gap-3 border-b border-border bg-muted/10 px-4 py-2.5 text-[8px] font-semibold text-muted-foreground">
              <span>
                Metric
              </span>

              <span>
                {formatDate(
                  sessionA.date,
                )}
              </span>

              <span>
                {formatDate(
                  sessionB.date,
                )}
              </span>

              <span>
                Change
              </span>

              <div>
                <p>
                  Athlete distribution
                </p>

                <p className="mt-0.5 text-[6px] font-normal">
                  improved / similar / declined
                </p>
              </div>
            </div>

            {comparison.comparisonSections.map(
              (
                section,
              ) => (
                <div
                  key={
                    section.title
                  }
                >
                  <div className="border-b border-border/60 bg-slate-50/50 px-4 py-2">
                    <div className="flex items-center gap-2">
                      <p
                        className={[
                          "text-[8px] font-bold",
                          section.tone ===
                          "orange"
                            ? "text-orange-600"
                            : section.tone ===
                                "green"
                              ? "text-green-600"
                              : "text-violet-600",
                        ].join(
                          " ",
                        )}
                      >
                        {
                          section.title
                        }
                      </p>

                      <p className="text-[8px] text-muted-foreground">
                        {
                          section.subtitle
                        }
                      </p>
                    </div>
                  </div>

                  {section.rows.map(
                    (
                      row,
                    ) => (
                      <div
                        key={
                          row.metric
                        }
                        className="grid w-full grid-cols-[1.35fr_0.8fr_0.8fr_0.62fr_0.82fr] items-center gap-3 border-b border-border/60 px-4 py-3 text-left last:border-b-0"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-semibold">
                            {
                              row.metric
                            }
                          </span>

                          <CircleHelp className="h-3 w-3 text-muted-foreground" />
                        </div>

                        <div>
                          <p className="text-[10px] font-bold text-violet-700">
                            {
                              row.sessionA
                            }
                          </p>

                          {row.sessionADetail && (
                            <p className="mt-0.5 text-[8px] text-muted-foreground">
                              {
                                row.sessionADetail
                              }
                            </p>
                          )}
                        </div>

                        <div>
                          <p className="text-[10px] font-bold text-green-700">
                            {
                              row.sessionB
                            }
                          </p>

                          {row.sessionBDetail && (
                            <p className="mt-0.5 text-[8px] text-muted-foreground">
                              {
                                row.sessionBDetail
                              }
                            </p>
                          )}
                        </div>

                        <span
                          className={`text-[8px] font-semibold ${row.changeStyle}`}
                        >
                          {
                            row.change
                          }
                        </span>

                        <AthleteDistribution
                          distribution={
                            row.distribution
                          }
                        />
                      </div>
                    ),
                  )}
                </div>
              ),
            )}

            <div className="flex items-start gap-2 bg-violet-50/30 px-4 py-2">
              <CircleHelp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-600" />

              <p className="text-[7px] leading-relaxed text-muted-foreground">
                All values come from athlete-reported post-training check-ins. Differences describe association between sessions, not proof that one factor caused another.
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
                {
                  comparison.interpretation
                }
              </p>

              <p className="mt-1 text-[8px] font-medium text-slate-700">
                Worth reviewing: whether the response difference was consistent across the overlapping athletes and whether relevant session context differed.
              </p>
            </div>

            <span className="shrink-0 rounded-xl border border-violet-200 bg-white px-3 py-2 text-[8px] font-semibold text-violet-700">Evidence shown above</span>
          </section>
        </main>

        <aside className="space-y-3">
          <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-violet-700">
                Session Context
              </h3>

              <span className="rounded-full bg-green-50 px-2 py-1 text-[7px] font-semibold text-green-700">
                Comparable type
              </span>
            </div>

            <div className="mt-3 space-y-2.5">
              {comparison.sharedContext.map(
                (
                  item,
                ) => (
                  <div
                    key={
                      item.label
                    }
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 text-[9px] font-bold text-green-600">
                        ✓
                      </span>

                      <span className="text-[8px] font-medium">
                        {
                          item.label
                        }
                      </span>
                    </div>

                    <span className="max-w-[110px] text-right text-[8px] text-muted-foreground">
                      {
                        item.value
                      }
                    </span>
                  </div>
                ),
              )}
            </div>
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
                  {
                    comparison.summary.outcome
                  }
                </p>
              </div>

              <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-3">
                <p className="text-[9px] font-bold text-orange-700">
                  Training response
                </p>

                <p className="mt-1 text-[8px] text-muted-foreground">
                  {
                    comparison.summary.demand
                  }
                </p>
              </div>

              <div className="rounded-xl border border-green-100 bg-green-50/40 p-3">
                <p className="text-[9px] font-bold text-green-700">
                  Reported context
                </p>

                <p className="mt-1 text-[8px] text-muted-foreground">
                  {
                    comparison.summary.context
                  }
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-violet-100 bg-violet-50/25 p-3 shadow-sm">
            <p className="text-[9px] font-bold text-violet-700">
              Evidence rule
            </p>

            <p className="mt-1 text-[8px] leading-relaxed text-muted-foreground">
              Athletic IQ compares recorded responses only. Coach context is still required before changing training.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
