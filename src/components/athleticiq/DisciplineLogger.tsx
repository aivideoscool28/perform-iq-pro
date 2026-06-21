import { useEffect, useMemo, useState } from "react";
import { Plus, Check, Trophy, Trash2, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Discipline = { id: string; name: string; pb?: string; primary?: boolean };
type LogEntry = { id: string; discipline: string; date: string; note?: string };

const PROFILE_KEY = "athleticiq.profile.v1";
const LOG_KEY = "athleticiq.training.disciplines.v1";

const FALLBACK: Discipline[] = [
  { id: "dc1", name: "100 m Sprint", primary: true },
  { id: "dc2", name: "200 m Sprint" },
  { id: "dc3", name: "Weitsprung" },
];

function loadDisciplines(): Discipline[] {
  if (typeof window === "undefined") return FALLBACK;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return FALLBACK;
    const parsed = JSON.parse(raw);
    const list = parsed?.disciplines as Discipline[] | undefined;
    return Array.isArray(list) && list.length > 0 ? list : FALLBACK;
  } catch {
    return FALLBACK;
  }
}

function loadLog(): LogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? (JSON.parse(raw) as LogEntry[]) : [];
  } catch {
    return [];
  }
}

function saveLog(next: LogEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOG_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("athleticiq:log-updated"));
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "short" });

export function DisciplineLogger() {
  const [disciplines, setDisciplines] = useState<Discipline[]>(FALLBACK);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [custom, setCustom] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    setDisciplines(loadDisciplines());
    setLog(loadLog());

    const refresh = () => setLog(loadLog());
    window.addEventListener("storage", refresh);
    window.addEventListener("athleticiq:log-updated", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("athleticiq:log-updated", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const activeName = useMemo(() => custom.trim() || selected || note.trim(), [custom, selected, note]);

  const submit = () => {
    const name = activeName;
    if (!name) {
      toast.error("Bitte trage eine Übung ein");
      return;
    }
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      discipline: name,
      date: new Date().toISOString().slice(0, 10),
      note: custom.trim() || selected ? note.trim() || undefined : undefined,
    };
    const next = [entry, ...loadLog()];
    saveLog(next);
    setLog(next);
    setSelected(null);
    setCustom("");
    setNote("");
    toast.success(`${name} eingetragen`);
  };

  const remove = (id: string) => {
    const next = loadLog().filter((e) => e.id !== id);
    saveLog(next);
    setLog(next);
  };

  return (
    <div className="glass-strong rounded-3xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <Target className="h-3.5 w-3.5" /> Disziplin eintragen
          </div>
          <h3 className="text-lg font-bold mt-1">Was hast du heute trainiert?</h3>
        </div>
        {log.length > 0 && (
          <Badge className="bg-neon-lime/15 text-neon-lime border-neon-lime/30">
            {log.length} {log.length === 1 ? "Eintrag" : "Einträge"}
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {disciplines.map((d) => {
          const active = selected === d.name && !custom.trim();
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                setSelected((s) => (s === d.name ? null : d.name));
                setCustom("");
              }}
              className={[
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
                active
                  ? "border-neon-cyan/60 bg-neon-cyan/10 text-neon-cyan glow-cyan"
                  : "border-border/60 bg-white/[0.02] hover:border-neon-cyan/40",
              ].join(" ")}
            >
              {d.name}
              {d.primary && <span className="ml-1.5 text-neon-amber">★</span>}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          value={custom}
          onChange={(e) => {
            setCustom(e.target.value);
            if (e.target.value.trim()) setSelected(null);
          }}
          placeholder="Welche Übung? z.B. 30min run"
          className="bg-elevated"
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Details optional · z.B. locker, 5 km"
          className="bg-elevated"
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
      </div>

      <Button
        onClick={submit}
        disabled={!activeName}
        className="w-full mt-4 bg-gradient-to-r from-neon-cyan to-neon-violet text-background font-semibold hover:opacity-90"
      >
        <Plus className="h-4 w-4 mr-2" /> Disziplin eintragen
      </Button>

      {log.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-border/60 p-6 text-center">
          <Trophy className="h-6 w-6 mx-auto text-muted-foreground/60" />
          <p className="mt-2 text-sm text-muted-foreground">
            Noch keine Disziplin eingetragen. Wähle oben eine aus und starte deinen Verlauf.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-2">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Verlauf</div>
          <AnimatePresence initial={false}>
            {log.map((e) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between rounded-xl border border-border/50 bg-white/[0.02] px-3.5 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-neon-lime/15 grid place-items-center shrink-0">
                    <Check className="h-4 w-4 text-neon-lime" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{e.discipline}</div>
                    {e.note && <div className="text-[11px] text-muted-foreground">{e.note}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground tabular-nums">{fmtDate(e.date)}</span>
                  <button
                    type="button"
                    onClick={() => remove(e.id)}
                    aria-label="Eintrag löschen"
                    className="h-7 w-7 grid place-items-center rounded-lg text-muted-foreground hover:text-neon-magenta hover:bg-neon-magenta/10 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
