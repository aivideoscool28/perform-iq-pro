import {
  BrainCircuit,
  LockKeyhole,
  Target,
  UsersRound,
} from "lucide-react";

export function TrustStrip() {
  return (
    <section className="trust-strip" aria-label="Athletic IQ principles">
      <div className="trust-strip__item">
        <span className="trust-strip__icon">
          <Target size={28} strokeWidth={2} />
        </span>

        <div>
          <span>Built for</span>
          <strong>Track & Field</strong>
        </div>
      </div>

      <div className="trust-strip__item">
        <span className="trust-strip__icon">
          <BrainCircuit size={28} strokeWidth={2} />
        </span>

        <div>
          <span>AI Built for</span>
          <strong>Athletics</strong>
        </div>
      </div>

      <div className="trust-strip__item">
        <span className="trust-strip__icon">
          <UsersRound size={28} strokeWidth={2} />
        </span>

        <div>
          <span>Better together</span>
          <strong>Athletes & Coaches</strong>
        </div>
      </div>

      <div className="trust-strip__item">
        <span className="trust-strip__icon">
          <LockKeyhole size={28} strokeWidth={2} />
        </span>

        <div>
          <span>Privacy first</span>
          <strong>Your Data. Your Control.</strong>
        </div>
      </div>
    </section>
  );
}
