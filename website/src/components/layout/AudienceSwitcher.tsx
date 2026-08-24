import { Dumbbell, ClipboardList } from "lucide-react";

type Audience = "athlete" | "coach";

interface AudienceSwitcherProps {
  activeAudience: Audience;
  onChange: (audience: Audience) => void;
}

export default function AudienceSwitcher({
  activeAudience,
  onChange,
}: AudienceSwitcherProps) {
  return (
    <div className="audience-switcher-wrap">
      <div className="audience-switcher" role="tablist" aria-label="Choose experience">
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
          <span>Athletes</span>
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
          <span>Coaches</span>
        </button>
      </div>
    </div>
  );
}
