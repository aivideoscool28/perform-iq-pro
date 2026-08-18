export const DISCIPLINE_OPTIONS = [
  {
    value: "Sprint",
    label: "Sprint",
    description: "Starts, Beschleunigung, Top Speed & Speed Endurance",
  },
  {
    value: "Hürden",
    label: "Hürden",
    description: "Technik, Rhythmus & Geschwindigkeit über die Hürden",
  },
  {
    value: "Sprint & Hürden",
    label: "Sprint & Hürden",
    description: "Du trainierst beide Bereiche regelmäßig",
  },
] as const;

export const EXPERIENCE_OPTIONS = [
  {
    value: "Ich starte gerade richtig",
    label: "Ich starte gerade richtig",
    description: "Ich bin noch relativ neu in der Leichtathletik",
  },
  {
    value: "Ich trainiere regelmäßig",
    label: "Ich trainiere regelmäßig",
    description: "Leichtathletik ist bereits Teil meiner Woche",
  },
  {
    value: "Ich starte bei Wettkämpfen",
    label: "Ich starte bei Wettkämpfen",
    description: "Ich trainiere und starte regelmäßig im Wettkampf",
  },
  {
    value: "Ich trainiere leistungsorientiert",
    label: "Ich trainiere leistungsorientiert",
    description: "Ich arbeite gezielt an meiner sportlichen Leistung",
  },
] as const;

export const GOAL_EXAMPLES = [
  "Meine 100-m-Zeit verbessern",
  "Meinen Hürdenrhythmus stabilisieren",
  "Mich für eine Meisterschaft qualifizieren",
  "Meinen Start verbessern",
] as const;

export const GOAL_MOTIVATION_OPTIONS = [
  "Ich möchte mir selbst etwas beweisen",
  "Ich möchte im Wettkampf weiterkommen",
  "Ich möchte sehen, wie gut ich werden kann",
  "Dieses Ziel motiviert mich, konsequent zu trainieren",
] as const;

export const SPRINT_FOCUS_OPTIONS = [
  "Blockstart",
  "Beschleunigung",
  "Top Speed",
  "Speed Endurance",
  "Lauftechnik",
  "Ich weiß es noch nicht",
] as const;

export const HURDLES_FOCUS_OPTIONS = [
  "Start zur ersten Hürde",
  "Hürdenrhythmus",
  "Hürdentechnik",
  "Tempo zwischen den Hürden",
  "Konstanz",
  "Ich weiß es noch nicht",
] as const;

export const TRAINING_SETUP_OPTIONS = [
  {
    value: "Mit Coach / Verein",
    label: "Mit Coach / Verein",
  },
  {
    value: "Teilweise mit Coach, teilweise selbstständig",
    label: "Coach + selbstständig",
  },
  {
    value: "Hauptsächlich selbstständig",
    label: "Hauptsächlich selbstständig",
  },
] as const;

export const TRAINING_DAYS = [1, 2, 3, 4, 5, 6, 7] as const;

export const FAVOURITE_ATHLETE_SUGGESTIONS = [
  "Noah Lyles",
  "Sydney McLaughlin-Levrone",
  "Femke Bol",
  "Grant Holloway",
] as const;
