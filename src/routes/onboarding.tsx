import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import {
  generateGoalReply,
  saveOnboarding,
} from "@/lib/features/profile.functions";
import { markTourPending } from "@/lib/tour";

import {
  OnboardingFlow,
  type OnboardingAnswers,
} from "@/components/onboarding/OnboardingFlow";
import { OnboardingReveal } from "@/components/onboarding/OnboardingReveal";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [{ title: "Athletic IQ · Onboarding" }],
  }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const saveFn = useServerFn(saveOnboarding);
  const goalReplyFn = useServerFn(generateGoalReply);

  const [completedAnswers, setCompletedAnswers] =
    useState<OnboardingAnswers | null>(null);

  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: "/auth", replace: true });
    }
  }, [loading, session, navigate]);

  const saveMutation = useMutation({
    mutationFn: async (answers: OnboardingAnswers) => {
      const disciplines =
        answers.discipline === "Sprint & Hürden"
          ? ["Sprint", "Hürden"]
          : [answers.discipline];

      return saveFn({
        data: {
          display_name: answers.name.trim(),
          age: answers.age ?? 8,
          disciplines,
          goal_text: answers.goal.trim(),
          goal_motivation: answers.goalMotivation,
          current_focus: answers.currentFocus,
          experience: answers.experience,
          training_days_per_week: answers.trainingDays ?? 1,
          training_setup: answers.trainingSetup,
          injuries: answers.injuries,
          favouriteAthlete: answers.favouriteAthlete,
        },
      });
    },

    onSuccess: async () => {
      queryClient.setQueryData(
        ["dashboard"],
        (old: unknown) => {
          if (!old || typeof old !== "object") {
            return old;
          }

          const current = old as {
            profile?: Record<string, unknown>;
          };

          return {
            ...current,
            profile: {
              ...(current.profile ?? {}),
              onboarded_at: new Date().toISOString(),
            },
          };
        },
      );

      await queryClient.refetchQueries({
        queryKey: ["dashboard"],
      });

      markTourPending();
      toast.success("Profil gespeichert!");

      await navigate({
        to: "/",
        replace: true,
      });
    },

    onError: (error) => {
      console.error("ONBOARDING SAVE ERROR:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Profil konnte nicht gespeichert werden.",
      );
    },
  });

  const handleGoalReply = async (
    goal: string,
    name: string,
  ) => {
    try {
      const response = await goalReplyFn({
        data: {
          goal,
          name,
        },
      });

      return response?.reply ?? null;
    } catch {
      return null;
    }
  };

  if (loading || !session) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">

      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-orange-500/5 blur-3xl" />

      <header className="relative border-b border-border/60">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-4">

          <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-accent-foreground">
            <Sparkles className="h-4 w-4" />
          </div>

          <div>
            <div className="text-sm font-black tracking-tight">
              Athletic IQ
            </div>

            <div className="text-xs text-muted-foreground">
              Lass uns dich als Athlet kennenlernen.
            </div>
          </div>

        </div>
      </header>

      <div className="relative mx-auto max-w-5xl px-5 py-8 sm:py-12">

        {completedAnswers ? (
          <OnboardingReveal
            name={completedAnswers.name}
            discipline={completedAnswers.discipline}
            experience={completedAnswers.experience}
            goal={completedAnswers.goal}
            focus={completedAnswers.currentFocus}
            trainingDays={completedAnswers.trainingDays ?? 0}
            trainingSetup={completedAnswers.trainingSetup}
            favouriteAthlete={completedAnswers.favouriteAthlete}
            isSaving={saveMutation.isPending}
            errorMessage={
              saveMutation.isError
                ? "Dein Profil konnte noch nicht gespeichert werden. Versuch es bitte erneut."
                : null
            }
            onFinish={() => {
              saveMutation.mutate(completedAnswers);
            }}
          />
        ) : (
          <OnboardingFlow
            onGoalReply={handleGoalReply}
            onComplete={(answers) => {
              setCompletedAnswers(answers);
            }}
          />
        )}

      </div>

    </main>
  );
}


