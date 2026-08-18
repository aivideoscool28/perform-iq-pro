export type Finding = {
  joint: string;
  val: number;
  unit: string;
  ideal: string;
  status: "ok" | "warn";
  reasoning: string;
  data: { label: string; value: string }[];
  recommendation: string;
};

export type Kpi = {
  title: string;
  val: string;
  note: string;
};

export type OverallScore = {
  score: number;
  reasoning: string;
  data: { label: string; value: string }[];
  recommendation: string;
};

export type AnalysisResult = {
  detectedMovement: string;
  findings: Finding[];
  overall: OverallScore;
  kpis: Kpi[];
};
