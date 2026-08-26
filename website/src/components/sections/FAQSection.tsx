import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Who is Aether Athlete IQ built for?",
    answer:
      "Aether Athlete IQ is built for track & field athletes, coaches and clubs. We are starting with a deeper focus on Sprint & Hurdles while building toward a broader track & field platform.",
  },
  {
    question: "Does Aether Athlete IQ replace the coach?",
    answer:
      "No. Aether Athlete IQ is designed to support coaching, not replace it. AI helps organize and analyse relevant information, while coaching judgement and final decisions stay with the coach.",
  },
  {
    question: "How are athletes and coaches connected?",
    answer:
      "Athletes use Aether Athlete IQ for training, check-ins, analyses and other performance information. Relevant information can then support the Coach Manager, helping coaches understand their athletes and make better-informed decisions.",
  },
  {
    question: "Why does Aether Athlete IQ use AI?",
    answer:
      "We use AI where it can solve specific athletics problems — such as analysing training, understanding athlete feedback, reviewing technique and connecting relevant information. AI is a tool inside the system, not the purpose of the product.",
  },
  {
    question: "How does Aether Athlete IQ protect athlete data?",
    answer:
      "Data safety is a core part of Aether Athlete IQ. We are currently working with external specialists to build a strong and responsible data protection structure. As Aether develops, we will continue reviewing and improving how athlete, coach and club data is handled — with the goal of providing a safe and trustworthy environment for everyone using the platform.",
  },  {
    question: "Can our club try Aether Athlete IQ?",
    answer:
      "Yes. We are currently preparing Aether Athlete IQ for early club use. Interested coaches and clubs can contact us to discuss connecting athletes and trying the system.",
  },
  {
    question: "Is there a trial?",
    answer:
      "For early club testing, we plan to offer a 2-week trial so coaches and athletes can experience the system before deciding how they want to continue.",
  },
];

export function FAQSection() {
  return (
    <section className="faq-section" id="faq">
      <div className="faq-section__header">
        <div className="faq-section__icon">
          <HelpCircle size={20} />
        </div>

        <p className="faq-section__eyebrow">QUESTIONS, ANSWERED.</p>

        <h2>
          Before you try Aether,
          <br />
          <span>here's what you should know.</span>
        </h2>

        <p className="faq-section__intro">
          Clear answers about how Aether Athlete IQ works, who it is built for
          and the role AI plays inside the platform.
        </p>
      </div>

      <div className="faq-section__list">
        {faqs.map((faq) => (
          <details className="faq-item" key={faq.question}>
            <summary>
              <span>{faq.question}</span>
              <ChevronDown size={18} />
            </summary>

            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

