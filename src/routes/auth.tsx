import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { setRememberMe, markJustLoggedIn } from "@/lib/auth-session";
import { Activity, Loader2, Check, Eye, EyeOff, MailCheck } from "lucide-react";
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
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);
  const [sentTo, setSentTo] = useState<null | { kind: "reset"; email: string }>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSentTo({ kind: "reset", email: email.trim() });
        toast.success("Reset-Link gesendet. Check deine E-Mails.");
        return;
      }

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: name.trim() || email.split("@")[0] },
          },
        });
        if (error) throw error;

        if (data.session) {
          setRememberMe(remember);
          markJustLoggedIn();
          toast.success("Konto erstellt und erfolgreich eingeloggt. Willkommen! 🎉");
          navigate({ to: "/" });
          return;
        }
        // Supabase returns an obfuscated user with no identities when the email exists.
        if (data.user && (data.user.identities?.length ?? 0) === 0) {
          toast.error("Diese E-Mail ist bereits registriert. Bitte melde dich an.");
          setMode("login");
          return;
        }

        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;

        if (signInData.session) {
          setRememberMe(remember);
          markJustLoggedIn();
          toast.success("Konto erstellt und erfolgreich eingeloggt. Willkommen! 🎉");
          navigate({ to: "/" });
          return;
        }

        toast.error("Konto konnte nicht angemeldet werden. Bitte versuche es erneut.");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      if (!data.session) {
        toast.error("Login fehlgeschlagen. Bitte prüfe deine Zugangsdaten.");
        return;
      }
      setRememberMe(remember);
      markJustLoggedIn();
      toast.success("Erfolgreich angemeldet. Schön dich zu sehen! 👋");
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fehler beim Login");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);

    try {
      setRememberMe(remember);
      markJustLoggedIn();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      // Supabase redirects automatically.
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Google-Login fehlgeschlagen"
      );
      setLoading(false);
    }
  };

  const switchMode = (m: "login" | "signup" | "forgot") => {
    setSentTo(null);
    setMode(m);
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
            {mode === "login" ? "Willkommen zurück" : mode === "signup" ? "Konto erstellen" : "Passwort vergessen"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login"
              ? "Setze deinen Streak fort."
              : mode === "signup"
                ? "Starte heute deinen ersten Streak."
                : "Wir senden dir einen Link zum Zurücksetzen."}
          </p>

          {sentTo ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-border bg-elevated p-4 flex gap-3">
                <MailCheck className="h-5 w-5 text-neon-cyan shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Wir haben dir einen Reset-Link geschickt an
                  <span className="text-foreground font-medium"> {sentTo.email}</span>.
                </p>
              </div>
              <button
                onClick={() => switchMode("login")}
                className="w-full h-11 rounded-xl glass border border-border hover:bg-white/5 transition text-sm font-medium"
              >
                Zurück zum Login
              </button>
            </div>
          ) : (
            <>
              {mode !== "forgot" && (
                <>
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
                </>
              )}

              <form onSubmit={handleEmail} className={mode === "forgot" ? "space-y-3 mt-5" : "space-y-3"}>
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
                {mode !== "forgot" && (
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Passwort (min. 6 Zeichen)"
                      className="w-full h-11 pl-4 pr-11 rounded-xl bg-elevated border border-border focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                )}
                {mode !== "forgot" && (
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
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet text-background font-semibold text-sm hover:opacity-90 transition glow-cyan flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {mode === "login" ? "Anmelden" : mode === "signup" ? "Konto erstellen" : "Reset-Link senden"}
                </button>
              </form>

              {mode === "login" && (
                <button
                  onClick={() => switchMode("forgot")}
                  className="mt-4 text-xs text-muted-foreground hover:text-foreground w-full text-center"
                >
                  Passwort vergessen?
                </button>
              )}

              <button
                onClick={() => switchMode(mode === "login" ? "signup" : "login")}
                className="mt-3 text-xs text-muted-foreground hover:text-foreground w-full text-center"
              >
                {mode === "login" ? "Noch kein Konto? Jetzt registrieren" : "Schon registriert? Anmelden"}
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
