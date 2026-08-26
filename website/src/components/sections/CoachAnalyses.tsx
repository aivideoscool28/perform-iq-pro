import {
  Activity,
  BarChart3,
  GitCompareArrows,
  HeartPulse,
  LineChart,
  Sparkles,
} from "lucide-react";

export function CoachAnalyses() {
  return (
    <section className="coach-analyses">
      <div className="coach-analyses__header">
        <div className="coach-analyses__number">
          05
        </div>

        <div className="coach-analyses__copy">
          <p className="coach-analyses__eyebrow">
            05 · ANALYSES
          </p>

          <h2>
            See the patterns behind
            <br />
            <span>the performance.</span>
          </h2>

          <p>
            Connect check-ins, recovery and training responses to understand
            what’s changing — across an athlete, a group and over time.
          </p>
        </div>

        <div className="coach-analyses__message">
          <Sparkles size={18} />

          <div>
            <strong>Less noise. More context.</strong>
            <span>
              Focus on meaningful changes instead of another wall of numbers.
            </span>
          </div>
        </div>
      </div>


      <div className="coach-analyses__visual">
        <div className="coach-analyses__browser">
          <div className="coach-analyses__browserbar">
            <div className="coach-analyses__dots">
              <span />
              <span />
              <span />
            </div>

            <small>Coach Manager · Analyses</small>
          </div>

          <div className="coach-analyses__placeholder">
            <span className="coach-analyses__placeholder-icon">
              <LineChart size={30} />
            </span>

            <strong>Analyses</strong>

            <p>
              Real Coach Manager screenshot
              <br />
              coming here
            </p>
          </div>
        </div>
      </div>


      <div className="coach-analyses__areas">
        <div className="coach-analyses__area">
          <span className="coach-analyses__area-icon coach-analyses__area-icon--blue">
            <Activity size={18} />
          </span>

          <div>
            <strong>Check-In Analysis</strong>
            <span>How athletes experienced training</span>
          </div>
        </div>

        <div className="coach-analyses__area">
          <span className="coach-analyses__area-icon coach-analyses__area-icon--green">
            <HeartPulse size={18} />
          </span>

          <div>
            <strong>Regeneration</strong>
            <span>Sleep, soreness and energy patterns</span>
          </div>
        </div>

        <div className="coach-analyses__area">
          <span className="coach-analyses__area-icon coach-analyses__area-icon--orange">
            <BarChart3 size={18} />
          </span>

          <div>
            <strong>Training Response</strong>
            <span>How different sessions are landing</span>
          </div>
        </div>

        <div className="coach-analyses__area">
          <span className="coach-analyses__area-icon coach-analyses__area-icon--purple">
            <GitCompareArrows size={18} />
          </span>

          <div>
            <strong>Session Comparison</strong>
            <span>Understand what changed between sessions</span>
          </div>
        </div>
      </div>


      <div className="coach-analyses__ending">
        <span>From individual signals</span>
        <strong>to useful coaching context.</strong>
      </div>
    </section>
  );
}
