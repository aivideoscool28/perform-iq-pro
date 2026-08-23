import { useMemo, useState } from "react";

import { useCoachAthletes } from "@/hooks/useCoachAthletes";

import {
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardCheck,
  Filter,
  Flag,
  MapPin,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trophy,
  Users,
  X,
} from "lucide-react";

import {
  competitions,
  type Competition,
  type CompetitionAthlete,
} from "@/components/coach-manager/competitions/competitions.data";

function StatusDot({
  type,
}: {
  type: "normal" | "watch" | "review";
}) {
  return (
    <span
      className={[
        "h-2 w-2 rounded-full",
        type === "normal"
          ? "bg-green-500"
          : type === "review"
            ? "bg-red-500"
            : "bg-orange-500",
      ].join(" ")}
    />
  );
}

function CompetitionRow({
  competition,
  selected,
  onClick,
}: {
  competition: Competition;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "grid w-full grid-cols-[64px_1fr_auto] items-center gap-3 border-b border-border/60 px-3 py-3 text-left transition last:border-b-0",
        selected
          ? "border-l-4 border-l-violet-600 bg-violet-50/65"
          : "hover:bg-muted/15",
      ].join(" ")}
    >
      <div className="rounded-xl border border-border bg-white px-2 py-2 text-center">
        <p className="text-[7px] font-bold text-violet-700">
          {competition.month}
        </p>

        <p className="mt-0.5 text-xl font-bold">
          {competition.day}
        </p>

        <p className="text-[7px] text-muted-foreground">
          {competition.weekday}
        </p>
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-bold">
            {competition.name}
          </p>

          <span
            className={[
              "rounded-full px-2 py-0.5 text-[6px] font-bold",
              competition.type === "CHAMPIONSHIP"
                ? "bg-violet-50 text-violet-700"
                : "bg-blue-50 text-blue-700",
            ].join(" ")}
          >
            {competition.type}
          </span>
        </div>

        <p className="mt-1 text-[8px] text-muted-foreground">
          {competition.venue}, {competition.location}
        </p>

        <div className="mt-2 flex items-center gap-3 text-[7px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {competition.athletes} athletes
          </span>

          <span className="flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            {competition.events} events
          </span>
        </div>

        <div className="mt-2 flex items-center gap-1.5">
          {competition.signals > 0 ? (
            <>
              <span className="h-2 w-2 rounded-full bg-orange-500" />

              <p className="text-[7px] font-semibold text-orange-700">
                {competition.signalLabel}
              </p>
            </>
          ) : (
            <>
              <Check className="h-3 w-3 text-green-600" />

              <p className="text-[7px] font-medium text-muted-foreground">
                {competition.signalLabel}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-right">
          <div className="flex justify-end gap-1">
            {competition.readinessDots.map((dot, index) => (
              <span
                key={index}
                className={[
                  "h-2 w-2 rounded-full",
                  dot === "green"
                    ? "bg-green-500"
                    : dot === "orange"
                      ? "bg-orange-500"
                      : dot === "red"
                        ? "bg-red-500"
                        : "bg-slate-200",
                ].join(" ")}
              />
            ))}
          </div>

          <p
            className={[
              "mt-1 text-[6px] font-semibold",
              competition.signals === 0
                ? "text-green-600"
                : competition.signals >= 3
                  ? "text-red-600"
                  : "text-orange-600",
            ].join(" ")}
          >
            {competition.signals === 0
              ? "Good"
              : competition.signals >= 3
                ? "Needs review"
                : "Some signals"}
          </p>
        </div>

        <ChevronRight className="h-4 w-4 text-slate-600" />
      </div>
    </button>
  );
}

function AthleteRow({
  athlete,
}: {
  athlete: CompetitionAthlete;
}) {
  return (
    <button
      type="button"
      className="grid w-full grid-cols-[1.1fr_1fr_1.1fr_0.65fr_18px] items-center gap-3 border-t border-border/60 px-3 py-2 text-left transition hover:bg-muted/15"
    >
      <div className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-full bg-orange-50 text-[7px] font-bold text-orange-600">
          {athlete.initials}
        </div>

        <span className="text-[8px] font-semibold">
          {athlete.name}
        </span>
      </div>

      <span className="text-[8px]">
        {athlete.events}
      </span>

      <div className="flex items-center gap-2">
        <StatusDot type={athlete.statusType} />

        <span className="text-[8px]">
          {athlete.status}
        </span>
      </div>

      <span className="text-[7px] text-muted-foreground">
        {athlete.lastCheckin}
      </span>

      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
    </button>
  );
}

function CompetitionDetail({
  competition,
  onClose,
}: {
  competition: Competition;
  onClose: () => void;
}) {
  const [view, setView] =
    useState<"athletes" | "events" | "checklist">("athletes");

  return (
    <section className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm">
      <div className="border-l-4 border-l-violet-600 p-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold">
                {competition.name}
              </h2>

              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[6px] font-bold text-violet-700">
                {competition.type}
              </span>
            </div>

            <div className="mt-1 flex items-center gap-3 text-[8px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {competition.date}
              </span>

              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {competition.venue}, {competition.location}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-muted/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-[repeat(5,1fr)_auto] gap-2">
          {[
            ["Phase", competition.phase],
            ["Priority", competition.priority],
            ["Events", competition.events.toString()],
            ["Athletes", competition.athletes.toString()],
            ["Entries", competition.entries],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-border p-2.5"
            >
              <p className="text-[7px] text-muted-foreground">
                {label}
              </p>

              <p
                className={[
                  "mt-1 text-[9px] font-semibold",
                  label === "Priority"
                    ? "text-orange-600"
                    : "",
                ].join(" ")}
              >
                {value}
              </p>
            </div>
          ))}

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-border px-3 text-[8px] font-semibold"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit details
          </button>
        </div>
      </div>

      <div className="flex items-center gap-5 border-b border-border px-3">
        {[
          ["athletes", "Athletes"],
          ["events", "Events"],
          ["checklist", "Checklist"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() =>
              setView(id as "athletes" | "events" | "checklist")
            }
            className={[
              "border-b-2 px-1 py-2 text-[8px] font-semibold",
              view === id
                ? "border-violet-600 text-violet-700"
                : "border-transparent text-muted-foreground",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "athletes" && (
        <div>
          <div className="flex items-center justify-between p-3">
            <div>
              <p className="text-[9px] font-bold">
                Athletes & Events
              </p>

              <div className="mt-1 flex gap-1">
                <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[6px] font-semibold text-violet-700">
                  All {competition.athletes}
                </span>

                <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[6px] font-semibold text-orange-700">
                  Signals {competition.signals}
                </span>

                <span className="rounded-full bg-green-50 px-2 py-0.5 text-[6px] font-semibold text-green-700">
                  Normal {competition.athletes - competition.signals}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-border px-2 py-1.5">
              <Search className="h-3 w-3 text-muted-foreground" />

              <input
                placeholder="Search athletes..."
                className="w-28 bg-transparent text-[7px] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-[1.1fr_1fr_1.1fr_0.65fr_18px] gap-3 bg-slate-50/60 px-3 py-2 text-[7px] font-semibold text-muted-foreground">
            <span>Athlete</span>
            <span>Event(s)</span>
            <span>Recent status</span>
            <span>Last check-in</span>
            <span />
          </div>

          {competition.athletesList.map((athlete) => (
            <AthleteRow
              key={athlete.name}
              athlete={athlete}
            />
          ))}

          <button
            type="button"
            className="px-3 py-2 text-[7px] font-semibold text-violet-600"
          >
            View all {competition.athletes} athletes →
          </button>
        </div>
      )}

      {view === "events" && (
        <div className="p-3">
          <p className="text-[9px] font-bold">
            Events
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              ["100m", "6 athletes", "11:20"],
              ["200m", "5 athletes", "15:40"],
              ["110m Hurdles", "4 athletes", "13:10"],
              ["4×100m", "6 athletes", "17:05"],
            ].map(([event, athletes, time]) => (
              <button
                key={event}
                type="button"
                className="flex items-center justify-between rounded-xl border border-border p-3 text-left"
              >
                <div>
                  <p className="text-[9px] font-semibold">
                    {event}
                  </p>

                  <p className="mt-1 text-[8px] text-muted-foreground">
                    {athletes}
                  </p>
                </div>

                <span className="text-[8px] font-semibold text-violet-700">
                  {time}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {view === "checklist" && (
        <div className="p-3">
          <p className="text-[9px] font-bold">
            Pre-competition checklist
          </p>

          <div className="mt-3 space-y-2">
            {[
              ["Entries confirmed", "18 / 18", true],
              ["Athletes to review", "3", false],
              ["Event times added", "4 / 4", true],
              ["Travel & logistics", "—", false],
            ].map(([label, value, done]) => (
              <div
                key={label as string}
                className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <ClipboardCheck
                    className={[
                      "h-3.5 w-3.5",
                      done
                        ? "text-green-600"
                        : "text-orange-500",
                    ].join(" ")}
                  />

                  <span className="text-[8px] font-medium">
                    {label}
                  </span>
                </div>

                <span
                  className={[
                    "text-[8px] font-semibold",
                    done
                      ? "text-green-600"
                      : "text-orange-600",
                  ].join(" ")}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export function CompetitionsPage() {
  const [selectedCompetitionId, setSelectedCompetitionId] =
    useState<string>("nordrhein-u20");

  const { athletes } = useCoachAthletes();

  const displayedCompetitions = useMemo(
    () =>
      competitions.map((competition) => ({
        ...competition,
        athletes: athletes.length,
        entries: `0 / ${athletes.length}`,
      })),
    [athletes],
  );
  const selectedCompetition = useMemo(() => {
    const baseCompetition =
      displayedCompetitions.find(
        (competition) =>
          competition.id === selectedCompetitionId,
      ) ?? displayedCompetitions[0];

    const linkedAthletes: CompetitionAthlete[] = athletes.map(
      (athlete) => ({
        name: athlete.display_name,
        initials: athlete.display_name
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0]?.toUpperCase())
          .join(""),
        events: "Not assigned yet",
        status: "Competition data connects next",
        statusType: "normal",
        lastCheckin: "—",
      }),
    );

    return {
      ...baseCompetition,
      athletes: linkedAthletes.length,
      entries: `0 / ${linkedAthletes.length}`,
      signals: 0,
      signalLabel: "Competition athlete data connects next",
      readinessDots: linkedAthletes.map(() => "muted" as const),
      athletesList: linkedAthletes,
    };
  }, [selectedCompetitionId, athletes, displayedCompetitions]);

  return (
    <div className="space-y-3">
      <section className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600">
            Competitions
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            Competitions
          </h1>

          <p className="mt-1 text-xs text-muted-foreground">
            Plan meets, review entries and check athlete readiness.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded-xl border border-border bg-white px-3 py-2 text-[9px] font-semibold">
            Sprint / Hurdles U20 ▾
          </button>

          <button className="rounded-xl border border-border bg-white px-3 py-2 text-[9px] font-semibold">
            Upcoming ▾
          </button>

          <button className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-[9px] font-semibold">
            <Filter className="h-3.5 w-3.5" />
            Filters
          </button>

          <button className="flex items-center gap-2 rounded-xl bg-violet-600 px-3 py-2 text-[9px] font-semibold text-white">
            <Plus className="h-3.5 w-3.5" />
            Add competition
          </button>
        </div>
      </section>

      <section className="grid grid-cols-4 gap-2.5">
        <article className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50">
              <CalendarDays className="h-5 w-5 text-violet-600" />
            </div>

            <div>
              <p className="text-[8px] font-semibold text-muted-foreground">
                Upcoming competitions
              </p>

              <p className="mt-1 text-xl font-bold">4</p>

              <p className="text-[7px] text-muted-foreground">
                in the next 8 weeks
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-orange-200 bg-orange-50/20 p-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-50">
              <Flag className="h-5 w-5 text-orange-600" />
            </div>

            <div>
              <p className="text-[8px] font-semibold text-muted-foreground">
                Next competition
              </p>

              <p className="mt-1 text-[11px] font-bold">
                Nordrhein U20 Champs
              </p>

              <p className="mt-1 text-xl font-bold text-orange-600">
                6 days
              </p>

              <p className="text-[7px] text-muted-foreground">
                May 25 · Leverkusen
              </p>

              <span className="mt-1 inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-[6px] font-semibold text-orange-700">
                A Priority · Peak
              </span>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-50">
              <Users className="h-5 w-5 text-green-600" />
            </div>

            <div>
              <p className="text-[8px] font-semibold text-muted-foreground">
                Athletes entered
              </p>

              <p className="mt-1 text-xl font-bold">18</p>

              <p className="text-[7px] text-muted-foreground">
                across 4 events
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50">
              <Trophy className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <p className="text-[8px] font-semibold text-muted-foreground">
                Competitions this season
              </p>

              <p className="mt-1 text-xl font-bold">12</p>

              <p className="text-[7px] text-muted-foreground">
                3 completed
              </p>
            </div>
          </div>
        </article>
      </section>

      <div className="grid grid-cols-[0.78fr_1.22fr] items-start gap-3">
        <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border p-3">
            <h2 className="text-sm font-bold">
              Upcoming competitions
            </h2>

            <div className="flex items-center gap-2 rounded-lg border border-border px-2 py-1.5">
              <Search className="h-3 w-3 text-muted-foreground" />

              <input
                placeholder="Search competitions..."
                className="w-28 bg-transparent text-[7px] outline-none"
              />
            </div>
          </div>

          {displayedCompetitions.map((competition) => (
            <CompetitionRow
              key={competition.id}
              competition={competition}
              selected={
                selectedCompetition.id === competition.id
              }
              onClick={() =>
                setSelectedCompetitionId(competition.id)
              }
            />
          ))}

          <div className="p-3 text-center">
            <button
              type="button"
              className="rounded-xl border border-violet-200 px-3 py-2 text-[8px] font-semibold text-violet-700"
            >
              View all competitions →
            </button>
          </div>
        </section>

        <div className="space-y-3">
          <CompetitionDetail
            competition={selectedCompetition}
            onClose={() =>
              setSelectedCompetitionId("nordrhein-u20")
            }
          />

          <div className="grid grid-cols-[1.15fr_0.85fr] gap-3">
            <section className="rounded-2xl border border-violet-100 bg-violet-50/25 p-3 shadow-sm">
              <div className="flex items-start gap-2">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-violet-100">
                  <Sparkles className="h-4 w-4 text-violet-600" />
                </div>

                <div>
                  <p className="text-[9px] font-bold">
                    Athletic IQ · Competition Overview
                  </p>

                  <p className="mt-1 text-[8px] text-muted-foreground">
                    Most athletes are within their recent regeneration patterns.
                  </p>
                </div>
              </div>

              <p className="mt-3 text-[7px] font-semibold">
                3 athletes have recent signals worth reviewing:
              </p>

              <div className="mt-2 space-y-1.5">
                {[
                  [
                    "Liam Peters",
                    "elevated soreness across 2 check-ins",
                    "bg-red-500",
                  ],
                  [
                    "Sarah Braun",
                    "repeated poor sleep",
                    "bg-orange-500",
                  ],
                  [
                    "Jonas Richter",
                    "unusually high recent session-RPE load",
                    "bg-yellow-500",
                  ],
                ].map(([name, detail, color]) => (
                  <div
                    key={name}
                    className="flex items-start gap-2"
                  >
                    <span
                      className={`mt-1 h-2 w-2 rounded-full ${color}`}
                    />

                    <p className="text-[7px]">
                      <span className="font-semibold">
                        {name}
                      </span>{" "}
                      — {detail}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-[6px] text-muted-foreground">
                These signals provide context only and do not determine
                competition readiness.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-white p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-violet-600" />

                <h3 className="text-[9px] font-bold">
                  Pre-competition checklist
                </h3>
              </div>

              <div className="mt-3 space-y-2">
                {[
                  ["Entries confirmed", "18 / 18", true],
                  ["Athletes to review", "3", false],
                  ["Event times added", "4 / 4", true],
                  ["Travel & logistics", "—", false],
                ].map(([label, value, done]) => (
                  <div
                    key={label as string}
                    className="flex items-center justify-between"
                  >
                    <span className="text-[7px]">
                      {label}
                    </span>

                    <span
                      className={[
                        "text-[7px] font-semibold",
                        done
                          ? "text-green-600"
                          : "text-orange-600",
                      ].join(" ")}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="mt-3 w-full rounded-lg border border-violet-200 py-2 text-[7px] font-semibold text-violet-700"
              >
                Open full checklist →
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}










