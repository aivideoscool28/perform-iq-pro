import {
  Copy,
  Search,
  X,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  useCoachPreviousTraining,
} from "@/hooks/coach-manager/useCoachPreviousTraining";

import type {
  CoachTrainingSession,
} from "@/lib/coach-training.functions";

export function PreviousTrainingPicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (
    session: CoachTrainingSession,
  ) => void;
}) {
  const {
    sessions,
    loading,
    error,
  } = useCoachPreviousTraining();

  const [search, setSearch] =
    useState("");

  const filteredSessions =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return sessions;
      }

      return sessions.filter(
        (session) =>
          session.title
            .toLowerCase()
            .includes(query) ||
          session.group_name
            ?.toLowerCase()
            .includes(query) ||
          session.discipline
            ?.toLowerCase()
            .includes(query) ||
          session.session_goal
            ?.toLowerCase()
            .includes(query),
      );
    }, [
      sessions,
      search,
    ]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        onClick={(event) =>
          event.stopPropagation()
        }
        className="max-h-[82vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-white p-4 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-600">
              Previous Training
            </p>

            <h3 className="mt-1 text-lg font-bold">
              Reuse a Session
            </h3>

            <p className="mt-1 text-[9px] text-muted-foreground">
              Choose an older training, copy it and adapt it for a new date.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg transition hover:bg-muted/30"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-border px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search title, group, discipline..."
            className="w-full bg-transparent text-xs outline-none"
          />
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3">
            <p className="text-[9px] font-semibold text-red-700">
              {error}
            </p>
          </div>
        )}

        <div className="mt-4 space-y-2">
          {loading &&
            Array.from({
              length: 4,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-xl bg-muted/40"
                />
              ),
            )}

          {!loading &&
            filteredSessions.map(
              (session) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() =>
                    onSelect(
                      session,
                    )
                  }
                  className="flex w-full items-center justify-between gap-4 rounded-xl border border-border p-3 text-left transition hover:border-blue-200 hover:bg-blue-50/30"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[10px] font-bold">
                      {
                        session.title
                      }
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[7px] font-semibold text-slate-600">
                        {
                          session.session_date
                        }
                      </span>

                      {session.group_name && (
                        <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[7px] font-semibold text-orange-600">
                          {
                            session.group_name
                          }
                        </span>
                      )}

                      {session.discipline && (
                        <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[7px] font-semibold text-violet-600">
                          {
                            session.discipline
                          }
                        </span>
                      )}
                    </div>

                    {session.session_goal && (
                      <p className="mt-2 line-clamp-1 text-[8px] text-muted-foreground">
                        {
                          session.session_goal
                        }
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-[8px] font-semibold text-blue-700">
                    <Copy className="h-3 w-3" />
                    Reuse
                  </div>
                </button>
              ),
            )}

          {!loading &&
            filteredSessions.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-6 text-center">
                <p className="text-[9px] font-semibold">
                  No previous training found
                </p>

                <p className="mt-1 text-[8px] text-muted-foreground">
                  Older saved sessions will appear here.
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
