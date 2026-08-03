import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Athleticiq · Neues Passwort" },
      { name: "description", content: "Setze ein neues Passwort für dein Athleticiq-Konto." },
      { property: "og:title", content: "Athleticiq · Neues Passwort" },
      { property: "og:description", content: "Setze ein neues Passwort für dein Athleticiq-Konto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Passwort aktualisiert!");
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fehler beim Zurücksetzen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-neon-violet/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-neon-cyan/15 blur-3xl" />
      <div className="absolute inset-0 grid-bg pointer-events-none" />

      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-violet grid place-items-center glow-cyan">
            <Activity className="h-5 w-5 text-background" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold">
            Athletic<span className="gradient-text">iq</span>
          </span>
        </Link>

        <div className="glass-strong rounded-3xl p-7">
          <h1 className="text-2xl font-bold tracking-tight">Neues Passwort</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {ready
              ? "Wähle ein neues Passwort für dein Konto."
              : "Öffne den Link aus deiner E-Mail, um dein Passwort zu ändern."}
          </p>

          <form onSubmit={submit} className="space-y-3 mt-5" aria-busy={loading}>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Neues Passwort (min. 6 Zeichen)"
                disabled={loading || !ready}
                className="w-full h-11 pl-4 pr-11 rounded-xl bg-elevated border border-border focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                aria-label={show ? "Passwort verbergen" : "Passwort anzeigen"}
                disabled={loading || !ready}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading || !ready}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet text-background font-semibold text-sm hover:opacity-90 transition glow-cyan flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Wird gespeichert..." : "Passwort speichern"}
            </button>
          </form>

          <Link to="/auth" className="mt-5 block text-xs text-muted-foreground hover:text-foreground text-center">
            Zurück zum Login
          </Link>
        </div>
      </div>
    </div>
  );
}
