import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CircleHelp,
  UserRound,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

type AthleteProfile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  age: number | null;
  disciplines: string[] | null;
  current_focus: string | null;
};

export function AthleteDetailPage() {
  const { athleteId } = useParams({
    from: "/coach-manager/athletes/$athleteId",
  });

  const [athlete, setAthlete] =
    useState<AthleteProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadAthlete() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, display_name, avatar_url, age, disciplines, current_focus",
        )
        .eq("id", athleteId)
        .maybeSingle();

      if (error) {
        console.error("Could not load athlete:", error);
        setError(error.message);
        setAthlete(null);
        setLoading(false);
        return;
      }

      if (!data) {
        setError("Athlete profile not found.");
        setAthlete(null);
        setLoading(false);
        return;
      }

      setAthlete(data as AthleteProfile);
      setLoading(false);
    }

    void loadAthlete();
  }, [athleteId]);

  if (loading) {
    return (
      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Loading athlete...
        </p>
      </section>
    );
  }

  if (error || !athlete) {
    return (
      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <CircleHelp className="h-5 w-5 text-red-500" />

        <p className="mt-2 text-sm font-semibold">
          Could not load athlete
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          {error ?? "Unknown error"}
        </p>

        <Link
          to="/coach-manager/athletes"
          className="mt-4 inline-block text-xs font-semibold text-orange-600"
        >
          ← Back to athletes
        </Link>
      </section>
    );
  }

  const discipline =
    athlete.disciplines?.length
      ? athlete.disciplines.join(" / ")
      : "Discipline not set";

  return (
    <div className="space-y-4">
      <Link
        to="/coach-manager/athletes"
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-orange-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Athletes
      </Link>

      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-orange-50 text-orange-600">
            <UserRound className="h-5 w-5" />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-600">
              Athlete Detail
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              {athlete.display_name}
            </h1>

            <p className="mt-1 text-xs text-muted-foreground">
              {discipline}
              {athlete.age ? ` · Age ${athlete.age}` : ""}
              {athlete.current_focus
                ? ` · Focus: ${athlete.current_focus}`
                : ""}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-border bg-white p-8 text-center">
        <p className="text-sm font-semibold">
          Athlete Intelligence View
        </p>

        <p className="mt-2 text-xs text-muted-foreground">
          Route and real Supabase athlete profile are connected.
          Next we build the approved Coach Manager athlete-detail UI here.
        </p>

        <p className="mt-2 text-[10px] text-muted-foreground">
          Athlete UUID: {athlete.id}
        </p>
      </section>
    </div>
  );
}
