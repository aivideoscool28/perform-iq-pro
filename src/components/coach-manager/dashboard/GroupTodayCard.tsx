import { Link } from "@tanstack/react-router";

import {
  Activity,
  CircleAlert,
  TriangleAlert,
  Users,
} from "lucide-react";

const stats = [
  {
    label: "Athletes",
    value: "12",
    detail: "active today",
    icon: Users,
    circle: "bg-green-50 border-green-200",
    iconColor: "text-green-600",
  },
  {
    label: "Checked in",
    value: "9 / 12",
    detail: "3 not submitted",
    icon: Activity,
    circle: "bg-violet-50 border-violet-200",
    iconColor: "text-violet-500",
  },
  {
    label: "Need attention",
    value: "2",
    detail: "review before training",
    icon: TriangleAlert,
    circle: "bg-orange-50 border-orange-200",
    iconColor: "text-orange-500",
  },
  {
    label: "Questions",
    value: "1",
    detail: "waiting for reply",
    icon: CircleAlert,
    circle: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-500",
  },
];

export function GroupTodayCard() {
  return (
    <section className="rounded-2xl border border-border bg-background p-3 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">
            My Group Today
          </p>

          <h3 className="mt-1 text-base font-bold">
            Sprint / Hurdles
          </h3>
        </div>

        <Link
  to="/coach-manager/athletes"
  className="text-xs font-semibold text-orange-600"
>
  Open Group Overview →
</Link>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {stats.map(
          ({
            label,
            value,
            detail,
            icon: Icon,
            circle,
            iconColor,
          }) => (
            <div
              key={label}
              className="flex flex-col items-center text-center"
            >
              <div
                className={`grid h-10 w-10 place-items-center rounded-full border ${circle}`}
              >
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>

              <p className="mt-2 text-lg font-bold">
                {value}
              </p>

              <p className="text-[10px] font-medium text-foreground">
                {label}
              </p>

              <p className="mt-0.5 text-[8px] text-muted-foreground">
                {detail}
              </p>
            </div>
          ),
        )}
      </div>

      <div className="mt-3 rounded-xl border border-orange-100 bg-orange-50/40 px-3 py-2">
        <p className="text-[9px] font-semibold text-orange-700">
          2 athletes are worth reviewing before training.
        </p>

        <p className="mt-0.5 text-[8px] text-muted-foreground">
          Later, Layer 2 will determine this from evidence such as repeated changes,
          personal baseline, pain/body reports and training response.
        </p>
      </div>
    </section>
  );
}


