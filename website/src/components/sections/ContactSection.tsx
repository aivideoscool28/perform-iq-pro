import {
  ArrowRight,
  CheckCircle2,
  Mail,
  Users,
} from "lucide-react";

export function ContactSection() {
  return (
    <section className="contact-section" id="contact">
      <div className="contact-section__glow" />

      <div className="contact-section__content">
        <div className="contact-section__label">
          <Mail size={15} />
          <span>INTERESTED IN AETHER?</span>
        </div>

        <h2>
          Bring Aether Athlete IQ
          <br />
          <span>to your athletes.</span>
        </h2>

        <p className="contact-section__lead">
          If you're a coach or athletics club interested in connecting your
          athletes to Aether Athlete IQ, we'd like to hear from you. Get in
          touch to discuss your training environment, how your athletes could
          use the platform and how Coach Manager could fit into your coaching
          workflow.
        </p>

        <div className="contact-section__points">
          <div>
            <Users size={16} />
            <span>For coaches & clubs</span>
          </div>

          <div>
            <CheckCircle2 size={16} />
            <span>2-week trial</span>
          </div>

          <div>
            <CheckCircle2 size={16} />
            <span>Built around your athletes</span>
          </div>
        </div>

        <a className="contact-section__button" href="mailto:YOUR_EMAIL_HERE">
          Contact us
          <ArrowRight size={17} />
        </a>

        <p className="contact-section__note">
          Tell us a little about your club, coaching group and what you would
          like to use Aether Athlete IQ for.
        </p>
      </div>
    </section>
  );
}
