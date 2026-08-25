import { MessageCircleQuestion } from "lucide-react";

const questions = [
  {
    athlete: "Lukas Werner",
    question: "Can we focus on block starts tomorrow?",
  },
  {
    athlete: "Sarah Braun",
    question: "Should I complete the full session today?",
  },
];

export function AthleteQuestionsCard() {
  return (
    <section className="rounded-2xl border border-blue-100 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold">
            Athlete Questions to You
          </p>

          <p className="mt-1 text-[10px] text-muted-foreground">
            Questions that currently need your response.
          </p>
        </div>

        <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50">
          <MessageCircleQuestion className="h-4 w-4 text-blue-600" />
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {questions.map((item) => (
          <button
            key={item.athlete}
            type="button"
            className="flex w-full items-center justify-between rounded-xl border border-blue-100 bg-blue-50/30 px-3 py-2 text-left"
          >
            <div>
              <p className="text-[11px] font-semibold">{item.athlete}</p>
              <p className="text-[9px] text-muted-foreground">
                {item.question}
              </p>
            </div>

            <span className="text-blue-600">→</span>
          </button>
        ))}
      </div>
    </section>
  );
}
