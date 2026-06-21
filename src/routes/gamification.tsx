import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/athleticiq/AppShell";
import { EditableShell } from "@/components/athleticiq/EditableShell";
import { fetchFriends, acceptInviteCode, fetchDashboard } from "@/lib/athletic.functions";
import { StreakManager } from "@/components/athleticiq/StreakManager";
import { Flame, Copy, UserPlus, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/gamification")({
  head: () => ({ meta: [{ title: "Athleticiq · Freunde & Streaks" }] }),
  component: FriendsPage,
});

function FriendsPage() {
  const friendsFn = useServerFn(fetchFriends);
  const dashFn = useServerFn(fetchDashboard);
  const acceptFn = useServerFn(acceptInviteCode);
  const qc = useQueryClient();
  const [code, setCode] = useState("");

  const { data: friendsData } = useQuery({ queryKey: ["friends"], queryFn: () => friendsFn() });
  const { data: dash } = useQuery({ queryKey: ["dashboard"], queryFn: () => dashFn() });

  const accept = useMutation({
    mutationFn: (c: string) => acceptFn({ data: { code: c } }),
    onSuccess: () => {
      toast.success("Freund hinzugefügt!");
      setCode("");
      qc.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Code ungültig"),
  });

  const myCode = dash?.profile?.invite_code ?? "";
  const inviteUrl = typeof window !== "undefined" ? `${window.location.origin}/auth?invite=${myCode}` : "";

  const copy = (t: string) => {
    navigator.clipboard.writeText(t);
    toast.success("Kopiert!");
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Tritt mir auf Athleticiq bei",
          text: `Lass uns gemeinsam unseren Streak halten! Mein Code: ${myCode}`,
          url: inviteUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      copy(inviteUrl);
    }
  };

  const friends = friendsData?.friends ?? [];
  const me = dash?.profile;
  const leaderboard = [
    ...(me ? [{ ...me, isMe: true }] : []),
    ...friends.map((f) => ({ ...f, isMe: false })),
  ].sort((a, b) => (b.current_streak ?? 0) - (a.current_streak ?? 0));

  return (
    <AppShell
      title="Freunde & Streaks"
      subtitle="Motiviert euch gegenseitig"
      breadcrumbs={[{ label: "Dashboard", to: "/" }, { label: "Freunde & Streaks" }]}
    >

      <EditableShell storageKey="athleticiq.edit.gamification.v1">
      <div className="mb-6 space-y-6">
        <StreakManager workouts={dash?.workouts ?? []} checkins={dash?.checkins ?? []} />
      </div>
      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* Leaderboard */}
        <div className="glass-strong rounded-3xl p-6">
          <h2 className="font-semibold text-lg mb-4">Streak-Rangliste</h2>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-muted-foreground">Noch keine Freunde. Lade welche ein!</p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((p, i) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-4 p-3 rounded-xl border transition ${
                    p.isMe
                      ? "bg-gradient-to-r from-neon-cyan/10 to-neon-violet/10 border-neon-cyan/30"
                      : "bg-elevated/50 border-border/60"
                  }`}
                >
                  <div className="text-lg font-bold tabular-nums text-muted-foreground w-6 text-center">
                    {i + 1}
                  </div>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-neon-violet to-neon-magenta grid place-items-center font-bold text-sm text-background">
                    {p.display_name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {p.display_name} {p.isMe && <span className="text-xs text-neon-cyan">(du)</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Rekord: {p.longest_streak ?? 0} Tage
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-neon-amber">
                    <Flame className="h-4 w-4" />
                    <span className="font-bold tabular-nums">{p.current_streak ?? 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invite */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Share2 className="h-4 w-4 text-neon-cyan" />
              <h3 className="font-semibold">Freunde einladen</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Teile deinen Code oder Link. Streaks vergleichen, motivieren, gewinnen.
            </p>
            <div className="rounded-xl bg-elevated border border-border p-3 flex items-center justify-between gap-2 mb-2">
              <span className="font-mono text-sm tracking-wider">{myCode || "..."}</span>
              <button onClick={() => copy(myCode)} className="text-muted-foreground hover:text-foreground">
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={share}
              className="w-full h-10 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet text-background font-semibold text-sm hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              <Share2 className="h-4 w-4" /> Link teilen
            </button>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <UserPlus className="h-4 w-4 text-neon-violet" />
              <h3 className="font-semibold">Code eingeben</h3>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (code.trim()) accept.mutate(code.trim());
              }}
              className="flex gap-2"
            >
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Freundes-Code"
                className="flex-1 h-10 px-3 rounded-xl bg-elevated border border-border focus:outline-none focus:ring-2 focus:ring-neon-cyan/40 text-sm"
              />
              <button
                type="submit"
                disabled={!code.trim() || accept.isPending}
                className="h-10 px-4 rounded-xl bg-neon-violet/20 border border-neon-violet/40 text-neon-violet hover:bg-neon-violet/30 disabled:opacity-50 transition"
              >
                {accept.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Hinzufügen"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </EditableShell>
    </AppShell>
  );
}
