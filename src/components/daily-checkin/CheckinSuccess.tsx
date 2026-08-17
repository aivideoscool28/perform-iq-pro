import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type CheckinSuccessProps = {
  aiSummary: string | null;
  onViewWorkoutAnalysis: () => void;
};

export function CheckinSuccess({
  aiSummary,
  onViewWorkoutAnalysis,
}: CheckinSuccessProps) {
  return (
    <div className="flex-1 flex flex-col justify-center">
      <div className="rounded-3xl border border-border bg-card p-7 text-center">

        <div className="mx-auto w-16 h-16 rounded-full bg-accent/15 grid place-items-center mb-5">
          <Check className="h-8 w-8 text-accent" />
        </div>

        <h2 className="text-2xl font-bold">
          Check-In gespeichert
        </h2>

        <p className="text-muted-foreground mt-3 mb-7 max-w-md mx-auto">
          {aiSummary ??
            "Deine Session wurde gespeichert."}
        </p>

        <Button
          size="lg"
          className="w-full bg-[#ff6b35] hover:bg-[#ff6b35]/90 text-white rounded-2xl font-semibold"
          onClick={onViewWorkoutAnalysis}
        >
          Workout-Analyse ansehen
        </Button>

      </div>
    </div>
  );
}
