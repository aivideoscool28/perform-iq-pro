import { TrendingDown, TrendingUp, Minus } from "lucide-react";

type RpeCheckin = {
  checkin_date: string;
  is_rest_day?: boolean | null;
  discipline?: string | null;
  rpe?: number | null;

  expected_difficulty?: string | null;
  performance_quality?: string | null;
  session_goal_achieved?: string | null;
  physical_feeling?: number | null;
  has_pain?: boolean | null;
  performance_factors?: string[] | null;

  ai_summary?: string | null;
};

type Props = {
  checkins: RpeCheckin[];
};

export function RpeTrendChart({ checkins }: Props) {
  const trainingCheckins = checkins
    .filter(
      (checkin) =>
        !checkin.is_rest_day &&
        typeof checkin.rpe === "number",
    )
    .sort(
      (a, b) =>
        new Date(a.checkin_date).getTime() -
        new Date(b.checkin_date).getTime(),
    );

  const points = trainingCheckins.slice(-5);

  if (points.length < 3) {
    return null;
  }

  const latest = points[points.length - 1];
  const previous = points[points.length - 2];

  const latestRpe = latest.rpe as number;
  const previousRpe = previous.rpe as number;

  const trend =
    latestRpe > previousRpe
      ? "steigend"
      : latestRpe < previousRpe
        ? "fallend"
        : "stabil";

  const latestDate = new Date(
    `${latest.checkin_date}T12:00:00`,
  );

  const sevenDaysAgo = new Date(latestDate);
  sevenDaysAgo.setDate(latestDate.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const sevenDayCheckins = trainingCheckins.filter((checkin) => {
    const date = new Date(
      `${checkin.checkin_date}T12:00:00`,
    );

    return date >= sevenDaysAgo && date <= latestDate;
  });

  const averageRpe =
    sevenDayCheckins.length >= 2
      ? sevenDayCheckins.reduce(
          (sum, checkin) =>
            sum + (checkin.rpe as number),
          0,
        ) / sevenDayCheckins.length
      : null;

  const averageRpeText =
    averageRpe !== null
      ? averageRpe.toFixed(1).replace(".", ",")
      : null;

  const hardSessions = sevenDayCheckins.filter(
    (checkin) => (checkin.rpe as number) >= 8,
  ).length;

  const harderThanExpected = sevenDayCheckins.filter(
    (checkin) =>
      checkin.expected_difficulty === "Schwerer als erwartet" ||
      checkin.expected_difficulty === "Deutlich schwerer als erwartet",
  ).length;

  const asExpected = sevenDayCheckins.filter(
    (checkin) =>
      checkin.expected_difficulty === "Wie erwartet",
  ).length;

  const decliningPerformance = sevenDayCheckins.filter(
    (checkin) =>
      checkin.performance_quality === "Etwas abgefallen" ||
      checkin.performance_quality === "Stark abgefallen",
  ).length;

  const stableOrImprovedPerformance = sevenDayCheckins.filter(
    (checkin) =>
      checkin.performance_quality === "Stabil geblieben" ||
      checkin.performance_quality === "Besser geworden",
  ).length;

  const achievedGoals = sevenDayCheckins.filter(
    (checkin) =>
      checkin.session_goal_achieved === "Ja",
  ).length;

  const painSessions = sevenDayCheckins.filter(
    (checkin) => checkin.has_pain === true,
  ).length;

  const lowPhysicalFeelingSessions = sevenDayCheckins.filter(
    (checkin) =>
      typeof checkin.physical_feeling === "number" &&
      checkin.physical_feeling <= 2,
  ).length;

  let contextualInsight: string | null = null;

  if (averageRpe !== null) {
    const intro =
      `Dein durchschnittliches RPE der letzten 7 Tage liegt bei ${averageRpeText}/10` +
      (
        hardSessions > 0
          ? `; ${hardSessions} ${hardSessions === 1 ? "Einheit lag" : "Einheiten lagen"} bei RPE 8 oder höher.`
          : "."
      );

    if (
      painSessions > 0 &&
      (harderThanExpected > 0 || decliningPerformance > 0)
    ) {
      contextualInsight =
        `${intro} Gleichzeitig wurden Beschwerden gemeldet und mindestens eine Einheit war schwerer als erwartet oder die Leistungsqualität fiel ab. ` +
        `Diese Kombination erklärt das RPE nicht sicher, ist aber ein Signal, das du in den nächsten vergleichbaren Einheiten beobachten solltest. Achte darauf, ob Beschwerden, unerwartet hohe Anstrengung und Leistungsabfall erneut gemeinsam auftreten.`;
    } else if (
      harderThanExpected > 0 &&
      decliningPerformance > 0
    ) {
      contextualInsight =
        `${intro} ${harderThanExpected} ${harderThanExpected === 1 ? "Einheit war" : "Einheiten waren"} schwerer als erwartet und in ${decliningPerformance} ${decliningPerformance === 1 ? "Einheit nahm" : "Einheiten nahm"} die Leistungsqualität ab. ` +
        `Das kann darauf hindeuten, dass sich ein Teil deiner letzten Einheiten anspruchsvoller entwickelt hat als geplant. Beobachte beim nächsten vergleichbaren Training, ob RPE wieder höher als erwartet ausfällt und ob deine Leistung dabei stabil bleibt.`;
    } else if (harderThanExpected >= 2) {
      contextualInsight =
        `${intro} Auffällig ist, dass ${harderThanExpected} Einheiten schwerer als erwartet waren. ` +
        `Damit lag die wahrgenommene Trainingshärte zuletzt mehrfach über deiner eigenen Erwartung. Prüfe in den nächsten Einheiten besonders, ob sich dieses Muster wiederholt und wie sich deine Leistungsqualität dazu entwickelt.`;
    } else if (
      averageRpe >= 7 &&
      asExpected >= 1 &&
      stableOrImprovedPerformance >= 1 &&
      harderThanExpected === 0
    ) {
      contextualInsight =
        `${intro} Die anspruchsvolleren Einheiten wurden nicht als überraschend schwer eingeordnet und deine Leistungsqualität blieb mindestens einmal stabil oder verbesserte sich. ` +
        `Das passt eher zu bewusst hartem Training als zu einem klaren Warnsignal. Beobachte, ob diese Kombination aus hoher Anstrengung und stabiler Leistung bestehen bleibt.`;
    } else if (lowPhysicalFeelingSessions > 0) {
      contextualInsight =
        `${intro} In ${lowPhysicalFeelingSessions} ${lowPhysicalFeelingSessions === 1 ? "Einheit wurde" : "Einheiten wurde"} gleichzeitig ein niedriges körperliches Gefühl gemeldet. ` +
        `Das kann für die Einordnung relevant sein, beweist aber nicht die Ursache des hohen RPE. Beobachte, ob niedriges Körpergefühl und höheres RPE in vergleichbaren Sessions wieder gemeinsam auftreten.`;
    } else if (
      achievedGoals >= 2 &&
      harderThanExpected === 0
    ) {
      contextualInsight =
        `${intro} Gleichzeitig wurde das Trainingsziel in ${achievedGoals} Einheiten erreicht und keine Einheit wurde als schwerer als erwartet bewertet. ` +
        `Damit gibt es aus diesen Check-Ins derzeit kein klares Signal, dass das höhere RPE problematisch war. Beobachte weiter, ob Zielerreichung und Leistungsqualität auch bei anspruchsvollen Einheiten stabil bleiben.`;
    } else {
      contextualInsight =
        `${intro} Aus den vorhandenen Check-Ins ergibt sich noch kein eindeutiges Muster, das erklärt, warum die Einheiten so anstrengend wahrgenommen wurden. ` +
        `Achte in den nächsten vergleichbaren Sessions besonders darauf, ob hohes RPE zusammen mit unerwarteter Schwierigkeit, sinkender Leistungsqualität, Beschwerden oder schlechtem Körpergefühl auftritt.`;
    }
  }

  const width = 760;
  const height = 255;

  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 28;
  const paddingBottom = 62;

  const chartWidth =
    width - paddingLeft - paddingRight;

  const chartHeight =
    height - paddingTop - paddingBottom;

  const xForIndex = (index: number) =>
    paddingLeft +
    (index / (points.length - 1)) * chartWidth;

  const yForRpe = (rpe: number) =>
    paddingTop +
    ((10 - rpe) / 10) * chartHeight;

  const linePoints = points
    .map(
      (point, index) =>
        `${xForIndex(index)},${yForRpe(
          point.rpe as number,
        )}`,
    )
    .join(" ");

  const areaPoints = [
    `${xForIndex(0)},${paddingTop + chartHeight}`,
    ...points.map(
      (point, index) =>
        `${xForIndex(index)},${yForRpe(
          point.rpe as number,
        )}`,
    ),
    `${xForIndex(points.length - 1)},${paddingTop + chartHeight}`,
  ].join(" ");

  return (
    <section className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight">
            RPE der letzten Einheiten
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Wahrgenommene Trainingshärte · 1 = sehr leicht · 10 = maximal
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <div>
            <div className="text-xs font-medium text-muted-foreground">
              Letzte Einheit
            </div>

            <div className="mt-1 flex items-baseline">
              <span className="text-3xl font-black text-[#ff6b35]">
                {latestRpe}
              </span>

              <span className="text-lg font-semibold text-muted-foreground">
                /10
              </span>
            </div>
          </div>

          <div className="h-12 w-px bg-border" />

          <div>
            <div className="text-xs font-medium text-muted-foreground">
              Ø 7 Tage
            </div>

            <div className="mt-1 flex items-baseline">
              {averageRpeText ? (
                <>
                  <span className="text-3xl font-black">
                    {averageRpeText}
                  </span>

                  <span className="text-lg font-semibold text-muted-foreground">
                    /10
                  </span>
                </>
              ) : (
                <span className="text-sm font-semibold text-muted-foreground">
                  Noch zu wenig Daten
                </span>
              )}
            </div>
          </div>

          <div className="h-12 w-px bg-border" />

          <div>
            <div className="text-xs font-medium text-muted-foreground">
              Trend
            </div>

            <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
              {trend === "steigend" ? (
                <TrendingUp className="h-5 w-5 text-[#ff6b35]" />
              ) : trend === "fallend" ? (
                <TrendingDown className="h-5 w-5 text-[#ff6b35]" />
              ) : (
                <Minus className="h-5 w-5 text-muted-foreground" />
              )}

              <span>{trend}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-[255px] w-full min-w-[620px]"
          role="img"
          aria-label="RPE-Verlauf der letzten Trainingseinheiten"
        >
          <defs>
            <linearGradient
              id="rpe-area-gradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#ff6b35"
                stopOpacity="0.14"
              />

              <stop
                offset="100%"
                stopColor="#ff6b35"
                stopOpacity="0.01"
              />
            </linearGradient>
          </defs>

          {[0, 2, 4, 6, 8, 10].map((value) => {
            const y = yForRpe(value);

            return (
              <g key={value}>
                <line
                  x1={paddingLeft}
                  x2={width - paddingRight}
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  className="text-border"
                  strokeWidth="1"
                  strokeDasharray={
                    value === 0 ? undefined : "3 4"
                  }
                />

                <text
                  x={paddingLeft - 15}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-muted-foreground text-[11px]"
                >
                  {value}
                </text>
              </g>
            );
          })}

          <polygon
            points={areaPoints}
            fill="url(#rpe-area-gradient)"
          />

          <polyline
            points={linePoints}
            fill="none"
            stroke="#ff6b35"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point, index) => {
            const x = xForIndex(index);
            const y = yForRpe(point.rpe as number);

            const date = new Date(
              `${point.checkin_date}T12:00:00`,
            ).toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "2-digit",
            });

            return (
              <g key={`${point.checkin_date}-${index}`}>
                <circle
                  cx={x}
                  cy={y}
                  r="7"
                  fill="#ff6b35"
                  stroke="white"
                  strokeWidth="2"
                />

                <text
                  x={x}
                  y={y - 14}
                  textAnchor="middle"
                  className="fill-foreground text-[13px] font-bold"
                >
                  {point.rpe}
                </text>

                <text
                  x={x}
                  y={height - 31}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[11px]"
                >
                  {date}
                </text>

                <text
                  x={x}
                  y={height - 10}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[11px]"
                >
                  {point.discipline ?? "Training"}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {contextualInsight && (
        <div className="mt-5 rounded-2xl border border-border bg-muted/30 p-4">
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Einordnung der letzten 7 Tage
          </div>

          <p className="mt-2 text-sm leading-relaxed">
            {contextualInsight}
          </p>
        </div>
      )}
    </section>
  );
}

