import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface Props {
  storageKey: string;
  children: React.ReactNode;
}

/**
 * Wraps any page section and makes every text leaf editable with one toggle.
 * Persists the edited DOM to localStorage keyed by `storageKey`.
 *
 * Trade-off: works only for static dashboard content. Re-renders triggered by
 * external state would overwrite the saved DOM; these pages render once.
 */
export function EditableShell({ storageKey, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const snapshot = useRef<string>("");
  const [loaded, setLoaded] = useState(false);

  // Restore saved DOM after the initial React render.
  useEffect(() => {
    if (!ref.current) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) ref.current.innerHTML = saved;
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, [storageKey]);

  const startEdit = () => {
    const root = ref.current;
    if (!root) return;
    snapshot.current = root.innerHTML;

    const tags = "h1,h2,h3,h4,h5,h6,p,span,div,td,th,label,a,li,button";
    root.querySelectorAll(tags).forEach((el) => {
      const hasDirectText = Array.from(el.childNodes).some(
        (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? "").trim().length > 0,
      );
      // Skip wrappers — only mark leaf-like nodes whose own text we want to edit.
      const hasInteractiveChild = el.querySelector("input,textarea,select");
      if (hasDirectText && !hasInteractiveChild) {
        const h = el as HTMLElement;
        h.setAttribute("contenteditable", "true");
        h.setAttribute("spellcheck", "false");
        h.classList.add("ai-edit-target");
      }
    });
    setEditing(true);
  };

  const stopEditing = (persist: boolean) => {
    const root = ref.current;
    if (!root) return;
    root.querySelectorAll("[contenteditable]").forEach((el) => {
      const h = el as HTMLElement;
      h.removeAttribute("contenteditable");
      h.removeAttribute("spellcheck");
      h.classList.remove("ai-edit-target");
    });
    if (persist) {
      try {
        localStorage.setItem(storageKey, root.innerHTML);
        toast.success("Änderungen gespeichert");
      } catch {
        toast.error("Speichern fehlgeschlagen");
      }
    } else {
      root.innerHTML = snapshot.current;
    }
    setEditing(false);
  };

  const resetAll = () => {
    try {
      localStorage.removeItem(storageKey);
      toast.success("Auf Standard zurückgesetzt");
      window.location.reload();
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-neon-cyan/30 bg-gradient-to-r from-neon-cyan/10 via-neon-violet/10 to-transparent px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs">
          <Pencil className="h-3.5 w-3.5 text-neon-cyan" />
          <span className="font-semibold tracking-wide">
            {editing ? "Bearbeitungsmodus aktiv" : "Inhalte anpassen"}
          </span>
          <span className="text-muted-foreground hidden sm:inline">
            {editing ? "· Klicke in einen Text und tippe los" : "· Klicke \u201EBearbeiten\u201C um Texte zu \u00E4ndern"}
          </span>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button
                size="sm"
                onClick={() => stopEditing(true)}
                className="h-8 bg-neon-cyan text-background hover:bg-neon-cyan/90 font-semibold"
              >
                <Check className="h-3.5 w-3.5 mr-1" /> Speichern
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => stopEditing(false)}
                className="h-8 text-muted-foreground"
              >
                <X className="h-3.5 w-3.5 mr-1" /> Abbrechen
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                onClick={startEdit}
                disabled={!loaded}
                className="h-8 bg-white/[0.06] border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/15"
              >
                <Pencil className="h-3.5 w-3.5 mr-1" /> Bearbeiten
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={resetAll}
                className="h-8 w-8 p-0 text-muted-foreground"
                title="Zurücksetzen"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>
      <div ref={ref}>{children}</div>
    </div>
  );
}
