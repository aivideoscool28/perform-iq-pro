import { PrimaryButton } from "../ui/PrimaryButton";

export function HeroSection() {
  return (
    <main id="top" className="hero">
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
          Built specifically for track &amp; field, Athletic IQ connects
          training, athlete feedback and AI-powered analysis — helping athletes
          understand their development and coaches make better-informed
          decisions.
        </p>

        <div className="hero__actions">
          <PrimaryButton href="#try">
            Experience Athletic IQ →
          </PrimaryButton>

          <PrimaryButton href="#product" variant="secondary">
            See how it works ↓
          </PrimaryButton>
        </div>

        <div className="hero__specialization">
          <strong>Built for Track &amp; Field.</strong>
          <span>Starting with Sprint &amp; Hurdles.</span>
        </div>
      </section>

      <section className="hero__visual" aria-label="Athletic IQ product preview">
        <div className="product-preview product-preview--athlete">
          <div className="product-preview__label">ATHLETE EXPERIENCE</div>

          <div className="product-preview__window">
            <div className="product-preview__topbar">
              <span />
              <span />
              <span />
            </div>

            <div className="product-preview__placeholder">
              <div className="placeholder-logo">AI</div>
              <strong>Athlete Dashboard</strong>
              <span>Real Athletic IQ screenshot coming here</span>
            </div>
          </div>
        </div>

        <div className="product-preview product-preview--coach">
          <div className="product-preview__label">COACH EXPERIENCE</div>

          <div className="product-preview__window">
            <div className="product-preview__topbar">
              <span />
              <span />
              <span />
            </div>

            <div className="product-preview__placeholder">
              <div className="placeholder-logo">AI</div>
              <strong>Coach Manager</strong>
              <span>Real Coach Manager screenshot coming here</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
