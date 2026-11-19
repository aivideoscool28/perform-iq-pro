import { useTranslation } from "react-i18next";
import {
  Check,
  CircleDot,
  Eye,
  ShieldCheck,
  Video,
  X,
} from "lucide-react";

export function CoachVideoValidation() {
  const { t } = useTranslation();

  return (
    <section className="coach-feature-card coach-feature-card--video">
      <div className="coach-feature-card__top">
        <span className="coach-feature-card__number coach-feature-card__number--video">
          04
        </span>

        <div>
          <p className="coach-feature-card__eyebrow coach-feature-card__eyebrow--video">
            {t("coachVideo.eyebrow")}
          </p>

          <h2>
            {t("coachVideo.title1")}
            <br />
            <span className="coach-feature-card__accent--video">
              {t("coachVideo.title2")}
            </span>
          </h2>

          <p className="coach-feature-card__lead">
            {t("coachVideo.lead")}
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

            <small>{t("coachVideo.analysis")}</small>
          </div>

          <div className="coach-feature-card__placeholder coach-feature-card__placeholder--video">
            <span className="coach-feature-card__placeholder-icon coach-feature-card__placeholder-icon--video">
              <Video size={27} />
            </span>

            <strong>{t("coachVideo.analysis")}</strong>

            <p>
              {t("coachVideo.placeholder1")}
              <br />
              {t("coachVideo.placeholder2")}
            </p>
          </div>
        </div>
      </div>

      <div className="coach-validation">
        <div className="coach-validation__heading">
          <ShieldCheck size={16} />
          <span>{t("coachVideo.validation")}</span>
        </div>

        <div className="coach-validation__options">
          <div className="coach-validation__option coach-validation__option--correct">
            <span className="coach-validation__icon">
              <Check size={14} />
            </span>
            <strong>{t("coachVideo.correct")}</strong>
          </div>

          <div className="coach-validation__option coach-validation__option--partial">
            <span className="coach-validation__icon">
              <CircleDot size={14} />
            </span>
            <strong>{t("coachVideo.partial")}</strong>
          </div>

          <div className="coach-validation__option coach-validation__option--wrong">
            <span className="coach-validation__icon">
              <X size={14} />
            </span>
            <strong>{t("coachVideo.incorrect")}</strong>
          </div>
        </div>
      </div>

      <div className="coach-feature-card__ending">
        <span>{t("coachVideo.ending1")}</span>
        <strong>{t("coachVideo.ending2")}</strong>
        <Eye size={16} />
      </div>
    </section>
  );
}



