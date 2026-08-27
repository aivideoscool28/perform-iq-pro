import {
  useMemo,
  useState,
} from "react";

import {
  BookOpen,
  Clock,
  Dumbbell,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

import {
  useCoachTrainingTemplates,
} from "@/hooks/coach-manager/useCoachTrainingTemplates";

import type {
  CoachTrainingTemplate,
} from "@/lib/coach-training-templates.functions";

type TemplateTab =
  | "aether"
  | "coach";

export function TrainingTemplatePicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;

  onClose: () => void;

  onSelect: (
    template: CoachTrainingTemplate,
  ) => void;
}) {
  const [
    activeTab,
    setActiveTab,
  ] =
    useState<TemplateTab>(
      "aether",
    );

  const {
    templates,
    loading,
    error,
  } =
    useCoachTrainingTemplates();

  const visibleTemplates =
    useMemo(
      () =>
        templates.filter(
          (template) =>
            template.template_type ===
            activeTab,
        ),
      [
        templates,
        activeTab,
      ],
    );

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[88vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500">
              Training Templates
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Choose a template
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Start with an Aether template or reuse one of your own.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl transition hover:bg-muted/40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="flex w-fit gap-1 rounded-xl bg-muted/30 p-1">
            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  "aether",
                )
              }
              className={[
                "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition",
                activeTab ===
                "aether"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-muted-foreground",
              ].join(" ")}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Aether Templates
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  "coach",
                )
              }
              className={[
                "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition",
                activeTab ===
                "coach"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-muted-foreground",
              ].join(" ")}
            >
              <UserRound className="h-3.5 w-3.5" />
              My Templates
            </button>
          </div>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-6">
          {loading && (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <p className="text-sm font-semibold">
                Loading templates...
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-xs font-semibold text-red-700">
                Could not load templates
              </p>

              <p className="mt-1 text-[10px] text-red-600">
                {error}
              </p>
            </div>
          )}

          {!loading &&
            !error &&
            visibleTemplates.length ===
              0 && (
              <div className="rounded-2xl border border-dashed border-border p-10 text-center">
                <BookOpen className="mx-auto h-6 w-6 text-muted-foreground" />

                <p className="mt-3 text-sm font-semibold">
                  {activeTab ===
                  "coach"
                    ? "No personal templates yet"
                    : "No Aether templates available"}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {activeTab ===
                  "coach"
                    ? "Later you can save your own training sessions as reusable templates."
                    : "Official templates will appear here."}
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            visibleTemplates.length >
              0 && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {visibleTemplates.map(
                  (
                    template,
                  ) => (
                    <button
                      key={
                        template.id
                      }
                      type="button"
                      onClick={() =>
                        onSelect(
                          template,
                        )
                      }
                      className="rounded-2xl border border-border p-4 text-left transition hover:border-orange-200 hover:bg-orange-50/30 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-50">
                          <Dumbbell className="h-4 w-4 text-orange-500" />
                        </div>

                        <span className="rounded-full bg-muted/50 px-2 py-1 text-[8px] font-bold text-muted-foreground">
                          {
                            template.category
                          }
                        </span>
                      </div>

                      <h3 className="mt-3 text-sm font-bold">
                        {
                          template.name
                        }
                      </h3>

                      <p className="mt-1 min-h-10 text-[10px] leading-relaxed text-muted-foreground">
                        {template.description ??
                          "Reusable training template."}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {template.discipline && (
                          <span className="rounded-lg bg-orange-50 px-2 py-1 text-[8px] font-semibold text-orange-600">
                            {
                              template.discipline
                            }
                          </span>
                        )}

                        {template.intensity && (
                          <span className="rounded-lg bg-slate-50 px-2 py-1 text-[8px] font-semibold text-slate-600">
                            {
                              template.intensity
                            }
                          </span>
                        )}

                        {template.duration_minutes !==
                          null && (
                          <span className="flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-[8px] font-semibold text-slate-600">
                            <Clock className="h-3 w-3" />
                            {
                              template.duration_minutes
                            }{" "}
                            min
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                        <span className="text-[9px] text-muted-foreground">
                          {
                            template.exercises
                              .length
                          }{" "}
                          exercises
                        </span>

                        <span className="text-[9px] font-bold text-orange-600">
                          Use template →
                        </span>
                      </div>
                    </button>
                  ),
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
