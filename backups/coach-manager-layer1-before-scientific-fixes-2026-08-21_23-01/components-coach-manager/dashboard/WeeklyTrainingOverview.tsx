const sessions = [
  {
    day: "Mon",
    name: "Sprint Intervals",
    time: "12:15 - 13:15",
    tag: "Sprint",
    tagStyle: "bg-orange-100 text-orange-600",
  },
  {
    day: "Tue",
    name: "Strength Training",
    time: "17:30 - 18:30",
    tag: "Strength",
    tagStyle: "bg-violet-100 text-violet-600",
  },
  {
    day: "Wed",
    name: "Hurdle Technique",
    time: "17:00 - 18:00",
    tag: "Hurdles",
    tagStyle: "bg-blue-100 text-blue-600",
  },
  {
    day: "Fri",
    name: "Block Starts",
    time: "16:30 - 17:30",
    tag: "Sprint",
    tagStyle: "bg-orange-100 text-orange-600",
  },
];

export function WeeklyTrainingOverview() {
  return (
    <section className="h-full rounded-2xl border border-border bg-background p-3 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-muted-foreground">
          This Week
        </p>
        <h3 className="mt-1 text-base font-bold">
          Upcoming sessions
        </h3>
      </div>

      <div className="mt-3 space-y-2">
        {sessions.map((session) => (
          <div
            key={`${session.day}-${session.name}`}
            className="rounded-xl border border-border/70 bg-muted/15 px-3 py-2"
          >
            <div className="flex items-start gap-2">
              <div className="w-8 shrink-0 text-xs font-bold text-muted-foreground">
                {session.day}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold">{session.name}</p>

                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="text-[10px] text-muted-foreground">
                    {session.time}
                  </p>

                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${session.tagStyle}`}>
                    {session.tag}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-3 text-xs font-semibold text-orange-600"
      >
        Go to Training Plan →
      </button>
    </section>
  );
}
