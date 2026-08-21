import {
  Activity,
  CalendarDays,
  CircleCheck,
  HeartPulse,
  Sparkles,
  Target,
} from "lucide-react";

const painAreas = [
  { label: "Hamstring", value: 3, style: "bg-red-500" },
  { label: "Knee", value: 2, style: "bg-orange-500" },
  { label: "Calf", value: 1, style: "bg-yellow-500" },
  { label: "Achilles", value: 1, style: "bg-green-500" },
  { label: "Other", value: 1, style: "bg-slate-300" },
];

export function AnalysisBottomPanels() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[0.9fr_0.9fr_1.1fr] gap-3">
        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <h3 className="text-xs font-bold">
            Pain & Soreness Distribution
          </h3>

          <p className="mt-1 text-[8px] text-muted-foreground">
            Last 4 weeks
          </p>

          <div className="mt-4 flex items-center gap-4">
            <div className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full bg-[conic-gradient(#ef4444_0deg_90deg,#f97316_90deg_180deg,#eab308_180deg_225deg,#22c55e_225deg_270deg,#cbd5e1_270deg_360deg)]">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-white text-center">
                <div>
                  <p className="text-[8px] text-muted-foreground">
                    Reports
                  </p>
                  <p className="text-xl font-bold">8</p>
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              {painAreas.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${item.style}`} />
                    <span className="text-[8px] font-medium">
                      {item.label}
                    </span>
                  </div>

                  <span className="text-[8px] text-muted-foreground">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 rounded-xl bg-blue-50/60 p-2.5 text-[8px] text-blue-700">
            Hamstring and knee are the most frequently reported areas.
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <h3 className="text-xs font-bold">Best & Worst Days</h3>

          <p className="mt-1 text-[8px] text-muted-foreground">
            Last 4 weeks · team averages
          </p>

          <div className="mt-3 rounded-xl border border-green-100 bg-green-50/40 p-3">
            <div className="flex items-center gap-2">
              <CircleCheck className="h-4 w-4 text-green-600" />

              <div>
                <p className="text-[8px] font-semibold text-green-700">
                  Best day
                </p>

                <p className="text-sm font-bold">Wed, 4 Jun</p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <div>
                <p className="text-[7px] text-muted-foreground">RPE</p>
                <p className="text-sm font-bold">5.8</p>
              </div>

              <div>
                <p className="text-[7px] text-muted-foreground">Sleep</p>
                <p className="text-sm font-bold">3.9</p>
              </div>

              <div>
                <p className="text-[7px] text-muted-foreground">Energy</p>
                <p className="text-sm font-bold">4.2</p>
              </div>
            </div>
          </div>

          <div className="mt-2 rounded-xl border border-red-100 bg-red-50/40 p-3">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-red-500" />

              <div>
                <p className="text-[8px] font-semibold text-red-600">
                  Most demanding day
                </p>

                <p className="text-sm font-bold">Fri, 16 May</p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <div>
                <p className="text-[7px] text-muted-foreground">RPE</p>
                <p className="text-sm font-bold">7.2</p>
              </div>

              <div>
                <p className="text-[7px] text-muted-foreground">Sleep</p>
                <p className="text-sm font-bold">2.8</p>
              </div>

              <div>
                <p className="text-[7px] text-muted-foreground">Energy</p>
                <p className="text-sm font-bold">3.1</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <h3 className="text-xs font-bold">At a Glance</h3>

          <p className="mt-1 text-[8px] text-muted-foreground">
            Last 4 weeks
          </p>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {[
              {
                value: "28",
                label: "Check-ins",
                detail: "per athlete Ø",
                icon: CalendarDays,
                style: "bg-violet-50 text-violet-600",
              },
              {
                value: "4.6",
                label: "Sessions",
                detail: "per athlete Ø",
                icon: Activity,
                style: "bg-orange-50 text-orange-600",
              },
              {
                value: "81%",
                label: "Goal achieved",
                detail: "average",
                icon: Target,
                style: "bg-green-50 text-green-600",
              },
              {
                value: "3.1",
                label: "Pain score",
                detail: "frequency Ø",
                icon: HeartPulse,
                style: "bg-red-50 text-red-600",
              },
            ].map(({ value, label, detail, icon: Icon, style }) => (
              <div key={label}>
                <div className={`grid h-8 w-8 place-items-center rounded-full ${style}`}>
                  <Icon className="h-4 w-4" />
                </div>

                <p className="mt-2 text-lg font-bold">{value}</p>
                <p className="text-[8px] font-semibold">{label}</p>
                <p className="text-[7px] text-muted-foreground">{detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50/70 via-white to-orange-50/40 p-3 shadow-sm">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-100">
          <Sparkles className="h-4 w-4 text-violet-600" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-violet-700">
            AI Coach Insight
          </p>

          <p className="mt-1 text-[9px] leading-relaxed text-muted-foreground">
            Recovery is improving slightly while perceived training difficulty
            remains stable. Speed-endurance sessions may be worth reviewing
            more closely because athletes report more fatigue afterward.
          </p>
        </div>

        <button
          type="button"
          className="rounded-xl border border-violet-200 bg-white px-3 py-2 text-[9px] font-semibold text-violet-600"
        >
          Open AI report →
        </button>
      </section>
    </div>
  );
}
