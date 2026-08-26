import {
  CalendarDays,
  LayoutDashboard,
  MessageCircleQuestion,
  Sparkles,
  Users,
  Activity,
  HeartPulse,
  SlidersHorizontal,
  ArrowRight,
} from "lucide-react";

const extras = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Competitions", icon: CalendarDays },
  { label: "Athlete Questions", icon: MessageCircleQuestion },
  { label: "Group Overview", icon: Users },
  { label: "AI Assistant", icon: Sparkles },
  { label: "Check-In Analysis", icon: Activity },
  { label: "Regeneration", icon: HeartPulse },
  { label: "Individual Plans", icon: SlidersHorizontal },
];

export function CoachMoreFeatures() {
  return (
    <section className="coach-more">
      <div className="coach-more__top">
        <div>
          <p>AND MANY MORE</p>

          <h2>
            Everything your coaching week needs —
            <span> connected.</span>
          </h2>
        </div>

        <a className="coach-more__cta" href="#product">
          Explore Aether Athlete IQ
          <ArrowRight size={16} />
        </a>
      </div>

      <div className="coach-more__features">
        {extras.map(({ label, icon: Icon }) => (
          <div key={label} className="coach-more__feature">
            <Icon size={15} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
