import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logWorkoutFromText } from "@/lib/features/workout.functions";
import { Send, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface ChatMessage {
  role: "user" | "ai";
  text: string;
}

export function WorkoutChat({ name }: { name: string }) {
  const fn = useServerFn(logWorkoutFromText);
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: (text: string) => fn({ data: { text } }),
    onSuccess: (res) => {
      const w = res.workout as { summary?: string; duration_minutes?: number | null };
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text: `✅ Eingetragen: ${w.summary ?? "Training"}${
            w.duration_minutes ? ` · ${w.duration_minutes} min` : ""
          }. Streak aktualisiert!`,
        },
      ]);
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Workout gespeichert");
    },
    onError: (e) => {
      const msg = e instanceof Error ? e.message : "Fehler";
      setMessages((m) => [...m, { role: "ai", text: `⚠️ ${msg}` }]);
      toast.error(msg);
    },
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = () => {
    if (!text.trim() || mutation.isPending) return;
    const t = text.trim();
    setMessages((m) => [...m, { role: "user", text: t }]);
    setText("");
    mutation.mutate(t);
  };

  return (
    <div className="glass-strong rounded-3xl p-6 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-neon-violet/15 blur-3xl pointer-events-none" />

      <div className="relative flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-violet grid place-items-center">
          <Sparkles className="h-5 w-5 text-background" />
        </div>
        <div>
          <div className="font-semibold">Hey {name} 👋</div>
          <div className="text-xs text-muted-foreground">
            Welche Übungen hast du heute gemacht? Schreib's mir einfach in einem Satz.
          </div>
        </div>
      </div>

      <div className="relative space-y-2 max-h-56 overflow-y-auto mb-3">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                  m.role === "user"
                    ? "bg-gradient-to-br from-neon-cyan/20 to-neon-violet/20 border border-neon-cyan/30"
                    : "bg-elevated border border-border"
                }`}
              >
                {m.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {mutation.isPending && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pl-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            KI analysiert dein Training…
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="relative flex items-center gap-2 bg-elevated border border-border rounded-2xl px-4 py-2 focus-within:border-neon-cyan/50 transition"
      >
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="z.B. '30min easy run und 4×8 Kniebeugen mit 100kg'"
          disabled={mutation.isPending}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!text.trim() || mutation.isPending}
          className="h-9 w-9 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-violet text-background grid place-items-center disabled:opacity-40 transition hover:opacity-90"
        >
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}

