export type CoachVideo = {
  id: string;
  title: string;
  athlete: string;
  initials: string;
  date: string;
  context: string;
  discipline: string;
  secondaryTag: string;
  score: number;
  previousScore: number;
  findings: number;
  reviewStatus: "needs-review" | "reviewed";
  cameraView: string;
  videoQuality: string;
};

export const coachVideos: CoachVideo[] = [
  {
    id: "block-start-3",
    title: "Block Start #3",
    athlete: "Jonas Richter",
    initials: "JR",
    date: "May 19, 2025",
    context: "Training",
    discipline: "Start Acceleration",
    secondaryTag: "Technical",
    score: 7.8,
    previousScore: 7.1,
    findings: 3,
    reviewStatus: "needs-review",
    cameraView: "Side view",
    videoQuality: "Good",
  },
  {
    id: "hurdle-rhythm-2",
    title: "Hurdle Rhythm #2",
    athlete: "Sarah Braun",
    initials: "SB",
    date: "May 18, 2025",
    context: "Training",
    discipline: "Hurdle Technique",
    secondaryTag: "Rhythm",
    score: 6.4,
    previousScore: 6.7,
    findings: 4,
    reviewStatus: "reviewed",
    cameraView: "Side view",
    videoQuality: "Good",
  },
  {
    id: "max-velocity-1",
    title: "Max Velocity #1",
    athlete: "Tom Klein",
    initials: "TK",
    date: "May 17, 2025",
    context: "Competition",
    discipline: "Top Speed",
    secondaryTag: "Stride Mechanics",
    score: 8.2,
    previousScore: 7.0,
    findings: 2,
    reviewStatus: "reviewed",
    cameraView: "Side view",
    videoQuality: "Good",
  },
  {
    id: "hurdle-lead-leg-1",
    title: "Hurdle Lead Leg #1",
    athlete: "Liam Peters",
    initials: "LP",
    date: "May 16, 2025",
    context: "Training",
    discipline: "Lead Leg",
    secondaryTag: "Clearance",
    score: 6.9,
    previousScore: 6.5,
    findings: 3,
    reviewStatus: "needs-review",
    cameraView: "Diagonal side view",
    videoQuality: "Usable",
  },
  {
    id: "drive-phase-2",
    title: "Drive Phase #2",
    athlete: "Mia Wagner",
    initials: "MW",
    date: "May 15, 2025",
    context: "Training",
    discipline: "Acceleration",
    secondaryTag: "Posture",
    score: 7.3,
    previousScore: 6.8,
    findings: 2,
    reviewStatus: "needs-review",
    cameraView: "Side view",
    videoQuality: "Good",
  },
];

export const blockStartAnalysis = {
  score: 7.8,

  breakdown: [
    { label: "Start Position", score: 8.2 },
    { label: "Projection", score: 7.4 },
    { label: "First Step", score: 7.6 },
    { label: "Transition", score: 8.0 },
  ],

  strengths: [
    {
      title: "Strong initial projection",
      detail: "Good horizontal intent immediately after block exit.",
      moment: "00:01",
    },
    {
      title: "Arm action remains coordinated",
      detail: "Upper-body action stays controlled through the first steps.",
      moment: "00:02",
    },
  ],

  focusAreas: [
    {
      title: "Torso rises early during steps 2–3",
      detail:
        "The upper body becomes upright slightly earlier than in the previous comparable video.",
      why:
        "This may reduce how long horizontal projection is maintained during early acceleration.",
      how:
        "Review the first three contacts and cue the athlete to stay patient through the initial drive phase.",
      moment: "00:02–00:03",
    },
    {
      title: "First-step direction slightly inward",
      detail:
        "The first contact appears slightly closer to the body's midline than in the previous clip.",
      why:
        "A more consistent direction may support cleaner acceleration mechanics.",
      how:
        "Review foot placement and first-step direction during block-start practice.",
      moment: "00:01–00:02",
    },
  ],
};
