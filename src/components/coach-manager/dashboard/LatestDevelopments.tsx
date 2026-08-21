import {
  CircleAlert,
  TrendingUp,
} from "lucide-react";

const developments = [
  {
    athlete: "Max",
    title: "Acceleration still inconsistent",
    detail: "Repeated across recent comparable sessions",
    priority: "Needs attention",
    icon: CircleAlert,
    style: "bg-orange-50 border-orange-100",
    badge: "bg-orange-100 text-orange-700",
    iconStyle: "bg-orange-100 text-orange-600",
  },
  {
    athlete: "Sophie",
    title: "Regeneration signals below recent normal",
    detail: "Repeated across recent check-ins",
    priority: "Needs attention",
    icon: CircleAlert,
    style: "bg-orange-50/70 border-orange-100",
    badge: "bg-orange-100 text-orange-700",
    iconStyle: "bg-orange-100 text-orange-600",
  },
  {
    athlete: "Anna",
    title: "Hurdle rhythm improving",
    detail: "Positive development across recent sessions",
    priority: "Developing",
    icon: TrendingUp,
    style: "bg-green-50/60 border-green-100",
    badge: "bg-green-100 text-green-700",
    iconStyle: "bg-green-100 text-green-600",
  },
  {
    athlete: "Leon",
    title: "Strong recent sprint sessions",
    detail: "Positive trend across recent comparable sessions",
    priority: "Developing",
    icon: TrendingUp,
    style: "bg-violet-50/60 border-violet-100",
    badge: "bg-violet-100 text-violet-700",
    iconStyle: "bg-violet-100 text-violet-600",
  },
];

export function LatestDevelopments() {
  return (
    <section className="rounded-2xl border border-border bg-background p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">
            Latest Developments
          </p>

          <h3 className="mt-1 text-base font-bold">
            What changed
          </h3>
        </div>

        <div className="grid h-8 w-8 place-items-center rounded-xl bg-orange-50">
          <TrendingUp className="h-4 w-4 text-orange-500" />
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {developments.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={`${item.athlete}-${item.title}`}
              type="button"
              className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition hover:shadow-sm ${item.style}`}
            >
              <div
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${item.iconStyle}`}
              >
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold">
                    {item.athlete}
                  </p>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[8px] font-bold ${item.badge}`}
                  >
                    {item.priority}
                  </span>
                </div>

                <p className="mt-1 text-xs font-medium">
                  {item.title}
                </p>

                <p className="mt-0.5 text-[9px] text-muted-foreground">
                  {item.detail}
                </p>
              </div>

              <span className="text-sm text-muted-foreground">
                →
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
