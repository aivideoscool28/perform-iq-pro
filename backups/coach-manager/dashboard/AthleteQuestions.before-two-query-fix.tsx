import { useEffect, useState } from "react";
import {
  CheckCircle2,
  MessageCircleQuestion,
  Send,
  UserRound,
  X,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

type AthleteQuestion = {
  id: string;
  athlete: string;
  subject: string;
  question: string;
  time: string;
};

export function AthleteQuestions() {
  const [questions, setQuestions] = useState<AthleteQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] =
    useState<AthleteQuestion | null>(null);

  const [answer, setAnswer] = useState("");
  const [answerSent, setAnswerSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuestions() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("athlete_questions")
        .select(`
          id,
          question,
          asked_at,
          profiles!athlete_questions_athlete_id_fkey (
            display_name
          )
        `)
        .eq("status", "open")
        .order("asked_at", { ascending: false });

      if (error) {
        console.error("Could not load athlete questions:", error);
        setError(error.message);
        setQuestions([]);
        setLoading(false);
        return;
      }

      const mappedQuestions: AthleteQuestion[] = (data ?? []).map(
        (row: any) => ({
          id: row.id,
          athlete:
            row.profiles?.display_name ?? "Unknown athlete",
          subject: "Athlete question",
          question: row.question,
          time: new Date(row.asked_at).toLocaleString(),
        }),
      );

      setQuestions(mappedQuestions);
      setLoading(false);
    }

    void loadQuestions();
  }, []);

  function openQuestion(question: AthleteQuestion) {
    setSelectedQuestion(question);
    setAnswer("");
    setAnswerSent(false);
    setError(null);
  }

  function closeQuestion() {
    setSelectedQuestion(null);
    setAnswer("");
    setAnswerSent(false);
    setError(null);
  }

  async function sendAnswer() {
    if (!selectedQuestion || !answer.trim() || sending) {
      return;
    }

    setSending(true);
    setError(null);

    const now = new Date().toISOString();

    const { error } = await supabase
      .from("athlete_questions")
      .update({
        answer: answer.trim(),
        status: "answered",
        answered_at: now,
        updated_at: now,
      })
      .eq("id", selectedQuestion.id);

    if (error) {
      console.error("Could not send athlete question answer:", error);
      setError(error.message);
      setSending(false);
      return;
    }

    setAnswerSent(true);

    setQuestions((current) =>
      current.filter(
        (question) => question.id !== selectedQuestion.id,
      ),
    );

    setSending(false);
  }

  return (
    <>
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
          {loading && (
            <p className="text-xs text-muted-foreground">
              Loading questions...
            </p>
          )}

          {!loading && error && (
            <p className="text-xs text-red-600">
              Could not load questions: {error}
            </p>
          )}

          {!loading && !error && questions.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No open athlete questions.
            </p>
          )}

          {questions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openQuestion(item)}
              className="flex w-full items-center justify-between rounded-xl border border-orange-100 bg-orange-50/40 px-3 py-2 text-left transition hover:bg-orange-50"
            >
              <div>
                <p className="text-sm font-semibold">
                  {item.athlete}
                </p>

                <p className="text-[11px] text-muted-foreground">
                  {item.subject}
                </p>
              </div>

              <span className="text-orange-500">→</span>
            </button>
          ))}
        </div>
      </section>

      {selectedQuestion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4"
          onClick={closeQuestion}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Athlete question"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-border bg-white p-5 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-orange-50 text-orange-600">
                  <UserRound className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-bold">
                    {selectedQuestion.athlete}
                  </p>

                  <p className="text-[10px] text-muted-foreground">
                    {selectedQuestion.time}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeQuestion}
                className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted/30"
                aria-label="Close question"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-xs font-bold">
                Athlete question
              </p>

              <div className="mt-2 rounded-xl border border-orange-100 bg-orange-50/40 p-3">
                <p className="text-xs leading-relaxed text-foreground">
                  {selectedQuestion.question}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-[10px] font-semibold">
                Your answer
              </label>

              <textarea
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                disabled={answerSent || sending}
                placeholder="Write your answer to the athlete..."
                className="mt-1.5 min-h-[110px] w-full resize-none rounded-xl border border-border bg-white p-3 text-xs leading-relaxed outline-none transition focus:border-orange-300 disabled:bg-slate-50"
              />
            </div>

            {error && (
              <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2">
                <p className="text-[10px] font-semibold text-red-700">
                  Could not send answer
                </p>
              </div>
            )}

            {answerSent && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />

                <div>
                  <p className="text-[10px] font-semibold text-green-700">
                    Answer sent
                  </p>

                  <p className="text-[9px] text-green-700/80">
                    Saved successfully in Supabase.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeQuestion}
                className="rounded-xl border border-border px-4 py-2 text-[10px] font-semibold"
              >
                Close
              </button>

              <button
                type="button"
                onClick={sendAnswer}
                disabled={!answer.trim() || answerSent || sending}
                className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-[10px] font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" />
                {sending
                  ? "Sending..."
                  : answerSent
                    ? "Sent"
                    : "Send Answer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


