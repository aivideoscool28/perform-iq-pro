import type { ReactNode } from "react";
/** Data is edited through feature forms; never replace React-owned DOM with HTML. */
export function EditableShell({ children }: { storageKey: string; children: ReactNode }) {
  return <>{children}</>;
}
