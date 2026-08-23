export type CompetitionStatus = "normal" | "watch" | "review";

export type CompetitionAthlete = {
  name: string;
  initials: string;
  events: string;
  status: string;
  statusType: CompetitionStatus;
  lastCheckin: string;
};

export type Competition = {
  id: string;
  name: string;
  date: string;
  month: string;
  day: string;
  weekday: string;
  location: string;
  venue: string;
  type: "CHAMPIONSHIP" | "MEETING";
  athletes: number;
  events: number;
  eventList: string;
  signals: number;
  signalLabel: string;
  priority: string;
  phase: string;
  entries: string;
  readinessDots: ("green" | "orange" | "red" | "muted")[];
  athletesList: CompetitionAthlete[];
};

export const competitions: Competition[] = [
  {
    id: "nordrhein-u20",
    name: "Nordrhein U20 Championships",
    date: "May 25, 2025",
    month: "MAY",
    day: "25",
    weekday: "SUN",
    location: "Leverkusen",
    venue: "Stadion Manfort",
    type: "CHAMPIONSHIP",
    athletes: 18,
    events: 4,
    eventList: "100m · 200m · 110m Hurdles · 4×100m",
    signals: 3,
    signalLabel: "3 athlete signals worth reviewing",
    priority: "A · Peak/Priority",
    phase: "Competition",
    entries: "18 / 18",
    readinessDots: ["red", "orange", "orange", "green"],
    athletesList: [
      {
        name: "Jonas Richter",
        initials: "JR",
        events: "100m · 200m",
        status: "High recent RPE load",
        statusType: "watch",
        lastCheckin: "May 19",
      },
      {
        name: "Sarah Braun",
        initials: "SB",
        events: "100m Hurdles",
        status: "Repeated poor sleep",
        statusType: "watch",
        lastCheckin: "May 19",
      },
      {
        name: "Tom Klein",
        initials: "TK",
        events: "100m",
        status: "Recent normal",
        statusType: "normal",
        lastCheckin: "May 20",
      },
      {
        name: "Liam Peters",
        initials: "LP",
        events: "110m Hurdles",
        status: "Elevated soreness",
        statusType: "review",
        lastCheckin: "May 19",
      },
      {
        name: "Mia Wagner",
        initials: "MW",
        events: "200m · 4×100m",
        status: "Recent normal",
        statusType: "normal",
        lastCheckin: "May 20",
      },
    ],
  },
  {
    id: "cologne-sprint",
    name: "Cologne Sprint Meeting",
    date: "Jun 8, 2025",
    month: "JUN",
    day: "08",
    weekday: "SUN",
    location: "Köln",
    venue: "NetCologne Stadion",
    type: "MEETING",
    athletes: 12,
    events: 3,
    eventList: "100m · 200m · Hurdles",
    signals: 0,
    signalLabel: "No notable recent signals",
    priority: "B · Important",
    phase: "Competition",
    entries: "12 / 12",
    readinessDots: ["green", "green", "green", "muted"],
    athletesList: [],
  },
  {
    id: "bayern-track-field",
    name: "Bayern Track & Field",
    date: "Jun 21, 2025",
    month: "JUN",
    day: "21",
    weekday: "SAT",
    location: "München",
    venue: "Dantestadion",
    type: "MEETING",
    athletes: 14,
    events: 4,
    eventList: "100m · 400m · 4×100m",
    signals: 2,
    signalLabel: "2 athlete signals worth reviewing",
    priority: "B · Important",
    phase: "Competition",
    entries: "14 / 14",
    readinessDots: ["orange", "orange", "green", "muted"],
    athletesList: [],
  },
  {
    id: "summer-hurdles",
    name: "Summer Hurdles Cup",
    date: "Jul 5, 2025",
    month: "JUL",
    day: "05",
    weekday: "SAT",
    location: "Duisburg",
    venue: "Wedau Stadion",
    type: "MEETING",
    athletes: 10,
    events: 3,
    eventList: "110m Hurdles · 400m Hurdles",
    signals: 0,
    signalLabel: "No notable recent signals",
    priority: "C · Preparation",
    phase: "Competition",
    entries: "10 / 10",
    readinessDots: ["green", "green", "green", "muted"],
    athletesList: [],
  },
];
