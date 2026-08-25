import { TrendingUp } from "lucide-react";

const developments = [
  {
    athlete: "Anna",
    title: "Hurdle rhythm improving",
    label: "TECHNIQUE",
    style: "bg-blue-50 border-blue-100",
    badge: "bg-blue-100 text-blue-600",
  },
  {
    athlete: "Max",
    title: "Acceleration still inconsistent",
    label: "PERFORMANCE",
    style: "bg-orange-50 border-orange-100",
    badge: "bg-orange-100 text-orange-600",
  },
  {
    athlete: "Leon",
    title: "Strong recent sprint sessions",
    label: "PROGRESS",
    style: "bg-violet-50 border-violet-100",
    badge: "bg-violet-100 text-violet-600",
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
          <h3 className="mt-1 text-base font-bold">What changed</h3>
        </div>

        <div className="grid h-8 w-8 place-items-center rounded-xl bg-orange-50">
          <TrendingUp className="h-4 w-4 text-orange-500" />
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {developments.map((item) => (
          <button
            key={`${item.athlete}-${item.title}`}
            type="button"
            className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left ${item.style}`}
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold">{item.athlete}</p>

                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${item.badge}`}>
                  {item.label}
                </span>
              </div>

              <p className="mt-1 text-xs font-medium">{item.title}</p>
            </div>

            <span className="text-muted-foreground">→</span>
          </button>
        ))}
      </div>
    </section>
  );
}
