import { useState } from "react";
import { AthleteTrend } from "@/components/coach-manager/athletes/AthleteTrend";
import {
  AlertTriangle,
  CircleCheck,
  CircleHelp,
  Eye,
  HeartPulse,
  Search,
  SlidersHorizontal,
} from "lucide-react";

type Athlete = {
  name: string;
  initials: string;
  meta: string;
  group: string;
  groupStyle: string;
  driver: string;
  driverDetail: string;
  trend: number[];
  change: string;
  changeDetail: string;
};

const reviewAthletes: Athlete[] = [
  {
    name: "Tom Klein",
    initials: "TK",
    meta: "#08 · U20",
    group: "Sprint / Hurdles",
    groupStyle: "bg-orange-50 text-orange-600",
    driver: "Pain",
    driverDetail: "Review",
    trend: [8, 7, 6, 5, 5, 4, 3],
    change: "Hamstring pain reported",
    changeDetail: "After training yesterday",
  },
  {
    name: "Jonas Richter",
    initials: "JR",
    meta: "#02 · U18",
    group: "Sprints",
    groupStyle: "bg-blue-50 text-blue-600",
    driver: "Fatigue",
    driverDetail: "Review",
    trend: [8, 7, 6, 6, 5, 4, 3],
    change: "High fatigue for 2 days",
    changeDetail: "Higher than recent baseline",
  },
  {
    name: "Lena Hoffmann",
    initials: "LH",
    meta: "#27 · U18",
    group: "Jumps",
    groupStyle: "bg-violet-50 text-violet-600",
    driver: "Knee pain",
    driverDetail: "Review",
    trend: [7, 6, 5, 6, 4, 5, 3],
    change: "Knee discomfort increasing",
    changeDetail: "Across recent check-ins",
  },
];

const watchAthletes: Athlete[] = [
  {
    name: "Sarah Braun",
    initials: "SB",
    meta: "#15 · U20",
    group: "Sprint / Hurdles",
    groupStyle: "bg-orange-50 text-orange-600",
    driver: "Recovery",
    driverDetail: "Worth watching",
    trend: [4, 5, 4, 6, 5, 6, 5],
    change: "Recovery lower than usual",
    changeDetail: "Recent downward change",
  },
  {
    name: "Leon Fischer",
    initials: "LF",
    meta: "#19 · U18",
    group: "Jumps",
    groupStyle: "bg-violet-50 text-violet-600",
    driver: "Energy",
    driverDetail: "Worth watching",
    trend: [4, 5, 5, 6, 5, 6, 5],
    change: "Energy slightly lower",
    changeDetail: "Compared with usual level",
  },
  {
    name: "Niklas Bauer",
    initials: "NB",
    meta: "#31 · U18",
    group: "Sprints",
    groupStyle: "bg-blue-50 text-blue-600",
    driver: "Sleep",
    driverDetail: "Worth watching",
    trend: [5, 5, 6, 5, 6, 5, 5],
    change: "Sleep quality declined",
    changeDetail: "Last night",
  },
];

const onTrackAthletes: Athlete[] = [
  {
    name: "Lukas Werner",
    initials: "LW",
    meta: "#23 · U20",
    group: "Sprint / Hurdles",
    groupStyle: "bg-orange-50 text-orange-600",
    driver: "Balanced",
    driverDetail: "On track",
    trend: [4, 5, 4, 6, 5, 6, 5],
    change: "Sprint development positive",
    changeDetail: "No current flag",
  },
  {
    name: "Anna Neidert",
    initials: "AN",
    meta: "#11 · U18",
    group: "Sprint / Hurdles",
    groupStyle: "bg-orange-50 text-orange-600",
    driver: "Balanced",
    driverDetail: "On track",
    trend: [4, 5, 5, 6, 5, 6, 7],
    change: "Recovery remains consistent",
    changeDetail: "No meaningful negative change",
  },
  {
    name: "Mia Schmitz",
    initials: "MS",
    meta: "#17 · U18",
    group: "Sprints",
    groupStyle: "bg-blue-50 text-blue-600",
    driver: "Balanced",
    driverDetail: "On track",
    trend: [4, 5, 4, 6, 5, 6, 5],
    change: "Load and recovery balanced",
    changeDetail: "No current flag",
  },
];

function AthleteRow({
  athlete,
  tone,
}: {
  athlete: Athlete;
  tone: "review" | "watch" | "good";
}) {
  const toneColor =
    tone === "review"
      ? "text-red-600"
      : tone === "watch"
        ? "text-orange-600"
        : "text-green-600";

  return (
    <button
      type="button"
      className="grid w-full grid-cols-[1.15fr_0.9fr_0.9fr_0.75fr_1.35fr_auto] items-center gap-3 border-t border-border/60 px-3 py-2 text-left transition hover:bg-muted/20"
    >
      <div className="flex items-center gap-2.5">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-50 text-[10px] font-bold text-orange-600">
          {athlete.initials}
        </div>

        <div>
          <p className="text-xs font-semibold">{athlete.name}</p>
          <p className="text-[9px] text-muted-foreground">{athlete.meta}</p>
        </div>
      </div>

      <span
        className={`w-fit rounded-full px-2 py-1 text-[9px] font-semibold ${athlete.groupStyle}`}
      >
        {athlete.group}
      </span>

      <div>
        <div className={`flex items-center gap-1.5 ${toneColor}`}>
          {tone === "review" && (
            <HeartPulse className="h-3.5 w-3.5 shrink-0" />
          )}

          {tone === "watch" && (
            <Eye className="h-3.5 w-3.5 shrink-0" />
          )}

          {tone === "good" && (
            <CircleCheck className="h-3.5 w-3.5 shrink-0" />
          )}

          <p className="text-xs font-semibold">
            {athlete.driverDetail}
          </p>
        </div>

        <p className="mt-0.5 text-[9px] text-muted-foreground">
          {athlete.driver}
        </p>
      </div>

      <AthleteTrend points={athlete.trend} tone={tone} />

      <div>
        <p className="text-[11px] font-semibold">{athlete.change}</p>
        <p className="text-[9px] text-muted-foreground">
          {athlete.changeDetail}
        </p>
      </div>


      <span className="text-xs text-muted-foreground">•••</span>
    </button>
  );
}

export function AthletesTable() {
  const [showOnTrackExamples, setShowOnTrackExamples] =
    useState(false);

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

        <button className="rounded-xl border border-border px-3 py-2 text-xs font-medium">
          All Statuses
        </button>

        <button className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-medium">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Smart Filters
        </button>
      </div>

      <div className="grid grid-cols-[1.15fr_0.9fr_0.9fr_0.75fr_1.35fr_auto] gap-3 bg-muted/20 px-3 py-2 text-[10px] font-semibold text-muted-foreground">
        <span>Athlete</span>
        <span>Group / Discipline</span>
        <span>Status & Driver</span>
        <span>Trend</span>
        <span>Key Change</span>
        <span />
      </div>

      <div>
        <div className="flex items-center gap-2 bg-red-50/30 px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
          <p className="text-[11px] font-bold text-red-600">
            REVIEW TODAY · 3
          </p>
        </div>

        {reviewAthletes.map((athlete) => (
          <AthleteRow key={athlete.name} athlete={athlete} tone="review" />
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between bg-orange-50/30 px-3 py-2">
          <div className="flex items-center gap-2">
            <Eye className="h-3.5 w-3.5 text-orange-500" />
            <p className="text-[11px] font-bold text-orange-600">
              WORTH WATCHING · 12
            </p>
          </div>

          <button className="text-[10px] font-semibold text-orange-600">
            View all 12 →
          </button>
        </div>

        {watchAthletes.map((athlete) => (
          <AthleteRow key={athlete.name} athlete={athlete} tone="watch" />
        ))}

        <div className="border-t border-border/60 px-3 py-2 text-[10px] font-medium text-orange-600">
          + 9 more worth watching →
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between bg-green-50/30 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <CircleCheck className="h-3.5 w-3.5 text-green-600" />

            <div>
              <p className="text-[11px] font-bold text-green-600">
                ON TRACK · 79
              </p>

              <p className="mt-0.5 text-[9px] text-muted-foreground">
                No current meaningful change requiring coach attention.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowOnTrackExamples((current) => !current)
            }
            className="text-[10px] font-semibold text-green-600"
          >
            {showOnTrackExamples ? "Hide examples ↑" : "View examples ↓"}
          </button>
        </div>

        {showOnTrackExamples && (
          <>
            {onTrackAthletes.map((athlete) => (
              <AthleteRow
                key={athlete.name}
                athlete={athlete}
                tone="good"
              />
            ))}

            <div className="border-t border-border/60 px-3 py-2 text-[10px] font-medium text-green-600">
              + 76 more on track →
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border bg-slate-50/50 px-3 py-2">
        <div>
          <div className="flex items-center gap-2">
            <CircleHelp className="h-3.5 w-3.5 text-slate-400" />

            <p className="text-[11px] font-semibold text-slate-600">
              INSUFFICIENT RECENT DATA · 6
            </p>
          </div>
          <p className="text-[9px] text-muted-foreground">
            No reliable current status yet.
          </p>
        </div>

        <button className="text-[10px] font-semibold text-violet-600">
          View 6 athletes →
        </button>
      </div>
    </section>
  );
}
















