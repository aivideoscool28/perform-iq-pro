import {
  BrainCircuit,
  LockKeyhole,
  Target,
  UsersRound,
} from "lucide-react";

import { useTranslation } from "react-i18next";

export function TrustStrip() {
  const { t } = useTranslation();

  return (
    <section
      className="trust-strip"
      aria-label={t("trust.aria")}
    >
      <div className="trust-strip__item">
        <span className="trust-strip__icon">
          <Target size={28} strokeWidth={2} />
        </span>

        <div>
          <span>{t("trust.builtForTop")}</span>
          <strong>{t("trust.builtForBottom")}</strong>
        </div>
      </div>

      <div className="trust-strip__item">
        <span className="trust-strip__icon">
          <BrainCircuit size={28} strokeWidth={2} />
        </span>

        <div>
          <span>{t("trust.aiTop")}</span>
          <strong>{t("trust.aiBottom")}</strong>
        </div>
      </div>

      <div className="trust-strip__item">
        <span className="trust-strip__icon">
          <UsersRound size={28} strokeWidth={2} />
        </span>

        <div>
          <span>{t("trust.togetherTop")}</span>
          <strong>{t("trust.togetherBottom")}</strong>
        </div>
      </div>

      <div className="trust-strip__item">
        <span className="trust-strip__icon">
          <LockKeyhole size={28} strokeWidth={2} />
        </span>

        <div>
          <span>{t("trust.privacyTop")}</span>
          <strong>{t("trust.privacyBottom")}</strong>
        </div>
      </div>
    </section>
  );
}
