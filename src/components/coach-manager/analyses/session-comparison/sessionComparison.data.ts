export const comparisonSections = [
  {
    title: "OUTCOME",
    subtitle: "What happened",
    tone: "violet",
    rows: [
      {
        metric: "Goal Achievement",
        sessionA: "68%",
        sessionADetail: "Partly achieved",
        sessionB: "81%",
        sessionBDetail: "Achieved",
        change: "↑ 13%",
        changeStyle: "text-green-600",
        distribution: {
          improved: 18,
          similar: 4,
          declined: 5,
        },
      },
      {
        metric: "Performance Quality",
        sessionA: "Similar",
        sessionADetail: "Mostly stable",
        sessionB: "Improved",
        sessionBDetail: "More athletes reported improvement",
        change: "↑ More positive",
        changeStyle: "text-green-600",
        distribution: {
          improved: 16,
          similar: 6,
          declined: 5,
        },
      },
    ],
  },

  {
    title: "TRAINING DEMAND",
    subtitle: "What was required",
    tone: "orange",
    rows: [
      {
        metric: "RPE (Perceived Effort)",
        sessionA: "7 /10",
        sessionADetail: "Hard",
        sessionB: "8 /10",
        sessionBDetail: "Harder",
        change: "↑ 1",
        changeStyle: "text-orange-600",
        distribution: {
          improved: 9,
          similar: 6,
          declined: 12,
        },
      },
      {
        metric: "Duration",
        sessionA: "68 min",
        sessionADetail: "",
        sessionB: "72 min",
        sessionBDetail: "",
        change: "↑ 4 min",
        changeStyle: "text-slate-700",
        distribution: null,
      },
      {
        metric: "Median Session-RPE Load",
        sessionA: "476 AU",
        sessionADetail: "Median of individual athlete loads",
        sessionB: "576 AU",
        sessionBDetail: "Median of individual athlete loads",
        change: "↑ 100 AU · +21%",
        changeStyle: "text-orange-600",
        distribution: {
          improved: 10,
          similar: 8,
          declined: 9,
        },
      },
    ],
  },

  {
    title: "RECOVERY CONTEXT",
    subtitle: "Before the session",
    tone: "green",
    rows: [
      {
        metric: "Sleep Quality",
        sessionA: "3 /5",
        sessionADetail: "Okay",
        sessionB: "4 /5",
        sessionBDetail: "Good",
        change: "↑ 1",
        changeStyle: "text-green-600",
        distribution: {
          improved: 15,
          similar: 7,
          declined: 5,
        },
      },
      {
        metric: "Muscle Soreness",
        sessionA: "2 /5",
        sessionADetail: "Very sore / heavy",
        sessionB: "2 /5",
        sessionBDetail: "Very sore / heavy",
        change: "→ 0",
        changeStyle: "text-slate-500",
        distribution: {
          improved: 10,
          similar: 12,
          declined: 5,
        },
      },
      {
        metric: "Energy Level",
        sessionA: "3 /5",
        sessionADetail: "Normal",
        sessionB: "4 /5",
        sessionBDetail: "Energetic",
        change: "↑ 1",
        changeStyle: "text-green-600",
        distribution: {
          improved: 16,
          similar: 6,
          declined: 5,
        },
      },
    ],
  },
];

export const sessionContext = [
  ["Same training type", "Speed Endurance"],
  ["Similar training phase", "General Preparation"],
  ["Similar workout structure", "3 × 150 m · 90–95%"],
  ["Similar intended intensity", "High"],
  ["Similar recovery", "8 min between reps"],
  ["Similar conditions", "Outdoor track"],
  ["Same athlete group", "U18 Sprint Group"],
];
