import {
  BookOpen,
  CheckCircle2,
  Dumbbell,
  Layers3,
  SlidersHorizontal,
} from "lucide-react";

export function CoachTrainingPlans() {
  return (
    <section className="coach-feature-card coach-feature-card--training">
      <div className="coach-feature-card__top">
        <span className="coach-feature-card__number coach-feature-card__number--training">
          02
        </span>

        <div>
          <p className="coach-feature-card__eyebrow coach-feature-card__eyebrow--training">
            02 · TRAINING PLANS
          </p>

          <h2>
            Less time organizing.
            <br />
            <span className="coach-feature-card__accent--training">
              More time coaching.
            </span>
          </h2>

          <p className="coach-feature-card__lead">
            Build sessions from your Exercise Library, plan for the group, then adapt reps,
            volume and exercises to each athlete.
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

            <small>Training Plans</small>
          </div>

          <div className="coach-feature-card__placeholder coach-feature-card__placeholder--training">
            <span className="coach-feature-card__placeholder-icon coach-feature-card__placeholder-icon--training">
              <Dumbbell size={27} />
            </span>

            <strong>Training Plans</strong>

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
          <BookOpen size={16} />
          <span>Exercise Library</span>
        </div>

        <div>
          <Layers3 size={16} />
          <span>Group planning</span>
        </div>

        <div>
          <SlidersHorizontal size={16} />
          <span>Individual adjustments</span>
        </div>
      </div>

      <div className="coach-feature-card__ending">
        <span>One plan.</span>

        <strong>Flexible for every athlete.</strong>

        <CheckCircle2 size={16} />
      </div>
    </section>
  );
}
