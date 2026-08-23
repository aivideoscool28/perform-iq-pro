import { Link } from "@tanstack/react-router";

import { Clock, Dumbbell, Users } from "lucide-react";

export function TodaysTrainingCard() {
  return (
    <section className="w-full rounded-3xl border border-orange-100 bg-white px-6 py-4 shadow-sm">
      <div className="grid grid-cols-[1.15fr_1.35fr_0.7fr] items-center gap-6">

        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-orange-50">
            <Dumbbell className="h-7 w-7 text-orange-500" />
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-500">
              Today · 18:00
            </p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight">
              Sprint Acceleration
            </h2>

            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                Sprint / Hurdles
              </span>

              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                60 min
              </span>
            </div>
          </div>
        </div>

        <div className="border-l border-orange-100 pl-6">
          <div className="space-y-2 text-sm font-medium">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-orange-200" />
              <span>4 × 20m Block Starts</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-orange-200" />
              <span>4 × 30m Acceleration</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-orange-200" />
              <span>3 × Flying 30m</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Link
  to="/coach-manager/training"
  className="rounded-xl border border-orange-400 bg-white px-6 py-3 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
>
  View Training →
</Link>
        </div>

      </div>
    </section>
  );
}


