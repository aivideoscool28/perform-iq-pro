import { Dumbbell, ClipboardList } from "lucide-react";
import { useTranslation } from "react-i18next";

type Audience = "athlete" | "coach";

interface AudienceSwitcherProps {
  activeAudience: Audience;
  onChange: (audience: Audience) => void;
}

export default function AudienceSwitcher({
  activeAudience,
  onChange,
}: AudienceSwitcherProps) {
  const { t } = useTranslation();

  return (
    <div className="audience-switcher-wrap">
      <div
        className="audience-switcher"
        role="tablist"
        aria-label={t("audience.chooseExperience")}
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeAudience === "athlete"}
          className={`audience-option ${
            activeAudience === "athlete" ? "active" : ""
          }`}
          onClick={() => onChange("athlete")}
        >
          <Dumbbell size={18} strokeWidth={2} />

          <span>
            {t("audience.athletes")}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeAudience === "coach"}
          className={`audience-option ${
            activeAudience === "coach" ? "active" : ""
          }`}
          onClick={() => onChange("coach")}
        >
          <ClipboardList size={18} strokeWidth={2} />

          <span>
            {t("audience.coaches")}
          </span>
        </button>
      </div>
    </div>
  );
}
