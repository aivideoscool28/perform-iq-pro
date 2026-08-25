export type NoteKind = "note" | "measurement" | "follow-up";

export type CoachNoteItem = {
  id: string;
  kind: NoteKind;
  athlete: string;
  initials: string;
  time: string;
  date: string;
  section: "TODAY" | "YESTERDAY" | "THIS WEEK";
  session: string;
  text: string;
  visibility: "Private" | "Athlete" | "Staff";
  pinned?: boolean;
  measurement?: {
    type: string;
    value: string;
    unit: string;
    method: string;
  };
  followUp?: {
    when: string;
    completed: boolean;
  };
};

export const coachNotes: CoachNoteItem[] = [
  {
    id: "measure-jonas-1",
    kind: "measurement",
    athlete: "Jonas Richter",
    initials: "JR",
    time: "10:35",
    date: "21 Aug 2026",
    section: "TODAY",
    session: "Sprint Session",
    text: "Flying 30m: 3.12 s",
    visibility: "Private",
    pinned: true,
    measurement: {
      type: "Flying 30m",
      value: "3.12",
      unit: "seconds",
      method: "Hand timed",
    },
  },
  {
    id: "note-jonas-1",
    kind: "note",
    athlete: "Jonas Richter",
    initials: "JR",
    time: "09:10",
    date: "21 Aug 2026",
    section: "TODAY",
    session: "Sprint Session",
    text: "Looked strong out of the blocks. Good acceleration into 20 m.",
    visibility: "Athlete",
    pinned: false,
  },
  {
    id: "note-jonas-2",
    kind: "note",
    athlete: "Jonas Richter",
    initials: "JR",
    time: "18:20",
    date: "20 Aug 2026",
    section: "YESTERDAY",
    session: "Speed Endurance",
    text: "Lost posture in final 20 m of 150m rep.",
    visibility: "Private",
    pinned: true,
  },
  {
    id: "note-jonas-3",
    kind: "note",
    athlete: "Jonas Richter",
    initials: "JR",
    time: "18:15",
    date: "20 Aug 2026",
    section: "YESTERDAY",
    session: "Speed Endurance",
    text: "Reduced final rep because technique dropped.",
    visibility: "Private",
    pinned: false,
  },
  {
    id: "note-sarah-1",
    kind: "note",
    athlete: "Sarah Braun",
    initials: "SB",
    time: "14:05",
    date: "18 Aug 2026",
    section: "THIS WEEK",
    session: "General",
    text: "Exam week, poor sleep.",
    visibility: "Athlete",
    pinned: false,
  },
  {
    id: "follow-liam-1",
    kind: "follow-up",
    athlete: "Liam Peters",
    initials: "LP",
    time: "09:10",
    date: "17 Aug 2026",
    section: "THIS WEEK",
    session: "Speed Session",
    text: "Try 6 min recovery next time.",
    visibility: "Staff",
    pinned: false,
    followUp: {
      when: "Next Speed Session",
      completed: false,
    },
  },
];

export const measurementTypes = [
  "Flying 30m",
  "Flying 10m",
  "Flying 20m",
  "30m Acceleration",
  "60m",
  "Hurdle 1–5 Split",
  "Hurdle Touchdown Time",
];

export const pinnedCoachNotes = [
  {
    id: "pin-1",
    title: "Primary technical focus",
    detail: "Maintain projection",
    athlete: "Jonas Richter",
  },
  {
    id: "pin-2",
    title: "Competition goal",
    detail: "NRW U20 — 11.20 s",
    athlete: "Jonas Richter",
  },
  {
    id: "pin-3",
    title: "Watch recurring",
    detail: "Hamstring tightness",
    athlete: "Jonas Richter",
  },
  {
    id: "pin-4",
    title: "Hurdle rhythm",
    detail: "Improved recently",
    athlete: "Sarah Braun",
  },
];
