import {
  BellRing,  Clock3,
  NotebookPen,
  UserRound,
} from "lucide-react";

export function CoachNotesFollowups() {
  return (
    <section className="coach-feature-card coach-feature-card--notes">
      <div className="coach-feature-card__top">
        <span className="coach-feature-card__number coach-feature-card__number--notes">
          03
        </span>

        <div>
          <p className="coach-feature-card__eyebrow coach-feature-card__eyebrow--notes">
            03 · NOTES & FOLLOW-UPS
          </p>

          <h2>
            Notice it. Note it.
            <br />
            <span className="coach-feature-card__accent--notes">
              Follow it up.
            </span>
          </h2>

          <p className="coach-feature-card__lead">
            Turn track-side observations into notes and timed follow-ups —
            so important details come back when they matter.
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

            <small>Coach Notes</small>
          </div>

          <div className="coach-feature-card__placeholder coach-feature-card__placeholder--notes">
            <span className="coach-feature-card__placeholder-icon coach-feature-card__placeholder-icon--notes">
              <Clock3 size={27} />
            </span>

            <strong>Notes & Timed Follow-ups</strong>

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
          <NotebookPen size={16} />
          <span>Track-side notes</span>
        </div>

        <div>
          <Clock3 size={16} />
          <span>Timed follow-ups</span>
        </div>

        <div>
          <UserRound size={16} />
          <span>Athlete context</span>
        </div>
      </div>

      <div className="coach-feature-card__ending">
        <span>Notice it now.</span>
        <strong>Act when it matters.</strong>
        <BellRing size={16} />
      </div>
    </section>
  );
}

