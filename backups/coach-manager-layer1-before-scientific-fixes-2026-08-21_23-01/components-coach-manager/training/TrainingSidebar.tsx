import {
  CalendarDays,
  Dumbbell,
  Gauge,
  HeartPulse,
  Trophy,
  Zap,
} from "lucide-react";

const week = [
  {
    day: "Mon 13",
    title: "Acceleration",
    group: "Sprint / Hurdles U20",
    time: "18:00",
    dot: "bg-orange-500",
    text: "text-orange-600",
  },
  {
    day: "Tue 14",
    title: "Speed Endurance",
    group: "Sprints U18",
    time: "17:00",
    dot: "bg-blue-500",
    text: "text-blue-600",
  },
  {
    day: "Wed 15",
    title: "Hurdle Technique",
    group: "Sprint / Hurdles U20",
    time: "18:00",
    dot: "bg-violet-500",
    text: "text-violet-600",
  },
  {
    day: "Thu 16",
    title: "Max Velocity",
    group: "Sprints U18",
    time: "17:00",
    dot: "bg-blue-500",
    text: "text-blue-600",
  },
  {
    day: "Fri 17",
    title: "Speed + Plyometrics",
    group: "Sprint / Hurdles U20",
    time: "18:00",
    dot: "bg-orange-500",
    text: "text-orange-600",
  },
];

const individualPlans = [
  {
    initials: "TK",
    name: "Tom Klein",
    plan: "Modified Acceleration",
    time: "Today · 18:00",
    badge: "bg-red-50 text-red-600",
    icon: HeartPulse,
  },
  {
    initials: "SB",
    name: "Sarah Braun",
    plan: "Reduced Sprint Volume",
    time: "Tomorrow · 17:00",
    badge: "bg-orange-50 text-orange-600",
    icon: Gauge,
  },
  {
    initials: "JR",
    name: "Jonas Richter",
    plan: "Individual Recovery Session",
    time: "Fri · 16:00",
    badge: "bg-green-50 text-green-600",
    icon: Zap,
  },
];

const recent = [
  {
    name: "Acceleration",
    group: "Sprint / Hurdles U20",
    date: "Today",
    icon: Gauge,
    badge: "bg-orange-500 text-white",
  },
  {
    name: "Speed Endurance",
    group: "Sprints U18",
    date: "Yesterday",
    icon: Zap,
    badge: "bg-blue-500 text-white",
  },
  {
    name: "Plyometrics + Strength",
    group: "Jumps U18",
    date: "2 days ago",
    icon: Dumbbell,
    badge: "bg-violet-500 text-white",
  },
];

export function TrainingSidebar() {
  return (
    <aside className="space-y-3">
      <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold">This Week</h3>

          <div className="grid h-7 w-7 place-items-center rounded-lg bg-orange-50">
            <CalendarDays className="h-3.5 w-3.5 text-orange-500" />
          </div>
        </div>

        <div className="mt-2">
          {week.map((session, index) => (
            <button
              key={`${session.day}-${session.title}`}
              type="button"
              className={[
                "grid w-full grid-cols-[42px_10px_1fr_auto] items-center gap-2 px-1 py-2 text-left transition hover:bg-muted/20",
                index !== week.length - 1 ? "border-b border-border/60" : "",
              ].join(" ")}
            >
              <p className="text-[8px] font-semibold text-muted-foreground">
                {session.day}
              </p>

              <span className={`h-2 w-2 rounded-full ${session.dot}`} />

              <div>
                <p className="text-[9px] font-semibold">{session.title}</p>
                <p className="text-[8px] text-muted-foreground">
                  {session.group}
                </p>
              </div>

              <p className={`text-[8px] font-semibold ${session.text}`}>
                {session.time}
              </p>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="mt-2 text-[9px] font-semibold text-orange-600"
        >
          View full calendar →
        </button>
      </section>

      <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-orange-50">
              <Trophy className="h-3.5 w-3.5 text-orange-500" />
            </div>

            <h3 className="text-xs font-bold">
              Individual Training Plans
            </h3>
          </div>

          <button className="text-[8px] font-semibold text-orange-600">
            View all →
          </button>
        </div>

        <div className="mt-2 space-y-1">
          {individualPlans.map((plan) => {
            const Icon = plan.icon;

            return (
              <button
                key={plan.name}
                type="button"
                className="flex w-full items-center gap-2 rounded-xl px-1.5 py-2 text-left transition hover:bg-muted/20"
              >
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-orange-50 text-[8px] font-bold text-orange-600">
                  {plan.initials}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-semibold">{plan.name}</p>
                  <p className="text-[8px] text-muted-foreground">
                    {plan.plan}
                  </p>
                </div>

                <p className="text-[7px] text-muted-foreground">
                  {plan.time}
                </p>

                <div className={`grid h-6 w-6 place-items-center rounded-lg ${plan.badge}`}>
                  <Icon className="h-3 w-3" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold">Recent Trainings</h3>

          <button className="text-[8px] font-semibold text-orange-600">
            View all →
          </button>
        </div>

        <div className="mt-2 space-y-1">
          {recent.map((training) => {
            const Icon = training.icon;

            return (
              <button
                key={training.name}
                type="button"
                className="flex w-full items-center gap-2.5 rounded-xl px-1.5 py-2 text-left transition hover:bg-muted/20"
              >
                <div
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${training.badge}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-semibold">
                    {training.name}
                  </p>

                  <p className="text-[8px] text-muted-foreground">
                    {training.group}
                  </p>
                </div>

                <p className="text-[7px] text-muted-foreground">
                  {training.date}
                </p>
              </button>
            );
          })}
        </div>
      </section>
    </aside>
  );
}
