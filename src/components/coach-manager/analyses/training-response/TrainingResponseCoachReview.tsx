import { useState } from "react";
import {
  Check,
  MessageSquareText,
  Minus,
  X,
} from "lucide-react";

type ReviewValue = "accurate" | "partly" | "incorrect" | null;

export function TrainingResponseCoachReview() {
  const [review, setReview] = useState<ReviewValue>(null);
  const [context, setContext] = useState("");

  return (
    <section className="rounded-2xl border border-violet-200 bg-violet-50/30 p-3 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold">
            Coach Review
            <span className="ml-2 text-[13px] font-medium text-muted-foreground">
              Help Athletic IQ improve
            </span>
          </h3>

          <p className="mt-1 text-[12px] text-muted-foreground">
            Does Athletic IQ's interpretation match what you observed?
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_320px] gap-3">
        <div className="rounded-xl border border-violet-100 bg-white p-3">
          <div className="flex items-start gap-2">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-violet-100 text-[13px] font-bold text-violet-700">
              01
            </div>

            <div>
              <p className="text-[13px] font-semibold leading-relaxed">
                Several Speed Endurance sessions show lower performance
                responses than recent comparable sessions.
              </p>

              <p className="mt-1 text-[12px] text-muted-foreground">
                Often appears together with higher RPE and lower goal achievement.
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setReview("accurate")}
              className={[
                "flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold",
                review === "accurate"
                  ? "border-green-300 bg-green-100 text-green-700"
                  : "border-green-100 bg-green-50 text-green-700",
              ].join(" ")}
            >
              <Check className="h-3 w-3" />
              Accurate
            </button>

            <button
              type="button"
              onClick={() => setReview("partly")}
              className={[
                "flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold",
                review === "partly"
                  ? "border-orange-300 bg-orange-100 text-orange-700"
                  : "border-orange-100 bg-orange-50 text-orange-700",
              ].join(" ")}
            >
              <Minus className="h-3 w-3" />
              Partly
            </button>

            <button
              type="button"
              onClick={() => setReview("incorrect")}
              className={[
                "flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold",
                review === "incorrect"
                  ? "border-red-300 bg-red-100 text-red-700"
                  : "border-red-100 bg-red-50 text-red-700",
              ].join(" ")}
            >
              <X className="h-3 w-3" />
              Incorrect
            </button>

            <button
              type="button"
              className="ml-auto flex items-center gap-1 rounded-lg border border-violet-100 px-2.5 py-1.5 text-[12px] font-semibold text-violet-700"
            >
              <MessageSquareText className="h-3 w-3" />
              Details
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-3">
          <p className="text-[12px] font-semibold">
            Coach context · optional
          </p>

          <textarea
            value={context}
            onChange={(event) => setContext(event.target.value)}
            rows={3}
            placeholder='e.g. "This was intentionally the hardest session of the block."'
            className="mt-2 w-full rounded-lg border border-border bg-background p-2 text-[12px] outline-none focus:ring-2 focus:ring-violet-200"
          />
        </div>
      </div>

      <p className="mt-2 text-center text-[12px] text-muted-foreground">
        Coach feedback evaluates Athletic IQ's interpretation and does not
        overwrite athlete-reported data.
      </p>
    </section>
  );
}

