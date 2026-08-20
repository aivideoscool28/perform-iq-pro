import { Navbar } from "./components/layout/Navbar";
import { HeroSection } from "./components/sections/HeroSection";

function App() {
  return (
    <div className="website-shell">
      <Navbar />
      <HeroSection />

      <section id="product" className="next-section-placeholder">
        <p>ATHLETE EXPERIENCE — COMING NEXT</p>
      </section>
    </div>
  );
}

export default App;
