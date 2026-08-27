import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";

import {
  useEffect,
  useState,
} from "react";

import {
  supabase,
} from "@/integrations/supabase/client";

import {
  markJustLoggedIn,
  setRememberMe,
} from "@/lib/auth-session";

import {
  Activity,
  Check,
  Eye,
  EyeOff,
  Loader2,
  MailCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

import {
  toast,
} from "sonner";


type SignupRole =
  | "athlete"
  | "coach";


type SentMail =
  | {
      kind: "reset";
      email: string;
    }
  | {
      kind: "verify";
      email: string;
    };


export const Route =
  createFileRoute("/auth")({
    head: () => ({
      meta: [
        {
          title:
            "Aether Athlete IQ · Login",
        },
        {
          name:
            "description",
          content:
            "Anmelden oder Konto für Aether Athlete IQ erstellen.",
        },
      ],
    }),

    component:
      AuthPage,
  });


function getFriendlyAuthError(
  error: unknown,
) {
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();


  if (
    message.includes(
      "invalid login credentials",
    ) ||
    message.includes(
      "invalid credentials",
    )
  ) {
    return "E-Mail oder Passwort ist falsch.";
  }


  if (
    message.includes(
      "email not confirmed",
    )
  ) {
    return "Bitte bestätige zuerst deine E-Mail-Adresse.";
  }


  if (
    message.includes(
      "user already registered",
    )
  ) {
    return "Für diese E-Mail existiert bereits ein Konto.";
  }


  if (
    message.includes(
      "email address",
    ) &&
    message.includes(
      "invalid",
    )
  ) {
    return "Bitte gib eine gültige E-Mail-Adresse ein.";
  }


  if (
    message.includes(
      "signup is disabled",
    )
  ) {
    return "Neue Registrierungen sind momentan deaktiviert.";
  }


  if (
    message.includes(
      "password",
    ) &&
    (
      message.includes(
        "weak",
      ) ||
      message.includes(
        "least",
      ) ||
      message.includes(
        "short",
      )
    )
  ) {
    return "Das Passwort ist zu schwach. Bitte wähle ein stärkeres Passwort.";
  }


  if (
    message.includes(
      "email rate limit",
    ) ||
    message.includes(
      "over_email_send_rate_limit",
    )
  ) {
    return "Zu viele E-Mails wurden in kurzer Zeit angefordert. Bitte warte etwas und versuche es erneut.";
  }


  if (
    message.includes(
      "rate limit",
    ) ||
    message.includes(
      "too many requests",
    )
  ) {
    return "Zu viele Versuche. Bitte warte kurz und versuche es erneut.";
  }


  if (
    message.includes(
      "network",
    ) ||
    message.includes(
      "fetch",
    )
  ) {
    return "Verbindung fehlgeschlagen. Bitte prüfe deine Internetverbindung.";
  }


  if (
    message.includes(
      "signup_timeout",
    )
  ) {
    return "Die Registrierung antwortet nicht. Bitte versuche es erneut.";
  }


  if (
    message.includes(
      "signup_no_user",
    )
  ) {
    return "Das Konto konnte nicht erstellt werden. Bitte versuche es erneut.";
  }


  return error instanceof Error
    ? error.message
    : "Unbekannter Auth-Fehler: " + JSON.stringify(error);
}


function AuthPage() {
  const navigate =
    useNavigate();


  const [
    mode,
    setMode,
  ] =
    useState<
      | "login"
      | "signup"
      | "forgot"
    >(
      "login",
    );


  const [
    email,
    setEmail,
  ] =
    useState("");


  const [
    password,
    setPassword,
  ] =
    useState("");


  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false);


  const [
    name,
    setName,
  ] =
    useState("");


  const [
    signupRole,
    setSignupRole,
  ] =
    useState<SignupRole>(
      "athlete",
    );


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  const [
    authError,
    setAuthError,
  ] =
    useState<string | null>(
      null,
    );


  const [
    remember,
    setRemember,
  ] =
    useState(true);


  const [
    sentTo,
    setSentTo,
  ] =
    useState<
      SentMail |
      null
    >(
      null,
    );


  const showError = (
    message: string,
  ) => {
    setAuthError(
      message,
    );

    toast.error(
      message,
    );
  };


  const navigateForUser =
    async (
      userId: string,
    ) => {
      const {
        data,
        error,
      } =
        await supabase
          .from(
            "profiles",
          )
          .select(
            "role",
          )
          .eq(
            "id",
            userId,
          )
          .single();


      if (
        error
      ) {
        console.error(
          "Could not load user role:",
          error,
        );

        showError(
          "Dein Konto konnte nicht vollständig geladen werden.",
        );

        return;
      }


      if (
        data.role ===
        "coach"
      ) {
        await navigate({
          to:
            "/coach-manager",
        });

        return;
      }


      await navigate({
        to:
          "/",
      });
    };


  useEffect(
    () => {
      let active =
        true;


      void supabase.auth
        .getSession()
        .then(
          ({
            data,
          }) => {
            if (
              !active ||
              !data.session
            ) {
              return;
            }


            void navigateForUser(
              data.session.user.id,
            );
          },
        );


      return () => {
        active =
          false;
      };
    },
    [],
  );


  const handleEmail =
    async (
      event:
        React.FormEvent,
    ) => {
      event.preventDefault();

      setAuthError(
        null,
      );


      if (
        loading
      ) {
        return;
      }


      const cleanEmail =
        email
          .trim()
          .toLowerCase();


      /*
       * Manual validation.
       *
       * We intentionally use noValidate on the form so
       * the browser cannot silently stop submission.
       * Every validation error is displayed visibly.
       */
      if (
        !cleanEmail
      ) {
        showError(
          "Bitte gib deine E-Mail-Adresse ein.",
        );

        return;
      }


      const emailLooksValid =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          cleanEmail,
        );


      if (
        !emailLooksValid
      ) {
        showError(
          "Bitte gib eine gültige E-Mail-Adresse ein.",
        );

        return;
      }


      if (
        mode ===
          "signup" &&
        !name.trim()
      ) {
        showError(
          "Bitte gib deinen Namen ein.",
        );

        return;
      }


      if (
        mode !==
          "forgot" &&
        !password
      ) {
        showError(
          "Bitte gib dein Passwort ein.",
        );

        return;
      }


      if (
        mode !==
          "forgot" &&
        password.length <
          6
      ) {
        showError(
          "Das Passwort muss mindestens 6 Zeichen lang sein.",
        );

        return;
      }


      setLoading(
        true,
      );


      try {
        /*
         * FORGOT PASSWORD
         */
        if (
          mode ===
          "forgot"
        ) {
          const {
            error,
          } =
            await supabase.auth
              .resetPasswordForEmail(
                cleanEmail,
                {
                  redirectTo:
                    `${import.meta.env.VITE_APP_URL || window.location.origin}/reset-password`,
                },
              );


          if (
            error
          ) {
            throw error;
          }


          setSentTo({
            kind:
              "reset",

            email:
              cleanEmail,
          });


          toast.success(
            "Reset-Link wurde gesendet.",
          );


          return;
        }


        /*
         * SIGNUP
         */
        if (
          mode ===
          "signup"
        ) {
          const signupPromise =
            supabase.auth
              .signUp({
                email:
                  cleanEmail,

                password,

                options: {
                  emailRedirectTo:
                    `${import.meta.env.VITE_APP_URL || window.location.origin}/auth`,

                  data: {
                    display_name:
                      name.trim(),

                    role:
                      signupRole,
                  },
                },
              });


          const timeoutPromise =
            new Promise<never>(
              (
                _,
                reject,
              ) => {
                window.setTimeout(
                  () => {
                    reject(
                      new Error(
                        "SIGNUP_TIMEOUT",
                      ),
                    );
                  },
                  20_000,
                );
              },
            );


          const {
            data,
            error,
          } =
            await Promise.race([
              signupPromise,
              timeoutPromise,
            ]);


          if (
            error
          ) {
            throw error;
          }


          if (
            !data.user
          ) {
            throw new Error(
              "SIGNUP_NO_USER",
            );
          }


          /*
           * Supabase can deliberately return an
           * obfuscated user for an already registered
           * email instead of throwing an error.
           */
          if (
            (
              data.user
                .identities
                ?.length ??
              0
            ) ===
            0
          ) {
            const message =
              "Für diese E-Mail existiert bereits ein Konto. Bitte melde dich an.";


            showError(
              message,
            );


            return;
          }


          /*
           * With Confirm Email enabled Supabase normally
           * returns no session.
           *
           * If confirmation is disabled for some reason,
           * do not leave a newly registered account logged
           * in automatically.
           */
          if (
            data.session
          ) {
            await supabase.auth
              .signOut();
          }


          setSentTo({
            kind:
              "verify",

            email:
              cleanEmail,
          });


          toast.success(
            signupRole ===
            "coach"
              ? "Trainerkonto erstellt. Bitte bestätige deine E-Mail-Adresse."
              : "Athletenkonto erstellt. Bitte bestätige deine E-Mail-Adresse.",
          );


          return;
        }


        /*
         * LOGIN
         */
        const {
          data,
          error,
        } =
          await supabase.auth
            .signInWithPassword({
              email:
                cleanEmail,

              password,
            });


        if (
          error
        ) {
          throw error;
        }


        if (
          !data.session
        ) {
          showError(
            "Anmeldung fehlgeschlagen. Bitte prüfe deine Zugangsdaten.",
          );

          return;
        }


        setRememberMe(
          remember,
        );


        markJustLoggedIn();


        toast.success(
          "Erfolgreich angemeldet.",
        );


        await navigateForUser(
          data.session.user.id,
        );
      } catch (
        error
      ) {
        console.error(
          "AUTH ERROR:",
          error,
        );


        const message =
          getFriendlyAuthError(
            error,
          );


        showError(
          message,
        );
      } finally {
        setLoading(
          false,
        );
      }
    };


  const handleGoogle =
    async () => {
      setAuthError(
        null,
      );


      if (
        loading
      ) {
        return;
      }


      setLoading(
        true,
      );


      try {
        setRememberMe(
          remember,
        );


        markJustLoggedIn();


        const {
          error,
        } =
          await supabase.auth
            .signInWithOAuth({
              provider:
                "google",

              options: {
                redirectTo:
                  `${import.meta.env.VITE_APP_URL || window.location.origin}/`,
              },
            });


        if (
          error
        ) {
          throw error;
        }
      } catch (
        error
      ) {
        console.error(
          "GOOGLE AUTH ERROR:",
          error,
        );


        const message =
          getFriendlyAuthError(
            error,
          );


        showError(
          message,
        );


        setLoading(
          false,
        );
      }
    };


  function switchMode(
    nextMode:
      | "login"
      | "signup"
      | "forgot",
  ) {
    setSentTo(
      null,
    );


    setAuthError(
      null,
    );


    setMode(
      nextMode,
    );


    setPassword(
      "",
    );


    setShowPassword(
      false,
    );
  }


  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4">
      <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-neon-violet/20 blur-3xl" />

      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-neon-cyan/15 blur-3xl" />

      <div className="grid-bg pointer-events-none absolute inset-0" />


      <div className="relative w-full max-w-md">
        <Link
          to="/"
          className="mb-6 flex items-center justify-center gap-2"
        >
          <div className="glow-cyan grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-neon-cyan to-neon-violet">
            <Activity
              className="h-5 w-5 text-background"
              strokeWidth={
                2.5
              }
            />
          </div>

          <span className="text-xl font-bold">
            Aether Athlete IQ
          </span>
        </Link>


        <div className="glass-strong rounded-3xl p-7">
          <h1 className="text-2xl font-bold tracking-tight">
            {
              mode ===
              "login"
                ? "Willkommen zurück"
                : mode ===
                    "signup"
                  ? "Konto erstellen"
                  : "Passwort vergessen"
            }
          </h1>


          <p className="mt-1 text-sm text-muted-foreground">
            {
              mode ===
              "login"
                ? "Melde dich bei deinem Konto an."
                : mode ===
                    "signup"
                  ? "Wähle zuerst, wie du Aether Athlete IQ nutzt."
                  : "Wir senden dir einen Link zum Zurücksetzen."
            }
          </p>


          {sentTo ? (
            <div className="mt-6 space-y-4">
              <div className="flex gap-3 rounded-2xl border border-border bg-elevated p-4">
                <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-neon-cyan" />

                <div>
                  <p className="text-sm font-semibold">
                    {
                      sentTo.kind ===
                      "verify"
                        ? "E-Mail bestätigen"
                        : "Reset-Link gesendet"
                    }
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {
                      sentTo.kind ===
                      "verify"
                        ? "Wir haben eine Bestätigungs-E-Mail gesendet an"
                        : "Wir haben einen Reset-Link gesendet an"
                    }

                    <span className="font-medium text-foreground">
                      {" "}
                      {
                        sentTo.email
                      }
                    </span>
                    .
                  </p>


                  {sentTo.kind ===
                    "verify" && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Bestätige deine E-Mail und melde dich danach mit deinem neuen Konto an.
                    </p>
                  )}
                </div>
              </div>


              <button
                type="button"
                onClick={() =>
                  switchMode(
                    "login",
                  )
                }
                className="glass h-11 w-full rounded-xl border border-border text-sm font-medium transition hover:bg-white/5"
              >
                Zurück zum Login
              </button>
            </div>
          ) : (
            <>
              {mode !==
                "forgot" && (
                <>
                  <button
                    type="button"
                    onClick={
                      handleGoogle
                    }
                    disabled={
                      loading
                    }
                    className="glass mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium transition hover:bg-white/5 disabled:opacity-60"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      aria-hidden
                    >
                      <path
                        fill="#EA4335"
                        d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.5 12 2.5 6.7 2.5 2.5 6.7 2.5 12s4.2 9.5 9.5 9.5c5.5 0 9.1-3.9 9.1-9.3 0-.6-.07-1.1-.2-2H12z"
                      />
                    </svg>

                    Mit Google fortfahren
                  </button>


                  <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="h-px flex-1 bg-border" />

                    <span>
                      oder
                    </span>

                    <div className="h-px flex-1 bg-border" />
                  </div>
                </>
              )}


              <form
                onSubmit={
                  handleEmail
                }
                noValidate
                className={
                  mode ===
                  "forgot"
                    ? "mt-5 space-y-3"
                    : "space-y-3"
                }
              >
                {mode ===
                  "signup" && (
                  <>
                    <div>
                      <p className="mb-2 text-xs font-semibold">
                        Ich bin...
                      </p>


                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSignupRole(
                              "athlete",
                            );

                            setAuthError(
                              null,
                            );
                          }}
                          className={[
                            "rounded-2xl border p-3 text-left transition",
                            signupRole ===
                            "athlete"
                              ? "border-neon-cyan bg-neon-cyan/10"
                              : "border-border hover:bg-white/5",
                          ].join(
                            " ",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <UserRound className="h-4 w-4" />

                            <p className="text-sm font-semibold">
                              Athlet
                            </p>
                          </div>

                          <p className="mt-1 text-[11px] text-muted-foreground">
                            Training, Analysen und Feedback
                          </p>
                        </button>


                        <button
                          type="button"
                          onClick={() => {
                            setSignupRole(
                              "coach",
                            );

                            setAuthError(
                              null,
                            );
                          }}
                          className={[
                            "rounded-2xl border p-3 text-left transition",
                            signupRole ===
                            "coach"
                              ? "border-neon-violet bg-neon-violet/10"
                              : "border-border hover:bg-white/5",
                          ].join(
                            " ",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <UsersRound className="h-4 w-4" />

                            <p className="text-sm font-semibold">
                              Trainer
                            </p>
                          </div>

                          <p className="mt-1 text-[11px] text-muted-foreground">
                            Athleten und Training verwalten
                          </p>
                        </button>
                      </div>
                    </div>


                    <input
                      value={
                        name
                      }
                      onChange={(
                        event,
                      ) => {
                        setName(
                          event.target.value,
                        );

                        setAuthError(
                          null,
                        );
                      }}
                      placeholder="Dein Name"
                      autoComplete="name"
                      className="h-11 w-full rounded-xl border border-border bg-elevated px-4 text-sm focus:outline-none focus:ring-2 focus:ring-neon-cyan/50"
                    />
                  </>
                )}


                <input
                  type="email"
                  value={
                    email
                  }
                  onChange={(
                    event,
                  ) => {
                    setEmail(
                      event.target.value,
                    );

                    setAuthError(
                      null,
                    );
                  }}
                  placeholder="E-Mail"
                  autoComplete="email"
                  inputMode="email"
                  className="h-11 w-full rounded-xl border border-border bg-elevated px-4 text-sm focus:outline-none focus:ring-2 focus:ring-neon-cyan/50"
                />


                {mode !==
                  "forgot" && (
                  <div className="relative">
                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        password
                      }
                      onChange={(
                        event,
                      ) => {
                        setPassword(
                          event.target.value,
                        );

                        setAuthError(
                          null,
                        );
                      }}
                      placeholder="Passwort (min. 6 Zeichen)"
                      autoComplete={
                        mode ===
                        "signup"
                          ? "new-password"
                          : "current-password"
                      }
                      className="h-11 w-full rounded-xl border border-border bg-elevated pl-4 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-neon-cyan/50"
                    />


                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword,
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Passwort verbergen"
                          : "Passwort anzeigen"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                    >
                      {
                        showPassword
                          ? (
                            <EyeOff className="h-4 w-4" />
                          )
                          : (
                            <Eye className="h-4 w-4" />
                          )
                      }
                    </button>
                  </div>
                )}


                {mode !==
                  "forgot" && (
                  <button
                    type="button"
                    onClick={() =>
                      setRemember(
                        !remember,
                      )
                    }
                    className="flex w-full items-center gap-2.5 py-1 text-xs text-muted-foreground transition hover:text-foreground"
                  >
                    <span
                      className={[
                        "grid h-4 w-4 place-items-center rounded-[5px] border transition",
                        remember
                          ? "border-transparent bg-gradient-to-br from-neon-cyan to-neon-violet"
                          : "border-border",
                      ].join(
                        " ",
                      )}
                    >
                      {remember && (
                        <Check
                          className="h-3 w-3 text-background"
                          strokeWidth={
                            3
                          }
                        />
                      )}
                    </span>

                    Angemeldet bleiben
                  </button>
                )}


                {authError && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5"
                  >
                    <p className="text-sm font-semibold text-red-700">
                      {
                        mode ===
                        "signup"
                          ? "Registrierung nicht möglich"
                          : mode ===
                              "forgot"
                            ? "Zurücksetzen nicht möglich"
                            : "Anmeldung nicht möglich"
                      }
                    </p>

                    <p className="mt-1 text-xs text-red-600">
                      {
                        authError
                      }
                    </p>
                  </div>
                )}


                <button
                  type="submit"
                  disabled={
                    loading
                  }
                  className="glow-cyan flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}


                  {
                    loading
                      ? mode ===
                        "signup"
                        ? "Konto wird erstellt..."
                        : mode ===
                            "login"
                          ? "Anmeldung läuft..."
                          : "Reset-Link wird gesendet..."
                      : mode ===
                          "login"
                        ? "Anmelden"
                        : mode ===
                            "signup"
                          ? signupRole ===
                            "coach"
                            ? "Trainerkonto erstellen"
                            : "Athletenkonto erstellen"
                          : "Reset-Link senden"
                  }
                </button>
              </form>


              {mode ===
                "login" && (
                <button
                  type="button"
                  onClick={() =>
                    switchMode(
                      "forgot",
                    )
                  }
                  className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
                >
                  Passwort vergessen?
                </button>
              )}


              {mode !==
                "forgot" && (
                <button
                  type="button"
                  onClick={() =>
                    switchMode(
                      mode ===
                      "login"
                        ? "signup"
                        : "login",
                    )
                  }
                  className="mt-3 w-full text-center text-xs text-muted-foreground hover:text-foreground"
                >
                  {
                    mode ===
                    "login"
                      ? "Noch kein Konto? Jetzt registrieren"
                      : "Schon registriert? Anmelden"
                  }
                </button>
              )}


              {mode ===
                "forgot" && (
                <button
                  type="button"
                  onClick={() =>
                    switchMode(
                      "login",
                    )
                  }
                  className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
                >
                  Zurück zum Login
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

