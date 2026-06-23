import { useMemo } from "react";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const QUOTES = [
  { text: "Du verlierst nicht, bis du aufgibst.", author: "Usain Bolt", role: "100m Weltrekordhalter" },
  { text: "Schmerz ist vorübergehend. Aufgeben dauert für immer.", author: "Lance Armstrong", role: "Ausdauer-Ikone" },
  { text: "Härte schlägt Talent, wenn Talent nicht hart arbeitet.", author: "Allyson Felix", role: "Sprint-Olympiasiegerin" },
  { text: "Ich trainiere, während andere schlafen.", author: "Eliud Kipchoge", role: "Marathon-Legende" },
  { text: "Grenzen existieren nur in deinem Kopf.", author: "Armand Duplantis", role: "Stabhochsprung-Weltrekord" },
  { text: "Der Wille zu gewinnen ist nichts ohne den Willen, sich vorzubereiten.", author: "Carl Lewis", role: "9× Olympiagold" },
];

export function AthleteQuoteCard() {
  // Rotate daily so it feels fresh without extra state.
  const quote = useMemo(() => {
    const day = Math.floor(Date.now() / 86_400_000);
    return QUOTES[day % QUOTES.length];
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6 relative overflow-hidden glass-strong rounded-3xl p-6"
    >
      <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-neon-violet/20 blur-3xl pointer-events-none" />
      <div className="relative flex items-start gap-4">
        <div className="h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-violet grid place-items-center glow-cyan">
          <Quote className="h-5 w-5 text-background" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-neon-cyan">
            <Star className="h-3 w-3" /> Athleten-Spruch des Tages
          </div>
          <p className="mt-2 text-lg font-semibold leading-snug">„{quote.text}"</p>
          <div className="mt-2 text-sm text-muted-foreground">
            <span className="text-foreground font-medium">{quote.author}</span> · {quote.role}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
