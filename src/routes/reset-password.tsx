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
  clearAuthFlags,
} from "@/lib/auth-session";

import {
  Activity,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

import {
  toast,
} from "sonner";


export const Route =
  createFileRoute("/reset-password")({
    head: () => ({
      meta: [
        {
          title:
            "Aether Athlete IQ · Neues Passwort",
        },
        {
          name:
            "description",
          content:
            "Setze ein neues Passwort für dein Aether Athlete IQ Konto.",
        },
      ],
    }),

    component:
      ResetPasswordPage,
  });


function getResetErrorMessage(
  error: unknown,
) {
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();


  if (
    message.includes(
      "same password",
    )
  ) {
    return "Bitte wähle ein anderes Passwort als dein bisheriges Passwort.";
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
      )
    )
  ) {
    return "Das neue Passwort ist zu schwach.";
  }


  if (
    message.includes(
      "session",
    ) ||
    message.includes(
      "jwt",
    ) ||
    message.includes(
      "expired",
    )
  ) {
    return "Der Reset-Link ist ungültig oder abgelaufen. Bitte fordere einen neuen Link an.";
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


  return error instanceof Error
    ? error.message
    : "Das Passwort konnte nicht geändert werden.";
}


function ResetPasswordPage() {
  const navigate =
    useNavigate();


  const [
    password,
    setPassword,
  ] =
    useState("");


  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState("");


  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false);


  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] =
    useState(false);


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  const [
    checkingRecovery,
    setCheckingRecovery,
  ] =
    useState(true);


  const [
    ready,
    setReady,
  ] =
    useState(false);


  const [
    completed,
    setCompleted,
  ] =
    useState(false);


  const [
    resetError,
    setResetError,
  ] =
    useState<string | null>(
      null,
    );


  useEffect(
    () => {
      let active =
        true;


      const {
        data: {
          subscription,
        },
      } =
        supabase.auth
          .onAuthStateChange(
            (
              event,
              session,
            ) => {
              if (
                !active
              ) {
                return;
              }


              if (
                event ===
                  "PASSWORD_RECOVERY"
              ) {
                setReady(
                  Boolean(
                    session,
                  ),
                );

                setResetError(
                  session
                    ? null
                    : "Der Reset-Link konnte nicht bestätigt werden.",
                );

                setCheckingRecovery(
                  false,
                );
              }
            },
          );


      /*
       * The recovery link creates a temporary authenticated
       * Supabase session. Check for that session on page load.
       */
      void supabase.auth
        .getSession()
        .then(
          ({
            data,
            error,
          }) => {
            if (
              !active
            ) {
              return;
            }


            if (
              error
            ) {
              setReady(
                false,
              );

              setResetError(
                getResetErrorMessage(
                  error,
                ),
              );

              setCheckingRecovery(
                false,
              );

              return;
            }


            if (
              data.session
            ) {
              setReady(
                true,
              );

              setResetError(
                null,
              );
            } else {
              setReady(
                false,
              );

              setResetError(
                "Der Reset-Link ist ungültig oder abgelaufen. Bitte fordere einen neuen Link an.",
              );
            }


            setCheckingRecovery(
              false,
            );
          },
        );


      return () => {
        active =
          false;

        subscription.unsubscribe();
      };
    },
    [],
  );


  async function submit(
    event:
      React.FormEvent,
  ) {
    event.preventDefault();


    setResetError(
      null,
    );


    if (
      !ready
    ) {
      setResetError(
        "Der Reset-Link ist nicht mehr gültig. Bitte fordere einen neuen Link an.",
      );

      return;
    }


    if (
      !password
    ) {
      setResetError(
        "Bitte gib ein neues Passwort ein.",
      );

      return;
    }


    if (
      password.length <
      6
    ) {
      setResetError(
        "Das Passwort muss mindestens 6 Zeichen lang sein.",
      );

      return;
    }


    if (
      !confirmPassword
    ) {
      setResetError(
        "Bitte wiederhole dein neues Passwort.",
      );

      return;
    }


    if (
      password !==
      confirmPassword
    ) {
      setResetError(
        "Die Passwörter stimmen nicht überein.",
      );

      return;
    }


    setLoading(
      true,
    );


    try {
      const {
        data,
        error,
      } =
        await supabase.auth
          .updateUser({
            password,
          });


      if (
        error
      ) {
        throw error;
      }


      if (
        !data.user
      ) {
        throw new Error(
          "Das Passwort konnte nicht bestätigt werden.",
        );
      }


      setCompleted(
        true,
      );


      toast.success(
        "Passwort erfolgreich geändert.",
      );


      /*
       * Do not keep the password-recovery session active.
       * The user should authenticate normally with the new
       * password afterwards.
       */
      await supabase.auth
        .signOut();


      clearAuthFlags();


      await new Promise(
        (
          resolve,
        ) =>
          window.setTimeout(
            resolve,
            1200,
          ),
      );


      await navigate({
        to:
          "/auth",
      });
    } catch (
      error
    ) {
      console.error(
        "PASSWORD RESET ERROR:",
        error,
      );


      const message =
        getResetErrorMessage(
          error,
        );


      setResetError(
        message,
      );


      toast.error(
        message,
      );
    } finally {
      setLoading(
        false,
      );
    }
  }


  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4">
      <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-neon-violet/20 blur-3xl" />

      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-neon-cyan/15 blur-3xl" />

      <div className="grid-bg pointer-events-none absolute inset-0" />


      <div className="relative w-full max-w-md">
        <Link
          to="/auth"
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
            Neues Passwort
          </h1>


          <p className="mt-1 text-sm text-muted-foreground">
            {
              checkingRecovery
                ? "Reset-Link wird geprüft..."
                : ready
                  ? "Lege jetzt dein neues Passwort fest."
                  : "Dieser Reset-Link kann nicht verwendet werden."
            }
          </p>


          {completed ? (
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />

              <div>
                <p className="text-sm font-semibold text-green-700">
                  Passwort geändert
                </p>

                <p className="mt-1 text-xs text-green-700">
                  Du wirst jetzt zum Login weitergeleitet.
                </p>
              </div>
            </div>
          ) : (
            <>
              {resetError && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="mt-5 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5"
                >
                  <p className="text-sm font-semibold text-red-700">
                    Passwort konnte nicht geändert werden
                  </p>

                  <p className="mt-1 text-xs text-red-600">
                    {
                      resetError
                    }
                  </p>
                </div>
              )}


              {ready && (
                <form
                  onSubmit={
                    submit
                  }
                  noValidate
                  className="mt-5 space-y-3"
                >
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

                        setResetError(
                          null,
                        );
                      }}
                      placeholder="Neues Passwort"
                      autoComplete="new-password"
                      className="h-11 w-full rounded-xl border border-border bg-elevated pl-4 pr-11 text-sm outline-none focus:ring-2 focus:ring-neon-cyan/50"
                    />


                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword,
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      aria-label={
                        showPassword
                          ? "Passwort verbergen"
                          : "Passwort anzeigen"
                      }
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


                  <div className="relative">
                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        confirmPassword
                      }
                      onChange={(
                        event,
                      ) => {
                        setConfirmPassword(
                          event.target.value,
                        );

                        setResetError(
                          null,
                        );
                      }}
                      placeholder="Neues Passwort wiederholen"
                      autoComplete="new-password"
                      className="h-11 w-full rounded-xl border border-border bg-elevated pl-4 pr-11 text-sm outline-none focus:ring-2 focus:ring-neon-cyan/50"
                    />


                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword,
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      aria-label={
                        showConfirmPassword
                          ? "Passwort verbergen"
                          : "Passwort anzeigen"
                      }
                    >
                      {
                        showConfirmPassword
                          ? (
                            <EyeOff className="h-4 w-4" />
                          )
                          : (
                            <Eye className="h-4 w-4" />
                          )
                      }
                    </button>
                  </div>


                  <button
                    type="submit"
                    disabled={
                      loading ||
                      checkingRecovery
                    }
                    className="glow-cyan flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet text-sm font-semibold text-background disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}


                    {
                      loading
                        ? "Passwort wird geändert..."
                        : "Passwort speichern"
                    }
                  </button>
                </form>
              )}
            </>
          )}


          {!completed && (
            <Link
              to="/auth"
              className="mt-5 block text-center text-xs text-muted-foreground hover:text-foreground"
            >
              Zurück zum Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}