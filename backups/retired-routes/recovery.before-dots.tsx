import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  BatteryCharging,
  Loader2,
  MoonStar,
  Activity,
} from "lucide-react";

import { AppShell } from "@/components/athleticiq/AppShell";
import { fetchRegenerationHistory } from "@/lib/features/regeneration.functions";

export const Route = createFileRoute("/recovery/before-dots")({
  component: Page,
});

type RegenerationEntry = {
  checkin_date: string;
  sleep_quality: number;
  muscle_soreness: number;
  energy_level: number;
};

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    },
  );
}

function Page() {
  const fetchHistory =
    useServerFn(fetchRegenerationHistory);

  const { data, isLoading, error } = useQuery({
    queryKey: ["regeneration-history"],
    queryFn: () => fetchHistory(),
  });

  const history = [
    ...((data?.regeneration ?? []) as RegenerationEntry[]),
  ].sort((a, b) =>
    a.checkin_date.localeCompare(b.checkin_date),
  );

  const latest =
    history.length > 0
      ? history[history.length - 1]
      : null;

  const metrics = [
    {
      label: "Sleep Quality",
      value: latest?.sleep_quality ?? null,
      icon: MoonStar,
      style: "bg-violet-50 text-violet-600",
    },
    {
      label: "Muscle Freshness",
      value: latest?.muscle_soreness ?? null,
      icon: Activity,
      style: "bg-orange-50 text-orange-600",
    },
    {
      label: "Energy Level",
      value: latest?.energy_level ?? null,
      icon: BatteryCharging,
      style: "bg-green-50 text-green-600",
    },
  ];

  const graphWidth = 700;
  const graphHeight = 220;

  function createPoints(
    getValue: (entry: RegenerationEntry) => number,
  ) {
    return history.map((entry, index) => {
      const x =
        history.length <= 1
          ? graphWidth / 2
          : (index / (history.length - 1)) *
            graphWidth;

      const value = getValue(entry);

      const y =
        graphHeight -
        ((value - 1) / 4) * graphHeight;

      return {
        x,
        y,
        value,
        date: entry.checkin_date,
      };
    });
  }

  const sleepPoints = createPoints(
    (entry) => entry.sleep_quality,
  );

  const freshnessPoints = createPoints(
    (entry) => entry.muscle_soreness,
  );

  const energyPoints = createPoints(
    (entry) => entry.energy_level,
  );

  function polyline(
    points: ReturnType<typeof createPoints>,
  ) {
    return points
      .map((point) => `${point.x},${point.y}`)
      .join(" ");
  }

  const dateLabels =
    history.length <= 5
      ? history
      : [
          history[0],
          history[
            Math.floor(
              (history.length - 1) * 0.25,
            )
          ],
          history[
            Math.floor(
              (history.length - 1) * 0.5,
            )
          ],
          history[
            Math.floor(
              (history.length - 1) * 0.75,
            )
          ],
          history[history.length - 1],
        ];

  if (isLoading) {
    return (
      <AppShell
        title="Regeneration"
        subtitle="Track how your body feels over time"
      >
        <div className="grid place-items-center py-24">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Regeneration"
      subtitle="Track how your body feels over time"
      breadcrumbs={[
        {
          label: "Dashboard",
          to: "/",
        },
        {
          label: "Regeneration",
        },
      ]}
    >
      <div className="space-y-5">

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Regeneration data could not be loaded.
          </div>
        )}

        <section>
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Latest check-in
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Your regeneration
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {metrics.map(
              ({
                label,
                value,
                icon: Icon,
                style,
              }) => (
                <article
                  key={label}
                  className="rounded-2xl border border-border bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`grid h-11 w-11 place-items-center rounded-full ${style}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        {label}
                      </p>

                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-2xl font-bold">
                          {value ?? "—"}
                        </span>

                        <span className="text-xs text-muted-foreground">
                          /5
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Regeneration trend
              </p>

              <h2 className="mt-1 text-lg font-bold">
                Last 30 check-ins
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Higher values represent better reported regeneration.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-xs font-medium">
              <span className="text-violet-600">
                ● Sleep
              </span>

              <span className="text-orange-500">
                ● Muscle Freshness
              </span>

              <span className="text-green-600">
                ● Energy
              </span>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="grid min-h-[280px] place-items-center">
              <div className="text-center">
                <p className="font-semibold">
                  No regeneration history yet
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Complete your first regeneration check-in
                  to start building your trend.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-7">
              <div className="flex">
                <div className="flex h-[220px] w-7 flex-col justify-between pb-0 text-[10px] text-muted-foreground">
                  {[5, 4, 3, 2, 1].map(
                    (value) => (
                      <span key={value}>
                        {value}
                      </span>
                    ),
                  )}
                </div>

                <div className="relative h-[220px] flex-1">
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {[5, 4, 3, 2, 1].map(
                      (value) => (
                        <div
                          key={value}
                          className="border-t border-border/60"
                        />
                      ),
                    )}
                  </div>

                  <svg
                    viewBox={`0 0 ${graphWidth} ${graphHeight}`}
                    preserveAspectRatio="none"
                    className="absolute inset-0 h-full w-full overflow-visible"
                  >
                    <polyline
                      points={polyline(sleepPoints)}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                      className="text-violet-600"
                    />

                    <polyline
                      points={polyline(freshnessPoints)}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                      className="text-orange-500"
                    />

                    <polyline
                      points={polyline(energyPoints)}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                      className="text-green-600"
                    />
                  </svg>
                </div>
              </div>

              <div className="ml-7 mt-3 flex justify-between text-[10px] text-muted-foreground">
                {dateLabels.map(
                  (entry, index) => (
                    <span
                      key={`${entry.checkin_date}-${index}`}
                    >
                      {formatDate(
                        entry.checkin_date,
                      )}
                    </span>
                  ),
                )}
              </div>
            </div>
          )}
        </section>

        <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            These values are based on your own daily
            regeneration check-ins. They help you and your
            coach understand changes over time.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
