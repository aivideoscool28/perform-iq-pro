import { useMemo } from "react";
import { motion } from "framer-motion";
import { Quote, Sparkles, Star } from "lucide-react";

type ProfileLike = {
  favourite_athlete?: string | null;
  receive_news_and_motivation?: boolean | null;
  disciplines?: string[] | null;
};

const QUOTES = [
  { text: "Du verlierst nicht, bis du aufgibst.", author: "Usain Bolt", role: "100m Weltrekordhalter" },
  { text: "Schmerz ist vorübergehend. Aufgeben dauert für immer.", author: "Lance Armstrong", role: "Ausdauer-Ikone" },
  { text: "Härte schlägt Talent, wenn Talent nicht hart arbeitet.", author: "Allyson Felix", role: "Sprint-Olympiasiegerin" },
  { text: "Ich trainiere, während andere schlafen.", author: "Eliud Kipchoge", role: "Marathon-Legende" },
  { text: "Grenzen existieren nur in deinem Kopf.", author: "Armand Duplantis", role: "Stabhochsprung-Weltrekord" },
  { text: "Der Wille zu gewinnen ist nichts ohne den Willen, sich vorzubereiten.", author: "Carl Lewis", role: "9× Olympiagold" },
];

export function AthleteQuoteCard({ profile }: { profile?: ProfileLike }) {
  const content = useMemo(() => {
    const day = Math.floor(Date.now() / 86_400_000);
    const quote = QUOTES[day % QUOTES.length];
    const favouriteAthlete = (profile?.favourite_athlete ?? "").trim();
    const discipline = profile?.disciplines?.find(Boolean) ?? "Leichtathletik";
    const showNews = profile?.receive_news_and_motivation !== false;
    const athleteLabel = favouriteAthlete || "dein Lieblings-Athlet";
    const items = showNews
      ? [
          `${athleteLabel} bleibt ein starker Fokuspunkt für mentale Stärke und Konsequenz.`,
          `Deine Disziplin ${discipline} profitiert von klaren Standards und einem ruhigen Rhythmus.`,
          `Motivation: ${quote.text}`,
        ]
      : [`${athleteLabel} erinnert dich heute an Fokus, Geduld und Selbstvertrauen.`, `Motivation: ${quote.text}`];

    return {
      quote,
      first: items[day % items.length],
      second: items[(day + 1) % items.length],
    };
  }, [profile?.favourite_athlete, profile?.receive_news_and_motivation, profile?.disciplines]);

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
            <Star className="h-3 w-3" /> Personalisierte Motivation
          </div>
          <p className="mt-2 text-lg font-semibold leading-snug">„{content.quote.text}“</p>
          <div className="mt-2 text-sm text-muted-foreground">
            <span className="text-foreground font-medium">{content.quote.author}</span> · {content.quote.role}
          </div>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2 rounded-2xl bg-background/70 p-3">
              <Sparkles className="mt-0.5 h-4 w-4 text-neon-cyan shrink-0" />
              <span>{content.first}</span>
            </div>
            <div className="flex items-start gap-2 rounded-2xl bg-background/70 p-3">
              <Star className="mt-0.5 h-4 w-4 text-neon-violet shrink-0" />
              <span>{content.second}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
