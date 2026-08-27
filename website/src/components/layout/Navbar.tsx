import logoLong from "../../assets/athletics/Logo_Long.png";
import { PrimaryButton } from "../ui/PrimaryButton";
import AudienceSwitcher from "./AudienceSwitcher";

type Audience = "athlete" | "coach";

type NavbarProps = {
  audience: Audience;
  onAudienceChange: (audience: Audience) => void;
};

export function Navbar({
  audience,
  onAudienceChange,
}: NavbarProps) {
  return (
    <header className="navbar">
      <a className="navbar__brand" href="#top" aria-label="Aether Athlete IQ home">
        <img
          src={logoLong}
          alt="Aether Athlete IQ"
          className="navbar__brand-logo"
        />
      </a>

      <nav className="navbar__links" aria-label="Main navigation">
        <a href="#why-aether">Why Aether</a>
        <a href="#faq">FAQs</a>
        <a href="#contact">Contact</a>
      </nav>

      <div className="navbar__actions">
        <AudienceSwitcher
          activeAudience={audience}
          onChange={onAudienceChange}
        />

        <div className="navbar__cta">
          <PrimaryButton href="https://aether-athlete-iq.netlify.app">
            Try Aether IQ →
          </PrimaryButton>
        </div>
      </div>
    </header>
  );
}
