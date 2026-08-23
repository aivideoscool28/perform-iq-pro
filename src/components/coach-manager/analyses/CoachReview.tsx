import { useState } from "react";
import {
  Check,
  MessageSquareText,
  Minus,
  X,
} from "lucide-react";

type ReviewValue = "accurate" | "partly" | "incorrect" | null;

type Finding = {
  id: string;
  title: string;
  detail: string;
};

const findings: Finding[] = [
  {
    id: "difficulty",
    title:
      "Speed Endurance was rated harder than expected in 31% of recent sessions.",
    detail: "5 athletes · 8 sessions affected",
  },
  {
    id: "goal-quality",
    title:
      "Goal achievement decreased while performance quality stayed mostly stable.",
    detail: "Compared with the previous 4-week period",
  },
  {
    id: "stress",
    title:
      "Stress / pressure was reported more often, especially among U18 athletes.",
    detail: "6 athletes reported elevated stress",
  },
];

function ReviewButtons({
  value,
  onChange,
}: {
  value: ReviewValue;
  onChange: (value: ReviewValue) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        type="button"
        onClick={() => onChange("accurate")}
        className={[
          "flex items-center gap-1 rounded-lg border px-2 py-1 text-[8px] font-semibold transition",
          value === "accurate"
            ? "border-green-300 bg-green-100 text-green-700"
            : "border-green-100 bg-green-50 text-green-700 hover:bg-green-100",
        ].join(" ")}
      >
        <Check className="h-3 w-3" />
        Accurate
      </button>

      <button
        type="button"
        onClick={() => onChange("partly")}
        className={[
          "flex items-center gap-1 rounded-lg border px-2 py-1 text-[8px] font-semibold transition",
          value === "partly"
            ? "border-orange-300 bg-orange-100 text-orange-700"
            : "border-orange-100 bg-orange-50 text-orange-700 hover:bg-orange-100",
        ].join(" ")}
      >
        <Minus className="h-3 w-3" />
        Partly
      </button>

      <button
        type="button"
        onClick={() => onChange("incorrect")}
        className={[
          "flex items-center gap-1 rounded-lg border px-2 py-1 text-[8px] font-semibold transition",
          value === "incorrect"
            ? "border-red-300 bg-red-100 text-red-700"
            : "border-red-100 bg-red-50 text-red-700 hover:bg-red-100",
        ].join(" ")}
      >
        <X className="h-3 w-3" />
        Incorrect
      </button>
    </div>
  );
}

export function CoachReview() {
  const [reviews, setReviews] = useState<Record<string, ReviewValue>>({});
  const [openReason, setOpenReason] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const reviewedCount = Object.values(reviews).filter(Boolean).length;

  return (
    <section className="rounded-2xl border border-violet-200 bg-violet-50/30 p-3 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold">
            Coach Review
            <span className="ml-2 text-[9px] font-medium text-muted-foreground">
              Help Athletic IQ improve
            </span>
          </h3>

          <p className="mt-1 text-[8px] text-muted-foreground">
            Tell us whether Athletic IQ's interpretation matches what you
            actually observed as a coach.
          </p>
        </div>

        <div className="text-right">
          <p className="text-[8px] font-semibold text-muted-foreground">
            Reviewed this page
          </p>
          <p className="text-sm font-bold text-violet-700">
            {reviewedCount}/{findings.length}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {findings.map((finding, index) => {
          const value = reviews[finding.id] ?? null;
          const showReason =
            openReason === finding.id ||
            value === "partly" ||
            value === "incorrect";

          return (
            <article
              key={finding.id}
              className="rounded-xl border border-violet-100 bg-white p-3"
            >
              <div className="flex items-start gap-2">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-violet-100 text-[9px] font-bold text-violet-700">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="min-w-0">
                  <p className="text-[9px] font-semibold leading-relaxed">
                    {finding.title}
                  </p>

                  <p className="mt-1 text-[8px] text-muted-foreground">
                    {finding.detail}
                  </p>
                </div>
              </div>

              <div className="mt-3">
                <ReviewButtons
                  value={value}
                  onChange={(next) => {
                    setReviews((current) => ({
                      ...current,
                      [finding.id]: next,
                    }));

                    if (next === "partly" || next === "incorrect") {
                      setOpenReason(finding.id);
                    }
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  setOpenReason(
                    openReason === finding.id ? null : finding.id,
                  )
                }
                className="mt-2 flex items-center gap-1 text-[8px] font-semibold text-violet-600"
              >
                <MessageSquareText className="h-3 w-3" />
                Details & context
              </button>

              {showReason && (
                <div className="mt-2 space-y-2 border-t border-border pt-2">
                  <p className="text-[8px] font-semibold">
                    What should Athletic IQ understand differently?
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {[
                      "Wrong athletes",
                      "Not important",
                      "Missing context",
                      "Different interpretation",
                      "Other",
                    ].map((reason) => (
                      <button
                        key={reason}
                        type="button"
                        className="rounded-full border border-border bg-background px-2 py-1 text-[7px] text-muted-foreground hover:border-violet-200 hover:text-violet-700"
                      >
                        {reason}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={2}
                    value={notes[finding.id] ?? ""}
                    onChange={(event) =>
                      setNotes((current) => ({
                        ...current,
                        [finding.id]: event.target.value,
                      }))
                    }
                    placeholder="Optional coach context..."
                    className="w-full rounded-lg border border-border bg-background p-2 text-[8px] outline-none focus:ring-2 focus:ring-violet-200"
                  />
                </div>
              )}
            </article>
          );
        })}
      </div>

      <p className="mt-2 text-center text-[7px] text-muted-foreground">
        Coach feedback is stored separately from athlete-reported data and is
        used to evaluate Athletic IQ's analyses.
      </p>
    </section>
  );
}
