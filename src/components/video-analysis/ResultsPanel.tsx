import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Gauge,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type {
  Finding,
  Kpi,
  OverallScore,
} from "@/components/video-analysis/types";

type ResultsPanelProps = {
  overall: OverallScore;
  findings: Finding[];
  onOpenScore: () => void;
  onOpenFinding: (finding: Finding) => void;
};

export function ResultsPanel({
  overall,
  findings,
  onOpenScore,
  onOpenFinding,
}: ResultsPanelProps) {
  return (
    <div className="glass-strong rounded-3xl p-6">
      <button
        type="button"
        onClick={onOpenScore}
        className="w-full text-left group rounded-2xl -m-2 p-2 hover:bg-white/[0.03] transition"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-neon-violet">
            <Sparkles className="h-3.5 w-3.5" />
            KI Bewertung
          </div>

          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-neon-violet transition" />
        </div>

        <div className="mt-2 flex items-end gap-2">
          <span className="text-5xl font-bold gradient-text tabular-nums">
            {overall.score}
          </span>

          <span className="text-sm text-muted-foreground mb-1">
            / 10
          </span>
        </div>

        <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
          {overall.reasoning}
        </p>

        <div className="text-[10px] text-neon-violet/80 mt-2 group-hover:text-neon-violet">
          Details & Begründung →
        </div>
      </button>

      <div className="mt-5 space-y-2.5">
        {findings.map((finding, index) => (
          <button
            type="button"
            key={`${finding.joint}-${index}`}
            onClick={() => onOpenFinding(finding)}
            className="w-full flex items-center justify-between rounded-xl border border-border/50 bg-white/[0.02] px-3 py-2.5 hover:bg-white/[0.05] hover:border-neon-cyan/40 transition text-left group"
          >
            <div className="flex items-center gap-2.5">
              {finding.status === "warn" ? (
                <AlertTriangle className="h-4 w-4 text-neon-amber shrink-0" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-neon-lime shrink-0" />
              )}

              <div>
                <div className="text-sm font-semibold">
                  {finding.joint}
                </div>

                <div className="text-[10px] text-muted-foreground">
                  Soll: {finding.ideal}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Badge
                className={
                  finding.status === "ok"
                    ? "bg-neon-lime/15 text-neon-lime border-neon-lime/30"
                    : "bg-neon-amber/15 text-neon-amber border-neon-amber/30"
                }
              >
                {finding.val}
                {finding.unit}
              </Badge>

              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-neon-cyan transition" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

type KpiPanelProps = {
  kpis: Kpi[];
};

export function KpiPanel({
  kpis,
}: KpiPanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
      {kpis.map((kpi, index) => {
        const Icon =
          [Gauge, Activity, Sparkles][index % 3];

        return (
          <div
            key={`${kpi.title}-${index}`}
            className="glass rounded-3xl p-5 flex items-center gap-4"
          >
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-violet/20 grid place-items-center">
              <Icon className="h-5 w-5 text-neon-cyan" />
            </div>

            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {kpi.title}
              </div>

              <div className="text-xl font-bold tabular-nums">
                {kpi.val}
              </div>

              <div className="text-[11px] text-muted-foreground">
                {kpi.note}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
