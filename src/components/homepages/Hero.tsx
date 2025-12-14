import { Button } from "../ui/button";
import { ArrowRight, Box } from "lucide-react";
import DarkVeil from '../../component/DarkVeil'
import herovid from "../../assets/videos/snip.mp4"


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

        {/*DarkVeil- content area on mobile */}
        <div className="waves-container">
          <div style={{ width: '100%', height: '600px', position: 'relative' }}>
            <DarkVeil
            />
          </div>
        </div>
      </div>

      {/* CONTENT - Positioned directly above waves on mobile, 65% width on desktop */}
      <div className="hero-content">
        <div className="hero-grid">
          {/* TEXT SIDE - 65% width on desktop */}
          <div className="hero-text-section">
            <div className="hero-heading-section">
              <h1 className="hero-title">
              From imagination to reality <br/>
              Start your 3D printing journey with us.
              </h1>
              <p className="hero-description">
                Driven additive manufacturing solutions for Industry, Healthcare, Education and More.<br/>
                Whether you're a student, researcher, or professional, we bring your ideas to life.
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
                onClick={() => scrollToSection("about")}
              >
                About Us
              </Button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}