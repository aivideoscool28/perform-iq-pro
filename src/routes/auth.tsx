import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { setRememberMe, markJustLoggedIn } from "@/lib/auth-session";
import { Activity, Loader2, Check } from "lucide-react";
import { toast } from "sonner";


export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Athleticiq · Login" },
      { name: "description", content: "Anmelden oder Konto erstellen für Athleticiq." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        if (data.session) {
          setRememberMe(remember);
          markJustLoggedIn();
          navigate({ to: "/" });
          return;
        }
        toast.success("Konto erstellt! Check deine E-Mails zum Verifizieren.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setRememberMe(remember);
        markJustLoggedIn();
        navigate({ to: "/" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fehler beim Login");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setRememberMe(remember);
    markJustLoggedIn();
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) {
      toast.error(res.error instanceof Error ? res.error.message : "Google-Login fehlgeschlagen");
      setLoading(false);
      return;
    }
    if (res.redirected) return;
    navigate({ to: "/" });
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
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === "login" ? "Willkommen zurück" : "Konto erstellen"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login" ? "Setze deinen Streak fort." : "Starte heute deinen ersten Streak."}
          </p>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="mt-5 w-full h-11 rounded-xl glass border border-border hover:bg-white/5 transition flex items-center justify-center gap-2 text-sm font-medium"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.5 12 2.5 6.7 2.5 2.5 6.7 2.5 12s4.2 9.5 9.5 9.5c5.5 0 9.1-3.9 9.1-9.3 0-.6-.07-1.1-.2-2H12z" />
            </svg>
            Mit Google fortfahren
          </button>

          <div className="flex items-center gap-3 my-5 text-xs text-muted-foreground">
            <div className="h-px bg-border flex-1" />
            <span>oder</span>
            <div className="h-px bg-border flex-1" />
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            {mode === "signup" && (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dein Name"
                className="w-full h-11 px-4 rounded-xl bg-elevated border border-border focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 text-sm"
              />
            )}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-Mail"
              className="w-full h-11 px-4 rounded-xl bg-elevated border border-border focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 text-sm"
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort (min. 6 Zeichen)"
              className="w-full h-11 px-4 rounded-xl bg-elevated border border-border focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 text-sm"
            />
            <button
              type="button"
              onClick={() => setRemember(!remember)}
              className="flex items-center gap-2.5 text-xs text-muted-foreground hover:text-foreground transition w-full py-1"
            >
              <span
                className={[
                  "h-4 w-4 rounded-[5px] border grid place-items-center transition",
                  remember
                    ? "bg-gradient-to-br from-neon-cyan to-neon-violet border-transparent"
                    : "border-border",
                ].join(" ")}
              >
                {remember && <Check className="h-3 w-3 text-background" strokeWidth={3} />}
              </span>
              Angemeldet bleiben
            </button>
            <button

              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet text-background font-semibold text-sm hover:opacity-90 transition glow-cyan flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "login" ? "Anmelden" : "Konto erstellen"}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="mt-5 text-xs text-muted-foreground hover:text-foreground w-full text-center"
          >
            {mode === "login" ? "Noch kein Konto? Jetzt registrieren" : "Schon registriert? Anmelden"}
          </button>
        </div>
      </div>
    </div>
  );
}
