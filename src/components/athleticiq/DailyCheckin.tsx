import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { saveDailyCheckin } from "@/lib/athletic.functions";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

interface Props {
  name: string;
  onClose: () => void;
}

type Answers = {
  discipline: string | null;
  is_rest_day: boolean;
  duration_min: number | null;
  rpe: number | null;
  has_pain: boolean | null;
  pain_note: string | null;
  satisfaction: number | null;
  last_meal_before: string | null;
  ate_around_training: string | null;
  food_note: string | null;
  water_intake: string | null;
  sleep_hours: string | null;
  sleep_quality: number | null;
  woke_recovered: string | null;
  overall_feeling: number | null;
  extra_note: string | null;
};

const empty: Answers = {
  discipline: null, is_rest_day: false, duration_min: null, rpe: null,
  has_pain: null, pain_note: null, satisfaction: null,
  last_meal_before: null, ate_around_training: null, food_note: null,
  water_intake: null, sleep_hours: null, sleep_quality: null,
  woke_recovered: null, overall_feeling: null, extra_note: null,
};

const disciplines = [
  "Sprint", "Mittelstrecke", "Langstrecke", "Hürden", "Weitsprung", "Hochsprung",
  "Kugel", "Diskus", "Speer", "Hammer", "Mehrkampf", "Kraft", "Technik", "Recovery", "Ruhetag",
];

export function DailyCheckin({ name, onClose }: Props) {
  const qc = useQueryClient();
  const saveFn = useServerFn(saveDailyCheckin);
  const [step, setStep] = useState(0); // 0 = greeting, 1..N = questions, last = summary
  const [a, setA] = useState<Answers>(empty);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [painText, setPainText] = useState("");
  const [foodText, setFoodText] = useState("");
  const [extraText, setExtraText] = useState("");

  const mutate = useMutation({
    mutationFn: async (payload: Answers) => saveFn({ data: payload }),
    onSuccess: (res) => {
      setAiSummary((res as { checkin: { ai_summary: string | null } }).checkin.ai_summary ?? null);
      qc.invalidateQueries({ queryKey: ["today-checkin"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Sequence: greeting, then question keys based on rest day skip
  const trainingQs = ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9", "Q10", "Q11", "Q12", "Q13", "Q14"];
  const restQs = ["Q1", "Q6", "Q7", "Q8", "Q9", "Q10", "Q11", "Q12", "Q13", "Q14"];
  const qs = a.is_rest_day ? restQs : trainingQs;
  const totalQ = qs.length;

  function update<K extends keyof Answers>(k: K, v: Answers[K]) {
    setA((p) => ({ ...p, [k]: v }));
  }
  function next() { setStep((s) => s + 1); }
  function back() { setStep((s) => Math.max(0, s - 1)); }

  async function finish(finalAnswers: Answers) {
    const payload = { ...finalAnswers, pain_note: painText || null, food_note: foodText || null, extra_note: extraText || null };
    setA(payload);
    await mutate.mutateAsync(payload);
    setStep(totalQ + 2); // summary step
  }

  // Render
  const progressIdx = step === 0 ? 0 : Math.min(step, totalQ);
  const isSummary = step === totalQ + 2;

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
        {step > 0 && !isSummary ? (
          <button onClick={back} className="p-2 hover:bg-white/5 rounded-lg" aria-label="Zurück">
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : <div className="w-9" />}
        <div className="flex-1">
          {!isSummary && (
            <>
              <div className="text-xs text-white/60 mb-1">{progressIdx} / {totalQ}</div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-accent transition-all" style={{ width: `${(progressIdx / totalQ) * 100}%` }} />
              </div>
            </>
          )}
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg" aria-label="Schließen">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-8 max-w-2xl w-full mx-auto">
        {step === 0 && (
          <Step question={`Hey ${name} 👋`} sub="Schneller Daily Check-in — dauert ca. 2 Minuten.">
            <Button size="lg" className="w-full" onClick={next}>Los geht's</Button>
          </Step>
        )}

        {step > 0 && !isSummary && (() => {
          const key = qs[step - 1];
          switch (key) {
            case "Q1":
              return (
                <Step question="Welche Disziplin hast du heute trainiert?">
                  <Grid options={disciplines} value={a.discipline} onSelect={(v) => {
                    const rest = v === "Ruhetag";
                    const updated = { ...a, discipline: v, is_rest_day: rest };
                    setA(updated);
                    if (rest) {
                      toast.success("Ok — Ruhetag eingetragen. Streak bleibt erhalten 💤");
                      finish(updated);
                    } else {
                      setStep((s) => s + 1);
                    }
                  }} />
                </Step>
              );
            case "Q2":
              return (
                <Step question="Wie lange hast du trainiert?">
                  <Grid options={["20 min", "30 min", "45 min", "60 min", "90 min", "120+ min"]} value={a.duration_min ? `${a.duration_min} min` : null}
                    onSelect={(v) => { update("duration_min", parseInt(v)); next(); }} />
                </Step>
              );
            case "Q3":
              return (
                <Step question="Wie hart war's? (RPE 1–10)">
                  <RateBar max={10} value={a.rpe} onSelect={(v) => { update("rpe", v); next(); }} />
                </Step>
              );
            case "Q4":
              return (
                <Step question="Hattest du Schmerzen oder Beschwerden?">
                  <Grid options={["Nein", "Ja"]} value={a.has_pain === null ? null : (a.has_pain ? "Ja" : "Nein")}
                    onSelect={(v) => { const yes = v === "Ja"; update("has_pain", yes); if (!yes) { setPainText(""); next(); } }} />
                  {a.has_pain && (
                    <div className="mt-6">
                      <textarea value={painText} onChange={(e) => setPainText(e.target.value)}
                        placeholder="Was tut weh?" rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/40" />
                      <Button className="w-full mt-3" onClick={next} disabled={!painText.trim()}>Weiter</Button>
                    </div>
                  )}
                </Step>
              );
            case "Q5":
              return (
                <Step question="Wie zufrieden warst du mit der Session?">
                  <EmojiRate value={a.satisfaction} options={["😞","😐","🙂","😊","🔥"]}
                    onSelect={(v) => { update("satisfaction", v); next(); }} />
                </Step>
              );
            case "Q6":
              return (
                <Step question="Wann hast du zuletzt vor dem Training gegessen?">
                  <Grid options={["30 min", "1 h", "2 h", "3 h+", "Nüchtern", "Nicht trainiert"]}
                    value={a.last_meal_before}
                    onSelect={(v) => { update("last_meal_before", v); next(); }} />
                </Step>
              );
            case "Q7":
              return (
                <Step question="Hast du vor und/oder nach dem Training gegessen?">
                  <Grid options={["Davor", "Danach", "Beides", "Keins"]}
                    value={a.ate_around_training}
                    onSelect={(v) => { update("ate_around_training", v); next(); }} />
                </Step>
              );
            case "Q8":
              return (
                <Step question="Was hast du heute gegessen?">
                  <textarea value={foodText} onChange={(e) => setFoodText(e.target.value)}
                    placeholder="z.B. Haferflocken mit Beeren, Hähnchen-Bowl..." rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/40" />
                  <Button className="w-full mt-4" onClick={next}>Weiter</Button>
                </Step>
              );
            case "Q9":
              return (
                <Step question="Wie viel Wasser hast du getrunken?">
                  <Grid options={["<1 L", "1–1,5 L", "1,5–2 L", "2–2,5 L", "2,5 L+"]}
                    value={a.water_intake}
                    onSelect={(v) => { update("water_intake", v); next(); }} />
                </Step>
              );
            case "Q10":
              return (
                <Step question="Wie viele Stunden hast du geschlafen?">
                  <Grid options={["<5 h", "5–6 h", "6–7 h", "7–8 h", "8–9 h", "9 h+"]}
                    value={a.sleep_hours}
                    onSelect={(v) => { update("sleep_hours", v); next(); }} />
                </Step>
              );
            case "Q11":
              return (
                <Step question="Schlafqualität (1–10)">
                  <RateBar max={10} value={a.sleep_quality} onSelect={(v) => { update("sleep_quality", v); next(); }} />
                </Step>
              );
            case "Q12":
              return (
                <Step question="Bist du erholt aufgewacht?">
                  <Grid options={["Ja", "Teilweise", "Nein"]} value={a.woke_recovered}
                    onSelect={(v) => { update("woke_recovered", v); next(); }} />
                </Step>
              );
            case "Q13":
              return (
                <Step question="Wie fühlst du dich heute insgesamt?">
                  <RateBar max={5} value={a.overall_feeling} onSelect={(v) => { update("overall_feeling", v); next(); }} />
                </Step>
              );
            case "Q14":
              return (
                <Step question="Noch etwas anzumerken?" sub="Optional — kannst du auch überspringen.">
                  <textarea value={extraText} onChange={(e) => setExtraText(e.target.value)}
                    placeholder="z.B. Stimmung, Gedanken, Beobachtungen..." rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/40" />
                  <div className="flex gap-3 mt-4">
                    <Button variant="outline" className="flex-1" onClick={() => finish(a)} disabled={mutate.isPending}>
                      Überspringen
                    </Button>
                    <Button className="flex-1" onClick={() => finish(a)} disabled={mutate.isPending}>
                      {mutate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fertig"}
                    </Button>
                  </div>
                </Step>
              );
          }
          return null;
        })()}

        {isSummary && (
          <div className="text-center pt-12">
            <div className="mx-auto w-16 h-16 rounded-full bg-accent/20 grid place-items-center mb-6">
              <Check className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Check-in fertig 🎉</h2>
            <p className="text-white/80 leading-relaxed mb-8 max-w-md mx-auto">
              {aiSummary ?? "Tagescheck gespeichert."}
            </p>
            <Button size="lg" className="w-full max-w-sm" onClick={onClose}>Zurück zum Dashboard</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Step({ question, sub, children }: { question: string; sub?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2 leading-tight">{question}</h2>
      {sub && <p className="text-white/60 mb-6">{sub}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Grid({ options, value, onSelect }: { options: string[]; value: string | null; onSelect: (v: string) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {options.map((opt) => (
        <button key={opt} onClick={() => onSelect(opt)}
          className={`px-4 py-3 rounded-xl border text-sm font-medium transition ${
            value === opt
              ? "bg-accent text-accent-foreground border-accent"
              : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
          }`}>
          {opt}
        </button>
      ))}
    </div>
  );
}

function RateBar({ max, value, onSelect }: { max: number; value: number | null; onSelect: (v: number) => void }) {
  return (
    <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${max}, minmax(0,1fr))` }}>
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button key={n} onClick={() => onSelect(n)}
          className={`aspect-square rounded-xl border font-semibold transition ${
            value === n
              ? "bg-accent text-accent-foreground border-accent"
              : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
          }`}>
          {n}
        </button>
      ))}
    </div>
  );
}

function EmojiRate({ options, value, onSelect }: { options: string[]; value: number | null; onSelect: (v: number) => void }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {options.map((emo, i) => (
        <button key={emo} onClick={() => onSelect(i + 1)}
          className={`aspect-square rounded-xl border text-3xl transition ${
            value === i + 1
              ? "bg-accent/20 border-accent"
              : "bg-white/5 border-white/10 hover:bg-white/10"
          }`}>
          {emo}
        </button>
      ))}
    </div>
  );
}