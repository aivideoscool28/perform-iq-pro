import { useTranslation } from "react-i18next";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Dumbbell,
  Eye,
  HeartPulse,
  Lightbulb,
  Search,
  Video,
} from "lucide-react";

export function CoachConnectionBar() {
  const { t } = useTranslation();

  return (
    <section className="coach-connection">
      <div className="coach-connection__athlete">
        <p className="coach-connection__label coach-connection__label--athlete">
          {t("coachConnectionBar.fromAthletes")}
        </p>

        <div className="coach-connection__items">
          <div className="coach-connection__item coach-connection__item--orange">
            <Activity size={25} />
            <strong>{t("coachConnectionBar.training")}</strong>
            <span>{t("coachConnectionBar.trainingDetail")}</span>
          </div>

          <div className="coach-connection__item coach-connection__item--green">
            <HeartPulse size={25} />
            <strong>{t("coachConnectionBar.checkIn")}</strong>
            <span>{t("coachConnectionBar.checkInDetail")}</span>
          </div>

          <div className="coach-connection__item coach-connection__item--orange">
            <BarChart3 size={25} />
            <strong>{t("coachConnectionBar.workoutAnalysis")}</strong>
            <span>{t("coachConnectionBar.workoutDetail")}</span>
          </div>

          <div className="coach-connection__item coach-connection__item--purple">
            <Video size={25} />
            <strong>{t("coachConnectionBar.videoAnalysis")}</strong>
            <span>{t("coachConnectionBar.videoDetail")}</span>
          </div>

          <div className="coach-connection__item coach-connection__item--teal">
            <ClipboardCheck size={25} />
            <strong>{t("coachConnectionBar.recovery")}</strong>
            <span>{t("coachConnectionBar.recoveryDetail")}</span>
          </div>
        </div>
      </div>

      <div className="coach-connection__arrow">→</div>

      <div className="coach-connection__aether">
        <span>AETHER</span>
        <strong>ATHLETE IQ</strong>
        <p>{t("coachConnectionBar.connects")} <i>•</i> {t("coachConnectionBar.organizes")} <i>•</i> {t("coachConnectionBar.analyzes")}</p>
      </div>

      <div className="coach-connection__arrow">→</div>

      <div className="coach-connection__coach">
        <p className="coach-connection__label coach-connection__label--coach">
          {t("coachConnectionBar.toCoach")}
        </p>

        <div className="coach-connection__items coach-connection__items--coach">
          <div className="coach-connection__item coach-connection__item--coach">
            <Eye size={25} />
            <strong>{t("coachConnectionBar.see")}</strong>
            <span>{t("coachConnectionBar.seeDetail")}</span>
          </div>

          <div className="coach-connection__item coach-connection__item--coach">
            <Lightbulb size={25} />
            <strong>{t("coachConnectionBar.understand")}</strong>
            <span>{t("coachConnectionBar.understandDetail")}</span>
          </div>

          <div className="coach-connection__item coach-connection__item--coach">
            <Search size={25} />
            <strong>{t("coachConnectionBar.investigate")}</strong>
            <span>{t("coachConnectionBar.investigateDetail")}</span>
          </div>

          <div className="coach-connection__item coach-connection__item--coach">
            <CheckCircle2 size={25} />
            <strong>{t("coachConnectionBar.decide")}</strong>
            <span>{t("coachConnectionBar.decideDetail")}</span>
          </div>

          <div className="coach-connection__item coach-connection__item--coach">
            <Dumbbell size={25} />
            <strong>{t("coachConnectionBar.adapt")}</strong>
            <span>{t("coachConnectionBar.adaptDetail")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

