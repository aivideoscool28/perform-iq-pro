import {
  Activity,
  BatteryCharging,
  Brain,
  Gauge,
  MoonStar,
  MoveUpRight,
  Target,
  ThermometerSun,
  UserRound,
} from "lucide-react";

type DistributionRow = {
  label: string;
  detail: string;
  icon: typeof Activity;
  iconStyle: string;
  values: number[];
};

const checkinRows: DistributionRow[] = [
  {
    label: "RPE",
    detail: "How hard?",
    icon: Gauge,
    iconStyle: "bg-violet-50 text-violet-600",
    values: [6, 18, 34, 30, 12],
  },
  {
    label: "Expected Difficulty",
    detail: "Expected vs actual",
    icon: Activity,
    iconStyle: "bg-orange-50 text-orange-600",
    values: [8, 22, 36, 24, 10],
  },
  {
    label: "Performance Quality",
    detail: "Quality through session",
    icon: MoveUpRight,
    iconStyle: "bg-green-50 text-green-600",
    values: [7, 21, 32, 26, 14],
  },
  {
    label: "Goal Achievement",
    detail: "Main session goal",
    icon: Target,
    iconStyle: "bg-blue-50 text-blue-600",
    values: [6, 12, 22, 40, 20],
  },
  {
    label: "Physical Feeling",
    detail: "Body during training",
    icon: UserRound,
    iconStyle: "bg-violet-50 text-violet-600",
    values: [5, 15, 32, 30, 18],
  },
  {
    label: "Mental State",
    detail: "Focus & confidence",
    icon: Brain,
    iconStyle: "bg-pink-50 text-pink-600",
    values: [7, 16, 30, 28, 19],
  },
];

const regenerationRows: DistributionRow[] = [
  {
    label: "Sleep Quality",
    detail: "Last night",
    icon: MoonStar,
    iconStyle: "bg-violet-50 text-violet-600",
    values: [8, 18, 32, 26, 16],
  },
  {
    label: "Muscle Soreness",
    detail: "Freshness / soreness",
    icon: ThermometerSun,
    iconStyle: "bg-orange-50 text-orange-600",
    values: [6, 20, 30, 28, 16],
  },
  {
    label: "Energy Level",
    detail: "Overall energy",
    icon: BatteryCharging,
    iconStyle: "bg-green-50 text-green-600",
    values: [5, 17, 30, 29, 19],
  },
];

const barStyles = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-orange-100 text-orange-700",
  "bg-green-100 text-green-700",
  "bg-emerald-100 text-emerald-700",
];

function Distribution({
  row,
}: {
  row: DistributionRow;
}) {
  const Icon = row.icon;

  return (
    <div className="grid grid-cols-[150px_1fr_72px] items-center gap-3">
      <div className="flex items-center gap-2">
        <div
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${row.iconStyle}`}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>

        <div>
          <p className="text-[9px] font-semibold">{row.label}</p>
          <p className="text-[7px] text-muted-foreground">{row.detail}</p>
        </div>
      </div>

      <div className="flex h-5 overflow-hidden rounded-md">
        {row.values.map((value, index) => (
          <div
            key={`${row.label}-${index}`}
            style={{ width: `${value}%` }}
            className={`grid min-w-[24px] place-items-center text-[7px] font-semibold ${barStyles[index]}`}
          >
            {value}%
          </div>
        ))}
      </div>

      <div className="flex items-end gap-1">
        {[7, 9, 6, 10, 8, 11, 9].map((height, index) => (
          <span
            key={index}
            style={{ height: `${height}px` }}
            className={`w-1.5 rounded-full ${
              row.iconStyle.includes("orange")
                ? "bg-orange-400"
                : row.iconStyle.includes("green")
                  ? "bg-green-500"
                  : row.iconStyle.includes("pink")
                    ? "bg-pink-400"
                    : "bg-violet-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function AnalysisOverviewPanels() {
  return (
    <div className="grid grid-cols-[1fr_0.95fr_0.58fr] gap-3">
      <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold">
              Daily Check-In Overview
            </h3>

            <p className="mt-1 text-[8px] text-muted-foreground">
              Last 4 weeks · post-training responses
            </p>
          </div>

          <span className="text-[8px] font-medium text-muted-foreground">
            1 → 5 distribution
          </span>
        </div>

        <div className="mt-3 space-y-3">
          {checkinRows.map((row) => (
            <Distribution key={row.label} row={row} />
          ))}
        </div>

        <div className="mt-3 flex items-center gap-3 border-t border-border pt-2 text-[7px] text-muted-foreground">
          <span>1 = low / negative</span>
          <span>3 = middle</span>
          <span>5 = high / positive</span>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold">
              Regeneration Overview
            </h3>

            <p className="mt-1 text-[8px] text-muted-foreground">
              Last 4 weeks · morning recovery
            </p>
          </div>

          <span className="text-[8px] font-medium text-muted-foreground">
            1 → 5 distribution
          </span>
        </div>

        <div className="mt-4 space-y-5">
          {regenerationRows.map((row) => (
            <Distribution key={row.label} row={row} />
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-green-100 bg-green-50/40 p-3">
          <p className="text-[9px] font-semibold text-green-700">
            Recovery direction
          </p>

          <p className="mt-1 text-[8px] leading-relaxed text-muted-foreground">
            Sleep and energy have improved slightly across the selected period.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
        <h3 className="text-xs font-bold">Key Patterns</h3>

        <p className="mt-1 text-[8px] text-muted-foreground">
          Last 4 weeks
        </p>

        <div className="mt-3 space-y-2">
          {[
            {
              title: "RPE slightly lower",
              detail: "Average perceived effort decreased by 0.6.",
              style: "bg-violet-50 text-violet-600",
            },
            {
              title: "Goal achievement rising",
              detail: "More sessions were fully or partly achieved.",
              style: "bg-green-50 text-green-600",
            },
            {
              title: "Sleep improving",
              detail: "Average sleep quality increased by 0.3.",
              style: "bg-blue-50 text-blue-600",
            },
            {
              title: "Fewer pain reports",
              detail: "Four reports this week, one fewer than last week.",
              style: "bg-red-50 text-red-600",
            },
          ].map((item) => (
            <button
              key={item.title}
              type="button"
              className="flex w-full items-start gap-2 rounded-xl border border-border/70 p-2.5 text-left transition hover:bg-muted/20"
            >
              <div
                className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg ${item.style}`}
              >
                <MoveUpRight className="h-3.5 w-3.5" />
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-semibold">{item.title}</p>
                <p className="mt-0.5 text-[8px] leading-relaxed text-muted-foreground">
                  {item.detail}
                </p>
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="mt-3 text-[9px] font-semibold text-violet-600"
        >
          View all patterns →
        </button>
      </section>
    </div>
  );
}
