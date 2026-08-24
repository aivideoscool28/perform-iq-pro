import {
  ArrowRight,
  CheckCircle2,
  UserRound,
} from "lucide-react";

export function CoachKnowAthlete() {
  return (
    <section className="coach-feature-card coach-feature-card--athlete">
      <div className="coach-feature-card__top">
        <span className="coach-feature-card__number">01</span>

        <div>
          <p className="coach-feature-card__eyebrow">
            01 · KNOW YOUR ATHLETE
          </p>

          <h2>
            Know where every
            <br />
            <span>athlete stands.</span>
          </h2>

          <p className="coach-feature-card__lead">
            Stay on top of how they’re feeling, their performance, pain and recent training —
            so you know who’s ready to push and who needs attention.
          </p>
        </div>
      </div>


      <div className="coach-feature-card__visual">
        <div className="coach-feature-card__browser">
          <div className="coach-feature-card__browserbar">
            <div>
              <span />
              <span />
              <span />
            </div>

            <small>Athlete Overview</small>
          </div>

          <div className="coach-feature-card__placeholder">
            <span className="coach-feature-card__placeholder-icon">
              <UserRound size={27} />
            </span>

            <strong>
              Athlete Overview
            </strong>

            <p>
              Real Coach Manager screenshot
              <br />
              coming here
            </p>
          </div>
        </div>
      </div>


      <div className="coach-feature-card__points">
        <div>
          <CheckCircle2 size={16} />
          <span>Training history & trends</span>
        </div>

        <div>
          <CheckCircle2 size={16} />
          <span>Check-ins & regeneration</span>
        </div>

        <div>
          <CheckCircle2 size={16} />
          <span>Strengths, patterns & context</span>
        </div>
      </div>


      <div className="coach-feature-card__ending">
        <span>One athlete.</span>

        <strong>
          One connected story.
        </strong>

        <ArrowRight size={16} />
      </div>
    </section>
  );
}


