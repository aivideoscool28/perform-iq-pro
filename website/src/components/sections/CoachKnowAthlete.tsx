import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  CheckCircle2,
  UserRound,
} from "lucide-react";

export function CoachKnowAthlete() {
  const { t } = useTranslation();

  return (
    <section className="coach-feature-card coach-feature-card--athlete">
      <div className="coach-feature-card__top">
        <span className="coach-feature-card__number">01</span>

        <div>
          <p className="coach-feature-card__eyebrow">
            {t("coachKnowAthlete.eyebrow")}
          </p>

          <h2>
            {t("coachKnowAthlete.title1")}
            <br />
            <span>{t("coachKnowAthlete.title2")}</span>
          </h2>

          <p className="coach-feature-card__lead">
            {t("coachKnowAthlete.lead")}
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

            <small>{t("coachKnowAthlete.overview")}</small>
          </div>

          <div className="coach-feature-card__placeholder">
            <span className="coach-feature-card__placeholder-icon">
              <UserRound size={27} />
            </span>

            <strong>
              {t("coachKnowAthlete.overview")}
            </strong>

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
          <CheckCircle2 size={16} />
          <span>{t("coachKnowAthlete.history")}</span>
        </div>

        <div>
          <CheckCircle2 size={16} />
          <span>{t("coachKnowAthlete.recovery")}</span>
        </div>

        <div>
          <CheckCircle2 size={16} />
          <span>{t("coachKnowAthlete.strengths")}</span>
        </div>
      </div>


      <div className="coach-feature-card__ending">
        <span>{t("coachKnowAthlete.ending1")}</span>

        <strong>
          {t("coachKnowAthlete.ending2")}
        </strong>

        <ArrowRight size={16} />
      </div>
    </section>
  );
}


