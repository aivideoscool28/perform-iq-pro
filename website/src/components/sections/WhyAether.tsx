import {
  Activity,
  Network,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { useTranslation } from "react-i18next";

export function WhyAether() {
  const { t } = useTranslation();

  const pillars = [
    {
      number: "01",
      title: t("why.specialized"),
      icon: Activity,
      text: t("why.specializedText"),
    },
    {
      number: "02",
      title: t("why.connected"),
      icon: Network,
      text: t("why.connectedText"),
    },
    {
      number: "03",
      title: t("why.intelligent"),
      icon: Sparkles,
      text: t("why.intelligentText"),
    },
    {
      number: "04",
      title: t("why.human"),
      icon: UsersRound,
      text: t("why.humanText"),
    },
  ];

  return (
    <section className="why-aether" id="why-aether">
      <div className="why-aether__intro">
        <p className="why-aether__eyebrow">
          {t("why.eyebrow")}
        </p>

        <h2>
          {t("why.title1")}
          <br />
          {t("why.title2")}
          <br />
          <span>{t("why.title3")}</span>
        </h2>

        <p className="why-aether__description">
          {t("why.description")}
        </p>

        <div className="why-aether__mission">
          <span>{t("why.missionLabel")}</span>

          <strong>
            {t("why.mission")}
          </strong>
        </div>
      </div>

      <div className="why-aether__pillars">
        {pillars.map(({ number, title, icon: Icon, text }) => (
          <article className="why-aether__pillar" key={number}>
            <div className="why-aether__pillar-top">
              <span className="why-aether__icon">
                <Icon size={17} />
              </span>

              <small>{number}</small>
            </div>

            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>

      <div className="why-aether__belief">
        <span>{t("why.aiLabel")}</span>

        <p>
          {t("why.aiBefore")}
          <strong>
            {t("why.aiStrong")}
          </strong>
        </p>
      </div>
    </section>
  );
}
