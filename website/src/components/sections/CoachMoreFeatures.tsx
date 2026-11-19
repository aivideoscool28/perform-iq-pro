import { useTranslation } from "react-i18next";
import {
  CalendarDays,
  LayoutDashboard,
  MessageCircleQuestion,
  Sparkles,
  Users,
  Activity,
  HeartPulse,
  SlidersHorizontal,
  ArrowRight,
} from "lucide-react";

const extras = [
  { label: "coachMoreFeatures.dashboard", icon: LayoutDashboard },
  { label: "coachMoreFeatures.competitions", icon: CalendarDays },
  { label: "coachMoreFeatures.questions", icon: MessageCircleQuestion },
  { label: "coachMoreFeatures.groups", icon: Users },
  { label: "coachMoreFeatures.assistant", icon: Sparkles },
  { label: "coachMoreFeatures.checkIn", icon: Activity },
  { label: "coachMoreFeatures.recovery", icon: HeartPulse },
  { label: "coachMoreFeatures.plans", icon: SlidersHorizontal },
];

export function CoachMoreFeatures() {
  const { t } = useTranslation();

  return (
    <section className="coach-more">
      <div className="coach-more__top">
        <div>
          <p>{t("coachMoreFeatures.eyebrow")}</p>

          <h2>
            {t("coachMoreFeatures.title1")}
            <span> {t("coachMoreFeatures.title2")}</span>
          </h2>
        </div>

        <a className="coach-more__cta" href="https://aether-athlete-iq.netlify.app">
          {t("coachMoreFeatures.cta")}
          <ArrowRight size={16} />
        </a>
      </div>

      <div className="coach-more__features">
        {extras.map(({ label, icon: Icon }) => (
          <div key={label} className="coach-more__feature">
            <Icon size={15} />
            <span>{t(label)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}


