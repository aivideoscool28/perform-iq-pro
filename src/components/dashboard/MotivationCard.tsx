export function MotivationCard() {
  return (
    <div className="
      relative min-h-[155px] overflow-hidden
      rounded-2xl border border-accent/20
      bg-gradient-to-br from-accent/15 via-accent/5 to-card
      p-6 shadow-sm
    ">
      <div className="
        pointer-events-none absolute
        -right-10 -top-16 h-44 w-44
        rounded-full bg-accent/20 blur-3xl
      " />

      <div className="
        pointer-events-none absolute
        left-5 top-2
        select-none text-[90px] font-black
        leading-none text-accent/10
      ">
        “
      </div>

      <div className="
        relative flex h-full
        flex-col justify-center
        pl-6 pr-4
      ">
        <div className="
          mb-3 text-[10px] font-bold
          uppercase tracking-[0.24em] text-accent
        ">
          Motivation
        </div>

        <blockquote className="
          max-w-xl text-lg font-semibold
          italic leading-relaxed tracking-tight
          text-foreground
        ">
          „Grenzen existieren nur in deinem Kopf.“
        </blockquote>

        <div className="
          mt-3 text-xs font-bold
          uppercase tracking-[0.18em]
          text-accent
        ">
          — Armand Duplantis
        </div>
      </div>
    </div>
  );
}
