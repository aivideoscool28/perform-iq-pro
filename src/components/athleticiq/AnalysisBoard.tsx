import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAnalysis } from "@/lib/features/workout-analysis.functions";
import { Check, AlertTriangle, Target, Plus, X, Pencil, Save, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Board {
  id: string;
  workout_id: string;
  positives: string[];
  negatives: string[];
  improvements: string[];
  is_ai_generated: boolean;
  created_at: string;
}

interface Workout {
  id: string;
  summary: string | null;
  duration_minutes: number | null;
  intensity: string | null;
  workout_date: string;
}

interface Props {
  board: Board;
  workout?: Workout;
}

const sections = [
  { key: "positives", label: "Positives", icon: Check, color: "neon-lime" },
  { key: "negatives", label: "Zu verbessern", icon: AlertTriangle, color: "neon-amber" },
  { key: "improvements", label: "Nächstes Mal", icon: Target, color: "neon-violet" },
] as const;

export function AnalysisBoard({ board, workout }: Props) {
  const fn = useServerFn(updateAnalysis);
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [state, setState] = useState({
    positives: board.positives ?? [],
    negatives: board.negatives ?? [],
    improvements: board.improvements ?? [],
  });

  const save = useMutation({
    mutationFn: () =>
      fn({
        data: {
          id: board.id,
          positives: state.positives,
          negatives: state.negatives,
          improvements: state.improvements,
        },
      }),
    onSuccess: () => {
      toast.success("Analyse gespeichert");
      setEditing(false);
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["history"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Speichern fehlgeschlagen"),
  });

  const update = (key: keyof typeof state, idx: number, value: string) =>
    setState((s) => ({ ...s, [key]: s[key].map((v, i) => (i === idx ? value : v)) }));
  const add = (key: keyof typeof state) => setState((s) => ({ ...s, [key]: [...s[key], ""] }));
  const remove = (key: keyof typeof state, idx: number) =>
    setState((s) => ({ ...s, [key]: s[key].filter((_, i) => i !== idx) }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 md:p-6"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span>{new Date(board.created_at).toLocaleDateString("de", { day: "2-digit", month: "short", year: "numeric" })}</span>
            {board.is_ai_generated && (
              <span className="inline-flex items-center gap-1 text-neon-violet">
                <Sparkles className="h-3 w-3" /> KI
              </span>
            )}
          </div>
          <h3 className="font-semibold text-base mt-1 truncate">
            {workout?.summary ?? "Workout-Analyse"}
          </h3>
          {workout && (workout.duration_minutes || workout.intensity) && (
            <div className="text-xs text-muted-foreground mt-0.5">
              {workout.duration_minutes ? `${workout.duration_minutes} min` : ""}
              {workout.duration_minutes && workout.intensity ? " · " : ""}
              {workout.intensity ? `Intensität: ${workout.intensity}` : ""}
            </div>
          )}
        </div>
        <button
          onClick={() => (editing ? save.mutate() : setEditing(true))}
          disabled={save.isPending}
          className="shrink-0 inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg glass border border-border hover:bg-white/5 transition"
        >
          {editing ? <Save className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
          {editing ? "Speichern" : "Bearbeiten"}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {sections.map((s) => (
          <div key={s.key} className="rounded-xl bg-elevated/50 border border-border/60 p-4">
            <div className={`flex items-center gap-2 text-xs font-semibold mb-3 text-${s.color}`}>
              <s.icon className="h-4 w-4" />
              <span className="uppercase tracking-wider">{s.label}</span>
            </div>
            <ul className="space-y-2">
              {state[s.key].map((item, i) => (
                <li key={i} className="flex gap-2 items-start text-sm leading-snug">
                  {editing ? (
                    <>
                      <input
                        value={item}
                        onChange={(e) => update(s.key, i, e.target.value)}
                        className="flex-1 bg-background/50 border border-border rounded px-2 py-1 text-xs"
                      />
                      <button
                        onClick={() => remove(s.key, i)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className={`mt-1.5 h-1 w-1 rounded-full bg-${s.color} shrink-0`} />
                      <span>{item}</span>
                    </>
                  )}
                </li>
              ))}
            </ul>
            {editing && (
              <button
                onClick={() => add(s.key)}
                className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3 w-3" /> Hinzufügen
              </button>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

