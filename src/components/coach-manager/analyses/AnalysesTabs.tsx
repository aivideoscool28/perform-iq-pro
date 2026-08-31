import {
  Activity,
  CalendarCheck,
  GitCompareArrows,
  LineChart,
  MoonStar,
  RefreshCw,
} from "lucide-react";

export type AnalysisTab =
  | "overview"
  | "checkin"
  | "regeneration"
  | "training-response"
  | "session-comparison"
  | "trends";

const tabs = [
  {
    id: "overview" as const,
    label: "Overview",
    detail: "Team summary",
    icon: Activity,
  },
  {
    id: "checkin" as const,
    label: "Check-In Analysis",
    detail: "Post-training deep dive",
    icon: CalendarCheck,
  },
  {
    id: "regeneration" as const,
    label: "Regeneration Analysis",
    detail: "Recovery & wellness",
    icon: MoonStar,
  },
  {
    id: "training-response" as const,
    label: "Training Response",
    detail: "How athletes respond",
    icon: RefreshCw,
  },
  {
    id: "session-comparison" as const,
    label: "Session Comparison",
    detail: "Compare session types",
    icon: GitCompareArrows,
  },
  {
    id: "trends" as const,
    label: "Trends Over Time",
    detail: "Long-term patterns",
    icon: LineChart,
  },
];

type AnalysesTabsProps = {
  activeTab: AnalysisTab;
  onTabChange: (tab: AnalysisTab) => void;
};

export function AnalysesTabs({
  activeTab,
  onTabChange,
}: AnalysesTabsProps) {
  return (
    <nav className="grid grid-cols-6 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      {tabs.map(({ id, label, detail, icon: Icon }) => {
        const active = id === activeTab;

        return (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            className={[
              "flex min-w-0 items-center gap-2.5 border-r border-border/60 px-3 py-3 text-left transition last:border-r-0",
              active
                ? "bg-violet-50 text-violet-700"
                : "hover:bg-muted/20",
            ].join(" ")}
          >
            <div
              className={[
                "grid h-8 w-8 shrink-0 place-items-center rounded-xl",
                active ? "bg-violet-100" : "bg-muted/50",
              ].join(" ")}
            >
              <Icon
                className={[
                  "h-4 w-4",
                  active
                    ? "text-violet-600"
                    : "text-muted-foreground",
                ].join(" ")}
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold">
                {label}
              </p>

              <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                {detail}
              </p>
            </div>
          </button>
        );
      })}
    </nav>
  );
}

