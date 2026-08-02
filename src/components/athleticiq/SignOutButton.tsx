import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { clearAuthFlags } from "@/lib/auth-session";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function SignOutButton({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  const signOut = async () => {
    setBusy(true);
    try {
      await qc.cancelQueries();
      qc.clear();
      await supabase.auth.signOut();
      clearAuthFlags();
      navigate({ to: "/auth", replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Abmelden fehlgeschlagen");
      setBusy(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={signOut}
      disabled={busy}
      className={`border-neon-red/40 text-neon-red hover:bg-neon-red/10 ${className}`}
    >
      {busy ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <LogOut className="h-4 w-4 mr-1.5" />}
      Abmelden
    </Button>
  );
}
