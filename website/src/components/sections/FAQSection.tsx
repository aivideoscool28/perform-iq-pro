import { ChevronDown, HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export function FAQSection() {
  const { t } = useTranslation();

  const faqs = [
    {
      question: t("faq.items.forWhom.question"),
      answer: t("faq.items.forWhom.answer"),
    },
    {
      question: t("faq.items.replaceCoach.question"),
      answer: t("faq.items.replaceCoach.answer"),
    },
    {
      question: t("faq.items.connection.question"),
      answer: t("faq.items.connection.answer"),
    },
    {
      question: t("faq.items.whyAi.question"),
      answer: t("faq.items.whyAi.answer"),
    },
    {
      question: t("faq.items.data.question"),
      answer: t("faq.items.data.answer"),
    },
    {
      question: t("faq.items.club.question"),
      answer: t("faq.items.club.answer"),
    },
    {
      question: t("faq.items.trial.question"),
      answer: t("faq.items.trial.answer"),
    },
  ];

  return (
    <section className="faq-section" id="faq">
      <div className="faq-section__header">
        <div className="faq-section__icon">
          <HelpCircle size={20} />
        </div>

        <p className="faq-section__eyebrow">
          {t("faq.eyebrow")}
        </p>

        <h2>
          {t("faq.title1")}
          <br />
          <span>{t("faq.title2")}</span>
        </h2>

        <p className="faq-section__intro">
          {t("faq.intro")}
        </p>
      </div>

      <div className="faq-section__list">
        {faqs.map((faq, index) => (
          <details className="faq-item" key={index}>
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
