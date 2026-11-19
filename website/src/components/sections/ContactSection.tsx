import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  Users,
} from "lucide-react";

export function ContactSection() {
  const { t } = useTranslation();

  return (
    <section className="contact-section" id="contact">
      <div className="contact-section__glow" />

      <div className="contact-section__content">
        <div className="contact-section__label">
          <Mail size={15} />
          <span>{t("contact.label")}</span>
        </div>

        <h2>
          {t("contact.title1")}
          <br />
          <span>{t("contact.title2")}</span>
        </h2>

        <p className="contact-section__lead">
          {t("contact.lead")}
        </p>

        <div className="contact-section__points">
          <div>
            <Users size={16} />
            <span>{t("contact.point1")}</span>
          </div>

          <div>
            <CheckCircle2 size={16} />
            <span>{t("contact.point2")}</span>
          </div>

          <div>
            <CheckCircle2 size={16} />
            <span>{t("contact.point3")}</span>
          </div>
        </div>

        <a className="contact-section__button" href="mailto:abhiram.chillamcherla@gmail.com">
          {t("contact.button")}
          <ArrowRight size={17} />
        </a>

        <p className="contact-section__note">
          {t("contact.note")}
        </p>
      </div>
    </section>
  );
}
