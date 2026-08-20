import {
  CalendarClock,
  ClipboardCheck,
  MessageCircle,
  RefreshCw,
} from "lucide-react";

const actions = [
  {
    title: "3 athletes may need review",
    detail: "Pain, fatigue or meaningful change",
    icon: ClipboardCheck,
    iconBox: "bg-red-50",
    iconColor: "text-red-600",
  },
  {
    title: "2 training adjustments suggested",
    detail: "Based on current athlete context",
    icon: RefreshCw,
    iconBox: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    title: "7 check-ins are missing",
    detail: "You could remind these athletes",
    icon: CalendarClock,
    iconBox: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  {
    title: "2 athlete questions waiting",
    detail: "Open and respond when useful",
    icon: MessageCircle,
    iconBox: "bg-blue-50",
    iconColor: "text-blue-600",
  },
];

export function CoachActionCenter() {
  return (
    <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold">
            Coach Action Center
          </h3>

          <p className="mt-1 text-[9px] leading-relaxed text-muted-foreground">
            AI suggestions for what you can do today.
          </p>
        </div>

        <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[9px] font-bold text-orange-600">
          4
        </span>
      </div>

      <div className="mt-3 space-y-1.5">
        {actions.map(
          ({
            title,
            detail,
            icon: Icon,
            iconBox,
            iconColor,
          }) => (
            <button
              key={title}
              type="button"
              className="flex w-full items-center gap-2.5 rounded-xl border border-border/70 bg-white px-2.5 py-2 text-left transition hover:bg-muted/20"
            >
              <div
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${iconBox}`}
              >
                <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold leading-tight">
                  {title}
                </p>

                <p className="mt-0.5 text-[8px] leading-tight text-muted-foreground">
                  {detail}
                </p>
              </div>

              <span className="text-xs text-muted-foreground">
                →
              </span>
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        className="mt-2.5 w-full text-center text-[9px] font-semibold text-orange-600"
      >
        View all suggestions →
      </button>
    </section>
  );
}
