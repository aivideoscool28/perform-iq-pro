/**
 * "Remember me" policy + post-login welcome flag.
 *
 * The Supabase client always persists to localStorage. To emulate a
 * session-only login we mark the session as session-only and drop it when a
 * new browser session starts (sessionStorage is cleared when the browser is
 * closed, but survives reloads and navigation within the same tab).
 */
const SESSION_ONLY_KEY = "athleticiq.auth.sessionOnly";
const TAB_ALIVE_KEY = "athleticiq.auth.tabAlive";
const WELCOME_KEY = "athleticiq.auth.justLoggedIn";

export function setRememberMe(remember: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (remember) {
      localStorage.removeItem(SESSION_ONLY_KEY);
    } else {
      localStorage.setItem(SESSION_ONLY_KEY, "1");
    }
    sessionStorage.setItem(TAB_ALIVE_KEY, "1");
  } catch {
    /* noop */
  }
}

/** Returns true when a session-only login must be discarded (browser restarted). */
export function shouldDropSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const sessionOnly = localStorage.getItem(SESSION_ONLY_KEY) === "1";
    const tabAlive = sessionStorage.getItem(TAB_ALIVE_KEY) === "1";
    if (sessionOnly && !tabAlive) {
      localStorage.removeItem(SESSION_ONLY_KEY);
      return true;
    }
    if (sessionOnly) sessionStorage.setItem(TAB_ALIVE_KEY, "1");
    return false;
  } catch {
    return false;
  }
}

export function clearAuthFlags() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_ONLY_KEY);
    sessionStorage.removeItem(TAB_ALIVE_KEY);
    sessionStorage.removeItem(WELCOME_KEY);
  } catch {
    /* noop */
  }
}

export function markJustLoggedIn() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(WELCOME_KEY, "1");
  } catch {
    /* noop */
  }
}

/** Consumes the flag: true only on the first dashboard render after a login. */
export function consumeJustLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const v = sessionStorage.getItem(WELCOME_KEY) === "1";
    if (v) sessionStorage.removeItem(WELCOME_KEY);
    return v;
  } catch {
    return false;
  }
}
