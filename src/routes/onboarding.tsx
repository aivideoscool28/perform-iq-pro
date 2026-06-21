import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { saveOnboarding, generateGoalReply } from "@/lib/athletic.functions";
import { markTourPending } from "@/lib/tour";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Camera, Loader2, Send, Sparkles, User } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Athleticiq · Onboarding" }] }),
  component: OnboardingPage,
});

type Step =
  | { key: "name"; kind: "text"; q: string; placeholder: string }
  | { key: "photo"; kind: "photo"; q: string }
  | { key: "age"; kind: "number"; q: string; placeholder: string }
  | { key: "height"; kind: "height"; q: string }
  | { key: "weight"; kind: "weight"; q: string }
  | { key: "disciplines"; kind: "multi"; q: string; options: string[] }
  | { key: "goal_text"; kind: "goal"; q: string; placeholder: string }
  | { key: "experience"; kind: "single"; q: string; options: string[] }
  | { key: "days"; kind: "single"; q: string; options: string[] }
  | { key: "setup"; kind: "single"; q: string; options: string[] }
  | { key: "injuries"; kind: "text-skip"; q: string; placeholder: string };

const STEPS: Step[] = [
  { key: "name", kind: "text", q: "Hey! Wie heißt du?", placeholder: "Dein Name" },
  { key: "photo", kind: "photo", q: "Lad ein Profilfoto hoch, damit dein Profil noch persönlicher wird (optional)." },
  { key: "age", kind: "number", q: "Cool, freut mich dich kennenzulernen! Wie alt bist du?", placeholder: "z.B. 22" },
  { key: "height", kind: "height", q: "Wie groß bist du?" },
  { key: "weight", kind: "weight", q: "Und wie viel wiegst du aktuell?" },
  {
    key: "disciplines",
    kind: "multi",
    q: "In welcher Leichtathletik-Disziplin trainierst du? (Mehrfachauswahl möglich)",
    options: [
      "Sprint", "Mittelstrecke", "Langstrecke", "Hürden",
      "Weitsprung", "Hochsprung", "Kugelstoßen", "Diskus",
      "Speer", "Hammer", "Mehrkampf", "Kraft", "Technik", "Andere",
    ],
  },
  {
    key: "goal_text",
    kind: "goal",
    q: "Was ist gerade dein wichtigstes Ziel? Schreib einfach in deinen eigenen Worten — z.B. „Ich will eine sub-12 auf 100m laufen“ oder „Mehr Beinkraft für meine Sprünge“.",
    placeholder: "Mein Ziel ist…",
  },
  { key: "experience", kind: "single", q: "Wie lange machst du schon Leichtathletik?", options: ["< 1 Jahr", "1–3 Jahre", "3–5 Jahre", "5–10 Jahre", "10+ Jahre"] },
  { key: "days", kind: "single", q: "Wie viele Tage pro Woche trainierst du normalerweise?", options: ["1", "2", "3", "4", "5", "6", "7"] },
  { key: "setup", kind: "single", q: "Trainierst du mit einem Coach oder alleine?", options: ["Coach", "Verein", "Beides", "Alleine"] },
  { key: "injuries", kind: "text-skip", q: "Letzte Frage: Gibt es Verletzungen oder körperliche Einschränkungen, die ich kennen sollte?", placeholder: "Beschreibe kurz oder überspringe…" },
];

const AFFIRMATIONS = [
  "Schön, dich an Bord zu haben!",
  "Top, sieht super aus!",
  "Notiert!",
  "Alles klar!",
  "Verstanden!",
  "Spannend!",
  "Großartig!",
  "Perfekt!",
  "Gut zu wissen!",
  "Cool, danke!",
];

type Bubble = { role: "ai" | "user"; text: string; avatar?: string };

function OnboardingPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const saveFn = useServerFn(saveOnboarding);
  const goalReplyFn = useServerFn(generateGoalReply);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [bubbles, setBubbles] = useState<Bubble[]>([{ role: "ai", text: STEPS[0].q }]);
  const [text, setText] = useState("");
  const [multi, setMulti] = useState<string[]>([]);

  // photo
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // units
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");
  const [heightVal, setHeightVal] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [weightVal, setWeightVal] = useState("");

  const [goalThinking, setGoalThinking] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [bubbles, goalThinking]);

  const step = STEPS[stepIdx];
  const isDone = stepIdx >= STEPS.length;

  const saveMut = useMutation({
    mutationFn: (vars: Parameters<typeof saveFn>[0]) => saveFn(vars),
    onSuccess: async () => {
      qc.setQueryData(["dashboard"], (old: unknown) => {
        if (!old || typeof old !== "object") return old;
        const o = old as { profile?: Record<string, unknown> };
        return { ...o, profile: { ...(o.profile ?? {}), onboarded_at: new Date().toISOString() } };
      });
      await qc.refetchQueries({ queryKey: ["dashboard"] });
      markTourPending();
      toast.success("Profil gespeichert!");
      navigate({ to: "/" });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Speichern fehlgeschlagen"),
  });

  const pushUser = (t: string, avatar?: string) => setBubbles((b) => [...b, { role: "user", text: t, avatar }]);
  const pushAi = (t: string) => setBubbles((b) => [...b, { role: "ai", text: t }]);

  const goNext = (key: string, value: unknown, customAffirm?: string) => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);
    const next = stepIdx + 1;
    setTimeout(() => {
      pushAi(customAffirm ?? AFFIRMATIONS[stepIdx % AFFIRMATIONS.length]);
      setTimeout(() => {
        if (next < STEPS.length) {
          pushAi(STEPS[next].q);
          setStepIdx(next);
          setText("");
          setMulti([]);
        } else {
          setStepIdx(next);
          const name = (newAnswers.name as string) || "Athlet";
          const discs = (newAnswers.disciplines as string[])?.join(", ") || "—";
          const goal = (newAnswers.goal_text as string) || "—";
          pushAi(`Hier ist dein Athleten-Profil — **${name}**, ${discs}, Ziel: ${goal}. Lass uns starten! 🚀`);
        }
      }, 400);
    }, 250);
  };

  // ---------- handlers ----------
  const submitText = () => {
    if (!text.trim()) return;
    pushUser(text.trim());
    goNext(step.key, text.trim());
  };

  const submitNumber = () => {
    const n = parseInt(text, 10);
    if (!Number.isFinite(n) || n < 8 || n > 99) {
      toast.error("Bitte gib ein gültiges Alter ein (8–99).");
      return;
    }
    pushUser(`${n}`);
    goNext(step.key, n);
  };

  const submitHeight = () => {
    let cm: number | null = null;
    let label = "";
    if (heightUnit === "cm") {
      const n = parseFloat(heightVal);
      if (!Number.isFinite(n) || n < 100 || n > 250) return toast.error("Bitte gültige Größe (100–250 cm).");
      cm = Math.round(n * 10) / 10;
      label = `${cm} cm`;
    } else {
      const ft = parseInt(heightVal, 10);
      const inch = parseInt(heightIn || "0", 10);
      if (!Number.isFinite(ft) || ft < 3 || ft > 8 || inch < 0 || inch > 11) {
        return toast.error("Bitte gültige Größe (ft & in).");
      }
      cm = Math.round((ft * 30.48 + inch * 2.54) * 10) / 10;
      label = `${ft} ft ${inch} in`;
    }
    pushUser(label);
    goNext("height_cm", cm);
  };

  const submitWeight = () => {
    const n = parseFloat(weightVal);
    if (!Number.isFinite(n)) return toast.error("Bitte gültiges Gewicht.");
    let kg: number;
    let label = "";
    if (weightUnit === "kg") {
      if (n < 30 || n > 250) return toast.error("Bitte gültiges Gewicht (30–250 kg).");
      kg = Math.round(n * 10) / 10;
      label = `${kg} kg`;
    } else {
      if (n < 60 || n > 550) return toast.error("Bitte gültiges Gewicht (60–550 lbs).");
      kg = Math.round(n * 0.45359237 * 10) / 10;
      label = `${n} lbs`;
    }
    pushUser(label);
    goNext("weight_kg", kg);
  };

  const submitMulti = () => {
    if (multi.length === 0) return toast.error("Wähle mindestens eine Option.");
    pushUser(multi.join(", "));
    goNext(step.key, multi);
  };

  const submitSingle = (opt: string) => {
    pushUser(opt);
    goNext(step.key, opt);
  };

  const submitInjuries = (skip: boolean) => {
    if (skip) {
      pushUser("Keine — alles gut!");
      goNext(step.key, null);
    } else if (text.trim()) {
      pushUser(text.trim());
      goNext(step.key, text.trim());
    } else toast.error("Schreib etwas oder überspringe.");
  };

  const submitGoal = async () => {
    const g = text.trim();
    if (g.length < 2) return toast.error("Beschreib dein Ziel kurz.");
    pushUser(g);
    setGoalThinking(true);
    let reply = "Starkes Ziel — lass uns das gemeinsam angehen! 💪";
    try {
      const res = await goalReplyFn({ data: { goal: g, name: (answers.name as string) ?? "" } });
      if (res?.reply) reply = res.reply;
    } catch {
      // keep fallback
    }
    setGoalThinking(false);
    goNext("goal_text", g, reply);
  };

  // ---------- photo upload ----------
  const onPickPhoto = async (file: File) => {
    if (!session) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("Bitte ein Bild unter 5 MB wählen.");
    setUploading(true);
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `${session.user.id}/avatar-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, {
        upsert: true,
        contentType: file.type || "image/jpeg",
      });
      if (error) throw error;
      const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60 * 24 * 365);
      const url = signed?.signedUrl ?? null;
      setAvatarPreview(url ?? URL.createObjectURL(file));
      setAvatarPath(path);
      toast.success("Foto hochgeladen!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload fehlgeschlagen");
    } finally {
      setUploading(false);
    }
  };

  const submitPhoto = (skip: boolean) => {
    if (skip || !avatarPath) {
      pushUser("Überspringen für jetzt");
      goNext("avatar_path", null);
    } else {
      pushUser("📸 Profilfoto hochgeladen", avatarPreview ?? undefined);
      goNext("avatar_path", avatarPath);
    }
  };

  const finish = () => {
    const days = parseInt((answers.days as string) || "0", 10);
    saveMut.mutate({
      data: {
        display_name: (answers.name as string) ?? "Athlet",
        age: (answers.age as number) ?? null,
        disciplines: (answers.disciplines as string[]) ?? [],
        goal_text: (answers.goal_text as string) ?? "",
        experience: (answers.experience as string) ?? "",
        training_days_per_week: days || 3,
        training_setup: (answers.setup as string) ?? "",
        injuries: (answers.injuries as string | null) ?? null,
        height_cm: (answers.height_cm as number) ?? null,
        weight_kg: (answers.weight_kg as number) ?? null,
        avatar_url: (answers.avatar_path as string | null) ?? null,
      },
    });
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-neon-cyan" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-neon-violet/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-neon-cyan/15 blur-3xl" />
      <div className="absolute inset-0 grid-bg pointer-events-none" />

      <header className="relative px-6 py-5 flex items-center gap-3 border-b border-border/40">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-violet grid place-items-center glow-cyan">
          <Activity className="h-4 w-4 text-background" strokeWidth={2.5} />
        </div>
        <div>
          <div className="text-sm font-bold">
            Athletic<span className="gradient-text">iq</span> Coach
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Erstes Kennenlernen
          </div>
        </div>
        <div className="ml-auto text-xs text-muted-foreground">
          {Math.min(stepIdx + 1, STEPS.length)} / {STEPS.length}
        </div>
      </header>

      <div ref={scrollRef} className="relative flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-3">
          {bubbles.map((b, i) => (
            <div key={i} className={b.role === "ai" ? "flex" : "flex justify-end items-end gap-2"}>
              {b.role === "user" && b.avatar && (
                <img src={b.avatar} alt="" className="h-8 w-8 rounded-full object-cover border border-border" />
              )}
              <div
                className={
                  b.role === "ai"
                    ? "max-w-[85%] text-sm leading-relaxed"
                    : "max-w-[85%] text-sm px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground"
                }
                dangerouslySetInnerHTML={{
                  __html: b.text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"),
                }}
              />
            </div>
          ))}
          {goalThinking && (
            <div className="flex">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" /> Coach denkt nach…
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative border-t border-border/40 bg-background/80 backdrop-blur px-4 py-4">
        <div className="max-w-2xl mx-auto">
          {!isDone && step.kind === "text" && (
            <form onSubmit={(e) => { e.preventDefault(); submitText(); }} className="flex gap-2">
              <input
                autoFocus value={text} onChange={(e) => setText(e.target.value)}
                placeholder={step.placeholder}
                className="flex-1 h-11 px-4 rounded-xl bg-elevated border border-border focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 text-sm"
              />
              <button className="h-11 w-11 grid place-items-center rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet text-background">
                <Send className="h-4 w-4" />
              </button>
            </form>
          )}

          {!isDone && step.kind === "photo" && (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="relative h-20 w-20 rounded-full border-2 border-dashed border-border hover:border-neon-cyan/60 grid place-items-center overflow-hidden bg-elevated transition"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-7 w-7 text-muted-foreground" />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-background/70 grid place-items-center">
                      <Loader2 className="h-5 w-5 animate-spin text-neon-cyan" />
                    </div>
                  )}
                </button>
                <div className="flex-1 space-y-2">
                  <button
                    type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="w-full h-10 px-4 rounded-xl border border-border hover:bg-white/5 text-sm flex items-center justify-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    {avatarPreview ? "Anderes Foto wählen" : "Foto wählen"}
                  </button>
                  <input
                    ref={fileRef} type="file" accept="image/*" capture="user" className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onPickPhoto(f);
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button" onClick={() => submitPhoto(true)}
                  className="flex-1 h-11 rounded-xl border border-border hover:bg-white/5 text-sm"
                >
                  Überspringen
                </button>
                <button
                  type="button" onClick={() => submitPhoto(false)} disabled={!avatarPath || uploading}
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet text-background font-semibold text-sm disabled:opacity-50"
                >
                  Weiter
                </button>
              </div>
            </div>
          )}

          {!isDone && step.kind === "number" && (
            <form onSubmit={(e) => { e.preventDefault(); submitNumber(); }} className="flex gap-2">
              <input
                autoFocus type="number" inputMode="numeric" min={8} max={99}
                value={text} onChange={(e) => setText(e.target.value)} placeholder={step.placeholder}
                className="flex-1 h-11 px-4 rounded-xl bg-elevated border border-border focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 text-sm"
              />
              <button className="h-11 w-11 grid place-items-center rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet text-background">
                <Send className="h-4 w-4" />
              </button>
            </form>
          )}

          {!isDone && step.kind === "height" && (
            <form onSubmit={(e) => { e.preventDefault(); submitHeight(); }} className="space-y-2">
              <div className="flex gap-2 items-center">
                {heightUnit === "cm" ? (
                  <input
                    autoFocus type="number" inputMode="decimal" value={heightVal}
                    onChange={(e) => setHeightVal(e.target.value)} placeholder="z.B. 178"
                    className="flex-1 h-11 px-4 rounded-xl bg-elevated border border-border focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 text-sm"
                  />
                ) : (
                  <>
                    <input
                      autoFocus type="number" inputMode="numeric" value={heightVal}
                      onChange={(e) => setHeightVal(e.target.value)} placeholder="ft"
                      className="w-24 h-11 px-3 rounded-xl bg-elevated border border-border text-sm"
                    />
                    <input
                      type="number" inputMode="numeric" value={heightIn}
                      onChange={(e) => setHeightIn(e.target.value)} placeholder="in"
                      className="w-24 h-11 px-3 rounded-xl bg-elevated border border-border text-sm"
                    />
                  </>
                )}
                <UnitToggle a="cm" b="ft" value={heightUnit} onChange={(v) => setHeightUnit(v as "cm" | "ft")} />
                <button className="h-11 w-11 grid place-items-center rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet text-background">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}

          {!isDone && step.kind === "weight" && (
            <form onSubmit={(e) => { e.preventDefault(); submitWeight(); }} className="flex gap-2 items-center">
              <input
                autoFocus type="number" inputMode="decimal" value={weightVal}
                onChange={(e) => setWeightVal(e.target.value)} placeholder={weightUnit === "kg" ? "z.B. 72" : "z.B. 160"}
                className="flex-1 h-11 px-4 rounded-xl bg-elevated border border-border focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 text-sm"
              />
              <UnitToggle a="kg" b="lbs" value={weightUnit} onChange={(v) => setWeightUnit(v as "kg" | "lbs")} />
              <button className="h-11 w-11 grid place-items-center rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet text-background">
                <Send className="h-4 w-4" />
              </button>
            </form>
          )}

          {!isDone && step.kind === "multi" && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {step.options.map((o) => {
                  const on = multi.includes(o);
                  return (
                    <button
                      key={o} type="button"
                      onClick={() => setMulti((m) => (on ? m.filter((x) => x !== o) : [...m, o]))}
                      className={`px-3 h-9 rounded-full text-xs border transition ${
                        on
                          ? "bg-gradient-to-r from-neon-cyan to-neon-violet text-background border-transparent"
                          : "border-border hover:bg-white/5"
                      }`}
                    >
                      {o}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={submitMulti}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet text-background font-semibold text-sm glow-cyan"
              >
                Weiter ({multi.length})
              </button>
            </div>
          )}

          {!isDone && step.kind === "goal" && (
            <form onSubmit={(e) => { e.preventDefault(); if (!goalThinking) submitGoal(); }} className="flex gap-2">
              <input
                autoFocus value={text} onChange={(e) => setText(e.target.value)}
                placeholder={step.placeholder} disabled={goalThinking}
                className="flex-1 h-11 px-4 rounded-xl bg-elevated border border-border focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 text-sm disabled:opacity-60"
              />
              <button
                disabled={goalThinking}
                className="h-11 w-11 grid place-items-center rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet text-background disabled:opacity-60"
              >
                {goalThinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>
          )}

          {!isDone && step.kind === "single" && (
            <div className="flex flex-wrap gap-2">
              {step.options.map((o) => (
                <button key={o} onClick={() => submitSingle(o)}
                  className="px-4 h-10 rounded-full text-sm border border-border hover:bg-white/5 transition">
                  {o}
                </button>
              ))}
            </div>
          )}

          {!isDone && step.kind === "text-skip" && (
            <div className="space-y-2">
              <form onSubmit={(e) => { e.preventDefault(); submitInjuries(false); }} className="flex gap-2">
                <input
                  autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder={step.placeholder}
                  className="flex-1 h-11 px-4 rounded-xl bg-elevated border border-border focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 text-sm"
                />
                <button className="h-11 w-11 grid place-items-center rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet text-background">
                  <Send className="h-4 w-4" />
                </button>
              </form>
              <button type="button" onClick={() => submitInjuries(true)}
                className="text-xs text-muted-foreground hover:text-foreground">
                Überspringen
              </button>
            </div>
          )}

          {isDone && (
            <button onClick={finish} disabled={saveMut.isPending}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet text-background font-semibold text-sm glow-cyan flex items-center justify-center gap-2 disabled:opacity-60">
              {saveMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Zum Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function UnitToggle({ a, b, value, onChange }: { a: string; b: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="h-11 inline-flex rounded-xl border border-border bg-elevated p-1 text-xs">
      {[a, b].map((u) => (
        <button
          key={u} type="button" onClick={() => onChange(u)}
          className={`px-3 rounded-lg transition ${value === u ? "bg-gradient-to-r from-neon-cyan to-neon-violet text-background font-semibold" : "text-muted-foreground"}`}
        >
          {u}
        </button>
      ))}
    </div>
  );
}
