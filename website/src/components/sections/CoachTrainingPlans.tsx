import { useTranslation } from "react-i18next";
import {
  BookOpen,
  CheckCircle2,
  Dumbbell,
  Layers3,
  SlidersHorizontal,
} from "lucide-react";

export function CoachTrainingPlans() {
  const { t } = useTranslation();

  return (
    <section className="coach-feature-card coach-feature-card--training">
      <div className="coach-feature-card__top">
        <span className="coach-feature-card__number coach-feature-card__number--training">
          02
        </span>

        <div>
          <p className="coach-feature-card__eyebrow coach-feature-card__eyebrow--training">
            {t("coachTrainingPlans.eyebrow")}
          </p>

          <h2>
            {t("coachTrainingPlans.title1")}
            <br />
            <span className="coach-feature-card__accent--training">
              {t("coachTrainingPlans.title2")}
            </span>
          </h2>

          <p className="coach-feature-card__lead">
            {t("coachTrainingPlans.lead")}
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

            <small>{t("coachTrainingPlans.plans")}</small>
          </div>

          <div className="coach-feature-card__placeholder coach-feature-card__placeholder--training">
            <span className="coach-feature-card__placeholder-icon coach-feature-card__placeholder-icon--training">
              <Dumbbell size={27} />
            </span>

            <strong>{t("coachTrainingPlans.plans")}</strong>

            <p>
              {t("coachVideo.placeholder1")}
              <br />
              {t("coachVideo.placeholder2")}
            </p>
          </div>
        </div>
      </div>

      <div className="coach-feature-card__points">
        <div>
          <BookOpen size={16} />
          <span>{t("coachTrainingPlans.library")}</span>
        </div>

        <div>
          <Layers3 size={16} />
          <span>{t("coachTrainingPlans.group")}</span>
        </div>

        <div>
          <SlidersHorizontal size={16} />
          <span>{t("coachTrainingPlans.adjustments")}</span>
        </div>
      </div>

      <div className="coach-feature-card__ending">
        <span>{t("coachTrainingPlans.ending1")}</span>

        <strong>{t("coachTrainingPlans.ending2")}</strong>

        <CheckCircle2 size={16} />
      </div>
    </section>
  );
}
