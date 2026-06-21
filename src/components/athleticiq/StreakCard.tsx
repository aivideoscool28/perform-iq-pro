import { motion } from "framer-motion";
import { Flame, Snowflake } from "lucide-react";

interface Props {
  current: number;
  longest: number;
  workedOutToday: boolean;
  freezes: number;
}

export function StreakCard({ current, longest, workedOutToday, freezes }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <motion.div
            animate={workedOutToday ? { rotate: [0, -6, 6, -3, 0] } : {}}
            transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 2 }}
            className={`h-16 w-16 rounded-2xl grid place-items-center ${
              workedOutToday
                ? "bg-accent text-accent-foreground"
                : "bg-secondary border border-border text-muted-foreground"
            }`}
          >
            <Flame className="h-8 w-8" strokeWidth={2.2} />
          </motion.div>
          {workedOutToday && (
            <span className="absolute -bottom-1 -right-1 text-[10px] uppercase tracking-wider bg-foreground text-background font-bold rounded-full px-1.5 py-0.5">
              Heute
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Aktueller Streak
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-4xl font-semibold tabular-nums">{current}</span>
            <span className="text-sm text-muted-foreground">Tage</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Rekord: <span className="text-foreground font-medium">{longest}</span>
            {freezes > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-foreground">
                <Snowflake className="h-3 w-3" /> {freezes} Freeze
              </span>
            )}
          </div>
        </div>
      </div>
      {!workedOutToday && current > 0 && (
        <div className="mt-4 text-xs px-3 py-2 rounded-lg bg-secondary border border-border text-foreground">
          Logge heute ein Training, um deinen Streak zu halten.
        </div>
      )}
    </motion.div>
  );
}
