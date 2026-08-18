import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type {
  Finding,
  OverallScore,
} from "@/components/video-analysis/types";

type AnalysisDetailsProps = {
  finding: Finding | null;
  scoreOpen: boolean;
  overall: OverallScore;

  onFindingClose: () => void;
  onScoreOpenChange: (open: boolean) => void;
};

export function AnalysisDetails({
  finding,
  scoreOpen,
  overall,
  onFindingClose,
  onScoreOpenChange,
}: AnalysisDetailsProps) {
  return (
    <>
      <Dialog
        open={!!finding}
        onOpenChange={(open) => {
          if (!open) onFindingClose();
        }}
      >
        <DialogContent className="glass-strong border-border/60 max-w-lg">
          {finding && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  {finding.status === "warn" ? (
                    <AlertTriangle className="h-5 w-5 text-neon-amber" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-neon-lime" />
                  )}

                  <DialogTitle className="text-xl">
                    {finding.joint}
                  </DialogTitle>

                  <Badge
                    className={
                      finding.status === "ok"
                        ? "bg-neon-lime/15 text-neon-lime border-neon-lime/30 ml-auto"
                        : "bg-neon-amber/15 text-neon-amber border-neon-amber/30 ml-auto"
                    }
                  >
                    {finding.val}
                    {finding.unit}
                  </Badge>
                </div>

                <DialogDescription className="text-left pt-2">
                  {finding.reasoning}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-2">
                <div className="text-[11px] uppercase tracking-[0.2em] text-neon-cyan mb-2">
                  Zugrunde liegende Daten
                </div>

                <div className="rounded-xl border border-border/50 divide-y divide-border/40">
                  {finding.data.map((item, index) => (
                    <div
                      key={`${item.label}-${index}`}
                      className="flex justify-between px-3 py-2 text-sm"
                    >
                      <span className="text-muted-foreground">
                        {item.label}
                      </span>

                      <span className="font-semibold tabular-nums">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-2 rounded-xl border border-neon-violet/30 bg-neon-violet/5 p-3">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-neon-violet mb-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  KI-Empfehlung
                </div>

                <p className="text-sm">
                  {finding.recommendation}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={scoreOpen}
        onOpenChange={onScoreOpenChange}
      >
        <DialogContent className="glass-strong border-border/60 max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-neon-violet" />

              <DialogTitle className="text-xl">
                KI Gesamtbewertung
              </DialogTitle>

              <span className="ml-auto text-3xl font-bold gradient-text tabular-nums">
                {overall.score}
              </span>
            </div>

            <DialogDescription className="text-left pt-2">
              {overall.reasoning}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2">
            <div className="text-[11px] uppercase tracking-[0.2em] text-neon-cyan mb-2">
              Score-Zusammensetzung
            </div>

            <div className="rounded-xl border border-border/50 divide-y divide-border/40">
              {overall.data.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className="flex justify-between px-3 py-2 text-sm"
                >
                  <span className="text-muted-foreground">
                    {item.label}
                  </span>

                  <span className="font-semibold tabular-nums">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2 rounded-xl border border-neon-violet/30 bg-neon-violet/5 p-3">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-neon-violet mb-1">
              <TrendingUp className="h-3.5 w-3.5" />
              Nächste Schritte
            </div>

            <p className="text-sm">
              {overall.recommendation}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
