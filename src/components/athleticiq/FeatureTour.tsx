import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";

type TourStep = {
  selector: string;
  title: string;
  text: string;
};

const STEPS: TourStep[] = [
  {
    selector: '[data-tour="checkin"]',
    title: "Daily Check-in",
    text: "Das ist dein Daily Check-in. Logge hier jeden Tag Training, Ernährung und Schlaf — dauert nur 2 Minuten.",
  },
  {
    selector: '[data-tour="streak"]',
    title: "Dein Streak 🔥",
    text: "Das ist dein Streak. Mach jeden Tag einen Check-in, damit er weiter wächst!",
  },
  {
    selector: '[data-tour="nav-analysis"]',
    title: "Workout-Analyse",
    text: "Nach jedem Training findest du hier deine persönliche Analyse — was gut lief und was du verbessern kannst.",
  },
  {
    selector: '[data-tour="performance"]',
    title: "Performance-Dashboard",
    text: "Verfolge hier Energie, Schlaf, Regeneration und Belastung — es füllt sich, je mehr Daten du loggst.",
  },
  {
    selector: '[data-tour="nav-friends"]',
    title: "Freunde & Streaks",
    text: "Lade Freunde ein, vergleicht eure Streaks und bleibt gemeinsam motiviert!",
  },
];

const PAD = 8;

interface Props {
  onClose: () => void;
}

function findTarget(selector: string): HTMLElement | null {
  const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector));
  // Prefer the first visible match (sidebar exists twice: desktop + mobile dock).
  return (
    nodes.find((n) => {
      const r = n.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    }) ?? null
  );
}

export function FeatureTour({ onClose }: Props) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [finished, setFinished] = useState(false);

  const isLast = index === STEPS.length - 1;
  const step = STEPS[index];

  const measure = useCallback(() => {
    if (finished) return;
    const el = findTarget(step.selector);
    if (!el) {
      setRect(null);
      return;
    }
    el.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
    // Measure after a frame so scroll settles.
    requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      setRect(r);
    });
  }, [step, finished]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const onChange = () => measure();
    window.addEventListener("resize", onChange);
    window.addEventListener("scroll", onChange, true);
    const t = setInterval(measure, 600); // keep spotlight glued to moving layout
    return () => {
      window.removeEventListener("resize", onChange);
      window.removeEventListener("scroll", onChange, true);
      clearInterval(t);
    };
  }, [measure]);

  const next = () => {
    if (isLast) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
  };

  const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
  const vh = typeof window !== "undefined" ? window.innerHeight : 768;

  // Tooltip placement: below the target if there is room, else above.
  let tipTop = vh / 2 - 80;
  let tipLeft = vw / 2 - 160;
  if (rect) {
    const below = rect.bottom + 16;
    const placeBelow = below + 180 < vh;
    tipTop = placeBelow ? below : Math.max(16, rect.top - 196);
    tipLeft = Math.min(Math.max(16, rect.left), vw - 336);
  }

  const overlay = (
    <div className="fixed inset-0 z-[100]">
      {finished ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 grid place-items-center bg-background/85 backdrop-blur-sm px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="glass-strong rounded-3xl border border-border p-8 text-center max-w-sm w-full"
          >
            <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-violet grid place-items-center glow-cyan mb-4">
              <Sparkles className="h-6 w-6 text-background" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Alles bereit!</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Du bist startklar. Lass uns loslegen.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full h-12 rounded-2xl bg-foreground text-background font-semibold hover:opacity-90 transition"
            >
              Tracking starten
            </button>
          </motion.div>
        </motion.div>
      ) : (
        <>
          {/* Spotlight mask */}
          {rect ? (
            <div
              className="absolute rounded-2xl ring-2 ring-neon-cyan transition-all duration-300 pointer-events-none"
              style={{
                top: rect.top - PAD,
                left: rect.left - PAD,
                width: rect.width + PAD * 2,
                height: rect.height + PAD * 2,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.72)",
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-background/80" />
          )}

          {/* Tooltip bubble */}
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute w-80 max-w-[calc(100vw-32px)] glass-strong rounded-2xl border border-border p-5 shadow-xl"
            style={{ top: tipTop, left: tipLeft }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-[0.22em] text-neon-cyan">
                Schritt {index + 1} von {STEPS.length}
              </span>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition"
                aria-label="Tour überspringen"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <h4 className="font-bold tracking-tight">{step.title}</h4>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              {step.text}
            </p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                onClick={onClose}
                className="text-xs text-muted-foreground hover:text-foreground transition"
              >
                Tour überspringen
              </button>
              <button
                onClick={next}
                className="h-9 px-5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet text-background font-semibold text-sm hover:opacity-90 transition"
              >
                {isLast ? "Fertig" : "Weiter"}
              </button>
            </div>
            {/* progress dots */}
            <div className="mt-3 flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-5 bg-neon-cyan" : "w-1.5 bg-border"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );

  return createPortal(<AnimatePresence>{overlay}</AnimatePresence>, document.body);
}
