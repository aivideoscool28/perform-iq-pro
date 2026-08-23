import { useNavigate } from "@tanstack/react-router";
import {
  CircleHelp,
  Search,
  SlidersHorizontal,
  Users,
} from "lucide-react";

import type { CoachAthlete } from "@/hooks/useCoachAthletes";

type AthletesTableProps = {
  athletes: CoachAthlete[];
  loading: boolean;
  error: string | null;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AthletesTable({
  athletes,
  loading,
  error,
}: AthletesTableProps) {
  const navigate = useNavigate();

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
      <div className="flex items-center gap-2 border-b border-border p-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-border px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />

          <input
            placeholder="Search athlete..."
            className="w-full bg-transparent text-xs outline-none"
          />
        </div>

        <button className="rounded-xl border border-border px-3 py-2 text-xs font-medium">
          All Groups
        </button>

        <button className="rounded-xl border border-border px-3 py-2 text-xs font-medium">
          All Disciplines
        </button>

        <button className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-medium">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Smart Filters
        </button>
      </div>

      <div className="grid grid-cols-[1.2fr_1fr_1fr_1.2fr_auto] gap-3 bg-muted/20 px-3 py-2 text-[10px] font-semibold text-muted-foreground">
        <span>Athlete</span>
        <span>Discipline</span>
        <span>Age</span>
        <span>Current Focus</span>
        <span />
      </div>

      {loading && (
        <div className="px-4 py-8 text-center text-xs text-muted-foreground">
          Loading athletes from Supabase...
        </div>
      )}

      {!loading && error && (
        <div className="px-4 py-8 text-center">
          <CircleHelp className="mx-auto h-5 w-5 text-red-500" />
          <p className="mt-2 text-xs font-semibold text-red-600">
            Could not load athletes
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            {error}
          </p>
        </div>
      )}

      {!loading && !error && athletes.length === 0 && (
        <div className="px-4 py-10 text-center">
          <Users className="mx-auto h-5 w-5 text-muted-foreground" />
          <p className="mt-2 text-xs font-semibold">
            No athletes linked yet
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Athletes linked to this coach will appear here.
          </p>
        </div>
      )}

      {!loading &&
        !error &&
        athletes.map((athlete) => {
          const disciplines =
            athlete.disciplines?.length
              ? athlete.disciplines.join(" / ")
              : "Not set";

          return (
            <button
              key={athlete.id}
              type="button"
              onClick={() =>
                navigate({
                  to: "/coach-manager/athletes/$athleteId",
                  params: { athleteId: athlete.id },
                })
              }
              className="grid w-full cursor-pointer grid-cols-[1.2fr_1fr_1fr_1.2fr_auto] items-center gap-3 border-t border-border/60 px-3 py-3 text-left transition hover:bg-muted/20 active:bg-orange-50/40"
            >
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-50 text-[10px] font-bold text-orange-600">
                  {getInitials(athlete.display_name)}
                </div>

                <div>
                  <p className="text-xs font-semibold">
                    {athlete.display_name}
                  </p>

                  <p className="text-[9px] text-muted-foreground">
                    Linked athlete
                  </p>
                </div>
              </div>

              <span className="w-fit rounded-full bg-orange-50 px-2 py-1 text-[9px] font-semibold text-orange-600">
                {disciplines}
              </span>

              <p className="text-xs">
                {athlete.age ?? "—"}
              </p>

              <div>
                <p className="text-[11px] font-semibold">
                  {athlete.current_focus ?? "Not set"}
                </p>

                <p className="text-[9px] text-muted-foreground">
                  Performance data connecting
                </p>
              </div>

              <span className="text-xs text-muted-foreground">
                •••
              </span>
            </button>
          );
        })}
    </section>
  );
}


