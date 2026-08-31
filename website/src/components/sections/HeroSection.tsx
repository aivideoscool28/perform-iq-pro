import { useTranslation } from "react-i18next";

import { PrimaryButton } from "../ui/PrimaryButton";

import athleteDashboard from "../../assets/athletics/new_athlete_dashboard.jpeg";
import coachDashboard from "../../assets/athletics/coach_dashboard.jpeg";

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <main id="top" className="hero hero-final">
      <section className="hero__content">
        <div className="hero__eyebrow">
          <span className="hero__eyebrow-dot" />
          {t("hero.eyebrow")}
        </div>

        <h1 className="hero__title">
          {t("hero.title1")}
          <br />
          <span>{t("hero.title2")}</span>
        </h1>

        <p className="hero__description">
          {t("hero.description")}
        </p>

        <div className="hero__actions">
          <PrimaryButton href="https://aether-athlete-iq.netlify.app">
            {t("hero.try")}
          </PrimaryButton>

          <PrimaryButton href="#athletes" variant="secondary">
            {t("hero.seeHow")}
          </PrimaryButton>

          <div className="hero__trial">
            <strong>{t("hero.trialStrong")}</strong>
            <span>{t("hero.trialSmall")}</span>
          </div>
        </div>

        <div className="hero__specialization">
          <strong>{t("hero.specializationStrong")}</strong>
          <span>{t("hero.specializationSmall")}</span>
        </div>
      </section>

      <section
        className="hero__visual hero-product-stack"
        aria-label={t("hero.productPreview")}
      >
        <div className="hero-product hero-product--athlete">
          <div className="hero-product__label">
            {t("hero.athleteHub")}
          </div>

          <div className="hero-product__frame">
            <img
              src={athleteDashboard}
              alt="Aether Athlete IQ Athlete Hub"
            />
          </div>
        </div>

        <div className="hero-product hero-product--coach">
          <div className="hero-product__frame">
            <img
              src={coachDashboard}
              alt="Aether Athlete IQ Coach Manager"
            />
          </div>

          <div className="hero-product__label hero-product__label--coach">
            {t("hero.coachManager")}
          </div>
        </div>
      </section>
    </main>
  );
}
