import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Loader2,
  Sparkles,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

import {
  DISCIPLINE_OPTIONS,
  EXPERIENCE_OPTIONS,
  FAVOURITE_ATHLETE_SUGGESTIONS,
  GOAL_EXAMPLES,
  GOAL_MOTIVATION_OPTIONS,
  HURDLES_FOCUS_OPTIONS,
  SPRINT_FOCUS_OPTIONS,
  TRAINING_DAYS,
  TRAINING_SETUP_OPTIONS,
} from "./onboarding-choices";

export type OnboardingAnswers = {
  name: string;
  age: number | null;
  discipline: string;
  experience: string;
  goal: string;
  goalMotivation: string[];
  currentFocus: string[];
  trainingDays: number | null;
  trainingSetup: string;
  injuries: string | null;
  favouriteAthlete: string | null;
};

type Props = {
  onComplete: (answers: OnboardingAnswers) => void;
  onGoalReply?: (goal: string, name: string) => Promise<string | null>;
};

const INITIAL_ANSWERS: OnboardingAnswers = {
  name: "",
  age: null,
  discipline: "",
  experience: "",
  goal: "",
  goalMotivation: [],
  currentFocus: [],
  trainingDays: null,
  trainingSetup: "",
  injuries: null,
  favouriteAthlete: null,
};

const TOTAL_STEPS = 9;

export function OnboardingFlow({
  onComplete,
  onGoalReply,
}: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] =
    useState<OnboardingAnswers>(INITIAL_ANSWERS);

  const [customGoalMotivation, setCustomGoalMotivation] = useState("");
  const [hasPhysicalIssue, setHasPhysicalIssue] =
    useState<boolean | null>(null);

  const [goalReply, setGoalReply] = useState<string | null>(null);
  const [goalReplyLoading, setGoalReplyLoading] = useState(false);

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  const focusOptions = useMemo(() => {
    if (answers.discipline === "Sprint") {
      return SPRINT_FOCUS_OPTIONS;
    }

    if (answers.discipline === "Hürden") {
      return HURDLES_FOCUS_OPTIONS;
    }

    return [
      ...new Set([
        ...SPRINT_FOCUS_OPTIONS,
        ...HURDLES_FOCUS_OPTIONS,
      ]),
    ];
  }, [answers.discipline]);

  const update = <K extends keyof OnboardingAnswers>(
    key: K,
    value: OnboardingAnswers[K],
  ) => {
    setAnswers((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const toggleLimitedSelection = (
    key: "goalMotivation" | "currentFocus",
    value: string,
  ) => {
    setAnswers((current) => {
      const selected = current[key];

      if (selected.includes(value)) {
        return {
          ...current,
          [key]: selected.filter((item) => item !== value),
        };
      }

      if (selected.length >= 2) {
        return current;
      }

      return {
        ...current,
        [key]: [...selected, value],
      };
    });
  };

  const setCustomMotivation = (value: string) => {
    setCustomGoalMotivation(value);

    setAnswers((current) => {
      const withoutOldCustom = current.goalMotivation.filter(
        (item) => item !== customGoalMotivation,
      );

      const trimmed = value.trim();

      if (!trimmed) {
        return {
          ...current,
          goalMotivation: withoutOldCustom,
        };
      }

      if (withoutOldCustom.length >= 2) {
        return current;
      }

      return {
        ...current,
        goalMotivation: [...withoutOldCustom, trimmed],
      };
    });
  };

  const next = () => {
    setStep((current) =>
      Math.min(current + 1, TOTAL_STEPS - 1),
    );
  };

  const back = () => {
    setStep((current) => Math.max(current - 1, 0));
  };

  const submitGoal = async () => {
    if (answers.goal.trim().length < 2) return;

    if (onGoalReply) {
      setGoalReplyLoading(true);

      try {
        const reply = await onGoalReply(
          answers.goal.trim(),
          answers.name.trim(),
        );

        setGoalReply(reply);
      } catch {
        setGoalReply(null);
      } finally {
        setGoalReplyLoading(false);
      }
    }

    next();
  };

  const finish = () => {
    onComplete({
      ...answers,
      injuries:
        hasPhysicalIssue === true
          ? answers.injuries?.trim() || null
          : null,
      favouriteAthlete:
        answers.favouriteAthlete?.trim() || null,
    });
  };

  return (
    <div className="mx-auto flex min-h-[680px] w-full max-w-2xl flex-col">

      <div className="mb-8">
        <div className="flex items-center justify-between gap-4">

          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition hover:text-foreground disabled:invisible"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </button>

          <div className="text-xs font-semibold text-muted-foreground">
            {step + 1} / {TOTAL_STEPS}
          </div>

        </div>

        <Progress value={progress} className="mt-4 h-1.5" />
      </div>

      <div className="flex flex-1 flex-col">

        {step === 0 && (
          <QuestionLayout
            eyebrow="Willkommen"
            title="Wie dürfen wir dich nennen?"
            description="So spricht Athletic IQ dich später persönlich an."
          >
            <Input
              autoFocus
              value={answers.name}
              onChange={(event) =>
                update("name", event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" && answers.name.trim()) {
                  event.preventDefault();
                  next();
                }
              }}
              placeholder="Dein Name"
              className="h-12 rounded-xl"
            />

            <NextButton
              disabled={!answers.name.trim()}
              onClick={next}
            />
          </QuestionLayout>
        )}

        {step === 1 && (
          <QuestionLayout
            icon={<Zap className="h-5 w-5" />}
            eyebrow="Deine Disziplin"
            title="Wo fühlst du dich in der Leichtathletik zuhause?"
            description="Damit Athletic IQ von Anfang an in deiner Disziplin denkt."
          >
            <OptionGrid>
              {DISCIPLINE_OPTIONS.map((option) => (
                <OptionCard
                  key={option.value}
                  active={answers.discipline === option.value}
                  title={option.label}
                  description={option.description}
                  onClick={() =>
                    update("discipline", option.value)
                  }
                />
              ))}
            </OptionGrid>

            <NextButton
              disabled={!answers.discipline}
              onClick={next}
            />
          </QuestionLayout>
        )}

        {step === 2 && (
          <QuestionLayout
            icon={<Trophy className="h-5 w-5" />}
            eyebrow="Du als Athlet"
            title="Wo stehst du gerade als Athlet?"
            description="Dein Alter und deine Erfahrung helfen uns, Informationen passend einzuordnen."
          >
            <OptionGrid>
              {EXPERIENCE_OPTIONS.map((option) => (
                <OptionCard
                  key={option.value}
                  active={answers.experience === option.value}
                  title={option.label}
                  description={option.description}
                  onClick={() =>
                    update("experience", option.value)
                  }
                />
              ))}
            </OptionGrid>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold">
                Wie alt bist du?
              </label>

              <Input
                type="number"
                inputMode="numeric"
                min={8}
                max={99}
                value={answers.age ?? ""}
                onChange={(event) => {
                  const value = Number(event.target.value);

                  update(
                    "age",
                    Number.isFinite(value) && value > 0
                      ? value
                      : null,
                  );
                }}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    answers.age !== null &&
                    answers.age >= 8 &&
                    answers.age <= 99
                  ) {
                    event.preventDefault();
                    next();
                  }
                }}
                placeholder="z. B. 15"
                className="h-12 rounded-xl"
              />
            </div>

            <NextButton
              disabled={
                !answers.experience ||
                answers.age === null ||
                answers.age < 8 ||
                answers.age > 99
              }
              onClick={next}
            />
          </QuestionLayout>
        )}

        {step === 3 && (
          <QuestionLayout
            icon={<Target className="h-5 w-5" />}
            eyebrow="Dein Ziel"
            title="Was möchtest du als Nächstes erreichen?"
            description="Schreib dein Ziel so, wie du es selbst ausdrücken würdest."
          >
            <Textarea
              autoFocus
              value={answers.goal}
              onChange={(event) =>
                update("goal", event.target.value)
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  answers.goal.trim().length >= 2 &&
                  !goalReplyLoading
                ) {
                  event.preventDefault();
                  void submitGoal();
                }
              }}
              placeholder="Mein nächstes Ziel ist..."
              className="min-h-[120px] rounded-xl"
            />

            <div className="mt-4">
              <div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Beispiele
              </div>

              <div className="flex flex-wrap gap-2">
                {GOAL_EXAMPLES.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => update("goal", example)}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition hover:border-accent/40 hover:bg-accent/5"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {goalReplyLoading && (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Athletic IQ denkt kurz über dein Ziel nach...
              </div>
            )}

            <NextButton
              disabled={
                answers.goal.trim().length < 2 ||
                goalReplyLoading
              }
              onClick={submitGoal}
            />
          </QuestionLayout>
        )}

        {step === 4 && (
          <QuestionLayout
            icon={<Heart className="h-5 w-5" />}
            eyebrow="Was dir wichtig ist"
            title="Was bedeutet dir dieses Ziel?"
            description="Dein Ziel sagt, wohin du willst. Das hier sagt uns, was dahinter steckt."
          >
            {goalReply && (
              <div className="mb-5 rounded-2xl border border-accent/15 bg-accent/5 p-4 text-sm font-medium leading-relaxed">
                <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-accent">
                  <Sparkles className="h-3.5 w-3.5" />
                  Athletic IQ
                </div>

                {goalReply}
              </div>
            )}

            <div className="space-y-2">
              {GOAL_MOTIVATION_OPTIONS.map((option) => (
                <OptionCard
                  key={option}
                  active={answers.goalMotivation.includes(option)}
                  title={option}
                  onClick={() => {
                    setCustomGoalMotivation("");
                    toggleLimitedSelection("goalMotivation", option);
                  }}
                />
              ))}

              <OptionCard
                active={customGoalMotivation.length > 0 && answers.goalMotivation.includes(customGoalMotivation)}
                title="Etwas anderes"
                onClick={() => {
                  const existingCustom =
                    answers.goalMotivation.find(
                      (item) =>
                        !GOAL_MOTIVATION_OPTIONS.includes(
                          item as (typeof GOAL_MOTIVATION_OPTIONS)[number],
                        ),
                    ) ?? "";

                  setCustomGoalMotivation(existingCustom);
                }}
              />
            </div>

            <Textarea
              value={customGoalMotivation}
              onChange={(event) => {
                const value = event.target.value;

                setCustomMotivation(value);
              }}
              placeholder="Was bedeutet dir dieses Ziel?"
              className="mt-3 min-h-[90px] rounded-xl"
            />

            <NextButton
              disabled={answers.goalMotivation.length === 0}
              onClick={next}
            />
          </QuestionLayout>
        )}

        {step === 5 && (
          <QuestionLayout
            icon={<Zap className="h-5 w-5" />}
            eyebrow="Dein aktueller Fokus"
            title="Woran arbeitest du gerade oder woran möchtest du am meisten arbeiten?"
            description="Das ist dein eigener Fokus — Athletic IQ behandelt ihn später nicht automatisch als bewiesene Schwäche."
          >
            <OptionGrid>
              {focusOptions.map((option) => (
                <OptionCard
                  key={option}
                  active={answers.currentFocus.includes(option)}
                  title={option}
                  onClick={() =>
                    toggleLimitedSelection("currentFocus", option)
                  }
                />
              ))}
            </OptionGrid>

            <NextButton
              disabled={answers.currentFocus.length === 0}
              onClick={next}
            />
          </QuestionLayout>
        )}

        {step === 6 && (
          <QuestionLayout
            icon={<Users className="h-5 w-5" />}
            eyebrow="Dein Training"
            title="Wie trainierst du normalerweise?"
            description="So wissen wir, ob Athletic IQ vor allem deinen Coach-Plan unterstützen oder dir mehr selbstständige Orientierung geben soll."
          >
            <div className="space-y-2">
              {TRAINING_SETUP_OPTIONS.map((option) => (
                <OptionCard
                  key={option.value}
                  active={
                    answers.trainingSetup === option.value
                  }
                  title={option.label}
                  onClick={() =>
                    update("trainingSetup", option.value)
                  }
                />
              ))}
            </div>

            <div className="mt-6">
              <div className="mb-3 text-sm font-semibold">
                Wie oft trainierst du normalerweise pro Woche?
              </div>

              <div className="grid grid-cols-7 gap-2">
                {TRAINING_DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() =>
                      update("trainingDays", day)
                    }
                    className={[
                      "aspect-square rounded-xl border text-sm font-bold transition",
                      answers.trainingDays === day
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border bg-background hover:border-accent/40",
                    ].join(" ")}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <NextButton
              disabled={
                !answers.trainingSetup ||
                answers.trainingDays === null
              }
              onClick={next}
            />
          </QuestionLayout>
        )}

        {step === 7 && (
          <QuestionLayout
            eyebrow="Aktueller Kontext"
            title="Gibt es aktuell etwas Körperliches, das Athletic IQ berücksichtigen sollte?"
            description="Zum Beispiel Schmerzen, eine Verletzung oder eine andere Einschränkung. Athletic IQ nutzt diese Information vorsichtig und stellt keine Diagnose."
          >
            <div className="grid gap-3 sm:grid-cols-2">

              <OptionCard
                active={hasPhysicalIssue === false}
                title="Nein, aktuell nicht"
                onClick={() => {
                  setHasPhysicalIssue(false);
                  update("injuries", null);
                }}
              />

              <OptionCard
                active={hasPhysicalIssue === true}
                title="Ja"
                onClick={() =>
                  setHasPhysicalIssue(true)
                }
              />

            </div>

            {hasPhysicalIssue && (
              <Textarea
                value={answers.injuries ?? ""}
                onChange={(event) =>
                  update("injuries", event.target.value)
                }
                placeholder="z. B. leichte Probleme mit der linken Achillessehne"
                className="mt-4 min-h-[100px] rounded-xl"
              />
            )}

            <NextButton
              disabled={
                hasPhysicalIssue === null ||
                (hasPhysicalIssue === true &&
                  !(answers.injuries ?? "").trim())
              }
              onClick={next}
            />
          </QuestionLayout>
        )}

        {step === 8 && (
          <QuestionLayout
            icon={<Trophy className="h-5 w-5" />}
            eyebrow="Deine Inspiration · optional"
            title="Wer ist dein Lieblingsathlet oder deine Lieblingsathletin?"
            description="Wir können das später für kleine persönliche Motivationsmomente nutzen."
          >
            <Input
              value={answers.favouriteAthlete ?? ""}
              onChange={(event) =>
                update(
                  "favouriteAthlete",
                  event.target.value || null,
                )
              }
              placeholder="z. B. Grant Holloway"
              className="h-12 rounded-xl"
            />

            <div className="mt-4 flex flex-wrap gap-2">
              {FAVOURITE_ATHLETE_SUGGESTIONS.map(
                (athlete) => (
                  <button
                    key={athlete}
                    type="button"
                    onClick={() =>
                      update(
                        "favouriteAthlete",
                        athlete,
                      )
                    }
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition hover:border-accent/40 hover:bg-accent/5"
                  >
                    {athlete}
                  </button>
                ),
              )}
            </div>

            <div className="mt-auto flex gap-3 pt-8">

              <Button
                type="button"
                variant="outline"
                className="h-11 flex-1 rounded-xl"
                onClick={() => {
                  update("favouriteAthlete", null);
                  finish();
                }}
              >
                Überspringen
              </Button>

              <Button
                type="button"
                className="h-11 flex-1 rounded-xl"
                onClick={finish}
              >
                Fertig
                <ArrowRight className="h-4 w-4" />
              </Button>

            </div>
          </QuestionLayout>
        )}

      </div>
    </div>
  );
}

function QuestionLayout({
  icon,
  eyebrow,
  title,
  description,
  children,
}: {
  icon?: React.ReactNode;
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">

      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-accent">
          {icon}
          {eyebrow}
        </div>

        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          {title}
        </h1>

        {description && (
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-1 flex-col">
        {children}
      </div>

    </div>
  );
}

function OptionGrid({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {children}
    </div>
  );
}

function OptionCard({
  title,
  description,
  active,
  onClick,
}: {
  title: string;
  description?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-2xl border p-4 text-left transition",
        active
          ? "border-accent bg-accent/10 shadow-sm"
          : "border-border bg-card hover:border-accent/30 hover:bg-accent/5",
      ].join(" ")}
    >
      <div className="text-sm font-bold">
        {title}
      </div>

      {description && (
        <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {description}
        </div>
      )}
    </button>
  );
}

function NextButton({
  disabled,
  onClick,
}: {
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="mt-8 h-11 w-full rounded-xl sm:w-auto sm:min-w-[150px] sm:self-end"
    >
      Weiter
      <ArrowRight className="h-4 w-4" />
    </Button>
  );
}












