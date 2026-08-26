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
      <a className="navbar__brand" href="#top">
        <div className="navbar__logo-mark">AI</div>

        <div>
          <div className="navbar__name">Aether Athlete IQ</div>
          <div className="navbar__tagline">Performance Intelligence</div>
        </div>
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
          <PrimaryButton href="#try">
            Try Aether IQ →
          </PrimaryButton>
        </div>
      </div>
    </header>
  );
}
