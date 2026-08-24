import {
  Activity,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Dumbbell,
  Eye,
  HeartPulse,
  Lightbulb,
  Search,
  Video,
} from "lucide-react";

export function CoachConnectionBar() {
  return (
    <section className="coach-connection">
      <div className="coach-connection__athlete">
        <p className="coach-connection__label coach-connection__label--athlete">
          FROM YOUR ATHLETES
        </p>

        <div className="coach-connection__items">
          <div className="coach-connection__item coach-connection__item--orange">
            <Activity size={25} />
            <strong>TRAINING</strong>
            <span>Workouts & performance</span>
          </div>

          <div className="coach-connection__item coach-connection__item--green">
            <HeartPulse size={25} />
            <strong>CHECK-IN</strong>
            <span>Feedback & wellbeing</span>
          </div>

          <div className="coach-connection__item coach-connection__item--orange">
            <BarChart3 size={25} />
            <strong>WORKOUT ANALYSIS</strong>
            <span>Insights & takeaways</span>
          </div>

          <div className="coach-connection__item coach-connection__item--purple">
            <Video size={25} />
            <strong>VIDEO ANALYSIS</strong>
            <span>Technique & form</span>
          </div>

          <div className="coach-connection__item coach-connection__item--teal">
            <ClipboardCheck size={25} />
            <strong>REGENERATION</strong>
            <span>Recovery information</span>
          </div>
        </div>
      </div>

      <div className="coach-connection__arrow">→</div>

      <div className="coach-connection__aether">
        <span>AETHER</span>
        <strong>ATHLETE IQ</strong>
        <p>CONNECTS <i>•</i> ORGANIZES <i>•</i> ANALYZES</p>
      </div>

      <div className="coach-connection__arrow">→</div>

      <div className="coach-connection__coach">
        <p className="coach-connection__label coach-connection__label--coach">
          TO YOU AS COACH
        </p>

        <div className="coach-connection__items coach-connection__items--coach">
          <div className="coach-connection__item coach-connection__item--coach">
            <Eye size={25} />
            <strong>SEE WHAT MATTERS</strong>
            <span>Important changes first</span>
          </div>

          <div className="coach-connection__item coach-connection__item--coach">
            <Lightbulb size={25} />
            <strong>UNDERSTAND WHY</strong>
            <span>Context & patterns</span>
          </div>

          <div className="coach-connection__item coach-connection__item--coach">
            <Search size={25} />
            <strong>INVESTIGATE</strong>
            <span>Open the evidence</span>
          </div>

          <div className="coach-connection__item coach-connection__item--coach">
            <CheckCircle2 size={25} />
            <strong>MAKE THE DECISION</strong>
            <span>You stay in control</span>
          </div>

          <div className="coach-connection__item coach-connection__item--coach">
            <Dumbbell size={25} />
            <strong>CREATE & ADAPT</strong>
            <span>Turn insight into training</span>
          </div>
        </div>
      </div>
    </section>
  );
}

