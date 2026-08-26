import {
  Activity,
  Network,
  Sparkles,
  UsersRound,
} from "lucide-react";

const pillars = [
  {
    number: "01",
    title: "SPECIALIZED",
    icon: Activity,
    text: "Built specifically for Track & Field.",
  },
  {
    number: "02",
    title: "CONNECTED",
    icon: Network,
    text: "Training, athlete feedback, analysis and coaching information work together.",
  },
  {
    number: "03",
    title: "INTELLIGENT",
    icon: Sparkles,
    text: "AI is applied to specific athletics problems rather than added as a gimmick.",
  },
  {
    number: "04",
    title: "HUMAN-CENTERED",
    icon: UsersRound,
    text: "Technology supports the athlete–coach relationship instead of trying to replace it.",
  },
];

export function WhyAether() {
  return (
    <section className="why-aether" id="why-aether">
      <div className="why-aether__intro">
        <p className="why-aether__eyebrow">
          WHY AETHER ATHLETE IQ?
        </p>

        <h2>
          Better understanding.
          <br />
          Better coaching.
          <br />
          <span>Better development.</span>
        </h2>

        <p className="why-aether__description">
          Aether Athlete IQ brings training, athlete feedback and analysis together so
          coaches can understand their athletes more efficiently and athletes can take
          more ownership of their development. Built around trust, transparency and the
          athlete–coach relationship — with AI supporting decisions, not replacing the coach.
        </p>

        <div className="why-aether__mission">
          <span>WHAT WE'RE BUILDING TOWARD</span>

          <strong>
            Help athletes and coaches get more
            <br />
            from the work they already put in.
          </strong>
        </div>
      </div>

      <div className="why-aether__pillars">
        {pillars.map(({ number, title, icon: Icon, text }) => (
          <article className="why-aether__pillar" key={title}>
            <div className="why-aether__pillar-top">
              <span className="why-aether__icon">
                <Icon size={17} />
              </span>

              <small>{number}</small>
            </div>

            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>

      <div className="why-aether__belief">
        <span>OUR APPROACH TO AI</span>

        <p>
          Instead of using AI simply because the technology exists,
          <strong>
            {" "}Aether Athlete IQ applies it to specific athletics problems.
          </strong>
        </p>
      </div>
    </section>
  );
}

