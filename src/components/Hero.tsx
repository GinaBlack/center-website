import { Button } from "./ui/button";
import { ArrowRight, Box } from "lucide-react";
import Waves from "../component/Waves";
import herovid from "../assets/videos/snip.mp4"


export function Hero() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.hash = id;
    }
  };

  return (
    <section
      id="home"
      className="hero-section"
    >
      {/* Background Layer with Waves & Video */}
      <div className="hero-background">
        {/* Video on the top - 35% height on mobile */}
        <div className="video-container">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="hero-video"
          >
            <source src={herovid} type="video/mp4" />
          </video>
        </div>

        {/* Gradient overlay between video and waves - covering 45% of video */}
        <div className="gradient-overlay-45"></div>
        
        {/* Waves section - content area on mobile */}
        <div className="waves-container">
          <Waves
            lineColor="#d2cbcbb6"
            backgroundColor="#1c1414ff"
            waveSpeedX={0.02}
            waveSpeedY={0.01}
            waveAmpX={40}
            waveAmpY={20}
            friction={0.9}
            tension={0.01}
            maxCursorMove={120}
            xGap={12}
            yGap={36}
          />
        </div>
      </div>

      {/* CONTENT - Positioned directly above waves on mobile, 65% width on desktop */}
      <div className="hero-content">
        <div className="hero-grid">
          {/* TEXT SIDE - 65% width on desktop */}
          <div className="hero-text-section">
            <div className="hero-badge">
            </div>

            <div className="hero-heading-section">
              <h1 className="hero-title">
                Transform Your Ideas Into Reality
              </h1>
              <p className="hero-description">
                From rapid prototyping to production-grade parts, we deliver precision 3D
                printing services for businesses and creators. High-quality materials,
                expert finishing, and fast turnaround times.
              </p>
            </div>

            <div className="hero-buttons">
              <Button size="lg" onClick={() => scrollToSection("submit-project")}>
                Start Your Project
                <ArrowRight className="button-icon" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection("portfolio")}
              >
                View Portfolio
              </Button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}