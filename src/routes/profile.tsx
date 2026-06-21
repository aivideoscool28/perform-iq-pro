import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/athleticiq/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { fetchMyProfile, resetOnboarding, resetToNewUser } from "@/lib/athletic.functions";
import { isDevPreview, markTourPending } from "@/lib/tour";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  User, MapPin, Calendar, Ruler, Weight, Flag, Sparkles, Watch, Activity,
  Heart, Settings, Check, Plus, Trash2, Pencil, Trophy, Star, Target,
  Dumbbell, RefreshCcw, Loader2, HeartPulse, FlaskConical,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({ component: Page });

type Device = { id: string; name: string; status: string; icon: string; color: string; enabled: boolean };
type Achievement = { id: string; name: string; date: string; color: string };
type Pref = { id: string; label: string; desc: string; enabled: boolean };
type Stat = { id: string; key: string; value: string; icon: string };
type Discipline = { id: string; name: string; pb: string; primary: boolean };

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Watch, Heart, Activity, Sparkles, User, Ruler, Weight,
};

const STORAGE_KEY = "athleticiq.profile.v1";

const defaults = {
  name: "",
  initials: "",
  role: "",
  tier: "",
  location: "",
  club: "",
  season: "",
  stats: [] as Stat[],
  disciplines: [] as Discipline[],
  devices: [] as Device[],
  achievements: [] as Achievement[],
  prefs: [
    { id: "p1", label: "Push-Benachrichtigungen", desc: "Tägliche Empfehlung & Streak", enabled: true },
    { id: "p2", label: "Wöchentlicher KI-Report", desc: "Sonntag · 19:00", enabled: true },
    { id: "p3", label: "Trainings-Erinnerungen", desc: "30 min vor Session", enabled: true },
    { id: "p4", label: "Datenfreigabe Coach", desc: "Nur aggregierte Werte", enabled: true },
  ] as Pref[],
};

type State = typeof defaults;

function EditableText({
  value,
  onChange,
  editing,
  className = "",
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  editing: boolean;
  className?: string;
  placeholder?: string;
}) {
  if (!editing) return <span className={className}>{value || <span className="text-muted-foreground italic">{placeholder}</span>}</span>;
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`h-7 px-2 py-0 bg-white/[0.04] border-border/60 ${className}`}
    />
  );
}

function Page() {
  const [editing, setEditing] = useState(false);
  const [state, setState] = useState<State>(defaults);
  const [devResetOpen, setDevResetOpen] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchProfileFn = useServerFn(fetchMyProfile);
  const resetFn = useServerFn(resetOnboarding);
  const resetNewUserFn = useServerFn(resetToNewUser);
  const showDevTools = isDevPreview();

  const { data: profileData } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfileFn(),
  });
  const profile = profileData?.profile;
  const avatarUrl = profileData?.avatar_signed_url ?? null;

  const reset = useMutation({
    mutationFn: () => resetFn(),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["my-profile"] });
      toast.success("Onboarding zurückgesetzt – los geht's!");
      navigate({ to: "/onboarding" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const devReset = useMutation({
    mutationFn: () => resetNewUserFn(),
    onSuccess: async () => {
      setDevResetOpen(false);
      markTourPending();
      await qc.invalidateQueries();
      toast.success("Auf neuen Nutzer zurückgesetzt – Tour startet.");
      navigate({ to: "/" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...defaults, ...JSON.parse(raw) });
    } catch {}
  }, []);

  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      toast.success("Profil gespeichert");
    } catch {
      toast.error("Speichern fehlgeschlagen");
    }
    setEditing(false);
  };

  const update = <K extends keyof State>(key: K, value: State[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const updateItem = <T extends { id: string }>(arr: T[], id: string, patch: Partial<T>) =>
    arr.map((x) => (x.id === id ? { ...x, ...patch } : x));

  const removeItem = <T extends { id: string }>(arr: T[], id: string) =>
    arr.filter((x) => x.id !== id);

  return (
    <AppShell
      title="Athletenprofil"
      subtitle="Stammdaten · Geräte · Einstellungen"
      breadcrumbs={[
        { label: "Dashboard", to: "/" },
        { label: "Account", to: "/profile" },
        { label: "Athletenprofil" },
      ]}
    >
      {/* DEV-ONLY: reset to a brand-new-user state (keeps onboarding profile) */}
      {showDevTools && (
        <div className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-30">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDevResetOpen(true)}
            className="border-neon-amber/50 text-neon-amber bg-background/80 backdrop-blur hover:bg-neon-amber/10 shadow-lg"
          >
            <FlaskConical className="h-4 w-4 mr-1.5" /> Reset to New User
          </Button>
        </div>
      )}

      <AlertDialog open={devResetOpen} onOpenChange={setDevResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Auf neuen Nutzer zurücksetzen?</AlertDialogTitle>
            <AlertDialogDescription>
              Dies setzt deine Check-ins, deinen Streak und deine Analyse-Historie zurück.
              Dein Onboarding-Profil (Name, Disziplin, Ziele usw.) bleibt unverändert. Fortfahren?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={devReset.isPending}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                devReset.mutate();
              }}
              disabled={devReset.isPending}
            >
              {devReset.isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Zurücksetzen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ONBOARDING DATA from DB */}
      <div className="glass-strong rounded-3xl p-6 mb-4 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-neon-cyan/15 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Avatar className="h-20 w-20 border-2 border-neon-cyan/40 glow-cyan shrink-0">
            {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
            <AvatarFallback className="bg-gradient-to-br from-neon-cyan to-neon-violet text-background text-xl font-bold">
              {(profile?.display_name ?? "··").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Onboarding-Daten</div>
            <h2 className="text-2xl font-bold tracking-tight mt-0.5">
              {profile?.display_name ?? "—"}
            </h2>
            {profile?.goal_text && (
              <div className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
                <Target className="h-3.5 w-3.5 mt-0.5 text-neon-magenta shrink-0" />
                <span className="italic">„{profile.goal_text}"</span>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            className="border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10 shrink-0"
            onClick={() => reset.mutate()}
            disabled={reset.isPending}
          >
            {reset.isPending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <RefreshCcw className="h-4 w-4 mr-1.5" />}
            Onboarding wiederholen
          </Button>
        </div>

        <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5">
          {[
            { icon: User, label: "Alter", value: profile?.age ? `${profile.age}` : "—" },
            { icon: Ruler, label: "Größe", value: profile?.height_cm ? `${profile.height_cm} cm` : "—" },
            { icon: Weight, label: "Gewicht", value: profile?.weight_kg ? `${profile.weight_kg} kg` : "—" },
            { icon: Trophy, label: "Erfahrung", value: profile?.experience ?? "—" },
            { icon: Calendar, label: "Tage/Woche", value: profile?.training_days_per_week ? `${profile.training_days_per_week}` : "—" },
            { icon: Dumbbell, label: "Setup", value: profile?.training_setup ?? "—" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-2xl border border-border/50 bg-white/[0.02] p-3 flex items-center gap-2.5">
                <Icon className="h-4 w-4 text-neon-cyan shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</div>
                  <div className="text-sm font-semibold truncate">{s.value}</div>
                </div>
              </div>
            );
          })}
        </div>

        {profile?.disciplines && profile.disciplines.length > 0 && (
          <div className="relative mt-4">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Disziplinen</div>
            <div className="flex flex-wrap gap-1.5">
              {profile.disciplines.map((d) => (
                <Badge key={d} variant="outline" className="border-neon-cyan/30 text-neon-cyan">
                  {d}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {profile?.injuries && (
          <div className="relative mt-4 rounded-2xl border border-border/50 bg-white/[0.02] p-3 flex items-start gap-2.5">
            <HeartPulse className="h-4 w-4 text-neon-magenta shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Verletzungen / Hinweise</div>
              <div className="text-sm">{profile.injuries}</div>
            </div>
          </div>
        )}

        {!profile?.onboarded_at && (
          <div className="relative mt-4 rounded-2xl border border-neon-amber/30 bg-neon-amber/5 p-3 text-sm">
            Du hast das Onboarding noch nicht abgeschlossen.{" "}
            <button onClick={() => navigate({ to: "/onboarding" })} className="underline text-neon-amber">
              Jetzt starten →
            </button>
          </div>
        )}
      </div>


      <div className="glass-strong rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-neon-violet/20 blur-3xl" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24 border-2 border-neon-cyan/40 glow-cyan">
              <AvatarFallback className="bg-gradient-to-br from-neon-cyan to-neon-violet text-background text-2xl font-bold">
                {state.initials || "··"}
              </AvatarFallback>
            </Avatar>
            <Badge className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-neon-violet text-background border-0">
              Pro
            </Badge>
          </div>

          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 flex-wrap">
              {editing ? (
                <Input
                  value={state.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="h-9 text-xl font-bold max-w-xs bg-white/[0.04] border-border/60"
                />
              ) : (
                <h2 className="text-2xl font-bold tracking-tight">{state.name}</h2>
              )}
              <Badge variant="outline" className="border-neon-cyan/30 text-neon-cyan">
                <EditableText value={state.role} editing={editing} onChange={(v) => update("role", v)} placeholder="Rolle" className="text-xs" />
              </Badge>
              <Badge variant="outline" className="border-border/60">
                <EditableText value={state.tier} editing={editing} onChange={(v) => update("tier", v)} placeholder="Klasse" className="text-xs" />
              </Badge>
              {editing && (
                <div className="flex items-center gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Initialen</label>
                  <Input
                    value={state.initials}
                    onChange={(e) => update("initials", e.target.value.slice(0, 2).toUpperCase())}
                    className="h-7 w-14 bg-white/[0.04] border-border/60 text-center"
                  />
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />
                <EditableText value={state.location} editing={editing} onChange={(v) => update("location", v)} placeholder="Ort" />
              </span>
              <span className="flex items-center gap-1.5"><Flag className="h-3.5 w-3.5" />
                <EditableText value={state.club} editing={editing} onChange={(v) => update("club", v)} placeholder="Verein" />
              </span>
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />
                <EditableText value={state.season} editing={editing} onChange={(v) => update("season", v)} placeholder="Saison" />
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              {state.stats.map((s) => {
                const Icon = ICONS[s.icon] ?? Activity;
                return (
                  <div key={s.id} className="rounded-2xl border border-border/50 bg-white/[0.02] p-3 flex items-center gap-3">
                    <Icon className="h-4 w-4 text-neon-cyan shrink-0" />
                    <div className="min-w-0 flex-1">
                      {editing ? (
                        <div className="space-y-1">
                          <Input value={s.key} onChange={(e) => update("stats", updateItem(state.stats, s.id, { key: e.target.value }))} className="h-6 px-1.5 py-0 text-[10px] bg-white/[0.04] border-border/60" />
                          <Input value={s.value} onChange={(e) => update("stats", updateItem(state.stats, s.id, { value: e.target.value }))} className="h-6 px-1.5 py-0 text-xs bg-white/[0.04] border-border/60" />
                        </div>
                      ) : (
                        <>
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.key}</div>
                          <div className="text-sm font-semibold truncate">{s.value}</div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {editing ? (
              <>
                <Button onClick={save} className="bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/30">
                  <Check className="h-4 w-4 mr-1.5" /> Speichern
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)} className="border-border/60">
                  Abbrechen
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setEditing(true)} className="border-border/60">
                <Pencil className="h-4 w-4 mr-1.5" /> Bearbeiten
              </Button>
            )}
          </div>
        </div>
      </div>


      {/* DISZIPLINEN */}
      <div className="glass rounded-3xl p-6 mt-4 relative overflow-hidden">
        <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-neon-cyan/10 blur-3xl pointer-events-none" />
        <div className="flex items-center justify-between mb-4 relative">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-neon-cyan" />
            <h3 className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Disziplinen</h3>
            <Badge variant="outline" className="border-border/60 text-[10px]">{state.disciplines.length}</Badge>
          </div>
          {editing && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 border-border/60"
              onClick={() =>
                update("disciplines", [
                  ...state.disciplines,
                  { id: crypto.randomUUID(), name: "Neue Disziplin", pb: "—", primary: false },
                ])
              }
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Disziplin
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
          {state.disciplines.map((d) => (
            <div
              key={d.id}
              className={`group relative rounded-2xl p-4 border bg-white/[0.02] transition hover:border-neon-cyan/40 ${
                d.primary ? "border-neon-cyan/40 shadow-[0_0_30px_-12px_oklch(0.78_0.2_235/0.6)]" : "border-border/50"
              }`}
            >
              {d.primary && (
                <div className="absolute -top-2 left-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-neon-cyan to-neon-violet px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-background">
                  <Star className="h-2.5 w-2.5 fill-current" /> Haupt
                </div>
              )}
              <div className="flex items-start justify-between gap-2">
                <Activity className={`h-4 w-4 ${d.primary ? "text-neon-cyan" : "text-muted-foreground"}`} />
                {editing && (
                  <button
                    onClick={() => update("disciplines", removeItem(state.disciplines, d.id))}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {editing ? (
                <div className="space-y-1.5 mt-2">
                  <Input
                    value={d.name}
                    onChange={(e) =>
                      update("disciplines", updateItem(state.disciplines, d.id, { name: e.target.value }))
                    }
                    className="h-7 bg-white/[0.04] border-border/60 text-sm"
                  />
                  <div className="flex items-center gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">PB</label>
                    <Input
                      value={d.pb}
                      onChange={(e) =>
                        update("disciplines", updateItem(state.disciplines, d.id, { pb: e.target.value }))
                      }
                      className="h-6 px-2 py-0 bg-white/[0.04] border-border/60 text-xs flex-1"
                    />
                  </div>
                  <button
                    onClick={() =>
                      update(
                        "disciplines",
                        state.disciplines.map((x) => ({ ...x, primary: x.id === d.id })),
                      )
                    }
                    className={`w-full mt-1 text-[10px] uppercase tracking-wider rounded-md py-1 transition ${
                      d.primary
                        ? "bg-neon-cyan/20 text-neon-cyan"
                        : "bg-white/[0.03] text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {d.primary ? "★ Hauptdisziplin" : "Als Hauptdisziplin"}
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-sm font-semibold mt-2 truncate">{d.name}</div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">PB</span>
                    <span className="text-base font-bold gradient-text">{d.pb}</span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">

        <div className="lg:col-span-2 glass rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Verbundene Geräte</h3>
            {editing && (
              <Button size="sm" variant="outline" className="h-7 border-border/60" onClick={() => update("devices", [...state.devices, { id: crypto.randomUUID(), name: "Neues Gerät", status: "Offline", icon: "Watch", color: "text-neon-cyan", enabled: false }])}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Gerät
              </Button>
            )}
          </div>
          <div className="space-y-2.5">
            {state.devices.map((d) => {
              const Icon = ICONS[d.icon] ?? Watch;
              return (
                <div key={d.id} className="flex items-center justify-between rounded-2xl border border-border/50 bg-white/[0.02] p-3.5 gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent border border-border/50 grid place-items-center shrink-0">
                      <Icon className={`h-4 w-4 ${d.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      {editing ? (
                        <div className="space-y-1">
                          <Input value={d.name} onChange={(e) => update("devices", updateItem(state.devices, d.id, { name: e.target.value }))} className="h-7 bg-white/[0.04] border-border/60 text-sm" />
                          <Input value={d.status} onChange={(e) => update("devices", updateItem(state.devices, d.id, { status: e.target.value }))} className="h-6 px-2 py-0 bg-white/[0.04] border-border/60 text-[11px]" />
                        </div>
                      ) : (
                        <>
                          <div className="text-sm font-semibold truncate">{d.name}</div>
                          <div className="text-[11px] text-muted-foreground">{d.status}</div>
                        </>
                      )}
                    </div>
                  </div>
                  <Switch checked={d.enabled} onCheckedChange={(v) => update("devices", updateItem(state.devices, d.id, { enabled: v }))} />
                  {editing && (
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => update("devices", removeItem(state.devices, d.id))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Auszeichnungen</h3>
            {editing && (
              <Button size="sm" variant="outline" className="h-7 border-border/60" onClick={() => update("achievements", [...state.achievements, { id: crypto.randomUUID(), name: "Neue Auszeichnung", date: "Heute", color: "from-neon-cyan to-neon-violet" }])}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {state.achievements.map((a) => (
              <div key={a.id} className="rounded-2xl p-4 border border-border/50 bg-white/[0.02] hover:border-neon-cyan/30 transition relative overflow-hidden">
                <div className={`absolute -top-8 -right-8 h-20 w-20 rounded-full bg-gradient-to-br ${a.color} opacity-30 blur-2xl`} />
                <div className="flex items-start justify-between relative">
                  <Sparkles className="h-4 w-4 text-neon-cyan" />
                  {editing && (
                    <button onClick={() => update("achievements", removeItem(state.achievements, a.id))} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                {editing ? (
                  <div className="space-y-1 mt-2 relative">
                    <Input value={a.name} onChange={(e) => update("achievements", updateItem(state.achievements, a.id, { name: e.target.value }))} className="h-7 bg-white/[0.04] border-border/60 text-xs" />
                    <Input value={a.date} onChange={(e) => update("achievements", updateItem(state.achievements, a.id, { date: e.target.value }))} className="h-6 px-2 py-0 bg-white/[0.04] border-border/60 text-[11px]" />
                  </div>
                ) : (
                  <>
                    <div className="text-sm font-semibold mt-2 relative">{a.name}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 relative">{a.date}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl p-6 mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Präferenzen</h3>
          {editing && (
            <Button size="sm" variant="outline" className="h-7 border-border/60" onClick={() => update("prefs", [...state.prefs, { id: crypto.randomUUID(), label: "Neue Präferenz", desc: "", enabled: true }])}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Präferenz
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {state.prefs.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-2xl border border-border/50 bg-white/[0.02] p-4 gap-3">
              <div className="min-w-0 flex-1">
                {editing ? (
                  <div className="space-y-1">
                    <Input value={p.label} onChange={(e) => update("prefs", updateItem(state.prefs, p.id, { label: e.target.value }))} className="h-7 bg-white/[0.04] border-border/60 text-sm" />
                    <Input value={p.desc} onChange={(e) => update("prefs", updateItem(state.prefs, p.id, { desc: e.target.value }))} className="h-6 px-2 py-0 bg-white/[0.04] border-border/60 text-[11px]" />
                  </div>
                ) : (
                  <>
                    <div className="text-sm font-semibold">{p.label}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{p.desc}</div>
                  </>
                )}
              </div>
              <Switch checked={p.enabled} onCheckedChange={(v) => update("prefs", updateItem(state.prefs, p.id, { enabled: v }))} />
              {editing && (
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => update("prefs", removeItem(state.prefs, p.id))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {!editing && (
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setEditing(true)}>
            <Settings className="h-4 w-4 mr-1.5" /> Profil anpassen
          </Button>
        </div>
      )}
    </AppShell>
  );
}
