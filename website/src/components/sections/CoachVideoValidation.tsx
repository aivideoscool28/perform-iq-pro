import {
  Check,
  CircleDot,
  Eye,
  ShieldCheck,
  Video,
  X,
} from "lucide-react";

export function CoachVideoValidation() {
  return (
    <section className="coach-feature-card coach-feature-card--video">
      <div className="coach-feature-card__top">
        <span className="coach-feature-card__number coach-feature-card__number--video">
          04
        </span>

        <div>
          <p className="coach-feature-card__eyebrow coach-feature-card__eyebrow--video">
            04 · VIDEO ANALYSIS + COACH VALIDATION
          </p>

          <h2>
            AI analyzes.
            <br />
            <span className="coach-feature-card__accent--video">
              You decide.
            </span>
          </h2>

          <p className="coach-feature-card__lead">
            Review Aether’s video findings, see what it noticed and validate the analysis —
            your coaching judgement stays final.
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

            <small>Video Analysis</small>
          </div>

          <div className="coach-feature-card__placeholder coach-feature-card__placeholder--video">
            <span className="coach-feature-card__placeholder-icon coach-feature-card__placeholder-icon--video">
              <Video size={27} />
            </span>

            <strong>Video Analysis</strong>

            <p>
              Real Coach Manager screenshot
              <br />
              coming here
            </p>
          </div>
        </div>
      </div>

      <div className="coach-validation">
        <div className="coach-validation__heading">
          <ShieldCheck size={16} />
          <span>YOUR VALIDATION</span>
        </div>

        <div className="coach-validation__options">
          <div className="coach-validation__option coach-validation__option--correct">
            <span className="coach-validation__icon">
              <Check size={14} />
            </span>
            <strong>Correct</strong>
          </div>

          <div className="coach-validation__option coach-validation__option--partial">
            <span className="coach-validation__icon">
              <CircleDot size={14} />
            </span>
            <strong>Partly correct</strong>
          </div>

          <div className="coach-validation__option coach-validation__option--wrong">
            <span className="coach-validation__icon">
              <X size={14} />
            </span>
            <strong>Incorrect</strong>
          </div>
        </div>
      </div>

      <div className="coach-feature-card__ending">
        <span>Aether provides the analysis.</span>
        <strong>You provide the judgement.</strong>
        <Eye size={16} />
      </div>
    </section>
  );
}



