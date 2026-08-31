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
import { useTranslation } from "react-i18next";

import trainingImage from "../../assets/athletics/Trainings_Plan.jpeg";
import checkinImage from "../../assets/athletics/Daily_Checkin.jpeg";
import workoutAnalysisImage from "../../assets/athletics/Workout_Analysis.jpeg";
import aiCoachImage from "../../assets/athletics/AI_Coach.jpeg";

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
  const { t } = useTranslation();

  return (
    <section className="athlete-experience" id="athletes">
      <div className="athlete-experience__intro">
        <p className="athlete-experience__eyebrow">
          {t("athlete.eyebrow")}
        </p>

        <h2>
          {t("athlete.title1")}
          <br />
          <span>{t("athlete.title2")}</span>
        </h2>

        <p className="athlete-experience__lead">
          {t("athlete.lead")}
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
                {t("athlete.trainStep")} <ArrowRight size={17} />
              </p>
            </div>

            <h3>{t("athlete.trainTitle")}</h3>

            <p>{t("athlete.trainText")}</p>

            <ul>
              <Tick>{t("athlete.train1")}</Tick>
              <Tick>{t("athlete.train2")}</Tick>
              <Tick>{t("athlete.train3")}</Tick>
            </ul>
          </div>

          <div className="product-placeholder product-placeholder--image">
            <img
              src={trainingImage}
              alt="Aether Athlete IQ training plan"
              className="athlete-feature-image"
            />
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
                {t("athlete.reflectStep")} <ArrowRight size={17} />
              </p>
            </div>

            <h3>{t("athlete.reflectTitle")}</h3>

            <p>{t("athlete.reflectText")}</p>

            <ul>
              <Tick>{t("athlete.reflect1")}</Tick>
              <Tick>{t("athlete.reflect2")}</Tick>
              <Tick>{t("athlete.reflect3")}</Tick>
            </ul>
          </div>

          <div className="product-placeholder product-placeholder--image">
            <img
              src={checkinImage}
              alt="Aether Athlete IQ Daily Check-In"
              className="athlete-feature-image"
            />
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
                {t("athlete.understandStep")} <ArrowRight size={17} />
              </p>
            </div>

            <h3>{t("athlete.understandTitle")}</h3>

            <p>{t("athlete.understandText")}</p>

            <ul>
              <Tick>{t("athlete.understand1")}</Tick>
              <Tick>{t("athlete.understand2")}</Tick>
              <Tick>{t("athlete.understand3")}</Tick>
            </ul>
          </div>

          <div className="understand-previews">
            <div className="product-placeholder product-placeholder--mini">
              <strong>{t("athlete.videoAnalysis")}</strong>
              <span>{t("athlete.screenshotComing")}</span>
            </div>

            <div className="product-placeholder product-placeholder--mini product-placeholder--image">
              <img
                src={workoutAnalysisImage}
                alt="Aether Athlete IQ Workout Analysis"
                className="athlete-feature-image"
              />
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
                {t("athlete.supportStep")} <ArrowRight size={17} />
              </p>
            </div>

            <h3>{t("athlete.supportTitle")}</h3>

            <p>{t("athlete.supportText")}</p>

            <ul>
              <Tick>{t("athlete.support1")}</Tick>
              <Tick>{t("athlete.support2")}</Tick>
              <Tick>{t("athlete.support3")}</Tick>
            </ul>
          </div>

          <div className="product-placeholder product-placeholder--image">
            <img
              src={aiCoachImage}
              alt="Aether Athlete IQ AI Coach"
              className="athlete-feature-image"
            />
          </div>
        </article>

        <div
          className="cycle-center"
          aria-label={t("athlete.cycleAria", {
            defaultValue: "One connected cycle",
          })}
        >
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
            <strong>{t("athlete.cycleOne")}</strong>
            <span>{t("athlete.cycleConnected")}</span>
            <strong>{t("athlete.cycleCycle")}</strong>
          </div>
        </div>
      </div>

      <div className="athlete-pillars">
        <div className="pillar pillar--specialized">
          <span className="pillar__icon">
            <Target size={27} strokeWidth={2} />
          </span>

          <div>
            <strong>{t("athlete.specialized")}</strong>
            <span>{t("athlete.specializedText")}</span>
          </div>
        </div>

        <div className="pillar pillar--connected">
          <span className="pillar__icon">
            <Link2 size={27} strokeWidth={2} />
          </span>

          <div>
            <strong>{t("athlete.connected")}</strong>
            <span>{t("athlete.connectedText")}</span>
          </div>
        </div>

        <div className="pillar pillar--intelligent">
          <span className="pillar__icon">
            <BrainCircuit size={27} strokeWidth={2} />
          </span>

          <div>
            <strong>{t("athlete.intelligent")}</strong>
            <span>{t("athlete.intelligentText")}</span>
          </div>
        </div>

        <div className="pillar pillar--human">
          <span className="pillar__icon">
            <UsersRound size={27} strokeWidth={2} />
          </span>

          <div>
            <strong>{t("athlete.human")}</strong>
            <span>{t("athlete.humanText")}</span>
          </div>
        </div>
      </div>

      <div className="athlete-more">
        <div>
          <h3>{t("athlete.moreTitle")}</h3>
          <p>{t("athlete.moreText")}</p>
        </div>

        <a
          href="https://aether-athlete-iq.netlify.app"
          className="athlete-more__button"
        >
          {t("athlete.explore")}
        </a>
      </div>
    </section>
  );
}
