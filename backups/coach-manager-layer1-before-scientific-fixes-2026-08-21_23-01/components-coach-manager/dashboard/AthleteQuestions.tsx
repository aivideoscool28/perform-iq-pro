import { MessageCircleQuestion } from "lucide-react";

const questions = [
  {
    athlete: "Sophie",
    question: "Question about block starts",
  },
  {
    athlete: "Jonas",
    question: "Question about tomorrow's session",
  },
];

export function AthleteQuestions() {
  return (
    <section className="rounded-2xl border border-orange-100 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">
            Athlete Questions
          </p>

          <h3 className="mt-1 text-base font-bold">
            Waiting for you
          </h3>
        </div>

        <div className="grid h-8 w-8 place-items-center rounded-xl bg-orange-50">
          <MessageCircleQuestion className="h-4 w-4 text-orange-500" />
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {questions.map((item) => (
          <button
            key={`${item.athlete}-${item.question}`}
            type="button"
            className="flex w-full items-center justify-between rounded-xl border border-orange-100 bg-orange-50/40 px-3 py-2 text-left transition hover:bg-orange-50"
          >
            <div>
              <p className="text-sm font-semibold">
                {item.athlete}
              </p>

              <p className="text-[11px] text-muted-foreground">
                {item.question}
              </p>
            </div>

            <span className="text-orange-500">→</span>
          </button>
        ))}
      </div>
    </section>
  );
}
