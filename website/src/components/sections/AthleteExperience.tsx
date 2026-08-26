import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Check,
  ClipboardCheck,
  Dumbbell,
  Link2,
  MessageCircle,
  Target,
  UsersRound,
} from "lucide-react";

type TickProps = {
  children: React.ReactNode;
};

function Tick({ children }: TickProps) {
  return (
    <li>
      <span className="feature-tick">
        <Check size={12} strokeWidth={3} />
      </span>
      <span>{children}</span>
    </li>
  );
}

export function AthleteExperience() {
  return (
    <section className="athlete-experience" id="athletes">
      <div className="athlete-experience__intro">
        <p className="athlete-experience__eyebrow">
          BUILT FOR TRACK & FIELD ATHLETES
        </p>

        <h2>
          What if you understood more
          <br />
          from <span>every training?</span>
        </h2>

        <p className="athlete-experience__lead">
          Athletic IQ connects your training, feedback and AI-powered analysis
          in one Track & Field experience. So you can train with purpose,
          reflect, understand and keep improving.
        </p>
      </div>

      <div className="athlete-cycle">

        <article className="cycle-card cycle-card--train">
          <div className="cycle-card__copy">
            <div className="cycle-card__identity">
              <div className="cycle-card__markers">
                <span className="step-number">01</span>

                <span className="step-icon">
                  <Dumbbell size={25} strokeWidth={2.1} />
                </span>
              </div>

              <p className="cycle-step">
                TRAIN <ArrowRight size={17} />
              </p>
            </div>

            <h3>Follow your plan.</h3>

            <p>
              See what to do, why it matters and execute every session with
              purpose.
            </p>

            <ul>
              <Tick>Planned workouts & drills</Tick>
              <Tick>Clear purpose for every session</Tick>
              <Tick>Stay on track, every day</Tick>
            </ul>
          </div>

          <div className="product-placeholder">
            <strong>Today's Training</strong>
            <span>Real Training screenshot coming here</span>
          </div>
        </article>

        <article className="cycle-card cycle-card--reflect">
          <div className="cycle-card__copy">
            <div className="cycle-card__identity">
              <div className="cycle-card__markers">
                <span className="step-number">02</span>

                <span className="step-icon">
                  <ClipboardCheck size={25} strokeWidth={2.1} />
                </span>
              </div>

              <p className="cycle-step">
                REFLECT <ArrowRight size={17} />
              </p>
            </div>

            <h3>Check-in after training.</h3>

            <p>
              Capture how your session felt so nothing important gets missed.
            </p>

            <ul>
              <Tick>RPE, recovery, pain & sleep</Tick>
              <Tick>Hydration, mood & notes</Tick>
              <Tick>Honest feedback in seconds</Tick>
            </ul>
          </div>

          <div className="product-placeholder">
            <strong>Post-Training Check-In</strong>
            <span>Real Daily Check-In screenshot coming here</span>
          </div>
        </article>

        <article className="cycle-card cycle-card--understand">
          <div className="cycle-card__copy">
            <div className="cycle-card__identity">
              <div className="cycle-card__markers">
                <span className="step-number">03</span>

                <span className="step-icon">
                  <BarChart3 size={25} strokeWidth={2.1} />
                </span>
              </div>

              <p className="cycle-step">
                UNDERSTAND <ArrowRight size={17} />
              </p>
            </div>

            <h3>Understand what really happened.</h3>

            <p>
              Workout and video analysis turn your training, feedback and
              technique into clear insights.
            </p>

            <ul>
              <Tick>See what happened and why</Tick>
              <Tick>Understand what went well and what to improve</Tick>
              <Tick>Know what to carry into your next session</Tick>
            </ul>
          </div>

          <div className="understand-previews">
            <div className="product-placeholder product-placeholder--mini">
              <strong>Video Analysis</strong>
              <span>Real Video Analysis screenshot coming here</span>
            </div>

            <div className="product-placeholder product-placeholder--mini">
              <strong>Workout Analysis</strong>
              <span>Real Workout Analysis screenshot coming here</span>
            </div>
          </div>
        </article>

        <article className="cycle-card cycle-card--support">
          <div className="cycle-card__copy">
            <div className="cycle-card__identity">
              <div className="cycle-card__markers">
                <span className="step-number">04</span>

                <span className="step-icon">
                  <MessageCircle size={25} strokeWidth={2.1} />
                </span>
              </div>

              <p className="cycle-step">
                GET SUPPORT <ArrowRight size={17} />
              </p>
            </div>

            <h3>Ask. Get answers. Keep improving.</h3>

            <p>
              Your AI Coach is ready when you have questions — using relevant
              training context to support you.
            </p>

            <ul>
              <Tick>Athletics-focused answers</Tick>
              <Tick>Uses your training & feedback</Tick>
              <Tick>Supports you when your coach isn't around</Tick>
            </ul>
          </div>

          <div className="product-placeholder">
            <strong>AI Coach</strong>
            <span>Real AI Coach screenshot coming here</span>
          </div>
        </article>

        <div className="cycle-center" aria-label="One connected cycle">
                                                                                                              <svg
            className="cycle-wheel"
            viewBox="0 0 200 200"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="cycle-orange" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ff9a72" />
                <stop offset="100%" stopColor="#ff5a1f" />
              </linearGradient>

              <linearGradient id="cycle-blue" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#91b5ff" />
                <stop offset="100%" stopColor="#3466d9" />
              </linearGradient>

              <linearGradient id="cycle-purple" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#baa5ff" />
                <stop offset="100%" stopColor="#7051cf" />
              </linearGradient>

              <linearGradient id="cycle-green" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#98cea5" />
                <stop offset="100%" stopColor="#37804a" />
              </linearGradient>
            </defs>

            <path
              d="M54 44 A80 80 0 0 1 146 44"
              className="cycle-wheel__arc"
              stroke="url(#cycle-orange)"
            />
            <polyline
              points="136,52 148,43 139,31"
              className="cycle-arrowhead cycle-arrowhead--orange"
            />

            <path
              d="M156 54 A80 80 0 0 1 156 146"
              className="cycle-wheel__arc"
              stroke="url(#cycle-blue)"
            />
            <polyline
              points="148,136 157,148 169,139"
              className="cycle-arrowhead cycle-arrowhead--blue"
            />

            <path
              d="M146 156 A80 80 0 0 1 54 156"
              className="cycle-wheel__arc"
              stroke="url(#cycle-purple)"
            />
            <polyline
              points="64,148 52,157 61,169"
              className="cycle-arrowhead cycle-arrowhead--purple"
            />

            <path
              d="M44 146 A80 80 0 0 1 44 54"
              className="cycle-wheel__arc"
              stroke="url(#cycle-green)"
            />
            <polyline
              points="52,64 43,52 31,61"
              className="cycle-arrowhead cycle-arrowhead--green"
            />
          </svg>

          <div className="cycle-center__text">
            <strong>ONE</strong>
            <span>CONNECTED</span>
            <strong>CYCLE</strong>
          </div>
        </div>
      </div>

      <div className="athlete-pillars">
        <div className="pillar pillar--specialized">
          <span className="pillar__icon">
            <Target size={27} strokeWidth={2} />
          </span>

          <div>
            <strong>SPECIALIZED</strong>
            <span>Built specifically for Track & Field.</span>
          </div>
        </div>

        <div className="pillar pillar--connected">
          <span className="pillar__icon">
            <Link2 size={27} strokeWidth={2} />
          </span>

          <div>
            <strong>CONNECTED</strong>
            <span>
              Training, feedback, analysis and coaching work together.
            </span>
          </div>
        </div>

        <div className="pillar pillar--intelligent">
          <span className="pillar__icon">
            <BrainCircuit size={27} strokeWidth={2} />
          </span>

          <div>
            <strong>INTELLIGENT</strong>
            <span>
              AI solves real athletics problems — not AI for the sake of AI.
            </span>
          </div>
        </div>

        <div className="pillar pillar--human">
          <span className="pillar__icon">
            <UsersRound size={27} strokeWidth={2} />
          </span>

          <div>
            <strong>HUMAN-CENTERED</strong>
            <span>
              AI supports athletes and coaches. It doesn't replace them.
            </span>
          </div>
        </div>
      </div>

      <div className="athlete-more">
        <div>
          <h3>And much more in the app.</h3>
          <p>Daily check-ins, regeneration, friends, streaks and more.</p>
        </div>

        <a href="https://aether-athlete-iq.netlify.app" className="athlete-more__button">
          Explore Aether Athlete IQ →
        </a>
      </div>
    </section>
  );
}















