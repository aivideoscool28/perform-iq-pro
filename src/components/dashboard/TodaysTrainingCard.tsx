import { Dumbbell } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function TodaysTrainingCard() {
  return (
    <section className="mb-6">
      <div className="rounded-2xl border border-border bg-card px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center">

          <div className="flex items-center gap-4 lg:w-[32%]">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-accent/10">
              <Dumbbell className="h-7 w-7 text-accent" />
            </div>

            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-accent">
                Heute
              </div>

              <h2 className="mt-1 text-xl font-bold tracking-tight">
                Beschleunigung
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Sprint · ca. 60 Minuten
              </p>
            </div>
          </div>

          <div className="flex-1 lg:border-l lg:border-border lg:pl-7">
            <div className="grid gap-2.5 text-sm font-semibold">

              <div className="flex items-center gap-3">
                <span className="h-2 w-2 shrink-0 rounded-full bg-accent/30" />
                <span>4 × 20 m Blockstarts</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="h-2 w-2 shrink-0 rounded-full bg-accent/30" />
                <span>4 × 30 m Beschleunigung</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="h-2 w-2 shrink-0 rounded-full bg-accent/30" />
                <span>3 × Flying 30 m</span>
              </div>

            </div>
          </div>

          <div className="shrink-0">
            <Button
              variant="outline"
              onClick={() =>
                toast("Training wird später mit dem Trainingskalender verbunden.")
              }
              className="h-11 rounded-xl border-accent px-5 font-semibold hover:bg-accent/5"
            >
              Training ansehen
              <span className="ml-2 text-lg">→</span>
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
}
