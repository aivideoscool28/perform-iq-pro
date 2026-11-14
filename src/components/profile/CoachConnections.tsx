import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
export function CoachConnections({ role, inviteCode }: { role: string; inviteCode: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [code, setCode] = useState("");
  const links = useQuery({
    queryKey: ["my-coaches", user?.id],
    enabled: role === "athlete" && !!user,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_my_coaches");
      if (error) throw error;
      return data;
    },
  });
  const connect = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("connect_coach", { p_code: code.trim().toLowerCase() });
      if (error) throw error;
    },
    onSuccess: async () => {
      setCode("");
      await qc.invalidateQueries({ queryKey: ["my-coaches"] });
    },
  });
  const revoke = useMutation({
    mutationFn: async (coachId: string) => {
      const { error } = await supabase
        .from("coach_athletes")
        .delete()
        .eq("coach_id", coachId)
        .eq("athlete_id", user!.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["my-coaches"] });
    },
  });
  return (
    <section className="glass-strong rounded-3xl p-6 mb-5 space-y-3">
      <h2 className="font-semibold">Coach-Verbindung</h2>
      {role === "coach" ? (
        <>
          <p className="text-sm">Teile diesen privaten Einladungscode mit deinen Athleten:</p>
          <code className="break-all">{inviteCode}</code>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Verbinde einen Coach mit seinem Einladungscode. Die Freigabe deiner Daten steuerst du im
            Profil. Du kannst jede Verbindung hier widerrufen.
          </p>
          <form
            className="flex gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              connect.mutate();
            }}
          >
            <Input
              aria-label="Coach-Einladungscode"
              maxLength={64}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Button type="submit" disabled={!code.trim() || connect.isPending}>
              Verbinden
            </Button>
          </form>
          {links.isError && <p role="alert">Verbindungen konnten nicht geladen werden.</p>}
          {links.data?.map((link) => (
            <div key={link.coach_id} className="flex justify-between items-center">
              <span>{link.display_name}</span>
              <Button
                variant="outline"
                disabled={revoke.isPending}
                onClick={() => revoke.mutate(link.coach_id)}
              >
                Verbindung widerrufen
              </Button>
            </div>
          ))}
          {(connect.isError || revoke.isError) && (
            <p role="alert">
              Verbindung konnte nicht geändert werden. Bitte Einladungscode und Berechtigungen
              prüfen.
            </p>
          )}
        </>
      )}
    </section>
  );
}
