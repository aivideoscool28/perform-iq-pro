import { PrimaryButton } from "../ui/PrimaryButton";

import athleteDashboard from "../../assets/athletics/new_athlete_dashboard.jpeg";
import coachDashboard from "../../assets/athletics/coach_dashboard.jpeg";

export function HeroSection() {
  return (
    <main id="top" className="hero hero-final">
      <section className="hero__content">
        <div className="hero__eyebrow">
          <span className="hero__eyebrow-dot" />
          AI-POWERED · BUILT FOR ATHLETICS
        </div>

        <h1 className="hero__title">
          Where Track &amp; Field
          <br />
          Meets <span>Intelligence.</span>
        </h1>

        <p className="hero__description">
          Built specifically for track &amp; field, Aether Athlete IQ connects
          training, athlete feedback and AI-powered analysis — helping athletes
          understand their development and coaches make better-informed
          decisions.
        </p>

        <div className="hero__actions">
          <PrimaryButton href="https://aether-athlete-iq.netlify.app">
            Try Aether Athlete IQ →
          </PrimaryButton>

          <PrimaryButton href="#athletes" variant="secondary">
            See how it works ↓
          </PrimaryButton>

          <div className="hero__trial">
            <strong>2 weeks free</strong>
            <span>for coaches &amp; clubs</span>
          </div>
        </div>

        <div className="hero__specialization">
          <strong>Built for Track &amp; Field.</strong>
          <span>Starting with Sprint &amp; Hurdles.</span>
        </div>
      </section>

      <section
        className="hero__visual hero-product-stack"
        aria-label="Aether Athlete IQ product preview"
      >
        <div className="hero-product hero-product--athlete">
          <div className="hero-product__label">
            ATHLETE HUB
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
            COACH MANAGER
          </div>
        </div>
      </section>
    </main>
  );
}
