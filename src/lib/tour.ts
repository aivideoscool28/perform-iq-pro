// Lightweight client-side helpers for the first-run feature tour and the
// dev-only "Reset to New User" control.

const PENDING_KEY = "athleticiq.tour.pending";

/** Mark that the tour should run on the next dashboard visit. */
export function markTourPending() {
  try {
    localStorage.setItem(PENDING_KEY, "1");
  } catch {
    /* noop */
  }
}

/** Whether the tour is queued to run (set after onboarding or a dev reset). */
export function isTourPending(): boolean {
  try {
    return localStorage.getItem(PENDING_KEY) === "1";
  } catch {
    return false;
  }
}

/** Clear the queued tour once it has been shown or skipped. */
export function clearTourPending() {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch {
    /* noop */
  }
}

/** True only in local dev or on a Lovable preview host — never in production. */
export function isDevPreview(): boolean {
  if (import.meta.env.DEV) return true;
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return (
    h.includes("id-preview") ||
    h.includes("preview--") ||
    h.endsWith("-dev.lovable.app")
  );
}
