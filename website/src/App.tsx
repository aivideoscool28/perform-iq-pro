import { useState } from "react";
import "./styles/coach-connection.css";
import "./styles/coach-athlete.css";

import { Navbar } from "./components/layout/Navbar";

import { HeroSection } from "./components/sections/HeroSection";
import { AthleteExperience } from "./components/sections/AthleteExperience";
import { TrustStrip } from "./components/sections/TrustStrip";
import { CoachConnectionBar } from "./components/sections/CoachConnectionBar";
import { CoachKnowAthlete } from "./components/sections/CoachKnowAthlete";

type Audience = "athlete" | "coach";

function App() {
  const [audience, setAudience] = useState<Audience>("athlete");

  return (
    <div className="website-shell">
      <Navbar
        audience={audience}
        onAudienceChange={setAudience}
      />

      {audience === "athlete" ? (
        <>
          <HeroSection />
          <TrustStrip />
          <AthleteExperience />
        </>
      ) : (
        <main className="coach-coming-soon">
          <p className="coach-coming-soon__eyebrow">
            BUILT FOR COACHES
          </p>

          <h1>
            What if your athletes' data
            <br />
            actually <span>helped you coach?</span>
          </h1>

          <p>
            Aether Athlete IQ connects athlete information and brings what
            matters to you — so you can understand more and make better-informed
            coaching decisions.
          </p>

          <CoachConnectionBar />
          <div className="coach-features-grid">
            <CoachKnowAthlete />
          </div>
        </main>
      )}
    </div>
  );
}

export default App;




