import {useAuth} from "@/hooks/use-auth";
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
import { fetchMyProfile, resetOnboarding, resetToNewUser } from "@/lib/features/profile.functions";
import { SignOutButton } from "@/components/athleticiq/SignOutButton";
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

function Page() {
  const { session, loading } = useAuth();
  const [editing, setEditing] = useState(false);
  const [devResetOpen, setDevResetOpen] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchProfileFn = useServerFn(fetchMyProfile);
  const resetFn = useServerFn(resetOnboarding);
  const resetNewUserFn = useServerFn(resetToNewUser);
  const showDevTools = isDevPreview();

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfileFn(),
    enabled: !!session,
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

  return (
    <AppShell
      title="Athletenprofil"
      subtitle="Deine Athletenidentität · Ziele · Fokus"
      breadcrumbs={[
        { label: "Dashboard", to: "/" },
        { label: "Account", to: "/profile" },
        { label: "Athletenprofil" },
      ]}
    >
      {/* Account actions */}
      <div className="flex justify-end mb-4">
        <SignOutButton />
      </div>

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
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Avatar className="h-20 w-20 border-2 border-accent/40 shadow-sm shrink-0">
            {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
            <AvatarFallback className="bg-accent/15 text-accent text-xl font-bold">
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
                <Target className="h-3.5 w-3.5 mt-0.5 text-accent shrink-0" />
                <span className="italic">„{profile.goal_text}"</span>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            className="border-accent/40 text-accent hover:bg-accent/10 shrink-0"
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
            { icon: Trophy, label: "Erfahrung", value: profile?.experience ?? "—" },
            { icon: Calendar, label: "Tage/Woche", value: profile?.training_days_per_week ? `${profile.training_days_per_week}` : "—" },

          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-2xl border border-border/50 bg-white/[0.02] p-4 flex flex-col items-center justify-center text-center gap-1.5 min-h-[86px]">
                <Icon className="h-4 w-4 text-accent shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</div>
                  <div className="text-sm font-semibold text-center leading-snug break-words">{s.value}</div>
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
                <Badge key={d} variant="outline" className="border-accent/30 text-accent">
                  {d}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {(profile?.goal_motivation?.length ||
          profile?.current_focus?.length ||
          profile?.favourite_athlete) && (
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">

            <div className="rounded-2xl border border-border/50 bg-white/[0.02] p-4">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                Was dich antreibt
              </div>
              {profile?.goal_motivation?.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {profile.goal_motivation.map((motivation) => (
                    <Badge key={motivation} variant="outline" className="border-accent/30">
                      {motivation}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">—</div>
              )}
            </div>

            <div className="rounded-2xl border border-border/50 bg-white/[0.02] p-4">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                Aktueller Fokus
              </div>
              {profile?.current_focus?.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {profile.current_focus.map((focus) => (
                    <Badge key={focus} variant="outline" className="border-accent/30">
                      {focus}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">—</div>
              )}
            </div>

            <div className="rounded-2xl border border-border/50 bg-white/[0.02] p-4">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                Inspiration
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Star className="h-4 w-4 text-accent shrink-0" />
                {profile?.favourite_athlete || "—"}
              </div>
            </div>

          </div>
        )}
        {profile?.injuries && (
          <div className="relative mt-4 rounded-2xl border border-border/50 bg-white/[0.02] p-3 flex items-start gap-2.5">
            <HeartPulse className="h-4 w-4 text-accent shrink-0 mt-0.5" />
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


    </AppShell>
  );
}












