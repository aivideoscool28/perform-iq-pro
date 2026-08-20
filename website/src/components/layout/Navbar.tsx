import { PrimaryButton } from "../ui/PrimaryButton";

export function Navbar() {
  return (
    <header className="navbar">
      <a className="navbar__brand" href="#top">
        <div className="navbar__logo-mark">AI</div>

        <div>
          <div className="navbar__name">Athletic IQ</div>
          <div className="navbar__tagline">Performance Intelligence</div>
        </div>
      </a>

      <nav className="navbar__links" aria-label="Main navigation">
        <a href="#product">Product</a>
        <a href="#athletes">Athletes</a>
        <a href="#coaches">Coaches</a>
        <a href="#why">Why Athletic IQ</a>
        <a href="#about">About</a>
      </nav>

      <div className="navbar__cta">
        <PrimaryButton href="#try">Try Athletic IQ →</PrimaryButton>
      </div>
    </header>
  );
}
