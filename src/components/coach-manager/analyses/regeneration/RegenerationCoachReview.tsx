import { useState } from "react";
import {
  Check,
  MessageSquareText,
  Minus,
  X,
} from "lucide-react";

type ReviewValue = "accurate" | "partly" | "incorrect" | null;

export function RegenerationCoachReview() {
  const [review, setReview] = useState<ReviewValue>(null);
  const [showContext, setShowContext] = useState(false);
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
            Does this interpretation match what you are seeing as a coach?
          </p>
        </div>

        <div className="text-right">
          <p className="text-[12px] font-semibold text-muted-foreground">
            Trial feedback
          </p>

          <p className="text-[13px] font-semibold text-violet-700">
            Coach validation
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_330px] gap-3">
        <div className="rounded-xl border border-violet-100 bg-white p-3">
          <div className="flex items-start gap-2">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-violet-100 text-[13px] font-bold text-violet-700">
              01
            </div>

            <div className="min-w-0">
              <p className="text-[13px] font-semibold leading-relaxed">
                Energy has been below recent normal across 5 athletes for
                multiple regeneration check-ins.
              </p>

              <p className="mt-1 text-[12px] text-muted-foreground">
                Their other signals and performance context should be reviewed
                before interpreting this as a problem.
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
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
              onClick={() => {
                setReview("partly");
                setShowContext(true);
              }}
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
              onClick={() => {
                setReview("incorrect");
                setShowContext(true);
              }}
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
              onClick={() => setShowContext((current) => !current)}
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
            placeholder='e.g. "This is normal for Jonas after speed endurance."'
            rows={3}
            className="mt-2 w-full rounded-lg border border-border bg-background p-2 text-[12px] outline-none focus:ring-2 focus:ring-violet-200"
          />

          {showContext && (
            <div className="mt-2 flex flex-wrap gap-1">
              {[
                "Normal for athlete",
                "Training was intentionally hard",
                "Missing context",
                "Pattern is not important",
                "Different interpretation",
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  className="rounded-full border border-border px-2 py-1 text-[12px] text-muted-foreground hover:border-violet-200 hover:text-violet-700"
                >
                  {reason}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="mt-2 text-center text-[12px] text-muted-foreground">
        Coach feedback evaluates Athletic IQ's interpretation. It does not
        overwrite what athletes reported.
      </p>
    </section>
  );
}


