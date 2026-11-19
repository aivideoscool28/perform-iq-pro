import { useTranslation } from "react-i18next";
import {
  BellRing,  Clock3,
  NotebookPen,
  UserRound,
} from "lucide-react";

export function CoachNotesFollowups() {
  const { t } = useTranslation();

  return (
    <section className="coach-feature-card coach-feature-card--notes">
      <div className="coach-feature-card__top">
        <span className="coach-feature-card__number coach-feature-card__number--notes">
          03
        </span>

        <div>
          <p className="coach-feature-card__eyebrow coach-feature-card__eyebrow--notes">
            {t("coachNotesFollowups.eyebrow")}
          </p>

          <h2>
            {t("coachNotesFollowups.title1")}
            <br />
            <span className="coach-feature-card__accent--notes">
              {t("coachNotesFollowups.title2")}
            </span>
          </h2>

          <p className="coach-feature-card__lead">
            {t("coachNotesFollowups.lead")}
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

            <small>{t("coachNotesFollowups.notes")}</small>
          </div>

          <div className="coach-feature-card__placeholder coach-feature-card__placeholder--notes">
            <span className="coach-feature-card__placeholder-icon coach-feature-card__placeholder-icon--notes">
              <Clock3 size={27} />
            </span>

            <strong>{t("coachNotesFollowups.scheduled")}</strong>

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
          <NotebookPen size={16} />
          <span>{t("coachNotesFollowups.track")}</span>
        </div>

        <div>
          <Clock3 size={16} />
          <span>{t("coachNotesFollowups.reminders")}</span>
        </div>

        <div>
          <UserRound size={16} />
          <span>{t("coachNotesFollowups.context")}</span>
        </div>
      </div>

      <div className="coach-feature-card__ending">
        <span>{t("coachNotesFollowups.ending1")}</span>
        <strong>{t("coachNotesFollowups.ending2")}</strong>
        <BellRing size={16} />
      </div>
    </section>
  );
}

