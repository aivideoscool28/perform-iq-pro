import { useTranslation } from "react-i18next";

import logoLong from "../../assets/athletics/Logo_Long.png";
import { PrimaryButton } from "../ui/PrimaryButton";
import AudienceSwitcher from "./AudienceSwitcher";
import { LanguageSwitcher } from "./LanguageSwitcher";

type Audience = "athlete" | "coach";

type NavbarProps = {
  audience: Audience;
  onAudienceChange: (audience: Audience) => void;
};

export function Navbar({
  audience,
  onAudienceChange,
}: NavbarProps) {
  const { t } = useTranslation();

  return (
    <header className="navbar">
      <a
        className="navbar__brand"
        href="#top"
        aria-label={t("navbar.home")}
      >
        <img
          src={logoLong}
          alt="Aether Athlete IQ"
          className="navbar__brand-logo"
        />
      </a>

      <nav
        className="navbar__links"
        aria-label={t("navbar.navigation")}
      >
        <a href="#why-aether">
          {t("navbar.whyAether")}
        </a>

        <a href="#faq">
          {t("navbar.faq")}
        </a>

        <a href="#contact">
          {t("navbar.contact")}
        </a>
      </nav>

      <div className="navbar__actions">
        <LanguageSwitcher />

        <AudienceSwitcher
          activeAudience={audience}
          onChange={onAudienceChange}
        />

        <div className="navbar__cta">
          <PrimaryButton href="https://aether-athlete-iq.netlify.app">
            {t("navbar.tryAether")}
          </PrimaryButton>
        </div>
      </div>
    </header>
  );
}
