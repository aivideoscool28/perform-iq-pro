/** Explicit persistent or tab-scoped session storage; opening a tab never revokes another tab. */
const SESSION_ONLY_KEY = "athleticiq.auth.sessionOnly";
const TAB_ALIVE_KEY = "athleticiq.auth.tabAlive";
const WELCOME_KEY = "athleticiq.auth.justLoggedIn";

export const authStorage = {
  getItem(key: string) {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(key) ?? localStorage.getItem(key);
  },
  setItem(key: string, value: string) {
    if (typeof window === "undefined") return;
    const remember = sessionStorage.getItem("aether.remember") !== "false";
    (remember ? localStorage : sessionStorage).setItem(key, value);
    (remember ? sessionStorage : localStorage).removeItem(key);
  },
  removeItem(key: string) {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }
  },
};
export function setRememberMe(remember: boolean) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("aether.remember", String(remember));
  // Move any session written by signInWithPassword before it returned.
  for (const storage of [localStorage, sessionStorage]) {
    for (const key of Object.keys(storage)) {
      if (/^sb-.*-auth-token$/.test(key)) {
        const value = storage.getItem(key);
        if (value) authStorage.setItem(key, value);
      }
    }
  }
  localStorage.removeItem(SESSION_ONLY_KEY);
}
export function shouldDropSession() {
  return false;
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
