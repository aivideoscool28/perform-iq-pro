import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { useCoachAthletes } from "@/hooks/useCoachAthletes";
import { Sparkles } from "lucide-react";

import { TrainingOverview } from "@/components/coach-manager/training/TrainingOverview";
import { TrainingIntelligence } from "@/components/coach-manager/training/TrainingIntelligence";
import { TrainingTools } from "@/components/coach-manager/training/TrainingTools";
import { PreviousTrainingPicker } from "@/components/coach-manager/training/PreviousTrainingPicker";
import { TrainingSidebar } from "@/components/coach-manager/training/TrainingSidebar";
import { TrainingEditor } from "@/components/coach-manager/training/TrainingEditor";
import { TrainingHistory } from "@/components/coach-manager/training/TrainingHistory";
import { CoachTrainingCalendar } from "@/components/coach-manager/training/CoachTrainingCalendar";
import { IndividualTrainingPlans } from "@/components/coach-manager/training/IndividualTrainingPlans";
import { useCoachTodayTraining } from "@/hooks/coach-manager/useCoachTodayTraining";

import type {
  CoachTrainingSession,
} from "@/lib/coach-training.functions";

import {
  createCoachTrainingSession,
  type CoachTrainingSessionInput,
} from "@/lib/coach-training.functions";

type TrainingView = "today" | "create" | "history" | "calendar" | "individual";

export function TrainingPage() {
  const [activeView, setActiveView] =
    useState<TrainingView>("today");

  const queryClient =
    useQueryClient();

  const createTrainingSession =
    useServerFn(
      createCoachTrainingSession,
    );

  const { athletes } = useCoachAthletes();

  const {
    session,
    loading: trainingLoading,
    saveSession,
    saving,
    saveError,
  } = useCoachTodayTraining();

  const [editorOpen, setEditorOpen] =
    useState(false);

  const [
    previousTrainingPickerOpen,
    setPreviousTrainingPickerOpen,
  ] = useState(false);

  const [
    reusedTraining,
    setReusedTraining,
  ] = useState<CoachTrainingSession | null>(null);

  const [
    editorMode,
    setEditorMode,
  ] = useState<
    "edit-today" | "create-new"
  >("edit-today");

  const createTrainingMutation =
    useMutation({
      mutationFn: (
        input: CoachTrainingSessionInput,
      ) =>
        createTrainingSession({
          data: input,
        }),

      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            "coach-training-today",
          ],
        });

        await queryClient.invalidateQueries({
          queryKey: [
            "coach-training-calendar",
          ],
        });

        await queryClient.invalidateQueries({
          queryKey: [
            "coach-upcoming-training",
          ],
        });

        await queryClient.invalidateQueries({
          queryKey: [
            "coach-training-history",
          ],
        });

        setActiveView("today");
      },
    });

  async function createNewTraining(
    input: CoachTrainingSessionInput,
  ) {
    await createTrainingMutation.mutateAsync(
      input,
    );
  }

  const [
    selectedIndividualAthleteId,
    setSelectedIndividualAthleteId,
  ] = useState<string | null>(null);

  function openIndividualPlans(
    athleteId?: string,
  ) {
    setSelectedIndividualAthleteId(
      athleteId ?? null,
    );

    setActiveView("individual");
  }

  return (
    <div className="space-y-3">
      <section className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600">
            Training
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            Training
          </h1>

          <p className="mt-1 text-xs text-muted-foreground">
            Plan today's session, manage individual adjustments and reuse
            previous training efficiently.
          </p>
        </div>

        {activeView === "today" && (
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Training Check
          </button>
        )}
      </section>

      {activeView !== "calendar" && (
      <nav className="flex w-fit items-center gap-1 rounded-xl border border-border bg-muted/20 p-1">
        <button
          type="button"
          onClick={() => setActiveView("today")}
          className={[
            "rounded-lg px-4 py-2 text-xs font-semibold transition",
            activeView === "today"
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          Today & Training Plan
        </button>

        <button
          type="button"
          onClick={() => setActiveView("create")}
          className={[
            "rounded-lg px-4 py-2 text-xs font-semibold transition",
            activeView === "create"
              ? "bg-white text-orange-600 shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          Create Training & Exercise Library
        </button>

        <button
          type="button"
          onClick={() => setActiveView("history")}
          className={[
            "rounded-lg px-4 py-2 text-xs font-semibold transition",
            activeView === "history"
              ? "bg-white text-violet-700 shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          History
        </button>
      </nav>
      )}

      {activeView === "today" && (
        <div className="grid grid-cols-[1fr_0.28fr] items-start gap-3">
          <main className="min-w-0 space-y-3">
            <TrainingOverview
              session={session}
              loading={trainingLoading}
              onEdit={() => {
                setEditorMode("edit-today");
                setEditorOpen(true);
              }}
            />
            <TrainingIntelligence athletes={athletes} />
          </main>

          <TrainingSidebar
            mode="today"
            athletes={athletes}
            onOpenCalendar={() => setActiveView("calendar")}
            onOpenIndividualPlans={openIndividualPlans}
          />
        </div>
      )}

      {activeView === "create" && (
        <TrainingTools
          onStartFromScratch={() => {
            setReusedTraining(null);
            setEditorMode("create-new");
            setEditorOpen(true);
          }}
          onUsePreviousTraining={() => {
            setPreviousTrainingPickerOpen(true);
          }}
        />
      )}

      {activeView === "history" && (
        <TrainingHistory
          onReuse={() => {
            // Reuse workflow connects next.
          }}
        />
      )}

      {activeView === "calendar" && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setActiveView("today")}
            className="text-[10px] font-semibold text-orange-600"
          >
            ← Back to Training
          </button>

          <CoachTrainingCalendar />
        </div>
      )}

      {activeView === "individual" && (
        <IndividualTrainingPlans
          athletes={athletes}
          mainSession={session}
          initialAthleteId={selectedIndividualAthleteId}
          onBack={() => {
            setSelectedIndividualAthleteId(null);
            setActiveView("today");
          }}
        />
      )}
      {saveError && (
        <div className="fixed bottom-4 right-4 z-[70] max-w-sm rounded-xl border border-red-200 bg-red-50 p-3 shadow-lg">
          <p className="text-xs font-bold text-red-700">
            Could not save training
          </p>

          <p className="mt-1 text-[10px] text-red-700">
            {saveError}
          </p>
        </div>
      )}

      <PreviousTrainingPicker
        open={previousTrainingPickerOpen}
        onClose={() =>
          setPreviousTrainingPickerOpen(false)
        }
        onSelect={(previousSession) => {
          setPreviousTrainingPickerOpen(false);
          setReusedTraining(previousSession);
          setEditorMode("create-new");
          setEditorOpen(true);
        }}
      />

      <TrainingEditor
        open={editorOpen}
        session={
          editorMode === "edit-today"
            ? session
            : reusedTraining
        }
        saving={
          editorMode === "edit-today"
            ? saving
            : createTrainingMutation.isPending
        }
        onClose={() =>
          setEditorOpen(false)
        }
        onSave={
          editorMode === "edit-today"
            ? saveSession
            : createNewTraining
        }
      />
    </div>
  );
}
















