import { useTranslation } from "react-i18next";
import {
  Activity,
  BarChart3,
  GitCompareArrows,
  HeartPulse,
  LineChart,
  Sparkles,
} from "lucide-react";

export function CoachAnalyses() {
  const { t } = useTranslation();

  return (
    <section className="coach-analyses">
      <div className="coach-analyses__header">
        <div className="coach-analyses__number">
          05
        </div>

        <div className="coach-analyses__copy">
          <p className="coach-analyses__eyebrow">
            {t("coachAnalyses.eyebrow")}
          </p>

          <h2>
            {t("coachAnalyses.title1")}
            <br />
            <span>{t("coachAnalyses.title2")}</span>
          </h2>

          <p>
            {t("coachAnalyses.lead")}
          </p>
        </div>

        <div className="coach-analyses__message">
          <Sparkles size={18} />

          <div>
            <strong>{t("coachAnalyses.message")}</strong>
            <span>
              {t("coachAnalyses.messageDetail")}
            </span>
          </div>
        </div>
      </div>


      <div className="coach-analyses__visual">
        <div className="coach-analyses__browser">
          <div className="coach-analyses__browserbar">
            <div className="coach-analyses__dots">
              <span />
              <span />
              <span />
            </div>

            <small>{t("coachAnalyses.browser")}</small>
          </div>

          <div className="coach-analyses__placeholder">
            <span className="coach-analyses__placeholder-icon">
              <LineChart size={30} />
            </span>

            <strong>{t("coachAnalyses.analyses")}</strong>

            <p>
              {t("coachVideo.placeholder1")}
              <br />
              {t("coachVideo.placeholder2")}
            </p>
          </div>
        </div>
      </div>


      <div className="coach-analyses__areas">
        <div className="coach-analyses__area">
          <span className="coach-analyses__area-icon coach-analyses__area-icon--blue">
            <Activity size={18} />
          </span>

          <div>
            <strong>{t("coachAnalyses.checkIn")}</strong>
            <span>{t("coachAnalyses.checkInDetail")}</span>
          </div>
        </div>

        <div className="coach-analyses__area">
          <span className="coach-analyses__area-icon coach-analyses__area-icon--green">
            <HeartPulse size={18} />
          </span>

          <div>
            <strong>{t("coachAnalyses.recovery")}</strong>
            <span>{t("coachAnalyses.recoveryDetail")}</span>
          </div>
        </div>

        <div className="coach-analyses__area">
          <span className="coach-analyses__area-icon coach-analyses__area-icon--orange">
            <BarChart3 size={18} />
          </span>

          <div>
            <strong>{t("coachAnalyses.response")}</strong>
            <span>{t("coachAnalyses.responseDetail")}</span>
          </div>
        </div>

        <div className="coach-analyses__area">
          <span className="coach-analyses__area-icon coach-analyses__area-icon--purple">
            <GitCompareArrows size={18} />
          </span>

          <div>
            <strong>{t("coachAnalyses.comparison")}</strong>
            <span>{t("coachAnalyses.comparisonDetail")}</span>
          </div>
        </div>
      </div>


      <div className="coach-analyses__ending">
        <span>{t("coachAnalyses.ending1")}</span>
        <strong>{t("coachAnalyses.ending2")}</strong>
      </div>
    </section>
  );
}
